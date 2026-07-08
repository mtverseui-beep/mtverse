import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Bookmark, PackageCheck, Users } from 'lucide-react'
import { getCustomerUsersForAdmin } from '@/lib/auth/customer-store'
import { getDashboardKits } from '@/lib/dashboard-kit-store'
import { getAllPlans } from '@/lib/plan-store'
import { getTemplateUserSummariesForAdmin } from '@/lib/template-social-store'

export const metadata: Metadata = {
  title: 'Users - Admin',
  description: 'View registered customers, purchases, and saved templates',
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

  const visible = slugs.slice(0, 4)
  const hiddenCount = Math.max(0, slugs.length - visible.length)

  return (
    <div className="flex max-w-[420px] flex-wrap gap-1.5">
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

    return {
      email,
      name: customer?.name || email.split('@')[0],
      image: customer?.image || null,
      provider: customer?.provider || (plan?.provider ? 'payment' : 'access'),
      createdAt: customer?.createdAt || plan?.createdAt || summary?.updatedAt || '',
      lastSeenAt: customer?.lastSeenAt || null,
      plan,
      purchaseSlugs,
      savedCount: summary?.savedTemplateSlugs.length || 0,
    }
  }).sort((left, right) => (right.createdAt || '').localeCompare(left.createdAt || ''))

  const purchaseUserCount = rows.filter((row) => row.purchaseSlugs.length > 0).length
  const savedUserCount = rows.filter((row) => row.savedCount > 0).length
  const licensedUserCount = rows.filter((row) => Boolean(row.plan)).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="ds-h1">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {rows.length} user/access records / {purchaseUserCount} buyers / {licensedUserCount} licenses / {savedUserCount} saved users
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
          <div className="mb-1 text-xs text-muted-foreground">Licenses</div>
          <div className="text-2xl font-bold text-blue-600">{licensedUserCount}</div>
        </div>
        <div className="ds-card">
          <div className="mb-1 text-xs text-muted-foreground">Saved users</div>
          <div className="text-2xl font-bold text-violet-600">{savedUserCount}</div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="ds-card py-16 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium">No users yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Email, Google, GitHub, purchases, and saved templates will appear here.</p>
        </div>
      ) : (
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
      )}
    </div>
  )
}