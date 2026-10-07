import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockSql = vi.fn();
vi.mock("@neondatabase/serverless", () => ({
  neon: vi.fn(() => mockSql),
}));

import { getEntries, getSongCandidates } from "./queries";
import { isCategory } from "./types";

function dbEntryRow(o: { id: number; slug: string; title: string; category: string }) {
  return {
    id: o.id,
    slug: o.slug,
    title: o.title,
    category: o.category,
    kind: "song",
    summary: `syn summary ${o.slug}`,
    album_ref: null,
    body_md: null,
    body_truncated: false,
  };
}

let warnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  mockSql.mockReset();
  delete process.env.DATABASE_URL;
  delete process.env.MUSIC_DATA_FIXTURE;
  delete process.env.VERCEL_ENV;
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  warnSpy.mockRestore();
  delete process.env.DATABASE_URL;
  delete process.env.MUSIC_DATA_FIXTURE;
  delete process.env.VERCEL_ENV;
});

describe("queries category filtering", () => {
  it("4. getEntries maps 爵士 and J-Pop rows through unchanged", async () => {
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
    mockSql.mockResolvedValueOnce([
      dbEntryRow({ id: 1, slug: "syn-jazz-1", title: "測試爵士甲", category: "爵士" }),
      dbEntryRow({ id: 2, slug: "syn-jpop-1", title: "測試JPop甲", category: "J-Pop" }),
    ]);
    const entries = await getEntries();
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({ slug: "syn-jazz-1", title: "測試爵士甲", category: "爵士" });
    expect(entries[1]).toMatchObject({ slug: "syn-jpop-1", title: "測試JPop甲", category: "J-Pop" });
    for (const e of entries) {
      expect(isCategory(e.category)).toBe(true);
    }
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("5. getEntries drops unknown categories with exactly one warn, never throws", async () => {
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
    mockSql.mockResolvedValueOnce([
      dbEntryRow({ id: 1, slug: "syn-jazz-1", title: "測試爵士甲", category: "爵士" }),
      dbEntryRow({ id: 2, slug: "syn-bad-1", title: "測試壞甲", category: "Bossa" }),
      dbEntryRow({ id: 3, slug: "syn-zh-1", title: "測試華語甲", category: "華語流行" }),
    ]);
    const entries = await getEntries();
    expect(entries).toHaveLength(2);
    expect(entries.map((e) => e.slug)).toEqual(["syn-jazz-1", "syn-zh-1"]);
    for (const e of entries) {
      expect(isCategory(e.category)).toBe(true);
    }
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith("[music] dropped entry with unknown category", {
      slug: "syn-bad-1",
      category: "Bossa",
    });
  });

  it("6. getSongCandidates on the DB path passes K-pop/跨界 through and drops unknown", async () => {
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
    mockSql.mockResolvedValueOnce([
      { slug: "syn-kpop-1", title: "測試KPop甲", category: "K-pop", summary: "syn summary syn-kpop-1" },
      { slug: "syn-xover-1", title: "測試跨界甲", category: "跨界", summary: "syn summary syn-xover-1" },
    ]);
    const pass = await getSongCandidates();
    expect(pass).toHaveLength(2);
    expect(pass).toMatchObject([
      { slug: "syn-kpop-1", category: "K-pop" },
      { slug: "syn-xover-1", category: "跨界" },
    ]);
    for (const c of pass) {
      expect(isCategory(c.category)).toBe(true);
    }

    mockSql.mockResolvedValueOnce([
      { slug: "syn-kpop-1", title: "測試KPop甲", category: "K-pop", summary: "syn summary syn-kpop-1" },
      { slug: "syn-bad-1", title: "測試壞甲", category: "Bossa", summary: "syn summary syn-bad-1" },
      { slug: "syn-xover-1", title: "測試跨界甲", category: "跨界", summary: "syn summary syn-xover-1" },
    ]);
    const mixed = await getSongCandidates();
    expect(mixed).toHaveLength(2);
    expect(mixed.map((c) => c.slug)).toEqual(["syn-kpop-1", "syn-xover-1"]);
    for (const c of mixed) {
      expect(isCategory(c.category)).toBe(true);
    }
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith("[music] dropped entry with unknown category", {
      slug: "syn-bad-1",
      category: "Bossa",
    });
  });

  it("7. getSongCandidates on the fixture path passes 東南亞 through and drops unknown", async () => {
    const dir = mkdtempSync(join(tmpdir(), "kpp5-"));
    try {
      const file = join(dir, "entries.json");
      writeFileSync(
        file,
        JSON.stringify([
          { id: 1, slug: "syn-sea-1", title: "測試東南亞甲", category: "東南亞", kind: "song", summary: "syn summary syn-sea-1" },
          { id: 2, slug: "syn-bad-1", title: "測試壞甲", category: "Bossa", kind: "song", summary: "syn summary syn-bad-1" },
        ]),
        "utf8",
      );
      process.env.MUSIC_DATA_FIXTURE = file;
      const candidates = await getSongCandidates();
      expect(candidates).toHaveLength(1);
      expect(candidates[0]).toMatchObject({ slug: "syn-sea-1", category: "東南亞" });
      for (const c of candidates) {
        expect(isCategory(c.category)).toBe(true);
      }
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith("[music] dropped entry with unknown category", {
        slug: "syn-bad-1",
        category: "Bossa",
      });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
