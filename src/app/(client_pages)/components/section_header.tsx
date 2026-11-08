import type { ReactNode } from "react";

interface SectionHeaderProps {
  eyebrow: string;
  children: ReactNode;
  tone?: "light" | "dark";
}

export default function SectionHeader({
  eyebrow,
  children,
  tone = "light",
}: SectionHeaderProps) {
  const dark = tone === "dark";

  return (
    <div>
      <div className="mb-7 flex items-center gap-3">
        <span
          className="h-px w-10 bg-gold"
          aria-hidden="true"
        />

        <span
          className={`text-xs font-semibold uppercase tracking-[0.22em] ${
            dark ? "text-white/70" : "text-mute"
          }`}
        >
          {eyebrow}
        </span>
      </div>

      <h2
        className={`text-5xl font-semibold leading-[0.98] tracking-[-0.055em] md:text-7xl ${
          dark ? "" : "text-navy"
        }`}
      >
        {children}
      </h2>
    </div>
  );
}