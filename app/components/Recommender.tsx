"use client";

import { useEffect, useRef, useState } from "react";
import type { Pick, RecommendErrorCode } from "@/lib/music/types";

type Status =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "done"; picks: Pick[] }
  | { state: "error"; code: RecommendErrorCode; message: string };

const FALLBACK: Record<RecommendErrorCode, string> = {
  invalid_input: "請講下你嘅心情（1 至 300 字）",
  rate_limited: "你今日已經撳咗好多次啦，聽日再嚟啦 🎵",
  daily_cap: "今日太多人用緊，聽日再嚟啦 🎵",
  budget_exhausted: "今個月嘅推介額度用晒，下個月再嚟 🎵",
  gateway_rate_limited: "太多人撳緊，等陣再試",
  gateway_error: "推介服務暫時用唔到，稍後再試 🎵",
  config: "伺服器未設定好，請稍後再試",
};

export default function Recommender() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open, status]);

  const close = () => {
    setOpen(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open ]);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (!q || q.length > 300 || status.state === "loading") {
      if (!q || q.length > 300) {
        setStatus({ state: "error", code: "invalid_input", message: FALLBACK.invalid_input });
        setOpen(true);
      }
      return;
    }
    setStatus({ state: "loading" });
    setOpen(true);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const body = (await res.json()) as
        | { ok: true; picks: Pick[] }
        | { ok: false; error: RecommendErrorCode; message: string };
      if (body.ok) {
        setStatus({ state: "done", picks: body.picks });
      } else {
        setStatus({ state: "error", code: body.error, message: body.message || FALLBACK[body.error] });
      }
    } catch {
      setStatus({ state: "error", code: "gateway_error", message: FALLBACK.gateway_error });
    }
  }

  const loading = status.state === "loading";

  return (
    <section aria-labelledby="recommender-heading" className="pg-card p-4">
      <h2 id="recommender-heading" className="text-2xl font-black">
        推介首歌
      </h2>
      <p className="mt-1 text-sm font-bold opacity-80">
        講下你今日嘅心情，我哋幫你喺收藏入面揀 1 至 3 首歌。
      </p>
      <form data-testid="recommender-form" onSubmit={submit} className="mt-3 flex flex-col gap-2">
        <label htmlFor="recommender-input" className="font-black">
          你嘅心情或者要求（最多 300 字）
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            ref={inputRef}
            id="recommender-input"
            data-testid="recommender-input"
            type="text"
            value={query}
            maxLength={300}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={(e) => {
              try {
                e.currentTarget.scrollIntoView({ behavior: "smooth", block: "center" });
              } catch {
                // ignore
              }
            }}
            placeholder="例如：今晚想聽啲 chilli 嘅歌"
            aria-label="你嘅心情或者要求"
            className="min-h-[44px] flex-1 rounded-xl border-[3px] border-(--color-pg-ink) bg-white/80 px-3 py-2 text-base font-bold"
          />
          <button
            type="submit"
            data-testid="recommender-submit"
            disabled={loading}
            className="pg-btn pg-btn--pink min-h-[44px] min-w-[44px] px-6 disabled:opacity-60"
          >
            {loading ? "諗緊…" : "推介首歌"}
          </button>
        </div>
        <span data-testid="recommender-count" className="text-sm font-bold opacity-70" aria-live="polite">
          {query.length} / 300
        </span>
      </form>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={close}
          data-testid="recommend-overlay"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="recommend-title"
            data-testid="recommend-dialog"
            className="pg-card pg-pop-in w-full max-w-md p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <h2 id="recommend-title" className="text-2xl font-black">
                推介首歌
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="閂咗佢"
                data-testid="recommend-close"
                className="pg-btn pg-btn--pink min-h-[44px] min-w-[44px] !px-3 !py-1 text-lg"
              >
                ✕
              </button>
            </div>
            <div aria-live="polite">
              {status.state === "loading" && (
                <p className="mt-2 text-lg font-black">
                  <span aria-hidden="true" className="pg-bob inline-block">
                    🎵
                  </span>{" "}
                  諗緊…幫你揀緊歌
                </p>
              )}
              {status.state === "done" && (
                <ul className="mt-3 flex flex-col gap-2">
                  {status.picks.map((p) => (
                    <li
                      key={p.slug}
                      className="rounded-xl border-[3px] border-(--color-pg-ink) bg-white/60 p-2 px-3"
                    >
                      <span className="font-black">{p.title}</span>
                      <p className="mt-1 font-bold">{p.reason}</p>
                    </li>
                  ))}
                </ul>
              )}
              {status.state === "error" && <p className="mt-2 text-lg font-black">{status.message}</p>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
