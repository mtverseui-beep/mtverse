import { NextRequest, NextResponse } from 'next/server'
import { getCurrentCustomerEmail } from '@/lib/auth/current-customer'
import { createCheckout } from '@/lib/payments'
import { getTemplateCheckoutPackageId } from '@/lib/template-checkout'
import { getTemplateBySlugFromStore } from '@/lib/templates-data'
import { isPackageId } from '@/lib/packages'
import { resolveSiteUrlFromRequestHeaders, SITE_URL } from '@/lib/site-url'

function normalizeCheckoutOrigin(value: string) {
  const url = new URL(value)
  const hostname = url.hostname.toLowerCase().replace(/^www\./, '')
  return `${url.protocol}//${hostname}${url.port ? `:${url.port}` : ''}`
}

function isAllowedCheckoutOrigin(request: NextRequest, origin: string) {
  const requestOrigins = [
    SITE_URL,
    resolveSiteUrlFromRequestHeaders(request.headers),
    request.nextUrl.origin,
  ]

  const allowedOrigins = new Set(requestOrigins.map(normalizeCheckoutOrigin))
  return allowedOrigins.has(normalizeCheckoutOrigin(origin))
}

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get('origin')
    if (origin) {
      try {
        if (!isAllowedCheckoutOrigin(request, origin)) {
          return NextResponse.json(
            { error: 'Cross-origin checkout requests are not allowed.' },
            { status: 403 }
          )
        }
      } catch {
        return NextResponse.json({ error: 'Invalid checkout origin.' }, { status: 403 })
      }
    }

    let body: { packageId?: unknown; plan?: unknown; email?: unknown; kit?: unknown; kitSlug?: unknown }

    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const requestedPackage = body.packageId || body.plan
    const email = await getCurrentCustomerEmail(request)

    if (!isPackageId(requestedPackage)) {
      return NextResponse.json(
        { error: 'Invalid checkout package.' },
        { status: 400 }
      )
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Please sign in before checkout.', code: 'sign_in_required' },
        { status: 401 }
      )
    }

    const kitSlug = typeof body.kit === 'string' ? body.kit : typeof body.kitSlug === 'string' ? body.kitSlug : undefined

    if (kitSlug) {
      const template = await getTemplateBySlugFromStore(kitSlug)
      if (!template) {
        return NextResponse.json(
          { error: 'Template not found for checkout.' },
          { status: 404 }
        )
      }

      if (template.isFree) {
        return NextResponse.json(
          { error: 'This template is free and does not require checkout.' },
          { status: 400 }
        )
      }

      const expectedPackage = getTemplateCheckoutPackageId(template)
      if (requestedPackage !== expectedPackage) {
        return NextResponse.json(
          { error: 'Checkout package does not match this template.' },
          { status: 400 }
        )
      }
    } else if (requestedPackage !== 'free-unlock' && requestedPackage !== 'all-paid') {
      return NextResponse.json(
        { error: 'Template checkout requires a template slug.' },
        { status: 400 }
      )
    }

    const checkout = await createCheckout({ packageId: requestedPackage, email, kitSlug })

    return NextResponse.json(checkout)
  } catch (error) {
    console.error('[Payments Checkout] Error:', error)
    const message = error instanceof Error ? error.message : ''
    const configurationError = message.startsWith('Paddle checkout configuration is incomplete:')
    return NextResponse.json(
      {
        error: configurationError
          ? 'Checkout is temporarily unavailable while payment configuration is being updated.'
          : 'Failed to create checkout session.',
        code: configurationError ? 'checkout_configuration_error' : 'checkout_error',
      },
      { status: configurationError ? 503 : 500 }
    )
  }
}
