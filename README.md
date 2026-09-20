# tanishkajangir.com

Personal portfolio for Tanishka Jangir — full-stack engineer, network
engineering & security undergrad. One page, dark, a single pink accent, with a
network topology as the visual language throughout, plus a hand-drawn
pixel-art layer for the icons and illustrations.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build && npm start   # production
npm run typecheck            # tsc --noEmit + pixel-grid check
npm run lint
npm run check:pixels         # every pixel sprite is rectangular
```

## Stack

Next.js 15 (App Router, RSC) · React 19 · TypeScript (strict) · Tailwind CSS v4 ·
Motion · GSAP ScrollTrigger · Lenis · self-hosted Syne / Space Grotesk /
JetBrains Mono. Eight runtime dependencies, no UI kit.

## Structure

```
app/          layout (fonts, metadata, JSON-LD), page, globals.css, robots, sitemap
components/
  hero/       hero + parallax backdrop + live routing canvas
  work/       pinned project panel + preview
  sections/   work, about, stack, contact
  ui/         pixel, patterns, reveal-text, magnetic, preloader, traceroute
  layout/     nav, footer, scroll-progress, smooth-scroll
content/      all copy — projects, about, stack, experience, site
lib/          pixel-art atlas, motion tokens, lenis/gsap loaders, defer,
              poisson, intro script
scripts/      check-pixels.mjs
```

**All copy lives in `content/`** — nothing is hardcoded in JSX. Adding a project
means adding an object to [projects.ts](content/projects.ts).

## Design

Ground `#0B0A10`, text `#EDEBF0`, accent pink `#F26BA4`. Display type is Syne
700, body Space Grotesk, labels JetBrains Mono. Pink does exactly four jobs —
section label, current nav item, hover state, and one primary button per
screen. Background patterns ([patterns.tsx](components/ui/patterns.tsx)) are
server-rendered static SVG, drawn a step quieter than the hairlines.

### Pixel art

Icons and illustrations are hand-authored character grids in
[pixel-art.ts](lib/pixel-art.ts) — `.` transparent, `#` currentColor, `o` a 40%
tint of it, `+` the pink, `O`/`=` fixed tokens for scene fills and "text".
[Pixel](components/ui/pixel.tsx) merges each grid into the largest rectangles
that fit and emits one `<path>` per character: 67 sprites on the page cost 28 KB
of markup (3.8 KB gzipped) and no network request.

Because `#` is `currentColor`, a glyph recolours with its context — that is how
one `color` change lights both the word and the mark in the stack list. Keep
the pink to a couple of pixels per glyph, the same restraint the rest of the
system uses. Adding a technology without a glyph is safe: `techGlyph()` falls
back to a diamond. Grids must be rectangular — `npm run check:pixels` enforces
it, and `app/icon.svg` is generated from the `networks` glyph.

## Performance

Lighthouse mobile, production build: **98** performance / **100** accessibility /
**100** SEO, CLS 0.002, 40 KB for three font faces. First-load JS is ~181 KB
(the pixel atlas added ~3 KB to the client bundle; Lighthouse has not been
re-run since). GSAP,
Lenis and the hero canvas load after load + idle; the intro animation is pure
CSS driven by a blocking script, so first paint never waits on hydration.

## Gotchas worth knowing before editing

- **Everything in `globals.css` goes in a `@layer`.** Unlayered CSS beats every
  layered rule regardless of specificity.
- **Import `* as m from "motion/react-m"`, never `motion`** — `LazyMotion strict`
  throws otherwise, and it keeps ~30 KB out of the build.
- **`useReducedMotion` returns `false` for one render** (hydration safety), so
  reduced-motion targets must reset every transform their counterpart sets. See
  [use-reduced-motion.ts](lib/use-reduced-motion.ts).
- **New hero content gets an `.intro-*` class and `--intro-delay`**, not a Motion
  `animate` prop — the intro is CSS ([intro-script.ts](lib/intro-script.ts)).
- **One font weight per family**, and fonts are subset to Latin plus the
  punctuation in use — a new glyph outside that range needs a re-subset.
- **A new pixel sprite needs a rectangular grid and only the five painted
  characters** — anything else is silently dropped by the renderer, so run
  `npm run check:pixels`.
- Pinning is disabled below 1024 px. The email is assembled client-side and is
  not in the served HTML.

Full design and build rationale lives in [implementation.md](implementation.md).

## Before shipping

- [ ] Add screenshots at `public/work/spotlight.png` and `wanderlust.png`, then
      drop `pending: true` from each entry in `content/projects.ts` (the
      pixel-art scene is the stand-in until then)
- [ ] Optional: drop a photo into the About portrait slot, which currently
      holds the pixel desk
- [ ] Replace the placeholder `public/resume.pdf`
- [ ] Rewrite the "hard part" paragraphs in `content/projects.ts` from the real
      commit history — they are currently drafts
- [ ] Fill in `links.demo` for both projects and confirm they're live
- [ ] Design a proper `public/og.png` (1200×630)
