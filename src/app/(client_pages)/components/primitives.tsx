// src/scene3d/Primitives.tsx

import type { CSSProperties, ReactNode } from "react";
import { C, solidFace } from "./materials";

type FaceStyle = CSSProperties;

type CuboidProps = {
  x?: number;
  y?: number;
  z?: number;
  w?: number;
  h?: number;
  d?: number;
  top?: string;
  front?: string;
  side?: string;
  topStyle?: FaceStyle;
  frontStyle?: FaceStyle;
  sideStyle?: FaceStyle;
};

// Monta as três faces visíveis de um volume.
export function Cuboid({
  x = 0,
  y = 0,
  z = 0,
  w = 40,
  h = 40,
  d = 40,
  top,
  front,
  side,
  topStyle,
  frontStyle,
  sideStyle,
}: CuboidProps) {
  const topFace = topStyle || solidFace(top || C.stoneLight, "top");
  const frontFace = frontStyle || solidFace(front || C.navySoft, "front");
  const sideFace = sideStyle || solidFace(side || C.navyMid, "side");

  return (
    <div
      className="mcube"
      style={{ transform: `translate3d(${x}px,${y}px,${z}px)` }}
    >
      <div
        className="mface mface--top"
        style={{
          width: w,
          height: d,
          transform: `translate(-50%,-50%) rotateX(90deg) translateZ(${-h / 2}px)`,
          ...topFace,
        }}
      />

      <div
        className="mface mface--front"
        style={{
          width: w,
          height: h,
          transform: `translate(-50%,-50%) translateZ(${d / 2}px)`,
          ...frontFace,
        }}
      />

      <div
        className="mface mface--side"
        style={{
          width: d,
          height: h,
          transform: `translate(-50%,-50%) rotateY(90deg) translateZ(${w / 2}px)`,
          ...sideFace,
        }}
      />
    </div>
  );
}

type GroundPlaneProps = {
  y?: number;
  w?: number;
  d?: number;
  color?: string;
  line?: string;
};

// Cria o plano horizontal de apoio da cena.
export function GroundPlane({
  y = 92,
  w = 260,
  d = 240,
  color,
  line,
}: GroundPlaneProps) {
  return (
    <div
      className="mcube"
      style={{ transform: `translate3d(0px,${y}px,0px)` }}
    >
      <div
        className="mface mface--ground"
        style={{
          width: w,
          height: d,
          transform: "translate(-50%,-50%) rotateX(90deg)",
          background: color || "rgba(226,198,144,.045)",
          backgroundImage:
            "radial-gradient(120% 90% at 30% 20%, rgba(255,255,255,.05), transparent 60%)",
          border: `1px solid ${line || "rgba(226,198,144,.25)"}`,
        }}
      />
    </div>
  );
}

type ShadowBlobProps = {
  x?: number;
  y?: number;
  z?: number;
  w?: number;
  d?: number;
};

// Simula sombra no chão com um gradiente radial.
export function ShadowBlob({
  x = 0,
  y = 91,
  z = 0,
  w = 140,
  d = 140,
}: ShadowBlobProps) {
  return (
    <div
      className="mcube"
      style={{ transform: `translate3d(${x}px,${y}px,${z}px)` }}
    >
      <div
        className="mface"
        style={{
          width: w,
          height: d,
          transform: "translate(-50%,-50%) rotateX(90deg)",
          background:
            "radial-gradient(closest-side, rgba(0,0,0,.42), transparent 72%)",
          boxShadow: "none",
        }}
      />
    </div>
  );
}

type ThinLineProps = {
  x: number;
  y: number;
  z: number;
  len: number;
  w?: number;
  color?: string;
  rot?: number;
};

// Desenha uma linha plana; rot aplica uma rotação local em graus.
export function ThinLine({
  x,
  y,
  z,
  len,
  w = 1,
  color,
  rot,
}: ThinLineProps) {
  return (
    <div
      className="mcube"
      style={{ transform: `translate3d(${x}px,${y}px,${z}px)` }}
    >
      <div
        className="mface"
        style={{
          width: w,
          height: len,
          background: color || "rgba(226,198,144,.55)",
          boxShadow: "none",
          transform: `translate(-50%,-50%)${rot ? ` rotate(${rot}deg)` : ""}`,
        }}
      />
    </div>
  );
}

type PositionProps = {
  x: number;
  y: number;
  z: number;
};

type ShrubProps = PositionProps & {
  r?: number;
};

// Compõe um arbusto com um volume baixo e topo arredondado.
export function Shrub({ x, y, z, r = 10 }: ShrubProps) {
  return (
    <Cuboid
      x={x}
      y={y - r * 0.6}
      z={z}
      w={r * 1.8}
      h={r * 1.2}
      d={r * 1.8}
      topStyle={{
        background: C.leaf,
        backgroundImage: `radial-gradient(circle at 35% 30%, ${C.leaf}, ${C.leafDark} 78%)`,
        borderRadius: "50%",
      }}
      front={C.leafDark}
      side="#2c3d29"
    />
  );
}

type HedgeProps = PositionProps & {
  w?: number;
};

// Cria uma sebe rectangular reutilizável.
export function Hedge({ x, y, z, w = 60 }: HedgeProps) {
  return (
    <Cuboid
      x={x}
      y={y}
      z={z}
      w={w}
      h={10}
      d={10}
      top="#5c7a53"
      front={C.leafDark}
      side="#33472f"
    />
  );
}

type BalconyRailProps = PositionProps & {
  w: number;
};

// Simula barras horizontais e verticais da guarda com gradientes.
export function BalconyRail({ x, y, z, w }: BalconyRailProps) {
  return (
    <div
      className="mcube"
      style={{ transform: `translate3d(${x}px,${y}px,${z}px)` }}
    >
      <div
        className="mface"
        style={{
          width: w,
          height: 16,
          transform: "translate(-50%,-100%)",
          boxShadow: "none",
          background:
            "linear-gradient(180deg, rgba(226,198,144,.85), rgba(226,198,144,.85) 12%, transparent 12%, transparent 88%, rgba(226,198,144,.85) 88%)," +
            "repeating-linear-gradient(90deg, rgba(226,198,144,.7) 0 2px, transparent 2px 10px)",
        }}
      />
    </div>
  );
}

type DoorFaceProps = PositionProps & {
  w?: number;
  h?: number;
};

// Representa uma porta como volume de profundidade reduzida.
export function DoorFace({
  x,
  y,
  z,
  w = 18,
  h = 28,
}: DoorFaceProps) {
  return (
    <Cuboid
      x={x}
      y={y}
      z={z}
      w={w}
      h={h}
      d={2}
      top={C.goldDim}
      front="#0c1f30"
      side={C.goldDim}
    />
  );
}

type PlinthProps = PositionProps & {
  w: number;
  d: number;
  h?: number;
};

// Acrescenta uma base ou rodapé ao edifício.
export function Plinth({
  x,
  y,
  z,
  w,
  d,
  h = 10,
}: PlinthProps) {
  return (
    <Cuboid
      x={x}
      y={y}
      z={z}
      w={w}
      h={h}
      d={d}
      top="#5a5650"
      front="#3d3a35"
      side="#2c2a26"
    />
  );
}

type TrimBandProps = PositionProps & {
  w: number;
  d?: number;
};

// Acrescenta uma faixa horizontal dourada à fachada.
export function TrimBand({
  x,
  y,
  z,
  w,
  d = 6,
}: TrimBandProps) {
  return (
    <Cuboid
      x={x}
      y={y}
      z={z}
      w={w}
      h={3}
      d={d}
      top={C.goldLight}
      front={C.goldDim}
      side={C.goldDim}
    />
  );
}

// Agrupa dois volumes que representam equipamento de cobertura.
export function RoofPlant({ x, y, z }: PositionProps) {
  return (
    <>
      <Cuboid
        x={x}
        y={y - 5}
        z={z}
        w={20}
        h={10}
        d={14}
        top="#cfd3d6"
        front="#aab0b5"
        side="#8d9296"
      />

      <Cuboid
        x={x + 30}
        y={y - 9}
        z={z + 2}
        w={14}
        h={18}
        d={14}
        top="#3d4750"
        front="#2b333a"
        side="#1e242a"
      />
    </>
  );
}

// Repete três linhas para representar varões de espera na estrutura.
export function WaitingBars({ x, y, z }: PositionProps) {
  return (
    <>
      {[-3, 0, 3].map((offset) => (
        <ThinLine
          key={offset}
          x={x + offset}
          y={y}
          z={z}
          len={22}
          color="rgba(180,170,150,.8)"
        />
      ))}
    </>
  );
}

type SvgOverlayProps = PositionProps & {
  w: number;
  h: number;
  children: ReactNode;
};

// Posiciona um desenho SVG no mesmo espaço transformado das peças HTML.
export function SvgOverlay({
  x = 0,
  y = 0,
  z = 0,
  w,
  h,
  children,
}: SvgOverlayProps) {
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        overflow: "visible",
        transform: `translate(-50%,-50%) translate3d(${x}px,${y}px,${z}px)`,
      }}
    >
      {children}
    </svg>
  );
}