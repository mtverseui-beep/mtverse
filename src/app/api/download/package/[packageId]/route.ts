import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join, resolve, sep } from 'node:path'
import { Readable } from 'node:stream'
import JSZip from 'jszip'
import { GetObjectCommand, NoSuchKey, PutObjectCommand, S3Client, type GetObjectCommandOutput } from '@aws-sdk/client-s3'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentCustomerEmail } from '@/lib/auth/current-customer'
import { getCloudflareR2Config, isCloudflareR2PackageStorageConfigured } from '@/lib/cloudflare-r2'
import { getDashboardKits } from '@/lib/dashboard-kit-store'
import { getPackageDownloadFilename, getPackageDownloadKey } from '@/lib/package-downloads'
import { getPlan, hasPlanPackageAccess } from '@/lib/plan-store'
import { getFreeDownloadStatus, recordHtmlBundleDownload, recordPaidBundleDownload } from '@/lib/template-social-store'
import { isPackageId, type PackageId } from '@/lib/packages'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{
    packageId: string
  }>
}

const LOCAL_TEMPLATE_PACKAGE_ROOT = resolve(join(process.cwd(), 'data'))
const HTML_PACKAGE_PREFIX = 'templates/html/'
const HTML_BUNDLE_PACKAGE_ID: PackageId = 'free-unlock'
const ALL_PAID_BUNDLE_PACKAGE_ID: PackageId = 'all-paid'

class BundleSourceError extends Error {
  constructor(public readonly missingSlugs: string[]) {
    super('Bundle source packages are missing: ' + missingSlugs.join(', '))
    this.name = 'BundleSourceError'
  }
}

function canDownloadStaticPackage(record: Awaited<ReturnType<typeof getPlan>>, packageId: PackageId) {
  if (!['next', 'pro', 'ooster-pro', 'ui-library'].includes(packageId)) return false
  return hasPlanPackageAccess(record, packageId)
}

function hasAllPaidTemplatesAccess(record: Awaited<ReturnType<typeof getPlan>>) {
  return hasPlanPackageAccess(record, ALL_PAID_BUNDLE_PACKAGE_ID)
}

function isR2ZipPackageKey(packageKey: string | undefined): packageKey is string {
  return Boolean(packageKey && !packageKey.startsWith('local:') && packageKey.endsWith('.zip'))
}

function hasBundlePackageKey(packageKey: string | undefined): packageKey is string {
  return Boolean(packageKey && (packageKey.startsWith('local:') || isR2ZipPackageKey(packageKey)))
}

function safeBundleFilename(value: string | undefined, fallback: string) {
  return (value || fallback)
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ') || fallback
}


function resolveLocalTemplatePackagePath(packageKey: string | undefined) {
  if (!packageKey?.startsWith('local:')) return null

  const relativePath = packageKey.slice('local:'.length).replace(/^[/\\]+/, '')
  if (!relativePath) return null

  const resolvedPath = resolve(LOCAL_TEMPLATE_PACKAGE_ROOT, relativePath)
  const safePrefix = `${LOCAL_TEMPLATE_PACKAGE_ROOT}${sep}`

  if (resolvedPath !== LOCAL_TEMPLATE_PACKAGE_ROOT && !resolvedPath.startsWith(safePrefix)) {
    return null
  }

  return resolvedPath
}
function toWebStream(body: GetObjectCommandOutput['Body']) {
  if (!body) return null

  const maybeWebStream = body as {
    transformToWebStream?: () => ReadableStream
  }

  if (typeof maybeWebStream.transformToWebStream === 'function') {
    return maybeWebStream.transformToWebStream()
  }

  return Readable.toWeb(body as NodeJS.ReadableStream) as ReadableStream
}

async function toBuffer(body: GetObjectCommandOutput['Body']) {
  if (!body) return Buffer.alloc(0)

  const maybeByteArray = body as {
    transformToByteArray?: () => Promise<Uint8Array>
  }

  if (typeof maybeByteArray.transformToByteArray === 'function') {
    return Buffer.from(await maybeByteArray.transformToByteArray())
  }

  const chunks: Buffer[] = []
  for await (const chunk of body as AsyncIterable<Buffer | Uint8Array | string>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

function isMissingR2Object(error: unknown) {
  if (error instanceof NoSuchKey) return true
  const statusCode = (error as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode
  return statusCode === 404
}

function safeBundleSegment(value: string | undefined) {
  return (value || 'html')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'html'
}

function createR2Client() {
  const config = getCloudflareR2Config()
  return {
    config,
    s3Client: new S3Client({
      region: 'auto',
      endpoint: config.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    }),
  }
}

async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  mapper: (value: T) => Promise<R>,
) {
  const results = new Array<R>(values.length)
  let cursor = 0

  async function worker() {
    while (true) {
      const index = cursor
      cursor += 1
      if (index >= values.length) return
      results[index] = await mapper(values[index])
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, () => worker()))
  return results
}

function buildGeneratedBundleKey(packageId: PackageId, kits: Array<{ slug: string; packageKey?: string; updatedAt?: string }>) {
  const fingerprint = createHash('sha256')
    .update(kits.map((kit) => [kit.slug, kit.packageKey || '', kit.updatedAt || ''].join(':')).join('\n'))
    .digest('hex')
    .slice(0, 16)
  return getPackageDownloadKey(packageId).replace(/\.zip$/i, '-' + fingerprint + '.zip')
}

async function getOptionalR2Object(
  s3Client: S3Client,
  bucket: string,
  key: string,
): Promise<GetObjectCommandOutput | null> {
  try {
    return await s3Client.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
  } catch (error) {
    if (isMissingR2Object(error)) return null
    throw error
  }
}

function createZipStreamResponse(object: GetObjectCommandOutput, filename: string) {
  const stream = toWebStream(object.Body)
  if (!stream) return NextResponse.json({ error: 'Bundle package file is empty.' }, { status: 502 })

  const headers = new Headers({
    'Content-Type': object.ContentType || 'application/zip',
    'Content-Disposition': 'attachment; filename=' + filename,
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  })
  if (object.ContentLength) headers.set('Content-Length', String(object.ContentLength))
  return new Response(stream, { headers })
}

async function cacheGeneratedBundle(
  s3Client: S3Client,
  bucket: string,
  key: string,
  archive: Buffer,
) {
  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: archive,
      ContentType: 'application/zip',
      CacheControl: 'private, no-store',
    }))
  } catch (error) {
    console.warn('[Bundle Cache] ZIP upload failed; delivering the generated archive without cache.', error)
  }
}

async function createHtmlBundleResponse(email: string, _planRecord: Awaited<ReturnType<typeof getPlan>>) {
  const freeStatus = await getFreeDownloadStatus(email)

  if (!freeStatus.unlocked) {
    return NextResponse.json({ error: 'Unlock the all HTML templates bundle for $5 before downloading.' }, { status: 403 })
  }

  if (!isCloudflareR2PackageStorageConfigured()) {
    return NextResponse.json({ error: 'Private HTML package storage is not configured yet.' }, { status: 503 })
  }

  const kits = await getDashboardKits()
  const htmlKits = kits
    .filter((kit) => kit.status === 'available' && kit.category === 'html')
    .sort((left, right) => {
      const category = (left.subcategory || '').localeCompare(right.subcategory || '')
      return category || left.title.localeCompare(right.title)
    })

  if (!htmlKits.length) {
    return NextResponse.json({ error: 'HTML bundle packages are not available yet.' }, { status: 404 })
  }

  const { config, s3Client } = createR2Client()
  const downloadFilename = getPackageDownloadFilename(HTML_BUNDLE_PACKAGE_ID)
  const cacheKey = buildGeneratedBundleKey(HTML_BUNDLE_PACKAGE_ID, htmlKits)
  const cachedBundle = await getOptionalR2Object(s3Client, config.packageBucket, cacheKey)
  if (cachedBundle) {
    await recordHtmlBundleDownload(email)
    return createZipStreamResponse(cachedBundle, downloadFilename)
  }

  const bundle = new JSZip()
  const manifest = htmlKits.map((kit) => ({
    slug: kit.slug,
    title: kit.title,
    category: kit.subcategory || 'HTML',
    filename: kit.packageFilename || `${kit.slug}.zip`,
    livePreviewUrl: kit.livePreviewUrl || null,
  }))

  bundle.file('README.txt', [
    'mtverse All HTML Templates Bundle',
    '',
    `Generated: ${new Date().toISOString()}`,
    `Templates included: ${htmlKits.length}`,
    '',
    'Each folder contains the original ZIP package for one static HTML template.',
    'Use the live preview links from manifest.json to inspect each template before editing.',
  ].join('\n'))
  bundle.file('manifest.json', JSON.stringify(manifest, null, 2))

  const sources = await mapWithConcurrency(htmlKits, 12, async (kit) => {
    const key = kit.packageKey
    if (!key?.startsWith(HTML_PACKAGE_PREFIX) || !key.endsWith('.zip')) {
      return { kit, buffer: Buffer.alloc(0), missing: true }
    }

    try {
      const object = await s3Client.send(new GetObjectCommand({ Bucket: config.packageBucket, Key: key }))
      const buffer = await toBuffer(object.Body)
      return { kit, buffer, missing: !buffer.length }
    } catch (error) {
      console.error('[HTML Bundle] Source fetch failed for ' + kit.slug, error)
      return { kit, buffer: Buffer.alloc(0), missing: true }
    }
  })

  const missingSlugs = sources.filter((source) => source.missing).map((source) => source.kit.slug)
  if (missingSlugs.length) throw new BundleSourceError(missingSlugs)

  for (const { kit, buffer } of sources) {
    const categoryFolder = safeBundleSegment(kit.subcategory)
    const filename = safeBundleFilename(kit.packageFilename, `${kit.slug}.zip`)
    bundle.file(`${categoryFolder}/${filename}`, buffer)
  }

  const archive = await bundle.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })

  await cacheGeneratedBundle(s3Client, config.packageBucket, cacheKey, archive)
  await recordHtmlBundleDownload(email)

  const filename = getPackageDownloadFilename(HTML_BUNDLE_PACKAGE_ID)
  const headers = new Headers({
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
    'Content-Length': String(archive.length),
  })

  return new Response(new Uint8Array(archive), { headers })
}


async function createAllPaidBundleResponse(email: string, planRecord: Awaited<ReturnType<typeof getPlan>>) {
  if (!hasAllPaidTemplatesAccess(planRecord)) {
    return NextResponse.json({ error: 'Purchase the all paid templates bundle before downloading this archive.' }, { status: 403 })
  }

  const kits = await getDashboardKits()
  const paidKits = kits
    .filter((kit) => kit.status === 'available' && !kit.isFree)
    .sort((left, right) => {
      const category = (left.categoryTitle || left.category || '').localeCompare(right.categoryTitle || right.category || '')
      return category || left.title.localeCompare(right.title)
    })

  if (!paidKits.length) {
    return NextResponse.json({ error: 'Paid template packages are not available yet.' }, { status: 404 })
  }

  const needsR2 = paidKits.some((kit) => isR2ZipPackageKey(kit.packageKey))
  if (needsR2 && !isCloudflareR2PackageStorageConfigured()) {
    return NextResponse.json({ error: 'All paid bundle downloads are not configured yet.' }, { status: 503 })
  }

  const r2 = isCloudflareR2PackageStorageConfigured() ? createR2Client() : null
  const downloadFilename = getPackageDownloadFilename(ALL_PAID_BUNDLE_PACKAGE_ID)
  const cacheKey = buildGeneratedBundleKey(ALL_PAID_BUNDLE_PACKAGE_ID, paidKits)
  const cachedBundle = r2
    ? await getOptionalR2Object(r2.s3Client, r2.config.packageBucket, cacheKey)
    : null
  if (cachedBundle) {
    await recordPaidBundleDownload(email)
    return createZipStreamResponse(cachedBundle, downloadFilename)
  }

  const bundle = new JSZip()
  const manifest = paidKits.map((kit) => ({
    slug: kit.slug,
    title: kit.title,
    category: kit.categoryTitle || kit.category || 'Paid Templates',
    subcategory: kit.subcategory || null,
    priceUsd: kit.priceUsd,
    filename: kit.packageFilename || `${kit.slug}.zip`,
    livePreviewUrl: kit.livePreviewUrl || null,
  }))

  bundle.file('README.txt', [
    'mtverse All Paid Templates Bundle',
    '',
    `Generated: ${new Date().toISOString()}`,
    `Templates included: ${paidKits.length}`,
    '',
    'This archive contains the current paid template ZIP packages available in mtverse.',
    'Future paid template updates are included through your mtverse account.',
    'Use manifest.json for template titles, categories, and live preview links.',
  ].join('\n'))
  bundle.file('manifest.json', JSON.stringify(manifest, null, 2))

  const sources = await mapWithConcurrency(paidKits, 8, async (kit) => {
    const key = kit.packageKey
    if (!hasBundlePackageKey(key)) {
      return { kit, buffer: Buffer.alloc(0), missing: true }
    }

    try {
      let buffer: Buffer | null = null
      const localPackagePath = resolveLocalTemplatePackagePath(key)

      if (localPackagePath) {
        if (!existsSync(localPackagePath)) {
          return { kit, buffer: Buffer.alloc(0), missing: true }
        }
        buffer = await readFile(localPackagePath)
      } else if (isR2ZipPackageKey(key) && r2) {
        const object = await r2.s3Client.send(new GetObjectCommand({ Bucket: r2.config.packageBucket, Key: key }))
        buffer = await toBuffer(object.Body)
      }

      return { kit, buffer: buffer || Buffer.alloc(0), missing: !buffer?.length }
    } catch (error) {
      console.error('[All Paid Bundle] Source fetch failed for ' + kit.slug, error)
      return { kit, buffer: Buffer.alloc(0), missing: true }
    }
  })

  const missingSlugs = sources.filter((source) => source.missing).map((source) => source.kit.slug)
  if (missingSlugs.length) throw new BundleSourceError(missingSlugs)

  for (const { kit, buffer } of sources) {
    const categoryFolder = safeBundleSegment(kit.categoryTitle || kit.category || 'paid-templates')
    const templateFolder = safeBundleSegment(kit.slug)
    const filename = safeBundleFilename(kit.packageFilename, `${kit.slug}.zip`)
    bundle.file(`${categoryFolder}/${templateFolder}/${filename}`, buffer)
  }

  const archive = await bundle.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })

  if (r2) await cacheGeneratedBundle(r2.s3Client, r2.config.packageBucket, cacheKey, archive)
  await recordPaidBundleDownload(email)

  const filename = getPackageDownloadFilename(ALL_PAID_BUNDLE_PACKAGE_ID)
  const headers = new Headers({
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
    'Content-Length': String(archive.length),
  })

  return new Response(new Uint8Array(archive), { headers })
}
export async function GET(request: NextRequest, context: RouteContext) {
  const { packageId: rawPackageId } = await context.params

  if (!isPackageId(rawPackageId)) {
    return NextResponse.json({ error: 'Invalid package.' }, { status: 400 })
  }


  const email = await getCurrentCustomerEmail(request)
  if (!email) {
    return NextResponse.json({ error: 'Please sign in to download this package.' }, { status: 401 })
  }

  const { checkRateLimit, getRateLimitRetryAfterSeconds } = await import('@/lib/rate-limit')
  const rateLimit = await checkRateLimit(`download:package:${email}`, {
    max: 5,
    windowMs: 15 * 60 * 1000,
  })

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Too many downloads. Please wait before downloading again.',
        retryAfter: getRateLimitRetryAfterSeconds(rateLimit.resetAt),
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(getRateLimitRetryAfterSeconds(rateLimit.resetAt)),
        },
      }
    )
  }

  const planRecord = await getPlan(email)

  if (rawPackageId === HTML_BUNDLE_PACKAGE_ID) {
    try {
      return await createHtmlBundleResponse(email, planRecord)
    } catch (error) {
      console.error('[HTML Bundle Download] R2 zip generation failed:', error)
      if (error instanceof BundleSourceError) {
        return NextResponse.json(
          { error: 'HTML bundle is temporarily unavailable because one or more source ZIPs are missing.' },
          { status: 503 }
        )
      }
      return NextResponse.json({ error: 'HTML bundle generation failed.' }, { status: 502 })
    }
  }

  if (rawPackageId === ALL_PAID_BUNDLE_PACKAGE_ID) {
    try {
      return await createAllPaidBundleResponse(email, planRecord)
    } catch (error) {
      console.error('[All Paid Bundle Download] R2 zip generation failed:', error)
      if (error instanceof BundleSourceError) {
        return NextResponse.json(
          { error: 'All paid bundle is temporarily unavailable because one or more source ZIPs are missing.' },
          { status: 503 }
        )
      }
      return NextResponse.json({ error: 'All paid templates bundle generation failed.' }, { status: 502 })
    }
  }

  if (!canDownloadStaticPackage(planRecord, rawPackageId)) {
    return NextResponse.json({ error: 'This package is not included in your purchase.' }, { status: 403 })
  }

  if (!isCloudflareR2PackageStorageConfigured()) {
    return NextResponse.json({ error: 'Private package storage is not configured yet.' }, { status: 503 })
  }

  const { config, s3Client } = createR2Client()
  const key = getPackageDownloadKey(rawPackageId)
  const filename = getPackageDownloadFilename(rawPackageId)

  try {
    const object = await s3Client.send(new GetObjectCommand({ Bucket: config.packageBucket, Key: key }))
    const stream = toWebStream(object.Body)

    if (!stream) {
      return NextResponse.json({ error: 'Package file is empty.' }, { status: 502 })
    }

    const headers = new Headers({
      'Content-Type': object.ContentType || 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    })

    if (object.ContentLength) {
      headers.set('Content-Length', String(object.ContentLength))
    }

    return new Response(stream, { headers })
  } catch (error) {
    if (isMissingR2Object(error)) {
      return NextResponse.json({ error: 'Package ZIP is missing in storage.' }, { status: 404 })
    }

    console.error('[Package Download] R2 stream failed:', error)
    return NextResponse.json({ error: 'Package download failed.' }, { status: 502 })
  }
}
