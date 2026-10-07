// KPP-7 RED/guard: KaC's style reference picture is never committed or referenced.
import { describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";

/** sha256 of the private style reference (hash only; the picture itself is not in the repo). */
const REFERENCE_SHA256 = "38b785a2cd1ac8d353435dc0969c4510e810dc411e9747a479dd87a7b1b3f445";
const SELF = "app/kpp7-assets.test.ts";
const RASTER = /\.(png|jpe?g|gif|webp|avif|bmp)$/i;
const RASTER_ALLOW = /^docs\/screenshots\/[^/]+\.png$/;

function tracked(): string[] {
  return execSync("git ls-files -co --exclude-standard", { encoding: "utf8" })
    .split("\n")
    .filter(Boolean)
    .filter((f) => !f.startsWith("node_modules/") && !f.startsWith(".next/"));
}

describe("KPP-7 no reference asset", () => {
  it("1. no file in the repo is byte-identical to the reference picture", () => {
    for (const f of tracked()) {
      let st;
      try {
        st = statSync(f);
      } catch {
        continue;
      }
      if (!st.isFile() || st.size < 10_000) continue;
      const h = createHash("sha256").update(readFileSync(f)).digest("hex");
      expect(h, f).not.toBe(REFERENCE_SHA256);
    }
  });

  it("2. no raster images outside docs/screenshots (art is CSS/SVG)", () => {
    const bad = tracked().filter((f) => RASTER.test(f) && !RASTER_ALLOW.test(f));
    expect(bad).toEqual([]);
  });

  it("3. no source file references the reference picture or the handoff folder", () => {
    const text = tracked().filter(
      (f) =>
        f !== SELF &&
        /\.(ts|tsx|js|mjs|css|json|md|yml|yaml)$/.test(f) &&
        !f.startsWith("graphify-out/") &&
        f !== "pnpm-lock.yaml",
    );
    for (const f of text) {
      const src = readFileSync(path.resolve(f), "utf8");
      expect(src, f).not.toMatch(/reference\.jpg|kac-profile-style|\/workspace\/handoffs/);
    }
  });
});
