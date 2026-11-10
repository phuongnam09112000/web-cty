import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import mariadb from "mariadb";

const serverRoot = fileURLToPath(new URL("..", import.meta.url));

export default async function setup() {
  const adminUrl = process.env.TEST_DATABASE_ADMIN_URL ?? "mysql://root:istt-dev@127.0.0.1:3307";
  const dbName = `istt_test_${process.pid}_${Date.now()}`;
  const parsed = new URL(adminUrl);
  const connection = await mariadb.createConnection({
    host: parsed.hostname,
    port: Number(parsed.port || 3306),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    allowPublicKeyRetrieval: true,
  });
  await connection.query(
    `CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  const databaseUrl = `${adminUrl.replace(/\/+$/, "")}/${dbName}`;
  process.env.DATABASE_URL = databaseUrl;

  if (existsSync(`${serverRoot}prisma/migrations`)) {
    execFileSync("npx", ["prisma", "migrate", "deploy"], {
      cwd: serverRoot,
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: "pipe",
    });
  }

  return async () => {
    await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
    await connection.end();
  };
}
