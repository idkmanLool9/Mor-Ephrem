import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
const prefix = process.env.GITHUB_PAGES_TEST === "true" ? "/Mor-Ephrem" : "";
const open = (page: Page, path: string) => page.goto(prefix + path);
async function upload(
  page: Page,
  name: string,
  mimeType: string,
  buffer: Buffer,
) {
  await page
    .getByRole("button", { name: "Document toevoegen", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Bestand", { exact: true })
    .setInputFiles({ name, mimeType, buffer });
  await dialog
    .getByRole("button", { name: "Document opslaan", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
}
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aC2kAAAAASUVORK5CYII=",
  "base64",
);
function pdf() {
  const content = "BT /F1 12 Tf 20 150 Td (Fictief documentvoorbeeld) Tj ET";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];
  let source = "%PDF-1.4\n";
  const offsets = [0];
  for (const [index, object] of objects.entries()) {
    offsets.push(source.length);
    source += `${index + 1} 0 obj\n${object}\nendobj\n`;
  }
  const xref = source.length;
  source += `xref\n0 6\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("")}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(source);
}
test("multiword search crosses fields and combines with family filters", async ({
  page,
}) => {
  await open(page, "/leden/");
  await page
    .getByRole("textbox", { name: "Leden zoeken" })
    .fill("OLDENZAAL haddad youssef");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.getByLabel("Gezinsfilter", { exact: true }).selectOption("G-002");
  await expect(
    page.getByRole("heading", { name: "Geen resultaten gevonden" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Filters wissen", exact: true })
    .last()
    .click();
  await expect(page.getByLabel("Gezinsfilter", { exact: true })).toHaveValue(
    "Alle gezinnen",
  );
  await page.getByLabel("Gezinsfilter", { exact: true }).selectOption("G-001");
  await expect(page.locator("tbody tr")).toHaveCount(5);
  await open(page, "/gezinnen/");
  await page
    .getByRole("textbox", { name: "Gezinnen zoeken" })
    .fill("Anna Oldenzaal");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody tr")).toContainText("Familie Haddad");
});
test("search matches own profile fields regardless of accents", async ({
  page,
}) => {
  await open(page, "/leden/L-1001/");
  await page.getByRole("button", { name: "Lid bewerken" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Eigen veld toevoegen" }).click();
  await dialog
    .getByLabel("Veldnaam 1", { exact: true })
    .fill("Vrijwilligersrol");
  await dialog.getByLabel("Veldwaarde 1", { exact: true }).fill("Coördinator");
  await dialog.getByRole("button", { name: "Wijzigingen opslaan" }).click();
  await open(page, "/leden/");
  await page
    .getByRole("textbox", { name: "Leden zoeken" })
    .fill("coordinator Haddad");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody tr")).toContainText("Youssef Haddad");
});
test("notes and cases have search with reset and combined category/status filters", async ({
  page,
}) => {
  await open(page, "/leden/L-1001/");
  await page.getByRole("tab", { name: /Notities/ }).click();
  await page
    .getByRole("button", { name: "Notitie toevoegen", exact: true })
    .click();
  let dialog = page.getByRole("dialog");
  await dialog.getByLabel("Titel", { exact: true }).fill("Terugbelafspraak");
  await dialog
    .getByLabel("Notitietekst", { exact: true })
    .fill("Fictief contact op dinsdag.");
  await dialog.getByRole("button", { name: "Notitie opslaan" }).click();
  await page
    .getByRole("textbox", { name: "Notities zoeken" })
    .fill("dinsdag terugbel");
  await expect(page.locator(".note-card")).toHaveCount(1);
  await page
    .getByRole("textbox", { name: "Notities zoeken" })
    .fill("nietgevonden");
  await expect(
    page.getByRole("heading", { name: "Geen notities gevonden" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Zoekopdracht en filters wissen" })
    .click();
  await expect(page.locator(".note-card")).toHaveCount(1);
  await page.getByRole("tab", { name: /Dossiers/ }).click();
  await page
    .getByRole("button", { name: "Dossier openen", exact: true })
    .click();
  dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Dossiertitel", { exact: true })
    .fill("Adrescontrole");
  await dialog
    .getByLabel("Omschrijving", { exact: true })
    .fill("Fictieve inschrijving controleren.");
  await dialog
    .getByLabel("Dossiercategorie", { exact: true })
    .selectOption("Inschrijving");
  await dialog
    .getByLabel("Dossierstatus", { exact: true })
    .selectOption("In behandeling");
  await dialog.getByRole("button", { name: "Dossier opslaan" }).click();
  await page
    .getByRole("textbox", { name: "Dossiers zoeken" })
    .fill("controleren adres");
  await page
    .getByLabel("Dossiercategoriefilter", { exact: true })
    .selectOption("Inschrijving");
  await page
    .getByLabel("Dossierstatusfilter", { exact: true })
    .selectOption("In behandeling");
  await expect(page.locator(".case-card")).toHaveCount(1);
  await page
    .getByLabel("Dossierstatusfilter", { exact: true })
    .selectOption("Afgerond");
  await expect(page.locator(".case-card")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Zoekopdracht en filters wissen" })
    .click();
  await expect(page.locator(".case-card")).toHaveCount(1);
});
test("image preview works and metadata edits preserve original bytes without duplicates", async ({
  page,
}) => {
  await open(page, "/leden/L-1001/");
  await page.getByRole("tab", { name: /Documenten/ }).click();
  await upload(page, "fictief.png", "image/png", png);
  await page
    .getByRole("button", { name: "Voorbeeld van fictief.png", exact: true })
    .click();
  let dialog = page.getByRole("dialog", {
    name: "Documentvoorbeeld",
    exact: true,
  });
  const image = dialog.getByRole("img", { name: "Voorbeeld van fictief.png" });
  await expect(image).toBeVisible();
  await expect
    .poll(() => image.evaluate((el) => (el as HTMLImageElement).naturalWidth))
    .toBe(1);
  await dialog.getByRole("button", { name: "Venster sluiten" }).click();
  await page
    .getByRole("button", { name: "Documentgegevens bewerken: fictief.png" })
    .click();
  dialog = page.getByRole("dialog", { name: "Documentgegevens bewerken" });
  await dialog
    .getByLabel("Documentcategorie", { exact: true })
    .selectOption("Formulier");
  await dialog
    .getByLabel("Omschrijving", { exact: true })
    .fill("Fictieve afbeelding voor inschrijving.");
  await dialog
    .getByRole("button", { name: "Documentgegevens opslaan" })
    .click();
  await page.reload();
  await page.getByRole("tab", { name: /Documenten/ }).click();
  await expect(page.locator(".document-card")).toHaveCount(1);
  await page
    .getByRole("textbox", { name: "Documenten zoeken" })
    .fill("inschrijving fictief");
  await page
    .getByLabel("Documentcategoriefilter", { exact: true })
    .selectOption("Formulier");
  await expect(page.locator(".document-card")).toHaveCount(1);
  const downloadEvent = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download fictief.png", exact: true })
    .click();
  const download = await downloadEvent;
  expect(readFileSync((await download.path())!)).toEqual(png);
  await page
    .getByLabel("Documentcategoriefilter", { exact: true })
    .selectOption("Algemeen");
  await expect(
    page.getByRole("heading", { name: "Geen documenten gevonden" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Zoekopdracht en filters wissen" })
    .click();
  await expect(page.locator(".document-card")).toHaveCount(1);
});
test("PDF preview receives a local blob and downloads the original PDF", async ({
  page,
}) => {
  await open(page, "/gezinnen/G-001/");
  await page.getByRole("tab", { name: /Documenten/ }).click();
  const bytes = pdf();
  await upload(page, "demodossier.pdf", "application/pdf", bytes);
  await page
    .getByRole("button", { name: "Voorbeeld van demodossier.pdf", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Documentvoorbeeld",
    exact: true,
  });
  await expect(dialog.locator("iframe")).toHaveAttribute("src", /^blob:/);
  expect(
    await dialog.locator("iframe").evaluate(async (el) => {
      const blob = await (await fetch((el as HTMLIFrameElement).src)).blob();
      return { type: blob.type, size: blob.size };
    }),
  ).toEqual({ type: "application/pdf", size: bytes.length });
  const downloadEvent = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Download", exact: true }).click();
  const download = await downloadEvent;
  expect(readFileSync((await download.path())!)).toEqual(bytes);
  await dialog.getByRole("button", { name: "Venster sluiten" }).click();
  await expect(dialog).not.toBeVisible();
});
test("visible tab arrows reveal hidden tabs and keep the page within the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  await open(page, "/leden/L-1001/");
  const list = page.getByRole("tablist", { name: "Ledenprofiel" });
  await expect(
    page.getByRole("button", { name: "Meer tabbladen", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Meer tabbladen", exact: true })
    .click();
  await expect
    .poll(() => list.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(0);
  await expect(
    page.getByRole("button", { name: "Vorige tabbladen", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: /Documenten/ }).click();
  await expect(
    page.getByRole("button", { name: "Document toevoegen", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
