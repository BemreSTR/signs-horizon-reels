import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {C, FONT, FPS} from '../brand/tokens';
import {Glow} from '../components/Atmosphere';
import {ArabicLine} from '../components/Typography';
import {EASE, lerp, ramp} from '../lib/anim';
import {Defs, SIGNS} from './BrandKit';

/** The channel sting: 3 s, loop-safe. It leaves the episode's opening frame and returns to it (docs/brand/kimlik.md). */
export const OUTRO_SECONDS = 3;
export const OUTRO_FRAMES = OUTRO_SECONDS * FPS;

const CX = 540;
const LINE_Y = 930;
const RISE = 92;
const HALF = 470;
const BOW = 30;
const NAME = 'Signs in the Horizon';
const SPLIT = 'Signs in the '.length;

/** y of the curved horizon at x (a shallow arch, highest in the middle). */
const arcY = (x: number) => LINE_Y - BOW * (1 - ((x - CX) / HALF) ** 2);

/** 0 → 1 in, then 1 → 0 at the end: the veil over the episode frame. */
export const veil = (t: number) => ramp(t, 0, 0.42, EASE.inOut) * (1 - ramp(t, 2.42, 2.95, EASE.inOut));

const OStars: React.FC<{t: number; opacity: number}> = ({t, opacity}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity}}>
    {new Array(150).fill(0).map((_, i) => {
      const tw = 0.55 + 0.45 * Math.sin(t * (1.5 + 2 * random(`ot${i}`)) + i * 2.1);
      return (
        <circle
          key={i}
          cx={random(`ox${i}`) * 1080}
          cy={random(`oy${i}`) ** 1.3 * 1500}
          r={0.6 + 1.5 * random(`or${i}`) ** 3}
          fill={C.ivory}
          opacity={(0.1 + 0.55 * random(`oo${i}`) ** 2) * tw}
        />
      );
    })}
  </svg>
);

/**
 * `base` is the frame the sting leaves and returns to (the episode's first frame, still moving);
 * `from` is where a light already sits in that frame: the sting's point rises out of it.
 */
export const Outro: React.FC<{t: number; base?: React.ReactNode; from?: [number, number]}> = ({t, base, from = [CX, 1500]}) => {
  const v = veil(t);
  const out = 1 - ramp(t, 2.38, 2.88, EASE.inOut);
  // The point: travels from the base light to the horizon, lands, then rises like the sun.
  const travel = ramp(t, 0.08, 0.86, EASE.camera);
  const rise = ramp(t, 1.02, 1.7, EASE.glide);
  const px = lerp(from[0], CX, travel);
  const py = lerp(from[1], LINE_Y - BOW, travel) - RISE * rise;
  const pointOn = ramp(t, 0.02, 0.2, EASE.out) * (1 - ramp(t, 2.5, 2.95, EASE.inOut));
  const land = ramp(t, 0.82, 0.9) * (1 - ramp(t, 0.9, 1.5, EASE.out));
  // The horizon spreads out of the landing point.
  const spread = ramp(t, 0.84, 1.55, EASE.glide);
  const half = HALF * spread;
  const pts: string[] = [];
  for (let k = 0; k <= 40; k++) {
    const x = CX - half + (2 * half * k) / 40;
    pts.push(`${x.toFixed(1)},${arcY(x).toFixed(1)}`);
  }
  const trail = ramp(t, 0.1, 0.4) * (1 - ramp(t, 0.75, 1.1, EASE.out));
  const halo = 0.55 + 0.45 * rise + 0.6 * land;
  // Name: letters arrive one by one; a light passes over "Horizon".
  const letter = (i: number) => ramp(t, 1.42 + i * 0.024, 1.42 + i * 0.024 + 0.42, EASE.out);
  const sweep = ramp(t, 1.95, 2.45, EASE.inOut);
  const verse = SIGNS.slice(0, 4);
  const verseAt = verse.map((_, i) => ({at: 1.2 + i * 0.13, color: C.gold400}));
  return (
    <AbsoluteFill style={{background: C.night950}}>
      <AbsoluteFill
        style={
          v > 0.001
            ? {transformOrigin: `${from[0]}px ${from[1]}px`, scale: String(1 + 0.035 * v), filter: `blur(${7 * v}px) brightness(${1 - 0.55 * v})`}
            : undefined
        }
      >
        {base ?? <AbsoluteFill style={{background: `radial-gradient(ellipse 90% 60% at 50% 55%, ${C.night800} 0%, ${C.night950} 75%)`}} />}
      </AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 55% at 50% 48%, rgba(10,14,25,0.78) 0%, rgba(5,7,12,0.92) 100%)`, opacity: v}} />
      <OStars t={t} opacity={0.75 * v} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: out}}>
        <Defs id="o" />
        <linearGradient id="o-spread" gradientUnits="userSpaceOnUse" x1={CX - half} x2={CX + half} y1={0} y2={0}>
          <stop offset="0" stopColor={C.gold500} stopOpacity={0} />
          <stop offset="0.2" stopColor={C.gold500} stopOpacity={0.8} />
          <stop offset="0.5" stopColor={C.gold300} />
          <stop offset="0.8" stopColor={C.gold500} stopOpacity={0.8} />
          <stop offset="1" stopColor={C.gold500} stopOpacity={0} />
        </linearGradient>
        <linearGradient id="o-trail" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={C.gold300} stopOpacity={0.7} />
          <stop offset="1" stopColor={C.gold300} stopOpacity={0} />
        </linearGradient>
        <ellipse cx={CX} cy={LINE_Y - 6} rx={480 * spread} ry={170 * spread} fill="url(#o-dawn)" />
        {trail > 0.01 ? <rect x={px - 2} y={py} width={4} height={Math.max(0, from[1] - py)} fill="url(#o-trail)" opacity={trail} /> : null}
        {half > 1 ? <polyline points={pts.join(' ')} fill="none" stroke="url(#o-spread)" strokeWidth={6} strokeLinecap="round" /> : null}
        <path
          d={`M ${CX - 7} ${LINE_Y - BOW + 4} L ${CX + 7} ${LINE_Y - BOW + 4} L ${CX + 3} ${LINE_Y - BOW + 70} L ${CX - 3} ${LINE_Y - BOW + 70} Z`}
          fill="url(#o-glitter)"
          opacity={rise}
        />
        <circle cx={px} cy={py} r={190 * halo} fill="url(#o-halo)" opacity={pointOn} />
        <circle cx={px} cy={py} r={26 + 6 * land} fill="url(#o-core)" opacity={pointOn} />
      </svg>
      <Glow x={CX} y={LINE_Y - BOW} r={420} color={C.gold300} opacity={0.5 * land} />
      <div style={{position: 'absolute', left: 40, right: 40, top: 585, opacity: out}}>
        <ArabicLine t={t} words={verse} styles={verseAt} size={68} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 985,
          textAlign: 'center',
          fontFamily: FONT.display,
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: 94,
          lineHeight: 1,
          letterSpacing: '0.01em',
          opacity: out,
          whiteSpace: 'pre',
        }}
      >
        {NAME.split('').map((ch, i) => {
          const p = letter(i);
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                color: i >= SPLIT ? C.gold400 : C.ivory,
                opacity: p,
                translate: `0px ${(1 - p) * 18}px`,
                filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined,
              }}
            >
              {ch}
            </span>
          );
        })}
        {sweep > 0 && sweep < 1 ? (
          <div style={{position: 'absolute', inset: 0, textAlign: 'center', color: 'transparent', whiteSpace: 'pre'}}>
            <span style={{opacity: 0}}>{NAME.slice(0, SPLIT)}</span>
            <span
              style={{
                backgroundImage: `linear-gradient(100deg, rgba(255,246,221,0) ${lerp(-40, 100, sweep)}%, rgba(255,246,221,0.95) ${lerp(-20, 120, sweep)}%, rgba(255,246,221,0) ${lerp(0, 140, sweep)}%)`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
              }}
            >
              {NAME.slice(SPLIT)}
            </span>
          </div>
        ) : null}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 1115,
          textAlign: 'center',
          fontFamily: FONT.mono,
          fontWeight: 500,
          fontSize: 26,
          letterSpacing: '0.34em',
          paddingLeft: '0.34em',
          color: C.mist,
          opacity: out * ramp(t, 1.85, 2.2, EASE.out),
        }}
      >
        QUR'AN 41:53
      </div>
    </AbsoluteFill>
  );
};
