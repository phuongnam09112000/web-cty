import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import fallbackJson from "../content/cms-fallback.json";
import type { CmsBlock, CmsContent } from "./types";

type Stored = { schema: number; etag: string | null; content: CmsContent };

const SCHEMA_VERSION = 1;

const fallback = fallbackJson as unknown as Record<string, CmsContent>;
const EMPTY: CmsContent = {
  seo: { title: { vi: "", en: "" }, description: { vi: "", en: "" }, image: null },
  blocks: [],
};
const REQUEST_TIMEOUT_MS = 5000;

const storageKey = (path: string) => `istt_content:${path}`;

const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

function isBlock(value: unknown): value is CmsBlock {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    typeof value.type === "string" &&
    typeof value.hidden === "boolean" &&
    isObject(value.data)
  );
}

function sanitize(value: unknown): CmsContent | null {
  if (!isObject(value) || !Array.isArray(value.blocks)) return null;
  const seo = isObject(value.seo) ? (value.seo as unknown as CmsContent["seo"]) : EMPTY.seo;
  return { seo, blocks: value.blocks.filter(isBlock) };
}

export function clearStored(path: string): void {
  try {
    localStorage.removeItem(storageKey(path));
  } catch {
    return;
  }
}

function readStored(path: string): Stored | null {
  try {
    const raw = localStorage.getItem(storageKey(path));
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (isObject(parsed) && parsed.schema === SCHEMA_VERSION) {
      const content = sanitize(parsed.content);
      if (content) return { schema: SCHEMA_VERSION, etag: typeof parsed.etag === "string" ? parsed.etag : null, content };
    }
  } catch {
    clearStored(path);
    return null;
  }
  clearStored(path);
  return null;
}

function writeStored(path: string, stored: Stored): void {
  try {
    localStorage.setItem(storageKey(path), JSON.stringify(stored));
  } catch {
    return;
  }
}

function initialContent(path: string, preview: boolean): CmsContent {
  const stored = preview ? null : readStored(path);
  return stored?.content ?? fallback[path] ?? EMPTY;
}

export function useCmsPage(path: string): { content: CmsContent; isPreview: boolean } {
  const { search } = useLocation();
  const token = new URLSearchParams(search).get("preview");
  const [state, setState] = useState(() => ({
    key: `${path}|${token ?? ""}`,
    content: initialContent(path, token !== null),
    isPreview: false,
  }));
  const key = `${path}|${token ?? ""}`;

  if (state.key !== key) {
    setState({ key, content: initialContent(path, token !== null), isPreview: false });
  }

  useEffect(() => {
    let cancelled = false;
    const apply = (content: CmsContent, isPreview: boolean) => {
      if (cancelled) return;
      setState((current) => {
        if (current.key !== key) return current;
        if (current.isPreview === isPreview && JSON.stringify(current.content) === JSON.stringify(content)) {
          return current;
        }
        return { key, content, isPreview };
      });
    };

    const load = async () => {
      try {
        if (token !== null) {
          const response = await fetch(`/api/public/preview/${encodeURIComponent(token)}`, {
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
          });
          if (!response.ok) return;
          const body = (await response.json()) as { content?: unknown };
          const content = sanitize(body.content);
          if (content) apply(content, true);
          return;
        }
        const stored = readStored(path);
        const headers: Record<string, string> = {};
        if (stored?.etag) headers["If-None-Match"] = stored.etag;
        const response = await fetch(`/api/public/pages?path=${encodeURIComponent(path)}`, {
          headers,
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        if (response.status === 304 || !response.ok) return;
        const body = (await response.json()) as { content?: unknown };
        const content = sanitize(body.content);
        if (!content) return;
        writeStored(path, { schema: SCHEMA_VERSION, etag: response.headers.get("ETag"), content });
        apply(content, false);
      } catch {
        return;
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [path, token, key]);

  return { content: state.content, isPreview: state.isPreview };
}
