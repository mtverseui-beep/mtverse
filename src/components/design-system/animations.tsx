'use client'

/**
 * Animation utilities built on top of framer-motion.
 * Reveal-on-scroll, staggered children, magnetic buttons, marquee, parallax.
 */

import { motion, useScroll, useTransform, useReducedMotion, type Variants } from 'framer-motion'
import { useRef, useState, type ReactNode, type MouseEvent } from 'react'
import { cn } from '@/lib/utils'

/* ─── Reveal on scroll ───────────────────────────────────────── */

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  once?: boolean
  as?: 'div' | 'section' | 'article' | 'li' | 'span'
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  once = true,
  as = 'div',
}: RevealProps) {
  const reduce = useReducedMotion()
  const MotionTag = motion[as]
  return (
    <MotionTag
      className={className}
      initial={reduce ? undefined : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  )
}

/* ─── Stagger container + child ─────────────────────────────── */

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

type StaggerProps = {
  children: ReactNode
  className?: string
  once?: boolean
  stagger?: number
}

export function Stagger({ children, className, once = true, stagger = 0.08 }: StaggerProps) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: stagger, delayChildren: 0.04 } },
      }}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: '-80px' }}
    >
      {children}
    </motion.div>
  )
}

type StaggerItemProps = {
  children: ReactNode
  className?: string
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      variants={staggerItem}
    >
      {children}
    </motion.div>
  )
}

/* ─── Magnetic button (subtle mouse-follow) ─────────────────── */

type MagneticProps = {
  children: ReactNode
  className?: string
  strength?: number
}

export function Magnetic({ children, className, strength = 0.3 }: MagneticProps) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    if (reduce || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - (rect.left + rect.width / 2)) * strength
    const y = (e.clientY - (rect.top + rect.height / 2)) * strength
    setPos({ x, y })
  }

  function handleLeave() {
    setPos({ x: 0, y: 0 })
  }

  return (
    <motion.div
      ref={ref}
      className={cn('inline-block', className)}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 250, damping: 18, mass: 0.6 }}
    >
      {children}
    </motion.div>
  )
}

/* ─── Parallax (subtle vertical drift on scroll) ────────────── */

type ParallaxProps = {
  children: ReactNode
  className?: string
  speed?: number // positive = moves up slower, negative = moves down
}

export function Parallax({ children, className, speed = 0.3 }: ParallaxProps) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${-speed * 100}%`])

  if (reduce) return <div className={className} ref={ref}>{children}</div>

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  )
}

/* ─── Marquee (infinite horizontal scroll) ──────────────────── */

type MarqueeProps = {
  children: ReactNode
  className?: string
  reverse?: boolean
  speed?: 'slow' | 'normal' | 'fast'
  pauseOnHover?: boolean
}

export function Marquee({
  children,
  className,
  reverse,
  speed = 'normal',
  pauseOnHover = true,
}: MarqueeProps) {
  const speedClass =
    speed === 'slow' ? 'ds-marquee-slow' : speed === 'fast' ? 'ds-marquee-fast' : ''
  return (
    <div className={cn('group relative flex overflow-hidden', className)}>
      <div
        className={cn(
          'ds-marquee',
          reverse && 'ds-marquee-reverse',
          speedClass,
          pauseOnHover && 'group-hover:[animation-play-state:paused]'
        )}
      >
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  )
}
