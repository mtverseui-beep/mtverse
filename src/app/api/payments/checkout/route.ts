import { NextRequest, NextResponse } from 'next/server'
import { getCurrentCustomerEmail } from '@/lib/auth/current-customer'
import { createCheckout } from '@/lib/payments'
import { isPackageId } from '@/lib/packages'

export async function POST(request: NextRequest) {
  try {
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
        { error: 'Invalid package. mtverse currently sells the Next.js package only.' },
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
    const checkout = await createCheckout({ packageId: requestedPackage, email, kitSlug })

    return NextResponse.json(checkout)
  } catch (error) {
    console.error('[Payments Checkout] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

