'use client'

import { useState } from 'react'
import { Mail, Send, Check, Clock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Reveal } from '@/components/design-system/animations'
import { Blob } from '@/components/design-system/backgrounds'
import { SOCIAL_EMAIL } from '@/lib/site-social'

export default function ContactClient() {
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [referenceId, setReferenceId] = useState('')
  const [website, setWebsite] = useState('')
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, website }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not send your message.')
      setReferenceId(data.referenceId || '')
      setSubmitted(true)
      toast.success('Message sent')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not send your message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="min-h-screen ds-bg-section relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10">
        <Blob variant="lavender" size={500} position={{ top: '-10%', left: '-10%' }} float="slow" />
        <Blob variant="peach" size={400} position={{ bottom: '-10%', right: '-10%' }} float="normal" />
      </div>

      <div className="ds-container py-12 sm:py-16">
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <span className="ds-eyebrow ds-eyebrow-accent mb-4">
                <Mail className="h-3.5 w-3.5" />
                Contact
              </span>
              <h1 className="ds-display-2 mb-3">Get in touch</h1>
              <p className="ds-lead">
                Questions, feedback, or partnership ideas? Send us a message and we&apos;ll respond within 24 hours.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="ds-card flex items-center gap-3">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Email</div>
                  <a href={`mailto:${SOCIAL_EMAIL}`} className="text-sm font-medium hover:underline">{SOCIAL_EMAIL}</a>
                </div>
              </div>
              <div className="ds-card flex items-center gap-3">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Response time</div>
                  <div className="text-sm font-medium">Within 24 hours</div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="ds-card p-6 sm:p-8">
              {submitted ? (
                <div className="text-center py-8 space-y-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 mx-auto">
                    <Check className="h-6 w-6" />
                  </div>
                  <h2 className="ds-h3">Message sent!</h2>
                  <p className="text-sm text-muted-foreground">
                    Thanks for reaching out. We&apos;ll get back to you within 24 hours.
                  </p>
                  {referenceId ? <p className="text-xs font-medium text-muted-foreground">Reference: {referenceId}</p> : null}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" htmlFor="name">Name</label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Jane Doe"
                        className="ds-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" htmlFor="email">Email</label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com"
                        className="ds-input"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" htmlFor="subject">Subject</label>
                    <input
                      id="subject"
                      type="text"
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="How can we help?"
                      className="ds-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      required
                      rows={6}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us more..."
                      className="ds-input resize-none"
                    />
                  </div>
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                    className="absolute -left-[10000px] h-px w-px opacity-0"
                    name="website"
                  />
                  <button type="submit" disabled={sending} className="ds-btn ds-btn-primary w-full">
                    {sending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </main>
  )
}
