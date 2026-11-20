import { expect, test } from "@playwright/test";
import { adminApi, createPreviewToken } from "./helpers";

test("xem trước: dải thông báo, tiêu đề nháp và không ghi localStorage", async ({ page }) => {
  const title = `Bản nháp ${Date.now()}`;
  const api = await adminApi();
  const token = await createPreviewToken(api, "/contact", (content) => {
    content.seo.title.vi = title;
    const form = content.blocks.find((block) => block.type === "contact-form");
    if (!form) throw new Error("Thiếu khối contact-form");
    (form.data as { heading: { lead: { vi: string } } }).heading.lead.vi = title;
  });
  await api.dispose();

  await page.addInitScript(() => localStorage.setItem("i18nextLng", "vi"));
  await page.goto(`/contact?preview=${token}`);
  await expect(page.getByText("Đang xem bản nháp")).toBeVisible();
  await expect(page).toHaveTitle(new RegExp(title));
  await expect(page.getByRole("heading", { name: new RegExp(title) })).toBeVisible();
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys).not.toContain("istt_content:/contact");
});

test("token xem trước sai: vẫn hiện bản đóng gói sẵn, không có dải thông báo", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("i18nextLng", "vi"));
  await page.goto("/contact?preview=khong-ton-tai");
  await expect(page.getByRole("heading", { name: "Hãy cùng Trao đổi" })).toBeVisible();
  await expect(page.getByText("Đang xem bản nháp")).toHaveCount(0);
});
