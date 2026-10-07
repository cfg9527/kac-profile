// KPP-7 RED: stream-of-consciousness night-sea voice; facts unchanged.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { RECOMMENDER_COPY, SECTION_IDS, siteContent, type Lang } from "./site";

const ZH_IMAGERY = ["海", "夜", "星", "浪", "夢", "鯨", "光", "泡", "雲", "潮"];
const EN_IMAGERY = ["sea", "night", "star", "wave", "dream", "whale", "glow", "bubble", "cloud", "tide"];

/** Old (pre-KPP-7) copy that must be rewritten. */
const OLD = {
  zhSubtitle: "四圍行吓，㩒吓啲物件，認識吓我啦！",
  enSubtitle: "Walk around, poke the objects, and meet me!",
  zhIntro: "一個鍾意將古靈精怪嘅諗法，變成真嘢嘅人。",
  enIntro: "I turn quirky ideas into real things.",
  zhContact: "想搵我？去 GitHub 探我啦！X 帳號好快會有。",
  enContact: "Want to reach me? Find me on GitHub! X handle coming soon.",
  recIntro: "講下你今日嘅心情，我哋幫你喺收藏入面揀 1 至 3 首歌。",
  recPlaceholder: "例如：今晚想聽啲 chilli 嘅歌",
};

function zhCopyBlob(): string {
  const c = siteContent.zh;
  return [
    c.pageSubtitle,
    ...SECTION_IDS.flatMap((id) => [c.sections[id].title, ...c.sections[id].body]),
    ...(c.sections.projects.projects ?? []).map((p) => p.line),
    RECOMMENDER_COPY.heading,
    RECOMMENDER_COPY.intro,
    RECOMMENDER_COPY.placeholder,
  ].join("\n");
}

function enCopyBlob(): string {
  const c = siteContent.en;
  return [
    c.pageSubtitle,
    ...SECTION_IDS.flatMap((id) => [c.sections[id].title, ...c.sections[id].body]),
    ...(c.sections.projects.projects ?? []).map((p) => p.line),
  ]
    .join("\n")
    .toLowerCase();
}

describe("KPP-7 copy voice", () => {
  it("1. the old chirpy copy is rewritten (subtitle, intro, contact; zh + en)", () => {
    expect(siteContent.zh.pageSubtitle).not.toBe(OLD.zhSubtitle);
    expect(siteContent.en.pageSubtitle).not.toBe(OLD.enSubtitle);
    expect(siteContent.zh.sections.intro.body[0]).not.toBe(OLD.zhIntro);
    expect(siteContent.en.sections.intro.body[0]).not.toBe(OLD.enIntro);
    expect(siteContent.zh.sections.contact.body[0]).not.toBe(OLD.zhContact);
    expect(siteContent.en.sections.contact.body[0]).not.toBe(OLD.enContact);
  });

  it("2. zh copy jumps between night-sea images (>= 5 distinct image words, subtitle has one)", () => {
    const blob = zhCopyBlob();
    const hits = ZH_IMAGERY.filter((w) => blob.includes(w));
    expect(hits.length, `zh imagery hits: ${hits.join("")}`).toBeGreaterThanOrEqual(5);
    expect(ZH_IMAGERY.some((w) => siteContent.zh.pageSubtitle.includes(w))).toBe(true);
  });

  it("3. en copy jumps between night-sea images (>= 4 distinct image words, subtitle has one)", () => {
    const blob = enCopyBlob();
    const hits = EN_IMAGERY.filter((w) => blob.includes(w));
    expect(hits.length, `en imagery hits: ${hits.join(",")}`).toBeGreaterThanOrEqual(4);
    expect(EN_IMAGERY.some((w) => siteContent.en.pageSubtitle.toLowerCase().includes(w))).toBe(true);
  });

  it("4. recommender copy rewritten in the new voice; loading keeps 「諗緊」", () => {
    expect(RECOMMENDER_COPY.intro).not.toBe(OLD.recIntro);
    expect(RECOMMENDER_COPY.placeholder).not.toBe(OLD.recPlaceholder);
    expect(ZH_IMAGERY.some((w) => RECOMMENDER_COPY.intro.includes(w))).toBe(true);
    expect(RECOMMENDER_COPY.loading).toContain("諗緊");
    expect(RECOMMENDER_COPY.inputLabel).toContain("300");
    for (const [k, v] of Object.entries(RECOMMENDER_COPY)) expect(v.trim(), k).not.toBe("");
  });

  it("5. Recommender.tsx takes its strings from RECOMMENDER_COPY (no hard-coded old copy)", () => {
    const src = readFileSync(path.resolve("app/components/Recommender.tsx"), "utf8");
    expect(src).toContain("RECOMMENDER_COPY");
    expect(src).not.toContain(OLD.recIntro);
    expect(src).not.toContain(OLD.recPlaceholder);
  });
});

describe("KPP-7 facts unchanged", () => {
  const LANGS: Lang[] = ["zh", "en"];

  it("6. name is exactly 'Desmond Cheung' wherever a name appears; no other spelling", () => {
    for (const lang of LANGS) {
      const c = siteContent[lang];
      expect(c.pageTitle).toContain("Desmond Cheung");
      expect(c.sections.intro.title).toContain("Desmond Cheung");
      expect(c.footerNote).toContain("Desmond Cheung");
      const all = JSON.stringify(c);
      expect(all).not.toMatch(/Desmond(?! Cheung)|(?<!Desmond )Cheung|張/);
    }
  });

  it("7. ENTP, project names and the usage hint (arrow keys / WASD) survive the rewrite", () => {
    for (const lang of LANGS) {
      const c = siteContent[lang];
      expect(c.sections.interests.title).toContain("ENTP");
      expect((c.sections.projects.projects ?? []).map((p) => p.name)).toEqual(
        lang === "zh" ? ["futa9", "QRNG", "閱微"] : ["futa9", "QRNG", "閱微 (Yuewei)"],
      );
      expect(c.parkHint).toContain("WASD");
    }
  });

  it("8. the site still never lists songs: no song/catalog wording in site copy", () => {
    for (const lang of LANGS) {
      const all = JSON.stringify(siteContent[lang]);
      expect(all).not.toMatch(/歌單|歌曲清單|catalog|playlist/i);
    }
    expect(JSON.stringify(RECOMMENDER_COPY)).not.toMatch(/歌單|歌曲清單|catalog|playlist/i);
  });
});
