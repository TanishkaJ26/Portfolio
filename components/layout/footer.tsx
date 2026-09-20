"use client";

import { useEffect, useState } from "react";

import { GLYPHS, type GlyphName } from "@/lib/pixel-art";
import { Pixel } from "@/components/ui/pixel";

const IST = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function Footer() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(IST.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <footer className="border-t border-line">
      <div className="shell label grid gap-4 py-7 text-text-mute sm:grid-cols-2 lg:grid-cols-4">
        <Cell glyph="networks">© 2026 Tanishka Jangir</Cell>
        <Cell glyph="next">Built with Next.js</Cell>
        <Cell glyph="clock">
          New Delhi ·{" "}
          <span
            suppressHydrationWarning
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {time ?? "--:--:--"}
          </span>{" "}
          IST
        </Cell>
        <a
          href="#top"
          className="group flex items-center gap-2 text-text transition-colors hover:text-pink lg:justify-end"
        >
          Back to top
          <Pixel
            art={GLYPHS.arrowUp}
            className="h-3 w-3 shrink-0 text-pink transition-transform group-hover:-translate-y-0.5"
          />
        </a>
      </div>
    </footer>
  );
}

/** A footer readout: pixel mark, then the text. */
function Cell({
  glyph,
  children,
}: {
  glyph: GlyphName;
  children: React.ReactNode;
}) {
  return (
    <span className="flex items-center gap-2">
      <Pixel art={GLYPHS[glyph]} className="h-3 w-3 shrink-0 opacity-70" />
      <span>{children}</span>
    </span>
  );
}
