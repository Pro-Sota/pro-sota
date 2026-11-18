"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Distance from the top of the window, in px, where the element freezes. */
  offset?: number;
  /** The pin only runs while this media query matches. Default: desktop. */
  mediaQuery?: string;
  className?: string;
};

/**
 * Freezes its children at `offset` px from the top of the window and keeps
 * them completely still until the pin container ends, then lets them leave
 * with it. The container is the closest ancestor marked `data-pin-container`
 * (falls back to the parent element).
 *
 * The frozen element sits at z-index 0: give the content that should pass
 * over it `relative z-10` and an opaque background.
 *
 * Three phases: normal flow → frozen (position: fixed) → end (position:
 * absolute at the container's bottom, so the browser scrolls it natively and
 * it never lags behind the content). The container must be `position:
 * relative`; give it `clip-path: inset(0)` as well so the title can never be
 * seen outside it, even for a frame.
 *
 * Driven by useEffect, so it works inside ancestors with overflow set
 * (where CSS position: sticky breaks).
 */
export default function PinnedTitle({
  children,
  offset = 128,
  mediaQuery = "(min-width: 1024px)",
  className = "",
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const inner = innerRef.current;
    if (!wrapper || !inner) return;
    const container =
      wrapper.closest<HTMLElement>("[data-pin-container]") ??
      wrapper.parentElement;
    if (!container) return;

    const mq = window.matchMedia(mediaQuery);
    let raf = 0;
    let mode: "flow" | "fixed" | "end" = "flow";

    const unpin = () => {
      inner.style.position = "";
      inner.style.top = "";
      inner.style.bottom = "";
      inner.style.left = "";
      inner.style.width = "";
      inner.style.zIndex = "";
      inner.style.visibility = "";
      mode = "flow";
    };

    const update = () => {
      raf = 0;

      if (!mq.matches) {
        unpin();
        wrapper.style.height = "";
        return;
      }

      // The wrapper keeps the element's space in the layout while it is out of flow
      const h = inner.offsetHeight;
      if (wrapper.style.height !== `${h}px`) wrapper.style.height = `${h}px`;

      const w = wrapper.getBoundingClientRect();
      const c = container.getBoundingClientRect();

      // Once the container has left the window the title is gone for good
      inner.style.visibility = c.bottom <= 0 ? "hidden" : "";

      if (w.top > offset) {
        // Not reached yet: normal flow
        if (mode !== "flow") unpin();
        return;
      }

      if (c.bottom - h > offset) {
        // Frozen at the window offset
        if (mode === "end") unpin();
        inner.style.position = "fixed";
        inner.style.top = `${offset}px`;
        inner.style.left = `${w.left}px`;
        inner.style.width = `${w.width}px`;
        inner.style.zIndex = "0";
        mode = "fixed";
      } else {
        // Container is ending: rest on its bottom edge and scroll away with
        // it natively (no JS in the loop, so no lag and no flash)
        if (mode !== "end") {
          unpin();
          inner.style.position = "absolute";
          inner.style.bottom = "0";
          inner.style.zIndex = "0";
          mode = "end";
        }
        inner.style.left = `${w.left - c.left}px`;
        inner.style.width = `${w.width}px`;
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    mq.addEventListener("change", schedule);

    const ro = new ResizeObserver(schedule);
    ro.observe(container);
    ro.observe(inner);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      mq.removeEventListener("change", schedule);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
      unpin();
      wrapper.style.height = "";
    };
  }, [offset, mediaQuery]);

  return (
    <div ref={wrapperRef} className={className}>
      <div ref={innerRef}>{children}</div>
    </div>
  );
}