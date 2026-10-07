/* ------------------------------------------------------------------
 * KaC 個人介紹頁 — 唯一嘅文案來源 (single source of copy)。
 * KaC 改字只需要改呢個檔。
 *
 * 私隱規則：顯示名用「Desmond Cheung」（2026-10-05 本人批准），唔可以有相、
 * 電郵地址，亦唔可以有 futa9 私人 code、key 或內部資料。
 * ------------------------------------------------------------------ */

export type Lang = "zh" | "en";

export type SectionId = "intro" | "interests" | "projects" | "contact";

export type ParkObjectId = "signpost" | "bench" | "tree" | "mailbox";

/** 公園物件 → 介紹部分：一撳物件就彈出對應部分。 */
export const OBJECT_SECTION_MAP: Record<ParkObjectId, SectionId> = {
  signpost: "intro",
  bench: "interests",
  tree: "projects",
  mailbox: "contact",
};

export const PARK_OBJECT_IDS: ParkObjectId[] = [
  "signpost",
  "bench",
  "tree",
  "mailbox",
];

export const SECTION_IDS: SectionId[] = [
  "intro",
  "interests",
  "projects",
  "contact",
];

/* X handle：KaC 請將下面嘅預留字換成你嘅 X 帳號（淨係呢一度）。
 * 例：export const X_HANDLE = "@kac_real"; */
export const X_HANDLE = "@YOUR_X_HANDLE";
export const X_HANDLE_IS_PLACEHOLDER = X_HANDLE === "@YOUR_X_HANDLE";

export const GITHUB_URL = "https://github.com/cfg9527";

export const LANG_STORAGE_KEY = "kac-park-lang";

export interface ProjectItem {
  name: string;
  line: string;
}

export interface SectionCopy {
  tabLabel: string;
  objectLabel: string;
  title: string;
  body: string[];
  projects?: ProjectItem[];
}

export interface SiteCopy {
  pageTitle: string;
  pageSubtitle: string;
  langToggleLabel: string;
  parkHint: string;
  dpadLabel: string;
  closeLabel: string;
  walkToLabel: string;
  githubLabel: string;
  xLabel: string;
  xPlaceholderNote: string;
  footerNote: string;
  sections: Record<SectionId, SectionCopy>;
}

export const siteContent: Record<Lang, SiteCopy> = {
  zh: {
    pageTitle: "Desmond Cheung 嘅像素公園",
    pageSubtitle: "四圍行吓，㩒吓啲物件，認識吓我啦！",
    langToggleLabel: "EN",
    parkHint:
      "玩法：用鍵盤方向鍵 / WASD 行，㩒物件睇介紹；手機可以篤地面行，或者用畫面方向掣。下面都有快捷掣直達每一部分。",
    dpadLabel: "方向掣",
    closeLabel: "閂咗佢",
    walkToLabel: "行過去",
    githubLabel: "GitHub",
    xLabel: "X",
    xPlaceholderNote: "（X 帳號待 Desmond Cheung 填寫）",
    footerNote: "Desmond Cheung 用像素起嘅小公園",
    sections: {
      intro: {
        tabLabel: "自我介紹",
        objectLabel: "路牌",
        title: "哈囉，我係 Desmond Cheung！",
        body: ["一個鍾意將古靈精怪嘅諗法，變成真嘢嘅人。"],
      },
      interests: {
        tabLabel: "興趣同性格",
        objectLabel: "長凳",
        title: "ENTP · 坐低傾吓偈",
        body: [
          "性格：ENTP —— 鍾意發問、拆嘢、再重組返。",
          "興趣：由量子物理去到古典小說，乜都想試吓、乜都想知點解。",
        ],
      },
      projects: {
        tabLabel: "做緊嘅嘢",
        objectLabel: "大樹",
        title: "種緊嘅三樖嘢",
        body: [],
        projects: [
          {
            name: "futa9",
            line: "以 Ontology Action Framework 起嘅供應鏈 demo。",
          },
          {
            name: "QRNG",
            line: "量子隨機數實驗，玩真隨機。",
          },
          {
            name: "閱微",
            line: "古典誌怪小說嘅新編重述。",
          },
        ],
      },
      contact: {
        tabLabel: "聯絡",
        objectLabel: "郵箱",
        title: "寄封信畀我",
        body: ["想搵我？去 GitHub 探我啦！X 帳號好快會有。"],
      },
    },
  },
  en: {
    pageTitle: "Desmond Cheung's Pixel Park",
    pageSubtitle: "Walk around, poke the objects, and meet me!",
    langToggleLabel: "繁中",
    parkHint:
      "How to play: walk with arrow keys / WASD and poke objects for each section. On mobile, tap the ground to walk or use the on-screen pad. Shortcut buttons below jump to every section.",
    dpadLabel: "D-pad",
    closeLabel: "Close",
    walkToLabel: "Walk over",
    githubLabel: "GitHub",
    xLabel: "X",
    xPlaceholderNote: "(X handle to be filled in by Desmond Cheung)",
    footerNote: "A tiny pixel park built by Desmond Cheung",
    sections: {
      intro: {
        tabLabel: "Intro",
        objectLabel: "Signpost",
        title: "Hi, I'm Desmond Cheung!",
        body: ["I turn quirky ideas into real things."],
      },
      interests: {
        tabLabel: "Interests",
        objectLabel: "Bench",
        title: "ENTP · take a seat",
        body: [
          "Personality: ENTP — I love asking questions, taking things apart, and putting them back together.",
          "Interests: from quantum physics to classical tales — I want to try everything and know why everything.",
        ],
      },
      projects: {
        tabLabel: "Projects",
        objectLabel: "Big tree",
        title: "Three things growing",
        body: [],
        projects: [
          {
            name: "futa9",
            line: "A supply-chain demo built on an Ontology Action Framework.",
          },
          {
            name: "QRNG",
            line: "Quantum random number experiments — playing with true randomness.",
          },
          {
            name: "閱微 (Yuewei)",
            line: "Retellings of classical Chinese tales.",
          },
        ],
      },
      contact: {
        tabLabel: "Contact",
        objectLabel: "Mailbox",
        title: "Drop me a letter",
        body: ["Want to reach me? Find me on GitHub! X handle coming soon."],
      },
    },
  },
};
