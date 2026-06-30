import dashboardStore from '../../data/dashboard-kits-store.json'
import { SEO_LANGUAGES } from '@/lib/seo-languages'

export type DashboardKitStatus = 'available' | 'draft' | 'coming-soon'

export type DashboardKit = {
  id: string
  slug: string
  title: string
  shortTitle: string
  status: DashboardKitStatus
  category: string
  categoryTitle: string
  summary: string
  description: string
  seoTitle: string
  metaDescription: string
  priceUsd: number
  originalPriceUsd: number
  framework: 'nextjs'
  frameworkLabel: string
  previewPath: string
  livePreviewUrl?: string
  packageFilename: string
  packageKey?: string
  coverImage?: string
  screenshots: string[]
  tags: string[]
  keywords: string[]
  techStack: string[]
  includedPages: string[]
  features: string[]
  highlights: Array<{ label: string; value: string }>
  useCases: string[]
  metadataLanguages: Array<{ code: string; name: string; direction: 'ltr' | 'rtl' }>
  updatedAt: string
}

export const PREVIEW_BASE_URL =
  process.env.NEXT_PUBLIC_PREVIEW_BASE_URL?.replace(/\/+$/, '') || 'https://preview.mtverse.dev'

const metadataLanguages = SEO_LANGUAGES.slice(0, 31).map((language) => ({
  code: language.code,
  name: language.name,
  direction: language.direction,
}))

function withDashboardKitDefaults(kit: DashboardKit): DashboardKit {
  return {
    ...kit,
    metadataLanguages: Array.isArray(kit.metadataLanguages) && kit.metadataLanguages.length ? kit.metadataLanguages : metadataLanguages,
  }
}

export const dashboardKits: DashboardKit[] = (dashboardStore.kits as DashboardKit[]).map(withDashboardKitDefaults)

export function getPreviewUrl(kit: Pick<DashboardKit, 'previewPath' | 'livePreviewUrl'>) {
  if (kit.livePreviewUrl?.trim()) return kit.livePreviewUrl.trim()

  return `${PREVIEW_BASE_URL}${kit.previewPath.startsWith('/') ? kit.previewPath : `/${kit.previewPath}`}`
}

export function getAvailableDashboardKits(kits = dashboardKits) {
  return kits.filter((kit) => kit.status === 'available')
}

export function getDashboardKitBySlug(slug: string, kits = dashboardKits) {
  return kits.find((kit) => kit.slug === slug) || null
}
