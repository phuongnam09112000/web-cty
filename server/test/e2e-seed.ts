import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import mariadb from "mariadb";
import { createPrisma } from "../src/db.js";
import { createAdmin } from "../src/cli/create-admin.js";
import { syncPermissions } from "../src/modules/permissions/sync.js";

const serverRoot = fileURLToPath(new URL("..", import.meta.url));
const dbName = "istt_e2e";

async function seed(): Promise<void> {
  const adminUrl = (process.env.TEST_DATABASE_ADMIN_URL ?? "mysql://root:istt-dev@127.0.0.1:3307").replace(/\/+$/, "");
  const parsed = new URL(adminUrl);
  const connection = await mariadb.createConnection({
    host: parsed.hostname,
    port: Number(parsed.port || 3306),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    allowPublicKeyRetrieval: true,
  });
  try {
    await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
    await connection.query(`CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  } finally {
    await connection.end();
  }
  const databaseUrl = `${adminUrl}/${dbName}`;
  execFileSync("npx", ["prisma", "migrate", "deploy"], {
    cwd: serverRoot,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: "pipe",
  });
  const prisma = createPrisma(databaseUrl);
  try {
    await syncPermissions(prisma);
    await createAdmin(prisma, { email: "admin@istt.vn", fullName: "Quản trị hệ thống", password: "Matkhau@12345" });
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
