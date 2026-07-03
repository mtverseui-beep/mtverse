'use client'

import type { CSSProperties } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Bot, CheckCircle2, ListChecks, Sparkles } from 'lucide-react'
import PromptActions from '@/components/prompts/PromptActions'
import PromptPreviewImage from '@/components/prompts/PromptPreviewImage'
import type { PromptEntry } from '@/lib/prompt-library-data'

const motionTransition = { duration: 0.42, ease: 'easeOut' } as const

type PromptClientEntry = Omit<PromptEntry, 'prompt'>

function getPreviewAspectStyle(prompt: Pick<PromptEntry, 'previewWidth' | 'previewHeight'>, fallback = '4 / 5') {
  const width = prompt.previewWidth
  const height = prompt.previewHeight

  return {
    aspectRatio:
      typeof width === 'number' &&
      typeof height === 'number' &&
      Number.isFinite(width) &&
      Number.isFinite(height) &&
      width > 0 &&
      height > 0
        ? `${Math.round(width)} / ${Math.round(height)}`
        : fallback,
  } satisfies CSSProperties
}

function RelatedPromptCard({ prompt }: { prompt: PromptClientEntry }) {
  return (
    <Link
      href={`/prompts/${prompt.slug}`}
      prefetch={false}
      className="group mb-2 block min-w-0 cursor-pointer break-inside-avoid focus:outline-none sm:mb-3"
      aria-label={`Open ${prompt.title}`}
    >
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-md border border-border/80 bg-card shadow-sm shadow-slate-950/[0.03] transition duration-200 group-hover:border-primary/30 group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 dark:shadow-black/10"
      >
        <div className="relative overflow-hidden bg-muted" style={getPreviewAspectStyle(prompt, '3 / 4')}>
          <PromptPreviewImage
            src={prompt.previewImage}
            alt={prompt.previewAlt}
            category={prompt.category}
            imageFit="contain"
            sizes="(max-width: 640px) 49vw, (max-width: 1024px) 32vw, 20vw"
            imgClassName="transition-transform duration-500 group-hover:scale-[1.018] group-focus-visible:scale-[1.018]"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-12 opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
            <h3 className="line-clamp-2 text-xs font-bold leading-4 text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.7)] sm:text-[13px] sm:leading-5">
              {prompt.title}
            </h3>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

export default function PromptDetailPage({
  prompt,
  relatedPrompts,
}: {
  prompt: PromptClientEntry
  relatedPrompts: PromptClientEntry[]
}) {
  const keywords = Array.from(new Set(prompt.tags)).slice(0, 10)
  const bestFor = prompt.bestFor.slice(0, 5)
  const workflow = prompt.workflow.slice(0, 4)
  const relatedItems = relatedPrompts.slice(0, 24)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen bg-[var(--surface-sunken)] text-foreground"
    >
      <main className="mx-auto max-w-[1380px] px-3 pb-14 pt-2 sm:px-6 sm:pt-3 lg:px-8 lg:pt-4">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionTransition}
          className="grid gap-4 lg:grid-cols-[minmax(260px,380px)_minmax(0,1fr)] lg:items-start lg:gap-7"
        >
          <motion.aside
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...motionTransition, delay: 0.04 }}
            className="mx-auto w-full max-w-[330px] sm:max-w-[360px] lg:sticky lg:top-24 lg:mx-0 lg:max-w-[380px]"
          >
            <div className="overflow-hidden rounded-md border border-border/80 bg-card p-2 shadow-sm shadow-slate-950/[0.04] dark:shadow-black/10">
              <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted">
                <PromptPreviewImage
                  src={prompt.previewImage}
                  alt={prompt.previewAlt}
                  category={prompt.category}
                  imageFit="contain"
                  priority
                  className="bg-muted"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 38vw, 480px"
                />
              </div>
            </div>
          </motion.aside>

          <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...motionTransition, delay: 0.09 }}
            className="min-w-0 rounded-md border border-border/80 bg-card/95 p-4 shadow-sm shadow-slate-950/[0.04] sm:p-5 lg:p-6 dark:shadow-black/10"
          >
            <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-black uppercase leading-4 tracking-[0.12em] text-primary sm:gap-2 sm:text-[11px] sm:tracking-[0.16em]">
              <span>{prompt.categoryTitle}</span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span>{prompt.subcategory}</span>
              {prompt.featured ? (
                <>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span>Featured</span>
                </>
              ) : null}
            </div>

            <h1 className="mt-2 max-w-4xl text-[21px] font-black leading-[1.12] text-foreground sm:mt-3 sm:text-3xl sm:tracking-[-0.015em] lg:text-4xl">
              {prompt.title}
            </h1>
            <p className="mt-3 max-w-4xl text-[13px] leading-6 text-muted-foreground sm:text-sm sm:leading-7">
              {prompt.summary}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {prompt.models.map(model => (
                <span
                  key={model}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-[var(--surface-sunken)] px-2.5 py-1.5 text-[11px] font-bold text-muted-foreground sm:px-3 sm:text-xs"
                >
                  <Bot className="h-3.5 w-3.5" />
                  {model}
                </span>
              ))}
            </div>

            <PromptActions slug={prompt.slug} title={prompt.title} summary={prompt.summary} />
          </motion.article>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionTransition, delay: 0.14 }}
          className="mt-6 space-y-4 sm:mt-8 sm:space-y-5"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {bestFor.length > 0 ? (
              <section className="rounded-md border border-border/80 bg-card p-3.5 shadow-sm shadow-slate-950/[0.03] sm:p-5 dark:shadow-black/10">
                <h2 className="flex items-center gap-2 text-[13px] font-black text-foreground sm:text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Best for
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {bestFor.map(item => (
                    <span key={item} className="rounded-md border border-border bg-[var(--surface-sunken)] px-2.5 py-1.5 text-[11px] font-bold text-muted-foreground sm:px-3 sm:text-xs">
                      {item}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            {workflow.length > 0 ? (
              <section className="rounded-md border border-border/80 bg-card p-3.5 shadow-sm shadow-slate-950/[0.03] sm:p-5 dark:shadow-black/10">
                <h2 className="flex items-center gap-2 text-[13px] font-black text-foreground sm:text-sm">
                  <ListChecks className="h-4 w-4 text-primary" />
                  How to use
                </h2>
                <ol className="mt-3 space-y-2">
                  {workflow.map((item, index) => (
                    <li key={item} className="flex gap-2 text-[13px] leading-5 text-muted-foreground sm:text-sm sm:leading-6">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-black text-primary-foreground">
                        {index + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
          </div>

          <section className="rounded-md border border-border/80 bg-card p-3.5 shadow-sm shadow-slate-950/[0.03] sm:p-5 dark:shadow-black/10">
            <h2 className="text-[13px] font-black text-foreground sm:text-sm">Why this free AI prompt works</h2>
            <p className="mt-2 max-w-5xl text-[13px] leading-6 text-muted-foreground sm:text-sm sm:leading-7">
              {prompt.description}
            </p>
          </section>

          {keywords.length > 0 ? (
            <section className="rounded-md border border-border/80 bg-card p-3.5 shadow-sm shadow-slate-950/[0.03] sm:p-5 dark:shadow-black/10">
              <h2 className="text-[13px] font-black text-foreground sm:text-sm">Keywords</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {keywords.map(keyword => (
                  <Link
                    key={keyword}
                    href={`/prompts?q=${encodeURIComponent(keyword)}`}
                    prefetch={false}
                    className="cursor-pointer rounded-md bg-[var(--surface-sunken)] px-2.5 py-1.5 text-[11px] font-bold text-muted-foreground transition hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-3 sm:text-xs"
                  >
                    #{keyword.replace(/^#/, '')}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </motion.section>

        {relatedItems.length > 0 ? (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...motionTransition, delay: 0.18 }}
            className="mt-10 border-t border-border pt-8 sm:mt-14 sm:pt-10"
          >
            <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end sm:gap-4">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground sm:text-xs sm:tracking-[0.16em]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Related prompts
                </div>
                <h2 className="mt-1.5 text-xl font-black tracking-[-0.015em] text-foreground sm:mt-2 sm:text-2xl">
                  More prompts to try
                </h2>
              </div>
              <Link
                href="/prompts"
                prefetch={false}
                className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md text-sm font-bold text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Browse all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-5">
              <div className="columns-2 gap-2 sm:columns-3 sm:gap-3 lg:columns-5 xl:columns-6">
                {relatedItems.map(related => (
                  <RelatedPromptCard key={related.slug} prompt={related} />
                ))}
              </div>
            </div>
          </motion.section>
        ) : null}
      </main>
    </motion.div>
  )
}
