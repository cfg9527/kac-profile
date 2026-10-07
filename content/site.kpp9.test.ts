// KPP-9 RED: KaC's own self-intro + interests copy, verbatim (zh) and translated (en).
import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { INTERESTS_EN, INTRO_EN } from "./kpp9-copy";
import { SECTION_IDS, siteContent } from "./site";

/** sha256 of KaC's files as delivered (guards the fixtures themselves). */
const FIXTURE_SHA256 = {
  intro: "d84972b0acfcc5fd593ed0c6b83fa39fdfe0ee0c2757c67189a9f08ddb2f87a3",
  interests: "fc3e20d6e2c89baa0fca7ade2a8bb7bdb65aaeb2563c00fff317ae5d4dc58ff0",
} as const;

function fixture(name: keyof typeof FIXTURE_SHA256): { raw: Buffer; paragraphs: string[] } {
  const raw = readFileSync(path.resolve(`content/__fixtures__/kpp9/${name}.zh.txt`));
  const text = raw.toString("utf8").replace(/\n$/, "");
  return { raw, paragraphs: text.split("\n") };
}

/** Han, kana, Hangul, CJK punctuation, fullwidth forms. */
const CJK = /[\u2E80-\u2FFF\u3000-\u30FF\u3100-\u31FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF]/;

/** Titles / labels as on main 63c8962: must not change. */
const UNCHANGED = {
  zh: {
    intro: { tabLabel: "自我介紹", objectLabel: "路牌", title: "哈囉，我係 Desmond Cheung，夜海邊行緊過嚟！" },
    interests: { tabLabel: "興趣同性格", objectLabel: "長凳", title: "ENTP · 夜晚坐喺長凳睇星" },
    projects: { tabLabel: "做緊嘅嘢", objectLabel: "大樹", title: "夢入面種緊嘅三樖嘢" },
    contact: { tabLabel: "聯絡", objectLabel: "郵箱", title: "喺潮聲入面寄封信畀我" },
  },
  en: {
    intro: { tabLabel: "Intro", objectLabel: "Signpost", title: "Hi, I'm Desmond Cheung, walking over from the night sea!" },
    interests: { tabLabel: "Interests", objectLabel: "Bench", title: "ENTP · sitting on the bench watching the stars" },
    projects: { tabLabel: "Projects", objectLabel: "Big tree", title: "Three things growing by the night sea" },
    contact: { tabLabel: "Contact", objectLabel: "Mailbox", title: "Drop me a letter in the sound of the tide" },
  },
} as const;

describe("KPP-9 fixtures are KaC's files byte for byte", () => {
  it("1. fixture hashes match the delivered files", () => {
    for (const k of ["intro", "interests"] as const) {
      const h = createHash("sha256").update(fixture(k).raw).digest("hex");
      expect(h, k).toBe(FIXTURE_SHA256[k]);
    }
  });

  it("2. intro has 2 paragraphs, interests has 1", () => {
    expect(fixture("intro").paragraphs).toHaveLength(2);
    expect(fixture("interests").paragraphs).toHaveLength(1);
  });
});

describe("KPP-9 zh copy is verbatim", () => {
  it("3. zh intro body equals the fixture paragraphs exactly", () => {
    expect(siteContent.zh.sections.intro.body).toEqual(fixture("intro").paragraphs);
  });

  it("4. zh interests body equals the fixture paragraph exactly", () => {
    expect(siteContent.zh.sections.interests.body).toEqual(fixture("interests").paragraphs);
  });
});

describe("KPP-9 en translation", () => {
  it("5. en intro / interests bodies are the contract translation", () => {
    expect(siteContent.en.sections.intro.body).toEqual([...INTRO_EN]);
    expect(siteContent.en.sections.interests.body).toEqual([...INTERESTS_EN]);
  });

  it("6. translation keeps the paragraph structure, is non-empty and has no CJK", () => {
    expect(INTRO_EN).toHaveLength(fixture("intro").paragraphs.length);
    expect(INTERESTS_EN).toHaveLength(fixture("interests").paragraphs.length);
    for (const p of [...INTRO_EN, ...INTERESTS_EN]) {
      expect(p.trim().length).toBeGreaterThan(40);
      expect(p, p.slice(0, 30)).not.toMatch(CJK);
    }
  });
});

describe("KPP-9 everything else unchanged", () => {
  it("7. tab labels, object labels and titles of all sections are unchanged (zh + en)", () => {
    for (const lang of ["zh", "en"] as const) {
      for (const id of SECTION_IDS) {
        const s = siteContent[lang].sections[id];
        const want = UNCHANGED[lang][id];
        expect({ tabLabel: s.tabLabel, objectLabel: s.objectLabel, title: s.title }, `${lang}.${id}`).toEqual(want);
      }
    }
  });

  it("8. projects and contact bodies keep their current shape", () => {
    for (const lang of ["zh", "en"] as const) {
      expect(siteContent[lang].sections.projects.projects?.map((p) => p.name)).toEqual(
        lang === "zh" ? ["futa9", "QRNG", "閱微"] : ["futa9", "QRNG", "閱微 (Yuewei)"],
      );
      expect(siteContent[lang].sections.contact.body.length).toBeGreaterThan(0);
    }
  });
});
