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

async function loginAdmin(page: Page) {
  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await expect(page).toHaveURL(/\/$/);
}

async function createRole(seeder: Seeder, name: string, description?: string) {
  const created = await seeder.api.post("/api/admin/roles", { data: { name, description } });
  return ((await created.json()) as RoleItem).id;
}

async function savePermissions(page: Page) {
  const saved = page.waitForResponse(
    (response) =>
      /\/roles\/\d+\/permissions$/.test(response.url()) && response.request().method() === "PUT" && response.ok(),
  );
  await page.getByRole("button", { name: "Lưu" }).click();
  await saved;
}

function roleRow(page: Page, name: string) {
  return page.getByRole("row", { name: new RegExp(name) });
}

test("danh sách hiện tên, mô tả, số người dùng và nhãn Hệ thống", async ({ page, seeder }) => {
  const suffix = randomUUID().slice(0, 8);
  const name = `Vai trò danh sách ${suffix}`;
  const description = `Mô tả ${suffix}`;
  const roleId = await createRole(seeder, name, description);
  await seeder.api.post("/api/admin/users", {
    data: { email: `r-${suffix}@istt.vn`, fullName: `Thành viên ${suffix}`, roleId },
  });
  await loginAdmin(page);
  await page.goto("/roles");
  for (const column of ["Tên vai trò", "Mô tả", "Số người dùng"]) {
    await expect(page.getByRole("columnheader", { name: column })).toBeVisible();
  }
  const row = roleRow(page, name);
  await expect(row.getByText(description)).toBeVisible();
  await expect(row.getByRole("cell", { name: "1", exact: true })).toBeVisible();
  const system = page.getByRole("row").filter({ has: page.getByText("Hệ thống", { exact: true }) });
  await expect(system).toHaveCount(1);
});

test("tạo vai trò, tick quyền theo nhóm, lưu và tải lại vẫn giữ", async ({ page }) => {
  const suffix = randomUUID().slice(0, 8);
  const name = `Biên tập viên nội dung ${suffix}`;
  await loginAdmin(page);
  await page.goto("/roles");
  await page.getByRole("button", { name: "Thêm vai trò" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Tên vai trò").fill(name);
  await dialog.getByLabel("Mô tả").fill("Quản lý nội dung");
  await dialog.getByRole("button", { name: "Lưu" }).click();
  await expect(roleRow(page, name)).toBeVisible();

  await roleRow(page, name).getByRole("link", { name: "Phân quyền" }).click();
  await expect(page).toHaveURL(/\/roles\/\d+$/);
  for (const module of ["Người dùng", "Vai trò", "Nhật ký"]) {
    await expect(page.getByTestId(`module-${module}`)).toBeVisible();
  }
  const box = page.getByRole("checkbox", { name: "Xem danh sách người dùng" });
  await expect(box).not.toBeChecked();
  await box.check();
  await savePermissions(page);
  await expect(page.locator(".ant-message-success").last()).toBeVisible();
  await page.reload();
  await expect(page.getByRole("checkbox", { name: "Xem danh sách người dùng" })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Xem nhật ký hoạt động" })).not.toBeChecked();
});

test("quyền của người dùng khác đổi ngay ở lần tải tiếp theo", async ({ page, browser, seeder }) => {
  const member = await seeder.seedUser({ roleName: "Vai trò theo dõi" });
  const rolesResponse = await seeder.api.get("/api/admin/roles");
  const roles = (await rolesResponse.json()) as RoleItem[];
  const memberUser = await (await seeder.api.get(`/api/admin/users/${member.id}`)).json();
  const roleId = (memberUser as { role: { id: number } }).role.id;
  expect(roles.some((role) => role.id === roleId)).toBe(true);

  const otherContext = await browser.newContext({ locale: "vi-VN" });
  const other = await otherContext.newPage();
  await login(other, member.email, member.password);
  await other.getByLabel("Mật khẩu hiện tại").fill(member.password);
  await other.getByLabel("Mật khẩu mới", { exact: true }).fill(NEW_PASSWORD);
  await other.getByLabel("Nhập lại mật khẩu mới").fill(NEW_PASSWORD);
  await other.getByRole("button", { name: "Đổi mật khẩu" }).click();
  await expect(other).toHaveURL(/\/$/);
  await expect(other.getByRole("menu").getByText("Người dùng", { exact: true })).toHaveCount(0);

  await loginAdmin(page);
  await page.goto(`/roles/${roleId}`);
  await page.getByRole("checkbox", { name: "Xem danh sách người dùng" }).check();
  await savePermissions(page);
  await expect(page.locator(".ant-message-success").last()).toBeVisible();

  await other.reload();
  await expect(other.getByRole("menu").getByText("Người dùng", { exact: true })).toBeVisible();

  await page.getByRole("checkbox", { name: "Xem danh sách người dùng" }).uncheck();
  await savePermissions(page);

  await other.goto("/users");
  await expect(other.getByText("Bạn không có quyền truy cập")).toBeVisible();
  await otherContext.close();
});

test("vai trò hệ thống: ô tick bị khóa, đã tick, không có Sửa, Xóa", async ({ page, seeder }) => {
  const roles = (await (await seeder.api.get("/api/admin/roles")).json()) as RoleItem[];
  const system = roles.find((role) => role.isSystem)!;
  await loginAdmin(page);
  await page.goto("/roles");
  const row = roleRow(page, system.name);
  await expect(row.getByRole("button", { name: "Sửa" })).toHaveCount(0);
  await expect(row.getByRole("button", { name: "Xóa" })).toHaveCount(0);
  await page.goto(`/roles/${system.id}`);
  const boxes = page.getByRole("checkbox");
  await expect(boxes.first()).toBeVisible();
  const count = await boxes.count();
  expect(count).toBeGreaterThanOrEqual(4);
  for (let index = 0; index < count; index += 1) {
    await expect(boxes.nth(index)).toBeChecked();
    await expect(boxes.nth(index)).toBeDisabled();
  }
  await expect(page.getByRole("button", { name: "Lưu" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Sửa" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Xóa" })).toHaveCount(0);
});

test("xóa vai trò còn người dùng báo lỗi server; xóa vai trò trống thì biến mất", async ({ page, seeder }) => {
  const suffix = randomUUID().slice(0, 8);
  const busyName = `Vai trò bận ${suffix}`;
  const emptyName = `Vai trò trống ${suffix}`;
  const busyId = await createRole(seeder, busyName);
  await createRole(seeder, emptyName);
  await seeder.api.post("/api/admin/users", {
    data: { email: `b-${suffix}@istt.vn`, fullName: `Người bận ${suffix}`, roleId: busyId },
  });
  await loginAdmin(page);
  await page.goto("/roles");

  await roleRow(page, busyName).getByRole("button", { name: "Xóa" }).click();
  await page.locator(".ant-popconfirm:visible").getByRole("button", { name: "Đồng ý" }).click();
  await expect(page.locator(".ant-message-error")).toBeVisible();
  await expect(roleRow(page, busyName)).toBeVisible();
  await expect(page.locator(".ant-popconfirm:visible")).toHaveCount(0);

  await roleRow(page, emptyName).getByRole("button", { name: "Xóa" }).click();
  await page.locator(".ant-popconfirm:visible").getByRole("button", { name: "Đồng ý" }).click();
  await expect(roleRow(page, emptyName)).toHaveCount(0);
});

test("sửa tên và mô tả vai trò; tên trùng báo lỗi dưới ô tên", async ({ page, seeder }) => {
  const suffix = randomUUID().slice(0, 8);
  const first = `Vai trò một ${suffix}`;
  const second = `Vai trò hai ${suffix}`;
  await createRole(seeder, first);
  await createRole(seeder, second);
  await loginAdmin(page);
  await page.goto("/roles");
  await roleRow(page, second).getByRole("button", { name: "Sửa" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Tên vai trò").fill(first);
  await dialog.getByRole("button", { name: "Lưu" }).click();
  await expect(dialog.locator(".ant-form-item-explain-error")).toBeVisible();
  const renamed = `Vai trò đổi ${suffix}`;
  await dialog.getByLabel("Tên vai trò").fill(renamed);
  await dialog.getByRole("button", { name: "Lưu" }).click();
  await expect(roleRow(page, renamed)).toBeVisible();
});
