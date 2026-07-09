'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Code2, Loader2, Palette, Send, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'

const FRAMEWORK_OPTIONS = ['HTML', 'React', 'Next.js', 'Vue.js', 'Angular', 'Laravel', 'Custom'] as const
const STYLING_OPTIONS = ['No preference', 'Tailwind CSS', 'Bootstrap', 'shadcn/ui', 'Material UI', 'Plain CSS', 'SCSS', 'Custom'] as const

type FrameworkOption = (typeof FRAMEWORK_OPTIONS)[number]
type StylingOption = (typeof STYLING_OPTIONS)[number]

type Props = {
  slug: string
  title: string
}

type SubmitState = 'idle' | 'submitting' | 'sent'

export function TemplateFrameworkRequest({ slug, title }: Props) {
  const { user, authenticated } = useAuth()
  const [framework, setFramework] = useState<FrameworkOption>('React')
  const [customFramework, setCustomFramework] = useState('')
  const [styling, setStyling] = useState<StylingOption>('Tailwind CSS')
  const [customStyling, setCustomStyling] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [error, setError] = useState('')
  const [stylingMenuOpen, setStylingMenuOpen] = useState(false)
  const stylingMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (authenticated && user?.email) setEmail(user.email)
  }, [authenticated, user?.email])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!stylingMenuRef.current?.contains(event.target as Node)) setStylingMenuOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setStylingMenuOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])



  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError('Enter a valid email address.')
      return
    }

    if (framework === 'Custom' && !customFramework.trim()) {
      setError('Tell us the custom framework you want.')
      return
    }

    if (styling === 'Custom' && !customStyling.trim()) {
      setError('Tell us the custom styling setup you want.')
      return
    }

    setSubmitState('submitting')

    try {
      const response = await fetch(`/api/templates/${encodeURIComponent(slug)}/framework-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: cleanEmail,
          framework,
          customFramework,
          styling,
          customStyling,
          message,
        }),
      })
      const data = (await response.json()) as { success?: boolean; error?: string; message?: string; duplicate?: boolean }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Request failed. Please try again.')
      }

      setSubmitState('sent')
      toast.success(data.duplicate ? 'Request already in admin inbox' : 'Request sent', {
        description: data.message || `We will review your request and email you with the next step.`,
      })
    } catch (requestError) {
      const messageText = requestError instanceof Error ? requestError.message : 'Request failed. Please try again.'
      setError(messageText)
      setSubmitState('idle')
      toast.error(messageText)
    }
  }

  return (
    <section className="mt-4 rounded-2xl border border-border/80 bg-gradient-to-br from-background via-primary-50/40 to-accent-50/60 p-4 shadow-sm dark:from-background dark:via-primary-950/20 dark:to-accent-950/20 sm:mt-5 sm:p-5">
      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-xs font-bold text-primary-700 shadow-sm dark:text-primary-300">
            <Sparkles className="h-3.5 w-3.5" />
            Custom stack request
          </span>
          <div>
            <h2 className="text-lg font-bold tracking-tight sm:text-xl">Need this template in another stack?</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Request {title} in HTML, React, Vue, Laravel, or your own custom stack. If we build your requested version, it stays at the same template price.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
            {['Admin reviewed', 'Same template price', 'Custom build request'].map((item) => (
              <div key={item} className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-background/70 px-2.5 py-2 font-medium text-muted-foreground">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-border/70 bg-background/90 p-3 shadow-sm sm:p-4">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Framework</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {FRAMEWORK_OPTIONS.map((option) => {
                  const active = framework === option
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFramework(option)}
                      className={cn(
                        'inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-sm font-semibold transition-all',
                        active
                          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      )}
                    >
                      {option === 'Custom' ? <Code2 className="h-3.5 w-3.5" /> : null}
                      {option}
                    </button>
                  )
                })}
              </div>
              {framework === 'Custom' ? (
                <input
                  value={customFramework}
                  onChange={(event) => setCustomFramework(event.target.value)}
                  placeholder="Example: SvelteKit, Astro, Django, Rails"
                  className="ds-input mt-3"
                  maxLength={80}
                />
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor={`request-email-${slug}`}>Email</label>
                <input
                  id={`request-email-${slug}`}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="ds-input"
                  disabled={authenticated && Boolean(user?.email)}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor={`request-styling-${slug}`}>Styling preference</label>
                <div ref={stylingMenuRef} className="relative">
                  <button
                    id={`request-styling-${slug}`}
                    type="button"
                    onClick={() => setStylingMenuOpen((open) => !open)}
                    className="flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 text-left text-sm font-medium text-foreground shadow-sm transition-all hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                    aria-haspopup="listbox"
                    aria-expanded={stylingMenuOpen}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Palette className="h-4 w-4 shrink-0 text-primary-600" />
                      <span className="truncate">{styling}</span>
                    </span>
                    <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', stylingMenuOpen && 'rotate-180')} />
                  </button>
                  {stylingMenuOpen ? (
                    <div role="listbox" className="absolute left-0 right-0 z-30 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-border/70 bg-popover p-1.5 shadow-xl ring-1 ring-black/5">
                      {STYLING_OPTIONS.map((option) => {
                        const active = styling === option
                        return (
                          <button
                            key={option}
                            type="button"
                            role="option"
                            aria-selected={active}
                            onClick={() => {
                              setStyling(option)
                              setStylingMenuOpen(false)
                            }}
                            className={cn(
                              'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors',
                              active
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                          >
                            <span>{option}</span>
                            {active ? <Check className="h-4 w-4" /> : null}
                          </button>
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {styling === 'Custom' ? (
              <input
                value={customStyling}
                onChange={(event) => setCustomStyling(event.target.value)}
                placeholder="Example: Chakra UI, Ant Design, CSS Modules"
                className="ds-input"
                maxLength={80}
              />
            ) : null}

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor={`request-message-${slug}`}>Extra details <span className="text-muted-foreground">(optional)</span></label>
              <textarea
                id={`request-message-${slug}`}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Tell us what pages, backend, or UI library you need."
                className="ds-input min-h-20 resize-none"
                maxLength={600}
              />
            </div>

            {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">{error}</p> : null}

            <button type="submit" disabled={submitState !== 'idle'} className="ds-btn ds-btn-primary w-full">
              {submitState === 'submitting' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending request...
                </>
              ) : submitState === 'sent' ? (
                <>
                  <Check className="h-4 w-4" />
                  Request sent
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Request this version
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}