# Free Templates Feature — Technical Design

## Architecture Overview

The feature adds a "free tier" layer on top of the existing paid template system. Key principle: **free downloads bypass the Paddle checkout but still require auth and respect a per-user limit.**

---

## 1. Data Layer Changes

### 1.1 `DashboardKit` type (`src/lib/dashboard-kits.ts`)
```ts
// Add to existing type
isFree?: boolean  // defaults to false
```

### 1.2 `Template` type (`src/lib/templates-catalog.ts`)
```ts
// Add to existing type
isFree: boolean
```

### 1.3 `toTemplate()` in `src/lib/templates-data.ts`
```ts
isFree: Boolean(kit.isFree),
// When isFree is true, price stays as-is in the data but UI shows "Free"
```

### 1.4 `template-social-store.ts` — User record extension
```ts
type TemplateUserRecord = {
  // ...existing fields...
  freeDownloads: {
    count: number          // unique free templates downloaded
    slugs: string[]        // which free templates were downloaded
    unlockedAt: string | null  // ISO date when $5 was paid, null if not
  }
}
```

### 1.5 `plan-store.ts` — PlanRecord extension
```ts
interface PlanRecord {
  // ...existing fields...
  freeUnlocked?: boolean
  freeUnlockedAt?: string
}
```

---

## 2. API Changes

### 2.1 `/api/templates/[slug]/access` (GET)

Current logic:
```
canDownload = hasValidPlan && hasPurchaseRecord
```

New logic:
```
if template.isFree:
  if not authenticated → canDownload: false
  if hasPaidPlan OR freeUnlocked → canDownload: true
  if freeDownloads.slugs.includes(slug) → canDownload: true (re-download)
  if freeDownloads.count < 5 → canDownload: true, freeRemaining: 5 - count
  else → canDownload: false, limitReached: true, freeRemaining: 0
else:
  existing logic (unchanged)
```

Response shape extended:
```ts
{
  authenticated: boolean
  canDownload: boolean
  isFree?: boolean
  freeRemaining?: number      // how many free downloads left
  freeLimitReached?: boolean  // true when at 5/5
  freeUnlocked?: boolean      // true if paid $5 or has paid plan
}
```

### 2.2 `/api/download/template/[slug]` (GET)

Current logic:
```
requires auth + plan + purchase record
```

New logic for free templates:
```
if template.isFree:
  require auth (401 if not)
  rate limit (existing)
  if hasPaidPlan OR freeUnlocked → allow, record download
  if alreadyDownloaded(slug) → allow (re-download)
  if freeDownloads.count < 5 → allow, increment counter, add slug
  else → 403 "Free download limit reached"
else:
  existing logic (unchanged)
```

### 2.3 `/api/templates/free/claim` (POST) — NEW

Purpose: Record a free template claim (increment counter) without actual file download. Used by the detail page to "claim" before redirecting to download.

```ts
POST /api/templates/free/claim
Body: { slug: string }
Response: { claimed: boolean, freeRemaining: number, error?: string }
```

### 2.4 `/api/payments/checkout` (POST) — Extended

Add support for `packageId: 'free-unlock'`:
```ts
if packageId === 'free-unlock':
  create Paddle checkout for $5 free-tier-unlock product
  customData: { packageId: 'free-unlock', email }
```

### 2.5 Paddle Webhook — Extended

When `packageId === 'free-unlock'`:
```ts
// Don't call setPlan with a full plan upgrade
// Instead, just set the freeUnlocked flag
await setFreeUnlocked(email)  // new function in plan-store or template-social-store
```

---

## 3. Admin Panel Changes

### 3.1 Template Form (`admin-templates-real.tsx`)

Add toggle in the form:
```tsx
<label>
  <input type="checkbox" checked={form.isFree} onChange={...} />
  Free template (users can download without purchase)
</label>
```

Maps to `kit.isFree` in the JSON save payload.

### 3.2 Template List — Free indicator

Show a "FREE" badge next to price in the admin template list.

---

## 4. Frontend Changes

### 4.1 Template Card (`template-card.tsx`)

When `template.isFree`:
- Show "Free" badge (green) instead of price
- Or show "$0" with a "Free" label

### 4.2 Template Detail Buy Box (`template-detail-client.tsx`)

New state from access API:
```ts
const [isFree, setIsFree] = useState(false)
const [freeRemaining, setFreeRemaining] = useState(5)
const [freeLimitReached, setFreeLimitReached] = useState(false)
const [freeUnlocked, setFreeUnlocked] = useState(false)
```

UI states:
1. **Not signed in + free template** → "Sign in to download free"
2. **Signed in + free + has remaining** → "Download Free (3/5 remaining)"
3. **Signed in + free + already downloaded** → "Download package" (re-download)
4. **Signed in + free + limit reached** → "Unlock unlimited for $5" button
5. **Signed in + free + unlocked** → "Download Free" (no limit shown)

### 4.3 Templates Hub — Free filter

Add "Free" as a category chip or a separate toggle filter.

---

## 5. Package Configuration

### 5.1 `src/lib/packages.ts`

Add new package definition:
```ts
{
  id: 'free-unlock',
  name: 'Free Downloads Unlock',
  accessPlan: 'free-unlock',  // special plan level
  paddlePriceId: process.env.PADDLE_FREE_UNLOCK_PRICE_ID,
  priceUsd: 5,
}
```

### 5.2 Environment Variables

```
PADDLE_FREE_UNLOCK_PRICE_ID=pri_xxxxx
```

---

## 6. Access Control Summary

| User State | Free Template | Paid Template |
|---|---|---|
| Not signed in | ❌ (sign in prompt) | ❌ (sign in prompt) |
| Signed in, no plan, < 5 free | ✅ Download | ❌ (buy now) |
| Signed in, no plan, = 5 free | ❌ (pay $5 to unlock) | ❌ (buy now) |
| Signed in, freeUnlocked | ✅ Download | ❌ (buy now) |
| Signed in, paid plan (next/pro) | ✅ Download | ✅ Download (if purchased) |

---

## 7. Migration

- Existing templates: `isFree` defaults to `false` — no change to current behavior
- Existing users: `freeDownloads` initialized to `{ count: 0, slugs: [], unlockedAt: null }` on first access
- No data migration needed — fields are optional with defaults
