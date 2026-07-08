import type { Metadata } from 'next'
import { AdminPricingSettings } from '@/components/admin/admin-pricing-settings'
import { buildAllPaidBundleEmail } from '@/lib/email-templates/all-paid-bundle-email'
import { getPricingCtaSettings } from '@/lib/pricing-settings-store'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Pricing CTA - Admin',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminPricingPage() {
  const settings = await getPricingCtaSettings()
  const emailTemplate = buildAllPaidBundleEmail(settings)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="ds-h1">Pricing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update the all-paid bundle CTA, checkout copy, and email offer template.</p>
      </div>
      <AdminPricingSettings initialSettings={settings} emailTemplate={emailTemplate} />
    </div>
  )
}