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
}: SectionHeaderProps) {
  return (
    <div className="mb-12 flex flex-col gap-6 sm:mb-16 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
      <div className="flex flex-col gap-3.5">
        <span className="label text-pink">
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
