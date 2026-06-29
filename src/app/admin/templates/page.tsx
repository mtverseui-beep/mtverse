import type { Metadata } from 'next'
import AdminTemplatesReal from '@/components/admin/admin-templates-real'
import { getDashboardKits } from '@/lib/dashboard-kit-store'

export const metadata: Metadata = {
  title: 'Templates - Admin',
  description: 'Manage dashboard kit templates, screenshots, and package uploads.',
}

export const dynamic = 'force-dynamic'

export default async function AdminTemplatesPage() {
  const kits = await getDashboardKits()
  return <AdminTemplatesReal initialKits={kits} />
}
