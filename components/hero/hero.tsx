import type { CSSProperties } from "react";
import { ArrowDown } from "lucide-react";

import { GLYPHS, type GlyphName } from "@/lib/pixel-art";
import { HeroBackdrop } from "@/components/hero/hero-backdrop";
import { Pixel } from "@/components/ui/pixel";
import { site } from "@/content/site";

const delay = (seconds: number) =>
  ({ "--intro-delay": seconds + "s" }) as CSSProperties;

/** One pixel mark per hero readout, in the order `site.readouts` lists them. */
const READOUT_GLYPHS: readonly GlyphName[] = ["cap", "terminal", "mail"];

/**
 * Server component. Every word here is in the HTML on the first byte and the
 * entrance is CSS (`.intro-*` in globals.css), so the LCP element does not
 * wait for React to hydrate — which is what took hero paint from ~4.0s to
 * ~1.3s on a throttled phone. Only the parallax and the live graph are
 * client-side, and they wrap this content rather than producing it.
 */
export function Hero() {
  return (
    <HeroBackdrop>
      <div className="flex flex-col gap-8 sm:gap-10">
        <span className="intro-fade label text-pink" style={delay(0.04)}>
          {site.eyebrow}
        </span>

        <h1 className="text-[clamp(3rem,9vw,8.25rem)] leading-[0.94] tracking-[-0.035em]">
          <span className="sr-only">{site.name}</span>
          <span aria-hidden="true" className="block overflow-hidden pb-[0.08em]">
            <span className="intro-rise block" style={delay(0.08)}>
              {site.name}
            </span>
          </span>
        </h1>

        <p
          className="intro-fade-up max-w-[30ch] text-[clamp(1.125rem,2.1vw,1.625rem)] leading-[1.4] text-text-dim"
          style={delay(0.24)}
        >
          {site.tagline.lead}{" "}
          <span className="text-text">{site.tagline.emphasis}</span>
        </p>

        <div
          className="intro-fade-up flex flex-wrap items-center gap-3 pt-1"
          style={delay(0.32)}
        >
          <a
            href="#work"
            className="group flex items-center gap-2.5 rounded-md bg-pink px-5 py-3.5 font-sans text-[0.9375rem] font-medium text-ground shadow-[0_8px_28px_rgba(242,107,164,0.22)] transition-transform duration-200 hover:-translate-y-0.5"
          >
            <span>Selected work</span>
            <ArrowDown
              size={16}
              strokeWidth={2}
              aria-hidden="true"
              className="transition-transform group-hover:translate-y-0.5"
            />
          </a>
          <a
            href="#contact"
            className="rounded-md border border-line-lit px-5 py-3.5 font-sans text-[0.9375rem] font-medium transition-colors duration-200 hover:border-pink hover:text-pink"
          >
            Get in touch
          </a>
        </div>
      </div>

      <div
        className="intro-fade label mt-auto grid gap-3 border-t border-line pt-6 text-text-mute sm:grid-cols-3 sm:gap-4"
        style={delay(0.4)}
      >
        <span className="flex items-center gap-2">
          <Mark index={0} />
          {site.readouts[0]}
        </span>
        <span className="hidden items-center gap-2 sm:flex sm:justify-center">
          <Mark index={1} />
          {site.readouts[1]}
        </span>
        <span className="flex items-center gap-2 sm:justify-end">
          <Mark index={2} pink />
          {site.readouts[2]}
        </span>
      </div>
    </HeroBackdrop>
  );
}

/**
 * Static SVG in the server-rendered hero: it is in the HTML on the first byte
 * like the rest of this component, so it costs nothing at hydration.
 */
function Mark({ index, pink = false }: { index: number; pink?: boolean }) {
  const glyph = READOUT_GLYPHS[index];
  if (!glyph) return null;

  return (
    <Pixel
      art={GLYPHS[glyph]}
      className={
        "h-3.5 w-3.5 shrink-0 " + (pink ? "text-pink" : "text-line-lit")
      }
    />
  );
}
