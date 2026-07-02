import { NextRequest, NextResponse } from 'next/server'
import { getCurrentCustomerEmail } from '@/lib/auth/current-customer'
import { getPlan } from '@/lib/plan-store'
import { getAllTemplatesFromStore } from '@/lib/templates-data'
import { getFreeDownloadStatus, getSavedTemplateSlugs, hasTemplatePurchase } from '@/lib/template-social-store'

export const dynamic = 'force-dynamic'

function canDownloadTemplate(record: Awaited<ReturnType<typeof getPlan>>) {
  if (!record) return false
  return record.plan === 'pro' || record.plan === 'business' || record.plan === 'extended'
}

export async function GET(request: NextRequest) {
  const email = await getCurrentCustomerEmail(request)

  if (!email) {
    return NextResponse.json({ authenticated: false, templates: [] }, { status: 401 })
  }

  const templates = await getAllTemplatesFromStore()
  const [planRecord, purchasedFlags, savedSlugs, freeStatus] = await Promise.all([
    getPlan(email),
    Promise.all(templates.map((template) => hasTemplatePurchase(template.slug, email))),
    getSavedTemplateSlugs(email),
    getFreeDownloadStatus(email),
  ])

  const paidTemplateAccess = canDownloadTemplate(planRecord)
  const savedSet = new Set(savedSlugs)
  const freeDownloadedSet = new Set(freeStatus.slugs)

  return NextResponse.json({
    authenticated: true,
    templates: templates.map((template, index) => {
      const purchased = !template.isFree && purchasedFlags[index]
      const freeDownloaded = template.isFree && freeDownloadedSet.has(template.slug)
      const canDownloadFreeTemplate = template.isFree && (
        paidTemplateAccess ||
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
        canDownload: (paidTemplateAccess && purchased) || canDownloadFreeTemplate,
      }
    }),
  })
}
