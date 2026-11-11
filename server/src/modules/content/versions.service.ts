import type { PrismaClient } from "../../db.js";
import { AppError } from "../../http/errors.js";
import { recordAudit } from "../audit/audit.service.js";
import { pageContentSchema } from "./blocks/index.js";
import { assertMediaExist } from "./media-refs.js";

export type UserRef = { id: number; fullName: string };

export type VersionListItem = {
  number: number;
  note: string | null;
  publishedAt: string;
  publishedBy: UserRef | null;
};

export type VersionDetail = VersionListItem & { content: unknown };

const notFound = () => new AppError(404, "NOT_FOUND", "Không tìm thấy");

export async function loadUserRefs(
  db: PrismaClient,
  ids: Array<bigint | null | undefined>,
): Promise<Map<string, UserRef>> {
  const unique = [...new Set(ids.filter((id): id is bigint => id != null))];
  if (unique.length === 0) return new Map();
  const users = await db.user.findMany({
    where: { id: { in: unique } },
    select: { id: true, fullName: true },
  });
  return new Map(users.map((u) => [String(u.id), { id: Number(u.id), fullName: u.fullName }]));
}

async function assertPage(db: PrismaClient, pageId: bigint): Promise<void> {
  const page = await db.page.findUnique({ where: { id: pageId }, select: { id: true } });
  if (!page) throw notFound();
}

export async function listVersions(db: PrismaClient, pageId: bigint): Promise<{ items: VersionListItem[] }> {
  await assertPage(db, pageId);
  const rows = await db.pageVersion.findMany({
    where: { pageId },
    orderBy: { number: "desc" },
    select: { number: true, note: true, publishedAt: true, publishedByUserId: true },
  });
  const users = await loadUserRefs(db, rows.map((r) => r.publishedByUserId));
  return {
    items: rows.map((r) => ({
      number: r.number,
      note: r.note,
      publishedAt: r.publishedAt.toISOString(),
      publishedBy: r.publishedByUserId ? (users.get(String(r.publishedByUserId)) ?? null) : null,
    })),
  };
}

export async function getVersion(db: PrismaClient, pageId: bigint, number: number): Promise<VersionDetail> {
  const row = await db.pageVersion.findUnique({ where: { pageId_number: { pageId, number } } });
  if (!row) throw notFound();
  const users = await loadUserRefs(db, [row.publishedByUserId]);
  return {
    number: row.number,
    content: row.content,
    note: row.note,
    publishedAt: row.publishedAt.toISOString(),
    publishedBy: row.publishedByUserId ? (users.get(String(row.publishedByUserId)) ?? null) : null,
  };
}

export async function restoreVersion(
  db: PrismaClient,
  pageId: bigint,
  number: number,
  actorUserId: bigint,
  ip: string,
): Promise<{ revision: number }> {
  const row = await db.pageVersion.findUnique({ where: { pageId_number: { pageId, number } } });
  if (!row) throw notFound();
  const content = pageContentSchema.parse(row.content);
  await assertMediaExist(db, content);
  return db.$transaction(async (tx) => {
    const draft = await tx.pageDraft.upsert({
      where: { pageId },
      create: { pageId, content, revision: 1, updatedByUserId: actorUserId },
      update: { content, revision: { increment: 1 }, updatedByUserId: actorUserId },
    });
    await recordAudit(tx, {
      actorUserId,
      action: "content.restore",
      targetType: "page",
      targetId: String(pageId),
      metadata: { number },
      ip,
    });
    return { revision: draft.revision };
  });
}
