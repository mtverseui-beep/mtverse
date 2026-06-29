/**
 * Motion utility helpers for consistent animation patterns.
 * Uses Framer Motion variants and transition presets.
 */

import type { Variants, Transition } from 'framer-motion'

/** Default spring transition */
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
}

/** Gentle ease transition */
export const easeTransition: Transition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1],
}

/** Fade-in animation variant */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: easeTransition },
}

/** Slide up + fade variant */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: easeTransition },
}

/** Scale-in variant */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: springTransition },
}

/** Stagger children container */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}
