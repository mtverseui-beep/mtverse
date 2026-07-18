'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Loader2, Mail } from 'lucide-react'
import { toast } from 'sonner'

export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading || subscribed) return
    setLoading(true)

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not subscribe.')
      setSubscribed(true)
      toast.success(data.message || 'Subscription confirmed')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not subscribe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="border-y border-border bg-background">
      <div className="ds-container grid gap-7 py-10 sm:py-12 lg:grid-cols-[1fr_minmax(360px,520px)] lg:items-center">
        <div className="max-w-xl">
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase text-primary">
            <Mail className="h-4 w-4" />
            Template releases
          </div>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">New templates, useful updates, no filler.</h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
            Get occasional updates when new dashboard, ecommerce, landing page, and HTML templates are ready.
          </p>
        </div>

        {subscribed ? (
          <div className="flex min-h-12 items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200" aria-live="polite">
            <Check className="h-5 w-5 shrink-0" />
            You are subscribed. Check your inbox for confirmation.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-12 min-w-0 flex-1 rounded-lg border border-border bg-card px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
              />
              <input
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                className="absolute -left-[10000px] h-px w-px opacity-0"
                name="website"
              />
              <button type="submit" disabled={loading} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              Unsubscribe anytime. See our <Link href="/privacy" className="font-medium text-foreground underline underline-offset-2">privacy policy</Link>.
            </p>
          </form>
        )}
      </div>
    </section>
  )
}
