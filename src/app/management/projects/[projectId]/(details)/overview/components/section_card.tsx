import { useId } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { FOCUS_RING } from "../constants";
import ScrollBody from "./scroll_body";

export interface SectionCardProps {
  id?: string;
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
  headerExtra?: ReactNode;
  children: ReactNode;
  /** CSS height value, or "auto" for no limit. */
  height?: string;
  /**
   * "max"   → card shrinks to its content and scrolls past `height`
   * "fixed" → card is always exactly `height` (default, keeps cards uniform)
   */
  heightMode?: "max" | "fixed";
  scrollable?: boolean;
}

export const DEFAULT_CARD_HEIGHT = "360px";

export default function SectionCard({
  id,
  title,
  subtitle,
  action,
  headerExtra,
  children,
  height = DEFAULT_CARD_HEIGHT,
  heightMode = "fixed",
  scrollable = true,
}: SectionCardProps) {
  const titleId = useId();

  // One derived value drives both the body styling and the a11y attributes.
  const isScrollable = scrollable && height !== "auto";

  const style =
    height === "auto"
      ? undefined
      : heightMode === "fixed"
        ? { height }
        : { maxHeight: height };

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className="flex min-w-0 scroll-mt-6 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white"
      style={style}
    >
      <header className="flex shrink-0 flex-col gap-2 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
        <div className="min-w-0">
          <h2 id={titleId} className="font-semibold text-gray-900">
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
        </div>

        {(action || headerExtra) && (
          <div className="flex shrink-0 items-center gap-2">
            {headerExtra}
            {action && (
              <Link
                href={action.href}
                className={`inline-flex w-fit shrink-0 items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:text-gray-950 ${FOCUS_RING}`}
              >
                {action.label}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            )}
          </div>
        )}
      </header>

      {isScrollable ? (
        <ScrollBody labelledBy={titleId}>{children}</ScrollBody>
      ) : (
        <div className="min-w-0 overflow-visible px-5 py-5 sm:px-6">
          {children}
        </div>
      )}
    </section>
  );
}