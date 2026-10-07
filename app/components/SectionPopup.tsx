"use client";

import { useEffect, useRef } from "react";
import {
  GITHUB_URL,
  X_HANDLE,
  X_HANDLE_IS_PLACEHOLDER,
  type SectionId,
  type SiteCopy,
} from "@/content/site";

interface Props {
  section: SectionId;
  copy: SiteCopy;
  onClose: () => void;
}

/** Pixel Garden card popup. Closable via button, overlay click, or Esc. */
export default function SectionPopup({ section, copy, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const sc = copy.sections[section];

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      data-testid="popup-overlay"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="section-title"
        data-testid="section-popup"
        data-section={section}
        className="pg-card pg-pop-in w-full max-w-md p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <span className="pg-chip">{sc.tabLabel}</span>
            <h2 id="section-title" className="mt-2 text-2xl font-black">
              {sc.title}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={copy.closeLabel}
            data-testid="popup-close"
            className="pg-btn pg-btn--pink !px-3 !py-1 text-lg"
          >
            ✕
          </button>
        </div>

        {sc.body.map((p, i) => (
          <p key={i} className="mt-2 text-lg leading-relaxed font-bold">
            {p}
          </p>
        ))}

        {sc.projects && (
          <ul className="mt-3 flex flex-col gap-2">
            {sc.projects.map((p) => (
              <li
                key={p.name}
                className="dn-row rounded-xl p-2 px-3"
              >
                <span className="font-black">{p.name}</span>
                <span className="font-bold"> —— {p.line}</span>
              </li>
            ))}
          </ul>
        )}

        {section === "contact" && (
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="pg-btn"
              data-testid="github-link"
            >
              {copy.githubLabel} ↗
            </a>
            {X_HANDLE_IS_PLACEHOLDER ? (
              <span className="pg-btn pg-btn--cream" data-testid="x-placeholder">
                {copy.xLabel}: {X_HANDLE} {copy.xPlaceholderNote}
              </span>
            ) : (
              <a
                href={`https://x.com/${X_HANDLE.replace(/^@/, "")}`}
                target="_blank"
                rel="noreferrer"
                className="pg-btn pg-btn--cream"
                data-testid="x-link"
              >
                {copy.xLabel}: {X_HANDLE} ↗
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
