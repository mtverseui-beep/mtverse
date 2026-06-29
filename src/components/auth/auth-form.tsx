'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn as signInWithProvider } from 'next-auth/react'
import { ArrowRight, Mail, Lock, Sparkles, Check, Loader2, Eye, EyeOff, AlertCircle, User } from 'lucide-react'
import { toast } from 'sonner'
import { Reveal } from '@/components/design-system/animations'
import { Blob } from '@/components/design-system/backgrounds'
import { useAuth } from '@/hooks/use-auth'

type AuthMode = 'sign-in' | 'sign-up' | 'forgot-password' | 'reset-password'

type Props = {
  mode: AuthMode
  resetToken?: string
}

const COPY: Record<AuthMode, {
  eyebrow: string
  title: string
  subtitle: string
  button: string
  footer: string
  footerLink: string
  footerHref: string
  showName: boolean
  showEmail: boolean
  showPassword: boolean
  showConfirmPassword: boolean
}> = {
  'sign-in': {
    eyebrow: 'Welcome back',
    title: 'Sign in to your account',
    subtitle: 'Continue where you left off',
    button: 'Sign in',
    footer: "Don't have an account?",
    footerLink: 'Sign up',
    footerHref: '/sign-up',
    showName: false,
    showEmail: true,
    showPassword: true,
    showConfirmPassword: false,
  },
  'sign-up': {
    eyebrow: 'Get started',
    title: 'Create your account',
    subtitle: 'Start collecting prompts and templates today',
    button: 'Create account',
    footer: 'Already have an account?',
    footerLink: 'Sign in',
    footerHref: '/sign-in',
    showName: true,
    showEmail: true,
    showPassword: true,
    showConfirmPassword: false,
  },
  'forgot-password': {
    eyebrow: 'Reset password',
    title: 'Forgot your password?',
    subtitle: 'Enter your email and we will send you a reset link',
    button: 'Send reset link',
    footer: 'Remember your password?',
    footerLink: 'Sign in',
    footerHref: '/sign-in',
    showName: false,
    showEmail: true,
    showPassword: false,
    showConfirmPassword: false,
  },
  'reset-password': {
    eyebrow: 'New password',
    title: 'Reset your password',
    subtitle: 'Choose a new password for your mtverse account',
    button: 'Update password',
    footer: 'Remember your password?',
    footerLink: 'Sign in',
    footerHref: '/sign-in',
    showName: false,
    showEmail: false,
    showPassword: true,
    showConfirmPassword: true,
  },
}

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter'
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number'
  return null
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function getCallbackUrl() {
  const rawNext = new URLSearchParams(window.location.search).get('next')
  return rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/'
}

function getLoadingLabel(mode: AuthMode) {
  if (mode === 'sign-in') return 'Signing in...'
  if (mode === 'sign-up') return 'Creating account...'
  if (mode === 'reset-password') return 'Updating...'
  return 'Sending...'
}

export function AuthForm({ mode, resetToken = '' }: Props) {
  const copy = COPY[mode]
  const router = useRouter()
  const { signIn: signInWithPassword, signUp } = useAuth()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [rememberMe, setRememberMe] = useState(false)
  const missingResetToken = mode === 'reset-password' && !resetToken.trim()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    if (copy.showEmail && !validateEmail(form.email)) {
      setFieldErrors({ email: 'Please enter a valid email address' })
      return
    }

    if (copy.showPassword) {
      if (!form.password) {
        setFieldErrors({ password: 'Password is required' })
        return
      }
      if (mode === 'sign-up' || mode === 'reset-password') {
        const pwError = validatePassword(form.password)
        if (pwError) {
          setFieldErrors({ password: pwError })
          return
        }
      }
      if (copy.showConfirmPassword && form.password !== form.confirmPassword) {
        setFieldErrors({ confirmPassword: 'Passwords do not match' })
        return
      }
    }

    if (copy.showName && form.name.trim().length < 2) {
      setFieldErrors({ name: 'Please enter your name' })
      return
    }

    if (missingResetToken) {
      setError('This reset link is missing a token. Please request a new password reset link.')
      return
    }

    setLoading(true)

    try {
      if (mode === 'sign-in') {
        const result = await signInWithPassword(form.email, form.password, rememberMe)
        if (!result.success) {
          setError(result.error || 'Invalid email or password')
          toast.error(result.error || 'Sign in failed')
          setLoading(false)
          return
        }
        toast.success('Welcome back!')
        router.push(getCallbackUrl())
        router.refresh()
      } else if (mode === 'sign-up') {
        const result = await signUp(form.name, form.email, form.password)
        if (!result.success) {
          setError(result.error || 'Sign up failed')
          toast.error(result.error || 'Sign up failed')
          setLoading(false)
          return
        }
        toast.success('Account created! Welcome to mtverse.')
        router.push(getCallbackUrl())
        router.refresh()
      } else if (mode === 'forgot-password') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Failed to send reset email')
          toast.error('Failed to send reset email. Try again later.')
          setLoading(false)
          return
        }
        setSuccess(true)
        toast.success('Reset link sent to your email')
        setLoading(false)
      } else if (mode === 'reset-password') {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: resetToken, password: form.password }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Failed to reset password')
          toast.error(data.error || 'Failed to reset password')
          setLoading(false)
          return
        }
        setSuccess(true)
        toast.success('Password updated successfully')
        setLoading(false)
      }
    } catch {
      setError('Network error. Please try again.')
      toast.error('Network error. Please try again.')
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
              <Image src="/SiteLogo.png" alt="mtverse" width={36} height={36} className="rounded-lg" />
              <span className="text-lg font-bold tracking-tight">mtverse</span>
            </Link>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="ds-card p-8">
              <div className="text-center mb-6">
                <span className="ds-eyebrow ds-eyebrow-accent mb-3">{copy.eyebrow}</span>
                <h1 className="ds-h1 mb-2">{copy.title}</h1>
                <p className="text-sm text-muted-foreground">{copy.subtitle}</p>
              </div>

              {(error || missingResetToken) && (
                <div className="flex items-start gap-2 p-3 mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="text-sm">
                    {error || 'This reset link is missing a token. Please request a new password reset link.'}
                  </span>
                </div>
              )}

              {success ? (
                <div className="text-center py-8 space-y-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    <Check className="h-6 w-6" />
                  </div>
                  <h2 className="ds-h3">{mode === 'reset-password' ? 'Password updated' : 'Check your email'}</h2>
                  <p className="text-sm text-muted-foreground">
                    {mode === 'reset-password' ? (
                      <>Your password has been changed. You can now sign in with the new password.</>
                    ) : (
                      <>We sent a reset link to <strong>{form.email}</strong>. Check your inbox and follow the link to reset your password.</>
                    )}
                  </p>
                  {mode === 'reset-password' ? (
                    <Link href="/sign-in" className="ds-btn ds-btn-primary mt-4">
                      Sign in
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {copy.showName && (
                    <div>
                      <label className="block text-sm font-medium mb-1.5" htmlFor="name">
                        Full name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          id="name"
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="Jane Doe"
                          className="ds-input pl-10"
                        />
                      </div>
                      {fieldErrors.name && <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>}
                    </div>
                  )}

                  {copy.showEmail && (
                    <div>
                      <label className="block text-sm font-medium mb-1.5" htmlFor="email">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          id="email"
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="you@example.com"
                          className="ds-input pl-10"
                        />
                      </div>
                      {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
                    </div>
                  )}

                  {copy.showPassword && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-sm font-medium" htmlFor="password">
                          {mode === 'reset-password' ? 'New password' : 'Password'}
                        </label>
                        {mode === 'sign-in' && (
                          <Link href="/forgot-password" className="text-xs text-primary-600 hover:underline">
                            Forgot?
                          </Link>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          placeholder={mode === 'reset-password' ? 'New password' : 'Password'}
                          className="ds-input pl-10 pr-10"
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
                      {fieldErrors.password && <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>}
                      {(mode === 'sign-up' || mode === 'reset-password') && (
                        <p className="text-xs text-muted-foreground mt-1.5">
                          Min 8 characters, 1 uppercase, 1 number
                        </p>
                      )}
                    </div>
                  )}

                  {copy.showConfirmPassword && (
                    <div>
                      <label className="block text-sm font-medium mb-1.5" htmlFor="confirmPassword">
                        Confirm password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={form.confirmPassword}
                          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                          placeholder="Confirm new password"
                          className="ds-input pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {fieldErrors.confirmPassword && <p className="text-xs text-red-600 mt-1">{fieldErrors.confirmPassword}</p>}
                    </div>
                  )}

                  {mode === 'sign-in' && (
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background/70 p-3 text-sm transition-colors hover:bg-accent/40">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-border accent-primary-600"
                      />
                      <span>
                        <span className="block font-medium text-foreground">Remember me on this device</span>
                        <span className="block text-xs text-muted-foreground">Keep this browser signed in for 30 days.</span>
                      </span>
                    </label>
                  )}

                  <button type="submit" disabled={loading || missingResetToken} className="ds-btn ds-btn-primary w-full">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {getLoadingLabel(mode)}
                      </>
                    ) : (
                      <>
                        {copy.button}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {(mode === 'sign-in' || mode === 'sign-up') && !success && (
                <>
                  <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">or continue with</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setLoading(true)
                        signInWithProvider('github', { callbackUrl: getCallbackUrl() }).catch(() => {
                          setLoading(false)
                          toast.error('GitHub sign-in failed')
                        })
                      }}
                      disabled={loading}
                      className="ds-btn ds-btn-secondary"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                      </svg>
                      GitHub
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoading(true)
                        signInWithProvider('google', { callbackUrl: getCallbackUrl() }).catch(() => {
                          setLoading(false)
                          toast.error('Google sign-in failed')
                        })
                      }}
                      disabled={loading}
                      className="ds-btn ds-btn-secondary"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Google
                    </button>
                  </div>
                </>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="text-center text-sm text-muted-foreground mt-6">
              {copy.footer}{' '}
              <Link href={copy.footerHref} className="font-medium text-primary-600 hover:underline inline-flex items-center gap-1">
                {copy.footerLink}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="flex items-center justify-center gap-4 mt-8 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Free to start
              </span>
              <span>-</span>
              <span>No credit card required</span>
              <span>-</span>
              <span>Cancel anytime</span>
            </div>
          </Reveal>
        </div>
      </div>
    </main>
  )
}