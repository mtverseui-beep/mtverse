# 🔧 OAuth Redirect URI Fix - Google & GitHub

## 🚨 Problems Found:

### Problem 1: `redirect_uri is not associated with this application`
- Google OAuth Console-ல authorized redirect URIs சரியா configure பண்ணல

### Problem 2: `Error 400: redirect_uri_mismatch`
- NEXTAUTH_URL environment variable vs actual callback URL mismatch

---

## ✅ SOLUTION

### Step 1: Check Your Current Environment

Run this command to see your current NEXTAUTH_URL:
```bash
# Windows PowerShell
type .env | findstr "NEXTAUTH_URL"

# Or check .env file manually
```

**Current value:** `NEXTAUTH_URL=https://www.mtverse.dev`

### Step 2: Update Google OAuth Console

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/apis/credentials
   - Select your project

2. **Find your OAuth 2.0 Client ID**
   - Click on your OAuth client (the one matching your GOOGLE_CLIENT_ID)

3. **Add Authorized Redirect URIs:**

   **For Production:**
   ```
   https://www.mtverse.dev/api/auth/callback/google
   https://mtverse.dev/api/auth/callback/google
   ```

   **For Development:**
   ```
   http://localhost:3000/api/auth/callback/google
   http://127.0.0.1:3000/api/auth/callback/google
   ```

4. **Save Changes**

### Step 3: Update GitHub OAuth App (if using GitHub login)

1. **Go to GitHub OAuth Apps:**
   - Visit: https://github.com/settings/developers
   - Click on your OAuth App

2. **Set Authorization callback URL:**

   **For Production:**
   ```
   https://www.mtverse.dev/api/auth/callback/github
   ```

   **For Development:**
   ```
   http://localhost:3000/api/auth/callback/github
   ```

3. **Update application**

### Step 4: Verify Environment Variables

Make sure your `.env` file has correct values:

```env
# Production
NEXTAUTH_URL=https://www.mtverse.dev
AUTH_URL=https://www.mtverse.dev
NEXT_PUBLIC_SITE_URL=https://www.mtverse.dev

# Development (use .env.local)
NEXTAUTH_URL=http://localhost:3000
AUTH_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# OAuth Credentials
NEXTAUTH_SECRET=your-secret-here-min-32-chars
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

---

## 📋 CORRECT REDIRECT URIs

### NextAuth.js Default Callback Pattern:
```
{NEXTAUTH_URL}/api/auth/callback/{provider}
```

### Your URLs should be:

| Environment | Provider | Redirect URI |
|------------|----------|--------------|
| Production | Google | `https://www.mtverse.dev/api/auth/callback/google` |
| Production | GitHub | `https://www.mtverse.dev/api/auth/callback/github` |
| Development | Google | `http://localhost:3000/api/auth/callback/google` |
| Development | GitHub | `http://localhost:3000/api/auth/callback/github` |

---

## 🔍 How to Verify Redirect URI

### Test in Browser:

1. **Start OAuth flow:**
   ```
   http://localhost:3000/api/auth/signin/google
   ```

2. **Check the redirect_uri in URL:**
   - After clicking "Sign in with Google"
   - Look at the browser address bar
   - You'll see: `...&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fgoogle`

3. **Decoded URL should match:**
   ```
   http://localhost:3000/api/auth/callback/google
   ```

### Check Console Logs:

Add this temporarily to `src/lib/auth/oauth.ts`:

```typescript
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
  debug: true, // Enable debug mode
  callbacks: {
    // ... existing callbacks
  },
}
```

---

## 🔧 Quick Fix for Current Environment

### Option 1: Use Environment-Specific Config

Create separate env files:

**`.env.local` (for development):**
```env
NEXTAUTH_URL=http://localhost:3000
AUTH_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-dev-client-id
GOOGLE_CLIENT_SECRET=your-dev-client-secret
```

**`.env.production` (for production):**
```env
NEXTAUTH_URL=https://www.mtverse.dev
AUTH_URL=https://www.mtverse.dev
NEXT_PUBLIC_SITE_URL=https://www.mtverse.dev
GOOGLE_CLIENT_ID=your-prod-client-id
GOOGLE_CLIENT_SECRET=your-prod-client-secret
```

### Option 2: Auto-Detect URL (Recommended)

Update `src/lib/auth/oauth.ts`:

```typescript
import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'

// Auto-detect base URL
function getBaseUrl() {
  // Production
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  // Explicitly set
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  
  // Development
  return `http://localhost:${process.env.PORT || 3000}`
}

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
          redirect_uri: `${getBaseUrl()}/api/auth/callback/google`, // Explicit redirect
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
        params: { 
          scope: 'read:user user:email',
          redirect_uri: `${getBaseUrl()}/api/auth/callback/github`, // Explicit redirect
        },
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
    async redirect({ url, baseUrl }) {
      // Handle relative URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Handle same origin URLs
      if (new URL(url).origin === baseUrl) return url
      // Default to base URL
      return baseUrl
    },
  },
}
```

---

## ⚠️ Common Mistakes

### ❌ Wrong:
```
https://www.mtverse.dev/api/auth/google  // Missing /callback/
http://localhost:3000/auth/callback/google  // Missing /api/
https://mtverse.dev/api/auth/callback/  // Missing provider name
```

### ✅ Correct:
```
https://www.mtverse.dev/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

---

## 🧪 Testing Steps

### 1. Check Google Console Setup:
- [ ] Visit https://console.cloud.google.com/apis/credentials
- [ ] Select your OAuth client
- [ ] Verify redirect URIs are added
- [ ] Save if changed

### 2. Check Environment Variables:
```bash
# Check .env file
type .env | findstr "NEXTAUTH_URL"
type .env | findstr "GOOGLE_CLIENT_ID"

# Verify values are correct
```

### 3. Restart Development Server:
```bash
# Kill existing server
Ctrl+C

# Clear Next.js cache
rmdir /s /q .next

# Restart
npm run dev
```

### 4. Test OAuth Flow:
- [ ] Visit http://localhost:3000/sign-in
- [ ] Click "Sign in with Google"
- [ ] Should redirect to Google login
- [ ] After login, should redirect back successfully
- [ ] No more "redirect_uri mismatch" error

---

## 📊 Debugging Checklist

If still not working:

- [ ] **Google Console:**
  - Correct project selected?
  - OAuth client ID matches GOOGLE_CLIENT_ID in .env?
  - Redirect URIs saved properly?
  - OAuth consent screen configured?

- [ ] **Environment Variables:**
  - NEXTAUTH_URL matches actual domain?
  - No typos in URLs?
  - No extra spaces in .env values?
  - NEXTAUTH_SECRET is set (min 32 characters)?

- [ ] **Code:**
  - Next.js server restarted after .env changes?
  - .next folder cleared?
  - Using correct environment (.env vs .env.local)?

- [ ] **Network:**
  - HTTPS in production?
  - Domain pointing to correct server?
  - Firewall/proxy not blocking OAuth?

---

## 🎯 Summary

இப்போ fix செய்யணும்:

1. **Google Console**-ல redirect URIs add பண்ணுங்க:
   - `https://www.mtverse.dev/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google`

2. **GitHub Settings**-ல callback URL set பண்ணுங்க:
   - `https://www.mtverse.dev/api/auth/callback/github`

3. **Environment Variables** verify பண்ணுங்க:
   - `.env` file-ல NEXTAUTH_URL correct ஆ இருக்கா

4. **Server Restart** பண்ணுங்க:
   ```bash
   npm run dev
   ```

5. **Test** பண்ணுங்க:
   - Sign in with Google try பண்ணுங்க
   - Error இல்லாம login ஆகணும்

Done! 🎉
