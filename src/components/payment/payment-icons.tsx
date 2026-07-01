type PaymentIconProps = { className?: string }

export function VisaIcon({ className }: PaymentIconProps) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-hidden="true" fill="none">
      <rect width="48" height="32" rx="4" fill="#fff" stroke="#E5E7EB" strokeWidth="0.5" />
      <path d="M20.3 21.7h-2.5l1.6-9.4h2.5l-1.6 9.4zm10.3-9.2c-.5-.2-1.3-.4-2.2-.4-2.5 0-4.2 1.3-4.2 3.1 0 1.4 1.2 2.1 2.2 2.6 1 .5 1.3.8 1.3 1.2 0 .6-.8 1-1.5 1-.9 0-1.5-.1-2.3-.5l-.3-.1-.3 2c.6.3 1.6.5 2.7.5 2.6 0 4.3-1.3 4.3-3.2 0-1.1-.6-1.9-2.1-2.6-.9-.4-1.4-.7-1.4-1.2 0-.4.5-.8 1.4-.8.8 0 1.4.2 1.9.4l.2.1.3-1.8-.1.1zm6.4-.2h-1.9c-.6 0-1 .2-1.3.7l-3.6 8.7h2.6l.5-1.4h3.1l.3 1.4h2.3l-2-9.4zm-3 6.1c.2-.5 1-2.5 1-2.5l.1-.2.2-.6.1.5.6 2.7h-2v.1zM18.1 12.3l-2.3 6.4-.2-1.3c-.5-1.5-1.8-3.1-3.4-3.9l2.2 8.2h2.6l3.9-9.4h-2.8z" fill="#1434CB" />
      <path d="M13.4 12.3H9.5l0 .2c3.1.8 5.1 2.7 6 5l-.9-4.4c-.1-.6-.6-.8-1.2-.8z" fill="#F7A600" />
    </svg>
  )
}

export function MastercardIcon({ className }: PaymentIconProps) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-hidden="true" fill="none">
      <rect width="48" height="32" rx="4" fill="#fff" stroke="#E5E7EB" strokeWidth="0.5" />
      <circle cx="19" cy="16" r="8" fill="#EB001B" />
      <circle cx="29" cy="16" r="8" fill="#F79E1B" />
      <path d="M24 10.3a8 8 0 0 1 0 11.4 8 8 0 0 1 0-11.4z" fill="#FF5F00" />
    </svg>
  )
}

export function AmexIcon({ className }: PaymentIconProps) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-hidden="true" fill="none">
      <rect width="48" height="32" rx="4" fill="#2E77BC" />
      <path d="M6 16.5l1.8-4.2h2.2l1 2.3 1-2.3h2.2l-2.2 4.2 2.3 4.2h-2.2l-1.1-2.4-1.1 2.4H8.3l2.2-4.2H6zm12.4-4.2h5.3l.9 1.3.9-1.3h2l-2 2.9 2 3h-2l-.9-1.3-.9 1.3h-5.3v-5.9zm2 1.5v.9h2.5v1.2h-2.5v1h2.8l1.2-1.6-1.2-1.5h-2.8zm10.2-1.5l2.6 3v-3h1.8v5.9h-1.8l-2.6-3v3h-1.8v-5.9h1.8z" fill="white" />
    </svg>
  )
}

export function PayPalIcon({ className }: PaymentIconProps) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-hidden="true" fill="none">
      <rect width="48" height="32" rx="4" fill="#fff" stroke="#E5E7EB" strokeWidth="0.5" />
      <path d="M19.5 8h5.2c2.4 0 4.1.6 4.6 2.6.5 2.2-.2 3.6-2.1 4.6l.7 0c2 0 3.2 1.2 2.8 3.5-.4 2.6-2.3 4.3-5 4.3h-1.8c-.3 0-.6.2-.7.5l-.6 3.5c0 .2-.2.4-.5.4h-2.3c-.2 0-.4-.2-.3-.4l2.4-14.6c.1-.2.3-.4.6-.4z" fill="#003087" />
      <path d="M21 10.5l-.9 5.5h2.2c1.8 0 3.2-.8 3.5-2.7.3-1.8-.7-2.8-2.6-2.8h-2.2z" fill="#fff" />
      <path d="M15 12h5.2c2.4 0 3.8.9 3.4 3.2-.4 2.6-2.3 4-4.8 4h-1.5c-.3 0-.6.2-.7.5l-.5 3c0 .2-.2.4-.5.4h-2c-.2 0-.4-.2-.3-.4l2-10.3c.1-.2.3-.4.6-.4z" fill="#009CDE" />
    </svg>
  )
}

export function ApplePayIcon({ className }: PaymentIconProps) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-hidden="true" fill="none">
      <rect width="48" height="32" rx="4" fill="#fff" stroke="#E5E7EB" strokeWidth="0.5" />
      <path d="M15.2 11.3c-.5.6-1.2 1-2 .9-.1-.8.3-1.6.7-2.1.5-.6 1.3-1 2-.9.1.8-.2 1.5-.7 2.1zm.7 1.1c-1.1-.1-2.1.6-2.6.6-.5 0-1.4-.6-2.2-.6-1.2 0-2.2.7-2.8 1.7-1.2 2.1-.3 5.1.8 6.8.6.8 1.2 1.7 2.1 1.7.8 0 1.2-.5 2.2-.5s1.3.5 2.2.5 1.5-.8 2-1.7c.6-1 .9-1.9.9-2-.1 0-1.7-.7-1.7-2.6 0-1.6 1.3-2.4 1.4-2.5-.8-1.1-2-1.3-2.4-1.3z" fill="#000" />
      <path d="M24.3 10.2c2.4 0 4 1.6 4 4s-1.7 4.1-4.1 4.1h-2.6l-.9 3.6h-1.9l2.5-11.7h3zm-2.1 6.4h2.2c1.6 0 2.6-1.1 2.6-2.7 0-1.2-.8-2-2.3-2H23l-.8 4.7zm8 2c0-1.6 1.2-2.5 3.4-2.7l2.5-.1v-.7c0-1-.7-1.6-1.8-1.6-1 0-1.7.5-1.8 1.2h-1.7c.1-1.6 1.4-2.7 3.6-2.7 2.1 0 3.5 1.1 3.5 2.9v6h-1.8v-1.4c-.5 1-1.6 1.6-2.8 1.6-1.7 0-3-.9-3-2.4zm5.9-.8v-.7l-2.3.1c-1.1.1-1.7.5-1.7 1.3 0 .7.7 1.2 1.6 1.2 1.3 0 2.4-.9 2.4-2z" fill="#000" />
      <path d="M39.7 22.6l1.4-4-2.7-8.2h2l1.7 5.7 1.7-5.7h2l-4 12.2h-2z" fill="#000" />
    </svg>
  )
}

export function GooglePayIcon({ className }: PaymentIconProps) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-hidden="true" fill="none">
      <rect width="48" height="32" rx="4" fill="#fff" stroke="#E5E7EB" strokeWidth="0.5" />
      <path d="M22.7 16.3v3.5h-1.1v-8.6h3c.7 0 1.4.3 1.9.7.5.5.8 1.1.8 1.8s-.3 1.4-.8 1.8c-.5.5-1.1.7-1.9.7h-1.9zm0-4v3h2c.4 0 .8-.2 1.1-.5.3-.3.4-.7.4-1s-.2-.7-.4-1c-.3-.3-.7-.5-1.1-.5h-2z" fill="#5F6368" />
      <path d="M29 13.6c.8 0 1.5.2 2 .7.5.5.8 1.1.8 1.9v3.6h-1.1v-.8c-.4.6-1 1-1.9 1-.7 0-1.3-.2-1.7-.6-.4-.4-.7-.9-.7-1.4 0-.6.2-1 .7-1.4.4-.4 1-.5 1.8-.5.7 0 1.2.1 1.7.4v-.3c0-.5-.2-.8-.5-1.1-.3-.3-.7-.4-1.2-.4-.7 0-1.2.3-1.5.8l-1-.4c.5-.9 1.4-1.4 2.6-1.4zm-1.5 4.6c0 .3.1.6.4.8.3.2.6.3.9.3.5 0 1-.2 1.4-.6.4-.4.6-.8.6-1.3-.4-.3-.9-.4-1.6-.4-.5 0-.9.1-1.2.3-.3.2-.5.5-.5.9z" fill="#5F6368" />
      <path d="M36 13.8l-3.7 8.5h-1.2l1.4-3-2.4-5.5h1.2l1.7 4.1 1.7-4.1H36z" fill="#5F6368" />
      <path d="M19.3 16c0-.3 0-.6-.1-.9h-4.7v1.7h2.7c-.1.7-.4 1.2-.9 1.6v1.3h1.5c.9-.8 1.4-2 1.4-3.5l.1-.2z" fill="#4285F4" />
      <path d="M14.5 20c1.2 0 2.2-.4 2.9-1.1l-1.4-1.1c-.4.3-.9.4-1.5.4-1.2 0-2.1-.8-2.5-1.8H11v1.1c.7 1.5 2.1 2.5 3.5 2.5z" fill="#34A853" />
      <path d="M12 16.3c-.1-.3-.2-.6-.2-.9s.1-.6.2-.9v-1.1h-1.5c-.3.6-.5 1.3-.5 2s.2 1.4.5 2l1.5-1.1z" fill="#FBBC05" />
      <path d="M14.5 12.7c.6 0 1.2.2 1.7.7l1.3-1.3c-.8-.7-1.8-1.2-3-1.2-1.5 0-2.8 1-3.5 2.5l1.5 1.1c.4-1.1 1.3-1.8 2-1.8z" fill="#EA4335" />
    </svg>
  )
}

export function PaddleIcon({ className }: PaymentIconProps) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-hidden="true" fill="none">
      <rect width="48" height="32" rx="4" fill="#fff" stroke="#E5E7EB" strokeWidth="0.5" />
      <path d="M13 19.5c0 1.6 1.3 2.5 3 2.5 2.3 0 3.7-1.3 4.1-3.3l.9-4.4h-2l-.8 3.8c-.2 1.2-1 2-2.2 2-.9 0-1.4-.5-1.2-1.4l.9-4.4h-2l-.7 5.2z" fill="#4D4D4D" />
      <circle cx="32" cy="16" r="5" fill="#FDDE00" />
      <path d="M31 14.5c0-.3.2-.5.5-.5h1c.3 0 .5.2.5.5v3c0 .3-.2.5-.5.5h-1c-.3 0-.5-.2-.5-.5v-3z" fill="#4D4D4D" />
    </svg>
  )
}
