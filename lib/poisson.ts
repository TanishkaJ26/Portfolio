/**
 * Poisson-disc sampling (Bridson). Gives organic point distributions — points
 * never cluster and never grid, which is what makes the hero graph read as a
 * topology rather than a pattern.
 */
export type Point = { x: number; y: number };

export function poissonDisc(
  width: number,
  height: number,
  minDist: number,
  maxPoints: number,
  rng: () => number = Math.random,
  k = 24,
): Point[] {
  const cell = minDist / Math.SQRT2;
  const cols = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);
  const grid: (Point | null)[] = new Array(cols * rows).fill(null);

  const samples: Point[] = [];
  const active: Point[] = [];

  const gridIndex = (p: Point) =>
    Math.floor(p.y / cell) * cols + Math.floor(p.x / cell);

  const fits = (p: Point): boolean => {
    if (p.x < 0 || p.y < 0 || p.x >= width || p.y >= height) return false;
    const gx = Math.floor(p.x / cell);
    const gy = Math.floor(p.y / cell);

    for (let y = Math.max(0, gy - 2); y <= Math.min(rows - 1, gy + 2); y++) {
      for (let x = Math.max(0, gx - 2); x <= Math.min(cols - 1, gx + 2); x++) {
        const other = grid[y * cols + x];
        if (!other) continue;
        const dx = other.x - p.x;
        const dy = other.y - p.y;
        if (dx * dx + dy * dy < minDist * minDist) return false;
      }
    }
    return true;
  };

  const seed: Point = { x: rng() * width, y: rng() * height };
  samples.push(seed);
  active.push(seed);
  grid[gridIndex(seed)] = seed;

  while (active.length > 0 && samples.length < maxPoints) {
    const i = Math.floor(rng() * active.length);
    const origin = active[i];
    if (!origin) break;

    let placed = false;
    for (let attempt = 0; attempt < k; attempt++) {
      const angle = rng() * Math.PI * 2;
      const radius = minDist * (1 + rng());
      const candidate: Point = {
        x: origin.x + Math.cos(angle) * radius,
        y: origin.y + Math.sin(angle) * radius,
      };
      if (!fits(candidate)) continue;

      samples.push(candidate);
      active.push(candidate);
      grid[gridIndex(candidate)] = candidate;
      placed = true;
      break;
    }

    if (!placed) active.splice(i, 1);
  }

  return samples;
}

/** Deterministic PRNG (mulberry32) so the graph is identical across reloads. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
