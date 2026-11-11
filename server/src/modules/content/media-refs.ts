import type { PrismaClient } from "../../db.js";
import { AppError } from "../../http/errors.js";
import type { PageContent } from "./blocks/index.js";

export function findMediaRefs(value: unknown, path: string[] = [], out = new Map<string, number>()): Map<string, number> {
  if (Array.isArray(value)) {
    value.forEach((item, index) => findMediaRefs(item, [...path, String(index)], out));
  } else if (value !== null && typeof value === "object") {
    for (const [key, inner] of Object.entries(value)) {
      if (key === "mediaId" && typeof inner === "number") {
        out.set([...path, key].join("."), inner);
      } else {
        findMediaRefs(inner, [...path, key], out);
      }
    }
  }
  return out;
}

export function collectMediaIds(content: PageContent): Set<number> {
  return new Set(findMediaRefs(content).values());
}

export async function assertMediaExist(db: PrismaClient, content: PageContent): Promise<void> {
  const refs = findMediaRefs(content);
  const ids = [...new Set(refs.values())];
  if (ids.length === 0) return;
  const found = await db.media.findMany({
    where: { id: { in: ids.map((id) => BigInt(id)) } },
    select: { id: true },
  });
  const existing = new Set(found.map((row) => Number(row.id)));
  const fields: Record<string, string> = {};
  for (const [path, id] of refs) {
    if (!existing.has(id)) fields[path] = "Ảnh không tồn tại";
  }
  if (Object.keys(fields).length > 0) {
    throw new AppError(400, "VALIDATION_ERROR", "Dữ liệu không hợp lệ", fields);
  }
}
