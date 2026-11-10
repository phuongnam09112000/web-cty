import "dotenv/config";
import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { pathToFileURL } from "node:url";
import { loadConfig } from "../config.js";
import { createPrisma, type PrismaClient } from "../db.js";
import type { User } from "../generated/prisma/client.js";
import { MIN_PASSWORD_LENGTH } from "../modules/auth/auth.schemas.js";
import { hashPassword } from "../modules/auth/password.js";
import { SYSTEM_ROLE_NAME } from "../modules/permissions/catalog.js";
import { syncPermissions } from "../modules/permissions/sync.js";

export type CreateAdminInput = { email: string; fullName: string; password: string };

export async function createAdmin(prisma: PrismaClient, input: CreateAdminInput): Promise<User> {
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  if (!email) throw new Error("Email không được để trống");
  if (!fullName) throw new Error("Họ tên không được để trống");
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự`);
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email đã tồn tại");
  const role = await prisma.role.findUniqueOrThrow({ where: { name: SYSTEM_ROLE_NAME } });
  return prisma.user.create({
    data: {
      email,
      fullName,
      passwordHash: await hashPassword(input.password),
      roleId: role.id,
      isActive: true,
      mustChangePassword: false,
    },
  });
}

function createPrompter() {
  let muted = false;
  const output = new Writable({
    write(chunk, _encoding, callback) {
      if (!muted) process.stdout.write(chunk);
      callback();
    },
  });
  const rl = createInterface({ input: process.stdin, output, terminal: Boolean(process.stdin.isTTY) });
  const lines: string[] = [];
  const waiting: ((line: string) => void)[] = [];
  rl.on("line", (line) => {
    const next = waiting.shift();
    if (next) next(line);
    else lines.push(line);
  });
  return {
    ask(question: string, hidden: boolean): Promise<string> {
      process.stdout.write(question);
      muted = hidden;
      return new Promise((resolve) => {
        const finish = (line: string) => {
          muted = false;
          if (hidden) process.stdout.write("\n");
          resolve(line);
        };
        const queued = lines.shift();
        if (queued !== undefined) finish(queued);
        else waiting.push(finish);
      });
    },
    close: () => rl.close(),
  };
}

async function run(): Promise<void> {
  const config = loadConfig(process.env);
  const prisma = createPrisma(config.databaseUrl);
  const prompter = createPrompter();
  try {
    await syncPermissions(prisma);
    const email = await prompter.ask("Email: ", false);
    const fullName = await prompter.ask("Họ tên: ", false);
    const password = await prompter.ask("Mật khẩu: ", true);
    const confirm = await prompter.ask("Nhập lại mật khẩu: ", true);
    if (password !== confirm) throw new Error("Mật khẩu nhập lại không khớp");
    const user = await createAdmin(prisma, { email, fullName, password });
    console.log(`Đã tạo quản trị viên ${user.email}`);
  } finally {
    prompter.close();
    await prisma.$disconnect();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
