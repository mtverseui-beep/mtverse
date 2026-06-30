'use client'

import type { PaddleCheckoutPayload } from '@/lib/paddle-types'

type PaddleEvent = {
  name?: string
  data?: {
    transaction_id?: string
    transactionId?: string
    id?: string
  }
}

type PaddleGlobal = {
  Environment?: {
    set: (environment: 'sandbox' | 'production') => void
  }
  Initialize: (options: {
    token: string
    eventCallback?: (event: PaddleEvent) => void
  }) => void
  Update?: (options: {
    eventCallback?: (event: PaddleEvent) => void
  }) => void
  Checkout: {
    open: (options: {
      items: Array<{ priceId: string; quantity: number }>
      customer?: { email: string }
      customData?: Record<string, string>
      settings?: {
        displayMode?: 'overlay' | 'inline'
        theme?: 'light' | 'dark'
        locale?: string
        successUrl?: string
      }
    }) => void
  }
}

type PaddleWindow = Window & {
  Paddle?: PaddleGlobal
  __mtversePaddle?: {
    token: string
    environment: PaddleCheckoutPayload['environment']
    ready: Promise<PaddleGlobal>
  }
}

const PADDLE_SCRIPT_ID = 'mtverse-paddle-js'
const PADDLE_SCRIPT_SRC = 'https://cdn.paddle.com/paddle/v2/paddle.js'

function getWindow() {
  return window as PaddleWindow
}

function loadPaddleScript() {
  const win = getWindow()
  if (win.Paddle) return Promise.resolve(win.Paddle)

  const existing = document.getElementById(PADDLE_SCRIPT_ID) as HTMLScriptElement | null
  if (existing) {
    return new Promise<PaddleGlobal>((resolve, reject) => {
      existing.addEventListener('load', () => win.Paddle ? resolve(win.Paddle) : reject(new Error('Paddle.js did not initialize.')), { once: true })
      existing.addEventListener('error', () => reject(new Error('Paddle.js failed to load.')), { once: true })
    })
  }

  return new Promise<PaddleGlobal>((resolve, reject) => {
    const script = document.createElement('script')
    script.id = PADDLE_SCRIPT_ID
    script.src = PADDLE_SCRIPT_SRC
    script.async = true
    script.onload = () => win.Paddle ? resolve(win.Paddle) : reject(new Error('Paddle.js did not initialize.'))
    script.onerror = () => reject(new Error('Paddle.js failed to load.'))
    document.head.appendChild(script)
  })
}

async function getInitializedPaddle(payload: PaddleCheckoutPayload, eventCallback: (event: PaddleEvent) => void) {
  const win = getWindow()
  const existing = win.__mtversePaddle

  if (existing?.token === payload.clientToken && existing.environment === payload.environment) {
    const paddle = await existing.ready
    paddle.Update?.({ eventCallback })
    return paddle
  }

  const ready = loadPaddleScript().then((paddle) => {
    if (payload.environment === 'sandbox') paddle.Environment?.set('sandbox')
    paddle.Initialize({ token: payload.clientToken, eventCallback })
    return paddle
  })

  win.__mtversePaddle = {
    token: payload.clientToken,
    environment: payload.environment,
    ready,
  }

  return ready
}

function buildSuccessUrl(baseSuccessUrl: string, transactionId?: string) {
  const url = new URL(baseSuccessUrl, window.location.origin)
  if (transactionId) url.searchParams.set('transaction_id', transactionId)
  return url.toString()
}

export async function openPaddleCheckout(payload: PaddleCheckoutPayload, successUrl: string) {
  const paddle = await getInitializedPaddle(payload, (event) => {
    if (event.name === 'checkout.loaded') {
      // Disable background scroll when checkout opens
      document.body.style.overflow = 'hidden'
    }

    if (event.name === 'checkout.closed') {
      // Re-enable background scroll when checkout closes
      document.body.style.overflow = ''
    }

    if (event.name !== 'checkout.completed') return

    const transactionId = event.data?.transaction_id || event.data?.transactionId || event.data?.id
    window.location.assign(buildSuccessUrl(successUrl, transactionId))
  })

  paddle.Checkout.open({
    items: [{ priceId: payload.priceId, quantity: 1 }],
    customer: payload.customerEmail ? { email: payload.customerEmail } : undefined,
    customData: payload.customData,
    settings: {
      displayMode: 'overlay',
      theme: 'light',
      locale: 'en',
      successUrl,
    },
  })
}
