import type { Metadata } from 'next'
import Link from 'next/link'
import { Receipt, ShoppingBag } from 'lucide-react'
import { getDashboardKits } from '@/lib/dashboard-kit-store'
import { getAllPlans } from '@/lib/plan-store'
import { getAllTemplatePurchases } from '@/lib/template-social-store'

export const metadata: Metadata = {
  title: 'Orders - Admin',
  description: 'View customer orders, direct template purchases, and license records',
}

export const dynamic = 'force-dynamic'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function AdminOrdersPage() {
  const [plans, templatePurchases, kits] = await Promise.all([
    getAllPlans().catch(() => []),
    getAllTemplatePurchases().catch(() => []),
    getDashboardKits().catch(() => []),
  ])

  const kitTitles = new Map<string, string>(kits.map((kit) => [kit.slug, kit.shortTitle || kit.title] as const))
  const activeCount = plans.filter((p) => p.status !== 'revoked').length
  const revokedCount = plans.filter((p) => p.status === 'revoked').length
  const paddleCount = plans.filter((p) => p.provider === 'paddle').length
  const directTemplateCount = templatePurchases.length
  const totalRecords = plans.length + directTemplateCount

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="ds-h1">Orders &amp; Access</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalRecords} total records / {directTemplateCount} direct template purchases / {activeCount} active licenses
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="ds-card">
          <div className="text-xs text-muted-foreground mb-1">Total records</div>
          <div className="text-2xl font-bold">{totalRecords}</div>
        </div>
        <div className="ds-card">
          <div className="text-xs text-muted-foreground mb-1">Template purchases</div>
          <div className="text-2xl font-bold text-blue-600">{directTemplateCount}</div>
        </div>
        <div className="ds-card">
          <div className="text-xs text-muted-foreground mb-1">Active licenses</div>
          <div className="text-2xl font-bold text-emerald-600">{activeCount}</div>
        </div>
        <div className="ds-card">
          <div className="text-xs text-muted-foreground mb-1">Paddle licenses</div>
          <div className="text-2xl font-bold text-violet-600">{paddleCount}</div>
        </div>
      </div>

      <section className="ds-card p-0 overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <div>
            <h2 className="text-sm font-bold">Direct template purchases</h2>
            <p className="text-xs text-muted-foreground">Single-template access records from the template purchase store.</p>
          </div>
          <ShoppingBag className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Customer</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Template</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Slug</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Access</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Last purchase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {templatePurchases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    No direct template purchases yet.
                  </td>
                </tr>
              ) : (
                templatePurchases.map((purchase) => (
                  <tr key={`${purchase.email}-${purchase.slug}`} className="hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {purchase.email[0]?.toUpperCase()}
                        </div>
                        <div className="font-medium truncate max-w-[240px]">{purchase.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {kitTitles.get(purchase.slug) || purchase.slug}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground font-mono text-xs">
                      <Link href={`/templates/${purchase.slug}`} className="hover:text-primary-600 hover:underline">
                        {purchase.slug}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="ds-badge ds-badge-success">Template only</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground text-xs">
                      {formatDate(purchase.lastPurchasedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ds-card p-0 overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <div>
            <h2 className="text-sm font-bold">Plans &amp; licenses</h2>
            <p className="text-xs text-muted-foreground">Package purchases, free unlocks, and license records.</p>
          </div>
          <Receipt className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Customer</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">License key</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Plan</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Provider</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Package</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {plans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    No license records yet.
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan.email} className="hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {plan.email[0]?.toUpperCase()}
                        </div>
                        <div className="font-medium truncate max-w-[200px]">{plan.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{plan.licenseKey}</td>
                    <td className="px-4 py-3">
                      <span className="ds-badge ds-badge-primary capitalize">{plan.plan}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground capitalize">
                      {plan.provider || 'mock'}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground font-mono text-xs">
                      {plan.packageId || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`ds-badge ${plan.status === 'revoked' ? 'ds-badge-danger' : 'ds-badge-success'}`}>
                        {plan.status || 'active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground text-xs">
                      {formatDate(plan.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
