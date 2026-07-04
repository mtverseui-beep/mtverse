'use client'

import { useDeferredValue, useEffect, useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Copy, Download, Eye, Plus, RefreshCw, RotateCcw, Save, Search, Sparkles, Trash2, Upload } from 'lucide-react'
import PromptPreviewImage from '@/components/prompts/PromptPreviewImage'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { parsePromptImportPayload, type PromptImportSummary } from '@/lib/prompt-import'
import type { PromptCategory, PromptCategoryId, PromptEntry, PromptModelId } from '@/lib/prompt-library-data'
import { cn, downloadBlob, readFileAsText, slugify } from '@/lib/utils'
import { ModernSelect } from '@/components/design-system/modern-select'

type FeedbackTone = 'success' | 'error' | 'info'
type PromptSeoInsight = {
  label: string
  value: string
}

const ADMIN_PROMPTS_PAGE_SIZE = 18
const R2_PROMPT_PREVIEW_HOST = 'pub-59d1b450736b455084e9eebc2ed27f14.r2.dev'
type PreviewImageStorage = 'cloudflare' | 'external' | 'local' | 'missing' | 'invalid'

function getPreviewImageStorage(value: string): PreviewImageStorage {
  const image = value.trim()
  if (!image) return 'missing'
  if (image.startsWith('/')) return 'local'

  try {
    const url = new URL(image)
    if (url.hostname === R2_PROMPT_PREVIEW_HOST) return 'cloudflare'
    if (url.protocol === 'https:') return 'external'
  } catch {
    return 'invalid'
  }

  return 'invalid'
}

function upsertPrompt(list: PromptEntry[], prompt: PromptEntry, options?: { pinToTop?: boolean }) {
  const existingIndex = list.findIndex(
    item => item.id === prompt.id || item.slug === prompt.slug
  )

  if (existingIndex === -1) return [prompt, ...list]

  const withoutCurrent = list.filter(item => item.id !== prompt.id && item.slug !== prompt.slug)
  if (options?.pinToTop) return [prompt, ...withoutCurrent]

  const next = [...withoutCurrent]
  next.splice(existingIndex, 0, prompt)
  return next
}

function createBlankPrompt(categories: PromptCategory[], models: PromptModelId[]): PromptEntry {
  const category = categories[0]
  const today = new Date().toISOString().slice(0, 10)

  return {
    id: `prompt-draft-${Date.now()}`,
    slug: '',
    title: '',
    seoTitle: '',
    metaDescription: '',
    summary: '',
    description: '',
    category: (category?.id || 'writing') as PromptCategoryId,
    categoryTitle: category?.title || 'Writing Prompts',
    subcategory: '',
    models: models.slice(0, 1) as PromptModelId[],
    tags: [],
    audience: '',
    visualStyle: '',
    previewImage: '',
    previewAlt: '',
    featured: false,
    prompt: '',
    variables: [],
    bestFor: [],
    workflow: [],
    tips: [],
    examples: [],
    relatedSlugs: [],
    updatedAt: today,
  }
}

function isUnsavedPromptId(id: string) {
  return id.startsWith('prompt-draft-') || id.startsWith('prompt-duplicate-')
}

function getPromptSaveValidationError(prompt: PromptEntry) {
  const title = prompt.title.trim()
  const slug = slugify(prompt.slug || title)
  const promptBody = prompt.prompt.replace(/\s+/g, ' ').trim()
  const previewImage = prompt.previewImage.trim()

  if (!title) return 'Add a title before saving this prompt.'
  if (!slug) return 'Add a valid slug before saving this prompt.'
  if (!promptBody) return 'Add the main prompt text before saving.'
  if (promptBody.length < 20) return 'Main prompt is too short. Add the complete reusable prompt before saving.'
  if (!previewImage) return 'Upload a Cloudflare R2 preview image before saving.'
  if (!previewImage.startsWith('https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/')) {
    return 'Preview image must be uploaded to Cloudflare R2 before saving.'
  }
  if (!prompt.models.length) return 'Choose at least one AI model before saving.'

  return ''
}

function normalizeForSave(prompt: PromptEntry, categories: PromptCategory[]) {
  const category = categories.find(entry => entry.id === prompt.category)
  const title = prompt.title.trim()
  const slug = slugify(prompt.slug || title)
  const id = !prompt.id || isUnsavedPromptId(prompt.id) ? `prompt-${slug}` : prompt.id

  return {
    ...prompt,
    id,
    title,
    slug,
    categoryTitle: category?.title || prompt.categoryTitle,
    seoTitle: prompt.seoTitle.trim() || `${title} Prompt - ${prompt.models.join(', ')}`,
    metaDescription: prompt.metaDescription.trim() || prompt.description.trim() || prompt.summary.trim(),
    summary: prompt.summary.trim() || prompt.description.trim() || 'Premium prompt entry.',
    description: prompt.description.trim() || prompt.summary.trim() || 'Premium prompt entry.',
    previewAlt: prompt.previewAlt.trim() || title,
    updatedAt: new Date().toISOString().slice(0, 10),
  }
}

async function parseResponse(response: Response) {
  const text = await response.text()
  if (!text.trim()) return {}

  try {
    return JSON.parse(text) as {
      success?: boolean
      error?: string
      code?: string
      message?: string
      prompts?: PromptEntry[]
      prompt?: PromptEntry
      summary?: PromptImportSummary
      imageUrl?: string
      previewWidth?: number
      previewHeight?: number
      publicId?: string
      secureUrl?: string
      insights?: PromptSeoInsight[]
      __rawText?: string
    }
  } catch {
    return { __rawText: text }
  }
}

function getFeedbackClass(tone: FeedbackTone) {
  return cn(
    'rounded-2xl border p-4',
    tone === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-100',
    tone === 'error' && 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-100',
    tone === 'info' && 'border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-100'
  )
}

export default function AdminPromptsClient({
  prompts,
  categories,
  models,
}: {
  prompts: PromptEntry[]
  categories: PromptCategory[]
  models: PromptModelId[]
}) {
  const [promptsState, setPromptsState] = useState(prompts)
  const [draftPrompt, setDraftPrompt] = useState<PromptEntry | null>(null)
  const [selectedId, setSelectedId] = useState(prompts[0]?.id || '')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | PromptCategoryId>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [feedback, setFeedback] = useState<{ tone: FeedbackTone; title: string; message: string } | null>(null)
  const [importJson, setImportJson] = useState('')
  const [replaceExisting, setReplaceExisting] = useState(false)
  const [importSummary, setImportSummary] = useState<PromptImportSummary | null>(null)
  const [seoInsights, setSeoInsights] = useState<PromptSeoInsight[]>([])
  const [jsonEditor, setJsonEditor] = useState('')
  const [jsonEditorTouched, setJsonEditorTouched] = useState(false)
  const [pinnedPromptId, setPinnedPromptId] = useState('')
  const [busyAction, setBusyAction] = useState<null | 'save' | 'refresh' | 'import' | 'upload-image' | 'delete' | 'auto-seo'>(null)
  const [isPending, startTransition] = useTransition()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const deferredSearch = useDeferredValue(search)

  const selectedPrompt = useMemo(() => {
    if (draftPrompt?.id === selectedId) return draftPrompt
    return promptsState.find(prompt => prompt.id === selectedId) || null
  }, [draftPrompt, promptsState, selectedId])
  const selectedPromptIsDraft = Boolean(selectedPrompt && draftPrompt?.id === selectedPrompt.id)

  const filteredPrompts = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase()

    const matchingPrompts = promptsState.filter(prompt => {
      const matchesCategory = categoryFilter === 'all' || prompt.category === categoryFilter
      const matchesSearch =
        !normalizedSearch ||
        prompt.title.toLowerCase().includes(normalizedSearch) ||
        prompt.slug.toLowerCase().includes(normalizedSearch) ||
        prompt.subcategory.toLowerCase().includes(normalizedSearch)

      return matchesCategory && matchesSearch
    })

    if (!pinnedPromptId) return matchingPrompts
    return [...matchingPrompts].sort((left, right) => {
      if (left.id === pinnedPromptId) return -1
      if (right.id === pinnedPromptId) return 1
      return 0
    })
  }, [categoryFilter, deferredSearch, pinnedPromptId, promptsState])

  const pageCount = Math.max(1, Math.ceil(filteredPrompts.length / ADMIN_PROMPTS_PAGE_SIZE))
  const safePage = Math.min(currentPage, pageCount)
  const pageStart = (safePage - 1) * ADMIN_PROMPTS_PAGE_SIZE
  const pageEnd = Math.min(pageStart + ADMIN_PROMPTS_PAGE_SIZE, filteredPrompts.length)
  const paginatedPrompts = filteredPrompts.slice(pageStart, pageEnd)
  const imageStorageStats = useMemo(() => {
    return promptsState.reduce(
      (stats, prompt) => {
        stats[getPreviewImageStorage(prompt.previewImage)] += 1
        return stats
      },
      {
        cloudflare: 0,
        external: 0,
        local: 0,
        missing: 0,
        invalid: 0,
      } as Record<PreviewImageStorage, number>
    )
  }, [promptsState])
  const libraryStats = useMemo(
    () => [
      { label: 'Total prompts', value: promptsState.length.toLocaleString() },
      { label: 'Featured', value: promptsState.filter(prompt => prompt.featured).length.toLocaleString() },
      { label: 'With images', value: promptsState.filter(prompt => prompt.previewImage).length.toLocaleString() },
      { label: 'Cloudflare R2', value: imageStorageStats.cloudflare.toLocaleString() },
      { label: 'External URLs', value: imageStorageStats.external.toLocaleString() },
      { label: 'Local/missing', value: (imageStorageStats.local + imageStorageStats.missing + imageStorageStats.invalid).toLocaleString() },
      { label: 'Categories', value: new Set(promptsState.map(prompt => prompt.category)).size.toLocaleString() },
    ],
    [imageStorageStats, promptsState]
  )

  useEffect(() => {
    setJsonEditorTouched(false)
  }, [selectedId])

  useEffect(() => {
    if (selectedPrompt && !jsonEditorTouched) {
      setJsonEditor(JSON.stringify(selectedPrompt, null, 2))
    }
  }, [jsonEditorTouched, selectedPrompt])

  useEffect(() => {
    setCurrentPage(1)
  }, [categoryFilter, deferredSearch])

  useEffect(() => {
    if (!selectedId && filteredPrompts[0]) {
      setSelectedId(filteredPrompts[0].id)
    }
  }, [filteredPrompts, selectedId])

  useEffect(() => {
    if (!selectedId) return

    const selectedIndex = filteredPrompts.findIndex(prompt => prompt.id === selectedId)
    if (selectedIndex === -1) return

    const targetPage = Math.floor(selectedIndex / ADMIN_PROMPTS_PAGE_SIZE) + 1
    if (targetPage !== currentPage) {
      setCurrentPage(targetPage)
    }
  }, [currentPage, filteredPrompts, selectedId])

  function updateSelectedPrompt(patch: Partial<PromptEntry>) {
    if (!selectedPrompt) return
    const nextPrompt = { ...selectedPrompt, ...patch }
    setJsonEditorTouched(false)

    if (draftPrompt?.id === selectedPrompt.id) {
      setDraftPrompt(nextPrompt)
      return
    }

    setPromptsState(previous => previous.map(prompt => (prompt.id === selectedPrompt.id ? nextPrompt : prompt)))
  }

  async function refreshPrompts() {
    setBusyAction('refresh')
    try {
      const response = await fetch('/api/admin/prompts', { cache: 'no-store' })
      const result = await parseResponse(response)
      if (!response.ok) throw new Error(result.error || 'Failed to refresh prompts.')
      if (result.prompts) {
        setPromptsState(result.prompts)
        if (draftPrompt) {
          setDraftPrompt(null)
          setSelectedId(result.prompts[0]?.id || '')
        }
      }
      setFeedback({ tone: 'info', title: 'Prompt library refreshed', message: 'The latest local prompt data is loaded.' })
    } catch (error) {
      setFeedback({ tone: 'error', title: 'Refresh failed', message: error instanceof Error ? error.message : 'Failed to refresh prompts.' })
    } finally {
      setBusyAction(null)
    }
  }

  function createPromptDraft() {
    const nextPrompt = createBlankPrompt(categories, models)
    setDraftPrompt(nextPrompt)
    setSelectedId(nextPrompt.id)
    setPinnedPromptId(nextPrompt.id)
    setSearch('')
    setCategoryFilter('all')
    setCurrentPage(1)
    setSeoInsights([])
    setFeedback({ tone: 'info', title: 'New draft ready', message: 'This draft is not saved yet. Add title, main prompt, and R2 preview image, then click Save.' })
  }

  function duplicateSelectedPrompt() {
    if (!selectedPrompt) return

    const duplicated: PromptEntry = {
      ...selectedPrompt,
      id: `prompt-duplicate-${Date.now()}`,
      slug: `${selectedPrompt.slug}-copy`,
      title: `${selectedPrompt.title} (Copy)`,
      seoTitle: `${selectedPrompt.seoTitle} (Copy)`,
      featured: false,
      updatedAt: new Date().toISOString().slice(0, 10),
    }

    setDraftPrompt(duplicated)
    setSelectedId(duplicated.id)
    setPinnedPromptId(duplicated.id)
    setSearch('')
    setCategoryFilter('all')
    setCurrentPage(1)
    setFeedback({ tone: 'info', title: 'Prompt duplicated as draft', message: 'Edit the copy and save to publish it as a new prompt.' })
  }

  function exportPrompts() {
    downloadBlob(new Blob([JSON.stringify({ prompts: promptsState }, null, 2)], { type: 'application/json' }), 'prompt-library-export.json')
    setFeedback({ tone: 'success', title: 'Prompt export ready', message: 'The current prompt library JSON has been downloaded.' })
  }

  function saveCurrentPrompt() {
    if (!selectedPrompt) return

    startTransition(async () => {
      setBusyAction('save')
      try {
        const parsed = jsonEditorTouched ? (JSON.parse(jsonEditor) as PromptEntry) : selectedPrompt
        const normalized = normalizeForSave(parsed, categories)
        const validationError = getPromptSaveValidationError(normalized)
        if (validationError) throw new Error(validationError)

        const isNewPrompt =
          isUnsavedPromptId(selectedPrompt.id) ||
          !promptsState.some(prompt => prompt.id === normalized.id || prompt.slug === normalized.slug)

        const response = await fetch('/api/admin/prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: normalized }),
        })
        const result = await parseResponse(response)
        if (!response.ok) throw new Error(result.error || 'Failed to save prompt.')
        const savedPrompt = result.prompt || result.prompts?.find(prompt => prompt.slug === normalized.slug) || normalized
        setPromptsState(previous => {
          const source = result.prompts?.length ? result.prompts : previous
          return upsertPrompt(source, savedPrompt, { pinToTop: isNewPrompt })
        })
        if (draftPrompt?.id === selectedPrompt.id) setDraftPrompt(null)
        setSelectedId(savedPrompt.id)
        setPinnedPromptId(savedPrompt.id)
        setCurrentPage(1)
        if (isNewPrompt) {
          setSearch('')
          setCategoryFilter('all')
        }
        setJsonEditorTouched(false)
        setFeedback({ tone: 'success', title: 'Prompt saved', message: result.message || `Saved "${normalized.title}" successfully.` })
      } catch (error) {
        setFeedback({ tone: 'error', title: 'Save failed', message: error instanceof Error ? error.message : 'Failed to save prompt.' })
      } finally {
        setBusyAction(null)
      }
    })
  }

  function requestDeleteSelectedPrompt() {
    if (!selectedPrompt) return
    setDeleteOpen(true)
  }

  function performDeleteSelectedPrompt() {
    if (!selectedPrompt) return

    if (selectedPromptIsDraft) {
      setDraftPrompt(null)
      setSelectedId(promptsState[0]?.id || '')
      setDeleteOpen(false)
      setJsonEditorTouched(false)
      setFeedback({ tone: 'info', title: 'Draft discarded', message: 'The unsaved prompt draft was removed. No live prompt data changed.' })
      return
    }

    startTransition(async () => {
      setBusyAction('delete')
      try {
        const deleteTarget = {
          id: selectedPrompt.id,
          slug: selectedPrompt.slug,
          title: selectedPrompt.title,
        }
        const response = await fetch('/api/admin/prompts', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(deleteTarget),
        })
        const result = await parseResponse(response)
        if (!response.ok) throw new Error(result.error || 'Failed to delete prompt.')

        const nextPrompts = result.prompts?.length
          ? result.prompts
          : promptsState.filter(prompt => prompt.id !== selectedPrompt.id && prompt.slug !== selectedPrompt.slug)

        setPromptsState(nextPrompts)
        setSelectedId(nextPrompts[0]?.id || '')
        setJsonEditorTouched(false)
        setFeedback({
          tone: 'success',
          title: 'Prompt deleted',
          message: result.message || `"${selectedPrompt.title || selectedPrompt.slug}" was removed from the prompt library.`,
        })
      } catch (error) {
        setFeedback({
          tone: 'error',
          title: 'Delete failed',
          message: error instanceof Error ? error.message : 'Failed to delete prompt.',
        })
      } finally {
        setBusyAction(null)
      }
    })
  }

  function previewImport() {
    try {
      const payload = JSON.parse(importJson)
      const parsed = parsePromptImportPayload(payload, promptsState, { replaceExisting })
      setImportSummary(parsed.summary)
      setFeedback({ tone: 'info', title: 'Import preview ready', message: `Prepared ${parsed.prompts.length} prompts from the current payload.` })
    } catch {
      setFeedback({ tone: 'error', title: 'Invalid JSON', message: 'The import payload could not be parsed.' })
    }
  }

  function importJsonData() {
    if (!importJson.trim()) {
      setFeedback({ tone: 'error', title: 'Nothing to import', message: 'Paste JSON or upload a file before importing.' })
      return
    }

    startTransition(async () => {
      setBusyAction('import')
      try {
        const response = await fetch('/api/admin/prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'import-json',
            rawJson: importJson,
            replaceExisting,
          }),
        })
        const result = await parseResponse(response)
        if (!response.ok) throw new Error(result.error || 'Failed to import prompt JSON.')
        if (result.prompts) setPromptsState(result.prompts)
        if (result.summary) setImportSummary(result.summary)
        setFeedback({ tone: 'success', title: 'Prompt import complete', message: result.message || 'Prompt JSON imported successfully.' })
      } catch (error) {
        setFeedback({ tone: 'error', title: 'Import failed', message: error instanceof Error ? error.message : 'Failed to import JSON.' })
      } finally {
        setBusyAction(null)
      }
    })
  }

  async function uploadPreviewImage(file: File) {
    if (!selectedPrompt) return

    if (!file.type.startsWith('image/')) {
      setFeedback({ tone: 'error', title: 'Invalid file', message: 'Choose a JPG, PNG, or WebP image before uploading to preview storage.' })
      return
    }

    const uploadSlug = slugify(selectedPrompt.slug || selectedPrompt.title || `prompt-preview-${Date.now()}`)
    if (!uploadSlug) {
      setFeedback({ tone: 'error', title: 'Missing title', message: 'Add a title or slug before uploading the preview image.' })
      return
    }

    setBusyAction('upload-image')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('slug', uploadSlug)
      formData.append('title', selectedPrompt.title || uploadSlug)

      const response = await fetch('/api/admin/prompts/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await parseResponse(response)
      if (!response.ok) throw new Error(result.error || 'Failed to upload preview image.')
      if (!result.imageUrl) throw new Error('Preview storage did not return an image URL.')

      const nextPrompt = {
        ...selectedPrompt,
        previewImage: result.imageUrl,
        previewAlt: selectedPrompt.previewAlt || selectedPrompt.title || uploadSlug,
        previewWidth: typeof result.previewWidth === 'number' ? result.previewWidth : selectedPrompt.previewWidth,
        previewHeight: typeof result.previewHeight === 'number' ? result.previewHeight : selectedPrompt.previewHeight,
      }
      updateSelectedPrompt(nextPrompt)

      if (!nextPrompt.title.trim() || !nextPrompt.prompt.trim()) {
        setFeedback({
          tone: 'success',
          title: 'Preview image uploaded',
          message: `${result.message || 'Upload complete.'} Add the title and main prompt, then save to publish this preview image.`,
        })
        return
      }

      const normalized = normalizeForSave(nextPrompt, categories)
      const saveResponse = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: normalized }),
      })
      const saveResult = await parseResponse(saveResponse)
      if (!saveResponse.ok) throw new Error(saveResult.error || 'Preview uploaded, but saving the prompt failed.')

      const savedPrompt = saveResult.prompt || saveResult.prompts?.find(prompt => prompt.slug === normalized.slug) || normalized
      setPromptsState(previous => {
        const source = saveResult.prompts?.length ? saveResult.prompts : previous
        return upsertPrompt(source, savedPrompt)
      })
      if (draftPrompt?.id === selectedPrompt.id) setDraftPrompt(null)
      setSelectedId(savedPrompt.id)
      setPinnedPromptId(savedPrompt.id)
      setJsonEditor(JSON.stringify(savedPrompt, null, 2))
      setJsonEditorTouched(false)

      setFeedback({
        tone: 'success',
        title: 'Preview image uploaded and saved',
        message: `${result.message || 'Upload complete.'} The prompt now uses ${savedPrompt.previewImage}.`,
      })
    } catch (error) {
      setFeedback({
        tone: 'error',
        title: 'Image upload failed',
        message: error instanceof Error ? error.message : 'Failed to upload preview image.',
      })
    } finally {
      setBusyAction(null)
    }
  }

  function generateSeoDraft() {
    if (!selectedPrompt) return

    startTransition(async () => {
      setBusyAction('auto-seo')
      try {
        const draft = jsonEditorTouched ? (JSON.parse(jsonEditor) as PromptEntry) : selectedPrompt
        const response = await fetch('/api/admin/prompts/enrich', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: draft }),
        })
        const result = await parseResponse(response)
        if (!response.ok) throw new Error(result.error || 'Failed to generate SEO fields.')
        if (!result.prompt) throw new Error('SEO generator did not return a prompt draft.')

        if (draftPrompt?.id === selectedPrompt.id) {
          setDraftPrompt(result.prompt)
        } else {
          setPromptsState(previous => previous.map(prompt => (prompt.id === selectedPrompt.id ? result.prompt! : prompt)))
        }
        setSelectedId(result.prompt.id)
        setJsonEditor(JSON.stringify(result.prompt, null, 2))
        setJsonEditorTouched(false)
        setSeoInsights(result.insights || [])
        setFeedback({
          tone: 'success',
          title: 'SEO draft generated',
          message: result.message || 'Review the generated fields, then save the prompt to publish.',
        })
      } catch (error) {
        setFeedback({
          tone: 'error',
          title: 'Auto SEO failed',
          message: error instanceof Error ? error.message : 'Failed to generate SEO fields.',
        })
      } finally {
        setBusyAction(null)
      }
    })
  }

  return (
    <div className="w-full min-w-0 space-y-5 overflow-x-hidden" data-admin-shell="true">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
              Manage prompts, previews, and SEO content
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              Create public prompt pages, upload Cloudflare R2 previews, import batches, and publish changes to Explore/New.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end [&>button]:w-full sm:[&>button]:w-auto">
            <button type="button" onClick={createPromptDraft} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"><Plus className="h-4 w-4" />New</button>
            <button type="button" onClick={duplicateSelectedPrompt} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800" disabled={!selectedPrompt}><Copy className="h-4 w-4" />Duplicate</button>
            <button type="button" onClick={generateSeoDraft} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800" disabled={!selectedPrompt || isPending || busyAction === 'auto-seo'}><Sparkles className={cn('h-4 w-4', busyAction === 'auto-seo' && 'animate-pulse')} />{busyAction === 'auto-seo' ? 'Filling...' : 'AI Fill'}</button>
            <button type="button" onClick={saveCurrentPrompt} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200" disabled={!selectedPrompt || isPending || busyAction === 'save'}><Save className="h-4 w-4" />Save</button>
            <button type="button" onClick={requestDeleteSelectedPrompt} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 active:scale-[0.98] disabled:opacity-50 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-200 dark:hover:bg-rose-950/35" disabled={!selectedPrompt || isPending || busyAction === 'delete'}><Trash2 className="h-4 w-4" />{selectedPromptIsDraft ? 'Discard draft' : 'Delete'}</button>
            <button type="button" onClick={refreshPrompts} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800" disabled={busyAction === 'refresh'}><RefreshCw className={cn('h-4 w-4', busyAction === 'refresh' && 'animate-spin')} />Refresh</button>
            <button type="button" onClick={exportPrompts} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"><Download className="h-4 w-4" />Export</button>
          </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid gap-px bg-zinc-100 dark:bg-zinc-800 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {libraryStats.map(stat => (
            <div key={stat.label} className="bg-zinc-50 px-5 py-4 dark:bg-zinc-900/60">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stat.value}</p>
            </div>
          ))}
        </div>
        {imageStorageStats.external || imageStorageStats.local || imageStorageStats.invalid ? (
          <div className="border-t border-zinc-200 bg-amber-50 px-5 py-3 text-xs font-medium text-amber-900 dark:border-zinc-800 dark:bg-amber-950/20 dark:text-amber-100">
            {imageStorageStats.external.toLocaleString()} external, {imageStorageStats.local.toLocaleString()} local, and {imageStorageStats.invalid.toLocaleString()} invalid preview URLs still need R2 upload/migration.
          </div>
        ) : null}
      </section>

      {feedback ? (
        <div className={getFeedbackClass(feedback.tone)}>
          <p className="font-semibold">{feedback.title}</p>
          <p className="mt-1 text-sm leading-6">{feedback.message}</p>
        </div>
      ) : null}

      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h2 className="text-base font-black text-zinc-900 dark:text-zinc-50">Bulk JSON import</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Paste or upload prompt batches, preview duplicates, then publish safely.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800">
              <Upload className="h-4 w-4" />
              Upload JSON
              <input type="file" accept="application/json,.json" className="hidden" onChange={async event => {
                const file = event.target.files?.[0]
                if (!file) return
                setImportJson(await readFileAsText(file))
              }} />
            </label>
            <button type="button" onClick={previewImport} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"><Eye className="h-4 w-4" />Preview</button>
            <button type="button" onClick={() => { setImportJson(''); setImportSummary(null) }} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"><RotateCcw className="h-4 w-4" />Reset</button>
            <button type="button" onClick={importJsonData} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200" disabled={isPending || busyAction === 'import'}><Upload className="h-4 w-4" />Import</button>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <textarea value={importJson} onChange={event => setImportJson(event.target.value)} placeholder='{"prompts":[...]}' className="h-44 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-xs leading-6 outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:bg-zinc-900" />
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400">
            <label className="inline-flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-50"><input type="checkbox" checked={replaceExisting} onChange={event => setReplaceExisting(event.target.checked)} className="h-4 w-4 rounded border-zinc-300" />Replace existing matches</label>
            {importSummary ? (
              <div className="mt-4 space-y-2">
                <p>Received: <span className="font-bold text-zinc-900 dark:text-zinc-50">{importSummary.received}</span></p>
                <p>Prepared: <span className="font-bold text-zinc-900 dark:text-zinc-50">{importSummary.prepared}</span></p>
                <p>Skipped existing: <span className="font-bold text-zinc-900 dark:text-zinc-50">{importSummary.skippedExisting}</span></p>
                <p>Duplicates in file: <span className="font-bold text-zinc-900 dark:text-zinc-50">{importSummary.skippedIncomingDuplicates}</span></p>
                <p>Invalid: <span className="font-bold text-zinc-900 dark:text-zinc-50">{importSummary.invalid}</span></p>
              </div>
            ) : (
              <p className="mt-4 leading-6">Preview first to see how many prompts will be imported and how many existing matches will be skipped.</p>
            )}
          </div>
        </div>
      </section>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)]">
        <aside className="order-2 min-w-0 lg:order-1 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-hidden">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search prompts" className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-9 pr-3 text-sm font-medium outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:bg-zinc-900" />
            </div>
            <ModernSelect
              value={categoryFilter}
              onChange={(v) => setCategoryFilter(v as 'all' | PromptCategoryId)}
              ariaLabel="Filter by category"
              className="w-full"
              options={[
                { value: 'all', label: 'All categories' },
                ...categories.map(c => ({ value: c.id, label: c.title })),
              ]}
            />
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Showing {filteredPrompts.length > 0 ? pageStart + 1 : 0}-{pageEnd} of {filteredPrompts.length} prompts / page {safePage} of {pageCount}</p>
          </div>

          <div className="custom-scrollbar mt-4 space-y-2 xl:max-h-[calc(100dvh-19rem)] xl:overflow-y-auto xl:pr-1">
            {paginatedPrompts.map(prompt => (
              <button
                key={prompt.id}
                type="button"
                onClick={() => setSelectedId(prompt.id)}
                className={cn(
                  'group w-full rounded-2xl border p-3 text-left transition-all',
                  selectedId === prompt.id
                    ? 'border-zinc-300 bg-zinc-100 shadow-sm dark:border-zinc-600 dark:bg-zinc-800'
                    : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:border-zinc-700 dark:hover:bg-zinc-900'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-bold text-zinc-900 dark:text-zinc-50">{prompt.title || 'Untitled prompt'}</p>
                    <p className="mt-1 truncate text-xs font-medium text-zinc-500 dark:text-zinc-400">{prompt.categoryTitle} / {prompt.subcategory || 'General'}</p>
                  </div>
                  {prompt.featured ? <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Live</span> : null}
                </div>
              </button>
            ))}
          </div>

          {pageCount > 1 ? (
            <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => setCurrentPage(previous => Math.max(1, previous - 1))}
                disabled={safePage === 1}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(previous => Math.min(pageCount, previous + 1))}
                disabled={safePage === pageCount}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50 disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </aside>

        <section className="order-1 min-w-0 overflow-hidden lg:order-2 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
          {selectedPrompt ? (
            <div className="space-y-5">
              {selectedPromptIsDraft ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100">
                  <p className="font-bold">Unsaved draft</p>
                  <p className="mt-1 leading-6">This prompt is only in the editor. It will not appear in the library, export, sitemap, or public pages until validation passes and you click Save.</p>
                </div>
              ) : null}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="break-words text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">{selectedPrompt.title || 'Untitled prompt'}</h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{selectedPrompt.slug || 'Slug will be generated from the title.'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={generateSeoDraft}
                    disabled={isPending || busyAction === 'auto-seo'}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    <Sparkles className={cn('h-4 w-4', busyAction === 'auto-seo' && 'animate-pulse')} />
                    {busyAction === 'auto-seo' ? 'Filling...' : 'AI Fill'}
                  </button>
                  {selectedPrompt.slug && !selectedPromptIsDraft ? (
                    <Link href={`/prompts/${selectedPrompt.slug}`} target="_blank" className="inline-flex items-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 gap-2 px-4 py-2 text-sm"><Eye className="h-4 w-4" />Open Live Page</Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={requestDeleteSelectedPrompt}
                    disabled={isPending || busyAction === 'delete'}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-bold text-rose-700 transition hover:bg-rose-100 active:scale-[0.98] disabled:opacity-50 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-200 dark:hover:bg-rose-950/35"
                  >
                    <Trash2 className="h-4 w-4" />
                    {selectedPromptIsDraft ? 'Discard draft' : busyAction === 'delete' ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/70">
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
                        <Sparkles className="h-4 w-4" />
                      </span>
                      <div>
                        <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50">AI Field Autofill</h3>
                        <p className="mt-0.5 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                          Uses Gemini/OpenRouter when configured, with local rules as a free fallback. Review before saving.
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={generateSeoDraft}
                    disabled={isPending || busyAction === 'auto-seo'}
                    className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 active:scale-[0.98] disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-900"
                  >
                    <Sparkles className={cn('h-4 w-4', busyAction === 'auto-seo' && 'animate-pulse')} />
                    {busyAction === 'auto-seo' ? 'Filling fields...' : 'Fill fields'}
                  </button>
                </div>
                <div className="grid gap-px bg-zinc-200 dark:bg-zinc-800 sm:grid-cols-2 lg:grid-cols-4">
                  {(seoInsights.length ? seoInsights : [
                    { label: 'Mode', value: 'AI or local fallback' },
                    { label: 'Input', value: 'Image + prompt ready' },
                    { label: 'Output', value: 'SEO JSON fields' },
                    { label: 'Publish', value: 'Click Save' },
                  ]).map(item => (
                    <div key={`${item.label}-${item.value}`} className="bg-white px-4 py-3 dark:bg-zinc-900">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">{item.label}</p>
                      <p className="mt-1 truncate text-xs font-semibold text-zinc-800 dark:text-zinc-200">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm"><span className="font-bold text-zinc-900 dark:text-zinc-50">Title</span><input value={selectedPrompt.title} onChange={event => updateSelectedPrompt({ title: event.target.value, slug: selectedPrompt.slug ? selectedPrompt.slug : slugify(event.target.value) })} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:bg-zinc-900" /></label>
                  <label className="space-y-2 text-sm"><span className="font-bold text-zinc-900 dark:text-zinc-50">Slug</span><input value={selectedPrompt.slug} onChange={event => updateSelectedPrompt({ slug: slugify(event.target.value) })} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:bg-zinc-900" /></label>
                  <label className="space-y-2 text-sm"><span className="font-bold text-zinc-900 dark:text-zinc-50">Category</span>
                    <ModernSelect
                      value={selectedPrompt.category}
                      onChange={(v) => {
                        const nextCategory = categories.find(category => category.id === v)
                        updateSelectedPrompt({ category: v as PromptCategoryId, categoryTitle: nextCategory?.title || selectedPrompt.categoryTitle })
                      }}
                      ariaLabel="Prompt category"
                      className="w-full"
                      options={categories.map(category => ({ value: category.id, label: category.title }))}
                    />
                  </label>
                  <label className="space-y-2 text-sm"><span className="font-bold text-zinc-900 dark:text-zinc-50">Subcategory</span><input value={selectedPrompt.subcategory} onChange={event => updateSelectedPrompt({ subcategory: event.target.value })} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:bg-zinc-900" /></label>
                  <div className="space-y-2 text-sm md:col-span-2">
                    <span className="font-bold text-zinc-900 dark:text-zinc-50">Models</span>
                    <div className="flex flex-wrap gap-2">
                      {models.map(model => {
                        const active = selectedPrompt.models.includes(model)
                        return (
                          <button
                            key={model}
                            type="button"
                            onClick={() => {
                              const nextModels = active
                                ? selectedPrompt.models.filter(item => item !== model)
                                : [...selectedPrompt.models, model]
                              updateSelectedPrompt({ models: nextModels.length > 0 ? nextModels : [model] })
                            }}
                            className={cn(
                              'rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition',
                              active
                                ? 'bg-zinc-900 text-white ring-zinc-900 dark:bg-white dark:text-zinc-900 dark:ring-white'
                                : 'bg-zinc-50 text-zinc-600 ring-zinc-200 hover:bg-white dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800'
                            )}
                          >
                            {model}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <label className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 px-3 py-2.5 text-sm md:col-span-2">
                    <span>
                      <span className="block font-semibold text-zinc-900 dark:text-zinc-50">Show in Explore</span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">Featured prompts appear in the main public prompt feed.</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={Boolean(selectedPrompt.featured)}
                      onChange={event => updateSelectedPrompt({ featured: event.target.checked })}
                      className="h-4 w-4 rounded border-zinc-200 dark:border-zinc-800 text-zinc-600 focus:ring-zinc-500/20"
                    />
                  </label>
                  <label className="space-y-2 text-sm md:col-span-2"><span className="font-bold text-zinc-900 dark:text-zinc-50">Preview image URL</span><input value={selectedPrompt.previewImage} onChange={event => updateSelectedPrompt({ previewImage: event.target.value, previewWidth: undefined, previewHeight: undefined })} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:bg-zinc-900" /></label>
                  <div className="space-y-2 text-sm md:col-span-2">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">Cloudflare R2 upload</span>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        <Upload className="h-4 w-4" />
                        {busyAction === 'upload-image' ? 'Uploading...' : 'Upload preview image'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async event => {
                            const file = event.target.files?.[0]
                            if (!file) return
                            await uploadPreviewImage(file)
                            event.currentTarget.value = ''
                          }}
                        />
                      </label>
                      <span className="text-xs leading-6 text-zinc-500 dark:text-zinc-400">
                        Uploads to Cloudflare R2 and saves the preview URL when title and main prompt are ready.
                      </span>
                    </div>
                  </div>
                  <label className="space-y-2 text-sm md:col-span-2"><span className="font-bold text-zinc-900 dark:text-zinc-50">SEO description</span><textarea value={selectedPrompt.metaDescription} onChange={event => updateSelectedPrompt({ metaDescription: event.target.value })} className="h-20 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 leading-6 outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:bg-zinc-900" /></label>
                  <label className="space-y-2 text-sm md:col-span-2"><span className="font-bold text-zinc-900 dark:text-zinc-50">Summary</span><textarea value={selectedPrompt.summary} onChange={event => updateSelectedPrompt({ summary: event.target.value })} className="h-24 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 leading-6 outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:bg-zinc-900" /></label>
                  <label className="space-y-2 text-sm md:col-span-2"><span className="font-bold text-zinc-900 dark:text-zinc-50">Tags</span><input value={selectedPrompt.tags.join(', ')} onChange={event => updateSelectedPrompt({ tags: event.target.value.split(',').map(tag => tag.trim()).filter(Boolean) })} placeholder="free-ai-prompts, cinematic, portrait" className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:bg-zinc-900" /></label>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-4">
                  <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <div className="relative aspect-[4/3]">
                      <PromptPreviewImage src={selectedPrompt.previewImage} alt={selectedPrompt.previewAlt || selectedPrompt.title} category={selectedPrompt.category} />
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-6 text-zinc-500 dark:text-zinc-400">
                    Real image URLs are supported here. If the image fails to load, Prompt Hub falls back to the built-in category preview automatically.
                  </p>
                </div>
              </div>

              <label className="space-y-2 text-sm">
                <span className="font-bold text-zinc-900 dark:text-zinc-50">Main prompt</span>
                <textarea value={selectedPrompt.prompt} onChange={event => updateSelectedPrompt({ prompt: event.target.value })} className="h-60 w-full max-w-full rounded-2xl sm:h-72 border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-sm leading-7 outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:bg-zinc-900" />
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-bold text-zinc-900 dark:text-zinc-50">Advanced JSON editor</span>
                <textarea value={jsonEditor} onChange={event => { setJsonEditorTouched(true); setJsonEditor(event.target.value) }} className="h-[22rem] w-full max-w-full rounded-2xl sm:h-[28rem] border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-xs leading-6 outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:bg-zinc-900" />
              </label>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Select a prompt from the left or create a new one to start editing.
            </div>
          )}
        </section>
      </div>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={selectedPromptIsDraft ? "Discard this draft?" : "Delete this prompt?"}
        description={
          selectedPrompt ? (
            <>
              You are about to permanently delete{' '}
              <strong className="text-foreground">
                {selectedPromptIsDraft ? 'this unsaved draft' : selectedPrompt.title || selectedPrompt.slug || 'this prompt'}
              </strong>
              . {selectedPromptIsDraft ? 'This only discards the local draft.' : 'This removes it from Explore and its public detail page. This action cannot be undone.'}
            </>
          ) : null
        }
        confirmLabel={selectedPromptIsDraft ? 'Discard draft' : 'Yes, delete'}
        cancelLabel="Cancel"
        tone="danger"
        loading={busyAction === 'delete'}
        onConfirm={performDeleteSelectedPrompt}
      />
    </div>
  )
}
