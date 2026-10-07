import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { INTERESTS_EN, INTRO_EN } from "../content/kpp9-copy";

/** KPP-9 RED: KaC's own intro + interests copy renders exactly, desktop + mobile. */

function paragraphs(name: "intro" | "interests"): string[] {
  return readFileSync(path.resolve(`content/__fixtures__/kpp9/${name}.zh.txt`), "utf8")
    .replace(/\n$/, "")
    .split("\n");
}

const CASES = [
  { nav: "nav-intro", section: "intro", zh: paragraphs("intro"), en: [...INTRO_EN] },
  { nav: "nav-interests", section: "interests", zh: paragraphs("interests"), en: [...INTERESTS_EN] },
] as const;

for (const c of CASES) {
  test(`${c.section}: zh paragraphs render exactly and each can be scrolled into view`, async ({ page }) => {
    await page.goto("/");
    await page.getByTestId(c.nav).click();
    const popup = page.getByTestId("section-popup");
    await expect(popup).toHaveAttribute("data-section", c.section);
    const texts = await popup.locator("p").allTextContents();
    expect(texts).toEqual(c.zh);
    for (const p of c.zh) {
      const el = popup.getByText(p, { exact: true });
      await expect(el).toBeVisible();
      await el.scrollIntoViewIfNeeded();
      await expect(el).toBeInViewport();
    }
    await page.keyboard.press("Escape");
    await expect(popup).toBeHidden();
  });

  test(`${c.section}: en paragraphs render exactly`, async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("lang-toggle").click();
    await page.getByTestId(c.nav).click();
    const popup = page.getByTestId("section-popup");
    await expect(popup).toHaveAttribute("data-section", c.section);
    expect(await popup.locator("p").allTextContents()).toEqual(c.en);
    for (const p of c.en) await expect(popup.getByText(p, { exact: true })).toBeVisible();
  });
}

for (const lang of ["zh", "en"] as const) {
  test(`long ${lang} copy fits on a 390x844 phone: whole popup reachable, close button visible`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    if (lang === "en") await page.getByTestId("lang-toggle").click();
    for (const c of CASES) {
      await page.getByTestId(c.nav).click();
      const popup = page.getByTestId("section-popup");
      await expect(popup).toHaveAttribute("data-section", c.section);
      await expect(page.getByTestId("popup-close")).toBeInViewport();
      for (const p of c[lang]) {
        const el = popup.getByText(p, { exact: true });
        await el.scrollIntoViewIfNeeded();
        await expect(el).toBeInViewport();
      }
      await page.keyboard.press("Escape");
      await expect(popup).toBeHidden();
    }
  });
}
