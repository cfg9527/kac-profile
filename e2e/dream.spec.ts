import { expect, test, type Page } from "@playwright/test";
import { DREAM_COLORS } from "../lib/theme/tokens";

/** KPP-7 RED: dream pixel night-sea look, reduced motion, AA contrast on real pixels. */

function hexToRgb(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}

async function mockOnePick(page: Page) {
  await page.route("**/api/recommend", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        picks: [{ slug: "syn-1", title: "測試歌甲", category: "華語流行", reason: "星落海面，鯨魚翻身，泡泡浮上嚟" }],
      }),
    });
  });
}

test("night-sea backdrop renders: sky, sea, >= 16 stars; page bg is the night token", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("dream-sky")).toBeAttached();
  await expect(page.getByTestId("dream-sea")).toBeAttached();
  expect(await page.getByTestId("dream-star").count()).toBeGreaterThanOrEqual(16);
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe(hexToRgb(DREAM_COLORS.night));
  // decorative only
  await expect(page.getByTestId("dream-sky")).toHaveAttribute("aria-hidden", "true");
  // facts
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Desmond Cheung");
  await expect(page.locator("footer")).toContainText("Desmond Cheung 用像素起嘅小公園");
});

test("no raster images on the page (all art CSS/SVG)", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("img")).toHaveCount(0);
  const rasterBg = await page.evaluate(() =>
    Array.from(document.querySelectorAll("*")).some((el) =>
      /url\([^)]*\.(png|jpe?g|webp|gif|avif)/i.test(getComputedStyle(el).backgroundImage),
    ),
  );
  expect(rasterBg).toBe(false);
});

test("animations run normally and stop under prefers-reduced-motion", async ({ page }) => {
  const animNames = () =>
    page.evaluate(() =>
      Array.from(document.querySelectorAll(".dn-twinkle, .dn-glint, .dn-shooting-star")).map(
        (el) => getComputedStyle(el).animationName,
      ),
    );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const normal = await animNames();
  expect(normal.length).toBeGreaterThanOrEqual(16 + 6 + 1);
  expect(normal.some((n) => n !== "none")).toBe(true);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const reduced = await animNames();
  expect(reduced.length).toBe(normal.length);
  expect(reduced.every((n) => n === "none")).toBe(true);
});

test("text sits on opaque plates and passes AA (home + recommendation dialog)", async ({ page }) => {
  await mockOnePick(page);
  await page.goto("/");
  await page.getByTestId("recommender-input").fill("想聽海");
  await page.getByTestId("recommender-submit").click();
  await expect(page.getByTestId("recommend-dialog")).toContainText("測試歌甲");

  const results = await page.evaluate(() => {
    const parse = (c: string) => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const [r, g, b, a] = m[1].split(",").map((x) => parseFloat(x));
      return { r, g, b, a: Number.isFinite(a) ? a : 1 };
    };
    const lum = ({ r, g, b }: { r: number; g: number; b: number }) => {
      const f = (v: number) => {
        const s = v / 255;
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const targets: [string, Element | null][] = [
      ["h1", document.querySelector("h1")],
      ["subtitle", document.querySelector("header p")],
      ["park hint", document.querySelector("main > p")],
      ["recommender heading", document.querySelector("#recommender-heading")],
      ["recommender label", document.querySelector("label[for=recommender-input]")],
      ["footer", document.querySelector("footer")],
      ["dialog title", document.querySelector("#recommend-title")],
      ["dialog reason", document.querySelector("[data-testid=recommend-dialog] li p")],
      ["nav button", document.querySelector("[data-testid=nav-intro]")],
      ["submit button", document.querySelector("[data-testid=recommender-submit]")],
    ];
    return targets.map(([name, el]) => {
      if (!el) return { name, ok: false, ratio: 0, why: "missing" };
      const fg = parse(getComputedStyle(el).color)!;
      let cur: Element | null = el;
      let bg: ReturnType<typeof parse> = null;
      while (cur && cur !== document.body && cur !== document.documentElement) {
        const c = parse(getComputedStyle(cur).backgroundColor);
        if (c && c.a >= 0.99) {
          bg = c;
          break;
        }
        cur = cur.parentElement;
      }
      if (!bg) return { name, ok: false, ratio: 0, why: "no opaque plate before body" };
      const l1 = lum(fg);
      const l2 = lum(bg);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      return { name, ok: ratio >= 4.5 && fg.a >= 0.99, ratio: Math.round(ratio * 100) / 100, why: `fg a=${fg.a}` };
    });
  });
  for (const r of results) expect(r.ok, `${r.name}: ${r.ratio} (${r.why})`).toBe(true);
});

test("no horizontal overflow at 390px wide", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(sw).toBeLessThanOrEqual(390);
});
