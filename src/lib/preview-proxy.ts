import 'server-only'

import { NextRequest, NextResponse } from 'next/server'
import { getDashboardKit } from '@/lib/dashboard-kit-store'

type PreviewTarget = {
  origin: string
  rootUrl: URL
}

const TEXT_CONTENT_MARKERS = [
  'text/',
  'application/javascript',
  'application/json',
  'application/xml',
  'application/xhtml',
  'application/manifest+json',
  'application/rss+xml',
  'application/atom+xml',
  'text/x-component',
]

function isTextLike(contentType: string) {
  const normalized = contentType.toLowerCase()
  return TEXT_CONTENT_MARKERS.some((marker) => normalized.includes(marker))
}

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

function proxyBaseFor(slug: string) {
  return `/api/preview/proxy/${encodeURIComponent(slug)}`
}

async function getPreviewTarget(slug: string): Promise<PreviewTarget | null> {
  const kit = await getDashboardKit(slug)
  const previewBaseUrl = stripTrailingSlash(process.env.NEXT_PUBLIC_PREVIEW_BASE_URL || '')
  const livePreviewUrl =
    (kit as { livePreviewUrl?: string } | null)?.livePreviewUrl ||
    (kit?.previewPath && previewBaseUrl ? `${previewBaseUrl}${kit.previewPath}` : '')

  if (!kit || !livePreviewUrl || !livePreviewUrl.startsWith('http')) {
    return null
  }

  try {
    const rootUrl = new URL(livePreviewUrl)
    return {
      origin: rootUrl.origin,
      rootUrl,
    }
  } catch {
    return null
  }
}

function buildTargetUrl(target: PreviewTarget, request: NextRequest, pathSegments?: string[]) {
  if (!pathSegments || pathSegments.length === 0) {
    const root = new URL(target.rootUrl.toString())
    root.search = request.nextUrl.search
    return root
  }

  const upstreamPath = `/${pathSegments.map((segment) => encodeURIComponent(segment)).join('/')}`
  const url = new URL(upstreamPath, target.origin)
  url.search = request.nextUrl.search
  return url
}

function buildPreviewConsoleGuard(proxyBase: string) {
  const script = `
<script>
(function(){
  var proxyBase = '${proxyBase}';
  var blockedPattern = /(vercel\\.app|netlify\\.app|Vercel Web Analytics|Vercel Speed Insights|\\[HMR\\]|Fast Refresh|webpack-hmr|turbopack-hmr|Locize|i18next is made possible)/i;
  function shouldBlock(args){
    for (var i = 0; i < args.length; i += 1) {
      var value = args[i];
      if (typeof value === 'string' && blockedPattern.test(value)) return true;
      if (value && typeof value.message === 'string' && blockedPattern.test(value.message)) return true;
    }
    return false;
  }
  ['log','info','debug','warn','error'].forEach(function(name){
    var original = console[name];
    console[name] = function(){
      if (shouldBlock(arguments)) return;
      return original.apply(console, arguments);
    };
  });
  function rewritePath(value){
    if (typeof value !== 'string') return value;
    if (value.indexOf(proxyBase) === 0) return value;
    if (value.charAt(0) === '/') return proxyBase + value;
    return value;
  }
  var originalFetch = window.fetch;
  window.fetch = function(input, init){
    try {
      if (typeof input === 'string') {
        input = rewritePath(input);
      } else if (input && typeof input.url === 'string') {
        var requestUrl = new URL(input.url, window.location.href);
        if (requestUrl.origin === window.location.origin && requestUrl.pathname.indexOf(proxyBase) !== 0) {
          input = new Request(proxyBase + requestUrl.pathname + requestUrl.search, input);
        }
      }
    } catch (error) {}
    return originalFetch.call(this, input, init);
  };
  var OriginalWebSocket = window.WebSocket;
  if (OriginalWebSocket) {
    window.WebSocket = function(url, protocols){
      var text = String((url && url.url) || url || '');
      if (/webpack-hmr|turbopack-hmr|\\/_next\\//i.test(text)) {
        var noop = function(){};
        return {
          url: text,
          readyState: 3,
          bufferedAmount: 0,
          extensions: '',
          protocol: '',
          binaryType: 'blob',
          close: noop,
          send: noop,
          addEventListener: noop,
          removeEventListener: noop,
          dispatchEvent: function(){ return false; },
          onopen: null,
          onmessage: null,
          onerror: null,
          onclose: null
        };
      }
      return protocols ? new OriginalWebSocket(url, protocols) : new OriginalWebSocket(url);
    };
    window.WebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
    window.WebSocket.OPEN = OriginalWebSocket.OPEN;
    window.WebSocket.CLOSING = OriginalWebSocket.CLOSING;
    window.WebSocket.CLOSED = OriginalWebSocket.CLOSED;
    window.WebSocket.prototype = OriginalWebSocket.prototype;
  }
})();
</script>`
  return script.replace(/\n\s+/g, '')
}

function shouldProxyRelativeAsset(value: string) {
  return /^(?:\.\/?|\.\.\/)?(?:_next|assets|images|img|static|favicon|manifest|api|icons)\//i.test(value) ||
    /(?:\.(?:css|js|mjs|json|webmanifest|png|jpe?g|webp|gif|svg|ico|avif|woff2?|ttf|otf|map))(?:[?#].*)?$/i.test(value)
}

function rewritePreviewUrl(value: string, proxyBase: string) {
  const trimmed = value.trim()
  if (!trimmed || trimmed.startsWith(proxyBase)) return value
  if (/^(?:https?:|data:|blob:|mailto:|tel:|#|\/\/)/i.test(trimmed)) return value
  if (trimmed.startsWith('/')) return proxyBase + trimmed
  if (trimmed.startsWith('?')) return proxyBase + '/' + trimmed
  if (!shouldProxyRelativeAsset(trimmed)) return value

  return proxyBase + '/' + trimmed.replace(/^\.\//, '')
}

function rewriteSrcSet(value: string, proxyBase: string) {
  return value
    .split(',')
    .map((candidate) => {
      const parts = candidate.trim().split(/\s+/)
      if (!parts[0]) return candidate
      parts[0] = rewritePreviewUrl(parts[0], proxyBase)
      return parts.join(' ')
    })
    .join(', ')
}

function replaceAttributeRoots(text: string, proxyBase: string) {
  let output = text

  output = output.replace(/\b(srcset|imagesrcset)=(['"])(.*?)\2/gi, (_match, attr: string, quote: string, value: string) => {
    return attr + '=' + quote + rewriteSrcSet(value, proxyBase) + quote
  })

  output = output.replace(/\b(href|src|action|poster|data-src)=(['"])(.*?)\2/gi, (_match, attr: string, quote: string, value: string) => {
    return attr + '=' + quote + rewritePreviewUrl(value, proxyBase) + quote
  })

  output = output
    .replace(/url\(\/(?!\/|api\/preview\/proxy\/)/g, 'url(' + proxyBase + '/')
    .replace(/(["'])\/(?!api\/preview\/proxy\/)(?:_next|assets|images|img|static|favicon|manifest|api|icons)\//g, (match, quote: string) => quote + proxyBase + match.slice(1))
    .replace(/(\\")\/(?!api\/preview\/proxy\/)(?:_next|assets|images|img|static|favicon|manifest|api|icons)\//g, (_match, quote: string) => quote + proxyBase + '/')

  return output
}

function sanitizePreviewHtml(text: string, proxyBase: string) {
  const baseTag = '<base href="' + proxyBase + '/">'
  let output = text
    .replace(/<link\b(?=[^>]*\brel=["']preload["'])(?=[^>]*\/_next\/static\/)[^>]*>/gi, '')
    .replace(/<script\b(?=[^>]*(?:webpack-hmr|turbopack-hmr|\/_next\/static\/chunks\/webpack|\/_next\/static\/chunks\/main-app))[^>]*><\/script>/gi, '')
    .replace(/<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/gi, '<meta name="robots" content="noindex,nofollow">')
    .replace(/<meta\b(?=[^>]*\bname=["']googlebot["'])[^>]*>/gi, '<meta name="googlebot" content="noindex,nofollow">')
    .replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/gi, '')

  if (/<head[^>]*>/i.test(output) && !/<base\s/i.test(output)) {
    output = output.replace(/<head([^>]*)>/i, '<head$1>' + baseTag)
  }

  return output
}

function rewriteHtmlAssetUrls(text: string, proxyBase: string) {
  let output = text

  output = output.replace(/<head\b[\s\S]*?<\/head>/i, (head) => replaceAttributeRoots(head, proxyBase))

  output = output.replace(/<script\b[^>]*\bsrc=(['"])(.*?)\1[^>]*>/gi, (tag) => {
    return tag.replace(/\bsrc=(['"])(.*?)\1/i, (_match, quote: string, value: string) => {
      return 'src=' + quote + rewritePreviewUrl(value, proxyBase) + quote
    })
  })

  return output
}


function rewritePreviewText(text: string, target: PreviewTarget, request: NextRequest, slug: string, contentType: string) {
  const proxyBase = proxyBaseFor(slug)
  const publicHost = request.nextUrl.host
  const escapedOrigin = target.origin.replace(/\//g, '\\/')
  const escapedProxy = proxyBase.replace(/\//g, '\\/')

  let output = text
    .split(target.origin).join(proxyBase)
    .split(escapedOrigin).join(escapedProxy)
    .split(new URL(target.origin).hostname).join(publicHost)

  const lowerContentType = contentType.toLowerCase()

  if (lowerContentType.includes('text/html') || lowerContentType.includes('application/xhtml')) {
    output = rewriteHtmlAssetUrls(output, proxyBase)
  } else {
    output = output
      .replace(/url\(\/(?!\/|api\/preview\/proxy\/)/g, 'url(' + proxyBase + '/')
      .replace(/(["'`])\/_next\//g, `$1${proxyBase}/_next/`)
      .replace(/(["'])\/(?!api\/preview\/proxy\/)(?:assets|images|img|static|favicon|manifest|api|icons)\//g, (match, quote: string) => quote + proxyBase + match.slice(1))
      .replace(/(\\")\/(?!api\/preview\/proxy\/)(?:_next|assets|images|img|static|favicon|manifest|api|icons)\//g, (_match, quote: string) => quote + proxyBase + '/')
  }

  if (lowerContentType.includes('text/html')) {
    output = sanitizePreviewHtml(output, proxyBase)
    const guard = buildPreviewConsoleGuard(proxyBase)
    if (/<head[^>]*>/i.test(output)) {
      output = output.replace(/<head([^>]*)>/i, `<head$1>${guard}`)
    } else {
      output = `${guard}${output}`
    }
  }

  return output
}

function responseHeaders(contentType: string) {
  const headers = new Headers()
  if (contentType) headers.set('content-type', contentType)
  headers.set('cache-control', 'no-store, max-age=0')
  headers.set('x-robots-tag', 'noindex, nofollow')
  headers.set('referrer-policy', 'no-referrer')
  headers.set('access-control-allow-origin', '*')
  headers.set('content-security-policy', "frame-ancestors 'self'")
  return headers
}

export async function createPreviewProxyResponse(request: NextRequest, slug: string, pathSegments?: string[]) {
  const target = await getPreviewTarget(slug)

  if (!target) {
    return NextResponse.json({ error: 'Preview not available.' }, { status: 404 })
  }

  if (target.origin === request.nextUrl.origin) {
    return NextResponse.json({ error: 'Preview target cannot point back to this app.' }, { status: 400 })
  }

  const targetUrl = buildTargetUrl(target, request, pathSegments)
  const upstream = await fetch(targetUrl, {
    cache: 'no-store',
    redirect: 'follow',
    headers: {
      accept: request.headers.get('accept') || '*/*',
      'accept-language': request.headers.get('accept-language') || 'en-US,en;q=0.9',
      'user-agent': request.headers.get('user-agent') || 'Mozilla/5.0',
    },
  })
  const contentType = upstream.headers.get('content-type') || ''
  const headers = responseHeaders(contentType)

  if (isTextLike(contentType)) {
    const body = rewritePreviewText(await upstream.text(), target, request, slug, contentType)
    return new NextResponse(body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    })
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  })
}