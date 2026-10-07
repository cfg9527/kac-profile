// KPP-6 contract (types + stubs). Implementation replaces the stub bodies only.
//
// Pure, deterministic shortlist of recommender candidates. No AI, no network,
// no Date/Math.random, never mutates its inputs.
import type { OntologyLite, SongCandidate } from "./types";

/** Max songs sent to the AI per request. */
export const SHORTLIST_LIMIT = 20;

/** Per-field weight. Score = sum over fields of weight x (number of distinct query grams found in that field). */
export const FIELD_WEIGHTS = {
  theme: 3,
  emotions: 3,
  imagery: 2,
  title: 2,
  artist: 2,
  category: 2,
  summary: 1,
} as const;

/** Grams that carry no mood/topic signal; removed by queryGrams(). */
export const STOP_GRAMS: readonly string[] = [
  "想聽", "聽歌", "首歌", "一首", "啲歌", "嘅歌", "俾我", "推介", "介紹", "有冇", "唔該", "可唔", "唔可",
  "the", "and", "for", "me", "some", "song", "songs", "music", "want", "play", "please",
];

/** Single CJK characters ignored by the tier-2 (single-character) match. */
export const STOP_CHARS: readonly string[] = Array.from(
  "我你佢我哋係咗喺嘅啲呢個嗰一的了是在有和人都去要唔冇啦呀吖喇喎囉嘢想聽歌首好今日晚天下上中大小多少啱就又再同但都會可以點樣乜咩邊度啊吧嗎呢唱曲音樂",
);

export interface ShortlistOptions {
  /** Defaults to SHORTLIST_LIMIT. Non-integer, < 1 or non-finite values fall back to the default. */
  limit?: number;
}

export interface ShortlistResult {
  /** The chosen candidates (same object references as the input), length = min(limit, unique input count). */
  candidates: SongCandidate[];
  /** How many of `candidates` scored > 0 against the query. */
  matched: number;
  /** true when matched === 0 (the whole list came from the fallback order). */
  fallback: boolean;
}

const STOP_GRAM_SET = new Set<string>(STOP_GRAMS);
const STOP_CHAR_SET = new Set<string>(STOP_CHARS);

function normalize(s: string): string {
  return s.normalize("NFKC").toLowerCase();
}

function isCjkChar(ch: string): boolean {
  if (ch === "ー") return true;
  return /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(ch);
}

function isLetterOrNumber(ch: string): boolean {
  return /[\p{L}\p{N}]/u.test(ch);
}

function flushCjkRun(run: string, out: string[]): void {
  if (run.length === 0) return;
  if (run.length === 1) {
    out.push(run);
    return;
  }
  const chars = Array.from(run);
  for (let i = 0; i + 1 < chars.length; i++) {
    out.push(chars[i] + chars[i + 1]);
  }
}

/**
 * Split a visitor query into match grams.
 * - NFKC + lowercase.
 * - CJK runs (Han, Hiragana, Katakana, Hangul, "ー"): a 1-char run yields that char;
 *   a longer run yields every adjacent 2-char bigram. Bigrams never span punctuation/space.
 * - Other letter/number runs: the whole word if length >= 2.
 * - STOP_GRAMS removed; duplicates removed; first-seen order kept.
 */
export function queryGrams(query: string): string[] {
  const src = normalize(typeof query === "string" ? query : String(query ?? ""));
  const raw: string[] = [];
  let cjkRun = "";
  let wordRun = "";
  const flushWord = (): void => {
    if (wordRun.length >= 2) raw.push(wordRun);
    wordRun = "";
  };
  const flushCjk = (): void => {
    flushCjkRun(cjkRun, raw);
    cjkRun = "";
  };
  for (const ch of src) {
    if (isCjkChar(ch)) {
      if (wordRun.length > 0) flushWord();
      cjkRun += ch;
    } else if (isLetterOrNumber(ch)) {
      if (cjkRun.length > 0) flushCjk();
      wordRun += ch;
    } else {
      if (cjkRun.length > 0) flushCjk();
      if (wordRun.length > 0) flushWord();
    }
  }
  if (cjkRun.length > 0) flushCjk();
  if (wordRun.length > 0) flushWord();
  const seen = new Set<string>();
  const out: string[] = [];
  for (const g of raw) {
    if (STOP_GRAM_SET.has(g)) continue;
    if (seen.has(g)) continue;
    seen.add(g);
    out.push(g);
  }
  return out;
}

/**
 * Tier-2 grams: distinct single CJK characters of the query (NFKC + lowercase),
 * minus STOP_CHARS, first-seen order. Used only when tier 1 (queryGrams) matches no song.
 */
export function queryChars(query: string): string[] {
  const src = normalize(typeof query === "string" ? query : String(query ?? ""));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const ch of src) {
    if (!isCjkChar(ch)) continue;
    if (STOP_CHAR_SET.has(ch)) continue;
    if (seen.has(ch)) continue;
    seen.add(ch);
    out.push(ch);
  }
  return out;
}

function extractLabels(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) continue;
    const label = (item as Record<string, unknown>)["label"];
    if (typeof label !== "string") continue;
    const t = label.trim();
    if (t.length === 0) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

/**
 * Tolerant projection of a raw `entries.ontology` value (object, JSON string, null, garbage)
 * to label-only OntologyLite.
 * - null / undefined / non-object / array / unparsable string -> null.
 * - themes  <- theme[].label, emotions <- emotions[].label, imagery <- imagery[].label,
 *   artist <- song.artist (string, trimmed, else null).
 * - Labels: strings only, trimmed, empty dropped, duplicates dropped, order kept.
 * - Everything else (evidence, timeline, causality, links, unknown keys) is dropped.
 * - If all three lists are empty and artist is null -> null.
 */
export function toOntologyLite(raw: unknown): OntologyLite | null {
  let obj: unknown = raw;
  if (typeof obj === "string") {
    try {
      obj = JSON.parse(obj) as unknown;
    } catch {
      return null;
    }
  }
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) return null;
  const rec = obj as Record<string, unknown>;
  const themes = extractLabels(rec["theme"]);
  const emotions = extractLabels(rec["emotions"]);
  const imagery = extractLabels(rec["imagery"]);
  let artist: string | null = null;
  const song = rec["song"];
  if (typeof song === "object" && song !== null && !Array.isArray(song)) {
    const a = (song as Record<string, unknown>)["artist"];
    if (typeof a === "string") {
      const t = a.trim();
      if (t.length > 0) artist = t;
    }
  }
  if (themes.length === 0 && emotions.length === 0 && imagery.length === 0 && artist === null) {
    return null;
  }
  return { themes, emotions, imagery, artist };
}

function fnv1a32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function resolveLimit(opts?: ShortlistOptions): number {
  const v = opts?.limit;
  if (typeof v === "number" && Number.isInteger(v) && Number.isFinite(v) && v >= 1) {
    return v;
  }
  return SHORTLIST_LIMIT;
}

function countDistinctGramsInText(grams: readonly string[], textNorm: string): number {
  let n = 0;
  for (const g of grams) {
    if (g.length > 0 && textNorm.includes(g)) n++;
  }
  return n;
}

function countDistinctGramsInLabels(grams: readonly string[], labels: readonly string[]): number {
  if (labels.length === 0 || grams.length === 0) return 0;
  const norms = labels.map((l) => normalize(l));
  let n = 0;
  for (const g of grams) {
    for (const ln of norms) {
      if (ln.includes(g)) {
        n++;
        break;
      }
    }
  }
  return n;
}

function scoreCandidate(c: SongCandidate, grams: readonly string[]): number {
  if (grams.length === 0) return 0;
  const onto = c.ontology ?? null;
  const themes = onto?.themes ?? [];
  const emotions = onto?.emotions ?? [];
  const imagery = onto?.imagery ?? [];
  const artist = typeof onto?.artist === "string" ? onto.artist : "";
  const title = typeof c.title === "string" ? c.title : "";
  const category = typeof c.category === "string" ? c.category : "";
  const summary = typeof c.summary === "string" ? c.summary : "";
  let score = 0;
  score += FIELD_WEIGHTS.theme * countDistinctGramsInLabels(grams, themes);
  score += FIELD_WEIGHTS.emotions * countDistinctGramsInLabels(grams, emotions);
  score += FIELD_WEIGHTS.imagery * countDistinctGramsInLabels(grams, imagery);
  score += FIELD_WEIGHTS.title * countDistinctGramsInText(grams, normalize(title));
  if (artist.length > 0) {
    score += FIELD_WEIGHTS.artist * countDistinctGramsInText(grams, normalize(artist));
  }
  score += FIELD_WEIGHTS.category * countDistinctGramsInText(grams, normalize(category));
  score += FIELD_WEIGHTS.summary * countDistinctGramsInText(grams, normalize(summary));
  return score;
}

/**
 * Pick up to `limit` candidates for the AI.
 * 1. De-duplicate by slug (first occurrence wins).
 * 2. Score each candidate with FIELD_WEIGHTS against queryGrams(query); fields are
 *    NFKC+lowercased; list fields are matched per label (a gram never spans two labels);
 *    a null/missing ontology simply scores 0 on theme/emotions/imagery/artist.
 *    If no candidate scores > 0 with queryGrams(query), score again with queryChars(query) (tier 2).
 * 3. Matched (score > 0) first: score desc, then input order.
 * 4. Pad to `limit` from the fallback order, skipping already chosen songs.
 *    Fallback order = round-robin across categories (category order = first appearance
 *    in the input, songs within a category in input order), starting at category index
 *    fnv1a32(NFKC-lowercased trimmed query) % categoryCount.
 * Never throws for any string query and any candidate list (empty list -> empty result, fallback true).
 */
export function shortlistCandidates(
  query: string,
  candidates: readonly SongCandidate[],
  opts?: ShortlistOptions,
): ShortlistResult {
  try {
    const q = typeof query === "string" ? query : String(query ?? "");
    const limit = resolveLimit(opts);
    const list = Array.isArray(candidates) ? candidates : [];
    const deduped: SongCandidate[] = [];
    const seenSlugs = new Set<string>();
    for (const c of list) {
      if (!c || typeof (c as SongCandidate).slug !== "string") continue;
      const slug = (c as SongCandidate).slug;
      if (seenSlugs.has(slug)) continue;
      seenSlugs.add(slug);
      deduped.push(c as SongCandidate);
    }
    if (deduped.length === 0) {
      return { candidates: [], matched: 0, fallback: true };
    }
    const tier1 = queryGrams(q);
    let grams: string[] = tier1;
    let scores = deduped.map((c) => scoreCandidate(c, grams));
    let anyMatch = scores.some((s) => s > 0);
    if (!anyMatch) {
      grams = queryChars(q);
      scores = deduped.map((c) => scoreCandidate(c, grams));
      anyMatch = scores.some((s) => s > 0);
    }
    const indexed = deduped.map((c, i) => ({ c, i, s: scores[i] ?? 0 }));
    const matchedOrdered = indexed
      .filter((e) => e.s > 0)
      .sort((a, b) => (b.s !== a.s ? b.s - a.s : a.i - b.i));
    const target = Math.min(limit, deduped.length);
    const chosen: SongCandidate[] = [];
    const chosenSlugs = new Set<string>();
    for (const e of matchedOrdered) {
      if (chosen.length >= target) break;
      chosen.push(e.c);
      chosenSlugs.add(e.c.slug);
    }
    const matched = chosen.length;
    if (chosen.length < target) {
      const categories: string[] = [];
      const groups = new Map<string, SongCandidate[]>();
      for (const c of deduped) {
        const cat = c.category as string;
        if (!groups.has(cat)) {
          groups.set(cat, []);
          categories.push(cat);
        }
        groups.get(cat)?.push(c);
      }
      const categoryCount = categories.length;
      let start = 0;
      if (categoryCount > 0) {
        start = fnv1a32(normalize(q).trim()) % categoryCount;
      }
      const maxLen = Math.max(...[...groups.values()].map((g) => g.length));
      const fallbackOrder: SongCandidate[] = [];
      for (let r = 0; r < maxLen; r++) {
        for (let k = 0; k < categoryCount; k++) {
          const cat = categories[(start + k) % categoryCount] as string;
          const g = groups.get(cat);
          if (g && r < g.length) {
            const song = g[r] as SongCandidate;
            fallbackOrder.push(song);
          }
        }
      }
      for (const song of fallbackOrder) {
        if (chosen.length >= target) break;
        if (chosenSlugs.has(song.slug)) continue;
        chosen.push(song);
        chosenSlugs.add(song.slug);
      }
    }
    return { candidates: chosen, matched, fallback: matched === 0 };
  } catch {
    return { candidates: [], matched: 0, fallback: true };
  }
}
