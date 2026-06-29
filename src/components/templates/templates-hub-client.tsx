'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { Search, X, LayoutGrid } from 'lucide-react'
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

  const frameworkOptions = useMemo(() => {
    const labels = new Map<string, string>()

    for (const template of allTemplates) {
      const label = getTemplateFramework(template)
      labels.set(label.toLowerCase(), label)
    }

    const options = Array.from(labels.values())
      .sort((a, b) => a.localeCompare(b))
      .map((label) => ({ label, value: label }))

    return [{ label: 'All frameworks', value: 'all' }, ...options]
  }, [allTemplates])

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveSearch(searchInput.trim())
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

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
      result = result.filter((t) => getTemplateFramework(t) === frameworkFilter)
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
      router.push(qs ? `/templates?${qs}` : '/templates', { scroll: false })
    },
    [router, searchParams]
  )

  const hasActiveFilters = Boolean(activeSearch || frameworkFilter !== 'all' || (initialCategory && initialCategory !== 'all'))

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border/50">
        <div aria-hidden className="absolute inset-0">
          <TemplatesHero3D />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-8 pt-8 sm:px-6 sm:pb-12 sm:pt-12 lg:pt-16">
          <div className="text-center">
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
              <LayoutGrid className="h-3.5 w-3.5" />
              {totalTemplates} templates
            </div>

            <h1
              className="text-4xl font-normal tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              style={{ fontFamily: 'var(--ds-font-serif)', letterSpacing: '-0.015em' }}
            >
              mtverse templates
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base sm:leading-7">
              Premium dashboard templates from real suite projects. Preview the product, purchase once, and download securely.
            </p>

            <div className="mx-auto mt-6 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search templates by name or tag..."
                  className="w-full rounded-2xl border border-border bg-background/80 py-3 pl-10 pr-10 text-sm font-medium outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary/10 dark:bg-zinc-900"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {categoryOptions.map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => updateParams({ category: chip.id })}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
                    initialCategory === chip.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-background/80 text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-[var(--mtverse-header-height,4rem)] z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl lg:top-[var(--mtverse-desktop-header-height,4rem)]">
        <div className="mx-auto flex max-w-[1920px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{filtered.length}</span> template{filtered.length !== 1 ? 's' : ''}
            {activeSearch && <span className="ml-1">for &ldquo;{activeSearch}&rdquo;</span>}
          </p>

          <div className="flex items-center gap-2">
            <ModernSelect
              value={frameworkFilter}
              onChange={setFrameworkFilter}
              ariaLabel="Filter by framework"
              options={frameworkOptions}
            />
            <span className="hidden text-xs text-muted-foreground sm:inline">Sort by</span>
            <ModernSelect
              value={initialSort}
              onChange={(v) => updateParams({ sort: v })}
              ariaLabel="Sort templates"
              options={[
                { value: 'featured', label: 'Featured' },
                { value: 'trending', label: 'Trending' },
                { value: 'new', label: 'Newest' },
                { value: 'rating', label: 'Top rated' },
                { value: 'price-low', label: 'Price: low to high' },
                { value: 'price-high', label: 'Price: high to low' },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1920px] px-6 py-8 sm:px-8 lg:px-12">
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Active:</span>
            {activeSearch && (
              <span className="ds-badge ds-badge-secondary gap-1">
                Search: &ldquo;{activeSearch}&rdquo;
                <button onClick={() => { setSearchInput(''); updateParams({ search: undefined }) }}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {initialCategory && initialCategory !== 'all' && (
              <span className="ds-badge ds-badge-secondary gap-1">
                {categoryOptions.find((c) => c.id === initialCategory)?.label ?? initialCategory}
                <button onClick={() => updateParams({ category: 'all' })}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {frameworkFilter !== 'all' && (
              <span className="ds-badge ds-badge-secondary gap-1">
                {frameworkFilter}
                <button onClick={() => setFrameworkFilter('all')}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchInput('')
                setFrameworkFilter('all')
                router.push('/templates', { scroll: false })
              }}
              className="ml-2 text-sm text-primary-600 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <LayoutGrid className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="ds-h3 mb-2">No templates found</p>
            <p className="ds-muted">Try a different search or category.</p>
          </div>
        ) : (
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((t, i) => (
              <TemplateCard key={t.id} template={t} priority={i < 6} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
