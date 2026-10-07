// KPP-7b RED: bigger, clearly visible stars; still off under reduced motion.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { DREAM_STARS, STAR_PIXEL } from "./dream-scene";

const MIN_STAR_PX = 4;
const MAX_STAR_PX = 16;
const css = readFileSync(path.resolve("app/globals.css"), "utf8");

describe("KPP-7b star size", () => {
  it("1. smallest star renders >= 4 px and biggest <= 16 px", () => {
    const sizes = DREAM_STARS.map((s) => s.size * STAR_PIXEL);
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(MIN_STAR_PX);
    expect(Math.max(...sizes)).toBeLessThanOrEqual(MAX_STAR_PX);
  });

  it("2. DreamBackdrop sizes stars with STAR_PIXEL (no raw size-as-px)", () => {
    const src = readFileSync(path.resolve("app/components/DreamBackdrop.tsx"), "utf8");
    expect(src).toContain("STAR_PIXEL");
    expect(src).not.toMatch(/width:\s*s\.size\s*[,}]/);
    expect(src).not.toMatch(/height:\s*s\.size\s*[,}]/);
  });
});

describe("KPP-7b star visibility", () => {
  function twinkleKeyframes(): string {
    const rule = css.match(/\.dn-twinkle\s*\{([^}]*)\}/);
    expect(rule, ".dn-twinkle rule").not.toBeNull();
    const name = rule![1].match(/animation\s*:\s*([A-Za-z0-9_-]+)/)?.[1];
    expect(name, "twinkle animation name").toBeTruthy();
    const start = css.search(new RegExp(`@keyframes\\s+${name}\\s*\\{`));
    expect(start).toBeGreaterThan(-1);
    let depth = 0;
    let i = css.indexOf("{", start);
    const from = i;
    for (; i < css.length; i++) {
      if (css[i] === "{") depth++;
      else if (css[i] === "}" && --depth === 0) break;
    }
    return css.slice(from, i + 1);
  }

  it("3. twinkle never dims a star below 0.5 opacity", () => {
    const kf = twinkleKeyframes();
    const ops = [...kf.matchAll(/opacity\s*:\s*([0-9.]+)/g)].map((m) => parseFloat(m[1]));
    expect(ops.length).toBeGreaterThan(0);
    expect(Math.min(...ops)).toBeGreaterThanOrEqual(0.5);
  });
});

describe("KPP-7b cleanup", () => {
  it("4. no leftover TODO(KPP-7) / TODO(KPP-7b) markers in shipped source", () => {
    for (const f of [
      "content/site.ts",
      "lib/music/recommend.ts",
      "lib/theme/tokens.ts",
      "app/components/dream-scene.ts",
      "app/components/DreamBackdrop.tsx",
    ]) {
      const src = readFileSync(path.resolve(f), "utf8");
      expect(src, f).not.toMatch(/TODO\(KPP-7b?\)/);
    }
  });
});
