import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import dynamic from "next/dynamic";
import { Analytics } from "@vercel/analytics/next";

import { Footer } from "@/components/layout/footer";
import { MotionProvider } from "@/components/ui/motion-provider";
import { Nav } from "@/components/layout/nav";
import { Preloader } from "@/components/ui/preloader";
import { INTRO_SCRIPT } from "@/lib/intro-script";
import { site } from "@/content/site";

import "./globals.css";

// Self-hosted and subset to Latin plus the punctuation the site uses: no
// Google Fonts hop, no third-party connection on first paint.
// One weight per family. next/font preloads every `src` entry, so a second
// weight is a second file in the critical path — and with
// `font-synthesis-weight: none` a request for 600 simply renders the 700 we
// have, with no faux-bold. Three files, 39KB, two preloaded.
const syne = localFont({
  src: [
    { path: "../public/fonts/Syne-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-syne",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

const spaceGrotesk = localFont({
  src: [
    {
      path: "../public/fonts/SpaceGrotesk-400.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-space-grotesk",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

const jetbrainsMono = localFont({
  src: [
    {
      path: "../public/fonts/JetBrainsMono-400.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-jetbrains-mono",
  display: "swap",
  // Not preloaded: mono is only used for small labels, and the display and
  // body faces should have the connection to themselves during first paint.
  preload: false,
  fallback: ["ui-monospace", "monospace"],
});

// Client-only, and neither belongs in the critical bundle.
const SmoothScroll = dynamic(() =>
  import("@/components/layout/smooth-scroll").then((mod) => mod.SmoothScroll),
);
const Traceroute = dynamic(() =>
  import("@/components/ui/traceroute").then((mod) => mod.Traceroute),
);

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: "Tanishka Jangir — Full-Stack Engineer",
  description:
    "Full-stack engineer and B.Tech Network Engineering & Security undergraduate. " +
    "Building production web applications with Next.js, TypeScript and Node.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: "Tanishka Jangir — Full-Stack Engineer",
    description:
      "Full-stack engineer and B.Tech Network Engineering & Security undergraduate.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tanishka Jangir — Full-Stack Engineer",
    description:
      "Full-stack engineer and B.Tech Network Engineering & Security undergraduate.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b0a10",
  colorScheme: "dark",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  url: site.url,
  jobTitle: "Full-Stack Engineer",
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Delhi Skill & Entrepreneurship University",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "New Delhi",
    addressCountry: "IN",
  },
  sameAs: [site.links.linkedin, site.links.github],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      // Server default, so the intro plays correctly for a first visit and —
      // importantly — still plays with JavaScript disabled, where the script
      // below never runs. Without an attribute the preloader has no animation
      // and would cover the page forever.
      data-intro="play"
      // The script rewrites this to "skip" on a repeat visit, before React
      // hydrates. That is a deliberate server/client difference on this one
      // element; suppression here is shallow and does not affect children.
      suppressHydrationWarning
      className={`${syne.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* Blocking on purpose: it decides the intro before the first paint,
            which is cheaper than a flash of a preloader we then remove. */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      </head>
      <body>
        <script
          type="application/ld+json"
          // Static, author-controlled object — no user input reaches this.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />

        <a href="#main" className="sr-only-focusable">
          Skip to content
        </a>

        <Preloader />

        <MotionProvider>
          <SmoothScroll />
          <Nav />
          <main id="main">{children}</main>
          <Footer />
          <Traceroute />
        </MotionProvider>

        <Analytics />
      </body>
    </html>
  );
}
