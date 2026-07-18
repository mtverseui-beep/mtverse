import { readFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

function required(name) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(name + ' is required.')
  return value
}

function normalizeEndpoint(endpoint) {
  const url = new URL(endpoint)
  url.pathname = ''
  return url.toString().replace(/\/+$/g, '')
}

const archivePath = resolve(process.argv[2] || 'data/mtverse-ui-library-source.zip')
const filename = 'mtverse-ui-library-source.zip'
const prefix = (process.env.CLOUDFLARE_R2_PACKAGE_PREFIX || 'packages').replace(/^\/+|\/+$/g, '')
const key = prefix + '/' + filename
const bucket = required('CLOUDFLARE_R2_PACKAGE_BUCKET')
const client = new S3Client({
  region: 'auto',
  endpoint: normalizeEndpoint(required('CLOUDFLARE_R2_ENDPOINT')),
  forcePathStyle: true,
  credentials: {
    accessKeyId: required('CLOUDFLARE_R2_ACCESS_KEY_ID'),
    secretAccessKey: required('CLOUDFLARE_R2_SECRET_ACCESS_KEY'),
  },
})

const [archive, details] = await Promise.all([readFile(archivePath), stat(archivePath)])
await client.send(new PutObjectCommand({
  Bucket: bucket,
  Key: key,
  Body: archive,
  ContentType: 'application/zip',
  CacheControl: 'private, no-store',
  ContentDisposition: 'attachment; filename="' + filename + '"',
  Metadata: {
    package: 'ui-library',
    source_size: String(details.size),
  },
}))

const uploaded = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
if (Number(uploaded.ContentLength || 0) !== details.size) {
  throw new Error('Uploaded object size verification failed.')
}

console.log('Uploaded and verified ' + key + ' (' + details.size + ' bytes) in private bucket ' + bucket + '.')
