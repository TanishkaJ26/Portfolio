/**
 * The site's visual language, drawn rather than typed.
 *
 * All of it is one idea — a network topology — rendered a step quieter than
 * the hairlines so it never competes with the text. Server components: these
 * are static SVG, no client JS. The one exception is the hero, where the same
 * graph is drawn live on canvas (see `components/hero/routing-canvas.tsx`).
 */

type Positioned = {
  className?: string;
  /** Inline positioning, since these are placed per-section. */
  style?: React.CSSProperties;
};

const NODES: ReadonlyArray<readonly [number, number]> = [
  [80, 120],
  [240, 60],
  [560, 90],
  [160, 280],
  [320, 300],
  [500, 260],
  [90, 440],
  [280, 470],
  [600, 480],
];

const EDGES: ReadonlyArray<readonly [number, number, number, number]> = [
  [80, 120, 240, 60],
  [240, 60, 380, 140],
  [380, 140, 560, 90],
  [80, 120, 160, 280],
  [160, 280, 320, 300],
  [320, 300, 380, 140],
  [380, 140, 500, 260],
  [500, 260, 560, 90],
  [160, 280, 90, 440],
  [90, 440, 280, 470],
  [280, 470, 320, 300],
  [280, 470, 440, 420],
  [440, 420, 500, 260],
  [440, 420, 600, 480],
  [500, 260, 600, 480],
  [320, 300, 440, 420],
];

/** The full topology. Used large, behind the hero and the case-study panel. */
export function NodeGraph({ className, style }: Positioned) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 640 560"
      className={className}
      style={style}
    >
      <g stroke="var(--line-lit)" strokeWidth={1} strokeOpacity={0.85}>
        {EDGES.map(([x1, y1, x2, y2]) => (
          <line
            key={`${x1}-${y1}-${x2}-${y2}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
          />
        ))}
      </g>
      <g fill="var(--line-lit)">
        {NODES.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={3} />
        ))}
      </g>
      {/* The two lit nodes — the only pink in the pattern. */}
      <circle cx={380} cy={140} r={4} fill="var(--pink)" />
      <circle
        cx={380}
        cy={140}
        r={18}
        fill="none"
        stroke="var(--pink)"
        strokeWidth={1}
        strokeOpacity={0.35}
        strokeDasharray="3 5"
      />
      <circle cx={440} cy={420} r={4} fill="var(--pink)" />
      <circle cx={352} cy={220} r={2.5} fill="var(--pink-soft)" />
    </svg>
  );
}

/** A small six-node fragment, sized to sit inside an image placeholder. */
export function NodeGraphMark({ className, style }: Positioned) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 160 70"
      className={className}
      style={style}
    >
      <g stroke="var(--line-lit)" strokeWidth={1}>
        <line x1={12} y1={50} x2={52} y2={16} />
        <line x1={52} y1={16} x2={100} y2={40} />
        <line x1={100} y1={40} x2={148} y2={12} />
        <line x1={52} y1={16} x2={70} y2={58} />
        <line x1={70} y1={58} x2={100} y2={40} />
        <line x1={100} y1={40} x2={130} y2={60} />
      </g>
      <g fill="var(--line-lit)">
        <circle cx={12} cy={50} r={2.5} />
        <circle cx={52} cy={16} r={2.5} />
        <circle cx={148} cy={12} r={2.5} />
        <circle cx={70} cy={58} r={2.5} />
        <circle cx={130} cy={60} r={2.5} />
      </g>
      <circle cx={100} cy={40} r={3.5} fill="var(--pink)" />
    </svg>
  );
}

type RingsProps = Positioned & {
  /** Radii, outermost last. The last one is drawn dashed. */
  radii?: readonly number[];
  /** Adds the crosshair through the centre. */
  crosshair?: boolean;
};

/** Concentric rings, centred off-canvas and clipped by the section. */
export function Rings({
  className,
  style,
  radii = [90, 170, 250, 315],
  crosshair = false,
}: RingsProps) {
  const outer = radii[radii.length - 1] ?? 0;
  const size = outer * 2 + 10;
  const c = size / 2;

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={style}
    >
      <g fill="none" stroke="var(--line)" strokeWidth={1}>
        {radii.map((r, i) => (
          <circle
            key={r}
            cx={c}
            cy={c}
            r={r}
            strokeDasharray={i === radii.length - 1 ? "3 7" : undefined}
          />
        ))}
        {crosshair ? (
          <>
            <line x1={c} y1={5} x2={c} y2={size - 5} />
            <line x1={5} y1={c} x2={size - 5} y2={c} />
          </>
        ) : null}
      </g>
      <circle
        cx={c}
        cy={c - (radii[1] ?? outer)}
        r={3}
        fill="var(--pink)"
      />
    </svg>
  );
}

/** Nested ellipses — a contour map. Sits behind the work index. */
export function Contours({ className, style }: Positioned) {
  const rings: ReadonlyArray<readonly [number, number]> = [
    [120, 80],
    [190, 130],
    [260, 180],
    [330, 230],
    [400, 280],
  ];

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 760 520"
      className={className}
      style={style}
    >
      <g fill="none" stroke="var(--line)" strokeWidth={1}>
        {rings.map(([rx, ry], i) => (
          <ellipse
            key={rx}
            cx={380}
            cy={260}
            rx={rx}
            ry={ry}
            strokeDasharray={i === rings.length - 1 ? "3 7" : undefined}
          />
        ))}
      </g>
      <circle cx={380} cy={260} r={3} fill="var(--pink)" />
    </svg>
  );
}

/** The soft pink bloom. One per screen, at most. */
export function Wash({ className, style }: Positioned) {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        background:
          "radial-gradient(circle, var(--pink-wash) 0%, rgba(11,10,16,0) 62%)",
        filter: "blur(30px)",
        ...style,
      }}
    />
  );
}
