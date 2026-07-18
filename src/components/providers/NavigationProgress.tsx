"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type ProgressDirection = "forward" | "reverse";

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [direction, setDirection] = useState<ProgressDirection>("forward");
  const routeKey = `${pathname ?? ""}?${searchParams?.toString() ?? ""}`;
  const prevRouteKey = useRef(routeKey);
  const historyIndexRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timerRef.current = null;
    safetyTimerRef.current = null;
    intervalRef.current = null;
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

  const start = useCallback((nextDirection: ProgressDirection = "forward") => {
    clearTimers();
    setDirection(nextDirection);
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

    // Interrupted client handlers, checkout overlays, and browser history races
    // must never leave the progress bar visible indefinitely.
    safetyTimerRef.current = setTimeout(complete, 5000);
  }, [clearTimers, complete]);

  const getHistoryIndex = useCallback((state: unknown) => {
    if (!state || typeof state !== "object") return null;
    const record = state as { idx?: unknown; index?: unknown };
    const value = record.idx ?? record.index;

    return typeof value === "number" && Number.isFinite(value) ? value : null;
  }, []);

  useEffect(() => {
    if (routeKey !== prevRouteKey.current) {
      prevRouteKey.current = routeKey;
      complete();
      historyIndexRef.current = getHistoryIndex(window.history.state);
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    }
  }, [routeKey, complete, getHistoryIndex]);

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

        start("forward");
      } catch {
        return;
      }
    }

    // Bubble phase lets client handlers cancel the click before a loader starts.
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [start]);

  // Browser back/forward buttons, trackpad gestures, and Alt+Arrow navigation
  // do not dispatch a link click, so start the loader from the history event.
  useEffect(() => {
    historyIndexRef.current = getHistoryIndex(window.history.state);

    function handlePopState(event: PopStateEvent) {
      const nextIndex = getHistoryIndex(event.state);
      const previousIndex = historyIndexRef.current;
      const nextDirection =
        previousIndex !== null && nextIndex !== null && nextIndex > previousIndex
          ? "forward"
          : "reverse";

      historyIndexRef.current = nextIndex;
      start(nextDirection);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [getHistoryIndex, start]);

  useEffect(() => {
    const handlePageShow = () => complete();
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [complete]);

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
          marginLeft: direction === "reverse" ? "auto" : undefined,
          transition: completing
            ? "width 0.2s ease-out"
            : "width 0.1s ease-out",
          transformOrigin: direction === "reverse" ? "right center" : "left center",
        }}
      />
    </div>
  );
}

