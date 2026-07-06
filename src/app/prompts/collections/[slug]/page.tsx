import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Bot, Sparkles } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import UniverseTopBar from '@/components/public/UniverseTopBar'
import { getPromptLibraryData } from '@/lib/prompt-db'
import {
  getPromptCollection,
  getPromptCollectionHref,
  getPromptsForCollection,
  PROMPT_COLLECTIONS,
} from '@/lib/prompt-collections'
import { absoluteUrl, SITE_URL } from '@/lib/site-url'

type Params = Promise<{ slug: string }>

export const revalidate = 300

export function generateStaticParams() {
  return PROMPT_COLLECTIONS.map(collection => ({ slug: collection.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const collection = getPromptCollection(slug)

  if (!collection) {
    return {
      title: 'Prompt collection not found | mtverse',
      robots: { index: false, follow: false },
    }
  }

  const canonical = getPromptCollectionHref(collection.slug)

  return {
    title: `${collection.title} | mtverse`,
    description: collection.metaDescription,
    keywords: collection.keywords,
    alternates: { canonical: absoluteUrl(canonical) },
    openGraph: {
      title: `${collection.title} | mtverse`,
      description: collection.metaDescription,
      url: absoluteUrl(canonical),
      type: 'website',
      siteName: 'mtverse',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${collection.title} | mtverse`,
      description: collection.metaDescription,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default async function PromptCollectionPage({ params }: { params: Params }) {
  const { slug } = await params
  const collection = getPromptCollection(slug)

  if (!collection) notFound()

  const library = await getPromptLibraryData()
  const prompts = getPromptsForCollection(library.prompts, collection).slice(0, 60)
  const canonical = getPromptCollectionHref(collection.slug)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: collection.title,
        headline: collection.h1,
        description: collection.metaDescription,
        url: absoluteUrl(canonical),
        isPartOf: { '@type': 'WebSite', name: 'mtverse', url: SITE_URL },
        hasPart: prompts.slice(0, 24).map(prompt => ({
          '@type': 'CreativeWork',
          name: prompt.title,
          url: absoluteUrl(`/prompts/${prompt.slug}`),
          image: prompt.previewImage,
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: collection.faq.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Prompts', item: absoluteUrl('/prompts') },
          { '@type': 'ListItem', position: 3, name: collection.title, item: absoluteUrl(canonical) },
        ],
      },
    ],
  }

  return (
    <PublicLayout promptCount={library.stats.totalPrompts}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <UniverseTopBar
        items={[
          { label: 'Prompts', href: '/prompts' },
          { label: collection.shortTitle },
        ]}
        actionName={collection.title}
        actionSlug={collection.slug}
      />
      <main className="min-h-screen bg-[var(--surface-sunken)] text-foreground">
        <section className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Free prompt collection
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">{collection.h1}</h1>
            <p className="mt-4 text-base leading-8 text-muted-foreground sm:text-lg">{collection.description}</p>
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-3">
            {collection.howTo.map((item, index) => (
              <div key={item} className="rounded-md border border-border bg-card p-4 shadow-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-foreground">
                  {index + 1}
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-black">Copy-ready prompts</h2>
              <p className="mt-1 text-sm text-muted-foreground">A focused set from the mtverse prompt library.</p>
            </div>
            <Link href="/prompts" className="hidden items-center gap-1.5 text-sm font-bold text-primary hover:underline sm:inline-flex">
              Browse all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {prompts.length > 0 ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {prompts.map(prompt => (
                <Link
                  key={prompt.slug}
                  href={`/prompts/${prompt.slug}`}
                  className="group overflow-hidden rounded-md border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <div className="relative aspect-[4/5] bg-muted">
                    <Image
                      src={prompt.previewImage}
                      alt={prompt.previewAlt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.02]"
                      unoptimized
                    />
                  </div>
                  <div className="p-3">
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {prompt.models.slice(0, 2).map(model => (
                        <span key={model} className="inline-flex items-center gap-1 rounded-md bg-[var(--surface-sunken)] px-2 py-1 text-[10px] font-bold text-muted-foreground">
                          <Bot className="h-3 w-3" />
                          {model}
                        </span>
                      ))}
                    </div>
                    <h3 className="line-clamp-2 text-sm font-black leading-5">{prompt.title}</h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{prompt.summary}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-md border border-border bg-card p-6 text-sm text-muted-foreground">
              This collection is being refreshed. Browse the full prompt library for more results.
            </div>
          )}

          <section className="mt-12 rounded-md border border-border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-black">FAQ</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {collection.faq.map(item => (
                <div key={item.question} className="rounded-md bg-[var(--surface-sunken)] p-4">
                  <h3 className="text-sm font-black">{item.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </section>
      </main>
    </PublicLayout>
  )
}