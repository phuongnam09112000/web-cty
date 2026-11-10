import mariadb from "mariadb";
import { describe, expect, it } from "vitest";
import { createPrisma } from "../src/db.js";

describe("createPrisma", () => {
  it("connects as a caching_sha2_password user after the auth cache is flushed", async () => {
    const databaseUrl = new URL(process.env.DATABASE_URL as string);
    const dbName = databaseUrl.pathname.replace(/^\//, "");
    const adminUrl = new URL(process.env.TEST_DATABASE_ADMIN_URL ?? "mysql://root:istt-dev@127.0.0.1:3307");
    const userName = `istt_sha2_${process.pid}`;
    const password = "Sha2-Test-pass-123";
    const root = await mariadb.createConnection({
      host: adminUrl.hostname,
      port: Number(adminUrl.port || 3306),
      user: decodeURIComponent(adminUrl.username),
      password: decodeURIComponent(adminUrl.password),
      allowPublicKeyRetrieval: true,
    });
    try {
      await root.query(`DROP USER IF EXISTS '${userName}'@'%'`);
      await root.query(
        `CREATE USER '${userName}'@'%' IDENTIFIED WITH caching_sha2_password BY '${password}'`,
      );
      await root.query(`GRANT ALL ON \`${dbName}\`.* TO '${userName}'@'%'`);
      await root.query("FLUSH PRIVILEGES");
      const url = new URL(databaseUrl.toString());
      url.username = userName;
      url.password = password;
      const prisma = createPrisma(url.toString());
      try {
        const rows = await prisma.$queryRaw<{ one: number }[]>`SELECT 1 AS one`;
        expect(Number(rows[0]?.one)).toBe(1);
      } finally {
        await prisma.$disconnect();
      }
    } finally {
      await root.query(`DROP USER IF EXISTS '${userName}'@'%'`);
      await root.end();
    }
  }, 30000);
});
