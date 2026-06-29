import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Premium badge primitive — used by all 700+ components for status
 * indicators, category tags, count chips, plan badges, lock indicators,
 * trend markers, etc.
 *
 * Design tokens:
 * - Radius: 6px (rounded-md) for default, 999px (rounded-full) for pill
 * - Padding: 8px horizontal (px-2), 2px vertical (py-0.5)
 * - Font: 12px (text-xs), medium weight, tabular-nums for counts
 * - Motion: 150ms color + box-shadow transition; subtle hover lift on links
 *
 * Variants:
 * - default: primary brand accent
 * - secondary: muted neutral
 * - destructive: error / warning
 * - outline: bordered, low-emphasis
 * - success: emerald (added for premium polish)
 * - warning: amber (added for premium polish)
 */
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow,background-color] duration-150 ease-out overflow-hidden tabular-nums motion-reduce:transition-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        success:
          "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 [a&]:hover:bg-emerald-500/15",
        warning:
          "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400 [a&]:hover:bg-amber-500/15",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
