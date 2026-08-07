import type { Variants } from "framer-motion";

export const serviceEase = [0.25, 0.1, 0.25, 1] as const;

export const servicePageLoadTransition = { duration: 0.4, ease: serviceEase };

/** Top service card: scale + fade, slight delay */
export const serviceTopCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: serviceEase, delay: 0.1 },
  },
};

/** Bookings table block */
export const serviceTableSectionVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.36, ease: serviceEase, delay: 0.14 },
  },
};

export const serviceTableStaggerParentVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
};

export const serviceTableRowVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: serviceEase },
  },
};

/** Right column stat cards */
export const serviceStatsStaggerParentVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

export const serviceStatCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.32, ease: serviceEase },
  },
};

export const serviceCardHoverTransition = {
  duration: 0.2,
  ease: "easeOut" as const,
};

export const serviceStatCardHover = {
  whileHover: { y: -4, transition: serviceCardHoverTransition },
};
