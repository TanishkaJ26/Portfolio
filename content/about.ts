/**
 * ⚠ DRAFT COPY — three paragraphs written in your voice from what the spec
 * says about you. Rewrite the parts that aren't true. First person, no
 * "passionate", no "aspiring".
 */
export const about = [
  "I'm a network engineering and security undergraduate at DSEU in New Delhi, and I ship full-stack software. Those two things are usually separate people. I ended up doing both because the coursework kept answering questions my side projects had raised — why a request was slow, why a session didn't survive a redeploy, what a TLS handshake is actually spending its time on.",
  "That intersection is most of what I find interesting. Most application work treats the network as a flat, reliable pipe. It isn't, and the bugs that cost me the most time have all lived in that gap: retries arriving out of order, state that assumed exactly-once delivery, auth that worked until it crossed a process boundary. Knowing what's happening a few layers down turns those from mysteries into ordinary problems.",
  "Right now I'm looking for a software engineering internship where I can work on systems with real traffic and people who will tell me when I'm wrong. Longer term I'm heading toward a masters in networks or security. If you're building something where the interesting problems are between the request and the response, I'd like to hear about it.",
] as const;

/** The four readouts under the portrait. */
export const stats = [
  { label: "CGPA", value: "8.93 / 10" },
  { label: "Shipped", value: "2 builds" },
  { label: "Base", value: "New Delhi" },
  { label: "Status", value: "Open to intern" },
] as const;
