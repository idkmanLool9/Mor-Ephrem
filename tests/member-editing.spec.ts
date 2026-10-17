import { test, expect, type Page } from "@playwright/test";
const prefix = process.env.GITHUB_PAGES_TEST === "true" ? "/Mor-Ephrem" : "";
async function open(page: Page, path: string) {
  await page.goto(prefix + path);
}
async function fillNew(page: Page) {
  await open(page, "/leden/nieuw/");
  await page.getByLabel("Voornaam", { exact: true }).fill("Test");
  await page.getByLabel("Achternaam", { exact: true }).fill("Voorbeeld");
  await page.getByLabel("Geboortedatum", { exact: true }).fill("2000-01-01");
  await page
    .getByLabel("E-mailadres", { exact: true })
    .fill("test.voorbeeld@example.com");
}
test("new member survives reload and updates household and dashboard", async ({
  page,
}) => {
  await fillNew(page);
  await page.getByRole("button", { name: "Lid opslaan", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Test Voorbeeld", exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(/leden\/lokaal\/?\?id=L-1025/);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Test Voorbeeld", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Gezin", exact: true }).click();
  await page.getByRole("link", { name: "Bekijk gezin" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(6);
  await page.getByRole("link", { name: /Test Voorbeeld/ }).click();
  await expect(
    page.getByRole("heading", { name: "Test Voorbeeld", exact: true }),
  ).toBeVisible();
  await open(page, "/");
  await expect(page.locator(".stat-card").first()).toContainText("25");
  await open(page, "/leden/");
  await page
    .getByRole("textbox", { name: "Leden zoeken" })
    .fill("test.voorbeeld@example.com");
  await expect(page.locator("tbody tr")).toHaveCount(1);
});
test("editing validates dates, supports cancel and persists profile changes", async ({
  page,
}) => {
  await open(page, "/leden/L-1001/");
  await page.getByRole("button", { name: "Lid bewerken" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Voornaam", { exact: true }).fill("Niet bewaren");
  await dialog.getByRole("button", { name: "Annuleren" }).click();
  await expect(
    page.getByRole("heading", { name: "Youssef Haddad", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Lid bewerken" }).click();
  await expect(dialog.getByLabel("Voornaam", { exact: true })).toHaveValue(
    "Youssef",
  );
  await dialog.getByLabel("Geboortedatum", { exact: true }).fill("2099-01-01");
  await dialog.getByRole("button", { name: "Wijzigingen opslaan" }).click();
  await expect(dialog.getByRole("alert")).toContainText("Controleer de datums");
  await dialog.getByLabel("Geboortedatum", { exact: true }).fill("1980-03-12");
  await dialog.getByLabel("Voornaam", { exact: true }).fill("Demo");
  await dialog.getByLabel("Status", { exact: true }).selectOption("Inactief");
  await dialog.getByRole("button", { name: "Wijzigingen opslaan" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Demo Haddad", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Demo Haddad", exact: true }),
  ).toBeVisible();
  await open(page, "/leden/");
  await page.getByRole("textbox", { name: "Leden zoeken" }).fill("Demo Haddad");
  await expect(page.locator("tbody tr")).toContainText("Inactief");
});
test("storage failure does not pretend to save and corrupted data does not crash", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("antioch.members.v1", "not-json");
  });
  await fillNew(page);
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error("Quota exceeded");
    };
  });
  await page.getByRole("button", { name: "Lid opslaan", exact: true }).click();
  await expect(page.locator(".member-form").getByRole("alert")).toContainText(
    "Opslaan is niet gelukt",
  );
  await expect(
    page.getByRole("heading", { name: "Nieuw lid", exact: true }),
  ).toBeVisible();
  await open(page, "/leden/");
  await expect(page.locator("tbody tr")).toHaveCount(10);
});
