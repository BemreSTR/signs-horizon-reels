import React from 'react';
import {random} from 'remotion';
import {C} from '../brand/tokens';
import {clamp} from '../lib/anim';

const TAU = Math.PI * 2;

const bodyPath = (R: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 96; i++) {
    const a = (i / 96) * TAU;
    const r = R * (1 + 0.009 * Math.cos(6 * a + 0.4) + 0.006 * Math.cos(3 * a + 1.1));
    pts.push(`${(r * Math.cos(a)).toFixed(1)},${(r * 0.965 * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join('L')}Z`;
};

const crownPath = (R: number) => {
  const y0 = -R * 0.9;
  const n = 6;
  const K = 1.3; // crown size
  let d = `M${-R * 0.2 * K},${y0}`;
  for (let i = 0; i < n; i++) {
    const p0 = i / n;
    const p1 = (i + 0.5) / n;
    const p2 = (i + 1) / n;
    const spread = (p: number) => (p - 0.5) * 2;
    d += ` L${(spread(p0) * R * 0.25 * K).toFixed(1)},${(y0 - R * 0.1 * K).toFixed(1)}`;
    d += ` L${(spread(p1) * R * 0.33 * K).toFixed(1)},${(y0 - R * K * (0.3 - 0.05 * Math.abs(spread(p1)))).toFixed(1)}`;
    d += ` L${(spread(p2) * R * 0.25 * K).toFixed(1)},${(y0 - R * 0.1 * K).toFixed(1)}`;
  }
  d += ` L${R * 0.2 * K},${y0} Q0,${y0 + R * 0.12} ${-R * 0.2 * K},${y0}Z`;
  return d;
};

const windowPath = (R: number, k: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 72; i++) {
    const a = (i / 72) * TAU;
    const r = R * 0.64 * k * (1 + 0.07 * Math.cos(3 * a + 0.7) + 0.045 * Math.cos(7 * a + 2.2) + 0.03 * Math.cos(11 * a));
    pts.push(`${(R * 0.04 + r * Math.cos(a)).toFixed(1)},${(R * 0.1 + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join('L')}Z`;
};

/** Hex-packed arils inside the opened window (local coordinates, R = fruit radius). */
export const arils = (R: number) => {
  const out: {x: number; y: number; r: number; i: number}[] = [];
  const s = R * 0.118;
  let i = 0;
  for (let row = -7; row <= 7; row++) {
    for (let col = -7; col <= 7; col++) {
      const x = R * 0.04 + (col + (row % 2 ? 0.5 : 0)) * s + (random(`ax${i}`) - 0.5) * s * 0.18;
      const y = R * 0.1 + row * s * 0.866 + (random(`ay${i}`) - 0.5) * s * 0.18;
      if (Math.hypot(x - R * 0.04, y - R * 0.1) < R * 0.72) out.push({x, y, r: s * (0.47 + 0.07 * random(`ar${i}`)), i});
      i++;
    }
  }
  return out;
};

/** The aril the camera dives into (closest to the window centre). */
export const TARGET_ARIL = (R: number) => arils(R).reduce((b, a) => (Math.hypot(a.x - R * 0.04, a.y - R * 0.1) < Math.hypot(b.x - R * 0.04, b.y - R * 0.1) ? a : b));

/**
 * A stylised pomegranate drawn in code. `open` 0..1 opens a window onto the arils; `crack` 0..1 draws the first split;
 * `lit` scales the highlights. Static geometry, everything animated from props (no CSS transitions).
 */
export const Pomegranate: React.FC<{x: number; y: number; r: number; t: number; open?: number; crack?: number; lit?: number; scale?: number; id?: string; goldAril?: number}> = ({
  x,
  y,
  r: R,
  t,
  open = 0,
  crack = 0,
  lit = 1,
  scale = 1,
  id = 'pg',
  goldAril = 0,
}) => {
  const body = React.useMemo(() => bodyPath(R), [R]);
  const crown = React.useMemo(() => crownPath(R), [R]);
  const seeds = React.useMemo(() => arils(R), [R]);
  const target = React.useMemo(() => TARGET_ARIL(R), [R]);
  const k = clamp(open);
  const speck = React.useMemo(
    () =>
      new Array(150).fill(0).map((_, i) => {
        const a = random(`sa${i}`) * TAU;
        const rr = Math.sqrt(random(`sr${i}`)) * R * 0.93;
        return {x: rr * Math.cos(a), y: rr * 0.96 * Math.sin(a), r: 1.2 + 3.2 * random(`ss${i}`) ** 2, o: 0.04 + 0.12 * random(`so${i}`)};
      }),
    [R],
  );
  const crackLen = R * 1.25;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <defs>
        <radialGradient id={`${id}-body`} cx="36%" cy="30%" r="78%">
          <stop offset="0" stopColor="#F2674C" />
          <stop offset="0.32" stopColor="#C52B30" />
          <stop offset="0.68" stopColor="#7E1322" />
          <stop offset="1" stopColor="#35070F" />
        </radialGradient>
        <linearGradient id={`${id}-rim`} x1="0.1" y1="0.1" x2="0.95" y2="0.95">
          <stop offset="0.35" stopColor={C.gold300} stopOpacity="0" />
          <stop offset="1" stopColor={C.gold300} stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id={`${id}-crown`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E3503F" />
          <stop offset="1" stopColor="#6A0F1B" />
        </linearGradient>
        <radialGradient id={`${id}-pith`} cx="50%" cy="45%" r="65%">
          <stop offset="0" stopColor="#F6EAC8" />
          <stop offset="1" stopColor="#CFAE74" />
        </radialGradient>
        <radialGradient id={`${id}-aril`} cx="38%" cy="32%" r="70%">
          <stop offset="0" stopColor="#FF9A86" />
          <stop offset="0.4" stopColor="#DC2140" />
          <stop offset="1" stopColor="#64061A" />
        </radialGradient>
        <radialGradient id={`${id}-arilgold`} cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#FFFBEA" />
          <stop offset="0.5" stopColor={C.gold300} />
          <stop offset="1" stopColor={C.gold500} />
        </radialGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={C.emberLight} stopOpacity="0.5" />
          <stop offset="0.55" stopColor={C.emberLight} stopOpacity="0.12" />
          <stop offset="1" stopColor={C.emberLight} stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={R * 0.055} />
        </filter>
        <clipPath id={`${id}-bodyclip`}>
          <path d={body} />
        </clipPath>
        <clipPath id={`${id}-win`}>
          <path d={windowPath(R, Math.max(0.001, k))} />
        </clipPath>
      </defs>
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <circle r={R * 2.1} fill={`url(#${id}-glow)`} opacity={0.75 * lit} />
        <ellipse cx={0} cy={R * 1.04} rx={R * 0.85} ry={R * 0.1} fill={C.emberLight} opacity={0.16 * lit} filter={`url(#${id}-blur)`} />
        <path d={crown} fill={`url(#${id}-crown)`} stroke={C.gold500} strokeOpacity={0.5} strokeWidth={3} strokeLinejoin="round" />
        <path d={body} fill={`url(#${id}-body)`} />
        <g clipPath={`url(#${id}-bodyclip)`}>
          {speck.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFD9A8" opacity={s.o} />
          ))}
          <ellipse cx={-R * 0.34} cy={-R * 0.4} rx={R * 0.3} ry={R * 0.16} transform={`rotate(-32 ${-R * 0.34} ${-R * 0.4})`} fill="#fff" opacity={0.2 * lit} filter={`url(#${id}-blur)`} />
          <ellipse cx={-R * 0.4} cy={-R * 0.47} rx={R * 0.09} ry={R * 0.035} transform={`rotate(-32 ${-R * 0.4} ${-R * 0.47})`} fill="#fff" opacity={0.3 * lit} />
        </g>
        <path d={body} fill="none" stroke={`url(#${id}-rim)`} strokeWidth={5} opacity={lit} />
        {crack > 0 && k < 0.15 ? (
          <path
            d={`M${-R * 0.5},${-R * 0.42} l${R * 0.2},${R * 0.2} l${R * 0.07},${-R * 0.06} l${R * 0.22},${R * 0.3} l${R * 0.1},${-R * 0.03} l${R * 0.24},${R * 0.34}`}
            fill="none"
            stroke={C.gold300}
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={crackLen}
            strokeDashoffset={crackLen * (1 - clamp(crack))}
            opacity={1 - k / 0.15}
          />
        ) : null}
        {k > 0 ? (
          <>
            <path d={windowPath(R, k * 1.045)} fill="#3A0A12" opacity={0.9} />
            <g clipPath={`url(#${id}-win)`}>
              <rect x={-R} y={-R} width={R * 2} height={R * 2} fill={`url(#${id}-pith)`} />
              {seeds.map((a) => {
                const tw = 0.5 + 0.5 * Math.sin(t * (1.6 + 2.2 * random(`at${a.i}`)) + a.i);
                const isT = a.i === target.i && goldAril > 0;
                return (
                  <g key={a.i}>
                    <circle cx={a.x} cy={a.y} r={a.r} fill={`url(#${id}-aril)`} />
                    {isT ? <circle cx={a.x} cy={a.y} r={a.r} fill={`url(#${id}-arilgold)`} opacity={goldAril} /> : null}
                    <circle cx={a.x - a.r * 0.3} cy={a.y - a.r * 0.34} r={a.r * 0.17} fill="#fff" opacity={0.35 + 0.5 * tw} />
                  </g>
                );
              })}
            </g>
            <path d={windowPath(R, k)} fill="none" stroke="#F3E2B8" strokeWidth={R * 0.022} opacity={0.9} />
          </>
        ) : null}
      </g>
    </svg>
  );
};
