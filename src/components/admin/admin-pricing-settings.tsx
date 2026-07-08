'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Copy, Loader2, Mail, Save, Sparkles, XCircle } from 'lucide-react'

import type { PricingCtaSettings } from '@/lib/pricing-settings-store'
import { cn } from '@/lib/utils'

type EmailTemplatePreview = {
  subject: string
  preheader: string
  html: string
  text: string
  pricingUrl: string
  templatesUrl: string
}

type Props = {
  initialSettings: PricingCtaSettings
  emailTemplate: EmailTemplatePreview
}

type StatusMessage = { type: 'success' | 'error'; message: string } | null

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
      {hint ? <span className="text-[11px] leading-4 text-muted-foreground">{hint}</span> : null}
    </label>
  )
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('ds-input', props.className)} />
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn('ds-input min-h-28 resize-y py-2 leading-6', props.className)} />
}

function CodeBlock({ title, value }: { title: string; value: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold">{title}</h3>
        <button type="button" onClick={copy} className="ds-btn ds-btn-secondary h-8 px-3 text-xs">
          <Copy className="h-3.5 w-3.5" />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="max-h-72 overflow-auto rounded-xl bg-muted/50 p-3 text-xs leading-5 text-muted-foreground"><code>{value}</code></pre>
    </div>
  )
}

export function AdminPricingSettings({ initialSettings, emailTemplate }: Props) {
  const router = useRouter()
  const [settings, setSettings] = useState(initialSettings)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<StatusMessage>(null)

  function update<K extends keyof PricingCtaSettings>(key: K, value: PricingCtaSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }))
  }

  async function save() {
    setSaving(true)
    setStatus(null)
    try {
      const response = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })
      const data = (await response.json()) as { success?: boolean; error?: string; settings?: PricingCtaSettings }
      if (!response.ok || !data.success || !data.settings) throw new Error(data.error || 'Pricing CTA save failed')
      setSettings(data.settings)
      setStatus({ type: 'success', message: 'Pricing CTA and email copy updated.' })
      router.refresh()
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Pricing CTA save failed' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black">Pricing CTA</h2>
            <p className="mt-1 text-sm text-muted-foreground">Controls the $149 all-paid bundle card and email offer copy.</p>
          </div>
        </div>

        {status ? (
          <div className={cn('mb-5 flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold', status.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-100' : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-100')}>
            {status.type === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
            <span>{status.message}</span>
          </div>
        ) : null}

        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Badge"><TextInput value={settings.badge} onChange={(event) => update('badge', event.target.value)} /></Field>
            <Field label="Title"><TextInput value={settings.title} onChange={(event) => update('title', event.target.value)} /></Field>
          </div>
          <Field label="Pricing card description"><TextArea value={settings.description} onChange={(event) => update('description', event.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Button label"><TextInput value={settings.buttonLabel} onChange={(event) => update('buttonLabel', event.target.value)} /></Field>
            <Field label="Secondary link label"><TextInput value={settings.secondaryLabel} onChange={(event) => update('secondaryLabel', event.target.value)} /></Field>
          </div>

          <div className="my-1 h-px bg-border" />

          <Field label="Email subject"><TextInput value={settings.emailSubject} onChange={(event) => update('emailSubject', event.target.value)} /></Field>
          <Field label="Email preheader"><TextInput value={settings.emailPreheader} onChange={(event) => update('emailPreheader', event.target.value)} /></Field>
          <Field label="Email headline"><TextInput value={settings.emailHeadline} onChange={(event) => update('emailHeadline', event.target.value)} /></Field>
          <Field label="Email body" hint="Do not mention the $5 HTML unlock here; this email is only for the paid templates bundle."><TextArea value={settings.emailBody} onChange={(event) => update('emailBody', event.target.value)} /></Field>
        </div>

        <div className="mt-6 flex justify-end">
          <button type="button" onClick={save} disabled={saving} className="ds-btn ds-btn-primary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save pricing CTA'}
          </button>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-start gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black">Email Template</h2>
              <p className="mt-1 text-sm text-muted-foreground">Use this for paid-template bundle campaigns. It includes the pricing and templates links.</p>
            </div>
          </div>
          <div className="grid gap-3 rounded-2xl border border-border bg-muted/30 p-4 text-sm">
            <p><span className="font-bold">Pricing:</span> <a className="text-primary underline-offset-4 hover:underline" href={emailTemplate.pricingUrl} target="_blank" rel="noreferrer">{emailTemplate.pricingUrl}</a></p>
            <p><span className="font-bold">Templates:</span> <a className="text-primary underline-offset-4 hover:underline" href={emailTemplate.templatesUrl} target="_blank" rel="noreferrer">{emailTemplate.templatesUrl}</a></p>
          </div>
        </div>

        <CodeBlock title="Subject" value={emailTemplate.subject} />
        <CodeBlock title="Preheader" value={emailTemplate.preheader} />
        <CodeBlock title="Plain text email" value={emailTemplate.text} />
        <CodeBlock title="HTML email" value={emailTemplate.html} />
      </section>
    </div>
  )
}