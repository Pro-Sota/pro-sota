// src/scene3d/materials.ts
/*
 * Paleta e texturas CSS das cenas: gradientes simulam luz, vidro e caixilharia.
 * As funções devolvem objectos compatíveis com a propriedade style do React.
 */

import type { CSSProperties } from "react";

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

export type ShadeKind = "top" | "front" | "side";

type WindowOptions = {
  gap?: number;
  mullion?: number;
  kind?: ShadeKind;
  lit?: boolean;
};

// Escolhe iluminação simulada conforme a orientação da face: top, front ou lateral.
export function shade(kind: ShadeKind = "side"): string {
  if (kind === "top") {
    return "linear-gradient(125deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,.08) 45%, rgba(0,0,0,.05) 100%)";
  }

  if (kind === "front") {
    return "linear-gradient(180deg, rgba(255,255,255,.16) 0%, rgba(255,255,255,0) 30%, rgba(5,18,33,.28) 100%)";
  }

  return "linear-gradient(180deg, rgba(0,0,0,.12) 0%, rgba(5,18,33,.05) 30%, rgba(5,18,33,.5) 100%)";
}

// Combina a cor base com o gradiente de iluminação de uma face.
export function solidFace(
  base: CSSProperties["backgroundColor"],
  kind: ShadeKind = "side",
): CSSProperties {
  return {
    background: base,
    backgroundImage: shade(kind),
  };
}

// Sobrepõe luz e grelhas repetidas; gap controla o espaçamento e mullion a espessura dos caixilhos.
export function windowsBg(
  base: CSSProperties["backgroundColor"],
  options: WindowOptions = {},
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
      `repeating-linear-gradient(90deg,${tint} 0 ${mullion}px, ${sillTint} ${mullion}px ${gap}px)`,
      `repeating-linear-gradient(0deg,${tint} 0 ${mullion}px, transparent ${mullion}px ${gap + 9}px)`,
    ].join(","),
  };
}