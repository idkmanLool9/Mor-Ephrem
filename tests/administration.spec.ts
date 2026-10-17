import { test, expect } from "@playwright/test";
test("dashboard and disabled future modules", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Dashboard", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Grafregister Binnenkort" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Begraafplaats Binnenkort" }),
  ).toBeDisabled();
  await page.getByRole("link", { name: /Lid ingeschreven/ }).click();
  await expect(
    page.getByRole("heading", { name: "Daniel Haddad" }),
  ).toBeVisible();
});
test("member search, combined filters, pagination and empty-state reset", async ({
  page,
}) => {
  await page.goto("/leden");
  await expect(page.locator("tbody tr")).toHaveCount(10);
  await page.getByRole("button", { name: "Volgende pagina" }).click();
  await expect(
    page.getByRole("button", { name: "Pagina 2", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.getByRole("textbox", { name: "Leden zoeken" }).fill("Haddad");
  await expect(page.locator("tbody tr")).toHaveCount(5);
  await page
    .getByLabel("Woonplaats", { exact: true })
    .selectOption("Oldenzaal");
  await page.getByLabel("Lidmaatschapsstatus").selectOption("Actief");
  await expect(page.locator("tbody tr")).toHaveCount(5);
  await page
    .getByRole("textbox", { name: "Leden zoeken" })
    .fill("bestaat-niet");
  await expect(
    page.getByRole("heading", { name: "Geen resultaten gevonden" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Filters wissen", exact: true })
    .last()
    .click();
  await expect(page.locator("tbody tr")).toHaveCount(10);
});
test("profile tabs and linked household", async ({ page }) => {
  await page.goto("/leden/L-1001");
  await expect(
    page.getByRole("heading", { name: "Youssef Haddad" }),
  ).toBeVisible();
  await page
    .getByRole("tab", { name: "Persoonsgegevens", exact: true })
    .click();
  await expect(page.getByRole("tabpanel")).toContainText("12 maart 1980");
  await page.getByRole("tab", { name: "Lidmaatschap", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText("14 juni 2023");
  await page.getByRole("tab", { name: "Logboek" }).click();
  await expect(page.getByRole("tabpanel")).toContainText(
    "Adresgegevens gecontroleerd",
  );
  await page.getByRole("tab", { name: "Gezin", exact: true }).click();
  await page.getByRole("link", { name: "Bekijk gezin" }).click();
  await expect(
    page.getByRole("heading", { name: "Familie Haddad" }),
  ).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(5);
  await page.getByRole("link", { name: /Anna Haddad/ }).click();
  await expect(
    page.getByRole("heading", { name: "Anna Haddad" }),
  ).toBeVisible();
});
test("household search and unknown dossiers", async ({ page }) => {
  await page.goto("/gezinnen");
  await page.getByRole("textbox", { name: "Gezinnen zoeken" }).fill("Karam");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page
    .getByRole("link", { name: "Bekijk Familie Karam", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Familie Karam" }),
  ).toBeVisible();
  const response = await page.goto("/leden/unknown");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Dossier niet gevonden" }),
  ).toBeVisible();
});
test("responsive workspace stays inside viewport", async ({ page }) => {
  for (const route of ["/", "/leden", "/leden/L-1001", "/gezinnen/G-001"]) {
    await page.goto(route);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Navigatie openen" }).click();
  await page.getByRole("link", { name: "Ledenregister", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Ledenregister" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
});
