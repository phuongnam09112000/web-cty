import type { Browser, Page } from "@playwright/test";
import { ADMIN_EMAIL, ADMIN_PASSWORD, NEW_PASSWORD, expect, test } from "./fixtures";

const ORIGIN = "http://localhost:5173";

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
}

async function loginTemporary(page: Page, email: string, password: string) {
  await login(page, email, password);
  await page.getByLabel("Mật khẩu hiện tại").fill(password);
  await page.getByLabel("Mật khẩu mới", { exact: true }).fill(NEW_PASSWORD);
  await page.getByLabel("Nhập lại mật khẩu mới").fill(NEW_PASSWORD);
  await page.getByRole("button", { name: "Đổi mật khẩu" }).click();
  await expect(page).toHaveURL(/\/$/);
}

async function adminPage(browser: Browser) {
  const context = await browser.newContext({ baseURL: ORIGIN, locale: "vi-VN" });
  const page = await context.newPage();
  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await expect(page).toHaveURL(/\/$/);
  return { context, page };
}

async function openEditor(page: Page, name: string) {
  await page.goto("/pages");
  await page.getByRole("link", { name, exact: true }).click();
  await expect(page.getByRole("heading", { name })).toBeVisible();
}

async function expandBanner(page: Page, id: string) {
  const card = page.getByTestId(`block-${id}`);
  await card.getByRole("button", { name: /(Sửa|Xem) nội dung/ }).click();
  return card;
}

function waitPublish(page: Page) {
  return page.waitForResponse(
    (response) => /\/pages\/\d+\/publish$/.test(response.url()) && response.request().method() === "POST",
  );
}

function waitSave(page: Page) {
  return page.waitForResponse(
    (response) => /\/pages\/\d+\/draft$/.test(response.url()) && response.request().method() === "PUT",
  );
}

test("sửa rồi xuất bản có ghi chú thì trạng thái thành Đã xuất bản và lịch sử có dòng mới", async ({ browser }) => {
  const { context, page } = await adminPage(browser);
  try {
    await openEditor(page, "Sửa xuất bản");
    const card = await expandBanner(page, "pubban1");
    await card.getByLabel("Tiêu đề (VI)").fill(`Tiêu đề xuất bản ${Date.now()}`);
    const note = `Ghi chú ${Date.now()}`;
    await page.getByRole("button", { name: "Xuất bản", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Xuất bản trang" });
    await dialog.getByLabel("Ghi chú").fill(note);
    const saved = waitSave(page);
    const published = waitPublish(page);
    await dialog.getByRole("button", { name: "Xuất bản", exact: true }).click();
    expect((await saved).status()).toBe(200);
    expect((await published).status()).toBe(200);
    await expect(page.getByText("Đã xuất bản", { exact: true })).toBeVisible();
    await page.getByRole("tab", { name: "Lịch sử" }).click();
    const row = page.getByRole("row", { name: new RegExp(note) });
    await expect(row).toBeVisible();
    await expect(row.getByText("Quản trị hệ thống")).toBeVisible();
    await expect(row.getByText(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/)).toBeVisible();
  } finally {
    await context.close();
  }
});

test("Xem trước mở tab mới có URL chứa ?preview=", async ({ browser }) => {
  const { context, page } = await adminPage(browser);
  try {
    await context.route("http://localhost:3100/**", (route) =>
      route.fulfill({ status: 200, contentType: "text/html", body: "<html><body>preview</body></html>" }),
    );
    await openEditor(page, "Sửa xem trước");
    const card = await expandBanner(page, "prevban1");
    await card.getByLabel("Tiêu đề (VI)").fill(`Xem trước ${Date.now()}`);
    const saved = waitSave(page);
    const popupPromise = context.waitForEvent("page");
    await page.getByRole("button", { name: "Xem trước" }).click();
    expect((await saved).status()).toBe(200);
    const popup = await popupPromise;
    await expect(popup).toHaveURL(/^http:\/\/localhost:3100\/editor-preview\?preview=/);
  } finally {
    await context.close();
  }
});

test("khôi phục bản 1 đưa bản nháp về bản 1 và trạng thái có thay đổi chưa xuất bản", async ({ browser }) => {
  const { context, page } = await adminPage(browser);
  try {
    await openEditor(page, "Sửa khôi phục");
    const card = await expandBanner(page, "restban1");
    const original = await card.getByLabel("Tiêu đề (VI)").inputValue();
    await card.getByLabel("Tiêu đề (VI)").fill(`Bản hai ${Date.now()}`);
    await page.getByRole("button", { name: "Xuất bản", exact: true }).click();
    const published = waitPublish(page);
    await page.getByRole("dialog", { name: "Xuất bản trang" }).getByRole("button", { name: "Xuất bản", exact: true }).click();
    expect((await published).status()).toBe(200);
    await expect(page.getByText("Đã xuất bản", { exact: true })).toBeVisible();
    await page.getByRole("tab", { name: "Lịch sử" }).click();
    const rowOne = page.getByRole("row").filter({ has: page.getByRole("cell", { name: "1", exact: true }) });
    await rowOne.getByRole("button", { name: "Xem" }).click();
    const viewer = page.getByRole("dialog", { name: "Phiên bản 1" });
    await expect(viewer.getByRole("button", { name: "Ẩn khối" })).toHaveCount(0);
    await viewer.getByRole("button", { name: "Đóng" }).first().click();
    await rowOne.getByRole("button", { name: "Khôi phục" }).click();
    const restored = page.waitForResponse(
      (response) => /\/versions\/1\/restore$/.test(response.url()) && response.request().method() === "POST",
    );
    await page.getByRole("dialog", { name: "Khôi phục phiên bản 1?" }).getByRole("button", { name: "Khôi phục" }).click();
    expect((await restored).status()).toBe(200);
    await expect(page.getByText("Có thay đổi chưa xuất bản")).toBeVisible();
    await page.getByRole("tab", { name: "Nội dung" }).click();
    const again = page.getByTestId("block-restban1");
    const open = again.getByRole("button", { name: "Sửa nội dung" });
    if ((await open.count()) > 0) await open.click();
    await expect(again.getByLabel("Tiêu đề (VI)")).toHaveValue(original);
  } finally {
    await context.close();
  }
});

test("người không có content.publish không thấy nút Xuất bản và Khôi phục", async ({ page, seeder }) => {
  const editor = await seeder.seedUser({ roleName: "Biên tập không xuất bản", permissions: ["content.edit"] });
  await loginTemporary(page, editor.email, editor.password);
  await openEditor(page, "Sửa quyền xuất bản");
  await expect(page.getByRole("button", { name: "Lưu nháp" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Xuất bản", exact: true })).toHaveCount(0);
  await page.getByRole("tab", { name: "Lịch sử" }).click();
  await expect(page.getByRole("button", { name: "Xem" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Khôi phục" })).toHaveCount(0);
});

test("phiên bị thu hồi khi đang sửa dở thì hành động tiếp theo chuyển về đăng nhập không bị chặn", async ({ page, seeder }) => {
  const editor = await seeder.seedUser({ roleName: "Biên tập phiên hết hạn", permissions: ["content.edit"] });
  await loginTemporary(page, editor.email, editor.password);
  await openEditor(page, "Sửa hết phiên");
  const card = await expandBanner(page, "expban1");
  await card.getByLabel("Tiêu đề (VI)").fill("Sửa dở dang");
  await seeder.deactivate(editor.id);
  await page.getByRole("button", { name: "Lưu nháp" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("dialog", { name: "Chưa lưu thay đổi" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Đăng nhập" })).toBeVisible();
});
