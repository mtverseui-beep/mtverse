'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { memo, useCallback, useEffect, useRef, useState, useTransition, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Bot,
  Check,
  ChevronDown,
  Filter,
  ImageIcon,
  Search,
  Shuffle,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react'
import PromptPreviewImage from '@/components/prompts/PromptPreviewImage'
import { trackPromptEvent } from '@/components/prompts/promptAnalytics'
import { buildPromptHref, type PromptSortMode } from '@/lib/prompt-hub-ranking'
import type { PromptCategory, PromptCategoryId, PromptEntry, PromptModelId } from '@/lib/prompt-library-data'
import { cn } from '@/lib/utils'
import { PromptsHero3D } from '@/components/design-system/hero-3d'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet'

type PromptHubEntry = Pick<
  PromptEntry,
  | 'slug'
  | 'title'
  | 'previewImage'
  | 'previewAlt'
  | 'previewWidth'
  | 'previewHeight'
  | 'category'
  | 'subcategory'
  | 'visualStyle'
  | 'tags'
  | 'bestFor'
  | 'models'
  | 'featured'
  | 'updatedAt'
>

type PromptHubPageProps = {
  categories: PromptCategory[]
  models: PromptModelId[]
  filteredPrompts: PromptHubEntry[]
  activeCategory: 'all' | PromptCategoryId
  activeModel: 'all' | PromptModelId
  searchQuery: string
  sortMode: PromptSortMode
  shuffleSeed: string
  totalResults: number
  totalPrompts: number
  activePage: number
  totalPages: number
  pageSize: number
}

const QUICK_FILTER_CHIPS = [
  { label: 'All', category: 'all' as const, model: 'all' as const },
  { label: 'Image Generation', category: 'image-generation' as const, model: 'all' as const },
  { label: 'ChatGPT', category: 'all' as const, model: 'ChatGPT' as const },
  { label: 'Midjourney', category: 'all' as const, model: 'Midjourney' as const },
  { label: 'Coding', category: 'coding' as const, model: 'all' as const },
  { label: 'Writing', category: 'writing' as const, model: 'all' as const },
]

const TRENDING_SEARCHES = [
  'Nano Banana',
  'Veo',
  'Sora',
  'Photography',
  'Anime',
  'Fashion',
  'Art prompt',
]

const DEFAULT_PROMPT_PAGE_SIZE = 100

function getSortLabel(sortMode: PromptSortMode) {
  if (sortMode === 'hot') return 'Trending'
  return sortMode[0].toUpperCase() + sortMode.slice(1)
}

const FALLBACK_PROMPT_CARD_RATIOS = [
  '4 / 5',
  '3 / 4',
  '1 / 1',
  '9 / 16',
  '5 / 6',
  '4 / 3',
  '2 / 3',
  '6 / 7',
]

function getPromptCardAspectRatio(prompt: PromptHubEntry, index: number) {
  if (
    typeof prompt.previewWidth === 'number' &&
    typeof prompt.previewHeight === 'number' &&
    Number.isFinite(prompt.previewWidth) &&
    Number.isFinite(prompt.previewHeight) &&
    prompt.previewWidth > 0 &&
    prompt.previewHeight > 0
  ) {
    return `${Math.round(prompt.previewWidth)} / ${Math.round(prompt.previewHeight)}`
  }

  return FALLBACK_PROMPT_CARD_RATIOS[index % FALLBACK_PROMPT_CARD_RATIOS.length]
}

const PromptCard = memo(function PromptCard({
  prompt,
  index = 0,
  priority = false,
}: {
  prompt: PromptHubEntry
  index?: number
  priority?: boolean
}) {
  const previewStyle = {
    aspectRatio: getPromptCardAspectRatio(prompt, index),
  } satisfies CSSProperties

  return (
    <Link
      href={`/prompts/${prompt.slug}`}
      prefetch={true}
      onClick={() =>
        trackPromptEvent('Prompt Opened', {
          slug: prompt.slug,
          category: prompt.category,
          source: 'prompt_grid',
        })
      }
      className="group mb-1.5 block min-w-0 break-inside-avoid sm:mb-2"
      aria-label={`Open ${prompt.title}`}
    >
      <div className="relative overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-[border-color,box-shadow,transform] duration-200 ease-out hover:border-primary/30 hover:shadow-md motion-reduce:transition-none">
        <div className="relative overflow-hidden" style={previewStyle}>
          <PromptPreviewImage
            src={prompt.previewImage}
            alt={prompt.previewAlt}
            category={prompt.category}
            imageFit="contain"
            imgClassName="transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
            sizes="(max-width: 640px) 49vw, (max-width: 1024px) 32vw, (max-width: 1280px) 24vw, 16vw"
            priority={priority}
          />
          <div className="absolute inset-x-0 bottom-0 translate-y-3 bg-gradient-to-t from-black/75 via-black/40 to-transparent p-3 pt-12 opacity-0 transition-[opacity,transform] duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transition-none">
            <h3 className="line-clamp-2 text-sm font-bold leading-tight text-white drop-shadow-sm">
              {prompt.title}
            </h3>
          </div>
        </div>
      </div>
    </Link>
  )
})

function FilterSelect({
  label,
  icon,
  value,
  options,
  analyticsKey,
  onNavigate,
}: {
  label: string
  icon: ReactNode
  value: string
  options: Array<{ label: string; value: string; href: string }>
  analyticsKey: string
  onNavigate: () => void
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState({ left: 12, top: 72, width: 260 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const activeOption = options.find(option => option.value === value) || options[0]

  const positionMenu = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) return
    const gutter = 10
    const viewportWidth = window.innerWidth
    const width = viewportWidth < 640
      ? Math.min(viewportWidth - gutter * 2, 280)
      : Math.min(Math.max(rect.width + 92, 240), 360)
    const left = Math.min(Math.max(rect.left, gutter), viewportWidth - width - gutter)
    setMenuStyle({ left, top: rect.bottom + 8, width })
  }, [])

  useEffect(() => {
    if (!open) return
    positionMenu()
    const closeOnPointer = (event: PointerEvent) => {
      const target = event.target as Node
      if (buttonRef.current?.contains(target)) return
      if (target instanceof Element && target.closest(`[data-prompt-filter-menu="${analyticsKey}"]`)) return
      setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    window.addEventListener('resize', positionMenu)
    window.addEventListener('scroll', positionMenu, true)
    window.addEventListener('pointerdown', closeOnPointer)
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.removeEventListener('resize', positionMenu)
      window.removeEventListener('scroll', positionMenu, true)
      window.removeEventListener('pointerdown', closeOnPointer)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [analyticsKey, open, positionMenu])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => { positionMenu(); setOpen(current => !current) }}
        className={cn(
          'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground shadow-sm transition hover:border-foreground/20 hover:shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          open && 'border-primary ring-2 ring-primary/20'
        )}
      >
        <span className="text-muted-foreground">{icon}</span>
        <span className="hidden sm:inline">{label}</span>
        <span className="max-w-[80px] truncate text-muted-foreground sm:hidden">{activeOption?.label}</span>
        <span className="hidden max-w-[80px] truncate rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground sm:inline">
          {activeOption?.label}
        </span>
        <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition', open && 'rotate-180')} />
      </button>

      {open && typeof document !== 'undefined'
        ? createPortal(
            <div
              data-prompt-filter-menu={analyticsKey}
              role="listbox"
              aria-label={label}
              className="fixed z-[10000] max-h-[min(320px,48dvh)] overflow-y-auto rounded-lg border border-border bg-popover p-1.5 shadow-2xl [scrollbar-width:thin] sm:max-h-[min(420px,62dvh)]"
              style={menuStyle}
            >
              {options.map(option => {
                const active = option.value === value
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      setOpen(false)
                      if (active) return
                      trackPromptEvent('Prompt Filter Changed', { filter: analyticsKey, label: option.label })
                      onNavigate()
                      startTransition(() => router.push(option.href, { scroll: true }))
                    }}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs font-semibold transition sm:text-sm',
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent'
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {active ? <Check className="h-4 w-4 shrink-0" /> : null}
                  </button>
                )
              })}
            </div>,
            document.body
          )
        : null}
    </>
  )
}

// Mobile filter drawer
function MobileFilterDrawer({
  categories,
  models,
  activeCategory,
  activeModel,
  sortMode,
  searchQuery,
  currentShuffleSeed,
  nextShuffleSeed,
  onNavigate,
}: {
  categories: PromptCategory[]
  models: PromptModelId[]
  activeCategory: 'all' | PromptCategoryId
  activeModel: 'all' | PromptModelId
  sortMode: PromptSortMode
  searchQuery: string
  currentShuffleSeed: string | undefined
  nextShuffleSeed: string
  onNavigate: () => void
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const categoryOptions = [
    { label: 'All categories', value: 'all', href: buildPromptHref({ category: 'all', model: activeModel, query: searchQuery, sort: sortMode, seed: currentShuffleSeed }) },
    ...categories.map(category => ({
      label: category.title.replace(' Prompts', ''),
      value: category.id,
      href: buildPromptHref({ category: category.id, model: activeModel, query: searchQuery, sort: sortMode, seed: currentShuffleSeed }),
    })),
  ]
  const modelOptions = [
    { label: 'All models', value: 'all', href: buildPromptHref({ category: activeCategory, model: 'all', query: searchQuery, sort: sortMode, seed: currentShuffleSeed }) },
    ...models.map(model => ({
      label: model,
      value: model,
      href: buildPromptHref({ category: activeCategory, model, query: searchQuery, sort: sortMode, seed: currentShuffleSeed }),
    })),
  ]
  const sortOptions = (['featured', 'hot', 'new', 'top', 'shuffle'] as const).map(mode => ({
    label: mode === 'shuffle' ? 'Shuffle' : getSortLabel(mode),
    value: mode,
    href: buildPromptHref({
      category: activeCategory,
      model: activeModel,
      query: searchQuery,
      sort: mode,
      seed: mode === 'shuffle' ? nextShuffleSeed : undefined,
    }),
  }))

  const navigate = (href: string) => {
    onNavigate()
    startTransition(() => router.push(href, { scroll: true }))
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden gap-1.5">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[320px] overflow-y-auto sm:w-[380px]">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-6 px-4 pb-8">
          {/* Sort */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Sort By</h4>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => navigate(opt.href)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                    sortMode === opt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</h4>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => navigate(opt.href)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                    activeCategory === opt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Model */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Model</h4>
            <div className="flex flex-wrap gap-2">
              {modelOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => navigate(opt.href)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                    activeModel === opt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <SheetClose asChild>
            <Button className="w-full" variant="outline">Close</Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Pagination helper
function getPaginationPages(activePage: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, activePage - 1, activePage, activePage + 1])
  if (activePage <= 3) { pages.add(2); pages.add(3) }
  if (activePage >= totalPages - 2) { pages.add(totalPages - 1); pages.add(totalPages - 2) }
  return Array.from(pages).filter(page => page >= 1 && page <= totalPages).sort((a, b) => a - b)
}

// Main page
export default function PromptHubPage({
  categories,
  models,
  filteredPrompts,
  activeCategory,
  activeModel,
  searchQuery,
  sortMode,
  shuffleSeed,
  totalResults,
  totalPrompts,
  activePage,
  totalPages,
  pageSize,
}: PromptHubPageProps) {
  const router = useRouter()
  const [nextShuffleSeed, setNextShuffleSeed] = useState(shuffleSeed)
  const [searchDraft, setSearchDraft] = useState(searchQuery)
  const didMountSearch = useRef(false)

  useEffect(() => { setNextShuffleSeed(`${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`) }, [shuffleSeed])
  useEffect(() => { setSearchDraft(searchQuery) }, [searchQuery])

  const handleNavigationStart = () => undefined

  const visiblePrompts = filteredPrompts
  const currentShuffleSeed = sortMode === 'shuffle' ? shuffleSeed : undefined
  const shuffleHref = buildPromptHref({
    category: activeCategory,
    model: activeModel,
    query: searchQuery,
    sort: 'shuffle',
    seed: nextShuffleSeed,
  })
  const paginationPages = getPaginationPages(activePage, totalPages)
  const pageHref = (page: number) =>
    buildPromptHref({
      category: activeCategory,
      model: activeModel,
      query: searchQuery,
      sort: sortMode,
      seed: currentShuffleSeed,
      page,
      take: pageSize === DEFAULT_PROMPT_PAGE_SIZE ? undefined : pageSize,
    })

  useEffect(() => {
    if (!didMountSearch.current) { didMountSearch.current = true; return }
    const nextQuery = searchDraft.trim()
    if (nextQuery === searchQuery) return
    const timer = window.setTimeout(() => {
      const href = buildPromptHref({
        category: activeCategory,
        model: activeModel,
        query: nextQuery,
        sort: sortMode,
        seed: currentShuffleSeed,
      })
      router.replace(href, { scroll: false })
    }, 350)
    return () => window.clearTimeout(timer)
  }, [activeCategory, activeModel, currentShuffleSeed, router, searchDraft, searchQuery, sortMode])

  // Filter options
  const typeOptions = [
    { label: 'All types', value: 'all', href: buildPromptHref({ category: 'all', model: activeModel, query: searchQuery, sort: sortMode, seed: currentShuffleSeed }) },
    { label: 'AI images', value: 'image-generation', href: buildPromptHref({ category: 'image-generation', model: activeModel, query: searchQuery, sort: sortMode, seed: currentShuffleSeed }) },
    { label: 'Image editing', value: 'image-editing', href: buildPromptHref({ category: 'image-editing', model: activeModel, query: searchQuery, sort: sortMode, seed: currentShuffleSeed }) },
  ]
  const modelOptions = [
    { label: 'All models', value: 'all', href: buildPromptHref({ category: activeCategory, model: 'all', query: searchQuery, sort: sortMode, seed: currentShuffleSeed }) },
    ...models.map(model => ({
      label: model,
      value: model,
      href: buildPromptHref({ category: activeCategory, model, query: searchQuery, sort: sortMode, seed: currentShuffleSeed }),
    })),
  ]
  const categoryOptions = [
    { label: 'All categories', value: 'all', href: buildPromptHref({ category: 'all', model: activeModel, query: searchQuery, sort: sortMode, seed: currentShuffleSeed }) },
    ...categories.map(category => ({
      label: category.title.replace(' Prompts', ''),
      value: category.id,
      href: buildPromptHref({ category: category.id, model: activeModel, query: searchQuery, sort: sortMode, seed: currentShuffleSeed }),
    })),
  ]
  const sortOptions = (['featured', 'hot', 'new', 'top', 'shuffle'] as const).map(mode => ({
    label: mode === 'shuffle' ? 'Shuffle' : getSortLabel(mode),
    value: mode,
    href: buildPromptHref({
      category: activeCategory,
      model: activeModel,
      query: searchQuery,
      sort: mode,
      seed: mode === 'shuffle' ? nextShuffleSeed : undefined,
    }),
  }))

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero / search section */}
      <section className="relative overflow-hidden border-b border-border">
        {/* 3D animated background */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <PromptsHero3D />
        </div>
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-8 pt-8 sm:px-6 sm:pb-12 sm:pt-12 lg:pt-16">
          <div className="text-center">
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              {totalPrompts.toLocaleString()} free prompts
            </div>
            <h1 className="text-4xl font-normal tracking-tight text-foreground sm:text-5xl lg:text-6xl" style={{ fontFamily: 'var(--ds-font-serif)', letterSpacing: '-0.015em' }}>
              mtverse prompts
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base sm:leading-7">
              Discover prompts for AI image generation, art, ChatGPT, Midjourney, Flux, portraits, products, posters, and edits.
            </p>
          </div>

          {/* Search Bar */}
          <form
            action="/prompts"
            method="get"
            onSubmit={event => {
              event.preventDefault()
              const data = new FormData(event.currentTarget)
              const query = String(data.get('q') || '').trim()
              trackPromptEvent('Prompt Search Submitted', { query: query.slice(0, 80) })
              router.push(buildPromptHref({ category: activeCategory, model: activeModel, query, sort: sortMode, seed: currentShuffleSeed }), { scroll: false })
            }}
            className="mx-auto mt-6 flex max-w-2xl items-center gap-2 rounded-lg border border-border bg-background p-1.5 shadow-lg transition focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 sm:mt-8 sm:rounded-lg sm:p-2"
          >
            <Search className="ml-2 h-5 w-5 shrink-0 text-muted-foreground sm:ml-3" />
            <input
              type="search"
              name="q"
              value={searchDraft}
              onChange={event => setSearchDraft(event.target.value)}
              placeholder="Search AI prompts..."
              className="h-10 min-w-0 flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground sm:h-12 sm:text-base"
            />
            {activeCategory !== 'all' ? <input type="hidden" name="category" value={activeCategory} /> : null}
            {activeModel !== 'all' ? <input type="hidden" name="model" value={activeModel} /> : null}
            {sortMode !== 'featured' ? <input type="hidden" name="sort" value={sortMode} /> : null}
            {currentShuffleSeed ? <input type="hidden" name="seed" value={currentShuffleSeed} /> : null}
            <button
              type="submit"
              className="inline-flex h-10 shrink-0 items-center rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 active:scale-[0.98] sm:h-12 sm:rounded-xl sm:px-6"
            >
              Search
            </button>
          </form>

          {/* Quick Filter Chips */}
          <div className="mx-auto mt-4 flex max-w-3xl flex-wrap justify-center gap-2 sm:mt-5">
            {QUICK_FILTER_CHIPS.map(chip => {
              const isActive = activeCategory === chip.category && activeModel === chip.model
              const href = buildPromptHref({
                category: chip.category,
                model: chip.model,
                sort: 'featured',
              })
              return (
                <Link
                  key={chip.label}
                  href={href}
                  prefetch={false}
                  onClick={() => {
                    handleNavigationStart()
                    trackPromptEvent('Prompt Quick Link Clicked', { label: chip.label })
                  }}
                  className={cn(
                    'shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2 sm:text-sm',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'border border-border bg-background text-muted-foreground hover:border-foreground/20 hover:bg-accent hover:text-foreground'
                  )}
                >
                  {chip.label}
                </Link>
              )
            })}
          </div>

          {/* Trending Searches */}
          <div className="mx-auto mt-4 flex max-w-3xl items-center justify-center gap-2 sm:mt-5">
            <TrendingUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="shrink-0 text-xs font-medium text-muted-foreground">Trending:</span>
            <div className="flex flex-wrap justify-center gap-x-1.5 gap-y-1">
              {TRENDING_SEARCHES.map(term => (
                <Link
                  key={term}
                  href={buildPromptHref({ query: term.toLowerCase(), sort: 'hot' })}
                  prefetch={false}
                  onClick={() => trackPromptEvent('Prompt Trending Search Clicked', { term })}
                  className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
                >
                  {term}{TRENDING_SEARCHES.indexOf(term) < TRENDING_SEARCHES.length - 1 ? ',' : ''}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky filter bar */}
      <div className="sticky top-[var(--mtverse-header-height)] z-30 border-b border-border bg-background/95 backdrop-blur-lg lg:top-[var(--mtverse-desktop-header-height)]">
        <div className="mx-auto grid w-full max-w-[1920px] grid-cols-[1fr_auto] items-center gap-2 px-4 py-2.5 sm:px-6 lg:grid-cols-[1fr_auto_1fr]">
          <div className="hidden items-center justify-center gap-2 lg:col-start-2 lg:flex">
            <FilterSelect label="Type" icon={<ImageIcon className="h-3.5 w-3.5" />} value={activeCategory === 'image-editing' ? 'image-editing' : activeCategory === 'image-generation' ? 'image-generation' : 'all'} options={typeOptions} analyticsKey="type" onNavigate={handleNavigationStart} />
            <FilterSelect label="Model" icon={<Bot className="h-3.5 w-3.5" />} value={activeModel} options={modelOptions} analyticsKey="model" onNavigate={handleNavigationStart} />
            <FilterSelect label="Category" icon={<Sparkles className="h-3.5 w-3.5" />} value={activeCategory} options={categoryOptions} analyticsKey="category" onNavigate={handleNavigationStart} />
            <FilterSelect label="Sort" icon={<ArrowUpDown className="h-3.5 w-3.5" />} value={sortMode} options={sortOptions} analyticsKey="sort" onNavigate={handleNavigationStart} />
          </div>

          {/* Mobile: filter drawer + result count */}
          <div className="flex items-center gap-2 lg:hidden">
            <MobileFilterDrawer
              categories={categories}
              models={models}
              activeCategory={activeCategory}
              activeModel={activeModel}
              sortMode={sortMode}
              searchQuery={searchQuery}
              currentShuffleSeed={currentShuffleSeed}
              nextShuffleSeed={nextShuffleSeed}
              onNavigate={handleNavigationStart}
            />
            <span className="text-xs font-medium text-muted-foreground">
              {totalResults.toLocaleString()} prompts
            </span>
          </div>

          <div className="hidden items-center justify-end gap-2 lg:col-start-3 lg:flex">
            {searchQuery && (
              <Link
                href={buildPromptHref({ category: activeCategory, model: activeModel, sort: sortMode })}
                onClick={handleNavigationStart}
                className="inline-flex max-w-44 shrink-0 items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground"
              >
                <span className="truncate">&ldquo;{searchQuery}&rdquo;</span> <X className="h-3 w-3 shrink-0" />
              </Link>
            )}
            <span className="text-xs font-medium text-muted-foreground">
              {totalResults.toLocaleString()} results
            </span>
            <Link
              href={shuffleHref}
              prefetch={false}
              onClick={() => {
                handleNavigationStart()
                trackPromptEvent('Prompt Shuffle Clicked', { category: activeCategory, model: activeModel, query: searchQuery || 'none' })
              }}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground transition hover:border-foreground/20 hover:shadow-sm"
            >
              <Shuffle className="h-3.5 w-3.5" />
              Shuffle
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main id="prompt-grid" className="relative mx-auto w-full max-w-[1920px] px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        {visiblePrompts.length > 0 ? (
          <>
            {/* Main Grid */}
            <div className="columns-2 gap-1.5 sm:columns-3 sm:gap-2 md:columns-4 lg:columns-5 xl:columns-6 2xl:columns-7">
              {visiblePrompts.map((prompt, index) => (
                <PromptCard key={prompt.slug} prompt={prompt} index={index} priority={index < 8} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center justify-center gap-3 py-10">
              <nav aria-label="Prompt pages" className="flex items-center gap-1.5">
                <Link
                  href={pageHref(Math.max(1, activePage - 1))}
                  prefetch={true}
                  onClick={handleNavigationStart}
                  aria-disabled={activePage === 1}
                  className={cn(
                    'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    activePage === 1 && 'pointer-events-none opacity-40'
                  )}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                {paginationPages.map((page, index) => {
                  const previous = paginationPages[index - 1]
                  const showGap = previous && page - previous > 1
                  const active = page === activePage
                  return (
                    <span key={page} className="flex items-center gap-1.5">
                      {showGap ? <span className="px-1 text-xs font-bold text-muted-foreground">...</span> : null}
                      <Link
                        href={pageHref(page)}
                        prefetch={true}
                        onClick={handleNavigationStart}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-xs font-bold ring-1 transition',
                          active
                            ? 'bg-primary text-primary-foreground ring-primary'
                            : 'border border-border bg-background text-muted-foreground ring-border hover:bg-accent'
                        )}
                      >
                        {page}
                      </Link>
                    </span>
                  )
                })}
                <Link
                  href={pageHref(Math.min(totalPages, activePage + 1))}
                  prefetch={true}
                  onClick={handleNavigationStart}
                  aria-disabled={activePage === totalPages}
                  className={cn(
                    'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    activePage === totalPages && 'pointer-events-none opacity-40'
                  )}
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </nav>
              <p className="text-xs font-medium text-muted-foreground">
                Page {activePage.toLocaleString()} of {totalPages.toLocaleString()} &middot; {totalResults.toLocaleString()} prompts
              </p>
            </div>
          </>
        ) : (
          <div className="mx-auto mt-12 max-w-sm rounded-lg border border-border bg-card p-8 text-center">
            <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
            <h2 className="mt-4 text-base font-bold text-foreground">No prompts found</h2>
            <p className="mt-2 text-sm text-muted-foreground">Try another keyword, model, or category.</p>
            <Link href="/prompts" prefetch={false} onClick={handleNavigationStart} className="mt-5 inline-flex rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              Reset filters
            </Link>
          </div>
        )}
      </main>

      {/* SEO footer section */}
      <section className="border-t border-border bg-[var(--surface-sunken)]">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="max-w-3xl">
            <h2 className="text-xl font-black tracking-[-0.035em] text-foreground sm:text-2xl">
              Free AI prompts for image generation, art, and trending edits
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Use mtverse to find free AI image prompts, ChatGPT image prompts, Nano Banana prompts, art prompts, product photography prompts, poster prompts, fashion editorials, food visuals, anime ideas, and copy-ready creative workflows.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ['Trending prompts', 'Discover ranked visual prompts based on source engagement and creator demand.'],
              ['Image generation', 'Explore prompts for portraits, products, posters, architecture, food, and social visuals.'],
              ['Free prompt library', 'Browse, filter, and copy prompt ideas without sign-in or account friction.'],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-lg border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-bold text-foreground">Related mtverse resources</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Browse <Link href="/templates" className="font-medium text-primary hover:underline">premium dashboard templates</Link> when you need a production UI, read the <Link href="/faq" className="font-medium text-primary hover:underline">FAQ</Link> for usage questions, or contact <Link href="/support" className="font-medium text-primary hover:underline">support</Link> for account and download help.
            </p>
          </div>

          <div className="mt-7 divide-y divide-border rounded-lg border border-border bg-card px-4">
            {[
              { q: 'What are free AI prompts?', a: 'Free AI prompts are ready-to-copy instructions for ChatGPT, image generators, Nano Banana, editing tools, and creative workflows.' },
              { q: 'How do I get better AI image results?', a: 'Add subject, style, lighting, lens, material, camera angle, aspect ratio, and negative constraints. Then generate variations and keep the strongest output.' },
              { q: 'Which prompts are trending?', a: 'Nano Banana prompts, ChatGPT image prompts, product photos, portraits, anime sheets, fashion editorials, food posters, and Instagram-style visuals are currently strong search targets.' },
            ].map(item => (
              <details key={item.q} className="group py-3">
                <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">
                  {item.q}
                </summary>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
