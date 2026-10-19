import { test } from "@playwright/test";
import { checkHome } from "./home-flow";

test.use({ viewport: { width: 768, height: 1024 } });

test("タブレット 768×1024 で各セクションへ到達できる", async ({ page }) => {
  await checkHome(page);
});
