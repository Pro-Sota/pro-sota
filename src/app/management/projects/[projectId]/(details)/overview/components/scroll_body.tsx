"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { FOCUS_RING_INSET } from "../constants";

/**
 * Scrollable card body. It only becomes a focusable region while its
 * content actually overflows, so short cards add no pointless tab stops.
 */
export default function ScrollBody({
  children,
  labelledBy,
}: {
  children: ReactNode;
  labelledBy: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => setOverflowing(el.scrollHeight > el.clientHeight + 1);
    check();

    const observer = new ResizeObserver(check);
    observer.observe(el);
    Array.from(el.children).forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [children]);

  return (
    <div
      ref={ref}
      {...(overflowing && {
        role: "region",
        "aria-labelledby": labelledBy,
        tabIndex: 0,
      })}
      className={`min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-auto px-5 py-5 sm:px-6 ${FOCUS_RING_INSET}`}
    >
      {children}
    </div>
  );
}