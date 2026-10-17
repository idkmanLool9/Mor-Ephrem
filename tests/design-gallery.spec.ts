import { expect, test } from "@playwright/test";
const prefix = process.env.GITHUB_PAGES_TEST === "true" ? "/Mor-Ephrem" : "";

test("vijf ontwerprichtingen zijn te bekijken zonder administratie te wijzigen", async ({
  page,
}) => {
  await page.goto(`${prefix}/ontwerpen/`);
  const initialStorage = await page.evaluate(() =>
    JSON.stringify(localStorage),
  );
  for (const name of [
    "Compact",
    "Vertrouwd",
    "Verfijnd",
    "Rustig",
    "Werkplek",
  ]) {
    await page
      .getByRole("button", { name: new RegExp(`0[1-5]\\s*${name}`) })
      .click();
    await expect(
      page.getByRole("region", { name: `Voorbeeld ${name}`, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Bekijk Youssef Haddad" }),
    ).toBeVisible();
    const widths = await page.evaluate(() => [
      document.documentElement.scrollWidth,
      innerWidth,
    ]);
    expect(widths[0]).toBeLessThanOrEqual(widths[1]);
  }
  await page.getByLabel("Zoek een voorbeeldlid").fill("Miriam");
  await page.getByRole("button", { name: "Bekijk Miriam Gewargis" }).click();
  await expect(
    page
      .getByRole("complementary", { name: "Voorbeeldprofiel" })
      .getByRole("heading", { name: "Miriam Gewargis" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Activiteit", exact: true }).click();
  await expect(
    page.getByText("Lidmaatschap geregistreerd", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Alle statussen" }).click();
  await expect(
    page.getByText("Geen leden gevonden.", { exact: false }),
  ).toBeVisible();
  expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(
    initialStorage,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  for (const name of [
    "Compact",
    "Vertrouwd",
    "Verfijnd",
    "Rustig",
    "Werkplek",
  ]) {
    await page
      .getByRole("button", { name: new RegExp(`0[1-5]\\s*${name}`) })
      .click();
    const widths = await page.evaluate(() => [
      document.documentElement.scrollWidth,
      innerWidth,
    ]);
    expect(widths[0], name).toBeLessThanOrEqual(widths[1]);
  }
});
