// KPP-6 RED tests: pure deterministic shortlist (synthetic fixtures only; public repo).
import { describe, expect, it } from "vitest";
import {
  SHORTLIST_LIMIT,
  queryChars,
  queryGrams,
  shortlistCandidates,
  toOntologyLite,
} from "./shortlist";
import type { Category, OntologyLite, SongCandidate } from "./types";

const CATS: Category[] = ["華語流行", "西方搖滾", "電子Hip-Hop", "爵士", "J-Pop", "K-pop"];

function lite(themes: string[] = [], emotions: string[] = [], imagery: string[] = []): OntologyLite {
  return { themes, emotions, imagery, artist: null };
}

function filler(n: number): SongCandidate {
  const id = String(n).padStart(2, "0");
  return {
    slug: `syn-fill-${id}`,
    title: `Filler ${id}`,
    category: CATS[n % CATS.length],
    summary: `syn filler ${id}`,
    ontology: lite([`甲乙${id}`], [`丙丁${id}`], [`戊己${id}`]),
  };
}

const RAIN1: SongCandidate = {
  slug: "syn-rain-1",
  title: "測試歌雨",
  category: "華語流行",
  summary: "syn summary rain",
  ontology: lite(["雨夜離別"], ["寂寞"], ["窗外雨聲"]),
};
const RAIN2: SongCandidate = {
  slug: "syn-rain-2",
  title: "測試歌風",
  category: "西方搖滾",
  summary: "syn summary wind",
  ontology: lite(["城市漫步"], ["寂寞"], []),
};
const NULL1: SongCandidate = {
  slug: "syn-null-1",
  title: "測試寂寞歌",
  category: "爵士",
  summary: "syn summary null",
  ontology: null,
};
const SUN1: SongCandidate = {
  slug: "syn-sun-1",
  title: "測試歌日",
  category: "K-pop",
  summary: "syn summary sun",
  ontology: lite(["夏日派對"], ["興奮"], ["海灘"]),
};

// 30 songs: 26 fillers spread over 6 categories + 4 special songs placed late in the list.
function catalog(): SongCandidate[] {
  const fillers = Array.from({ length: 26 }, (_, i) => filler(i + 1));
  return [...fillers.slice(0, 13), SUN1, ...fillers.slice(13), RAIN2, NULL1, RAIN1];
}

const LONELY_RAIN = "今晚好寂寞，想聽雨夜嘅歌";

describe("KPP-6 queryGrams", () => {
  it("1. CJK bigrams within runs only, punctuation splits runs, stop grams removed", () => {
    const g = queryGrams(LONELY_RAIN);
    expect(g).toContain("寂寞");
    expect(g).toContain("雨夜");
    expect(g).not.toContain("寞想"); // would span the full-width comma
    expect(g).not.toContain("想聽"); // stop gram
    expect(new Set(g).size).toBe(g.length);
  });

  it("2. latin words lowercased (>=2 chars), single CJK char kept, blank -> []", () => {
    expect(queryGrams("Jazz PIANO a")).toEqual(["jazz", "piano"]);
    expect(queryGrams("雨")).toEqual(["雨"]);
    expect(queryGrams("   ")).toEqual([]);
    expect(queryGrams("想聽歌")).toEqual([]);
  });
});

describe("KPP-6 toOntologyLite", () => {
  const RAW = {
    version: 1,
    song: { title: "測試歌甲", artist: " 虛構歌手 ", album: null, year: null },
    theme: [{ label: "雨夜離別", evidence: "EVIDENCE_SENTINEL_t1 引文" }],
    emotions: [
      { label: "寂寞", intensity: 4, evidence: "EVIDENCE_SENTINEL_e1 引文" },
      { label: "寂寞", intensity: 2, evidence: "EVIDENCE_SENTINEL_e2 引文" },
    ],
    timeline: [{ when: "TIMELINE_SENTINEL", kind: "year", evidence: "EVIDENCE_SENTINEL_tl" }],
    causality: [{ cause: "CAUSE_SENTINEL", effect: "EFFECT_SENTINEL", evidence: "EVIDENCE_SENTINEL_c" }],
    imagery: [{ label: "窗外雨聲", evidence: "EVIDENCE_SENTINEL_i1 引文" }],
    links: [{ target: "LINK_SENTINEL", type: "song", evidence: "EVIDENCE_SENTINEL_l" }],
    lyrics: "LYRIC_SENTINEL_line",
    lyrics_md: "LYRIC_SENTINEL_md",
  };

  it("3. keeps labels + artist only; drops evidence, timeline, causality, links, lyrics", () => {
    const out = toOntologyLite(RAW);
    expect(out).toEqual({ themes: ["雨夜離別"], emotions: ["寂寞"], imagery: ["窗外雨聲"], artist: "虛構歌手" });
    const s = JSON.stringify(out);
    for (const bad of ["EVIDENCE_SENTINEL", "TIMELINE_SENTINEL", "CAUSE_SENTINEL", "LINK_SENTINEL", "LYRIC_SENTINEL"]) {
      expect(s).not.toContain(bad);
    }
  });

  it("4. accepts a JSON string; garbage / empty -> null; malformed items skipped", () => {
    expect(toOntologyLite(JSON.stringify(RAW))).toEqual(toOntologyLite(RAW));
    for (const v of [null, undefined, 42, "not json {", [], {}, { theme: "x" }]) {
      expect(toOntologyLite(v)).toBeNull();
    }
    const messy = { theme: [{ label: 5 }, { label: "  好  " }, "x", null, { label: "" }] };
    expect(toOntologyLite(messy)).toEqual({ themes: ["好"], emotions: [], imagery: [], artist: null });
  });
});

describe("KPP-6 shortlistCandidates", () => {
  it("5. (a) normal query: <=20 songs, relevant songs ranked first, all from input", () => {
    const input = catalog();
    const res = shortlistCandidates(LONELY_RAIN, input);
    expect(SHORTLIST_LIMIT).toBe(20);
    expect(res.candidates).toHaveLength(20);
    expect(res.candidates.slice(0, 3).map((c) => c.slug)).toEqual(["syn-rain-1", "syn-rain-2", "syn-null-1"]);
    expect(res.matched).toBe(3);
    expect(res.fallback).toBe(false);
    const slugs = res.candidates.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const c of res.candidates) expect(input).toContain(c); // same references, nothing invented
  });

  it("6. (b) obscure query with no match: non-empty fallback, deterministic, spread over categories", () => {
    const input = catalog();
    const a = shortlistCandidates("qzxv", input);
    const b = shortlistCandidates("qzxv", catalog());
    expect(a.fallback).toBe(true);
    expect(a.matched).toBe(0);
    expect(a.candidates).toHaveLength(20);
    expect(a.candidates.map((c) => c.slug)).toEqual(b.candidates.map((c) => c.slug));
    expect(new Set(a.candidates.map((c) => c.category)).size).toBe(CATS.length);
    const stopOnly = shortlistCandidates("想聽歌", input);
    expect(stopOnly.fallback).toBe(true);
    expect(stopOnly.candidates.length).toBeGreaterThan(0);
  });

  it("7. (c) null / missing ontology never crashes and can still match on category/title", () => {
    const noOnto: SongCandidate[] = catalog().map((c) => ({ ...c, ontology: undefined }));
    noOnto[0] = { ...noOnto[0], ontology: null };
    const res = shortlistCandidates("想聽爵士", noOnto);
    const jazz = noOnto.filter((c) => c.category === "爵士").map((c) => c.slug);
    expect(jazz).toContain("syn-null-1");
    expect(res.matched).toBe(jazz.length);
    expect(new Set(res.candidates.slice(0, jazz.length).map((c) => c.slug))).toEqual(new Set(jazz));

    const byTitle = shortlistCandidates("寂寞", [SUN1, NULL1]);
    expect(byTitle.candidates.map((c) => c.slug)).toEqual(["syn-null-1", "syn-sun-1"]);
    expect(byTitle.matched).toBe(1);
  });

  it("8. limit, small and empty inputs, duplicate slugs, no mutation", () => {
    const input = catalog().map((c) => Object.freeze({ ...c }));
    Object.freeze(input);
    const before = input.map((c) => c.slug);
    expect(shortlistCandidates(LONELY_RAIN, input, { limit: 5 }).candidates).toHaveLength(5);
    expect(shortlistCandidates(LONELY_RAIN, input, { limit: 0 }).candidates).toHaveLength(20);
    expect(input.map((c) => c.slug)).toEqual(before);

    const small = shortlistCandidates("qzxv", [RAIN1, SUN1, NULL1]);
    expect(small.candidates).toHaveLength(3);

    const empty = shortlistCandidates("寂寞", []);
    expect(empty).toEqual({ candidates: [], matched: 0, fallback: true });

    const dup = shortlistCandidates("寂寞", [RAIN1, { ...RAIN1, title: "dup" }, SUN1]);
    expect(dup.candidates.map((c) => c.slug)).toEqual(["syn-rain-1", "syn-sun-1"]);
    expect(dup.candidates[0].title).toBe("測試歌雨");
  });

  it("9. tier 2: no bigram match -> single-character match (minus STOP_CHARS) before falling back", () => {
    expect(queryChars("下雨天")).toEqual(["雨"]);
    expect(queryChars("想聽歌")).toEqual([]);
    const res = shortlistCandidates("下雨天", catalog());
    expect(res.candidates[0].slug).toBe("syn-rain-1");
    expect(res.matched).toBe(1);
    expect(res.fallback).toBe(false);
    // tier 2 is not used when tier 1 already matched something ("興奮" hits syn-sun-1; "雨" alone would add syn-rain-1)
    const mixed = shortlistCandidates("興奮雨", catalog());
    expect(mixed.matched).toBe(1);
    expect(mixed.candidates[0].slug).toBe("syn-sun-1");
  });
});
