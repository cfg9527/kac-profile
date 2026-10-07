"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { stripWiki } from "@/lib/music/recommend";
import type { Entry } from "@/lib/music/types";

const ORDER = ["華語流行", "西方搖滾", "電子Hip-Hop", "參考資料"] as const;

export default function MusicSection({ entries }: { entries: Entry[] }) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const active = entries.find((e) => e.slug === activeSlug) ?? null;

  const visible = entries.filter((e) => (ORDER as readonly string[]).includes(e.category));
  const hiddenCount = entries.length - visible.length;

  return (
    <section data-testid="music-section" aria-labelledby="music-heading" className="pg-card p-4">
      <h2 id="music-heading" className="text-2xl font-black">
        音樂角落
      </h2>
      <p className="mt-1 text-sm font-bold opacity-80">
        歌曲、專輯、人物同參考資料，按分類排好。撳入去睇詳細。
      </p>
      {entries.length === 0 && (
        <p data-testid="music-empty" className="mt-3 font-bold">
          暫時未有音樂資料，稍後再嚟啦 🎵
        </p>
      )}
      {ORDER.map((cat) => {
        const items = visible.filter((e) => e.category === cat);
        if (items.length === 0) return null;
        return (
          <div key={cat} data-testid={`music-group-${cat}`} className="mt-4">
            <h3 className="text-xl font-black">{cat}</h3>
            <ul className="mt-2 flex flex-col gap-2">
              {items.map((e) => (
                <li key={e.slug}>
                  <button
                    type="button"
                    data-testid={`music-item-${e.slug}`}
                    onClick={() => setActiveSlug(e.slug)}
                    className="flex min-h-[44px] w-full flex-col items-start gap-1 rounded-xl border-[3px] border-(--color-pg-ink) bg-white/60 p-2 px-3 text-left"
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-black">{e.title}</span>
                      <span className="pg-chip">{e.kind}</span>
                    </span>
                    <span className="text-sm font-bold opacity-80">{stripWiki(e.summary)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      {hiddenCount > 0 && (
        <p className="mt-3 text-sm font-bold opacity-70">另有分冊目錄 {hiddenCount} 項未列出。</p>
      )}
      {active && <EntryPopup entry={active} onClose={() => setActiveSlug(null)} />}
    </section>
  );
}

function EntryPopup({ entry, onClose }: { entry: Entry; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const prev = document.activeElement;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      (prev as HTMLElement | null)?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose} data-testid="music-popup-overlay">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="music-popup-title"
        data-testid="music-popup"
        className="pg-card pg-pop-in w-full max-w-md p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <span className="pg-chip">
              {entry.category} · {entry.kind}
            </span>
            <h2 id="music-popup-title" className="mt-2 text-2xl font-black">
              {entry.title}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="閂咗佢"
            data-testid="music-popup-close"
            className="pg-btn pg-btn--pink min-h-[44px] min-w-[44px] !px-3 !py-1 text-lg"
          >
            ✕
          </button>
        </div>
        <p className="mt-2 text-base font-bold opacity-80">{stripWiki(entry.summary)}</p>
        {entry.bodyMd && (
          <div data-testid="music-popup-body" className="mt-3 text-base leading-relaxed font-bold">
            <ReactMarkdown>{entry.bodyMd}</ReactMarkdown>
          </div>
        )}
        {entry.bodyTruncated && <p className="mt-2 text-sm font-bold opacity-70">（未完）</p>}
      </div>
    </div>
  );
}
