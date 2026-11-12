import React from 'react';
import {random} from 'remotion';
import {C} from '../brand/tokens';
import {clamp, lerp} from '../lib/anim';

const PURPLE = {deep: '#1A0C26', dark: '#2C1340', mid: '#4A2263', lite: '#6B3589'};

/** Gradients for the whole court (ids are prefixed: a composition may hold two copies of the scene). */
export const CourtDefs: React.FC<{uid: string}> = ({uid}) => (
  <defs>
    <linearGradient id={`${uid}-gold`} x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stopColor={C.gold300} />
      <stop offset="0.5" stopColor={C.gold500} />
      <stop offset="1" stopColor={C.gold700} />
    </linearGradient>
    <linearGradient id={`${uid}-goldh`} x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stopColor={C.gold700} />
      <stop offset="0.35" stopColor={C.gold300} />
      <stop offset="0.65" stopColor={C.gold500} />
      <stop offset="1" stopColor={C.gold700} />
    </linearGradient>
    <linearGradient id={`${uid}-purple`} x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stopColor={PURPLE.lite} />
      <stop offset="1" stopColor={PURPLE.dark} />
    </linearGradient>
    <linearGradient id={`${uid}-niche`} x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stopColor="#3A1A52" />
      <stop offset="1" stopColor={PURPLE.deep} />
    </linearGradient>
    <linearGradient id={`${uid}-carpet`} x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stopColor="#5A2A78" />
      <stop offset="1" stopColor="#2A1240" />
    </linearGradient>
    <linearGradient id={`${uid}-floor`} x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stopColor="#1B1026" />
      <stop offset="1" stopColor={C.night950} />
    </linearGradient>
    <linearGradient id={`${uid}-beam`} x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stopColor={C.gold300} stopOpacity={0.2} />
      <stop offset="1" stopColor={C.gold300} stopOpacity={0} />
    </linearGradient>
    <linearGradient id={`${uid}-win`} x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stopColor="#24305A" />
      <stop offset="1" stopColor="#0D1226" />
    </linearGradient>
    <radialGradient id={`${uid}-halo`}>
      <stop offset="0" stopColor={C.gold300} stopOpacity={0.7} />
      <stop offset="0.4" stopColor={C.gold400} stopOpacity={0.26} />
      <stop offset="1" stopColor={C.gold500} stopOpacity={0} />
    </radialGradient>
    <radialGradient id={`${uid}-ember`}>
      <stop offset="0" stopColor="#FF9A6B" stopOpacity={0.62} />
      <stop offset="0.4" stopColor={C.emberLight} stopOpacity={0.24} />
      <stop offset="1" stopColor={C.emberLight} stopOpacity={0} />
    </radialGradient>
    <radialGradient id={`${uid}-core`}>
      <stop offset="0" stopColor="#FFFBF0" />
      <stop offset="0.6" stopColor="#FFE9C4" />
      <stop offset="1" stopColor={C.gold400} />
    </radialGradient>
    <radialGradient id={`${uid}-hall`} cx="50%" cy="38%" r="75%">
      <stop offset="0" stopColor="#24122F" />
      <stop offset="0.6" stopColor="#10081A" />
      <stop offset="1" stopColor={C.night950} />
    </radialGradient>
  </defs>
);

/** The hall behind the throne: arched windows, shafts of light, floor and carpet. `floorY` is where the dais meets the floor. */
export const Hall: React.FC<{uid: string; t: number; floorY: number; k: number; op: number}> = ({uid, t, floorY, k, op}) => {
  const win = (x: number, key: string) => (
    <g key={key}>
      <path d={`M${x},760 L${x},520 A80,80 0 0 1 ${x + 160},520 L${x + 160},760 Z`} fill={`url(#${uid}-win)`} stroke={C.gold700} strokeWidth={5} />
      <path d={`M${x + 80},440 L${x + 80},760 M${x},620 L${x + 160},620`} stroke={C.gold700} strokeWidth={3} opacity={0.6} />
      {new Array(6).fill(0).map((_, i) => (
        <circle key={i} cx={x + 20 + random(`${key}x${i}`) * 120} cy={500 + random(`${key}y${i}`) * 110} r={1.4 + random(`${key}r${i}`) * 1.6} fill={C.ivory} opacity={0.4 + 0.4 * Math.sin(t * 1.6 + i * 2)} />
      ))}
    </g>
  );
  const half = 150 * k;
  const bottom = half + (1920 - floorY) * 0.46;
  const vx = (m: number) => 540 + m;
  return (
    <g opacity={op}>
      <rect x={0} y={0} width={1080} height={1920} fill={`url(#${uid}-hall)`} />
      {win(70, 'wl')}
      {win(850, 'wr')}
      {/* shafts of light falling from the windows to the carpet */}
      <path d={`M80,760 L230,760 L${vx(260)},1760 L${vx(-20)},1760 Z`} fill={`url(#${uid}-beam)`} transform={`translate(0 ${(floorY - 1210) * 0.2})`} opacity={0.75 + 0.2 * Math.sin(t * 0.7)} />
      <path d={`M1000,760 L850,760 L${vx(-260)},1760 L${vx(20)},1760 Z`} fill={`url(#${uid}-beam)`} transform={`translate(0 ${(floorY - 1210) * 0.2})`} opacity={0.75 + 0.2 * Math.sin(t * 0.7 + 2)} />
      {/* floor */}
      <rect x={0} y={floorY - 30 * k} width={1080} height={1920 - floorY + 30 * k} fill={`url(#${uid}-floor)`} />
      {new Array(13).fill(0).map((_, i) => {
        const x = (i - 6) * 240;
        return <line key={i} x1={540 + x * 0.12} y1={floorY} x2={540 + x} y2={1920} stroke={C.gold700} strokeWidth={2} opacity={0.12} />;
      })}
      {new Array(7).fill(0).map((_, i) => {
        const y = floorY + (1920 - floorY) * (i / 7) ** 1.7 + 26;
        return <line key={i} x1={0} y1={y} x2={1080} y2={y} stroke={C.gold700} strokeWidth={2} opacity={0.1} />;
      })}
      {/* carpet */}
      <path d={`M${540 - half},${floorY} L${540 + half},${floorY} L${540 + bottom},1920 L${540 - bottom},1920 Z`} fill={`url(#${uid}-carpet)`} />
      <path d={`M${540 - half},${floorY} L${540 - bottom},1920 M${540 + half},${floorY} L${540 + bottom},1920`} stroke={C.gold500} strokeWidth={5} opacity={0.8} />
      <path d={`M${540 - half * 0.84},${floorY} L${540 - bottom * 0.84},1920 M${540 + half * 0.84},${floorY} L${540 + bottom * 0.84},1920`} stroke={C.gold700} strokeWidth={2.5} opacity={0.7} />
    </g>
  );
};

const GEMS = ['#C8283A', '#2E9E6B', '#4A78E0', '#2E9E6B', '#C8283A'];
/** A Byzantine-style crown, resting at (0,0) with its band on the cushion. */
export const Crown: React.FC<{uid: string; glow: number; t: number}> = ({uid, glow, t}) => {
  const g = `url(#${uid}-gold)`;
  const pulse = 1 + 0.06 * Math.sin(t * 2.4);
  return (
    <g>
      <circle cx={0} cy={-34} r={210 * pulse} fill={`url(#${uid}-halo)`} opacity={clamp(glow * 1.15)} />
      {[-1, 1].map((s) => (
        <g key={s}>
          <path d={`M${s * 44},-6 Q${s * 52},14 ${s * 54},32`} stroke={C.gold400} strokeWidth={3} fill="none" />
          <circle cx={s * 54} cy={34} r={6} fill={C.ivory} />
        </g>
      ))}
      <path d="M-50,-22 Q-52,-66 0,-72 Q52,-66 50,-22" fill="none" stroke={C.gold700} strokeWidth={9} />
      <path d="M-50,-22 Q-52,-66 0,-72 Q52,-66 50,-22" fill="none" stroke={g} strokeWidth={6} />
      <path d="M-26,-22 L-26,-52 L-13,-34 L0,-60 L13,-34 L26,-52 L26,-22 Z" fill={g} stroke={C.gold700} strokeWidth={2} />
      <rect x={-54} y={-24} width={108} height={24} rx={4} fill={g} stroke={C.gold700} strokeWidth={2.5} />
      {GEMS.map((c, i) => (
        <circle key={i} cx={-40 + i * 20} cy={-12} r={5.5} fill={c} stroke="#FFF6DA" strokeWidth={1} />
      ))}
      <circle cx={0} cy={-76} r={7} fill={g} stroke={C.gold700} strokeWidth={1.5} />
      <path d="M0,-98 L0,-82 M-8,-91 L8,-91" stroke={g} strokeWidth={5} strokeLinecap="round" />
      <path d="M0,-98 L0,-82 M-8,-91 L8,-91" stroke="#FFF6DA" strokeWidth={1.6} strokeLinecap="round" opacity={0.7} />
    </g>
  );
};

/** The throne: dais, niche, high arched back with a cross, arms, cushion; the crown rests on the seat. Origin = centre of the dais's front edge. */
export const Throne: React.FC<{uid: string; cx: number; y: number; k: number; op: number; glow: number; lift: number; t: number}> = ({uid, cx, y, k, op, glow, lift, t}) => {
  const g = `url(#${uid}-gold)`;
  const p = `url(#${uid}-purple)`;
  return (
    <g transform={`translate(${cx} ${y}) scale(${k})`} opacity={op}>
      {/* the niche behind */}
      <path d="M-255,-102 L-255,-440 A255,255 0 0 1 255,-440 L255,-102 Z" fill={`url(#${uid}-niche)`} stroke={C.gold700} strokeWidth={6} />
      <path d="M-228,-102 L-228,-440 A228,228 0 0 1 228,-440 L228,-102" fill="none" stroke={C.gold700} strokeWidth={2.5} opacity={0.6} />
      {/* dais */}
      <rect x={-330} y={-34} width={660} height={34} fill="#190F26" stroke={C.gold700} strokeWidth={3} />
      <rect x={-280} y={-68} width={560} height={34} fill="#22123A" stroke={C.gold700} strokeWidth={3} />
      <rect x={-235} y={-102} width={470} height={34} fill="#2C1648" stroke={C.gold500} strokeWidth={3.5} />
      {/* posts */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <rect x={s * 168 - 9} y={-470} width={18} height={330} rx={6} fill={`url(#${uid}-goldh)`} />
          <circle cx={s * 168} cy={-484} r={15} fill={`url(#${uid}-goldh)`} stroke={C.gold700} strokeWidth={2} />
        </g>
      ))}
      {/* back */}
      <path d="M-134,-176 L-134,-420 A134,134 0 0 1 134,-420 L134,-176 Z" fill={g} stroke={C.gold700} strokeWidth={3} />
      <path d="M-112,-176 L-112,-420 A112,112 0 0 1 112,-420 L112,-176 Z" fill={p} />
      <path d="M-90,-190 L-90,-420 A90,90 0 0 1 90,-420 L90,-190" fill="none" stroke={C.gold500} strokeWidth={2.5} opacity={0.55} />
      {/* a cross on the back */}
      <g opacity={0.95}>
        <rect x={-8} y={-468} width={16} height={104} rx={3} fill={g} stroke={C.gold700} strokeWidth={1.5} />
        <rect x={-38} y={-436} width={76} height={16} rx={3} fill={g} stroke={C.gold700} strokeWidth={1.5} />
      </g>
      {/* plinth, arms, cushion */}
      <rect x={-172} y={-150} width={344} height={48} fill={p} stroke={C.gold500} strokeWidth={3.5} />
      <rect x={-154} y={-138} width={308} height={24} fill="none" stroke={C.gold500} strokeWidth={2} opacity={0.6} />
      {[-1, 1].map((s) => (
        <g key={s}>
          <rect x={s > 0 ? 120 : -172} y={-262} width={52} height={116} rx={10} fill={g} stroke={C.gold700} strokeWidth={3} />
          <circle cx={s * 146} cy={-268} r={26} fill={`url(#${uid}-goldh)`} stroke={C.gold700} strokeWidth={3} />
          <circle cx={s * 146} cy={-268} r={11} fill="none" stroke={C.gold700} strokeWidth={3} />
        </g>
      ))}
      <rect x={-122} y={-178} width={244} height={32} rx={14} fill={p} stroke={C.gold400} strokeWidth={3} />
      {/* the crown on the seat */}
      <g transform={`translate(0 ${-186 - lift})`}>
        <Crown uid={uid} glow={glow} t={t} />
      </g>
    </g>
  );
};

/** A person as a point of light (the project's rule: no human figures). `hostile` tints the halo ember; `gold` turns it to gold. */
export const Light: React.FC<{uid: string; x: number; y: number; r: number; op?: number; gold?: number; flick?: number; t: number; seed?: number}> = ({uid, x, y, r, op = 1, gold = 0, flick = 0, t, seed = 0}) => {
  if (op <= 0.003) return null;
  const j = flick * 1.6 * (0.5 * Math.sin(t * 37 + seed) + 0.5 * Math.sin(t * 23.3 + seed * 2.1));
  const o = op * clamp(1 - 0.35 * Math.abs(j) * 1.4);
  const rr = r * (1 + 0.16 * j);
  const breath = 1 + 0.05 * Math.sin(t * 2.1 + seed);
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={rr * 6.2 * breath} fill={`url(#${uid}-ember)`} opacity={1 - gold} />
      <circle cx={x} cy={y} r={rr * 6.2 * breath} fill={`url(#${uid}-halo)`} opacity={gold} />
      <circle cx={x} cy={y} r={rr} fill={`url(#${uid}-core)`} />
    </g>
  );
};

/** The letter: a rolled parchment sealed in wax. Origin = its centre. */
export const Letter: React.FC<{uid: string; t: number; glow: number}> = ({uid, t, glow}) => (
  <g>
    <circle cx={0} cy={0} r={190} fill={`url(#${uid}-halo)`} opacity={0.55 * glow} />
    <rect x={-108} y={-56} width={216} height={112} rx={7} fill={C.parchment200} stroke={C.parchment400} strokeWidth={3} />
    <rect x={-108} y={-56} width={216} height={112} rx={7} fill={C.parchment400} opacity={0.28} />
    <ellipse cx={-108} cy={0} rx={13} ry={60} fill={C.parchment400} stroke={C.ink} strokeWidth={2} opacity={0.95} />
    <ellipse cx={108} cy={0} rx={13} ry={60} fill={C.parchment400} stroke={C.ink} strokeWidth={2} opacity={0.95} />
    <ellipse cx={-108} cy={0} rx={5} ry={26} fill={C.ink} opacity={0.5} />
    <ellipse cx={108} cy={0} rx={5} ry={26} fill={C.ink} opacity={0.5} />
    {[-36, -20, -4, 12].map((y, i) => (
      <path key={y} d={`M${-82 + (i % 2) * 6},${y} L${70 - (i % 3) * 16},${y}`} stroke={C.ink} strokeWidth={3} strokeLinecap="round" opacity={0.55} />
    ))}
    <path d="M-8,50 L-22,84 L-8,76 L0,90 Z M8,50 L22,84 L8,76 L0,90 Z" fill="#8F3B2C" opacity={0.9} />
    <circle cx={0} cy={44} r={25} fill={C.wax} stroke="#8A6A2C" strokeWidth={3} />
    <circle cx={0} cy={44} r={15} fill="none" stroke="#8A6A2C" strokeWidth={2.5} />
    <circle cx={0} cy={44} r={4} fill="#8A6A2C" />
    <circle cx={-8} cy={36} r={4 + 1.5 * Math.sin(t * 3)} fill="#FFF6DA" opacity={0.6 * glow} />
  </g>
);

export const mixP = lerp;
