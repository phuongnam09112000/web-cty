import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("i18nextLng", "vi"));
  await page.route("**/api/public/**", (route) => route.abort());
});

const scrollTop = () => Math.max(window.scrollY, document.documentElement.scrollTop, document.body.scrollTop);

test("trang chủ: nút lên đầu trang hiện khi cuộn xuống và đưa về đầu trang", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const button = page.locator('[aria-label="Cuộn lên đầu trang"]');
  await expect(button).toHaveCount(1);
  await expect(button).toBeHidden();
  await page.evaluate(() => {
    window.scrollTo(0, 1500);
    document.body.scrollTo(0, 1500);
  });
  await expect(button).toBeVisible();
  expect(await page.evaluate(scrollTop)).toBeGreaterThan(350);
  await button.click();
  await expect.poll(() => page.evaluate(scrollTop)).toBe(0);
});

test("trang liên hệ: không có nút lên đầu trang", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByRole("heading", { name: "Hãy cùng Trao đổi" })).toBeVisible();
  await expect(page.locator('[aria-label="Cuộn lên đầu trang"]')).toHaveCount(0);
});
