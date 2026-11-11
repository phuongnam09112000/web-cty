import { readFileSync } from "node:fs";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { EDITOR_ROLE_NAME } from "../src/modules/permissions/catalog.js";
import { createUser, loginAs, makeTestApp, resetDb } from "./helpers.js";

const { app, prisma } = makeTestApp();

afterAll(async () => {
  await resetDb(prisma);
  await prisma.$disconnect();
});

beforeEach(async () => {
  await resetDb(prisma);
});

const samples = JSON.parse(
  readFileSync(new URL("./fixtures/block-samples.json", import.meta.url), "utf8"),
) as Record<string, Record<string, unknown>>;

function remap(value: unknown, ids: Map<number, number>): unknown {
  if (Array.isArray(value)) return value.map((v) => remap(v, ids));
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [
        k,
        k === "mediaId" && typeof v === "number" ? (ids.get(v) ?? v) : remap(v, ids),
      ]),
    );
  }
  return value;
}


let mediaSeq = 0;

async function makeMedia(prefix: string): Promise<number> {
  const tag = `${prefix}${mediaSeq++}`;
  const row = await prisma.media.create({
    data: {
      fileName: `${tag}.png`,
      originalName: `${tag}.png`,
      mimeType: "image/png",
      sizeBytes: 10,
      width: 1,
      height: 1,
      alt: { vi: "", en: "" },
      sha256: tag.padEnd(64, "0"),
    },
  });
  return Number(row.id);
}

async function heroContent(title = "T", en = "T") {
  const a = await makeMedia("a");
  const b = await makeMedia("b");
  const data = remap(samples["home-hero"], new Map([[1, a], [2, b]]));
  return {
    mediaIds: [a, b],
    content: {
      seo: { title: { vi: title, en }, description: { vi: "D", en: "D" }, image: null },
      blocks: [{ id: "aaaaaa", type: "home-hero", hidden: false, data }],
    },
  };
}

async function makePage(path: string, content: unknown) {
  const page = await prisma.page.create({ data: { path, name: `Trang ${path}` } });
  await prisma.pageDraft.create({ data: { pageId: page.id, content: content as object } });
  return Number(page.id);
}

async function agentWith(permissions: string[], email = "u@istt.vn") {
  const role = await prisma.role.create({ data: { name: `Vai ${email}` } });
  for (const key of permissions) {
    const permission = await prisma.permission.findUniqueOrThrow({ where: { key } });
    await prisma.rolePermission.create({ data: { roleId: role.id, permissionId: permission.id } });
  }
  await createUser(prisma, { email, roleName: role.name });
  return loginAs(app, email);
}

async function editor() {
  await createUser(prisma, { email: "ed@istt.vn", roleName: EDITOR_ROLE_NAME });
  return loginAs(app, "ed@istt.vn");
}

describe("permissions", () => {
  it("lets content.view read but not write", async () => {
    const { content } = await heroContent();
    const id = await makePage("/p", content);
    const agent = await agentWith(["content.view"]);
    expect((await agent.get("/api/admin/pages")).status).toBe(200);
    expect((await agent.get(`/api/admin/pages/${id}`)).status).toBe(200);
    expect((await agent.put(`/api/admin/pages/${id}/draft`).send({ content, revision: 1 })).status).toBe(403);
    expect((await agent.post(`/api/admin/pages/${id}/publish`).send({})).status).toBe(403);
    expect((await agent.post(`/api/admin/pages/${id}/versions/1/restore`).send({})).status).toBe(403);
  });

  it("implies content.view for a role with only content.publish", async () => {
    const agent = await agentWith(["content.publish"]);
    expect((await agent.get("/api/admin/pages")).status).toBe(200);
  });

  it("requires content.edit for saving drafts", async () => {
    const { content } = await heroContent();
    const id = await makePage("/p", content);
    const agent = await agentWith(["content.edit"]);
    expect((await agent.put(`/api/admin/pages/${id}/draft`).send({ content, revision: 1 })).status).toBe(200);
    expect((await agent.post(`/api/admin/pages/${id}/publish`).send({})).status).toBe(403);
  });

  it("rejects users without any content permission", async () => {
    const agent = await agentWith([]);
    expect((await agent.get("/api/admin/pages")).status).toBe(403);
  });
});

describe("draft save", () => {
  it("increments the revision and audits", async () => {
    const { content } = await heroContent();
    const id = await makePage("/p", content);
    const agent = await editor();
    const res = await agent.put(`/api/admin/pages/${id}/draft`).send({ content, revision: 1 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ revision: 2 });
    const audit = await prisma.auditLog.findFirst({ where: { action: "content.draft_save" } });
    expect(audit?.metadata).toEqual({ revision: 2 });
    const detail = await agent.get(`/api/admin/pages/${id}`);
    expect(detail.body.draft.revision).toBe(2);
  });

  it("returns 409 for a stale revision", async () => {
    const { content } = await heroContent();
    const id = await makePage("/p", content);
    const agent = await editor();
    await agent.put(`/api/admin/pages/${id}/draft`).send({ content, revision: 1 });
    const res = await agent.put(`/api/admin/pages/${id}/draft`).send({ content, revision: 1 });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
    expect(res.body.error.message).toBe("Trang đã được người khác sửa");
  });

  it("rejects a malformed block with the field path", async () => {
    const { content } = await heroContent();
    const id = await makePage("/p", content);
    const agent = await editor();
    const bad = structuredClone(content);
    (bad.blocks[0]!.data as { title: unknown }).title = { en: "x" };
    const res = await agent.put(`/api/admin/pages/${id}/draft`).send({ content: bad, revision: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error.fields).toHaveProperty(["blocks.0.data.title.vi"]);
  });

  it("rejects a missing media id", async () => {
    const { content } = await heroContent();
    const id = await makePage("/p", content);
    const agent = await editor();
    const bad = structuredClone(content);
    bad.seo.image = { mediaId: 999999 } as never;
    const res = await agent.put(`/api/admin/pages/${id}/draft`).send({ content: bad, revision: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error.fields["seo.image.mediaId"]).toBe("Ảnh không tồn tại");
  });

  it("returns 413 above 1 MB", async () => {
    const { content } = await heroContent();
    const id = await makePage("/p", content);
    const agent = await editor();
    const big = { ...content, padding: "x".repeat(1024 * 1024 + 10) };
    const res = await agent.put(`/api/admin/pages/${id}/draft`).send({ content: big, revision: 1 });
    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe("PAYLOAD_TOO_LARGE");
  });

  it("returns 404 for unknown and malformed ids", async () => {
    const agent = await editor();
    expect((await agent.get("/api/admin/pages/abc")).status).toBe(404);
    expect((await agent.get("/api/admin/pages/99999")).status).toBe(404);
  });
});

describe("publish and list", () => {
  it("numbers versions 1 then 2 and tracks unpublished changes", async () => {
    const { content } = await heroContent();
    const id = await makePage("/p", content);
    const agent = await editor();
    const listed = async () =>
      (await agent.get("/api/admin/pages")).body.items.find((p: { id: number }) => p.id === id);

    expect((await listed()).hasUnpublishedChanges).toBe(true);
    expect((await listed()).publishedVersion).toBeNull();

    const first = await agent.post(`/api/admin/pages/${id}/publish`).send({ note: "Lần đầu" });
    expect(first.status).toBe(200);
    expect(first.body).toEqual({ number: 1 });
    const after = await listed();
    expect(after.hasUnpublishedChanges).toBe(false);
    expect(after.publishedVersion.number).toBe(1);
    expect(after.publishedVersion.publishedBy.fullName).toBe("Người dùng thử");

    const edited = structuredClone(content);
    edited.seo.title.vi = "Tiêu đề mới";
    await agent.put(`/api/admin/pages/${id}/draft`).send({ content: edited, revision: 1 });
    expect((await listed()).hasUnpublishedChanges).toBe(true);

    const second = await agent.post(`/api/admin/pages/${id}/publish`).send({});
    expect(second.body).toEqual({ number: 2 });
    expect((await listed()).hasUnpublishedChanges).toBe(false);

    const versions = await agent.get(`/api/admin/pages/${id}/versions`);
    expect(versions.body.items.map((v: { number: number }) => v.number)).toEqual([2, 1]);
    expect(versions.body.items[1].note).toBe("Lần đầu");
    const one = await agent.get(`/api/admin/pages/${id}/versions/1`);
    expect(one.body.content).toEqual(content);
    expect((await agent.get(`/api/admin/pages/${id}/versions/9`)).status).toBe(404);
    expect((await agent.get(`/api/admin/pages/${id}/versions/abc`)).status).toBe(404);
    const audit = await prisma.auditLog.count({ where: { action: "content.publish" } });
    expect(audit).toBe(2);
  });

  it("calls the onPublished hook only after a successful publish", async () => {
    const paths: string[] = [];
    const { createApp } = await import("../src/app.js");
    const { makeTestConfig } = await import("./helpers.js");
    const hooked = createApp(
      { prisma, config: makeTestConfig(), logger: (await import("pino")).default({ level: "silent" }), clock: () => new Date() },
      { onPublished: (p) => paths.push(p) },
    );
    const { content } = await heroContent();
    const id = await makePage("/hooked", content);
    await createUser(prisma, { email: "h@istt.vn" });
    const agent = await loginAs(hooked, "h@istt.vn");
    await agent.post(`/api/admin/pages/99999/publish`).send({});
    expect(paths).toEqual([]);
    await agent.post(`/api/admin/pages/${id}/publish`).send({});
    expect(paths).toEqual(["/hooked"]);
  });

  it("rejects a 501 character note", async () => {
    const { content } = await heroContent();
    const id = await makePage("/p", content);
    const agent = await editor();
    const res = await agent.post(`/api/admin/pages/${id}/publish`).send({ note: "a".repeat(501) });
    expect(res.status).toBe(400);
    expect(await prisma.pageVersion.count()).toBe(0);
  });

  it("counts untranslated fields", async () => {
    const { content } = await heroContent("Tiêu đề", "");
    const id = await makePage("/p", content);
    const agent = await editor();
    const item = (await agent.get("/api/admin/pages")).body.items.find((p: { id: number }) => p.id === id);
    const translated = await heroContent("Tiêu đề", "Title");
    const baseId = await makePage("/q", translated.content);
    const base = (await agent.get("/api/admin/pages")).body.items.find((p: { id: number }) => p.id === baseId);
    expect(item.untranslatedCount).toBe(base.untranslatedCount + 1);
  });
});

describe("restore", () => {
  it("copies version 1 into the draft and keeps version 2 published", async () => {
    const { content } = await heroContent();
    const id = await makePage("/p", content);
    const agent = await editor();
    await agent.post(`/api/admin/pages/${id}/publish`).send({});
    const edited = structuredClone(content);
    edited.seo.title.vi = "Bản hai";
    await agent.put(`/api/admin/pages/${id}/draft`).send({ content: edited, revision: 1 });
    await agent.post(`/api/admin/pages/${id}/publish`).send({});

    const res = await agent.post(`/api/admin/pages/${id}/versions/1/restore`).send({});
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ revision: 3 });
    const detail = (await agent.get(`/api/admin/pages/${id}`)).body;
    expect(detail.draft.content).toEqual(content);
    expect(detail.published.number).toBe(2);
    expect(detail.published.content).toEqual(edited);
    const audit = await prisma.auditLog.findFirst({ where: { action: "content.restore" } });
    expect(audit?.metadata).toEqual({ number: 1 });
  });

  it("refuses a version whose media was deleted and leaves the draft untouched", async () => {
    const { content, mediaIds } = await heroContent();
    const id = await makePage("/p", content);
    const agent = await editor();
    await agent.post(`/api/admin/pages/${id}/publish`).send({});
    const edited = structuredClone(content);
    edited.seo.title.vi = "Khác";
    await agent.put(`/api/admin/pages/${id}/draft`).send({ content: edited, revision: 1 });
    await prisma.media.delete({ where: { id: BigInt(mediaIds[0]!) } });

    const res = await agent.post(`/api/admin/pages/${id}/versions/1/restore`).send({});
    expect(res.status).toBe(400);
    const draft = await prisma.pageDraft.findUniqueOrThrow({ where: { pageId: BigInt(id) } });
    expect(draft.revision).toBe(2);
    expect(draft.content).toEqual(edited);
  });

  it("returns 404 for a missing version", async () => {
    const { content } = await heroContent();
    const id = await makePage("/p", content);
    const agent = await editor();
    expect((await agent.post(`/api/admin/pages/${id}/versions/5/restore`).send({})).status).toBe(404);
  });
});

