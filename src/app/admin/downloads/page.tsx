import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Archive, Download, PackageCheck, Unlock } from 'lucide-react'
import { getCustomerUsersForAdmin } from '@/lib/auth/customer-store'
import { getDashboardKits } from '@/lib/dashboard-kit-store'
import { getTemplateUserSummariesForAdmin } from '@/lib/template-social-store'

export const metadata: Metadata = {
  title: 'Downloads - Admin',
  description: 'Audit paid template downloads, free downloads, and HTML bundle unlock activity',
}

export const dynamic = 'force-dynamic'

const DEFAULT_USER_AVATAR = '/default-3d-avatar.jpg'

type DownloadItem = { slug: string; count: number }

function formatDate(value: string | null | undefined) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function latestDate(values: Array<string | null | undefined>) {
  const timestamps = values
    .map((value) => (value ? Date.parse(value) : Number.NaN))
    .filter((value) => Number.isFinite(value))

  return timestamps.length ? new Date(Math.max(...timestamps)).toISOString() : ''
}

function titleForSlug(slug: string, titles: Map<string, string>) {
  return titles.get(slug) || slug
}

function CompactTemplateList({ slugs, titles, empty }: { slugs: string[]; titles: Map<string, string>; empty: string }) {
  if (!slugs.length) return <span className="text-xs text-muted-foreground">{empty}</span>

  const visible = slugs.slice(0, 3)
  const hiddenCount = Math.max(0, slugs.length - visible.length)

  return (
    <div className="flex max-w-[380px] flex-wrap gap-1.5">
      {visible.map((slug) => (
        <Link
          key={slug}
          href={`/templates/${slug}`}
          className="rounded-full border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary-300 hover:text-primary-700"
          title={slug}
        >
          {titleForSlug(slug, titles)}
        </Link>
      ))}
      {hiddenCount ? <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">+{hiddenCount}</span> : null}
    </div>
  )
}

function CompactDownloadList({ downloads, titles, empty }: { downloads: DownloadItem[]; titles: Map<string, string>; empty: string }) {
  if (!downloads.length) return <span className="text-xs text-muted-foreground">{empty}</span>

  const visible = downloads.slice(0, 3)
  const hiddenCount = Math.max(0, downloads.length - visible.length)

  return (
    <div className="flex max-w-[380px] flex-wrap gap-1.5">
      {visible.map((download) => (
        <Link
          key={download.slug}
          href={`/templates/${download.slug}`}
          className="rounded-full border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary-300 hover:text-primary-700"
          title={download.slug}
        >
          {titleForSlug(download.slug, titles)} x{download.count}
        </Link>
      ))}
      {hiddenCount ? <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">+{hiddenCount}</span> : null}
    </div>
  )
}

export default async function AdminDownloadsPage() {
  const [customers, templateSummaries, kits] = await Promise.all([
    getCustomerUsersForAdmin().catch(() => []),
    getTemplateUserSummariesForAdmin().catch(() => []),
    getDashboardKits().catch(() => []),
  ])

  const customerByEmail = new Map(customers.map((user) => [user.email, user] as const))
  const kitTitles = new Map<string, string>(kits.map((kit) => [kit.slug, kit.shortTitle || kit.title] as const))

  const rows = templateSummaries
    .map((summary) => {
      const customer = customerByEmail.get(summary.email)
      const purchaseSlugs = summary.purchases.map((purchase) => purchase.slug)
      const paidDownloadCount = summary.downloads.reduce((sum, download) => sum + download.count, 0)
      const paidBundleDownloadCount = summary.paidBundleDownloads?.count || 0
      const htmlBundleDownloadCount = summary.htmlBundleDownloads?.count || 0
      const latestDownloadAt = latestDate([
        ...summary.downloads.map((download) => download.lastDownloadedAt),
        summary.paidBundleDownloads?.lastDownloadedAt,
        summary.htmlBundleDownloads?.lastDownloadedAt,
        summary.freeUnlockedAt,
        summary.freeDownloadSlugs.length ? summary.updatedAt : null,
      ])

      return {
        email: summary.email,
        name: customer?.name || summary.email.split('@')[0],
        image: customer?.image || null,
        summary,
        purchaseSlugs,
        paidDownloadCount,
        paidBundleDownloadCount,
        htmlBundleDownloadCount,
        latestDownloadAt,
        hasDownloadActivity: paidDownloadCount > 0 || paidBundleDownloadCount > 0 || summary.freeDownloadSlugs.length > 0 || htmlBundleDownloadCount > 0 || summary.freeUnlocked,
      }
    })
    .filter((row) => row.hasDownloadActivity)
    .sort((left, right) => (right.latestDownloadAt || '').localeCompare(left.latestDownloadAt || ''))

  const paidZipDownloadCount = rows.reduce((sum, row) => sum + row.paidDownloadCount + row.paidBundleDownloadCount, 0)
  const freeTemplateDownloadCount = rows.reduce((sum, row) => sum + row.summary.freeDownloadSlugs.length, 0)
  const htmlUnlockedCount = rows.filter((row) => row.summary.freeUnlocked).length
  const htmlBundleDownloadCount = rows.reduce((sum, row) => sum + row.htmlBundleDownloadCount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="ds-h1">Downloads</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Users with paid ZIP downloads, free template downloads, or $5 HTML bundle activity.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="ds-card">
          <div className="mb-1 text-xs text-muted-foreground">Download users</div>
          <div className="text-2xl font-bold">{rows.length}</div>
        </div>
        <div className="ds-card">
          <div className="mb-1 text-xs text-muted-foreground">Paid ZIPs</div>
          <div className="text-2xl font-bold text-blue-600">{paidZipDownloadCount}</div>
        </div>
        <div className="ds-card">
          <div className="mb-1 text-xs text-muted-foreground">Free templates</div>
          <div className="text-2xl font-bold text-emerald-600">{freeTemplateDownloadCount}</div>
        </div>
        <div className="ds-card">
          <div className="mb-1 text-xs text-muted-foreground">HTML bundle</div>
          <div className="text-2xl font-bold text-violet-600">{htmlBundleDownloadCount}</div>
          <div className="mt-1 text-xs text-muted-foreground">{htmlUnlockedCount} unlocked</div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="ds-card py-16 text-center">
          <Download className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium">No downloads recorded yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Paid ZIPs, free templates, and HTML bundle downloads will appear here after users download.</p>
        </div>
      ) : (
        <div className="ds-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">User</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Purchased access</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Paid downloads</th>
                  <th className="hidden px-4 py-3 text-left font-semibold text-muted-foreground lg:table-cell">Free templates</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">HTML bundle</th>
                  <th className="hidden px-4 py-3 text-left font-semibold text-muted-foreground xl:table-cell">Last activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((user) => (
                  <tr key={user.email} className="align-top transition-colors hover:bg-accent/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                          <Image src={user.image || DEFAULT_USER_AVATAR} alt="" fill sizes="40px" className="object-cover" unoptimized />
                        </span>
                        <div className="min-w-0">
                          <div className="truncate font-medium">{user.name}</div>
                          <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                          <PackageCheck className="h-3.5 w-3.5" />
                          {user.purchaseSlugs.length} template{user.purchaseSlugs.length === 1 ? '' : 's'}
                        </div>
                        <CompactTemplateList slugs={user.purchaseSlugs} titles={kitTitles} empty="No paid access" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                          <Download className="h-3.5 w-3.5" />
                          {user.paidDownloadCount} ZIP download{user.paidDownloadCount === 1 ? '' : 's'}
                        </div>
                        {user.paidBundleDownloadCount > 0 ? (
                          <div className={'inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'}>
                            <Archive className={'h-3.5 w-3.5'} />
                            All-paid bundle x{user.paidBundleDownloadCount}
                          </div>
                        ) : null}
                        <CompactDownloadList downloads={user.summary.downloads} titles={kitTitles} empty="No paid downloads" />
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-muted-foreground">{user.summary.freeDownloadSlugs.length} free template{user.summary.freeDownloadSlugs.length === 1 ? '' : 's'}</div>
                        <CompactTemplateList slugs={user.summary.freeDownloadSlugs} titles={kitTitles} empty="No free downloads" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-2">
                        {user.summary.freeUnlocked ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                            <Unlock className="h-3.5 w-3.5" />
                            $5 unlocked
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not unlocked</span>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Archive className="h-3.5 w-3.5" />
                          {user.htmlBundleDownloadCount} bundle download{user.htmlBundleDownloadCount === 1 ? '' : 's'}
                        </div>
                        {user.summary.freeUnlockedAt ? <div className="text-xs text-muted-foreground">Unlocked {formatDate(user.summary.freeUnlockedAt)}</div> : null}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-muted-foreground xl:table-cell">{formatDate(user.latestDownloadAt)}</td>
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
