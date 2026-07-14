'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  CheckCircle2,
  Clipboard,
  Download,
  Heart,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  LogOut,
  Mail,
  PackageCheck,
  ShieldCheck,
  WalletCards,
} from 'lucide-react'
import { toast } from 'sonner'
import PublicLayout from '@/components/layout/PublicLayout'
import { useAuth } from '@/hooks/use-auth'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const DEFAULT_USER_AVATAR = '/default-3d-avatar.jpg'

type AccountTemplate = {
  slug: string
  title: string
  summary: string
  screenshotUrl: string
  price: number
  purchased: boolean
  saved: boolean
  freeDownloaded: boolean
  canDownload: boolean
}

type AccountUser = {
  email: string
  name?: string | null
  image?: string | null
  createdAt?: string
}

function getDisplayName(user: AccountUser) {
  return user.name?.trim() || user.email.split('@')[0]
}

function AccountAvatar({ user }: { user: AccountUser }) {
  const [imageFailed, setImageFailed] = useState(false)
  const imageUrl = user.image && !imageFailed ? user.image : DEFAULT_USER_AVATAR

  return (
    <span className="relative inline-flex h-20 w-20 shrink-0 overflow-hidden rounded-full border border-border bg-muted shadow-sm ring-4 ring-background">
      <Image
        src={imageUrl}
        alt=""
        fill
        sizes="80px"
        className="object-cover"
        onError={() => setImageFailed(true)}
        unoptimized
      />
    </span>
  )
}

function formatPlan(plan: string) {
  return plan.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export default function AccountClient() {
  const { user, loading, authenticated, signOut, plan, licenseKey } = useAuth()
  const router = useRouter()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [library, setLibrary] = useState<AccountTemplate[]>([])
  const [libraryLoading, setLibraryLoading] = useState(false)

  useEffect(() => {
    if (!loading && !authenticated) {
      router.push('/sign-in?next=/account')
    }
  }, [loading, authenticated, router])

  useEffect(() => {
    let cancelled = false

    if (!authenticated) {
      setLibrary([])
      return
    }

    setLibraryLoading(true)
    fetch('/api/account/templates', { credentials: 'include' })
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as { templates?: AccountTemplate[] } | null
        if (!cancelled) {
          setLibrary(response.ok && payload?.templates ? payload.templates : [])
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLibrary([])
        }
      })
      .finally(() => {
        if (!cancelled) setLibraryLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [authenticated])

  const paidUnlockedTemplates = useMemo(() => library.filter((template) => template.purchased && template.canDownload), [library])
  const savedTemplates = useMemo(() => library.filter((template) => template.saved), [library])
  const templateLibrary = useMemo(() => {
    const items = new Map<string, AccountTemplate>()
    for (const template of paidUnlockedTemplates) items.set(template.slug, template)
    for (const template of savedTemplates) items.set(template.slug, template)
    return Array.from(items.values())
  }, [paidUnlockedTemplates, savedTemplates])

  async function handleLogout() {
    setSigningOut(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000))
      await signOut()
      toast.success('Signed out successfully')
      setShowLogoutConfirm(false)
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Failed to sign out')
    } finally {
      setSigningOut(false)
    }
  }

  async function copyLicenseKey() {
    if (!licenseKey) return
    await navigator.clipboard.writeText(licenseKey)
    toast.success('License key copied')
  }

  if (loading || !authenticated || !user) {
    return (
      <PublicLayout>
        <main className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </PublicLayout>
    )
  }

  const displayName = getDisplayName(user)
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Recently'
  const isPaid = plan !== 'free'

  return (
    <PublicLayout>
      <main className="ds-bg-section min-h-[70vh]">
        <div className="ds-container max-w-5xl py-10 sm:py-12">
          <div className="mb-6 flex flex-col items-center gap-4 text-center">
            <div>
              <p className="ds-eyebrow ds-eyebrow-accent mb-2">Account</p>
              <h1 className="ds-h1">Account dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Manage saved templates, paid purchases, license access, and protected downloads from one clean workspace.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/templates" className="ds-btn ds-btn-secondary">
                <LayoutDashboard className="h-4 w-4" />
                Browse templates
              </Link>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="ds-btn ds-btn-ghost text-rose-600 dark:text-rose-400"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>

          <section className="mb-6 grid gap-4 lg:grid-cols-[1.45fr_0.55fr]">
            <div className="ds-card p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <AccountAvatar user={user} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-semibold text-foreground">{displayName}</h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Active
                    </span>
                  </div>
                  <div className="mt-2 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center">
                    <span className="inline-flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </span>
                    <span className="hidden sm:inline">/</span>
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Member since {memberSince}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="ds-card p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current plan</p>
                  <div className="mt-1 text-2xl font-semibold">{formatPlan(plan)}</div>
                </div>
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300">
                  <WalletCards className="h-5 w-5" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {isPaid ? 'Your paid access is active for purchased template downloads.' : 'Purchase a template to unlock protected ZIP downloads.'}
              </p>
            </div>
          </section>

          <section className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="ds-card p-5">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300">
                <PackageCheck className="h-5 w-5" />
              </div>
              <div className="text-2xl font-semibold">{paidUnlockedTemplates.length}</div>
              <p className="text-sm text-muted-foreground">Paid unlocked</p>
            </div>
            <div className="ds-card p-5">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                <Heart className="h-5 w-5" />
              </div>
              <div className="text-2xl font-semibold">{savedTemplates.length}</div>
              <p className="text-sm text-muted-foreground">Saved templates</p>
            </div>
            <div className="ds-card p-5">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="truncate text-base font-semibold">{licenseKey || 'Not issued yet'}</div>
              <p className="text-sm text-muted-foreground">License key</p>
              {licenseKey ? (
                <button onClick={copyLicenseKey} className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline">
                  <Clipboard className="h-4 w-4" />
                  Copy key
                </button>
              ) : null}
            </div>
          </section>

          <section id="library" className="ds-card p-6">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="ds-h3">Templates</h2>
                <p className="text-sm text-muted-foreground">Only saved templates and paid unlocked templates appear here.</p>
              </div>
              {libraryLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : null}
            </div>

            {libraryLoading ? (
              <div className="grid gap-3">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-28 animate-pulse rounded-lg border border-border bg-muted/50" />
                ))}
              </div>
            ) : templateLibrary.length > 0 ? (
              <div className="grid gap-3">
                {templateLibrary.map((template) => (
                  <div key={template.slug} className="flex flex-col gap-4 rounded-lg border border-border bg-background p-3 sm:flex-row sm:items-center">
                    <div className="relative h-28 w-full overflow-hidden rounded-md bg-muted sm:h-24 sm:w-40 sm:shrink-0">
                      <Image
                        src={template.screenshotUrl}
                        alt={template.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 160px"
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold line-clamp-1">{template.title}</h3>
                        {template.canDownload ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Unlocked
                          </span>
                        ) : null}
                        {template.saved ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                            <Heart className="h-3.5 w-3.5 fill-current" />
                            Saved
                          </span>
                        ) : null}
                        {template.freeDownloaded ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700 dark:bg-sky-950/30 dark:text-sky-300">
                            <Download className="h-3.5 w-3.5" />
                            Downloaded
                          </span>
                        ) : null}
                        {!template.canDownload && !template.saved && !template.freeDownloaded ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                            <LockKeyhole className="h-3.5 w-3.5" />
                            Locked
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{template.summary}</p>
                    </div>
                    <div className="flex shrink-0 gap-2 sm:flex-col">
                      {template.canDownload ? (
                        <Link href={`/api/download/template/${template.slug}`} className="ds-btn ds-btn-primary ds-btn-sm">
                          <Download className="h-4 w-4" />
                          Download ZIP
                        </Link>
                      ) : (
                        <Link href={`/templates/${template.slug}`} className="ds-btn ds-btn-secondary ds-btn-sm">
                          View details
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <div className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <PackageCheck className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">No saved or paid templates yet</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  Save a template or complete a paid purchase and it will appear here automatically.
                </p>
                <Link href="/templates" className="ds-btn ds-btn-primary mt-5">
                  Browse templates
                </Link>
              </div>
            )}
          </section>
        </div>
      </main>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out of mtverse?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to access your account and downloads.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={signingOut}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                void handleLogout()
              }}
              disabled={signingOut}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {signingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PublicLayout>
  )
}