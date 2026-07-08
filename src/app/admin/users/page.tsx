import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Archive, Bookmark, Download, PackageCheck, Unlock, Users } from 'lucide-react'
import { getCustomerUsersForAdmin } from '@/lib/auth/customer-store'
import { getDashboardKits } from '@/lib/dashboard-kit-store'
import { getAllPlans } from '@/lib/plan-store'
import { getTemplateUserSummariesForAdmin } from '@/lib/template-social-store'

export const metadata: Metadata = {
  title: 'Users - Admin',
  description: 'View registered customers, purchases, downloads, and saved templates',
}

export const dynamic = 'force-dynamic'

const DEFAULT_USER_AVATAR = '/default-3d-avatar.jpg'

type PlanRow = Awaited<ReturnType<typeof getAllPlans>>[number]
type TemplateUserSummaryRow = Awaited<ReturnType<typeof getTemplateUserSummariesForAdmin>>[number]
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
    <div className="flex max-w-[360px] flex-wrap gap-1.5">
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
      {hiddenCount ? (
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">+{hiddenCount}</span>
      ) : null}
    </div>
  )
}

function CompactDownloadList({ downloads, titles, empty }: { downloads: DownloadItem[]; titles: Map<string, string>; empty: string }) {
  if (!downloads.length) return <span className="text-xs text-muted-foreground">{empty}</span>

  const visible = downloads.slice(0, 3)
  const hiddenCount = Math.max(0, downloads.length - visible.length)

  return (
    <div className="flex max-w-[420px] flex-wrap gap-1.5">
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
      {hiddenCount ? (
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">+{hiddenCount}</span>
      ) : null}
    </div>
  )
}

export default async function AdminUsersPage() {
  const [customers, plans, templateSummaries, kits] = await Promise.all([
    getCustomerUsersForAdmin().catch(() => []),
    getAllPlans().catch(() => []),
    getTemplateUserSummariesForAdmin().catch(() => []),
    getDashboardKits().catch(() => []),
  ])

  const customerByEmail = new Map(customers.map((user) => [user.email, user] as const))
  const planByEmail = new Map<string, PlanRow>(plans.map((plan) => [plan.email, plan] as const))
  const summaryByEmail = new Map<string, TemplateUserSummaryRow>(templateSummaries.map((summary) => [summary.email, summary] as const))
  const kitTitles = new Map<string, string>(kits.map((kit) => [kit.slug, kit.shortTitle || kit.title] as const))
  const emails = new Set<string>([
    ...customers.map((user) => user.email),
    ...plans.map((plan) => plan.email),
    ...templateSummaries.map((summary) => summary.email),
  ])

  const rows = Array.from(emails).map((email) => {
    const customer = customerByEmail.get(email)
    const plan = planByEmail.get(email)
    const summary = summaryByEmail.get(email)
    const purchaseSlugs = summary?.purchases.map((purchase) => purchase.slug) || []
    const paidDownloads = summary?.downloads || []
    const freeDownloadSlugs = summary?.freeDownloadSlugs || []
    const htmlBundleDownload = summary?.htmlBundleDownloads || null

    return {
      email,
      name: customer?.name || email.split('@')[0],
      image: customer?.image || null,
      provider: customer?.provider || (plan?.provider ? 'payment' : 'access'),
      createdAt: customer?.createdAt || plan?.createdAt || summary?.updatedAt || '',
      lastSeenAt: customer?.lastSeenAt || null,
      plan,
      summary,
      purchaseSlugs,
      paidDownloads,
      freeDownloadSlugs,
      htmlBundleDownload,
      savedCount: summary?.savedTemplateSlugs.length || 0,
    }
  }).sort((left, right) => (right.createdAt || '').localeCompare(left.createdAt || ''))

  const downloadRows = rows
    .map((row) => {
      const paidDownloadCount = row.paidDownloads.reduce((sum, download) => sum + download.count, 0)
      const htmlBundleDownloadCount = row.htmlBundleDownload?.count || 0
      const latestDownloadAt = latestDate([
        ...row.paidDownloads.map((download) => download.lastDownloadedAt),
        row.htmlBundleDownload?.lastDownloadedAt,
        row.summary?.freeUnlockedAt,
        row.freeDownloadSlugs.length ? row.summary?.updatedAt : null,
      ])

      return {
        ...row,
        paidDownloadCount,
        htmlBundleDownloadCount,
        latestDownloadAt,
        hasDownloadActivity: paidDownloadCount > 0 || row.freeDownloadSlugs.length > 0 || htmlBundleDownloadCount > 0 || Boolean(row.summary?.freeUnlocked),
      }
    })
    .filter((row) => row.hasDownloadActivity)
    .sort((left, right) => (right.latestDownloadAt || '').localeCompare(left.latestDownloadAt || ''))

  const purchaseUserCount = rows.filter((row) => row.purchaseSlugs.length > 0).length
  const downloadUserCount = downloadRows.length
  const paidZipDownloadCount = downloadRows.reduce((sum, row) => sum + row.paidDownloadCount, 0)
  const freeTemplateDownloadCount = rows.reduce((sum, row) => sum + row.freeDownloadSlugs.length, 0)
  const htmlUnlockedCount = rows.filter((row) => row.summary?.freeUnlocked).length
  const htmlBundleDownloadCount = downloadRows.reduce((sum, row) => sum + row.htmlBundleDownloadCount, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="ds-h1">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {rows.length} user/access records / {purchaseUserCount} buyers / {downloadUserCount} download records / {htmlUnlockedCount} HTML unlocks
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="ds-card">
          <div className="mb-1 text-xs text-muted-foreground">Total records</div>
          <div className="text-2xl font-bold">{rows.length}</div>
        </div>
        <div className="ds-card">
          <div className="mb-1 text-xs text-muted-foreground">Buyers</div>
          <div className="text-2xl font-bold text-emerald-600">{purchaseUserCount}</div>
        </div>
        <div className="ds-card">
          <div className="mb-1 text-xs text-muted-foreground">Download users</div>
          <div className="text-2xl font-bold text-blue-600">{downloadUserCount}</div>
        </div>
        <div className="ds-card">
          <div className="mb-1 text-xs text-muted-foreground">HTML bundle</div>
          <div className="text-2xl font-bold text-violet-600">{htmlBundleDownloadCount}</div>
          <div className="mt-1 text-xs text-muted-foreground">{htmlUnlockedCount} unlocked</div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="ds-card py-16 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium">No users yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Email, Google, GitHub, purchases, and downloads will appear here.</p>
        </div>
      ) : (
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Accounts & purchases</h2>
            <p className="text-sm text-muted-foreground">Registered users, active plans, exact template purchases, and saved templates.</p>
          </div>
          <div className="ds-card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">User</th>
                    <th className="hidden px-4 py-3 text-left font-semibold text-muted-foreground md:table-cell">Plan</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Purchased</th>
                    <th className="hidden px-4 py-3 text-left font-semibold text-muted-foreground lg:table-cell">Saved</th>
                    <th className="hidden px-4 py-3 text-left font-semibold text-muted-foreground xl:table-cell">Last seen</th>
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
                            <div className="mt-1 flex flex-wrap gap-1 md:hidden">
                              <span className="inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize text-muted-foreground">{user.provider}</span>
                              {user.plan ? <span className="ds-badge ds-badge-primary capitalize">{user.plan.plan}</span> : null}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        {user.plan ? (
                          <div className="space-y-1">
                            <span className="ds-badge ds-badge-primary capitalize">{user.plan.plan}</span>
                            <div className="text-xs text-muted-foreground">{user.plan.packageId || 'package'} / {user.plan.provider || 'mock'}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No license</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            <PackageCheck className="h-3.5 w-3.5" />
                            {user.purchaseSlugs.length} template{user.purchaseSlugs.length === 1 ? '' : 's'}
                          </div>
                          <CompactTemplateList slugs={user.purchaseSlugs} titles={kitTitles} empty="No purchases" />
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Bookmark className="h-3.5 w-3.5" />
                          {user.savedCount}
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-muted-foreground xl:table-cell">{formatDate(user.lastSeenAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-lg font-semibold">Downloads</h2>
            <p className="text-sm text-muted-foreground">Only users with paid downloads, free template downloads, or $5 HTML bundle activity.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border bg-background px-3 py-1">Paid ZIPs: {paidZipDownloadCount}</span>
            <span className="rounded-full border bg-background px-3 py-1">Free templates: {freeTemplateDownloadCount}</span>
            <span className="rounded-full border bg-background px-3 py-1">HTML unlocks: {htmlUnlockedCount}</span>
            <span className="rounded-full border bg-background px-3 py-1">HTML bundles: {htmlBundleDownloadCount}</span>
          </div>
        </div>

        {downloadRows.length === 0 ? (
          <div className="ds-card py-12 text-center">
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
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Paid downloads</th>
                    <th className="hidden px-4 py-3 text-left font-semibold text-muted-foreground lg:table-cell">Free templates</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">HTML bundle</th>
                    <th className="hidden px-4 py-3 text-left font-semibold text-muted-foreground xl:table-cell">Last activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {downloadRows.map((user) => (
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
                            <Download className="h-3.5 w-3.5" />
                            {user.paidDownloadCount} ZIP download{user.paidDownloadCount === 1 ? '' : 's'}
                          </div>
                          <CompactDownloadList downloads={user.paidDownloads} titles={kitTitles} empty="No paid downloads" />
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-muted-foreground">{user.freeDownloadSlugs.length} free template{user.freeDownloadSlugs.length === 1 ? '' : 's'}</div>
                          <CompactTemplateList slugs={user.freeDownloadSlugs} titles={kitTitles} empty="No free downloads" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          {user.summary?.freeUnlocked ? (
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
                          {user.summary?.freeUnlockedAt ? <div className="text-xs text-muted-foreground">Unlocked {formatDate(user.summary.freeUnlockedAt)}</div> : null}
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
      </section>
    </div>
  )
}