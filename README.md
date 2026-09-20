# tanishkajangir.com

Personal portfolio for Tanishka Jangir — full-stack engineer, network
engineering & security undergrad. One page, dark, a single pink accent, with a
network topology as the visual language throughout.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build && npm start   # production
npm run typecheck            # tsc --noEmit
npm run lint
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
  ui/         patterns, reveal-text, magnetic, preloader, traceroute
  layout/     nav, footer, scroll-progress, smooth-scroll
content/      all copy — projects, about, stack, experience, site
lib/          motion tokens, lenis/gsap loaders, defer, poisson, intro script
```

**All copy lives in `content/`** — nothing is hardcoded in JSX. Adding a project
means adding an object to [projects.ts](content/projects.ts).

## Design

Ground `#0B0A10`, text `#EDEBF0`, accent pink `#F26BA4`. Display type is Syne
700, body Space Grotesk, labels JetBrains Mono. Pink does exactly four jobs —
section label, current nav item, hover state, and one primary button per
screen. Background patterns ([patterns.tsx](components/ui/patterns.tsx)) are
server-rendered static SVG, drawn a step quieter than the hairlines.

## Performance

Lighthouse mobile, production build: **98** performance / **100** accessibility /
**100** SEO, CLS 0.002, ~178 KB first-load JS, 40 KB for three font faces. GSAP,
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
- Pinning is disabled below 1024 px. The email is assembled client-side and is
  not in the served HTML.

Full design and build rationale lives in [implementation.md](implementation.md).

## Before shipping

- [ ] Add screenshots at `public/work/spotlight.png` and `wanderlust.png`, then
      drop `pending: true` from each entry in `content/projects.ts`
- [ ] Replace the placeholder `public/resume.pdf`
- [ ] Rewrite the "hard part" paragraphs in `content/projects.ts` from the real
      commit history — they are currently drafts
- [ ] Fill in `links.demo` for both projects and confirm they're live
- [ ] Design a proper `public/og.png` (1200×630)
