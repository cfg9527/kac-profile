// KPP-6 RED tests: /api/recommend shortlists to <=20 songs and calls the model with reasoning off.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
import type { Category, OntologyLite, SongCandidate } from "@/lib/music/types";

const mockGenerate = vi.mocked(generateText);
const mockCandidates = vi.mocked(getSongCandidates);
const mockUsage = vi.mocked(checkAndCountUsage);

type SafeParser = { safeParse: (v: unknown) => { success: boolean } };
type GenArgs = {
  prompt: string;
  output: { schema: SafeParser };
  reasoning?: unknown;
  providerOptions?: unknown;
  maxOutputTokens?: number;
};

const CATS: Category[] = ["華語流行", "西方搖滾", "電子Hip-Hop", "爵士", "J-Pop", "K-pop"];
const lite = (themes: string[], emotions: string[], imagery: string[]): OntologyLite => ({
  themes,
  emotions,
  imagery,
  artist: null,
});

function catalog(): SongCandidate[] {
  const fillers: SongCandidate[] = Array.from({ length: 26 }, (_, i) => {
    const id = String(i + 1).padStart(2, "0");
    return {
      slug: `syn-fill-${id}`,
      title: `Filler ${id}`,
      category: CATS[(i + 1) % CATS.length],
      summary: `syn filler ${id}`,
      ontology: lite([`甲乙${id}`], [`丙丁${id}`], [`戊己${id}`]),
    };
  });
  return [
    ...fillers,
    { slug: "syn-sun-1", title: "測試歌日", category: "K-pop", summary: "syn summary sun", ontology: lite(["夏日派對"], ["興奮"], ["海灘"]) },
    { slug: "syn-rain-2", title: "測試歌風", category: "西方搖滾", summary: "syn summary wind", ontology: lite(["城市漫步"], ["寂寞"], []) },
    { slug: "syn-null-1", title: "測試寂寞歌", category: "爵士", summary: "syn summary null", ontology: null },
    { slug: "syn-rain-1", title: "測試歌雨", category: "華語流行", summary: "syn summary rain", ontology: lite(["雨夜離別"], ["寂寞"], ["窗外雨聲"]) },
  ];
}
const ALL_SLUGS = catalog().map((c) => c.slug);
const LONELY_RAIN = "今晚好寂寞，想聽雨夜嘅歌";

function req(query: unknown) {
  return new Request("http://localhost/api/recommend", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "1.2.3.4" },
    body: JSON.stringify({ query }),
  });
}

function lastArgs(): GenArgs {
  const call = mockGenerate.mock.calls.at(-1)?.[0] as unknown as GenArgs | undefined;
  expect(call, "generateText should have been called").toBeDefined();
  return call!;
}

/** Slugs the structured-output schema accepts (probe each catalogue slug). */
function acceptedSlugs(args: GenArgs, slugs = ALL_SLUGS): string[] {
  return slugs.filter((slug) => args.output.schema.safeParse({ picks: [{ slug, reason: "x" }] }).success);
}

/** Mock model: picks the first slug the schema accepts. */
function pickFirstAccepted() {
  mockGenerate.mockImplementation((async (args: GenArgs) => {
    const slug = acceptedSlugs(args)[0];
    return { output: { picks: [{ slug, reason: "啱聽" }] } };
  }) as never);
}

let infoSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  mockGenerate.mockReset();
  process.env.AI_GATEWAY_MODEL = "test/model";
  process.env.RATE_LIMIT_SALT = "test-salt-32-bytes-long-for-tests";
  mockUsage.mockResolvedValue("ok");
  mockCandidates.mockResolvedValue(catalog());
  infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
});

afterEach(() => {
  infoSpy.mockRestore();
});

describe("KPP-6 POST /api/recommend shortlist", () => {
  it("1. (a)(e) normal query: reasoning off, <=20 slugs in schema and prompt, relevant songs included", async () => {
    mockGenerate.mockResolvedValue({ output: { picks: [{ slug: "syn-rain-1", reason: "雨夜寂寞" }] } } as never);
    const res = await POST(req(LONELY_RAIN) as never);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; picks: { slug: string }[] };
    expect(body.picks.map((p) => p.slug)).toEqual(["syn-rain-1"]);

    const args = lastArgs();
    expect(args.reasoning).toBe("none");
    expect(args.providerOptions).toBeUndefined(); // a providerOptions reasoning entry would override `reasoning`
    expect(args.maxOutputTokens).toBe(400);

    const accepted = acceptedSlugs(args);
    expect(accepted.length).toBeGreaterThan(0);
    expect(accepted.length).toBeLessThanOrEqual(20);
    expect(accepted).toEqual(expect.arrayContaining(["syn-rain-1", "syn-rain-2", "syn-null-1"]));
    for (const slug of ALL_SLUGS) {
      expect(args.prompt.includes(slug), `prompt/schema mismatch for ${slug}`).toBe(accepted.includes(slug));
    }
  });

  it("2. (b) obscure query: still a 20-song fallback shortlist, 200 not an error", async () => {
    pickFirstAccepted();
    const res = await POST(req("qzxv") as never);
    expect(res.status).toBe(200);
    const args = lastArgs();
    const accepted = acceptedSlugs(args);
    expect(accepted).toHaveLength(20);
    for (const slug of accepted) expect(args.prompt).toContain(slug);
  });

  it("3. (c) every song without ontology: no crash, category match still shortlisted", async () => {
    mockCandidates.mockResolvedValue(catalog().map((c, i) => ({ ...c, ontology: i % 2 ? null : undefined })));
    pickFirstAccepted();
    const res = await POST(req("想聽爵士") as never);
    expect(res.status).toBe(200);
    const accepted = acceptedSlugs(lastArgs());
    const jazz = catalog().filter((c) => c.category === "爵士").map((c) => c.slug);
    expect(accepted).toEqual(expect.arrayContaining(jazz));
    expect(accepted.length).toBeLessThanOrEqual(20);
  });

  it("4. (d) lyrics/body/evidence smuggled on candidates never reach generateText", async () => {
    const sneaky = catalog().map((c) => ({
      ...c,
      lyrics_md: `LYRIC_SENTINEL_${c.slug}`,
      lyricsMd: "LYRIC_SENTINEL_camel",
      body_md: "BODY_SENTINEL_snake",
      bodyMd: "BODY_SENTINEL_camel",
      ontology: c.ontology ? { ...c.ontology, evidence: "EVIDENCE_SENTINEL" } : c.ontology,
    }));
    mockCandidates.mockResolvedValue(sneaky as unknown as SongCandidate[]);
    mockGenerate.mockResolvedValue({ output: { picks: [{ slug: "syn-rain-1", reason: "好" }] } } as never);
    const res = await POST(req(LONELY_RAIN) as never);
    expect(res.status).toBe(200);
    const serialized = JSON.stringify(lastArgs());
    for (const bad of ["LYRIC_SENTINEL", "BODY_SENTINEL", "EVIDENCE_SENTINEL", "lyrics_md", "body_md"]) {
      expect(serialized).not.toContain(bad);
    }
  });

  it("5. (e) <=20 candidates: all of them are offered", async () => {
    const three = catalog().slice(-3);
    mockCandidates.mockResolvedValue(three);
    pickFirstAccepted();
    const res = await POST(req("qzxv") as never);
    expect(res.status).toBe(200);
    expect(acceptedSlugs(lastArgs())).toEqual(three.map((c) => c.slug));
  });

  it("6. a catalogue slug outside the shortlist is dropped (502 when nothing is left)", async () => {
    let outside: string | undefined;
    mockGenerate.mockImplementation((async (args: GenArgs) => {
      outside = ALL_SLUGS.find((s) => !acceptedSlugs(args).includes(s));
      return { output: { picks: [{ slug: outside ?? "syn-rain-1", reason: "x" }] } };
    }) as never);
    const res = await POST(req(LONELY_RAIN) as never);
    expect(outside, "some catalogue slug must be outside the shortlist").toBeDefined();
    expect(res.status).toBe(502);
    expect(((await res.json()) as { error: string }).error).toBe("gateway_error");
  });

  it("7. logs one usage line with token counts and shortlist stats, never the query", async () => {
    mockGenerate.mockResolvedValue({
      output: { picks: [{ slug: "syn-rain-1", reason: "好" }] },
      usage: { inputTokens: 1234, outputTokens: 56, outputTokenDetails: { reasoningTokens: 0, textTokens: 56 } },
    } as never);
    const res = await POST(req(LONELY_RAIN) as never);
    expect(res.status).toBe(200);
    const usageCalls = infoSpy.mock.calls.filter((c) => c[0] === "[recommend] usage");
    expect(usageCalls).toHaveLength(1);
    expect(usageCalls[0][1]).toMatchObject({
      shortlist: 20,
      matched: 3,
      fallback: false,
      inputTokens: 1234,
      outputTokens: 56,
      reasoningTokens: 0,
    });
    expect(typeof (usageCalls[0][1] as { ms: unknown }).ms).toBe("number");
    expect(JSON.stringify(infoSpy.mock.calls)).not.toContain("寂寞");
  });

  it("8. (f) budget / rate-limit mapping unchanged on the shortlist path", async () => {
    mockGenerate.mockRejectedValueOnce(Object.assign(new Error("quota"), { statusCode: 402, type: "quota_for_entity_exceeded" }));
    const r1 = await POST(req(LONELY_RAIN) as never);
    expect(r1.status).toBe(503);
    expect(((await r1.json()) as { error: string }).error).toBe("budget_exhausted");

    mockGenerate.mockRejectedValueOnce(Object.assign(new Error("too many"), { statusCode: 429 }));
    const r2 = await POST(req(LONELY_RAIN) as never);
    expect(r2.status).toBe(503);
    expect(((await r2.json()) as { error: string }).error).toBe("gateway_rate_limited");

    mockUsage.mockResolvedValueOnce("daily_cap");
    const r3 = await POST(req(LONELY_RAIN) as never);
    expect(r3.status).toBe(429);
    expect(((await r3.json()) as { error: string }).error).toBe("daily_cap");
    expect(mockGenerate).toHaveBeenCalledTimes(2);
  });
});
