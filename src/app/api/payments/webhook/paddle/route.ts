import { createHmac, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { setPlan } from '@/lib/plan-store'
import { getProductPackage, isPackageId } from '@/lib/packages'
import { recordTemplatePurchase } from '@/lib/template-social-store'
import { hasRuntimeKvStore, getRedisClient } from '@/lib/runtime-kv'

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

    // Check if already processed (using Redis if available)
    if (hasRuntimeKvStore()) {
      const redis = getRedisClient()
      const alreadyProcessed = await redis.get(`webhook:paddle:${eventId}`)
      
      if (alreadyProcessed) {
        return NextResponse.json({ 
          received: true, 
          ignored: true, 
          reason: 'duplicate event_id',
          eventId 
        })
      }
    }

    if (eventType !== 'transaction.completed') {
      // Mark as processed even for ignored events
      if (hasRuntimeKvStore()) {
        const redis = getRedisClient()
        // 30-day TTL for event deduplication
        await redis.setex(`webhook:paddle:${eventId}`, 30 * 24 * 60 * 60, 'processed')
      }
      
      return NextResponse.json({ received: true, ignored: true, eventType })
    }

    const customData = event.data?.custom_data || {}
    const packageId = stringFromUnknown(customData.packageId)
    const kitSlug = stringFromUnknown(customData.kitSlug)
    const email = extractWebhookEmail(event)

    if (!isPackageId(packageId)) {
      return NextResponse.json({ error: 'Missing or invalid packageId in Paddle custom_data' }, { status: 400 })
    }

    if (!email) {
      return NextResponse.json({ error: 'Missing customer email in Paddle webhook' }, { status: 400 })
    }

    const product = getProductPackage(packageId)
    await setPlan(
      email,
      product.accessPlan,
      undefined,
      event.data?.id,
      event.data?.customer_id || event.data?.customer?.id || undefined,
      'paddle',
      packageId
    )

    if (kitSlug) {
      await recordTemplatePurchase(kitSlug, email)
    }

    // Mark as successfully processed
    if (hasRuntimeKvStore()) {
      const redis = getRedisClient()
      // 30-day TTL for event deduplication
      await redis.setex(`webhook:paddle:${eventId}`, 30 * 24 * 60 * 60, 'processed')
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
    console.error('[Paddle Webhook] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process Paddle webhook' },
      { status: 500 }
    )
  }
}
