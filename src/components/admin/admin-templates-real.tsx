'use client'

import { type ChangeEvent, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Copy, Eye, FileArchive, ImagePlus, Loader2, PackageCheck, Plus, RotateCcw, Save, Search, Sparkles, Tags, Trash2, UploadCloud, XCircle } from 'lucide-react'
import type { DashboardKit } from '@/lib/dashboard-kits'
import { parseTemplateImportPayload, type TemplateImportSummary } from '@/lib/template-import'
import { cn, readFileAsText, slugify } from '@/lib/utils'
import { ModernSelect } from '@/components/design-system/modern-select'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

type Props = { initialKits: DashboardKit[] }
type StatusMessage = { type: 'success' | 'error'; message: string } | null
type UploadKind = 'cover' | 'screenshot' | 'package'
type TemplateJsonRecord = Partial<DashboardKit> & Record<string, unknown>

type TemplateForm = {
  id: string
  slug: string
  title: string
  shortTitle: string
  status: DashboardKit['status']
  category: string
  categoryTitle: string
  summary: string
  description: string
  seoTitle: string
  metaDescription: string
  priceUsd: string
  originalPriceUsd: string
  previewPath: string
  livePreviewUrl: string
  packageFilename: string
  packageKey: string
  coverImage: string
  screenshots: string
  tags: string
  keywords: string
  techStack: string
  includedPages: string
  features: string
  useCases: string
  highlights: string
  isFree: boolean
}

const TEMPLATE_JSON_SKELETON = {
  kits: [
    {
      id: '',
      slug: '',
      title: '',
      shortTitle: '',
      status: 'draft',
      category: 'dashboard-kits',
      categoryTitle: 'Dashboard Kits',
      summary: '',
      description: '',
      seoTitle: '',
      metaDescription: '',
      priceUsd: 12,
      originalPriceUsd: 49,
      framework: 'nextjs',
      frameworkLabel: 'Next.js App Router',
      previewPath: '',
      packageFilename: '',
      packageKey: '',
      coverImage: '',
      screenshots: [],
      tags: [],
      keywords: [],
      techStack: [],
      includedPages: [],
      features: [],
      highlights: [{ label: '', value: '' }],
      useCases: [],
    },
  ],
}

const TEMPLATE_JSON_SKELETON_TEXT = JSON.stringify(TEMPLATE_JSON_SKELETON, null, 2)

function titleCase(value: string) {
  return value.split(/[-_\s]+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
}

function toLines(values: string[] | undefined) {
  return (values || []).join('\n')
}

function parseLines(value: string) {
  const normalized = value.trim()
  if (!normalized) return []

  const splitter = /\r?\n/.test(normalized) ? /\r?\n/ : /,/
  return normalized.split(splitter).map((item) => item.trim()).filter(Boolean)
}

function linesFromUnknown(value: unknown, fallback = '') {
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === 'string' || typeof item === 'number') return String(item).trim()
      if (item && typeof item === 'object') return JSON.stringify(item)
      return ''
    }).filter(Boolean).join('\n')
  }
  if (typeof value === 'string') return parseLines(value).join('\n')
  return fallback
}

function stringFromUnknown(value: unknown, fallback = '') {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return fallback
}

function highlightsFromUnknown(value: unknown, fallback: string) {
  if (Array.isArray(value)) return JSON.stringify(value, null, 2)
  if (typeof value === 'string' && value.trim()) {
    try {
      return JSON.stringify(JSON.parse(value), null, 2)
    } catch {
      return value
    }
  }
  return fallback
}

function getTemplateRecords(payload: unknown): TemplateJsonRecord[] {
  if (Array.isArray(payload)) return payload.filter((item): item is TemplateJsonRecord => Boolean(item) && typeof item === 'object' && !Array.isArray(item))
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const objectPayload = payload as Record<string, unknown>
    if (Array.isArray(objectPayload.kits)) return objectPayload.kits.filter((item): item is TemplateJsonRecord => Boolean(item) && typeof item === 'object' && !Array.isArray(item))
    if (Array.isArray(objectPayload.templates)) return objectPayload.templates.filter((item): item is TemplateJsonRecord => Boolean(item) && typeof item === 'object' && !Array.isArray(item))
    return [objectPayload as TemplateJsonRecord]
  }
  return []
}

function createEmptyForm(): TemplateForm {
  return {
    id: '',
    slug: '',
    title: '',
    shortTitle: '',
    status: 'draft',
    category: 'dashboard-kits',
    categoryTitle: 'Dashboard Kits',
    summary: '',
    description: '',
    seoTitle: '',
    metaDescription: '',
    priceUsd: '12',
    originalPriceUsd: '49',
    previewPath: '/dashboard-kits/new-dashboard-template',
    livePreviewUrl: '',
    packageFilename: 'dashboard-template.zip',
    packageKey: '',
    coverImage: '',
    screenshots: '',
    tags: '',
    keywords: '',
    techStack: 'Next.js 16\nReact 19\nTypeScript\nTailwind CSS 4\nRadix UI\nRecharts',
    includedPages: '',
    features: '',
    useCases: '',
    highlights: JSON.stringify([
      { label: 'Source files', value: '100+' },
      { label: 'Pages', value: '40+' },
      { label: 'Framework', value: 'Next.js' },
      { label: 'License', value: 'Lifetime' },
    ], null, 2),
    isFree: false,
  }
}

function kitToForm(kit: DashboardKit): TemplateForm {
  return {
    id: kit.id,
    slug: kit.slug,
    title: kit.title,
    shortTitle: kit.shortTitle,
    status: kit.status,
    category: kit.category || 'dashboard-kits',
    categoryTitle: kit.categoryTitle || titleCase(kit.category || 'dashboard-kits'),
    summary: kit.summary,
    description: kit.description,
    seoTitle: kit.seoTitle,
    metaDescription: kit.metaDescription,
    priceUsd: String(kit.priceUsd),
    originalPriceUsd: String(kit.originalPriceUsd),
    previewPath: kit.previewPath,
    livePreviewUrl: kit.livePreviewUrl || '',
    packageFilename: kit.packageFilename,
    packageKey: kit.packageKey || '',
    coverImage: kit.coverImage || '',
    screenshots: toLines(kit.screenshots),
    tags: toLines(kit.tags),
    keywords: toLines(kit.keywords),
    techStack: toLines(kit.techStack),
    includedPages: toLines(kit.includedPages),
    features: toLines(kit.features),
    useCases: toLines(kit.useCases),
    highlights: JSON.stringify(kit.highlights, null, 2),
    isFree: Boolean(kit.isFree),
  }
}

function formToKit(form: TemplateForm, fallback?: DashboardKit): Partial<DashboardKit> {
  let highlights: DashboardKit['highlights'] = fallback?.highlights || []
  try {
    const parsed = JSON.parse(form.highlights)
    if (Array.isArray(parsed)) highlights = parsed
  } catch {
    highlights = fallback?.highlights || []
  }
  const slug = slugify(form.slug || form.title)
  return {
    id: form.id || undefined,
    slug,
    title: form.title.trim(),
    shortTitle: (form.shortTitle || form.title).trim(),
    status: form.status,
    category: form.category.trim() || 'dashboard-kits',
    categoryTitle: form.categoryTitle.trim() || titleCase(form.category),
    summary: form.summary.trim(),
    description: form.description.trim(),
    seoTitle: form.seoTitle.trim() || form.title.trim() + ' | MTVerse Template',
    metaDescription: form.metaDescription.trim() || form.summary.trim(),
    priceUsd: Number(form.priceUsd) || 12,
    originalPriceUsd: Number(form.originalPriceUsd) || 49,
    framework: 'nextjs',
    frameworkLabel: 'Next.js App Router',
    previewPath: form.previewPath.trim() || '/dashboard-kits/' + slug,
    livePreviewUrl: form.livePreviewUrl.trim() || undefined,
    packageFilename: form.packageFilename.trim() || 'dashboard-template.zip',
    packageKey: form.packageKey.trim() || undefined,
    coverImage: form.coverImage.trim() || undefined,
    screenshots: parseLines(form.screenshots),
    tags: parseLines(form.tags),
    keywords: parseLines(form.keywords),
    techStack: parseLines(form.techStack),
    includedPages: parseLines(form.includedPages),
    features: parseLines(form.features),
    highlights,
    useCases: parseLines(form.useCases),
    metadataLanguages: fallback?.metadataLanguages,
    isFree: form.isFree,
  }
}

function formFromJsonRecord(record: TemplateJsonRecord, fallback?: DashboardKit): TemplateForm {
  const base = fallback ? kitToForm(fallback) : createEmptyForm()
  const title = stringFromUnknown(record.title, base.title)
  const slug = slugify(stringFromUnknown(record.slug, stringFromUnknown(record.id, title || base.slug || 'dashboard-template')))
  const category = slugify(stringFromUnknown(record.category, base.category || 'dashboard-kits')) || 'dashboard-kits'
  return {
    id: stringFromUnknown(record.id, base.id || 'dashboard-kit-' + slug),
    slug,
    title,
    shortTitle: stringFromUnknown(record.shortTitle, base.shortTitle || title),
    status: (stringFromUnknown(record.status, base.status) as DashboardKit['status']) || 'draft',
    category,
    categoryTitle: stringFromUnknown(record.categoryTitle, titleCase(category)),
    summary: stringFromUnknown(record.summary, base.summary),
    description: stringFromUnknown(record.description, base.description),
    seoTitle: stringFromUnknown(record.seoTitle, base.seoTitle),
    metaDescription: stringFromUnknown(record.metaDescription, base.metaDescription),
    priceUsd: stringFromUnknown(record.priceUsd, base.priceUsd),
    originalPriceUsd: stringFromUnknown(record.originalPriceUsd, base.originalPriceUsd),
    previewPath: stringFromUnknown(record.previewPath, base.previewPath || '/dashboard-kits/' + slug),
    livePreviewUrl: stringFromUnknown(record.livePreviewUrl, base.livePreviewUrl || ''),
    packageFilename: stringFromUnknown(record.packageFilename, base.packageFilename || slug + '.zip'),
    packageKey: stringFromUnknown(record.packageKey, base.packageKey),
    coverImage: stringFromUnknown(record.coverImage, base.coverImage),
    screenshots: linesFromUnknown(record.screenshots, base.screenshots),
    tags: linesFromUnknown(record.tags, base.tags),
    keywords: linesFromUnknown(record.keywords, base.keywords),
    techStack: linesFromUnknown(record.techStack, base.techStack),
    includedPages: linesFromUnknown(record.includedPages, base.includedPages),
    features: linesFromUnknown(record.features, base.features),
    useCases: linesFromUnknown(record.useCases, base.useCases),
    highlights: highlightsFromUnknown(record.highlights, base.highlights),
    isFree: Boolean(record.isFree ?? base.isFree),
  }
}

function exportKit(form: TemplateForm, fallback?: DashboardKit) {
  const kit = formToKit(form, fallback) as Partial<DashboardKit>
  const { metadataLanguages, updatedAt, ...cleanKit } = kit
  void metadataLanguages
  void updatedAt
  return cleanKit
}

function canPreviewImage(src: string) {
  const value = src.trim()
  return value.startsWith('/') || value.startsWith('https://') || value.startsWith('http://')
}

function StatusBanner({ status }: { status: StatusMessage }) {
  if (!status) return null
  const success = status.type === 'success'
  return <div className={cn('flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold', success ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-100' : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-100')}>{success ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}<span>{status.message}</span></div>
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-1.5"><span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{label}</span>{children}</label>
}

function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50', props.className)} />
}

function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn('min-h-28 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium leading-6 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50', props.className)} />
}

async function parseApiResponse(response: Response) {
  const text = await response.text()
  if (!text.trim()) return {}
  try {
    return JSON.parse(text) as { success?: boolean; error?: string; message?: string; kits?: DashboardKit[]; kit?: DashboardKit; summary?: TemplateImportSummary; imageUrl?: string; packageFilename?: string; packageKey?: string }
  } catch {
    return { error: text }
  }
}

export default function AdminTemplatesReal({ initialKits }: Props) {
  const [kits, setKits] = useState(initialKits)
  const [selectedSlug, setSelectedSlug] = useState(initialKits[0]?.slug || '')
  const selectedKit = kits.find((kit) => kit.slug === selectedSlug)
  const [form, setForm] = useState<TemplateForm>(() => (selectedKit ? kitToForm(selectedKit) : createEmptyForm()))
  const [jsonInput, setJsonInput] = useState(TEMPLATE_JSON_SKELETON_TEXT)
  const [replaceExisting, setReplaceExisting] = useState(false)
  const [importSummary, setImportSummary] = useState<TemplateImportSummary | null>(null)
  const [query, setQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState<UploadKind | null>(null)
  const [confirmingSave, setConfirmingSave] = useState(false)
  const [status, setStatus] = useState<StatusMessage>(null)

  const jsonIsSkeleton = jsonInput.trim() === TEMPLATE_JSON_SKELETON_TEXT.trim()
  const screenshotUrls = useMemo(() => parseLines(form.screenshots), [form.screenshots])
  const previewableScreenshots = screenshotUrls.filter(canPreviewImage)
  const generatedJson = useMemo(() => JSON.stringify({ kits: [exportKit(form, selectedKit)] }, null, 2), [form, selectedKit])
  const filteredKits = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return kits
    return kits.filter((kit) => [kit.title, kit.slug, kit.summary, ...kit.tags, ...kit.keywords].join(' ').toLowerCase().includes(search))
  }, [kits, query])
  const categoryOptions = useMemo(() => {
    const categories = new Map<string, string>([['dashboard-kits', 'Dashboard Kits'], ['dashboards', 'Dashboards'], ['admin', 'Admin'], ['saas', 'SaaS'], ['ecommerce', 'Ecommerce'], ['analytics', 'Analytics'], ['crm', 'CRM'], ['finance', 'Finance'], ['marketing', 'Marketing'], ['portfolio', 'Portfolio'], ['landing', 'Landing']])
    kits.forEach((kit) => { if (kit.category) categories.set(kit.category, kit.categoryTitle || titleCase(kit.category)) })
    if (form.category) categories.set(form.category, form.categoryTitle || titleCase(form.category))
    return Array.from(categories, ([value, label]) => ({ value, label }))
  }, [kits, form.category, form.categoryTitle])
  const validationItems = useMemo(() => [
    { label: 'Title', ok: Boolean(form.title.trim()) },
    { label: 'Slug', ok: Boolean(slugify(form.slug || form.title)) },
    { label: 'Category', ok: Boolean(form.category.trim()) },
    { label: 'Price', ok: Number(form.priceUsd) >= 0 },
    { label: 'Preview path', ok: Boolean(form.previewPath.trim()) },
    { label: 'Cover image', ok: Boolean(form.coverImage.trim()) },
    { label: 'Screenshot gallery', ok: screenshotUrls.length > 0 },
    { label: 'Package R2 key', ok: Boolean(form.packageKey.trim()) },
  ], [form, screenshotUrls.length])
  const saveWarnings = validationItems.filter((item) => !item.ok)
  const previewSlug = slugify(form.slug || form.title)
  const previewUrl = previewSlug ? `/preview/${previewSlug}` : ''

  function updateForm<K extends keyof TemplateForm>(key: K, value: TemplateForm[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }
  function selectKit(kit: DashboardKit) {
    setSelectedSlug(kit.slug)
    setForm(kitToForm(kit))
    setStatus(null)
  }
  function createNewKit() {
    setSelectedSlug('')
    setForm(createEmptyForm())
    setStatus({ type: 'success', message: 'New template draft ready.' })
  }
  function findFallback(record: TemplateJsonRecord) {
    const keys = [record.slug, record.id, record.title].filter((value): value is string => typeof value === 'string' && Boolean(value.trim())).map((value) => slugify(value))
    return kits.find((kit) => keys.includes(slugify(kit.slug)) || keys.includes(slugify(kit.id)) || keys.includes(slugify(kit.title)))
  }
  function loadJsonIntoForm() {
    if (!jsonInput.trim() || jsonIsSkeleton) {
      setStatus({ type: 'error', message: 'Paste filled JSON before loading the form.' })
      return
    }
    try {
      const payload = JSON.parse(jsonInput)
      const firstRecord = getTemplateRecords(payload)[0]
      if (!firstRecord) throw new Error('No template record found in the JSON.')
      const fallback = findFallback(firstRecord)
      const nextForm = formFromJsonRecord(firstRecord, fallback)
      setSelectedSlug(fallback?.slug || '')
      setForm(nextForm)
      setImportSummary(parseTemplateImportPayload(payload, kits, { replaceExisting }).summary)
      setStatus({ type: 'success', message: (nextForm.title || nextForm.slug || 'Template') + ' loaded into the form.' })
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Invalid JSON file or pasted JSON.' })
    }
  }
  function previewJsonImport() {
    if (!jsonInput.trim() || jsonIsSkeleton) {
      setStatus({ type: 'error', message: 'Paste filled JSON before previewing the direct import.' })
      return
    }
    try {
      const parsed = parseTemplateImportPayload(JSON.parse(jsonInput), kits, { replaceExisting })
      setImportSummary(parsed.summary)
      setStatus({ type: 'success', message: 'Import preview ready. ' + parsed.summary.prepared + ' template records prepared.' })
    } catch {
      setStatus({ type: 'error', message: 'Invalid JSON file or pasted JSON.' })
    }
  }
  async function importJsonDirectly() {
    if (!jsonInput.trim() || jsonIsSkeleton) {
      setStatus({ type: 'error', message: 'Paste filled JSON before importing.' })
      return
    }
    setImporting(true)
    setStatus(null)
    try {
      const response = await fetch('/api/admin/templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'import-json', rawJson: jsonInput, replaceExisting }) })
      const data = await parseApiResponse(response)
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to import JSON.')
      if (data.kits) setKits(data.kits)
      if (data.summary) setImportSummary(data.summary)
      const first = data.kits?.[0]
      if (first) { setSelectedSlug(first.slug); setForm(kitToForm(first)) }
      setStatus({ type: 'success', message: data.message || 'Template JSON imported.' })
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Failed to import JSON.' })
    } finally {
      setImporting(false)
    }
  }
  async function saveKit() {
    setSaving(true)
    setStatus(null)
    try {
      const response = await fetch('/api/admin/templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kit: formToKit(form, selectedKit) }) })
      const data = await parseApiResponse(response)
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to save template.')
      if (data.kits) setKits(data.kits)
      if (data.kit) { setSelectedSlug(data.kit.slug); setForm(kitToForm(data.kit)) }
      setStatus({ type: 'success', message: data.message || 'Template saved.' })
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Failed to save template.' })
    } finally {
      setSaving(false)
    }
  }
  async function deleteKit() {
    if (!selectedKit) return
    setDeleting(true)
    setStatus(null)
    try {
      const response = await fetch('/api/admin/templates', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: selectedKit.slug }) })
      const data = await parseApiResponse(response)
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to delete template.')
      const nextKits = data.kits || []
      setKits(nextKits)
      setSelectedSlug(nextKits[0]?.slug || '')
      setForm(nextKits[0] ? kitToForm(nextKits[0]) : createEmptyForm())
      setStatus({ type: 'success', message: data.message || 'Template deleted.' })
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Failed to delete template.' })
    } finally {
      setDeleting(false)
    }
  }
  async function uploadAsset(file: File | undefined, kind: UploadKind) {
    if (!file) return
    setUploading(kind)
    setStatus(null)
    try {
      const formData = new FormData()
      formData.set('file', file)
      formData.set('type', kind === 'package' ? 'package' : 'screenshot')
      formData.set('slug', form.slug || form.title || 'dashboard-kit')
      const response = await fetch('/api/admin/templates/upload', { method: 'POST', body: formData })
      const data = await parseApiResponse(response)
      if (!response.ok || !data.success) throw new Error(data.error || 'Upload failed.')
      if (kind === 'package') {
        setForm((current) => ({ ...current, packageFilename: data.packageFilename || current.packageFilename, packageKey: data.packageKey || current.packageKey }))
      } else {
        setForm((current) => {
          const nextScreenshots = parseLines(current.screenshots)
          if (data.imageUrl && !nextScreenshots.includes(data.imageUrl)) {
            if (kind === 'cover') nextScreenshots.unshift(data.imageUrl)
            else nextScreenshots.push(data.imageUrl)
          }
          return { ...current, coverImage: kind === 'cover' ? data.imageUrl || current.coverImage : current.coverImage || data.imageUrl || '', screenshots: nextScreenshots.join('\n') }
        })
      }
      setStatus({ type: 'success', message: data.message || 'Upload complete.' })
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Upload failed.' })
    } finally {
      setUploading(null)
    }
  }
  async function handleUploadInput(event: ChangeEvent<HTMLInputElement>, kind: UploadKind) {
    await uploadAsset(event.currentTarget.files?.[0], kind)
    event.currentTarget.value = ''
  }
  async function copyJsonSkeleton() {
    await navigator.clipboard.writeText(TEMPLATE_JSON_SKELETON_TEXT)
    setStatus({ type: 'success', message: 'JSON keys copied.' })
  }
  async function copyGeneratedJson() {
    await navigator.clipboard.writeText(generatedJson)
    setStatus({ type: 'success', message: 'Generated template JSON copied.' })
  }
  function resetJsonSkeleton() {
    setJsonInput(TEMPLATE_JSON_SKELETON_TEXT)
    setImportSummary(null)
    setStatus({ type: 'success', message: 'Blank JSON keys loaded.' })
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
          <div><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"><PackageCheck className="h-5 w-5" /></span><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-300">Admin</p><h1 className="text-2xl font-black text-zinc-950 dark:text-zinc-50">Template manager</h1></div></div><p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-500 dark:text-zinc-400">Create template records, upload preview images, attach ZIP packages, and review generated JSON before publishing.</p></div>
          <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[360px]"><div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950"><p className="text-2xl font-black text-zinc-950 dark:text-zinc-50">{kits.length}</p><p className="text-xs font-bold text-zinc-500">templates</p></div><div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950"><p className="text-2xl font-black text-zinc-950 dark:text-zinc-50">{kits.filter((kit) => kit.status === 'available').length}</p><p className="text-xs font-bold text-zinc-500">available</p></div><div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950"><p className="text-2xl font-black text-zinc-950 dark:text-zinc-50">{new Set(kits.map((kit) => kit.category)).size}</p><p className="text-xs font-bold text-zinc-500">categories</p></div></div>
        </div>
      </section>

      <StatusBanner status={status} />

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between"><div><h2 className="text-base font-black text-zinc-900 dark:text-zinc-50">JSON to form builder</h2><p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Paste one template JSON, load it into the form, upload assets, then confirm save.</p></div><div className="flex flex-wrap gap-2"><label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"><UploadCloud className="h-4 w-4" />Upload JSON<input type="file" accept="application/json,.json" className="hidden" onChange={async (event) => { const file = event.currentTarget.files?.[0]; if (!file) return; setJsonInput(await readFileAsText(file)); setImportSummary(null); setStatus({ type: 'success', message: file.name + ' loaded. Click Load into form to review.' }); event.currentTarget.value = '' }} /></label><button type="button" onClick={copyJsonSkeleton} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"><Copy className="h-4 w-4" />Copy keys</button><button type="button" onClick={loadJsonIntoForm} disabled={!jsonInput.trim() || jsonIsSkeleton} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><ArrowRight className="h-4 w-4" />Load into form</button></div></div>
        <div className="mt-4 grid gap-4 xl:grid-cols-[1.08fr_0.92fr]"><div className="grid gap-3"><TextArea value={jsonInput} onChange={(event) => { setJsonInput(event.target.value); setImportSummary(null) }} placeholder='{ "kits": [{ "title": "", "slug": "" }] }' className="h-72 min-h-72 font-mono text-xs leading-6" /><div className="flex flex-wrap gap-2"><button type="button" onClick={previewJsonImport} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"><Eye className="h-4 w-4" />Preview import</button><button type="button" onClick={resetJsonSkeleton} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"><RotateCcw className="h-4 w-4" />Reset keys</button><button type="button" onClick={importJsonDirectly} disabled={importing || !jsonInput.trim() || jsonIsSkeleton} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-zinc-900 px-4 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800">{importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}Direct import</button></div><p className="rounded-xl bg-zinc-50 px-3 py-2 text-xs leading-5 text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">Accepted formats: one template object, an array, <span className="font-mono">{'{ "kits": [...] }'}</span>, or <span className="font-mono">{'{ "templates": [...] }'}</span>. Upload buttons add R2 image and ZIP values into the form.</p></div><div className="grid gap-4"><div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/60"><div className="flex items-center justify-between gap-3"><div><h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50">Save readiness</h3><p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Review before publishing.</p></div><span className={cn('rounded-full px-2.5 py-1 text-xs font-black', saveWarnings.length ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300')}>{saveWarnings.length ? saveWarnings.length + ' checks' : 'Ready'}</span></div><div className="mt-4 grid gap-2 sm:grid-cols-2">{validationItems.map((item) => <div key={item.label} className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">{item.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-amber-500" />}{item.label}</div>)}</div><label className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-50"><input type="checkbox" checked={replaceExisting} onChange={(event) => setReplaceExisting(event.target.checked)} className="h-4 w-4 rounded border-zinc-300" />Replace existing matches on direct import</label>{importSummary ? <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-zinc-500 dark:text-zinc-400"><p>Received: <span className="font-bold text-zinc-900 dark:text-zinc-50">{importSummary.received}</span></p><p>Prepared: <span className="font-bold text-zinc-900 dark:text-zinc-50">{importSummary.prepared}</span></p><p>Skipped: <span className="font-bold text-zinc-900 dark:text-zinc-50">{importSummary.skippedExisting}</span></p><p>Invalid: <span className="font-bold text-zinc-900 dark:text-zinc-50">{importSummary.invalid}</span></p></div> : null}</div><div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/60"><div className="mb-3 flex items-center justify-between gap-3"><div><h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50">Generated JSON</h3><p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Live from the form and uploaded asset values.</p></div><button type="button" onClick={copyGeneratedJson} className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-bold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"><Copy className="h-3.5 w-3.5" />Copy</button></div><textarea readOnly value={generatedJson} className="h-44 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 font-mono text-[11px] leading-5 text-zinc-700 outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200" /></div></div></div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]"><aside className="grid h-fit gap-4 xl:sticky xl:top-20"><div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" /><TextInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search templates" className="pl-9" /></div><div className="mt-3 grid gap-2"><button type="button" onClick={createNewKit} className="flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white transition-colors hover:bg-blue-700"><Plus className="h-4 w-4" />New template</button>{filteredKits.map((kit) => <button key={kit.slug} type="button" onClick={() => selectKit(kit)} className={cn('rounded-xl border p-3 text-left transition-colors', selectedSlug === kit.slug ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-zinc-200 bg-white hover:border-blue-300 dark:border-zinc-800 dark:bg-zinc-900')}><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-black text-zinc-950 dark:text-zinc-50">{kit.shortTitle}</p><div className="flex items-center gap-1.5"><span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', kit.status === 'available' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600')}>{kit.status}</span>{kit.isFree && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">FREE</span>}</div></div><p className="mt-1 truncate text-xs text-zinc-500">{kit.slug}</p></button>)}</div></div></aside><main className="grid gap-6"><section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6"><div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="text-xl font-black text-zinc-950 dark:text-zinc-50">Template details</h2><p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Product page, pricing, preview path, and delivery fields.</p></div><div className="flex flex-wrap gap-2">{previewUrl ? <Link href={previewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-200 px-3 text-sm font-bold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800">Preview <ArrowRight className="h-4 w-4" /></Link> : null}<button type="button" onClick={copyGeneratedJson} className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-200 px-3 text-sm font-bold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800"><Copy className="h-4 w-4" />Copy JSON</button><button type="button" onClick={deleteKit} disabled={!selectedKit || deleting} className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 px-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50">{deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}Delete</button><button type="button" onClick={() => setConfirmingSave(true)} disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save template</button></div></div><div className="grid gap-4 lg:grid-cols-2"><Field label="Title"><TextInput value={form.title} onChange={(event) => updateForm('title', event.target.value)} placeholder="Premium SaaS Dashboard Template" /></Field><Field label="Slug"><TextInput value={form.slug} onChange={(event) => updateForm('slug', event.target.value)} placeholder="premium-saas-dashboard-template" /></Field><Field label="Short title"><TextInput value={form.shortTitle} onChange={(event) => updateForm('shortTitle', event.target.value)} /></Field><Field label="Status"><ModernSelect value={form.status} onChange={(value) => updateForm('status', value as DashboardKit['status'])} ariaLabel="Template status" options={[{ value: 'available', label: 'Available' }, { value: 'draft', label: 'Draft' }, { value: 'coming-soon', label: 'Coming soon' }]} /></Field><Field label="Category"><ModernSelect value={form.category} onChange={(value) => { updateForm('category', value); updateForm('categoryTitle', categoryOptions.find((option) => option.value === value)?.label || titleCase(value)) }} ariaLabel="Template category" options={categoryOptions} /></Field><Field label="Category title"><TextInput value={form.categoryTitle} onChange={(event) => updateForm('categoryTitle', event.target.value)} /></Field><Field label="Summary"><TextArea value={form.summary} onChange={(event) => updateForm('summary', event.target.value)} className="min-h-24" /></Field><Field label="Description"><TextArea value={form.description} onChange={(event) => updateForm('description', event.target.value)} className="min-h-24" /></Field><Field label="SEO title"><TextInput value={form.seoTitle} onChange={(event) => updateForm('seoTitle', event.target.value)} /></Field><Field label="Meta description"><TextArea value={form.metaDescription} onChange={(event) => updateForm('metaDescription', event.target.value)} className="min-h-24" /></Field><Field label="Price USD"><TextInput value={form.priceUsd} onChange={(event) => updateForm('priceUsd', event.target.value)} /></Field><Field label="Original price USD"><TextInput value={form.originalPriceUsd} onChange={(event) => updateForm('originalPriceUsd', event.target.value)} /></Field><Field label="Free template"><label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.isFree} onChange={(event) => updateForm('isFree', event.target.checked)} className="h-5 w-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 dark:border-zinc-700" /><span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Mark as free (users download without payment)</span></label></Field><Field label="Preview path"><TextInput value={form.previewPath} onChange={(event) => updateForm('previewPath', event.target.value)} placeholder="/dashboard-kits/template-slug" /></Field><Field label="Live preview URL"><TextInput value={form.livePreviewUrl} onChange={(event) => updateForm('livePreviewUrl', event.target.value)} placeholder="https://mt-dashboards.vercel.app/" /></Field><Field label="Package filename"><TextInput value={form.packageFilename} onChange={(event) => updateForm('packageFilename', event.target.value)} /></Field><Field label="Package R2 key"><TextInput value={form.packageKey} onChange={(event) => updateForm('packageKey', event.target.value)} /></Field></div></section><section className="grid gap-6 lg:grid-cols-2"><div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6"><div className="flex items-center gap-2"><Tags className="h-5 w-5 text-blue-600" /><h2 className="text-lg font-black text-zinc-950 dark:text-zinc-50">Tags and pages</h2></div><div className="mt-4 grid gap-4"><Field label="Tags"><TextArea value={form.tags} onChange={(event) => updateForm('tags', event.target.value)} /></Field><Field label="Keywords"><TextArea value={form.keywords} onChange={(event) => updateForm('keywords', event.target.value)} /></Field><Field label="Included pages"><TextArea value={form.includedPages} onChange={(event) => updateForm('includedPages', event.target.value)} /></Field><Field label="Use cases"><TextArea value={form.useCases} onChange={(event) => updateForm('useCases', event.target.value)} /></Field></div></div><div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6"><div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-blue-600" /><h2 className="text-lg font-black text-zinc-950 dark:text-zinc-50">Features</h2></div><div className="mt-4 grid gap-4"><Field label="Tech stack"><TextArea value={form.techStack} onChange={(event) => updateForm('techStack', event.target.value)} /></Field><Field label="Features"><TextArea value={form.features} onChange={(event) => updateForm('features', event.target.value)} /></Field><Field label="Highlights JSON"><TextArea value={form.highlights} onChange={(event) => updateForm('highlights', event.target.value)} className="font-mono text-xs" /></Field></div></div></section><section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6"><div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="flex items-center gap-2"><ImagePlus className="h-5 w-5 text-blue-600" /><h2 className="text-lg font-black text-zinc-950 dark:text-zinc-50">Assets and package</h2></div><div className="flex flex-wrap gap-2"><label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 px-3 text-sm font-bold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800">{uploading === 'cover' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}Upload cover<input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(event) => handleUploadInput(event, 'cover')} /></label><label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 px-3 text-sm font-bold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800">{uploading === 'screenshot' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}Add screenshot<input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(event) => handleUploadInput(event, 'screenshot')} /></label><label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 px-3 text-sm font-bold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800">{uploading === 'package' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileArchive className="h-4 w-4" />}Upload ZIP<input type="file" accept=".zip,application/zip" hidden onChange={(event) => handleUploadInput(event, 'package')} /></label></div></div><div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]"><div><p className="mb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">Cover preview</p>{canPreviewImage(form.coverImage) ? <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950"><Image src={form.coverImage} alt={(form.title || 'Template') + ' cover preview'} fill sizes="(min-width: 1024px) 44vw, 100vw" className="object-cover" unoptimized /></div> : <div className="flex aspect-[16/9] items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 text-center text-sm font-bold text-zinc-400 dark:border-zinc-700 dark:bg-zinc-950">No cover image selected</div>}</div><div className="grid content-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/60"><div className="flex items-center gap-2"><FileArchive className="h-5 w-5 text-blue-600" /><h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50">Package delivery</h3></div><p className="text-sm text-zinc-600 dark:text-zinc-300"><span className="font-bold text-zinc-900 dark:text-zinc-50">Filename:</span> {form.packageFilename || 'Not set'}</p><p className="break-all text-sm text-zinc-600 dark:text-zinc-300"><span className="font-bold text-zinc-900 dark:text-zinc-50">R2 key:</span> {form.packageKey || 'Upload ZIP or paste key'}</p><div className={cn('rounded-xl px-3 py-2 text-xs font-bold', form.packageKey ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300')}>{form.packageKey ? 'ZIP is linked for paid downloads.' : 'ZIP key missing. Downloads stay locked until package is linked.'}</div></div></div><div className="mt-5"><div className="mb-2 flex items-center justify-between gap-3"><p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Screenshot gallery</p><p className="text-xs font-bold text-zinc-400">{screenshotUrls.length} images</p></div>{previewableScreenshots.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{previewableScreenshots.slice(0, 6).map((url) => <div key={url} className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"><div className="relative aspect-[16/9] bg-zinc-100 dark:bg-zinc-900"><Image src={url} alt="Template screenshot preview" fill sizes="(min-width: 1280px) 22vw, (min-width: 640px) 42vw, 100vw" className="object-cover" unoptimized /></div><div className="flex items-center justify-between gap-2 px-3 py-2"><button type="button" onClick={() => updateForm('coverImage', url)} className="text-xs font-bold text-blue-600 transition hover:text-blue-700">Use cover</button><button type="button" onClick={() => updateForm('screenshots', screenshotUrls.filter((item) => item !== url).join('\n'))} className="text-xs font-bold text-red-600 transition hover:text-red-700">Remove</button></div></div>)}</div> : <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-sm font-bold text-zinc-400 dark:border-zinc-700 dark:bg-zinc-950">No screenshots uploaded yet</div>}</div><div className="mt-4 grid gap-4 lg:grid-cols-2"><Field label="Screenshot URLs"><TextArea value={form.screenshots} onChange={(event) => updateForm('screenshots', event.target.value)} className="min-h-36" /></Field><Field label="Cover image URL"><TextArea value={form.coverImage} onChange={(event) => updateForm('coverImage', event.target.value)} className="min-h-36" /></Field></div></section></main></div>

      <ConfirmDialog open={confirmingSave} onOpenChange={setConfirmingSave} title="Confirm template save" confirmLabel="Confirm and save" cancelLabel="Keep editing" tone={saveWarnings.length ? 'warning' : 'success'} loading={saving} onConfirm={saveKit} description={<div className="grid gap-4 text-left"><div className="grid gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-900/70"><p><span className="font-bold text-zinc-900 dark:text-zinc-50">Title:</span> {form.title || 'Untitled template'}</p><p><span className="font-bold text-zinc-900 dark:text-zinc-50">Slug:</span> {form.slug || 'Not set'}</p><p><span className="font-bold text-zinc-900 dark:text-zinc-50">Category:</span> {form.categoryTitle || form.category || 'Not set'}</p><p><span className="font-bold text-zinc-900 dark:text-zinc-50">Price:</span> USD {form.priceUsd || '0'}</p><p className="break-all"><span className="font-bold text-zinc-900 dark:text-zinc-50">Package:</span> {form.packageKey || form.packageFilename || 'Not set'}</p><p><span className="font-bold text-zinc-900 dark:text-zinc-50">Screenshots:</span> {screenshotUrls.length}</p></div>{saveWarnings.length ? <div className="grid gap-1.5">{saveWarnings.map((item) => <p key={item.label} className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300"><XCircle className="h-3.5 w-3.5" />{item.label} needs attention</p>)}</div> : <p className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" />All required fields look ready.</p>}</div>} />
    </div>
  )
}
