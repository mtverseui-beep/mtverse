import { NextRequest, NextResponse } from 'next/server'
import { getCurrentCustomerEmail } from '@/lib/auth/current-customer'
import { getPlan, hasPlanPackageAccess } from '@/lib/plan-store'
import { getAllTemplatesFromStore } from '@/lib/templates-data'
import { getFreeDownloadStatus, getSavedTemplateSlugs, hasTemplatePurchase } from '@/lib/template-social-store'

export const dynamic = 'force-dynamic'

function hasAllPaidBundleAccess(record: Awaited<ReturnType<typeof getPlan>>) {
  return hasPlanPackageAccess(record, 'all-paid')
}

export async function GET(request: NextRequest) {
  const email = await getCurrentCustomerEmail(request)

  if (!email) {
    return NextResponse.json({ authenticated: false, templates: [] }, { status: 401 })
  }

  const [templates, planRecord, savedSlugs, freeStatus] = await Promise.all([
    getAllTemplatesFromStore(),
    getPlan(email),
    getSavedTemplateSlugs(email),
    getFreeDownloadStatus(email),
  ])
  const purchasedFlags = await Promise.all(templates.map((template) => hasTemplatePurchase(template.slug, email)))
  const allPaidBundleAccess = hasAllPaidBundleAccess(planRecord)
  const savedSet = new Set(savedSlugs)
  const freeDownloadedSet = new Set(freeStatus.slugs)

  return NextResponse.json({
    authenticated: true,
    templates: templates.map((template, index) => {
      const purchased = !template.isFree && (purchasedFlags[index] || allPaidBundleAccess)
      const freeDownloaded = template.isFree && freeDownloadedSet.has(template.slug)
      const canDownloadFreeTemplate = template.isFree && (
        freeStatus.unlocked ||
        freeDownloaded ||
        !freeStatus.limitReached
      )

      return {
        slug: template.slug,
        title: template.title,
        summary: template.summary,
        screenshotUrl: template.screenshotUrl,
        price: template.price,
        purchased,
        saved: savedSet.has(template.slug),
        freeDownloaded,
        canDownload: (!template.isFree && purchased) || canDownloadFreeTemplate,
      }
    }),
  })
}