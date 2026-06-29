import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

type UniverseTopBarItem = {
  label: string;
  href?: string;
};

export default function UniverseTopBar({
  items,
}: {
  items: UniverseTopBarItem[];
  actionName: string;
  actionSlug: string;
}) {
  return (
    <div className="mx-auto w-full max-w-[1380px] bg-transparent px-3 py-1.5 sm:px-6 sm:py-2 lg:px-8">
      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 items-center gap-1 overflow-hidden text-[11px] font-semibold leading-5 text-muted-foreground sm:gap-1.5 sm:text-xs"
      >
        <Link
          href="/"
          aria-label="Home"
          className="inline-flex size-6 shrink-0 items-center justify-center text-muted-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Home className="size-3.5" aria-hidden="true" />
        </Link>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isMiddleMobile = items.length > 2 && index > 0 && !isLast;
          return (
            <span
              key={`${item.label}-${index}`}
              className={`flex min-w-0 items-center gap-1 ${isMiddleMobile ? "hidden sm:flex" : ""}`}
            >
              <ChevronRight className="size-3 shrink-0 text-muted-foreground/45 sm:size-3.5" />
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="min-w-0 max-w-[34vw] cursor-pointer truncate transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-none"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className="min-w-0 flex-1 truncate font-semibold text-foreground sm:flex-none"
                >
                  {item.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
