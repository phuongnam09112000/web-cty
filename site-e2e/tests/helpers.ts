import { request, type APIRequestContext } from "@playwright/test";

export const API_ORIGIN = process.env.SITE_E2E_API ?? "http://127.0.0.1:4000";
export const ADMIN_ORIGIN = process.env.SITE_E2E_ADMIN_ORIGIN ?? "http://localhost:5173";
export const GATEWAY_SECRET =
  process.env.SITE_E2E_GATEWAY_SECRET ?? "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
export const ADMIN_EMAIL = process.env.SITE_E2E_ADMIN_EMAIL ?? "admin@istt.vn";
export const ADMIN_PASSWORD = process.env.SITE_E2E_ADMIN_PASSWORD ?? "Matkhau@12345";

type Draft = {
  id: number;
  draft: { revision: number; content: { seo: { title: { vi: string; en: string } }; blocks: Block[] } };
};
type Block = { type: string; data: Record<string, unknown> };

async function expectOk(response: { ok(): boolean; status(): number; text(): Promise<string> }) {
  if (!response.ok()) throw new Error(`${response.status()} ${await response.text()}`);
}

export async function adminApi(): Promise<APIRequestContext> {
  const api = await request.newContext({
    baseURL: API_ORIGIN,
    extraHTTPHeaders: { Origin: ADMIN_ORIGIN, "X-Admin-Gateway": GATEWAY_SECRET },
  });
  await expectOk(await api.post("/api/admin/auth/login", { data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } }));
  return api;
}

export async function createPreviewToken(
  api: APIRequestContext,
  path: string,
  edit: (content: Draft["draft"]["content"]) => void,
): Promise<string> {
  const list = await api.get("/api/admin/pages");
  await expectOk(list);
  const { items: pages } = (await list.json()) as { items: { id: number; path: string }[] };
  const page = pages.find((item) => item.path === path);
  if (!page) throw new Error(`Không có trang ${path} trong cơ sở dữ liệu`);
  const detail = await api.get(`/api/admin/pages/${page.id}`);
  await expectOk(detail);
  const current = (await detail.json()) as Draft;
  const content = structuredClone(current.draft.content);
  edit(content);
  await expectOk(
    await api.put(`/api/admin/pages/${page.id}/draft`, { data: { content, revision: current.draft.revision } }),
  );
  const preview = await api.post(`/api/admin/pages/${page.id}/preview`);
  await expectOk(preview);
  const { url } = (await preview.json()) as { url: string };
  return new URL(url).searchParams.get("preview") ?? "";
}
