import type { Transition } from "motion/react";

/**
 * Motion tokens. Entrances are fast-out / slow-settle — never linear, never
 * bounce. Nothing runs longer than `epic`, and only the hero canvas gets that.
 */
export const ease = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.83, 0, 0.17, 1],
} as const;

export const spring: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 30,
  mass: 0.8,
};

export const dur = { fast: 0.25, base: 0.6, slow: 1.1, epic: 1.8 } as const;

/** Stagger between siblings. 40–60ms. 200ms feels sluggish. */
export const stagger = { tight: 0.035, base: 0.045, loose: 0.06 } as const;

/** Shared viewport config so every scroll-triggered reveal fires alike. */
export const inView = { once: true, margin: "-12% 0px" } as const;
