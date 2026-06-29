'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Mail, Lock, Eye, EyeOff, Shield, AlertCircle, Loader2 } from 'lucide-react'
import { Blob } from '@/components/design-system/backgrounds'
import { Reveal } from '@/components/design-system/animations'

function AdminLoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }
      // Success — redirect to admin
      router.push(next)
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center ds-bg-section relative overflow-hidden py-12">
      <div aria-hidden className="absolute inset-0 -z-10">
        <Blob variant="lavender" size={500} position={{ top: '-10%', left: '-10%' }} float="slow" />
        <Blob variant="peach" size={400} position={{ bottom: '-10%', right: '-10%' }} float="normal" />
      </div>

      <div className="ds-container-sm w-full px-4">
        <div className="max-w-md mx-auto">
          <Reveal>
            <Link href="/" className="flex items-center justify-center gap-2 mb-8">
              <Image
                src="/SiteLogo.png"
                alt="mtverse"
                width={36}
                height={36}
                className="rounded-lg"
              />
              <span className="text-lg font-bold tracking-tight">mtverse admin</span>
            </Link>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="ds-card p-8">
              <div className="text-center mb-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300 mb-3">
                  <Shield className="h-6 w-6" />
                </div>
                <h1 className="ds-h1 mb-2">Admin sign in</h1>
                <p className="text-sm text-muted-foreground">
                  Secure access to the mtverse admin dashboard
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" htmlFor="email">
                    Admin email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@mtverse.dev"
                      className="ds-input pl-10"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="ds-input pl-10 pr-10"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="ds-btn ds-btn-primary w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign in to dashboard
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

            </div>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="text-center text-sm text-muted-foreground mt-6">
              <Link href="/" className="hover:text-foreground hover:underline">
                ← Back to mtverse
              </Link>
            </p>
          </Reveal>
        </div>
      </div>
    </main>
  )
}
export default function AdminLoginClient() {
  return (
    <Suspense fallback={null}>
      <AdminLoginPageContent />
    </Suspense>
  )
}