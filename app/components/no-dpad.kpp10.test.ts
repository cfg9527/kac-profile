// KPP-10 RED: no on-screen D-pad component in the UI source.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const DIR = path.resolve("app/components");
const SOURCES = readdirSync(DIR)
  .filter((f) => f.endsWith(".tsx") && !f.includes(".test."))
  .map((f) => ({ f, src: readFileSync(path.join(DIR, f), "utf8") }));

describe("KPP-10 on-screen D-pad removed", () => {
  it("1. component sources exist (guard)", () => {
    expect(SOURCES.map((s) => s.f)).toContain("ParkScene.tsx");
  });

  it("2. no DPad component is defined or rendered", () => {
    for (const { f, src } of SOURCES) expect(src, f).not.toMatch(/\bDPad\b|\bDpad\b|\bD_PAD\b/);
  });

  it("3. no button labelled or filled with an arrow glyph", () => {
    for (const { f, src } of SOURCES) {
      expect(src, f).not.toMatch(/aria-label=["'{`]+[←↑↓→]/);
      expect(src, f).not.toMatch(/>\s*[←↑↓→]\s*</);
    }
  });

  it("4. the d-pad label copy is not used by any component", () => {
    for (const { f, src } of SOURCES) expect(src, f).not.toMatch(/dpadLabel/);
  });

  it("5. keyboard movement handler (arrows + WASD) is still wired in ParkScene (guard)", () => {
    const src = SOURCES.find((s) => s.f === "ParkScene.tsx")!.src;
    for (const k of ["arrowup", "arrowdown", "arrowleft", "arrowright", '"w"', '"a"', '"s"', '"d"']) {
      expect(src).toContain(k);
    }
    expect(src).toMatch(/onKeyDown=\{onKeyDown\}/);
  });
});
