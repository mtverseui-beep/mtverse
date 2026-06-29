import { NextRequest, NextResponse } from 'next/server'
import { getCurrentCustomerEmail } from '@/lib/auth/current-customer'
import { getPlan } from '@/lib/plan-store'
import { getAllTemplatesFromStore } from '@/lib/templates-data'
import { getSavedTemplateSlugs, hasTemplatePurchase } from '@/lib/template-social-store'

export const dynamic = 'force-dynamic'

function canDownloadTemplate(record: Awaited<ReturnType<typeof getPlan>>) {
  if (!record) return false
  return record.packageId === 'next' || (!record.packageId && (record.plan === 'pro' || record.plan === 'business' || record.plan === 'extended'))
}

export async function GET(request: NextRequest) {
  const email = await getCurrentCustomerEmail(request)

  if (!email) {
    return NextResponse.json({ authenticated: false, templates: [] }, { status: 401 })
  }

  const templates = await getAllTemplatesFromStore()
  const [planRecord, purchasedFlags, savedSlugs] = await Promise.all([
    getPlan(email),
    Promise.all(templates.map((template) => hasTemplatePurchase(template.slug, email))),
    getSavedTemplateSlugs(email),
  ])
  const downloadAllowed = canDownloadTemplate(planRecord)
  const savedSet = new Set(savedSlugs)

  return NextResponse.json({
    authenticated: true,
    templates: templates.map((template, index) => {
      const purchased = purchasedFlags[index]

      return {
        slug: template.slug,
        title: template.title,
        summary: template.summary,
        screenshotUrl: template.screenshotUrl,
        price: template.price,
        purchased,
        saved: savedSet.has(template.slug),
        canDownload: downloadAllowed && purchased,
      }
    }),
  })
}