import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {C} from '../brand/tokens';
import {Stars} from '../components/Atmosphere';
import {EASE, clamp, lerp, ramp} from '../lib/anim';
import {Chip, Line, Reel, ReelStep} from './Text';
import {BEAT, T} from './timeline';
import {MINI_L, N_FRUIT, ROOT, TREE, miniTree, segPath} from './tree';

const DEPTH_W = [15, 10, 7, 5, 3.6, 2.6, 1.9];
const EMBER = C.emberLight;
const DARK = '#262B3A';

const popAt = (order: number) => T.fruits + 5.2 * Math.sqrt(order / N_FRUIT);
const sproutAt = (i: number) => T.sprout + 4.5 * (Math.log(1 + i) / Math.log(N_FRUIT));
const MINIS = TREE.tips.map((tp, i) => ({d: miniTree(`mt${i}`), s: 1.05 + 0.55 * random(`ms${i}`), rot: (random(`mr${i}`) - 0.5) * 28, at: sproutAt(tp.sprout), x: tp.x, y: tp.y}));
const FLOOD = new Array(240).fill(0).map((_, i) => ({
  d: miniTree(`fl${i}`),
  x: random(`fx${i}`) * 1080,
  y: 260 + random(`fy${i}`) * 1560,
  s: 1.3 + 2.4 * random(`fs${i}`) ** 2,
  rot: (random(`fr${i}`) - 0.5) * 70,
  at: T.flood + 1.25 * Math.sqrt(i / 240),
}));

const METER: ReelStep[] = [
  {at: 9.3, lines: ['ALMOST NOTHING']},
  {at: T.sprout, lines: ['A WHOLE TREE'], color: EMBER},
  {at: T.flood, lines: ['AN ORCHARD'], color: EMBER},
  {at: T.flood + 0.4, lines: ['A FOREST'], color: EMBER},
  {at: T.flood + 0.8, lines: ['A SPRING'], color: EMBER},
];
const WORLD: ReelStep[] = [{at: T.world, lines: ['THE WHOLE', 'WORLD'], slam: true}];

// spring: lights on the curve of the earth
const LIMB_Y = 1040;
const ER = 1500;
const arcY = (x: number) => LIMB_Y + ER - Math.sqrt(ER * ER - (x - 540) * (x - 540));
const LIGHTS = new Array(2200).fill(0).map((_, i) => {
  const x = -40 + random(`lx${i}`) * 1160;
  const u = random(`lu${i}`);
  const d = 5 + 900 * u ** 2.0;
  return {x, y: arcY(x) + d, r: 1.3 + 4.2 * (d / 900), on: 18.5 + 3.7 * (0.72 * (x / 1080) + 0.28 * random(`lo${i}`)), fruit: random(`lf${i}`) < 0.45, tw: random(`lt${i}`)};
});

const TreeArt: React.FC<{t: number; reach: number; dark: number; pulse: number; fruits: boolean; fruitGlow: number}> = ({t, reach, dark, pulse, fruits, fruitGlow}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
    <defs>
      <radialGradient id="tfruit" cx="38%" cy="32%" r="72%">
        <stop offset="0" stopColor="#FF8A70" />
        <stop offset="0.45" stopColor="#CC2433" />
        <stop offset="1" stopColor="#5E0A18" />
      </radialGradient>
      <radialGradient id="troot" cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#FFF6DA" stopOpacity="0.95" />
        <stop offset="0.3" stopColor={C.gold300} stopOpacity="0.5" />
        <stop offset="1" stopColor={C.gold300} stopOpacity="0" />
      </radialGradient>
      <linearGradient id="tground" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={C.gold500} stopOpacity="0" />
        <stop offset="0.5" stopColor={C.gold500} stopOpacity="0.7" />
        <stop offset="1" stopColor={C.gold500} stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect x={120} y={ROOT.y} width={840} height={2.5} fill="url(#tground)" opacity={0.8} />
    {TREE.segs.map((s, i) => {
      const p = clamp((reach - s.d0) / s.len);
      if (p <= 0) return null;
      const isDark = s.d0 + s.len * 0.5 < dark;
      const w = DEPTH_W[s.depth];
      const head = pulse - s.d0;
      const showPulse = !isDark && pulse >= 0 && head > -40 && head < s.len + 40;
      return (
        <g key={i}>
          <path
            d={segPath(s)}
            fill="none"
            stroke={isDark ? DARK : s.depth < 2 ? C.gold400 : C.gold300}
            strokeWidth={w}
            strokeLinecap="round"
            strokeDasharray={`${s.len * p} ${s.len + 4}`}
            opacity={isDark ? 0.55 : 0.62 + 0.38 * (1 - s.depth / 7)}
          />
          {showPulse ? (
            <path d={segPath(s)} fill="none" stroke="#FFF8E2" strokeWidth={w + 2.5} strokeLinecap="round" strokeDasharray={`46 ${s.len + 200}`} strokeDashoffset={-(head - 46)} opacity={0.9} />
          ) : null}
        </g>
      );
    })}
    {dark < 10 ? <circle cx={ROOT.x} cy={ROOT.y} r={120 + 14 * Math.sin(t * 5.2)} fill="url(#troot)" opacity={clamp(reach / 200)} /> : null}
    {fruits
      ? TREE.tips.map((tp, i) => {
          const p = ramp(t, popAt(tp.order), popAt(tp.order) + 0.36, EASE.out);
          if (p <= 0) return null;
          const r = (10 + 4 * random(`fr${i}`)) * p * (1 + 0.45 * Math.sin(Math.PI * p));
          return (
            <g key={i}>
              <circle cx={tp.x} cy={tp.y} r={r * 2.6} fill={EMBER} opacity={0.16 * fruitGlow} />
              <circle cx={tp.x} cy={tp.y} r={r} fill="url(#tfruit)" stroke={C.gold300} strokeWidth={1.2} strokeOpacity={0.7 * fruitGlow} />
            </g>
          );
        })
      : null}
  </svg>
);

/** Scenes 2–4 (7.2–35.4 s): one centre → the whole spring → remove the One. */
export const TreeScene: React.FC<{t: number; bare?: boolean}> = ({t, bare = false}) => {
  const turn = t >= T.turn;
  // --- camera: pull back to the earth (17.4–19.8), cut back at the turn
  const z = turn ? 0 : ramp(t, T.spring, T.spring + 2.4, EASE.camera);
  const k = lerp(1, 0.085, z);
  const reach = TREE.maxD * 1.02 * ramp(t, T.tree + 0.2, 11.6, EASE.out);
  const dark = turn ? TREE.maxD * 1.1 * ramp(t, T.lightsOut, T.lightsOut + 1.2, EASE.inOut) : 0;
  const ph = (t - 9.6) % (2 * BEAT);
  const pulse = !turn && t >= 9.6 ? (ph < 0.8 ? (ph / 0.8) * TREE.maxD : -1) : turn && t < T.lightsOut ? (((t - T.turn) % (2 * BEAT)) / 0.8) * TREE.maxD : -1;
  const flash = 0.6 * (1 - ramp(t, T.tree, T.tree + 0.7, EASE.out));
  const cutFlash = turn ? 1 - ramp(t, T.turn, T.turn + 0.45, EASE.out) : 0;
  const flood = ramp(t, T.flood, T.world, EASE.linear);
  const sl = t - T.world;
  const shake = t > T.flood + 0.5 && sl < 0.5 ? 7 * (sl < 0 ? flood : Math.exp(-sl / 0.15)) : 0;
  const sx = shake * (random(`shx${Math.round(t * 30)}`) - 0.5) * 2;
  const sy = shake * (random(`shy${Math.round(t * 30)}`) - 0.5) * 2;
  const endFade = 1 - ramp(t, T.quote - 0.4, T.quote - 0.02, EASE.inOut);
  const meterOn = t >= 9.0 && t < T.world;
  const meterDim = turn && t >= T.lightsOut + 0.5 && t < T.sprout;
  return (
    <AbsoluteFill style={{background: C.night950}}>
      <AbsoluteFill style={{opacity: endFade, translate: `${sx}px ${sy}px`}}>
        <Stars t={t} n={120} seed="ts" maxY={1200} opacity={0.35 + 0.4 * z} />
        {/* the earth and its spring */}
        {z > 0 ? (
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, translate: `0px ${(1 - z) * 900}px`, opacity: clamp(z * 1.6)}}>
            <defs>
              <linearGradient id="earth" gradientUnits="userSpaceOnUse" x1="0" y1={LIMB_Y} x2="0" y2={LIMB_Y + 880}>
                <stop offset="0" stopColor="#1A2744" />
                <stop offset="0.25" stopColor="#101A30" />
                <stop offset="1" stopColor={C.night950} />
              </linearGradient>
              <radialGradient id="limb" gradientUnits="userSpaceOnUse" cx={540} cy={LIMB_Y + ER} r={ER + 70}>
                <stop offset={ER / (ER + 70)} stopColor={C.gold300} stopOpacity="0.5" />
                <stop offset="1" stopColor={C.gold300} stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx={540} cy={LIMB_Y + ER} r={ER + 70} fill="url(#limb)" opacity={0.55} />
            <circle cx={540} cy={LIMB_Y + ER} r={ER} fill="url(#earth)" stroke={C.gold300} strokeOpacity={0.8} strokeWidth={2.5} />
            {LIGHTS.map((l, i) => {
              const p = ramp(t, l.on, l.on + 0.5, EASE.out);
              if (p <= 0) return null;
              const tw = 0.7 + 0.3 * Math.sin(t * (2 + 3 * l.tw) + i);
              return (
                <g key={i} opacity={p * tw}>
                  <circle cx={l.x} cy={l.y} r={l.r * (1 + 0.8 * (1 - p))} fill={C.gold300} opacity={0.85} />
                  {l.fruit && l.r > 1.7 ? <circle cx={l.x + l.r * 0.9} cy={l.y - l.r * 1.1} r={l.r * 0.62} fill="#E0303E" /> : null}
                </g>
              );
            })}
          </svg>
        ) : null}
        {/* the tree */}
        <AbsoluteFill style={{transformOrigin: `${ROOT.x}px ${ROOT.y}px`, scale: String(k), translate: `0px ${(LIMB_Y + 4 - ROOT.y) * z}px`}}>
          <TreeArt t={t} reach={turn ? 1e6 : reach} dark={dark} pulse={pulse} fruits fruitGlow={turn && t > T.lightsOut ? 0.55 : 1} />
        </AbsoluteFill>
        {/* every fruit grows a tree of its own */}
        {t >= T.sprout ? (
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            {MINIS.map((m, i) => {
              const p = ramp(t, m.at, m.at + (i < 3 ? 0.9 : 0.5), EASE.out);
              if (p <= 0) return null;
              return (
                <path key={i} d={m.d} transform={`translate(${m.x} ${m.y}) rotate(${m.rot}) scale(${m.s})`} fill="none" stroke={EMBER} strokeWidth={3 / m.s} strokeLinecap="round" strokeDasharray={`${MINI_L * p} ${MINI_L + 4}`} opacity={0.92} />
              );
            })}
            {t >= T.flood
              ? FLOOD.map((m, i) => {
                  const p = ramp(t, m.at, m.at + 0.35, EASE.out);
                  if (p <= 0) return null;
                  return (
                    <path key={`f${i}`} d={m.d} transform={`translate(${m.x} ${m.y}) rotate(${m.rot}) scale(${m.s})`} fill="none" stroke={i % 3 === 0 ? '#FF8A5C' : EMBER} strokeWidth={2.6 / m.s} strokeLinecap="round" strokeDasharray={`${MINI_L * p} ${MINI_L + 4}`} opacity={0.85} />
                  );
                })
              : null}
            {t >= T.sprout && t < T.sprout + 1.1 ? (
              <circle cx={MINIS.find((m) => m.at === T.sprout)!.x} cy={MINIS.find((m) => m.at === T.sprout)!.y} r={20 + 90 * EASE.out((t - T.sprout) / 1.1)} fill="none" stroke={EMBER} strokeWidth={3} opacity={1 - (t - T.sprout) / 1.1} />
            ) : null}
          </svg>
        ) : null}
        {sl >= 0 && !bare ? <AbsoluteFill style={{background: `radial-gradient(circle at 50% 44%, rgba(5,7,12,0.92) 0%, rgba(5,7,12,0.78) 34%, rgba(5,7,12,0) 70%)`, opacity: ramp(sl, 0, 0.15)}} /> : null}
      </AbsoluteFill>

      {/* meter */}
      {meterOn && !bare ? (
        <AbsoluteFill style={{opacity: meterDim ? 0.35 + 0.25 * Math.sin(t * 40) : 1}}>
          <Chip t={t} at={9.0} text="EACH FRUIT COSTS" y={236} size={28} color={C.gold500} />
          <Reel t={t} steps={METER} y={282} cap={78} />
        </AbsoluteFill>
      ) : null}

      {/* statements */}
      {bare ? null : (
        <>
      <Line t={t} at={8.2} out={11.5} text="ONE CENTRE. ONE LAW." y={452} cap={84} gold={['ONE']} />
      <Line t={t} at={12.2} out={16.9} text="A THOUSAND FRUITS," y={420} cap={84} />
      <Line t={t} at={12.5} out={16.9} text="AS EASY AS ONE." y={508} cap={84} gold={['ONE']} />
      <Line t={t} at={19.2} out={23.5} text="A WHOLE SPRING," y={420} cap={84} />
      <Line t={t} at={19.5} out={23.5} text="AS EASY AS ONE FRUIT." y={508} cap={84} gold={['ONE', 'FRUIT']} />
      <Line t={t} at={T.turn + 0.5} out={27.2} text="NOW REMOVE" y={410} cap={104} />
      <Line t={t} at={T.turn + 0.7} out={27.2} text="THE ONE." y={516} cap={132} color={t < T.lightsOut ? C.gold300 : '#6C7080'} />
      <Line t={t} at={29.0} out={32.7} text="EVERY FRUIT NOW NEEDS" y={420} cap={84} />
      <Line t={t} at={29.3} out={32.7} text="ITS OWN TREE." y={508} cap={100} color={EMBER} />
      {sl >= 0 ? (
        <AbsoluteFill style={{opacity: endFade}}>
          <Chip t={t} at={T.world + 0.15} text="EACH FRUIT COSTS" y={640} size={30} color={C.gold500} />
          <Reel t={t} steps={WORLD} y={700} cap={160} />
        </AbsoluteFill>
      ) : null}

        </>
      )}

      {flash > 0 ? <AbsoluteFill style={{background: `radial-gradient(circle at 50% 74%, #FFF6DA 0%, ${C.gold300} 40%, ${C.gold500} 100%)`, opacity: flash}} /> : null}
      {cutFlash > 0 ? <AbsoluteFill style={{background: C.night950, opacity: cutFlash * 0.85}} /> : null}
      {sl >= 0 && sl < 0.4 ? <AbsoluteFill style={{background: '#FFD9B0', opacity: 0.26 * (1 - sl / 0.4)}} /> : null}
    </AbsoluteFill>
  );
};
