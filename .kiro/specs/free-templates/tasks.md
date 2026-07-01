# Free Templates Feature — Implementation Tasks

## Task 1: Data Model — Add `isFree` field
- [ ] Add `isFree?: boolean` to `DashboardKit` type in `src/lib/dashboard-kits.ts`
- [ ] Add `isFree: boolean` to `Template` type in `src/lib/templates-catalog.ts`
- [ ] Update `toTemplate()` in `src/lib/templates-data.ts` to map `kit.isFree → template.isFree`
- [ ] Existing kits in `dashboard-kits-store.json` don't need changes (defaults to false)

## Task 2: Template Social Store — Free download tracking
- [ ] Extend `TemplateUserRecord` type with `freeDownloads: { count, slugs, unlockedAt }`
- [ ] Add `recordFreeDownload(slug, email)` function — increments count, adds slug
- [ ] Add `getFreeDownloadStatus(email)` function — returns count, slugs, unlockedAt, remaining
- [ ] Add `hasFreeDownload(slug, email)` function — checks if user already has this free template
- [ ] Add `setFreeUnlocked(email)` function — sets unlockedAt timestamp
- [ ] Handle normalization in existing `normalizeUserRecord` function

## Task 3: Plan Store — Free unlock flag
- [ ] Add `freeUnlocked?: boolean` and `freeUnlockedAt?: string` to `PlanRecord` type
- [ ] Update `setPlan` or add new `setFreeUnlockFlag(email)` for the $5 payment flow
- [ ] Ensure `canDownloadTemplate` helper is not affected (free unlock is separate from plan)

## Task 4: Access API — Support free templates
- [ ] Modify `/api/templates/[slug]/access/route.ts`:
  - Load template, check `isFree`
  - If free: check auth → check if already downloaded → check limit → return extended response
  - If paid: existing logic unchanged
- [ ] Extended response: `{ canDownload, isFree, freeRemaining, freeLimitReached, freeUnlocked }`

## Task 5: Download API — Support free templates
- [ ] Modify `/api/download/template/[slug]/route.ts`:
  - If `kit.isFree`: skip plan check, check free download eligibility instead
  - Record free download on successful stream (call `recordFreeDownload`)
  - If limit reached: return 403 with message
  - If already downloaded: allow re-download without incrementing count
- [ ] Existing paid template logic unchanged

## Task 6: Packages — Add free-unlock product
- [ ] Add `'free-unlock'` package to `src/lib/packages.ts`
- [ ] Add `PADDLE_FREE_UNLOCK_PRICE_ID` env var support
- [ ] Update `isPackageId()` to accept `'free-unlock'`

## Task 7: Checkout API — Support free-unlock package
- [ ] Update `/api/payments/checkout/route.ts` to handle `packageId: 'free-unlock'`
- [ ] Pass `{ packageId: 'free-unlock' }` in custom_data to Paddle

## Task 8: Paddle Webhook — Handle free-unlock
- [ ] Update `/api/payments/webhook/paddle/route.ts`:
  - When `packageId === 'free-unlock'`: call `setFreeUnlocked(email)` instead of full plan upgrade
  - Still record in plan-store with `freeUnlocked: true`

## Task 9: Admin Panel — Free toggle
- [ ] Add "Free template" checkbox/toggle to the template edit form in `admin-templates-real.tsx`
- [ ] Include `isFree` in the save/update API payload
- [ ] Show "FREE" badge in admin template list for free templates
- [ ] Allow filtering by free status in admin

## Task 10: Template Card — Free badge
- [ ] In `template-card.tsx`: show green "Free" badge when `template.isFree`
- [ ] Show "Free" instead of "$12" in the price area

## Task 11: Template Detail — Free download UX
- [ ] Update `template-detail-client.tsx`:
  - Read new fields from access API response (`isFree`, `freeRemaining`, `freeLimitReached`, `freeUnlocked`)
  - If free + not signed in: "Sign in to download" CTA
  - If free + remaining > 0: "Download Free" button + "X/5 remaining" indicator
  - If free + already downloaded: standard "Download package" button
  - If free + limit reached: "Unlock unlimited for $5" button → triggers checkout with `free-unlock`
  - If free + unlocked/paid plan: "Download Free" with no limit
- [ ] Price area shows "Free" instead of dollar amount

## Task 12: Templates Hub — Free filter
- [ ] Add "Free" chip to category filters or as a separate toggle
- [ ] When active, filter to `template.isFree === true` only

## Task 13: Testing & Verification
- [ ] TS check passes
- [ ] Build passes
- [ ] Test free download flow manually: sign in → download free template → verify counter increments
- [ ] Test limit: after 5 downloads, verify 403 and unlock prompt
- [ ] Test re-download: already downloaded template doesn't increment counter
- [ ] Test paid plan users can download free templates without limit
