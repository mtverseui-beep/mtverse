import { NextRequest, NextResponse } from 'next/server'
import { getDashboardKit } from '@/lib/dashboard-kit-store'
import { getPreviewUrl } from '@/lib/dashboard-kits'

export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{
    slug: string
  }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params
  const kit = await getDashboardKit(slug)

  if (!kit) {
    return NextResponse.json({ error: 'Preview not available.' }, { status: 404 })
  }

  return NextResponse.redirect(new URL(getPreviewUrl(kit), request.nextUrl.origin), 302)
}