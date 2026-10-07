import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CATEGORIES } from "./types";

const MIGRATION_PATH = join(__dirname, "..", "..", "db", "migrations", "004_categories.sql");

function checkBlock(): string {
  const sql = readFileSync(MIGRATION_PATH, "utf8");
  const m = sql.match(/CHECK\s*\(\s*category\s+IN\s*\(([\s\S]*?)\)\)/i);
  expect(m, "migration must contain CHECK (category IN (...))").not.toBeNull();
  return m![1];
}

describe("migration 004 categories", () => {
  it("9. migration file exists with idempotent drop/add of entries_category_check", () => {
    expect(existsSync(MIGRATION_PATH)).toBe(true);
    const sql = readFileSync(MIGRATION_PATH, "utf8");
    expect(sql).toContain("DROP CONSTRAINT IF EXISTS entries_category_check");
    expect(sql).toContain("ADD CONSTRAINT entries_category_check");
  });

  it("10. CHECK literals equal exactly the 11 CATEGORIES", () => {
    const block = checkBlock();
    const found = new Set([...block.matchAll(/'([^']*)'/g)].map((m) => m[1]));
    expect(found).toEqual(new Set(CATEGORIES));
    expect(found.size).toBe(11);
  });

  it("11. migration touches only the category constraint", () => {
    const sql = readFileSync(MIGRATION_PATH, "utf8");
    expect(sql).not.toMatch(/lyrics_md/i);
    expect(sql).not.toMatch(/lyrics/i);
    expect(sql).not.toMatch(/DROP TABLE/i);
    expect(sql).not.toMatch(/\bDELETE\b/i);
    expect(sql).not.toMatch(/\bUPDATE\b/i);
    expect(sql).not.toMatch(/TRUNCATE/i);
    expect(sql).not.toMatch(/GRANT/i);
  });
});
