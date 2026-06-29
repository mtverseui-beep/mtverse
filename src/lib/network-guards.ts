import { lookup } from 'dns/promises'
import net from 'net'

function isPrivateIPv4(address: string): boolean {
  const parts = address.split('.').map(Number)
  if (parts.length !== 4 || parts.some(Number.isNaN)) return true

  return (
    parts[0] === 10 ||
    parts[0] === 127 ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    parts[0] >= 224
  )
}

function isPrivateIPv6(address: string): boolean {
  const normalized = address.toLowerCase()
  return (
    normalized === '::1' ||
    normalized === '::' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe80:')
  )
}

function isPrivateAddress(address: string): boolean {
  const family = net.isIP(address)
  if (family === 4) return isPrivateIPv4(address)
  if (family === 6) return isPrivateIPv6(address)
  return true
}

export async function assertSafeRemoteUrl(input: string): Promise<URL> {
  let target: URL

  try {
    target = new URL(input)
  } catch {
    throw new Error('Enter a valid absolute URL starting with http:// or https://')
  }

  if (!['http:', 'https:'].includes(target.protocol)) {
    throw new Error('Only http:// and https:// URLs are allowed')
  }

  const hostname = target.hostname.toLowerCase()

  if (
    hostname === 'localhost' ||
    hostname === '0.0.0.0' ||
    hostname === '::1' ||
    hostname.endsWith('.local')
  ) {
    throw new Error('Local and private network URLs are not allowed')
  }

  if (net.isIP(hostname)) {
    if (isPrivateAddress(hostname)) {
      throw new Error('Private network URLs are not allowed')
    }
    return target
  }

  const { address } = await lookup(hostname)
  if (isPrivateAddress(address)) {
    throw new Error('Private network URLs are not allowed')
  }

  return target
}
