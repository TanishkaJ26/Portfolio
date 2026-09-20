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
  };
  links: { demo?: string; repo?: string };
};

export type TimelineEntry = {
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
