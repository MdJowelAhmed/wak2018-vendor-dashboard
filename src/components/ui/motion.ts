import type { Transition, Variants } from 'framer-motion'

export const easeOutExpo: Transition['ease'] = [0.16, 1, 0.3, 1]

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: easeOutExpo },
  },
}

export const staggerContainer = (stagger = 0.07, delay = 0.04): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    },
  },
})

export const hoverLift = {
  whileHover: { y: -4, scale: 1.02 },
  transition: { duration: 0.25, ease: easeOutExpo },
} as const

