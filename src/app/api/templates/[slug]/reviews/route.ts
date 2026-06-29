import { NextRequest, NextResponse } from 'next/server'
import { getCurrentCustomer } from '@/lib/auth/current-customer'
import { getTemplateBySlugFromStore } from '@/lib/templates-data'
import { addTemplateReview, getTemplateSocial, hasTemplatePurchase } from '@/lib/template-social-store'

export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{
    slug: string
  }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { slug } = await context.params

  if (!(await getTemplateBySlugFromStore(slug))) {
    return NextResponse.json({ error: 'Template not found.' }, { status: 404 })
  }

  const social = await getTemplateSocial(slug)
  return NextResponse.json({ social })
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params

  if (!(await getTemplateBySlugFromStore(slug))) {
    return NextResponse.json({ error: 'Template not found.' }, { status: 404 })
  }

  const customer = await getCurrentCustomer()
  if (!customer.email) {
    return NextResponse.json(
      { error: 'Please sign in to write a review.', code: 'sign_in_required' },
      { status: 401 }
    )
  }

  let body: { rating?: unknown; title?: unknown; comment?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid review payload.' }, { status: 400 })
  }

  try {
    const verifiedPurchase = await hasTemplatePurchase(slug, customer.email)
    const social = await addTemplateReview({
      slug,
      email: customer.email,
      name: customer.name,
      rating: body.rating,
      title: body.title,
      comment: body.comment,
      verifiedPurchase,
    })

    return NextResponse.json({ social })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Review could not be saved.' },
      { status: 400 }
    )
  }
}