import type { ReactNode } from "react";

export const pad = "px-6 md:px-12 lg:px-20";
export const wrap = "mx-auto w-full max-w-[1600px]";

const tones = {
  paper: "bg-paper text-navy",
  stone: "bg-stone text-navy",
  navy: "bg-navy text-paper",
  gold: "bg-gold text-navy",
} as const;

type SectionProps = {
  id?: string;
  tone?: keyof typeof tones;
  className?: string;
  children: ReactNode;
  /** false for full-bleed sections that manage their own container */
  contained?: boolean;
};

export function Section({ id, tone = "paper", className = "", contained = true, children }: SectionProps) {
  return (
    <section id={id} className={`${pad} ${tones[tone]} scroll-mt-24 py-16 md:py-24 ${className}`}>
      {contained ? <div className={wrap}>{children}</div> : children}
    </section>
  );
}

export function Eyebrow({ children, className = "text-gold-ink" }: { children: ReactNode; className?: string }) {
  return <p className={`text-sm font-medium ${className}`}>{children}</p>;
}

export function H2({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`font-display text-[clamp(1.375rem,2vw,1.875rem)] font-medium leading-[1.12] tracking-[-0.02em] ${className}`}>
      {children}
    </h2>
  );
}