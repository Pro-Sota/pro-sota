import { useId, type CSSProperties, type ReactNode } from "react";

/* Colours come from the CSS tokens declared on .ps-hero (see hero.css). */
const GOLD = "var(--hero-gold)";
const GOLD_LIGHT = "var(--hero-gold-light)";
const GOLD_PALE = "var(--hero-gold-pale)";
const SAND = "var(--hero-sand)";
const IVORY = "var(--hero-ivory)";
const SKIN = "var(--hero-skin)";
const NAVY = "var(--hero-navy)";
const GRID = "var(--hero-grid-line)";

/** Sets the reveal delay (seconds) read by .ps-scene__reveal / .ps-scene__draw-path */
const delay = (seconds: number) =>
  ({ "--ps-d": `${seconds}s` }) as CSSProperties;

/* --------------------------------------------------------------------------
   Worker — one body, drawn once. Position it with dx/dy, pose it with `arms`
   (path data in the base worker's coordinate space) and add hand-held items
   as children.
   -------------------------------------------------------------------------- */

type WorkerProps = {
  dx?: number;
  dy?: number;
  arms: string;
  revealAt: number;
  children?: ReactNode;
};

function Worker({ dx = 0, dy = 0, arms, revealAt, children }: WorkerProps) {
  return (
    <g
      className="ps-scene__worker ps-scene__reveal"
      style={delay(revealAt)}
      transform={`translate(${dx} ${dy})`}
    >
      {/* Legs and boots */}
      <path
        d="M390 605L384 629M406 605L416 629"
        stroke={SAND}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M379 630H391M410 630H423"
        stroke={GOLD}
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Torso and hi-vis vest */}
      <path
        d="M388 565L380 603H411L407 565Z"
        fill={GOLD}
        fillOpacity=".88"
        stroke={GOLD_LIGHT}
        strokeWidth="1.5"
      />
      <path
        d="M386 572L397 580L408 572M397 580V602"
        stroke={IVORY}
        strokeWidth="2"
      />

      {/* Arms */}
      <path d={arms} stroke={SAND} strokeWidth="5" strokeLinecap="round" />

      {/* Head and helmet */}
      <circle cx="398" cy="552" r="11" fill={SKIN} />
      <path
        d="M386 549Q387 535 398 535Q409 535 410 549Z"
        fill={GOLD}
        stroke={GOLD_PALE}
        strokeWidth="1.5"
      />
      <path
        d="M384 550H412"
        stroke={GOLD_PALE}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {children}
    </g>
  );
}

export default function HeroConstructionScene() {
  /* Unique, selector-safe ids so the component can render more than once */
  const uid = `ps-${useId().replace(/:/g, "")}`;
  const id = {
    buildingFill: `${uid}-building-fill`,
    groundFill: `${uid}-ground-fill`,
    grid: `${uid}-blueprint-grid`,
    outline: `${uid}-outline`,
    slabA: `${uid}-slab-a`,
    slabB: `${uid}-slab-b`,
    slabC: `${uid}-slab-c`,
  };

  return (
    <svg
      className="ps-scene"
      viewBox="0 0 900 760"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={id.buildingFill} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={GOLD} stopOpacity=".12" />
          <stop offset="100%" stopColor={GOLD} stopOpacity=".015" />
        </linearGradient>

        <linearGradient id={id.groundFill} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GOLD} stopOpacity=".12" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
        </linearGradient>

        <pattern
          id={id.grid}
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M40 0H0V40"
            stroke={GRID}
            strokeOpacity=".13"
            strokeWidth=".7"
          />
          <circle cx="0" cy="0" r="1" fill={GOLD} opacity=".3" />
        </pattern>

        {/* Shared geometry: drawn once, reused by the building and the
            "technical drawing" overlay. pathLength="1" normalises dash maths. */}
        <path
          id={id.outline}
          d="M310 310L470 225L745 310V630H310V310Z"
          pathLength={1}
        />
        <path id={id.slabA} d="M310 410L470 325L745 410" pathLength={1} />
        <path id={id.slabB} d="M310 515L470 430L745 515" pathLength={1} />
        <path id={id.slabC} d="M310 630L470 545L745 630" pathLength={1} />
      </defs>

      {/* Blueprint background */}
      <rect width="900" height="760" fill={`url(#${id.grid})`} />

      {/* Composition guides */}
      <g className="ps-scene__guides" stroke={GOLD}>
        <circle cx="505" cy="350" r="270" strokeOpacity=".13" strokeDasharray="4 9" />
        <circle cx="505" cy="350" r="210" strokeOpacity=".12" strokeDasharray="2 8" />
        <path d="M505 35V690M145 350H855" strokeOpacity=".15" strokeDasharray="5 9" />
      </g>

      {/* Site ground */}
      <g className="ps-scene__ground ps-scene__reveal" style={delay(0.2)}>
        <path d="M130 640H835" stroke={GOLD} strokeWidth="2" />
        <path d="M160 640L195 655H790L825 640" fill={`url(#${id.groundFill})`} />
        <path d="M180 655H810" stroke={GOLD} strokeOpacity=".3" />
        <path
          d="M225 640V660M330 640V660M435 640V660M540 640V660M645 640V660M750 640V660"
          stroke={GOLD}
          strokeOpacity=".3"
        />
      </g>

      {/* Crane, lifting cable, hook and load */}
      <g className="ps-scene__lift ps-scene__reveal" style={delay(0.1)}>
        <g className="ps-scene__crane" stroke={GOLD}>
          <path d="M170 75H690" strokeWidth="3" />
          <path d="M170 75L235 105H625L690 75" strokeWidth="1.5" />
          <path
            d="M170 75L235 105L280 75L325 105L370 75L415 105L460 75L505 105L550 75L595 105L640 75L690 75"
            strokeWidth="1.4"
          />
          <path
            d="M235 105L280 75M325 105L370 75M415 105L460 75M505 105L550 75M595 105L640 75"
            strokeWidth="1"
          />
          <path d="M235 105V620" strokeWidth="2" />
          <path d="M235 105L205 135M235 105L265 135" strokeWidth="1.5" />
          <path d="M220 105L235 620M250 105L235 620" strokeWidth=".8" opacity=".35" />
          <path d="M190 620H280L260 640H210Z" strokeWidth="1.5" />
          <path d="M210 640V655M260 640V655M195 655H275" strokeWidth="2" />
        </g>

        <g className="ps-scene__cable">
          <path
            d="M575 78V270"
            stroke={GOLD_LIGHT}
            strokeWidth="2"
            strokeDasharray="4 3"
          />
        </g>

        <g className="ps-scene__hook-load">
          <path d="M568 270H582L578 282H572Z" stroke={GOLD_LIGHT} strokeWidth="2" />
          <path d="M575 282V290" stroke={GOLD_LIGHT} strokeWidth="2" />
          <path d="M575 290Q575 300 584 300" stroke={GOLD_LIGHT} strokeWidth="2" />

          <g className="ps-scene__load">
            <rect
              x="542"
              y="305"
              width="66"
              height="42"
              rx="2"
              fill={GOLD}
              fillOpacity=".12"
              stroke={GOLD}
              strokeWidth="1.5"
            />
            <path
              d="M542 305L575 290L608 305M553 305V347M597 305V347"
              stroke={GOLD}
              strokeWidth="1"
            />
            <path d="M550 320H600" stroke={GOLD} strokeOpacity=".5" />
          </g>
        </g>
      </g>

      {/* Main building */}
      <g className="ps-scene__building">
        <use
          href={`#${id.outline}`}
          fill={`url(#${id.buildingFill})`}
          stroke={GOLD}
          strokeWidth="2"
        />

        {/* Floor slabs */}
        <g
          className="ps-scene__slabs ps-scene__reveal"
          style={delay(0.9)}
          stroke={GOLD}
          strokeWidth="3"
        >
          <use href={`#${id.slabA}`} />
          <use href={`#${id.slabB}`} />
          <use href={`#${id.slabC}`} />
        </g>

        {/* Columns */}
        <g className="ps-scene__columns ps-scene__reveal" style={delay(1.3)}>
          <path
            d="M310 310V630M365 280V630M470 225V545M555 260V630M645 285V630M745 310V630"
            stroke={GOLD_LIGHT}
            strokeWidth="3"
          />
        </g>

        {/* Beams */}
        <g className="ps-scene__beams ps-scene__reveal" style={delay(1.8)}>
          <path
            d="M365 280L645 365M470 225L745 310"
            stroke={GOLD}
            strokeWidth="2"
          />
        </g>

        {/* Window openings */}
        <g
          className="ps-scene__windows ps-scene__reveal"
          style={delay(2.2)}
          stroke={GOLD}
          strokeWidth="1.5"
        >
          <rect x="385" y="330" width="65" height="62" />
          <rect x="485" y="350" width="55" height="58" />
          <rect x="570" y="380" width="55" height="54" />
          <rect x="655" y="405" width="55" height="62" />

          <rect x="385" y="435" width="65" height="65" />
          <rect x="485" y="460" width="55" height="55" />
          <rect x="570" y="485" width="55" height="55" />
          <rect x="655" y="530" width="55" height="65" />
        </g>

        {/* Window divisions */}
        <g
          className="ps-scene__window-details ps-scene__reveal"
          style={delay(2.6)}
          stroke={GOLD}
          strokeOpacity=".45"
        >
          <path d="M417 330V392M385 361H450" />
          <path d="M512 350V408M485 379H540" />
          <path d="M597 380V434M570 407H625" />
          <path d="M682 405V467M655 436H710" />
        </g>

        {/* Roof under construction */}
        <g className="ps-scene__roof ps-scene__reveal" style={delay(2.9)}>
          <path
            d="M300 310L470 215L755 310"
            stroke={GOLD_LIGHT}
            strokeWidth="3"
            strokeDasharray="7 5"
          />
          <path d="M470 215V185M450 215H490" stroke={GOLD} strokeWidth="2" />
        </g>
      </g>

      {/* Scaffolding */}
      <g
        className="ps-scene__scaffold ps-scene__reveal"
        style={delay(1.5)}
        stroke={GOLD_LIGHT}
      >
        <path d="M275 310V630M275 410H330M275 515H330M275 630H330" strokeWidth="1.8" />
        <path d="M275 410L330 310M275 515L330 410M275 630L330 515" strokeWidth="1.8" />
        <path d="M330 310V630" strokeWidth="1.8" />
        <path
          d="M275 355H330M275 460H330M275 570H330"
          strokeWidth="1.2"
          strokeDasharray="3 4"
        />
        <path d="M275 310H330M270 630H335" strokeWidth="3" />
      </g>

      {/* Floor labels */}
      <g className="ps-scene__labels ps-scene__reveal" style={delay(2.4)}>
        <text x="320" y="398">01</text>
        <text x="320" y="503">02</text>
        <text x="320" y="618">03</text>
        <text x="665" y="245">A-01</text>
      </g>

      {/* Worker 1 — measurement */}
      <Worker
        revealAt={3.4}
        arms="M386 574L370 589L357 581M408 574L425 588"
      >
        <g className="ps-scene__measuring-tool">
          <path d="M356 581L348 550L354 548L364 580" stroke={GOLD_LIGHT} strokeWidth="2" />
          <path d="M348 550L342 545" stroke={GOLD_LIGHT} strokeWidth="2" />
        </g>
      </Worker>

      {/* Worker 2 — inspection */}
      <Worker
        dx={264}
        revealAt={3.5}
        arms="M387 575L373 591L361 585M409 575L422 591L433 582"
      >
        <g className="ps-scene__clipboard">
          <rect x="425" y="572" width="19" height="25" rx="2" fill={NAVY} stroke={GOLD_LIGHT} />
          <path d="M430 579H439M430 585H439M430 591H436" stroke={GOLD_LIGHT} strokeWidth="1" />
        </g>
      </Worker>

      {/* Worker 3 — scaffolding */}
      <Worker
        dx={-96}
        dy={-118}
        revealAt={3.6}
        arms="M387 572L376 586L369 581M408 572L422 580"
      />

      {/* Surveying equipment */}
      <g className="ps-scene__survey ps-scene__reveal" style={delay(3.8)}>
        <path d="M775 575L765 630M800 575L810 630M787 575V630" stroke={GOLD_LIGHT} strokeWidth="2" />
        <path
          d="M765 575H810L802 560H773Z"
          fill={GOLD}
          fillOpacity=".2"
          stroke={GOLD_LIGHT}
          strokeWidth="2"
        />
        <path d="M777 560V545H798V560" stroke={GOLD_LIGHT} strokeWidth="2" />
        <rect x="778" y="536" width="20" height="12" rx="2" stroke={GOLD_LIGHT} strokeWidth="1.5" />
        <circle cx="788" cy="542" r="3" fill={GOLD_LIGHT} />
        <path d="M788 536V520" stroke={GOLD_LIGHT} strokeDasharray="2 3" />
        <circle className="ps-scene__survey-point" cx="788" cy="520" r="5" fill={GOLD} />
      </g>

      {/* Dimensions */}
      <g
        className="ps-scene__dimensions ps-scene__reveal"
        style={delay(3.2)}
        stroke={GOLD}
        strokeWidth="1"
      >
        <path d="M770 225V630M760 225H780M760 630H780" />
        <path d="M790 225V630" strokeDasharray="3 5" />
        <path d="M300 680H745M300 672V688M745 672V688" />
        <path d="M300 680L310 676M300 680L310 684M745 680L735 676M745 680L735 684" />
      </g>

      {/* Technical drawing overlay — outline is drawn once, then holds */}
      <g stroke={GOLD_PALE} strokeWidth="1.5">
        <use
          className="ps-scene__draw-path"
          style={delay(0.6)}
          href={`#${id.outline}`}
        />
        <use
          className="ps-scene__draw-path"
          style={delay(1.0)}
          href={`#${id.slabA}`}
        />
        <use
          className="ps-scene__draw-path"
          style={delay(1.4)}
          href={`#${id.slabB}`}
        />
      </g>

      {/* Architectural control point */}
      <g className="ps-scene__reveal" style={delay(3.6)}>
        <g className="ps-scene__target">
          <circle cx="470" cy="225" r="15" stroke={GOLD} strokeDasharray="3 4" />
          <circle cx="470" cy="225" r="4" fill={GOLD} />
          <path d="M450 225H490M470 205V245" stroke={GOLD} strokeWidth="1" />
        </g>
      </g>

      {/* Survey inspection line */}
      <g
        className="ps-scene__scan ps-scene__reveal"
        style={delay(4.8)}
        pointerEvents="none"
      >
        <path
          className="ps-scene__scan-line"
          d="M788 520L470 225"
          stroke={GOLD_PALE}
          strokeWidth="1.5"
          opacity=".8"
        />
        <path d="M788 520L745 410" stroke={GOLD_PALE} strokeWidth="2" opacity=".8" />
        <circle
          className="ps-scene__scan-ring"
          cx="470"
          cy="225"
          r="9"
          stroke={GOLD_PALE}
          strokeWidth="1.5"
        />
        <circle cx="470" cy="225" r="3" fill={GOLD_PALE} />
      </g>

      {/* Ambient technical points */}
      <g className="ps-scene__particles" fill={GOLD_LIGHT}>
        <circle cx="160" cy="270" r="2" />
        <circle cx="700" cy="170" r="2" />
        <circle cx="830" cy="390" r="2" />
        <circle cx="500" cy="690" r="2" />
        <circle cx="350" cy="190" r="1.5" />
      </g>
    </svg>
  );
}