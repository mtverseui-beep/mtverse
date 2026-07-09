import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { authorizeAdminPageRequest } from '@/lib/admin-request-auth'
import { AdminShell } from '@/components/admin/admin-shell'
import { getTemplateFrameworkRequestStats } from '@/lib/template-framework-request-store'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: {
    default: 'Admin · mtverse',
    template: '%s · Admin · mtverse',
  },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await authorizeAdminPageRequest()
  if (!auth.authorized) {
    redirect('/admin-login')
  }

  const requestStats = await getTemplateFrameworkRequestStats().catch(() => ({ newCount: 0 }))

  return <AdminShell userEmail={auth.email || 'admin'} requestCount={requestStats.newCount}>{children}</AdminShell>
}
