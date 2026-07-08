import { NextRequest, NextResponse } from 'next/server'
import { getCurrentCustomerEmail } from '@/lib/auth/current-customer'
import { getPlan, hasPlanPackageAccess } from '@/lib/plan-store'
import { getTemplateBySlugFromStore } from '@/lib/templates-data'
import { hasTemplatePurchase, getFreeDownloadStatus, hasFreeDownload } from '@/lib/template-social-store'

export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{
    slug: string
  }>
}

function hasAllPaidBundleAccess(record: Awaited<ReturnType<typeof getPlan>>) {
  return hasPlanPackageAccess(record, 'all-paid')
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params
  const template = await getTemplateBySlugFromStore(slug)

  if (!template) {
    return NextResponse.json({ error: 'Template not found.' }, { status: 404 })
  }

  const email = await getCurrentCustomerEmail(request)
  if (!email) {
    return NextResponse.json({
      authenticated: false,
      canDownload: false,
      isFree: template.isFree,
    })
  }

  // Free template flow
  if (template.isFree) {
    const [planRecord, freeStatus, alreadyDownloaded] = await Promise.all([
      getPlan(email),
      getFreeDownloadStatus(email),
      hasFreeDownload(slug, email),
    ])

    const canDl = freeStatus.unlocked || alreadyDownloaded || !freeStatus.limitReached

    return NextResponse.json({
      authenticated: true,
      canDownload: canDl,
      isFree: true,
      freeRemaining: freeStatus.unlocked ? 999 : freeStatus.remaining,
      freeLimitReached: !freeStatus.unlocked && !alreadyDownloaded && freeStatus.limitReached,
      freeUnlocked: freeStatus.unlocked,
      alreadyDownloaded,
    })
  }

  // Paid template flow
  const [planRecord, purchased] = await Promise.all([
    getPlan(email),
    hasTemplatePurchase(slug, email),
  ])

  const hasBundleAccess = hasAllPaidBundleAccess(planRecord)

  return NextResponse.json({
    authenticated: true,
    canDownload: purchased || hasBundleAccess,
    isFree: false,
  })
}

