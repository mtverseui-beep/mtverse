'use client'

import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react'

/**
 * Auth context - provides real customer auth state across the entire app.
 * Fetches /api/auth/me on mount, provides signIn/signUp/signOut methods.
 *
 * Key: `loading` starts as `true` on both server AND client.
 * The fetch only happens in `useEffect` (client-only), so SSR and
 * initial client render both show the loading state - preventing hydration mismatch.
 * After hydration, `useEffect` fires, fetches auth state, and updates.
 */

type User = {
  email: string
  name: string
  image?: string | null
  createdAt?: string
}

type AuthState = {
  user: User | null
  plan: string
  licenseKey: string | null
  loading: boolean // true while fetching initial auth state
  authenticated: boolean
}

type AuthContextValue = AuthState & {
  signIn: (email: string, password: string, remember?: boolean) => Promise<{ success: boolean; error?: string }>
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initial state: loading=true on both server and client (prevents hydration mismatch)
  const [state, setState] = useState<AuthState>({
    user: null,
    plan: 'free',
    licenseKey: null,
    loading: true,
    authenticated: false,
  })

  // Fetch current auth state from /api/auth/me
  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (!res.ok) {
        setState((s) => ({ ...s, user: null, authenticated: false, loading: false }))
        return
      }
      const data = await res.json()
      setState({
        user: data.authenticated ? data.user : null,
        plan: data.plan || 'free',
        licenseKey: data.licenseKey || null,
        authenticated: Boolean(data.authenticated),
        loading: false,
      })
    } catch {
      setState((s) => ({ ...s, user: null, authenticated: false, loading: false }))
    }
  }, [])

  // Fetch on mount ONLY (useEffect is client-only, runs after hydration)
  useEffect(() => {
    refresh()
  }, [refresh])

  // Sign in
  const signIn = useCallback(
    async (email: string, password: string, remember = false): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetch('/api/auth/sign-in', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password, remember }),
        })
        const data = await res.json()
        if (!res.ok || !data.success) {
          return { success: false, error: data.error || data.message || 'Invalid email or password' }
        }
        await refresh()
        return { success: true }
      } catch {
        return { success: false, error: 'Network error. Please try again.' }
      }
    },
    [refresh]
  )

  // Sign up
  const signUp = useCallback(
    async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetch('/api/auth/sign-up', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name, email, password }),
        })
        const data = await res.json()
        if (!res.ok || !data.success) {
          return { success: false, error: data.error || data.message || 'Sign up failed' }
        }
        await refresh()
        return { success: true }
      } catch {
        return { success: false, error: 'Network error. Please try again.' }
      }
    },
    [refresh]
  )

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await fetch('/api/auth/sign-out', {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // ignore - we clear local state anyway
    }
    setState({
      user: null,
      plan: 'free',
      licenseKey: null,
      loading: false,
      authenticated: false,
    })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
