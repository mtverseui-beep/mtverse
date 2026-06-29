'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, RotateCw } from 'lucide-react'
import type { PromptCategoryId } from '@/lib/prompt-library-data'
import { getPromptPreviewFallback } from '@/lib/prompt-preview-images'
import { cn } from '@/lib/utils'

function isRemoteUrl(value: string) {
  return /^https?:\/\//i.test(value)
}

const IMAGE_RETRY_LIMIT = 0
const IMAGE_LOAD_TIMEOUT_MS = 9000
const TRUSTED_PROMPT_IMAGE_HOSTS = new Set([
  'pub-59d1b450736b455084e9eebc2ed27f14.r2.dev',
])

function isTrustedPromptImageUrl(value: string) {
  if (!isRemoteUrl(value)) return true

  try {
    const url = new URL(value)
    return url.protocol === 'https:' && TRUSTED_PROMPT_IMAGE_HOSTS.has(url.hostname)
  } catch {
    return false
  }
}

function safePromptImageSrc(value: string, fallback: string) {
  const next = value || fallback
  return isTrustedPromptImageUrl(next) ? next : fallback
}

function shouldBypassOptimizer(value: string) {
  try {
    const url = new URL(value)
    return [
      'pub-59d1b450736b455084e9eebc2ed27f14.r2.dev',
    ].includes(url.hostname)
  } catch {
    return false
  }
}

function withRetryParam(value: string, retryVersion: number) {
  if (!retryVersion || !isRemoteUrl(value)) return value

  try {
    const url = new URL(value)
    url.searchParams.set('_mv_retry', String(retryVersion))
    return url.toString()
  } catch {
    return value
  }
}

export default function PromptPreviewImage({
  src,
  alt,
  category,
  className,
  imgClassName,
  imageFit = 'cover',
  priority = false,
  sizes,
}: {
  src: string
  alt: string
  category: PromptCategoryId
  className?: string
  imgClassName?: string
  imageFit?: 'cover' | 'contain'
  priority?: boolean
  sizes?: string
}) {
  const fallbackSrc = useMemo(() => getPromptPreviewFallback(category), [category])
  const retryTimerRef = useRef<number | null>(null)
  const [currentSrc, setCurrentSrc] = useState(() => {
    return safePromptImageSrc(src, fallbackSrc)
  })
  const [loaded, setLoaded] = useState(false)
  const [retryVersion, setRetryVersion] = useState(0)
  const [permanentlyFailed, setPermanentlyFailed] = useState(false)
  const [manualRetryNonce, setManualRetryNonce] = useState(0)
  const displaySrc = useMemo(
    () => withRetryParam(currentSrc || fallbackSrc, retryVersion + manualRetryNonce * 10),
    [currentSrc, fallbackSrc, retryVersion, manualRetryNonce]
  )
  const unoptimized = useMemo(
    () => shouldBypassOptimizer(currentSrc || fallbackSrc),
    [currentSrc, fallbackSrc]
  )

  useEffect(() => {
    if (retryTimerRef.current) {
      window.clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }
    setLoaded(false)
    setRetryVersion(0)
    setPermanentlyFailed(false)
    setManualRetryNonce(0)
    const nextSrc = safePromptImageSrc(src, fallbackSrc)
    setCurrentSrc(nextSrc)
  }, [fallbackSrc, src])

  useEffect(() => {
    return () => {
      if (retryTimerRef.current) {
        window.clearTimeout(retryTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (loaded || !priority) return

    const timeout = window.setTimeout(() => {
      if (currentSrc === fallbackSrc) {
        setLoaded(true)
        return
      }

      if (isRemoteUrl(currentSrc) && retryVersion < IMAGE_RETRY_LIMIT) {
        setRetryVersion((value) => value + 1)
        return
      }

      setCurrentSrc(fallbackSrc)
    }, IMAGE_LOAD_TIMEOUT_MS)

    return () => window.clearTimeout(timeout)
  }, [currentSrc, fallbackSrc, loaded, priority, retryVersion])

  function handleManualRetry() {
    setPermanentlyFailed(false)
    setLoaded(false)
    setRetryVersion(0)
    setManualRetryNonce((n) => n + 1)
    setCurrentSrc(safePromptImageSrc(src, fallbackSrc))
  }

  return (
    <div className={cn('relative h-full w-full overflow-hidden', className)}>
      {!loaded && !permanentlyFailed ? (
        <div
          className="absolute inset-0 bg-slate-100 dark:bg-slate-900"
          aria-hidden="true"
        >
          <div className="absolute inset-0 animate-pulse bg-slate-200/75 dark:bg-slate-800/80" />
          <div
            className="absolute inset-0 -translate-x-full"
            style={{
              animationName: 'mv-prompt-shimmer',
              animationDuration: '1.8s',
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear',
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            }}
          />
          <style jsx>{`
            @keyframes mv-prompt-shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          `}</style>
        </div>
      ) : null}

      {permanentlyFailed ? (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-100 p-4 text-center dark:bg-slate-900"
          role="status"
          aria-live="polite"
        >
          <AlertTriangle className="size-6 text-amber-500" aria-hidden="true" />
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Image could not be loaded</p>
          <button
            type="button"
            onClick={handleManualRetry}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <RotateCw className="size-3" aria-hidden="true" />
            Retry
          </button>
        </div>
      ) : null}

      {imageFit === 'contain' && !permanentlyFailed ? (
        <Image
          key={`${displaySrc}-backdrop`}
          src={displaySrc}
          alt=""
          aria-hidden="true"
          fill
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          priority={priority}
          fetchPriority={priority ? 'high' : 'auto'}
          unoptimized={unoptimized}
          sizes={sizes ?? '(max-width: 640px) 100vw, (max-width: 1280px) 42vw, 520px'}
          className={cn(
            'absolute inset-0 h-full w-full scale-110 object-cover object-center opacity-0 blur-2xl saturate-125 transition-opacity duration-150',
            loaded && 'opacity-30 dark:opacity-25'
          )}
        />
      ) : null}
      {!permanentlyFailed ? (
        <Image
          key={displaySrc}
          src={displaySrc}
          alt={alt}
          fill
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          priority={priority}
          fetchPriority={priority ? 'high' : 'auto'}
          unoptimized={unoptimized}
          sizes={sizes ?? '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw'}
          onLoad={() => {
            if (retryTimerRef.current) {
              window.clearTimeout(retryTimerRef.current)
              retryTimerRef.current = null
            }
            setLoaded(true)
          }}
          onError={() => {
            if (isRemoteUrl(currentSrc) && currentSrc !== fallbackSrc && retryVersion < IMAGE_RETRY_LIMIT) {
              setLoaded(false)
              if (retryTimerRef.current) window.clearTimeout(retryTimerRef.current)
              retryTimerRef.current = window.setTimeout(() => {
                retryTimerRef.current = null
                setRetryVersion((value) => value + 1)
              }, 700 * (retryVersion + 1))
              return
            }

            if (currentSrc !== fallbackSrc) {
              setLoaded(false)
              setCurrentSrc(fallbackSrc)
            } else {
              setPermanentlyFailed(true)
            }
          }}
          className={cn(
            'absolute inset-0 h-full w-full',
            imageFit === 'contain' ? 'object-contain object-center' : 'object-cover object-center',
            loaded ? 'opacity-100' : 'opacity-0',
            'transition-opacity duration-150',
            imgClassName
          )}
        />
      ) : null}
    </div>
  )
}
