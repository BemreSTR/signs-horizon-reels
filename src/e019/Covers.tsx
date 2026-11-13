import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {C} from '../brand/tokens';
import {Grain, Vignette} from '../components/Atmosphere';
import {Watermark} from '../brandkit/BrandKit';
import '../lib/fonts';
import {Line} from '../e016/Text';

/** E019 covers (H75): independent compositions, 3–5 words, inside y 240–1680, text in x 180–900. The woman is only a light. */
const S = 100;
const LX = 540;
const LY = 1380;

const Defs: React.FC<{u: string}> = ({u}) => (
  <defs>
    <linearGradient id={`${u}-sky`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#04060B" />
      <stop offset="0.55" stopColor="#0B1226" />
      <stop offset="0.8" stopColor="#1A1B33" />
      <stop offset="1" stopColor="#2A1C2C" />
    </linearGradient>
    <radialGradient id={`${u}-halo`}>
      <stop offset="0" stopColor={C.gold300} stopOpacity="0.85" />
      <stop offset="0.25" stopColor={C.emberLight} stopOpacity="0.38" />
      <stop offset="1" stopColor={C.emberLight} stopOpacity="0" />
    </radialGradient>
    <radialGradient id={`${u}-core`}>
      <stop offset="0" stopColor="#FFFBEA" />
      <stop offset="0.6" stopColor={C.gold300} />
      <stop offset="1" stopColor={C.gold400} stopOpacity="0" />
    </radialGradient>
  </defs>
);

const Town: React.FC = () => (
  <g fill="#070A12">
    <path d="M0,1560 L0,1920 L1080,1920 L1080,1540 L1010,1540 L1010,1500 L930,1500 L930,1550 L820,1550 L820,1590 L700,1590 L700,1520 L610,1520 L610,1600 L470,1600 L470,1560 L360,1560 L360,1500 L270,1500 L270,1550 L140,1550 L140,1520 L60,1520 L60,1560 Z" />
  </g>
);

const Sky: React.FC<{u: string; rings: number; lean?: number; starCount?: number; lift?: number}> = ({u, rings, lean = 0, starCount = 150, lift = 0}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <Defs u={u} />
    <rect width={1080} height={1920} fill={`url(#${u}-sky)`} />
    {new Array(starCount).fill(0).map((_, i) => {
      const x = random(`sx${i}`) * 1080;
      const y = random(`sy${i}`) * 1480;
      const r = 1 + 2.4 * random(`sr${i}`) ** 2;
      const dx = LX - x;
      const dy = LY - lift - y;
      const d = Math.hypot(dx, dy);
      const len = lean * (20 + 40 * random(`sl${i}`)) * (1 - d / 1900);
      return (
        <g key={i} opacity={0.35 + 0.65 * random(`so${i}`) + (lean > 0 ? 0.2 : 0)}>
          {lean > 0 ? <line x1={x} y1={y} x2={x + (dx / d) * len} y2={y + (dy / d) * len} stroke={C.gold300} strokeWidth={r * 0.9} strokeLinecap="round" opacity={0.55} /> : null}
          <circle cx={x} cy={y} r={r} fill="#FFF6DA" />
        </g>
      );
    })}
    {new Array(rings).fill(0).map((_, i) => {
      const r = 120 + i * 150;
      return <circle key={i} cx={LX} cy={LY - lift} r={r} fill="none" stroke={C.gold300} strokeWidth={4 - i * 0.35} opacity={Math.max(0.1, 0.8 - i * 0.12)} />;
    })}
    <circle cx={LX} cy={LY - lift} r={420} fill={`url(#${u}-halo)`} />
    <circle cx={LX} cy={LY - lift} r={26} fill={`url(#${u}-core)`} />
    <Town />
  </svg>
);

const TOP = 'linear-gradient(180deg, rgba(5,7,12,0.9) 0%, rgba(5,7,12,0.78) 26%, rgba(5,7,12,0) 46%)';
const Shot: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: C.night950, overflow: 'hidden'}}>
    {children}
    <Vignette strength={0.4} />
    <Grain opacity={0.09} />
    <Watermark opacity={0.4} />
  </AbsoluteFill>
);

export const E019Cover1: React.FC = () => (
  <Shot>
    <Sky u="c1" rings={5} />
    <AbsoluteFill style={{background: TOP}} />
    <Line t={S} at={0} text="SHE ARGUED" y={280} cap={165} />
    <Line t={S} at={0} text="WITH A" y={440} cap={165} />
    <Line t={S} at={0} text="PROPHET." y={600} cap={200} color={C.gold300} />
  </Shot>
);

export const E019Cover2: React.FC = () => (
  <Shot>
    <Sky u="c2" rings={7} lift={120} />
    <AbsoluteFill style={{background: TOP}} />
    <Line t={S} at={0} text="A CHAPTER" y={280} cap={165} />
    <Line t={S} at={0} text="NAMED" y={440} cap={165} />
    <Line t={S} at={0} text="AFTER HER." y={600} cap={200} color={C.gold300} />
  </Shot>
);

export const E019Cover3: React.FC = () => (
  <Shot>
    <Sky u="c3" rings={3} lean={1.5} starCount={260} />
    <AbsoluteFill style={{background: TOP}} />
    <Line t={S} at={0} text="THE SKY" y={290} cap={190} />
    <Line t={S} at={0} text="HEARD HER." y={470} cap={190} color={C.gold300} />
  </Shot>
);
