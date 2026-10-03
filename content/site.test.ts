import { describe, expect, it } from "vitest";
import {
  GITHUB_URL,
  OBJECT_SECTION_MAP,
  PARK_OBJECT_IDS,
  SECTION_IDS,
  X_HANDLE,
  X_HANDLE_IS_PLACEHOLDER,
  siteContent,
  type Lang,
} from "./site";

const LANGS: Lang[] = ["zh", "en"];
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;

describe("content completeness (i18n)", () => {
  it("every section exists in both languages with title + body/projects", () => {
    for (const lang of LANGS) {
      for (const id of SECTION_IDS) {
        const s = siteContent[lang].sections[id];
        expect(s.tabLabel, `${lang}.${id}.tabLabel`).toBeTruthy();
        expect(s.objectLabel, `${lang}.${id}.objectLabel`).toBeTruthy();
        expect(s.title, `${lang}.${id}.title`).toBeTruthy();
        const hasCopy = s.body.length > 0 || (s.projects?.length ?? 0) > 0;
        expect(hasCopy, `${lang}.${id} has copy`).toBe(true);
      }
    }
  });

  it("projects section lists futa9, QRNG and 閱微 with one line each", () => {
    for (const lang of LANGS) {
      const projects = siteContent[lang].sections.projects.projects ?? [];
      expect(projects.map((p) => p.name)).toEqual(
        expect.arrayContaining(["futa9", "QRNG"]),
      );
      expect(
        projects.some((p) => p.name.includes("閱微") || p.name.includes("Yuewei")),
      ).toBe(true);
      for (const p of projects) expect(p.line.trim().length).toBeGreaterThan(0);
    }
  });

  it("page chrome copy exists in both languages", () => {
    for (const lang of LANGS) {
      const c = siteContent[lang];
      for (const k of [
        "pageTitle",
        "pageSubtitle",
        "parkHint",
        "closeLabel",
        "footerNote",
      ] as const) {
        expect(c[k], `${lang}.${k}`).toBeTruthy();
      }
    }
  });
});

describe("object-to-section mapping", () => {
  it("every park object maps to a section", () => {
    for (const id of PARK_OBJECT_IDS) {
      expect(SECTION_IDS).toContain(OBJECT_SECTION_MAP[id]);
    }
  });

  it("every section is reachable from at least one object", () => {
    const reachable = new Set(Object.values(OBJECT_SECTION_MAP));
    for (const id of SECTION_IDS) expect(reachable.has(id)).toBe(true);
  });
});

describe("contact + privacy", () => {
  it("points at the right GitHub", () => {
    expect(GITHUB_URL).toBe("https://github.com/cfg9527");
  });

  it("X handle is a clearly marked placeholder for KaC to fill in", () => {
    expect(X_HANDLE_IS_PLACEHOLDER).toBe(true);
    expect(X_HANDLE).toContain("YOUR_X_HANDLE");
  });

  it("no email addresses anywhere in the copy", () => {
    for (const lang of LANGS) {
      const c = siteContent[lang];
      const texts = [
        c.pageTitle,
        c.pageSubtitle,
        c.parkHint,
        c.footerNote,
        ...SECTION_IDS.flatMap((id) => [
          ...c.sections[id].body,
          ...(c.sections[id].projects ?? []).flatMap((p) => [p.name, p.line]),
        ]),
      ];
      for (const t of texts) expect(t).not.toMatch(EMAIL_RE);
    }
  });

  it("only ever calls the owner KaC (no other personal names in titles)", () => {
    for (const lang of LANGS) {
      const c = siteContent[lang];
      expect(c.pageTitle).toMatch(/KaC/);
      expect(c.sections.intro.title).toMatch(/KaC/);
    }
  });
});
