import { randomUUID } from "node:crypto";
import type { Page } from "@playwright/test";
import { ADMIN_EMAIL, ADMIN_PASSWORD, NEW_PASSWORD, expect, test, type Seeder } from "./fixtures";

type AuditItem = { id: number; action: string; createdAt: string; metadata: { email?: string } | null };

const ANOTHER_PASSWORD = "MatKhauKhac@2026";

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
}

function vietnamTime(iso: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(iso))
      .map((part) => [part.type, part.value]),
  );
  return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}`;
}

function utcDay(offsetDays: number) {
  const date = new Date(Date.now() + offsetDays * 86400000);
  return date.toISOString().slice(0, 10);
}

async function findCreateLog(seeder: Seeder, email: string) {
  const response = await seeder.api.get("/api/admin/audit-logs", { params: { action: "user.create", pageSize: 100 } });
  const body = (await response.json()) as { items: AuditItem[] };
  const item = body.items.find((entry) => entry.metadata?.email === email);
  if (!item) throw new Error("audit log not found");
  return item;
}

async function selectAction(page: Page, label: string) {
  await page.getByTestId("action-filter").click();
  await page.locator(".ant-select-dropdown:visible").getByText(label, { exact: true }).click();
}

async function openAudit(page: Page) {
  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/audit-logs");
  await expect(page.getByRole("columnheader", { name: "Hành động" })).toBeVisible();
}

test("nhật ký hiện dòng Tạo người dùng với người thực hiện và giờ Việt Nam", async ({ page, seeder }) => {
  const user = await seeder.seedUser();
  const log = await findCreateLog(seeder, user.email);
  await openAudit(page);
  await selectAction(page, "Tạo người dùng");
  const row = page.getByRole("row", { name: new RegExp(user.email) });
  await expect(row).toBeVisible();
  await expect(row.getByText("Tạo người dùng", { exact: true })).toBeVisible();
  await expect(row.getByText(ADMIN_EMAIL)).toBeVisible();
  await expect(row.getByText(vietnamTime(log.createdAt))).toBeVisible();
});

async function filtered(page: Page, params: Record<string, string>, interact: () => Promise<void>) {
  const response = page.waitForResponse((r) => {
    if (!r.url().includes("/api/admin/audit-logs") || r.request().method() !== "GET") return false;
    const query = new URL(r.url()).searchParams;
    return Object.entries(params).every(([key, value]) => query.get(key) === value);
  });
  await interact();
  const result = await response;
  expect(result.ok()).toBe(true);
  return (await result.json()) as { items: AuditItem[]; total: number };
}

async function expectAbsent(page: Page, email: string, body: { items: AuditItem[] }) {
  expect(body.items.some((entry) => entry.metadata?.email === email)).toBe(false);
  await expect(page.locator(".ant-table-wrapper .ant-spin-spinning")).toHaveCount(0);
  if (body.items.length === 0) await expect(page.locator(".ant-table-wrapper .ant-empty")).toBeVisible();
  else await expect(page.locator("tbody tr.ant-table-row").first()).toBeVisible();
  await expect(page.getByRole("row", { name: new RegExp(email) })).toHaveCount(0);
}

test("lọc theo hành động và khoảng ngày thu hẹp kết quả", async ({ page, seeder }) => {
  const user = await seeder.seedUser();
  await openAudit(page);
  await selectAction(page, "Tạo người dùng");
  const row = page.getByRole("row", { name: new RegExp(user.email) });
  await expect(row).toBeVisible();

  const failed = await filtered(page, { action: "auth.login_failed" }, () => selectAction(page, "Đăng nhập thất bại"));
  expect(failed.items.every((entry) => entry.action === "auth.login_failed")).toBe(true);
  await expectAbsent(page, user.email, failed);

  await filtered(page, { action: "user.create" }, () => selectAction(page, "Tạo người dùng"));
  await expect(row).toBeVisible();

  const future = await filtered(page, { action: "user.create", from: utcDay(1) }, () =>
    page.getByLabel("Từ ngày").fill(utcDay(1)),
  );
  await expectAbsent(page, user.email, future);
  await expect(page.locator(".ant-table-wrapper .ant-empty")).toBeVisible();

  await filtered(page, { action: "user.create", from: utcDay(-1) }, () => page.getByLabel("Từ ngày").fill(utcDay(-1)));
  await filtered(page, { action: "user.create", from: utcDay(-1), to: utcDay(1) }, () =>
    page.getByLabel("Đến ngày").fill(utcDay(1)),
  );
  await expect(row).toBeVisible();

  await filtered(page, { action: "user.create", from: utcDay(-1), to: utcDay(-2) }, () =>
    page.getByLabel("Đến ngày").fill(utcDay(-2)),
  );
  const past = await filtered(page, { action: "user.create", from: utcDay(-3), to: utcDay(-2) }, () =>
    page.getByLabel("Từ ngày").fill(utcDay(-3)),
  );
  await expectAbsent(page, user.email, past);
  await expect(page.locator(".ant-table-wrapper .ant-empty")).toBeVisible();
});

test("tài khoản của tôi: đổi họ tên cập nhật góc phải; đổi mật khẩu báo lỗi rồi thành công", async ({
  page,
  seeder,
}) => {
  const user = await seeder.seedUser();
  await login(page, user.email, user.password);
  await page.getByLabel("Mật khẩu hiện tại").fill(user.password);
  await page.getByLabel("Mật khẩu mới", { exact: true }).fill(NEW_PASSWORD);
  await page.getByLabel("Nhập lại mật khẩu mới").fill(NEW_PASSWORD);
  await page.getByRole("button", { name: "Đổi mật khẩu" }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.getByRole("button", { name: /Người dùng/ }).click();
  await page.getByText("Tài khoản của tôi", { exact: true }).click();
  await expect(page).toHaveURL(/\/account$/);
  const newName = `Tên mới ${randomUUID().slice(0, 8)}`;
  await page.getByLabel("Họ tên").fill(newName);
  const saved = page.waitForResponse((r) => r.url().endsWith("/auth/me") && r.request().method() === "PATCH");
  await page.getByRole("button", { name: "Lưu thay đổi" }).click();
  expect((await saved).ok()).toBe(true);
  await expect(page.getByRole("banner").getByText(newName)).toBeVisible();

  await page.getByLabel("Mật khẩu hiện tại").fill("SaiMatKhau@12345");
  await page.getByLabel("Mật khẩu mới", { exact: true }).fill(ANOTHER_PASSWORD);
  await page.getByLabel("Nhập lại mật khẩu mới").fill(ANOTHER_PASSWORD);
  const rejected = page.waitForResponse((r) => r.url().endsWith("/auth/change-password"));
  await page.getByRole("button", { name: "Đổi mật khẩu" }).click();
  expect((await rejected).status()).toBe(400);
  await expect(
    page.locator(".ant-form-item").filter({ has: page.getByLabel("Mật khẩu hiện tại") }).locator(".ant-form-item-explain-error"),
  ).toBeVisible();

  await page.getByLabel("Mật khẩu hiện tại").fill(NEW_PASSWORD);
  const accepted = page.waitForResponse((r) => r.url().endsWith("/auth/change-password"));
  await page.getByRole("button", { name: "Đổi mật khẩu" }).click();
  expect((await accepted).ok()).toBe(true);
  await expect(page.locator(".ant-message-success")).toBeVisible();

  await page.getByRole("button", { name: new RegExp(newName) }).click();
  await page.getByText("Đăng xuất", { exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await login(page, user.email, ANOTHER_PASSWORD);
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("banner").getByText(newName)).toBeVisible();
});
