import { expect, test } from "@playwright/test";
import { DREAM_COLORS } from "../lib/theme/tokens";

/** KPP-7b RED: stars are clearly visible (>= 4 px, contrast >= 3:1 on the night sky), also with reduced motion. */

function lum(r: number, g: number, b: number): number {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function hexLum(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return lum((n >> 16) & 255, (n >> 8) & 255, n & 255);
}

async function starBoxes(page: import("@playwright/test").Page) {
  const stars = page.getByTestId("dream-star");
  const n = await stars.count();
  const boxes: { w: number; h: number }[] = [];
  for (let i = 0; i < n; i++) {
    const b = await stars.nth(i).boundingBox();
    boxes.push({ w: b?.width ?? 0, h: b?.height ?? 0 });
  }
  return boxes;
}

test("every star renders at least 4x4 px", async ({ page }) => {
  await page.goto("/");
  const boxes = await starBoxes(page);
  expect(boxes.length).toBeGreaterThanOrEqual(16);
  for (const [i, b] of boxes.entries()) {
    expect(b.w, `star ${i} width`).toBeGreaterThanOrEqual(4);
    expect(b.h, `star ${i} height`).toBeGreaterThanOrEqual(4);
  }
});

test("star colour stands out from the night sky (>= 3:1)", async ({ page }) => {
  await page.goto("/");
  const colours = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-testid=dream-star]")).map((el) => getComputedStyle(el).backgroundColor),
  );
  const night = hexLum(DREAM_COLORS.night);
  for (const c of colours) {
    const m = c.match(/rgba?\(([^)]+)\)/);
    expect(m, c).not.toBeNull();
    const [r, g, b, a] = m![1].split(",").map((x) => parseFloat(x));
    expect(Number.isFinite(a) ? a : 1, `alpha of ${c}`).toBeGreaterThanOrEqual(0.99);
    const l = lum(r, g, b);
    const ratio = (Math.max(l, night) + 0.05) / (Math.min(l, night) + 0.05);
    expect(ratio, `star ${c} vs night`).toBeGreaterThanOrEqual(3);
  }
});

test("reduced motion: stars stop twinkling but stay big and fully visible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const info = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-testid=dream-star]")).map((el) => {
      const cs = getComputedStyle(el);
      return { anim: cs.animationName, opacity: parseFloat(cs.opacity) };
    }),
  );
  expect(info.length).toBeGreaterThanOrEqual(16);
  for (const s of info) {
    expect(s.anim).toBe("none");
    expect(s.opacity).toBeGreaterThanOrEqual(0.9);
  }
  for (const b of await starBoxes(page)) {
    expect(b.w).toBeGreaterThanOrEqual(4);
    expect(b.h).toBeGreaterThanOrEqual(4);
  }
});
