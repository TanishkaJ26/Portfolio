"use client";

import { ArrowUpRight, Download } from "lucide-react";
import { track } from "@vercel/analytics";
import { useEffect, useState } from "react";

import { GLYPHS, type GlyphName } from "@/lib/pixel-art";
import { Magnetic } from "@/components/ui/magnetic";
import { Pixel } from "@/components/ui/pixel";
import { RevealText } from "@/components/ui/reveal-text";
import { Rings, Wash } from "@/components/ui/patterns";
import { site } from "@/content/site";

export function Contact() {
  // Assembled after mount so the address never sits in the served HTML.
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(site.email.user + "@" + site.email.domain);
  }, []);

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative overflow-hidden py-24 sm:py-32"
    >
      <Wash className="pointer-events-none absolute -bottom-[560px] left-1/2 h-[800px] w-[1200px] -translate-x-1/2 rounded-full" />
      <Rings
        radii={[120, 230, 340, 450, 540]}
        className="pointer-events-none absolute top-[340px] left-1/2 hidden h-[1100px] w-[1100px] -translate-x-1/2 lg:block"
      />

      <div className="shell relative">
        <div className="mb-12 flex flex-col gap-3.5">
          <span className="label flex items-center gap-2 text-pink">
            <Pixel art={GLYPHS.mail} className="h-3.5 w-3.5 shrink-0" />
            05 — Contact
          </span>
          <h2
            id="contact-heading"
            className="max-w-[26ch] text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.25] font-semibold text-text-dim"
          >
            <RevealText>Open to internships and collaboration.</RevealText>
          </h2>
        </div>

        <div className="mb-16 pb-2">
          {email ? (
            <Magnetic strength={0.22}>
              <a
                href={"mailto:" + email}
                className="inline-block font-display text-[clamp(1.75rem,6.2vw,6.25rem)] leading-[0.98] font-bold tracking-[-0.035em]"
              >
                {/* Two blocks so it breaks at the @, never mid-word. */}
                <span className="block">{site.email.user}</span>
                <span className="block text-pink">@{site.email.domain}</span>
              </a>
            </Magnetic>
          ) : (
            // Reserves the box before hydration so nothing shifts — without
            // putting the address itself anywhere in the served HTML.
            <span
              aria-hidden="true"
              className="inline-block font-display text-[clamp(1.75rem,6.2vw,6.25rem)] leading-[0.98] font-bold"
            >
              &nbsp;
            </span>
          )}
        </div>

        <ul className="flex flex-wrap gap-3">
          <ContactLink
            href={site.links.linkedin}
            label="LinkedIn"
            glyph="linkedin"
          />
          <ContactLink href={site.links.github} label="GitHub" glyph="cat" />
          <ContactLink
            href={site.links.resume}
            label="Résumé"
            glyph="doc"
            event="resume-open"
            download
          />
        </ul>
      </div>
    </section>
  );
}

function ContactLink({
  href,
  label,
  glyph,
  event,
  download = false,
}: {
  href: string;
  label: string;
  /** The pixel mark on the left. The lucide arrow on the right stays. */
  glyph: GlyphName;
  /** Fires a custom analytics event on click — used to count résumé opens. */
  event?: string;
  download?: boolean;
}) {
  const Icon = download ? Download : ArrowUpRight;

  return (
    <li>
      <Magnetic strength={0.3}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={event ? () => track(event) : undefined}
          className="group inline-flex items-center gap-2.5 rounded-md border border-line-lit py-3.5 pr-5 pl-4 font-sans text-[0.9375rem] font-medium transition-colors duration-200 hover:border-pink"
        >
          <Pixel
            art={GLYPHS[glyph]}
            className="h-4 w-4 shrink-0 text-text-mute transition-colors duration-200 group-hover:text-text"
          />
          {label}
          <Icon
            size={14}
            strokeWidth={2}
            aria-hidden="true"
            className="text-pink transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </a>
      </Magnetic>
    </li>
  );
}
