import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const prefix = process.env.GITHUB_PAGES_TEST === "true" ? "/Mor-Ephrem" : "";

test("werkruimtes hebben leesbaar tekstcontrast en passen binnen het scherm", async ({ page }) => {
  test.setTimeout(90_000);
  for (const route of ["/", "/leden/", "/leden/L-1001/", "/leden/nieuw/", "/dossiers/", "/documenten/"]) {
    await page.goto(`${prefix}${route}`);
    await page.evaluate(() => document.fonts.ready);
    const result = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
    expect(result.violations, `Tekstcontrast op ${route}`).toEqual([]);
    const dimensions = await page.evaluate(() => ({
      content: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));
    expect(dimensions.content, `Schermbreedte op ${route}`).toBeLessThanOrEqual(dimensions.viewport);
  }
});
