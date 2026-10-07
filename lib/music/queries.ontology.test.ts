// KPP-6 RED tests: candidates load the ontology column (label-only), never lyrics or body.
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockSql = vi.fn();
vi.mock("@neondatabase/serverless", () => ({
  neon: vi.fn(() => mockSql),
}));

import { getSongCandidates } from "./queries";

function sqlText(call: unknown[]): string {
  const strings = call[0] as unknown as TemplateStringsArray | string[];
  if (Array.isArray(strings)) return (strings as string[]).join("?");
  return String(strings);
}

const SYN_ONTOLOGY = {
  version: 1,
  song: { title: "測試歌雨", artist: "虛構歌手", album: null, year: null },
  theme: [{ label: "雨夜離別", evidence: "EVIDENCE_SENTINEL_1 引文" }],
  emotions: [{ label: "寂寞", intensity: 3, evidence: "EVIDENCE_SENTINEL_2 引文" }],
  timeline: [],
  causality: [],
  imagery: [{ label: "窗外雨聲", evidence: "EVIDENCE_SENTINEL_3 引文" }],
  links: [],
};
const LITE = { themes: ["雨夜離別"], emotions: ["寂寞"], imagery: ["窗外雨聲"], artist: "虛構歌手" };

let warnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  mockSql.mockReset();
  delete process.env.MUSIC_DATA_FIXTURE;
  delete process.env.VERCEL_ENV;
  process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  warnSpy.mockRestore();
  delete process.env.DATABASE_URL;
  delete process.env.MUSIC_DATA_FIXTURE;
});

describe("KPP-6 getSongCandidates with ontology", () => {
  it("1. SQL selects ontology, never lyrics_md / body_md / *", async () => {
    mockSql.mockResolvedValueOnce([]);
    await getSongCandidates();
    expect(mockSql).toHaveBeenCalledTimes(1);
    const q = sqlText(mockSql.mock.calls[0]).toLowerCase();
    expect(q).toMatch(/\bontology\b/);
    expect(q).toContain("kind = 'song'");
    expect(q).not.toContain("lyrics_md");
    expect(q).not.toContain("body_md");
    expect(q).not.toContain("*");
  });

  it("2. maps ontology to label-only OntologyLite; null / missing -> null; only whitelisted keys", async () => {
    mockSql.mockResolvedValueOnce([
      {
        slug: "syn-rain-1",
        title: "測試歌雨",
        category: "華語流行",
        summary: "syn summary rain",
        ontology: SYN_ONTOLOGY,
        lyrics_md: "LYRIC_SENTINEL_row",
        body_md: "BODY_SENTINEL_row",
      },
      { slug: "syn-null-1", title: "測試寂寞歌", category: "爵士", summary: "syn summary null", ontology: null },
      { slug: "syn-old-1", title: "測試舊歌", category: "K-pop", summary: "syn summary old" },
    ]);
    const out = await getSongCandidates();
    expect(out).toEqual([
      { slug: "syn-rain-1", title: "測試歌雨", category: "華語流行", summary: "syn summary rain", ontology: LITE },
      { slug: "syn-null-1", title: "測試寂寞歌", category: "爵士", summary: "syn summary null", ontology: null },
      { slug: "syn-old-1", title: "測試舊歌", category: "K-pop", summary: "syn summary old", ontology: null },
    ]);
    const s = JSON.stringify(out);
    for (const bad of ["LYRIC_SENTINEL", "BODY_SENTINEL", "EVIDENCE_SENTINEL"]) expect(s).not.toContain(bad);
  });

  it("3. fixture path (MUSIC_DATA_FIXTURE) maps ontology the same way", async () => {
    const dir = mkdtempSync(join(tmpdir(), "kpp6-"));
    try {
      const file = join(dir, "entries.json");
      writeFileSync(
        file,
        JSON.stringify([
          { id: 1, slug: "syn-rain-1", title: "測試歌雨", category: "華語流行", kind: "song", summary: "syn summary rain", ontology: SYN_ONTOLOGY },
          { id: 2, slug: "syn-null-1", title: "測試寂寞歌", category: "爵士", kind: "song", summary: "syn summary null" },
          { id: 3, slug: "syn-album-1", title: "測試專輯", category: "爵士", kind: "album", summary: "syn album" },
        ]),
        "utf8",
      );
      process.env.MUSIC_DATA_FIXTURE = file;
      const out = await getSongCandidates();
      expect(out.map((c) => c.slug)).toEqual(["syn-rain-1", "syn-null-1"]);
      expect(out[0].ontology).toEqual(LITE);
      expect(out[1].ontology).toBeNull();
      expect(mockSql).not.toHaveBeenCalled();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("4. DB without the ontology column (42703) falls back to the legacy SELECT with one warn", async () => {
    mockSql.mockRejectedValueOnce(Object.assign(new Error('column "ontology" does not exist'), { code: "42703" }));
    mockSql.mockResolvedValueOnce([{ slug: "syn-old-1", title: "測試舊歌", category: "K-pop", summary: "syn summary old" }]);
    const out = await getSongCandidates();
    expect(out).toEqual([{ slug: "syn-old-1", title: "測試舊歌", category: "K-pop", summary: "syn summary old", ontology: null }]);
    expect(mockSql).toHaveBeenCalledTimes(2);
    const second = sqlText(mockSql.mock.calls[1]).toLowerCase();
    expect(second).not.toContain("ontology");
    expect(second).not.toContain("lyrics_md");
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith("[music] ontology column missing; recommending without ontology");
  });

  it("5. any other DB error still rejects with Failed to load music entries:", async () => {
    mockSql.mockRejectedValueOnce(Object.assign(new Error("connection refused"), { code: "08006" }));
    await expect(getSongCandidates()).rejects.toThrow("Failed to load music entries:");
    expect(mockSql).toHaveBeenCalledTimes(1);
  });
});
