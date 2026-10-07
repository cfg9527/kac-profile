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

/**
 * Split a visitor query into match grams.
 * - NFKC + lowercase.
 * - CJK runs (Han, Hiragana, Katakana, Hangul, "ー"): a 1-char run yields that char;
 *   a longer run yields every adjacent 2-char bigram. Bigrams never span punctuation/space.
 * - Other letter/number runs: the whole word if length >= 2.
 * - STOP_GRAMS removed; duplicates removed; first-seen order kept.
 */
export function queryGrams(query: string): string[] {
  void query;
  throw new Error("KPP-6: queryGrams not implemented");
}

/**
 * Tier-2 grams: distinct single CJK characters of the query (NFKC + lowercase),
 * minus STOP_CHARS, first-seen order. Used only when tier 1 (queryGrams) matches no song.
 */
export function queryChars(query: string): string[] {
  void query;
  throw new Error("KPP-6: queryChars not implemented");
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
  void raw;
  throw new Error("KPP-6: toOntologyLite not implemented");
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
  void query;
  void candidates;
  void opts;
  throw new Error("KPP-6: shortlistCandidates not implemented");
}
