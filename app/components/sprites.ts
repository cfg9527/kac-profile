/* Hand-drawn pixel sprites for KaC's park. Original art, no external assets.
 * "." = transparent. Each map renders 1 rect per pixel via SVG. */

export interface Sprite {
  rows: string[];
  palette: Record<string, string>;
}

const SKIN = "#ffd9b3";
const INK = "#10142b";
const CAP = "#7a6ff0";
const CAP_DARK = "#5a4fc4";
const SHIRT = "#4de3c2";
const PANTS = "#2a335f";
const SHOE = "#ffb35c";

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
  palette: { p: "#2a335f", w: "#fff3d6", S: INK },
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
  palette: { r: "#2a335f", w: "#7a6ff0", p: INK },
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
  palette: { g: "#1d5f6e", w: "#4de3c2", t: "#2a335f" },
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
  palette: { r: "#e86fd0", w: "#fff3d6", y: "#ffb35c" },
};

export const FLOWER_A: Sprite = {
  rows: [".pp.", "pwwp", "pwwp", ".pp.", ".gg.", "gggg"],
  palette: { p: "#ff5a3c", w: "#ffb35c", g: "#1d5f6e" },
};

export const FLOWER_B: Sprite = {
  rows: [".bb.", "bwwb", "bwwb", ".bb.", ".gg.", "gggg"],
  palette: { b: "#9d7bff", w: "#f6f2e7", g: "#1d5f6e" },
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
  palette: { w: "#173a52", b: "#4de3c2" },
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
  palette: { w: "#9d7bff", e: "#10142b" },
};
