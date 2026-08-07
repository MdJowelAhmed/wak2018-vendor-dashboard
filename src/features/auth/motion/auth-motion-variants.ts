import type { Variants } from "framer-motion";

export const authEase = [0.25, 0.1, 0.25, 1] as const;

/** Full auth shell entrance */
export const authPageLoadTransition = { duration: 0.4, ease: authEase };

/** Left illustration panel */
export const authIllustrationVariants: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.42, ease: authEase, delay: 0.05 },
  },
};

/** Right column (form area) first paint */
export const authFormColumnVariants: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.42, ease: authEase, delay: 0.05 },
  },
};

/** Card inside pages */
export const authCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.36, ease: authEase, delay: 0.1 },
  },
};

/** Route step (AnimatePresence) */
export const authRouteStepVariants: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.28, ease: authEase },
  },
  exit: {
    opacity: 0,
    x: -12,
    transition: { duration: 0.22, ease: authEase },
  },
};

export const authInputShakeTransition = { duration: 0.38, ease: authEase };

export const authInputFocusClass =
  "transition-[box-shadow,border-color] duration-200 focus-visible:border-[#895129]/45 focus-visible:ring-2 focus-visible:ring-[#895129]/25 focus-visible:ring-offset-0";

export const authButtonMotionProps = {
  whileHover: {
    scale: 1.03,
    transition: { duration: 0.18, ease: "easeOut" as const },
  },
  whileTap: { scale: 0.97, transition: { duration: 0.14 } },
};

export const authOtpCellFocusProps = {
  whileFocus: {
    scale: 1.05,
    transition: { duration: 0.18, ease: "easeOut" as const },
  },
  whileTap: { scale: 0.98, transition: { duration: 0.12 } },
};
