// KPP-7b RED: the route sends the musical-facts rule to the model.
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
import { MUSIC_FACTS_RULE } from "@/lib/music/recommend";

const mockGenerate = vi.mocked(generateText);

beforeEach(() => {
  vi.clearAllMocks();
  mockGenerate.mockReset();
  process.env.AI_GATEWAY_MODEL = "test/model";
  process.env.RATE_LIMIT_SALT = "test-salt-32-bytes-long-for-tests";
  vi.mocked(checkAndCountUsage).mockResolvedValue("ok");
  vi.mocked(getSongCandidates).mockResolvedValue([
    { slug: "syn-jazz-1", title: "測試爵士甲", category: "爵士", summary: "syn jazz", ontology: null },
  ]);
  vi.spyOn(console, "info").mockImplementation(() => {});
});

describe("KPP-7b POST /api/recommend facts rule", () => {
  it("1. prompt sent to the model contains MUSIC_FACTS_RULE", async () => {
    mockGenerate.mockResolvedValue({ output: { picks: [{ slug: "syn-jazz-1", reason: "海面啲光" }] } } as never);
    const res = await POST(
      new Request("http://localhost/api/recommend", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "7.7.7.7" },
        body: JSON.stringify({ query: "想聽爵士" }),
      }) as never,
    );
    expect(res.status).toBe(200);
    const args = mockGenerate.mock.calls.at(-1)?.[0] as unknown as { prompt: string };
    expect(MUSIC_FACTS_RULE.length).toBeGreaterThan(0);
    expect(args.prompt).toContain(MUSIC_FACTS_RULE);
  });
});
