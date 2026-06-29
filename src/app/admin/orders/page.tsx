import type { Metadata } from 'next'
import { Receipt, Download } from 'lucide-react'
import { getAllPlans } from '@/lib/plan-store'

export const metadata: Metadata = {
  title: 'Orders - Admin',
  description: 'View customer orders and license records',
}

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  const plans = await getAllPlans().catch(() => [])

  const activeCount = plans.filter((p) => p.status !== 'revoked').length
  const revokedCount = plans.filter((p) => p.status === 'revoked').length
  const paddleCount = plans.filter((p) => p.provider === 'paddle').length
  const mockCount = plans.filter((p) => p.provider === 'mock' || !p.provider).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="ds-h1">Orders &amp; Licenses</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {plans.length} total records · {activeCount} active · {revokedCount} revoked
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="ds-card">
          <div className="text-xs text-muted-foreground mb-1">Total records</div>
          <div className="text-2xl font-bold">{plans.length}</div>
        </div>
        <div className="ds-card">
          <div className="text-xs text-muted-foreground mb-1">Active</div>
          <div className="text-2xl font-bold text-emerald-600">{activeCount}</div>
        </div>
        <div className="ds-card">
          <div className="text-xs text-muted-foreground mb-1">Paddle</div>
          <div className="text-2xl font-bold text-blue-600">{paddleCount}</div>
        </div>
        <div className="ds-card">
          <div className="text-xs text-muted-foreground mb-1">Mock / test</div>
          <div className="text-2xl font-bold text-amber-600">{mockCount}</div>
        </div>
      </div>

      {/* Table */}
      <div className="ds-card p-0 overflow-hidden">
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
                    No orders yet. When customers purchase templates, their records will appear here.
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
                      {plan.packageId || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`ds-badge ${plan.status === 'revoked' ? 'ds-badge-danger' : 'ds-badge-success'}`}>
                        {plan.status || 'active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground text-xs">
                      {new Date(plan.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
