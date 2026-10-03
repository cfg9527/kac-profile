"use client";

import { useCallback, useEffect, useState } from "react";
import ParkScene from "./components/ParkScene";
import SectionPopup from "./components/SectionPopup";
import {
  LANG_STORAGE_KEY,
  SECTION_IDS,
  siteContent,
  type Lang,
  type SectionId,
} from "@/content/site";

export default function Home() {
  const [lang, setLang] = useState<Lang>("zh");
  const [active, setActive] = useState<SectionId | null>(null);
  const copy = siteContent[lang];

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === "zh" || saved === "en") setLang(saved);
    } catch {
      /* private mode: stay on default */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const open = useCallback((s: SectionId) => setActive(s), []);
  const close = useCallback(() => setActive(null), []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 px-3 py-5 sm:px-5">
      <header className="pg-card flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">{copy.pageTitle}</h1>
          <p className="mt-1 font-bold">{copy.pageSubtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setLang(lang === "zh" ? "en" : "zh")}
          aria-label="Switch language / 切換語言"
          data-testid="lang-toggle"
          className="pg-btn pg-btn--pink"
        >
          {copy.langToggleLabel}
        </button>
      </header>

      {/* Accessible fallback: every section reachable as a plain button */}
      <nav
        aria-label={lang === "zh" ? "各部分快捷掣" : "Section shortcuts"}
        className="flex flex-wrap gap-2"
      >
        {SECTION_IDS.map((s) => (
          <button
            key={s}
            type="button"
            data-testid={`nav-${s}`}
            onClick={() => open(s)}
            className="pg-btn pg-btn--cream !text-base"
          >
            {copy.sections[s].tabLabel}
          </button>
        ))}
      </nav>

      <ParkScene copy={copy} onOpen={open} />

      <p className="pg-card p-3 text-sm font-bold">{copy.parkHint}</p>

      <footer className="pb-4 text-center text-sm font-bold opacity-80">
        {copy.footerNote} ·{" "}
        <a
          href="https://github.com/cfg9527"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          cfg9527
        </a>
      </footer>

      {active && <SectionPopup section={active} copy={copy} onClose={close} />}
    </main>
  );
}
