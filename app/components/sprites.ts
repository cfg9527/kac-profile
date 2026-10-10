/* Hand-drawn pixel sprites for KaC's park. Original art, no external assets.
 * "." = transparent. Each map renders 1 rect per pixel via SVG. */

export interface Sprite {
  rows: string[];
  palette: Record<string, string>;
}

const SKIN = "#ffd9b3";
const INK = "#0a1620";
const CAP = "#6ba3c4";
const CAP_DARK = "#4a7fa0";
const SHIRT = "#5ec8e6";
const PANTS = "#0d4568";
const SHOE = "#d9a85c";

export const KAC_FRAMES: Sprite[] = [
  {
    // standing / walk frame A
    rows: [
      "....gggg....",
      "...gggggg...",
      "...gggggg...",
      "....ssss....",
      "....ssss....",
      "...ssssss...",
      "....bbbb....",
      "..bbbbbbbb..",
      "...bbbbbb...",
      "...bbbbbb...",
      "....bbbb....",
      "....pppp....",
      "....pppp....",
      "....p..p....",
      "...hh..hh...",
    ],
    palette: {
      g: CAP,
      s: SKIN,
      b: SHIRT,
      p: PANTS,
      h: SHOE,
    },
  },
  {
    // walk frame B (legs swapped)
    rows: [
      "....gggg....",
      "...gggggg...",
      "...gggggg...",
      "....ssss....",
      "....ssss....",
      "...ssssss...",
      "....bbbb....",
      "..bbbbbbbb..",
      "...bbbbbb...",
      "...bbbbbb...",
      "....bbbb....",
      "....pppp....",
      "....pppp....",
      "...p....p...",
      "...hh..hh...",
    ],
    palette: {
      g: CAP_DARK,
      s: SKIN,
      b: SHIRT,
      p: PANTS,
      h: SHOE,
    },
  },
];

export const SIGNPOST: Sprite = {
  rows: [
    "pppppppppppp",
    "pwwwwwwwwwwp",
    "pwSSSSpppppp",
    "pwwwwwwwwwwp",
    "pppppppppppp",
    ".....pp.....",
    ".....pp.....",
    ".....pp.....",
    ".....pp.....",
    ".....pp.....",
    "...pppppp...",
    "...pppppp...",
  ],
  palette: { p: "#0d4568", w: "#e8f0f5", S: INK },
};

export const BENCH: Sprite = {
  rows: [
    "................",
    ".rrrrrrrrrrrrrr.",
    ".rwwwwwwwwwwwwr.",
    ".rrrrrrrrrrrrrr.",
    "..p........p....",
    "..p........p....",
    "..p........p....",
    "..pppp..pppp....",
  ],
  palette: { r: "#003153", w: "#6ba3c4", p: INK },
};

export const TREE: Sprite = {
  rows: [
    ".....gggg.....",
    "...gggggggg...",
    "..gggggggggg..",
    ".gggggggggggg.",
    ".ggwggggggwgg.",
    ".gggggggggggg.",
    "..gggggggggg..",
    "...gggggggg...",
    "......tt......",
    "......tt......",
    "......tt......",
    "....tttttt....",
  ],
  palette: { g: "#1a5a72", w: "#5ec8e6", t: "#0a1620" },
};

export const MAILBOX: Sprite = {
  rows: [
    ".....rr.....",
    "....rrrr....",
    "...rrrrrr...",
    "..rrrrrrrr..",
    "..rwrrrrrr..",
    "..rrrrrrrr..",
    "..rrrrrrrr..",
    "...rrrrrr...",
    ".....yy.....",
    ".....yy.....",
    ".....yy.....",
    "...yyyyyy...",
  ],
  palette: { r: "#b87a8c", w: "#e8f0f5", y: "#d9a85c" },
};

export const FLOWER_A: Sprite = {
  rows: [".pp.", "pwwp", "pwwp", ".pp.", ".gg.", "gggg"],
  palette: { p: "#d46a3a", w: "#d9a85c", g: "#1a5a72" },
};

export const FLOWER_B: Sprite = {
  rows: [".bb.", "bwwb", "bwwb", ".bb.", ".gg.", "gggg"],
  palette: { b: "#6ba3c4", w: "#eef4f8", g: "#1a5a72" },
};

export const POND: Sprite = {
  rows: [
    "....wwwwww......",
    "..wwwwwwwwww....",
    ".wwwwwwwwwwww...",
    ".wwbbwwwwbbww...",
    ".wwwwwwwwwwww...",
    "..wwwwwwwwww....",
    "....wwwwww......",
  ],
  palette: { w: "#003153", b: "#5ec8e6" },
};

/* Moonlit pixel whale for the dream night-sea backdrop. Original art. */
export const WHALE: Sprite = {
  rows: [
    "...ww..............",
    "....wwww...........",
    ".....wwwwwwwwww....",
    "......wwwwwwwwwww..",
    "ww....wewwwwwwww...",
    ".wwwwwwwwwwwwwww...",
    "..wwwwwwwwwwww.....",
    "...wwwwwwww........",
    "....wwww...........",
  ],
  palette: { w: "#6ba3c4", e: "#0a1620" },
};
