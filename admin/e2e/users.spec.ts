import { randomUUID } from "node:crypto";
import type { Page } from "@playwright/test";
import { ADMIN_EMAIL, ADMIN_PASSWORD, NEW_PASSWORD, expect, test, type Seeder } from "./fixtures";

type RoleItem = { id: number; name: string; isSystem: boolean };

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
}

async function openUsers(page: Page) {
  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/users");
  await expect(page.getByRole("button", { name: "Thêm người dùng" })).toBeVisible();
}

async function createRole(seeder: Seeder, name: string) {
  const created = await seeder.api.post("/api/admin/roles", { data: { name } });
  return ((await created.json()) as RoleItem).id;
}

async function createUser(seeder: Seeder, fullName: string, roleId: number) {
  const email = `u-${randomUUID().slice(0, 8)}@istt.vn`;
  const created = await seeder.api.post("/api/admin/users", { data: { email, fullName, roleId } });
  const body = (await created.json()) as { user: { id: number } };
  return { id: body.user.id, email, fullName };
}

async function search(page: Page, text: string) {
  const box = page.getByPlaceholder("Tìm theo tên hoặc email");
  await box.fill(text);
  await box.press("Enter");
}

test("bảng có đủ cột, tìm kiếm và lọc theo vai trò, trạng thái", async ({ page, seeder }) => {
  const suffix = randomUUID().slice(0, 8);
  const roleName = `Vai trò lọc ${suffix}`;
  const roleId = await createRole(seeder, roleName);
  const anh = await createUser(seeder, `Nguyễn Thị Ánh ${suffix}`, roleId);
  const other = await createUser(seeder, `Trần Văn Bình ${suffix}`, roleId);
  await seeder.api.patch(`/api/admin/users/${other.id}`, { data: { isActive: false } });
  await openUsers(page);
  for (const column of ["Họ tên", "Email", "Vai trò", "Trạng thái", "Đăng nhập lần cuối"]) {
    await expect(page.getByRole("columnheader", { name: column })).toBeVisible();
  }
  await search(page, `ánh ${suffix}`);
  await expect(page.getByRole("row", { name: new RegExp(anh.fullName) })).toBeVisible();
  await expect(page.getByRole("row", { name: new RegExp(other.fullName) })).toHaveCount(0);
  await expect(page.getByRole("row", { name: new RegExp(anh.fullName) }).getByText("Chưa đăng nhập")).toBeVisible();

  await search(page, suffix);
  await expect(page.getByRole("row", { name: new RegExp(other.fullName) })).toBeVisible();
  await page.getByTestId("role-filter").click();
  await page.locator(".ant-select-dropdown:visible").getByText(roleName, { exact: true }).click();
  await expect(page.getByRole("row", { name: new RegExp(anh.fullName) })).toBeVisible();
  await page.getByTestId("status-filter").click();
  await page.locator(".ant-select-dropdown:visible").getByText("Đã vô hiệu hóa", { exact: true }).click();
  await expect(page.getByRole("row", { name: new RegExp(other.fullName) })).toBeVisible();
  await expect(page.getByRole("row", { name: new RegExp(anh.fullName) })).toHaveCount(0);
});

test("thêm người dùng hiện mật khẩu tạm và người mới xuất hiện; email trùng báo lỗi dưới ô Email", async ({
  page,
  seeder,
}) => {
  const suffix = randomUUID().slice(0, 8);
  const roleName = `Vai trò thêm ${suffix}`;
  await createRole(seeder, roleName);
  const email = `moi-${suffix}@istt.vn`;
  const fullName = `Lê Thị Mới ${suffix}`;
  await openUsers(page);
  await page.getByRole("button", { name: "Thêm người dùng" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Họ tên").fill(fullName);
  await dialog.getByLabel("Email").fill(email);
  await dialog.getByLabel("Vai trò").click();
  await page.locator(".ant-select-dropdown:visible").getByText(roleName, { exact: true }).click();
  await dialog.getByRole("button", { name: "Lưu" }).click();
  const passwordDialog = page.getByRole("dialog", { name: "Mật khẩu tạm thời" });
  await expect(passwordDialog.getByText("Mật khẩu này chỉ hiển thị một lần")).toBeVisible();
  await expect(passwordDialog.getByRole("button", { name: /Sao chép/ })).toBeVisible();
  await expect(passwordDialog.getByTestId("temporary-password")).not.toBeEmpty();
  await passwordDialog.getByRole("button", { name: "Đóng" }).first().click();
  await search(page, suffix);
  await expect(page.getByRole("row", { name: new RegExp(fullName) })).toBeVisible();

  await page.getByRole("button", { name: "Thêm người dùng" }).click();
  const again = page.getByRole("dialog");
  await again.getByLabel("Họ tên").fill("Người trùng email");
  await again.getByLabel("Email").fill(email);
  await again.getByLabel("Vai trò").click();
  await page.locator(".ant-select-dropdown:visible").getByText(roleName, { exact: true }).click();
  await again.getByRole("button", { name: "Lưu" }).click();
  await expect(again.locator(".ant-form-item").filter({ has: page.getByLabel("Email") }).locator(".ant-form-item-explain-error")).toBeVisible();
});

test("sửa vai trò, vô hiệu hóa, kích hoạt lại và đặt lại mật khẩu cập nhật bảng", async ({ page, seeder }) => {
  const suffix = randomUUID().slice(0, 8);
  const roleA = `Vai trò A ${suffix}`;
  const roleB = `Vai trò B ${suffix}`;
  const roleAId = await createRole(seeder, roleA);
  await createRole(seeder, roleB);
  const user = await createUser(seeder, `Phạm Văn Sửa ${suffix}`, roleAId);
  await openUsers(page);
  await search(page, suffix);
  const row = page.getByRole("row", { name: new RegExp(user.fullName) });
  await expect(row.getByText(roleA, { exact: true })).toBeVisible();

  await row.getByRole("button", { name: "Sửa" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.locator(".ant-select").click();
  await page.locator(".ant-select-dropdown:visible").getByText(roleB, { exact: true }).click();
  await dialog.getByRole("button", { name: "Lưu" }).click();
  await expect(row.getByText(roleB, { exact: true })).toBeVisible();

  await row.getByRole("button", { name: "Vô hiệu hóa" }).click();
  await page.getByRole("tooltip").getByRole("button", { name: "Đồng ý" }).click();
  await expect(row.getByText("Đã vô hiệu hóa")).toBeVisible();

  await row.getByRole("button", { name: "Kích hoạt" }).click();
  await expect(row.getByText("Đang hoạt động")).toBeVisible();

  await row.getByRole("button", { name: "Đặt lại mật khẩu" }).click();
  await page.getByRole("tooltip").getByRole("button", { name: "Đồng ý" }).click();
  const passwordDialog = page.getByRole("dialog", { name: "Mật khẩu tạm thời" });
  await expect(passwordDialog.getByText("Mật khẩu này chỉ hiển thị một lần")).toBeVisible();
  await expect(passwordDialog.getByTestId("temporary-password")).not.toBeEmpty();
});

test("thao tác bị 409 hiện thông báo lỗi của server", async ({ page }) => {
  await openUsers(page);
  await search(page, ADMIN_EMAIL);
  const row = page.getByRole("row", { name: new RegExp(ADMIN_EMAIL) });
  await row.getByRole("button", { name: "Vô hiệu hóa" }).click();
  await page.getByRole("tooltip").getByRole("button", { name: "Đồng ý" }).click();
  await expect(page.locator(".ant-message-error")).toBeVisible();
  await expect(row.getByText("Đang hoạt động")).toBeVisible();
});

test("người chỉ có users.view thấy bảng nhưng không thấy nút thao tác", async ({ page, seeder }) => {
  const viewer = await seeder.seedUser({ roleName: "Chỉ xem người dùng", permissions: ["users.view"] });
  await login(page, viewer.email, viewer.password);
  await page.getByLabel("Mật khẩu hiện tại").fill(viewer.password);
  await page.getByLabel("Mật khẩu mới", { exact: true }).fill(NEW_PASSWORD);
  await page.getByLabel("Nhập lại mật khẩu mới").fill(NEW_PASSWORD);
  await page.getByRole("button", { name: "Đổi mật khẩu" }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole("menu").getByText("Người dùng", { exact: true }).click();
  await expect(page.getByRole("columnheader", { name: "Họ tên" })).toBeVisible();
  await expect(page.getByRole("row", { name: new RegExp(viewer.email) })).toBeVisible();
  await expect(page.getByRole("button", { name: "Thêm người dùng" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Sửa" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Vô hiệu hóa" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Đặt lại mật khẩu" })).toHaveCount(0);
});
