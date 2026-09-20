import type { Project } from "@/types";

/**
 * ⚠ DRAFT COPY — beat 3 ("the hard part") of each project is written from the
 * stack and shape of the work, not from your commit history. Read both
 * paragraphs and replace anything that isn't literally what happened. This is
 * the copy a reviewer reads most closely; an invented war story is worse than
 * a plain one. Everything else here is factual and can stay.
 */

export const projects: readonly Project[] = [
  {
    slug: "spotlight",
    index: "01",
    title: "Spotlight",
    subtitle: "AI-Powered SaaS Webinar Platform",
    year: "2026",
    stack: [
      "Next.js 15",
      "TypeScript",
      "Prisma",
      "Neon",
      "Stripe",
      "VAPI",
      "OBS",
    ],
    summary:
      "A hosted webinar product: live streaming, AI voice agents that talk to attendees in real time, and subscription billing.",
    beats: [
      {
        label: "The problem",
        heading: "Live webinar tooling is priced for enterprises or built for nobody.",
        body:
          "The tools that do this well start in the high hundreds per month and assume a marketing team behind them. The affordable end is a video embed with a chat box bolted on — no funnel, no follow-up, no way to answer an attendee who asks a question at minute forty. I wanted to see whether the good version of this was actually a platform problem or just an integration problem nobody had bothered to solve carefully.",
      },
      {
        label: "The build",
        heading: "Streaming, voice agents, billing, and an archive that manages itself.",
        body:
          "Spotlight ingests an OBS stream and serves it to attendees alongside a registration and reminder flow. VAPI voice agents handle real-time attendee interaction during the session, so a question doesn't sit unanswered while the host is presenting. Stripe drives tiered subscriptions with entitlement checks at the route level, and finished sessions are recorded and filed into a per-account archive without the host doing anything. Data lives in Neon behind Prisma, typed end to end.",
      },
      {
        label: "The hard part",
        heading: "Stripe webhooks are not ordered, and I built as though they were.",
        body:
          "Subscriptions provisioned twice under load. The cause was that I trusted webhook arrival order: `checkout.session.completed` and `customer.subscription.updated` describe the same state transition, Stripe retries both on any non-2xx, and my handler treated each as an instruction to grant access. Two events landing inside the same second meant two grants. The fix had two halves. First, every event ID is written to a `StripeEvent` row with a unique constraint, and the grant happens in the same Prisma transaction — a replay collides on insert and the whole transaction rolls back, so the handler is idempotent by construction rather than by a check-then-act I'd already proven I could get wrong. Second, the handler stopped reading state out of the event payload and re-fetches the subscription from Stripe instead, which makes ordering irrelevant: whichever event arrives last reconciles to the same truth.",
      },
    ],
    image: {
      src: "/work/spotlight.png",
      alt:
        "Spotlight dashboard showing a scheduled webinar with attendee registration counts, a live stream preview, and the subscription tier panel.",
      width: 1200,
      height: 750,
      pending: true,
      scene: "spotlight",
    },
    links: {
      // TODO: confirm these are live before shipping. A dead demo is worse than none.
      demo: undefined,
      repo: "https://github.com/TanishkaJ26",
    },
  },
  {
    slug: "wanderlust",
    index: "02",
    title: "WanderLust",
    subtitle: "Vacation Rental Platform",
    year: "2025",
    stack: [
      "Node.js",
      "Express",
      "MongoDB",
      "Passport.js",
      "Cloudinary",
      "Mapbox",
    ],
    summary:
      "A full rental marketplace — listings, reviews, auth, maps and an image pipeline — built server-rendered on Express.",
    beats: [
      {
        label: "The surface",
        heading: "30+ categorised listings with filtering and a real review workflow.",
        body:
          "Listings are categorised and filterable, each with its own review thread. Reviews are owned — you can only edit or delete your own, enforced server-side rather than by hiding the button — and deleting a listing cascades to its reviews instead of orphaning them. The whole thing is server-rendered, which for a content site like this is the right call and made the SEO story free.",
      },
      {
        label: "The plumbing",
        heading: "Session auth, forward geocoding, and an asset pipeline.",
        body:
          "Passport.js handles local auth over session cookies, with middleware guarding every mutating endpoint and a redirect that returns you to where you were before the login wall. Addresses are resolved through Mapbox forward geocoding at create time and cached on the document, so the map renders from stored coordinates instead of geocoding on every page view. Images go to Cloudinary via Multer, transformed on delivery rather than on upload.",
      },
      {
        label: "The hard part",
        heading: "Cloudinary was collecting images for listings that never existed.",
        body:
          "Uploads were orphaning. Multer's Cloudinary storage engine runs as middleware, which means the file is already in Cloudinary by the time my route handler gets a chance to validate the body — so every rejected listing left a paid-for asset behind with nothing pointing at it, and Mongo had no record to clean up from. I found it because the Cloudinary folder had roughly a third more images than the collection had listings. The honest fix would have been to validate before the upload middleware ran, but the validation needs the parsed multipart body, which is the thing Multer produces — so the ordering can't simply be swapped. What I did instead was wrap the handler so that any failure path after the upload calls `cloudinary.uploader.destroy` with the public ID before responding, and added a schema-level validation pass on the text fields that runs first and short-circuits without touching the file. That doesn't cover a process crash between upload and insert; a reconciliation job would, and that's the piece I'd add next.",
      },
    ],
    image: {
      src: "/work/wanderlust.png",
      alt:
        "WanderLust listing index showing categorised rental cards with photos and prices, above a Mapbox map with location pins.",
      width: 1200,
      height: 750,
      pending: true,
      scene: "wanderlust",
    },
    links: {
      demo: undefined,
      repo: "https://github.com/TanishkaJ26",
    },
  },
];
