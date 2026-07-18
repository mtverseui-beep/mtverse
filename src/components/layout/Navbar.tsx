'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowUpRight,
  Blocks,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Moon,
  PackageCheck,
  Search,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const UI_LIBRARY_URL = process.env.NEXT_PUBLIC_UI_LIBRARY_URL || 'https://ui.mtverse.dev'

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Templates', href: '/templates' },
  { name: 'UI Library', href: UI_LIBRARY_URL, icon: Blocks },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Blog', href: '/blog' },
]

const DEFAULT_USER_AVATAR = '/default-3d-avatar.jpg'
const DRAWER_ID = 'mtverse-mobile-navigation'
const AUTH_NEXT_BLOCKED_PATHS = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password', '/admin-login', '/api']

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

function getCurrentAuthNextPath() {
  if (typeof window === 'undefined') return '/'
  const pathname = window.location.pathname || '/'
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/'
  const isBlocked = AUTH_NEXT_BLOCKED_PATHS.some((path) => normalizedPathname === path || normalizedPathname.startsWith(`${path}/`))
  if (isBlocked) return '/account'
  return `${pathname}${window.location.search}${window.location.hash}`
}

function getAuthHref(path: '/sign-in' | '/sign-up', nextPath: string) {
  return `${path}?next=${encodeURIComponent(nextPath || '/')}`
}

function isRouteActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const { user, authenticated, loading, signOut } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [searchResults, setSearchResults] = useState<SiteSearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [authNextPath, setAuthNextPath] = useState('/')

  const tickingRef = useRef(false)
  const lastScrolledRef = useRef(false)
  const mobileWasOpenRef = useRef(false)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const handleScroll = () => {
      if (tickingRef.current) return
      tickingRef.current = true
      window.requestAnimationFrame(() => {
        const nextScrolled = window.scrollY > 20
        if (nextScrolled !== lastScrolledRef.current) {
          lastScrolledRef.current = nextScrolled
          setIsScrolled(nextScrolled)
        }
        tickingRef.current = false
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setAuthNextPath(getCurrentAuthNextPath())
    setMobileMenuOpen(false)
    setSearchOpen(false)
    setUserMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [mobileMenuOpen])

  useEffect(() => {
    if (mobileMenuOpen) {
      mobileWasOpenRef.current = true
      const timer = window.setTimeout(() => firstMobileLinkRef.current?.focus(), 180)
      return () => window.clearTimeout(timer)
    }
    if (mobileWasOpenRef.current) {
      mobileWasOpenRef.current = false
      hamburgerRef.current?.focus()
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    if (loading || !authenticated) return
    const toastKind = window.sessionStorage.getItem('mtverse:auth-success-toast')
    if (!toastKind) return
    window.sessionStorage.removeItem('mtverse:auth-success-toast')
    if (toastKind === 'sign-up') {
      toast.success('Account created successfully', { description: 'You are signed in now.' })
      return
    }
    toast.success('Logged in successfully', { description: 'Welcome back to mtverse.' })
  }, [authenticated, loading])

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    const query = searchValue.trim()
    if ((!searchOpen && !mobileMenuOpen) || query.length < 2) {
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
  }, [mobileMenuOpen, searchOpen, searchValue])

  useEffect(() => {
    if (!userMenuOpen) return
    const handleClick = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [userMenuOpen])

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const tag = document.activeElement?.tagName
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA'
      if (event.key === '/' && !isTyping && !mobileMenuOpen) {
        event.preventDefault()
        setSearchOpen(true)
      }
      if (event.key === 'Escape') {
        setSearchOpen(false)
        setSearchResults([])
        setUserMenuOpen(false)
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [mobileMenuOpen])

  const closeSearch = useCallback(() => {
    setSearchOpen(false)
    setSearchValue('')
    setSearchResults([])
    setSearchError(false)
    setSearchLoading(false)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])

  function openSearchResult(result: SiteSearchResult) {
    router.push(result.href)
    setMobileMenuOpen(false)
    closeSearch()
  }

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault()
    const query = searchValue.trim()
    if (!query) return
    const firstResult = searchResults[0]
    router.push(firstResult ? firstResult.href : `/templates?search=${encodeURIComponent(query)}`)
    setMobileMenuOpen(false)
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
  const signInHref = getAuthHref('/sign-in', authNextPath)
  const signUpHref = getAuthHref('/sign-up', authNextPath)
  const authPending = !mounted || loading
  const compact = isScrolled
  return (
    <>
      <header className={cn('sticky top-0 z-[900] h-20 transition-[padding] duration-500 ease-out', compact ? 'px-3 py-3 sm:px-4' : 'px-0 py-0')}>
        <nav
          aria-label="Primary navigation"
          className={cn(
            'relative mx-auto transition-[max-width,background-color,border-color,border-radius,box-shadow,backdrop-filter] duration-500 ease-out',
            compact || mobileMenuOpen
              ? 'max-w-[1200px] rounded-2xl border border-foreground/10 bg-background/85 shadow-lg shadow-black/[0.06] backdrop-blur-xl dark:shadow-black/30'
              : 'max-w-[1400px] border border-transparent bg-transparent'
          )}
        >
          <div className={cn('flex items-center justify-between gap-3 px-4 transition-[height,padding] duration-500 ease-out sm:px-6 lg:px-8', compact ? 'h-14' : 'h-20')}>
            <Link href="/" className="group flex min-w-0 shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40" aria-label="mtverse home">
              <Image
                src="/SiteLogo.png"
                alt=""
                width={32}
                height={32}
                priority
                className={cn('rounded-lg transition-[width,height,transform] duration-500 group-hover:scale-105', compact ? 'h-7 w-7' : 'h-8 w-8')}
              />
              <span className={cn('font-bold tracking-normal transition-[font-size] duration-500', compact ? 'text-lg' : 'text-xl')}>mtverse</span>
            </Link>

            <div className="hidden items-center gap-7 lg:flex">
              {NAV_LINKS.map((link) => {
                const active = isRouteActive(pathname, link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group relative rounded-sm text-sm font-medium tracking-normal transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40',
                      active ? 'text-foreground' : 'text-foreground/65 hover:text-foreground'
                    )}
                  >
                    {link.name}
                    <span className={cn('absolute -bottom-1 left-0 h-px bg-foreground transition-[width] duration-300', active ? 'w-full' : 'w-0 group-hover:w-full')} />
                  </Link>
                )
              })}
            </div>

            <div className="flex min-w-0 items-center gap-2">
              <div className="relative hidden items-center lg:flex">
                <AnimatePresence mode="wait" initial={false}>
                  {searchOpen ? (
                    <motion.form
                      key="search-open"
                      onSubmit={handleSearchSubmit}
                      initial={{ width: compact ? 32 : 36, opacity: 0, scale: 0.96 }}
                      animate={{ width: compact ? 280 : 320, opacity: 1 }}
                      exit={{ width: compact ? 32 : 36, opacity: 0, scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
                      className="relative flex h-9 items-center gap-1.5 rounded-full border border-foreground/15 bg-background/95 pl-3 pr-1.5 shadow-lg shadow-black/[0.06] ring-1 ring-foreground/[0.04] backdrop-blur-xl"
                    >
                      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <input
                        ref={searchInputRef}
                        type="search"
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                        placeholder="Search templates..."
                        className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                      />
                      <kbd className="hidden h-5 select-none items-center rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground xl:inline-flex">ESC</kbd>
                      <button type="button" onClick={closeSearch} className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" aria-label="Close search">
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <DesktopSearchResults query={searchValue} loading={searchLoading} error={searchError} results={searchResults} onSelect={openSearchResult} />
                    </motion.form>
                  ) : (
                    <motion.button
                      key="search-closed"
                      type="button"
                      onClick={() => setSearchOpen(true)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className={cn('inline-flex items-center justify-center rounded-full border border-foreground/15 bg-background/70 text-foreground/65 shadow-sm transition-colors hover:border-foreground/35 hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40', compact ? 'h-8 w-8' : 'h-9 w-9')}
                      aria-label="Search templates"
                      title="Search templates (/)"
                    >
                      <Search className="h-4 w-4" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className={cn('inline-flex items-center justify-center rounded-full border border-foreground/15 text-foreground transition-[width,height,border-color,background-color] duration-500 hover:border-foreground/40 hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40', compact ? 'h-8 w-8' : 'h-9 w-9')}
                aria-label={resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              >
                {!mounted ? <Sun className="h-4 w-4 opacity-50" /> : resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <div className="hidden lg:block">
                {authPending ? (
                  <div className={cn('animate-pulse rounded-full bg-muted/70', compact ? 'h-8 w-8' : 'h-9 w-9')} />
                ) : authenticated && user ? (
                  <div ref={userMenuRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setUserMenuOpen((open) => !open)}
                      className={cn(
                        'relative inline-flex items-center justify-center rounded-full bg-background outline-none transition-[box-shadow,opacity] hover:opacity-90 focus-visible:ring-2 focus-visible:ring-foreground/40',
                        compact ? 'h-8 w-8' : 'h-9 w-9'
                      )}
                      aria-label="Open account menu"
                      aria-haspopup="menu"
                      aria-expanded={userMenuOpen}
                    >
                      <UserAvatar user={user} />
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500" />
                    </button>
                    <UserMenu open={userMenuOpen} user={user} displayName={displayName} onClose={() => setUserMenuOpen(false)} onSignOut={() => { setUserMenuOpen(false); setShowLogoutConfirm(true) }} />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href={signInHref} className={cn('inline-flex items-center text-foreground/65 transition-all hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40', compact ? 'h-8 px-2 text-xs' : 'h-9 px-3 text-sm')}>Sign in</Link>
                    <Link href={signUpHref} className={cn('inline-flex items-center justify-center rounded-full bg-foreground font-medium text-background transition-all hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background', compact ? 'h-8 px-4 text-xs' : 'h-10 px-5 text-sm')}>Get started</Link>
                  </div>
                )}
              </div>

              {!authPending && authenticated && user ? (
                <Link href="/account" className="relative inline-flex h-9 w-9 items-center justify-center lg:hidden" aria-label="Open account">
                  <UserAvatar user={user} />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500" />
                </Link>
              ) : null}

              <button
                ref={hamburgerRef}
                type="button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-foreground/15 text-foreground transition-colors hover:border-foreground/35 hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 lg:hidden"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls={DRAWER_ID}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {mobileMenuOpen ? (
                    <motion.span key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.18 }}><X className="h-5 w-5" /></motion.span>
                  ) : (
                    <motion.span key="menu" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} transition={{ duration: 0.18 }}><Menu className="h-5 w-5" /></motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </nav>
      </header>
      <AnimatePresence>
        {mobileMenuOpen ? (
          <motion.div
            id={DRAWER_ID}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[880] bg-background lg:hidden"
          >
            <div className="mx-auto flex h-full w-full max-w-3xl flex-col overflow-y-auto px-5 pb-6 pt-28 sm:px-8">
              <motion.div
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.075, delayChildren: 0.08 } } }}
                className="flex flex-1 flex-col justify-center gap-5"
              >
                {NAV_LINKS.map((link, index) => {
                  const active = isRouteActive(pathname, link.href)
                  return (
                    <motion.div
                      key={link.href}
                      variants={{
                        hidden: { opacity: 0, y: 18 },
                        show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
                      }}
                    >
                      <Link
                        ref={index === 0 ? firstMobileLinkRef : undefined}
                        href={link.href}
                        target={link.href.startsWith('http') ? '_blank' : undefined}
                        rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        aria-current={active ? 'page' : undefined}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn('inline-flex rounded-md text-4xl font-bold tracking-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 sm:text-5xl', active ? 'text-foreground' : 'text-foreground/45 hover:text-foreground')}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  )
                })}

                <motion.form
                  onSubmit={handleSearchSubmit}
                  variants={{
                    hidden: { opacity: 0, y: 18 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
                  }}
                  className="relative mt-4"
                >
                  <div className="flex h-14 items-center gap-3 rounded-2xl border border-foreground/15 bg-foreground/[0.03] px-4 focus-within:border-foreground/35">
                    <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <input
                      type="search"
                      value={searchValue}
                      onChange={(event) => setSearchValue(event.target.value)}
                      placeholder="Search templates"
                      className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
                    />
                    {searchLoading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
                  </div>
                  <MobileSearchResults query={searchValue} error={searchError} results={searchResults} onSelect={openSearchResult} />
                </motion.form>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.42, delay: 0.3 }}
                className="border-t border-foreground/10 pt-5"
              >
                {authPending ? (
                  <div className="flex h-14 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                ) : authenticated && user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-3">
                      <UserAvatar user={user} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-foreground">{displayName}</div>
                        <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-foreground/20 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5">
                        <User className="h-4 w-4" />Account
                      </Link>
                      <button type="button" onClick={() => { setMobileMenuOpen(false); setShowLogoutConfirm(true) }} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground text-sm font-medium text-background transition-colors hover:bg-foreground/90">
                        <LogOut className="h-4 w-4" />Sign out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link href={signInHref} onClick={() => setMobileMenuOpen(false)} className="inline-flex h-12 items-center justify-center rounded-full border border-foreground/20 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5">Sign in</Link>
                    <Link href={signUpHref} onClick={() => setMobileMenuOpen(false)} className="inline-flex h-12 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background transition-colors hover:bg-foreground/90">Get started</Link>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out of mtverse?</AlertDialogTitle>
            <AlertDialogDescription>You will need to sign in again to access your account, purchased templates, and saved templates.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={signingOut}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => { event.preventDefault(); void handleLogout() }}
              disabled={signingOut}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {signingOut ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing out...</> : <><LogOut className="mr-2 h-4 w-4" />Sign out</>}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
function DesktopSearchResults({ query, loading, error, results, onSelect }: {
  query: string
  loading: boolean
  error: boolean
  results: SiteSearchResult[]
  onSelect: (result: SiteSearchResult) => void
}) {
  if (query.trim().length < 2) return null

  return (
    <div className="absolute right-0 top-11 z-[950] w-full min-w-[320px] overflow-hidden rounded-2xl border border-foreground/10 bg-popover shadow-2xl ring-1 ring-black/5">
      <div className="max-h-[420px] overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Searching templates...</div>
        ) : error ? (
          <div className="rounded-xl px-3 py-3 text-sm text-rose-600">Search is temporarily unavailable.</div>
        ) : results.length ? (
          <div className="space-y-1">
            {results.map((result) => (
              <button
                key={result.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onSelect(result)}
                className="group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
              >
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary"><LayoutDashboard className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-foreground">{result.title}</span>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-normal text-muted-foreground">{result.badge}</span>
                  </span>
                  <span className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-foreground">{result.description}</span>
                </span>
                <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-xl px-3 py-3 text-sm text-muted-foreground">No templates found. Press Enter to search the catalog.</div>
        )}
      </div>
    </div>
  )
}

function MobileSearchResults({ query, error, results, onSelect }: {
  query: string
  error: boolean
  results: SiteSearchResult[]
  onSelect: (result: SiteSearchResult) => void
}) {
  if (query.trim().length < 2 || (!error && !results.length)) return null

  return (
    <div className="mt-2 max-h-44 overflow-y-auto rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-1.5">
      {error ? (
        <div className="px-3 py-2 text-sm text-rose-600">Search is temporarily unavailable.</div>
      ) : (
        results.slice(0, 4).map((result) => (
          <button key={result.id} type="button" onClick={() => onSelect(result)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-foreground/[0.06]">
            <LayoutDashboard className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{result.title}</span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        ))
      )}
    </div>
  )
}

function UserMenu({ open, user, displayName, onClose, onSignOut }: {
  open: boolean
  user: NavUser
  displayName: string
  onClose: () => void
  onSignOut: () => void
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="menu"
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-0 top-11 z-[950] w-64 overflow-hidden rounded-2xl border border-foreground/10 bg-popover p-1.5 shadow-xl"
        >
          <div className="mb-1 flex items-center gap-3 rounded-xl bg-muted/50 p-3">
            <UserAvatar user={user} size="lg" />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{displayName}</div>
              <div className="truncate text-[11px] text-muted-foreground">{user.email}</div>
            </div>
          </div>
          <div className="grid gap-0.5">
            <Link href="/account" role="menuitem" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent" onClick={onClose}><User className="h-4 w-4 text-muted-foreground" />Account</Link>
            <Link href="/account#library" role="menuitem" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent" onClick={onClose}><PackageCheck className="h-4 w-4 text-muted-foreground" />My templates</Link>
            <Link href="/templates" role="menuitem" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent" onClick={onClose}><LayoutDashboard className="h-4 w-4 text-muted-foreground" />Browse templates</Link>
          </div>
          <div className="mt-1 border-t border-border/60 pt-1">
            <button type="button" role="menuitem" onClick={onSignOut} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20"><LogOut className="h-4 w-4" />Sign out</button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
