import type { GlyphName } from "@/lib/pixel-art";

export type Beat = {
  label: string;
  heading: string;
  body: string;
};

export type Project = {
  slug: string;
  index: string;
  title: string;
  subtitle: string;
  year: string;
  stack: readonly string[];
  summary: string;
  beats: readonly [Beat, Beat, Beat];
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
    /** True until a real screenshot exists; the frame stands in for it. */
    pending?: boolean;
    /**
     * The pixel-art scene drawn in place of the screenshot while `pending`.
     * Named rather than imported so the content layer stays data-only.
     */
    scene?: "spotlight" | "wanderlust";
  };
  links: { demo?: string; repo?: string };
};

export type TimelineEntry = {
  /** Pixel glyph for the timeline node. */
  icon: GlyphName;
  org: string;
  role: string;
  period: string;
  meta?: string;
  detail: string;
};

export type StackGroup = {
  label: string;
  items: readonly string[];
};

export type Stat = {
  label: string;
  value: string;
  icon: GlyphName;
};
