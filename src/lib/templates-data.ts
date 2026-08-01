import { dashboardKits, type DashboardKit } from '@/lib/dashboard-kits'
import { getDashboardKits } from '@/lib/dashboard-kit-store'
import { TEMPLATE_CATEGORIES } from '@/lib/templates-catalog'
import type { Template, TemplateCategory } from '@/lib/templates-catalog'
import { slugify } from '@/lib/utils'
import { getMtadminProduct } from '@/lib/mtadmin-product'
import { getPricingCtaSettings } from '@/lib/pricing-settings-store'
import { getWeeklyOfferRuntime, type WeeklyOfferSettings } from '@/lib/weekly-offer'

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
  fleetops: {
    category: 'dashboards', subcategory: 'Fleet Operations Command Center', components: 74, featured: true, trending: true, new: true,
    highlights: [
      { title: 'Operations command center', description: 'Live fleet status, dispatch priorities, route timing, incidents, warehouses, and critical shift alerts.', icon: 'Activity' },
      { title: 'Map-driven workflow', description: 'Leaflet and OpenStreetMap vehicle context connected to advanced fleet and dispatch views.', icon: 'Map' },
      { title: 'Enterprise data tools', description: 'Search, filters, sorting, pagination, bulk actions, column visibility, charts, and export patterns.', icon: 'Table2' },
      { title: 'Secure source access', description: 'The clean Next.js source ZIP is available to the signed-in buyer after checkout.', icon: 'Package' },
    ],
  },
  'meridian-health': {
    category: 'dashboards', subcategory: 'Clinical Patient Management', components: 77, featured: true, trending: true, new: true,
    highlights: [
      { title: 'Shift-focused workflow', description: 'Patient census, risk, appointments, care tasks, and alerts organized around active clinical operations.', icon: 'Activity' },
      { title: 'Patient detail workspace', description: 'Overview, vitals, medications, and visit timeline remain accessible in one coordinated panel.', icon: 'HeartPulse' },
      { title: 'Care coordination', description: 'Patient roster, appointments, care team, reports, task inbox, and notification patterns.', icon: 'Users' },
      { title: 'Secure source access', description: 'The clean Next.js source ZIP is available to the signed-in buyer after checkout.', icon: 'Package' },
    ],
  },
  'meridian-terminal': {
    category: 'dashboards', subcategory: 'Trading and Investment Terminal', components: 92, featured: true, trending: true, new: true,
    highlights: [
      { title: 'Multi-panel terminal', description: 'Ticker tape, watchlist, market chart, order book, quick order ticket, positions, and orders.', icon: 'ChartCandlestick' },
      { title: 'Portfolio intelligence', description: 'Performance, allocation, alerts, order history, fills, and deterministic market simulation.', icon: 'ChartNoAxesCombined' },
      { title: 'Desktop and mobile', description: 'Dense desktop trading workspace plus a purpose-built compact mobile shell.', icon: 'PanelsTopLeft' },
      { title: 'Secure source access', description: 'The clean Next.js source ZIP is available to the signed-in buyer after checkout.', icon: 'Package' },
    ],
  },
  'northstar-analytics': {
    category: 'dashboards', subcategory: 'SaaS Revenue Analytics', components: 61, featured: true, trending: true, new: true,
    highlights: [
      { title: 'Revenue operations', description: 'MRR, churn, conversion, expansion, customer, plan, usage, invoice, and payment workflows.', icon: 'ChartNoAxesCombined' },
      { title: 'Real application routes', description: 'Analytics, customers, billing, settings, authentication, support, and documentation pages.', icon: 'Route' },
      { title: 'Production foundations', description: 'Strict TypeScript, route metadata, loading and error states, responsive shell, and self-hosted avatars.', icon: 'ShieldCheck' },
      { title: 'Secure source access', description: 'The clean Next.js source ZIP is available to the signed-in buyer after checkout.', icon: 'Package' },
    ],
  },
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
  'pipeline-pilot-production': {
    category: 'dashboards',
    subcategory: 'Sales Operations Dashboard',
    components: 214,
    featured: true,
    trending: true,
    new: true,
    highlights: [
      { title: 'SalesOps page set', description: 'Pipeline, deals, leads, accounts, forecasting, reports, billing, settings, and auth flows.', icon: 'Layers' },
      { title: 'Three-pane workspace', description: 'Collapsible sidebar, main work area, and live right-panel workspace for daily ops.', icon: 'Sparkles' },
      { title: 'Secure access', description: 'Downloads are available only to signed-in buyers after checkout.', icon: 'Package' },
      { title: 'Live preview', description: 'Inspect the sales dashboard experience before purchase.', icon: 'Eye' },
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
  if (category === 'html') return 'HTML'
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
  const hasStalePremiumTierCopy = Boolean(kit.isFree && /\s-\sPremium(?:\s|$)/i.test(kit.title))
  const cleanFreeTierCopy = (value: string) => {
    if (!hasStalePremiumTierCopy) return value

    return value
      .replace(/\bA premium,\s+/gi, 'A ')
      .replace(/\bis a premium,\s+/gi, 'is an ')
      .replace(/\bis a premium\s+/gi, 'is a free ')
      .replace(/\bpremium Next\.js/gi, 'free Next.js')
  }

  return {
    id: kit.id.replace('dashboard-kit-', 'template-'),
    slug: kit.slug,
    title: hasStalePremiumTierCopy ? kit.shortTitle : kit.title,
    summary: cleanFreeTierCopy(kit.summary),
    description: cleanFreeTierCopy(kit.description),
    seoTitle: hasStalePremiumTierCopy ? kit.shortTitle + ' - Free ' + kit.frameworkLabel + ' Admin Dashboard Template' : kit.seoTitle,
    metaDescription: cleanFreeTierCopy(kit.metaDescription),
    keywords: kit.keywords,
    category,
    categoryLabel,
    subcategory: meta?.subcategory || kit.subcategory || categoryLabel,
    tags: kit.tags,
    techStack: kit.techStack,
    frameworkLabel: kit.frameworkLabel,
    screenshotUrl: kit.coverImage || kit.screenshots[0] || '/SiteLogo.png',
    thumbnailUrl: kit.coverImage || kit.screenshots[0] || '/SiteLogo.png',
    price: kit.priceUsd,
    originalPriceUsd: kit.originalPriceUsd,
    pricingTier: kit.pricingTier,
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
    license: kit.isFree ? 'Free Template License' : 'Single Project License',
    highlights: meta?.highlights ?? fallbackHighlights(kit),
    faq: [
      {
        question: 'Is this based on a real template project?',
        answer: 'Yes. Each template is prepared from a real project and connected to a live preview when available.',
      },
      {
        question: kit.isFree ? 'What do I receive after download?' : 'What do I receive after purchase?',
        answer: kit.isFree
          ? 'You receive the template ZIP package, including the included pages and reusable UI sections.'
          : 'You receive the template package, including the included pages and reusable UI sections.',
      },
      {
        question: kit.isFree ? 'Can I inspect the template before downloading?' : 'Can I inspect the template before buying?',
        answer: 'Yes. Use the live preview button to inspect the template before downloading or checkout.',
      },
    ],
    isFree: Boolean(kit.isFree),
  }
}

function toMtadminTemplate(): Template {
  const product = getMtadminProduct()

  return {
    id: 'template-mtadmin',
    slug: product.slug,
    title: product.title,
    summary: product.summary,
    description: product.description,
    seoTitle: product.seo.title,
    metaDescription: product.seo.description,
    keywords: product.seo.keywords,
    category: 'dashboards',
    categoryLabel: 'Dashboards',
    subcategory: 'Multi-framework Admin Dashboard',
    tags: ['admin dashboard', 'multi-framework', 'SaaS', 'ecommerce', 'analytics', 'CRM', 'operations'],
    techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    frameworkLabel: 'Next.js + React',
    screenshotUrl: product.previewImages[0],
    thumbnailUrl: product.previewImages[0],
    price: product.bundlePriceUsd,
    pricingTier: 'pro',
    currency: product.currency,
    featured: true,
    trending: true,
    new: true,
    rating: 0,
    reviewCount: 0,
    salesCount: 0,
    reviews: [],
    lastUpdated: product.updatedAt,
    author: { name: 'mtverse', avatar: 'M' },
    features: product.featureGroups.flatMap((group) => group.items),
    pages: product.dashboards,
    components: product.metrics.componentsPerEdition,
    license: product.license.name,
    highlights: [
      {
        title: `${product.metrics.dashboards} dashboard experiences`,
        description: 'Analytics, ecommerce, CRM, finance, logistics, support, SaaS, AI, and operations workspaces.',
        icon: 'Layers',
      },
      {
        title: `${product.metrics.routesPerEdition} application routes`,
        description: 'Deep product coverage across dashboards, apps, forms, tables, authentication, and system screens.',
        icon: 'FileText',
      },
      {
        title: `${product.metrics.layouts} responsive layouts`,
        description: 'Sidebar, compact, horizontal, two-column, full-width, and focused authentication shells.',
        icon: 'Sparkles',
      },
      {
        title: 'Multi-framework ownership',
        description: 'Next.js and React are available now, with four additional editions included in the bundle roadmap.',
        icon: 'Package',
      },
    ],
    faq: product.faqs,
    isFree: false,
  }
}

const MTADMIN_TEMPLATE = toMtadminTemplate()

function withFlagshipsFirst(templates: Template[]) {
  const combined = [MTADMIN_TEMPLATE, ...templates.filter((template) => template.slug !== MTADMIN_TEMPLATE.slug)]
  const priority = new Map([['mtadmin', 0], ['nimbus-pro', 1]])
  return combined
    .map((template, index) => ({ template, index }))
    .sort((left, right) => (priority.get(left.template.slug) ?? Number.MAX_SAFE_INTEGER) - (priority.get(right.template.slug) ?? Number.MAX_SAFE_INTEGER) || left.index - right.index)
    .map(({ template }) => template)
}

function applyActiveTemplateOffers(templates: Template[], settings: WeeklyOfferSettings) {
  const runtime = getWeeklyOfferRuntime(settings)
  if (!runtime.active) return templates

  return templates.map((template) => {
    if (template.isFree) return template

    if (template.slug === MTADMIN_TEMPLATE.slug) {
      if (!settings.mtadminEditionsEnabled) return template
      return {
        ...template,
        price: settings.individualTemplatePriceUsd,
        originalPriceUsd: getMtadminProduct().individualPriceUsd,
        activeOffer: runtime,
      }
    }

    if (!settings.individualTemplatesEnabled || template.price <= settings.individualTemplatePriceUsd) return template
    return {
      ...template,
      originalPriceUsd: template.price,
      price: settings.individualTemplatePriceUsd,
      activeOffer: runtime,
    }
  })
}

export const TEMPLATES: Template[] = withFlagshipsFirst(dashboardKits.map(toTemplate))

export function getAllTemplates(): Template[] {
  return TEMPLATES
}

export async function getAllTemplatesFromStore(): Promise<Template[]> {
  const [kits, pricing] = await Promise.all([
    getDashboardKits(),
    getPricingCtaSettings(),
  ])
  return applyActiveTemplateOffers(withFlagshipsFirst(kits.filter((kit) => kit.status === 'available').map(toTemplate)), pricing.offer)
}

export function getTemplateBySlug(slug: string): Template | null {
  return getAllTemplates().find((t) => t.slug === slug) ?? null
}

export async function getTemplateBySlugFromStore(slug: string): Promise<Template | null> {
  const templates = await getAllTemplatesFromStore()
  return templates.find((t) => t.slug === slug) ?? null
}

export function getTemplatesByCategory(category: string): Template[] {
  const templates = getAllTemplates()
  if (!category || category === 'all') return templates
  return templates.filter((t) => t.category === category)
}

export function getFeaturedTemplates(limit = 4): Template[] {
  return getAllTemplates().filter((t) => t.featured).slice(0, limit)
}

export async function getFeaturedTemplatesFromStore(limit = 4): Promise<Template[]> {
  const templates = await getAllTemplatesFromStore()
  return templates.filter((t) => t.featured).slice(0, limit)
}

export function getTrendingTemplates(limit = 4): Template[] {
  return getAllTemplates().filter((t) => t.trending).slice(0, limit)
}

export function getRelatedTemplates(slug: string, limit = 4): Template[] {
  const templates = getAllTemplates()
  const current = templates.find((template) => template.slug === slug)
  if (!current) return templates.slice(0, limit)
  return templates.filter((t) => t.slug !== slug && t.category === current.category).slice(0, limit)
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
      icon: template.category === 'dashboards' ? 'LayoutDashboard' : template.category === 'html' ? 'Code2' : 'LayoutGrid',
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
  return getTemplateStatsFor(getAllTemplates())
}

export async function getTemplateStatsFromStore() {
  return getTemplateStatsFor(await getAllTemplatesFromStore())
}

export function searchTemplates(query: string): Template[] {
  const templates = getAllTemplates()
  const q = query.toLowerCase().trim()
  if (!q) return templates
  return templates.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      t.techStack.some((tech) => tech.toLowerCase().includes(q))
  )
}
