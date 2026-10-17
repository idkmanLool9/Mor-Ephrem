import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
const prefix = process.env.GITHUB_PAGES_TEST === "true" ? "/Mor-Ephrem" : "";
const open = (page: Page, path: string) => page.goto(prefix + path);
const panel = (page: Page) => page.getByRole("tabpanel");
test("create family, link member, choose contact and propagate address", async ({
  page,
}) => {
  await open(page, "/gezinnen/");
  await page.getByRole("link", { name: "Nieuw gezin", exact: true }).click();
  await page.getByLabel("Gezinsnaam", { exact: true }).fill("Demogezin");
  await page.getByLabel("Adres", { exact: true }).fill("Voorbeeldhof 99");
  await page.getByLabel("Postcode", { exact: true }).fill("0000 ZZ");
  await page.getByLabel("Woonplaats", { exact: true }).fill("Teststad");
  await page
    .getByRole("button", { name: "Gezin aanmaken", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Familie Demogezin", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Lid koppelen", exact: true }).click();
  let dialog = page.getByRole("dialog");
  await dialog.getByLabel("Lid", { exact: true }).selectOption("L-1003");
  await dialog.getByLabel("Relatie", { exact: true }).selectOption("Kind");
  await dialog.getByLabel("Gezinsadres overnemen bij dit lid").check();
  await dialog
    .getByRole("button", { name: "Lid koppelen", exact: true })
    .click();
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Gezin bewerken", exact: true })
    .click();
  dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Contactpersoon", { exact: true })
    .selectOption("L-1003");
  await dialog.getByLabel("Adres", { exact: true }).fill("Demolaan 100");
  await dialog
    .getByLabel("Dit adres ook overnemen bij alle gekoppelde gezinsleden")
    .check();
  await dialog
    .getByRole("button", { name: "Gezin opslaan", exact: true })
    .click();
  await page.reload();
  await expect(page.locator("tbody tr")).toContainText("Contactpersoon");
  await page
    .getByRole("link", { name: /Anna Haddad/ })
    .first()
    .click();
  await expect(panel(page)).toContainText("Demolaan 100");
  await page.getByRole("tab", { name: "Gezin", exact: true }).click();
  await page.getByRole("link", { name: "Bekijk gezin" }).click();
  await expect(
    page.getByRole("heading", { name: "Familie Demogezin", exact: true }),
  ).toBeVisible();
  await open(page, "/gezinnen/G-001/");
  await expect(page.locator("tbody tr")).toHaveCount(4);
});
test("change family contact consistently without forcing address changes", async ({
  page,
}) => {
  await open(page, "/gezinnen/G-001/");
  await page.getByRole("button", { name: "Gezin bewerken" }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Contactpersoon", { exact: true })
    .selectOption("L-1002");
  await dialog.getByLabel("Adres", { exact: true }).fill("Gezinsadres 50");
  await dialog
    .getByRole("button", { name: "Gezin opslaan", exact: true })
    .click();
  await expect(
    page.locator("tbody tr").filter({ hasText: "Sara Haddad" }),
  ).toContainText("Contactpersoon");
  await expect(
    page.locator("tbody tr").filter({ hasText: "Youssef Haddad" }),
  ).toContainText("Gezinslid");
  await open(page, "/leden/L-1001/");
  await expect(panel(page)).toContainText("Voorbeeldlaan 12");
  await page.getByRole("button", { name: "Lid bewerken" }).click();
  await expect(
    page.getByRole("dialog").getByLabel("Gezin", { exact: true }),
  ).toBeEnabled();
});
test("extended member fields and custom fields survive edits and reload", async ({
  page,
}) => {
  await open(page, "/leden/L-1001/");
  await page.getByRole("button", { name: "Lid bewerken" }).click();
  let dialog = page.getByRole("dialog");
  await dialog.getByLabel("Roepnaam", { exact: true }).fill("Demo");
  await dialog
    .getByLabel("Geboorteplaats", { exact: true })
    .fill("Voorbeeldstad");
  await dialog.getByLabel("Nationaliteit", { exact: true }).fill("Fictief");
  await dialog.getByLabel("Voorkeurstaal", { exact: true }).fill("Nederlands");
  await dialog
    .getByLabel("Type lidmaatschap", { exact: true })
    .selectOption("Gastlid");
  await dialog.getByRole("button", { name: "Eigen veld toevoegen" }).click();
  await dialog
    .getByLabel("Veldnaam 1", { exact: true })
    .fill("Vrijwilligersrol");
  await dialog
    .getByLabel("Veldwaarde 1", { exact: true })
    .fill("Demo-coördinator");
  await dialog.getByRole("button", { name: "Wijzigingen opslaan" }).click();
  await page.reload();
  await expect(panel(page)).toContainText("Demo-coördinator");
  await expect(panel(page)).toContainText("Voorbeeldstad");
  await page.getByRole("tab", { name: "Lidmaatschap", exact: true }).click();
  await expect(panel(page)).toContainText("Gastlid");
  await page.getByRole("button", { name: "Lid bewerken" }).click();
  dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Eigen veld toevoegen" }).click();
  await dialog
    .getByLabel("Veldnaam 2", { exact: true })
    .fill("vrijwilligersrol");
  await dialog.getByRole("button", { name: "Wijzigingen opslaan" }).click();
  await expect(dialog.getByRole("alert")).toContainText("unieke");
  await dialog
    .getByRole("button", { name: "Eigen veld 2 verwijderen" })
    .click();
  await dialog.getByRole("button", { name: "Wijzigingen opslaan" }).click();
  await expect(dialog).not.toBeVisible();
});
test("notes can be added, edited and removed and stay scoped to their owner", async ({
  page,
}) => {
  await open(page, "/leden/L-1001/");
  await page.getByRole("tab", { name: /Notities/ }).click();
  await page.getByRole("button", { name: "Notitie toevoegen" }).click();
  let dialog = page.getByRole("dialog");
  await dialog.getByLabel("Titel", { exact: true }).fill("Demo-afspraak");
  await dialog
    .getByLabel("Notitietekst", { exact: true })
    .fill("Fictief overleg volgende week.");
  await dialog.getByRole("button", { name: "Notitie opslaan" }).click();
  await page.reload();
  await page.getByRole("tab", { name: /Notities/ }).click();
  await expect(panel(page)).toContainText("Fictief overleg volgende week.");
  await page
    .getByRole("button", { name: "Notitie bewerken: Demo-afspraak" })
    .click();
  dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Notitietekst", { exact: true })
    .fill("Fictieve afspraak bevestigd.");
  await dialog.getByRole("button", { name: "Notitie opslaan" }).click();
  await expect(panel(page)).toContainText("Fictieve afspraak bevestigd.");
  await open(page, "/leden/L-1002/");
  await page.getByRole("tab", { name: /Notities/ }).click();
  await expect(panel(page)).toContainText("Nog geen notities");
  await open(page, "/leden/L-1001/");
  await page.getByRole("tab", { name: /Notities/ }).click();
  page.once("dialog", (event) => event.accept());
  await page
    .getByRole("button", { name: "Notitie verwijderen: Demo-afspraak" })
    .click();
  await expect(panel(page)).toContainText("Nog geen notities");
});
test("case status and linked document upload, download and deletion persist", async ({
  page,
}) => {
  await open(page, "/gezinnen/G-001/");
  await page.getByRole("tab", { name: /Dossiers/ }).click();
  await page.getByRole("button", { name: "Dossier openen" }).click();
  let dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Dossiertitel", { exact: true })
    .fill("Adrescontrole demo");
  await dialog
    .getByLabel("Omschrijving", { exact: true })
    .fill("Controleer het fictieve gezinsadres.");
  await dialog
    .getByLabel("Dossierstatus", { exact: true })
    .selectOption("In behandeling");
  await dialog.getByRole("button", { name: "Dossier opslaan" }).click();
  await page.getByRole("tab", { name: /Documenten/ }).click();
  await page.getByRole("button", { name: "Document toevoegen" }).click();
  dialog = page.getByRole("dialog");
  const bytes = Buffer.from("%PDF-1.4\nFictief demodocument\n%%EOF");
  await dialog.getByLabel("Bestand", { exact: true }).setInputFiles({
    name: "demo.pdf",
    mimeType: "application/pdf",
    buffer: bytes,
  });
  const caseId = await dialog
    .getByLabel("Documentdossier", { exact: true })
    .locator("option")
    .nth(1)
    .getAttribute("value");
  await dialog
    .getByLabel("Documentdossier", { exact: true })
    .selectOption(caseId!);
  await dialog
    .getByLabel("Omschrijving", { exact: true })
    .fill("Fictief document voor de adrescontrole.");
  await dialog.getByRole("button", { name: "Document opslaan" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(panel(page)).toContainText("Dossier: Adrescontrole demo");
  await page.reload();
  await page.getByRole("tab", { name: /Documenten/ }).click();
  await expect(panel(page)).toContainText("Dossier: Adrescontrole demo");
  const downloadEvent = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download demo.pdf", exact: true })
    .click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe("demo.pdf");
  expect(readFileSync((await download.path())!)).toEqual(bytes);
  await page.getByRole("tab", { name: /Dossiers/ }).click();
  await page
    .getByRole("button", { name: "Dossier bekijken: Adrescontrole demo" })
    .click();
  dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Gekoppelde documenten (1)");
  await dialog
    .getByLabel("Dossierstatus", { exact: true })
    .selectOption("Afgerond");
  await dialog.getByRole("button", { name: "Dossier opslaan" }).click();
  await page
    .getByLabel("Dossierstatusfilter", { exact: true })
    .selectOption("Open");
  await expect(panel(page)).toContainText("Geen dossiers met deze status");
  await page
    .getByLabel("Dossierstatusfilter", { exact: true })
    .selectOption("Afgerond");
  await expect(panel(page)).toContainText("Adrescontrole demo");
  await page.getByRole("tab", { name: /Documenten/ }).click();
  page.once("dialog", (event) => event.accept());
  await page
    .getByRole("button", { name: "Document verwijderen: demo.pdf" })
    .click();
  await expect(panel(page)).toContainText("Nog geen documenten");
  await open(page, "/leden/L-1001/");
  await page.getByRole("tab", { name: /Documenten/ }).click();
  await expect(panel(page)).toContainText("Nog geen documenten");
});
test("reject unsupported and oversized documents without adding them", async ({
  page,
}) => {
  await open(page, "/leden/L-1001/");
  await page.getByRole("tab", { name: /Documenten/ }).click();
  await page.getByRole("button", { name: "Document toevoegen" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Bestand", { exact: true }).setInputFiles({
    name: "fake.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("<html>geen document</html>"),
  });
  await dialog.getByRole("button", { name: "Document opslaan" }).click();
  await expect(dialog.getByRole("alert")).toContainText("geen herkenbare");
  await dialog.getByLabel("Bestand", { exact: true }).setInputFiles({
    name: "large.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.alloc(1024 * 1024 + 1),
  });
  await dialog.getByRole("button", { name: "Document opslaan" }).click();
  await expect(dialog.getByRole("alert")).toContainText("te groot");
  await dialog.getByRole("button", { name: "Annuleren" }).click();
  await expect(panel(page)).toContainText("Nog geen documenten");
});
test("migrate existing local members and keep them after adding notes", async ({
  page,
}) => {
  await open(page, "/leden/");
  // Seed v1 from the repository fixture, preserving the previous schema.
  const { members } = await import("../src/lib/data");
  await page.evaluate(
    (data) => localStorage.setItem("antioch.members.v1", JSON.stringify(data)),
    members.map((m) =>
      m.id === "L-1001" ? { ...m, firstName: "BewaardeDemo" } : m,
    ),
  );
  await open(page, "/leden/L-1001/");
  await expect(
    page.getByRole("heading", { name: "BewaardeDemo Haddad", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: /Notities/ }).click();
  await page.getByRole("button", { name: "Notitie toevoegen" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Titel", { exact: true }).fill("Migratiecontrole");
  await dialog
    .getByLabel("Notitietekst", { exact: true })
    .fill("Bestaande fictieve wijzigingen blijven behouden.");
  await dialog.getByRole("button", { name: "Notitie opslaan" }).click();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "BewaardeDemo Haddad", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => !!localStorage.getItem("antioch.administration.v2"),
    ),
  ).toBeTruthy();
});

test("profile tabs and edit forms fit iPad and narrow screens", async ({
  page,
}) => {
  for (const width of [820, 390]) {
    await page.setViewportSize({ width, height: 1180 });
    await open(page, "/leden/L-1001/");
    for (const name of [/Dossiers/, /Documenten/, /Notities/]) {
      await page.getByRole("tab", { name }).click();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
    }
    await page
      .getByRole("button", { name: "Lid bewerken", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByLabel("Voornaam", { exact: true })).toBeVisible();
    expect(
      await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBeTruthy();
    await dialog.getByRole("button", { name: "Annuleren" }).click();
    await open(page, "/gezinnen/G-001/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  }
});
