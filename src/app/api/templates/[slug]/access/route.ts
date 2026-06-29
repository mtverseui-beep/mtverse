import { NextRequest, NextResponse } from 'next/server'
import { getCurrentCustomerEmail } from '@/lib/auth/current-customer'
import { getPlan } from '@/lib/plan-store'
import { getTemplateBySlugFromStore } from '@/lib/templates-data'
import { hasTemplatePurchase } from '@/lib/template-social-store'

export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{
    slug: string
  }>
}

function canDownloadTemplate(record: Awaited<ReturnType<typeof getPlan>>) {
  if (!record) return false
  return record.packageId === 'next' || (!record.packageId && (record.plan === 'pro' || record.plan === 'business' || record.plan === 'extended'))
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params

  if (!(await getTemplateBySlugFromStore(slug))) {
    return NextResponse.json({ error: 'Template not found.' }, { status: 404 })
  }

  const email = await getCurrentCustomerEmail(request)
  if (!email) {
    return NextResponse.json({ authenticated: false, canDownload: false })
  }

  const [planRecord, purchased] = await Promise.all([
    getPlan(email),
    hasTemplatePurchase(slug, email),
  ])

  return NextResponse.json({
    authenticated: true,
    canDownload: canDownloadTemplate(planRecord) && purchased,
  })
}