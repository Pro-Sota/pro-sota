
"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";

export type ParallaxLayer = {
  src: string;
  alt?: string;
  depth: number;
  fit?: "cover" | "contain";
  priority?: boolean;
  className?: string;
};

type Props = {
  layers: ParallaxLayer[];
  scrollRange?: number;
  mouseRange?: number;
  ease?: number;
  className?: string;
  contentClassName?: string;
  sizes?: string;
  children?: ReactNode;
};

const clamp = (n: number, min = -1, max = 1) =>
  Math.min(max, Math.max(min, n));

export default function ParallaxLayer({
  layers,
  scrollRange = 80,
  mouseRange = 30,
  ease = 0.08,
  className = "",
  contentClassName = "",
  sizes = "100vw",
  children,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);

  const depths = useRef<number[]>([]);
  depths.current = layers.map((layer) => clamp(layer.depth));

  const smoothing = clamp(ease, 0.001, 1);

  useEffect(() => {
    const root = rootRef.current;
    const frame = frameRef.current;

    if (!root || !frame) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    if (reduceMotion.matches) return;

    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    );

    let raf = 0;
    let visible = false;
    let scrollP = 0;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    const measureScroll = () => {
      const rect = root.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      scrollP = clamp(
        (rect.top + rect.height / 2 - viewportHeight / 2) /
          (viewportHeight / 2 + rect.height / 2)
      );
    };

    const render = () => {
      depths.current.forEach((depth, index) => {
        const element = layerRefs.current[index];

        if (!element) return;

        const x = -current.x * depth * mouseRange;

        const y =
          scrollP * depth * scrollRange -
          current.y * depth * mouseRange;

        element.style.transform =
          `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      });
    };

    const tick = () => {
      raf = 0;

      current.x += (target.x - current.x) * smoothing;
      current.y += (target.y - current.y) * smoothing;

      const settled =
        Math.abs(target.x - current.x) < 0.001 &&
        Math.abs(target.y - current.y) < 0.001;

      if (settled) {
        current.x = target.x;
        current.y = target.y;
      }

      measureScroll();
      render();

      if (!settled) {
        raf = requestAnimationFrame(tick);
      }
    };

    const schedule = () => {
      if (!raf) {
        raf = requestAnimationFrame(tick);
      }
    };

    const onScroll = () => {
      if (visible) schedule();
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;

      const rect = frame.getBoundingClientRect();

      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        return;
      }

      target.x = clamp(
        ((event.clientX - rect.left) / rect.width - 0.5) * 2
      );

      target.y = clamp(
        ((event.clientY - rect.top) / rect.height - 0.5) * 2
      );

      schedule();
    };

    const onLeave = () => {
      target.x = 0;
      target.y = 0;
      schedule();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;

        if (visible) schedule();
      },
      { rootMargin: "100px" }
    );

    observer.observe(root);

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    window.addEventListener("resize", onScroll);

    if (finePointer.matches) {
      root.addEventListener("pointermove", onMove);
      root.addEventListener("pointerleave", onLeave);
    }

    schedule();

    return () => {
      observer.disconnect();

      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);

      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);

      if (raf) cancelAnimationFrame(raf);
    };
  }, [scrollRange, mouseRange, smoothing]);

  return (
    <div ref={rootRef} className="relative">
      {/* Fixed-looking pinned background */}
      <div
        ref={frameRef}
        className={`sticky top-0 z-0 -mb-[100svh] h-[100svh] overflow-hidden ${className}`}
      >
        {layers.map((layer, index) => {
          const depth = clamp(layer.depth);

          const bleed = Math.ceil(
            Math.abs(depth) * (scrollRange + mouseRange)
          );

          const decorative = !layer.alt;

          return (
            <div
              key={`${layer.src}-${index}`}
              ref={(element) => {
                layerRefs.current[index] = element;
              }}
              aria-hidden={decorative || undefined}
              className="pointer-events-none absolute will-change-transform"
              style={{ inset: -bleed }}
            >
              <Image
                src={layer.src}
                alt={layer.alt ?? ""}
                fill
                priority={layer.priority}
                sizes={sizes}
                draggable={false}
                className={`select-none ${
                  layer.fit === "contain"
                    ? "object-contain"
                    : "object-cover"
                } ${layer.className ?? ""}`}
              />
            </div>
          );
        })}
      </div>

      {/* Content scrolls over the pinned background */}
      <div className={`relative z-10 ${contentClassName}`}>
        {/* Keeps the background visible before content arrives */}
        <div className="h-[100svh]" aria-hidden="true" />

        {children}
      </div>
    </div>
  );
}
