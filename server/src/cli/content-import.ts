import "dotenv/config";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { loadConfig, type Config } from "../config.js";
import { createPrisma, type PrismaClient } from "../db.js";
import { recordAudit } from "../modules/audit/audit.service.js";
import { pageContentSchema } from "../modules/content/blocks/index.js";
import { normalizePath } from "../modules/content/public.routes.js";
import { storeMedia, validateMediaBuffer, type MediaDto } from "../modules/media/media.service.js";

export type ImportDeps = { prisma: PrismaClient; config: Pick<Config, "mediaDir"> };

export type ImportOptions = {
  seedDir: string;
  publicDir: string;
  fallbackOut: string;
  force: boolean;
  actorUserId: bigint | null;
};

type SeedPage = { file: string; path: string; name: string; content: unknown };

const PLACEHOLDER_MEDIA_ID = 1;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isSrcRef(value: unknown): value is { src: unknown } {
  return isRecord(value) && Object.keys(value).length === 1 && "src" in value;
}

function mapRefs(value: unknown, fn: (src: unknown, where: string) => unknown, where = ""): unknown {
  if (Array.isArray(value)) return value.map((item, i) => mapRefs(item, fn, where ? `${where}.${i}` : String(i)));
  if (isSrcRef(value)) return fn(value.src, where);
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, mapRefs(v, fn, where ? `${where}.${k}` : k)]),
    );
  }
  return value;
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([k, v]) => [k, sortKeys(v)]),
    );
  }
  return value;
}

async function readSeedPages(seedDir: string): Promise<SeedPage[]> {
  const files = (await readdir(seedDir)).filter((f) => f.endsWith(".json")).sort();
  const pages: SeedPage[] = [];
  const seen = new Set<string>();
  for (const file of files) {
    let raw: unknown;
    try {
      raw = JSON.parse(await readFile(join(seedDir, file), "utf8"));
    } catch {
      throw new Error(`${file}: không đọc được JSON`);
    }
    if (!isRecord(raw) || typeof raw.path !== "string" || typeof raw.name !== "string" || !("content" in raw)) {
      throw new Error(`${file}: thiếu path, name hoặc content`);
    }
    const normalized = normalizePath(raw.path);
    if (normalized === null || normalized !== raw.path) {
      throw new Error(`${file}: path "${raw.path}" không hợp lệ hoặc chưa chuẩn hóa`);
    }
    if (seen.has(normalized)) throw new Error(`${file}: path "${normalized}" bị trùng`);
    seen.add(normalized);
    pages.push({ file, path: normalized, name: raw.name, content: raw.content });
  }
  return pages;
}

function resolveSource(publicDir: string, src: unknown, file: string, where: string): string {
  if (typeof src !== "string" || !src.startsWith("/")) {
    throw new Error(`${file}: ${where}: đường dẫn ảnh phải bắt đầu bằng "/"`);
  }
  const root = resolve(publicDir);
  const full = resolve(root, `.${src}`);
  if (!full.startsWith(root + sep)) {
    throw new Error(`${file}: ${where}: đường dẫn ảnh "${src}" nằm ngoài thư mục public`);
  }
  return full;
}

export async function importContent(
  deps: ImportDeps,
  options: ImportOptions,
): Promise<{ pages: number; media: number }> {
  const { prisma, config } = deps;
  if (!options.force && (await prisma.page.count()) > 0) {
    throw new Error("Đã có dữ liệu trang; dùng --force để tạo phiên bản mới");
  }
  const seedPages = await readSeedPages(options.seedDir);

  const buffers = new Map<string, Buffer>();
  for (const page of seedPages) {
    const sources = new Map<string, string>();
    mapRefs(page.content, (src, where) => {
      sources.set(src as string, resolveSource(options.publicDir, src, page.file, where));
      return null;
    });
    for (const [src, full] of sources) {
      if (buffers.has(src)) continue;
      try {
        buffers.set(src, await readFile(full));
      } catch {
        throw new Error(`${page.file}: không tìm thấy ảnh ${src} (${full})`);
      }
      try {
        await validateMediaBuffer(buffers.get(src) as Buffer);
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        throw new Error(`${page.file}: ảnh ${src} không hợp lệ: ${reason}`, { cause: error });
      }
    }
    const probe = mapRefs(page.content, () => ({ mediaId: PLACEHOLDER_MEDIA_ID }));
    const parsed = pageContentSchema.safeParse(probe);
    if (!parsed.success) {
      const details = parsed.error.issues
        .map((issue) => `${issue.path.join(".") || "(gốc)"}: ${issue.message}`)
        .join("; ");
      throw new Error(`${page.file}: nội dung không hợp lệ: ${details}`);
    }
  }

  const media = new Map<string, MediaDto>();
  for (const [src, buffer] of buffers) {
    media.set(src, await storeMedia(prisma, config, { buffer, originalName: basename(src) }, options.actorUserId, src));
  }

  const prepared = seedPages.map((page) => {
    const withIds = mapRefs(page.content, (src) => ({ mediaId: Number(media.get(src as string)?.id) }));
    const content = pageContentSchema.parse(withIds);
    const fallback = mapRefs(page.content, (src) => {
      const dto = media.get(src as string);
      return { url: src, width: dto?.width ?? null, height: dto?.height ?? null, alt: dto?.alt ?? null, sourcePath: src };
    });
    return { page, content, fallback };
  });

  await prisma.$transaction(async (tx) => {
    for (const { page, content } of prepared) {
      const existing = await tx.page.findUnique({ where: { path: page.path } });
      const row = existing
        ? await tx.page.update({ where: { id: existing.id }, data: { name: page.name } })
        : await tx.page.create({ data: { path: page.path, name: page.name } });
      await tx.pageDraft.upsert({
        where: { pageId: row.id },
        create: { pageId: row.id, content, updatedByUserId: options.actorUserId },
        update: { content, revision: { increment: 1 }, updatedByUserId: options.actorUserId },
      });
      const max = await tx.pageVersion.aggregate({ where: { pageId: row.id }, _max: { number: true } });
      const number = (max._max.number ?? 0) + 1;
      const version = await tx.pageVersion.create({
        data: {
          pageId: row.id,
          number,
          content,
          note: "Nhập dữ liệu ban đầu",
          publishedByUserId: options.actorUserId,
        },
      });
      await tx.page.update({ where: { id: row.id }, data: { publishedVersionId: version.id } });
      await recordAudit(tx, {
        actorUserId: options.actorUserId,
        action: "content.publish",
        targetType: "page",
        targetId: String(row.id),
        metadata: { number, source: "import" },
        ip: "",
      });
    }
  }, { timeout: 120_000, maxWait: 10_000 });

  const fallback = Object.fromEntries(
    [...prepared].sort((a, b) => (a.page.path < b.page.path ? -1 : 1)).map((p) => [p.page.path, sortKeys(p.fallback)]),
  );
  await mkdir(dirname(options.fallbackOut), { recursive: true });
  await writeFile(options.fallbackOut, `${JSON.stringify(fallback, null, 2)}\n`, "utf8");

  return { pages: prepared.length, media: media.size };
}

function parseArgs(argv: string[]): ImportOptions {
  const options: ImportOptions = {
    seedDir: resolve("./content-seed"),
    publicDir: resolve("../public"),
    fallbackOut: resolve("../src/content/cms-fallback.json"),
    force: false,
    actorUserId: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const value = () => {
      const next = argv[++i];
      if (!next) throw new Error(`Thiếu giá trị cho ${arg}`);
      return resolve(next);
    };
    if (arg === "--force") options.force = true;
    else if (arg === "--seed") options.seedDir = value();
    else if (arg === "--public") options.publicDir = value();
    else if (arg === "--fallback-out") options.fallbackOut = value();
    else throw new Error(`Tham số không hợp lệ: ${arg}`);
  }
  return options;
}

async function run(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const config = loadConfig(process.env);
  const prisma = createPrisma(config.databaseUrl);
  try {
    const result = await importContent({ prisma, config }, options);
    console.log(`Đã nhập ${result.pages} trang và ${result.media} ảnh`);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
