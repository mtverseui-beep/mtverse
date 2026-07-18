import 'server-only'

import { createHmac } from 'crypto'

const UI_LIBRARY_TOKEN_TTL_SECONDS = 60 * 10

export type UiLibraryAccessClaims = {
  sub: string
  entitlement: 'ui-library'
  iat: number
  exp: number
}

function getAccessSecret() {
  const secret = process.env.UI_LIBRARY_ACCESS_SECRET?.trim()

  if (secret) return secret

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Set UI_LIBRARY_ACCESS_SECRET in production')
  }

  return 'dev-ui-library-access-secret-change-before-production'
}

function toBase64Url(value: string | Buffer) {
  return Buffer.from(value).toString('base64url')
}

function sign(payloadPart: string) {
  return toBase64Url(createHmac('sha256', getAccessSecret()).update(payloadPart).digest())
}

export function createUiLibraryAccessToken(email: string) {
  const now = Math.floor(Date.now() / 1000)
  const claims: UiLibraryAccessClaims = {
    sub: email.toLowerCase().trim(),
    entitlement: 'ui-library',
    iat: now,
    exp: now + UI_LIBRARY_TOKEN_TTL_SECONDS,
  }
  const payloadPart = toBase64Url(JSON.stringify(claims))

  return {
    token: `${payloadPart}.${sign(payloadPart)}`,
    expiresAt: claims.exp,
  }
}
