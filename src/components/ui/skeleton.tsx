import { cn } from "@/lib/utils"

/**
 * Premium skeleton loader primitive — used by all 700+ MTVerse components
 * for loading state placeholders (template cards, admin tables, dashboards,
 * settings panels, etc.).
 *
 * Design tokens:
 * - Radius: 6px (rounded-md) to match Input/Textarea
 * - Color: bg-accent with pulse animation
 * - Motion: animate-pulse (1.5s ease-in-out infinite), motion-reduce disables
 * - A11y: aria-hidden implicitly via decorative usage; pair with sr-only "Loading..." text
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md motion-reduce:animate-none", className)}
      aria-hidden="true"
      {...props}
    />
  )
}

export { Skeleton }
