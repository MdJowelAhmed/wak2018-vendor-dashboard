import type { Variants } from "framer-motion";

/** Primary easing — subtle, professional. */
export const customerEase = [0.25, 0.1, 0.25, 1] as const;

export const pageLoadTransition = { duration: 0.4, ease: customerEase };

export const cardHoverTransition = { duration: 0.2, ease: "easeOut" as const };

/** Parent: stagger stat / insight cards */
export const staggerParentVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
};

/** Each card: fade + scale */
export const staggerCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: customerEase },
  },
};

/** Delivery overview mini tiles */
export const staggerTileVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.28, ease: customerEase },
  },
};

export const staggerTilesParentVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

/** Timeline row — fade + slight L→R */
export const timelineItemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.08 + i * 0.055,
      duration: 0.32,
      ease: customerEase,
    },
  }),
};

export const buttonMotionProps = {
  whileHover: { scale: 1.03, transition: cardHoverTransition },
  whileTap: { scale: 0.97, transition: { duration: 0.15 } },
};
