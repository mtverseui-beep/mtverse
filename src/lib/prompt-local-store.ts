import 'server-only'

import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import { PROMPTS, type PromptEntry } from '@/lib/prompt-library-data'
import { isCloudflarePromptImageUrl } from '@/lib/prompt-image-hosts'

const DATA_DIR = path.join(process.cwd(), 'data')
const LOCAL_PROMPT_STORE_FILE = path.join(DATA_DIR, 'prompt-local-store.json')
const LOCAL_PROMPT_TITLE_REGISTRY_FILE = path.join(DATA_DIR, 'prompt-topic-titles.txt')
const UPSTASH_PROMPT_STORE_LEGACY_KEY = 'mtverse:prompt-local-store:v1'
const UPSTASH_PROMPT_STORE_HASH_KEY = 'mtverse:prompt-local-store:v2:prompts'
const UPSTASH_PROMPT_DELETED_SET_KEY = 'mtverse:prompt-local-store:v2:deleted'
const UPSTASH_PROMPT_META_KEY = 'mtverse:prompt-local-store:v2:meta'
const UPSTASH_WRITE_CHUNK_SIZE = 8
const UPSTASH_SCAN_COUNT = 50
const UPSTASH_SCAN_LIMIT = 2000

type PromptLocalStoreFile = {
  prompts: PromptEntry[]
  deletedPromptKeys?: string[]
  meta?: {
    source: string
    generatedAt: string
    count: number
  }
}

export type PromptDeleteTarget = {
  id?: string
  slug?: string
  title?: string
}

function normalizeTopic(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function getPromptMatchKey(prompt: PromptEntry) {
  return prompt.slug || normalizeTopic(prompt.title)
}

function hasPublicR2Preview(value: string) {
  return isCloudflarePromptImageUrl(value)
}

function normalizeStoreKey(value: string) {
  return value.trim().toLowerCase()
}

function getPromptIdentityKeys(prompt: Pick<PromptEntry, 'id' | 'slug' | 'title'>) {
  return Array.from(
    new Set(
      [prompt.id, prompt.slug, prompt.slug ? slugSafePromptKey(prompt.slug) : '', prompt.title, normalizeTopic(prompt.title)]
        .filter((value): value is string => Boolean(value && value.trim()))
        .map(normalizeStoreKey)
    )
  )
}

function slugSafePromptKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function getDeleteTargetKeys(target: PromptDeleteTarget) {
  return Array.from(
    new Set(
      [target.id, target.slug, target.slug ? slugSafePromptKey(target.slug) : '', target.title, target.title ? normalizeTopic(target.title) : '']
        .filter((value): value is string => Boolean(value && value.trim()))
        .map(normalizeStoreKey)
    )
  )
}

function promptMatchesKeys(prompt: Pick<PromptEntry, 'id' | 'slug' | 'title'>, keys: Set<string>) {
  return getPromptIdentityKeys(prompt).some(key => keys.has(key))
}

function filterDeletedPrompts(prompts: PromptEntry[], deletedPromptKeys: string[]) {
  if (deletedPromptKeys.length === 0) return prompts
  const deletedKeys = new Set(deletedPromptKeys.map(normalizeStoreKey))
  return prompts.filter(prompt => !promptMatchesKeys(prompt, deletedKeys))
}

function sortPrompts(prompts: PromptEntry[]) {
  return [...prompts].sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1
    }

    return left.title.localeCompare(right.title)
  })
}

async function ensureDataDirectory() {
  await mkdir(DATA_DIR, { recursive: true })
}

function getUpstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()

  if (!url || !token) return null

  return {
    url: url.replace(/\/$/, ''),
    token,
  }
}

async function callUpstashPipeline(commands: Array<Array<string | number>>, mode: 'read' | 'write', noStore = false) {
  const config = getUpstashConfig()
  if (!config) return null
  const init: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  }

  if (mode === 'read' && noStore) {
    init.cache = 'no-store'
  } else if (mode === 'read') {
    init.next = {
      revalidate: 300,
      tags: ['prompts'],
    }
  } else {
    init.cache = 'no-store'
  }

  const response = await fetch(`${config.url}/pipeline`, {
    ...init,
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`Prompt store failed with ${response.status}${detail ? `: ${detail.slice(0, 240)}` : ''}`)
  }

  const result = (await response.json()) as Array<{ result?: unknown; error?: string }>
  const commandError = result.find(entry => entry?.error)
  if (commandError?.error) {
    throw new Error(`Prompt store command failed: ${commandError.error}`)
  }

  return result
}

function chunkArray<T>(items: T[], size: number) {
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }
  return chunks
}

function parseStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : []
}

function parseUpstashHash(value: unknown) {
  if (Array.isArray(value)) {
    const records: Array<[string, string]> = []
    for (let index = 0; index < value.length; index += 2) {
      const field = value[index]
      const record = value[index + 1]
      if (typeof field === 'string' && typeof record === 'string') records.push([field, record])
    }
    return records
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
  }

  return []
}

function parseScanCursor(value: unknown) {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return '0'
}

function parseHscanResult(value: unknown) {
  if (!Array.isArray(value)) {
    return {
      cursor: '0',
      records: [] as Array<[string, string]>,
    }
  }

  return {
    cursor: parseScanCursor(value[0]),
    records: parseUpstashHash(value[1]),
  }
}

function parseSscanResult(value: unknown) {
  if (!Array.isArray(value)) {
    return {
      cursor: '0',
      values: [] as string[],
    }
  }

  return {
    cursor: parseScanCursor(value[0]),
    values: parseStringArray(value[1]),
  }
}

function shouldReadLegacyUpstashPromptStore() {
  const configured = process.env.UPSTASH_PROMPT_READ_LEGACY_STORE?.trim().toLowerCase()
  if (configured === 'true') return true
  if (configured === 'false') return false

  return !process.env.VERCEL
}

function getPromptStoreField(prompt: PromptEntry) {
  return getPromptMatchKey(prompt) || prompt.id || slugSafePromptKey(prompt.title)
}

function parsePromptRecord(record: string) {
  try {
    return JSON.parse(record) as PromptEntry
  } catch {
    return null
  }
}

async function readUpstashStoreV2(noStore = false) {
  const prompts: PromptEntry[] = []
  let promptCursor = '0'
  let promptScans = 0

  do {
    const result = await callUpstashPipeline(
      [['HSCAN', UPSTASH_PROMPT_STORE_HASH_KEY, promptCursor, 'COUNT', UPSTASH_SCAN_COUNT]],
      'read',
      noStore
    )
    const scan = parseHscanResult(result?.[0]?.result)
    promptCursor = scan.cursor
    promptScans += 1

    for (const [, record] of scan.records) {
      const prompt = parsePromptRecord(record)
      if (prompt) prompts.push(prompt)
    }
  } while (promptCursor !== '0' && promptScans < UPSTASH_SCAN_LIMIT)

  const deletedPromptKeys: string[] = []
  let deletedCursor = '0'
  let deletedScans = 0

  do {
    const result = await callUpstashPipeline(
      [['SSCAN', UPSTASH_PROMPT_DELETED_SET_KEY, deletedCursor, 'COUNT', UPSTASH_SCAN_COUNT]],
      'read',
      noStore
    )
    const scan = parseSscanResult(result?.[0]?.result)
    deletedCursor = scan.cursor
    deletedScans += 1
    deletedPromptKeys.push(...scan.values.map(normalizeStoreKey).filter(Boolean))
  } while (deletedCursor !== '0' && deletedScans < UPSTASH_SCAN_LIMIT)

  if (prompts.length === 0 && deletedPromptKeys.length === 0) return null

  return {
    prompts,
    deletedPromptKeys,
  }
}

async function readUpstashLegacyStore(noStore = false) {
  const result = await callUpstashPipeline([['GET', UPSTASH_PROMPT_STORE_LEGACY_KEY]], 'read', noStore)
  const raw = result?.[0]?.result

  if (typeof raw !== 'string' || !raw.trim()) return null

  const parsed = JSON.parse(raw) as Partial<PromptLocalStoreFile>
  return {
    prompts: Array.isArray(parsed.prompts) ? (parsed.prompts as PromptEntry[]) : [],
    deletedPromptKeys: Array.isArray(parsed.deletedPromptKeys)
      ? parsed.deletedPromptKeys.filter((entry): entry is string => typeof entry === 'string')
      : [],
  }
}

async function writeUpstashStore(payload: PromptLocalStoreFile) {
  const promptFields = payload.prompts.map(prompt => [getPromptStoreField(prompt), JSON.stringify(prompt)] as const)

  for (const chunk of chunkArray(promptFields, UPSTASH_WRITE_CHUNK_SIZE)) {
    const command = ['HSET', UPSTASH_PROMPT_STORE_HASH_KEY] as Array<string | number>
    for (const [field, record] of chunk) {
      command.push(field, record)
    }
    await callUpstashPipeline([command], 'write')
  }

  const existingKeys: string[] = []
  let cursor = '0'
  let scans = 0

  do {
    const result = await callUpstashPipeline(
      [['HSCAN', UPSTASH_PROMPT_STORE_HASH_KEY, cursor, 'COUNT', UPSTASH_SCAN_COUNT]],
      'read'
    )
    const scan = parseHscanResult(result?.[0]?.result)
    cursor = scan.cursor
    scans += 1
    existingKeys.push(...scan.records.map(([field]) => field))
  } while (cursor !== '0' && scans < UPSTASH_SCAN_LIMIT)

  const nextKeys = new Set(promptFields.map(([field]) => field))
  const staleKeys = existingKeys.filter(key => !nextKeys.has(key))

  for (const chunk of chunkArray(staleKeys, 100)) {
    await callUpstashPipeline([['HDEL', UPSTASH_PROMPT_STORE_HASH_KEY, ...chunk]], 'write')
  }

  const deletedKeys = payload.deletedPromptKeys || []
  await callUpstashPipeline([['DEL', UPSTASH_PROMPT_DELETED_SET_KEY]], 'write')
  for (const chunk of chunkArray(deletedKeys, 100)) {
    await callUpstashPipeline([['SADD', UPSTASH_PROMPT_DELETED_SET_KEY, ...chunk]], 'write')
  }

  await callUpstashPipeline(
    [
      ['SET', UPSTASH_PROMPT_META_KEY, JSON.stringify(payload.meta || {})],
      ['DEL', UPSTASH_PROMPT_STORE_LEGACY_KEY],
    ],
    'write'
  )
}

async function writeUpstashPromptOverrides(prompts: PromptEntry[], deletedKeysToClear: string[] = []) {
  if (prompts.length === 0) return

  const promptFields = prompts.map(prompt => [getPromptStoreField(prompt), JSON.stringify(prompt)] as const)
  for (const chunk of chunkArray(promptFields, UPSTASH_WRITE_CHUNK_SIZE)) {
    const command = ['HSET', UPSTASH_PROMPT_STORE_HASH_KEY] as Array<string | number>
    for (const [field, record] of chunk) {
      command.push(field, record)
    }
    await callUpstashPipeline([command], 'write')
  }

  const clearKeys = Array.from(new Set(deletedKeysToClear.map(normalizeStoreKey).filter(Boolean)))
  for (const chunk of chunkArray(clearKeys, 100)) {
    await callUpstashPipeline([['SREM', UPSTASH_PROMPT_DELETED_SET_KEY, ...chunk]], 'write')
  }

  await callUpstashPipeline(
    [
      ['SET', UPSTASH_PROMPT_META_KEY, JSON.stringify({
        source: prompts.length === 1 ? 'admin-save' : 'admin-bulk-save',
        generatedAt: new Date().toISOString(),
        count: prompts.length,
      })],
    ],
    'write'
  )
}

async function deleteUpstashPromptOverride(targetKeys: string[]) {
  const normalizedKeys = Array.from(new Set(targetKeys.map(normalizeStoreKey).filter(Boolean)))
  if (normalizedKeys.length === 0) return

  for (const chunk of chunkArray(normalizedKeys, 100)) {
    await callUpstashPipeline(
      [
        ['HDEL', UPSTASH_PROMPT_STORE_HASH_KEY, ...chunk],
        ['SADD', UPSTASH_PROMPT_DELETED_SET_KEY, ...chunk],
      ],
      'write'
    )
  }

  await callUpstashPipeline(
    [
      ['SET', UPSTASH_PROMPT_META_KEY, JSON.stringify({
        source: 'admin-delete',
        generatedAt: new Date().toISOString(),
        count: normalizedKeys.length,
      })],
    ],
    'write'
  )
}

async function writeTitleRegistry(prompts: PromptEntry[]) {
  const lines = sortPrompts(prompts).map(prompt => `${normalizeTopic(prompt.title)} | ${prompt.title} | ${prompt.slug}`)
  await writeFile(LOCAL_PROMPT_TITLE_REGISTRY_FILE, `${lines.join('\n')}\n`, 'utf8')
}

async function writeLocalStore(prompts: PromptEntry[], source: string, deletedPromptKeys: string[] = []) {
  const sortedPrompts = sortPrompts(prompts)
  const normalizedDeletedKeys = Array.from(new Set(deletedPromptKeys.map(normalizeStoreKey).filter(Boolean)))
  const payload: PromptLocalStoreFile = {
    prompts: sortedPrompts,
    deletedPromptKeys: normalizedDeletedKeys,
    meta: {
      source,
      generatedAt: new Date().toISOString(),
      count: sortedPrompts.length,
    },
  }

  if (getUpstashConfig()) {
    if (!process.env.VERCEL) {
      await ensureDataDirectory()
      await writeFile(LOCAL_PROMPT_STORE_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
      await writeTitleRegistry(sortedPrompts)

      return sortedPrompts
    }

    await writeUpstashStore(payload)

    return sortedPrompts
  }

  if (process.env.VERCEL) {
    throw new Error(
      'mtverse admin writes need UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN on Vercel, or must be run locally where data files are writable.'
    )
  }

  await ensureDataDirectory()
  await writeFile(LOCAL_PROMPT_STORE_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  await writeTitleRegistry(sortedPrompts)

  return sortedPrompts
}

async function readBundledLocalStore() {
  try {
    const raw = await readFile(LOCAL_PROMPT_STORE_FILE, 'utf8')
    const parsed = JSON.parse(raw) as Partial<PromptLocalStoreFile>
    return {
      prompts: Array.isArray(parsed.prompts) ? (parsed.prompts as PromptEntry[]) : [],
      deletedPromptKeys: Array.isArray(parsed.deletedPromptKeys)
        ? parsed.deletedPromptKeys.filter((entry): entry is string => typeof entry === 'string')
        : [],
    }
  } catch {
    return {
      prompts: [],
      deletedPromptKeys: [],
    }
  }
}

async function readLocalStore(options: { noStore?: boolean } = {}) {
  const bundledStore = await readBundledLocalStore()

  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return bundledStore
  }

  if (getUpstashConfig()) {
    try {
      const upstashStoreV2 = await readUpstashStoreV2(options.noStore).catch(error => {
        console.error('Prompt Upstash v2 store read failed:', error)
        return null
      })
      const legacyStore = shouldReadLegacyUpstashPromptStore()
        ? await readUpstashLegacyStore(options.noStore).catch(error => {
            console.error('Prompt Upstash legacy store read failed:', error)
            return null
          })
        : null
      const upstashStore = upstashStoreV2 && legacyStore
        ? {
            prompts: mergePromptEntries(legacyStore.prompts, upstashStoreV2.prompts),
            deletedPromptKeys: Array.from(new Set([...legacyStore.deletedPromptKeys, ...upstashStoreV2.deletedPromptKeys].map(normalizeStoreKey))),
          }
        : upstashStoreV2 || legacyStore
      if (upstashStore) {
        const deletedPromptKeys = Array.from(
          new Set([...bundledStore.deletedPromptKeys, ...upstashStore.deletedPromptKeys].map(normalizeStoreKey))
        )

        return {
          prompts: mergePromptEntries(
            filterDeletedPrompts(bundledStore.prompts, deletedPromptKeys),
            filterDeletedPrompts(upstashStore.prompts, deletedPromptKeys)
          ),
          deletedPromptKeys,
        }
      }
    } catch (error) {
      console.error('Prompt Upstash store read failed:', error)
    }
  }

  return bundledStore
}

function mergePromptEntries(basePrompts: PromptEntry[], overridePrompts: PromptEntry[]) {
  const byKey = new Map<string, PromptEntry>()

  for (const prompt of basePrompts) {
    byKey.set(getPromptMatchKey(prompt), prompt)
  }

  for (const prompt of overridePrompts) {
    const key = getPromptMatchKey(prompt)
    const existing = byKey.get(key)

    if (existing && hasPublicR2Preview(existing.previewImage) && !hasPublicR2Preview(prompt.previewImage)) {
      byKey.set(key, {
        ...prompt,
        previewImage: existing.previewImage,
        previewAlt: existing.previewAlt || prompt.previewAlt,
        previewWidth: existing.previewWidth || prompt.previewWidth,
        previewHeight: existing.previewHeight || prompt.previewHeight,
      })
      continue
    }

    byKey.set(key, prompt)
  }

  return sortPrompts(Array.from(byKey.values()))
}

export async function loadLocalPromptOverrideStore() {
  return (await readLocalStore()).prompts
}

export async function loadLocalPromptStoreState(options: { noStore?: boolean } = {}) {
  return readLocalStore(options)
}

export async function getMergedLocalPromptEntries(options: { noStore?: boolean } = {}) {
  const store = await loadLocalPromptStoreState(options)
  return mergePromptEntries(
    filterDeletedPrompts(PROMPTS, store.deletedPromptKeys),
    filterDeletedPrompts(store.prompts, store.deletedPromptKeys)
  )
}

export async function saveLocalPrompt(prompt: PromptEntry) {
  if (getUpstashConfig() && process.env.VERCEL) {
    await writeUpstashPromptOverrides([prompt], getPromptIdentityKeys(prompt))
    return true
  }

  const currentStore = await loadLocalPromptStoreState()
  const nextDeletedKeys = currentStore.deletedPromptKeys.filter(key => !promptMatchesKeys(prompt, new Set([normalizeStoreKey(key)])))
  const nextOverrides = currentStore.prompts.filter(existing => {
    const sameSlug = existing.slug === prompt.slug
    const sameId = existing.id === prompt.id
    const sameTitle = normalizeTopic(existing.title) === normalizeTopic(prompt.title)
    return !(sameSlug || sameId || sameTitle)
  })

  nextOverrides.push(prompt)
  await writeLocalStore(nextOverrides, 'admin-save', nextDeletedKeys)

  if (getUpstashConfig()) {
    try {
      await writeUpstashPromptOverrides([prompt], getPromptIdentityKeys(prompt))
    } catch (error) {
      console.error('Prompt Upstash prompt override write failed; saved local fallback instead:', error)
    }
  }

  return true
}

export async function saveLocalPrompts(prompts: PromptEntry[]) {
  if (getUpstashConfig() && process.env.VERCEL) {
    await writeUpstashPromptOverrides(prompts, prompts.flatMap(getPromptIdentityKeys))

    return {
      success: true,
      count: prompts.length,
    }
  }

  const currentStore = await loadLocalPromptStoreState()
  const incomingKeys = new Set(prompts.map(getPromptMatchKey))
  const incomingIdentityKeys = new Set(prompts.flatMap(getPromptIdentityKeys))
  const nextDeletedKeys = currentStore.deletedPromptKeys.filter(key => !incomingIdentityKeys.has(normalizeStoreKey(key)))
  const nextOverrides = currentStore.prompts.filter(existing => !incomingKeys.has(getPromptMatchKey(existing)))

  nextOverrides.push(...prompts)
  await writeLocalStore(nextOverrides, 'admin-bulk-save', nextDeletedKeys)

  if (getUpstashConfig()) {
    try {
      await writeUpstashPromptOverrides(prompts, prompts.flatMap(getPromptIdentityKeys))
    } catch (error) {
      console.error('Prompt Upstash prompt override bulk write failed; saved local fallback instead:', error)
    }
  }

  return {
    success: true,
    count: prompts.length,
  }
}

export async function deleteLocalPrompt(target: PromptDeleteTarget) {
  const targetKeys = getDeleteTargetKeys(target)

  if (targetKeys.length === 0) {
    throw new Error('Choose a prompt to delete.')
  }

  if (getUpstashConfig() && process.env.VERCEL) {
    await deleteUpstashPromptOverride(targetKeys)

    return {
      success: true,
      deletedPromptKeys: targetKeys,
      removedCount: 1,
    }
  }

  const currentStore = await loadLocalPromptStoreState()
  const targetKeySet = new Set(targetKeys)
  const nextPrompts = currentStore.prompts.filter(prompt => !promptMatchesKeys(prompt, targetKeySet))
  const deletedPromptKeys = Array.from(new Set([...currentStore.deletedPromptKeys, ...targetKeys].map(normalizeStoreKey)))

  await writeLocalStore(nextPrompts, 'admin-delete', deletedPromptKeys)

  if (getUpstashConfig()) {
    try {
      await deleteUpstashPromptOverride(targetKeys)
    } catch (error) {
      console.error('Prompt Upstash prompt override delete failed; saved local fallback instead:', error)
    }
  }

  return {
    success: true,
    deletedPromptKeys,
    removedCount: currentStore.prompts.length - nextPrompts.length,
  }
}

export function hasRuntimePromptStore() {
  return Boolean(getUpstashConfig()) || !process.env.VERCEL
}

export function getLocalPromptStorePaths() {
  return {
    storeFile: LOCAL_PROMPT_STORE_FILE,
    titleRegistryFile: LOCAL_PROMPT_TITLE_REGISTRY_FILE,
  }
}
