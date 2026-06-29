'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Eye, Edit, Trash2, Star, Zap, TrendingUp, X } from 'lucide-react'
import type { Template } from '@/lib/templates-catalog'
import { TEMPLATE_CATEGORIES } from '@/lib/templates-catalog'
import { ModernSelect } from '@/components/design-system/modern-select'
import { cn } from '@/lib/utils'

type Props = {
  templates: Template[]
}

export function AdminTemplatesClient({ templates }: Props) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const filtered = useMemo(() => {
    let result = templates
    if (category !== 'all') {
      result = result.filter((t) => t.category === category)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          t.techStack.some((tech) => tech.toLowerCase().includes(q))
      )
    }
    return result
  }, [templates, search, category])

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
            placeholder="Search templates by name, tag, or tech stack…"
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
        <ModernSelect
          value={category}
          onChange={setCategory}
          ariaLabel="Filter by category"
          options={TEMPLATE_CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
        />
      </div>

      {/* Table */}
      <div className="ds-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Template</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Price</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Sales</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No templates found.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                          <Image
                            src={t.thumbnailUrl}
                            alt={t.title}
                            width={64}
                            height={48}
                            className="object-cover w-full h-full"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-foreground truncate max-w-[240px]">{t.title}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[240px]">
                            {t.techStack.slice(0, 2).join(' · ')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="ds-badge ds-badge-neutral capitalize">{t.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold">${t.price}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                      {t.salesCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {t.featured && (
                          <span className="ds-badge ds-badge-warning">
                            <Star className="h-3 w-3 fill-current" />
                            Featured
                          </span>
                        )}
                        {t.new && (
                          <span className="ds-badge ds-badge-success">
                            <Zap className="h-3 w-3" />
                            New
                          </span>
                        )}
                        {t.trending && (
                          <span className="ds-badge ds-badge-accent">
                            <TrendingUp className="h-3 w-3" />
                            Trending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/templates/${t.slug}`}
                          target="_blank"
                          className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                          aria-label="View"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
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
        Showing {filtered.length} of {templates.length} templates
      </p>
    </div>
  )
}
