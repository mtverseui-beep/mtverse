import { NextRequest, NextResponse } from 'next/server'
import { getCurrentCustomerEmail } from '@/lib/auth/current-customer'
import { getPromptBySlug } from '@/lib/prompt-db'

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
    return NextResponse.json(
      { error: 'Please sign in to view and copy prompts.', code: 'sign_in_required' },
      { status: 401 },
    )
  }

  const prompt = await getPromptBySlug(slug, { noStore: true })

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
  }

  return NextResponse.json({ authenticated: true, prompt: prompt.prompt })
}