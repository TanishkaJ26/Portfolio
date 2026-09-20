import { GLYPHS, type GlyphName } from "@/lib/pixel-art";
import { Pixel } from "@/components/ui/pixel";
import { RevealText } from "@/components/ui/reveal-text";

type SectionHeaderProps = {
  /** Mono label, e.g. "01 — Selected work". The number is pink. */
  index: string;
  label: string;
  /** The id the section's `aria-labelledby` points at. */
  id: string;
  /** The display heading beneath the label. */
  heading: React.ReactNode;
  /** Small right-aligned note — a date range, or a line about the motion. */
  aside?: string;
  /** Pixel mark in front of the label. Inherits the label's pink. */
  glyph?: GlyphName;
};

/**
 * Every section opens the same way: a pink mono label, a Syne heading, and
 * an optional muted aside on the right. The label is the real `<h2>` target
 * for `aria-labelledby`, so the outline stays h1 → h2 → h3.
 */
export function SectionHeader({
  index,
  label,
  id,
  heading,
  aside,
  glyph,
}: SectionHeaderProps) {
  return (
    <div className="mb-12 flex flex-col gap-6 sm:mb-16 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
      <div className="flex flex-col gap-3.5">
        <span className="label flex items-center gap-2 text-pink">
          {glyph ? (
            <Pixel art={GLYPHS[glyph]} className="h-3.5 w-3.5 shrink-0" />
          ) : null}
          {index} — {label}
        </span>
        <h2
          id={id}
          className="max-w-[20ch] text-[clamp(2rem,4vw,3.25rem)] leading-[1.02]"
        >
          <RevealText>{heading}</RevealText>
        </h2>
      </div>
      {aside ? (
        <span className="label shrink-0 text-text-mute">{aside}</span>
      ) : null}
    </div>
  );
}
