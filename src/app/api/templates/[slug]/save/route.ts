import { NextRequest, NextResponse } from 'next/server'
import { getCurrentCustomerEmail } from '@/lib/auth/current-customer'
import { isTemplateSaved, setTemplateSaved } from '@/lib/template-social-store'

export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{
    slug: string
  }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  const email = await getCurrentCustomerEmail(request)
  const { slug } = await context.params

  if (!email) {
    return NextResponse.json({ authenticated: false, saved: false }, { status: 401 })
  }

  return NextResponse.json({ authenticated: true, saved: await isTemplateSaved(slug, email) })
}

export async function POST(request: NextRequest, context: RouteContext) {
  const email = await getCurrentCustomerEmail(request)
  const { slug } = await context.params

  if (!email) {
    return NextResponse.json({ error: 'Please sign in to save templates.', code: 'sign_in_required' }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as { saved?: unknown } | null
  const current = await isTemplateSaved(slug, email)
  const nextSaved = typeof body?.saved === 'boolean' ? body.saved : !current
  const saved = await setTemplateSaved(slug, email, nextSaved)

  return NextResponse.json({ authenticated: true, saved })
}