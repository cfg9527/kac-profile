import { beforeEach, describe, expect, it, vi } from "vitest";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const mockSql = vi.fn();
vi.mock("@neondatabase/serverless", () => ({
  neon: vi.fn(() => mockSql),
}));

import { ENTRY_COLUMNS, getEntries, getSongCandidates } from "./queries";
import { visitorHash } from "./queries";

function sqlText(args: unknown[]): string {
  const strings = args[0] as unknown as TemplateStringsArray | string[];
  if (Array.isArray(strings)) return (strings as string[]).join("?");
  return String(strings);
}

function capturedSql(): string[] {
  return mockSql.mock.calls.map((c) => sqlText([c[0]]));
}

beforeEach(() => {
  mockSql.mockReset();
  delete process.env.DATABASE_URL;
  delete process.env.MUSIC_DATA_FIXTURE;
  delete process.env.VERCEL_ENV;
});

describe("getEntries", () => {
  it("1. success maps rows to Entry (no copyrighted field on type or object)", async () => {
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
    mockSql.mockResolvedValueOnce([
      {
        id: 1,
        slug: "青花瓷-100d18",
        title: "青花瓷",
        category: "華語流行",
        kind: "song",
        summary: "中國風經典",
        album_ref: null,
        body_md: null,
        body_truncated: false,
      },
    ]);
    const entries = await getEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toEqual({
      id: 1,
      slug: "青花瓷-100d18",
      title: "青花瓷",
      category: "華語流行",
      kind: "song",
      summary: "中國風經典",
      albumRef: null,
      bodyMd: null,
      bodyTruncated: false,
    });
    expect(entries[0]).not.toHaveProperty("lyricsMd");
    expect(entries[0]).not.toHaveProperty("lyrics_md");
    expect(JSON.stringify(entries[0])).not.toContain("lyrics");
  });

  it("2. DATABASE_URL missing and no fixture rejects with exact message", async () => {
    delete process.env.DATABASE_URL;
    delete process.env.MUSIC_DATA_FIXTURE;
    await expect(getEntries()).rejects.toThrow(
      "DATABASE_URL is not set — the Music section needs Neon at build time (see README)",
    );
  });

  it("3. empty table returns []", async () => {
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
    mockSql.mockResolvedValueOnce([]);
    await expect(getEntries()).resolves.toEqual([]);
  });

  it("4. DB error rejects with Failed to load music entries:", async () => {
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
    mockSql.mockRejectedValueOnce(new Error("connection refused"));
    await expect(getEntries()).rejects.toThrow("Failed to load music entries:");
  });

  it("5. site query never selects copyrighted column or star", async () => {
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
    mockSql.mockResolvedValue([]);
    await getEntries().catch(() => {});
    mockSql.mockResolvedValue([]);
    await getSongCandidates().catch(() => {});
    const all = capturedSql().join("\n").toLowerCase();
    expect(all).not.toContain("lyrics_md");
    for (const q of capturedSql()) {
      expect(q).not.toMatch(/select\s+\*/i);
      expect(q).not.toContain("*");
    }
    expect(String(ENTRY_COLUMNS).toLowerCase()).not.toContain("lyrics_md");
    expect(String(ENTRY_COLUMNS)).not.toContain("*");
    const grep = execSync("grep -rn 'lyrics_md' app lib || true", {
      encoding: "utf8",
    });
    const hits = grep
      .split("\n")
      .filter(Boolean)
      .filter((l) => !l.includes(".test.ts"));
    expect(hits).toEqual([]);
    void readFileSync;
  });
});

describe("visitorHash", () => {
  it("16. deterministic, differs by day/salt, never contains IP", async () => {
    const a = visitorHash("1.2.3.4", "2026-10-06", "salt-a");
    const b = visitorHash("1.2.3.4", "2026-10-06", "salt-a");
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(visitorHash("1.2.3.4", "2026-10-07", "salt-a")).not.toBe(a);
    expect(visitorHash("1.2.3.4", "2026-10-06", "salt-b")).not.toBe(a);
    expect(visitorHash("5.6.7.8", "2026-10-06", "salt-a")).not.toBe(a);
    expect(a).not.toContain("1.2.3.4");
  });
});
