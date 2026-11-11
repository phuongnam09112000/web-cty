import { createHash } from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import { imageSize } from "image-size";
import type { Config } from "../../config.js";
import type { PrismaClient } from "../../db.js";
import { Prisma, type Media } from "../../generated/prisma/client.js";
import { AppError } from "../../http/errors.js";
import { toPage, type Page } from "../../http/pagination.js";
import { isPrismaError } from "../../http/prisma-errors.js";
import { recordAudit } from "../audit/audit.service.js";
import { findMediaRefs } from "../content/media-refs.js";
import { deleteMediaFile, writeMediaFile } from "./media.storage.js";
import { sanitizeSvg } from "./svg-sanitize.js";

export const MAX_MEDIA_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 8000;

const RASTER_TYPES: Record<string, { mime: string; ext: string }> = {
  "image/png": { mime: "image/png", ext: "png" },
  "image/jpeg": { mime: "image/jpeg", ext: "jpg" },
  "image/webp": { mime: "image/webp", ext: "webp" },
};

export type Localized = { vi: string; en: string };

export type MediaDto = {
  id: number;
  fileName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  alt: Localized;
  url: string;
  sourcePath: string | null;
  createdAt: string;
};

export type MediaUsage = { pages: { id: number; path: string; name: string }[] };

export function toMediaDto(media: Media): MediaDto {
  return {
    id: Number(media.id),
    fileName: media.fileName,
    originalName: media.originalName,
    mimeType: media.mimeType,
    sizeBytes: media.sizeBytes,
    width: media.width,
    height: media.height,
    alt: media.alt as Localized,
    url: `/media/${media.fileName}`,
    sourcePath: media.sourcePath,
    createdAt: media.createdAt.toISOString(),
  };
}

const notFound = () => new AppError(404, "NOT_FOUND", "Không tìm thấy ảnh");
const unsupported = () =>
  new AppError(415, "UNSUPPORTED_MEDIA_TYPE", "Định dạng ảnh không được hỗ trợ", {
    file: "Định dạng ảnh không được hỗ trợ",
  });
const tooLarge = () =>
  new AppError(413, "PAYLOAD_TOO_LARGE", "Ảnh vượt quá 5 MB", { file: "Ảnh vượt quá 5 MB" });

const SVG_SCAN_BYTES = 64 * 1024;
const SVG_PROLOG = /^(?:\s|\uFEFF|<\?[\s\S]*?\?>|<!--[\s\S]*?-->|<!DOCTYPE[^>[]*(?:\[[\s\S]*?\])?\s*>)*<svg[\s>/]/i;

function looksLikeSvg(buffer: Buffer): boolean {
  return SVG_PROLOG.test(buffer.subarray(0, SVG_SCAN_BYTES).toString("utf8"));
}

async function detect(buffer: Buffer): Promise<{ mime: string; ext: string; data: Buffer }> {
  const type = await fileTypeFromBuffer(buffer);
  if (type && type.mime !== "application/xml") {
    const known = RASTER_TYPES[type.mime];
    if (!known) throw unsupported();
    return { ...known, data: buffer };
  }
  if (looksLikeSvg(buffer)) {
    const clean = sanitizeSvg(buffer.toString("utf8"));
    if (!clean) throw unsupported();
    return { mime: "image/svg+xml", ext: "svg", data: Buffer.from(clean, "utf8") };
  }
  throw unsupported();
}

function measure(data: Buffer, isSvg: boolean): { width: number | null; height: number | null } {
  try {
    const size = imageSize(data);
    if (typeof size.width === "number" && typeof size.height === "number") {
      return { width: size.width, height: size.height };
    }
  } catch {
    if (!isSvg) throw unsupported();
  }
  if (!isSvg) throw unsupported();
  return { width: null, height: null };
}

export async function storeMedia(
  prisma: PrismaClient,
  config: Pick<Config, "mediaDir">,
  file: { buffer: Buffer; originalName: string },
  actorUserId: bigint | null,
  sourcePath?: string,
  ip = "",
): Promise<MediaDto> {
  if (file.buffer.length > MAX_MEDIA_BYTES) throw tooLarge();
  const detected = await detect(file.buffer);
  if (detected.data.length > MAX_MEDIA_BYTES) throw tooLarge();
  const { width, height } = measure(detected.data, detected.ext === "svg");
  if ((width ?? 0) > MAX_DIMENSION || (height ?? 0) > MAX_DIMENSION) {
    throw new AppError(400, "VALIDATION_ERROR", "Kích thước ảnh tối đa 8000 × 8000", {
      file: "Kích thước ảnh tối đa 8000 × 8000",
    });
  }
  const sha256 = createHash("sha256").update(detected.data).digest("hex");
  const existing = await prisma.media.findUnique({ where: { sha256 } });
  if (existing) return toMediaDto(existing);

  const fileName = `${sha256.slice(0, 16)}.${detected.ext}`;
  await writeMediaFile(config.mediaDir, fileName, detected.data);
  let created: Media;
  try {
    created = await prisma.$transaction(async (tx) => {
      const row = await tx.media.create({
        data: {
          fileName,
          originalName: file.originalName.slice(0, 255),
          mimeType: detected.mime,
          sizeBytes: detected.data.length,
          width,
          height,
          alt: { vi: "", en: "" },
          sha256,
          sourcePath: sourcePath ?? null,
          uploadedByUserId: actorUserId,
        },
      });
      await recordAudit(tx, {
        actorUserId,
        action: "media.upload",
        targetType: "media",
        targetId: String(row.id),
        metadata: { fileName, originalName: row.originalName },
        ip,
      });
      return row;
    });
  } catch (err) {
    if (isPrismaError(err, "P2002")) {
      const winner = await prisma.media.findUnique({ where: { sha256 } });
      if (winner) return toMediaDto(winner);
    }
    throw err;
  }
  return toMediaDto(created);
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

export async function listMedia(
  prisma: PrismaClient,
  query: { page: number; pageSize: number; q?: string },
): Promise<Page<MediaDto>> {
  const where: Prisma.MediaWhereInput = {};
  if (query.q) {
    const pattern = `%${escapeLike(query.q)}%`;
    const rows = await prisma.$queryRaw<{ id: bigint }[]>(Prisma.sql`
      SELECT id FROM media
      WHERE original_name LIKE ${pattern} COLLATE utf8mb4_unicode_ci
        OR CONVERT(JSON_UNQUOTE(JSON_EXTRACT(alt, '$.vi')) USING utf8mb4) COLLATE utf8mb4_unicode_ci LIKE ${pattern}
    `);
    where.id = { in: rows.map((row) => row.id) };
  }
  const [total, items] = await Promise.all([
    prisma.media.count({ where }),
    prisma.media.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
  ]);
  return toPage(items.map(toMediaDto), total, query.page, query.pageSize);
}

async function requireMedia(prisma: PrismaClient, id: bigint): Promise<Media> {
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) throw notFound();
  return media;
}

export async function updateMediaAlt(
  prisma: PrismaClient,
  id: bigint,
  alt: Localized,
  actorUserId: bigint,
  ip: string,
): Promise<MediaDto> {
  await requireMedia(prisma, id);
  return prisma.$transaction(async (tx) => {
    const row = await tx.media.update({ where: { id }, data: { alt } });
    await recordAudit(tx, {
      actorUserId,
      action: "media.update",
      targetType: "media",
      targetId: String(id),
      metadata: { alt },
      ip,
    });
    return toMediaDto(row);
  });
}

export async function findMediaUsage(prisma: PrismaClient, id: bigint): Promise<MediaUsage> {
  const mediaId = Number(id);
  const pages = await prisma.page.findMany({
    include: { draft: true, publishedVersion: true },
    orderBy: { path: "asc" },
  });
  const uses = (content: unknown) =>
    content !== undefined && content !== null && [...findMediaRefs(content).values()].includes(mediaId);
  return {
    pages: pages
      .filter((page) => uses(page.draft?.content) || uses(page.publishedVersion?.content))
      .map((page) => ({ id: Number(page.id), path: page.path, name: page.name })),
  };
}

export async function getMediaUsage(prisma: PrismaClient, id: bigint): Promise<MediaUsage> {
  await requireMedia(prisma, id);
  return findMediaUsage(prisma, id);
}

export async function deleteMedia(
  prisma: PrismaClient,
  config: Pick<Config, "mediaDir">,
  id: bigint,
  actorUserId: bigint,
  ip: string,
): Promise<void> {
  const media = await requireMedia(prisma, id);
  const usage = await findMediaUsage(prisma, id);
  if (usage.pages.length > 0) {
    const list = usage.pages.map((page) => `${page.name} (${page.path})`).join(", ");
    throw new AppError(409, "CONFLICT", "Ảnh đang được dùng trong trang", {
      pages: `Ảnh đang được dùng trong: ${list}`,
    });
  }
  await prisma.$transaction(async (tx) => {
    await tx.media.delete({ where: { id } });
    await recordAudit(tx, {
      actorUserId,
      action: "media.delete",
      targetType: "media",
      targetId: String(id),
      metadata: { fileName: media.fileName, originalName: media.originalName },
      ip,
    });
  });
  await deleteMediaFile(config.mediaDir, media.fileName);
}
