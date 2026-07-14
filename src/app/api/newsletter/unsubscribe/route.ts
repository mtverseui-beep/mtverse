import { NextRequest, NextResponse } from 'next/server'
import { unsubscribeFromNewsletter } from '@/lib/newsletter-store'
import { SITE_URL } from '@/lib/site-url'

function readToken(request: NextRequest) {
  return request.nextUrl.searchParams.get('token')?.trim() || ''
}

async function unsubscribe(request: NextRequest) {
  const token = readToken(request)
  if (token.length < 20 || token.length > 200) return false
  return unsubscribeFromNewsletter(token)
}

export async function GET(request: NextRequest) {
  const success = await unsubscribe(request).catch(() => false)
  return NextResponse.redirect(`${SITE_URL}/newsletter/unsubscribed?status=${success ? 'success' : 'invalid'}`, 303)
}

export async function POST(request: NextRequest) {
  const success = await unsubscribe(request).catch(() => false)
  return new NextResponse(null, {
    status: success ? 200 : 400,
    headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
  })
}
