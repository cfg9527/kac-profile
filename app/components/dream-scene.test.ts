// KPP-7 RED: deterministic backdrop data + HomeClient wiring.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { DREAM_GLINTS, DREAM_STARS, SEA_TESTID, SKY_TESTID, STAR_TESTID } from "./dream-scene";

describe("KPP-7 dream backdrop data", () => {
  it("1. at least 16 stars, all inside the sky band, unique positions", () => {
    expect(DREAM_STARS.length).toBeGreaterThanOrEqual(16);
    const seen = new Set<string>();
    for (const s of DREAM_STARS) {
      expect(s.x).toBeGreaterThanOrEqual(0);
      expect(s.x).toBeLessThanOrEqual(100);
      expect(s.y).toBeGreaterThanOrEqual(0);
      expect(s.y).toBeLessThanOrEqual(60);
      expect([1, 2, 3]).toContain(s.size);
      expect(s.delay).toBeGreaterThanOrEqual(0);
      seen.add(`${s.x},${s.y}`);
    }
    expect(seen.size).toBe(DREAM_STARS.length);
  });

  it("2. at least 6 wave glints inside the sea band", () => {
    expect(DREAM_GLINTS.length).toBeGreaterThanOrEqual(6);
    for (const g of DREAM_GLINTS) {
      expect(g.x).toBeGreaterThanOrEqual(0);
      expect(g.x).toBeLessThanOrEqual(100);
      expect(g.y).toBeGreaterThanOrEqual(60);
      expect(g.y).toBeLessThanOrEqual(100);
      expect(g.w).toBeGreaterThan(0);
      expect(g.w).toBeLessThanOrEqual(20);
      expect(g.delay).toBeGreaterThanOrEqual(0);
    }
  });

  it("3. deterministic: no Math.random / Date in backdrop sources", () => {
    for (const f of ["dream-scene.ts", "DreamBackdrop.tsx"]) {
      const src = readFileSync(path.resolve("app/components", f), "utf8");
      expect(src, f).not.toMatch(/Math\.random|Date\.now|new Date/);
    }
  });

  it("4. DreamBackdrop renders the contract test ids, aria-hidden, no <img>", () => {
    const src = readFileSync(path.resolve("app/components/DreamBackdrop.tsx"), "utf8");
    expect(src).toMatch(/SKY_TESTID/);
    expect(src).toMatch(/SEA_TESTID/);
    expect(src).toMatch(/STAR_TESTID/);
    expect(src).toMatch(/DREAM_STARS/);
    expect(src).toMatch(/DREAM_GLINTS/);
    expect(src).toMatch(/aria-hidden/);
    expect(src).not.toMatch(/<img\b|next\/image/);
    expect([SKY_TESTID, SEA_TESTID, STAR_TESTID]).toEqual(["dream-sky", "dream-sea", "dream-star"]);
  });

  it("5. HomeClient mounts DreamBackdrop", () => {
    const src = readFileSync(path.resolve("app/components/HomeClient.tsx"), "utf8");
    expect(src).toMatch(/import\s+DreamBackdrop\s+from\s+["']\.\/DreamBackdrop["']/);
    expect(src).toMatch(/<DreamBackdrop\s*\/>/);
  });
});
