import type { Metadata } from 'next'
import Link from 'next/link'
import { Code2, Inbox, Layers, Palette, Sparkles } from 'lucide-react'
import { getTemplateFrameworkRequests, getTemplateFrameworkRequestStats } from '@/lib/template-framework-request-store'

export const metadata: Metadata = {
  title: 'Template Requests - Admin',
  description: 'Review audience requests for alternate framework versions of paid templates.',
}

export const dynamic = 'force-dynamic'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function frameworkLabel(request: { framework: string; customFramework?: string }) {
  return request.framework === 'Custom' ? request.customFramework || 'Custom' : request.framework
}

function stylingLabel(request: { styling: string; customStyling?: string }) {
  return request.styling === 'Custom' ? request.customStyling || 'Custom' : request.styling
}

export default async function AdminTemplateRequestsPage() {
  const [requests, stats] = await Promise.all([
    getTemplateFrameworkRequests(100).catch(() => []),
    getTemplateFrameworkRequestStats().catch(() => ({
      total: 0,
      newCount: 0,
      customCount: 0,
      uniqueTemplates: 0,
      lastSevenDays: 0,
      frameworkCounts: [],
      stylingCounts: [],
    })),
  ])

  const statCards = [
    { label: 'Total requests', value: stats.total, icon: Inbox, tone: 'text-primary-600 bg-primary-50 dark:bg-primary-950/30 dark:text-primary-300' },
    { label: 'New inbox', value: stats.newCount, icon: Sparkles, tone: 'text-violet-600 bg-violet-50 dark:bg-violet-950/30 dark:text-violet-300' },
    { label: 'Custom types', value: stats.customCount, icon: Code2, tone: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-300' },
    { label: 'Templates requested', value: stats.uniqueTemplates, icon: Layers, tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="ds-h1">Template Requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Audience requests for alternate framework and styling versions of paid templates.
          </p>
        </div>
        <div className="rounded-full border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground">
          {stats.lastSevenDays} received in the last 7 days
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="ds-card">
              <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${stat.tone}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="ds-card">
          <div className="mb-4 flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary-600" />
            <h2 className="ds-h3">Framework demand</h2>
          </div>
          {stats.frameworkCounts.length ? (
            <div className="space-y-2">
              {stats.frameworkCounts.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl border bg-background px-3 py-2 text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">{item.count}</span>
                </div>
              ))}
            </div>
          ) : <p className="py-6 text-center text-sm text-muted-foreground">No framework requests yet.</p>}
        </div>

        <div className="ds-card">
          <div className="mb-4 flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary-600" />
            <h2 className="ds-h3">Styling demand</h2>
          </div>
          {stats.stylingCounts.length ? (
            <div className="space-y-2">
              {stats.stylingCounts.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl border bg-background px-3 py-2 text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">{item.count}</span>
                </div>
              ))}
            </div>
          ) : <p className="py-6 text-center text-sm text-muted-foreground">No styling requests yet.</p>}
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="ds-card py-16 text-center">
          <Inbox className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium">No template requests yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Paid template pages will send framework requests here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <article key={request.id} className="ds-card">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-700 dark:bg-primary-950/30 dark:text-primary-300">
                      {frameworkLabel(request)}
                    </span>
                    <span className="rounded-full border px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                      {stylingLabel(request)}
                    </span>
                    {request.framework === 'Custom' || request.styling === 'Custom' ? (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">Custom</span>
                    ) : null}
                  </div>
                  <div>
                    <h2 className="text-base font-bold">{request.templateTitle}</h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{request.email}</span>
                      <span>{formatDate(request.createdAt)}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 font-semibold">{request.status}</span>
                    </div>
                  </div>
                  {request.message ? <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{request.message}</p> : null}
                </div>
                <Link href={`/templates/${request.slug}`} className="ds-btn ds-btn-secondary ds-btn-sm shrink-0">
                  View template
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}