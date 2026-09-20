# tanishkajangir.com

Personal portfolio. One page, dark, with a single pink accent — a network
topology used as the visual language for a network engineering & security
undergrad who ships full-stack software.

## Setup

```bash
npm install
npm run dev     # http://localhost:3000
```

```bash
npm run build && npm start   # production
npm run typecheck            # tsc --noEmit
npm run lint
```

## Stack

Next.js 15 (App Router, RSC) · TypeScript strict · Tailwind CSS v4 ·
Motion (`motion/react-m` + `LazyMotion`) · GSAP ScrollTrigger · Lenis ·
self-hosted Syne / Space Grotesk / JetBrains Mono. Eight runtime
dependencies, no UI kit.

## The design — "Dusk"

| | |
|---|---|
| Ground | `#0B0A10` |
| Surface / Raised | `#121118` / `#18161F` |
| Hairline / lit | `#24222C` / `#34313D` |
| Text / dim / mute | `#EDEBF0` / `#A9A5B3` / `#7E7A89` (4.8:1, the floor) |
| Pink | `#F26BA4`, soft `#F9C1D9` for code |
| Display | Syne 700, `-0.035em` |
| Body | Space Grotesk 400, 17 / 1.65 |
| Label | JetBrains Mono 400, 12px, `0.1em`, caps |

**Pink does four jobs and no others:** the section label, the current nav
item, the hovered item, and one primary button per screen. If it starts
appearing anywhere else, something has gone wrong.

**Patterns** live in `components/ui/patterns.tsx` — `NodeGraph`,
`NodeGraphMark`, `Rings`, `Contours`, `PortraitGraph`, `Wash`, plus the
`.dot-grid` / `.line-grid` classes. They are server-rendered static SVG, drawn
one step quieter than the hairlines, and always behind content. The hero's
graph is the same shape drawn live on canvas.

## Layout

```
app/              layout (fonts, metadata, JSON-LD), page, globals.css, robots, sitemap, icon
components/
  hero/           hero (server) + backdrop (parallax) + the live routing canvas
  work/           project panel (pinned) + preview (clip reveal, cursor tilt)
  sections/       work, about, stack (contains experience), contact
  ui/             patterns, reveal-text, magnetic, section-header, preloader, traceroute
  layout/         nav, footer, scroll-progress, smooth-scroll
content/          all copy — projects, about, stack, experience, site
lib/              motion tokens, lenis/gsap loaders, defer, poisson, intro script
```

**All copy lives in `content/`.** Nothing is hardcoded into JSX; adding a third
project means adding an object to `content/projects.ts`.

## Measured

Lighthouse, mobile preset (4× CPU throttle, simulated slow 4G), production
build, four runs on an otherwise-idle machine:

| | |
|---|---|
| Performance | **98** (median; one outlier at 86 under load) |
| Accessibility | **100** |
| Best Practices | 96 — the one failure is the Vercel Analytics script 404ing locally |
| SEO | **100** |
| FCP | 1.0 – 1.2 s |
| LCP | 1.6 – 2.3 s (target was < 1.8 s — see below) |
| CLS | 0.002 |
| TBT | 30 – 40 ms |
| First-load JS | 171 KB shared / 178 KB for `/` |
| Fonts | 40 KB for three faces, 21 KB preloaded |

**On LCP.** The LCP element is the hero name, and it cannot be painted until
its reveal finishes — a clipped or zero-opacity element is not an LCP
candidate. Lighthouse's mobile preset spends ~1.0s reaching FCP on its own
(562 ms of simulated request latency before a byte of HTML arrives; the local
server responds in 10 ms, so deploying will not change this). That leaves
~0.8 s, and the 0.55 s reveal plus the webfont swap spend it.

The intro is already as short as it can be while still reading as an entrance
(~0.62 s, entirely in CSS), which is what took LCP from 4.0 s to ~2.0 s and the
score from 88 to 98. The remaining levers, in order of cost:

1. `display: "optional"` on the fonts in `app/layout.tsx` — measured
   consistently ~0.5 s faster, because the swap repaint stops creating a late
   LCP candidate. The cost is that a first-time visitor on a slow connection
   sees system-ui for the whole page view. Rejected: the design is typographic.
2. Drop the reveal on the hero name so it paints at FCP. That lands LCP near
   1.2 s and costs the opening moment of the site.

Both are one-line changes if the number matters more than the entrance.

## Notes for future me

- **CSS layering is load-bearing.** Base styles are inside `@layer base` and
  the helpers inside `@layer components`. Unlayered CSS beats every layered
  rule regardless of specificity, so an unlayered `a { color: inherit }`
  silently killed every `text-*` utility on every link on the site — including
  the primary button, which failed contrast at 2.39:1 while looking fine at a
  glance. Anything you add to `globals.css` goes in a layer.
- **`RevealText` puts `whileInView` on the wrapper, not the line that moves.**
  The line starts translated 110% below a wrapper with `overflow: hidden`, and
  IntersectionObserver measures through ancestor clipping — an observer on the
  line reports zero intersection forever, so it can never come into view, so it
  can never animate. Every heading stayed invisible. The wrapper is unclipped
  and propagates its variant down.
- **`useReducedMotion` returns `false` for one render** (hydration safety), so
  every reduced-motion animate target must reset the transform properties its
  non-reduced counterpart sets — otherwise elements stay clipped or scaled to
  zero. Effects that start GSAP call `prefersReducedMotion()` directly instead,
  because GSAP's `revert()` runs after React has committed and would restore
  the pre-animation styles. See `lib/use-reduced-motion.ts`.
- **Motion:** components import `* as m from "motion/react-m"`, never
  `motion` — `LazyMotion strict` in `components/ui/motion-provider.tsx` throws
  otherwise. It keeps ~30 KB of unused features out of the build.
- **GSAP, Lenis and the hero canvas load after load + idle** (`lib/defer.ts`,
  `lib/lenis.ts`). Importing any of them at module scope puts ~45 KB back into
  the critical bundle and takes bandwidth from the fonts during the LCP window.
- **The intro is CSS, not React.** A blocking script in `<head>`
  (`lib/intro-script.ts`) sets `data-intro="play"|"skip"` on `<html>` before
  first paint; `globals.css` does the rest. Nothing about the hero's first
  paint depends on hydration. New hero content gets an `.intro-*` class and an
  `--intro-delay`, not a Motion `animate` prop.
- **One font weight per family.** `next/font` preloads every `src` entry, so a
  second weight is a second file in the critical path. With
  `font-synthesis-weight: none`, `font-semibold` simply renders the 700 we
  have — no faux bold.
- **Fonts are subset** to Latin plus the punctuation the site uses. If you add
  a glyph outside that range — a new arrow, a different dash — re-subset, or it
  renders in the fallback.
- **Pinning is disabled below 1024 px** via `gsap.matchMedia`.
- The email is joined client-side; it is not in the served HTML. The phone
  number is nowhere on the site by design.

## Before this goes to a recruiter

- [ ] Add real screenshots at `public/work/spotlight.png` and
      `wanderlust.png`, then remove `pending: true` from each entry in
      `content/projects.ts` — the frame becomes the image with no other change
- [ ] Replace `public/resume.pdf` (currently a placeholder)
- [ ] Read and correct the "hard part" paragraphs in `content/projects.ts` —
      they are drafts written from the shape of the work, not from the commits
- [ ] Fill in `links.demo` for both projects, and confirm both are alive
- [ ] Real portrait, or keep the generated node graph in `PortraitGraph`
- [ ] Design a proper `public/og.png` (1200×630; the current one is generated)
