import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2, Code2, ShieldCheck } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { TemplateCard } from '@/components/templates/template-card'
import { TemplateFaqList } from '@/components/content/template-faq-list'
import { Reveal, Stagger, StaggerItem } from '@/components/design-system/animations'
import { getAllTemplatesFromStore } from '@/lib/templates-data'
import { SITE_URL } from '@/lib/site-url'

type Params = Promise<{ vertical: string }>
type Vertical = { slug: string; label: string; title: string; h1: string; description: string; intro: string; audiences: string[]; checklist: string[]; caution: string }

const VERTICALS: Vertical[] = [
  { slug: 'restaurant', label: 'Restaurant', title: 'Free Restaurant HTML Website Templates', h1: 'Restaurant HTML templates for menus, reservations, and local discovery', description: 'Browse responsive restaurant HTML templates with menu sections, opening hours, locations, reservation calls to action, galleries, and mobile-ready layouts.', intro: 'A restaurant site must answer practical questions quickly: what is on the menu, where is the venue, when is it open, and how can a guest reserve or order? These templates prioritize that journey while leaving room for photography, chef stories, reviews, and seasonal offers.', audiences: ['Restaurants and cafes', 'Bakeries and bars', 'Food trucks', 'Private chefs'], checklist: ['Readable mobile menus', 'Visible hours and location', 'Reservation or ordering CTA', 'Optimized food imagery', 'Accessible contact details'], caution: 'Connect booking and ordering actions to the provider you actually use, and keep menu prices, dietary notes, hours, and location information current.' },
  { slug: 'healthcare', label: 'Healthcare', title: 'Free Healthcare HTML Website Templates', h1: 'Healthcare HTML templates for clinics, practices, and patient-friendly services', description: 'Explore responsive healthcare HTML templates for clinics, doctors, dental practices, wellness providers, appointments, service pages, and trusted patient information.', intro: 'Healthcare pages need clarity, calm visual hierarchy, and direct access to appointments and contact information. These templates suit service explanations, clinician profiles, locations, insurance notes, FAQs, and urgent-contact guidance.', audiences: ['Medical clinics', 'Dental practices', 'Therapy providers', 'Wellness services'], checklist: ['Clear appointment CTA', 'Clinician and service profiles', 'Accessible typography', 'Location and contact details', 'Privacy-aware forms'], caution: 'A front-end template is not a compliant patient system. Connect forms only to services that meet the privacy, security, consent, and regulatory requirements for your region.' },
  { slug: 'education', label: 'Education', title: 'Free Education HTML Website Templates', h1: 'Education HTML templates for courses, schools, academies, and learning programs', description: 'Browse responsive education HTML templates for courses, schools, academies, tutors, bootcamps, admissions, curricula, instructors, and student enquiries.', intro: 'An education site should make the learning outcome, curriculum, instructor credibility, schedule, price, and enrollment path easy to compare. These templates provide a structured starting point for clear course discovery.', audiences: ['Schools and academies', 'Online courses', 'Tutors and coaches', 'Bootcamps'], checklist: ['Outcome-led course pages', 'Curriculum and schedule', 'Instructor credibility', 'Enrollment CTA', 'Student support'], caution: 'These packages provide the marketing front end, not an LMS. Integrate enrollment, payments, student accounts, and course delivery with an appropriate platform or backend.' },
  { slug: 'fitness', label: 'Fitness', title: 'Free Fitness HTML Website Templates', h1: 'Fitness HTML templates for gyms, trainers, classes, and wellness programs', description: 'Explore responsive fitness HTML templates for gyms, personal trainers, studios, class schedules, memberships, transformation programs, coaching, and lead generation.', intro: 'Fitness sites convert when visitors understand the program, trainer, schedule, location, membership options, and next step. These templates support energetic brands while preserving readable plans and mobile calls to action.', audiences: ['Gyms and studios', 'Personal trainers', 'Yoga and Pilates', 'Online coaching'], checklist: ['Visible class schedule', 'Trainer credentials', 'Membership details', 'Responsible proof', 'Mobile trial CTA'], caution: 'Keep health and outcome claims accurate, show applicable qualifications, and connect trials or class booking to a reliable scheduling workflow.' },
  { slug: 'real-estate', label: 'Real Estate', title: 'Free Real Estate HTML Website Templates', h1: 'Real estate HTML templates for listings, agents, developments, and local leads', description: 'Browse responsive real estate HTML templates for listings, agents, brokerages, developments, neighborhood guides, enquiries, viewings, and lead generation.', intro: 'A real estate site needs strong property presentation and a direct path from discovery to enquiry. These templates support listings, location context, agent trust, viewing requests, developments, and local-market content.', audiences: ['Real estate agents', 'Brokerages', 'Property developers', 'Rental businesses'], checklist: ['Scannable property cards', 'Location context', 'Agent credibility', 'Viewing CTA', 'Optimized galleries'], caution: 'Connect listings to your verified CMS, feed, or backend and keep availability, pricing, dimensions, legal status, and contact details accurate.' },
  { slug: 'crypto', label: 'Crypto', title: 'Free Crypto HTML Website Templates', h1: 'Crypto HTML templates for Web3 products, wallets, analytics, and communities', description: 'Explore responsive crypto HTML templates for Web3 products, wallets, analytics, communities, documentation, token platforms, and waitlist launches.', intro: 'Crypto pages need to explain utility, security assumptions, access, documentation, community channels, and risk clearly. These templates provide a visual foundation while leaving technical claims and live data under your control.', audiences: ['Web3 SaaS products', 'Wallets and exchanges', 'Analytics tools', 'Developer communities'], checklist: ['Clear product utility', 'Security and risk context', 'Documentation links', 'Transparent roadmap', 'No unsupported return claims'], caution: 'Wallet connections, contracts, transactions, and live prices require separate implementation and security review. Publish accurate risk language for every jurisdiction you serve.' },
]

function getVertical(slug: string) { return VERTICALS.find((item) => item.slug === slug) || null }
function buildFaqs(vertical: Vertical) {
  return [
    { question: `What should a ${vertical.label.toLowerCase()} HTML template include?`, answer: `Look for content hierarchy, calls to action, trust details, and mobile behavior that match a real ${vertical.label.toLowerCase()} visitor journey. Use the live preview before downloading.` },
    { question: `Can I customize these ${vertical.label.toLowerCase()} templates?`, answer: 'Yes. The HTML and styling are editable. Replace demonstration content, imagery, links, forms, and brand tokens before publishing.' },
    { question: 'Do the templates include a backend?', answer: 'No. These are front-end packages. Forms, accounts, payments, live data, and regulated workflows need a secure service or backend.' },
  ]
}

export const revalidate = 300
export function generateStaticParams() { return VERTICALS.map((item) => ({ vertical: item.slug })) }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const vertical = getVertical((await params).vertical)
  if (!vertical) return { title: 'HTML template collection not found', robots: { index: false, follow: false } }
  return {
    title: vertical.title,
    description: vertical.description,
    keywords: [`${vertical.label} HTML templates`, `free ${vertical.label.toLowerCase()} website templates`, 'responsive HTML templates'],
    alternates: { canonical: `/html-templates/${vertical.slug}` },
    openGraph: { title: vertical.title, description: vertical.description, url: `${SITE_URL}/html-templates/${vertical.slug}`, type: 'website', images: ['/opengraph-image'] },
    twitter: { card: 'summary_large_image', title: vertical.title, description: vertical.description, images: ['/opengraph-image'] },
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  }
}

export default async function HtmlTemplateVerticalPage({ params }: { params: Params }) {
  const vertical = getVertical((await params).vertical)
  if (!vertical) notFound()
  const templates = (await getAllTemplatesFromStore()).filter((template) => template.category === 'html' && template.subcategory?.toLowerCase() === vertical.label.toLowerCase())
  const faqs = buildFaqs(vertical)
  const canonicalUrl = `${SITE_URL}/html-templates/${vertical.slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'CollectionPage', '@id': canonicalUrl + '#collection', name: vertical.title, headline: vertical.h1, description: vertical.description, url: canonicalUrl, numberOfItems: templates.length },
      { '@type': 'ItemList', itemListElement: templates.map((template, index) => ({ '@type': 'ListItem', position: index + 1, name: template.title, url: `${SITE_URL}/templates/${template.slug}` })) },
      { '@type': 'FAQPage', mainEntity: faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL }, { '@type': 'ListItem', position: 2, name: 'HTML templates', item: SITE_URL + '/html-templates' }, { '@type': 'ListItem', position: 3, name: vertical.label, item: canonicalUrl }] },
    ],
  }

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main>
        <section className="ds-section-sm"><div className="ds-container max-w-5xl"><Reveal>
          <Link href="/html-templates" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">HTML templates <ArrowRight className="h-3.5 w-3.5" /> {vertical.label}</Link>
          <span className="ds-eyebrow ds-eyebrow-accent mb-4"><Code2 className="h-3.5 w-3.5" />{vertical.label} websites</span>
          <h1 className="ds-display-2 ds-text-balance">{vertical.h1}</h1>
          <p className="ds-lead ds-text-pretty mt-5 max-w-3xl">{vertical.description}</p>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">{vertical.intro}</p>
          <div className="mt-6 flex flex-wrap gap-2">{vertical.audiences.map((item) => <span key={item} className="rounded-full border bg-background px-3 py-1 text-sm font-semibold">{item}</span>)}</div>
        </Reveal></div></section>

        <section className="ds-section-sm ds-bg-section"><div className="ds-container">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><span className="ds-eyebrow">{templates.length} live templates</span><h2 className="ds-h1 mt-3">Preview {vertical.label.toLowerCase()} templates</h2></div><Link href="/pricing" className="ds-btn ds-btn-secondary">View bundle access</Link></div>
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{templates.map((template, index) => <StaggerItem key={template.id}><TemplateCard template={template} priority={index === 0} /></StaggerItem>)}</Stagger>
        </div></section>

        <section className="ds-section-sm"><div className="ds-container grid gap-6 lg:grid-cols-2">
          <Reveal className="ds-card"><CheckCircle2 className="mb-4 h-6 w-6 text-primary" /><h2 className="ds-h2">Selection checklist</h2><ul className="mt-5 space-y-3">{vertical.checklist.map((item) => <li key={item} className="flex gap-3 text-sm text-muted-foreground"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{item}</li>)}</ul></Reveal>
          <Reveal delay={0.08} className="ds-card"><ShieldCheck className="mb-4 h-6 w-6 text-primary" /><h2 className="ds-h2">Before publishing</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">{vertical.caution}</p><p className="mt-3 text-sm leading-7 text-muted-foreground">Verify links and forms, optimize licensed images, test keyboard and mobile navigation, and publish accurate privacy, contact, and business information.</p></Reveal>
        </div></section>

        <section className="ds-section-sm ds-bg-section"><div className="ds-container max-w-4xl"><h2 className="ds-h1 mb-6">{vertical.label} template questions</h2><TemplateFaqList items={faqs} /></div></section>
        <section className="ds-section-sm"><div className="ds-container max-w-5xl"><h2 className="text-sm font-bold">Explore other HTML template collections</h2><div className="mt-4 flex flex-wrap gap-2">{VERTICALS.filter((item) => item.slug !== vertical.slug).map((item) => <Link key={item.slug} href={`/html-templates/${item.slug}`} className="ds-btn ds-btn-secondary ds-btn-sm">{item.label}</Link>)}</div></div></section>
      </main>
    </PublicLayout>
  )
}