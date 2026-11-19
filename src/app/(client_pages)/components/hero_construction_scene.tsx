import { useId, type CSSProperties, type ReactNode, type SVGProps } from "react";
import "./hero_blueprint.css";

/* Same token names as the existing hero; fallbacks make it work standalone. */
const C = {
  gold: "var(--hero-gold, #C9A24B)",
  light: "var(--hero-gold-light, #E3C77E)",
  pale: "var(--hero-gold-pale, #F3E6BF)",
  sand: "var(--hero-sand, #B9AE98)",
  ivory: "var(--hero-ivory, #F7F3E8)",
  skin: "var(--hero-skin, #D9A98A)",
  navy: "var(--hero-navy, #0E1E33)",
  grid: "var(--hero-grid-line, #C9A24B)",
};

/* ------------------------------------------------------------- Geometry */
const GROUND = 640;
const FLOOR_H = 48;
const FLOORS = 7;
const CLADDED = 5; // floors 0-4 are finished; 5-6 are still bare frame
const GRID_X = [330, 400, 470, 540, 610] as const;
const BAYS = GRID_X.slice(0, -1);
const BAY_W = 70;
/** levels[i] = y of the underside of floor i (levels[7] is the top slab) */
const levels = Array.from({ length: FLOORS + 1 }, (_, i) => GROUND - i * FLOOR_H);
const TOP = levels[FLOORS];
const floorTop = (i: number) => levels[i + 1];
const slabSpan = (i: number) => (i === 1 ? [290, 650] : [330, 610]);
const win = (x: number, i: number) => ({ x: x + 9, y: floorTop(i) + 11, w: 52, h: 26 });

/** The scan plane sweeps this band left to right: blueprint becomes building. */
const SCAN = { x: 250, w: 440, y1: 192, y2: 662 };

/** Timeline in seconds. Retime the whole scene here. */
const T = { draw: 0.4, wipe: 2.2, wipeDur: 3.6, crane: 0.2, people: 1.4 };
const badgesAt = T.wipe + T.wipeDur + 0.2;

const delay = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

/* ------------------------------------------------------ Path generators */
function lattice(x1: number, x2: number, yTop: number, yBot: number, step: number) {
  let d = `M${x1} ${yTop}H${x2}M${x1} ${yBot}H${x2}`;
  for (let x = x1, k = 0; x < x2; x += step, k++) {
    const nx = Math.min(x + step, x2);
    d += `M${x} ${k % 2 ? yTop : yBot}L${nx} ${k % 2 ? yBot : yTop}`;
  }
  return d;
}
function mast(x1: number, x2: number, yTop: number, yBot: number, step: number) {
  let d = `M${x1} ${yTop}V${yBot}M${x2} ${yTop}V${yBot}`;
  for (let y = yTop, k = 0; y < yBot; y += step, k++) {
    const ny = Math.min(y + step, yBot);
    d += `M${k % 2 ? x2 : x1} ${y}L${k % 2 ? x1 : x2} ${ny}`;
  }
  return d;
}
const hatch = (() => {
  let d = "";
  for (let x = 110; x < 840; x += 36) d += `M${x} ${GROUND}l-9 11`;
  return d;
})();

/* ------------------------------------------------------------- Pieces */
type DrawProps = { d: string; at: number } & SVGProps<SVGPathElement>;
/** A line that draws itself in (pathLength normalised to 1) */
const Draw = ({ d, at, ...rest }: DrawProps) => (
  <path className="bp-draw" style={delay(at)} d={d} pathLength={1} {...rest} />
);

function Person({ x, arms, children }: { x: number; arms: string; children?: ReactNode }) {
  return (
    <g className="bp-fade" style={delay(T.people)}>
      <g transform={`translate(${x} ${GROUND}) scale(1.25)`}>
        <path d="M-4 -28L-5 -4M4 -28L5 -4" stroke={C.sand} strokeWidth="5" strokeLinecap="round" />
        <path d="M-8 -1H-2M2 -1H8" stroke={C.gold} strokeWidth="4" strokeLinecap="round" />
        <path
          d="M-9 -60Q0 -65 9 -60L10 -28Q0 -24 -10 -28Z"
          fill={C.gold}
          fillOpacity=".94"
          stroke={C.light}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M-9 -50H9M0 -43V-27" stroke={C.ivory} strokeWidth="1.8" strokeLinecap="round" />
        <path d={arms} stroke={C.sand} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {children}
        <circle cx="0" cy="-70" r="8" fill={C.skin} />
        <path d="M-9 -72Q-9 -84 0 -84Q9 -84 9 -72Z" fill={C.gold} stroke={C.pale} strokeWidth="1.4" />
        <path d="M-11 -72H11" stroke={C.pale} strokeWidth="2.4" strokeLinecap="round" />
      </g>
    </g>
  );
}

export default function HeroBlueprintScene() {
  const uid = `bp-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const id = { grid: `${uid}-grid`, clip: `${uid}-clip`, trail: `${uid}-trail` };

  const sceneVars = {
    "--bp-wipe-delay": `${T.wipe}s`,
    "--bp-wipe-dur": `${T.wipeDur}s`,
    "--bp-travel": `${SCAN.w}px`,
  } as CSSProperties;

  const floorsAll = Array.from({ length: FLOORS }, (_, i) => i);
  const upperWindows = floorsAll.slice(1).flatMap((i) => BAYS.map((x) => ({ i, x })));
  const groundGlass = [BAYS[0], BAYS[1], BAYS[3]];
  const braceFloors = [5, 6];
  const braceBays = [BAYS[0], BAYS[3]];

  return (
    <svg
      className="bp-scene"
      viewBox="0 0 900 760"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="geometricPrecision"
      aria-hidden="true"
      focusable="false"
      style={sceneVars}
    >
      <defs>
        <pattern id={id.grid} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" stroke={C.grid} strokeOpacity=".07" strokeWidth=".7" />
          <circle r="1" fill={C.gold} opacity=".18" />
        </pattern>
        <linearGradient id={id.trail} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={C.gold} stopOpacity="0" />
          <stop offset="1" stopColor={C.gold} stopOpacity=".28" />
        </linearGradient>
        {/* Reveals the finished building; the rect grows with the scan line */}
        <clipPath id={id.clip}>
          <rect className="bp-wipe" x={SCAN.x} y="0" width={SCAN.w} height="760" />
        </clipPath>
      </defs>

      <rect width="900" height="760" fill={`url(#${id.grid})`} />
      <circle cx="470" cy="420" r="300" stroke={C.gold} strokeOpacity=".07" strokeDasharray="4 10" />

      {/* Ground */}
      <g className="bp-fade" style={delay(0.1)}>
        <path d={`M90 ${GROUND}H850`} stroke={C.gold} strokeWidth="2" />
        <path d={hatch} stroke={C.gold} strokeOpacity=".3" />
      </g>

      {/* Architecture: dimension lines with architectural ticks */}
      <g className="bp-fade" style={delay(0.5)} stroke={C.light} strokeOpacity=".7">
        <path d={`M262 ${TOP}V${GROUND}`} />
        <path d={levels.map((y) => `M258 ${y + 4}L266 ${y - 4}`).join("")} strokeWidth="1.5" />
        <path d={`M330 676H610M330 672L334 680M610 672L614 680M290 696H650M290 692L294 700M650 692L654 700`} />
      </g>

      {/* ---------- Layer 1: the drawing (always present, drawn in first) ---------- */}
      <g stroke={C.gold} strokeOpacity=".6">
        <Draw d={`M290 ${GROUND}V${levels[1]}H330V${TOP}H610V${levels[1]}H650V${GROUND}`} at={T.draw} strokeWidth="1.8" />
        {levels.slice(1).map((y, k) => {
          const [a, b] = slabSpan(k + 1);
          return <Draw key={y} d={`M${a} ${y}H${b}`} at={T.draw + 0.3 + k * 0.1} strokeWidth="1.2" />;
        })}
        <path className="bp-fade" style={delay(T.draw + 1.2)} d={`M440 ${TOP}V280H500V${TOP}M470 280V232`} strokeDasharray="5 4" />

        {/* Structural grid lines and bubbles */}
        <g className="bp-fade" style={delay(T.draw + 0.2)}>
          {GRID_X.map((x, k) => (
            <g key={x}>
              <path d={`M${x} ${GROUND + 10}V215`} strokeDasharray="14 4 2 4" strokeOpacity=".5" />
              <circle cx={x} cy="203" r="11" strokeOpacity=".9" />
              <text className="bp-bubble" x={x} y="203" dy=".35em" textAnchor="middle" fill={C.pale} stroke="none" fontSize="11">
                {String.fromCharCode(65 + k)}
              </text>
            </g>
          ))}
        </g>

        {/* Planned openings */}
        <g className="bp-fade" style={delay(T.draw + 1.0)} strokeDasharray="3 3" strokeOpacity=".5">
          {upperWindows.map(({ i, x }) => {
            const w = win(x, i);
            return <rect key={`${i}-${x}`} x={w.x} y={w.y} width={w.w} height={w.h} />;
          })}
        </g>
      </g>

      {/* ---------- Layer 2: the building, revealed by the scan ---------- */}
      <g clipPath={`url(#${id.clip})`}>
        {/* Cladding */}
        <rect x="290" y={levels[1]} width="360" height={FLOOR_H} fill={C.gold} fillOpacity=".1" />
        <rect x="330" y={levels[CLADDED]} width="280" height={levels[1] - levels[CLADDED]} fill={C.gold} fillOpacity=".1" />

        {/* Glazing and entrance */}
        <g fill={C.pale} fillOpacity=".16" stroke={C.gold} strokeWidth="1.4">
          {upperWindows
            .filter(({ i }) => i < CLADDED)
            .map(({ i, x }) => {
              const w = win(x, i);
              return <rect key={`${i}-${x}`} x={w.x} y={w.y} width={w.w} height={w.h} />;
            })}
          {groundGlass.map((x) => (
            <rect key={x} x={x + 9} y={levels[1] + 8} width="52" height={FLOOR_H - 8} />
          ))}
        </g>
        <rect x="490" y={levels[1] + 12} width="30" height={FLOOR_H - 12} fill={C.navy} stroke={C.light} strokeWidth="1.6" />

        {/* Engineering: columns, slabs, bracing on the unclad floors, rebar starters */}
        <g stroke={C.light} strokeLinecap="round">
          <path d={GRID_X.map((x) => `M${x} ${GROUND}V${TOP}`).join("") + `M290 ${GROUND}V${levels[1]}M650 ${GROUND}V${levels[1]}`} strokeWidth="3" />
          <path d={levels.slice(1).map((y, k) => { const [a, b] = slabSpan(k + 1); return `M${a} ${y}H${b}`; }).join("")} strokeWidth="4" />
          <path d={`M270 ${levels[1]}H670`} strokeWidth="5" />
          <path
            d={braceFloors.flatMap((i) => braceBays.map((x) => `M${x} ${floorTop(i)}L${x + BAY_W} ${levels[i]}M${x + BAY_W} ${floorTop(i)}L${x} ${levels[i]}`)).join("")}
            stroke={C.gold}
            strokeWidth="1.6"
          />
          <path d={GRID_X.map((x) => `M${x} ${TOP}V284M${x - 4} 292H${x + 4}M${x - 4} 298H${x + 4}`).join("")} strokeWidth="1.4" strokeDasharray="0" />
        </g>
      </g>

      {/* Oversight: the scan plane */}
      <g transform={`translate(${SCAN.x} 0)`}>
        <g className="bp-scan">
          <rect x="-70" y={SCAN.y1} width="70" height={SCAN.y2 - SCAN.y1} fill={`url(#${id.trail})`} />
          <path d={`M0 ${SCAN.y1}V${SCAN.y2}`} stroke={C.pale} strokeWidth="1.5" />
          <path d={`M0 ${SCAN.y1 - 6}l5 6 -5 6 -5 -6z`} fill={C.pale} />
        </g>
      </g>

      {/* Construction: tower crane lifting a façade panel */}
      <g className="bp-fade" style={delay(T.crane)}>
        <g stroke={C.gold} strokeWidth="1.3">
          <path d={mast(735, 755, 96, GROUND, 22)} />
          <path d={lattice(330, 830, 96, 112, 25)} />
          <path d="M745 62L735 96M745 62L755 96M745 62L330 96M745 62L830 96" strokeWidth="1" />
          <rect x="722" y="112" width="22" height="16" fill={C.navy} />
          <rect x="800" y="114" width="26" height="22" fill={C.gold} fillOpacity=".18" />
          <path d={`M718 ${GROUND}H772`} strokeWidth="2.5" />
        </g>
        <g className="bp-sway">
          <rect x="357" y="112" width="16" height="7" fill={C.navy} stroke={C.light} />
          <path d="M365 119V228M365 228L340 244M365 228L390 244" stroke={C.light} strokeWidth="1.3" strokeDasharray="4 3" />
          <rect x="335" y="244" width="60" height="32" fill={C.gold} fillOpacity=".14" stroke={C.gold} strokeWidth="1.5" />
          <path d="M365 244V276M335 260H395" stroke={C.gold} strokeWidth="1" strokeOpacity=".7" />
        </g>
      </g>

      {/* Oversight: total station, inspector, engineer */}
      <g className="bp-fade" style={delay(T.people - 0.2)}>
        <path d={`M105 600L88 ${GROUND}M105 600L122 ${GROUND}M105 600V${GROUND}`} stroke={C.light} strokeWidth="2" strokeLinecap="round" />
        <rect x="96" y="576" width="18" height="24" rx="2" fill={C.gold} fillOpacity=".2" stroke={C.light} strokeWidth="1.8" />
        <circle cx="105" cy="586" r="4" fill={C.light} />
        <path d={`M114 584L${GRID_X[0]} ${TOP}`} stroke={C.pale} strokeOpacity=".5" strokeDasharray="3 5" />
        <circle cx={GRID_X[0]} cy={TOP} r="8" stroke={C.pale} strokeOpacity=".8" />
        <path d={`M${GRID_X[0] - 12} ${TOP}H${GRID_X[0] + 12}M${GRID_X[0]} ${TOP - 12}V${TOP + 12}`} stroke={C.pale} strokeOpacity=".8" />
      </g>
      <Person x={170} arms="M-9 -58L-12 -40M9 -58L15 -46L10 -44">
        <rect x="11" y="-54" width="11" height="15" rx="1.5" fill={C.navy} stroke={C.light} />
        <path d="M13.5 -49H19.5M13.5 -45H19.5" stroke={C.light} strokeWidth=".9" />
      </Person>
      <Person x={215} arms="M-9 -58L-14 -44M9 -58L20 -66L28 -74">
        <path d="M-21 -40L-10 -53" stroke={C.ivory} strokeWidth="4" strokeLinecap="round" />
      </Person>

      {/* Inspection record: signed off floor by floor, bottom up */}
      <g>
        <path className="bp-fade" style={delay(badgesAt)} d={`M690 ${TOP + 24}V${GROUND - 24}`} stroke={C.gold} strokeOpacity=".35" />
        {floorsAll.map((i) => {
          const cy = levels[i] - FLOOR_H / 2;
          const done = i < CLADDED;
          return (
            <g key={i} transform={`translate(690 ${cy})`}>
              <g className="bp-pop" style={delay(badgesAt + i * 0.18)}>
              {done ? (
                <>
                  <circle r="10" fill={C.gold} fillOpacity=".18" stroke={C.gold} strokeWidth="1.5" />
                  <path d="M-4.5 0L-1.5 3.5L4.5 -3.5" stroke={C.light} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </>
              ) : (
                <>
                  <circle className="bp-pulse" r="10" stroke={C.pale} strokeWidth="1.5" strokeDasharray="3 3" />
                  <circle r="2.5" fill={C.pale} />
                </>
              )}
              </g>
            </g>
          );
        })}
      </g>
    </svg>
  );
}