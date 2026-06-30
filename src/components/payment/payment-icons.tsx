type PaymentIconProps = { className?: string }

export function VisaIcon({ className }: PaymentIconProps) {
  return (
    <svg viewBox="0 0 88 32" className={className} aria-hidden="true">
      <rect width="88" height="32" rx="8" fill="#1434CB" />
      <text x="44" y="21" textAnchor="middle" fontSize="16" fontWeight="800" fill="white" letterSpacing="1.2">VISA</text>
    </svg>
  )
}

export function MastercardIcon({ className }: PaymentIconProps) {
  return (
    <svg viewBox="0 0 88 32" className={className} aria-hidden="true">
      <rect width="88" height="32" rx="8" fill="#111827" />
      <circle cx="37" cy="16" r="9" fill="#EB001B" />
      <circle cx="51" cy="16" r="9" fill="#F79E1B" fillOpacity="0.9" />
    </svg>
  )
}

export function AmexIcon({ className }: PaymentIconProps) {
  return (
    <svg viewBox="0 0 88 32" className={className} aria-hidden="true">
      <rect width="88" height="32" rx="8" fill="#2E77BB" />
      <text x="44" y="21" textAnchor="middle" fontSize="14" fontWeight="900" fill="white" letterSpacing="0.7">AMEX</text>
    </svg>
  )
}

export function PayPalIcon({ className }: PaymentIconProps) {
  return (
    <svg viewBox="0 0 88 32" className={className} aria-hidden="true">
      <rect width="88" height="32" rx="8" fill="#F8FAFC" />
      <text x="38" y="21" textAnchor="middle" fontSize="13" fontWeight="900" fill="#003087">Pay</text>
      <text x="55" y="21" textAnchor="middle" fontSize="13" fontWeight="900" fill="#009CDE">Pal</text>
    </svg>
  )
}

export function ApplePayIcon({ className }: PaymentIconProps) {
  return (
    <svg viewBox="0 0 88 32" className={className} aria-hidden="true">
      <rect width="88" height="32" rx="8" fill="#000" />
      <text x="44" y="21" textAnchor="middle" fontSize="14" fontWeight="800" fill="white">Apple Pay</text>
    </svg>
  )
}

export function GooglePayIcon({ className }: PaymentIconProps) {
  return (
    <svg viewBox="0 0 88 32" className={className} aria-hidden="true">
      <rect width="88" height="32" rx="8" fill="#fff" stroke="#E5E7EB" />
      <text x="28" y="21" textAnchor="middle" fontSize="15" fontWeight="900" fill="#4285F4">G</text>
      <text x="55" y="21" textAnchor="middle" fontSize="14" fontWeight="800" fill="#111827">Pay</text>
    </svg>
  )
}

export function PaddleIcon({ className }: PaymentIconProps) {
  return (
    <svg viewBox="0 0 88 32" className={className} aria-hidden="true">
      <rect width="88" height="32" rx="8" fill="#4F46E5" />
      <text x="44" y="21" textAnchor="middle" fontSize="14" fontWeight="900" fill="white">Paddle</text>
    </svg>
  )
}