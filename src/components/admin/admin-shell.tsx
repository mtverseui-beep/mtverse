'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  LayoutDashboard,
  MessageSquare,
  LayoutGrid,
  Receipt,
  Download,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Sun,
  Moon,
  ChevronLeft,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

const NAV_SECTIONS: Array<{
  title: string
  items: Array<{ name: string; href: string; icon: React.ComponentType<{ className?: string }> }>
}> = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Content',
    items: [
      { name: 'Prompts', href: '/admin/prompts', icon: MessageSquare },
      { name: 'Templates', href: '/admin/templates', icon: LayoutGrid },
    ],
  },
  {
    title: 'Business',
    items: [
      { name: 'Orders', href: '/admin/orders', icon: Receipt },
      { name: 'Downloads', href: '/admin/downloads', icon: Download },
      { name: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
      { name: 'Users', href: '/admin/users', icon: Users },
      { name: 'Auth logs', href: '/admin/auth-logs', icon: ShieldAlert },
    ],
  },
  {
    title: 'System',
    items: [
      { name: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
]

export function AdminShell({ children, userEmail }: { children: React.ReactNode; userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin-login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[var(--ds-bg-sunken)]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-[var(--ds-bg-raised)] border-r border-border flex flex-col transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand */}
        <div className="h-16 flex items-center gap-2 px-5 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2 group">
            <Image
              src="/SiteLogo.png"
              alt="mtverse"
              width={28}
              height={28}
              className="rounded-md transition-transform group-hover:scale-110"
            />
            <span className="text-sm font-bold tracking-tight">mtverse admin</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-muted-foreground hover:text-foreground"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          active
                            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View live site
          </Link>
        </div>
      </aside>

      {/* Main column */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-[var(--ds-bg-raised)]/80 backdrop-blur-xl border-b border-border flex items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/admin" className="hover:text-foreground">Admin</Link>
              <ChevronLeft className="h-3 w-3 rotate-180" />
              <span className="text-foreground font-medium capitalize">
                {pathname === '/admin' ? 'Dashboard' : pathname.split('/admin/')[1]?.split('/')[0]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search (decorative) */}
            <div className="hidden md:flex items-center gap-2 h-9 px-3 rounded-full border border-input bg-background/60 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              <span>Search...</span>
              <kbd className="ml-2 h-5 inline-flex items-center rounded border bg-muted px-1.5 font-mono text-[10px]">K</kbd>
            </div>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-input bg-background/60 text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
            >
              {mounted && theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notifications (decorative) */}
            <button
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-input bg-background/60 text-muted-foreground hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-accent-500" />
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 transition-colors"
                aria-label="User menu"
              >
                {userEmail[0]?.toUpperCase() || 'A'}
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border bg-popover shadow-lg overflow-hidden">
                    <div className="p-3 border-b">
                      <div className="text-sm font-semibold">Admin</div>
                      <div className="text-xs text-muted-foreground truncate">{userEmail}</div>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left text-rose-600 dark:text-rose-400"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  )
}
