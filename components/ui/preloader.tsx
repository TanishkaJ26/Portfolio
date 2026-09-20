import type { CSSProperties } from "react";

import { GLYPHS } from "@/lib/pixel-art";
import { Pixel } from "@/components/ui/pixel";
import { PreloadCounter } from "@/components/ui/preload-counter";
import { site } from "@/content/site";

/**
 * Server-rendered overlay: a rule drawing itself under the name, a counter,
 * then a clip-path wipe upward. The whole lifecycle is CSS (`.preloader` in
 * globals.css), so it neither waits for hydration nor holds the hero's first
 * paint behind it — the blocking script in <head> has already decided, before
 * first paint, whether it plays at all.
 *
 * It runs ~0.62s. Repeat visits in the same session, and anyone with reduced
 * motion, never see it.
 */
export function Preloader() {
  const delay = (seconds: number) =>
    ({ "--intro-delay": seconds + "s" }) as CSSProperties;

  return (
    <div
      className="preloader dot-grid fixed inset-0 z-90 flex flex-col justify-end bg-ground"
      aria-hidden="true"
    >
      <div className="shell flex flex-col gap-5 pb-[var(--gutter)]">
        <div
          className="preload-rule h-px w-full bg-line-lit"
          style={delay(0.06)}
        />
        <div className="flex items-end justify-between gap-6">
          <span className="label flex items-center gap-2.5 text-text-mute">
            <Pixel art={GLYPHS.networks} className="h-4 w-4 shrink-0" />
            {site.name}
          </span>
          <div className="flex items-baseline gap-2.5">
            <PreloadCounter />
            <span className="label text-text-mute">/ 100</span>
          </div>
        </div>
      </div>
    </div>
  );
}
