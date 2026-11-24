"use client";

import { useEffect } from "react";

export default function HeroAnimation() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".ps-hero");
    if (!hero) return;

    const cleanups: Array<() => void> = [];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* 1. Pause all animations while the hero is off-screen */
    const io = new IntersectionObserver(([entry]) => {
      hero.classList.toggle("is-paused", !entry.isIntersecting);
    });
    io.observe(hero);
    cleanups.push(() => io.disconnect());

    /* 2. Ensure draw paths have pathLength="1" */
    hero.querySelectorAll(".ps-scene__draw-path").forEach((path) => {
      if (path.getAttribute("pathLength") !== "1") path.setAttribute("pathLength", "1");
    });

    /* 3. Ticker: constant speed regardless of width */
    const track = hero.querySelector<HTMLElement>(".ps-hero__strip-track");
    if (track && !reduced) {
      const PX_PER_SECOND = 55;
      const setSpeed = () => {
        const half = track.scrollWidth / 2;
        if (half > 0) {
          track.style.setProperty("--ticker-duration", `${(half / PX_PER_SECOND).toFixed(1)}s`);
        }
      };
      setSpeed();
      const ro = new ResizeObserver(setSpeed);
      ro.observe(track);
      cleanups.push(() => ro.disconnect());
      document.fonts?.ready.then(setSpeed);
    }

    /* 4. Pointer depth (desktop, hover devices only) */
    const scene = hero.querySelector<HTMLElement>(".ps-hero__scene");
    const canTilt = matchMedia(
      "(hover: hover) and (min-width: 801px) and (prefers-reduced-motion: no-preference)"
    ).matches;

    if (scene && canTilt) {
      let tx = 0, ty = 0, cx = 0, cy = 0;
      let raf: number | null = null;

      const loop = () => {
        cx += (tx - cx) * 0.08;
        cy += (ty - cy) * 0.08;
        scene.style.translate = `${cx.toFixed(2)}px ${cy.toFixed(2)}px`;
        raf =
          Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05
            ? requestAnimationFrame(loop)
            : null;
      };

      const onMove = (e: PointerEvent) => {
        if (hero.classList.contains("is-paused")) return;
        tx = (e.clientX / innerWidth - 0.5) * 2 * -8;
        ty = (e.clientY / innerHeight - 0.5) * 2 * -6;
        if (raf === null) raf = requestAnimationFrame(loop);
      };

      addEventListener("pointermove", onMove, { passive: true });
      cleanups.push(() => {
        removeEventListener("pointermove", onMove);
        if (raf !== null) cancelAnimationFrame(raf);
        scene.style.translate = "";
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}