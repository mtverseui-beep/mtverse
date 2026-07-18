import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  once?: boolean
  as?: 'div' | 'section' | 'article' | 'li' | 'span'
}

export function Reveal({ children, className, as: Tag = 'div' }: RevealProps) {
  return <Tag className={className}>{children}</Tag>
}

export const staggerContainer = {}
export const staggerItem = {}

type StaggerProps = {
  children: ReactNode
  className?: string
  once?: boolean
  stagger?: number
}

export function Stagger({ children, className }: StaggerProps) {
  return <div className={className}>{children}</div>
}

type StaggerItemProps = {
  children: ReactNode
  className?: string
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return <div className={className}>{children}</div>
}

type MagneticProps = {
  children: ReactNode
  className?: string
  strength?: number
}

export function Magnetic({ children, className }: MagneticProps) {
  return <div className={className}>{children}</div>
}

type ParallaxProps = {
  children: ReactNode
  className?: string
  speed?: number
}

export function Parallax({ children, className }: ParallaxProps) {
  return <div className={className}>{children}</div>
}

type MarqueeProps = {
  children: ReactNode
  className?: string
  reverse?: boolean
  speed?: 'slow' | 'normal' | 'fast'
  pauseOnHover?: boolean
}

export function Marquee({ children, className }: MarqueeProps) {
  return <div className={cn('relative overflow-hidden', className)}>{children}</div>
}
