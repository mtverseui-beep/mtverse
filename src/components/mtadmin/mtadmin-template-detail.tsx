import Link from 'next/link'
import { ArrowRight, Check, ChevronRight, CircleDollarSign, Code2, Layers3, LayoutDashboard, PackageCheck, Route, ShieldCheck } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { TemplateCard } from '@/components/templates/template-card'
import { TemplateFaqList } from '@/components/content/template-faq-list'
import { MtadminLivePreviewMenu, MtadminPreviewExperience } from '@/components/mtadmin/mtadmin-preview-experience'
import type { MtadminProduct } from '@/lib/mtadmin-product'
import type { Template } from '@/lib/templates-catalog'

type Props = { product: MtadminProduct; template: Template; related: Template[]; jsonLd: object }

export function MtadminTemplateDetail({ product, related, jsonLd }: Props) {
  const previewUrls = {
    nextjs: process.env.NEXT_PUBLIC_MTADMIN_NEXTJS_PREVIEW_URL?.trim() || 'https://mt-nextjs.mtverse.dev',
    react: process.env.NEXT_PUBLIC_MTADMIN_REACT_PREVIEW_URL?.trim() || 'https://mt-react.mtverse.dev',
  }
  const frameworkGuides = [
    { name: 'Next.js', href: '/blog/mtadmin-nextjs-admin-dashboard-template-guide' },
    { name: 'React', href: '/blog/mtadmin-react-admin-dashboard-template-guide' },
    { name: 'HTML', href: '/blog/mtadmin-html-admin-dashboard-template-roadmap' },
    { name: 'Vue.js', href: '/blog/mtadmin-vue-admin-dashboard-template-roadmap' },
    { name: 'Angular', href: '/blog/mtadmin-angular-admin-dashboard-template-roadmap' },
    { name: 'Laravel', href: '/blog/mtadmin-laravel-admin-dashboard-template-roadmap' },
  ]
  const metrics = [
    { value: `${product.metrics.dashboards}`, label: 'Purpose-built dashboards', icon: LayoutDashboard },
    { value: `${product.metrics.routesPerEdition}`, label: 'Application routes per edition', icon: Route },
    { value: `${product.metrics.componentsPerEdition}+`, label: 'Reusable components per edition', icon: Code2 },
    { value: `${product.metrics.layouts}`, label: 'Responsive layout systems', icon: Layers3 },
  ]

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main>
        <div className="ds-container pt-4">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link><ChevronRight className="h-3.5 w-3.5" />
            <Link href="/templates" className="hover:text-foreground">Templates</Link><ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">mtadmin</span>
          </nav>
        </div>

        <section className="border-b border-border">
          <div className="ds-container py-6 sm:py-8">
            <div className="max-w-4xl">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-primary">Pro</span>
                <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">Next.js + React available</span>
                <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">One-time purchase</span>
              </div>
              <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">mtadmin Next.js and React admin dashboard template</h1>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground sm:text-base">{product.summary}</p>
            </div>

            <div className="mt-5 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
              <MtadminPreviewExperience images={product.previewImages} />
              <aside className="self-start rounded-xl border border-border bg-card p-5 shadow-lg shadow-black/[0.04]">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">All Frameworks Bundle</p>
                <div className="mt-3 flex items-end gap-2"><span className="text-4xl font-bold tracking-tight text-foreground">${product.bundlePriceUsd}</span><span className="pb-1 text-sm text-muted-foreground">one-time</span></div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">Next.js and React now. HTML, Vue.js, Angular, and Laravel are added to your account as they ship.</p>
                <Link href="/mtadmin/pricing" className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 transition-colors hover:bg-primary/90">Buy mtadmin <ArrowRight className="h-4 w-4" /></Link>
                <MtadminLivePreviewMenu editions={product.editions} previewUrls={previewUrls} />
                <div className="mt-5 border-t border-border pt-4">
                  {['Lifetime access and product updates', 'Commercial project usage', 'Private account download delivery', 'Future framework editions in bundle'].map((item) => <div key={item} className="flex items-start gap-2 py-1.5 text-sm text-foreground"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><span>{item}</span></div>)}
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-muted/25">
          <div className="ds-container grid grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric, index) => <div key={metric.label} className={`px-4 py-7 sm:px-6 ${index % 2 === 0 ? 'border-r border-border' : ''} ${index < 2 ? 'border-b border-border lg:border-b-0' : ''} lg:border-r lg:last:border-r-0`}><metric.icon className="h-5 w-5 text-primary" /><p className="mt-4 text-3xl font-bold tracking-tight text-foreground">{metric.value}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{metric.label}</p></div>)}
          </div>
        </section>

        <section className="ds-section-sm">
          <div className="ds-container grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <span className="ds-eyebrow ds-eyebrow-accent">Inside mtadmin</span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">One source system for serious application products</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">mtadmin covers the operational surfaces teams repeatedly rebuild: commerce, reporting, customer data, finance, logistics, support, authentication, account controls, and reusable UI foundations.</p>
              <div className="mt-6 flex flex-wrap gap-2">{product.useCases.map((useCase) => <span key={useCase} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground">{useCase}</span>)}</div>
            </div>
            <div className="grid border-l border-t border-border sm:grid-cols-2">
              {product.featureGroups.map((group) => <div key={group.title} className="border-b border-r border-border p-5 sm:p-6"><h3 className="text-sm font-bold text-foreground">{group.title}</h3><ul className="mt-4 space-y-2.5">{group.items.map((item) => <li key={item} className="flex items-start gap-2 text-sm leading-6 text-muted-foreground"><Check className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-600" /><span>{item}</span></li>)}</ul></div>)}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-background">
          <div className="ds-container grid lg:grid-cols-2">
            <div className="py-10 lg:border-r lg:border-border lg:pr-10">
              <div className="flex items-center gap-2"><LayoutDashboard className="h-5 w-5 text-primary" /><h2 className="text-xl font-bold text-foreground">14 complete dashboard experiences</h2></div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">Each dashboard is designed around a distinct product workflow instead of repeating the same chart layout with different labels.</p>
              <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-3">{product.dashboards.map((dashboard, index) => <div key={dashboard} className="flex items-center gap-2 border-b border-border/70 pb-2 text-sm font-medium text-foreground"><span className="text-xs font-bold text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>{dashboard}</div>)}</div>
            </div>
            <div className="border-t border-border py-10 lg:border-t-0 lg:pl-10">
              <div className="flex items-center gap-2"><Layers3 className="h-5 w-5 text-primary" /><h2 className="text-xl font-bold text-foreground">Six application layout systems</h2></div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">Switch the shell without rebuilding product screens. Navigation, content density, and responsive behavior remain consistent across layouts.</p>
              <div className="mt-6 space-y-3">{product.layouts.map((layout) => <div key={layout} className="flex items-center justify-between border-b border-border pb-3"><span className="text-sm font-semibold text-foreground">{layout}</span><Check className="h-4 w-4 text-emerald-600" /></div>)}</div>
            </div>
          </div>
        </section>

        <section className="ds-section-sm bg-muted/25">
          <div className="ds-container">
            <div className="max-w-3xl"><span className="ds-eyebrow">Framework editions</span><h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground">Choose source that fits your stack</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">Available editions are complete native projects. Coming editions follow the same product scope and are included for bundle buyers when released.</p></div>
            <div className="mt-7 overflow-hidden rounded-lg border border-border bg-card">
              {product.editions.map((edition, index) => <div key={edition.id} className={`grid gap-3 px-4 py-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center sm:px-5 ${index ? 'border-t border-border' : ''}`}><div><p className="text-sm font-bold text-foreground">{edition.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{edition.framework}</p></div><p className="text-sm text-muted-foreground">{edition.language}</p><p className="text-sm text-muted-foreground">{edition.styling}</p><span className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${edition.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>{edition.status === 'available' ? 'Available' : 'Coming soon'}</span></div>)}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {frameworkGuides.map((guide) => (
                <Link key={guide.href} href={guide.href} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary">
                  {guide.name} guide <ArrowRight className="h-3 w-3" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-background">
          <div className="ds-container grid gap-0 md:grid-cols-3">
            {[
              { icon: PackageCheck, title: 'Private source delivery', copy: 'Purchased packages stay available in your account for later downloads.' },
              { icon: ShieldCheck, title: 'Commercial project license', copy: product.license.summary },
              { icon: CircleDollarSign, title: 'One-time ownership', copy: 'No recurring subscription. Choose one edition or the all-frameworks bundle.' },
            ].map((item, index) => <div key={item.title} className={`py-8 md:px-7 ${index ? 'border-t border-border md:border-l md:border-t-0' : ''}`}><item.icon className="h-5 w-5 text-primary" /><h2 className="mt-4 text-sm font-bold text-foreground">{item.title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.copy}</p></div>)}
          </div>
        </section>

        <section className="ds-section-sm bg-muted/25"><div className="ds-container max-w-4xl"><div className="mb-7 text-center"><span className="ds-eyebrow">mtadmin FAQ</span><h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground">Before you choose an edition</h2></div><TemplateFaqList items={product.faqs} /></div></section>

        {related.length ? <section className="ds-section-sm"><div className="ds-container"><div className="mb-6 flex items-end justify-between gap-4"><div><span className="ds-eyebrow">More templates</span><h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">Explore other admin systems</h2></div><Link href="/template-categories/dashboards" className="hidden text-sm font-semibold text-primary sm:inline-flex">View dashboards</Link></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{related.map((item) => <TemplateCard key={item.id} template={item} />)}</div></div></section> : null}

        <section className="border-t border-border bg-zinc-950 text-white"><div className="ds-container flex flex-col gap-6 py-12 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-300">Ship your admin product faster</p><h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Get mtadmin from ${product.individualPriceUsd}</h2><p className="mt-2 text-sm text-zinc-400">Compare the individual editions and all-frameworks bundle.</p></div><Link href="/mtadmin/pricing" className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-zinc-950 transition-colors hover:bg-zinc-100">View mtadmin pricing <ArrowRight className="h-4 w-4" /></Link></div></section>
      </main>
    </PublicLayout>
  )
}