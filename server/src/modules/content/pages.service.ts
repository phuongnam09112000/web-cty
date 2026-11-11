import type { PrismaClient } from "../../db.js";
import { AppError } from "../../http/errors.js";
import { recordAudit } from "../audit/audit.service.js";
import { pageContentSchema } from "./blocks/index.js";
import { countUntranslated } from "./localized.js";
import { assertMediaExist } from "./media-refs.js";
import { loadUserRefs, type UserRef } from "./versions.service.js";

export const MAX_CONTENT_BYTES = 1024 * 1024;

export type PageListItem = {
  id: number;
  path: string;
  name: string;
  hasUnpublishedChanges: boolean;
  untranslatedCount: number;
  publishedVersion: { number: number; publishedAt: string; publishedBy: UserRef | null } | null;
  draftUpdatedAt: string | null;
  draftUpdatedBy: UserRef | null;
};

export type PageDetail = {
  id: number;
  path: string;
  name: string;
  draft: { content: unknown; revision: number; updatedAt: string };
  published: { number: number; content: unknown } | null;
};

const notFound = () => new AppError(404, "NOT_FOUND", "Không tìm thấy");

function canonical(value: unknown): string {
  return JSON.stringify(value, (_key, v: unknown) => {
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      return Object.fromEntries(Object.entries(v).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
    }
    return v;
  });
}

export async function listPages(db: PrismaClient): Promise<{ items: PageListItem[] }> {
  const pages = await db.page.findMany({
    orderBy: { id: "asc" },
    include: { draft: true, publishedVersion: true },
  });
  const users = await loadUserRefs(
    db,
    pages.flatMap((p) => [p.draft?.updatedByUserId, p.publishedVersion?.publishedByUserId]),
  );
  const ref = (id: bigint | null | undefined) => (id ? (users.get(String(id)) ?? null) : null);
  return {
    items: pages.map((p) => ({
      id: Number(p.id),
      path: p.path,
      name: p.name,
      hasUnpublishedChanges:
        !p.publishedVersion ||
        !p.draft ||
        canonical(p.draft.content) !== canonical(p.publishedVersion.content),
      untranslatedCount: p.draft ? countUntranslated(p.draft.content) : 0,
      publishedVersion: p.publishedVersion
        ? {
            number: p.publishedVersion.number,
            publishedAt: p.publishedVersion.publishedAt.toISOString(),
            publishedBy: ref(p.publishedVersion.publishedByUserId),
          }
        : null,
      draftUpdatedAt: p.draft ? p.draft.updatedAt.toISOString() : null,
      draftUpdatedBy: ref(p.draft?.updatedByUserId),
    })),
  };
}

export async function getPage(db: PrismaClient, id: bigint): Promise<PageDetail> {
  const page = await db.page.findUnique({
    where: { id },
    include: { draft: true, publishedVersion: true },
  });
  if (!page || !page.draft) throw notFound();
  return {
    id: Number(page.id),
    path: page.path,
    name: page.name,
    draft: {
      content: page.draft.content,
      revision: page.draft.revision,
      updatedAt: page.draft.updatedAt.toISOString(),
    },
    published: page.publishedVersion
      ? { number: page.publishedVersion.number, content: page.publishedVersion.content }
      : null,
  };
}

export async function saveDraft(
  db: PrismaClient,
  pageId: bigint,
  input: { content: unknown; revision: number },
  actorUserId: bigint,
  ip: string,
): Promise<{ revision: number }> {
  const serialized = JSON.stringify(input.content ?? null);
  if (Buffer.byteLength(serialized, "utf8") > MAX_CONTENT_BYTES) {
    throw new AppError(413, "PAYLOAD_TOO_LARGE", "Nội dung trang vượt quá 1 MB");
  }
  const content = pageContentSchema.parse(input.content);
  await assertMediaExist(db, content);
  return db.$transaction(async (tx) => {
    const result = await tx.pageDraft.updateMany({
      where: { pageId, revision: input.revision },
      data: { content, revision: { increment: 1 }, updatedByUserId: actorUserId },
    });
    if (result.count === 0) {
      const exists = await tx.pageDraft.findUnique({ where: { pageId }, select: { pageId: true } });
      if (!exists) throw notFound();
      throw new AppError(409, "CONFLICT", "Trang đã được người khác sửa");
    }
    const revision = input.revision + 1;
    await recordAudit(tx, {
      actorUserId,
      action: "content.draft_save",
      targetType: "page",
      targetId: String(pageId),
      metadata: { revision },
      ip,
    });
    return { revision };
  });
}

export async function publishPage(
  db: PrismaClient,
  pageId: bigint,
  note: string | undefined,
  actorUserId: bigint,
  ip: string,
): Promise<{ number: number; path: string }> {
  return db.$transaction(async (tx) => {
    const locked = await tx.$queryRaw<Array<{ path: string }>>`SELECT path FROM pages WHERE id = ${pageId} FOR UPDATE`;
    const page = locked[0];
    if (!page) throw notFound();
    const draft = await tx.pageDraft.findUnique({ where: { pageId } });
    if (!draft) throw notFound();
    const max = await tx.pageVersion.aggregate({ where: { pageId }, _max: { number: true } });
    const number = (max._max.number ?? 0) + 1;
    const version = await tx.pageVersion.create({
      data: {
        pageId,
        number,
        content: draft.content ?? {},
        note: note ? note : null,
        publishedByUserId: actorUserId,
      },
    });
    await tx.page.update({ where: { id: pageId }, data: { publishedVersionId: version.id } });
    await recordAudit(tx, {
      actorUserId,
      action: "content.publish",
      targetType: "page",
      targetId: String(pageId),
      metadata: { number },
      ip,
    });
    return { number, path: page.path };
  });
}
