import { apiFetch } from "./client";
import type { MediaDto, Page, PageContent, PageDetail, PageListItem } from "./types";

export async function fetchPages(): Promise<PageListItem[]> {
  const result = await apiFetch<{ items: PageListItem[] }>("/pages");
  return result.items;
}

export function fetchPage(id: number): Promise<PageDetail> {
  return apiFetch<PageDetail>(`/pages/${id}`);
}

export function saveDraft(id: number, content: PageContent, revision: number): Promise<{ revision: number }> {
  return apiFetch<{ revision: number }>(`/pages/${id}/draft`, { method: "PUT", body: { content, revision } });
}

export async function fetchAllMedia(): Promise<MediaDto[]> {
  const pageSize = 100;
  const all: MediaDto[] = [];
  for (let page = 1; ; page += 1) {
    const result = await apiFetch<Page<MediaDto>>("/media", { query: { page, pageSize } });
    all.push(...result.items);
    if (all.length >= result.total || result.items.length === 0) return all;
  }
}
