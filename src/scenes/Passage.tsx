import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {fitText} from '@remotion/layout-utils';
import {C, FONT, TEXT_COLUMN} from '../brand/tokens';
import {Dust, Stars} from '../components/Atmosphere';
import {EASE, clamp, lerp, ramp} from '../lib/anim';
import {CAM_STOP, DOOR_Z, GATE_EVERY, MONTH_EVERY, PULL_FROM, PULL_TO, camZ, dayOf, runZ, speed} from '../lib/camera';
import {cue, wordAt, wordEnd} from '../lib/data';
import {EMBER} from './Mecca';

const F = 1100; // focal length (px)
const VY = 980; // horizon
const HALF_DOOR = 3.2; // half width of the opening
const DOOR_H = 6.4;
const LINTEL_H = 9.0;
const PIER = 5.4;
const DEPTH = 2.4;

const fog = (d: number, far = 520) => clamp(1 - d / far) ** 1.2;

const sizeCache: Record<string, number> = {};
const fit = (text: string, weight: string, max: number, width: number = TEXT_COLUMN.w, ls = '0.04em') => {
  const k = `${text}|${weight}|${max}|${width}`;
  if (!sizeCache[k]) sizeCache[k] = Math.min(max, fitText({text, withinWidth: width, fontFamily: 'Cormorant Garamond', fontWeight: weight, letterSpacing: ls}).fontSize);
  return sizeCache[k];
};

/** Big engraved word-by-word line. `words` = [text, start seconds, gold?]. */
const Engraved: React.FC<{t: number; words: [string, number, boolean?][]; top: number; size: number; fadeOut?: [number, number]; italic?: boolean; weight?: number; ls?: string}> = ({
  t,
  words,
  top,
  size,
  fadeOut,
  italic,
  weight = 600,
  ls = '0.04em',
}) => {
  const vis = fadeOut ? 1 - ramp(t, fadeOut[0], fadeOut[1], EASE.inOut) : 1;
  if (vis <= 0.01 || t < words[0][1] - 0.2) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: TEXT_COLUMN.x0 - 40,
        width: TEXT_COLUMN.w + 80,
        top,
        textAlign: 'center',
        fontFamily: FONT.display,
        fontWeight: weight,
        fontStyle: italic ? 'italic' : 'normal',
        fontSize: size,
        lineHeight: 1.08,
        letterSpacing: ls,
        opacity: vis,
        textShadow: '0 4px 34px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.7)',
      }}
    >
      {words.map(([w, at, gold], i) => {
        const p = ramp(t, at - 0.05, at + 0.32, EASE.glide);
        const flash = Math.exp(-((t - at - 0.1) ** 2) / 0.05);
        const col = gold ? C.gold300 : C.ivory;
        return (
          <span key={i} style={{display: 'inline-block', opacity: p, translate: `0px ${(1 - p) * 16}px`, color: col, textShadow: flash > 0.05 ? `0 0 ${24 * flash}px rgba(243,221,162,${0.9 * flash}), 0 4px 34px rgba(0,0,0,0.9)` : undefined}}>
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </div>
  );
};

/** The long road of 3,600 days to an open door; the lone light never crosses the threshold. */
export const Passage: React.FC<{t: number}> = ({t}) => {
  const Z = camZ(t);
  const v = speed(t);
  const camX = 0.12 * Math.sin(t * 0.8);
  const camH = 2.0 + 0.035 * Math.sin(t * 1.6) + (1 - ramp(t, 14.3, 15.6, EASE.inOut)) * -0.0;
  const px = (X: number, z: number) => 540 + (F * (X - camX)) / Math.max(0.4, z - Z);
  const py = (Y: number, z: number) => VY + (F * (camH - Y)) / Math.max(0.4, z - Z);
  const dDoor = DOOR_Z - Z;
  const scaleAt = (z: number) => F / Math.max(0.4, z - Z);

  // door state
  const theta0 = 0.66; // radians, ajar on arrival (~38°)
  const open = ramp(t, cue('door'), 31.8, EASE.inOut);
  const theta = lerp(theta0, Math.PI / 2, open);
  const light = 0.5 + 0.5 * open + 0.1 * Math.sin(t * 2.3);
  const dim4 = 1 - 0.55 * ramp(t, 28.3, 28.9) * (1 - ramp(t, 30.35, 30.9)); // world dips while the four words are spoken
  const arrive = ramp(t, 19.4, 20.4, EASE.inOut);

  // the lone light, 9 units ahead of the run
  const zP = runZ(t) + 9;
  const dP = zP - Z;
  const sP = 9 / dP;
  const pX = px(0, zP);
  const pY = py(1.0, zP);
  const tNever = wordAt(90, 'never');
  const flare = Math.exp(-((t - tNever) ** 2) / 0.06);
  const pulse = 1 + 0.06 * Math.sin(t * 3.1) + 0.04 * Math.sin(t * 7.3);
  const intense = 1 + 0.5 * ramp(t, cue('defeating'), cue('defeating') + 1.2) * (1 - ramp(t, tNever + 0.6, tNever + 1.4));
  const aliveIn = 1;

  // ---- floor ticks, gates ----
  const items: React.ReactNode[] = [];
  const zNear = Z + 1.2;
  const zFar = Z + 560;
  const streak = clamp((v * 0.5) / 30, 0.25, 6);
  for (let m = Math.ceil(zNear / MONTH_EVERY); m * MONTH_EVERY < zFar && m * MONTH_EVERY < DOOR_Z - 4; m++) {
    const z = m * MONTH_EVERY;
    if (z < 0) continue;
    const d = z - Z;
    const isGate = (m * MONTH_EVERY) % GATE_EVERY === 0;
    const nearFade = clamp((d - 4) / 14);
    const a = fog(d) * (isGate ? 0.75 : 0.5) * nearFade;
    const zEnd = z + (isGate ? Math.min(streak * 0.5, 1.6) : streak);
    const hw = isGate ? 3.5 : 0.95;
    const p = `${px(-hw, z)},${py(0, z)} ${px(hw, z)},${py(0, z)} ${px(hw, zEnd)},${py(0, zEnd)} ${px(-hw, zEnd)},${py(0, zEnd)}`;
    items.push(<polygon key={`t${m}`} points={p} fill={isGate ? C.gold400 : C.gold500} opacity={a} />);
    if (isGate) {
      for (const sgn of [-1, 1]) {
        const x0 = px(sgn * 3.6 - 0.28, z);
        const x1 = px(sgn * 3.6 + 0.28, z);
        const yb = py(0, z);
        const yt = py(7.2, z);
        items.push(
          <g key={`g${m}${sgn}`} opacity={fog(d, 640) * nearFade}>
            <rect x={Math.min(x0, x1)} y={yt} width={Math.abs(x1 - x0)} height={yb - yt} fill="url(#stele)" />
            <rect x={Math.min(x0, x1) - 1} y={yt - 3} width={Math.abs(x1 - x0) + 2} height={Math.max(2, Math.min(10, scaleAt(z) * 0.14))} fill={C.gold400} opacity={0.9} />
            <rect x={sgn > 0 ? Math.min(x0, x1) : Math.max(x0, x1) - 2} y={yt} width={2} height={yb - yt} fill={C.gold500} opacity={0.5} />
          </g>,
        );
      }
    }
  }

  // door geometry
  const dx = (X: number, z: number) => px(X, z);
  const showDoor = dDoor > 1.5;
  const zB = DOOR_Z + DEPTH;
  const leafPts = (sgn: number) => {
    const hx = sgn * HALF_DOOR;
    const L = HALF_DOOR;
    const zh = DOOR_Z + 0.15;
    const fx = hx - sgn * L * Math.cos(theta);
    const fz = zh + L * Math.sin(theta);
    return `${dx(hx, zh)},${py(0, zh)} ${dx(fx, fz)},${py(0, fz)} ${dx(fx, fz)},${py(DOOR_H, fz)} ${dx(hx, zh)},${py(DOOR_H, zh)}`;
  };
  const notchOn = [26.0, 26.25, 26.5, 26.75].map((a) => ramp(t, a, a + 0.18, EASE.out));
  const spoken = [wordAt(70, 'I'), wordAt(71, 'accept'), wordAt(72, 'your'), wordAt(73, 'faith')];
  const notchFlare = spoken.map((a) => Math.exp(-((t - a - 0.05) ** 2) / 0.08));
  const lintelFace = `${dx(-PIER, DOOR_Z)},${py(DOOR_H, DOOR_Z)} ${dx(PIER, DOOR_Z)},${py(DOOR_H, DOOR_Z)} ${dx(PIER, DOOR_Z)},${py(LINTEL_H, DOOR_Z)} ${dx(-PIER, DOOR_Z)},${py(LINTEL_H, DOOR_Z)}`;

  // threshold line (never crossed)
  const zT = DOOR_Z - 2.2;
  const thrOn = 0.28 + 0.72 * ramp(t, tNever - 0.1, tNever + 0.5, EASE.out);
  const thr = `${px(-HALF_DOOR + 0.2, zT)},${py(0, zT)} ${px(HALF_DOOR - 0.2, zT)},${py(0, zT)} ${px(HALF_DOOR - 0.2, zT + 0.25)},${py(0, zT + 0.25)} ${px(-HALF_DOOR + 0.2, zT + 0.25)},${py(0, zT + 0.25)}`;

  // counter
  const cIn = ramp(t, 15.85, 16.25, EASE.out) * (1 - ramp(t, 19.72, 19.98, EASE.inOut));
  const day = dayOf(t);
  const locked = ramp(t, cue('days') - 0.3, cue('days') + 0.05);
  const counterStr = day.toLocaleString('en-US');

  const armySize = fit('NO SWORD.', '700', 128);
  const quoteSize = fit('YOUR FAITH.', '700', 118);
  const doorSize = fit('THE DOOR WAS', '700', 108);
  const lensSize = fit('to his own destruction.', '500', 70, TEXT_COLUMN.w + 40, '0.01em');
  const tIm = wordAt(94, 'An');

  return (
    <AbsoluteFill style={{background: C.night950, overflow: 'hidden'}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.night950} />
            <stop offset="0.7" stopColor="#101728" />
            <stop offset="1" stopColor="#2A2230" />
          </linearGradient>
          <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1C1C28" />
            <stop offset="0.35" stopColor={C.night800} />
            <stop offset="1" stopColor={C.night950} />
          </linearGradient>
          <linearGradient id="stele" x1="0" x2="1">
            <stop offset="0" stopColor="#2A3550" />
            <stop offset="1" stopColor="#0C111E" />
          </linearGradient>
          <linearGradient id="stone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2B354D" />
            <stop offset="1" stopColor="#10172A" />
          </linearGradient>
          <linearGradient id="stoneSide" x1="0" x2="1">
            <stop offset="0" stopColor="#0A0F1B" />
            <stop offset="1" stopColor="#1B2338" />
          </linearGradient>
          <radialGradient id="doorLight" cx="50%" cy="55%" r="65%">
            <stop offset="0" stopColor="#FFF3D0" />
            <stop offset="0.35" stopColor="#F3DDA2" />
            <stop offset="0.8" stopColor="#CFA24E" />
            <stop offset="1" stopColor="#8A6A2C" />
          </radialGradient>
          <linearGradient id="spill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F3DDA2" stopOpacity={0.55} />
            <stop offset="1" stopColor="#F3DDA2" stopOpacity={0} />
          </linearGradient>
          <radialGradient id="halo2">
            <stop offset="0" stopColor="#F3DDA2" stopOpacity={0.55} />
            <stop offset="0.5" stopColor="#CFA24E" stopOpacity={0.18} />
            <stop offset="1" stopColor="#CFA24E" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="groove" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.gold300} stopOpacity={0.25} />
            <stop offset="1" stopColor={C.gold300} stopOpacity={1} />
          </linearGradient>
          <radialGradient id="emb2">
            <stop offset="0" stopColor="#FFE9BE" />
            <stop offset="0.28" stopColor="#F0A25F" stopOpacity={0.9} />
            <stop offset="0.6" stopColor={C.emberLight} stopOpacity={0.35} />
            <stop offset="1" stopColor={C.emberLight} stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={1080} height={VY + 2} fill="url(#sky)" />
      </svg>
      <Stars t={t} n={150} seed="pass" maxY={VY - 40} opacity={0.9 * dim4} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {/* far desert silhouettes */}
        <path d={`M0 ${VY} L0 ${VY - 26} Q180 ${VY - 60} 360 ${VY - 22} T720 ${VY - 30} T1080 ${VY - 20} L1080 ${VY} Z`} fill="#0B1020" />
        <rect x={0} y={VY} width={1080} height={1920 - VY} fill="url(#floor)" />
        {/* warm spill from the door onto the floor */}
        {showDoor ? (
          <polygon
            points={`${dx(-HALF_DOOR, DOOR_Z)},${py(0, DOOR_Z)} ${dx(HALF_DOOR, DOOR_Z)},${py(0, DOOR_Z)} ${dx(HALF_DOOR * 1.0, Z + 1.6)},1960 ${dx(-HALF_DOOR, Z + 1.6)},1960`}
            fill="url(#spill)"
            opacity={0.7 * light}
          />
        ) : null}
        {/* slab joints */}
        {[-4.2, -2.8, -1.4, 1.4, 2.8, 4.2].map((X) => (
          <line key={X} x1={px(X, Z + 1.2)} y1={py(0, Z + 1.2)} x2={px(X, Z + 900)} y2={py(0, Z + 900)} stroke={C.night700} strokeWidth={2} opacity={0.5} />
        ))}
        {/* the timeline groove */}
        <polygon points={`${px(-0.7, Z + 1.2)},${py(0, Z + 1.2)} ${px(0.7, Z + 1.2)},${py(0, Z + 1.2)} ${px(0.7, Z + 700)},${py(0, Z + 700)} ${px(-0.7, Z + 700)},${py(0, Z + 700)}`} fill={C.gold700} opacity={0.14} />
        <polygon points={`${px(-0.16, Z + 1.2)},${py(0, Z + 1.2)} ${px(0.16, Z + 1.2)},${py(0, Z + 1.2)} ${px(0.16, Z + 700)},${py(0, Z + 700)} ${px(-0.16, Z + 700)},${py(0, Z + 700)}`} fill="url(#groove)" opacity={0.95} />
        {items}
        {/* door */}
        {showDoor ? (
          <g opacity={0.35 + 0.65 * fog(dDoor, 900)}>
            <ellipse cx={px(0, DOOR_Z)} cy={py(DOOR_H / 2, DOOR_Z)} rx={scaleAt(DOOR_Z) * 10} ry={scaleAt(DOOR_Z) * 8.5} fill="url(#halo2)" opacity={0.55 * light} />
            {/* opening: the light beyond */}
            <polygon
              points={`${dx(-HALF_DOOR, zB)},${py(0, zB)} ${dx(HALF_DOOR, zB)},${py(0, zB)} ${dx(HALF_DOOR, zB)},${py(DOOR_H, zB)} ${dx(-HALF_DOOR, zB)},${py(DOOR_H, zB)}`}
              fill="url(#doorLight)"
              opacity={0.55 + 0.45 * light}
            />
            {/* jamb inner faces */}
            {[-1, 1].map((s) => (
              <polygon
                key={`j${s}`}
                points={`${dx(s * HALF_DOOR, DOOR_Z)},${py(0, DOOR_Z)} ${dx(s * HALF_DOOR, zB)},${py(0, zB)} ${dx(s * HALF_DOOR, zB)},${py(DOOR_H, zB)} ${dx(s * HALF_DOOR, DOOR_Z)},${py(DOOR_H, DOOR_Z)}`}
                fill="url(#stoneSide)"
              />
            ))}
            {/* leaves */}
            {[-1, 1].map((s) => (
              <g key={`l${s}`}>
                <polygon points={leafPts(s)} fill="url(#stone)" stroke={C.gold500} strokeWidth={Math.max(1.5, scaleAt(DOOR_Z) * 0.05)} strokeOpacity={0.6} />
              </g>
            ))}
            {/* piers + lintel (front faces) */}
            {[-1, 1].map((s) => (
              <g key={`p${s}`}>
                <polygon
                  points={`${dx(s * HALF_DOOR, DOOR_Z)},${py(0, DOOR_Z)} ${dx(s * PIER, DOOR_Z)},${py(0, DOOR_Z)} ${dx(s * PIER, DOOR_Z)},${py(LINTEL_H, DOOR_Z)} ${dx(s * HALF_DOOR, DOOR_Z)},${py(LINTEL_H, DOOR_Z)}`}
                  fill="url(#stone)"
                />
                <line x1={dx(s * (HALF_DOOR + 0.35), DOOR_Z)} y1={py(0.3, DOOR_Z)} x2={dx(s * (HALF_DOOR + 0.35), DOOR_Z)} y2={py(DOOR_H, DOOR_Z)} stroke={C.gold500} strokeWidth={Math.max(1.5, scaleAt(DOOR_Z) * 0.04)} opacity={0.4} />
                <line x1={dx(s * HALF_DOOR, DOOR_Z)} y1={py(0, DOOR_Z)} x2={dx(s * HALF_DOOR, DOOR_Z)} y2={py(LINTEL_H, DOOR_Z)} stroke={C.gold300} strokeWidth={Math.max(2, scaleAt(DOOR_Z) * 0.07)} opacity={0.55 * light} />
              </g>
            ))}
            <polygon points={lintelFace} fill="url(#stone)" />
            <line x1={dx(-PIER, DOOR_Z)} y1={py(DOOR_H, DOOR_Z)} x2={dx(PIER, DOOR_Z)} y2={py(DOOR_H, DOOR_Z)} stroke={C.gold300} strokeWidth={Math.max(2, scaleAt(DOOR_Z) * 0.08)} opacity={0.6 * light} />
            {/* four notches carved in the lintel */}
            {[-2.4, -0.8, 0.8, 2.4].map((X, i) => {
              const on = notchOn[i];
              const fl = notchFlare[i];
              const w = scaleAt(DOOR_Z) * 1.1;
              const h = Math.max(4, scaleAt(DOOR_Z) * 0.34);
              const cx = dx(X, DOOR_Z);
              const cy = py(7.7, DOOR_Z);
              return (
                <g key={i} opacity={arrive}>
                  <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={h / 2} fill="#070A12" opacity={0.9} />
                  <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={h / 2} fill={C.gold300} opacity={on * (0.55 + 0.45 * fl)} />
                  {fl > 0.05 ? <ellipse cx={cx} cy={cy} rx={w * (1.0 + 0.6 * fl)} ry={h * (3 + 3 * fl)} fill="url(#halo2)" opacity={0.9 * fl} /> : null}
                </g>
              );
            })}
          </g>
        ) : null}
        <rect x={0} y={0} width={1080} height={1920} fill={C.night950} opacity={(1 - dim4) * 1.25} />
        {/* threshold line */}
        {showDoor ? <polygon points={thr} fill={C.gold300} opacity={thrOn * 0.9 * (1 - 0.5 * (1 - arrive))} /> : null}
        {/* embers around the lone light */}
        {new Array(44).fill(0).map((_, i) => {
          const rate = 0.16 + 0.1 * random(`er${i}`);
          const ph = random(`ep${i}`);
          const k = (t * rate + ph) % 1;
          const born = i < 14 ? t > 15.4 : i < 28 ? t > 30.5 : t > cue('defeating') - 0.3;
          if (!born) return null;
          const x = pX + (random(`ex${i}`) - 0.5) * 70 * sP + 22 * Math.sin(k * 7 + i);
          const y = pY - k * (240 + 200 * random(`ey${i}`)) * sP;
          const a = (1 - k) ** 1.6 * Math.min(1, k * 6) * (0.4 + 0.5 * random(`eo${i}`));
          return <circle key={i} cx={x} cy={y} r={(1.1 + 2.4 * random(`es${i}`)) * (0.6 + 0.4 * sP)} fill={k < 0.4 ? C.gold300 : C.emberLight} opacity={a * aliveIn} />;
        })}
        {/* the lone light, still */}
        <g opacity={aliveIn}>
          <ellipse cx={pX} cy={pY + 28 * sP} rx={90 * sP} ry={14 * sP} fill={C.emberLight} opacity={0.18 * intense} />
          <circle cx={pX} cy={pY} r={135 * sP * pulse * intense} fill="url(#emb2)" opacity={0.85 + 0.15 * flare} />
          <circle cx={pX} cy={pY} r={13 * sP * (1 + 0.5 * flare) * pulse} fill="#FFF1D6" />
        </g>
      </svg>
      <Dust t={t} count={30} seed="pdust" opacity={0.55} area={[0, 250, 1080, 1500]} />
      {/* ---- text in the world ---- */}
      {cIn > 0.01 ? (
        <div style={{position: 'absolute', left: TEXT_COLUMN.x0 - 60, width: TEXT_COLUMN.w + 120, top: 300, textAlign: 'center', opacity: cIn}}>
          <div style={{fontFamily: FONT.mono, fontWeight: 500, fontSize: 30, letterSpacing: '0.5em', paddingLeft: '0.5em', color: C.mist}}>DAY</div>
          <div
            style={{
              fontFamily: FONT.mono,
              fontWeight: 500,
              fontSize: 168,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: locked > 0.5 ? C.gold300 : C.ivory,
              textShadow: `0 0 ${50 * locked}px rgba(230,195,119,${0.55 * locked}), 0 6px 34px rgba(0,0,0,0.9)`,
            }}
          >
            {counterStr}
          </div>
          <div style={{fontFamily: FONT.display, fontStyle: 'italic', fontWeight: 500, fontSize: 54, color: C.gold400, opacity: locked, marginTop: 6, textShadow: '0 3px 22px rgba(0,0,0,0.9)'}}>
            ≈ ten years
          </div>
          <div style={{fontFamily: FONT.mono, fontWeight: 500, fontSize: 26, letterSpacing: '0.16em', color: C.mist, opacity: ramp(t, 16.2, 16.6) * (1 - 0.0), marginTop: 14, textShadow: '0 2px 14px rgba(0,0,0,0.95)'}}>
            c. 613–14 CE → 624 CE
          </div>
        </div>
      ) : null}
      <Engraved t={t} top={296} size={armySize} words={[['NO', cue('army') - 0.25], ['ARMY.', cue('army')]]} fadeOut={[22.35, 22.7]} weight={700} />
      <Engraved t={t} top={296} size={armySize} words={[['NO', cue('sword') - 0.25], ['SWORD.', cue('sword')]]} fadeOut={[24.0, 24.45]} weight={700} />
      <Engraved
        t={t}
        top={226}
        size={quoteSize}
        weight={700}
        fadeOut={[30.08, 30.36]}
        words={[
          ['I', spoken[0], true],
          ['ACCEPT', spoken[1], true],
        ]}
      />
      <Engraved
        t={t}
        top={226 + quoteSize * 1.08}
        size={quoteSize}
        weight={700}
        fadeOut={[30.08, 30.36]}
        words={[
          ['YOUR', spoken[2], true],
          ['FAITH.', spoken[3], true],
        ]}
      />
      <Engraved
        t={t}
        top={238}
        size={doorSize}
        weight={700}
        fadeOut={[32.15, 32.75]}
        words={[
          ['THE', wordAt(74, 'The')],
          ['DOOR', wordAt(75, 'door')],
          ['WAS', wordAt(76, 'was')],
        ]}
      />
      <Engraved
        t={t}
        top={238 + doorSize * 1.08}
        size={doorSize}
        weight={700}
        fadeOut={[32.15, 32.75]}
        words={[
          ['WIDE', wordAt(77, 'wide')],
          ['OPEN.', wordAt(78, 'open'), true],
        ]}
      />
      <Engraved
        t={t}
        top={238}
        size={doorSize}
        weight={700}
        fadeOut={[37.5, 37.82]}
        words={[
          ['NEVER', tNever],
          ['WALKED', wordAt(91, 'walked')],
        ]}
      />
      <Engraved
        t={t}
        top={238 + doorSize * 1.08}
        size={doorSize}
        weight={700}
        fadeOut={[37.5, 37.82]}
        words={[
          ['THROUGH', wordAt(92, 'through')],
          ['IT.', wordAt(93, 'it'), true],
        ]}
      />
      {/* honest lens: the argument, in the quiet voice */}
      <Engraved
        t={t}
        top={252}
        size={lensSize}
        italic
        weight={500}
        ls="0.01em"
        fadeOut={[41.7, 42.15]}
        words={[
          ['An', tIm],
          ['impostor', wordAt(95, 'impostor')],
          ['never', wordAt(96, 'never')],
          ['hands', wordAt(97, 'hands')],
        ]}
      />
      <Engraved
        t={t}
        top={252 + lensSize * 1.12}
        size={lensSize}
        italic
        weight={500}
        ls="0.01em"
        fadeOut={[41.7, 42.15]}
        words={[
          ['his', wordAt(98, 'his')],
          ['enemy', wordAt(99, 'enemy')],
          ['the', wordAt(100, 'the')],
          ['key', wordAt(101, 'key'), true],
        ]}
      />
      <Engraved
        t={t}
        top={252 + lensSize * 2.24}
        size={lensSize}
        italic
        weight={500}
        ls="0.01em"
        fadeOut={[41.7, 42.15]}
        words={[
          ['to', wordAt(102, 'to')],
          ['his', wordAt(103, 'his')],
          ['own', wordAt(104, 'own')],
          ['destruction.', wordAt(105, 'destruction')],
        ]}
      />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,7,12,0) 72%, rgba(5,7,12,0.5) 100%)', pointerEvents: 'none'}} />
      <div style={{display: 'none'}}>{`${CAM_STOP}${PULL_FROM}${PULL_TO}${wordEnd(0)}${EMBER.x}`}</div>
    </AbsoluteFill>
  );
};
