import type { CSSProperties } from "react";

import type { PixelArt } from "@/lib/pixel-art";

/**
 * Renders a character grid from `lib/pixel-art.ts` as an SVG.
 *
 * Server component, and no image request: a sprite is vector geometry that
 * scales to any size, recolours with the surrounding text, and costs nothing
 * on the network. `shapeRendering="crispEdges"` is what keeps the pixels
 * square at a fractional scale instead of letting them go soft.
 *
 * Two passes keep it cheap enough to put ~70 of them on one page. Adjacent
 * cells of the same character are merged into the largest rectangles that
 * fit, and each character's rectangles are then emitted as one <path> rather
 * than as a <rect> each — a rect element costs ~48 bytes of markup, the same
 * box inside a path costs ~13. Together they take the page's sprite markup
 * from about 1,500 elements and 73KB to 154 elements and 28KB (3.8KB gzipped)
 * for 67 sprites.
 */

/**
 * `#` inherits from the surrounding text on purpose — a glyph in the stack
 * list turns pink because its parent does. The rest are fixed tokens.
 */
const PAINT: Record<string, { fill: string; opacity?: number }> = {
  "#": { fill: "currentColor" },
  o: { fill: "currentColor", opacity: 0.4 },
  "+": { fill: "var(--pink)" },
  O: { fill: "var(--raised)" },
  "=": { fill: "var(--text-mute)" },
};

const CACHE = new WeakMap<PixelArt, Map<string, string>>();

/**
 * Greedy rectangle merge, one path string per character.
 *
 * Walking in reading order, each unclaimed cell grows as far right as it can
 * and then as far down as it can while the whole span still matches. It is
 * not the minimal decomposition — that is a much more expensive problem — but
 * on this kind of art it is close, and it collapses the large flat areas
 * (a screen, a desk slab) that dominate the cost.
 *
 * Memoised on the sprite's array identity — every sprite is a module constant,
 * and the Stack list re-renders on each pointer-enter.
 */
function mesh(art: PixelArt): Map<string, string> {
  const cached = CACHE.get(art);
  if (cached) return cached;

  const height = art.length;
  const width = art.reduce((max, row) => Math.max(max, row.length), 0);
  const claimed: boolean[] = new Array(width * height).fill(false);
  const paths = new Map<string, string>();

  const at = (x: number, y: number) => art[y]?.[x] ?? ".";
  const free = (x: number, y: number, ch: string) =>
    !claimed[y * width + x] && at(x, y) === ch;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const ch = at(x, y);
      if (!(ch in PAINT) || claimed[y * width + x]) continue;

      let w = 1;
      while (x + w < width && free(x + w, y, ch)) w += 1;

      let h = 1;
      grow: while (y + h < height) {
        for (let i = 0; i < w; i += 1) {
          if (!free(x + i, y + h, ch)) break grow;
        }
        h += 1;
      }

      for (let dy = 0; dy < h; dy += 1) {
        for (let dx = 0; dx < w; dx += 1) {
          claimed[(y + dy) * width + x + dx] = true;
        }
      }

      paths.set(ch, (paths.get(ch) ?? "") + `M${x} ${y}h${w}v${h}h-${w}z`);
    }
  }

  CACHE.set(art, paths);
  return paths;
}

type PixelProps = {
  art: PixelArt;
  className?: string;
  style?: CSSProperties;
  /**
   * An unlabelled sprite stays decorative (`aria-hidden`). Pass a title only
   * where the sprite is the sole carrier of meaning — the portrait scene, a
   * project's stand-in screenshot — not for a mark that sits beside its own
   * label, which every glyph on this site does.
   */
  title?: string;
};

export function Pixel({ art, className, style, title }: PixelProps) {
  const height = art.length;
  const width = art.reduce((max, row) => Math.max(max, row.length), 0);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      className={className}
      style={style}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {[...mesh(art)].map(([ch, d]) => (
        <path
          key={ch}
          d={d}
          fill={PAINT[ch]?.fill}
          opacity={PAINT[ch]?.opacity}
        />
      ))}
    </svg>
  );
}
