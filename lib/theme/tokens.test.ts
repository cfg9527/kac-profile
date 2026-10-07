// KPP-7 RED: dream pixel night-sea palette + WCAG AA contrast.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  AA_LARGE,
  AA_NORMAL,
  DREAM_COLORS,
  TEXT_PAIRS,
  contrastRatio,
  cssVarName,
  relativeLuminance,
  type DreamColorName,
} from "./tokens";

const HEX = /^#[0-9a-f]{6}$/i;
const css = readFileSync(path.resolve("app/globals.css"), "utf8");

function hue(hex: string): { h: number; s: number; l: number } {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return { h, s, l };
}

describe("KPP-7 contrast maths", () => {
  it("1. relativeLuminance: black 0, white 1, rejects bad input", () => {
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 5);
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 5);
    expect(relativeLuminance("#FF0000")).toBeCloseTo(0.2126, 4);
    expect(() => relativeLuminance("teal")).toThrow();
    expect(() => relativeLuminance("#fff")).toThrow();
  });

  it("2. contrastRatio: 21 for black/white, symmetric, known pair", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 3);
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 3);
    expect(contrastRatio("#777777", "#ffffff")).toBeCloseTo(4.48, 2);
    expect(contrastRatio("#123456", "#123456")).toBeCloseTo(1, 5);
  });
});

describe("KPP-7 palette", () => {
  it("3. every token is a #rrggbb colour and tokens are distinct", () => {
    const values = Object.values(DREAM_COLORS);
    for (const [k, v] of Object.entries(DREAM_COLORS)) expect(v, k).toMatch(HEX);
    expect(new Set(values.map((v) => v.toLowerCase())).size).toBe(values.length);
  });

  it("4. palette reads as a night sea: dark night/deep/panel, teal glow, orange-red ember, purple violet", () => {
    for (const k of ["night", "deep", "panel"] as DreamColorName[]) {
      expect(relativeLuminance(DREAM_COLORS[k]), `${k} must be dark`).toBeLessThan(0.06);
      const { h } = hue(DREAM_COLORS[k]);
      expect(h, `${k} hue should be blue/indigo/purple`).toBeGreaterThanOrEqual(200);
      expect(h, `${k} hue should be blue/indigo/purple`).toBeLessThanOrEqual(300);
    }
    const teal = hue(DREAM_COLORS.glowTeal);
    expect(teal.h).toBeGreaterThanOrEqual(155);
    expect(teal.h).toBeLessThanOrEqual(195);
    expect(relativeLuminance(DREAM_COLORS.glowTeal)).toBeGreaterThan(0.35);
    const ember = hue(DREAM_COLORS.ember);
    expect(ember.h <= 25 || ember.h >= 345, "ember is orange-red").toBe(true);
    const dusk = hue(DREAM_COLORS.dusk);
    expect(dusk.h).toBeGreaterThanOrEqual(15);
    expect(dusk.h).toBeLessThanOrEqual(45);
    const violet = hue(DREAM_COLORS.violet);
    expect(violet.h).toBeGreaterThanOrEqual(250);
    expect(violet.h).toBeLessThanOrEqual(300);
    const magenta = hue(DREAM_COLORS.magenta);
    expect(magenta.h).toBeGreaterThanOrEqual(300);
    expect(magenta.h).toBeLessThanOrEqual(345);
  });

  it("5. every TEXT_PAIRS entry passes WCAG AA", () => {
    expect(TEXT_PAIRS.length).toBeGreaterThanOrEqual(10);
    for (const p of TEXT_PAIRS) {
      const ratio = contrastRatio(DREAM_COLORS[p.fg], DREAM_COLORS[p.bg]);
      expect(ratio, `${p.name}: ${p.fg} on ${p.bg} = ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(
        p.large ? AA_LARGE : AA_NORMAL,
      );
    }
  });

  it("6. TEXT_PAIRS keeps the contract pairs (none removed, none downgraded to large)", () => {
    const keys = TEXT_PAIRS.map((p) => `${p.fg}/${p.bg}${p.large ? "/L" : ""}`);
    for (const k of [
      "moon/night",
      "mist/night",
      "moon/panel",
      "mist/panel",
      "glowTeal/panel",
      "moon/deep",
      "mist/deep",
      "ink/glowTeal",
      "ink/dusk",
      "ink/foam",
    ]) {
      expect(keys).toContain(k);
    }
  });
});

describe("KPP-7 globals.css uses the tokens", () => {
  it("7. defines --color-dn-* for every token with the same value", () => {
    for (const [k, v] of Object.entries(DREAM_COLORS)) {
      const name = cssVarName(k as DreamColorName);
      const m = css.match(new RegExp(`${name}\\s*:\\s*(#[0-9a-fA-F]{6})\\s*;`));
      expect(m, `${name} missing in globals.css`).not.toBeNull();
      expect(m![1].toLowerCase(), name).toBe(v.toLowerCase());
    }
  });

  function rule(selector: string): string {
    const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const m = css.match(new RegExp(`(^|\\n)\\s*${esc}\\s*\\{([^}]*)\\}`));
    expect(m, `rule ${selector} missing`).not.toBeNull();
    return m![2];
  }

  it("8. body, card, button and chip rules use dn tokens (no legacy garden colours)", () => {
    const body = rule("body");
    expect(body).toMatch(/background(-color)?\s*:[^;]*var\(--color-dn-night\)/);
    expect(body).toMatch(/(^|[^-])color\s*:\s*var\(--color-dn-moon\)/);
    const card = rule(".pg-card");
    expect(card).toMatch(/background(-color)?\s*:\s*var\(--color-dn-panel\)/);
    expect(card).toMatch(/(^|[^-])color\s*:\s*var\(--color-dn-moon\)/);
    const btn = rule(".pg-btn");
    expect(btn).toMatch(/background(-color)?\s*:\s*var\(--color-dn-glow-teal\)/);
    expect(btn).toMatch(/(^|[^-])color\s*:\s*var\(--color-dn-ink\)/);
    expect(rule(".pg-btn--pink")).toMatch(/var\(--color-dn-dusk\)/);
    expect(rule(".pg-btn--cream")).toMatch(/var\(--color-dn-foam\)/);
    expect(rule(".pg-chip")).toMatch(/var\(--color-dn-dusk\)/);
    for (const r of [body, card, btn]) {
      expect(r).not.toMatch(/--color-pg-(sky|cream|yellow|grass)/);
    }
  });

  it("9. no raster url() in CSS (all art is CSS/SVG made in-repo)", () => {
    expect(css).not.toMatch(/url\([^)]*\.(png|jpe?g|webp|gif|avif)/i);
  });

  it("10. components do not hard-code light surfaces that break light-on-dark text", () => {
    for (const f of ["HomeClient.tsx", "Recommender.tsx", "SectionPopup.tsx", "ParkScene.tsx"]) {
      const src = readFileSync(path.resolve("app/components", f), "utf8");
      expect(src, f).not.toMatch(/\bbg-white\b/);
    }
  });
});
