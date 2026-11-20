import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/public/**", (route) => route.abort());
});

test("nút banner ở /integration không gây lỗi khi trang không có form", async ({ page }) => {
  const errors: Error[] = [];
  page.on("pageerror", (error) => errors.push(error));
  await page.goto("/integration");
  const button = page.locator("main button, #root button").filter({ hasText: /Đặt lịch|Book|tư vấn|consult/i }).first();
  await expect(button).toBeVisible();
  await button.click();
  await page.waitForTimeout(500);
  expect(await page.locator("#contact-form").count()).toBe(0);
  expect(errors).toEqual([]);
});

test("nút banner ở trang giải pháp cuộn form liên hệ vào khung nhìn", async ({ page }) => {
  await page.goto("/secure-defense");
  const button = page.locator("#root button").filter({ hasText: /Đặt lịch|Book|tư vấn|consult/i }).first();
  await expect(button).toBeVisible();
  const form = page.locator("#contact-form");
  await expect(form).toHaveCount(1);
  await button.click();
  await expect
    .poll(async () => {
      const box = await form.boundingBox();
      const height = page.viewportSize()?.height ?? 0;
      return !!box && box.y < height && box.y + box.height > 0;
    })
    .toBe(true);
});
