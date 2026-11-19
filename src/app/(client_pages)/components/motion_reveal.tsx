
"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

const transition = {
  duration: 0.8,
  ease: [0.22, 1, 0.36, 1] as const,
};

function useRevealProps(delay: number, y: number) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return {
      initial: false as const,
      whileInView: undefined,
      viewport: undefined,
      transition: { duration: 0 },
    };
  }

  return {
    initial: { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.18 },
    transition: { ...transition, delay },
  };
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
}: RevealProps) {
  const animation = useRevealProps(delay, y);

  return (
    <motion.div className={className} {...animation}>
      {children}
    </motion.div>
  );
}

export function RevealLi({
  children,
  className,
  delay = 0,
  y = 24,
}: RevealProps) {
  const animation = useRevealProps(delay, y);

  return (
    <motion.li className={className} {...animation}>
      {children}
    </motion.li>
  );
}

export function RevealArticle({
  children,
  className,
  delay = 0,
  y = 24,
}: RevealProps) {
  const animation = useRevealProps(delay, y);

  return (
    <motion.article className={className} {...animation}>
      {children}
    </motion.article>
  );
}
