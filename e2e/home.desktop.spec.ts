import { test } from "@playwright/test";
import { checkHome } from "./home-flow";

test.use({ viewport: { width: 1440, height: 800 } });

test("デスクトップ 1440×800 で各セクションへ到達できる", async ({ page }) => {
  await checkHome(page);
});
