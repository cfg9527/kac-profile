// KPP-7b RED: spoken-Cantonese reasons + no unsupported musical facts.
import { describe, expect, it } from "vitest";
import {
  MUSIC_FACTS_RULE,
  REASON_MAX_CHARS,
  REASON_VOICE,
  RECOMMEND_SYSTEM,
  buildRecommendPrompt,
  type Candidate,
} from "./recommend";

/** KPP-7b caps (unchanged from KPP-7: voice <= 200, system <= 400). */
const VOICE_CAP = 200;
const RULE_CAP = 120;
const SYSTEM_CAP = 400;

describe("KPP-7b spoken Cantonese voice", () => {
  it("1. REASON_VOICE asks for 口語廣東話 (spoken, not written Chinese)", () => {
    expect(REASON_VOICE).toMatch(/口語廣東話|廣東話口語/);
    expect(REASON_VOICE).toMatch(/書面語/);
  });

  it("2. REASON_VOICE gives colloquial markers 嘅/咗/喺/啲 as examples", () => {
    for (const w of ["嘅", "咗", "喺", "啲"]) expect(REASON_VOICE, w).toContain(w);
  });

  it("3. REASON_VOICE keeps the KPP-7 rules and cap", () => {
    expect(REASON_VOICE).toContain("意識流");
    expect(REASON_VOICE).toContain("意象");
    expect(REASON_VOICE).toContain("唔好引用歌詞");
    expect(REASON_VOICE).toContain(`${REASON_MAX_CHARS} 字`);
    expect(REASON_VOICE.length).toBeLessThanOrEqual(VOICE_CAP);
  });
});

describe("KPP-7b no unsupported musical facts", () => {
  it("4. MUSIC_FACTS_RULE forbids time signature / year / key / tempo unless the data says so", () => {
    expect(MUSIC_FACTS_RULE.length).toBeGreaterThan(10);
    expect(MUSIC_FACTS_RULE.length).toBeLessThanOrEqual(RULE_CAP);
    expect(MUSIC_FACTS_RULE).toContain("拍子");
    expect(MUSIC_FACTS_RULE).toContain("年份");
    expect(MUSIC_FACTS_RULE).toMatch(/調/);
    expect(MUSIC_FACTS_RULE).toMatch(/速度|tempo/i);
    expect(MUSIC_FACTS_RULE).toContain("除非");
    expect(MUSIC_FACTS_RULE).toMatch(/資料/);
    expect(MUSIC_FACTS_RULE).toMatch(/唔好|唔可以/);
  });

  it("5. RECOMMEND_SYSTEM embeds both rules and stays within its cap", () => {
    expect(RECOMMEND_SYSTEM).toContain(REASON_VOICE);
    expect(RECOMMEND_SYSTEM).toContain(MUSIC_FACTS_RULE);
    expect(RECOMMEND_SYSTEM).toMatch(/口語廣東話|廣東話口語/);
    expect(RECOMMEND_SYSTEM).toContain("唔好引用歌詞");
    expect(RECOMMEND_SYSTEM).toContain("120");
    expect(RECOMMEND_SYSTEM.length).toBeLessThanOrEqual(SYSTEM_CAP);
  });

  it("6. the full prompt carries both rules, the list-only guard and no lyrics", () => {
    const c = {
      slug: "syn-a-1",
      title: "測試歌甲",
      category: "爵士",
      summary: "syn summary",
      ontology: null,
      lyrics_md: "SYNTHETIC_LYRIC_7B",
    } as unknown as Candidate;
    const prompt = buildRecommendPrompt([c], "想聽爵士");
    expect(prompt).toContain(MUSIC_FACTS_RULE);
    expect(prompt).toContain(REASON_VOICE);
    expect(prompt).toContain("只可以從下面提供嘅歌曲清單入面揀 1 至 3 首歌");
    expect(prompt).not.toContain("SYNTHETIC_LYRIC_7B");
  });
});
