import { NextRequest, NextResponse } from 'next/server'
import { getPlanByProviderTransactionId, setPlan } from '@/lib/plan-store'
import { isMockPaymentAllowed, verifyPaymentFromSearchParams } from '@/lib/payments'
import { getVerifiedPaddleTransaction } from '@/lib/paddle-transaction'
import { recordTemplatePurchase, setFreeUnlocked } from '@/lib/template-social-store'
import { getCurrentCustomerEmail } from '@/lib/auth/current-customer'

function shouldRecordTemplatePurchase(packageId: string | null | undefined, kitSlug: string | null) {
  return Boolean(kitSlug && packageId !== 'free-unlock' && packageId !== 'all-paid')
}

export async function GET(request: NextRequest) {
  const result = verifyPaymentFromSearchParams(request.nextUrl.searchParams)
  const transactionId = request.nextUrl.searchParams.get('transaction_id') || request.nextUrl.searchParams.get('_ptxn') || request.nextUrl.searchParams.get('transactionId')
  const kitSlug = request.nextUrl.searchParams.get('kit')
  const currentEmail = await getCurrentCustomerEmail(request)

  if (!currentEmail) {
    return NextResponse.json(
      { valid: false, error: 'Please sign in to verify this payment.' },
      { status: 401 }
    )
  }

  if (result.email && result.email !== currentEmail) {
    return NextResponse.json(
      { valid: false, error: 'Payment email does not match the signed-in account.' },
      { status: 403 }
    )
  }

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
      if (record.provider !== 'paddle' || record.email !== currentEmail) {
        return NextResponse.json(
          { ...result, valid: false, email: null, mock: false, error: 'Payment does not belong to this account.' },
          { status: 403 }
        )
      }

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

      const verifiedTransaction = await getVerifiedPaddleTransaction(transactionId)
      if (verifiedTransaction?.packageId === 'free-unlock') {
        await setFreeUnlocked(verifiedTransaction.email)
      } else if (verifiedTransaction?.kitSlug && verifiedTransaction.packageId !== 'all-paid') {
        await recordTemplatePurchase(verifiedTransaction.kitSlug, verifiedTransaction.email)
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

    const verifiedTransaction = await getVerifiedPaddleTransaction(transactionId)
    if (verifiedTransaction) {
      if (verifiedTransaction.email !== currentEmail) {
        return NextResponse.json(
          { ...result, valid: false, email: null, mock: false, error: 'Payment does not belong to this account.' },
          { status: 403 }
        )
      }

      if (verifiedTransaction.packageId === 'free-unlock') {
        await setFreeUnlocked(verifiedTransaction.email)
      } else if (verifiedTransaction.kitSlug && verifiedTransaction.packageId !== 'all-paid') {
        await recordTemplatePurchase(verifiedTransaction.kitSlug, verifiedTransaction.email)
      }

      const createdRecord = await setPlan(
        verifiedTransaction.email,
        verifiedTransaction.plan,
        undefined,
        verifiedTransaction.transactionId,
        verifiedTransaction.customerId,
        'paddle',
        verifiedTransaction.packageId
      )

      return NextResponse.json({
        ...result,
        valid: true,
        plan: createdRecord.plan,
        packageId: verifiedTransaction.packageId,
        email: createdRecord.email,
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

  if (result.valid && result.packageId === 'free-unlock') {
    await setFreeUnlocked(currentEmail)
  } else if (result.valid && result.plan) {
    await setPlan(
      currentEmail,
      result.plan,
      undefined,
      request.nextUrl.searchParams.get('session_id') || undefined,
      undefined,
      result.provider,
      result.packageId || undefined
    )

    if (shouldRecordTemplatePurchase(result.packageId, kitSlug)) {
      await recordTemplatePurchase(kitSlug, currentEmail)
    }
  }

  return NextResponse.json({ ...result, email: currentEmail })
}
