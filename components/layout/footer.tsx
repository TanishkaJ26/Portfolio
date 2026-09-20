"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

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
        <span>© 2026 Tanishka Jangir</span>
        <span>Built with Next.js</span>
        <span>
          New Delhi ·{" "}
          <span
            suppressHydrationWarning
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {time ?? "--:--:--"}
          </span>{" "}
          IST
        </span>
        <a
          href="#top"
          className="group flex items-center gap-2 text-text transition-colors hover:text-pink lg:justify-end"
        >
          Back to top
          <ArrowUp
            size={12}
            strokeWidth={2.5}
            aria-hidden="true"
            className="text-pink transition-transform group-hover:-translate-y-0.5"
          />
        </a>
      </div>
    </footer>
  );
}
