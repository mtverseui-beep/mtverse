'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnOverlayClick?: boolean
  showCloseButton?: boolean
}

const SIZE_CLASSES: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  size = 'lg',
  closeOnOverlayClick = true,
  showCloseButton = true,
}: ModalProps) {
  const [mounted, setMounted] = React.useState(false)
  const titleId = React.useId()
  const descId = React.useId()
  const panelRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onOpenChange(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.requestAnimationFrame(() => {
      panelRef.current?.focus()
    })

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
      previouslyFocused?.focus?.()
    }
  }, [open, onOpenChange])

  if (!mounted || !open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
    >
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-sm animate-in fade-in-0 duration-150"
        onClick={() => {
          if (closeOnOverlayClick) onOpenChange(false)
        }}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          'relative z-10 w-full max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-2xl border border-gray-200 bg-background p-6 shadow-xl shadow-gray-900/[0.08] outline-none dark:border-white/10 dark:shadow-black/30',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          SIZE_CLASSES[size],
          className,
        )}
      >
        {(title || showCloseButton) && (
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              {title ? (
                <h2 id={titleId} className="text-lg font-semibold leading-tight text-foreground">
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p id={descId} className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
            {showCloseButton ? (
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Close dialog"
                className="-mr-2 -mt-2 inline-flex size-8 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  )
}

