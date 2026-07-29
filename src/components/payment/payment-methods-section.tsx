import Image from 'next/image'
import { Landmark, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const PAYMENT_METHODS = [
  { name: 'Visa', src: '/brand/payments/visa.svg', className: 'w-[56px]' },
  { name: 'PayPal', src: '/brand/payments/paypal.svg', className: 'w-[36px]' },
  { name: 'Mastercard', src: '/brand/payments/mastercard.svg', className: 'w-[36px]' },
  { name: 'American Express', src: '/brand/payments/amex.svg', className: 'w-[30px]' },
  { name: 'Apple Pay', src: '/brand/payments/apple-pay.svg', className: 'w-[56px]' },
  { name: 'Google Pay', src: '/brand/payments/google-pay.svg', className: 'w-[56px]' },
  { name: 'Maestro', src: '/brand/payments/maestro.svg', className: 'w-[36px]' },
  { name: 'Discover', src: '/brand/payments/discover.svg', className: 'w-[44px]' },
  { name: 'JCB', src: '/brand/payments/jcb.svg', className: 'w-[32px]' },
  { name: 'UnionPay', src: '/brand/payments/unionpay.svg', className: 'w-[44px]' },
  { name: 'Diners Club', src: '/brand/payments/diners-club.svg', className: 'w-[52px]' },
] as const

export function PaymentMethodsSection({ className }: { className?: string }) {
  return (
    <section className={cn('border-b border-border/70 bg-muted/20 py-12 sm:py-16', className)}>
      <div className="ds-container max-w-5xl text-center">
        <div className="flex flex-wrap items-center justify-center gap-2 text-lg font-black text-foreground sm:text-xl">
          <ShieldCheck className="h-6 w-6 text-emerald-500" aria-hidden="true" />
          <span>Safe &amp; secure payments, Powered by</span>
          <span className="mx-1 hidden h-6 w-px bg-border sm:block" aria-hidden="true" />
          <strong>Paddle</strong>
        </div>

        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          We do not store credit card information. Paddle processes every payment through
          <br className="hidden sm:block" /> encrypted, PCI-compliant checkout infrastructure.
        </p>

        <p className="mt-9 text-sm font-bold text-foreground">Accepted payment methods</p>
        <div
          className="payment-methods-rail mx-auto mt-5 max-w-4xl items-center justify-items-center"
          aria-label="Accepted payment methods"
        >
          {PAYMENT_METHODS.slice(0, 8).map((method) => (
            <div key={method.name} className="flex h-6 w-full items-center justify-center" title={method.name}>
              <Image
                src={method.src}
                alt={method.name}
                width={92}
                height={38}
                className={cn('h-5 object-contain', method.className)}
              />
            </div>
          ))}

          <div className="flex h-6 w-full items-center justify-center gap-1 text-foreground" title="Bank transfer">
            <Landmark className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
            <span className="text-left text-[7px] font-black uppercase leading-[0.9]">
              Bank
              <br />
              transfer
            </span>
          </div>

          {PAYMENT_METHODS.slice(8).map((method) => (
            <div key={method.name} className="flex h-6 w-full items-center justify-center" title={method.name}>
              <Image
                src={method.src}
                alt={method.name}
                width={92}
                height={38}
                className={cn('h-5 object-contain', method.className)}
              />
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm font-medium text-muted-foreground">
          Lifetime access with a one-time payment - no renewals or subscriptions.
        </p>
      </div>
    </section>
  )
}