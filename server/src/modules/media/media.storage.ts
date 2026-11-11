import { randomBytes } from "node:crypto";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

export async function writeMediaFile(dir: string, fileName: string, data: Buffer): Promise<void> {
  await mkdir(dir, { recursive: true });
  const temp = join(dir, `.${fileName}.${randomBytes(6).toString("hex")}.tmp`);
  try {
    await writeFile(temp, data, { flag: "wx" });
    await rename(temp, join(dir, fileName));
  } catch (err) {
    await rm(temp, { force: true });
    throw err;
  }
}

export async function deleteMediaFile(dir: string, fileName: string): Promise<void> {
  await rm(join(dir, fileName), { force: true });
}
