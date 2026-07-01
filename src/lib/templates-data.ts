import { dashboardKits, type DashboardKit } from '@/lib/dashboard-kits'
import { getDashboardKits } from '@/lib/dashboard-kit-store'
import { TEMPLATE_CATEGORIES } from '@/lib/templates-catalog'
import type { Template, TemplateCategory } from '@/lib/templates-catalog'
import { slugify } from '@/lib/utils'

export { TEMPLATE_CATEGORIES, sortTemplates } from '@/lib/templates-catalog'
export type { Template, TemplateCategory, TemplateReview, TemplateSortMode } from '@/lib/templates-catalog'

type TemplateMeta = {
  category?: string
  subcategory: string
  components: number
  featured: boolean
  trending: boolean
  new: boolean
  highlights: Template['highlights']
}

const TEMPLATE_META: Record<string, TemplateMeta> = {
  'helios-pro': {
    category: 'dashboards',
    subcategory: 'Admin Dashboard UI Kit',
    components: 165,
    featured: true,
    trending: true,
    new: true,
    highlights: [
      { title: 'Large page set', description: 'Dashboards, app screens, ecommerce flows, tables, charts, forms, auth, and marketing pages.', icon: 'FileText' },
      { title: 'Premium admin UI', description: 'Reusable components, dark mode, command palette, theme customization, and polished responsive layouts.', icon: 'Layers' },
      { title: 'Demo-ready preview', description: 'Inspect the full dashboard experience before checkout with a guided live preview.', icon: 'Eye' },
      { title: 'Secure access', description: 'Downloads are available only to signed-in buyers after checkout.', icon: 'Package' },
    ],
  },
  'lumiere-ecommerce': {
    category: 'ecommerce',
    subcategory: 'Ecommerce Storefront',
    components: 118,
    featured: true,
    trending: true,
    new: true,
    highlights: [
      { title: 'Complete store flow', description: 'Storefront, product detail, cart, wishlist, checkout, order success, and account pages.', icon: 'ShoppingCart' },
      { title: 'Admin dashboard', description: 'Catalog, orders, customers, coupons, reviews, inventory, messages, and store settings.', icon: 'Layers' },
      { title: 'Demo-ready data', description: 'Seeded products, categories, reviews, coupons, orders, and users for realistic previews.', icon: 'Sparkles' },
      { title: 'Secure access', description: 'Downloads are available only to signed-in buyers after checkout.', icon: 'Package' },
    ],
  },
  'mtverse-modular-nextjs-dashboard-template': {
    category: 'dashboards',
    subcategory: 'AI SaaS Dashboard',
    components: 193,
    featured: true,
    trending: true,
    new: true,
    highlights: [
      { title: 'Modular screens', description: 'Dashboard, AI, ecommerce, CRM, charts, maps, and shared UI sections.', icon: 'Layers' },
      { title: 'SaaS workflows', description: 'Workspace, chat, generator, usage, billing, and settings screens included.', icon: 'Sparkles' },
      { title: 'Secure access', description: 'Downloads are available only to signed-in buyers after checkout.', icon: 'Package' },
      { title: 'Live preview', description: 'Inspect the dashboard experience before purchase.', icon: 'Eye' },
    ],
  },
  'mt-box-enterprise-nextjs-dashboard-template': {
    category: 'dashboards',
    subcategory: 'Enterprise SaaS Admin',
    components: 140,
    featured: true,
    trending: true,
    new: true,
    highlights: [
      { title: 'Enterprise flows', description: 'Billing, team, security, API keys, integrations, and audit screens.', icon: 'Shield' },
      { title: 'Business dashboards', description: 'Analytics, ecommerce, CRM, finance, HR, logistics, marketing, and support.', icon: 'Layers' },
      { title: 'Secure access', description: 'Downloads are available only to signed-in buyers after checkout.', icon: 'Package' },
      { title: 'Live preview', description: 'Inspect the dashboard experience before purchase.', icon: 'Eye' },
    ],
  },
  'mat-dash-nextjs-admin-dashboard-template': {
    category: 'dashboards',
    subcategory: 'Admin Dashboard Studio',
    components: 231,
    featured: true,
    trending: true,
    new: true,
    highlights: [
      { title: 'Large page set', description: 'Dashboards, apps, tables, icons, auth, and UI pages.', icon: 'FileText' },
      { title: 'Admin apps', description: 'Ecommerce, invoices, tickets, notes, blog, chat, email, calendar, and contacts.', icon: 'Layers' },
      { title: 'Secure access', description: 'Downloads are available only to signed-in buyers after checkout.', icon: 'Package' },
      { title: 'Live preview', description: 'Inspect the dashboard experience before purchase.', icon: 'Eye' },
    ],
  },
}

function titleCase(value: string) {
  return value
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function normalizeCategoryId(value: string | undefined) {
  const id = slugify(value || 'dashboards')
  if (id === 'dashboard-kits' || id === 'dashboard-kit') return 'dashboards'
  return id || 'dashboards'
}

function getCategoryLabel(kit: DashboardKit, category: string) {
  if (category === 'dashboards') return 'Dashboards'
  return kit.categoryTitle?.trim() || titleCase(category)
}

function fallbackHighlights(kit: DashboardKit): Template['highlights'] {
  const fromStore = kit.highlights
    .filter((item) => item.label || item.value)
    .slice(0, 4)
    .map((item) => ({
      title: item.label || 'Included',
      description: item.value || 'Included with this template.',
      icon: 'Sparkles',
    }))

  if (fromStore.length) return fromStore

  return [
    { title: 'Live preview', description: 'Inspect the template before purchase.', icon: 'Eye' },
    { title: 'Secure access', description: 'Downloads are available only to signed-in buyers after checkout.', icon: 'Package' },
    { title: 'Responsive layout', description: 'Designed for desktop, tablet, and mobile screens.', icon: 'Layers' },
    { title: 'Reusable screens', description: 'Includes ready-made pages and UI sections.', icon: 'FileText' },
  ]
}

function toTemplate(kit: DashboardKit): Template {
  const meta = TEMPLATE_META[kit.slug]
  const category = meta?.category || normalizeCategoryId(kit.category)
  const categoryLabel = getCategoryLabel(kit, category)
  const pageCount = kit.includedPages.length
  const featureCount = kit.features.length

  return {
    id: kit.id.replace('dashboard-kit-', 'template-'),
    slug: kit.slug,
    title: kit.title,
    summary: kit.summary,
    description: kit.description,
    seoTitle: kit.seoTitle,
    metaDescription: kit.metaDescription,
    keywords: kit.keywords,
    category,
    categoryLabel,
    subcategory: meta?.subcategory || categoryLabel,
    tags: kit.tags,
    techStack: kit.techStack,
    frameworkLabel: kit.frameworkLabel,
    screenshotUrl: kit.coverImage || kit.screenshots[0] || '/SiteLogo.png',
    thumbnailUrl: kit.coverImage || kit.screenshots[0] || '/SiteLogo.png',
    price: kit.priceUsd,
    originalPriceUsd: kit.originalPriceUsd,
    currency: 'USD',
    featured: meta?.featured ?? kit.status === 'available',
    trending: meta?.trending ?? kit.status === 'available',
    new: meta?.new ?? true,
    rating: 0,
    reviewCount: 0,
    salesCount: 0,
    reviews: [],
    lastUpdated: kit.updatedAt,
    author: { name: 'mtverse', avatar: 'M' },
    features: kit.features,
    pages: kit.includedPages,
    components: meta?.components ?? Math.max(pageCount + featureCount * 4, 12),
    license: 'Single Project License',
    highlights: meta?.highlights ?? fallbackHighlights(kit),
    faq: [
      {
        question: 'Is this based on a real dashboard project?',
        answer: 'Yes. Each template is prepared from a real dashboard project and connected to a private live preview.',
      },
      {
        question: 'What do I receive after purchase?',
        answer: 'You receive the dashboard package for this template, including the included pages and reusable UI sections.',
      },
      {
        question: 'Can I inspect the template before buying?',
        answer: 'Yes. Use the live preview button to inspect the dashboard before checkout.',
      },
    ],
    isFree: Boolean(kit.isFree),
  }
}

export const TEMPLATES: Template[] = dashboardKits.map(toTemplate)

export function getAllTemplates(): Template[] {
  return TEMPLATES
}

export async function getAllTemplatesFromStore(): Promise<Template[]> {
  const kits = await getDashboardKits()
  return kits.filter((kit) => kit.status === 'available').map(toTemplate)
}

export function getTemplateBySlug(slug: string): Template | null {
  return TEMPLATES.find((t) => t.slug === slug) ?? null
}

export async function getTemplateBySlugFromStore(slug: string): Promise<Template | null> {
  const templates = await getAllTemplatesFromStore()
  return templates.find((t) => t.slug === slug) ?? null
}

export function getTemplatesByCategory(category: string): Template[] {
  if (!category || category === 'all') return TEMPLATES
  return TEMPLATES.filter((t) => t.category === category)
}

export function getFeaturedTemplates(limit = 4): Template[] {
  return TEMPLATES.filter((t) => t.featured).slice(0, limit)
}

export async function getFeaturedTemplatesFromStore(limit = 4): Promise<Template[]> {
  const templates = await getAllTemplatesFromStore()
  return templates.filter((t) => t.featured).slice(0, limit)
}

export function getTrendingTemplates(limit = 4): Template[] {
  return TEMPLATES.filter((t) => t.trending).slice(0, limit)
}

export function getRelatedTemplates(slug: string, limit = 4): Template[] {
  const current = getTemplateBySlug(slug)
  if (!current) return TEMPLATES.slice(0, limit)
  return TEMPLATES.filter((t) => t.slug !== slug && t.category === current.category).slice(0, limit)
}

export async function getRelatedTemplatesFromStore(slug: string, limit = 4): Promise<Template[]> {
  const templates = await getAllTemplatesFromStore()
  const current = templates.find((t) => t.slug === slug)
  if (!current) return templates.slice(0, limit)
  return templates.filter((t) => t.slug !== slug && t.category === current.category).slice(0, limit)
}

export function getTemplateCategoriesFor(templates: Template[]): TemplateCategory[] {
  const categories = new Map<string, TemplateCategory>()

  for (const template of templates) {
    if (!template.category) continue
    categories.set(template.category, {
      id: template.category,
      label: template.categoryLabel || titleCase(template.category),
      description: `${template.categoryLabel || titleCase(template.category)} templates`,
      icon: template.category === 'dashboards' ? 'LayoutDashboard' : 'LayoutGrid',
    })
  }

  return [
    { id: 'all', label: 'All', description: 'Browse all templates', icon: 'LayoutGrid' },
    ...Array.from(categories.values()).sort((a, b) => a.label.localeCompare(b.label)),
  ]
}

export async function getTemplateCategoriesFromStore(): Promise<TemplateCategory[]> {
  return getTemplateCategoriesFor(await getAllTemplatesFromStore())
}

export function getTemplateStatsFor(templates: Template[]) {
  return {
    totalTemplates: templates.length,
    featuredTemplates: templates.filter((t) => t.featured).length,
    freeTemplates: templates.filter((t) => t.price === 0).length,
    categories: getTemplateCategoriesFor(templates).filter((c) => c.id !== 'all').length,
  }
}

export function getTemplateStats() {
  return getTemplateStatsFor(TEMPLATES)
}

export async function getTemplateStatsFromStore() {
  return getTemplateStatsFor(await getAllTemplatesFromStore())
}

export function searchTemplates(query: string): Template[] {
  const q = query.toLowerCase().trim()
  if (!q) return TEMPLATES
  return TEMPLATES.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      t.techStack.some((tech) => tech.toLowerCase().includes(q))
  )
}