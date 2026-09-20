"use client";

import { useEffect, useState } from "react";

import { Magnetic } from "@/components/ui/magnetic";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { nav, site } from "@/content/site";

const IST = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function Nav() {
  const [active, setActive] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const sections = nav
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        // Topmost intersecting section wins, so the marker never flickers
        // between two sections that both straddle the midline.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const first = visible[0];
        if (first) setActive(first.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );

    for (const section of sections) observer.observe(section);

    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const tick = () => setTime(IST.format(new Date()));
    tick();
    const clock = window.setInterval(tick, 20_000);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.clearInterval(clock);
    };
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-colors duration-300"
      style={{
        background: scrolled
          ? "color-mix(in srgb, var(--ground) 82%, transparent)"
          : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom:
          "1px solid " + (scrolled ? "var(--line)" : "transparent"),
      }}
    >
      <nav
        aria-label="Primary"
        className="shell flex h-16 items-center justify-between gap-6"
      >
        <a href="#top" className="label flex items-center gap-2.5 text-text">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-pink"
          />
          <span className="hidden sm:inline">{site.name}</span>
          <span className="sm:hidden">TJ</span>
        </a>

        <ul className="flex items-center gap-0.5 sm:gap-2">
          {nav.map((item) => (
            <li key={item.id}>
              <Magnetic strength={0.25}>
                <a
                  href={"#" + item.id}
                  aria-current={active === item.id ? "true" : undefined}
                  className="label block px-2.5 py-2 transition-colors duration-200 sm:px-3"
                  style={{
                    color:
                      active === item.id ? "var(--pink)" : "var(--text-mute)",
                  }}
                >
                  {item.label}
                </a>
              </Magnetic>
            </li>
          ))}
        </ul>

        <span className="label hidden text-text-mute lg:block">
          New Delhi ·{" "}
          <span suppressHydrationWarning>{time ?? "--:--"} IST</span>
        </span>
      </nav>

      <ScrollProgress />
    </header>
  );
}
