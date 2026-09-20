import type { StackGroup } from "@/types";

export const stack: readonly StackGroup[] = [
  { label: "Languages", items: ["C++", "Python", "TypeScript", "JavaScript", "SQL"] },
  { label: "Frontend", items: ["React", "Next.js 15", "Tailwind", "Redux Toolkit"] },
  { label: "Backend", items: ["Node.js", "Express", "REST APIs", "Prisma"] },
  { label: "Data", items: ["PostgreSQL", "MongoDB", "Neon"] },
  { label: "Systems", items: ["Computer Networks", "Network Security", "DSA", "OOP"] },
  { label: "Tools", items: ["Git", "Linux/Bash", "Vercel", "Docker", "Stripe", "VAPI"] },
];
