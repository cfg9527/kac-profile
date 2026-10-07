import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("ai", () => ({
  generateText: vi.fn(),
  Output: { object: vi.fn((arg: unknown) => arg) },
  gateway: vi.fn((m: string) => m),
}));

vi.mock("@/lib/music/queries", async (importOriginal) => {
  const mod = (await importOriginal()) as Record<string, unknown>;
  return {
    ...mod,
    getSongCandidates: vi.fn(),
    checkAndCountUsage: vi.fn(),
  };
});

import { generateText } from "ai";
import { POST } from "./route";
import { checkAndCountUsage, getSongCandidates } from "@/lib/music/queries";

const mockGenerate = vi.mocked(generateText);
const mockCandidates = vi.mocked(getSongCandidates);
const mockUsage = vi.mocked(checkAndCountUsage);

function req(query: unknown, ip = "1.2.3.4") {
  return new Request("http://localhost/api/recommend", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify({ query }),
  });
}

const CANDIDATES = [
  { slug: "測試歌甲-100d18", title: "測試歌甲", category: "華語流行" as const, summary: "測試風經典" },
  { slug: "測試歌丁-d3547f", title: "測試歌丁", category: "西方搖滾" as const, summary: "測試曲風" },
  { slug: "測試歌己-0698b7", title: "測試歌己", category: "電子Hip-Hop" as const, summary: "測試說唱" },
];

beforeEach(() => {
  vi.clearAllMocks();
  process.env.AI_GATEWAY_MODEL = "test/model";
  process.env.RATE_LIMIT_SALT = "test-salt-32-bytes-long-for-tests";
  mockUsage.mockResolvedValue("ok");
  mockCandidates.mockResolvedValue(CANDIDATES);
});

describe("POST /api/recommend", () => {
  it("6. prompt sent to gateway contains no copyrighted/body content", async () => {
    const sentinelBody = "SENTINEL_BODY_MD_abc123";
    const sentinelLyrics = "SENTINEL_LYRICS_MD_xyz789";
    mockCandidates.mockResolvedValue([
      { slug: "s1", title: "S1", category: "華語流行" as const, summary: "plain summary" },
    ]);
    mockGenerate.mockResolvedValue({ output: { picks: [{ slug: "s1", reason: "好聽" }] } } as never);
    const res = await POST(req("開心") as never);
    expect(res.status).toBe(200);
    const call = mockGenerate.mock.calls[0]?.[0] as Record<string, unknown>;
    const serialized = JSON.stringify(call);
    expect(serialized).not.toContain(sentinelBody);
    expect(serialized).not.toContain(sentinelLyrics);
    expect(serialized).not.toContain("lyrics_md");
    expect(serialized).not.toContain("body_md");
  });

  it("7. success returns 200 with 1-3 picks joined from DB", async () => {
    mockGenerate.mockResolvedValue({
      output: {
        picks: [
          { slug: "測試歌甲-100d18", reason: "啱你今日心情" },
          { slug: "測試歌丁-d3547f", reason: "放鬆之選" },
        ],
      },
    } as never);
    const res = await POST(req("想聽啲開心嘅") as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.picks).toHaveLength(2);
    expect(body.picks[0]).toMatchObject({
      slug: "測試歌甲-100d18",
      title: "測試歌甲",
      category: "華語流行",
    });
  });

  it("8. empty and >300-char input return 400 invalid_input, gateway never called", async () => {
    const r1 = await POST(req("   ") as never);
    expect(r1.status).toBe(400);
    expect(((await r1.json()) as { error: string }).error).toBe("invalid_input");
    const r2 = await POST(req("x".repeat(301)) as never);
    expect(r2.status).toBe(400);
    expect(((await r2.json()) as { error: string }).error).toBe("invalid_input");
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it("9. per-visitor limit hit returns 429 rate_limited, gateway not called", async () => {
    mockUsage.mockResolvedValue("rate_limited");
    const res = await POST(req("想聽歌") as never);
    expect(res.status).toBe(429);
    expect(((await res.json()) as { error: string }).error).toBe("rate_limited");
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it("10. global daily cap hit returns 429 daily_cap, gateway not called", async () => {
    mockUsage.mockResolvedValue("daily_cap");
    const res = await POST(req("想聽歌") as never);
    expect(res.status).toBe(429);
    expect(((await res.json()) as { error: string }).error).toBe("daily_cap");
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it("11. gateway 402 quota/insufficient-funds maps to 503 budget_exhausted", async () => {
    const quota = Object.assign(new Error("quota"), {
      statusCode: 402,
      type: "quota_for_entity_exceeded",
    });
    mockGenerate.mockRejectedValueOnce(quota);
    const r1 = await POST(req("想聽歌") as never);
    expect(r1.status).toBe(503);
    expect(((await r1.json()) as { error: string }).error).toBe("budget_exhausted");

    const funds = Object.assign(new Error("Insufficient funds"), { statusCode: 402 });
    mockGenerate.mockRejectedValueOnce(funds);
    const r2 = await POST(req("想聽歌") as never);
    expect(r2.status).toBe(503);
    expect(((await r2.json()) as { error: string }).error).toBe("budget_exhausted");

    const wrapped = Object.assign(new Error("GatewayInternalServerError"), {
      name: "GatewayInternalServerError",
      cause: { type: "quota_for_entity_exceeded", statusCode: 402 },
    });
    mockGenerate.mockRejectedValueOnce(wrapped);
    const r3 = await POST(req("想聽歌") as never);
    expect(r3.status).toBe(503);
    expect(((await r3.json()) as { error: string }).error).toBe("budget_exhausted");
  });

  it("12. gateway 429 returns 503 gateway_rate_limited", async () => {
    mockGenerate.mockRejectedValueOnce(Object.assign(new Error("too many"), { statusCode: 429 }));
    const res = await POST(req("想聽歌") as never);
    expect(res.status).toBe(503);
    expect(((await res.json()) as { error: string }).error).toBe("gateway_rate_limited");
    const withType = Object.assign(new Error("limited"), { type: "rate_limit_exceeded" });
    mockGenerate.mockRejectedValueOnce(withType);
    const res2 = await POST(req("想聽歌") as never);
    expect(res2.status).toBe(503);
    expect(((await res2.json()) as { error: string }).error).toBe("gateway_rate_limited");
  });

  it("13. generic gateway error/timeout returns 502 gateway_error without leaking internals", async () => {
    mockGenerate.mockRejectedValueOnce(Object.assign(new Error("secret-internal-xyz"), { statusCode: 500 }));
    const res = await POST(req("想聽歌") as never);
    expect(res.status).toBe(502);
    const body = (await res.json()) as { error: string; message: string };
    expect(body.error).toBe("gateway_error");
    expect(JSON.stringify(body)).not.toContain("secret-internal-xyz");
  });

  it("14. unknown slug filtered, valid kept; all unknown returns 502", async () => {
    mockGenerate.mockResolvedValue({
      output: { picks: [{ slug: "nope-000", reason: "假" }, { slug: "測試歌甲-100d18", reason: "真" }] },
    } as never);
    const res = await POST(req("想聽歌") as never);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; picks: { slug: string }[] };
    expect(body.picks.map((p) => p.slug)).toEqual(["測試歌甲-100d18"]);

    mockGenerate.mockResolvedValue({ output: { picks: [{ slug: "ghost", reason: "無" }] } } as never);
    const res2 = await POST(req("想聽歌") as never);
    expect(res2.status).toBe(502);
    expect(((await res2.json()) as { error: string }).error).toBe("gateway_error");
  });

  it("15. missing AI_GATEWAY_MODEL or RATE_LIMIT_SALT returns 500 config", async () => {
    delete process.env.AI_GATEWAY_MODEL;
    const r1 = await POST(req("想聽歌") as never);
    expect(r1.status).toBe(500);
    expect(((await r1.json()) as { error: string }).error).toBe("config");
    process.env.AI_GATEWAY_MODEL = "test/model";
    delete process.env.RATE_LIMIT_SALT;
    const r2 = await POST(req("想聽歌") as never);
    expect(r2.status).toBe(500);
    expect(((await r2.json()) as { error: string }).error).toBe("config");
  });
});
