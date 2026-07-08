import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Download, PackageCheck, Users } from 'lucide-react'
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

function formatDate(value: string | null | undefined) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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

export default async function AdminUsersPage() {
  const [customers, plans, templateSummaries, kits] = await Promise.all([
    getCustomerUsersForAdmin().catch(() => []),
    getAllPlans().catch(() => []),
    getTemplateUserSummariesForAdmin().catch(() => []),
    getDashboardKits().catch(() => []),
  ])

  const planByEmail = new Map<string, PlanRow>(plans.map((plan) => [plan.email, plan] as const))
  const summaryByEmail = new Map<string, TemplateUserSummaryRow>(templateSummaries.map((summary) => [summary.email, summary] as const))
  const kitTitles = new Map<string, string>(kits.map((kit) => [kit.slug, kit.shortTitle || kit.title] as const))
  const emails = new Set<string>([
    ...customers.map((user) => user.email),
    ...plans.map((plan) => plan.email),
    ...templateSummaries.map((summary) => summary.email),
  ])

  const rows = Array.from(emails).map((email) => {
    const customer = customers.find((user) => user.email === email)
    const plan = planByEmail.get(email)
    const summary = summaryByEmail.get(email)
    const purchaseSlugs = summary?.purchases.map((purchase) => purchase.slug) || []
    const paidDownloadSlugs = summary?.downloads.map((download) => download.slug) || []
    const freeDownloadSlugs = summary?.freeDownloadSlugs || []

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
      paidDownloadSlugs,
      freeDownloadSlugs,
      savedCount: summary?.savedTemplateSlugs.length || 0,
    }
  }).sort((left, right) => (right.createdAt || '').localeCompare(left.createdAt || ''))

  const purchaseUserCount = rows.filter((row) => row.purchaseSlugs.length > 0).length
  const paidDownloadUserCount = rows.filter((row) => row.paidDownloadSlugs.length > 0).length
  const freeDownloadCount = rows.reduce((sum, row) => sum + row.freeDownloadSlugs.length, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="ds-h1">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {rows.length} users/access records / {purchaseUserCount} buyers / {paidDownloadUserCount} paid download users / {freeDownloadCount} free downloads
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="ds-card">
          <div className="text-xs text-muted-foreground mb-1">Total records</div>
          <div className="text-2xl font-bold">{rows.length}</div>
        </div>
        <div className="ds-card">
          <div className="text-xs text-muted-foreground mb-1">Buyers</div>
          <div className="text-2xl font-bold text-emerald-600">{purchaseUserCount}</div>
        </div>
        <div className="ds-card">
          <div className="text-xs text-muted-foreground mb-1">Paid download users</div>
          <div className="text-2xl font-bold text-blue-600">{paidDownloadUserCount}</div>
        </div>
        <div className="ds-card">
          <div className="text-xs text-muted-foreground mb-1">Free downloads</div>
          <div className="text-2xl font-bold text-violet-600">{freeDownloadCount}</div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="ds-card py-16 text-center">
          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium">No users yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Email, Google, GitHub, purchases, and downloads will appear here.
          </p>
        </div>
      ) : (
        <div className="ds-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Plan</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Purchased</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Downloads</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden xl:table-cell">Saved</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden xl:table-cell">Last seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((user) => (
                  <tr key={user.email} className="hover:bg-accent/30 transition-colors align-top">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                          <Image
                            src={user.image || DEFAULT_USER_AVATAR}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                            unoptimized
                          />
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{user.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                          <div className="mt-1 flex flex-wrap gap-1 md:hidden">
                            <span className="inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize text-muted-foreground">
                              {user.provider}
                            </span>
                            {user.plan ? <span className="ds-badge ds-badge-primary capitalize">{user.plan.plan}</span> : null}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
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
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                          <Download className="h-3.5 w-3.5" />
                          {user.paidDownloadSlugs.length} paid / {user.freeDownloadSlugs.length} free
                        </div>
                        <CompactTemplateList slugs={[...user.paidDownloadSlugs, ...user.freeDownloadSlugs]} titles={kitTitles} empty="No downloads" />
                        {user.summary?.freeUnlocked ? <span className="ds-badge ds-badge-success">HTML unlocked</span> : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-muted-foreground text-xs">
                      {user.savedCount}
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-muted-foreground text-xs">
                      {formatDate(user.lastSeenAt)}
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