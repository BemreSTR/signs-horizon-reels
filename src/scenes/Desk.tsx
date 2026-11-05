import React from 'react';
import {AbsoluteFill, Img, random, staticFile} from 'remotion';
import {fitText} from '@remotion/layout-utils';
import {C, FONT, TEXT_COLUMN} from '../brand/tokens';
import {Dust, Glow} from '../components/Atmosphere';
import {EASE, clamp, lerp, ramp} from '../lib/anim';
import {cue} from '../lib/data';

/** Seal centre: the light the brand sting rises out of (Outro `from`). */
export const SEAL = {x: 540, y: 1010, r: 205} as const;

let titleSize = 0;
const getTitleSize = () => {
  if (titleSize) return titleSize;
  const opts = {withinWidth: TEXT_COLUMN.w - 40, fontFamily: 'Cormorant Garamond', fontWeight: '700', letterSpacing: '0.12em'} as const;
  titleSize = Math.min(fitText({text: 'THE TEN-YEAR', ...opts}).fontSize, fitText({text: 'OPEN CHECK', ...opts}).fontSize, 150);
  return titleSize;
};

const blob = (n: number) => {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r =
      SEAL.r + 7 * Math.sin(3 * a + 1.1) + 5 * Math.sin(5 * a + 2.3) + 4 * Math.sin(9 * a + 0.5) + 3 * Math.sin(13 * a + 4.1) +
      (Math.abs(Math.sin(a * 2 + 0.6)) > 0.97 ? 9 : 0);
    pts.push(`${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`);
  }
  return `M ${pts.join(' L ')} Z`;
};
const BLOB = blob(120);

const CRACK_MAIN = 'M -30 -204 L -8 -152 L -27 -112 L 5 -72 L -15 -30 L 11 6 L -9 48 L 19 92 L 2 134 L 25 174 L 8 206';
const CRACK_A = 'M 5 -72 L 58 -98 L 90 -142 L 120 -170';
const CRACK_B = 'M -9 48 L -58 72 L -92 114 L -126 150';

/** Basalt desk with the wax seal. `t` may be negative: the loop pre-roll (docs/10 §3). */
export const Desk: React.FC<{t: number}> = ({t}) => {
  const tc = cue('destroyed');
  const size = getTitleSize();
  // camera: macro push that settles, then a slow drift; constant for t <= -0.2 so the loop tail matches
  const settle = ramp(t, -0.2, 0.95, EASE.glide);
  const breathe = 0.004 * Math.sin(t * 1.05);
  const s = 1.045 + 0.085 * (1 - settle) + 0.03 * clamp(t / 4.4) + breathe;
  const camY = lerp(26, 0, settle) - 10 * clamp(t / 4.4);
  // seal cracks at "destroyed"
  const crack = ramp(t, tc - 0.03, tc + 0.26, EASE.out);
  const crackB = ramp(t, tc + 0.1, tc + 0.42, EASE.out);
  const burst = t - tc;
  const lit = 0.34 + 0.07 * Math.sin(t * 2.1) + 0.5 * ramp(t, tc, tc + 0.5) * (1 - 0.45 * ramp(t, tc + 0.5, 3.6));
  // title: punch begins 0.15 s before frame 0 so frame 0 reads (H76)
  const tIn = ramp(t, -0.15, -0.02, EASE.out);
  const tP = ramp(t, -0.15, 0.6, EASE.glide);
  const tOut = 1 - ramp(t, 3.75, 4.2);
  const sweep = ramp(t, 0.25, 1.15, EASE.inOut);
  return (
    <AbsoluteFill style={{background: C.night950, overflow: 'hidden'}}>
      <AbsoluteFill style={{transformOrigin: `${SEAL.x}px ${SEAL.y}px`, scale: String(s), translate: `0px ${camY}px`}}>
        <Img src={staticFile('tex/basalt.jpg')} style={{position: 'absolute', inset: 0, width: 1080, height: 1920}} />
        {/* cool top light + warm seal light */}
        <AbsoluteFill style={{background: 'linear-gradient(118deg, rgba(143,168,255,0.10) 0%, rgba(143,168,255,0.02) 38%, rgba(5,7,12,0) 60%)'}} />
        <Glow x={SEAL.x} y={SEAL.y} r={760} color={C.gold500} opacity={0.2 * lit + 0.08} />
        <Glow x={SEAL.x} y={SEAL.y} r={330} color={C.gold300} opacity={0.5 * lit} />
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <defs>
            <radialGradient id="wax" cx="38%" cy="32%" r="80%">
              <stop offset="0" stopColor="#E3C482" />
              <stop offset="0.35" stopColor={C.wax} />
              <stop offset="0.75" stopColor="#7C5A22" />
              <stop offset="1" stopColor="#3F2A0E" />
            </radialGradient>
            <radialGradient id="waxIn" cx="50%" cy="50%" r="60%">
              <stop offset="0" stopColor="#7A5820" />
              <stop offset="0.8" stopColor="#5A3E14" />
              <stop offset="1" stopColor="#6A4A18" />
            </radialGradient>
            <radialGradient id="shadow">
              <stop offset="0" stopColor="#000" stopOpacity={0.7} />
              <stop offset="0.7" stopColor="#000" stopOpacity={0.35} />
              <stop offset="1" stopColor="#000" stopOpacity={0} />
            </radialGradient>
            <radialGradient id="pt">
              <stop offset="0" stopColor="#FFF8E6" />
              <stop offset="0.5" stopColor={C.gold300} />
              <stop offset="1" stopColor={C.gold500} stopOpacity={0} />
            </radialGradient>
            <linearGradient id="spec" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FFF3CF" stopOpacity={0.5} />
              <stop offset="1" stopColor="#FFF3CF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <ellipse cx={SEAL.x + 18} cy={SEAL.y + 34} rx={SEAL.r * 1.2} ry={SEAL.r * 1.16} fill="url(#shadow)" />
          <g transform={`translate(${SEAL.x} ${SEAL.y})`}>
            <path d={BLOB} fill="url(#wax)" />
            <path d={BLOB} fill="none" stroke="#2C1C08" strokeWidth={4} opacity={0.7} />
            <path d={BLOB} fill="none" stroke="url(#spec)" strokeWidth={5} transform="translate(-3 -3)" opacity={0.85} />
            {/* recessed disc, bevel */}
            <circle r={158} fill="url(#waxIn)" />
            <circle r={158} fill="none" stroke="#2C1C08" strokeWidth={5} opacity={0.75} />
            <circle r={162} fill="none" stroke="#F2D79A" strokeWidth={2.5} opacity={0.5} transform="translate(2 2)" />
            {/* double ring + beads */}
            <circle r={140} fill="none" stroke="#2C1C08" strokeWidth={3} opacity={0.55} />
            <circle r={143} fill="none" stroke="#F2D79A" strokeWidth={1.5} opacity={0.35} transform="translate(1 1)" />
            {new Array(48).fill(0).map((_, i) => {
              const a = (i / 48) * Math.PI * 2;
              return <circle key={i} cx={Math.cos(a) * 127} cy={Math.sin(a) * 127} r={2.6} fill="#2C1C08" opacity={0.5} />;
            })}
            {/* embossed horizon, the rising light and its glitter on the water */}
            <path d="M -112 30 Q 0 8 112 30" fill="none" stroke="#2C1C08" strokeWidth={9} strokeLinecap="round" opacity={0.75} transform="translate(2 3)" />
            <path d="M -112 30 Q 0 8 112 30" fill="none" stroke="#E8CB8A" strokeWidth={8} strokeLinecap="round" opacity={0.9} />
            {[-150, -125, -100, -75, -50, -25].map((deg, i) => {
              const a = (deg * Math.PI) / 180;
              return <line key={i} x1={Math.cos(a) * 54} y1={18 + Math.sin(a) * 54} x2={Math.cos(a) * (i % 2 ? 70 : 78)} y2={18 + Math.sin(a) * (i % 2 ? 70 : 78)} stroke="#E8CB8A" strokeWidth={5} strokeLinecap="round" opacity={0.7} />;
            })}
            <circle cx={0} cy={14} r={72 + 26 * lit} fill="url(#pt)" opacity={0.5 + 0.4 * lit} />
            <path d="M -40 19 A 40 40 0 0 1 40 19 Z" fill="#FFF3D0" opacity={0.6 + 0.4 * lit} />
            {[0, 1, 2].map((i) => (
              <line key={i} x1={-14 + i * 4} x2={14 - i * 4} y1={46 + i * 14} y2={46 + i * 14} stroke="#F3DDA2" strokeWidth={5} strokeLinecap="round" opacity={0.7 - i * 0.18} />
            ))}
            {/* specular */}
            <path d="M -150 -120 A 190 190 0 0 1 -40 -186" fill="none" stroke="#FFF3CF" strokeWidth={7} strokeLinecap="round" opacity={0.28} />
            {/* the crack: dark fissure + gold light from inside */}
            {crack > 0 ? (
              <g strokeLinecap="round" strokeLinejoin="round" fill="none">
                <path d={CRACK_MAIN} pathLength={1000} stroke="#1B1005" strokeWidth={9} strokeDasharray={1000} strokeDashoffset={(1 - crack) * 1000} />
                <path d={CRACK_MAIN} pathLength={1000} stroke={C.gold500} strokeWidth={16} opacity={0.22 * lit} strokeDasharray={1000} strokeDashoffset={(1 - crack) * 1000} />
                <path d={CRACK_MAIN} pathLength={1000} stroke={C.gold300} strokeWidth={4} strokeDasharray={1000} strokeDashoffset={(1 - crack) * 1000} />
                {[CRACK_A, CRACK_B].map((d, i) => (
                  <g key={i}>
                    <path d={d} pathLength={1000} stroke="#1B1005" strokeWidth={7} strokeDasharray={1000} strokeDashoffset={(1 - crackB) * 1000} />
                    <path d={d} pathLength={1000} stroke={C.gold300} strokeWidth={3} strokeDasharray={1000} strokeDashoffset={(1 - crackB) * 1000} />
                  </g>
                ))}
              </g>
            ) : null}
          </g>
          {/* shockwave + gold dust burst */}
          {burst > 0 && burst < 1.9 ? (
            <g>
              <circle cx={SEAL.x} cy={SEAL.y} r={40 + 440 * EASE.out(clamp(burst / 0.9))} fill="none" stroke={C.gold300} strokeWidth={3} opacity={0.55 * (1 - clamp(burst / 0.9))} />
              {new Array(46).fill(0).map((_, i) => {
                const a = random(`sh-a${i}`) * Math.PI * 2;
                const v = 120 + 520 * random(`sh-v${i}`) ** 1.4;
                const life = 0.9 + 1.0 * random(`sh-l${i}`);
                const p = burst / life;
                if (p >= 1) return null;
                const d = v * burst * (1 - 0.35 * p);
                const x = SEAL.x + Math.cos(a) * d * 0.9;
                const y = SEAL.y + Math.sin(a) * d * 0.9 + 60 * burst * burst;
                const big = i % 5 === 0;
                return big ? (
                  <polygon
                    key={i}
                    points="0,-5 4,2 -3,4"
                    transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(burst * 240 * (random(`sh-r${i}`) - 0.5)).toFixed(0)}) scale(${(1.4 + 1.6 * random(`sh-s${i}`)).toFixed(2)})`}
                    fill="#C5A059"
                    opacity={(1 - p) ** 1.2}
                  />
                ) : (
                  <circle key={i} cx={x} cy={y} r={1.2 + 3 * random(`sh-s${i}`)} fill={C.gold300} opacity={(1 - p) ** 1.5 * 0.9} />
                );
              })}
            </g>
          ) : null}
        </svg>
        <Dust t={t + 20} count={46} seed="deskdust" opacity={0.8} area={[0, 300, 1080, 1700]} />
      </AbsoluteFill>
      {/* hero title (outside camera zoom so it stays in the text column) */}
      <div
        style={{
          position: 'absolute',
          left: TEXT_COLUMN.x0,
          width: TEXT_COLUMN.w,
          top: 440,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          fontFamily: FONT.display,
          fontWeight: 700,
          fontSize: size,
          lineHeight: 1.04,
          letterSpacing: `${lerp(0.12, 0.05, tP)}em`,
          paddingLeft: `${lerp(0.12, 0.05, tP)}em`,
          opacity: tIn * tOut,
          scale: String(lerp(1.08, 1, tP)),
          textShadow: '0 6px 40px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{color: C.ivory}}>THE TEN-YEAR</div>
        <div style={{position: 'relative', color: C.gold300, textShadow: `0 0 36px rgba(230,195,119,${0.35 + 0.25 * sweep}), 0 6px 40px rgba(0,0,0,0.85)`}}>
          OPEN CHECK
          {sweep > 0 && sweep < 1 ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                color: 'transparent',
                backgroundImage: `linear-gradient(100deg, rgba(255,246,221,0) ${lerp(-40, 100, sweep)}%, rgba(255,246,221,0.95) ${lerp(-20, 120, sweep)}%, rgba(255,246,221,0) ${lerp(0, 140, sweep)}%)`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                textShadow: 'none',
              }}
            >
              OPEN CHECK
            </div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};
