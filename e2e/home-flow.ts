import { expect, type Page } from "@playwright/test";

const shopAddr = "東京都〇〇〇区〇〇〇町1-1-2";

export async function checkHome(page: Page) {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "GLASSROOM" }),
  ).toBeVisible();

  const marks = [
    page.getByRole("heading", { name: "FREE FiT" }).first(),
    page.getByRole("region", { name: "形状記憶チタンフレーム" }),
    page.getByRole("heading", { name: /FREE FiT\s*の\s*特徴/ }),
    page.getByRole("region", { name: "機能性 × デザイン" }),
    page.getByRole("region", { name: "選べる3モデル" }),
    page.getByRole("region", { name: "製品詳細" }),
    page.getByRole("heading", { name: "累計販売本数" }).first(),
  ];

  for (const mark of marks) {
    await mark.scrollIntoViewIfNeeded();
    await expect(mark).toBeVisible();
  }

  const footer = page.locator("footer");
  await footer.scrollIntoViewIfNeeded();
  await expect(footer.locator("address").locator("visible=true")).toHaveText(
    shopAddr,
  );
}
