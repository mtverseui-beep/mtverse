'use client'

import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { trackPromptEvent } from '@/components/prompts/promptAnalytics'
import { cn } from '@/lib/utils'

async function writePromptToClipboard(prompt: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(prompt)
      return true
    } catch {
      // Fall through to the textarea copy path for browsers that block clipboard writes.
    }
  }

  const textarea = document.createElement('textarea')
  textarea.value = prompt
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.inset = '0 auto auto 0'
  textarea.style.opacity = '0'

  document.body.appendChild(textarea)
  textarea.select()
  textarea.setSelectionRange(0, textarea.value.length)

  try {
    return document.execCommand('copy')
  } finally {
    textarea.remove()
  }
}

/**
 * Premium copy-prompt button used on every prompt card and prompt detail page.
 *
 * Design tokens:
 * - Premium outline button styling with brand accent on copied state
 * - Smooth 200ms color + background transition
 * - Active scale 0.97 for tactile feedback
 * - A11y: aria-live="polite" announces copy state to screen readers
 * - Motion-reduce safe
 */
export default function CopyPromptButton({
  prompt,
  className,
  eventProperties,
}: {
  prompt: string
  className?: string
  eventProperties?: Record<string, string | number | boolean>
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(id)
  }, [copied])

  return (
    <button
      type="button"
      onClick={async () => {
        const didCopy = await writePromptToClipboard(prompt)
        if (didCopy) {
          setCopied(true)
          trackPromptEvent('Prompt Copied', eventProperties)
        }
      }}
      aria-live="polite"
      data-copied={copied ? 'true' : 'false'}
      className={cn(
        'inline-flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100',
        copied
          ? 'border-primary/30 bg-primary/5 text-primary dark:border-primary/20 dark:bg-primary/10'
          : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800',
        className
      )}
    >
      {copied ? (
        <Check className="h-4 w-4 text-primary" aria-hidden="true" />
      ) : (
        <Copy className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      )}
      {copied ? 'Copied' : 'Copy Prompt'}
    </button>
  )
}
