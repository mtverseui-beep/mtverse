'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Copy, Heart, Loader2, LockKeyhole, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { trackPromptEvent } from '@/components/prompts/promptAnalytics'
import { cn } from '@/lib/utils'

type PromptActionsProps = {
  slug: string
  title: string
  summary: string
}

const LOCKED_PROMPT_PLACEHOLDER = [
  'Create a polished AI result with a detailed subject, visual style, lighting, camera angle, and output constraints.',
  'Add context, mood, composition notes, model guidance, aspect ratio, and final quality instructions.',
  'Sign in to reveal the full copy-ready prompt and save it to your mtverse account.',
].join('\n\n')

async function writePromptToClipboard(prompt: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(prompt)
      return true
    } catch {
      // Fall back to textarea copy for restricted clipboard contexts.
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

export default function PromptActions({ slug, title, summary }: PromptActionsProps) {
  const router = useRouter()
  const { authenticated, loading: authLoading } = useAuth()
  const [promptText, setPromptText] = useState('')
  const [contentLoading, setContentLoading] = useState(false)
  const [contentError, setContentError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(id)
  }, [copied])

  useEffect(() => {
    let cancelled = false

    if (authLoading) return

    if (!authenticated) {
      setPromptText('')
      setSaved(false)
      setContentError(null)
      setContentLoading(false)
      return
    }

    async function loadPromptState() {
      setContentLoading(true)
      setContentError(null)

      try {
        const [contentResponse, saveResponse] = await Promise.all([
          fetch(`/api/prompts/${encodeURIComponent(slug)}/content`, { credentials: 'include' }),
          fetch(`/api/prompts/${encodeURIComponent(slug)}/save`, { credentials: 'include' }),
        ])
        const contentPayload = (await contentResponse.json().catch(() => null)) as { prompt?: string; error?: string } | null
        const savePayload = (await saveResponse.json().catch(() => null)) as { saved?: boolean } | null

        if (cancelled) return

        if (!contentResponse.ok || !contentPayload?.prompt) {
          setPromptText('')
          setContentError(contentPayload?.error || 'Prompt could not be loaded. Please refresh and try again.')
        } else {
          setPromptText(contentPayload.prompt)
          setContentError(null)
        }

        setSaved(Boolean(saveResponse.ok && savePayload?.saved))
      } catch {
        if (!cancelled) {
          setPromptText('')
          setSaved(false)
          setContentError('Network error while loading this prompt.')
        }
      } finally {
        if (!cancelled) setContentLoading(false)
      }
    }

    void loadPromptState()

    return () => {
      cancelled = true
    }
  }, [authenticated, authLoading, slug])

  function goToSignIn(action: string) {
    toast.info(action)
    router.push(`/sign-in?next=/prompts/${encodeURIComponent(slug)}`)
  }

  async function handleCopy() {
    if (!authenticated) {
      goToSignIn('Please sign in to view and copy prompts')
      return
    }

    if (!promptText) {
      toast.error(contentError || 'Prompt is still loading')
      return
    }

    const didCopy = await writePromptToClipboard(promptText)
    if (didCopy) {
      setCopied(true)
      trackPromptEvent('Prompt Copied', { slug, source: 'detail_prompt_panel' })
      toast.success('Prompt copied')
    }
  }

  async function handleSave() {
    if (!authenticated) {
      goToSignIn('Please sign in to save prompts')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/prompts/${encodeURIComponent(slug)}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ saved: !saved }),
      })
      const payload = (await response.json().catch(() => null)) as { saved?: boolean; error?: string } | null

      if (!response.ok || !payload) {
        throw new Error(payload?.error || 'Prompt could not be saved')
      }

      setSaved(Boolean(payload.saved))
      toast.success(payload.saved ? 'Saved to your account' : 'Removed from saved prompts')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Prompt could not be saved')
    } finally {
      setSaving(false)
    }
  }

  function handleShare() {
    const shareUrl = window.location.href

    if (navigator.share) {
      navigator.share({ title, text: summary, url: shareUrl }).catch(() => undefined)
      return
    }

    navigator.clipboard.writeText(shareUrl)
      .then(() => toast.success('Prompt link copied'))
      .catch(() => toast.error('Could not copy link'))
  }

  const locked = !authLoading && !authenticated
  const promptVisible = authenticated && promptText && !contentLoading

  return (
    <div className="mt-5 overflow-hidden rounded-md border border-slate-900 bg-slate-950 text-white shadow-lg shadow-slate-950/10 dark:border-slate-800 dark:bg-black">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-3 py-2.5 sm:px-4 sm:py-3">
        <div>
          <h2 className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-300 sm:text-xs sm:tracking-[0.18em]">Prompt</h2>
          <p className="mt-1 text-[11px] font-medium text-slate-500">Sign in required to reveal and copy</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={authLoading || saving}
            className={cn(
              'inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border px-3 text-xs font-black transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70',
              saved
                ? 'border-rose-400/30 bg-rose-500/15 text-rose-100'
                : 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'
            )}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={cn('h-4 w-4', saved && 'fill-current')} />}
            {saved ? 'Saved' : 'Save'}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 text-xs font-black text-slate-200 transition hover:bg-white/10 active:scale-[0.97]"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={authLoading || contentLoading}
            aria-live="polite"
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-white bg-white px-3 text-xs font-black text-slate-950 transition hover:bg-slate-100 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {contentLoading || authLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : copied ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="relative">
        {promptVisible ? (
          <pre className="modern-scrollbar max-h-[260px] overflow-auto px-3 py-3 pr-2 text-[12px] leading-6 text-slate-100 sm:max-h-[380px] sm:px-4 sm:py-4 sm:pr-3 sm:text-sm sm:leading-7">
            <code className="whitespace-pre-wrap break-words">{promptText}</code>
          </pre>
        ) : (
          <div className="relative min-h-[240px] overflow-hidden sm:min-h-[320px]">
            <pre
              aria-hidden="true"
              className="pointer-events-none select-none px-3 py-3 pr-2 text-[12px] leading-6 text-slate-100 blur-[5px] sm:px-4 sm:py-4 sm:pr-3 sm:text-sm sm:leading-7"
            >
              <code className="whitespace-pre-wrap break-words">{LOCKED_PROMPT_PLACEHOLDER}</code>
            </pre>
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-[2px]">
              <div className="max-w-sm rounded-xl border border-white/15 bg-white/10 p-5 text-center shadow-2xl shadow-black/30">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-950">
                  {contentLoading || authLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LockKeyhole className="h-5 w-5" />}
                </div>
                <h3 className="text-base font-black text-white">
                  {authLoading || contentLoading ? 'Checking access...' : 'Sign in to view this prompt'}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {contentError || 'The preview stays locked until you sign in. After that you can view, copy, save, and return to it from your account.'}
                </p>
                {locked ? (
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
                    <button
                      type="button"
                      onClick={() => goToSignIn('Please sign in to view prompts')}
                      className="inline-flex h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-black text-slate-950 transition hover:bg-slate-100"
                    >
                      Sign in
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push(`/sign-up?next=/prompts/${encodeURIComponent(slug)}`)}
                      className="inline-flex h-10 items-center justify-center rounded-md border border-white/20 px-4 text-sm font-black text-white transition hover:bg-white/10"
                    >
                      Create account
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}