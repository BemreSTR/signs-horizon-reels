import React from 'react';
import {random} from 'remotion';
import {EASE, clamp, ramp} from '../lib/anim';
import {WIPE_HALF} from './timeline';
import {K} from './tokens';

const R = 112;
const DX = Math.sqrt(3) * R;
const DY = 1.5 * R;
const hexPts = (x: number, y: number, r: number) =>
  new Array(6)
    .fill(0)
    .map((_, k) => {
      const a = ((60 * k - 30) * Math.PI) / 180;
      return `${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`;
    })
    .join(' ');

interface Cell {x: number; y: number; i: number}
const CELLS: Cell[] = [];
for (let r = -1; r * DY < 1920 + R * 2; r++) {
  for (let c = -1; c * DX < 1080 + DX * 2; c++) CELLS.push({x: c * DX + (((r % 2) + 2) % 2 ? DX / 2 : 0), y: r * DY, i: CELLS.length});
}

const PALETTE = [K.honey, K.honey, K.ink, K.ink, K.honeyDeep, K.honey];

/** Hex wipe: every tile grows to cover the frame by `cut`, then shrinks away (the shot below changes exactly at `cut`). */
export const HexWipe: React.FC<{t: number; cut: number; half?: number; dir?: 'down' | 'up' | 'centre'; seed?: string}> = ({t, cut, half = WIPE_HALF, dir = 'down', seed = 'w'}) => {
  if (t < cut - half - 0.01 || t > cut + half + 0.01) return null;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {CELLS.map((c) => {
        const d =
          dir === 'centre' ? clamp(Math.hypot(c.x - 540, c.y - 960) / 1100) : dir === 'up' ? 1 - clamp(c.y / 1920) : clamp(c.y / 1920);
        const jitter = 0.18 * random(`${seed}j${c.i}`);
        const dd = clamp(d * 0.8 + jitter);
        const a0 = cut - half + dd * 0.45 * half;
        const grow = ramp(t, a0, a0 + 0.55 * half, EASE.out);
        const b0 = cut + dd * 0.45 * half;
        const shrink = ramp(t, b0, b0 + 0.55 * half, EASE.snap);
        const s = grow * (1 - shrink);
        if (s <= 0.003) return null;
        const col = PALETTE[Math.floor(random(`${seed}c${c.i}`) * PALETTE.length)];
        return <polygon key={c.i} points={hexPts(c.x, c.y, (R + 3) * s)} fill={col} />;
      })}
    </svg>
  );
};

/** Honeycomb outline field for the black scenes; a few cells light up and fade (slow, well under 3 Hz). */
export const HexField: React.FC<{t: number; seed?: string; lit?: number; opacity?: number; bg?: string; drift?: number}> = ({t, seed = 'f', lit = 7, opacity = 0.2, bg = K.ink, drift = 7}) => {
  const ox = (t * drift) % DX;
  const oy = (t * drift * 0.6) % (2 * DY);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <rect width={1080} height={1920} fill={bg} />
      <radialGradient id={`${seed}-g`} cx="50%" cy="46%" r="70%">
        <stop offset="0" stopColor={K.honey} stopOpacity={0.16} />
        <stop offset="1" stopColor={K.honey} stopOpacity={0} />
      </radialGradient>
      <rect width={1080} height={1920} fill={`url(#${seed}-g)`} />
      <g transform={`translate(${-ox} ${-oy})`}>
        {CELLS.map((c) => {
          const per = 2.2 + 2.4 * random(`${seed}p${c.i}`);
          const ph = random(`${seed}h${c.i}`) * per;
          const u = ((t + ph) % per) / per;
          const on = random(`${seed}l${c.i}`) < lit / 40 ? Math.sin(Math.PI * u) ** 3 : 0;
          return (
            <polygon
              key={c.i}
              points={hexPts(c.x, c.y, R - 4)}
              fill={K.honey}
              fillOpacity={0.5 * on}
              stroke={K.honey}
              strokeOpacity={opacity + 0.2 * on}
              strokeWidth={3}
            />
          );
        })}
      </g>
    </svg>
  );
};

/** A hexagon ring that bursts outward from (x, y) and fades. */
export const HexBurst: React.FC<{t: number; at: number; x?: number; y?: number; color?: string; r0?: number; r1?: number; dur?: number; w?: number}> = ({
  t, at, x = 540, y = 900, color = K.honey, r0 = 120, r1 = 760, dur = 0.55, w = 10,
}) => {
  const u = (t - at) / dur;
  if (u < 0 || u > 1) return null;
  const e = EASE.out(u);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      <polygon points={hexPts(x, y, r0 + (r1 - r0) * e)} fill="none" stroke={color} strokeWidth={w * (1 - u) + 1} opacity={0.9 * (1 - u)} />
    </svg>
  );
};

export const HexShape: React.FC<{x: number; y: number; r: number; fill?: string; stroke?: string; sw?: number; opacity?: number}> = ({x, y, r, fill = 'none', stroke = 'none', sw = 6, opacity = 1}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity}}>
    <polygon points={hexPts(x, y, r)} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
  </svg>
);
