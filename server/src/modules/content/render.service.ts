import { readFile } from "node:fs/promises";
import type { PrismaClient } from "../../db.js";
import { pick, type LocalizedText } from "./localized.js";
import { resolveMedia } from "./media-refs.js";

export type RenderLang = "vi" | "en";

export type Renderer = {
  render(path: string, lang: RenderLang): Promise<string>;
  invalidate(): void;
};

export type RendererDeps = {
  prisma: PrismaClient;
  config: { websiteIndexPath: string; publicSiteOrigin: string };
};

const CACHE_MAX = 500;
const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isLocalized(value: unknown): value is LocalizedText {
  return isRecord(value) && typeof value.vi === "string" && typeof value.en === "string";
}

function findImageUrl(value: unknown): string | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findImageUrl(item);
      if (found !== null) return found;
    }
    return null;
  }
  if (isRecord(value)) {
    if (typeof value.url === "string" && value.url.startsWith("/media/")) return value.url;
    for (const inner of Object.values(value)) {
      const found = findImageUrl(inner);
      if (found !== null) return found;
    }
  }
  return null;
}

type Seo = { title: string; description: string; imageUrl: string | null };

function extractSeo(content: unknown, lang: RenderLang): Seo | null {
  if (!isRecord(content) || !isRecord(content.seo)) return null;
  const { title, description, image } = content.seo;
  if (!isLocalized(title) || !isLocalized(description)) return null;
  let imageUrl: string | null = null;
  if (isRecord(image) && typeof image.url === "string") {
    imageUrl = image.url;
  } else if (Array.isArray(content.blocks) && content.blocks.length > 0) {
    imageUrl = findImageUrl(content.blocks[0]);
  }
  return { title: pick(title, lang), description: pick(description, lang), imageUrl };
}

const META_TAG = /<meta\b[^>]*>/gi;

function metaKey(tag: string): string | null {
  const match = /\b(?:name|property)\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(tag);
  const key = match?.[1] ?? match?.[2];
  return key === undefined ? null : key.toLowerCase();
}

function meta(attr: "name" | "property", key: string, value: string): string {
  return `<meta ${attr}="${key}" content="${escapeHtml(value)}" />`;
}

function inject(template: string, seo: Seo, url: string, lang: RenderLang, origin: string): string {
  const managed = new Set(["description", "og:title", "og:description", "og:image", "og:url", "og:type", "og:locale"]);
  const tags = [
    meta("name", "description", seo.description),
    meta("property", "og:title", seo.title),
    meta("property", "og:description", seo.description),
  ];
  if (seo.imageUrl !== null) tags.push(meta("property", "og:image", `${origin}${seo.imageUrl}`));
  tags.push(
    meta("property", "og:url", url),
    meta("property", "og:type", "website"),
    meta("property", "og:locale", lang === "en" ? "en_US" : "vi_VN"),
  );
  const title = `<title>${escapeHtml(seo.title)}</title>`;

  let html = template.replace(META_TAG, (tag) => {
    const key = metaKey(tag);
    return key !== null && managed.has(key) ? "" : tag;
  });
  html = html.replace(/<html\b([^>]*)>/i, (_all, attrs: string) => {
    const rest = attrs.replace(/\s+lang\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/i, "");
    return `<html lang="${lang}"${rest}>`;
  });
  const hasTitle = /<title\b[^>]*>[\s\S]*?<\/title>/i.test(html);
  if (hasTitle) html = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, () => title);
  const block = `${hasTitle ? "" : `${title}\n    `}${tags.join("\n    ")}\n  `;
  return html.replace(/<\/head>/i, () => `${block}</head>`);
}

export function createRenderer(deps: RendererDeps): Renderer {
  const { prisma, config } = deps;
  let template: Promise<string> | null = null;
  let generation = 0;
  const cache = new Map<string, string>();

  const loadTemplate = (): Promise<string> => {
    if (template === null) {
      const loading = readFile(config.websiteIndexPath, "utf8");
      template = loading;
      loading.catch(() => {
        if (template === loading) template = null;
      });
    }
    return template;
  };

  const build = async (path: string, lang: RenderLang): Promise<string> => {
    const base = await loadTemplate();
    const page = await prisma.page.findUnique({ where: { path }, include: { publishedVersion: true } });
    if (!page?.publishedVersion) return base;
    const seo = extractSeo(await resolveMedia(prisma, page.publishedVersion.content), lang);
    if (seo === null) return base;
    const url = `${config.publicSiteOrigin}${path}${lang === "en" ? "?lang=en" : ""}`;
    return inject(base, seo, url, lang, config.publicSiteOrigin);
  };

  return {
    async render(path, lang) {
      const key = `${path}|${lang}`;
      const hit = cache.get(key);
      if (hit !== undefined) return hit;
      const started = generation;
      const html = await build(path, lang);
      if (started === generation) {
        if (cache.size >= CACHE_MAX) {
          const oldest = cache.keys().next();
          if (!oldest.done) cache.delete(oldest.value);
        }
        cache.set(key, html);
      }
      return html;
    },
    invalidate() {
      generation += 1;
      template = null;
      cache.clear();
    },
  };
}
