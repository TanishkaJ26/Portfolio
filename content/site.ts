export const site = {
  name: "Tanishka Jangir",
  role: "Full-Stack Engineer",
  url: "https://tanishkajangir.com",
  location: "New Delhi, India",
  school: "B.Tech Network Engineering & Security · DSEU · 2024 — 2028",
  eyebrow: "Full-stack engineer · Network security undergrad",

  // Rendered client-side from parts so scrapers don't lift it from the HTML.
  email: { user: "tanishkajangir26", domain: "gmail.com" },

  links: {
    linkedin: "https://www.linkedin.com/in/tanishka-jangir",
    github: "https://github.com/TanishkaJ26",
    resume: "/resume.pdf",
  },

  /** The hero tagline. The second half is the part that gets emphasis. */
  tagline: {
    lead: "Building production software — and studying what happens",
    emphasis: "between the request and the response.",
  },

  /** The three mono readouts along the bottom of the hero. */
  readouts: [
    "B.Tech Network Eng. & Security · DSEU · 2024—28",
    "Next.js · TypeScript · Node · PostgreSQL",
    "Open to internships",
  ],
} as const;

export const nav = [
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "stack", label: "Stack" },
  { id: "contact", label: "Contact" },
] as const;
