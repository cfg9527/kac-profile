import { expect, test, type Page } from "@playwright/test";
import { PARK_OBJECT_IDS, SECTION_IDS, siteContent } from "../content/site";

/**
 * KPP-10 RED: KaC asked to remove the on-screen up/down/left/right buttons
 * (「同埋我想移除上下左右個按鍵喺個掣」). Desktop and mobile must have no D-pad;
 * shortcuts, park objects, Esc, keyboard arrows / WASD and tap-to-walk keep working.
 */

const ARROW_GLYPH = /^[←↑↓→⇦⇧⇨⇩⬅⬆⬇➡▲▼◀▶△▽◁▷]$/;
const DPAD_WORDS = /d-?pad|方向掣/i;
const DPAD_TESTIDS = /d-?pad|arrow|(^|-)(up|down|left|right)(-|$)/i;
const VIEWPORTS = {
  "desktop 1280x800": { width: 1280, height: 800 },
  "mobile 390x844": { width: 390, height: 844 },
} as const;

async function ready(page: Page) {
  await page.goto("/");
  await expect(page.getByTestId("park-scene")).toBeVisible();
  await expect(page.getByTestId("character")).toBeVisible();
}

/**
 * D-pad-like controls: buttons labelled/filled with an arrow glyph, buttons or
 * button groups/toolbars named as a D-pad, and any element with a D-pad test id.
 * (The park hint / park-scene label may still mention keyboard 方向鍵: not a control.)
 */
async function dpadLike(page: Page): Promise<string[]> {
  return page.evaluate(
    ({ glyph, words, tids }) => {
      const g = new RegExp(glyph.source, glyph.flags);
      const w = new RegExp(words.source, words.flags);
      const t = new RegExp(tids.source, tids.flags);
      const out: string[] = [];
      const controls = document.querySelectorAll<HTMLElement>(
        'button, [role="button"], [role="group"], [role="toolbar"]',
      );
      for (const el of controls) {
        const text = (el.textContent ?? "").trim();
        const label = (el.getAttribute("aria-label") ?? "").trim();
        const isButton = el.matches('button, [role="button"]');
        if ((isButton && (g.test(text) || g.test(label))) || w.test(label)) {
          out.push(el.outerHTML.slice(0, 120));
        }
      }
      for (const el of document.querySelectorAll<HTMLElement>("[data-testid]")) {
        if (t.test(el.getAttribute("data-testid") ?? "")) out.push(el.outerHTML.slice(0, 120));
      }
      return out;
    },
    {
      glyph: { source: ARROW_GLYPH.source, flags: ARROW_GLYPH.flags },
      words: { source: DPAD_WORDS.source, flags: DPAD_WORDS.flags },
      tids: { source: DPAD_TESTIDS.source, flags: DPAD_TESTIDS.flags },
    },
  );
}

for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
  test.describe(vpName, () => {
    test.use({ viewport: vp });

    test("no on-screen D-pad buttons in the DOM (zh and en)", async ({ page }) => {
      await ready(page);
      for (const lang of ["zh", "en"] as const) {
        if (lang === "en") {
          await page.getByTestId("lang-toggle").click();
          await expect(page.getByRole("heading", { name: /Pixel Park/ })).toBeVisible();
        }
        await expect(page.getByRole("button", { name: ARROW_GLYPH })).toHaveCount(0);
        await expect(page.getByRole("group", { name: DPAD_WORDS })).toHaveCount(0);
        expect(await dpadLike(page), lang).toEqual([]);
      }
    });

    test(`all ${SECTION_IDS.length} section shortcuts open their own popup, Esc closes`, async ({ page }) => {
      await ready(page);
      const nav = page.getByRole("navigation", { name: /各部分快捷掣/ });
      await expect(nav.getByRole("button")).toHaveCount(SECTION_IDS.length);
      for (const id of SECTION_IDS) {
        const tab = page.getByTestId(`nav-${id}`);
        await expect(tab).toHaveText(siteContent.zh.sections[id].tabLabel);
        await tab.click();
        const popup = page.getByTestId("section-popup");
        await expect(popup).toHaveAttribute("data-section", id);
        await expect(popup.getByRole("heading", { level: 2 })).toHaveText(siteContent.zh.sections[id].title);
        await page.keyboard.press("Escape");
        await expect(popup).toBeHidden();
      }
    });

    test("every park object still opens its section", async ({ page }) => {
      await ready(page);
      for (const id of PARK_OBJECT_IDS) {
        const obj = page.getByTestId(`park-object-${id}`);
        const section = await obj.getAttribute("data-section");
        await obj.click();
        const popup = page.getByTestId("section-popup");
        await expect(popup).toBeVisible({ timeout: 8000 });
        await expect(popup).toHaveAttribute("data-section", section!);
        await page.keyboard.press("Escape");
        await expect(popup).toBeHidden();
      }
    });

    test("tapping bare ground still walks KaC there", async ({ page }) => {
      await ready(page);
      const scene = page.getByTestId("park-scene");
      const box = (await scene.boundingBox())!;
      // centre of tile (2, 5): open ground, no object button nearby
      await scene.click({ position: { x: (box.width * 2.5) / 12, y: (box.height * 5.5) / 8 } });
      await expect.poll(() => page.getByTestId("character").getAttribute("data-x"), { timeout: 8000 }).toBe("2.00");
      await expect.poll(() => page.getByTestId("character").getAttribute("data-y"), { timeout: 8000 }).toBe("5.00");
    });
  });
}

/** KaC starts on tile (6, 2); all four neighbours are free. */
const KEYS: [string, "x" | "y", string][] = [
  ["ArrowRight", "x", "7.00"],
  ["ArrowLeft", "x", "5.00"],
  ["ArrowUp", "y", "1.00"],
  ["ArrowDown", "y", "3.00"],
  ["d", "x", "7.00"],
  ["a", "x", "5.00"],
  ["w", "y", "1.00"],
  ["s", "y", "3.00"],
];

test.describe("keyboard (desktop 1280x800)", () => {
  test.use({ viewport: VIEWPORTS["desktop 1280x800"] });
  for (const [key, axis, want] of KEYS) {
    test(`${key} moves KaC one tile`, async ({ page }) => {
      await ready(page);
      await expect(page.getByTestId("character")).toHaveAttribute("data-x", "6.00");
      await expect(page.getByTestId("character")).toHaveAttribute("data-y", "2.00");
      await page.getByTestId("park-scene").focus();
      await page.keyboard.press(key);
      await expect.poll(() => page.getByTestId("character").getAttribute(`data-${axis}`), { timeout: 5000 }).toBe(want);
    });
  }
});
