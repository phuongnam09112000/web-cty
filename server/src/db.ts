import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./generated/prisma/client.js";

export type { PrismaClient };

export function createPrisma(
  databaseUrl: string,
  options?: { connectTimeoutMs?: number },
): PrismaClient {
  const url = new URL(databaseUrl);
  const timeout = options?.connectTimeoutMs ?? 10000;
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "")),
    connectionLimit: 10,
    connectTimeout: timeout,
    acquireTimeout: timeout,
    allowPublicKeyRetrieval: true,
  });
  return new PrismaClient({ adapter });
}
