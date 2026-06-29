import { NextRequest } from 'next/server'
import { createPreviewProxyResponse } from '@/lib/preview-proxy'

export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{
    slug: string
  }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params
  return createPreviewProxyResponse(request, slug)
}