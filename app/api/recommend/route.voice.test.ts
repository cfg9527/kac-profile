// KPP-7 RED: /api/recommend sends the new voice and clamps reasons with clampReason.
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("ai", () => ({
  generateText: vi.fn(),
  Output: { object: vi.fn((arg: unknown) => arg) },
  gateway: vi.fn((m: string) => m),
}));

vi.mock("@/lib/music/queries", async (importOriginal) => {
  const mod = (await importOriginal()) as Record<string, unknown>;
  return { ...mod, getSongCandidates: vi.fn(), checkAndCountUsage: vi.fn() };
});

import { generateText } from "ai";
import { POST } from "./route";
import { checkAndCountUsage, getSongCandidates } from "@/lib/music/queries";
import { REASON_MAX_CHARS, REASON_VOICE } from "@/lib/music/recommend";
import type { SongCandidate } from "@/lib/music/types";

const mockGenerate = vi.mocked(generateText);
const mockCandidates = vi.mocked(getSongCandidates);
const mockUsage = vi.mocked(checkAndCountUsage);

const CANDS: SongCandidate[] = [
  { slug: "syn-sea-1", title: "測試歌海", category: "華語流行", summary: "syn sea", ontology: { themes: ["夜海"], emotions: ["平靜"], imagery: ["浪"], artist: null } },
  { slug: "syn-star-2", title: "測試歌星", category: "爵士", summary: "syn star", ontology: null },
];

function req(query: string) {
  return new Request("http://localhost/api/recommend", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "9.9.9.9" },
    body: JSON.stringify({ query }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGenerate.mockReset();
  process.env.AI_GATEWAY_MODEL = "test/model";
  process.env.RATE_LIMIT_SALT = "test-salt-32-bytes-long-for-tests";
  mockUsage.mockResolvedValue("ok");
  mockCandidates.mockResolvedValue(CANDS);
  vi.spyOn(console, "info").mockImplementation(() => {});
});

describe("KPP-7 POST /api/recommend voice", () => {
  it("1. prompt sent to the model contains REASON_VOICE", async () => {
    mockGenerate.mockResolvedValue({ output: { picks: [{ slug: "syn-sea-1", reason: "浪" }] } } as never);
    const res = await POST(req("想聽海") as never);
    expect(res.status).toBe(200);
    const args = mockGenerate.mock.calls.at(-1)?.[0] as unknown as { prompt: string };
    expect(REASON_VOICE.length).toBeGreaterThan(0);
    expect(args.prompt).toContain(REASON_VOICE);
  });

  it("2. reasons are whitespace-collapsed and clamped to 120 code points without broken emoji", async () => {
    const long = "星\n落\n海".padEnd(10, "光") + "夢".repeat(108) + "🐋🐋🐋🐋";
    mockGenerate.mockResolvedValue({
      output: { picks: [{ slug: "syn-sea-1", reason: long }, { slug: "syn-star-2", reason: "  雲\t\t泡  " }] },
    } as never);
    const res = await POST(req("想聽海") as never);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; picks: { slug: string; title: string; reason: string }[] };
    expect(body.ok).toBe(true);
    const [a, b] = body.picks;
    expect(a.title).toBe("測試歌海");
    expect(Array.from(a.reason).length).toBeLessThanOrEqual(REASON_MAX_CHARS);
    expect(a.reason).not.toMatch(/\s{2,}|\n|\t/);
    expect(a.reason).not.toMatch(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/);
    expect(a.reason.startsWith("星 落 海")).toBe(true);
    expect(b.reason).toBe("雲 泡");
    expect(b.title).toBe("測試歌星");
  });

  it("3. route uses clampReason (no ad-hoc slice of the reason)", async () => {
    const { readFileSync } = await import("node:fs");
    const path = await import("node:path");
    const src = readFileSync(path.resolve("app/api/recommend/route.ts"), "utf8");
    expect(src).toContain("clampReason");
    expect(src).not.toMatch(/reason[^\n]*\.slice\(0,\s*120\)/);
  });
});
