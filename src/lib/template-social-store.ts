import 'server-only'

import { randomBytes } from 'node:crypto'
import { existsSync } from 'fs'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { hasRuntimeKvStore, readRuntimeJsonNoStore, writeRuntimeJson } from '@/lib/runtime-kv'
import { dashboardKits } from '@/lib/dashboard-kits'
import type { Template, TemplateReview } from '@/lib/templates-catalog'

const DATA_DIR = join(process.cwd(), 'data')
const STORE_FILE = join(DATA_DIR, 'template-social-store.json')
const RUNTIME_STORE_KEY = 'mtverse:template-social-store:v1'
const MAX_VISIBLE_REVIEWS = 3
const MAX_STORED_REVIEWS = 20

const DASHBOARD_TEMPLATE_SLUGS = dashboardKits.map((kit) => kit.slug)

const SEEDED_SOCIAL: Record<string, { purchaseCount: number; reviews: TemplateReview[] }> = {
  'helios-pro': {
    purchaseCount: 138,
    reviews: [
      {
        id: 'seed-helios-1',
        name: 'Maya Iyer',
        rating: 5,
        title: 'Premium admin kit feel',
        comment: 'The page range, command palette, dark mode, and dashboard widgets make it feel like a mature product starter, not a basic admin shell.',
        date: '2026-03-08T10:10:00.000Z',
        verifiedPurchase: false,
        source: 'internal',
      },
      {
        id: 'seed-helios-2',
        name: 'Ethan Cole',
        rating: 5,
        title: 'Strong SaaS dashboard base',
        comment: 'The layouts cover the usual SaaS, analytics, ecommerce, and support screens. It is easy to picture this becoming a real client dashboard.',
        date: '2026-03-04T14:25:00.000Z',
        verifiedPurchase: false,
        source: 'internal',
      },
      {
        id: 'seed-helios-3',
        name: 'Sara Lin',
        rating: 4,
        title: 'Good structure for teams',
        comment: 'The reusable cards, tables, chart sections, and settings screens are organized clearly enough for a team to customize quickly.',
        date: '2026-03-10T16:40:00.000Z',
        verifiedPurchase: false,
        source: 'internal',
      },
    ],
  },
  'lumiere-ecommerce': {
    purchaseCount: 112,
    reviews: [
      {
        id: 'seed-lumiere-1',
        name: 'Nisha Patel',
        rating: 5,
        title: 'Storefront and admin in one package',
        comment: 'The storefront, cart, checkout states, and admin screens line up well. It feels like a complete ecommerce starter instead of a landing page.',
        date: '2026-02-22T09:20:00.000Z',
        verifiedPurchase: false,
        source: 'internal',
      },
      {
        id: 'seed-lumiere-2',
        name: 'Owen Brooks',
        rating: 5,
        title: 'Realistic ecommerce flows',
        comment: 'Product filters, wishlist, coupons, checkout, and order views are already mapped out, which makes client demos much easier.',
        date: '2026-02-18T13:05:00.000Z',
        verifiedPurchase: false,
        source: 'internal',
      },
      {
        id: 'seed-lumiere-3',
        name: 'Keerthana S',
        rating: 4,
        title: 'Useful retail starter',
        comment: 'The demo data is practical and the admin dashboard covers the main catalog and order workflows a small store needs.',
        date: '2026-02-04T17:30:00.000Z',
        verifiedPurchase: false,
        source: 'internal',
      },
    ],
  },
  'mtverse-modular-nextjs-dashboard-template': {
    purchaseCount: 103,
    reviews: [
      {
        id: 'seed-mtmodular-1',
        name: 'Ravi Kumar',
        rating: 5,
        title: 'Clean ecommerce workflow',
        comment: 'The dashboard sections are easy to scan, and the revenue/order views feel ready for a real commerce admin.',
        date: '2026-02-15T09:30:00.000Z',
        verifiedPurchase: false,
        source: 'internal',
      },
      {
        id: 'seed-mtmodular-2',
        name: 'Meera Shah',
        rating: 5,
        title: 'Great responsive layout',
        comment: 'The sidebar, cards, and charts keep their spacing well on laptop and tablet sizes. It saved a lot of setup time.',
        date: '2026-02-10T12:15:00.000Z',
        verifiedPurchase: false,
        source: 'internal',
      },
      {
        id: 'seed-mtmodular-3',
        name: 'Daniel Park',
        rating: 4,
        title: 'Useful analytics starter',
        comment: 'The KPI group and category views are practical for sales reporting. The code structure is simple to extend.',
        date: '2026-01-18T16:45:00.000Z',
        verifiedPurchase: false,
        source: 'internal',
      },
    ],
  },
  'mt-box-enterprise-nextjs-dashboard-template': {
    purchaseCount: 77,
    reviews: [
      {
        id: 'seed-mtbox-1',
        name: 'Alex Morgan',
        rating: 5,
        title: 'Polished enterprise feel',
        comment: 'The navigation, revenue cards, and workspace layout look premium without feeling heavy. Good base for admin products.',
        date: '2026-03-01T10:20:00.000Z',
        verifiedPurchase: false,
        source: 'internal',
      },
      {
        id: 'seed-mtbox-2',
        name: 'Priya Nair',
        rating: 5,
        title: 'Fast to customize',
        comment: 'The component spacing and visual rhythm are consistent, so replacing the sample data with product data was straightforward.',
        date: '2026-02-25T08:40:00.000Z',
        verifiedPurchase: false,
        source: 'internal',
      },
      {
        id: 'seed-mtbox-3',
        name: 'Sam Wilson',
        rating: 4,
        title: 'Strong SaaS dashboard base',
        comment: 'The traffic and revenue sections cover the usual executive overview needs. A solid template for SaaS admin panels.',
        date: '2026-01-22T14:05:00.000Z',
        verifiedPurchase: false,
        source: 'internal',
      },
    ],
  },
  'mat-dash-nextjs-admin-dashboard-template': {
    purchaseCount: 146,
    reviews: [
      {
        id: 'seed-matdash-1',
        name: 'John Miller',
        rating: 5,
        title: 'Simple and modern',
        comment: 'The clean layout is easy to adapt for internal tools, especially the revenue forecast and activity sections.',
        date: '2026-02-28T11:10:00.000Z',
        verifiedPurchase: false,
        source: 'internal',
      },
      {
        id: 'seed-matdash-2',
        name: 'Ananya Rao',
        rating: 4,
        title: 'Good dashboard starter',
        comment: 'The design is minimal and readable. It is a good fit when you want a calm admin interface with fewer distractions.',
        date: '2026-02-12T13:35:00.000Z',
        verifiedPurchase: false,
        source: 'internal',
      },
      {
        id: 'seed-matdash-3',
        name: 'Chris Evans',
        rating: 5,
        title: 'Practical layout blocks',
        comment: 'The left navigation and analytics cards are production-friendly. It gives a useful starting point for business dashboards.',
        date: '2026-01-28T15:55:00.000Z',
        verifiedPurchase: false,
        source: 'internal',
      },
    ],
  },
}

type UserTemplatePurchase = {
  count: number
  firstPurchasedAt: string
  lastPurchasedAt: string
}

type SavedTemplateRecord = {
  savedAt: string
}

type TemplateSocialRecord = {
  slug: string
  basePurchaseCount: number
  realPurchaseCount: number
  reviews: TemplateReview[]
  updatedAt: string
}

type FreeDownloadRecord = {
  count: number
  slugs: string[]
  unlockedAt: string | null
}

type TemplateUserRecord = {
  email: string
  purchases: Record<string, UserTemplatePurchase>
  reviews: Record<string, string[]>
  savedTemplates: Record<string, SavedTemplateRecord>
  freeDownloads: FreeDownloadRecord
  updatedAt: string
}

type TemplateSocialStoreData = {
  templates: Record<string, TemplateSocialRecord>
  users: Record<string, TemplateUserRecord>
  meta: {
    source: string
    updatedAt: string
    count: number
  }
}

export type TemplateSocial = {
  slug: string
  basePurchaseCount: number
  realPurchaseCount: number
  purchaseCount: number
  rating: number
  reviewCount: number
  reviews: TemplateReview[]
}

export type AdminTemplateReview = TemplateReview & {
  slug: string
}

function nowIso() {
  return new Date().toISOString()
}

function hashSlugForSeed(slug: string) {
  let hash = 0
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0
  }
  return hash
}

function createGenericSeededSocial(slug: string): { purchaseCount: number; reviews: TemplateReview[] } {
  const hash = hashSlugForSeed(slug)
  const names = ['Maya Iyer', 'Ethan Cole', 'Sara Lin', 'Vikram Das', 'Leah Stone', 'Noah Reyes']
  const titles = ['Clear template structure', 'Good starter for client work', 'Polished first impression', 'Easy to adapt']
  const comments = [
    'The page structure is clear, the preview is useful, and the package feels practical for a fast implementation.',
    'The sections are organized well enough to replace demo content with project data without a long cleanup pass.',
    'The visual quality is strong for a starter template, especially when you need something presentable quickly.',
    'The template gives a useful foundation with enough included screens to avoid starting from a blank project.',
  ]

  // Free HTML templates get varied download counts with no copied-looking values.
  // Paid templates stay under 150 for modest social proof.
  const isHtmlFree = slug.startsWith('html-') || slug.includes('-portfolio')
  const purchaseCount = isHtmlFree
    ? 72 + (hash % 318) + ((hash >>> 8) % 11)
    : 54 + (hash % 96)

  return {
    purchaseCount,
    // No reviews for free HTML templates
    reviews: isHtmlFree ? [] : [0, 1, 2].map((offset) => ({
      id: 'seed-' + slug + '-' + (offset + 1),
      name: names[(hash + offset) % names.length],
      rating: offset === 1 ? 4 : 5,
      title: titles[(hash + offset) % titles.length],
      comment: comments[(hash + offset) % comments.length],
      date: new Date(Date.UTC(2026, 1, Math.max(1, 18 - offset * 4), 10 + offset, 15)).toISOString(),
      verifiedPurchase: false,
      source: 'internal',
    })),
  }
}

function getSeededSocial(slug: string) {
  const seeded = SEEDED_SOCIAL[slug] || createGenericSeededSocial(slug)
  return { purchaseCount: seeded.purchaseCount, reviews: [] }
}

function createTemplateRecord(slug: string): TemplateSocialRecord {
  return {
    slug,
    basePurchaseCount: getSeededSocial(slug).purchaseCount,
    realPurchaseCount: 0,
    reviews: [],
    updatedAt: nowIso(),
  }
}

function emptyStore(): TemplateSocialStoreData {
  const templates: Record<string, TemplateSocialRecord> = {}
  for (const slug of DASHBOARD_TEMPLATE_SLUGS) {
    templates[slug] = createTemplateRecord(slug)
  }

  return {
    templates,
    users: {},
    meta: {
      source: 'local-template-social-store',
      updatedAt: nowIso(),
      count: DASHBOARD_TEMPLATE_SLUGS.length,
    },
  }
}

function normalizeEmail(email: string) {
  return email.toLowerCase().trim()
}

function normalizeSlug(slug: string) {
  return slug.trim()
}

function normalizeRating(value: unknown) {
  const rating = Number(value)
  if (!Number.isFinite(rating)) return 5
  return Math.min(5, Math.max(1, Math.round(rating)))
}

function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

function normalizeReview(review: TemplateReview): TemplateReview {
  return {
    id: sanitizeText(review.id, 80) || `review-${randomBytes(6).toString('hex')}`,
    name: sanitizeText(review.name, 80) || 'mtverse customer',
    email: review.email ? normalizeEmail(review.email) : undefined,
    rating: normalizeRating(review.rating),
    title: sanitizeText(review.title, 120),
    comment: sanitizeText(review.comment, 900),
    date: sanitizeText(review.date, 40) || nowIso(),
    verifiedPurchase: Boolean(review.verifiedPurchase),
    source: review.source === 'internal' ? 'internal' : 'customer',
  }
}

function normalizePurchase(purchase: UserTemplatePurchase | undefined): UserTemplatePurchase | null {
  if (!purchase) return null
  const count = Math.max(1, Math.floor(Number(purchase.count) || 1))
  return {
    count,
    firstPurchasedAt: sanitizeText(purchase.firstPurchasedAt, 40) || nowIso(),
    lastPurchasedAt: sanitizeText(purchase.lastPurchasedAt, 40) || nowIso(),
  }
}

function normalizeUserRecord(emailKey: string, record: Partial<TemplateUserRecord> | undefined): TemplateUserRecord {
  const email = normalizeEmail(record?.email || emailKey)
  const purchases: Record<string, UserTemplatePurchase> = {}
  const reviews: Record<string, string[]> = {}
  const savedTemplates: Record<string, SavedTemplateRecord> = {}

  for (const [slug, purchase] of Object.entries(record?.purchases || {})) {
    const normalized = normalizePurchase(purchase)
    if (normalized) purchases[normalizeSlug(slug)] = normalized
  }

  for (const [slug, reviewIds] of Object.entries(record?.reviews || {})) {
    if (!Array.isArray(reviewIds)) continue
    reviews[normalizeSlug(slug)] = reviewIds
      .map((id) => sanitizeText(id, 80))
      .filter(Boolean)
      .slice(0, MAX_STORED_REVIEWS)
  }

  for (const [slug, saved] of Object.entries(record?.savedTemplates || {})) {
    savedTemplates[normalizeSlug(slug)] = {
      savedAt: sanitizeText(saved.savedAt, 40) || nowIso(),
    }
  }

  return {
    email,
    purchases,
    reviews,
    savedTemplates,
    freeDownloads: {
      count: Math.max(0, Math.floor(Number(record?.freeDownloads?.count) || 0)),
      slugs: Array.isArray(record?.freeDownloads?.slugs)
        ? record.freeDownloads.slugs.map((s) => normalizeSlug(String(s))).filter(Boolean)
        : [],
      unlockedAt: record?.freeDownloads?.unlockedAt ? sanitizeText(record.freeDownloads.unlockedAt, 40) : null,
    },
    updatedAt: sanitizeText(record?.updatedAt, 40) || nowIso(),
  }
}

function normalizeStore(input: Partial<TemplateSocialStoreData> | null | undefined): TemplateSocialStoreData {
  const fallback = emptyStore()
  const templates = { ...fallback.templates }
  const users: Record<string, TemplateUserRecord> = {}

  if (input?.templates && typeof input.templates === 'object') {
    for (const [slug, record] of Object.entries(input.templates)) {
      if (!record || typeof record !== 'object') continue
      const seeded = getSeededSocial(slug)
      const storedBasePurchaseCount = Math.max(0, Math.floor(Number(record.basePurchaseCount) || 0))
      templates[slug] = {
        slug,
        basePurchaseCount: storedBasePurchaseCount || seeded.purchaseCount,
        realPurchaseCount: Math.max(0, Math.floor(Number(record.realPurchaseCount) || 0)),
        reviews: Array.isArray(record.reviews)
          ? record.reviews.map(normalizeReview).filter((review) => review.source === 'customer').slice(0, MAX_STORED_REVIEWS)
          : [],
        updatedAt: sanitizeText(record.updatedAt, 40) || nowIso(),
      }
    }
  }

  if (input?.users && typeof input.users === 'object') {
    for (const [email, record] of Object.entries(input.users)) {
      const normalized = normalizeUserRecord(email, record)
      users[normalized.email] = normalized
    }
  }

  return {
    templates,
    users,
    meta: {
      source: sanitizeText(input?.meta?.source, 80) || fallback.meta.source,
      updatedAt: sanitizeText(input?.meta?.updatedAt, 40) || nowIso(),
      count: Object.keys(templates).length,
    },
  }
}

async function ensureStoreFile() {
  if (process.env.VERCEL) return

  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true })
  }

  if (!existsSync(STORE_FILE)) {
    await writeFile(STORE_FILE, JSON.stringify(emptyStore(), null, 2), 'utf-8')
  }
}

async function readStore(): Promise<TemplateSocialStoreData> {
  if (hasRuntimeKvStore()) {
    const runtimeStore = await readRuntimeJsonNoStore<TemplateSocialStoreData>(RUNTIME_STORE_KEY)
    if (runtimeStore) return normalizeStore(runtimeStore)
  }

  await ensureStoreFile()

  try {
    const raw = await readFile(STORE_FILE, 'utf-8')
    return normalizeStore(JSON.parse(raw) as TemplateSocialStoreData)
  } catch {
    return emptyStore()
  }
}

async function writeStore(store: TemplateSocialStoreData) {
  const payload: TemplateSocialStoreData = {
    ...store,
    meta: {
      ...store.meta,
      updatedAt: nowIso(),
      count: Object.keys(store.templates).length,
    },
  }

  if (hasRuntimeKvStore()) {
    await writeRuntimeJson(RUNTIME_STORE_KEY, payload)
    return payload
  }

  if (process.env.VERCEL) {
    throw new Error('Template social storage needs UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in production.')
  }

  await ensureStoreFile()
  await writeFile(STORE_FILE, JSON.stringify(payload, null, 2), 'utf-8')
  return payload
}

function getRecord(store: TemplateSocialStoreData, slug: string) {
  const safeSlug = normalizeSlug(slug)
  if (!store.templates[safeSlug]) {
    store.templates[safeSlug] = createTemplateRecord(safeSlug)
  }
  return store.templates[safeSlug]
}

function getUserRecord(store: TemplateSocialStoreData, email: string) {
  const safeEmail = normalizeEmail(email)
  if (!store.users[safeEmail]) {
    store.users[safeEmail] = normalizeUserRecord(safeEmail, {
      email: safeEmail,
      purchases: {},
      reviews: {},
      savedTemplates: {},
      updatedAt: nowIso(),
    })
  }
  return store.users[safeEmail]
}

function getVisibleReviews(_record: TemplateSocialRecord) {
  return []
}

function calculateRating(reviews: TemplateReview[]) {
  if (!reviews.length) return 0
  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  return Number(average.toFixed(1))
}

function toPublicSocial(record: TemplateSocialRecord): TemplateSocial {
  const reviews = getVisibleReviews(record)
  return {
    slug: record.slug,
    basePurchaseCount: record.basePurchaseCount,
    realPurchaseCount: record.realPurchaseCount,
    purchaseCount: record.basePurchaseCount + record.realPurchaseCount,
    rating: calculateRating(reviews),
    reviewCount: reviews.length,
    reviews,
  }
}

export async function getTemplateSocial(slug: string): Promise<TemplateSocial> {
  const store = await readStore()
  return toPublicSocial(getRecord(store, slug))
}

export async function getTemplateSocialMap(slugs: string[]) {
  const store = await readStore()
  const map: Record<string, TemplateSocial> = {}
  for (const slug of slugs) {
    map[slug] = toPublicSocial(getRecord(store, slug))
  }
  return map
}

export async function getTemplateSocialAdmin() {
  const store = await readStore()
  return Object.values(store.templates).map(toPublicSocial)
}

export async function getRecentTemplateReviews(limit = 12): Promise<AdminTemplateReview[]> {
  const store = await readStore()
  return Object.values(store.templates)
    .flatMap((record) => record.reviews
      .filter((review) => review.source === 'customer')
      .map((review) => ({ ...normalizeReview(review), slug: record.slug })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

export function applyTemplateSocial<T extends Template>(template: T, social: TemplateSocial): T {
  return {
    ...template,
    rating: social.rating,
    reviewCount: social.reviewCount,
    salesCount: social.purchaseCount,
    reviews: social.reviews,
  }
}

export async function withTemplateSocial<T extends Template>(template: T): Promise<T> {
  const social = await getTemplateSocial(template.slug)
  return applyTemplateSocial(template, social)
}

export async function withAllTemplateSocial<T extends Template>(templates: T[]): Promise<T[]> {
  const socialMap = await getTemplateSocialMap(templates.map((template) => template.slug))
  return templates.map((template) => applyTemplateSocial(template, socialMap[template.slug]))
}

export async function addTemplateReview(input: {
  slug: string
  email: string
  name?: string | null
  rating: unknown
  title: unknown
  comment: unknown
  verifiedPurchase?: boolean
}) {
  const store = await readStore()
  const safeSlug = normalizeSlug(input.slug)
  const email = normalizeEmail(input.email)
  const record = getRecord(store, safeSlug)
  const title = sanitizeText(input.title, 120)
  const comment = sanitizeText(input.comment, 900)

  if (!title || !comment) {
    throw new Error('Review title and comment are required.')
  }

  const review: TemplateReview = {
    id: `review-${Date.now()}-${randomBytes(4).toString('hex')}`,
    name: sanitizeText(input.name, 80) || email.split('@')[0] || 'mtverse customer',
    email,
    rating: normalizeRating(input.rating),
    title,
    comment,
    date: nowIso(),
    verifiedPurchase: Boolean(input.verifiedPurchase),
    source: 'customer',
  }

  record.reviews = [review, ...record.reviews.map(normalizeReview).filter((item) => item.source === 'customer')]
    .slice(0, MAX_STORED_REVIEWS)
  record.updatedAt = nowIso()

  const userRecord = getUserRecord(store, email)
  userRecord.reviews[safeSlug] = [review.id, ...(userRecord.reviews[safeSlug] || [])].slice(0, MAX_STORED_REVIEWS)
  userRecord.updatedAt = nowIso()
  store.users[email] = userRecord

  await writeStore(store)
  return toPublicSocial(record)
}

export async function recordTemplatePurchase(slug: string | null | undefined, emailInput: string | null | undefined) {
  const safeSlug = slug ? normalizeSlug(slug) : ''
  const email = emailInput ? normalizeEmail(emailInput) : ''
  if (!safeSlug || !email) return null

  const store = await readStore()
  const record = getRecord(store, safeSlug)
  const now = nowIso()
  const userRecord = getUserRecord(store, email)

  const existingPurchase = userRecord.purchases[safeSlug]
  if (existingPurchase) {
    userRecord.purchases[safeSlug] = {
      ...existingPurchase,
      count: Math.max(1, existingPurchase.count),
      lastPurchasedAt: now,
    }
  } else {
    userRecord.purchases[safeSlug] = {
      count: 1,
      firstPurchasedAt: now,
      lastPurchasedAt: now,
    }
    record.realPurchaseCount += 1
  }

  record.updatedAt = now
  userRecord.updatedAt = now
  store.users[email] = userRecord

  await writeStore(store)
  return toPublicSocial(record)
}

export async function hasTemplatePurchase(slug: string, emailInput: string | null | undefined) {
  const email = emailInput ? normalizeEmail(emailInput) : ''
  if (!email) return false

  const store = await readStore()
  return Boolean(store.users[email]?.purchases[normalizeSlug(slug)])
}

export async function isTemplateSaved(slug: string, emailInput: string | null | undefined) {
  const email = emailInput ? normalizeEmail(emailInput) : ''
  if (!email) return false

  const store = await readStore()
  return Boolean(store.users[email]?.savedTemplates?.[normalizeSlug(slug)])
}

export async function setTemplateSaved(slug: string, emailInput: string, saved: boolean) {
  const safeSlug = normalizeSlug(slug)
  const email = normalizeEmail(emailInput)
  const store = await readStore()
  getRecord(store, safeSlug)
  const userRecord = getUserRecord(store, email)

  if (saved) {
    userRecord.savedTemplates[safeSlug] = { savedAt: userRecord.savedTemplates[safeSlug]?.savedAt || nowIso() }
  } else {
    delete userRecord.savedTemplates[safeSlug]
  }

  userRecord.updatedAt = nowIso()
  store.users[email] = userRecord
  await writeStore(store)
  return Boolean(userRecord.savedTemplates[safeSlug])
}

export async function getSavedTemplateSlugs(emailInput: string | null | undefined) {
  const email = emailInput ? normalizeEmail(emailInput) : ''
  if (!email) return []

  const store = await readStore()
  return Object.keys(store.users[email]?.savedTemplates || {})
}


// Free Template Download Functions

const FREE_DOWNLOAD_LIMIT = 5

export type FreeDownloadStatus = {
  count: number
  slugs: string[]
  remaining: number
  limitReached: boolean
  unlocked: boolean
}

export class FreeDownloadLimitError extends Error {
  constructor(message = 'Free download limit reached. Unlock unlimited free downloads for $5.') {
    super(message)
    this.name = 'FreeDownloadLimitError'
  }
}

export async function getFreeDownloadStatus(emailInput: string | null | undefined): Promise<FreeDownloadStatus> {
  const email = emailInput ? normalizeEmail(emailInput) : ''
  if (!email) return { count: 0, slugs: [], remaining: FREE_DOWNLOAD_LIMIT, limitReached: false, unlocked: false }

  const store = await readStore()
  const userRecord = store.users[email]
  const freeDownloads = userRecord?.freeDownloads || { count: 0, slugs: [], unlockedAt: null }
  const unlocked = Boolean(freeDownloads.unlockedAt)

  return {
    count: freeDownloads.count,
    slugs: freeDownloads.slugs,
    remaining: unlocked ? Infinity : Math.max(0, FREE_DOWNLOAD_LIMIT - freeDownloads.count),
    limitReached: !unlocked && freeDownloads.count >= FREE_DOWNLOAD_LIMIT,
    unlocked,
  }
}

export async function hasFreeDownload(slug: string, emailInput: string | null | undefined): Promise<boolean> {
  const email = emailInput ? normalizeEmail(emailInput) : ''
  if (!email) return false

  const store = await readStore()
  const userRecord = store.users[email]
  return Boolean(userRecord?.freeDownloads?.slugs?.includes(normalizeSlug(slug)))
}

export async function recordFreeDownload(slug: string, emailInput: string): Promise<FreeDownloadStatus> {
  const safeSlug = normalizeSlug(slug)
  const email = normalizeEmail(emailInput)
  const store = await readStore()
  const userRecord = getUserRecord(store, email)
  const now = nowIso()

  // If already downloaded this slug, don't increment counter
  if (userRecord.freeDownloads.slugs.includes(safeSlug)) {
    const unlocked = Boolean(userRecord.freeDownloads.unlockedAt)
    return {
      count: userRecord.freeDownloads.count,
      slugs: userRecord.freeDownloads.slugs,
      remaining: unlocked ? Infinity : Math.max(0, FREE_DOWNLOAD_LIMIT - userRecord.freeDownloads.count),
      limitReached: !unlocked && userRecord.freeDownloads.count >= FREE_DOWNLOAD_LIMIT,
      unlocked,
    }
  }

  if (!userRecord.freeDownloads.unlockedAt && userRecord.freeDownloads.count >= FREE_DOWNLOAD_LIMIT) {
    throw new FreeDownloadLimitError()
  }

  // Add new slug
  userRecord.freeDownloads.slugs.push(safeSlug)
  userRecord.freeDownloads.count = userRecord.freeDownloads.slugs.length
  userRecord.updatedAt = now
  store.users[email] = userRecord

  // Also increment the template's purchase count for social proof
  const record = getRecord(store, safeSlug)
  record.realPurchaseCount += 1
  record.updatedAt = now

  await writeStore(store)

  const unlocked = Boolean(userRecord.freeDownloads.unlockedAt)
  return {
    count: userRecord.freeDownloads.count,
    slugs: userRecord.freeDownloads.slugs,
    remaining: unlocked ? Infinity : Math.max(0, FREE_DOWNLOAD_LIMIT - userRecord.freeDownloads.count),
    limitReached: !unlocked && userRecord.freeDownloads.count >= FREE_DOWNLOAD_LIMIT,
    unlocked,
  }
}

export async function setFreeUnlocked(emailInput: string): Promise<void> {
  const email = normalizeEmail(emailInput)
  const store = await readStore()
  const userRecord = getUserRecord(store, email)

  userRecord.freeDownloads.unlockedAt = nowIso()
  userRecord.updatedAt = nowIso()
  store.users[email] = userRecord

  await writeStore(store)
}
