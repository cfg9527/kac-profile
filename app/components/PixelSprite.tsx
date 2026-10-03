import type { Sprite } from "./sprites";

interface Props {
  sprite: Sprite;
  className?: string;
  label?: string;
}

/** Renders a pixel-map sprite as crisp SVG rects. */
export default function PixelSprite({ sprite, className, label }: Props) {
  const width = Math.max(...sprite.rows.map((r) => r.length));
  const height = sprite.rows.length;
  const rects: React.ReactNode[] = [];
  sprite.rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === ".") continue;
      const fill = sprite.palette[ch];
      if (!fill) continue;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />);
    }
  });
  return (
    <svg
      viewBox={`-0.5 -0.5 ${width + 1} ${height + 1}`}
      className={`pixelated ${className ?? ""}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {rects}
    </svg>
  );
}
