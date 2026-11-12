import React from 'react';
import {random} from 'remotion';
import {C, FONT} from '../brand/tokens';
import {EASE, clamp, ramp} from '../lib/anim';
import {FALL, PEBBLE, Q, thetaAt} from './timeline';

const L = 236; // half beam
const CHAIN = 168;
/** Resting places of the five weights in the right pan (pan frame; the pan's rim centre is the origin). */
const REST: [number, number][] = [[0, 12], [-40, 12], [40, 12], [-20, -22], [20, -22]];
const WR = 19;

const Spark: React.FC<{x: number; y: number; age: number; seed: string}> = ({x, y, age, seed}) => {
  if (age < 0 || age > 0.6) return null;
  const u = age / 0.6;
  return (
    <>
      {new Array(7).fill(0).map((_, i) => {
        const a = random(`${seed}a${i}`) * Math.PI * 2;
        const d = (26 + 46 * random(`${seed}d${i}`)) * EASE.out(u);
        return <circle key={i} cx={x + d * Math.cos(a)} cy={y + d * Math.sin(a) - 14 * u} r={2.6 * (1 - u) + 0.6} fill={C.gold300} opacity={0.9 * (1 - u)} />;
      })}
    </>
  );
};

const Coin: React.FC<{uid: string; x: number; y: number}> = ({uid, x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle cx={0} cy={5} r={WR} fill={C.gold700} />
    <circle cx={0} cy={0} r={WR} fill={`url(#${uid}-gold)`} stroke={C.gold700} strokeWidth={2} />
    <circle cx={0} cy={0} r={WR - 6} fill="none" stroke={C.gold700} strokeWidth={1.8} opacity={0.7} />
    <circle cx={-6} cy={-6} r={4} fill="#FFF6DA" opacity={0.7} />
  </g>
);

const Pan: React.FC<{uid: string; x: number; y: number; children?: React.ReactNode}> = ({uid, x, y, children}) => (
  <g>
    <path d={`M${x},${y} L${x - 74},${y + CHAIN} M${x},${y} L${x + 74},${y + CHAIN}`} stroke={C.gold700} strokeWidth={3} fill="none" />
    <g transform={`translate(${x} ${y + CHAIN})`}>
      <path d="M-86,0 Q0,84 86,0 Z" fill={`url(#${uid}-gold)`} stroke={C.gold700} strokeWidth={3} />
      {children}
      <path d="M-86,0 L86,0" stroke={C.gold300} strokeWidth={4} strokeLinecap="round" />
    </g>
  </g>
);

/** The scale: the emperor's judgment, drawn as a balance. Left pan: a heavy stone (a claim is presumed false). Right pan: five weights, one per answer. */
export const Scale: React.FC<{uid: string; t: number; cx: number; cy: number; op: number}> = ({uid, t, cx, cy, op}) => {
  if (op <= 0.003) return null;
  const th = thetaAt(t);
  const lx = -L * Math.cos(th);
  const ly = -L * Math.sin(th);
  const rx = L * Math.cos(th);
  const ry = L * Math.sin(th);
  const pebbleU = (t - (PEBBLE - FALL)) / FALL;
  return (
    <g transform={`translate(${cx} ${cy})`} opacity={op}>
      {/* pillar and base */}
      <rect x={-7} y={0} width={14} height={338} rx={5} fill={`url(#${uid}-goldh)`} />
      <path d="M-96,340 L96,340 L70,312 L-70,312 Z" fill={`url(#${uid}-gold)`} stroke={C.gold700} strokeWidth={3} />
      <rect x={-110} y={340} width={220} height={16} rx={6} fill={C.gold700} />
      {/* beam */}
      <path d={`M${lx},${ly} L${rx},${ry}`} stroke={C.gold700} strokeWidth={16} strokeLinecap="round" />
      <path d={`M${lx},${ly} L${rx},${ry}`} stroke={C.gold400} strokeWidth={10} strokeLinecap="round" />
      <path d={`M${lx},${ly - 3} L${rx},${ry - 3}`} stroke="#FFF6DA" strokeWidth={2.5} strokeLinecap="round" opacity={0.6} />
      <circle cx={lx} cy={ly} r={12} fill={`url(#${uid}-gold)`} stroke={C.gold700} strokeWidth={2.5} />
      <circle cx={rx} cy={ry} r={12} fill={`url(#${uid}-gold)`} stroke={C.gold700} strokeWidth={2.5} />
      <circle cx={0} cy={0} r={22} fill={`url(#${uid}-gold)`} stroke={C.gold700} strokeWidth={3} />
      <circle cx={0} cy={0} r={8} fill={C.gold700} />
      {/* left pan: the stone, and the enemy's pebble of doubt */}
      <Pan uid={uid} x={lx} y={ly}>
        <path d="M-40,14 L-32,-14 L-8,-30 L24,-20 L40,6 L30,20 Z" fill="#363B55" stroke="#6C7394" strokeWidth={3} strokeLinejoin="round" />
        <path d="M-32,-14 L-8,-30 L6,-10 L-14,4 Z" fill="#4A5070" opacity={0.8} />
        {pebbleU > 0 ? (
          <g transform={`translate(${50} ${10 - (1 - Math.min(1, pebbleU) ** 2) * 560})`} opacity={clamp(pebbleU * 6)}>
            <circle cx={0} cy={0} r={12} fill="#555B78" stroke="#8A91B0" strokeWidth={2} />
          </g>
        ) : null}
      </Pan>
      {/* right pan: one weight per answer */}
      <Pan uid={uid} x={rx} y={ry}>
        {Q.map((q, i) => {
          const s = q.t0 + q.drop;
          const u = (t - s) / FALL;
          if (u < 0) return null;
          const [px, py] = REST[i];
          const fall = u < 1 ? (1 - u * u) * 600 : 0;
          const age = t - (s + FALL);
          const bounce = age > 0 ? -9 * Math.exp(-age / 0.1) * Math.abs(Math.sin(age * 22)) : 0;
          return (
            <g key={i}>
              <g transform={`translate(0 ${-fall + bounce})`}>
                <Coin uid={uid} x={px} y={py} />
              </g>
              <Spark x={px} y={py} age={age} seed={`w${i}`} />
            </g>
          );
        })}
      </Pan>
      <text x={lx} y={ly + CHAIN + 112} textAnchor="middle" fontFamily={FONT.mono} fontWeight={500} fontSize={26} letterSpacing="0.14em" fill={C.mist}>
        IMPOSTOR?
      </text>
      <text x={rx} y={ry + CHAIN + 112} textAnchor="middle" fontFamily={FONT.mono} fontWeight={500} fontSize={26} letterSpacing="0.14em" fill={C.gold400} opacity={0.6 + 0.4 * ramp(t, Q[0].t0 + Q[0].drop, Q[0].t0 + Q[0].drop + 0.6)}>
        MESSENGER?
      </text>
    </g>
  );
};
