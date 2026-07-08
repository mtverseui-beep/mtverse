import { NextRequest, NextResponse } from 'next/server'
import { getCurrentCustomerEmail } from '@/lib/auth/current-customer'
import { getPlan } from '@/lib/plan-store'
import { getTemplateBySlugFromStore } from '@/lib/templates-data'
import { hasTemplatePurchase, getFreeDownloadStatus, hasFreeDownload } from '@/lib/template-social-store'

export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{
    slug: string
  }>
}

function canDownloadTemplate(record: Awaited<ReturnType<typeof getPlan>>) {
  if (!record) return false
  return record.plan === 'pro' || record.plan === 'business' || record.plan === 'extended'
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

    // Paid plan users get unlimited free downloads
    const hasPaidPlan = canDownloadTemplate(planRecord)

    // Can download if: has paid plan, free unlocked, already downloaded, or still has remaining
    const canDl = hasPaidPlan || freeStatus.unlocked || alreadyDownloaded || !freeStatus.limitReached

    return NextResponse.json({
      authenticated: true,
      canDownload: canDl,
      isFree: true,
      freeRemaining: hasPaidPlan || freeStatus.unlocked ? 999 : freeStatus.remaining,
      freeLimitReached: !hasPaidPlan && !freeStatus.unlocked && !alreadyDownloaded && freeStatus.limitReached,
      freeUnlocked: hasPaidPlan || freeStatus.unlocked,
      alreadyDownloaded,
    })
  }

  // Paid template flow
  const [planRecord, purchased] = await Promise.all([
    getPlan(email),
    hasTemplatePurchase(slug, email),
  ])

  return NextResponse.json({
    authenticated: true,
    canDownload: purchased,
    isFree: false,
  })
}

