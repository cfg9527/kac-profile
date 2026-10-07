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

/* KPP-7: recommender UI copy (zh only, as before) lives here so
 * Recommender.tsx has no hard-coded strings. Voice: stream-of-consciousness
 * night-sea imagery. `loading` keeps the word 「諗緊」 (e2e relies on it). */
export interface RecommenderCopy {
  heading: string;
  intro: string;
  inputLabel: string;
  inputAria: string;
  placeholder: string;
  submit: string;
  submitting: string;
  loading: string;
  close: string;
}

export const RECOMMENDER_COPY: RecommenderCopy = {
  heading: "海入面撈首歌畀你",
  intro: "講下你今晚嘅心情啦，等我潛入收藏個海，睇吓邊粒星、邊朵浪、邊條鯨魚游過嚟，幫你揀 1 至 3 首啱聽嘅歌。",
  inputLabel: "你嘅心情或者要求，寫低啦（最多 300 字，似海咁深都得）",
  inputAria: "你嘅心情或者要求",
  placeholder: "例如：今晚個海好靜，想聽啲星光浮喺浪面嘅歌",
  submit: "撈首歌上嚟",
  submitting: "潛緊水…",
  loading: "諗緊…潛緊入海幫你撈緊歌，啲泡泡浮緊上嚟",
  close: "游返出去",
};

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
    pageSubtitle: "夜色落到海面，星光碎成浪，鯨魚喺夢入面翻身——四圍行吓，㩒吓啲物件，認識吓我啦！",
    langToggleLabel: "EN",
    parkHint:
      "玩法：用鍵盤方向鍵 / WASD 喺夜海邊行，星光做路燈，潮聲做背景；㩒吓啲物件睇介紹，睇吓邊朵浪會開口；手機可以篤地面行，或者用畫面方向掣。下面都有快捷掣直達每一部分。",
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
        title: "哈囉，我係 Desmond Cheung，夜海邊行緊過嚟！",
        body: ["我係一個鍾意將古靈精怪嘅諗法變成真嘢嘅人——諗法好似夜晚嘅浪咁，一個接一個湧上嚟，星光一照就變成泡泡，鯨魚咁大嘅夢都浮得起。"],
      },
      interests: {
        tabLabel: "興趣同性格",
        objectLabel: "長凳",
        title: "ENTP · 夜晚坐喺長凳睇星",
        body: [
          "性格：ENTP —— 腦入面成晚開緊派對，諗法跳嚟跳去，好似星落海面咁一閃一閃，拆完再重組返，連雲都追唔上。",
          "興趣：由量子物理游到古典小說，好似由浪尖潛到深海咁，乜都想試吓、乜都想知點解，連夢入面條鯨魚游去邊都想知。",
        ],
      },
      projects: {
        tabLabel: "做緊嘅嘢",
        objectLabel: "大樹",
        title: "夢入面種緊嘅三樖嘢",
        body: [],
        projects: [
          {
            name: "futa9",
            line: "以 Ontology Action Framework 起嘅供應鏈 demo，好似喺夜海上面搭一條星光浮橋咁。",
          },
          {
            name: "QRNG",
            line: "量子隨機數實驗，玩真隨機——好似浪花咁，每一朵泡泡都估唔到。",
          },
          {
            name: "閱微",
            line: "古典誌怪小說嘅新編重述，等啲舊夢喺星空下翻身，好似鯨魚咁。",
          },
        ],
      },
      contact: {
        tabLabel: "聯絡",
        objectLabel: "郵箱",
        title: "喺潮聲入面寄封信畀我",
        body: ["夜晚個海咁大，想搵我？去 GitHub 探我啦，等星光帶你嚟！X 帳號仲喺雲後面瞓緊，好快就會浮上嚟。"],
      },
    },
  },
  en: {
    pageTitle: "Desmond Cheung's Pixel Park",
    pageSubtitle: "The night sea is dreaming — stars melting into waves, a whale turning over in its sleep. Walk around, poke the objects, and meet me!",
    langToggleLabel: "繁中",
    parkHint:
      "How to play: walk the night shore with arrow keys / WASD, starlight for street lamps and the tide for background music. Poke objects for each section and see which wave speaks. On mobile, tap the ground to walk or use the on-screen pad. Shortcut buttons below jump to every section.",
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
        title: "Hi, I'm Desmond Cheung, walking over from the night sea!",
        body: ["I turn quirky ideas into real things — ideas keep rolling in like night waves, bursting into bubbles under the starlight, big enough to float a dreaming whale."],
      },
      interests: {
        tabLabel: "Interests",
        objectLabel: "Bench",
        title: "ENTP · sitting on the bench watching the stars",
        body: [
          "Personality: ENTP — my head throws parties all night, thoughts jumping like starlight on the sea, taken apart and put back together while the clouds chase behind.",
          "Interests: from quantum physics to classical tales, diving from the wave tops to the deep sea — I want to try everything and know why everything, even where the whale in my dream is swimming.",
        ],
      },
      projects: {
        tabLabel: "Projects",
        objectLabel: "Big tree",
        title: "Three things growing by the night sea",
        body: [],
        projects: [
          {
            name: "futa9",
            line: "A supply-chain demo built on an Ontology Action Framework, like building a starlight pontoon across the night sea.",
          },
          {
            name: "QRNG",
            line: "Quantum random number experiments — playing with true randomness, every bubble of the wave unpredictable.",
          },
          {
            name: "閱微 (Yuewei)",
            line: "Retellings of classical Chinese tales, letting old dreams turn over under the stars like a whale.",
          },
        ],
      },
      contact: {
        tabLabel: "Contact",
        objectLabel: "Mailbox",
        title: "Drop me a letter in the sound of the tide",
        body: ["The night sea is wide — want to reach me? Find me on GitHub and let the starlight guide you! The X handle is still napping behind a cloud, surfacing soon."],
      },
    },
  },
};
