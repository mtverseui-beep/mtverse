import { NextRequest, NextResponse } from 'next/server'
import { feedbackAdminEmail, feedbackReceivedEmail } from '@/lib/email/templates'
import { getResendAdminEmail, isResendConfigured, sendEmail } from '@/lib/email/resend'
import { createFeedback } from '@/lib/feedback-store'
import { checkRateLimit, getClientIp, getRateLimitRetryAfterSeconds } from '@/lib/rate-limit'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const rateLimit = await checkRateLimit(`feedback:${ip}`, { max: 5, windowMs: 60 * 60 * 1000 })
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many messages. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(getRateLimitRetryAfterSeconds(rateLimit.resetAt)) } },
    )
  }

  try {
    const body = await request.json() as Record<string, unknown>
    if (cleanText(body.website, 200)) return NextResponse.json({ success: true })

    const name = cleanText(body.name, 80)
    const email = cleanText(body.email, 254).toLowerCase()
    const subject = cleanText(body.subject, 120)
    const message = cleanText(body.message, 3_000)

    if (name.length < 2 || !EMAIL_PATTERN.test(email) || subject.length < 3 || message.length < 10) {
      return NextResponse.json({ error: 'Complete every field with valid information.' }, { status: 400 })
    }

    const record = await createFeedback({ name, email, subject, message })
    if (isResendConfigured()) {
      const acknowledgement = feedbackReceivedEmail({ name, subject, referenceId: record.id })
      const adminEmail = getResendAdminEmail()
      const deliveries: Promise<unknown>[] = [
        sendEmail({
          to: email,
          ...acknowledgement,
          tags: [{ name: 'category', value: 'feedback-receipt' }],
        }),
      ]

      if (adminEmail) {
        const notification = feedbackAdminEmail({ name, email, subject, message, referenceId: record.id })
        deliveries.push(sendEmail({
          to: adminEmail,
          replyTo: email,
          ...notification,
          tags: [{ name: 'category', value: 'feedback-admin' }],
        }))
      }

      const results = await Promise.allSettled(deliveries)
      results.forEach((result) => {
        if (result.status === 'rejected') console.error('[Feedback] Email delivery failed:', result.reason)
      })
    }

    return NextResponse.json({ success: true, referenceId: record.id })
  } catch (error) {
    console.error('[Feedback] Submission failed:', error)
    return NextResponse.json({ error: 'Could not send your message. Please try again.' }, { status: 500 })
  }
}
