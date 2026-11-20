import { randomUUID } from "node:crypto";
import type { APIRequestContext, Page } from "@playwright/test";
import { ADMIN_EMAIL, ADMIN_PASSWORD, expect, test } from "./fixtures";
import { uniquePng } from "./media-helpers";

async function loginAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Mật khẩu").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page).toHaveURL(/\/$/);
}

async function openLibrary(page: Page) {
  await page.getByRole("menu").getByText("Thư viện ảnh", { exact: true }).click();
  await expect(page.getByRole("heading", { name: "Thư viện ảnh" })).toBeVisible();
}

function uploadResponse(page: Page) {
  return page.waitForResponse((response) => /\/api\/admin\/media$/.test(response.url()) && response.request().method() === "POST");
}

async function seedImage(api: APIRequestContext, name: string) {
  const response = await api.post("/api/admin/media", {
    multipart: { file: { name, mimeType: "image/png", buffer: uniquePng() } },
  });
  expect(response.status()).toBe(201);
  return (await response.json()) as { id: number };
}

function newName(prefix: string) {
  return `${prefix}-${randomUUID().slice(0, 8)}.png`;
}

test("upload PNG thì ảnh xuất hiện trong lưới", async ({ page }) => {
  await loginAdmin(page);
  await openLibrary(page);
  const name = newName("tai-len");
  const response = uploadResponse(page);
  await page.locator("input[type=file]").setInputFiles({ name, mimeType: "image/png", buffer: uniquePng() });
  expect((await response).status()).toBe(201);
  await expect(page.getByTestId("media-grid").getByText(name, { exact: true })).toBeVisible();
});

test("upload file .txt thì hiện lỗi định dạng", async ({ page }) => {
  await loginAdmin(page);
  await openLibrary(page);
  const name = `${randomUUID().slice(0, 8)}.txt`;
  const response = uploadResponse(page);
  await page.locator("input[type=file]").setInputFiles({ name, mimeType: "text/plain", buffer: Buffer.from("xin chao") });
  expect((await response).status()).toBe(415);
  await expect(page.getByRole("alert").filter({ hasText: name })).toContainText("Định dạng ảnh không được hỗ trợ");
});

test("sửa mô tả ảnh rồi lưu thì giá trị được giữ", async ({ page, seeder }) => {
  const name = newName("sua-alt");
  await seedImage(seeder.api, name);
  await loginAdmin(page);
  await openLibrary(page);
  await page.getByPlaceholder("Tìm theo tên hoặc mô tả ảnh").fill(name);
  const card = page.getByTestId("media-grid").locator("[data-testid^='media-']").filter({ hasText: name });
  await card.getByRole("button", { name: `Sửa mô tả: ${name}` }).click();
  const dialog = page.getByRole("dialog", { name: "Sửa mô tả ảnh" });
  await dialog.getByLabel("Mô tả (VI)").fill("Mô tả tiếng Việt");
  await dialog.getByLabel("Mô tả (EN)").fill("English alt");
  const patched = page.waitForResponse((r) => /\/media\/\d+$/.test(r.url()) && r.request().method() === "PATCH");
  await dialog.getByRole("button", { name: "Lưu" }).click();
  expect((await patched).status()).toBe(200);
  await page.reload();
  await page.getByPlaceholder("Tìm theo tên hoặc mô tả ảnh").fill(name);
  await page.getByRole("button", { name: `Sửa mô tả: ${name}` }).click();
  const again = page.getByRole("dialog", { name: "Sửa mô tả ảnh" });
  await expect(again.getByLabel("Mô tả (VI)")).toHaveValue("Mô tả tiếng Việt");
  await expect(again.getByLabel("Mô tả (EN)")).toHaveValue("English alt");
});

test("xóa ảnh đang dùng thì báo lỗi kèm tên trang", async ({ page }) => {
  await loginAdmin(page);
  await openLibrary(page);
  await page.getByPlaceholder("Tìm theo tên hoặc mô tả ảnh").fill("a.png");
  await page.getByRole("button", { name: "Xóa: a.png" }).click();
  const conflict = page.waitForResponse((r) => /\/media\/\d+$/.test(r.url()) && r.request().method() === "DELETE");
  await page.getByRole("dialog", { name: "Xóa ảnh?" }).getByRole("button", { name: "Xóa" }).click();
  expect((await conflict).status()).toBe(409);
  const info = page.getByRole("dialog", { name: "Không thể xóa ảnh" });
  await expect(info).toContainText("Ảnh đang được dùng trong các trang");
  await expect(info.getByText("Trang A", { exact: true })).toBeVisible();
  await info.getByRole("button", { name: "Đóng" }).click();
  await expect(page.getByTestId("media-grid").getByText("a.png", { exact: true })).toBeVisible();
});

test("xóa ảnh chưa dùng thì biến mất khỏi lưới", async ({ page, seeder }) => {
  const name = newName("xoa");
  await seedImage(seeder.api, name);
  await loginAdmin(page);
  await openLibrary(page);
  await page.getByPlaceholder("Tìm theo tên hoặc mô tả ảnh").fill(name);
  await expect(page.getByTestId("media-grid").getByText(name, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: `Xóa: ${name}` }).click();
  const deleted = page.waitForResponse((r) => /\/media\/\d+$/.test(r.url()) && r.request().method() === "DELETE");
  await page.getByRole("dialog", { name: "Xóa ảnh?" }).getByRole("button", { name: "Xóa" }).click();
  expect((await deleted).status()).toBe(204);
  await expect(page.getByTestId("media-grid").getByText(name, { exact: true })).toHaveCount(0);
});

test("người không có media.manage chỉ xem thư viện, không thấy tải lên, sửa, xóa", async ({ page, seeder }) => {
  const viewer = await seeder.seedUser({ roleName: "Chỉ xem ảnh", permissions: ["content.view"] });
  await page.goto("/login");
  await page.getByLabel("Email").fill(viewer.email);
  await page.getByLabel("Mật khẩu").fill(viewer.password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.getByLabel("Mật khẩu hiện tại").fill(viewer.password);
  await page.getByLabel("Mật khẩu mới", { exact: true }).fill("MatKhauMoi@2026");
  await page.getByLabel("Nhập lại mật khẩu mới").fill("MatKhauMoi@2026");
  await page.getByRole("button", { name: "Đổi mật khẩu" }).click();
  await expect(page).toHaveURL(/\/$/);
  await openLibrary(page);
  await expect(page.getByTestId("media-grid")).toBeVisible();
  await expect(page.locator("input[type=file]")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^(Sửa mô tả|Xóa):/ })).toHaveCount(0);
});

test("trong form khối chọn ảnh mới bằng MediaPicker rồi lưu thì giữ ảnh mới", async ({ page, seeder }) => {
  const name = newName("chon-anh");
  await seedImage(seeder.api, name);
  await loginAdmin(page);
  await page.goto("/pages");
  await page.getByRole("link", { name: "Sửa chọn ảnh", exact: true }).click();
  const card = page.getByTestId("block-pickban1");
  await card.getByRole("button", { name: /(Sửa|Xem) nội dung/ }).click();
  await card.getByRole("button", { name: "Đổi ảnh: Ảnh nền" }).click();
  await page.getByRole("button", { name: `Chọn ${name}` }).click();
  await expect(card.getByText(name, { exact: true })).toBeVisible();
  const saved = page.waitForResponse((r) => /\/pages\/\d+\/draft$/.test(r.url()) && r.request().method() === "PUT");
  await page.getByRole("button", { name: "Lưu nháp" }).click();
  expect((await saved).status()).toBe(200);
  await page.reload();
  const again = page.getByTestId("block-pickban1");
  await again.getByRole("button", { name: /(Sửa|Xem) nội dung/ }).click();
  await expect(again.getByText(name, { exact: true })).toBeVisible();
});

test("upload ngay trong MediaPicker khi có media.manage rồi chọn ảnh vừa tải", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/pages");
  await page.getByRole("link", { name: "Sửa chọn ảnh", exact: true }).click();
  const card = page.getByTestId("block-pickban1");
  await card.getByRole("button", { name: /(Sửa|Xem) nội dung/ }).click();
  await card.getByRole("button", { name: /(Đổi|Chọn) ảnh: Ảnh nền/ }).click();
  const name = newName("trong-picker");
  const response = uploadResponse(page);
  await page.getByRole("dialog", { name: "Chọn ảnh" }).locator("input[type=file]").setInputFiles({ name, mimeType: "image/png", buffer: uniquePng() });
  expect((await response).status()).toBe(201);
  await page.getByRole("button", { name: `Chọn ${name}` }).click();
  await expect(card.getByText(name, { exact: true })).toBeVisible();
});
