import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import fallbackJson from "../content/cms-fallback.json";
import type { CmsContent } from "./types";

type Stored = { etag: string | null; content: CmsContent };

const fallback = fallbackJson as unknown as Record<string, CmsContent>;
const EMPTY: CmsContent = {
  seo: { title: { vi: "", en: "" }, description: { vi: "", en: "" }, image: null },
  blocks: [],
};
const REQUEST_TIMEOUT_MS = 5000;

const storageKey = (path: string) => `istt_content:${path}`;

function isContent(value: unknown): value is CmsContent {
  if (value === null || typeof value !== "object") return false;
  const content = value as { seo?: unknown; blocks?: unknown };
  return Array.isArray(content.blocks) && content.seo !== null && typeof content.seo === "object";
}

function readStored(path: string): Stored | null {
  try {
    const raw = localStorage.getItem(storageKey(path));
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    const record = parsed as { etag?: unknown; content?: unknown } | null;
    if (record && typeof record === "object" && isContent(record.content)) {
      return { etag: typeof record.etag === "string" ? record.etag : null, content: record.content };
    }
    localStorage.removeItem(storageKey(path));
  } catch {
    try {
      localStorage.removeItem(storageKey(path));
    } catch {
      return null;
    }
  }
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
          if (isContent(body.content)) apply(body.content, true);
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
        if (!isContent(body.content)) return;
        writeStored(path, { etag: response.headers.get("ETag"), content: body.content });
        apply(body.content, false);
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
