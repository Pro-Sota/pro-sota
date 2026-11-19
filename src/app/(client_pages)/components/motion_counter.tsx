
"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";

type MotionCounterProps = {
  value: number | string;
  duration?: number;
  className?: string;
};

export default function MotionCounter({
  value,
  duration = 1.8,
  className,
}: MotionCounterProps) {
  const shouldReduceMotion = useReducedMotion();

  const rawValue = String(value);
  const match = rawValue.match(/^(\d+(?:[.,]\d+)?)(.*)$/);

  const target = match
    ? Number(match[1].replace(",", "."))
    : 0;

  const suffix = match?.[2] ?? "";

  const count = useMotionValue(shouldReduceMotion ? target : 0);

  const rounded = useTransform(count, (latest) => {
    return `${Math.round(latest).toLocaleString("pt-AO")}${suffix}`;
  });

  return (
    <motion.span
      className={className}
      onViewportEnter={() => {
        if (shouldReduceMotion || !match) return;

        animate(count, target, {
          duration,
          ease: [0.16, 1, 0.3, 1],
        });
      }}
      viewport={{ once: true, amount: 0.7 }}
    >
      {rounded}
    </motion.span>
  );
}
