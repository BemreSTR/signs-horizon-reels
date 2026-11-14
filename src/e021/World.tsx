import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {C} from '../brand/tokens';
import {Stars} from '../components/Atmosphere';
import {EASE, clamp, ramp} from '../lib/anim';
import {FALLS, FALL_G, LIGHT_I, LIGHT_MOD, LIGHT_X, LIGHT_Y, PIVOT_Y, RINGS, SCROLL, SHAKES, ZOOM, kf} from './timeline';

/** Dune layers: height as a function of world x; the layer scrolls at `fac` × the camera scroll. */
interface Layer {base: number; amp: number; f1: number; p1: number; f2: number; p2: number; fac: number}
const NEAR: Layer = {base: 1425, amp: 16, f1: 0.0042, p1: 1.1, f2: 0.011, p2: 2.3, fac: 1};
const MID: Layer = {base: 1305, amp: 30, f1: 0.0031, p1: 0.4, f2: 0.0087, p2: 4.0, fac: 0.5};
const FAR: Layer = {base: 1238, amp: 40, f1: 0.0022, p1: 2.2, f2: 0.0063, p2: 1.5, fac: 0.25};
const dy = (L: Layer, wx: number) => L.base + L.amp * Math.sin(wx * L.f1 + L.p1) + L.amp * 0.45 * Math.sin(wx * L.f2 + L.p2);
const duneD = (L: Layer, S: number) => {
  const off = S * L.fac;
  let d = 'M -140 2100';
  for (let x = -140; x <= 1220; x += 20) d += ` L ${x} ${dy(L, x + off).toFixed(1)}`;
  return `${d} L 1220 2100 Z`;
};

const PALM_W = 2000; // world x of the palm (near layer)
const HOUSES = [
  {x: 90, w: 52, h: 34}, {x: 150, w: 40, h: 28}, {x: 215, w: 64, h: 40}, {x: 290, w: 46, h: 30}, {x: 340, w: 58, h: 36}, {x: 405, w: 38, h: 26}, {x: 460, w: 50, h: 32},
];

const Defs: React.FC<{u: string}> = ({u}) => (
  <defs>
    <linearGradient id={`${u}-far`} gradientUnits="userSpaceOnUse" x1="0" y1="1200" x2="0" y2="1700">
      <stop offset="0" stopColor="#2B2038" />
      <stop offset="1" stopColor="#0E0D1A" />
    </linearGradient>
    <linearGradient id={`${u}-mid`} gradientUnits="userSpaceOnUse" x1="0" y1="1260" x2="0" y2="1800">
      <stop offset="0" stopColor="#1B1527" />
      <stop offset="1" stopColor="#090912" />
    </linearGradient>
    <linearGradient id={`${u}-near`} gradientUnits="userSpaceOnUse" x1="0" y1="1400" x2="0" y2="1950">
      <stop offset="0" stopColor="#120F1B" />
      <stop offset="1" stopColor="#040509" />
    </linearGradient>
    <radialGradient id={`${u}-halo`}>
      <stop offset="0" stopColor="#FFE9B8" stopOpacity="0.85" />
      <stop offset="0.2" stopColor="#F3C77A" stopOpacity="0.42" />
      <stop offset="0.55" stopColor="#E29A55" stopOpacity="0.12" />
      <stop offset="1" stopColor="#E29A55" stopOpacity="0" />
    </radialGradient>
    <radialGradient id={`${u}-core`}>
      <stop offset="0" stopColor="#FFFFFF" />
      <stop offset="0.5" stopColor="#FFF0C8" />
      <stop offset="1" stopColor="#F3DDA2" stopOpacity="0" />
    </radialGradient>
    <radialGradient id={`${u}-glow`}>
      <stop offset="0" stopColor="#E2603A" stopOpacity="0.9" />
      <stop offset="0.5" stopColor="#B04A52" stopOpacity="0.35" />
      <stop offset="1" stopColor="#B04A52" stopOpacity="0" />
    </radialGradient>
    <linearGradient id={`${u}-veil`} gradientUnits="userSpaceOnUse" x1="0" y1="-300" x2="0" y2="1500">
      <stop offset="0" stopColor="#9EA2D2" stopOpacity="0" />
      <stop offset="0.45" stopColor="#9EA2D2" stopOpacity="0.2" />
      <stop offset="1" stopColor="#D2C2E8" stopOpacity="0.36" />
    </linearGradient>
    <linearGradient id={`${u}-stream`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#CFE0FF" stopOpacity="0.85" />
      <stop offset="1" stopColor="#4A66A8" stopOpacity="0.55" />
    </linearGradient>
    <radialGradient id={`${u}-date`} cx="0.4" cy="0.35" r="0.8">
      <stop offset="0" stopColor="#F0A646" />
      <stop offset="0.6" stopColor="#B8631F" />
      <stop offset="1" stopColor="#5C2C0E" />
    </radialGradient>
    <radialGradient id={`${u}-dim`}>
      <stop offset="0" stopColor="#02030A" stopOpacity="0" />
      <stop offset="0.28" stopColor="#02030A" stopOpacity="0.1" />
      <stop offset="1" stopColor="#02030A" stopOpacity="1" />
    </radialGradient>
  </defs>
);

/** Palm: trunk, fronds, optional children (dates) positioned by the caller from the returned crown. */
const crownOf = (x: number, y: number, s: number, sway: number) => ({cx: x + 26 * s + sway * 34 * s, cy: y - 560 * s});
const Palm: React.FC<{x: number; y: number; s: number; sway: number; t: number; fronds?: number}> = ({x, y, s, sway, t, fronds = 11}) => {
  const {cx, cy} = crownOf(x, y, s, sway);
  const trunk = `M ${x - 17 * s} ${y} Q ${x + 2 * s + sway * 8 * s} ${y - 300 * s} ${cx - 8 * s} ${cy} L ${cx + 8 * s} ${cy} Q ${x + 24 * s + sway * 8 * s} ${y - 300 * s} ${x + 19 * s} ${y} Z`;
  const bx = x + 1 * s, cxm = x + 13 * s + sway * 8 * s, cym = y - 300 * s;
  const rings: string[] = [];
  for (let k = 1; k < 19; k++) {
    const u = k / 19;
    const px = (1 - u) * (1 - u) * bx + 2 * u * (1 - u) * cxm + u * u * cx;
    const py = (1 - u) * (1 - u) * y + 2 * u * (1 - u) * cym + u * u * cy;
    const w = 17 * s * (1 - u) + 8 * s * u;
    rings.push(`M ${px - w} ${py} L ${px + w} ${py + 4 * s}`);
  }
  const fr = [];
  for (let k = 0; k < fronds; k++) {
    const base = -172 + (164 * k) / (fronds - 1);
    const a = ((base + 8 * (random(`pf${k}`) - 0.5)) * Math.PI) / 180 + sway * 0.08 * (k % 2 ? 1 : -1) * 1.0 + 0.015 * Math.sin(t * 1.1 + k * 1.7);
    const L = 285 * s * (0.8 + 0.3 * random(`pl${k}`));
    const ca = Math.cos(a), sa = Math.sin(a);
    const droop = L * 0.45 * (1 - Math.abs(sa) * 0.6);
    const tipX = cx + L * ca, tipY = cy + L * sa + droop;
    const ctrlX = cx + 0.55 * L * ca, ctrlY = cy + 0.55 * L * sa - 0.12 * L;
    let leaf = '';
    const N = 17;
    for (let i = 1; i <= N; i++) {
      const u = 0.1 + (0.9 * i) / N;
      const px = (1 - u) * (1 - u) * cx + 2 * u * (1 - u) * ctrlX + u * u * tipX;
      const py = (1 - u) * (1 - u) * cy + 2 * u * (1 - u) * ctrlY + u * u * tipY;
      const tx = 2 * (1 - u) * (ctrlX - cx) + 2 * u * (tipX - ctrlX);
      const ty = 2 * (1 - u) * (ctrlY - cy) + 2 * u * (tipY - ctrlY);
      const tl = Math.hypot(tx, ty) || 1;
      const nx = -ty / tl, ny = tx / tl;
      const l = 0.27 * L * (1 - u) ** 0.65 + 5 * s;
      for (const sg of [-1, 1]) leaf += ` M ${px.toFixed(1)} ${py.toFixed(1)} L ${(px + sg * nx * l * 0.9 + (tx / tl) * l * 0.55 + 0).toFixed(1)} ${(py + sg * ny * l * 0.9 + (ty / tl) * l * 0.55 + l * 0.35).toFixed(1)}`;
    }
    fr.push({spine: `M ${cx} ${cy} Q ${ctrlX} ${ctrlY} ${tipX} ${tipY}`, leaf});
  }
  return (
    <g>
      <path d={trunk} fill="#080A14" />
      <path d={rings.join(' ')} stroke="#1B1A2A" strokeWidth={2.2 * s} opacity={0.8} fill="none" />
      {fr.map((f, i) => (
        <g key={i}>
          <path d={f.spine} stroke="#0A0C17" strokeWidth={7 * s} fill="none" strokeLinecap="round" />
          <path d={f.leaf} stroke="#0A0C17" strokeWidth={3.4 * s} fill="none" strokeLinecap="round" />
          <path d={f.spine + f.leaf} stroke="#B49CC4" strokeWidth={Math.max(0.5, 1.3 * s)} opacity={s < 0.5 ? 0.12 : 0.3} fill="none" />
        </g>
      ))}
    </g>
  );
};

const DATE_HANG = [[-44, 34], [-28, 52], [-10, 30], [8, 56], [24, 36], [40, 50], [-2, 72], [52, 26]];
const DATE_DX = [-60, -35, -80, -20, -50, 10, -90, -5];
const Dates: React.FC<{t: number; u: string; px: number; py: number; sway: number}> = ({t, u, px, py, sway}) => {
  const {cx, cy} = crownOf(px, py, 1, sway);
  return (
    <>
      {DATE_HANG.map(([dx, dyy], i) => {
        const hx = cx + dx, hy = cy + dyy;
        const f = FALLS[i];
        const land = dy(NEAR, PALM_W + dx + DATE_DX[i]) + 6 + 12 * random(`dl${i}`);
        const fall = t - f;
        let x = hx, y = hy, glow = 0;
        if (fall > 0) {
          const g = 0.5 * FALL_G * fall * fall;
          x = hx + DATE_DX[i] * Math.min(1, fall / 0.7);
          if (hy + g >= land) {
            const tl = fall - Math.sqrt((2 * (land - hy)) / FALL_G);
            y = land - 11 * Math.exp(-tl * 9) * Math.abs(Math.sin(tl * 15));
            glow = ramp(tl, 0, 0.6, EASE.out);
          } else y = hy + g;
        }
        return (
          <g key={i}>
            {glow > 0 ? <circle cx={x} cy={land - 4} r={26} fill={`url(#${u}-halo)`} opacity={0.5 * glow} /> : null}
            <ellipse cx={x} cy={y} rx={9} ry={14} transform={`rotate(${(i % 2 ? 1 : -1) * 14} ${x} ${y})`} fill={`url(#${u}-date)`} />
            <ellipse cx={x - 3} cy={y - 5} rx={2.2} ry={4} fill="#FFE2A8" opacity={0.5} />
          </g>
        );
      })}
    </>
  );
};

const Stream: React.FC<{t: number; u: string; px: number; py: number}> = ({t, u, px, py}) => {
  const reveal = ramp(t, 46.5, 48.8, EASE.out);
  if (reveal <= 0) return null;
  const A = [px - 20, py + 10], B = [px - 150, py + 90], Cc = [px - 330, py + 200], D = [px - 470, py + 560];
  const pt = (uu: number) => {
    const m = 1 - uu;
    return [m * m * m * A[0] + 3 * m * m * uu * B[0] + 3 * m * uu * uu * Cc[0] + uu * uu * uu * D[0], m * m * m * A[1] + 3 * m * m * uu * B[1] + 3 * m * uu * uu * Cc[1] + uu * uu * uu * D[1]];
  };
  const N = 30;
  const L: number[][] = [], R: number[][] = [], M: number[][][] = [[], [], []];
  const poly = (k: number) => {
    const l: number[][] = [], r: number[][] = [];
    for (let i = 0; i <= N; i++) {
      const uu = i / N;
      const [x, y] = pt(uu);
      const [x2, y2] = pt(Math.min(1, uu + 0.01));
      const [x1, y1] = pt(Math.max(0, uu - 0.01));
      const tl = Math.hypot(x2 - x1, y2 - y1) || 1;
      const nx = -(y2 - y1) / tl, ny = (x2 - x1) / tl;
      const w = (8 + 120 * uu ** 1.25) * (1 + 0.1 * Math.sin(uu * 13 + t * 0.7)) * k;
      const w2 = (8 + 120 * uu ** 1.25) * (1 + 0.1 * Math.sin(uu * 11 + 2 + t * 0.6)) * k;
      l.push([x + nx * w, y + ny * w * 0.55]);
      r.push([x - nx * w2, y - ny * w2 * 0.55]);
      if (k === 1) [-0.5, 0, 0.5].forEach((q, j) => M[j].push([x + nx * w * q, y + ny * w * 0.55 * q]));
    }
    const f = (p: number[][]) => p.map((v) => `${v[0].toFixed(1)} ${v[1].toFixed(1)}`).join(' L ');
    return `M ${f(l)} L ${f(r.reverse())} Z`;
  };
  void L; void R;
  const wet = poly(1.22), body = poly(1), core = poly(0.5);
  const line = (arr: number[][]) => `M ${arr.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L ')}`;
  return (
    <g clipPath={`url(#${u}-sclip)`}>
      <clipPath id={`${u}-sclip`}>
        <rect x={-200} y={py - 30} width={1700} height={reveal * 760} />
      </clipPath>
      <path d={wet} fill="#0B1226" opacity={0.55} />
      <path d={body} fill={`url(#${u}-stream)`} opacity={0.62} />
      <path d={core} fill="#DDEBFF" opacity={0.2} />
      {M.map((m, j) => (
        <path key={j} d={line(m)} fill="none" stroke="#EAF2FF" strokeWidth={2.4} opacity={0.32} strokeDasharray="14 60" strokeDashoffset={-t * (60 + 16 * j) - j * 23} strokeLinecap="round" />
      ))}
      {new Array(12).fill(0).map((_, i) => {
        const [x, y] = pt(0.1 + 0.075 * i);
        const o = 0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * (1.5 + random(`sg${i}`) * 2) + i * 3));
        return <ellipse key={i} cx={x + (random(`sx${i}`) - 0.5) * 50} cy={y + (random(`sy${i}`) - 0.5) * 24} rx={10 + 10 * random(`sr${i}`)} ry={2.2} fill="#FFFFFF" opacity={o * 0.6} />;
      })}
    </g>
  );
};

const Veil: React.FC<{t: number; u: string; x: number}> = ({t, u, x}) => {
  const fall = ramp(t, 15.0, 16.6, EASE.out);
  const gone = 1 - ramp(t, 30.0, 31.6, EASE.inOut);
  if (fall <= 0.003 || gone <= 0.003) return null;
  const ROD = 790;
  const hem = ROD + 700 * fall;
  const x0 = x - 330, x1 = x + 330;
  const folds = new Array(17).fill(0).map((_, i) => {
    const fx = x0 + 6 + i * 38.5;
    const sw = Math.sin(t * 0.6 + i * 0.8) * 7;
    const hy = hem - 14 + 16 * Math.sin(i * 1.3 + t * 0.5);
    return {d: `M ${fx} ${ROD} Q ${fx + sw} ${(ROD + hy) / 2} ${fx + sw * 1.4} ${hy}`, w: 7 + (i % 3) * 3, dark: i % 2 === 0};
  });
  let hemPath = `M ${x0} ${ROD} L ${x1} ${ROD} L ${x1} ${hem}`;
  for (let k = 16; k >= 0; k--) hemPath += ` L ${x0 + k * 41.25} ${hem + 10 * Math.sin(k * 1.1 + t * 0.9)}`;
  hemPath += ' Z';
  return (
    <g opacity={gone}>
      <defs>
        <linearGradient id={`${u}-vmg`} gradientUnits="userSpaceOnUse" x1={x0} y1="0" x2={x1} y2="0">
          <stop offset="0" stopColor="#000" />
          <stop offset="0.1" stopColor="#fff" />
          <stop offset="0.9" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <linearGradient id={`${u}-vfill`} gradientUnits="userSpaceOnUse" x1="0" y1={ROD} x2="0" y2={ROD + 700}>
          <stop offset="0" stopColor="#B4B0E0" stopOpacity="0.1" />
          <stop offset="1" stopColor="#DCCDEE" stopOpacity="0.36" />
        </linearGradient>
        <mask id={`${u}-vm`}>
          <rect x={x0} y={ROD - 20} width={660} height={900} fill={`url(#${u}-vmg)`} />
        </mask>
      </defs>
      <g mask={`url(#${u}-vm)`}>
        <path d={hemPath} fill={`url(#${u}-vfill)`} />
        {folds.map((f, i) => (
          <path key={i} d={f.d} fill="none" stroke={f.dark ? '#1C1C38' : '#F3DDA2'} strokeOpacity={f.dark ? 0.2 : 0.09} strokeWidth={f.w} strokeLinecap="round" />
        ))}
      </g>
      <line x1={x0 - 14} y1={ROD} x2={x1 + 14} y2={ROD} stroke="#CFA24E" strokeWidth={5} strokeLinecap="round" opacity={0.85} />
      <circle cx={x0 - 18} cy={ROD} r={9} fill="#E6C377" />
      <circle cx={x1 + 18} cy={ROD} r={9} fill="#E6C377" />
    </g>
  );
};

const Light: React.FC<{t: number; u: string; x: number; y: number; I: number}> = ({t, u, x, y, I}) => {
  const R = 330 * (0.55 + 0.6 * I);
  return (
    <g>
      <ellipse cx={x} cy={1432} rx={300 * I} ry={34 * I} fill={`url(#${u}-halo)`} opacity={0.55} />
      {RINGS.map((r, i) => {
        const age = t - r.t;
        if (age < 0 || age > 2.6) return null;
        return <circle key={i} cx={x} cy={y} r={34 + age * 170} fill="none" stroke={C.gold300} strokeWidth={3.2 - age * 0.6} opacity={r.amp * (1 - age / 2.6) ** 1.6 * 0.75 * clamp(I * 1.1)} />;
      })}
      <circle cx={x} cy={y} r={R} fill={`url(#${u}-halo)`} opacity={clamp(I * 0.95)} />
      <circle cx={x} cy={y} r={10 + 13 * I} fill={`url(#${u}-core)`} />
    </g>
  );
};

/** The whole world as a pure function of t (t < 0: loop pre-roll). Text is drawn elsewhere. */
export const World: React.FC<{t: number; uid: string}> = ({t, uid}) => {
  const u = uid;
  const z = ZOOM(t);
  const S = SCROLL(t);
  const I = Math.max(0.04, LIGHT_I(t) + LIGHT_MOD(t));
  const LX = LIGHT_X(t);
  const walk = ramp(t, 11.5, 13.5) * (1 - ramp(t, 18.0, 19.0)) + ramp(t, 30.5, 32) * (1 - ramp(t, 35, 36.5));
  const LY = LIGHT_Y(t) + walk * 6 * Math.sin(t * 3.2);
  let sway = 0.12 * Math.sin(t * 0.9);
  for (const p of SHAKES) if (t > p) sway += Math.exp(-(t - p) / 0.75) * Math.sin(2 * Math.PI * 2.4 * (t - p));
  const px = PALM_W - S;
  const py = dy(NEAR, PALM_W) + 6;
  const glowA = kf(t, [[-5, 0.2], [38, 0.2], [41, 0.08], [46, 0.08], [56, 0.45], [62.5, 0.45], [66.95, 0.2]]);
  const starGain = kf(t, [[-5, 0.8], [5, 0.9], [6, 1], [38, 1], [41, 0.3], [46, 0.3], [49, 0.9], [66.95, 0.8]]);
  const dim = kf(t, [[38, 0], [41, 0.55], [45.5, 0.55], [48.5, 0]]);
  const sx = 540 + (LX - 540) * z;
  const sy = PIVOT_Y + (LY - PIVOT_Y) * z;
  return (
    <AbsoluteFill style={{background: C.night950}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id={`${u}-sky`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1340">
            <stop offset="0" stopColor="#02040A" />
            <stop offset="0.55" stopColor="#070C1B" />
            <stop offset="0.86" stopColor="#14183D" />
            <stop offset="1" stopColor="#3A2237" />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={1080} height={1920} fill={`url(#${u}-sky)`} />
      </svg>
      <Stars t={t} n={200} seed="e21" maxY={1250} opacity={starGain} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <Defs u={u} />
        <g transform={`translate(540 ${PIVOT_Y}) scale(${z}) translate(-540 ${-PIVOT_Y})`}>
          <ellipse cx={540} cy={1250} rx={900} ry={170} fill={`url(#${u}-glow)`} opacity={glowA} />
          <path d={duneD(FAR, S)} fill={`url(#${u}-far)`} />
          <path d={duneD(MID, S)} fill={`url(#${u}-mid)`} />
          {/* a far palm on the horizon (the hook's quiet foreshadowing) and the village that she leaves */}
          <g opacity={0.9}>
            {[{x: 830, s: 0.26}, {x: 905, s: 0.2}].map((p, i) => (
              <Palm key={i} x={p.x - MID.fac * S} y={dy(MID, p.x) + 4} s={p.s} sway={0} t={t} fronds={9} />
            ))}
            {HOUSES.map((h, i) => {
              const x = h.x - MID.fac * S;
              const y = dy(MID, h.x) + 4;
              return (
                <g key={i}>
                  <rect x={x - h.w / 2} y={y - h.h} width={h.w} height={h.h + 6} fill="#07080F" />
                  <rect x={x - 6 + (i % 2) * 6} y={y - h.h * 0.65} width={7} height={9} fill="#F0B25A" opacity={0.35 + 0.3 * (0.5 + 0.5 * Math.sin(t * 1.1 + i * 7))} />
                </g>
              );
            })}
          </g>
          <path d={duneD(NEAR, S)} fill={`url(#${u}-near)`} />
          {px < 1700 ? (
            <g>
              <Palm x={px} y={py} s={1} sway={sway} t={t} />
              <Dates t={t} u={u} px={px} py={py} sway={sway} />
              <Stream t={t} u={u} px={px} py={py} />
            </g>
          ) : null}
          <Light t={t} u={u} x={LX} y={LY} I={I} />
          <Veil t={t} u={u} x={LX} />
        </g>
        {dim > 0.002 ? (
          <g opacity={dim}>
            <circle cx={sx} cy={sy} r={1500} fill={`url(#${u}-dim)`} transform={`translate(${sx} ${sy}) scale(1 1.15) translate(${-sx} ${-sy})`} />
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
