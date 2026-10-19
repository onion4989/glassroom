import { test } from "@playwright/test";
import { checkHome } from "./home-flow";

test.use({ viewport: { width: 390, height: 844 } });

test("モバイル 390×844 で各セクションへ到達できる", async ({ page }) => {
  await checkHome(page);
});
