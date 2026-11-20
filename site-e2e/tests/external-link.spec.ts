import { expect, test } from "@playwright/test";
import { adminApi, createPreviewToken } from "./helpers";

test("liên kết CTA https hiện thành thẻ a ngoài trang, liên kết nội bộ vẫn là đường dẫn trong ứng dụng", async ({ page }) => {
  const url = "https://example.com/lien-he";
  const api = await adminApi();
  const token = await createPreviewToken(api, "/", (content) => {
    const hero = content.blocks.find((block) => block.type === "home-hero");
    const contact = content.blocks.find((block) => block.type === "home-contact");
    if (!hero || !contact) throw new Error("Thiếu khối trang chủ");
    (hero.data as { secondaryCta: { href: string } }).secondaryCta.href = url;
    (contact.data as { cta: { href: string } }).cta.href = url;
  });
  await api.dispose();

  await page.addInitScript(() => localStorage.setItem("i18nextLng", "vi"));
  await page.goto(`/?preview=${token}`);
  const external = page.locator(`a[href="${url}"]`);
  await expect(external).toHaveCount(2);
  await expect(external.first()).toHaveAttribute("target", "_blank");
  await expect(external.first()).toHaveAttribute("rel", "noopener noreferrer");
  await expect(page.locator('a[href="/about"]').first()).not.toHaveAttribute("target", /.+/);
  await expect(page.locator('a[href="#solutions"]')).toHaveCount(1);
});
