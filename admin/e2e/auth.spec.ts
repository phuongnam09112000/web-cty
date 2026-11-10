import type { Page } from "@playwright/test";
import { ADMIN_EMAIL, ADMIN_PASSWORD, NEW_PASSWORD, expect, test } from "./fixtures";

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
}

test("chưa đăng nhập vào /users thì chuyển về /login", async ({ page }) => {
  await page.goto("/users");
  await expect(page).toHaveURL(/\/login$/);
});

test("sai mật khẩu hiện thông báo lỗi", async ({ page }) => {
  await login(page, ADMIN_EMAIL, "SaiMatKhau@999");
  await expect(page.getByText("Email hoặc mật khẩu không đúng")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("quản trị viên đăng nhập thấy đủ 4 mục menu", async ({ page }) => {
  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await expect(page).toHaveURL(/\/$/);
  const menu = page.getByRole("menu");
  for (const label of ["Tổng quan", "Người dùng", "Vai trò & quyền", "Nhật ký hoạt động"]) {
    await expect(menu.getByText(label, { exact: true })).toBeVisible();
  }
});

test("người dùng mustChangePassword bị đưa tới /change-password rồi vào /", async ({ page, seeder }) => {
  const user = await seeder.seedUser();
  await login(page, user.email, user.password);
  await expect(page).toHaveURL(/\/change-password$/);
  await page.getByLabel("Mật khẩu hiện tại").fill(user.password);
  await page.getByLabel("Mật khẩu mới", { exact: true }).fill(user.password);
  await page.getByLabel("Nhập lại mật khẩu mới").fill(user.password);
  await page.getByRole("button", { name: "Đổi mật khẩu" }).click();
  await expect(page.getByText("Mật khẩu mới phải khác mật khẩu hiện tại")).toBeVisible();
  await expect(page).toHaveURL(/\/change-password$/);
  await page.getByLabel("Mật khẩu mới", { exact: true }).fill(NEW_PASSWORD);
  await page.getByLabel("Nhập lại mật khẩu mới").fill(NEW_PASSWORD);
  await page.getByRole("button", { name: "Đổi mật khẩu" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("menu").getByText("Tổng quan", { exact: true })).toBeVisible();
});

test("vai trò không quyền chỉ thấy Tổng quan và bị chặn ở /roles", async ({ page, seeder }) => {
  const user = await seeder.seedUser({ roleName: "Biên tập viên", permissions: [] });
  await login(page, user.email, user.password);
  await page.getByLabel("Mật khẩu hiện tại").fill(user.password);
  await page.getByLabel("Mật khẩu mới", { exact: true }).fill(NEW_PASSWORD);
  await page.getByLabel("Nhập lại mật khẩu mới").fill(NEW_PASSWORD);
  await page.getByRole("button", { name: "Đổi mật khẩu" }).click();
  await expect(page).toHaveURL(/\/$/);
  const menu = page.getByRole("menu");
  await expect(menu.getByText("Tổng quan", { exact: true })).toBeVisible();
  await expect(menu.getByText("Người dùng", { exact: true })).toHaveCount(0);
  await expect(menu.getByText("Vai trò & quyền", { exact: true })).toHaveCount(0);
  await expect(menu.getByText("Nhật ký hoạt động", { exact: true })).toHaveCount(0);
  await page.goto("/roles");
  await expect(page.getByText("Bạn không có quyền truy cập")).toBeVisible();
});

test("phiên bị xóa khi đang mở trang thì chuyển mục sẽ về /login", async ({ page, seeder }) => {
  const user = await seeder.seedUser({ roleName: "Quản lý người dùng", permissions: ["users.view"] });
  await login(page, user.email, user.password);
  await page.getByLabel("Mật khẩu hiện tại").fill(user.password);
  await page.getByLabel("Mật khẩu mới", { exact: true }).fill(NEW_PASSWORD);
  await page.getByLabel("Nhập lại mật khẩu mới").fill(NEW_PASSWORD);
  await page.getByRole("button", { name: "Đổi mật khẩu" }).click();
  await expect(page).toHaveURL(/\/$/);
  await seeder.deactivate(user.id);
  await page.getByRole("menu").getByText("Người dùng", { exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("đăng xuất về /login và nút Back không mở lại trang quản trị", async ({ page }) => {
  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole("menu").getByText("Người dùng", { exact: true }).click();
  await expect(page).toHaveURL(/\/users$/);
  await page.getByRole("button", { name: /Quản trị hệ thống/ }).click();
  await page.getByText("Đăng xuất", { exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("button", { name: "Đăng nhập" })).toBeVisible();
  await expect(page.getByRole("menu")).toHaveCount(0);
});

test("quyền bị thu hồi khi đang mở trang thì thao tác tiếp theo hiện trang không có quyền", async ({ page, seeder }) => {
  const user = await seeder.seedUser({ roleName: "Quản lý người dùng", permissions: ["users.view"] });
  await login(page, user.email, user.password);
  await page.getByLabel("Mật khẩu hiện tại").fill(user.password);
  await page.getByLabel("Mật khẩu mới", { exact: true }).fill(NEW_PASSWORD);
  await page.getByLabel("Nhập lại mật khẩu mới").fill(NEW_PASSWORD);
  await page.getByRole("button", { name: "Đổi mật khẩu" }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole("menu").getByText("Người dùng", { exact: true }).click();
  await expect(page.getByRole("button", { name: "Thêm người dùng" })).toHaveCount(0);
  await expect(page.getByText("Họ tên", { exact: true })).toBeVisible();
  await seeder.setRolePermissions(user.roleId, []);
  await page.getByTestId("status-filter").click();
  await page.locator(".ant-select-dropdown:visible").getByText("Đang hoạt động", { exact: true }).click();
  await expect(page.getByText("Bạn không có quyền truy cập")).toBeVisible();
});
