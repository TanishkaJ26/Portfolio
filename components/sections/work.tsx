import { Contours } from "@/components/ui/patterns";
import { GLYPHS } from "@/lib/pixel-art";
import { Pixel } from "@/components/ui/pixel";
import { ProjectPanel } from "@/components/work/project-panel";
import { SectionHeader } from "@/components/ui/section-header";
import { projects } from "@/content/projects";

export function Work() {
  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="relative overflow-hidden py-24 sm:py-32"
    >
      <Contours className="pointer-events-none absolute -top-48 -right-44 hidden h-[520px] w-[760px] lg:block" />

      <div className="shell relative">
        <SectionHeader
          id="work-heading"
          index="01"
          label="Selected work"
          glyph="cube"
          heading="Two builds, and what broke."
          aside="2025 — 2026"
        />

        <div className="flex flex-col gap-20 lg:gap-28">
          {projects.map((project) => (
            <ProjectPanel key={project.slug} project={project} />
          ))}
        </div>

        <div className="label mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-text-mute">
          <span>
            Every build has a written “hard part” — the failure, the fix, what
            is still open.
          </span>
          <a
            href="https://github.com/TanishkaJ26"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 transition-colors hover:text-pink"
          >
            <Pixel art={GLYPHS.cat} className="h-3.5 w-3.5 shrink-0" />
            Source on GitHub ↗
          </a>
        </div>
      </div>
    </section>
  );
}
