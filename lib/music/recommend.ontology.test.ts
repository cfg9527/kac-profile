// KPP-6 RED tests: prompt lines carry ontology labels only; schema is limited to the shortlist.
import { describe, expect, it } from "vitest";
import { buildCandidateContext, buildRecommendPrompt, buildRecommendSchema, type Candidate } from "./recommend";

const RAIN1: Candidate = {
  slug: "syn-rain-1",
  title: "測試歌雨",
  category: "華語流行",
  summary: "syn summary rain",
  ontology: { themes: ["雨夜離別", "城市"], emotions: ["寂寞"], imagery: ["窗外雨聲"], artist: "虛構歌手" },
};
const NULL1: Candidate = { slug: "syn-null-1", title: "測試寂寞歌", category: "爵士", summary: "syn summary null", ontology: null };

describe("KPP-6 buildCandidateContext with ontology", () => {
  it("1. appends 主題／情緒／意象 labels (joined with 、, sections with ；)", () => {
    expect(buildCandidateContext([RAIN1])).toBe(
      "syn-rain-1 | 測試歌雨 | 華語流行 | syn summary rain | 主題：雨夜離別、城市；情緒：寂寞；意象：窗外雨聲",
    );
  });

  it("2. only non-empty sections; null/undefined ontology keeps the legacy line", () => {
    const onlyEmotion: Candidate = { ...NULL1, ontology: { themes: [], emotions: ["寂寞"], imagery: [], artist: null } };
    expect(buildCandidateContext([onlyEmotion])).toBe("syn-null-1 | 測試寂寞歌 | 爵士 | syn summary null | 情緒：寂寞");
    expect(buildCandidateContext([NULL1])).toBe("syn-null-1 | 測試寂寞歌 | 爵士 | syn summary null");
    const { ontology: _drop, ...noKey } = NULL1;
    void _drop;
    expect(buildCandidateContext([noKey])).toBe("syn-null-1 | 測試寂寞歌 | 爵士 | syn summary null");
  });

  it("3. labels are sanitised: | and line breaks become spaces, one line per song", () => {
    const messy: Candidate = { ...NULL1, ontology: { themes: ["a|b\nc"], emotions: [], imagery: [], artist: null } };
    const ctx = buildCandidateContext([messy, RAIN1]);
    expect(ctx.split("\n")).toHaveLength(2);
    expect(ctx.split("\n")[0]).toBe("syn-null-1 | 測試寂寞歌 | 爵士 | syn summary null | 主題：a b c");
  });

  it("4. (d) lyrics / body / evidence smuggled onto a candidate never reach the prompt", () => {
    const sneaky = {
      ...RAIN1,
      lyrics_md: "LYRIC_SENTINEL_snake",
      lyricsMd: "LYRIC_SENTINEL_camel",
      body_md: "BODY_SENTINEL_snake",
      bodyMd: "BODY_SENTINEL_camel",
      ontology: { ...RAIN1.ontology!, evidence: "EVIDENCE_SENTINEL", lyrics: "LYRIC_SENTINEL_onto" },
    } as unknown as Candidate;
    const prompt = buildRecommendPrompt([sneaky], "寂寞");
    for (const bad of ["LYRIC_SENTINEL", "BODY_SENTINEL", "EVIDENCE_SENTINEL", "lyrics_md", "body_md"]) {
      expect(prompt).not.toContain(bad);
    }
    expect(prompt).toContain("syn-rain-1 | 測試歌雨 | 華語流行 |");
  });
});

describe("KPP-6 buildRecommendSchema", () => {
  it("5. slug enum is exactly the given slugs; 1..3 picks; reason <= 120", () => {
    const schema = buildRecommendSchema(["syn-rain-1", "syn-null-1"]);
    expect(schema.safeParse({ picks: [{ slug: "syn-rain-1", reason: "啱聽" }] }).success).toBe(true);
    expect(schema.safeParse({ picks: [{ slug: "syn-other-9", reason: "x" }] }).success).toBe(false);
    expect(schema.safeParse({ picks: [] }).success).toBe(false);
    const four = Array.from({ length: 4 }, () => ({ slug: "syn-rain-1", reason: "x" }));
    expect(schema.safeParse({ picks: four }).success).toBe(false);
    expect(schema.safeParse({ picks: [{ slug: "syn-rain-1", reason: "長".repeat(121) }] }).success).toBe(false);
  });

  it("6. empty slug list throws", () => {
    expect(() => buildRecommendSchema([])).toThrow(/empty/);
  });
});
