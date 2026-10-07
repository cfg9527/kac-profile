/* KPP-7: full-page decorative dream night-sea backdrop (aria-hidden,
 * pointer-events none). Renders: a sky (data-testid=SKY_TESTID) with pixel
 * clouds, one stepped shooting star (.dn-shooting-star) and DREAM_STARS as
 * elements with data-testid=STAR_TESTID and class dn-twinkle; a sea band
 * (data-testid=SEA_TESTID) with layered pixel waves and DREAM_GLINTS as
 * .dn-glint elements plus a translucent pixel whale. CSS/SVG rects only,
 * no image elements, no raster files. Original art only.
 * Text must never sit directly on this backdrop: put it on opaque plates. */

import PixelSprite from "./PixelSprite";
import { WHALE } from "./sprites";
import {
  DREAM_GLINTS,
  DREAM_STARS,
  SEA_TESTID,
  SKY_TESTID,
  STAR_PIXEL,
  STAR_TESTID,
} from "./dream-scene";

export default function DreamBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: -1 }}
    >
      {/* sky: deep blue banding into magenta and orange-red at the horizon */}
      <div
        data-testid={SKY_TESTID}
        aria-hidden="true"
        className="absolute inset-x-0 top-0"
        style={{
          height: "62%",
          background:
            "linear-gradient(to bottom, var(--color-dn-night) 0%, var(--color-dn-deep) 34%, var(--color-dn-violet) 58%, var(--color-dn-magenta) 76%, var(--color-dn-ember) 100%)",
        }}
      >
        {/* twinkling pixel stars, sized by STAR_PIXEL so all stay visible */}
        {DREAM_STARS.map((s, i) => (
          <span
            key={i}
            data-testid={STAR_TESTID}
            aria-hidden="true"
            className="dn-twinkle absolute"
            style={{
              left: `${s.x}%`,
              top: `${(s.y / 62) * 100}%`,
              width: s.size * STAR_PIXEL,
              height: s.size * STAR_PIXEL,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}

        {/* stepped shooting star arcing through the top-right sky */}
        <span
          aria-hidden="true"
          className="dn-shooting-star absolute"
          style={{ left: "78%", top: "4%", width: 48, height: 4 }}
        />

        {/* pixel clouds: violet blocks with a magenta dusk edge */}
        <div aria-hidden="true" className="absolute" style={{ left: "8%", top: "18%" }}>
          <div style={{ width: 96, height: 12, background: "var(--color-dn-violet)" }} />
          <div
            style={{
              width: 64,
              height: 6,
              marginLeft: 16,
              background: "var(--color-dn-magenta)",
            }}
          />
        </div>
        <div aria-hidden="true" className="absolute" style={{ left: "68%", top: "34%" }}>
          <div style={{ width: 72, height: 10, background: "var(--color-dn-violet)" }} />
          <div
            style={{
              width: 48,
              height: 5,
              marginLeft: 12,
              background: "var(--color-dn-magenta)",
            }}
          />
        </div>
      </div>

      {/* sea: glowing-teal night water with wave glints and a pixel whale */}
      <div
        data-testid={SEA_TESTID}
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "38%",
          background:
            "linear-gradient(to bottom, var(--color-dn-ember) 0%, var(--color-dn-deep) 12%, var(--color-dn-deep) 55%, var(--color-dn-night) 100%)",
        }}
      >
        {/* layered pixel waves */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0"
          style={{
            height: 14,
            background:
              "repeating-linear-gradient(to right, var(--color-dn-glow-teal) 0 12px, transparent 12px 24px)",
            opacity: 0.55,
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0"
          style={{
            top: 14,
            height: 8,
            background:
              "repeating-linear-gradient(to right, transparent 0 8px, var(--color-dn-foam) 8px 14px, transparent 14px 28px)",
            opacity: 0.5,
          }}
        />

        {/* wave glints */}
        {DREAM_GLINTS.map((g, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="dn-glint absolute"
            style={{
              left: `${g.x}%`,
              top: `${((g.y - 62) / 38) * 100}%`,
              width: `${g.w}%`,
              animationDelay: `${g.delay}s`,
            }}
          />
        ))}

        {/* translucent pixel whale */}
        <div
          aria-hidden="true"
          className="absolute opacity-70"
          style={{
            left: "58%",
            top: "30%",
            width: 120,
            filter: "drop-shadow(0 0 6px var(--color-dn-glow-teal))",
          }}
        >
          <PixelSprite sprite={WHALE} className="h-auto w-full" />
        </div>
      </div>
    </div>
  );
}
