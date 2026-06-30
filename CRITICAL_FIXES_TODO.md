# 🚨 7 CRITICAL ISSUES - MUST FIX BEFORE PRODUCTION

**Priority:** 🔴 CRITICAL  
**Time Required:** ~3 hours  
**Status:** Not started

---

## 1. 🔐 Admin Password Plain Text (30 min)

**Current Issue:**
```env
# .env
ADMIN_PASSWORD=arun3333456789101112131415  # ⚠️ PLAIN TEXT
```

**Risk:** If `.env` is leaked, attacker gets immediate admin access

**Fix Required:**

1. **Hash the password:**
```bash
# Run this in Node.js REPL or create a script
npm install
node -e "const crypto = require('crypto'); const scrypt = require('util').promisify(crypto.scrypt); (async () => { const hash = (await scrypt('arun3333456789101112131415', 'mtverse-admin-salt', 32)).toString('hex'); console.log('ADMIN_PASSWORD_HASH=' + hash); })()"
```

2. **Update `.env`:**
```env
ADMIN_PASSWORD_HASH=<output from above>
# Remove ADMIN_PASSWORD
```

3. **Update auth check** in `src/lib/auth/admin-session.ts` (if using direct comparison):
```typescript
// Change from:
if (password !== process.env.ADMIN_PASSWORD) return false

// To:
const hash = crypto.scrypt(password, 'mtverse-admin-salt', 32)
if (hash.toString('hex') !== process.env.ADMIN_PASSWORD_HASH) return false
```

---

## 2. 💸 No Webhook Event Deduplication (1 hour)

**Current Issue:**
```typescript
// src/app/api/payments/webhook/paddle/route.ts
// No check for duplicate event_id
// Paddle can resend webhooks → duplicate licenses
```

**Risk:** Financial loss, duplicate orders, angry customers

**Fix Required:**

1. **Track processed events in Redis:**
```typescript
// Add to webhook handler
const eventId = event.event_id
if (!eventId) {
  return NextResponse.json({ error: 'Missing event_id' }, { status: 400 })
}

// Check if already processed
const redis = getRedisClient()
const alreadyProcessed = await redis.get(`webhook:paddle:${eventId}`)
if (alreadyProcessed) {
  return NextResponse.json({ 
    received: true, 
    ignored: true, 
    reason: 'duplicate event_id' 
  })
}

// Process webhook...
await setPlan(...)
await recordTemplatePurchase(...)

// Mark as processed (30 day TTL)
await redis.setex(`webhook:paddle:${eventId}`, 30 * 24 * 60 * 60, 'processed')
```

2. **Alternative if no Redis:** Store in database with unique constraint on `event_id`

---

## 3. 📥 No Download Rate Limiting (30 min)

**Current Issue:**
```typescript
// src/app/api/download/template/[slug]/route.ts
// No rate limit → unlimited downloads
```

**Risk:** 
- DDoS attacks
- Bandwidth exhaustion
- $1000+ bandwidth bills
- Cloudflare R2 egress costs

**Fix Required:**

Add rate limit using existing infrastructure:

```typescript
// src/app/api/download/template/[slug]/route.ts
import { rateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params
  const email = await getCurrentCustomerEmail(request)
  
  if (!email) {
    return NextResponse.json({ error: 'Please sign in' }, { status: 401 })
  }

  // Add rate limit: 5 downloads per 15 minutes
  const rateLimitResult = await rateLimit(
    `download:${email}`,
    5,
    15 * 60 * 1000
  )

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { 
        error: 'Too many downloads. Please wait before downloading again.',
        retryAfter: Math.ceil(rateLimitResult.retryAfter / 1000)
      },
      { 
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rateLimitResult.retryAfter / 1000))
        }
      }
    )
  }

  // Continue with download...
}
```

**Apply to both:**
- `src/app/api/download/template/[slug]/route.ts`
- `src/app/api/download/package/[packageId]/route.ts`

---

## 4. 🌐 Missing NEXT_PUBLIC_PREVIEW_BASE_URL (5 min)

**Current Issue:**
```env
# .env
NEXT_PUBLIC_PREVIEW_BASE_URL=
```

**Impact:** Preview URLs use wrong/fallback domain

**Fix:**
```env
# .env
NEXT_PUBLIC_PREVIEW_BASE_URL=https://preview.mtverse.dev
```

**Also update `.env.example`**

---

## 5. 💾 Wrong DATABASE_URL Path (5 min)

**Current Issue:**
```env
# .env
DATABASE_URL=file:/home/z/my-project/db/custom.db
```

**Impact:** Database won't be found in production, app will crash

**Fix:**
```env
# .env
DATABASE_URL=file:./db/production.db

# Or for Vercel with Turso:
# DATABASE_URL=libsql://your-db.turso.io
# DATABASE_AUTH_TOKEN=your-token
```

**Also create the directory:**
```bash
mkdir -p db
```

---

## 6. 🔒 Localhost in Production CSP (10 min)

**Current Issue:**
```typescript
// next.config.ts line 54
{
  key: 'Content-Security-Policy',
  value: "frame-ancestors https://www.mtverse.dev https://mtverse.dev http://localhost:3000"
}
```

**Impact:** Security header leaks dev environment info

**Fix:**

```typescript
// next.config.ts
const frameAncestors = process.env.NODE_ENV === 'production'
  ? 'https://www.mtverse.dev https://mtverse.dev'
  : 'https://www.mtverse.dev https://mtverse.dev http://localhost:3000'

// In headers array:
{
  key: 'Content-Security-Policy',
  value: `frame-ancestors ${frameAncestors}`
}
```

---

## 7. 🔑 OAuth Redirect URIs Not Configured (15 min)

**Current Issue:**
- Google Console: Missing redirect URI
- GitHub Settings: Missing callback URL

**Impact:** OAuth login fails with `redirect_uri_mismatch` error

**Fix:**

### Google Console:
1. Go to https://console.cloud.google.com
2. Select your project
3. Go to "APIs & Services" → "Credentials"
4. Click your OAuth 2.0 Client ID
5. **Add to "Authorized redirect URIs":**
   ```
   https://www.mtverse.dev/api/auth/callback/google
   https://mtverse.dev/api/auth/callback/google
   ```
6. Save

### GitHub Settings:
1. Go to https://github.com/settings/developers
2. Click your OAuth App
3. **Set "Authorization callback URL":**
   ```
   https://www.mtverse.dev/api/auth/callback/github
   ```
4. Update application

### Verify in code:
Check `src/lib/auth/oauth.ts` has correct redirect URLs:
```typescript
const redirectUri = `${baseUrl}/api/auth/callback/google`
// Should output: https://www.mtverse.dev/api/auth/callback/google
```

---

## 📋 QUICK FIX CHECKLIST

```bash
# 1. Hash admin password
□ Run scrypt hash script
□ Update .env with ADMIN_PASSWORD_HASH
□ Update auth comparison code (if needed)

# 2. Add webhook deduplication
□ Add event_id check in webhook handler
□ Store in Redis with 30-day TTL
□ Test duplicate webhook scenario

# 3. Add download rate limits
□ Add to /api/download/template/[slug]/route.ts (5 per 15min)
□ Add to /api/download/package/[packageId]/route.ts (5 per 15min)
□ Test rate limit enforcement

# 4. Set preview base URL
□ Update .env: NEXT_PUBLIC_PREVIEW_BASE_URL=https://preview.mtverse.dev
□ Update .env.example

# 5. Fix database path
□ Update .env: DATABASE_URL=file:./db/production.db
□ Create db directory: mkdir -p db

# 6. Remove localhost from CSP
□ Update next.config.ts with environment check
□ Test both dev and production builds

# 7. Configure OAuth redirects
□ Add redirect URI to Google Console
□ Add callback URL to GitHub
□ Test OAuth login flow
```

---

## ⏱️ TIME BREAKDOWN

| Issue | Time | Difficulty |
|-------|------|------------|
| 1. Admin password hash | 30 min | Easy |
| 2. Webhook deduplication | 1 hour | Medium |
| 3. Download rate limits | 30 min | Easy |
| 4. Preview base URL | 5 min | Trivial |
| 5. Database path | 5 min | Trivial |
| 6. Localhost in CSP | 10 min | Easy |
| 7. OAuth redirects | 15 min | Easy |
| **TOTAL** | **~3 hours** | |

---

## 🚀 AFTER FIXING

Once all 7 critical issues are fixed:

✅ **Security:** Admin password hashed, no webhook replay, rate limits active  
✅ **Configuration:** All env vars correct, OAuth working  
✅ **Production Ready:** Can safely launch with paying customers  

Then focus on the 12 high-priority issues from `ALL_ISSUES_SUMMARY.md`.

---

**Next Command:** "Fix all 7 critical issues" or "Fix issue #1" to start
