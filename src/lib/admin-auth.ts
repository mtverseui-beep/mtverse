const encoder = new TextEncoder()
const decoder = new TextDecoder()
let signingKeyCache:
  | {
      secret: string
      keyPromise: Promise<CryptoKey>
    }
  | null = null

export const ADMIN_SESSION_COOKIE = 'multiverse_admin_session'
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7

export type AdminSession = {
  email: string
  exp: number
  iat: number
}

export function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL?.trim()
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim()

  if (!email || !passwordHash) {
    throw new Error(
      'Admin credentials not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD_HASH in .env'
    )
  }

  return { email, passwordHash }
}

export async function verifyAdminPassword(plainPassword: string, storedHash: string): Promise<boolean> {
  const { scrypt } = await import('node:crypto')
  const { promisify } = await import('node:util')
  const scryptAsync = promisify(scrypt) as (password: string, salt: string, keylen: number) => Promise<Buffer>

  try {
    const derivedHash = await scryptAsync(plainPassword, 'mtverse-admin-salt-v1', 32)
    return derivedHash.toString('hex') === storedHash
  } catch {
    return false
  }
}

function getAdminSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET

  if (!secret) {
    throw new Error(
      'Admin session secret not configured. Set ADMIN_SESSION_SECRET in .env.local'
    )
  }

  return secret
}

function toBase64(binary: string) {
  return btoa(binary)
}

function fromBase64(base64: string) {
  return atob(base64)
}

function bytesToBinary(bytes: Uint8Array) {
  let output = ''
  const chunkSize = 0x8000

  for (let index = 0; index < bytes.length; index += chunkSize) {
    output += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }

  return output
}

function binaryToBytes(binary: string) {
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

function bytesToBase64Url(bytes: Uint8Array) {
  return toBase64(bytesToBinary(bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4))

  return binaryToBytes(fromBase64(`${normalized}${padding}`))
}

async function importSigningKey() {
  const secret = getAdminSessionSecret()

  if (!signingKeyCache || signingKeyCache.secret !== secret) {
    signingKeyCache = {
      secret,
      keyPromise: crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
      ),
    }
  }

  return signingKeyCache.keyPromise
}

export async function createAdminSessionToken(email: string, ttlSeconds = ADMIN_SESSION_TTL_SECONDS) {
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    email,
    iat: now,
    exp: now + ttlSeconds,
  }
  const payloadBytes = encoder.encode(JSON.stringify(payload))
  const key = await importSigningKey()
  const signature = await crypto.subtle.sign('HMAC', key, payloadBytes)

  return `${bytesToBase64Url(payloadBytes)}.${bytesToBase64Url(new Uint8Array(signature))}`
}

export async function verifyAdminSessionToken(token: string) {
  const [payloadPart, signaturePart] = token.split('.')

  if (!payloadPart || !signaturePart) {
    return null
  }

  try {
    const payloadBytes = base64UrlToBytes(payloadPart)
    const signatureBytes = base64UrlToBytes(signaturePart)
    const key = await importSigningKey()
    const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes, payloadBytes)

    if (!isValid) {
      return null
    }

    const payload = JSON.parse(decoder.decode(payloadBytes)) as AdminSession
    const now = Math.floor(Date.now() / 1000)

    if (!payload.email || payload.exp <= now) {
      return null
    }

    return payload
  } catch {
    return null
  }
}
