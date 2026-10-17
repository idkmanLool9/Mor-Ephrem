import { expect, test } from "@playwright/test";
const prefix = process.env.GITHUB_PAGES_TEST === "true" ? "/Mor-Ephrem" : "";

test("register toont een bruikbaar ledenpaneel zonder samenvattingswidgets", async ({
  page,
}) => {
  await page.goto(`${prefix}/leden/`);
  await expect(
    page.locator(
      ".members-page .stat-card, .members-page .workspace-stat, .members-page .dashboard-hero",
    ),
  ).toHaveCount(0);
  await expect(page.locator("tbody tr")).toHaveCount(10);
  const inspector = page.getByRole("complementary", {
    name: "Geselecteerd ledenprofiel",
  });
  await expect(
    inspector.getByRole("heading", { name: "Youssef Haddad" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Toon profiel van Sara Haddad", exact: true })
    .click();
  await expect(
    inspector.getByRole("heading", { name: "Sara Haddad" }),
  ).toBeVisible();
  await inspector
    .getByRole("button", { name: "Gegevens", exact: true })
    .click();
  await expect(
    inspector.getByText("Geboortedatum", { exact: true }),
  ).toBeVisible();
  await inspector
    .getByRole("button", { name: "Overzicht", exact: true })
    .click();
  await inspector.getByRole("button", { name: "Notitie toevoegen" }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Titel", { exact: true })
    .fill("Fictieve contactafspraak");
  await dialog
    .getByLabel("Notitietekst", { exact: true })
    .fill("Dit is een fictieve notitie vanuit het ledenpaneel.");
  await dialog.getByRole("button", { name: "Notitie opslaan" }).click();
  await expect(
    inspector.getByText("Fictieve contactafspraak", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Leden per pagina").selectOption("20");
  await expect(page.locator("tbody tr")).toHaveCount(20);
  await page.getByRole("button", { name: "Ledenpaneel sluiten" }).click();
  await expect(inspector).toHaveCount(0);
  await page.getByRole("button", { name: "Ledenpaneel openen" }).click();
  await expect(inspector).toBeVisible();
  for (const width of [1633, 820, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  }
});

test("algemene zoekbalk opent een echt ledenprofiel", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${prefix}/leden/`);
  await page.getByLabel("Zoek in de administratie").fill("Elias Ibrahim");
  await page
    .getByRole("link", { name: "Elias Ibrahim L-1006 · Oldenzaal" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Elias Ibrahim", exact: true }),
  ).toBeVisible();
});
