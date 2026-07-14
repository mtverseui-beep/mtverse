import { randomInt } from 'node:crypto'

export type CloudflareR2Config = {
  accountId: string
  endpoint: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  packageBucket: string
  publicUrl: string
  packagePrefix: string
  templatePreviewPrefix: string
  templatePackagePrefix: string
}

function readEnv(value?: string) {
  return value?.trim() || ''
}

function trimSlashes(value: string) {
  return value.replace(/^\/+|\/+$/g, '')
}

function normalizeR2Endpoint(endpoint: string, bucket: string) {
  if (!endpoint || !bucket) return endpoint

  try {
    const url = new URL(endpoint)
    const bucketPath = `/${trimSlashes(bucket)}`
    if (url.pathname === bucketPath || url.pathname === `${bucketPath}/`) {
      url.pathname = ''
      return url.toString().replace(/\/+$/g, '')
    }
  } catch {
    return endpoint
  }

  return endpoint.replace(/\/+$/g, '')
}

function normalizeImageExtension(extension = 'jpg') {
  const value = extension.replace(/^\./, '').toLowerCase()
  if (value === 'jpeg') return 'jpg'
  return ['jpg', 'png', 'webp'].includes(value) ? value : 'jpg'
}

function safeFilename(filename: string) {
  const cleaned = filename.trim().replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  return cleaned || `file-${Date.now()}`
}

function randomDigits(length = 10) {
  return Array.from({ length }, () => String(randomInt(0, 10))).join('')
}

function addRandomSuffix(filename: string) {
  const extension = filename.match(/\.[^.]+$/)?.[0] || '.zip'
  const baseName = filename.replace(/\.[^.]+$/, '')
  return `${baseName}-${randomDigits(10)}${extension}`
}

export function getCloudflareR2Config(): CloudflareR2Config {
  const bucket = readEnv(process.env.CLOUDFLARE_R2_BUCKET)

  return {
    accountId: readEnv(process.env.CLOUDFLARE_ACCOUNT_ID),
    endpoint: normalizeR2Endpoint(readEnv(process.env.CLOUDFLARE_R2_ENDPOINT), bucket),
    accessKeyId: readEnv(process.env.CLOUDFLARE_R2_ACCESS_KEY_ID),
    secretAccessKey: readEnv(process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY),
    bucket,
    packageBucket: readEnv(process.env.CLOUDFLARE_R2_PACKAGE_BUCKET),
    publicUrl: readEnv(process.env.CLOUDFLARE_R2_PUBLIC_URL),
    packagePrefix: readEnv(process.env.CLOUDFLARE_R2_PACKAGE_PREFIX) || 'packages',
    templatePreviewPrefix: readEnv(process.env.CLOUDFLARE_R2_TEMPLATE_PREVIEW_PREFIX) || 'template-previews',
    templatePackagePrefix: readEnv(process.env.CLOUDFLARE_R2_TEMPLATE_PACKAGE_PREFIX) || 'packages/dashboard-kits',
  }
}

export function isCloudflareR2Configured() {
  const config = getCloudflareR2Config()
  return Boolean(
    config.accountId &&
    config.endpoint &&
    config.accessKeyId &&
    config.secretAccessKey &&
    config.bucket &&
    config.publicUrl
  )
}

export function isCloudflareR2PackageStorageConfigured() {
  const config = getCloudflareR2Config()
  return Boolean(
    config.accountId &&
    config.endpoint &&
    config.accessKeyId &&
    config.secretAccessKey &&
    config.packageBucket &&
    config.packageBucket !== config.bucket
  )
}

export function buildR2TemplatePreviewKey(slug: string, filename: string, extension = 'jpg') {
  const config = getCloudflareR2Config()
  const normalizedSlug = safeFilename(slug)
  const normalizedExtension = normalizeImageExtension(extension)
  const baseName = safeFilename(filename.replace(/\.[^.]+$/, ''))
  const storedFilename = addRandomSuffix(`${baseName}.${normalizedExtension}`)
  return `${trimSlashes(config.templatePreviewPrefix)}/${normalizedSlug}/${storedFilename}`
}

export function buildR2TemplatePackageKey(slug: string, filename: string) {
  const config = getCloudflareR2Config()
  const normalizedSlug = safeFilename(slug)
  const normalizedFilename = safeFilename(filename.endsWith('.zip') ? filename : `${filename}.zip`)
  const storedFilename = addRandomSuffix(normalizedFilename)
  return `${trimSlashes(config.templatePackagePrefix)}/${normalizedSlug}/${storedFilename}`
}

export function buildR2PublicUrl(key: string) {
  const config = getCloudflareR2Config()
  return `${config.publicUrl.replace(/\/+$/g, '')}/${key.replace(/^\/+/, '')}`
}

export function buildR2PackageKey(filename: string) {
  const config = getCloudflareR2Config()
  return `${trimSlashes(config.packagePrefix)}/${filename.replace(/^\/+/g, '')}`
}

export function buildR2ImageUrl(
  key: string,
  options?: {
    width?: number
    height?: number
    quality?: number
  }
) {
  const config = getCloudflareR2Config()
  if (!config.publicUrl || !key) return ''

  const params = new URLSearchParams()
  if (options?.width) params.append('width', String(options.width))
  if (options?.height) params.append('height', String(options.height))
  if (options?.quality) params.append('quality', String(options.quality))

  const queryString = params.toString()
  return `${config.publicUrl.replace(/\/+$/g, '')}/${key.replace(/^\/+/, '')}${queryString ? `?${queryString}` : ''}`
}
