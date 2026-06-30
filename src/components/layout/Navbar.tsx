'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Moon,
  PackageCheck,
  Search,
  Sparkles,
  Sun,
  User,
  X,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { fetchSiteSearch, type SiteSearchResult } from '@/lib/site-search'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
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

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Prompts', href: '/prompts' },
  { name: 'Templates', href: '/templates' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Blog', href: '/blog' },
]

const DEFAULT_USER_AVATAR = '/default-3d-avatar.jpg'

type NavUser = {
  email: string
  name?: string | null
  image?: string | null
}

function getDisplayName(user: NavUser) {
  return user.name?.trim() || user.email.split('@')[0]
}

function UserAvatar({ user, size = 'sm' }: { user: NavUser; size?: 'sm' | 'md' | 'lg' }) {
  const [imageFailed, setImageFailed] = useState(false)
  const imageUrl = user.image && !imageFailed ? user.image : DEFAULT_USER_AVATAR
  const sizeClass = size === 'lg' ? 'h-12 w-12' : size === 'md' ? 'h-10 w-10' : 'h-8 w-8'

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 overflow-hidden rounded-full border border-border bg-muted shadow-sm ring-2 ring-background',
        sizeClass
      )}
      aria-hidden="true"
    >
      <Image
        src={imageUrl}
        alt=""
        fill
        sizes={size === 'lg' ? '48px' : size === 'md' ? '40px' : '32px'}
        className="object-cover"
        onError={() => setImageFailed(true)}
        unoptimized
      />
    </span>
  )
}

export default function Navbar({ promptCount }: { promptCount?: number }) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { user, authenticated, loading, signOut } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [searchResults, setSearchResults] = useState<SiteSearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    const query = searchValue.trim()

    if (!searchOpen || query.length < 2) {
      setSearchResults([])
      setSearchLoading(false)
      setSearchError(false)
      return
    }

    const controller = new AbortController()
    const timeout = window.setTimeout(() => {
      setSearchLoading(true)
      setSearchError(false)

      fetchSiteSearch(query, 8, controller.signal)
        .then((results) => {
          if (!controller.signal.aborted) {
            setSearchResults(results)
            setSearchError(false)
          }
        })
        .catch((error: unknown) => {
          if (!controller.signal.aborted && (!(error instanceof Error) || error.name !== 'AbortError')) {
            setSearchResults([])
            setSearchError(true)
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearchLoading(false)
        })
    }, 180)

    return () => {
      controller.abort()
      window.clearTimeout(timeout)
    }
  }, [searchOpen, searchValue])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [userMenuOpen])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const activeElement = document.activeElement?.tagName
      const isTyping = activeElement === 'INPUT' || activeElement === 'TEXTAREA'

      if (e.key === '/' && !isTyping) {
        e.preventDefault()
        setSearchOpen(true)
      }

      if (e.key === 'Escape') {
        setSearchOpen(false)
        setSearchResults([])
        setUserMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  function closeSearch() {
    setSearchOpen(false)
    setSearchValue('')
    setSearchResults([])
    setSearchError(false)
    setSearchLoading(false)
  }

  function openSearchResult(result: SiteSearchResult) {
    router.push(result.href)
    closeSearch()
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = searchValue.trim()
    if (!q) return

    const firstResult = searchResults[0]
    router.push(firstResult ? firstResult.href : `/templates?search=${encodeURIComponent(q)}`)
    closeSearch()
  }

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

  const displayName = user ? getDisplayName(user) : ''

  return (
    <>
      <header className="sticky top-0 z-[900] h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="mx-auto flex h-full max-w-[1920px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex shrink-0 items-center gap-2">
            <Image
              src="/SiteLogo.png"
              alt="mtverse"
              width={32}
              height={32}
              className="rounded-lg transition-transform group-hover:scale-105"
            />
            <span className="hidden text-base font-bold tracking-tight sm:inline-block">mtverse</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary/10 text-primary-700 dark:text-primary-300'
                      : 'text-muted-foreground hover:bg-accent/70 hover:text-foreground'
                  )}
                >
                  {link.name}
                  {link.name === 'Prompts' && typeof promptCount === 'number' ? (
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {promptCount}
                    </span>
                  ) : null}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="relative hidden items-center sm:flex">
              <AnimatePresence mode="wait" initial={false}>
                {searchOpen ? (
                  <motion.form
                    key="search-open"
                    onSubmit={handleSearchSubmit}
                    initial={{ width: 40, opacity: 0 }}
                    animate={{ width: 340, opacity: 1 }}
                    exit={{ width: 40, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="relative flex h-9 items-center gap-1.5 rounded-full border border-primary-300 bg-background pl-3 pr-1.5 shadow-sm"
                  >
                    <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                      ref={searchInputRef}
                      type="search"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder="Search prompts and templates..."
                      className="w-full flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                    <kbd className="hidden h-5 select-none items-center rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground md:inline-flex">
                      ESC
                    </kbd>
                    <button
                      type="button"
                      onClick={closeSearch}
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                      aria-label="Close search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>

                    {searchValue.trim().length >= 2 ? (
                      <div className="absolute right-0 top-11 z-[950] w-full overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl ring-1 ring-black/5">
                        <div className="max-h-[420px] overflow-y-auto p-2">
                          {searchLoading ? (
                            <div className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Searching mtverse...
                            </div>
                          ) : searchError ? (
                            <div className="rounded-xl px-3 py-3 text-sm text-rose-600">Search is temporarily unavailable.</div>
                          ) : searchResults.length ? (
                            <div className="space-y-1">
                              {searchResults.map((result) => (
                                <button
                                  key={result.id}
                                  type="button"
                                  onMouseDown={(event) => event.preventDefault()}
                                  onClick={() => openSearchResult(result)}
                                  className="group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                                >
                                  <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary">
                                    {result.type === 'template' ? <LayoutDashboard className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="flex items-center gap-2">
                                      <span className="truncate text-sm font-semibold text-foreground">{result.title}</span>
                                      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{result.badge}</span>
                                    </span>
                                    <span className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-foreground">{result.description}</span>
                                  </span>
                                  <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-xl px-3 py-3 text-sm text-muted-foreground">No results found. Press Enter to search prompts.</div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </motion.form>
                ) : (
                  <motion.button
                    key="search-closed"
                    onClick={() => setSearchOpen(true)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-flex h-9 items-center gap-2 rounded-full border border-input bg-background px-3 text-sm text-muted-foreground transition-all hover:border-primary-300 hover:text-foreground"
                    aria-label="Open search"
                  >
                    <Search className="h-4 w-4" />
                    <span className="hidden lg:inline">Search...</span>
                    <kbd className="hidden h-5 select-none items-center rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground lg:inline-flex">
                      /
                    </kbd>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-input bg-background text-muted-foreground transition-all hover:bg-accent/70 hover:text-foreground"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {mounted && theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {loading ? (
              <div className="hidden items-center gap-2 md:flex">
                <div className="h-9 w-24 animate-pulse rounded-full bg-muted/70" />
              </div>
            ) : authenticated && user ? (
              <div ref={userMenuRef} className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen((open) => !open)}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2 text-sm font-medium shadow-sm transition-all hover:border-primary/40 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label="User menu"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                >
                  <UserAvatar user={user} />
                  <span className="hidden max-w-[120px] truncate xl:inline">{displayName}</span>
                  <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', userMenuOpen && 'rotate-180')} />
                </button>

                {userMenuOpen ? (
                  <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-lg border border-border bg-popover shadow-xl">
                    <div className="flex items-center gap-3 border-b border-border p-4">
                      <UserAvatar user={user} size="lg" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{displayName}</div>
                        <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                    <div className="grid gap-1 p-2">
                      <div className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                        <CheckCircle2 className="h-4 w-4" />
                        Signed in securely
                      </div>
                      <Link
                        href="/account"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Account settings
                      </Link>
                      <Link
                        href="/account#library"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <PackageCheck className="h-4 w-4" />
                        Template library
                      </Link>
                      <Link
                        href="/templates"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Browse templates
                      </Link>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false)
                          setShowLogoutConfirm(true)
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link
                  href="/sign-in"
                  className="inline-flex h-9 items-center rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Sign in
                </Link>
                <Link href="/sign-up" className="ds-btn ds-btn-primary ds-btn-sm">
                  Get started
                </Link>
              </div>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <button
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-input bg-background text-foreground md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="flex w-[300px] flex-col p-0 sm:w-[360px]">
                <div className="flex items-center justify-between border-b border-border bg-[var(--ds-bg-sunken)] px-5 py-4">
                  <SheetTitle className="flex items-center gap-2">
                    <Image src="/SiteLogo.png" alt="mtverse" width={28} height={28} className="rounded-md" />
                    <span className="text-base font-bold tracking-tight">mtverse</span>
                  </SheetTitle>
                  <SheetClose asChild>
                    <button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent" aria-label="Close menu">
                      <X className="h-4 w-4" />
                    </button>
                  </SheetClose>
                </div>

                <div className="space-y-1 px-4 py-4">
                  {NAV_LINKS.map((link) => {
                    const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
                    return (
                      <SheetClose asChild key={link.href}>
                        <Link
                          href={link.href}
                          className={cn(
                            'flex items-center justify-between rounded-lg border px-4 py-3 text-base font-medium transition-all',
                            isActive
                              ? 'border-primary/20 bg-primary/10 text-primary-700 dark:text-primary-300'
                              : 'border-transparent text-foreground hover:bg-accent'
                          )}
                        >
                          <span>{link.name}</span>
                          {link.name === 'Prompts' && typeof promptCount === 'number' ? (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{promptCount}</span>
                          ) : null}
                        </Link>
                      </SheetClose>
                    )
                  })}
                </div>

                <div className="px-4 pb-4">
                  <SheetClose asChild>
                    <Link
                      href="/prompts"
                      className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm text-muted-foreground transition-all hover:bg-accent"
                    >
                      <Search className="h-4 w-4" />
                      Search prompts and templates
                    </Link>
                  </SheetClose>
                </div>

                <div className="mt-auto border-t border-border px-4 pb-6 pt-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : authenticated && user ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 rounded-lg bg-[var(--ds-bg-sunken)] p-3">
                        <UserAvatar user={user} size="md" />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">{displayName}</div>
                          <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                      <SheetClose asChild>
                        <Link href="/account" className="ds-btn ds-btn-secondary w-full">
                          <User className="h-4 w-4" />
                          My account
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/account#library" className="ds-btn ds-btn-secondary w-full">
                          <PackageCheck className="h-4 w-4" />
                          Template library
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <button
                          onClick={() => setShowLogoutConfirm(true)}
                          className="ds-btn ds-btn-ghost w-full text-rose-600 dark:text-rose-400"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      </SheetClose>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <SheetClose asChild>
                        <Link href="/sign-in" className="ds-btn ds-btn-secondary w-full">
                          Sign in
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/sign-up" className="ds-btn ds-btn-primary w-full">
                          <Sparkles className="h-4 w-4" />
                          Get started
                        </Link>
                      </SheetClose>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out of mtverse?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to access your account, purchased templates, and saved templates.
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
    </>
  )
}

