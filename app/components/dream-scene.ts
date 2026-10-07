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

/** Hand-placed pixel stars in the sky band (percentages of the backdrop box). */
export const DREAM_STARS: readonly DreamStar[] = [
  { x: 4, y: 6, size: 2, delay: 0 },
  { x: 11, y: 18, size: 1, delay: 0.7 },
  { x: 18, y: 8, size: 3, delay: 1.3 },
  { x: 25, y: 28, size: 1, delay: 0.4 },
  { x: 31, y: 12, size: 2, delay: 2.1 },
  { x: 38, y: 4, size: 1, delay: 1.1 },
  { x: 44, y: 22, size: 2, delay: 0.2 },
  { x: 51, y: 10, size: 1, delay: 1.8 },
  { x: 57, y: 32, size: 3, delay: 0.9 },
  { x: 63, y: 6, size: 2, delay: 2.4 },
  { x: 70, y: 18, size: 1, delay: 0.5 },
  { x: 76, y: 28, size: 2, delay: 1.5 },
  { x: 82, y: 10, size: 1, delay: 2.8 },
  { x: 88, y: 24, size: 3, delay: 0.1 },
  { x: 93, y: 14, size: 2, delay: 1.9 },
  { x: 97, y: 38, size: 1, delay: 2.2 },
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
