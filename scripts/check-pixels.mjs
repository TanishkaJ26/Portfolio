/**
 * Proves every grid in lib/pixel-art.ts is rectangular and uses only known
 * characters. A sprite with one short row renders sheared rather than
 * erroring, which is the kind of bug you stop seeing after a day — so it is
 * cheaper to fail the build than to notice it in a screenshot.
 *
 * Run: npm run check:pixels  (also runs as part of `npm run lint`-adjacent
 * checks in CI; it needs no build step, it just reads the source.)
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(here, "../lib/pixel-art.ts"), "utf8");

const ALLOWED = new Set([".", "#", "o", "+", "O", "="]);

// Every art row in the file is a quoted string of grid characters on its own
// line; anything else (identifiers, comments, the TECH map) has characters
// outside the set and is skipped.
const rows = [];
let name = "?";
let group = [];
let line = 0;

const flush = () => {
  if (group.length === 0) return;
  rows.push({ name, lines: group });
  group = [];
};

for (const raw of source.split("\n")) {
  line += 1;
  const text = raw.trim();
  const match = /^"([.#o+O=]+)",?$/.exec(text);

  if (match) {
    group.push({ art: match[1], line });
    continue;
  }

  flush();

  const label = /^(?:export const )?([A-Za-z_][A-Za-z0-9_]*)\s*(?::|=)/.exec(
    text,
  );
  if (label) name = label[1];
}
flush();

const problems = [];

for (const sprite of rows) {
  const width = sprite.lines[0].art.length;

  for (const { art, line: at } of sprite.lines) {
    if (art.length !== width) {
      problems.push(
        `${sprite.name}: line ${at} is ${art.length} wide, expected ${width}`,
      );
    }
    for (const ch of art) {
      if (!ALLOWED.has(ch)) {
        problems.push(`${sprite.name}: line ${at} has unknown character "${ch}"`);
      }
    }
  }
}

if (rows.length === 0) {
  console.error("check-pixels: found no sprites — did the file move?");
  process.exit(1);
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}

const cells = rows.reduce(
  (sum, s) => sum + s.lines.length * s.lines[0].art.length,
  0,
);
console.log(
  `check-pixels: ${rows.length} sprites, ${cells} cells — all rectangular.`,
);
