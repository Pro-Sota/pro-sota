
import type { CSSProperties } from "react";

/*
 * Paleta e texturas CSS das cenas.
 * Os gradientes simulam luz, vidro e caixilharia.
 */

export const C = {
  navy: "#002950",
  navyMid: "#0c3a68",
  navySoft: "#17497c",

  gold: "#bd9655",
  goldLight: "#e2c690",
  goldDim: "#8c7245",

  stone: "#c7c2b6",
  stoneDark: "#a19c90",
  stoneLight: "#e3ddcf",

  concrete: "#9aa3ac",
  concreteDark: "#6b7178",

  earth: "#8a6a4a",
  earthDark: "#6b4f36",

  leaf: "#4f6b4a",
  leafDark: "#3a5136",

  bark: "#5c4a36",
} as const;

export type FaceKind = "top" | "front" | "side";

export interface WindowBackgroundOptions {
  gap?: number;
  mullion?: number;
  kind?: FaceKind;
  lit?: boolean;
}

/**
 * Escolhe a iluminação simulada conforme a orientação da face.
 */
export function shade(kind: FaceKind): string {
  if (kind === "top") {
    return "linear-gradient(125deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,.08) 45%, rgba(0,0,0,.05) 100%)";
  }

  if (kind === "front") {
    return "linear-gradient(180deg, rgba(255,255,255,.16) 0%, rgba(255,255,255,0) 30%, rgba(5,18,33,.28) 100%)";
  }

  return "linear-gradient(180deg, rgba(0,0,0,.12) 0%, rgba(5,18,33,.05) 30%, rgba(5,18,33,.5) 100%)";
}

/**
 * Combina uma cor base com o gradiente de iluminação de uma face.
 */
export function solidFace(
  base: string,
  kind: FaceKind,
): CSSProperties {
  return {
    background: base,
    backgroundImage: shade(kind),
  };
}

/**
 * Sobrepõe iluminação e grelhas repetidas para simular janelas.
 * gap: espaçamento entre elementos.
 * mullion: espessura dos caixilhos.
 */
export function windowsBg(
  base: string,
  options: WindowBackgroundOptions = {},
): CSSProperties {
  const {
    gap = 22,
    mullion = 3,
    kind = "front",
    lit = false,
  } = options;

  const tint = lit
    ? "rgba(255,224,168,.9)"
    : "rgba(226,198,144,.55)";

  const glassSheen =
    "linear-gradient(115deg, transparent 32%, rgba(255,255,255,.22) 46%, transparent 60%)";

  const sillTint = lit
    ? "rgba(255,214,140,.12)"
    : "rgba(8,20,38,.16)";

  return {
    background: base,
    backgroundImage: [
      shade(kind),
      glassSheen,
      `repeating-linear-gradient(90deg, ${tint} 0 ${mullion}px, ${sillTint} ${mullion}px ${gap}px)`,
      `repeating-linear-gradient(0deg, ${tint} 0 ${mullion}px, transparent ${mullion}px ${gap + 9}px)`,
    ].join(","),
  };
}
