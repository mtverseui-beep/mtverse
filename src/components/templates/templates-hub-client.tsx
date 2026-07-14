'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { Search, X, LayoutGrid, Sparkles, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { TemplateCard } from './template-card'
import {
  sortTemplates,
  type Template,
  type TemplateCategory,
  type TemplateSortMode,
} from '@/lib/templates-catalog'
import { ModernSelect } from '@/components/design-system/modern-select'
import { TemplatesHero3D } from '@/components/design-system/hero-3d'
import { cn } from '@/lib/utils'

type Props = {
  templates: Template[]
  initialCategory?: string
  initialSearch?: string
  initialSort?: TemplateSortMode
  initialSubcategory?: string
  initialPage?: number
  totalTemplates: number
  categoryOptions: TemplateCategory[]
}

function frameworkLabel(tech: string) {
  return tech.trim().replace(/\s+\d+(\.\d+)?$/u, '')
}

function getTemplateFramework(template: Template) {
  return template.frameworkLabel || frameworkLabel(template.techStack[0] || '') || 'Template'
}

function normalizeSubcategory(value: string | undefined) {
  const normalized = (value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'others'
}

const PAGE_SIZE = 40

type PaginationItem = number | 'start-ellipsis' | 'end-ellipsis'

function clampPage(page: number, totalPages: number) {
  if (!Number.isFinite(page)) return 1
  return Math.min(Math.max(Math.floor(page), 1), Math.max(totalPages, 1))
}

function getPaginationPages(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages: PaginationItem[] = [1]
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  if (start > 2) pages.push('start-ellipsis')
  for (let page = start; page <= end; page += 1) pages.push(page)
  if (end < totalPages - 1) pages.push('end-ellipsis')
  pages.push(totalPages)

  return pages
}

export function TemplatesHubClient({
  templates: allTemplates,
  initialCategory = 'all',
  initialSearch = '',
  initialSort = 'featured',
  initialSubcategory = 'all',
  initialPage = 1,
  totalTemplates,
  categoryOptions,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchInput, setSearchInput] = useState(initialSearch)
  const [activeSearch, setActiveSearch] = useState(initialSearch)
  const [frameworkFilter, setFrameworkFilter] = useState('all')
  const [freeOnly, setFreeOnly] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isHtmlCategory = initialCategory === 'html'
  const normalizedSubcategory = normalizeSubcategory(initialSubcategory)
  const htmlSortModes: TemplateSortMode[] = ['downloads', 'new', 'featured']
  const activeSort: TemplateSortMode = isHtmlCategory && !htmlSortModes.includes(initialSort) ? 'downloads' : initialSort

  // Only main frameworks — exact match (case-insensitive, ignoring version numbers)
  const KNOWN_FRAMEWORKS = ['next.js', 'react']

  const frameworkOptions = useMemo(() => {
    const labels = new Map<string, string>()

    for (const template of allTemplates) {
      for (const tech of template.techStack) {
        const cleaned = frameworkLabel(tech).toLowerCase()
        // Exact match only — "react" not "react hook form"
        if (KNOWN_FRAMEWORKS.includes(cleaned)) {
          labels.set(cleaned, frameworkLabel(tech))
        }
      }
    }

    const options = Array.from(labels.values())
      .sort((a, b) => a.localeCompare(b))
      .map((label) => ({ label, value: label }))

    return [{ label: 'All frameworks', value: 'all' }, ...options]
  }, [allTemplates])

  // Trigger loading state for 2s whenever filters change
  const triggerLoading = useCallback(() => {
    setIsLoading(true)
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current)
    loadingTimerRef.current = setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }, [])

  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim()
      if (trimmed !== activeSearch) {
        setActiveSearch(trimmed)
        triggerLoading()
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput, activeSearch, triggerLoading])

  useEffect(() => {
    if (!frameworkOptions.some((option) => option.value === frameworkFilter)) {
      setFrameworkFilter('all')
    }
  }, [frameworkFilter, frameworkOptions])

  useEffect(() => {
    if (!isHtmlCategory) return
    if (frameworkFilter !== 'all') setFrameworkFilter('all')
    if (freeOnly) setFreeOnly(false)
  }, [freeOnly, frameworkFilter, isHtmlCategory])

  const htmlSubcategoryOptions = useMemo(() => {
    const options = new Map<string, string>([['all', 'All']])
    let hasUncategorized = false

    for (const template of allTemplates) {
      if (template.category !== 'html') continue
      const label = template.subcategory?.trim()
      if (label) options.set(normalizeSubcategory(label), label)
      else hasUncategorized = true
    }

    if (hasUncategorized) options.set('others', 'Others')
    return Array.from(options, ([value, label]) => ({ value, label }))
  }, [allTemplates])

  const filtered = useMemo(() => {
    let result = allTemplates
    if (initialCategory && initialCategory !== 'all') {
      result = result.filter((t) => t.category === initialCategory)
    }
    if (isHtmlCategory && normalizedSubcategory !== 'all') {
      result = result.filter((t) => {
        const label = t.subcategory?.trim()
        if (normalizedSubcategory === 'others') return !label
        return normalizeSubcategory(label) === normalizedSubcategory
      })
    }
    if (freeOnly && !isHtmlCategory) {
      result = result.filter((t) => t.isFree)
    }
    if (frameworkFilter !== 'all' && !isHtmlCategory) {
      result = result.filter((t) => {
        // Match against frameworkLabel OR any tech stack item
        if (getTemplateFramework(t) === frameworkFilter) return true
        return t.techStack.some((tech) => frameworkLabel(tech) === frameworkFilter)
      })
    }
    if (activeSearch) {
      const q = activeSearch.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          t.techStack.some((tech) => tech.toLowerCase().includes(q))
      )
    }
    const sorted = sortTemplates(result, activeSort)
    if (!initialCategory || initialCategory === 'all') {
      return [
        ...sorted.filter((template) => !template.isFree),
        ...sorted.filter((template) => template.isFree),
      ]
    }
    return sorted
  }, [allTemplates, initialCategory, isHtmlCategory, normalizedSubcategory, activeSearch, activeSort, frameworkFilter, freeOnly])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = clampPage(initialPage, totalPages)
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const visibleTemplates = filtered.slice(pageStart, pageStart + PAGE_SIZE)
  const paginationPages = getPaginationPages(currentPage, totalPages)

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      if (!Object.prototype.hasOwnProperty.call(updates, 'page')) {
        params.delete('page')
      }
      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === 'all' || value === '') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }
      const qs = params.toString()
      triggerLoading()
      router.push(qs ? `/templates?${qs}` : '/templates', { scroll: false })
    },
    [router, searchParams, triggerLoading]
  )

  const handleFrameworkChange = useCallback((value: string) => {
    setFrameworkFilter(value)
    triggerLoading()
  }, [triggerLoading])

  function goToPage(page: number) {
    const nextPage = clampPage(page, totalPages)
    if (nextPage === currentPage) return
    updateParams({ page: nextPage === 1 ? undefined : String(nextPage) })
  }

  const sortOptions = isHtmlCategory
    ? [
        { value: 'downloads', label: 'Most downloads' },
        { value: 'new', label: 'Newest' },
        { value: 'featured', label: 'Featured' },
      ]
    : [
        { value: 'featured', label: 'Featured' },
        { value: 'trending', label: 'Trending' },
        { value: 'new', label: 'Newest' },
        { value: 'rating', label: 'Top rated' },
        { value: 'price-low', label: 'Price: low to high' },
        { value: 'price-high', label: 'Price: high to low' },
      ]

  const hasActiveFilters = Boolean(activeSearch || frameworkFilter !== 'all' || freeOnly || (initialCategory && initialCategory !== 'all') || (isHtmlCategory && normalizedSubcategory !== 'all'))

  return (
    <div className="min-h-screen">
      {/* ═══ Hero Section — compact so list starts higher ═══ */}
      <section className="relative overflow-hidden border-b border-border/40">
        {/* Animated 3D background */}
        <div aria-hidden className="absolute inset-0">
          <TemplatesHero3D />
        </div>

        {/* Gradient mesh overlay for depth */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/90"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,var(--ds-primary-100)_0%,transparent_60%)] opacity-60 dark:opacity-30"
        />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-12 lg:pb-12 lg:pt-14">
          <div className="text-center">
            {/* Badge */}
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{totalTemplates} templates</span>
            </div>

            {/* Heading — original title */}
            <h1
              className="text-4xl font-normal tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              style={{ fontFamily: 'var(--ds-font-serif)', letterSpacing: '-0.015em' }}
            >
              mtverse templates
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base sm:leading-7">
              Premium dashboard templates from real suite projects. Preview the product, purchase once, and download securely.
            </p>

            {/* ═══ Search Bar — prominent, centered ═══ */}
            <div className="mx-auto mt-8 max-w-2xl">
              <div className="relative group">
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20 opacity-0 blur-sm transition-opacity duration-300 group-focus-within:opacity-100" />
                <div className="relative flex items-center">
                  <Search className="absolute left-4 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <input
                    type="search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search templates by name, tag, or framework..."
                    className="w-full rounded-2xl border border-border/80 bg-background/90 py-3.5 pl-12 pr-12 text-sm font-medium shadow-lg shadow-black/[0.03] outline-none backdrop-blur-md transition-all placeholder:text-muted-foreground/70 focus:border-primary/50 focus:bg-background focus:shadow-xl focus:shadow-primary/[0.05] focus:ring-4 focus:ring-primary/10 dark:bg-zinc-900/90 sm:py-4 sm:text-base"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => setSearchInput('')}
                      className="absolute right-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ═══ Category Chips — compact, scrollable on mobile ═══ */}
            <div className="mt-6 flex items-center justify-center">
              <div className="flex max-w-full items-center gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-none sm:flex-wrap sm:justify-center sm:gap-2 sm:overflow-visible">
                {categoryOptions.map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => {
                      setFrameworkFilter('all')
                      setFreeOnly(false)
                      updateParams(chip.id === 'html'
                        ? { category: chip.id, subcategory: undefined, sort: 'downloads' }
                        : { category: chip.id, subcategory: undefined, sort: undefined })
                    }}
                    className={cn(
                      'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 sm:px-3.5',
                      initialCategory === chip.id
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                        : 'border border-border/60 bg-background/70 text-muted-foreground backdrop-blur-sm hover:border-primary/30 hover:bg-primary/5 hover:text-foreground'
                    )}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {isHtmlCategory && htmlSubcategoryOptions.length > 1 && (
              <div className="mt-3 flex items-center justify-center">
                <div className="flex max-w-full items-center gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-none sm:flex-wrap sm:justify-center sm:gap-2 sm:overflow-visible">
                  {htmlSubcategoryOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateParams({ subcategory: option.value === 'all' ? undefined : option.value, sort: activeSort })}
                      className={cn(
                        'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 sm:px-3.5',
                        normalizedSubcategory === option.value
                          ? 'border border-primary/30 bg-primary/10 text-primary shadow-sm'
                          : 'border border-border/60 bg-background/70 text-muted-foreground backdrop-blur-sm hover:border-primary/30 hover:bg-primary/5 hover:text-foreground'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══ Sticky Toolbar — filters + sort ═══ */}
      <div className="border-b border-border/40 bg-background">
        <div className="mx-auto flex max-w-[1920px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{filtered.length}</span>{' '}
            template{filtered.length !== 1 ? 's' : ''}
            {activeSearch && (
              <span className="ml-1 text-xs">
                for &ldquo;<span className="font-medium text-foreground">{activeSearch}</span>&rdquo;
              </span>
            )}
          </p>

          <div className="flex items-center gap-2">
            {!isHtmlCategory && (
              <button
                onClick={() => { setFreeOnly(!freeOnly); triggerLoading() }}
                className={cn(
                  'hidden h-11 items-center gap-1.5 rounded-full border px-3.5 text-xs font-medium transition-all sm:inline-flex',
                  freeOnly
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'border-border bg-background text-muted-foreground hover:border-emerald-300 hover:text-emerald-700'
                )}
              >
                Free
              </button>
            )}
            {!isHtmlCategory && (
              <ModernSelect
                value={frameworkFilter}
                onChange={handleFrameworkChange}
                ariaLabel="Filter by framework"
                options={frameworkOptions}
              />
            )}
            {!isHtmlCategory && <div className="hidden h-4 w-px bg-border sm:block" />}
            <ModernSelect
              value={activeSort}
              onChange={(v) => updateParams({ sort: v })}
              ariaLabel="Sort templates"
              options={sortOptions}
            />
          </div>
        </div>
      </div>

      {/* ═══ Templates Grid ═══ */}
      <div className="mx-auto max-w-[1920px] px-4 py-8 sm:px-6 lg:px-10">
        {/* Active filter badges */}
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Filters:</span>
            {activeSearch && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-2.5 py-1 text-xs font-medium text-foreground shadow-sm">
                Search: &ldquo;{activeSearch}&rdquo;
                <button
                  onClick={() => { setSearchInput(''); updateParams({ search: undefined }) }}
                  className="rounded-full p-0.5 hover:bg-accent"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {initialCategory && initialCategory !== 'all' && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-2.5 py-1 text-xs font-medium text-foreground shadow-sm">
                {categoryOptions.find((c) => c.id === initialCategory)?.label ?? initialCategory}
                <button
                  onClick={() => updateParams({ category: 'all', subcategory: undefined, sort: undefined })}
                  className="rounded-full p-0.5 hover:bg-accent"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {isHtmlCategory && normalizedSubcategory !== 'all' && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-2.5 py-1 text-xs font-medium text-foreground shadow-sm">
                {htmlSubcategoryOptions.find((item) => item.value === normalizedSubcategory)?.label ?? initialSubcategory}
                <button
                  onClick={() => updateParams({ subcategory: undefined, sort: activeSort })}
                  className="rounded-full p-0.5 hover:bg-accent"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {frameworkFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-2.5 py-1 text-xs font-medium text-foreground shadow-sm">
                {frameworkFilter}
                <button
                  onClick={() => { setFrameworkFilter('all'); triggerLoading() }}
                  className="rounded-full p-0.5 hover:bg-accent"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {freeOnly && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                Free only
                <button
                  onClick={() => { setFreeOnly(false); triggerLoading() }}
                  className="rounded-full p-0.5 hover:bg-emerald-100 dark:hover:bg-emerald-800/50"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchInput('')
                setFrameworkFilter('all')
                setFreeOnly(false)
                triggerLoading()
                router.push('/templates', { scroll: false })
              }}
              className="ml-1 text-xs font-medium text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Loading overlay + grid */}
        <div className="relative">
          {/* Loading spinner overlay */}
          {isLoading && (
            <div className="absolute inset-0 z-20 flex items-start justify-center pt-20">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Loading templates...</span>
              </div>
            </div>
          )}

          {/* Grid content — blurred when loading */}
          <div className={cn(
            'transition-all duration-300',
            isLoading && 'pointer-events-none opacity-40 blur-[2px]'
          )}>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-4 rounded-2xl bg-muted/50 p-4">
                  <LayoutGrid className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">No templates found</h2>
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
                <button
                  onClick={() => {
                    setSearchInput('')
                    setFrameworkFilter('all')
                    setFreeOnly(false)
                    router.push('/templates', { scroll: false })
                  }}
                  className="mt-4 text-sm font-medium text-primary hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div id="templates-grid" className="mx-auto grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleTemplates.map((t, i) => (
                  <TemplateCard key={t.id} template={t} priority={i === 0} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results footer */}
        {filtered.length > 0 && !isLoading && (
          <div className="mt-10 flex flex-col items-center justify-center gap-4">
            {filtered.length > PAGE_SIZE && (
              <nav className="flex items-center gap-1.5 rounded-full border border-border/70 bg-background/85 p-1.5 shadow-sm backdrop-blur" aria-label="Templates pagination">
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {paginationPages.map((page) =>
                  typeof page === 'number' ? (
                    <button
                      key={page}
                      type="button"
                      onClick={() => goToPage(page)}
                      aria-current={page === currentPage ? 'page' : undefined}
                      className={cn(
                        'h-9 min-w-9 rounded-full px-3 text-sm font-semibold transition-all',
                        page === currentPage
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={page} className="px-1 text-sm text-muted-foreground/70">...</span>
                  )
                )}

                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            )}

            <p className="text-xs text-muted-foreground">
              Showing {pageStart + 1}-{pageStart + visibleTemplates.length} of {filtered.length} templates
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
