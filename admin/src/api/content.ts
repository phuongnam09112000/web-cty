import { apiFetch } from "./client";
import type { Localized, MediaDto, MediaUsage, Page, PageContent, PageDetail, PageListItem, VersionDetail, VersionListItem } from "./types";

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

export function createPreview(id: number): Promise<{ url: string }> {
  return apiFetch<{ url: string }>(`/pages/${id}/preview`, { method: "POST" });
}

export function publishPage(id: number, note: string): Promise<{ number: number }> {
  return apiFetch<{ number: number }>(`/pages/${id}/publish`, { method: "POST", body: note ? { note } : {} });
}

export async function fetchVersions(id: number): Promise<VersionListItem[]> {
  const result = await apiFetch<{ items: VersionListItem[] }>(`/pages/${id}/versions`);
  return result.items;
}

export function fetchVersion(id: number, number: number): Promise<VersionDetail> {
  return apiFetch<VersionDetail>(`/pages/${id}/versions/${number}`);
}

export function restoreVersion(id: number, number: number): Promise<{ revision: number }> {
  return apiFetch<{ revision: number }>(`/pages/${id}/versions/${number}/restore`, { method: "POST" });
}

export function fetchMediaPage(page: number, pageSize: number, q: string): Promise<Page<MediaDto>> {
  return apiFetch<Page<MediaDto>>("/media", { query: { page, pageSize, q: q || undefined } });
}

export function uploadMedia(file: File): Promise<MediaDto> {
  const form = new FormData();
  form.append("file", file);
  return apiFetch<MediaDto>("/media", { method: "POST", body: form });
}

export function updateMediaAlt(id: number, alt: Localized): Promise<MediaDto> {
  return apiFetch<MediaDto>(`/media/${id}`, { method: "PATCH", body: { alt } });
}

export function deleteMedia(id: number): Promise<void> {
  return apiFetch<void>(`/media/${id}`, { method: "DELETE" });
}

export function fetchMediaUsage(id: number): Promise<MediaUsage> {
  return apiFetch<MediaUsage>(`/media/${id}/usage`);
}
