import { NextRequest, NextResponse } from 'next/server'
import { getPlanByProviderTransactionId, setPlan } from '@/lib/plan-store'
import { isMockPaymentAllowed, verifyPaymentFromSearchParams } from '@/lib/payments'
import { recordTemplatePurchase } from '@/lib/template-social-store'

export async function GET(request: NextRequest) {
  const result = verifyPaymentFromSearchParams(request.nextUrl.searchParams)
  const transactionId = request.nextUrl.searchParams.get('transaction_id')
  const kitSlug = request.nextUrl.searchParams.get('kit')

  if (result.mock && !isMockPaymentAllowed()) {
    return NextResponse.json(
      {
        valid: false,
        provider: result.provider,
        plan: null,
        packageId: result.packageId,
        email: null,
        mock: false,
        error: 'Mock payment verification is disabled in production.',
      },
      { status: 403 }
    )
  }

  if (result.provider === 'paddle' && transactionId) {
    const record = await getPlanByProviderTransactionId(transactionId)
    if (record) {
      if (record.status === 'revoked') {
        return NextResponse.json({
          ...result,
          valid: false,
          plan: null,
          email: record.email,
          mock: false,
          error: 'This license has been revoked.',
        })
      }

      if (kitSlug) {
        await recordTemplatePurchase(kitSlug, record.email)
      }

      return NextResponse.json({
        ...result,
        valid: true,
        plan: record.plan,
        packageId: record.packageId || result.packageId,
        email: record.email,
        mock: false,
      })
    }

    return NextResponse.json({
      ...result,
      valid: false,
      pending: true,
      mock: false,
      error: 'Paddle payment confirmation is still processing.',
    })
  }

  if (result.provider === 'paddle') {
    return NextResponse.json({
      ...result,
      valid: false,
      mock: false,
      error: 'Missing Paddle transaction ID.',
    })
  }

  if (result.valid && result.email && result.plan) {
    await setPlan(
      result.email,
      result.plan,
      undefined,
      request.nextUrl.searchParams.get('session_id') || undefined,
      undefined,
      result.provider,
      result.packageId || undefined
    )

    if (kitSlug) {
      await recordTemplatePurchase(kitSlug, result.email)
    }
  }

  return NextResponse.json(result)
}