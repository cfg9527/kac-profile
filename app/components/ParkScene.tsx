"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PixelSprite from "./PixelSprite";
import {
  BENCH,
  FLOWER_A,
  FLOWER_B,
  KAC_FRAMES,
  MAILBOX,
  POND,
  SIGNPOST,
  TREE,
} from "./sprites";
import {
  OBJECT_SECTION_MAP,
  type ParkObjectId,
  type SectionId,
  type SiteCopy,
} from "@/content/site";

export const COLS = 12;
export const ROWS = 8;
const SPEED_TILES_PER_SEC = 4.5;

interface Tile {
  x: number;
  y: number;
}

const OBJECT_TILES: Record<ParkObjectId, Tile> = {
  signpost: { x: 1, y: 1 },
  tree: { x: 9, y: 1 },
  bench: { x: 4, y: 4 },
  mailbox: { x: 10, y: 5 },
};

const OBJECT_SPRITES: Record<ParkObjectId, typeof TREE> = {
  signpost: SIGNPOST,
  tree: TREE,
  bench: BENCH,
  mailbox: MAILBOX,
};

/** Pond occupies these tiles (blocked + decorative). */
const POND_TILES: Tile[] = [
  { x: 6, y: 6 },
  { x: 7, y: 6 },
  { x: 8, y: 6 },
  { x: 6, y: 7 },
  { x: 7, y: 7 },
  { x: 8, y: 7 },
];

/** Winding path tiles (decorative). */
const PATH_TILES: Tile[] = [
  ...Array.from({ length: COLS }, (_, x) => ({ x, y: 3 })),
  ...[0, 1, 2, 4, 5].map((y) => ({ x: 6, y })),
];

const FLOWERS: { tile: Tile; kind: "a" | "b" }[] = [
  { tile: { x: 3, y: 1 }, kind: "a" },
  { tile: { x: 6, y: 1 }, kind: "b" },
  { tile: { x: 11, y: 2 }, kind: "a" },
  { tile: { x: 0, y: 5 }, kind: "b" },
  { tile: { x: 2, y: 6 }, kind: "a" },
  { tile: { x: 10, y: 7 }, kind: "b" },
];

function tileBlocked(x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return true;
  if (Object.values(OBJECT_TILES).some((t) => t.x === x && t.y === y))
    return true;
  if (POND_TILES.some((t) => t.x === x && t.y === y)) return true;
  return false;
}

function adjacentFreeTile(t: Tile): Tile {
  const candidates = [
    { x: t.x, y: t.y + 1 },
    { x: t.x, y: t.y - 1 },
    { x: t.x - 1, y: t.y },
    { x: t.x + 1, y: t.y },
  ];
  return candidates.find((c) => !tileBlocked(c.x, c.y)) ?? { x: 6, y: 3 };
}

interface Props {
  copy: SiteCopy;
  onOpen: (section: SectionId) => void;
}

export default function ParkScene({ copy, onOpen }: Props) {
  const [pos, setPos] = useState({ x: 6, y: 2 });
  const [moving, setMoving] = useState(false);
  const [facingLeft, setFacingLeft] = useState(false);
  const [frame, setFrame] = useState(0);
  const posRef = useRef({ x: 6, y: 2 });
  const targetRef = useRef({ x: 6, y: 2 });
  const pendingOpenRef = useRef<{ id: ParkObjectId; since: number } | null>(
    null,
  );
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;
  const sceneRef = useRef<HTMLDivElement>(null);

  const setTarget = useCallback((t: Tile) => {
    const cx = Math.max(0, Math.min(COLS - 1, t.x));
    const cy = Math.max(0, Math.min(ROWS - 1, t.y));
    if (tileBlocked(Math.round(cx), Math.round(cy))) return;
    targetRef.current = { x: cx, y: cy };
  }, []);

  const step = useCallback(
    (dx: number, dy: number) => {
      const base = targetRef.current;
      const nx = Math.round(base.x) + dx;
      const ny = Math.round(base.y) + dy;
      pendingOpenRef.current = null;
      if (!tileBlocked(nx, ny)) targetRef.current = { x: nx, y: ny };
      else if (!tileBlocked(nx, Math.round(base.y)))
        targetRef.current = { x: nx, y: Math.round(base.y) };
      else if (!tileBlocked(Math.round(base.x), ny))
        targetRef.current = { x: Math.round(base.x), y: ny };
    },
    [],
  );

  const walkToObject = useCallback(
    (id: ParkObjectId) => {
      const stand = adjacentFreeTile(OBJECT_TILES[id]);
      pendingOpenRef.current = { id, since: Date.now() };
      setTarget(stand);
    },
    [setTarget],
  );

  // Movement loop
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const p = posRef.current;
      const t = targetRef.current;
      const dx = t.x - p.x;
      const dy = t.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0.02) {
        const stepLen = Math.min(dist, SPEED_TILES_PER_SEC * dt);
        const nx = p.x + (dx / dist) * stepLen;
        const ny = p.y + (dy / dist) * stepLen;
        let fx = p.x;
        let fy = p.y;
        if (!tileBlocked(Math.round(nx), Math.round(p.y))) fx = nx;
        if (!tileBlocked(Math.round(fx), Math.round(ny))) fy = ny;
        posRef.current = { x: fx, y: fy };
        if (dx !== 0) setFacingLeft(dx < 0);
        setMoving(true);
        setFrame(Math.floor(now / 220) % 2);
        setPos({ x: fx, y: fy });
      } else {
        posRef.current = { x: t.x, y: t.y };
        setPos({ x: t.x, y: t.y });
        setMoving(false);
        const pending = pendingOpenRef.current;
        if (pending) {
          pendingOpenRef.current = null;
          onOpenRef.current(OBJECT_SECTION_MAP[pending.id]);
        }
      }
      // Fallback: never trap the popup behind a long walk
      const pending = pendingOpenRef.current;
      if (pending && Date.now() - pending.since > 3000) {
        pendingOpenRef.current = null;
        onOpenRef.current(OBJECT_SECTION_MAP[pending.id]);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (k === "arrowup" || k === "w") {
      e.preventDefault();
      step(0, -1);
    } else if (k === "arrowdown" || k === "s") {
      e.preventDefault();
      step(0, 1);
    } else if (k === "arrowleft" || k === "a") {
      e.preventDefault();
      step(-1, 0);
    } else if (k === "arrowright" || k === "d") {
      e.preventDefault();
      step(1, 0);
    }
  };

  /** Tap-to-walk: clicking bare ground sets a walk target. */
  const onGroundClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-object]")) return;
    const el = sceneRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const tx = Math.floor(((e.clientX - rect.left) / rect.width) * COLS);
    const ty = Math.floor(((e.clientY - rect.top) / rect.height) * ROWS);
    pendingOpenRef.current = null;
    setTarget({ x: tx, y: ty });
  };

  const tilePctX = 100 / COLS;
  const tilePctY = 100 / ROWS;

  return (
    <div>
      <div
        ref={sceneRef}
        data-testid="park-scene"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onClick={onGroundClick}
        role="application"
        aria-label={copy.parkHint}
        className="pg-card pg-ground relative w-full overflow-hidden select-none"
        style={{ aspectRatio: "3 / 2", cursor: "pointer" }}
      >
        {/* moonlit pixel clouds drifting over the night sea */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1/4 overflow-hidden">
          <div className="pg-cloud absolute top-1 left-0 h-5 w-16 rounded-full bg-(--color-dn-violet)" />
          <div
            className="pg-cloud absolute top-4 left-0 h-4 w-12 rounded-full bg-(--color-dn-magenta)/80"
            style={{ animationDelay: "-18s" }}
          />
        </div>

        {/* moonlit stepping stones */}
        {PATH_TILES.map((t, i) => (
          <div
            key={i}
            aria-hidden="true"
            className="absolute"
            style={{
              left: `${t.x * tilePctX}%`,
              top: `${t.y * tilePctY}%`,
              width: `${tilePctX}%`,
              height: `${tilePctY}%`,
              background: "var(--color-dn-panel)",
              boxShadow: "inset 0 0 0 2px var(--color-dn-violet)",
            }}
          />
        ))}

        {/* pond */}
        <div
          aria-hidden="true"
          className="absolute"
          style={{
            left: `${6 * tilePctX}%`,
            top: `${6 * tilePctY}%`,
            width: `${3 * tilePctX}%`,
            height: `${2 * tilePctY}%`,
          }}
        >
          <PixelSprite sprite={POND} className="h-full w-full" />
        </div>

        {/* flowers */}
        {FLOWERS.map((f, i) => (
          <div
            key={i}
            aria-hidden="true"
            className="absolute"
            style={{
              left: `${f.tile.x * tilePctX}%`,
              top: `${f.tile.y * tilePctY}%`,
              width: `${tilePctX * 0.8}%`,
              height: `${tilePctY * 0.8}%`,
            }}
          >
            <PixelSprite sprite={f.kind === "a" ? FLOWER_A : FLOWER_B} className="h-full w-full" />
          </div>
        ))}

        {/* interactive objects */}
        {(Object.keys(OBJECT_TILES) as ParkObjectId[]).map((id) => {
          const t = OBJECT_TILES[id];
          const section = OBJECT_SECTION_MAP[id];
          return (
            <button
              key={id}
              type="button"
              data-object={id}
              data-testid={`park-object-${id}`}
              data-section={section}
              onClick={(e) => {
                e.stopPropagation();
                walkToObject(id);
              }}
              aria-label={`${copy.sections[section].objectLabel}：${copy.sections[section].tabLabel}（${copy.walkToLabel}）`}
              className="absolute flex flex-col items-center rounded-lg p-1"
              style={{
                left: `${t.x * tilePctX}%`,
                top: `${(t.y - 0.9) * tilePctY}%`,
                width: `${tilePctX * 1.6}%`,
                marginLeft: `${-tilePctX * 0.3}%`,
                cursor: "pointer",
                zIndex: 5,
              }}
            >
              <span className={moving ? "" : "pg-bob"} style={{ display: "contents" }}>
                <PixelSprite
                  sprite={OBJECT_SPRITES[id]}
                  className="h-auto w-full drop-shadow-[2px_2px_0_var(--color-dn-ink)]"
                />
              </span>
              <span className="pg-chip mt-1 whitespace-nowrap">
                {copy.sections[section].objectLabel}
              </span>
            </button>
          );
        })}

        {/* KaC character */}
        <div
          data-testid="character"
          data-x={pos.x.toFixed(2)}
          data-y={pos.y.toFixed(2)}
          data-moving={moving ? "true" : "false"}
          aria-hidden="true"
          className="absolute"
          style={{
            left: `${pos.x * tilePctX}%`,
            top: `${(pos.y - 0.7) * tilePctY}%`,
            width: `${tilePctX}%`,
            zIndex: 10,
            transform: `translateX(${tilePctX * 0}%) ${facingLeft ? "scaleX(-1)" : ""}`,
          }}
        >
          <PixelSprite
            sprite={KAC_FRAMES[moving ? frame : 0]}
            className="h-auto w-full drop-shadow-[2px_2px_0_var(--color-dn-ink)]"
          />
        </div>
      </div>

      <DPad onStep={step} label={copy.dpadLabel} />
    </div>
  );
}

function DPad({ onStep, label }: { onStep: (dx: number, dy: number) => void; label: string }) {
  const suppressClick = useRef(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  };

  useEffect(() => stop, []);

  const hold = (dx: number, dy: number) => ({
    onPointerDown: () => {
      onStep(dx, dy);
      suppressClick.current = false;
      timer.current = setInterval(() => {
        suppressClick.current = true;
        onStep(dx, dy);
      }, 200);
    },
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
    onClick: () => {
      if (suppressClick.current) {
        suppressClick.current = false;
        return;
      }
      onStep(dx, dy);
    },
  });

  const btn =
    "pg-btn flex h-12 w-12 items-center justify-center !p-0 text-xl leading-none";
  return (
    <div className="mt-3 flex items-center justify-center gap-3" role="group" aria-label={label}>
      <button type="button" aria-label="←" className={btn} {...hold(-1, 0)}>
        ←
      </button>
      <div className="flex flex-col gap-2">
        <button type="button" aria-label="↑" className={btn} {...hold(0, -1)}>
          ↑
        </button>
        <button type="button" aria-label="↓" className={btn} {...hold(0, 1)}>
          ↓
        </button>
      </div>
      <button type="button" aria-label="→" className={btn} {...hold(1, 0)}>
        →
      </button>
    </div>
  );
}
