import type { Template } from '@/lib/templates-catalog'

export type TemplateSeoHub = {
  slug: string
  title: string
  h1: string
  eyebrow: string
  description: string
  metaDescription: string
  keywords: string[]
  intentTags: string[]
  categoryIds?: string[]
  priceMode?: 'all' | 'free' | 'paid'
  introTitle: string
  intro: string[]
  useCases: string[]
  checklist: string[]
  faqs: { question: string; answer: string }[]
  related: string[]
}

export const TEMPLATE_SEO_HUBS: TemplateSeoHub[] = [
  {
    slug: 'nextjs-dashboard-templates',
    title: 'Next.js Dashboard Templates',
    h1: 'Next.js dashboard templates for SaaS, admin, CRM, and analytics products',
    eyebrow: 'Next.js admin UI',
    description:
      'Explore premium Next.js dashboard templates with live previews, source-code delivery, admin screens, charts, tables, auth pages, ecommerce panels, CRM screens, and SaaS workflows.',
    metaDescription:
      'Premium Next.js dashboard templates and admin UI kits for SaaS, ecommerce, CRM, analytics, and internal tools. Live previews, source code, and secure ZIP delivery.',
    keywords: [
      'Next.js dashboard templates',
      'Next.js admin dashboard template',
      'Next.js admin UI kit',
      'Next.js SaaS dashboard',
      'TypeScript dashboard template',
      'Tailwind dashboard template',
      'premium dashboard template',
      'admin dashboard source code',
    ],
    intentTags: ['next', 'dashboard', 'admin', 'saas', 'crm', 'analytics', 'typescript', 'tailwind'],
    categoryIds: ['dashboards'],
    priceMode: 'paid',
    introTitle: 'Why these Next.js dashboard templates are useful',
    intro: [
      'A good dashboard template should give you more than one landing screen. It should include the application shell, navigation, data cards, tables, charts, forms, settings, auth pages, and the smaller states that make an admin product feel finished.',
      'mtverse focuses on template packages that can be inspected before purchase. Each paid dashboard has a live preview, screenshot, template detail page, and protected delivery flow so buyers can verify the UI before checkout.',
    ],
    useCases: ['SaaS admin panels', 'CRM dashboards', 'Ecommerce back offices', 'Analytics products', 'Internal tools', 'Client dashboard projects'],
    checklist: [
      'Live preview before purchase',
      'Responsive dashboard layout',
      'Reusable UI sections and pages',
      'Auth, settings, table, and chart screens',
      'Secure ZIP download after checkout',
      'Single project production license',
    ],
    faqs: [
      {
        question: 'Are these complete Next.js projects?',
        answer: 'Each paid template is packaged as a source-code project or suite-backed ZIP with reusable pages and UI sections. Check the template detail page for the exact included pages.',
      },
      {
        question: 'Can I preview the dashboard before buying?',
        answer: 'Yes. Every paid dashboard page includes a live preview button and screenshots so you can inspect the UI before checkout.',
      },
      {
        question: 'Do I get every paid template when I buy one template?',
        answer: 'No. A single template purchase unlocks only that template. The all-paid bundle is separate and unlocks the paid template bundle.',
      },
    ],
    related: ['react-admin-dashboard-templates', 'saas-templates', 'ecommerce-website-templates'],
  },
  {
    slug: 'react-admin-dashboard-templates',
    title: 'React Admin Dashboard Templates',
    h1: 'React admin dashboard templates with modern UI screens and live previews',
    eyebrow: 'React dashboards',
    description:
      'Browse React and Next.js admin dashboard templates for modern application interfaces, admin portals, ecommerce dashboards, analytics views, CRM workspaces, and operations tools.',
    metaDescription:
      'React admin dashboard templates and UI kits with modern layouts, charts, tables, auth screens, settings pages, live previews, and secure downloads.',
    keywords: [
      'React admin dashboard templates',
      'React dashboard template',
      'React admin UI kit',
      'admin panel template',
      'dashboard UI components',
      'React Tailwind dashboard',
      'enterprise admin template',
    ],
    intentTags: ['react', 'admin', 'dashboard', 'panel', 'tailwind', 'charts', 'tables'],
    categoryIds: ['dashboards'],
    priceMode: 'paid',
    introTitle: 'Admin UI pages that save production time',
    intro: [
      'Teams usually lose time building repeat admin screens: table layouts, filters, cards, command actions, settings pages, and responsive sidebars. A strong React admin template gives you these patterns in one place.',
      'This hub groups mtverse dashboard templates that fit React and Next.js admin product needs, with live previews and template-specific download access.',
    ],
    useCases: ['Admin panels', 'Back-office apps', 'Team workspaces', 'Operations dashboards', 'Data-heavy product screens', 'Agency client portals'],
    checklist: [
      'React-friendly component structure',
      'Modern cards, charts, and tables',
      'Responsive navigation patterns',
      'Admin, analytics, and settings screens',
      'Template-specific protected downloads',
      'Paid templates with checkout access',
    ],
    faqs: [
      {
        question: 'Are React and Next.js templates shown together?',
        answer: 'Yes. Next.js templates are React templates too, so this hub includes dashboard packages that fit React admin UI and Next.js application workflows.',
      },
      {
        question: 'Can I request another framework version?',
        answer: 'Paid template pages include a framework request form where you can ask for HTML, React, Next.js, Vue, Angular, Laravel, or a custom stack version.',
      },
    ],
    related: ['nextjs-dashboard-templates', 'saas-templates', 'landing-page-templates'],
  },
  {
    slug: 'ecommerce-website-templates',
    title: 'Ecommerce Website Templates',
    h1: 'Ecommerce website templates for stores, carts, checkout, and admin workflows',
    eyebrow: 'Storefront templates',
    description:
      'Find ecommerce templates for product catalogs, storefronts, cart flows, checkout pages, order screens, customer accounts, inventory panels, reviews, and campaign landing pages.',
    metaDescription:
      'Ecommerce website templates and storefront UI kits with product pages, cart, checkout, order flows, admin panels, live previews, and ZIP downloads.',
    keywords: [
      'ecommerce website templates',
      'online store template',
      'Next.js ecommerce template',
      'React ecommerce template',
      'shopping cart template',
      'checkout page template',
      'storefront UI kit',
      'ecommerce admin dashboard',
    ],
    intentTags: ['ecommerce', 'store', 'shop', 'cart', 'checkout', 'product', 'catalog', 'order'],
    categoryIds: ['ecommerce', 'html', 'landing'],
    priceMode: 'all',
    introTitle: 'Templates for the full ecommerce path',
    intro: [
      'A useful ecommerce template should cover more than a homepage. Product discovery, cart decisions, checkout clarity, customer accounts, and admin workflows all affect how quickly a store can launch.',
      'This hub collects ecommerce-focused mtverse templates across paid Next.js packages and free HTML website templates, so you can choose between a source-code app template or a static website starter.',
    ],
    useCases: ['Online stores', 'Product catalogs', 'Fashion shops', 'Bookstores', 'Fitness stores', 'Learning platforms', 'Home and garden stores'],
    checklist: [
      'Product and catalog sections',
      'Cart and checkout patterns',
      'Order and customer workflows',
      'Responsive storefront layouts',
      'Free HTML and paid source-code options',
      'Preview-first browsing',
    ],
    faqs: [
      {
        question: 'Are ecommerce HTML templates free?',
        answer: 'HTML templates can be downloaded individually with the free download rules, while the HTML bundle unlock gives one ZIP for the HTML collection.',
      },
      {
        question: 'Do paid ecommerce templates include backend code?',
        answer: 'Check each template detail page for exact included files. mtverse focuses on source-code UI packages and realistic storefront/admin screens.',
      },
    ],
    related: ['landing-page-templates', 'nextjs-dashboard-templates', 'free-html-templates'],
  },
  {
    slug: 'landing-page-templates',
    title: 'Landing Page Templates',
    h1: 'Landing page templates for SaaS, apps, products, agencies, and campaigns',
    eyebrow: 'Conversion pages',
    description:
      'Browse landing page templates for SaaS products, mobile apps, product launches, agencies, creators, ecommerce campaigns, waitlists, pricing pages, and lead-generation websites.',
    metaDescription:
      'Landing page templates for SaaS, apps, products, agencies, creators, and campaigns. Live previews, responsive sections, paid templates, and free HTML options.',
    keywords: [
      'landing page templates',
      'SaaS landing page template',
      'app landing page template',
      'product landing page template',
      'startup landing page template',
      'agency landing page template',
      'marketing website template',
      'conversion landing page UI',
    ],
    intentTags: ['landing', 'saas', 'app', 'product', 'agency', 'startup', 'marketing', 'pricing'],
    categoryIds: ['landing', 'html', 'ecommerce'],
    priceMode: 'all',
    introTitle: 'Landing pages that explain the offer clearly',
    intro: [
      'A strong landing page should quickly show the product, the audience, the value, the proof, and the call to action. Design matters, but structure matters just as much.',
      'mtverse landing templates are grouped for teams launching products, campaign pages, SaaS offers, and client websites. Use the preview to check layout, responsiveness, and visual direction before download or purchase.',
    ],
    useCases: ['SaaS launches', 'App launches', 'Agency websites', 'Product campaigns', 'Waitlists', 'Portfolio services', 'Lead-generation pages'],
    checklist: [
      'Hero and CTA sections',
      'Feature and benefit blocks',
      'Pricing or offer sections',
      'Responsive layouts',
      'Live preview access',
      'Static HTML and paid template options',
    ],
    faqs: [
      {
        question: 'Should landing templates be in ecommerce or landing?',
        answer: 'Product-focused campaign pages belong in landing. Storefronts with product listings, cart, and checkout belong in ecommerce.',
      },
      {
        question: 'Can I use a landing template for clients?',
        answer: 'Yes, follow the license shown on the template detail page. Paid templates are intended for a single production project unless a broader license is listed.',
      },
    ],
    related: ['saas-templates', 'agency-website-templates', 'ecommerce-website-templates'],
  },
  {
    slug: 'free-html-templates',
    title: 'Free HTML Templates',
    h1: 'Free HTML templates for portfolios, business sites, ecommerce pages, and landing pages',
    eyebrow: 'Free website templates',
    description:
      'Browse free responsive HTML templates for portfolios, agencies, SaaS, restaurants, education, healthcare, fitness, ecommerce, crypto, real estate, and static websites.',
    metaDescription:
      'Free responsive HTML website templates for portfolios, agencies, SaaS, ecommerce, restaurants, healthcare, education, fitness, crypto, and real estate.',
    keywords: [
      'free HTML templates',
      'free website templates',
      'responsive HTML templates',
      'HTML website templates download',
      'free portfolio templates',
      'free ecommerce HTML templates',
      'static website templates',
      'HTML landing page templates',
    ],
    intentTags: ['html', 'free', 'portfolio', 'website', 'static', 'landing', 'business'],
    categoryIds: ['html'],
    priceMode: 'free',
    introTitle: 'Free HTML templates for quick launches',
    intro: [
      'Free HTML templates are useful when you need a fast static website, a client mockup, a personal portfolio, or a simple landing page without a full application stack.',
      'mtverse keeps HTML templates separate from paid dashboard templates so users can browse free static websites without mixing them with Next.js admin products.',
    ],
    useCases: ['Portfolio websites', 'Static business sites', 'Agency pages', 'Restaurant pages', 'Education pages', 'Fitness pages', 'Real estate pages'],
    checklist: [
      'Free individual template downloads',
      'Responsive desktop and mobile layout',
      'Screenshot and preview before download',
      'HTML bundle unlock available',
      'Categories for easier browsing',
      'No paid-template checkout required',
    ],
    faqs: [
      {
        question: 'How many free HTML templates can I download?',
        answer: 'Free account download rules apply to individual free templates. The HTML bundle unlock is separate and unlocks the HTML collection in one ZIP.',
      },
      {
        question: 'Are HTML templates mixed with paid dashboard templates?',
        answer: 'No. HTML templates are categorized separately so users can browse portfolio, agency, ecommerce, and other static templates cleanly.',
      },
    ],
    related: ['portfolio-html-templates', 'agency-website-templates', 'landing-page-templates'],
  },
  {
    slug: 'portfolio-html-templates',
    title: 'Portfolio HTML Templates',
    h1: 'Portfolio HTML templates for creators, designers, developers, and personal brands',
    eyebrow: 'Portfolio websites',
    description:
      'Explore portfolio HTML templates for designers, developers, photographers, fashion editors, creators, freelancers, agencies, and personal brand websites.',
    metaDescription:
      'Portfolio HTML templates for designers, developers, photographers, creators, freelancers, and personal brands. Responsive previews and ZIP downloads.',
    keywords: [
      'portfolio HTML templates',
      'free portfolio website templates',
      'designer portfolio template',
      'developer portfolio template',
      'photography portfolio template',
      'personal website template',
      'creative portfolio HTML',
    ],
    intentTags: ['portfolio', 'personal', 'designer', 'developer', 'photography', 'creative', 'resume', 'cv'],
    categoryIds: ['html'],
    priceMode: 'free',
    introTitle: 'Portfolio templates that show the work first',
    intro: [
      'A portfolio website should make the person, work, services, and contact path easy to understand. Strong visual hierarchy and fast loading matter more than heavy effects.',
      'This hub highlights portfolio-focused HTML templates from mtverse, including creative, editorial, developer, freelancer, and personal-brand layouts.',
    ],
    useCases: ['Designer portfolios', 'Developer portfolios', 'Fashion portfolios', 'Photography portfolios', 'Freelancer websites', 'Resume websites'],
    checklist: [
      'Project showcase sections',
      'About and service blocks',
      'Contact-ready layouts',
      'Responsive image sections',
      'Free download path',
      'HTML bundle option',
    ],
    faqs: [
      {
        question: 'Can I use these for a personal portfolio?',
        answer: 'Yes. Portfolio HTML templates are meant for personal websites, creators, freelancers, and small client projects. Review the license details before publishing.',
      },
      {
        question: 'Do portfolio templates include images?',
        answer: 'Template packages may include screenshots, placeholders, or assets depending on the template. Check the detail page and ZIP package for exact contents.',
      },
    ],
    related: ['free-html-templates', 'agency-website-templates', 'landing-page-templates'],
  },
  {
    slug: 'saas-templates',
    title: 'SaaS Templates',
    h1: 'SaaS templates for dashboards, landing pages, billing, teams, and product workflows',
    eyebrow: 'SaaS UI kits',
    description:
      'Browse SaaS templates for product landing pages, admin dashboards, billing screens, workspaces, analytics, settings, team management, and startup websites.',
    metaDescription:
      'SaaS templates for dashboards, landing pages, billing, teams, workspaces, analytics, and startup websites. Live previews and source-code downloads.',
    keywords: [
      'SaaS templates',
      'SaaS dashboard template',
      'SaaS landing page template',
      'startup template',
      'subscription dashboard template',
      'billing dashboard UI',
      'team workspace template',
    ],
    intentTags: ['saas', 'startup', 'billing', 'workspace', 'team', 'subscription', 'dashboard', 'landing'],
    categoryIds: ['dashboards', 'landing', 'html'],
    priceMode: 'all',
    introTitle: 'SaaS templates for both marketing and product screens',
    intro: [
      'SaaS teams often need two template types: a marketing page that explains the offer and an application dashboard that manages users, billing, analytics, and settings.',
      'This hub groups mtverse templates that fit SaaS launches, internal tools, team workspaces, subscription products, and admin portals.',
    ],
    useCases: ['SaaS landing pages', 'Billing dashboards', 'Team workspaces', 'Usage analytics', 'Startup websites', 'Internal SaaS tools'],
    checklist: [
      'Landing and dashboard options',
      'Pricing and CTA sections',
      'Admin and account screens',
      'Analytics and settings patterns',
      'Live preview access',
      'Secure download flow',
    ],
    faqs: [
      {
        question: 'Should I start with a landing template or a dashboard template?',
        answer: 'Use a landing template when you need acquisition pages first. Use a dashboard template when the product UI and authenticated workspace are the priority.',
      },
      {
        question: 'Are SaaS templates good for client projects?',
        answer: 'Yes. They are useful for SaaS MVPs, startup websites, agency client portals, and admin-heavy product demos.',
      },
    ],
    related: ['nextjs-dashboard-templates', 'landing-page-templates', 'react-admin-dashboard-templates'],
  },
  {
    slug: 'agency-website-templates',
    title: 'Agency Website Templates',
    h1: 'Agency website templates for studios, services, marketing teams, and client websites',
    eyebrow: 'Agency websites',
    description:
      'Find agency website templates for creative studios, marketing agencies, consultants, SaaS service pages, business websites, portfolio agencies, and lead-generation pages.',
    metaDescription:
      'Agency website templates for creative studios, marketing agencies, consultants, service businesses, and client websites. Responsive previews and downloads.',
    keywords: [
      'agency website templates',
      'marketing agency template',
      'creative agency website template',
      'business website templates',
      'service website template',
      'consulting website template',
      'agency landing page template',
    ],
    intentTags: ['agency', 'marketing', 'business', 'service', 'consulting', 'studio', 'creative', 'corporate'],
    categoryIds: ['html', 'landing'],
    priceMode: 'all',
    introTitle: 'Agency templates need trust and proof',
    intro: [
      'An agency website should quickly communicate the offer, proof, services, process, case studies, and contact path. It should feel credible without hiding the work behind decoration.',
      'This hub collects mtverse templates that fit agencies, studios, consultants, and service businesses that need polished client-facing websites.',
    ],
    useCases: ['Creative agencies', 'Marketing agencies', 'Consultants', 'Service businesses', 'Studio portfolios', 'Lead-generation sites'],
    checklist: [
      'Service and process sections',
      'Case study and portfolio areas',
      'Contact and CTA blocks',
      'Responsive page layouts',
      'Static HTML and landing options',
      'Preview before download',
    ],
    faqs: [
      {
        question: 'Are agency templates free?',
        answer: 'Some agency-style HTML templates are free under the free download rules. Paid landing templates or paid bundles are marked clearly on their detail pages.',
      },
      {
        question: 'Can I customize these for clients?',
        answer: 'Yes, template packages are meant to be customized. Keep the license model in mind for production client projects.',
      },
    ],
    related: ['landing-page-templates', 'portfolio-html-templates', 'free-html-templates'],
  },
]

export function getTemplateSeoHub(slug: string) {
  return TEMPLATE_SEO_HUBS.find((hub) => hub.slug === slug) ?? null
}

function includesAny(haystack: string, needles: string[]) {
  return needles.some((needle) => haystack.includes(needle.toLowerCase()))
}

export function templateMatchesSeoHub(template: Template, hub: TemplateSeoHub) {
  if (hub.priceMode === 'free' && !template.isFree) return false
  if (hub.priceMode === 'paid' && template.isFree) return false

  const categoryMatch = hub.categoryIds?.length ? hub.categoryIds.includes(template.category) : true
  const searchable = [
    template.title,
    template.summary,
    template.description,
    template.subcategory || '',
    template.category,
    template.categoryLabel || '',
    template.frameworkLabel || '',
    ...template.tags,
    ...template.techStack,
    ...template.features,
    ...template.pages,
  ]
    .join(' ')
    .toLowerCase()

  const intentMatch = includesAny(searchable, hub.intentTags)
  return categoryMatch && intentMatch
}

export function getHubTemplates(templates: Template[], hub: TemplateSeoHub) {
  return templates.filter((template) => templateMatchesSeoHub(template, hub))
}
