import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, DollarSign, Download, Inbox, LayoutGrid, Receipt, Settings, Star } from 'lucide-react'
import { getDashboardKits } from '@/lib/dashboard-kit-store'
import { getAllPlans } from '@/lib/plan-store'
import { getRecentTemplateReviews } from '@/lib/template-social-store'
import { getTemplateFrameworkRequests, getTemplateFrameworkRequestStats } from '@/lib/template-framework-request-store'

export const metadata: Metadata = {
  title: 'Dashboard - Admin',
  description: 'mtverse template marketplace admin dashboard',
}

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [kits, plans, reviews, templateRequests, requestStats] = await Promise.all([
    getDashboardKits().catch(() => []),
    getAllPlans().catch(() => []),
    getRecentTemplateReviews(6).catch(() => []),
    getTemplateFrameworkRequests(4).catch(() => []),
    getTemplateFrameworkRequestStats().catch(() => ({ total: 0, newCount: 0, customCount: 0, uniqueTemplates: 0, lastSevenDays: 0, frameworkCounts: [], stylingCounts: [] })),
  ])

  const templateCount = kits.length
  const activeLicenses = plans.filter((plan) => plan.status !== 'revoked').length
  const totalRevenue = plans
    .filter((plan) => plan.status !== 'revoked')
    .reduce((sum, plan) => sum + (plan.packageId ? 49 : 0), 0)
  const recentPlans = plans.slice(0, 8)
  const recentReviews = reviews.slice(0, 4)

  const stats = [
    { label: 'Templates', value: templateCount, change: `${kits.filter((kit) => kit.status === 'available').length} available`, icon: LayoutGrid, color: 'primary' },
    { label: 'Active licenses', value: activeLicenses, change: `${plans.length} customer records`, icon: Receipt, color: 'emerald' },
    { label: 'Customer reviews', value: reviews.length, change: 'real submissions', icon: Star, color: 'accent' },
    { label: 'Stack requests', value: requestStats.newCount, change: `${requestStats.total} total`, icon: Inbox, color: 'primary' },
    { label: 'Est. revenue', value: `$${totalRevenue.toLocaleString()}`, change: 'from template sales', icon: DollarSign, color: 'emerald' },
  ]

  const colorMap: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300',
    accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/30 dark:text-accent-300',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="ds-h1">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage the template catalog, buyers, downloads, reviews, and framework requests.</p>
        </div>
        <Link href="/admin/templates" className="ds-btn ds-btn-primary ds-btn-sm">
          <LayoutGrid className="h-4 w-4" />
          Manage templates
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="ds-card">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${colorMap[stat.color]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="h-3 w-3" />
                  Live
                </span>
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
              <div className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground">{stat.change}</div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="ds-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="ds-h3">Recent licenses</h2>
            <Link href="/admin/orders" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          {recentPlans.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Customer purchases will appear here.</p>
          ) : (
            <ul className="space-y-3">
              {recentPlans.map((plan) => (
                <li key={plan.email} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                    {plan.email[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{plan.email}</div>
                    <div className="text-xs text-muted-foreground">{plan.licenseKey} / {plan.plan}</div>
                  </div>
                  <span className={`ds-badge ${plan.status === 'revoked' ? 'ds-badge-danger' : 'ds-badge-success'}`}>
                    {plan.status || 'active'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="ds-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="ds-h3">Request inbox</h2>
            <Link href="/admin/requests" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          {templateRequests.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Framework requests from paid template pages will appear here.</p>
          ) : (
            <ul className="space-y-3">
              {templateRequests.map((request) => (
                <li key={request.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{request.framework === 'Custom' ? request.customFramework || 'Custom' : request.framework}</div>
                      <div className="truncate text-xs text-muted-foreground">{request.templateTitle}</div>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="ds-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="ds-h3">Review inbox</h2>
            <Link href="/admin/reviews" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          {recentReviews.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">New template reviews will appear here.</p>
          ) : (
            <ul className="space-y-3">
              {recentReviews.map((review) => (
                <li key={review.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{review.title}</div>
                      <div className="truncate text-xs text-muted-foreground">{review.name} / {review.rating}/5</div>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="ds-card">
        <h2 className="ds-h3 mb-4">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Link href="/admin/templates" className="flex flex-col items-start gap-2 rounded-lg border p-3 transition-colors hover:border-primary-300 hover:bg-accent/30">
            <LayoutGrid className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-medium">Add template</span>
          </Link>
          <Link href="/admin/orders" className="flex flex-col items-start gap-2 rounded-lg border p-3 transition-colors hover:border-primary-300 hover:bg-accent/30">
            <Receipt className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-medium">View orders</span>
          </Link>
          <Link href="/admin/downloads" className="flex flex-col items-start gap-2 rounded-lg border p-3 transition-colors hover:border-primary-300 hover:bg-accent/30">
            <Download className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-medium">View downloads</span>
          </Link>
          <Link href="/admin/settings" className="flex flex-col items-start gap-2 rounded-lg border p-3 transition-colors hover:border-primary-300 hover:bg-accent/30">
            <Settings className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  )
}