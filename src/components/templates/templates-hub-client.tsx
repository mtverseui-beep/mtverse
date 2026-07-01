'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useMemo, useEffect, useCallback, useRef, useTransition } from 'react'
import { Search, X, LayoutGrid, Sparkles, Loader2 } from 'lucide-react'
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
  totalTemplates: number
  categoryOptions: TemplateCategory[]
}

function frameworkLabel(tech: string) {
  return tech.trim().replace(/\s+\d+(\.\d+)?$/u, '')
}

function getTemplateFramework(template: Template) {
  return template.frameworkLabel || frameworkLabel(template.techStack[0] || '') || 'Template'
}

export function TemplatesHubClient({
  templates: allTemplates,
  initialCategory = 'all',
  initialSearch = '',
  initialSort = 'featured',
  totalTemplates,
  categoryOptions,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchInput, setSearchInput] = useState(initialSearch)
  const [activeSearch, setActiveSearch] = useState(initialSearch)
  const [frameworkFilter, setFrameworkFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const filtered = useMemo(() => {
    let result = allTemplates
    if (initialCategory && initialCategory !== 'all') {
      result = result.filter((t) => t.category === initialCategory)
    }
    if (frameworkFilter !== 'all') {
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
    return sortTemplates(result, initialSort)
  }, [allTemplates, initialCategory, activeSearch, initialSort, frameworkFilter])

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
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

  const hasActiveFilters = Boolean(activeSearch || frameworkFilter !== 'all' || (initialCategory && initialCategory !== 'all'))

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
                    onClick={() => updateParams({ category: chip.id })}
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
          </div>
        </div>
      </section>

      {/* ═══ Sticky Toolbar — filters + sort ═══ */}
      <div className="sticky top-[var(--mtverse-header-height,4rem)] z-30 border-b border-border/40 bg-background/80 backdrop-blur-xl lg:top-[var(--mtverse-desktop-header-height,4rem)]">
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
            <ModernSelect
              value={frameworkFilter}
              onChange={handleFrameworkChange}
              ariaLabel="Filter by framework"
              options={frameworkOptions}
            />
            <div className="hidden h-4 w-px bg-border sm:block" />
            <ModernSelect
              value={initialSort}
              onChange={(v) => updateParams({ sort: v })}
              ariaLabel="Sort templates"
              options={[
                { value: 'featured', label: 'Featured' },
                { value: 'trending', label: 'Trending' },
                { value: 'new', label: 'Newest' },
                { value: 'rating', label: 'Top rated' },
                { value: 'price-low', label: 'Price: low → high' },
                { value: 'price-high', label: 'Price: high → low' },
              ]}
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
                  onClick={() => updateParams({ category: 'all' })}
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
            <button
              onClick={() => {
                setSearchInput('')
                setFrameworkFilter('all')
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
                    router.push('/templates', { scroll: false })
                  }}
                  className="mt-4 text-sm font-medium text-primary hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
                {filtered.map((t, i) => (
                  <TemplateCard key={t.id} template={t} priority={i < 6} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results footer */}
        {filtered.length > 0 && !isLoading && (
          <div className="mt-10 flex items-center justify-center">
            <p className="text-xs text-muted-foreground">
              Showing {filtered.length} of {totalTemplates} templates
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
