"use client";

import { useEffect, useRef } from "react";

type Options = {
  onProgress?: (p: number) => void;
  /** Pinning only runs while this media query matches. Default: desktop. */
  mediaQuery?: string;
};

/**
 * Writes scroll progress (0 → 1) of the track to its CSS variable `--p`.
 * Below the media query (or with reduced motion) `--p` stays at 0.
 */
export function usePinnedParallax<T extends HTMLElement = HTMLDivElement>({
  onProgress,
  mediaQuery = "(min-width: 1024px)",
}: Options = {}) {
  const ref = useRef<T>(null);
  const cb = useRef(onProgress);
  cb.current = onProgress;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const enabled = window.matchMedia(mediaQuery);
    let raf = 0;
    let last = -1;

    const update = () => {
      raf = 0;
      let p = 0;
      if (enabled.matches && !reduce.matches) {
        const rect = el.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      }
      if (p === last) return;
      last = p;
      el.style.setProperty("--p", p.toFixed(4));
      cb.current?.(p);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [mediaQuery]);

  return ref;
}