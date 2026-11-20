import type { Browser, Locator, Page } from "@playwright/test";
import { ADMIN_EMAIL, ADMIN_PASSWORD, NEW_PASSWORD, expect, test } from "./fixtures";

const ORIGIN = "http://localhost:5173";

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

async function openEditor(page: Page, name: string) {
  await page.goto("/pages");
  await page.getByRole("link", { name, exact: true }).click();
  await expect(page.getByRole("heading", { name })).toBeVisible();
}

function block(page: Page, id: string): Locator {
  return page.getByTestId(`block-${id}`);
}

async function expand(page: Page, id: string): Promise<Locator> {
  const card = block(page, id);
  await card.getByRole("button", { name: /(Sửa|Xem) nội dung/ }).click();
  return card;
}

function waitSave(page: Page) {
  return page.waitForResponse(
    (response) => /\/pages\/\d+\/draft$/.test(response.url()) && response.request().method() === "PUT",
  );
}

async function save(page: Page) {
  const response = waitSave(page);
  await page.getByRole("button", { name: "Lưu nháp" }).click();
  return response;
}

async function blockOrder(page: Page): Promise<string[]> {
  return page.locator("[data-block-id]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-block-id") ?? ""));
}

async function adminContext(browser: Browser) {
  const context = await browser.newContext({ baseURL: ORIGIN, locale: "vi-VN" });
  const page = await context.newPage();
  await loginAdmin(page);
  return { context, page };
}

test("danh sách trang hiện trạng thái và số chỗ chưa dịch", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/pages");
  for (const column of ["Tên trang", "Đường dẫn", "Trạng thái", "Chưa dịch"]) {
    await expect(page.getByRole("columnheader", { name: column })).toBeVisible();
  }
  const row = page.getByRole("row", { name: /Trang A/ });
  await expect(row.getByText("/mini-a")).toBeVisible();
  await expect(row.getByText("Đã xuất bản")).toBeVisible();
  await expect(row.getByText("4 chỗ chưa dịch")).toBeVisible();
});

test("sửa tiêu đề khối, lưu nháp, tải lại thấy giá trị mới và trạng thái chưa xuất bản", async ({ page }) => {
  await loginAdmin(page);
  await openEditor(page, "Sửa lưu");
  await expect(page.getByText("Đã xuất bản", { exact: true })).toBeVisible();
  const card = await expand(page, "saveban1");
  const unique = `Tiêu đề mới ${Date.now()}`;
  await card.getByLabel("Tiêu đề (VI)").fill(unique);
  const response = await save(page);
  expect(response.status()).toBe(200);
  await page.reload();
  const again = await expand(page, "saveban1");
  await expect(again.getByLabel("Tiêu đề (VI)")).toHaveValue(unique);
  await expect(page.getByText("Có thay đổi chưa xuất bản")).toBeVisible();
});

test("kéo khối 2 lên đầu rồi lưu thì giữ thứ tự mới", async ({ page }) => {
  await loginAdmin(page);
  await openEditor(page, "Sửa kéo");
  expect(await blockOrder(page)).toEqual(["dragban1", "dragvis2", "dragmis3"]);
  const handle = block(page, "dragvis2").getByRole("button", { name: "Kéo để sắp xếp" });
  await handle.focus();
  const live = page.locator("[id^='DndLiveRegion']");
  await page.keyboard.press("Space");
  await expect(live).toContainText("droppable area dragvis2");
  await page.keyboard.press("ArrowUp");
  await expect(live).toContainText("droppable area dragban1");
  await page.keyboard.press("Space");
  await expect.poll(() => blockOrder(page)).toEqual(["dragvis2", "dragban1", "dragmis3"]);
  const response = await save(page);
  expect(response.status()).toBe(200);
  await page.reload();
  await expect.poll(() => blockOrder(page)).toEqual(["dragvis2", "dragban1", "dragmis3"]);
});

test("ẩn khối rồi lưu thì khối giữ trạng thái ẩn", async ({ page }) => {
  await loginAdmin(page);
  await openEditor(page, "Sửa ẩn");
  const card = block(page, "hidevis2");
  await expect(card).toHaveAttribute("data-hidden", "false");
  await card.getByRole("button", { name: "Ẩn khối" }).click();
  await expect(card).toHaveAttribute("data-hidden", "true");
  const response = await save(page);
  expect(response.status()).toBe(200);
  await page.reload();
  await expect(block(page, "hidevis2")).toHaveAttribute("data-hidden", "true");
  await expect(block(page, "hidevis2").getByText("Đang ẩn")).toBeVisible();
  await expect(block(page, "hideban1")).toHaveAttribute("data-hidden", "false");
});

test("xóa chữ vi bắt buộc rồi lưu thì trường lỗi được tô đỏ", async ({ page }) => {
  await loginAdmin(page);
  await openEditor(page, "Sửa lỗi");
  const card = await expand(page, "invalidban1");
  const input = card.getByLabel("Tiêu đề (VI)");
  await input.fill("");
  const response = await save(page);
  expect(response.status()).toBe(400);
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(card.getByLabel("Tiêu đề (EN)")).not.toHaveAttribute("aria-invalid", "true");
  await expect(card.getByText("Có lỗi")).toBeVisible();
  await expect(block(page, "invalidvis2").getByText("Có lỗi")).toHaveCount(0);
});

test("ô EN trống hiện tag Chưa dịch cho đến khi nhập", async ({ page }) => {
  await loginAdmin(page);
  await openEditor(page, "Sửa lỗi");
  const card = await expand(page, "invalidban1");
  const field = card.getByTestId("blocks.0.data.subtitle");
  await expect(field.getByText("Chưa dịch")).toBeVisible();
  await card.getByLabel("Phụ đề (EN)").fill("Subtitle");
  await expect(field.getByText("Chưa dịch")).toHaveCount(0);
  await expect(card.getByText("0 chỗ chưa dịch")).toHaveCount(0);
});

test("hai người cùng sửa: người lưu sau thấy xung đột và có thể tải bản mới nhất", async ({ browser }) => {
  const a = await adminContext(browser);
  const b = await adminContext(browser);
  try {
    await openEditor(a.page, "Sửa xung đột");
    await openEditor(b.page, "Sửa xung đột");
    const cardA = await expand(a.page, "conflictban1");
    const cardB = await expand(b.page, "conflictban1");
    const valueA = `Bản của A ${Date.now()}`;
    await cardA.getByLabel("Tiêu đề (VI)").fill(valueA);
    expect((await save(a.page)).status()).toBe(200);
    await cardB.getByLabel("Tiêu đề (VI)").fill("Bản của B");
    expect((await save(b.page)).status()).toBe(409);
    await expect(b.page.getByText("Trang đã được người khác sửa")).toBeVisible();
    await expect(cardB.getByLabel("Tiêu đề (VI)")).toHaveValue("Bản của B");
    await b.page.getByRole("button", { name: "Tải bản mới nhất" }).click();
    await b.page.getByRole("button", { name: "Tải và bỏ thay đổi" }).click();
    await expect(b.page.getByText("Trang đã được người khác sửa")).toHaveCount(0);
    await expect(cardB.getByLabel("Tiêu đề (VI)")).toHaveValue(valueA);
  } finally {
    await a.context.close();
    await b.context.close();
  }
});

test("người chỉ có content.view không thấy nút Lưu nháp và ô nhập bị khóa", async ({ page, seeder }) => {
  const viewer = await seeder.seedUser({ roleName: "Chỉ xem nội dung", permissions: ["content.view"] });
  await login(page, viewer.email, viewer.password);
  await page.getByLabel("Mật khẩu hiện tại").fill(viewer.password);
  await page.getByLabel("Mật khẩu mới", { exact: true }).fill(NEW_PASSWORD);
  await page.getByLabel("Nhập lại mật khẩu mới").fill(NEW_PASSWORD);
  await page.getByRole("button", { name: "Đổi mật khẩu" }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole("menu").getByText("Trang", { exact: true }).click();
  await page.getByRole("link", { name: "Trang A", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Trang A" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Lưu nháp" })).toHaveCount(0);
  const card = await expand(page, "banner1");
  await expect(card.getByLabel("Tiêu đề (VI)")).toBeDisabled();
  await expect(card.getByRole("button", { name: "Ẩn khối" })).toHaveCount(0);
});

test("rời trang khi chưa lưu thì hiện hộp xác nhận", async ({ page }) => {
  await loginAdmin(page);
  await openEditor(page, "Sửa rời trang");
  const card = await expand(page, "leaveban1");
  await card.getByLabel("Tiêu đề (VI)").fill("Chưa lưu");
  await page.getByRole("menu").getByText("Tổng quan", { exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Chưa lưu thay đổi" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Ở lại" }).click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/pages\/\d+$/);
  await page.getByRole("menu").getByText("Tổng quan", { exact: true }).click();
  await page.getByRole("dialog", { name: "Chưa lưu thay đổi" }).getByRole("button", { name: "Rời trang" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("đóng tab khi chưa lưu kích hoạt cảnh báo beforeunload", async ({ page }) => {
  await loginAdmin(page);
  await openEditor(page, "Sửa rời trang");
  const card = await expand(page, "leaveban1");
  await card.getByLabel("Tiêu đề (VI)").fill("Chưa lưu lần hai");
  const dialogPromise = page.waitForEvent("dialog");
  await page.close({ runBeforeUnload: true });
  const dialog = await dialogPromise;
  expect(dialog.type()).toBe("beforeunload");
  await dialog.accept();
});

const NAME_VI = (index: number) => `blocks.0.data.items.${index}.name.vi`;

test("thêm, xóa, chuyển mục trong danh sách trong giới hạn rồi lưu và tải lại", async ({ page }) => {
  await loginAdmin(page);
  await openEditor(page, "Sửa danh sách");
  const card = await expand(page, "listval1");
  const add = card.getByRole("button", { name: "Thêm giá trị: Giá trị" });
  await expect(add).toBeEnabled();
  await add.click();
  await expect(add).toBeDisabled();
  await card.getByTestId(NAME_VI(5)).fill("Giá trị F");
  await card.getByTestId("blocks.0.data.items.5.description.vi").fill("Mô tả F");
  await card.getByRole("button", { name: "Chuyển Giá trị 1 xuống" }).click();
  await expect(card.getByTestId(NAME_VI(0))).toHaveValue("Giá trị B");
  await expect(card.getByTestId(NAME_VI(1))).toHaveValue("Giá trị A");
  await card.getByRole("button", { name: "Xóa Giá trị 3" }).click();
  await expect(add).toBeEnabled();
  expect((await save(page)).status()).toBe(200);
  await page.reload();
  const again = await expand(page, "listval1");
  const names = await Promise.all([0, 1, 2, 3, 4].map((i) => again.getByTestId(NAME_VI(i)).inputValue()));
  expect(names).toEqual(["Giá trị B", "Giá trị A", "Giá trị D", "Giá trị E", "Giá trị F"]);
  await expect(again.getByTestId(NAME_VI(5))).toHaveCount(0);
});

test("không xóa được dưới tối thiểu và văn phòng cố định hai mục không có nút thêm xóa", async ({ page }) => {
  await loginAdmin(page);
  await openEditor(page, "Sửa danh sách");
  const single = await expand(page, "listmin2");
  await expect(single.getByRole("button", { name: "Xóa Giá trị 1" })).toBeDisabled();
  const map = await expand(page, "listmap3");
  await expect(map.getByTestId("blocks.2.data.offices.1")).toBeVisible();
  await expect(map.getByRole("button", { name: /^(Thêm|Xóa|Chuyển)/ })).toHaveCount(0);
});

test("lỗi 400 lồng nhau rơi đúng ô nhập và biến mất khi sửa trước khi lưu", async ({ page }) => {
  await loginAdmin(page);
  await openEditor(page, "Sửa lỗi lồng");
  const card = await expand(page, "nestval1");
  const second = card.getByTestId(NAME_VI(1));
  await second.fill("");
  expect((await save(page)).status()).toBe(400);
  await expect(second).toHaveAttribute("aria-invalid", "true");
  await expect(card.getByTestId(NAME_VI(0))).not.toHaveAttribute("aria-invalid", "true");
  await expect(card.getByText("Có lỗi")).toBeVisible();
  await second.fill("Đã sửa");
  await expect(second).not.toHaveAttribute("aria-invalid", "true");
  await expect(card.getByText("Có lỗi")).toHaveCount(0);
});

test("xóa mục khác khi có lỗi thì không còn dấu đỏ sai chỗ và khối có lỗi vẫn thu gọn được", async ({ page }) => {
  await loginAdmin(page);
  await openEditor(page, "Sửa lỗi lồng");
  const card = await expand(page, "nestval1");
  await card.getByTestId(NAME_VI(1)).fill("");
  expect((await save(page)).status()).toBe(400);
  await expect(card.getByTestId(NAME_VI(1))).toHaveAttribute("aria-invalid", "true");
  await card.getByRole("button", { name: "Xóa Giá trị 1" }).click();
  await expect(card.locator("[aria-invalid='true']")).toHaveCount(0);
  await expect(card.getByText("Có lỗi")).toHaveCount(0);
  await card.getByRole("button", { name: /Thu gọn/ }).click();
  await expect(card.getByTestId(NAME_VI(0))).toHaveCount(0);
});

test("lỗi 400 ở tab SEO rơi đúng ô nhập", async ({ page }) => {
  await loginAdmin(page);
  await openEditor(page, "Sửa lỗi lồng");
  await page.getByRole("tab", { name: "SEO" }).click();
  const input = page.getByTestId("seo.title.vi");
  await input.fill("");
  expect((await save(page)).status()).toBe(400);
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByTestId("seo.description.vi")).not.toHaveAttribute("aria-invalid", "true");
  await input.fill("Tiêu đề mới");
  await expect(input).not.toHaveAttribute("aria-invalid", "true");
});
