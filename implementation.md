# Portfolio Website — Implementation Spec

**Owner:** Tanishka Jangir
**Domain:** `tanishkajangir.com` (register it; `.com` over `.dev` for recruiter familiarity)
**Links:** [LinkedIn](https://www.linkedin.com/in/tanishka-jangir) · [GitHub](https://github.com/TanishkaJ26)
**Status:** Spec v1 — ready to build

---

## 1. Goal & Positioning

This site does two jobs, eighteen months apart:

1. **Now (2026–27):** land SWE / full-stack internships. Recruiters spend 20–40 seconds. The site must prove competence in that window.
2. **Late 2027:** support masters applications (UK / Europe / Australia / Singapore). Admissions committees read slower and care about depth, not polish.

**The positioning that makes this site distinctive:** most student portfolios are "React developer who built a few CRUD apps." Yours isn't. You're a network engineering & security undergrad who ships production full-stack software. That intersection is rare and it should be the entire visual and narrative thesis of the site.

**Tagline direction** (pick one, don't write a paragraph):
- "I build things that move data — and think about who's watching it."
- "Full-stack engineer. Network security undergrad. Interested in what happens between the request and the response."

Avoid: "passionate developer," "aspiring," "seeking opportunities." Those read as apologies.

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15** (App Router, RSC) | You already know it. Best-in-class perf defaults and SEO. |
| Language | **TypeScript** (strict) | Non-negotiable — recruiters check the repo. |
| Styling | **Tailwind CSS v4** + CSS custom properties | v4's native cascade layers make theming trivial. |
| Animation (declarative) | **Motion** (`motion/react`, formerly Framer Motion) | Layout animations, enter/exit, springs. |
| Animation (scroll) | **GSAP 3 + ScrollTrigger** | Pinning and scrubbed timelines — Motion's scroll API can't pin cleanly. |
| Smooth scroll | **Lenis** | Required for scroll animations to feel expensive. |
| Hero visual | **Canvas 2D** (hand-rolled) | See §6.1. Not Three.js — a 2D canvas hits 60fps on a mid-range Android; WebGL costs you 400KB and mobile battery. |
| Type animation | **Splitting via custom hook** | Don't pull in SplitText (paid). Roll your own — 20 lines. |
| Icons | **Lucide React** | Tree-shakeable. |
| Deploy | **Vercel** | Zero-config for Next. Free tier is enough. |
| Analytics | **Vercel Analytics** or **Plausible** | Know which projects get clicked. |

**Hard rule: no UI kit.** No shadcn, no MUI. Award-winning means it looks like nobody else's site. Component libraries make it look like everybody's.

**Dependency budget:** if `package.json` has more than 14 runtime dependencies, something is wrong.

---

## 3. Design System

### 3.1 Concept — "Signal"

Network-forensics aesthetic. Dark, instrumented, precise. Think packet capture tooling and observability dashboards, rendered beautifully. Monospace as a *deliberate accent*, not the body font. Thin hairline rules. Data-like density.

This is not "cyberpunk hacker green-on-black" — that's a cliché and it reads as juvenile. This is closer to Vercel's or Linear's restraint, with a routing-topology motif.

### 3.2 Color Tokens

```css
:root {
  --bg:        #08090B;   /* near-black, slightly blue */
  --bg-raised: #0F1114;
  --bg-hover:  #16191D;

  --line:      #1E2227;   /* hairline borders */
  --line-lit:  #2C3238;

  --text:      #ECEDEE;
  --text-dim:  #8B9199;
  --text-mute: #5A6069;

  --accent:      #4DE8B0;  /* signal green — used sparingly */
  --accent-glow: #4DE8B033;
  --warn:        #F5A623;  /* for the security/threat motif */

  --font-sans: 'Geist', system-ui, sans-serif;
  --font-mono: 'Geist Mono', 'JetBrains Mono', monospace;
}
```

**Accent discipline:** `--accent` appears on at most 5% of any viewport. It marks *active state and live data only* — a hovered link, an animating packet, the current nav item. If everything glows, nothing does.

### 3.3 Typography

- **Display:** Geist / Satoshi, 600 weight, `letter-spacing: -0.03em`. Hero at `clamp(2.75rem, 8vw, 7rem)`.
- **Body:** same family, 400, `1.0625rem`, `line-height: 1.65`, `max-width: 68ch`.
- **Mono:** Geist Mono, used for: section numbers (`01 / WORK`), tech tags, timestamps, stats, the terminal easter egg.

Self-host fonts via `next/font/local` — no Google Fonts network hop. Subset to latin. Two weights maximum.

### 3.4 Motion Tokens

```ts
export const ease = {
  out:   [0.16, 1, 0.3, 1],      // expo-out — the workhorse
  inOut: [0.83, 0, 0.17, 1],
  spring: { type: 'spring', stiffness: 260, damping: 30, mass: 0.8 },
} as const;

export const dur = { fast: 0.25, base: 0.6, slow: 1.1, epic: 1.8 };
```

**Motion principles:**
- Entrances are **fast out, slow settle** — never linear, never bounce (bounce reads as amateur).
- Nothing animates for longer than 1.2s except the hero canvas, which is ambient and loops.
- **Stagger is where the money is.** 40–60ms between siblings. Not 200ms — that feels sluggish.
- Elements enter with `opacity + translateY(16px)` or a clip-path reveal. Never scale from 0. Never rotate in.

---

## 4. Information Architecture

**One page. That's it.**

```
/                      Hero → Work → About → Stack → Experience → Contact
/resume.pdf            Static asset, tracked as an analytics event
```

With two projects, separate `/work/[slug]` case-study pages are ceremony. They add routing, `generateStaticParams`, a second layout to design, and a navigation decision the visitor has to make — in exchange for content that fits comfortably inside the scroll. Every click you ask a recruiter to make is a place they can leave. The case-study depth goes *inline* in §5.2 instead.

Navigation is therefore anchor links only — a thin fixed header with `WORK · ABOUT · STACK · CONTACT` and a scroll-progress hairline. No router, no page transitions to build.

**Do not build:** a blog you won't write, a "services" page, testimonials with no testimonials, a dark/light toggle (commit to dark), or sub-pages for two projects.

*If you add a fourth or fifth project later*, revisit this — at that point a grid of cards linking to real case studies starts earning its keep. `content/projects.ts` (§9) keeps that migration cheap.

---

## 5. Section-by-Section Spec

### 5.0 Preloader (0–1400ms)

Full-screen `--bg`. A monospace counter `000 → 100` bottom-left. Behind it, hairlines draw themselves across the viewport forming a routing-grid. At 100, the grid collapses into the hero's network node positions and the overlay wipes upward via `clip-path`.

Gate on `document.fonts.ready` + hero canvas first frame. **Hard-cap at 1.4s** — if assets aren't ready, exit anyway. A preloader that outlives its usefulness is the single fastest way to lose a recruiter.

Show it **once per session** (`sessionStorage`), never on route changes.

### 5.1 Hero

Full viewport. Left-aligned, not centered.

```
TANISHKA JANGIR                    [ 01 / INDEX ]

Full-stack engineer building
production software — studying
what happens between the
request and the response.

B.Tech Network Engineering & Security · DSEU New Delhi
                                   ↓ scroll
```

**Behind the type:** the live routing canvas (§6.1), at 35% opacity, masked with a radial gradient so it fades behind the text.

**Entrance choreography** (starts at preloader exit, total 1.1s):
1. `0ms` — Name: per-character clip-path reveal from bottom, 30ms stagger.
2. `300ms` — Headline: per-line mask reveal, 80ms stagger.
3. `600ms` — Meta line + scroll cue: fade + `y: 12 → 0`.
4. `0ms` (parallel) — Canvas nodes fade in and begin routing.

On scroll, hero content translates up at `0.4×` scroll speed and fades to 0 by 60vh. Canvas parallaxes at `0.15×`.

### 5.2 Work (the section that gets you hired)

Two projects, each given full weight. Do **not** grid them into small cards — you have two, so treat them like they matter.

**Layout:** each project is a full-viewport panel. The left column pins (GSAP ScrollTrigger) while the right column scrolls through 3 "beats" of the story.

**Project 01 — Spotlight**
> AI-Powered SaaS Webinar Platform
> Next.js 15 · TypeScript · Prisma · Neon · Stripe · VAPI

Beats:
1. **The problem** — live webinar tooling is either enterprise-priced or feature-thin.
2. **The build** — OBS-integrated streaming, VAPI voice agents for real-time attendee interaction, Stripe subscription tiers, automated recording archive.
3. **The hard part** — pick one genuine engineering challenge and explain it. (Stream state sync? Webhook idempotency on Stripe? Latency on the voice agent?) *This paragraph is what separates you from every other applicant.* Write it honestly; if something didn't work, say so.

Since there are no case-study pages, this third beat carries their weight. Give it 150–200 words and real technical specificity — a named failure mode, what you tried, what actually fixed it. It should read like a short engineering note, not a feature list.

**Project 02 — WanderLust**
> Vacation Rental Platform
> Node.js · Express · MongoDB · Passport.js · Cloudinary · Mapbox

Beats: 30+ categorised listings with dynamic filtering and review workflows · session-cookie auth with protected endpoints via Passport.js · Mapbox forward geocoding + Cloudinary asset pipeline.

**Animation per panel:**
- Panel enters: the project number (`01`) counts up, title does a line-mask reveal, and a hairline draws left-to-right beneath it (`scaleX: 0 → 1`, 0.8s, expo-out).
- Screenshot/preview: `clip-path: inset(100% 0 0 0) → inset(0)` over 1s, with the image inside at `scale(1.12) → scale(1)` — the classic "reveal with counter-motion" that makes it feel expensive.
- Tech tags stagger in at 45ms.
- On hover over the preview: subtle 3D tilt (`rotateX/rotateY` ±6°, spring-damped, following cursor). Kill this on touch devices.

**Every project needs a real screenshot.** Mockup-in-a-laptop-frame is fine. A gray placeholder box is disqualifying.

### 5.3 About

Two columns. Left: portrait or an abstract network-graph self-portrait. Right: 3 short paragraphs — who you are, the security↔full-stack intersection, what you're looking for.

Animation: paragraph text reveals **per line** on scroll-into-view via `clip-path`, 60ms stagger. Portrait reveals with the same inset-clip + counter-scale as project previews (visual consistency = design maturity).

### 5.4 Stack

Not a wall of logos. A **grouped, monospace, typographic list** with a hairline grid:

```
LANGUAGES     C++  ·  Python  ·  TypeScript  ·  JavaScript  ·  SQL
FRONTEND      React  ·  Next.js 15  ·  Tailwind  ·  Redux Toolkit
BACKEND       Node.js  ·  Express  ·  REST APIs  ·  Prisma
DATA          PostgreSQL  ·  MongoDB  ·  Neon
SYSTEMS       Computer Networks  ·  Network Security  ·  DSA  ·  OOP
TOOLS         Git  ·  Linux/Bash  ·  Vercel  ·  Docker  ·  Stripe  ·  VAPI
```

Animation: each row's hairline draws in, then items fade + `y` stagger at 35ms. Hovering an item lights it `--accent` and dims its siblings to `--text-mute` — a small, cheap interaction that feels alive.

### 5.5 Experience & Leadership

Vertical timeline, hairline spine. Three entries:
- **Jamuna Foundation** — Frontend Developer Intern, Feb–Mar 2026 (Remote)
- **DSEU** — B.Tech Network Engineering & Security, Aug 2024 – May 2028, CGPA 8.93/10
- **Republic Day Camp (RDC)** — Contingent Volunteer, Jan 2026

The RDC entry is an asset — it's evidence of operating under protocol and pressure, which nobody else's portfolio has. Give it one sharp line, don't bury it.

Animation: the spine draws downward scrubbed to scroll (`ScrollTrigger` with `scrub: 0.8`); each node pops (`scale 0 → 1`, spring) as the line passes it; content fades in from the side.

### 5.6 Contact

Oversized `mailto:` link as the visual anchor. Magnetic hover (§6.3).

```
Open to internships and collaboration.

tanishkajangir26@gmail.com

LinkedIn ↗   GitHub ↗   Résumé ↗
```

**Leave the phone number off the site.** Scrapers harvest it; it's on the résumé PDF for anyone who actually needs it. Obfuscate the email too — render it from a small client-side join rather than raw text in the HTML.

Footer: `© 2026 · Built with Next.js · New Delhi, India` + a live IST clock in mono (small, on-theme, costs nothing).

---

## 6. Signature Interactions

These are the four things that make it memorable. Build them properly or cut them — a half-implemented signature interaction is worse than none.

### 6.1 The Routing Canvas (hero)

An ambient visualization of packets traversing an autonomous-system graph. It is the thesis of the site rendered as motion: *you build the application layer, and you understand the layers below it.*

```ts
// components/hero/routing-canvas.ts
type Node = { x: number; y: number; r: number };
type Packet = { edge: number; t: number; speed: number };

// 1. Generate ~18 nodes via Poisson-disc sampling (min distance ~14vw)
//    so they're organic, not gridded.
// 2. Connect each node to its 2–3 nearest neighbours → edge list.
// 3. Spawn a packet every ~180ms on a random edge, t: 0 → 1.
// 4. Each frame: advance t, draw edges at 12% alpha, draw packets as
//    2px dots with a 14px trailing gradient in --accent.
// 5. On packet arrival, pulse the destination node: a ring expands
//    (r → r * 4) and fades over 500ms.
// 6. Cursor proximity within 120px: node brightens and nudges 3px
//    toward the cursor (lerped, k = 0.08).
```

Implementation requirements:
- **DPR clamp:** `Math.min(devicePixelRatio, 2)`. Uncapped DPR on a high-density phone destroys the framerate.
- **Pause when offscreen:** `IntersectionObserver` → cancel the RAF loop. Also pause on `visibilitychange`.
- **Delta-time based**, not frame-count based, so it runs identically at 60/90/120Hz.
- **Mobile:** drop to 10 nodes, halve packet spawn rate.
- **Reduced motion:** render one static frame of the graph — still beautiful, zero motion.

**Budget: ≤ 4ms per frame.** Profile it. If you can't hold that, cut node count, not quality.

### 6.2 Scroll-Scrubbed Project Pinning

```ts
gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.create({
  trigger: panelRef.current,
  start: 'top top',
  end: '+=200%',
  pin: leftColRef.current,
  scrub: 0.6,          // 0.6 gives weight without feeling laggy
  anticipatePin: 1,    // prevents the 1-frame jump on pin
});
```

Sync Lenis to GSAP's ticker or the two will fight:

```ts
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```

**Disable pinning below 1024px.** Pinned sections on mobile are a known usability disaster — panels become a plain vertical stack.

### 6.3 Magnetic Elements

For the contact link, nav items, and the résumé button.

```tsx
function useMagnetic(strength = 0.35) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 22 });
  const sy = useSpring(y, { stiffness: 220, damping: 22 });

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(pointer: coarse)').matches) return;

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x.set((e.clientX - (r.left + r.width / 2)) * strength);
      y.set((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const reset = () => { x.set(0); y.set(0); };

    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', reset);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', reset);
    };
  }, [strength, x, y]);

  return { ref, style: { x: sx, y: sy } };
}
```

Keep `strength ≤ 0.4`. Beyond that it feels broken rather than responsive.

### 6.4 Line-Mask Text Reveal

The single highest-impact/lowest-cost animation on the site. Use it everywhere text enters.

```tsx
export function RevealText({ children, delay = 0 }: Props) {
  const reduce = useReducedMotion();
  return (
    <span className="block overflow-hidden">
      <motion.span
        className="block will-change-transform"
        initial={reduce ? { opacity: 0 } : { y: '110%' }}
        whileInView={reduce ? { opacity: 1 } : { y: '0%' }}
        viewport={{ once: true, margin: '-12% 0px' }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}
```

Split headlines into lines at build time (or measure on mount), map with `delay={i * 0.06}`.

**Optional easter egg:** typing `traceroute` anywhere on the page opens a small terminal overlay that "traces" a route through the site's sections. On-theme, delightful, ~60 lines. Build it last, cut it without guilt if time is short.

---

## 7. Performance Budget

Non-negotiable targets, measured on **mobile Lighthouse, 4× CPU throttle**:

| Metric | Target |
|---|---|
| Performance score | ≥ 95 |
| LCP | < 1.8s |
| CLS | < 0.02 |
| INP | < 150ms |
| First-load JS | < 180KB gzipped |
| Hero canvas frame time | < 4ms |

How you hit it:
- Hero text is **server-rendered**, not animated in by JS after hydration. The LCP element must exist in the HTML.
- `next/dynamic` with `ssr: false` for the canvas, GSAP, and Lenis. None of them belong in the critical bundle.
- Images: `next/image`, AVIF + WebP, explicit `width`/`height`, `priority` only on the first project preview.
- Animate **only** `transform` and `opacity`. If you find yourself animating `width`, `top`, or `box-shadow`, restructure.
- `will-change` on actively animating elements only — remove it on animation complete. Permanent `will-change` is a memory leak by another name.
- Run `@next/bundle-analyzer` before you ship. GSAP's full bundle is 70KB; import only `gsap` + `ScrollTrigger`.

---

## 8. Accessibility

This is also a differentiator — most "award-winning" portfolios fail it badly, and any serious reviewer will notice.

- **`prefers-reduced-motion`:** a genuine alternate experience. All scroll-scrub, magnetic, parallax and canvas motion off; content appears with a 200ms opacity fade. Test it: macOS System Settings → Accessibility → Display → Reduce motion.
- Contrast ≥ 4.5:1 for body text. `--text-dim` (#8B9199) on `--bg` passes; do not go dimmer for anything readable.
- Every interactive element reachable and operable by keyboard, with a visible focus ring (`outline: 2px solid var(--accent); outline-offset: 3px`). Never `outline: none` without a replacement.
- Semantic landmarks: `<header> <main> <section aria-labelledby> <footer>`. One `<h1>` (your name).
- Canvas gets `aria-hidden="true"` — it's decorative.
- Skip-to-content link, visually hidden until focused.
- Real `alt` text on project screenshots describing the interface, not "project image".

---

## 9. Project Structure

```
tanishka-portfolio/
├── app/
│   ├── layout.tsx              # fonts, metadata, Lenis provider
│   ├── page.tsx                # the entire site (RSC section composition)
│   └── globals.css             # tokens, resets, base type
├── components/
│   ├── hero/
│   │   ├── hero.tsx
│   │   └── routing-canvas.tsx  # 'use client'
│   ├── work/
│   │   ├── project-panel.tsx
│   │   └── project-preview.tsx
│   ├── sections/               # about, stack, experience, contact
│   ├── ui/
│   │   ├── reveal-text.tsx
│   │   ├── magnetic.tsx
│   │   ├── draw-line.tsx
│   │   └── preloader.tsx
│   └── layout/                 # nav, footer, scroll-progress
├── lib/
│   ├── motion.ts               # ease/dur tokens
│   ├── use-reduced-motion.ts
│   ├── lenis.ts
│   └── poisson.ts              # node sampling for the canvas
├── content/
│   └── projects.ts             # typed project data — single source of truth
├── public/
│   ├── fonts/
│   ├── work/                   # screenshots, AVIF + WebP
│   ├── og.png                  # 1200×630
│   └── resume.pdf
└── types/
```

**Content lives in `content/projects.ts`**, typed. Never hardcode project copy into JSX — when you add a third project you'll thank yourself.

---

## 10. Build Order

Sequenced so you always have something shippable. Roughly 2½ weeks at a student's pace.

**Phase 1 — Foundation (days 1–3)**
Next.js 15 + TS strict + Tailwind v4. Tokens in `globals.css`. Fonts self-hosted. Static, unanimated versions of every section with real copy. **Deploy to Vercel on day 3** — an ugly live site beats a beautiful local one.

**Phase 2 — Motion layer (days 4–8)**
Lenis + GSAP wiring. `RevealText` everywhere. Scroll progress bar. Stagger on stack and tags. Hairline draw-ins. Site should already feel good here.

**Phase 3 — Signatures (days 9–14)**
Routing canvas. Project pinning. Magnetic elements. Preloader. This is the expensive phase — protect the time.

**Phase 4 — Writing (days 15–16)**
Write the "hard part" paragraphs and the About section properly. No code. This is the phase people skip and it carries more weight than any animation on this list.

**Phase 5 — Polish & ship (days 17–19)**
Reduced-motion pass. Lighthouse until ≥ 95 mobile. Real-device test (mid-range Android, iPhone, Safari — Safari *will* break something in your `clip-path` work). OG image. Analytics. Custom domain.

---

## 11. SEO & Metadata

```ts
export const metadata: Metadata = {
  metadataBase: new URL('https://tanishkajangir.com'),
  title: 'Tanishka Jangir — Full-Stack Engineer',
  description:
    'Full-stack engineer and B.Tech Network Engineering & Security undergraduate. ' +
    'Building production web applications with Next.js, TypeScript and Node.',
  openGraph: { type: 'website', images: ['/og.png'] },
  twitter: { card: 'summary_large_image' },
};
```

Add `Person` JSON-LD (name, `alumniOf`, `sameAs` → LinkedIn + GitHub). It's what makes your name resolve correctly when a recruiter Googles it.

---

## 12. Content You Need to Prepare

The build is blocked on these more than on any code:

- [ ] **Screenshots** of Spotlight and WanderLust — clean, real data, no lorem ipsum, no dev toolbars
- [ ] **The "hard part" paragraph** for each project (120–180 words) — the genuine engineering challenge and how you solved it
- [ ] A short **About** — 3 paragraphs, first person, no clichés
- [ ] **Portrait** or an abstract stand-in
- [ ] **Résumé PDF** at `/public/resume.pdf`
- [ ] Confirm both project demos are **live and working** — a dead demo link is worse than no link

---

## 13. Definition of Done

- [ ] Lighthouse mobile ≥ 95 across all four categories
- [ ] Full keyboard traversal with visible focus at every stop
- [ ] Reduced-motion mode is coherent, not just "animations missing"
- [ ] Tested on real iOS Safari and a mid-range Android
- [ ] No console errors or warnings
- [ ] No layout shift on load (CLS < 0.02)
- [ ] Every external link `rel="noopener noreferrer"`, every demo link alive
- [ ] Repo is public, `README.md` has a screenshot and a one-line setup
- [ ] Phone number is **not** in the page source

---

## 14. Things To Deliberately Not Do

- Custom cursor that replaces the system cursor — it's dated and it hurts usability
- Horizontal scroll sections — universally hated on trackpads
- Sound effects
- A "my journey" narrative section
- Skill percentage bars ("React 85%") — meaningless and read as inexperienced
- Animating anything that delays the user reading the content
- More than two accent colors

---

## 15. Stretch Goals (only after §13 is fully checked)

- A genuine **BGP route-visibility explorer** as a third project — pulls RIPE RIS or RouteViews data and visualizes route changes. Given where your degree is heading, this would be the strongest single thing on the site, and it would double as evidence for masters applications.
- Command palette (`⌘K`) for navigation

---

*One honest note: the animations get you a second look, but the "hard part" paragraphs in §5.2 get you the interview. If you run short on time, cut the preloader and the easter egg before you cut the writing.*
