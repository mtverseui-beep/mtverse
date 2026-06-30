'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SelectOption = {
  value: string
  label: string
}

type Props = {
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  ariaLabel?: string
}

export function ModernSelect({
  value,
  options,
  onChange,
  className,
  placeholder = 'Select...',
  ariaLabel,
}: Props) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    function handleScroll(event: Event) {
      const target = event.target as Node | null
      if (target && menuRef.current?.contains(target)) return
      setOpen(false)
    }
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true })
    return () => window.removeEventListener('scroll', handleScroll, { capture: true })
  }, [open])

  useEffect(() => {
    if (!open) return
    function handlePointer(e: MouseEvent) {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      ) {
        return
      }
      setOpen(false)
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={cn(
          'inline-flex h-11 items-center justify-between gap-2 rounded-full border bg-background px-4 text-sm font-medium shadow-xs transition-all',
          open
            ? 'border-primary-400 ring-2 ring-primary-400/20'
            : 'border-border hover:border-primary-300',
          className
        )}
      >
        <span className={cn('truncate', !selected && 'text-muted-foreground')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="listbox"
          className="absolute right-0 sm:left-0 top-full z-[10000] mt-2 min-w-full max-h-[min(320px,48vh)] overflow-y-auto rounded-2xl border bg-popover p-1.5 shadow-lg [scrollbar-width:thin] animate-in fade-in-0 zoom-in-95 duration-150"
          style={{ width: 'max-content', maxWidth: 'min(320px, calc(100vw - 2rem))' }}
        >
          {options.map((opt) => {
            const isActive = opt.value === value
            return (
              <button
                key={opt.value}
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors whitespace-nowrap',
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-foreground hover:bg-accent'
                )}
              >
                <span className="truncate">{opt.label}</span>
                {isActive && <Check className="h-4 w-4 shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}