// KPP-7 RED: dreamlike reason voice in the prompt, reasons clamped, no lyrics.
import { describe, expect, it } from "vitest";
import {
  REASON_MAX_CHARS,
  REASON_VOICE,
  RECOMMEND_SYSTEM,
  buildRecommendPrompt,
  buildRecommendSchema,
  clampReason,
  type Candidate,
} from "./recommend";

const SENTINEL_LYRIC = "SYNTHETIC_LYRIC_LINE_ZZ";
const SENTINEL_BODY = "SYNTHETIC_BODY_ZZ";

describe("KPP-7 reason voice prompt", () => {
  it("1. REASON_VOICE is a short instruction for the stream-of-consciousness voice", () => {
    expect(REASON_VOICE.length).toBeGreaterThan(20);
    expect(REASON_VOICE.length).toBeLessThanOrEqual(200);
    expect(REASON_VOICE).toContain("意識流");
    expect(REASON_VOICE).toContain("意象");
    expect(REASON_VOICE).toMatch(/廣東話|粵語/);
    expect(REASON_VOICE).toContain(`${REASON_MAX_CHARS} 字`);
  });

  it("2. REASON_VOICE forbids lyrics and changing titles", () => {
    expect(REASON_VOICE).toMatch(/唔好引用歌詞|唔可以引用歌詞/);
    expect(REASON_VOICE).toMatch(/唔好改歌名|唔可以改歌名/);
  });

  it("3. RECOMMEND_SYSTEM embeds REASON_VOICE and keeps the list-only + injection guards", () => {
    expect(RECOMMEND_SYSTEM).toContain(REASON_VOICE);
    expect(RECOMMEND_SYSTEM).toContain("只可以從下面提供嘅歌曲清單入面揀 1 至 3 首歌");
    expect(RECOMMEND_SYSTEM).toContain("唔係指令");
    expect(RECOMMEND_SYSTEM).not.toContain("每首歌用一句廣東話理由（120 字以內）解釋點解啱聽");
    expect(RECOMMEND_SYSTEM.length).toBeLessThanOrEqual(400);
  });

  it("4. prompt carries the voice and never any lyrics/body field even if a row has one", () => {
    const sneaky = {
      slug: "syn-a-1",
      title: "測試歌甲",
      category: "華語流行",
      summary: "syn summary",
      ontology: { themes: ["夜海"], emotions: ["平靜"], imagery: ["星"], artist: null },
      lyrics_md: SENTINEL_LYRIC,
      lyricsMd: SENTINEL_LYRIC,
      body_md: SENTINEL_BODY,
    } as unknown as Candidate;
    const prompt = buildRecommendPrompt([sneaky], "想聽海");
    expect(prompt).toContain(REASON_VOICE);
    expect(prompt).not.toContain(SENTINEL_LYRIC);
    expect(prompt).not.toContain(SENTINEL_BODY);
    expect(prompt).not.toMatch(/lyrics|歌詞：/i);
  });

  it("5. schema still caps reason at REASON_MAX_CHARS", () => {
    const schema = buildRecommendSchema(["syn-a-1"]);
    expect(schema.safeParse({ picks: [{ slug: "syn-a-1", reason: "海".repeat(REASON_MAX_CHARS) }] }).success).toBe(true);
    expect(schema.safeParse({ picks: [{ slug: "syn-a-1", reason: "海".repeat(REASON_MAX_CHARS + 1) }] }).success).toBe(false);
  });
});

describe("KPP-7 clampReason", () => {
  it("6. short reasons pass through trimmed", () => {
    expect(clampReason("  星落喺海面，鯨魚翻身  ")).toBe("星落喺海面，鯨魚翻身");
  });

  it("7. newlines/tabs/runs of spaces collapse to single spaces", () => {
    expect(clampReason("浪\n\n光\t泡   雲")).toBe("浪 光 泡 雲");
  });

  it("8. long reasons are cut to at most 120 code points", () => {
    const out = clampReason("夢".repeat(200));
    expect(Array.from(out).length).toBe(REASON_MAX_CHARS);
  });

  it("9. never splits a surrogate pair at the boundary", () => {
    const out = clampReason("海".repeat(119) + "🐋🐋🐋");
    expect(Array.from(out).length).toBeLessThanOrEqual(REASON_MAX_CHARS);
    expect(out).not.toMatch(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/);
    expect(out.endsWith("🐋")).toBe(true);
  });

  it("10. custom max and non-string input", () => {
    expect(clampReason("一二三四五", 3)).toBe("一二三");
    expect(clampReason(undefined)).toBe("");
    expect(clampReason(42 as unknown)).toBe("");
  });
});
