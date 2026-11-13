import React from 'react';
import {random} from 'remotion';
import {C} from '../brand/tokens';
import {EASE, clamp, lerp, ramp} from '../lib/anim';
import {L0, PULSES, RING, STEPS, T, camAt, chainAt, doorAt, emitAt, glowAt, leanAt, lightPos, lightScale, roomAt, stepVis} from './timeline';

type Cam = ReturnType<typeof camAt>;
const camT = (c: Cam, k = 1) => `translate(540 ${c.py}) scale(${1 + (c.z - 1) * k}) translate(${-c.fx} ${-c.fy})`;
const mod = (x: number, m: number) => ((x % m) + m) % m;
const VX = {l: 505, r: 575, y: 1090};

const Defs: React.FC<{u: string}> = ({u}) => (
  <defs>
    <linearGradient id={`${u}-sky`} gradientUnits="userSpaceOnUse" x1="0" y1="-2600" x2="0" y2="1100">
      <stop offset="0" stopColor="#02040A" />
      <stop offset="0.55" stopColor="#070C1B" />
      <stop offset="0.86" stopColor="#12183A" />
      <stop offset="1" stopColor="#3A2237" />
    </linearGradient>
    <linearGradient id={`${u}-ground`} gradientUnits="userSpaceOnUse" x1="0" y1="1090" x2="0" y2="1900">
      <stop offset="0" stopColor="#3B2530" />
      <stop offset="0.25" stopColor="#1A1220" />
      <stop offset="1" stopColor="#06070D" />
    </linearGradient>
    <linearGradient id={`${u}-wl`} gradientUnits="userSpaceOnUse" x1="-700" y1="0" x2="505" y2="0">
      <stop offset="0" stopColor="#05060C" />
      <stop offset="0.7" stopColor="#0C0F1C" />
      <stop offset="1" stopColor="#2A1C2B" />
    </linearGradient>
    <linearGradient id={`${u}-wr`} gradientUnits="userSpaceOnUse" x1="1780" y1="0" x2="575" y2="0">
      <stop offset="0" stopColor="#05060C" />
      <stop offset="0.7" stopColor="#0C0F1C" />
      <stop offset="1" stopColor="#2A1C2B" />
    </linearGradient>
    <radialGradient id={`${u}-halo`}>
      <stop offset="0" stopColor="#FFE2A8" stopOpacity="0.9" />
      <stop offset="0.22" stopColor={C.emberLight} stopOpacity="0.42" />
      <stop offset="1" stopColor={C.emberLight} stopOpacity="0" />
    </radialGradient>
    <radialGradient id={`${u}-core`}>
      <stop offset="0" stopColor="#FFFDF4" />
      <stop offset="0.55" stopColor={C.gold300} />
      <stop offset="1" stopColor={C.gold400} stopOpacity="0" />
    </radialGradient>
    <radialGradient id={`${u}-door`}>
      <stop offset="0" stopColor="#FFD58F" stopOpacity="1" />
      <stop offset="0.5" stopColor="#F2A24F" stopOpacity="0.55" />
      <stop offset="1" stopColor="#F2A24F" stopOpacity="0" />
    </radialGradient>
    <linearGradient id={`${u}-beam`} gradientUnits="userSpaceOnUse" x1="0" y1="1100" x2="0" y2="-1800">
      <stop offset="0" stopColor={C.gold300} stopOpacity="0.85" />
      <stop offset="0.6" stopColor={C.gold300} stopOpacity="0.25" />
      <stop offset="1" stopColor={C.gold300} stopOpacity="0" />
    </linearGradient>
    <linearGradient id={`${u}-roomwall`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#0B0C16" />
      <stop offset="1" stopColor="#1B1522" />
    </linearGradient>
  </defs>
);

const STARS = new Array(430).fill(0).map((_, i) => ({
  x: -1300 + random(`sx${i}`) * 3600,
  y: -2500 + random(`sy${i}`) ** 0.8 * 3560,
  r: 1.1 + 2.6 * random(`sr${i}`) ** 2.2,
  o: 0.35 + 0.65 * random(`so${i}`),
  l: 18 + 36 * random(`sl${i}`),
  p: random(`sp${i}`) * 6.28,
}));

const Stars: React.FC<{t: number; lx: number; ly: number}> = ({t, lx, ly}) => {
  const lean = leanAt(t);
  return (
    <g>
      {STARS.map((s, i) => {
        const tw = 0.78 + 0.22 * Math.sin(t * (0.9 + (i % 7) * 0.31) + s.p);
        const dx = lx - s.x;
        const dy = ly - s.y;
        const d = Math.hypot(dx, dy);
        const len = lean * s.l * clamp(1 - d / 3600);
        return (
          <g key={i} opacity={s.o * tw * (1 + 0.35 * clamp(lean))}>
            {len > 1 ? <line x1={s.x} y1={s.y} x2={s.x + (dx / d) * len} y2={s.y + (dy / d) * len} stroke={C.gold300} strokeWidth={s.r * 0.9} strokeLinecap="round" opacity={0.6} /> : null}
            <circle cx={s.x} cy={s.y} r={s.r} fill="#FFF6DA" />
          </g>
        );
      })}
    </g>
  );
};

/** Corner of a quad on a street wall: u runs from the vanishing point outward, h from the roof line (0) to the ground line (1). */
const wallPt = (side: 'l' | 'r', u: number, h: number): [number, number] => {
  const vx = side === 'l' ? VX.l : VX.r;
  const ex = side === 'l' ? -700 : 1780;
  const tx = lerp(vx, ex, u);
  const ty = lerp(VX.y, 720, u);
  const by = lerp(VX.y, 1900, u);
  return [tx, lerp(ty, by, h)];
};
const quad = (side: 'l' | 'r', u0: number, u1: number, h0: number, h1: number) =>
  [wallPt(side, u0, h0), wallPt(side, u1, h0), wallPt(side, u1, h1), wallPt(side, u0, h1)].map((p) => p.join(',')).join(' ');

const Palm: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke="#090B16" strokeLinecap="round" fill="none">
    <path d="M0,0 Q10,-70 2,-150" strokeWidth={7} />
    {[-78, -52, -26, 0, 26, 52, 78].map((a, k) => (
      <path key={k} d={`M2,-150 Q${2 + a * 0.9},${-190 + Math.abs(a) * 0.35} ${2 + a * 1.55},${-140 + Math.abs(a) * 0.9}`} strokeWidth={4} />
    ))}
  </g>
);

const Town: React.FC<{u: string; t: number}> = ({u, t}) => {
  const door = doorAt(t);
  const wins: React.ReactNode[] = [];
  (['l', 'r'] as const).forEach((side) => {
    for (let i = 0; i < 11; i++) {
      const u0 = 0.07 + i * 0.075;
      if (side === 'r' && u0 > 0.13 && u0 < 0.24) continue;
      [[0.2, 0.34], [0.5, 0.62]].forEach(([h0, h1], r) => {
        const lit = random(`w${side}${i}${r}`) < 0.3;
        const fl = lit ? 0.55 + 0.4 * (0.5 + 0.5 * Math.sin(t * (1.1 + random(`wf${i}${r}`)) + i * 3 + r)) : 0;
        wins.push(<polygon key={`${side}${i}${r}`} points={quad(side, u0, u0 + 0.034, h0, h1)} fill={lit ? '#FFB96B' : '#04050A'} opacity={lit ? fl * 0.85 : 0.9} />);
      });
    }
  });
  const dq = quad('r', 0.165, 0.225, 0.4, 1.0);
  const dc = wallPt('r', 0.195, 0.72);
  return (
    <g>
      <polygon points={`${VX.l},${VX.y} ${VX.r},${VX.y} 1780,1900 -700,1900`} fill={`url(#${u}-ground)`} />
      {/* worn paving: seams run to the vanishing point, courses get farther apart as the street comes toward us */}
      <g stroke="#9A7A86" fill="none" strokeLinecap="round">
        {new Array(15).fill(0).map((_, k) => {
          const kk = k - 7;
          return <line key={`s${k}`} x1={540 + kk * 6} y1={1094} x2={540 + kk * 300} y2={1900} strokeWidth={1.4} opacity={0.075} />;
        })}
        {new Array(13).fill(0).map((_, k) => {
          const y = 1094 + 806 * Math.pow((k + 1) / 13, 2.1);
          const hw = 40 + (y - 1094) * 1.6;
          return <line key={`c${k}`} x1={540 - hw} y1={y} x2={540 + hw} y2={y} strokeWidth={1.2 + (y - 1094) / 500} opacity={0.06} />;
        })}
      </g>
      {/* her light on the wet street */}
      <ellipse cx={lightPos(t).x} cy={lightPos(t).y + 70 * lightScale(t)} rx={250 * lightScale(t)} ry={70 * lightScale(t)} fill={`url(#${u}-halo)`} opacity={0.5 * glowAt(t)} />
      <ellipse cx={lightPos(t).x} cy={lightPos(t).y + 150 * lightScale(t)} rx={90 * lightScale(t)} ry={150 * lightScale(t)} fill={`url(#${u}-halo)`} opacity={0.2 * glowAt(t)} />
      {/* the far end of the street: low houses and two palms (never a mosque) */}
      <g fill="#0B0F20">
        {[[330, 40, 56], [372, 32, 70], [418, 26, 46], [452, 24, 60], [622, 26, 62], [654, 30, 44], [690, 34, 74], [736, 40, 52]].map(([x, w, h], i) => (
          <rect key={i} x={x} y={1090 - h} width={w} height={h + 2} />
        ))}
      </g>
      <Palm x={462} y={1092} s={0.42} />
      <Palm x={612} y={1092} s={0.5} />
      <polygon points={`${VX.l},${VX.y} -700,720 -700,1900`} fill={`url(#${u}-wl)`} />
      <polygon points={`${VX.r},${VX.y} 1780,720 1780,1900`} fill={`url(#${u}-wr)`} />
      {wins}
      {/* the doorway: light spills from it when she arrives */}
      <polygon points={dq} fill="#05060C" />
      <polygon points={dq} fill={`url(#${u}-door)`} opacity={door} />
      <circle cx={dc[0]} cy={dc[1]} r={150} fill={`url(#${u}-door)`} opacity={0.5 * door} />
      <ellipse cx={dc[0] - 36} cy={dc[1] + 108} rx={120} ry={34} fill={`url(#${u}-door)`} opacity={0.55 * door} />
    </g>
  );
};

const Rings: React.FC<{t: number; x: number; y: number}> = ({t, x, y}) => {
  const emit = emitAt(t);
  const n = Math.ceil(RING.max / RING.gap);
  return (
    <g>
      {emit > 0.01
        ? new Array(n).fill(0).map((_, k) => {
            const r = mod(RING.v * t + k * RING.gap, RING.max);
            const f = 1 - r / RING.max;
            return <circle key={k} cx={x} cy={y} r={r + 24} fill="none" stroke={C.gold300} strokeWidth={1.2 + 2.6 * f} opacity={emit * Math.pow(f, 1.35) * Math.min(1, r / 70) * 0.7} />;
          })
        : null}
      {PULSES.map((p0, i) => {
        const a = t - p0;
        if (a < 0 || a > 2.6) return null;
        const f = a / 2.6;
        return <circle key={`p${i}`} cx={x} cy={y} r={30 + a * 640} fill="none" stroke="#FFF1C7" strokeWidth={6 * (1 - f) + 1} opacity={0.85 * Math.pow(1 - f, 1.6)} />;
      })}
    </g>
  );
};

const Chain: React.FC<{t: number; x: number; y: number; s: number}> = ({t, x, y, s}) => {
  const {on, R, shatter} = chainAt(t);
  if (on < 0.01) return null;
  const links = 22;
  const rr = R * s;
  const circ = 2 * Math.PI * rr;
  if (shatter <= 0) {
    return (
      <g opacity={on}>
        <circle cx={x} cy={y} r={rr} fill="none" stroke="#6E7594" strokeWidth={9 * s} strokeDasharray={`${circ / links * 0.62} ${circ / links * 0.38}`} transform={`rotate(${t * 7} ${x} ${y})`} />
        <circle cx={x} cy={y} r={rr} fill="none" stroke="#C3C8DD" strokeWidth={4 * s} strokeDasharray={`${circ / links * 0.62} ${circ / links * 0.38}`} transform={`rotate(${t * 7} ${x} ${y})`} />
      </g>
    );
  }
  const segs = 11;
  return (
    <g opacity={on}>
      {new Array(segs).fill(0).map((_, i) => {
        const a = (i / segs) * Math.PI * 2 + t * 0.12;
        const span = (Math.PI * 2) / segs * 0.62;
        const rad = rr + EASE.out(shatter) * (260 + 160 * random(`sh${i}`));
        const sx = x + rad * Math.cos(a);
        const sy = y + rad * Math.sin(a);
        const ex = x + rad * Math.cos(a + span);
        const ey = y + rad * Math.sin(a + span);
        return <path key={i} d={`M${sx},${sy} A${rad},${rad} 0 0 1 ${ex},${ey}`} stroke="#C3C8DD" strokeWidth={6 * s * (1 - shatter) + 1} strokeLinecap="round" fill="none" opacity={1 - shatter} />;
      })}
    </g>
  );
};

export const Light: React.FC<{u: string; x: number; y: number; r?: number; op?: number; t: number; seed?: number; tint?: string}> = ({u, x, y, r = 14, op = 1, t, seed = 0, tint}) => {
  const fl = 1 + 0.05 * Math.sin(t * 2.3 + seed) + 0.025 * Math.sin(t * 7.1 + seed * 2);
  return (
    <g opacity={op}>
      <circle cx={x} cy={y} r={r * 11 * fl} fill={`url(#${u}-halo)`} opacity={tint ? 0.7 : 1} />
      <circle cx={x} cy={y} r={r * fl} fill={`url(#${u}-core)`} />
    </g>
  );
};

/** Inside the room: she speaks (her rings), Aisha sits in the corner and the words reach her in pieces; then the sky answers. */
const Room: React.FC<{u: string; t: number}> = ({u, t}) => {
  const o = roomAt(t);
  if (o <= 0.003) return null;
  const KX = 420;
  const KY = 1120;
  const AX = 760;
  const AY = 1150;
  const full = ramp(t, T.heard, T.heard + 0.9, EASE.inOut);
  const beam = ramp(t, T.heard - 0.1, T.heard + 1.0, EASE.inOut);
  const lt = t - 35.0;
  return (
    <g opacity={o}>
      <rect x={0} y={0} width={1080} height={1920} fill={`url(#${u}-roomwall)`} />
      <rect x={0} y={1280} width={1080} height={640} fill="#07070D" />
      <path d="M0,1280 L1080,1280" stroke="#2A2030" strokeWidth={3} />
      {/* an arched window onto the night */}
      <path d="M390,1000 L390,560 Q540,420 690,560 L690,1000 Z" fill="#070C1C" stroke="#2B2438" strokeWidth={8} />
      {new Array(40).fill(0).map((_, i) => (
        <circle key={i} cx={400 + random(`rx${i}`) * 280} cy={470 + random(`ry${i}`) * 520} r={1 + 1.6 * random(`rr${i}`)} fill="#FFF6DA" opacity={0.4 + 0.5 * random(`ro${i}`)} />
      ))}
      <path d="M390,1000 L690,1000" stroke="#2B2438" strokeWidth={10} />
      {/* her words as rings: whole in the middle, broken where Aisha sits */}
      <g>
        {new Array(7).fill(0).map((_, k) => {
          const r = mod(lt * 170 + k * 150, 1050);
          const f = 1 - r / 1050;
          const broken = t < T.heard;
          return (
            <circle key={k} cx={KX} cy={KY} r={r + 20} fill="none" stroke={C.gold300} strokeWidth={2 + 3 * f} strokeDasharray={broken ? `${30 + 14 * (k % 3)} ${24 + 12 * (k % 2)}` : undefined} opacity={Math.pow(f, 1.1) * (broken ? 0.62 : 0.9)} />
          );
        })}
      </g>
      <Light u={u} x={KX} y={KY} r={20} t={t} seed={1} />
      <Light u={u} x={AX} y={AY} r={14} op={0.82} t={t} seed={4} tint="soft" />
      {/* the answer: a column of light through the roof, and the whole room is lit */}
      <rect x={KX - 14 - 20 * beam} y={-200} width={28 + 40 * beam} height={KY + 200} fill={`url(#${u}-beam)`} opacity={0.72 * beam} />
      <circle cx={KX} cy={KY} r={1200} fill={`url(#${u}-halo)`} opacity={0.5 * full} />
      <rect x={0} y={0} width={1080} height={1920} fill="#F6D7A0" opacity={0.05 * full} />
    </g>
  );
};

export const Steps: React.FC<{u: string; t: number}> = ({u, t}) => (
  <g>
    {STEPS.map((s, i) => {
      const v = stepVis(t, i);
      if (v <= 0.003) return null;
      const rise = (1 - EASE.out(clamp((t - s.t) / 1.2))) * 140;
      return (
        <g key={i}>
          <circle cx={s.x} cy={s.y + rise} r={60 + 150 * (1 - v)} fill="none" stroke={C.gold300} strokeWidth={2} opacity={0.5 * (1 - v)} />
          <Light u={u} x={s.x} y={s.y + rise} r={13} op={v} t={t} seed={i * 3 + 1} />
        </g>
      );
    })}
  </g>
);

/** The whole world as one pure function of t. `uid` keeps gradient ids unique when the scene is on screen twice. */
export const World: React.FC<{t: number; uid: string}> = ({t, uid}) => {
  const c = camAt(t);
  const lp = lightPos(t);
  const s = lightScale(t);
  const g = glowAt(t);
  const beam = ramp(t, T.turned, T.turned + 0.7) * (1 - ramp(t, 47.4, 50.2));
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <Defs u={uid} />
      <g transform={camT(c, 1)}>
        <rect x={-3000} y={-3200} width={7000} height={4300} fill={`url(#${uid}-sky)`} />
      </g>
      <g transform={camT(c, 0.55)}>
        <Stars t={t} lx={L0.x} ly={L0.y} />
      </g>
      <g transform={camT(c, 1)}>
        {beam > 0.01 ? (
          <polygon points={`${lp.x - 5 - 8 * beam},${lp.y} ${lp.x + 5 + 8 * beam},${lp.y} ${lp.x + 60 + 40 * beam},-1800 ${lp.x - 60 - 40 * beam},-1800`} fill={`url(#${uid}-beam)`} opacity={0.75 * beam} />
        ) : null}
        <Town u={uid} t={t} />
        <clipPath id={`${uid}-clip`}>
          <rect x={-3000} y={-6000} width={7000} height={6000 + lp.y + 6} />
        </clipPath>
        <g clipPath={`url(#${uid}-clip)`}>
          <Rings t={t} x={lp.x} y={lp.y} />
        </g>
        <ellipse cx={lp.x} cy={lp.y + 64 * s} rx={9 * s} ry={64 * s} fill="#FFC27A" opacity={0.2 * g} />
        <Chain t={t} x={lp.x} y={lp.y} s={s} />
        <Light u={uid} x={lp.x} y={lp.y} r={14 * s} op={g} t={t} />
      </g>
      <Steps u={uid} t={t} />
      <Room u={uid} t={t} />
    </svg>
  );
};
