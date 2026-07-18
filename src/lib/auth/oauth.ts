import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { recordAuthEvent } from '@/lib/auth/auth-event-log'


const providers: NextAuthOptions['providers'] = []

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim()
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
const githubClientId = process.env.GITHUB_CLIENT_ID?.trim()
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET?.trim()

if (googleClientId && googleClientSecret) {
  providers.push(
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    })
  )
}

if (githubClientId && githubClientSecret) {
  providers.push(
    GitHubProvider({
      clientId: githubClientId,
      clientSecret: githubClientSecret,
      authorization: {
        params: { scope: 'read:user user:email' },
      },
    })
  )
}

export const authOptions: NextAuthOptions = {
  providers,
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) token.email = user.email
      if (user?.name) token.name = user.name
      if (user?.image) token.picture = user.image
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.email) session.user.email = String(token.email)
        if (token.name) session.user.name = String(token.name)
        if (token.picture) session.user.image = String(token.picture)
      }

      return session
    },
    async redirect({ url, baseUrl: callbackBaseUrl }) {
      // Handle relative URLs
      if (url.startsWith('/')) return `${callbackBaseUrl}${url}`
      // Handle same origin URLs
      if (new URL(url).origin === callbackBaseUrl) return url
      // Default to base URL
      return callbackBaseUrl
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      await recordAuthEvent({
        type: 'oauth_sign_in',
        status: 'success',
        provider: account?.provider || 'oauth',
        email: user.email || null,
        reason: isNewUser ? 'oauth_new_user' : 'oauth_sign_in',
        message: `${account?.provider || 'OAuth'} sign-in succeeded.`,
      })
    },
  },
  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',
}
