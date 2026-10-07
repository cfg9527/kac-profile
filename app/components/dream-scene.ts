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

/**
 * CSS px per star size unit. A star renders as a square of side
 * `size * STAR_PIXEL` px, so the smallest star (size 1) is STAR_PIXEL px.
 */
export const STAR_PIXEL = 4;

/* Hand-placed pixel stars in the sky band (percentages of the backdrop box).
 * The top rows sit in the band above the header and the outer columns sit in
 * the side margins on wide screens, so they stay visible around the cards. */
export const DREAM_STARS: readonly DreamStar[] = [
  { x: 5, y: 2, size: 2, delay: 0 },
  { x: 20, y: 1.5, size: 1, delay: 0.7 },
  { x: 35, y: 3, size: 3, delay: 1.3 },
  { x: 50, y: 1, size: 2, delay: 0.4 },
  { x: 65, y: 2.5, size: 1, delay: 2.1 },
  { x: 80, y: 1.5, size: 3, delay: 1.1 },
  { x: 93, y: 3, size: 2, delay: 0.2 },
  { x: 8, y: 5, size: 1, delay: 1.8 },
  { x: 2, y: 12, size: 2, delay: 0.9 },
  { x: 97, y: 10, size: 1, delay: 2.4 },
  { x: 12, y: 22, size: 3, delay: 0.5 },
  { x: 88, y: 20, size: 2, delay: 1.5 },
  { x: 28, y: 15, size: 1, delay: 2.8 },
  { x: 45, y: 30, size: 2, delay: 0.1 },
  { x: 60, y: 40, size: 3, delay: 1.9 },
  { x: 75, y: 35, size: 1, delay: 2.2 },
  { x: 16, y: 42, size: 2, delay: 1.2 },
  { x: 84, y: 46, size: 2, delay: 2.6 },
];

/** Hand-placed wave glints in the sea band (percentages of the backdrop box). */
export const DREAM_GLINTS: readonly DreamGlint[] = [
  { x: 8, y: 72, w: 6, delay: 0 },
  { x: 22, y: 84, w: 10, delay: 0.8 },
  { x: 37, y: 70, w: 5, delay: 1.6 },
  { x: 52, y: 90, w: 12, delay: 0.3 },
  { x: 68, y: 76, w: 7, delay: 2 },
  { x: 81, y: 88, w: 9, delay: 1.1 },
  { x: 93, y: 70, w: 5, delay: 2.5 },
];
