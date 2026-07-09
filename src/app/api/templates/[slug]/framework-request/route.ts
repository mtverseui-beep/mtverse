import { NextRequest, NextResponse } from 'next/server'
import { getCurrentCustomerEmail } from '@/lib/auth/current-customer'
import { getTemplateBySlugFromStore } from '@/lib/templates-data'
import { addTemplateFrameworkRequest, FRAMEWORK_OPTIONS, STYLING_OPTIONS } from '@/lib/template-framework-request-store'

type RouteContext = { params: Promise<{ slug: string }> }

type RequestBody = {
  email?: unknown
  framework?: unknown
  customFramework?: unknown
  styling?: unknown
  customStyling?: unknown
  message?: unknown
}

function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

function jsonError(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status })
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params
  const template = await getTemplateBySlugFromStore(slug)

  if (!template) return jsonError('Template not found.', 404)
  if (template.isFree) return jsonError('Framework requests are available for paid templates only.', 400)

  let body: RequestBody
  try {
    body = (await request.json()) as RequestBody
  } catch {
    return jsonError('Invalid request body.', 400)
  }

  const sessionEmail = await getCurrentCustomerEmail(request)
  const email = sessionEmail || cleanString(body.email, 160).toLowerCase()
  const framework = cleanString(body.framework, 80)
  const styling = cleanString(body.styling, 80) || 'No preference'
  const customFramework = cleanString(body.customFramework, 80)
  const customStyling = cleanString(body.customStyling, 80)

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonError('Enter a valid email address.', 400)
  }

  if (!FRAMEWORK_OPTIONS.includes(framework as (typeof FRAMEWORK_OPTIONS)[number])) {
    return jsonError('Choose a valid framework option.', 400)
  }

  if (framework === 'Custom' && !customFramework) {
    return jsonError('Tell us the custom framework you want.', 400)
  }

  if (!STYLING_OPTIONS.includes(styling as (typeof STYLING_OPTIONS)[number])) {
    return jsonError('Choose a valid styling option.', 400)
  }

  if (styling === 'Custom' && !customStyling) {
    return jsonError('Tell us the custom styling setup you want.', 400)
  }

  try {
    const result = await addTemplateFrameworkRequest({
      slug: template.slug,
      templateTitle: template.title,
      email,
      framework,
      customFramework,
      styling,
      customStyling,
      message: body.message,
    })

    return NextResponse.json({
      success: true,
      duplicate: result.duplicate,
      request: result.request,
      message: result.duplicate
        ? 'You already requested this version recently. We kept it in the admin inbox and will email you after review.'
        : 'Request sent. We will review it and email you with the next step.',
    })
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Failed to save request.', 500)
  }
}