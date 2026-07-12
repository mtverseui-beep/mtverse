import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'

function required(name) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(name + ' is required.')
  return value
}

function normalizeEndpoint(endpoint, sourceBucket) {
  const url = new URL(endpoint)
  const sourcePath = '/' + sourceBucket.replace(/^\/+|\/+$/g, '')
  if (url.pathname === sourcePath || url.pathname === sourcePath + '/') {
    url.pathname = ''
  }
  return url.toString().replace(/\/+$/g, '')
}

async function listZipKeys(client, bucket, prefix) {
  const keys = []
  let continuationToken

  do {
    const response = await client.send(new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    }))

    for (const object of response.Contents || []) {
      if (object.Key?.toLowerCase().endsWith('.zip')) keys.push(object.Key)
    }
    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined
  } while (continuationToken)

  return keys
}

const sourceBucket = required('CLOUDFLARE_R2_BUCKET')
const destinationBucket = required('CLOUDFLARE_R2_PACKAGE_BUCKET')
if (sourceBucket === destinationBucket) {
  throw new Error('CLOUDFLARE_R2_PACKAGE_BUCKET must be a separate private bucket.')
}

const endpoint = normalizeEndpoint(required('CLOUDFLARE_R2_ENDPOINT'), sourceBucket)
const client = new S3Client({
  region: 'auto',
  endpoint,
  forcePathStyle: true,
  credentials: {
    accessKeyId: required('CLOUDFLARE_R2_ACCESS_KEY_ID'),
    secretAccessKey: required('CLOUDFLARE_R2_SECRET_ACCESS_KEY'),
  },
})

await client.send(new HeadBucketCommand({ Bucket: sourceBucket }))
await client.send(new HeadBucketCommand({ Bucket: destinationBucket }))

const keys = Array.from(new Set([
  ...(await listZipKeys(client, sourceBucket, 'templates/')),
  ...(await listZipKeys(client, sourceBucket, 'packages/')),
])).sort()

if (!keys.length) throw new Error('No ZIP package objects were found in the public source bucket.')

const verifiedKeys = []
for (const key of keys) {
  const source = await client.send(new GetObjectCommand({ Bucket: sourceBucket, Key: key }))
  if (!source.Body) throw new Error('Source object is empty: ' + key)

  const body = Buffer.from(await source.Body.transformToByteArray())
  await client.send(new PutObjectCommand({
    Bucket: destinationBucket,
    Key: key,
    Body: body,
    ContentType: source.ContentType || 'application/zip',
    CacheControl: 'private, no-store',
    Metadata: source.Metadata,
  }))

  const destination = await client.send(new HeadObjectCommand({ Bucket: destinationBucket, Key: key }))
  if (Number(destination.ContentLength || 0) !== body.length) {
    throw new Error('Destination size verification failed: ' + key)
  }
  verifiedKeys.push(key)
}

console.log('Copied and verified ' + verifiedKeys.length + ' ZIP objects in private bucket ' + destinationBucket + '.')

if (process.argv.includes('--delete-source')) {
  if (process.env.CONFIRM_DELETE_PUBLIC_PACKAGES !== 'DELETE_PUBLIC_PACKAGE_COPIES') {
    throw new Error('Set CONFIRM_DELETE_PUBLIC_PACKAGES=DELETE_PUBLIC_PACKAGE_COPIES before using --delete-source.')
  }

  for (const key of verifiedKeys) {
    await client.send(new DeleteObjectCommand({ Bucket: sourceBucket, Key: key }))
  }
  console.log('Deleted ' + verifiedKeys.length + ' verified ZIP objects from public bucket ' + sourceBucket + '.')
} else {
  console.log('No source objects were deleted. Deploy with the private bucket first, then rerun with --delete-source.')
}
