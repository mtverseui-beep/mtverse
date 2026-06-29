"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [completing, setCompleting] = useState(false);
  const routeKey = `${pathname ?? ""}?${searchParams?.toString() ?? ""}`;
  const prevRouteKey = useRef(routeKey);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const complete = useCallback(() => {
    clearTimers();
    setCompleting(true);
    setProgress(100);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
      setCompleting(false);
    }, 400);
  }, [clearTimers]);

  const start = useCallback(() => {
    clearTimers();
    setVisible(true);
    setCompleting(false);
    setProgress(15);

    let current = 15;
    intervalRef.current = setInterval(() => {
      const increment =
        current < 40 ? 8 : current < 65 ? 4 : current < 80 ? 1.5 : 0.5;
      current = Math.min(current + increment, 85);
      setProgress(current);
      if (current >= 85) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 100);
  }, [clearTimers]);

  useEffect(() => {
    if (routeKey !== prevRouteKey.current) {
      prevRouteKey.current = routeKey;
      complete();
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    }
  }, [routeKey, complete]);

  // Listen for navigation start via link clicks
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      if (target.target && target.target !== "_self") return;
      if (target.hasAttribute("download")) return;
      if (target.closest('[data-no-loader="true"]')) return;

      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;

      try {
        const nextUrl = new URL(href, window.location.origin);
        if (nextUrl.origin !== window.location.origin) return;

        const currentUrl = new URL(window.location.href);
        if (nextUrl.href === currentUrl.href) return;
        if (nextUrl.pathname === currentUrl.pathname && nextUrl.search === currentUrl.search) return;

        start();
      } catch {
        return;
      }
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () =>
      document.removeEventListener("click", handleClick, { capture: true });
  }, [start]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-[9999] h-[3px] overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="h-full bg-[#465fff]"
        style={{
          width: `${progress}%`,
          transition: completing
            ? "width 0.2s ease-out"
            : "width 0.1s ease-out",
          transformOrigin: "left center",
        }}
      />
    </div>
  );
}
