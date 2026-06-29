import { NextRequest, NextResponse } from 'next/server'
import { searchSiteContent } from '@/lib/site-search-server'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') || ''
  const rawLimit = Number(request.nextUrl.searchParams.get('limit') || 12)
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 20) : 12

  const results = await searchSiteContent(query, limit)
  return NextResponse.json({ results })
}
