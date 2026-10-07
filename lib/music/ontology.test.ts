import { describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { validateOntology } from "./ontology";

const FIX = path.resolve("lib/music/__fixtures__/ontology");

function readJson(name: string): unknown {
  return JSON.parse(readFileSync(path.join(FIX, name), "utf8"));
}

function readText(name: string): string {
  return readFileSync(path.join(FIX, name), "utf8");
}

describe("KPP-4 ontology validator (contract-first)", () => {
  it("1. normal page (years/dates, cause->effect) validates ok:true", () => {
    const raw = readJson("normal.ontology.json");
    const bodyMd = readText("normal.body.md");
    const lyricsMd = readText("normal.lyrics.md");
    const res = validateOntology(raw, { bodyMd, lyricsMd });
    expect(res.ok).toBe(true);
  });

  it("2. no-date page: timeline [] + year null ok:true; invented year 1999 ok:false", () => {
    const raw = readJson("nodate.ontology.json") as Record<string, unknown>;
    const bodyMd = readText("nodate.body.md");
    const okRes = validateOntology(raw, { bodyMd, lyricsMd: null });
    expect(okRes.ok).toBe(true);

    const withYear = {
      ...(raw as object),
      song: { ...((raw as { song: object }).song as object), year: 1999 },
    };
    const badRes = validateOntology(withYear, { bodyMd, lyricsMd: null });
    expect(badRes.ok).toBe(false);
    if (!badRes.ok) {
      expect(badRes.errors.join("\n")).toContain("1999");
    }
  });

  it("3. schema-invalid (missing theme, intensity 9, unknown kind, extra key) ok:false with each problem named, never throws", () => {
    const raw = readJson("invalid.ontology.json");
    const bodyMd = readText("normal.body.md");
    let res: ReturnType<typeof validateOntology>;
    expect(() => {
      res = validateOntology(raw, { bodyMd, lyricsMd: null });
    }).not.toThrow();
    const out = res!;
    expect(out.ok).toBe(false);
    if (!out.ok) {
      const joined = out.errors.join("\n");
      expect(joined).toContain("theme");
      expect(joined).toMatch(/intensity|greater than|less than|Number/);
      expect(joined).toMatch(/kind|millennium|Invalid enum|Invalid option/);
      expect(joined).toMatch(/extraKey|nrecognized/);
    }
  });

  it("4. evidence not present in body ok:false naming the path", () => {
    const raw = readJson("ungrounded.ontology.json");
    const bodyMd = readText("ungrounded.body.md");
    const res = validateOntology(raw, { bodyMd, lyricsMd: null });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.errors.join("\n")).toMatch(/theme.*evidence|evidence/i);
    }
  });

  it("5. lyric copy in imagery label/evidence (even though quoted in body) ok:false", () => {
    const raw = readJson("lyric.ontology.json");
    const bodyMd = readText("lyric.body.md");
    const lyricsMd = readText("lyric.lyrics.md");
    const res = validateOntology(raw, { bodyMd, lyricsMd });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.errors.join("\n").toLowerCase()).toContain("lyric");
    }
  });

  it("6. migration file contains exactly the ALTER + GRANT SELECT (ontology); no lyrics_md", () => {
    const sql = readFileSync(path.resolve("db/migrations/003_ontology.sql"), "utf8");
    expect(sql).toContain("ALTER TABLE entries ADD COLUMN IF NOT EXISTS ontology jsonb");
    expect(sql).toContain("GRANT SELECT (ontology) ON entries TO site_reader, site_app");
    expect(sql.toLowerCase()).not.toContain("lyrics_md");
  });

  it("7. CLI exit 0 on fixture 1, exit 1 on fixture 3", () => {
    const okCmd = `pnpm ontology:validate ${path.join(FIX, "normal.ontology.json")} ${path.join(FIX, "normal.body.md")} ${path.join(FIX, "normal.lyrics.md")}`;
    const okOut = execSync(okCmd, { encoding: "utf8" });
    expect(JSON.parse(okOut.slice(okOut.indexOf("{"))).ok).toBe(true);

    const badCmd = `pnpm ontology:validate ${path.join(FIX, "invalid.ontology.json")} ${path.join(FIX, "normal.body.md")}`;
    let failed = false;
    try {
      execSync(badCmd, { encoding: "utf8", stdio: "pipe" });
    } catch (e) {
      failed = true;
      const err = e as { status?: number; stdout?: string };
      expect(err.status).toBe(1);
    }
    expect(failed).toBe(true);
  });
});
