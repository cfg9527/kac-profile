import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { siteContent } from "@/content/site";

/**
 * KPP-3 RED contract tests (unit/content/CI).
 * Must FAIL on main (catalog visible) and PASS after GREEN.
 * Do NOT touch app/api/recommend/route.ts, lib/music/* or their unit tests.
 */

describe("KPP-3 hide music catalog (unit)", () => {
  it("5a. app/page.tsx does not import or call getEntries", () => {
    const src = readFileSync(path.resolve("app/page.tsx"), "utf8");
    expect(src).not.toContain("getEntries");
  });

  it("5b. app/components/MusicSection.tsx does not exist", () => {
    expect(existsSync(path.resolve("app/components/MusicSection.tsx"))).toBe(false);
  });

  it("6a. zh footerNote is the new copy with no static/no-backend wording", () => {
    expect(siteContent.zh.footerNote).toBe("Desmond Cheung 用像素起嘅小公園");
    expect(siteContent.zh.footerNote).not.toContain("純靜態");
    expect(siteContent.zh.footerNote).not.toContain("冇後端");
  });

  it("6b. en footerNote is the new copy with no static/no-backend wording", () => {
    expect(siteContent.en.footerNote).toBe("A tiny pixel park built by Desmond Cheung");
    const lower = siteContent.en.footerNote.toLowerCase();
    expect(lower).not.toContain("no backend");
    expect(lower).not.toContain("static");
  });

  it("7. CI build step runs without MUSIC_DATA_FIXTURE for the home page", () => {
    const yml = readFileSync(path.resolve(".github/workflows/ci.yml"), "utf8");
    // The global env block must not hand the fixture to the build.
    const topEnv = yml.split("jobs:")[0] ?? "";
    expect(topEnv).not.toContain("MUSIC_DATA_FIXTURE");
    // The build step itself must not set the fixture either.
    const buildIdx = yml.indexOf("pnpm build");
    expect(buildIdx).toBeGreaterThan(-1);
    const buildWindow = yml.slice(Math.max(0, buildIdx - 600), buildIdx + 200);
    expect(buildWindow).not.toContain("MUSIC_DATA_FIXTURE");
  });
});
