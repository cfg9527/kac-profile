import { describe, expect, it } from "vitest";
import { CATEGORIES, isCategory, type Category } from "./types";

const OLD = ["華語流行", "西方搖滾", "電子Hip-Hop", "參考資料", "分冊目錄"] as const;
const NEW = ["爵士", "J-Pop", "K-pop", "古典", "東南亞", "跨界"] as const;

describe("categories contract", () => {
  it("1. CATEGORIES has length 11, no duplicates, contains old and new values", () => {
    expect(CATEGORIES).toHaveLength(11);
    expect(new Set(CATEGORIES).size).toBe(CATEGORIES.length);
    for (const v of OLD) {
      expect(CATEGORIES).toContain(v);
    }
    for (const v of NEW) {
      expect(CATEGORIES).toContain(v);
    }
  });

  it("2. isCategory accepts the 11 values and rejects lookalikes", () => {
    for (const v of CATEGORIES) {
      expect(isCategory(v)).toBe(true);
    }
    const bad: unknown[] = ["Bossa", "", "jazz", "j-pop", "K-Pop", " 爵士", null, undefined, 1, {}];
    for (const v of bad) {
      expect(isCategory(v)).toBe(false);
    }
  });

  it("3. new categories are assignable to Category", () => {
    const xs: Category[] = ["爵士", "J-Pop", "K-pop", "古典", "東南亞", "跨界"];
    expect(xs).toHaveLength(6);
  });
});
