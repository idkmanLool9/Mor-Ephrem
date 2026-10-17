import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
const prefix = process.env.GITHUB_PAGES_TEST === "true" ? "/Mor-Ephrem" : "";
const open = (page: Page, path: string) => page.goto(prefix + path);
async function pick(page: Page, ids: string[]) {
  for (const id of ids)
    await page
      .locator(`tbody tr`)
      .filter({ hasText: id })
      .getByRole("checkbox")
      .check();
}
test("central menu, examples and status filters remain stable after reload", async ({
  page,
}) => {
  await open(page, "/");
  await expect(
    page.getByRole("link", { name: "Dossiers", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Dossiers", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Dossiers", exact: true }),
  ).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(6);
  await page.reload();
  await expect(page.locator("tbody tr")).toHaveCount(6);
  await page
    .getByLabel("Centrale dossierstatus", { exact: true })
    .selectOption("Open");
  await expect(page.locator("tbody tr")).toHaveCount(2);
  await page
    .getByLabel("Soort eigenaar", { exact: true })
    .selectOption("member");
  await page
    .getByRole("textbox", { name: "Alle dossiers zoeken" })
    .fill("Elias inschrijving");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page
    .getByRole("button", {
      name: "Dossier openen: Inschrijving controleren (voorbeeld)",
      exact: true,
    })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Dossierstatus", { exact: true })
    .selectOption("Afgerond");
  await dialog.getByRole("button", { name: "Dossier opslaan" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Zoekopdracht en filters wissen" })
    .click();
  await expect(page.locator("tbody tr")).toHaveCount(6);
  await page
    .locator("tbody tr")
    .filter({ hasText: "Inschrijving controleren (voorbeeld)" })
    .getByRole("link", { name: /Elias Ibrahim/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "Elias Ibrahim", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: /Dossiers/ }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Afgerond");
});
test("central documents support owner search, preview and original downloads", async ({
  page,
}) => {
  await open(page, "/documenten/");
  await expect(page.locator("tbody tr")).toHaveCount(6);
  await page
    .getByLabel("Soort eigenaar", { exact: true })
    .selectOption("family");
  await expect(page.locator("tbody tr")).toHaveCount(3);
  await page
    .getByRole("textbox", { name: "Alle documenten zoeken" })
    .fill("Khoury welkom");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Voorbeeld van Fictieve-welkomstbrief.pdf" })
    .click();
  const dialog = page.getByRole("dialog", { name: "Documentvoorbeeld" });
  await expect(dialog.locator("iframe")).toHaveAttribute("src", /^blob:/);
  const downloadEvent = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Download", exact: true }).click();
  const download = await downloadEvent;
  expect(
    readFileSync((await download.path())!)
      .subarray(0, 5)
      .toString(),
  ).toBe("%PDF-");
  await dialog.getByRole("button", { name: "Venster sluiten" }).click();
  await page
    .getByRole("button", {
      name: "Documentgegevens bewerken: Fictieve-welkomstbrief.pdf",
    })
    .click();
  await page
    .getByRole("dialog")
    .getByLabel("Omschrijving", { exact: true })
    .fill("Centrale fictieve correspondentie bijgewerkt.");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Documentgegevens opslaan" })
    .click();
  await page.reload();
  await expect(page.locator("tbody tr")).toHaveCount(6);
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", {
      name: "Document verwijderen: Fictieve-welkomstbrief.pdf",
      exact: true,
    })
    .click();
  await expect(page.locator("tbody tr")).toHaveCount(5);
  await page.reload();
  await expect(page.locator("tbody tr")).toHaveCount(5);
});
test("central creation links a dossier to the chosen owner", async ({
  page,
}) => {
  await open(page, "/dossiers/");
  await page
    .getByRole("button", { name: "Nieuw dossier", exact: true })
    .click();
  await page
    .getByLabel("Nieuwe eigenaar", { exact: true })
    .selectOption("member:L-1001");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Verder", exact: true })
    .click();
  await page
    .getByLabel("Dossiertitel", { exact: true })
    .fill("Nieuw centraal demodossier");
  await page
    .getByRole("dialog")
    .getByLabel("Omschrijving", { exact: true })
    .fill("Fictieve centrale behandeling.");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Dossier opslaan" })
    .click();
  await page
    .getByRole("textbox", { name: "Alle dossiers zoeken" })
    .fill("nieuw centraal");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody tr")).toContainText("Youssef Haddad");
  await open(page, "/leden/L-1001/");
  await page.getByRole("tab", { name: /Dossiers/ }).click();
  await expect(page.getByRole("tabpanel")).toContainText(
    "Nieuw centraal demodossier",
  );
});
test("column choices and saved member groups survive reload and can be removed", async ({
  page,
}) => {
  await open(page, "/leden/");
  await page.locator(".column-picker summary").click();
  await page.getByLabel("Kolom Adres", { exact: true }).uncheck();
  await page.getByLabel("Kolom Telefoon", { exact: true }).check();
  await page.getByLabel("Kolom E-mailadres", { exact: true }).check();
  await page.reload();
  await expect(
    page.getByRole("columnheader", { name: "Adres", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("columnheader", { name: "Telefoon", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "E-mailadres", exact: true }),
  ).toBeVisible();
  await expect(page.locator("tbody tr").first()).toContainText("@example.com");
  await page.getByRole("textbox", { name: "Leden zoeken" }).fill("Haddad");
  await page
    .getByRole("checkbox", { name: "Selecteer deze pagina", exact: true })
    .check();
  await page.getByRole("button", { name: "Selectie bewaren" }).click();
  await page
    .getByLabel("Naam van selectie", { exact: true })
    .fill("Haddad demogroep");
  await page.getByRole("button", { name: "Selectie opslaan" }).click();
  await page.reload();
  const option = page
    .getByLabel("Bewaarde selectie", { exact: true })
    .getByRole("option", { name: "Haddad demogroep (5)", exact: true });
  const id = await option.getAttribute("value");
  await page.getByLabel("Bewaarde selectie", { exact: true }).selectOption(id!);
  await expect(page.locator("tbody tr")).toHaveCount(5);
  await expect(
    page.getByText("5 leden geselecteerd", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Selectie sluiten" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(10);
  await page.getByLabel("Bewaarde selectie", { exact: true }).selectOption(id!);
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Bewaarde selectie verwijderen" })
    .click();
  await expect(
    page
      .getByLabel("Bewaarde selectie", { exact: true })
      .getByRole("option", { name: "Haddad demogroep (5)", exact: true }),
  ).toHaveCount(0);
});
test("bulk edits require review and explicit confirmation, then persist only selected members", async ({
  page,
}) => {
  await open(page, "/leden/");
  await page.getByRole("textbox", { name: "Leden zoeken" }).fill("Haddad");
  await pick(page, ["L-1001", "L-1002"]);
  await page
    .getByRole("button", { name: "Geselecteerde leden wijzigen" })
    .click();
  let dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Nieuwe waarde", { exact: true })
    .selectOption("Inactief");
  await dialog.getByRole("button", { name: "Wijziging controleren" }).click();
  await expect(dialog.locator("tbody tr")).toHaveCount(2);
  await expect(dialog).toContainText("Youssef Haddad");
  await dialog.getByRole("button", { name: "Annuleren", exact: true }).click();
  await expect(
    page.locator("tbody tr").filter({ hasText: "L-1001" }),
  ).toContainText("Actief");
  await page
    .getByRole("button", { name: "Geselecteerde leden wijzigen" })
    .click();
  dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Nieuwe waarde", { exact: true })
    .selectOption("Inactief");
  await dialog.getByRole("button", { name: "Wijziging controleren" }).click();
  await dialog
    .getByRole("button", { name: "Bevestigen en toepassen (2)", exact: true })
    .click();
  await expect(
    page.getByText("2 leden bijgewerkt. De wijziging is lokaal opgeslagen.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("textbox", { name: "Leden zoeken" }).fill("Haddad");
  await expect(
    page.locator("tbody tr").filter({ hasText: "L-1001" }),
  ).toContainText("Inactief");
  await expect(
    page.locator("tbody tr").filter({ hasText: "L-1002" }),
  ).toContainText("Inactief");
  await expect(
    page.locator("tbody tr").filter({ hasText: "L-1003" }),
  ).toContainText("Actief");
});
test("changing filters clears picked members, and bulk storage failures do not claim success", async ({
  page,
}) => {
  await open(page, "/leden/");
  await page
    .getByRole("checkbox", { name: "Selecteer deze pagina", exact: true })
    .check();
  await expect(
    page.getByText("10 leden geselecteerd", { exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Woonplaats", { exact: true })
    .selectOption("Oldenzaal");
  await expect(
    page.getByRole("button", { name: "Geselecteerde leden wijzigen" }),
  ).toHaveCount(0);
  await page
    .getByRole("checkbox", { name: "Selecteer deze pagina", exact: true })
    .check();
  await page
    .getByRole("button", { name: "Geselecteerde leden wijzigen" })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Te wijzigen veld", { exact: true })
    .selectOption("contactPreference");
  await dialog
    .getByLabel("Nieuwe waarde", { exact: true })
    .selectOption("Telefoon");
  await dialog.getByRole("button", { name: "Wijziging controleren" }).click();
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error("Storage unavailable");
    };
  });
  await dialog.getByRole("button", { name: /Bevestigen en toepassen/ }).click();
  await expect(dialog.getByRole("alert")).toContainText(
    "Opslaan is niet gelukt",
  );
  await expect(dialog).toBeVisible();
  await expect(page.getByText(/leden bijgewerkt/)).toHaveCount(0);
});
test("cross-page selection and sorting work without widening narrow screens", async ({
  page,
}) => {
  await open(page, "/leden/");
  await page
    .getByRole("checkbox", { name: "Selecteer deze pagina", exact: true })
    .check();
  await page.getByRole("button", { name: "Volgende pagina" }).click();
  await page
    .getByRole("checkbox", { name: "Selecteer deze pagina", exact: true })
    .check();
  await expect(
    page.getByText("20 leden geselecteerd", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Selecteer alle 24 resultaten" })
    .click();
  await expect(
    page.getByText("24 leden geselecteerd", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Selectie wissen", exact: true })
    .click();
  await page.getByLabel("Sortering", { exact: true }).selectOption("name-desc");
  await expect(page.locator("tbody tr").first()).toContainText(
    "Youssef Haddad",
  );
  for (const width of [820, 390]) {
    await page.setViewportSize({ width, height: 1180 });
    for (const route of ["/leden/", "/dossiers/", "/documenten/"]) {
      await open(page, route);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
    }
  }
});

test("bulk review blocks overwriting a member changed in another tab", async ({
  page,
  context,
}) => {
  await open(page, "/leden/");
  await page
    .getByRole("textbox", { name: "Leden zoeken" })
    .fill("Youssef Haddad");
  await page
    .getByRole("checkbox", { name: "Selecteer deze pagina", exact: true })
    .check();
  await page
    .getByRole("button", { name: "Geselecteerde leden wijzigen" })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Nieuwe waarde", { exact: true })
    .selectOption("Inactief");
  await dialog.getByRole("button", { name: "Wijziging controleren" }).click();
  const other = await context.newPage();
  await open(other, "/leden/L-1001/");
  await other.getByRole("button", { name: "Lid bewerken" }).click();
  await other
    .getByRole("dialog")
    .getByLabel("Voornaam", { exact: true })
    .fill("NieuweDemo");
  await other
    .getByRole("dialog")
    .getByRole("button", { name: "Wijzigingen opslaan" })
    .click();
  await expect(
    other.getByRole("heading", { name: "NieuweDemo Haddad", exact: true }),
  ).toBeVisible();
  await dialog
    .getByRole("button", { name: "Bevestigen en toepassen (1)", exact: true })
    .click();
  await expect(dialog.getByRole("alert")).toContainText("intussen veranderd");
  await other.reload();
  await expect(other.getByRole("tabpanel")).toContainText("Actief");
  await other.close();
});
