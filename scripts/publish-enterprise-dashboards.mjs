import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

function required(name) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is required.`)
  return value
}

function normalizeEndpoint(endpoint, publicBucket) {
  const url = new URL(endpoint)
  const bucketPath = `/${publicBucket.replace(/^\/+|\/+$/g, '')}`
  if (url.pathname === bucketPath || url.pathname === `${bucketPath}/`) url.pathname = ''
  return url.toString().replace(/\/+$/g, '')
}

const publicBucket = required('CLOUDFLARE_R2_BUCKET')
const packageBucket = required('CLOUDFLARE_R2_PACKAGE_BUCKET')
if (publicBucket === packageBucket) throw new Error('Preview and private package buckets must be different.')

const client = new S3Client({
  region: 'auto',
  endpoint: normalizeEndpoint(required('CLOUDFLARE_R2_ENDPOINT'), publicBucket),
  forcePathStyle: true,
  credentials: {
    accessKeyId: required('CLOUDFLARE_R2_ACCESS_KEY_ID'),
    secretAccessKey: required('CLOUDFLARE_R2_SECRET_ACCESS_KEY'),
  },
})

const artifacts = ['fleetops', 'meridian-health', 'meridian-terminal', 'northstar-analytics'].flatMap((slug) => [
  {
    slug,
    type: 'preview',
    bucket: publicBucket,
    key: `templates/dashboard-previews/${slug}/${slug}-2026-08-01.png`,
    file: resolve(`public/template-previews/${slug}.png`),
    contentType: 'image/png',
    cacheControl: 'public, max-age=31536000, immutable',
  },
  {
    slug,
    type: 'package',
    bucket: packageBucket,
    key: `templates/dashboards/${slug}/${slug}-2026-08-01.zip`,
    file: resolve(`data/template-packages/${slug}/${slug}.zip`),
    contentType: 'application/zip',
    cacheControl: 'private, no-store',
  },
])

for (const artifact of artifacts) {
  const fileStats = await stat(artifact.file)
  if (!fileStats.isFile() || fileStats.size === 0) throw new Error(`Artifact is empty: ${artifact.file}`)

  await client.send(new PutObjectCommand({
    Bucket: artifact.bucket,
    Key: artifact.key,
    Body: createReadStream(artifact.file),
    ContentLength: fileStats.size,
    ContentType: artifact.contentType,
    CacheControl: artifact.cacheControl,
    Metadata: {
      'template-slug': artifact.slug,
      'artifact-type': artifact.type,
      'release-date': '2026-08-01',
    },
  }))

  const uploaded = await client.send(new HeadObjectCommand({ Bucket: artifact.bucket, Key: artifact.key }))
  if (Number(uploaded.ContentLength || 0) !== fileStats.size) {
    throw new Error(`R2 verification failed for ${artifact.key}: expected ${fileStats.size}, received ${uploaded.ContentLength || 0}`)
  }

  console.log(`${artifact.type}_uploaded=${artifact.slug} bytes=${fileStats.size} key=${artifact.key}`)
}

console.log(`published_artifacts=${artifacts.length}`)
