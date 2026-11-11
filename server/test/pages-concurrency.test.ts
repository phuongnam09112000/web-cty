import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createUser, loginAs, makeTestApp, resetDb } from "./helpers.js";

const { app, prisma } = makeTestApp();

afterAll(async () => {
  await resetDb(prisma);
  await prisma.$disconnect();
});

beforeEach(async () => {
  await resetDb(prisma);
});

function contentWith(title: string) {
  return {
    seo: { title: { vi: title, en: "T" }, description: { vi: "D", en: "D" }, image: null },
    blocks: [],
  };
}

async function setup() {
  const before = contentWith("Trước");
  const page = await prisma.page.create({ data: { path: "/c", name: "Trang c" } });
  await prisma.pageDraft.create({ data: { pageId: page.id, content: before } });
  await createUser(prisma, { email: "a@istt.vn" });
  const agent = await loginAs(app, "a@istt.vn");
  return { id: Number(page.id), agent, before };
}

describe("concurrent publishing", () => {
  it("gives two simultaneous publishes distinct numbers 1 and 2", async () => {
    const { id, agent } = await setup();
    const results = await Promise.all([
      agent.post(`/api/admin/pages/${id}/publish`).send({}),
      agent.post(`/api/admin/pages/${id}/publish`).send({}),
    ]);
    expect(results.map((r) => r.status)).toEqual([200, 200]);
    expect(results.map((r) => r.body.number).sort()).toEqual([1, 2]);
    expect(await prisma.pageVersion.count()).toBe(2);
    const page = await prisma.page.findUniqueOrThrow({
      where: { id: BigInt(id) },
      include: { publishedVersion: true },
    });
    expect(page.publishedVersion?.number).toBe(2);
  });

  it("publishes either the pre-save or post-save draft when racing a save", async () => {
    const { id, agent, before } = await setup();
    const after = contentWith("Sau");
    const [save, publish] = await Promise.all([
      agent.put(`/api/admin/pages/${id}/draft`).send({ content: after, revision: 1 }),
      agent.post(`/api/admin/pages/${id}/publish`).send({}),
    ]);
    expect(save.status).toBe(200);
    expect(publish.status).toBe(200);
    const version = await prisma.pageVersion.findFirstOrThrow({ where: { pageId: BigInt(id) } });
    expect([before, after]).toContainEqual(version.content);
  });
});
