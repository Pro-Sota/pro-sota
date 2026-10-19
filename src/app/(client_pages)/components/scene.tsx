
/*
 * Composição das quatro cenas a partir das primitivas reutilizáveis.
 * Medidas ilustrativas em píxeis; não representam desenhos técnicos à escala.
 * SCENES associa as chaves usadas no catálogo e nos URLs dos serviços.
 */

import { C, solidFace, windowsBg } from "./materials";

import {
  Cuboid,
  GroundPlane,
  ShadowBlob,
  ThinLine,
  Shrub,
  Hedge,
  BalconyRail,
  DoorFace,
  Plinth,
  TrimBand,
  RoofPlant,
  WaitingBars,
  SvgOverlay,
} from "./primitives";

type CoordinatePair = readonly [number, number];

const ENGINEERING_COLUMNS: readonly CoordinatePair[] = [
  [-60, -46],
  [60, -46],
  [-60, 46],
  [60, 46],
  [-60, 0],
  [60, 0],
];

const CONSTRUCTION_CORNERS: readonly CoordinatePair[] = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
];

// -----------------------------------------------------------------------------
// Arquitectura
// -----------------------------------------------------------------------------

export function ArquitecturaScene() {
  const GY = 92;

  const P = { x: -10, z: -6, w: 112, h: 104, d: 70 };
  const pTop = GY - P.h;

  const T = { x: 24, z: -24, w: 64, h: 118, d: 50 };
  const tTop = pTop - T.h;

  return (
    <>
      <GroundPlane y={GY} />
      <ShadowBlob y={GY - 1} w={210} d={150} x={6} />

      <Cuboid
        x={P.x}
        y={(GY + pTop) / 2}
        z={P.z}
        w={P.w}
        h={P.h}
        d={P.d}
        top={C.stoneLight}
        frontStyle={windowsBg(C.navySoft, {
          gap: 20,
          kind: "front",
        })}
        sideStyle={windowsBg(C.navyMid, {
          gap: 20,
          kind: "side",
        })}
      />

      <Cuboid
        x={T.x}
        y={(pTop + tTop) / 2}
        z={T.z}
        w={T.w}
        h={T.h}
        d={T.d}
        top={C.stone}
        frontStyle={windowsBg(C.navy, {
          gap: 16,
          kind: "front",
        })}
        sideStyle={windowsBg("#062042", {
          gap: 16,
          kind: "side",
        })}
      />

      <Cuboid
        x={T.x}
        y={tTop - 4}
        z={T.z}
        w={T.w + 4}
        h={8}
        d={T.d + 4}
        top={C.goldLight}
        front={C.gold}
        side={C.goldDim}
      />

      <Cuboid
        x={P.x - 46}
        y={GY - 24}
        z={P.z + P.d / 2 + 16}
        w={46}
        h={6}
        d={26}
        top={C.goldLight}
        front={C.goldDim}
        side={C.goldDim}
      />

      <DoorFace
        x={P.x - 46}
        y={GY - 15}
        z={P.z + P.d / 2 + 19}
      />

      <Plinth
        x={P.x}
        y={GY - 4}
        z={P.z + P.d / 2}
        w={P.w}
        d={4}
      />

      <Plinth
        x={P.x}
        y={GY - 4}
        z={P.z - P.d / 2}
        w={4}
        d={P.d}
      />

      <TrimBand
        x={P.x}
        y={GY - P.h * 0.52}
        z={P.z + P.d / 2}
        w={P.w}
      />

      <TrimBand
        x={T.x}
        y={pTop - T.h * 0.5}
        z={T.z + T.d / 2}
        w={T.w}
      />

      <RoofPlant
        x={P.x - 34}
        y={pTop - 6}
        z={P.z - 14}
      />

      <BalconyRail
        x={P.x}
        y={GY - P.h * 0.52}
        z={P.z + P.d / 2 - 1}
        w={P.w - 20}
      />

      <BalconyRail
        x={P.x}
        y={GY - P.h * 0.24}
        z={P.z + P.d / 2 - 1}
        w={P.w - 20}
      />

      <Hedge
        x={P.x - 64}
        y={GY - 5}
        z={P.z + P.d / 2}
        w={52}
      />

      <Hedge
        x={P.x + 46}
        y={GY - 5}
        z={P.z + P.d / 2}
        w={60}
      />

      <Shrub
        x={P.x - 90}
        y={GY}
        z={P.z + P.d / 2 - 6}
        r={13}
      />

      <Shrub
        x={P.x + 84}
        y={GY}
        z={P.z + P.d / 2 - 2}
        r={10}
      />

      <SvgOverlay w={200} h={200} x={26} y={tTop - 100} z={96}>
        <rect
          x="4"
          y="4"
          width="192"
          height="192"
          fill="rgba(226,198,144,0.06)"
          stroke="#e2c690"
          strokeOpacity="0.7"
        />

        <line
          x1="4"
          y1="100"
          x2="196"
          y2="100"
          stroke="#e2c690"
          strokeOpacity="0.4"
        />

        <line
          x1="100"
          y1="4"
          x2="100"
          y2="196"
          stroke="#e2c690"
          strokeOpacity="0.4"
        />

        <rect
          x="24"
          y="24"
          width="56"
          height="56"
          fill="none"
          stroke="#bd9655"
          strokeOpacity="0.85"
        />

        <rect
          x="110"
          y="110"
          width="62"
          height="46"
          fill="none"
          stroke="#bd9655"
          strokeOpacity="0.85"
        />
      </SvgOverlay>
    </>
  );
}

// -----------------------------------------------------------------------------
// Engenharia
// -----------------------------------------------------------------------------

export function EngenhariaScene() {
  return (
    <>
      <GroundPlane y={92} />
      <ShadowBlob y={91} w={200} d={160} />

      {[0, 1, 2].map((i) => {
        const yy = 92 - i * 38;

        return (
          <Cuboid
            key={i}
            x={0}
            y={yy - 4}
            z={0}
            w={150}
            h={8}
            d={112}
            top={
              i === 2
                ? C.goldLight
                : "rgba(226,198,144,.4)"
            }
            front="rgba(226,198,144,.22)"
            side="rgba(226,198,144,.14)"
          />
        );
      })}

      {ENGINEERING_COLUMNS.map(([cx, cz], i) => (
        <Cuboid
          key={i}
          x={cx}
          y={92 - 55}
          z={cz}
          w={12}
          h={110}
          d={12}
          topStyle={solidFace(C.goldLight, "top")}
          frontStyle={solidFace(C.navySoft, "front")}
          sideStyle={solidFace(C.navyMid, "side")}
        />
      ))}

      <ThinLine
        x={0}
        y={92 - 55}
        z={-46}
        len={122}
        w={3}
        color="rgba(226,198,144,.65)"
        rot={39}
      />

      <ThinLine
        x={0}
        y={92 - 55}
        z={-46}
        len={122}
        w={3}
        color="rgba(226,198,144,.4)"
        rot={-39}
      />

      <SvgOverlay w={150} h={112} x={0} y={92 - 3 - 114} z={0}>
        <g stroke="rgba(5,18,33,.4)" strokeWidth="1">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line
              key={`v${i}`}
              x1={i * 26 + 8}
              y1="4"
              x2={i * 26 + 8}
              y2="108"
            />
          ))}

          {[0, 1, 2, 3].map((i) => (
            <line
              key={`h${i}`}
              x1="4"
              y1={i * 32 + 8}
              x2="146"
              y2={i * 32 + 8}
            />
          ))}
        </g>
      </SvgOverlay>

      <SvgOverlay w={70} h={30} x={-60} y={92 - 58} z={-58}>
        <g
          fontFamily="monospace"
          fontSize="9"
          fill="#e2c690"
          fillOpacity="0.75"
        >
          <circle
            cx="10"
            cy="10"
            r="9"
            fill="rgba(5,18,33,.55)"
            stroke="#e2c690"
            strokeOpacity="0.6"
          />
          <text x="5.5" y="13">P1</text>
        </g>
      </SvgOverlay>

      <SvgOverlay w={70} h={30} x={60} y={92 - 58} z={58}>
        <g
          fontFamily="monospace"
          fontSize="9"
          fill="#e2c690"
          fillOpacity="0.75"
        >
          <circle
            cx="10"
            cy="10"
            r="9"
            fill="rgba(5,18,33,.55)"
            stroke="#e2c690"
            strokeOpacity="0.6"
          />
          <text x="4" y="13">V2</text>
        </g>
      </SvgOverlay>
    </>
  );
}

// -----------------------------------------------------------------------------
// Construção
// -----------------------------------------------------------------------------

export function ConstrucaoScene() {
  const GY = 96;

  const B = { x: -24, z: -6, w: 108, h: 92, d: 62 };
  const bTop = GY - B.h;

  const frameH = 34;
  const frameTop = bTop - frameH;

  const mastX = 96;
  const mastH = 190;
  const mastTopY = GY - mastH;

  return (
    <>
      <GroundPlane
        y={GY}
        w={270}
        d={250}
        color="rgba(140,100,60,.10)"
      />

      <ShadowBlob
        y={GY - 1}
        w={210}
        d={150}
        x={-4}
      />

      <Cuboid
        x={B.x}
        y={(GY + bTop) / 2}
        z={B.z}
        w={B.w}
        h={B.h}
        d={B.d}
        top={C.concrete}
        frontStyle={windowsBg("#2a4f7a", {
          gap: 18,
          lit: true,
          kind: "front",
        })}
        sideStyle={windowsBg(C.navyMid, {
          gap: 18,
          kind: "side",
        })}
      />

      <TrimBand
        x={B.x}
        y={GY - B.h * 0.5}
        z={B.z + B.d / 2}
        w={B.w}
      />

      <Plinth
        x={B.x}
        y={GY - 4}
        z={B.z + B.d / 2}
        w={B.w}
        d={4}
      />

      {CONSTRUCTION_CORNERS.map(([c0, c1], i) => {
        const cx = B.x + c0 * (B.w / 2 - 10);
        const cz = B.z + c1 * (B.d / 2 - 10);

        return (
          <div key={i}>
            <Cuboid
              x={cx}
              y={bTop - frameH / 2}
              z={cz}
              w={8}
              h={frameH}
              d={8}
              top={C.goldLight}
              front={C.concreteDark}
              side={C.concrete}
            />

            <WaitingBars
              x={cx}
              y={frameTop - 3}
              z={cz}
            />
          </div>
        );
      })}

      <Cuboid
        x={B.x}
        y={frameTop - 3}
        z={B.z}
        w={B.w + 2}
        h={6}
        d={B.d + 2}
        top={C.goldLight}
        front="rgba(226,198,144,.3)"
        side="rgba(226,198,144,.2)"
      />

      <SvgOverlay
        w={B.d + 2}
        h={frameH + 18}
        x={B.x - B.w / 2}
        y={frameTop + 9}
        z={B.z}
      >
        <g stroke="rgba(226,198,144,.4)" strokeWidth="1">
          {[0, 1, 2, 3].map((i) => (
            <line
              key={`h${i}`}
              x1="0"
              y1={i * 17}
              x2={B.d + 2}
              y2={i * 17}
            />
          ))}

          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={`v${i}`}
              x1={i * (B.d / 4)}
              y1="0"
              x2={i * (B.d / 4)}
              y2={frameH + 18}
            />
          ))}
        </g>
      </SvgOverlay>

      <Cuboid
        x={mastX}
        y={GY - mastH / 2}
        z={6}
        w={10}
        h={mastH}
        d={10}
        top={C.gold}
        front={C.gold}
        side={C.goldDim}
      />

      <Cuboid
        x={mastX - 52}
        y={mastTopY}
        z={6}
        w={130}
        h={7}
        d={7}
        top={C.goldLight}
        front={C.gold}
        side={C.goldDim}
      />

      <Cuboid
        x={mastX + 26}
        y={mastTopY}
        z={6}
        w={28}
        h={7}
        d={7}
        top={C.goldLight}
        front={C.goldDim}
        side={C.goldDim}
      />

      <Cuboid
        x={mastX + 34}
        y={mastTopY + 9}
        z={6}
        w={13}
        h={11}
        d={11}
        top={C.goldDim}
        front={C.earthDark}
        side={C.earthDark}
      />

      <ThinLine
        x={mastX - 24}
        y={mastTopY + 20}
        z={6}
        len={46}
        rot={25}
        color="rgba(226,198,144,.5)"
      />

      <ThinLine
        x={B.x}
        y={(mastTopY + frameTop) / 2}
        z={6}
        len={frameTop - mastTopY}
      />

      <Cuboid
        x={B.x}
        y={frameTop - 9}
        z={6}
        w={16}
        h={12}
        d={16}
        top={C.goldLight}
        front={C.earthDark}
        side={C.earthDark}
      />

      <Cuboid
        x={60}
        y={GY - 9}
        z={66}
        w={24}
        h={16}
        d={20}
        top={C.goldLight}
        front={C.earth}
        side={C.earthDark}
      />

      <Cuboid
        x={88}
        y={GY - 7}
        z={72}
        w={18}
        h={12}
        d={16}
        top={C.goldLight}
        front={C.earth}
        side={C.earthDark}
      />
    </>
  );
}

// -----------------------------------------------------------------------------
// Fiscalização
// -----------------------------------------------------------------------------

export function FiscalizacaoScene() {
  const GY = 92;

  const B = { w: 128, h: 114, d: 76 };
  const bTop = GY - B.h;

  return (
    <>
      <GroundPlane y={GY} />
      <ShadowBlob y={GY - 1} w={190} d={150} />

      <Cuboid
        x={0}
        y={(GY + bTop) / 2}
        z={0}
        w={B.w}
        h={B.h}
        d={B.d}
        top={C.stoneLight}
        frontStyle={windowsBg(C.navySoft, {
          gap: 19,
          kind: "front",
        })}
        sideStyle={windowsBg(C.navyMid, {
          gap: 19,
          kind: "side",
        })}
      />

      <DoorFace
        x={0}
        y={GY - 14}
        z={B.d / 2 + 1}
      />

      <Plinth
        x={0}
        y={GY - 4}
        z={B.d / 2}
        w={B.w}
        d={4}
      />

      <TrimBand
        x={0}
        y={GY - B.h * 0.52}
        z={B.d / 2}
        w={B.w}
      />

      <RoofPlant
        x={-36}
        y={bTop - 6}
        z={-10}
      />

      <Hedge
        x={-58}
        y={GY - 5}
        z={B.d / 2}
        w={44}
      />

      <Shrub
        x={74}
        y={GY}
        z={B.d / 2 - 4}
        r={11}
      />

      <div
        className="mcube"
        style={{
          transform: `translate3d(0px, ${bTop}px, ${B.d / 2 + 1}px)`,
        }}
      >
        <div
          className="mface"
          style={{
            width: B.w,
            height: 150,
            transform: "translate(-50%, 0%)",
            boxShadow: "none",
            background:
              "linear-gradient(180deg, transparent, rgba(189,150,85,.4) 45%, transparent)",
            animation: "scanY 2.6s ease-in-out infinite",
          }}
        />
      </div>

      <SvgOverlay
        w={60}
        h={60}
        x={112}
        y={bTop + 42}
        z={B.d / 2 - 6}
      >
        <rect
          x="6"
          y="4"
          width="34"
          height="46"
          rx="2"
          fill="rgba(5,18,33,.55)"
          stroke="#e2c690"
        />

        <line
          x1="12"
          y1="16"
          x2="34"
          y2="16"
          stroke="#bd9655"
          strokeWidth="2"
        />

        <line
          x1="12"
          y1="26"
          x2="34"
          y2="26"
          stroke="#bd9655"
          strokeWidth="2"
        />

        <path
          d="M12 36 L18 42 L34 26"
          stroke="#e2c690"
          strokeWidth="2"
          fill="none"
        />
      </SvgOverlay>

      <SvgOverlay w={20} h={110} x={-92} y={-2} z={50}>
        <line
          x1="10"
          y1="0"
          x2="10"
          y2="110"
          stroke="rgba(226,198,144,.5)"
        />

        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1="4"
            y1={i * 27}
            x2="16"
            y2={i * 27}
            stroke="rgba(226,198,144,.6)"
          />
        ))}
      </SvgOverlay>
    </>
  );
}

// -----------------------------------------------------------------------------
// Catálogo de cenas
// -----------------------------------------------------------------------------

export const SCENES = {
  arquitectura: ArquitecturaScene,
  engenharia: EngenhariaScene,
  construcao: ConstrucaoScene,
  fiscalizacao: FiscalizacaoScene,
} as const;

export type SceneKey = keyof typeof SCENES;
