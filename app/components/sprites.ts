/* Hand-drawn pixel sprites for KaC's park. Original art, no external assets.
 * "." = transparent. Each map renders 1 rect per pixel via SVG. */

export interface Sprite {
  rows: string[];
  palette: Record<string, string>;
}

const SKIN = "#ffd9b3";
const INK = "#3a2e2a";
const CAP = "#5faf6a";
const CAP_DARK = "#3f8f52";
const SHIRT = "#7cc7e8";
const PANTS = "#5a6b8c";
const SHOE = "#6b4a35";

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
  palette: { p: "#8a5a3b", w: "#f5deb3", S: INK },
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
  palette: { r: "#8a5a3b", w: "#c98f5f", p: INK },
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
  palette: { g: "#3f8f52", w: "#9be08a", t: "#8a5a3b" },
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
  palette: { r: "#ff8fa3", w: "#fff9ec", y: "#5a6b8c" },
};

export const FLOWER_A: Sprite = {
  rows: [".pp.", "pwwp", "pwwp", ".pp.", ".gg.", "gggg"],
  palette: { p: "#ff8fa3", w: "#ffd93d", g: "#3f8f52" },
};

export const FLOWER_B: Sprite = {
  rows: [".bb.", "bwwb", "bwwb", ".bb.", ".gg.", "gggg"],
  palette: { b: "#b388ff", w: "#fff9ec", g: "#3f8f52" },
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
  palette: { w: "#7cc7e8", b: "#b8e6f5" },
};
