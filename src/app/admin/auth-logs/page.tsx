import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, CheckCircle2, Clock, LockKeyhole, Search, ShieldAlert } from 'lucide-react'
import { getAuthEventsForAdmin, type AuthEvent } from '@/lib/auth/auth-event-log'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Auth logs - Admin',
  description: 'Monitor customer login, signup, OAuth, and password reset events.',
}

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function getParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key]
  return Array.isArray(value) ? value[0] || '' : value || ''
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function eventLabel(type: AuthEvent['type']) {
  return type.replace(/_/g, ' ')
}

function statusClass(status: AuthEvent['status']) {
  if (status === 'success') return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300'
  if (status === 'blocked') return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300'
  return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300'
}

function eventMatches(event: AuthEvent, query: string, status: string, provider: string) {
  if (status && event.status !== status) return false
  if (provider && event.provider !== provider) return false
  if (!query) return true

  const haystack = [
    event.id,
    event.email || '',
    event.reason,
    event.message,
    event.path || '',
    event.ip || '',
    event.userAgent || '',
  ].join(' ').toLowerCase()

  return haystack.includes(query.toLowerCase())
}

export default async function AdminAuthLogsPage({ searchParams }: PageProps) {
  const params = (await searchParams) || {}
  const query = getParam(params, 'q').trim()
  const status = getParam(params, 'status').trim()
  const provider = getParam(params, 'provider').trim()

  const events = await getAuthEventsForAdmin(300)
  const filteredEvents = events.filter((event) => eventMatches(event, query, status, provider))
  const failures = events.filter((event) => event.status === 'failure').length
  const blocked = events.filter((event) => event.status === 'blocked').length
  const successes = events.filter((event) => event.status === 'success').length
  const lastEvent = events[0]

  const stats = [
    { label: 'Success', value: successes, icon: CheckCircle2, className: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300' },
    { label: 'Failures', value: failures, icon: AlertTriangle, className: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-300' },
    { label: 'Blocked', value: blocked, icon: LockKeyhole, className: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-300' },
    { label: 'Last event', value: lastEvent ? formatDate(lastEvent.createdAt) : '-', icon: Clock, className: 'text-primary-600 bg-primary-50 dark:bg-primary-950/30 dark:text-primary-300' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="ds-h1">Auth logs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track login, signup, OAuth, password reset, and sign-out events. Ask users for the Error ID shown on the auth screen.
          </p>
        </div>
        <Link href="/admin/users" className="ds-btn ds-btn-secondary ds-btn-sm self-start sm:self-auto">
          View users
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="ds-card">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                </div>
                <span className={cn('inline-flex h-10 w-10 items-center justify-center rounded-xl', stat.className)}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <form className="ds-card grid gap-3 md:grid-cols-[1fr_180px_180px_auto]" action="/admin/auth-logs">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search email, Error ID, reason, IP..."
            className="ds-input pl-10"
          />
        </label>
        <select name="status" defaultValue={status} className="ds-input">
          <option value="">All statuses</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
          <option value="blocked">Blocked</option>
        </select>
        <select name="provider" defaultValue={provider} className="ds-input">
          <option value="">All providers</option>
          <option value="email">Email</option>
          <option value="google">Google</option>
          <option value="github">GitHub</option>
          <option value="oauth">OAuth</option>
          <option value="unknown">Unknown</option>
        </select>
        <button className="ds-btn ds-btn-primary" type="submit">Filter</button>
      </form>

      {filteredEvents.length === 0 ? (
        <div className="ds-card py-16 text-center">
          <ShieldAlert className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium">No auth events found</p>
          <p className="mt-1 text-xs text-muted-foreground">New login and registration activity will appear here.</p>
        </div>
      ) : (
        <div className="ds-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Event</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                  <th className="hidden px-4 py-3 text-left font-semibold text-muted-foreground md:table-cell">User</th>
                  <th className="hidden px-4 py-3 text-left font-semibold text-muted-foreground lg:table-cell">Reason</th>
                  <th className="hidden px-4 py-3 text-left font-semibold text-muted-foreground xl:table-cell">Context</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="align-top hover:bg-accent/30">
                    <td className="px-4 py-3">
                      <div className="font-semibold capitalize">{eventLabel(event.type)}</div>
                      <div className="mt-1 font-mono text-[11px] text-muted-foreground">{event.id}</div>
                      <div className="mt-1 text-xs capitalize text-muted-foreground md:hidden">{event.provider}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-xs font-bold capitalize', statusClass(event.status))}>
                        {event.status}
                      </span>
                      <div className="mt-2 text-xs capitalize text-muted-foreground">{event.provider}</div>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <div className="max-w-[220px] truncate text-muted-foreground">{event.email || '-'}</div>
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <div className="font-medium">{event.reason}</div>
                      <div className="mt-1 max-w-[320px] text-xs leading-5 text-muted-foreground">{event.message}</div>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-muted-foreground xl:table-cell">
                      <div>{event.country || '-'} / {event.ip || '-'}</div>
                      <div className="mt-1 max-w-[260px] truncate">{event.path || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDate(event.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}