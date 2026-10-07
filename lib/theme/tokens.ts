/* KPP-7 contract: "dream pixel night-sea" theme tokens.
 * Single source of truth for colours. globals.css must define one
 * `--color-dn-<kebab-name>` custom property per key below with the same
 * value (e.g. glowTeal -> --color-dn-glow-teal).
 *
 * Every text/background combination the site renders must be listed in
 * TEXT_PAIRS and must pass WCAG AA (4.5:1 normal text, 3:1 large text).
 * Style reference only: KaC's reference picture is NOT an asset and must
 * never be copied into the repo. All art is CSS/SVG made by us. */

export type HexColor = `#${string}`;

export type DreamColorName =
  | "night" // page background, deepest blue
  | "deep" // input / sea-deep surface
  | "panel" // opaque card / dialog / plate surface
  | "violet" // cloud / border purple
  | "magenta" // dusk cloud highlight
  | "ember" // orange-red horizon
  | "dusk" // warm orange (secondary button / chip)
  | "glowTeal" // glowing sea / primary button / links
  | "foam" // wave crest highlight
  | "moon" // primary text on dark surfaces
  | "mist" // secondary text on dark surfaces
  | "ink"; // dark text on bright surfaces (buttons, chips)

export type DreamPalette = Record<DreamColorName, HexColor>;

export interface TextPair {
  /** where it is used, e.g. "card body" */
  name: string;
  fg: DreamColorName;
  bg: DreamColorName;
  /** true only for >= 24px regular / >= 18.66px bold text (AA large: 3:1) */
  large?: boolean;
}

export const AA_NORMAL = 4.5;
export const AA_LARGE = 3;

/** TODO(KPP-7): real palette. Placeholder values intentionally fail the tests. */
export const DREAM_COLORS: DreamPalette = {
  night: "#000000",
  deep: "#000000",
  panel: "#000000",
  violet: "#000000",
  magenta: "#000000",
  ember: "#000000",
  dusk: "#000000",
  glowTeal: "#000000",
  foam: "#000000",
  moon: "#000000",
  mist: "#000000",
  ink: "#000000",
};

/** Every text/background pair the UI uses. Do not remove entries. */
export const TEXT_PAIRS: readonly TextPair[] = [
  { name: "page body / footer plate", fg: "moon", bg: "night" },
  { name: "footer secondary", fg: "mist", bg: "night" },
  { name: "card + dialog text", fg: "moon", bg: "panel" },
  { name: "card secondary text", fg: "mist", bg: "panel" },
  { name: "link on card", fg: "glowTeal", bg: "panel" },
  { name: "input text", fg: "moon", bg: "deep" },
  { name: "input placeholder", fg: "mist", bg: "deep" },
  { name: "primary button", fg: "ink", bg: "glowTeal" },
  { name: "secondary button / chip", fg: "ink", bg: "dusk" },
  { name: "cream button", fg: "ink", bg: "foam" },
];

/** WCAG 2.x relative luminance of a #rrggbb colour (0..1). Throws on bad input. */
export function relativeLuminance(hex: string): number {
  void hex;
  throw new Error("relativeLuminance: not implemented");
}

/** WCAG 2.x contrast ratio between two #rrggbb colours (1..21), order-independent. */
export function contrastRatio(a: string, b: string): number {
  void a;
  void b;
  throw new Error("contrastRatio: not implemented");
}

/** CSS custom property name for a token, e.g. glowTeal -> "--color-dn-glow-teal". */
export function cssVarName(name: DreamColorName): string {
  return `--color-dn-${name.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`;
}
