import { NextRequest, NextResponse } from 'next/server'
import { newsletterWelcomeEmail } from '@/lib/email/templates'
import { isResendConfigured, sendEmail } from '@/lib/email/resend'
import { markNewsletterConfirmationSent, subscribeToNewsletter } from '@/lib/newsletter-store'
import { checkRateLimit, getClientIp, getRateLimitRetryAfterSeconds } from '@/lib/rate-limit'
import { SITE_URL } from '@/lib/site-url'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const rateLimit = await checkRateLimit(`newsletter:${ip}`, { max: 5, windowMs: 60 * 60 * 1000 })
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many subscription attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(getRateLimitRetryAfterSeconds(rateLimit.resetAt)) } },
    )
  }

  try {
    const body = await request.json() as { email?: unknown; website?: unknown }
    if (typeof body.website === 'string' && body.website.trim()) {
      return NextResponse.json({ success: true })
    }

    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : ''
    if (!EMAIL_PATTERN.test(email) || email.length > 254) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    }

    const subscription = await subscribeToNewsletter(email)
    if (subscription.shouldSendConfirmation && subscription.token && isResendConfigured()) {
      const unsubscribeUrl = `${SITE_URL}/api/newsletter/unsubscribe?token=${encodeURIComponent(subscription.token)}`
      const content = newsletterWelcomeEmail({ unsubscribeUrl })
      await sendEmail({
        to: email,
        ...content,
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
        tags: [{ name: 'category', value: 'newsletter' }],
      })
      await markNewsletterConfirmationSent(email)
    }

    return NextResponse.json({
      success: true,
      message: subscription.shouldSendConfirmation ? 'Subscription confirmed.' : 'You are already subscribed.',
    })
  } catch (error) {
    console.error('[Newsletter] Subscription failed:', error)
    return NextResponse.json({ error: 'Could not complete the subscription. Please try again.' }, { status: 500 })
  }
}
