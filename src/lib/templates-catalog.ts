import type { WeeklyOfferRuntime } from '@/lib/weekly-offer'

export type TemplateCategory = {
  id: string
  label: string
  description: string
  icon: string
}

export type TemplatePricingTier = 'normal' | 'pro'

export type TemplateReview = {
  id: string
  name: string
  email?: string
  rating: number
  title: string
  comment: string
  date: string
  verifiedPurchase?: boolean
  source?: 'customer' | 'internal'
}

export type Template = {
  id: string
  slug: string
  title: string
  summary: string
  activeOffer?: WeeklyOfferRuntime
  description: string
  seoTitle?: string
  metaDescription?: string
  keywords?: string[]
  category: string
  categoryLabel?: string
  subcategory?: string
  tags: string[]
  techStack: string[]
  frameworkLabel?: string
  screenshotUrl: string
  thumbnailUrl: string
  previewUrl?: string
  price: number
  originalPriceUsd?: number
  pricingTier: TemplatePricingTier
  currency: string
  featured: boolean
  trending: boolean
  new: boolean
  rating: number
  reviewCount: number
  reviews: TemplateReview[]
  lastUpdated: string
  author: {
    name: string
    avatar: string
  }
  features: string[]
  useCases?: string[]
  pages: string[]
  components: number
  license: string
  highlights: { title: string; description: string; icon: string }[]
  faq: { question: string; answer: string }[]
  isFree: boolean
}

export type TemplateCatalogItem = Pick<
  Template,
  | 'id'
  | 'slug'
  | 'title'
  | 'summary'
  | 'description'
  | 'activeOffer'
  | 'category'
  | 'subcategory'
  | 'tags'
  | 'techStack'
  | 'frameworkLabel'
  | 'screenshotUrl'
  | 'price'
  | 'originalPriceUsd'
  | 'pricingTier'
  | 'featured'
  | 'trending'
  | 'new'
  | 'rating'
  | 'lastUpdated'
  | 'isFree'
>

export function toTemplateCatalogItem(template: Template): TemplateCatalogItem {
  return {
    id: template.id,
    slug: template.slug,
    title: template.title,
    summary: template.summary,
    description: template.description,
    activeOffer: template.activeOffer,
    category: template.category,
    subcategory: template.subcategory,
    tags: template.tags,
    techStack: template.techStack,
    frameworkLabel: template.frameworkLabel,
    screenshotUrl: template.screenshotUrl,
    price: template.price,
    originalPriceUsd: template.originalPriceUsd,
    pricingTier: template.pricingTier,
    featured: template.featured,
    trending: template.trending,
    new: template.new,
    rating: template.rating,
    lastUpdated: template.lastUpdated,
    isFree: template.isFree,
  }
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { id: 'all', label: 'All', description: 'Browse all templates', icon: 'LayoutGrid' },
  { id: 'dashboards', label: 'Dashboards', description: 'Analytics, SaaS, enterprise, and admin dashboards', icon: 'LayoutDashboard' },
  { id: 'html', label: 'HTML', description: 'HTML website templates, portfolio pages, and static site starters', icon: 'Code2' },
]

export type TemplateSortMode = 'featured' | 'trending' | 'new' | 'price-low' | 'price-high' | 'rating'

export function sortTemplates<T extends TemplateCatalogItem>(templates: T[], sort: TemplateSortMode): T[] {
  const sorted = [...templates]
  const flagshipFirst = (a: T, b: T) => {
    const priority = new Map([['mtadmin', 0], ['nimbus-pro', 1]])
    return (priority.get(a.slug) ?? Number.MAX_SAFE_INTEGER) - (priority.get(b.slug) ?? Number.MAX_SAFE_INTEGER)
  }

  switch (sort) {
    case 'trending':
      return sorted.sort((a, b) => flagshipFirst(a, b) || Number(b.trending) - Number(a.trending) || new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    case 'new':
      return sorted.sort((a, b) => flagshipFirst(a, b) || Number(b.new) - Number(a.new) || new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    case 'price-low':
      return sorted.sort((a, b) => flagshipFirst(a, b) || a.price - b.price)
    case 'price-high':
      return sorted.sort((a, b) => flagshipFirst(a, b) || b.price - a.price)
    case 'rating':
      return sorted.sort((a, b) => flagshipFirst(a, b) || b.rating - a.rating)
    case 'featured':
    default:
      return sorted.sort((a, b) => flagshipFirst(a, b) || Number(b.featured) - Number(a.featured) || new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
  }
}
