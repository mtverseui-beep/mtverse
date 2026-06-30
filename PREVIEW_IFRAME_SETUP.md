# Preview Iframe Setup Guide

## The Problem

Vercel deployments set `X-Frame-Options: SAMEORIGIN` by default.
This blocks iframes from loading on a different domain (mtverse.dev).

Proxy approach doesn't work for full Next.js apps because:
- Client-side RSC navigation uses `window.location.origin`
- Static assets, images, and JS chunks all need to load from the origin
- `<base href>` only fixes initial HTML relative paths, not JS runtime behavior

## The Solution

Add this header config to each template's Vercel deployment:

### For Next.js templates (Helios Pro, MT Box, Modular, Mat Dash):

Add to `next.config.mjs` or `next.config.ts` in each template:

```js
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'ALLOW-FROM https://www.mtverse.dev',
        },
        {
          key: 'Content-Security-Policy',
          value: "frame-ancestors 'self' https://www.mtverse.dev https://mtverse.dev",
        },
      ],
    },
  ]
}
```

### For Vite/React templates (Lumiere Ecommerce):

Add to `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "ALLOW-FROM https://www.mtverse.dev"
        },
        {
          "key": "Content-Security-Policy",
          "value": "frame-ancestors 'self' https://www.mtverse.dev https://mtverse.dev"
        }
      ]
    }
  ]
}
```

## Templates to Update:

1. **Helios Pro** - `https://preview.mtverse.dev` (subdomain you control)
2. **Lumiere Ecommerce** - `https://mt-fullstack.vercel.app/`
3. **MTVerse Modular** - `https://mt-modular-pj4t.vercel.app/`
4. **MT Box Enterprise** - `https://mt-box.vercel.app/`
5. **Mat Dash** - `https://mat-dash-seven.vercel.app/`

## After Updating Template Deployments:

Once headers are configured, the preview page will:
1. Try loading the direct URL in an iframe
2. If it works (headers configured) → shows inline preview
3. If blocked → shows clean "Open in new tab" button

## Current Fallback Behavior (Without Header Changes):

The preview page currently:
1. Attempts to load via proxy (strips X-Frame-Options from HTML)
2. If proxy fails or RSC navigation breaks → shows "Open in new tab" button
3. User clicks → opens full interactive preview in new tab

This is the same approach used by ThemeForest, Envato, and other template marketplaces.

## Quick Fix (5 minutes per template):

For each template Vercel project:
1. Go to Vercel Dashboard → Project → Settings → Headers
2. Add: `Content-Security-Policy: frame-ancestors 'self' https://www.mtverse.dev https://mtverse.dev`
3. Remove/override `X-Frame-Options` header
4. Redeploy

Or add to the project source and push.
