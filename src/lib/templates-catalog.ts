export type TemplateCategory = {
  id: string
  label: string
  description: string
  icon: string
}

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
  currency: string
  featured: boolean
  trending: boolean
  new: boolean
  rating: number
  reviewCount: number
  salesCount: number
  reviews: TemplateReview[]
  lastUpdated: string
  author: {
    name: string
    avatar: string
  }
  features: string[]
  pages: string[]
  components: number
  license: string
  highlights: { title: string; description: string; icon: string }[]
  faq: { question: string; answer: string }[]
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { id: 'all', label: 'All', description: 'Browse all dashboard templates', icon: 'LayoutGrid' },
  { id: 'dashboards', label: 'Dashboards', description: 'Analytics, SaaS, enterprise, and admin dashboards', icon: 'LayoutDashboard' },
]

export type TemplateSortMode = 'featured' | 'trending' | 'new' | 'price-low' | 'price-high' | 'rating'

export function sortTemplates(templates: Template[], sort: TemplateSortMode): Template[] {
  const sorted = [...templates]
  switch (sort) {
    case 'trending':
      return sorted.sort((a, b) => Number(b.trending) - Number(a.trending) || b.salesCount - a.salesCount)
    case 'new':
      return sorted.sort((a, b) => Number(b.new) - Number(a.new) || new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price)
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating)
    case 'featured':
    default:
      return sorted.sort((a, b) => Number(b.featured) - Number(a.featured) || b.salesCount - a.salesCount)
  }
}