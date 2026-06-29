'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { Search, Eye, Star, Edit, Trash2, Filter, X } from 'lucide-react'
import type { PromptEntry } from '@/lib/prompt-library-data'
import { cn } from '@/lib/utils'

type Props = {
  prompts: PromptEntry[]
}

export function AdminPromptsClient({ prompts }: Props) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [featuredOnly, setFeaturedOnly] = useState(false)

  const filtered = useMemo(() => {
    let result = prompts
    if (category !== 'all') {
      result = result.filter((p) => p.category === category)
    }
    if (featuredOnly) {
      result = result.filter((p) => p.featured)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    return result
  }, [prompts, search, category, featuredOnly])

  const categories = useMemo(() => {
    const set = new Set(prompts.map((p) => p.category))
    return ['all', ...Array.from(set)]
  }, [prompts])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompts by title, slug, or tag…"
            className="ds-input pl-10 pr-10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="ds-input sm:w-48 cursor-pointer"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === 'all' ? 'All categories' : c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
        <button
          onClick={() => setFeaturedOnly(!featuredOnly)}
          className={cn(
            'inline-flex h-11 items-center gap-2 px-4 rounded-full border text-sm font-medium transition-all',
            featuredOnly
              ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
              : 'bg-background border-border text-muted-foreground hover:text-foreground'
          )}
        >
          <Star className={cn('h-4 w-4', featuredOnly && 'fill-current')} />
          Featured only
        </button>
      </div>

      {/* Table */}
      <div className="ds-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Prompt</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Models</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Updated</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No prompts found. Try a different search.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                          {p.previewImage && (
                            <Image
                              src={p.previewImage}
                              alt={p.title}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                              unoptimized
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-foreground truncate max-w-[200px]">{p.title}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">/{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="ds-badge ds-badge-neutral capitalize">{p.category}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {p.models.slice(0, 2).map((m) => (
                          <span key={m} className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-mono">
                            {m}
                          </span>
                        ))}
                        {p.models.length > 2 && (
                          <span className="text-[10px] text-muted-foreground">+{p.models.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {p.featured ? (
                        <span className="ds-badge ds-badge-warning">
                          <Star className="h-3 w-3 fill-current" />
                          Featured
                        </span>
                      ) : (
                        <span className="ds-badge ds-badge-neutral">Published</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground text-xs">
                      {new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/prompts/${p.slug}`}
                          target="_blank"
                          className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                          aria-label="View"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </a>
                        <button
                          className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                          aria-label="Edit"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600 dark:hover:bg-red-950/30"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Showing {filtered.length} of {prompts.length} prompts (first 100 loaded for performance)
      </p>
    </div>
  )
}
