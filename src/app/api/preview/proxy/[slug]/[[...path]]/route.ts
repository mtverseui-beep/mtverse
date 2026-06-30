import { NextRequest, NextResponse } from 'next/server'
import { getDashboardKit } from '@/lib/dashboard-kit-store'
import { getPreviewUrl } from '@/lib/dashboard-kits'

export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{
    slug: string
    path?: string[]
  }>
}

function appendPath(base: string, path: string[]) {
  const url = new URL(base)
  if (path.length) {
    url.pathname = [url.pathname.replace(/\/+$/, ''), ...path.map((segment) => encodeURIComponent(segment))].join('/')
  }
  return url
}

async function redirectToPreview(request: NextRequest, context: RouteContext) {
  const { slug, path = [] } = await context.params
  const kit = await getDashboardKit(slug)

  if (!kit) {
    return NextResponse.json({ error: 'Preview not available.' }, { status: 404 })
  }

  const url = appendPath(getPreviewUrl(kit), path)
  url.search = request.nextUrl.search
  return NextResponse.redirect(url, 302)
}

export async function GET(request: NextRequest, context: RouteContext) {
  return redirectToPreview(request, context)
}

export async function POST(request: NextRequest, context: RouteContext) {
  return redirectToPreview(request, context)
}