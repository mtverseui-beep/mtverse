import type { DashboardKit } from '@/lib/dashboard-kits'
import { slugify } from '@/lib/utils'

export type TemplateImportSummary = {
  received: number
  prepared: number
  imported: number
  skippedExisting: number
  skippedIncomingDuplicates: number
  invalid: number
  replaceExisting: boolean
}

function getTemplateSource(payload: unknown) {
  if (Array.isArray(payload)) return payload

  if (payload && typeof payload === 'object') {
    const maybeKits = (payload as { kits?: unknown }).kits
    if (Array.isArray(maybeKits)) return maybeKits

    const maybeTemplates = (payload as { templates?: unknown }).templates
    if (Array.isArray(maybeTemplates)) return maybeTemplates

    return [payload]
  }

  return []
}

function normalizeKey(value: unknown) {
  if (typeof value !== 'string') return ''
  return slugify(value.trim())
}

function getRecordKeys(record: Partial<DashboardKit>) {
  return [normalizeKey(record.slug), normalizeKey(record.id), normalizeKey(record.title)].filter(Boolean)
}

export function parseTemplateImportPayload(
  payload: unknown,
  existingKits: DashboardKit[],
  options?: {
    replaceExisting?: boolean
  }
) {
  const replaceExisting = Boolean(options?.replaceExisting)
  const source = getTemplateSource(payload)
  const existingKeys = new Set(existingKits.flatMap(getRecordKeys))
  const incomingKeys = new Set<string>()

  const kits: Array<Partial<DashboardKit>> = []
  let invalid = 0
  let skippedExisting = 0
  let skippedIncomingDuplicates = 0

  for (const entry of source) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      invalid += 1
      continue
    }

    const record = entry as Partial<DashboardKit>
    const matchKeys = getRecordKeys(record)

    if (matchKeys.length === 0) {
      invalid += 1
      continue
    }

    if (matchKeys.some((key) => incomingKeys.has(key))) {
      skippedIncomingDuplicates += 1
      continue
    }

    const exists = matchKeys.some((key) => existingKeys.has(key))
    if (exists && !replaceExisting) {
      skippedExisting += 1
      continue
    }

    matchKeys.forEach((key) => incomingKeys.add(key))
    kits.push(record)
  }

  return {
    kits,
    summary: {
      received: source.length,
      prepared: kits.length,
      imported: kits.length,
      skippedExisting,
      skippedIncomingDuplicates,
      invalid,
      replaceExisting,
    } satisfies TemplateImportSummary,
  }
}