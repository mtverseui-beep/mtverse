import 'server-only'

import { createHmac, timingSafeEqual } from 'crypto'

export const CUSTOMER_SESSION_COOKIE = 'mtverse_session'
export const CUSTOMER_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7
export const CUSTOMER_SESSION_REMEMBER_TTL_SECONDS = 60 * 60 * 24 * 30

export type CustomerSession = {
  email: string
  name?: string
  iat: number
  exp: number
}

function getSessionSecret() {
  const secret = process.env.CUSTOMER_SESSION_SECRET || process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET

  if (secret) {
    return secret
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Set CUSTOMER_SESSION_SECRET in production')
  }

  return 'dev-customer-session-secret-change-before-production'
}

function toBase64Url(value: string | Buffer) {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value)
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4))
  return Buffer.from(`${normalized}${padding}`, 'base64')
}

function signPayload(payloadPart: string) {
  return toBase64Url(createHmac('sha256', getSessionSecret()).update(payloadPart).digest())
}

export function createCustomerSessionToken(
  user: { email: string; name?: string | null },
  ttlSeconds = CUSTOMER_SESSION_TTL_SECONDS
) {
  const now = Math.floor(Date.now() / 1000)
  const payload: CustomerSession = {
    email: user.email.toLowerCase().trim(),
    name: user.name || undefined,
    iat: now,
    exp: now + ttlSeconds,
  }
  const payloadPart = toBase64Url(JSON.stringify(payload))
  return `${payloadPart}.${signPayload(payloadPart)}`
}

export function verifyCustomerSessionToken(token: string): CustomerSession | null {
  const [payloadPart, signaturePart] = token.split('.')

  if (!payloadPart || !signaturePart) return null

  const expectedSignature = signPayload(payloadPart)
  const actual = Buffer.from(signaturePart)
  const expected = Buffer.from(expectedSignature)

  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return null
  }

  try {
    const payload = JSON.parse(fromBase64Url(payloadPart).toString('utf8')) as CustomerSession
    const now = Math.floor(Date.now() / 1000)

    if (!payload.email || payload.exp <= now) {
      return null
    }

    return payload
  } catch {
    return null
  }
}
