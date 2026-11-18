
import type { ReactNode } from "react";

interface PinnedTitleProps {
  children: ReactNode;
  offset?: number;
  className?: string;
}

export default function PinnedTitle({
  children,
  offset = 128,
  className = "",
}: PinnedTitleProps) {
  return (
    <div
      className={`sticky z-0 w-full ${className}`}
      style={{ top: `${offset}px` }}
    >
      {children}
    </div>
  );
}
