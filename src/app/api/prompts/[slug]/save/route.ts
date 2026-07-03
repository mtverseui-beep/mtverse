import { NextRequest, NextResponse } from 'next/server'
import { getCurrentCustomerEmail } from '@/lib/auth/current-customer'
import { getPromptBySlug } from '@/lib/prompt-db'
import { isPromptSaved, setPromptSaved } from '@/lib/prompt-social-store'

export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{
    slug: string
  }>
}

async function assertPromptExists(slug: string) {
  const prompt = await getPromptBySlug(slug)
  return Boolean(prompt)
}

export async function GET(request: NextRequest, context: RouteContext) {
  const email = await getCurrentCustomerEmail(request)
  const { slug } = await context.params

  if (!email) {
    return NextResponse.json({ authenticated: false, saved: false }, { status: 401 })
  }

  if (!(await assertPromptExists(slug))) {
    return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
  }

  return NextResponse.json({ authenticated: true, saved: await isPromptSaved(slug, email) })
}

export async function POST(request: NextRequest, context: RouteContext) {
  const email = await getCurrentCustomerEmail(request)
  const { slug } = await context.params

  if (!email) {
    return NextResponse.json(
      { error: 'Please sign in to save prompts.', code: 'sign_in_required' },
      { status: 401 },
    )
  }

  if (!(await assertPromptExists(slug))) {
    return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
  }

  const body = (await request.json().catch(() => null)) as { saved?: unknown } | null
  const current = await isPromptSaved(slug, email)
  const nextSaved = typeof body?.saved === 'boolean' ? body.saved : !current
  const saved = await setPromptSaved(slug, email, nextSaved)

  return NextResponse.json({ authenticated: true, saved })
}