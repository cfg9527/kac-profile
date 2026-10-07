export const CATEGORIES = [
  "華語流行",
  "西方搖滾",
  "電子Hip-Hop",
  "參考資料",
  "分冊目錄",
  "爵士",
  "J-Pop",
  "K-pop",
  "古典",
  "東南亞",
  "跨界",
] as const;
export type Category = (typeof CATEGORIES)[number];
export function isCategory(v: unknown): v is Category {
  return typeof v === "string" && (CATEGORIES as readonly string[]).includes(v);
}
export type Kind = "song" | "album" | "artist" | "playlist" | "film" | "interview" | "index";
export interface Entry {
  id: number;
  slug: string;
  title: string;
  category: Category;
  kind: Kind;
  summary: string;
  albumRef: string | null;
  bodyMd: string | null;
  bodyTruncated: boolean;
}
export interface RecommendRequest {
  query: string;
}
export interface Pick {
  slug: string;
  title: string;
  category: Category;
  reason: string;
}
export type RecommendErrorCode =
  | "invalid_input"
  | "rate_limited"
  | "daily_cap"
  | "budget_exhausted"
  | "gateway_rate_limited"
  | "gateway_error"
  | "config";
export type RecommendResponse =
  | { ok: true; picks: Pick[] }
  | { ok: false; error: RecommendErrorCode; message: string };

// KPP-6 contract: label-only view of an entry's ontology, used by the
// recommender shortlist and prompt. It never carries evidence quotes,
// timeline, causality or links, and never any page body or lyrics.
export interface OntologyLite {
  themes: string[];
  emotions: string[];
  imagery: string[];
  artist: string | null;
}

// KPP-6 contract: one song the recommender may pick from.
// Only these fields may ever reach the AI prompt.
export interface SongCandidate {
  slug: string;
  title: string;
  category: Category;
  summary: string;
  ontology?: OntologyLite | null;
}
