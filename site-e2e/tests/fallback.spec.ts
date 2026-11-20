import { expect, test } from "@playwright/test";

const KEY = "istt_content:/contact";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("seeded")) {
      localStorage.setItem("i18nextLng", "vi");
      sessionStorage.setItem("seeded", "1");
    }
  });
});

test("API bị chặn: trang vẫn hiện tiêu đề lấy từ bản đóng gói sẵn", async ({ page }) => {
  await page.route("**/api/public/**", (route) => route.abort());
  await page.goto("/contact");
  await expect(page).toHaveTitle(/Hãy cùng Trao đổi/);
  await expect(page.getByRole("heading", { name: "Hãy cùng Trao đổi" })).toBeVisible();
});

test("JSON hỏng trong localStorage bị bỏ qua và xóa khóa", async ({ page }) => {
  await page.addInitScript((key) => {
    if (!sessionStorage.getItem("corrupted")) {
      localStorage.setItem(key, "{hỏng");
      sessionStorage.setItem("corrupted", "1");
    }
  }, KEY);
  await page.route("**/api/public/**", (route) => route.abort());
  await page.goto("/contact");
  await expect(page.getByRole("heading", { name: "Hãy cùng Trao đổi" })).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toBeNull();
});

test("khuôn sai (blocks không phải mảng) cũng bị xóa", async ({ page }) => {
  await page.addInitScript((key) => {
    if (!sessionStorage.getItem("corrupted")) {
      localStorage.setItem(key, JSON.stringify({ content: { seo: {}, blocks: "x" } }));
      sessionStorage.setItem("corrupted", "1");
    }
  }, KEY);
  await page.route("**/api/public/**", (route) => route.abort());
  await page.goto("/contact");
  await expect(page.getByRole("heading", { name: "Hãy cùng Trao đổi" })).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toBeNull();
});

test("API trả về thì nội dung được lưu vào localStorage", async ({ page }) => {
  await page.goto("/contact");
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), KEY)).not.toBeNull();
  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "{}"), KEY);
  expect(Array.isArray(saved.content.blocks)).toBe(true);
});

test("?lang=en chuyển website sang tiếng Anh", async ({ page }) => {
  await page.route("**/api/public/**", (route) => route.abort());
  await page.goto("/contact?lang=en");
  await expect(page).toHaveTitle(/Let's Connect/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("pick dùng vi khi en chỉ có khoảng trắng", async ({ page }) => {
  await page.route("**/api/public/**", (route) => route.abort());
  await page.goto("/contact");
  const result = await page.evaluate(() => {
    const pick = (window as unknown as { __cmsPick: (t: { vi: string; en: string }, l: "vi" | "en") => string })
      .__cmsPick;
    return [
      pick({ vi: "Xin chào", en: "   " }, "en"),
      pick({ vi: "Xin chào", en: "Hello" }, "en"),
      pick({ vi: "Xin chào", en: "Hello" }, "vi"),
    ];
  });
  expect(result).toEqual(["Xin chào", "Hello", "Xin chào"]);
});
