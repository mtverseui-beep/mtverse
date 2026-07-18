import { createHmac, randomUUID, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { verifyCheckoutIntentData } from '@/lib/checkout-intent'
import { getPlan, setPlan } from '@/lib/plan-store'
import { getProductPackage } from '@/lib/packages'
import { recordTemplatePurchase } from '@/lib/template-social-store'
import { hasRuntimeKvStore, getRedisClient } from '@/lib/runtime-kv'
import { hasExpectedPaddlePrice } from '@/lib/paddle-transaction'
import { sendPurchaseConfirmationOnce } from '@/lib/email/purchase-confirmation'

export const runtime = 'nodejs'

type PaddleWebhookEvent = {
  event_id?: string
  event_type?: string
  type?: string
  data?: {
    id?: string
    custom_data?: Record<string, unknown> | null
    customer_id?: string | null
    customer?: {
      id?: string | null
      email?: string | null
      email_address?: string | null
    } | null
    customer_email?: string | null
    details?: {
      line_items?: Array<{
        price_id?: string
        quantity?: number
      }>
    } | null
  }
}

function parsePaddleSignature(header: string | null) {
  if (!header) return null

  const parts = Object.fromEntries(
    header
      .split(';')
      .map(part => part.trim().split('='))
      .filter((entry): entry is [string, string] => entry.length === 2 && Boolean(entry[0] && entry[1]))
  )

  return {
    timestamp: parts.ts,
    signature: parts.h1,
  }
}

function secureCompareHex(left: string, right: string) {
  try {
    const leftBuffer = Buffer.from(left, 'hex')
    const rightBuffer = Buffer.from(right, 'hex')
    return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
  } catch {
    return false
  }
}

function verifyPaddleSignature(rawBody: string, header: string | null) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET?.trim()
  if (!secret) throw new Error('PADDLE_WEBHOOK_SECRET is not configured.')

  const signature = parsePaddleSignature(header)
  if (!signature?.timestamp || !signature.signature) return false

  const timestampNumber = Number.parseInt(signature.timestamp, 10)
  if (!Number.isFinite(timestampNumber)) return false

  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - timestampNumber) > 300) return false

  const signedPayload = `${signature.timestamp}:${rawBody}`
  const expected = createHmac('sha256', secret).update(signedPayload).digest('hex')

  return secureCompareHex(expected, signature.signature)
}

function stringFromUnknown(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function extractWebhookEmail(event: PaddleWebhookEvent) {
  const data = event.data
  const customData = data?.custom_data || {}
  return (
    stringFromUnknown(customData.email) ||
    stringFromUnknown(data?.customer?.email) ||
    stringFromUnknown(data?.customer?.email_address) ||
    stringFromUnknown(data?.customer_email)
  ).toLowerCase()
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  let eventClaim: { key: string; value: string } | null = null

  try {
    if (!verifyPaddleSignature(rawBody, request.headers.get('paddle-signature'))) {
      return NextResponse.json({ error: 'Invalid Paddle signature' }, { status: 401 })
    }

    const event = JSON.parse(rawBody) as PaddleWebhookEvent
    const eventType = event.event_type || event.type
    const eventId = event.event_id

    // Check for event_id to prevent duplicate processing
    if (!eventId) {
      return NextResponse.json({ error: 'Missing event_id in webhook payload' }, { status: 400 })
    }

    if (eventType !== 'transaction.completed') {
      if (hasRuntimeKvStore()) {
        const redis = getRedisClient()
        await redis.setex('webhook:paddle:' + eventId, 30 * 24 * 60 * 60, 'processed')
      }
      return NextResponse.json({ received: true, ignored: true, eventType })
    }

    const customData = event.data?.custom_data || {}
    const intent = verifyCheckoutIntentData(customData)

    if (!intent) {
      return NextResponse.json({ error: 'Missing or invalid signed checkout intent in Paddle custom_data' }, { status: 400 })
    }

    const transactionId = stringFromUnknown(event.data?.id)
    if (!transactionId.startsWith('txn_')) {
      return NextResponse.json({ error: 'Missing or invalid Paddle transaction ID.' }, { status: 400 })
    }

    if (!hasExpectedPaddlePrice(event.data, intent.packageId)) {
      return NextResponse.json({ error: 'Paddle transaction price does not match the signed checkout package.' }, { status: 400 })
    }

    const webhookEmail = extractWebhookEmail(event)
    if (webhookEmail && webhookEmail !== intent.email) {
      return NextResponse.json({ error: 'Paddle customer email does not match signed checkout intent.' }, { status: 400 })
    }

    if (hasRuntimeKvStore()) {
      const redis = getRedisClient()
      const key = 'webhook:paddle:' + eventId
      const value = 'processing:' + randomUUID()
      const claimed = await redis.setNx(key, value, 10 * 60)

      if (!claimed) {
        return NextResponse.json({
          received: true,
          ignored: true,
          reason: 'duplicate event_id',
          eventId,
        })
      }

      eventClaim = { key, value }
    }

    const packageId = intent.packageId
    const kitSlug = intent.kitSlug || ''
    const email = intent.email

    if (packageId === 'free-unlock') {
      // HTML bundle unlock payment: keep the existing plan tier and set the unlock flag.
      const { setFreeUnlocked } = await import('@/lib/template-social-store')
      const existingPlan = await getPlan(email)
      await setFreeUnlocked(email)
      await setPlan(
        email,
        existingPlan?.plan || 'free',
        existingPlan?.licenseKey,
        transactionId,
        event.data?.customer_id || event.data?.customer?.id || undefined,
        'paddle',
        packageId
      )
    } else {
      const product = getProductPackage(packageId)

      await setPlan(
        email,
        product.accessPlan as 'pro',
        undefined,
        transactionId,
        event.data?.customer_id || event.data?.customer?.id || undefined,
        'paddle',
        packageId
      )

      if (kitSlug && !['all-paid', 'ui-library'].includes(packageId)) {
        await recordTemplatePurchase(kitSlug, email)
      }
    }

    await sendPurchaseConfirmationOnce({
      email,
      packageId,
      kitSlug: kitSlug || null,
      transactionId,
    })

    if (hasRuntimeKvStore()) {
      const redis = getRedisClient()
      await redis.setex('webhook:paddle:' + eventId, 30 * 24 * 60 * 60, 'processed')
      eventClaim = null
    }

    return NextResponse.json({
      received: true,
      eventType,
      eventId,
      packageId,
      kitSlug: kitSlug || undefined,
      email,
    })
  } catch (error) {
    if (eventClaim && hasRuntimeKvStore()) {
      const redis = getRedisClient()
      await redis.compareAndDelete(eventClaim.key, eventClaim.value).catch(() => false)
    }
    console.error('[Paddle Webhook] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process Paddle webhook' },
      { status: 500 }
    )
  }
}
