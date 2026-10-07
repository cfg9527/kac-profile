// KPP-7 RED: pixel animations exist and are all disabled under prefers-reduced-motion.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const css = readFileSync(path.resolve("app/globals.css"), "utf8");

/** Split CSS into the reduced-motion block(s) and everything else. */
function splitReduced(src: string): { reduced: string; rest: string } {
  let reduced = "";
  let rest = "";
  let i = 0;
  const re = /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)\s*\{/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    rest += src.slice(i, m.index);
    let depth = 1;
    let j = re.lastIndex;
    while (j < src.length && depth > 0) {
      if (src[j] === "{") depth++;
      else if (src[j] === "}") depth--;
      j++;
    }
    reduced += src.slice(re.lastIndex, j - 1);
    i = j;
    re.lastIndex = j;
  }
  rest += src.slice(i);
  return { reduced, rest };
}

/** Class selectors whose rule declares a running animation. */
function animatedClasses(src: string): string[] {
  const out = new Set<string>();
  for (const m of src.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const body = m[2];
    const anim = body.match(/(^|;|\s)animation(-name)?\s*:\s*([^;]+)/);
    if (!anim || /^\s*none\s*$/.test(anim[3])) continue;
    for (const cls of m[1].matchAll(/\.([A-Za-z0-9_-]+)/g)) out.add(cls[1]);
  }
  return [...out];
}

const { reduced, rest } = splitReduced(css);

describe("KPP-7 pixel motion", () => {
  it("1. star twinkle, wave glint and shooting-star classes exist with stepped (pixel) keyframes", () => {
    for (const cls of ["dn-twinkle", "dn-glint", "dn-shooting-star"]) {
      const m = rest.match(new RegExp(`\\.${cls}\\s*\\{([^}]*)\\}`));
      expect(m, `.${cls} rule missing`).not.toBeNull();
      expect(m![1], `.${cls} uses steps()`).toMatch(/animation\s*:[^;]*steps\(/);
      const name = m![1].match(/animation\s*:\s*([A-Za-z0-9_-]+)/)?.[1];
      expect(name, `.${cls} animation name`).toBeTruthy();
      expect(rest).toMatch(new RegExp(`@keyframes\\s+${name}\\s*\\{`));
    }
  });

  it("2. a prefers-reduced-motion: reduce block exists", () => {
    expect(reduced.length).toBeGreaterThan(0);
  });

  it("3. every animated class is switched off under reduced motion", () => {
    const classes = animatedClasses(rest);
    expect(classes).toEqual(expect.arrayContaining(["dn-twinkle", "dn-glint", "dn-shooting-star"]));
    const off = new Set<string>();
    for (const m of reduced.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (!/animation\s*:\s*none/.test(m[2])) continue;
      for (const cls of m[1].matchAll(/\.([A-Za-z0-9_-]+)/g)) off.add(cls[1]);
    }
    for (const c of classes) expect(off.has(c), `.${c} must be animation: none under reduced motion`).toBe(true);
  });

  it("4. smooth scrolling is turned off under reduced motion", () => {
    expect(reduced).toMatch(/scroll-behavior\s*:\s*auto/);
  });
});
