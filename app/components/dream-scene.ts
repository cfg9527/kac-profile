/* KPP-7 contract: data for the dream night-sea backdrop (DreamBackdrop.tsx).
 * Positions are percentages of the backdrop box. Must be deterministic
 * (fixed literals only, no random or clock values) so SSR and hydration match.
 * Original art only; nothing traced from KaC's reference picture. */

export const SKY_TESTID = "dream-sky";
export const SEA_TESTID = "dream-sea";
export const STAR_TESTID = "dream-star";

export interface DreamStar {
  /** 0..100 (% of backdrop width) */
  x: number;
  /** 0..60 (% of backdrop height; stars stay in the sky above the sea) */
  y: number;
  /** pixel size in CSS px blocks */
  size: 1 | 2 | 3;
  /** animation delay in seconds, >= 0 */
  delay: number;
}

export interface DreamGlint {
  /** 0..100 */
  x: number;
  /** 60..100 (in the sea band) */
  y: number;
  /** width in % (0 < w <= 20) */
  w: number;
  /** animation delay in seconds, >= 0 */
  delay: number;
}

/** TODO(KPP-7): at least 16 stars. */
export const DREAM_STARS: readonly DreamStar[] = [];

/** TODO(KPP-7): at least 6 wave glints. */
export const DREAM_GLINTS: readonly DreamGlint[] = [];
