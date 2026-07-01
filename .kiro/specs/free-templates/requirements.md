# Free Templates Feature — Requirements

## Overview

Allow certain templates to be marked as "free" by admin. Signed-in users can download up to 5 free templates. After 5 downloads, users must pay $5 (one-time "free-tier unlock") to continue downloading unlimited free templates.

---

## Requirement 1: Admin — Mark Templates as Free

### User Stories
- As an admin, I want to toggle any template between "free" and "paid" in the admin templates panel so I can control which templates are offered for free.

### Acceptance Criteria
- [ ] Admin template form has a "Free template" toggle/checkbox
- [ ] The `dashboard-kits-store.json` stores a `isFree: boolean` field per kit (defaults to `false`)
- [ ] Admin can search/filter templates by free status
- [ ] `DashboardKit` type in `src/lib/dashboard-kits.ts` includes the `isFree` field
- [ ] `Template` type in `src/lib/templates-catalog.ts` includes `isFree: boolean`
- [ ] The `toTemplate()` function in `templates-data.ts` maps `kit.isFree` → `template.isFree`

---

## Requirement 2: Templates Listing — Free Badge & Filter

### User Stories
- As a visitor, I want to see which templates are free so I know what I can get without paying.

### Acceptance Criteria
- [ ] Free templates show a "Free" badge on the template card (e.g., green badge)
- [ ] Template detail page shows "Free" instead of price in the buy box
- [ ] Category chips or a filter option lets users filter to "Free only"
- [ ] `getTemplateStatsFor()` already counts `freeTemplates` — this should work once `price === 0` or `isFree === true`

---

## Requirement 3: Free Download — Auth Required + 5 Download Limit

### User Stories
- As a signed-in user, I want to download free templates without going through checkout.
- As a user who has downloaded 5 free templates, I should see a prompt to pay $5 to unlock more.

### Acceptance Criteria
- [ ] Download of free templates requires authentication (redirect to sign-in if not logged in)
- [ ] No Paddle checkout flow for free templates — direct download after auth check
- [ ] Per-user counter tracks free template downloads (stored in `template-social-store` users record or a new field)
- [ ] User can download up to 5 unique free templates
- [ ] After reaching limit, UI shows "Unlock unlimited free downloads for $5" instead of download button
- [ ] A template that was already downloaded doesn't count again toward the limit (re-download is allowed)

---

## Requirement 4: $5 Free-Tier Unlock Payment

### User Stories
- As a user who hit the 5 free download limit, I want to pay $5 once to unlock unlimited free template downloads.

### Acceptance Criteria
- [ ] New Paddle product/price for "free-tier-unlock" at $5 USD one-time
- [ ] After successful payment, user's plan store gets a flag: `freeUnlocked: true`
- [ ] Users with `freeUnlocked: true` can download unlimited free templates
- [ ] Users with existing paid plans (pro/business/extended or packageId 'next') automatically have unlimited free downloads (no $5 needed)
- [ ] Paddle webhook handles the `free-tier-unlock` package and sets the flag

---

## Requirement 5: Download API — Support Free Templates

### User Stories
- As the system, I need to allow free template downloads without requiring a paid plan record.

### Acceptance Criteria
- [ ] `/api/templates/[slug]/access` returns `canDownload: true` for free templates if user is signed in AND (downloads < 5 OR freeUnlocked OR has paid plan)
- [ ] `/api/download/template/[slug]` allows download for free templates under same conditions (no plan check needed, only auth + limit check)
- [ ] Rate limiting still applies (5 downloads per 15 minutes)
- [ ] A "claim" record is created in `template-social-store` for free downloads (similar to `recordTemplatePurchase` but without payment)

---

## Requirement 6: Template Detail Page — Free Download UX

### User Stories
- As a signed-in user on a free template page, I want to see a "Download Free" button instead of "Buy now".
- As a user who hit the limit, I want clear messaging and a path to unlock.

### Acceptance Criteria
- [ ] Buy box shows "$0" or "Free" price
- [ ] Primary CTA becomes "Download Free" (green) instead of "Buy now"
- [ ] If not signed in: "Sign in to download" with redirect
- [ ] If signed in but at limit: "You've used 5/5 free downloads. Unlock unlimited for $5" with checkout button
- [ ] Shows remaining free download count: "3/5 free downloads remaining"
- [ ] After download: shows "Downloaded ✓" state (same as existing canDownload flow)

---

## Data Model Changes

### `dashboard-kits-store.json` per kit:
```json
{
  "isFree": true
}
```

### `template-social-store.json` per user:
```json
{
  "freeDownloads": {
    "count": 3,
    "slugs": ["helios-pro", "mat-dash-...", "nimbus-pro"],
    "unlockedAt": null
  }
}
```

### `plan-store.json` per user (after $5 payment):
```json
{
  "freeUnlocked": true,
  "freeUnlockedAt": "2026-07-01T..."
}
```

---

## Non-Goals (Out of Scope)
- No time-based expiry on free downloads
- No admin UI to see per-user free download stats (future)
- No change to paid template checkout flow
- No email notification on free download
