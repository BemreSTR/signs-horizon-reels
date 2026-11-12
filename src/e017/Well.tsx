import React from 'react';
import {random} from 'remotion';
import {C} from '../brand/tokens';
import {clamp, lerp} from '../lib/anim';

export const RIM = 300;
export const FLOOR = 1640;
export const SHAFT = {x0: 250, x1: 830} as const;
export const MAN = {x: 585, top: 858, y: 1012} as const;
export const LION = {x: 700, y: 262} as const;
export const MAW = {x: 540, y: 1545} as const;
export const NOTCH = {white: {x: 290, y: 846}, black: {x: 292, y: 992}} as const;

const TAU = Math.PI * 2;
const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixHex = (a: string, b: string, p: number) => {
  const x = hex(a);
  const y = hex(b);
  return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], clamp(p)))).join(',')})`;
};

const BRICKS = (() => {
  const out: {x: number; y: number; w: number; h: number; l: number}[] = [];
  for (const side of [0, 1]) {
    for (let col = 0; col < 4; col++) {
      let y = RIM + 14 - (col % 2 ? 30 : 0);
      let i = 0;
      while (y < 1920) {
        const h = 54 + 16 * random(`bh${side}${col}${i}`);
        const w = 62;
        const x = side === 0 ? SHAFT.x0 - (col + 1) * w : SHAFT.x1 + col * w;
        out.push({x, y, w: w - 4, h: h - 4, l: (0.5 + 0.5 * random(`bl${side}${col}${i}`)) * (1 - col * 0.22)});
        y += h;
        i++;
      }
    }
  }
  return out;
})();

const LEAF = 'M0,0 C-10,-8 -26,-10 -30,-26 C-22,-24 -16,-26 -12,-30 C-14,-40 -8,-50 0,-58 C8,-50 14,-40 12,-30 C16,-26 22,-24 30,-26 C26,-10 10,-8 0,0Z';
const LEAVES: [number, number, number, number][] = [
  [452, 792, -20, 1.0], [430, 812, -62, 0.8], [476, 780, 24, 0.85], [520, 762, -8, 1.05], [548, 772, 42, 0.8], [498, 772, -48, 0.7],
  [640, 792, 12, 1.0], [664, 784, 52, 0.8], [618, 786, -36, 0.8], [690, 822, 64, 0.95], [706, 846, 100, 0.75], [700, 872, 78, 0.9], [726, 880, 118, 0.7], [592, 800, -4, 0.7],
];
const FRUITS: [number, number, number, string][] = [
  [462, 826, 10, '#E3A23A'], [506, 800, 9, '#C8283A'], [538, 804, 11, '#7B3FA6'], [628, 822, 10, '#E86A2C'], [668, 818, 9, '#D9C24A'], [684, 852, 11, '#B4233A'], [716, 902, 10, '#8A4FB0'], [486, 838, 8, '#D9C24A'], [650, 846, 9, '#C8283A'],
];
const TEETH = new Array(26).fill(0).map((_, i) => {
  const a = (i / 26) * TAU + 0.12;
  return {a, len: 34 + 22 * random(`tt${i}`)};
});

export interface WellState {
  t: number;
  day: number; // 0 night … 1 day
  notch: number; // 0..1 how far the roots are eaten
  active: 'white' | 'black' | 'none';
  lion: number; // emphasis 0..1
  dragon: number;
  graceL: number; // 0..1: the second brother's reading: the lion is a tamed horse
  graceD: number; // … and the dragon's mouth a door onto a garden
  you: number; // emphasis on the hanging light
}

const Rat: React.FC<{x: number; y: number; white: boolean; active: boolean; t: number; rot?: number}> = ({x, y, white, active, t, rot = 0}) => {
  const bob = active ? Math.abs(Math.sin(t * TAU * 5)) : 0;
  const tail = Math.sin(t * TAU * (white ? 1 : 0.5) + (white ? 0 : 1.3)) * (active ? 5 : 9);
  const fill = white ? '#F2EDE1' : '#161922';
  const shade = white ? '#B7AF9C' : '#000';
  const rim = white ? '#FFFFFF' : '#AEB6CC';
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={`M36,6 Q78,14 ${92 + tail * 0.4},${-18 + tail}`} fill="none" stroke={white ? '#D9B9A8' : '#3A3F4E'} strokeWidth={5} strokeLinecap="round" />
      <ellipse cx={-14} cy={21} rx={9} ry={5} fill={shade} />
      <ellipse cx={18} cy={21} rx={11} ry={5} fill={shade} />
      <ellipse cx={0} cy={0} rx={42} ry={25} fill={fill} stroke={rim} strokeOpacity={white ? 0.5 : 0.75} strokeWidth={white ? 1.5 : 2.2} />
      <ellipse cx={8} cy={8} rx={30} ry={14} fill={shade} opacity={white ? 0.35 : 0} />
      <g transform={`translate(${-4 * bob} ${2.5 * bob}) rotate(${-7 * bob} -30 4)`}>
        <path d="M-28,-14 C-44,-18 -60,-8 -72,6 C-62,14 -44,18 -28,16 Z" fill={fill} stroke={rim} strokeOpacity={white ? 0.5 : 0.75} strokeWidth={white ? 1.5 : 2.2} strokeLinejoin="round" />
        <circle cx={-34} cy={-15} r={10} fill={white ? '#E9C9C0' : '#15171F'} stroke={rim} strokeOpacity={0.7} strokeWidth={1.6} />
        <circle cx={-52} cy={-1} r={3.6} fill={white ? '#1A0F0F' : '#FF5A3C'} />
        <circle cx={-72} cy={6} r={3} fill={white ? '#E28F8F' : '#55596A'} />
        <path d="M-66,6 l-16,-8 M-66,8 l-17,2 M-66,10 l-14,10" stroke={rim} strokeOpacity={0.55} strokeWidth={1.2} />
      </g>
    </g>
  );
};

/** The well of the 8th Word, drawn in world coordinates (1080×1920). Purely a function of its state. */
export const Well: React.FC<WellState> = ({t, day, notch, active, lion, dragon, graceL, graceD, you}) => {
  const grace = Math.max(graceL, graceD);
  const sky = mixHex('#060914', '#2B4F84', day);
  const skyLow = mixHex('#0C1226', '#E9B872', day * 0.85);
  const shaftTop = mixHex('#0B1020', '#1B2740', day);
  const leaf = mixHex('#1F3D2B', '#3F7A4A', day * 0.8 + grace * 0.4);
  const terror = Math.max(lion * (1 - graceL), dragon * (1 - graceD));
  const sway = Math.sin(t * TAU * 0.5) * 7 + Math.sin(t * TAU * 1.5) * 2 * terror;
  const mx = MAN.x + sway;
  const eyeL = 0.55 + 0.45 * lion;
  const eyeD = 0.45 + 0.55 * dragon;
  const nW = 24 * notch;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <defs>
        <linearGradient id="w-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky} />
          <stop offset="1" stopColor={skyLow} />
        </linearGradient>
        <linearGradient id="w-shaft" gradientUnits="userSpaceOnUse" x1="0" y1={RIM} x2="0" y2={FLOOR}>
          <stop offset="0" stopColor={shaftTop} />
          <stop offset="0.5" stopColor="#070A14" />
          <stop offset="1" stopColor="#020308" />
        </linearGradient>
        <linearGradient id="w-cone" gradientUnits="userSpaceOnUse" x1="0" y1={RIM} x2="0" y2={FLOOR - 120}>
          <stop offset="0" stopColor={mixHex('#9FB6E8', '#FFE9B8', day)} stopOpacity={0.05 + 0.13 * day} />
          <stop offset="1" stopColor={mixHex('#9FB6E8', '#FFE9B8', day)} stopOpacity="0" />
        </linearGradient>
        <radialGradient id="w-maw" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FFB060" />
          <stop offset="0.35" stopColor="#E0421C" />
          <stop offset="0.75" stopColor="#5A0D08" />
          <stop offset="1" stopColor="#120304" />
        </radialGradient>
        <radialGradient id="w-ember" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FF6A2C" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FF6A2C" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="w-gold" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FFF6DA" stopOpacity="0.95" />
          <stop offset="0.3" stopColor={C.gold300} stopOpacity="0.45" />
          <stop offset="1" stopColor={C.gold300} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="w-door" gradientUnits="userSpaceOnUse" x1="0" y1={MAW.y - 170} x2="0" y2={FLOOR}>
          <stop offset="0" stopColor="#FFF8DF" />
          <stop offset="0.55" stopColor="#F2DC9A" />
          <stop offset="1" stopColor="#9CCB86" />
        </linearGradient>
        <linearGradient id="w-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8A6238" />
          <stop offset="1" stopColor="#4A3018" />
        </linearGradient>
        <radialGradient id="w-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FFF4CC" />
          <stop offset="0.45" stopColor="#F6C65A" />
          <stop offset="1" stopColor="#F6C65A" stopOpacity="0" />
        </radialGradient>
        <mask id="w-moon">
          <rect x={300} y={20} width={280} height={260} fill="#fff" />
          <circle cx={466} cy={136} r={44} fill="#000" />
        </mask>
        <clipPath id="w-shaftclip">
          <rect x={SHAFT.x0} y={RIM} width={SHAFT.x1 - SHAFT.x0} height={FLOOR - RIM} />
        </clipPath>
      </defs>

      {/* sky, sun and moon */}
      <rect x={-600} y={-900} width={2280} height={900 + RIM} fill="url(#w-sky)" />
      {new Array(40).fill(0).map((_, i) => (
        <circle key={i} cx={random(`sx${i}`) * 1080} cy={random(`sy${i}`) * 270} r={0.8 + 1.4 * random(`sr${i}`)} fill="#fff" opacity={(1 - day) * (0.35 + 0.5 * random(`so${i}`))} />
      ))}
      <circle cx={440} cy={150} r={130} fill="url(#w-sun)" opacity={day} />
      <circle cx={440} cy={150} r={50} fill="#FFF1C4" opacity={day} />
      <circle cx={440} cy={150} r={50} fill="#EDE9DC" opacity={1 - day} mask="url(#w-moon)" />

      {/* above: the lion, looking down over the far rim */}
      <g transform={`translate(${LION.x + Math.sin(t * 31) * 2.2 * lion * (1 - graceL)} ${LION.y})`}>
        <g opacity={1 - graceL} transform="translate(0 18) scale(1.75)">
          <circle r={150} fill="url(#w-ember)" opacity={0.25 + 0.6 * lion} />
          <polygon
            points={new Array(36)
              .fill(0)
              .map((_, i) => {
                const a = (i / 36) * TAU;
                const r = i % 2 ? 66 : 96 + 10 * random(`mn${i}`);
                return `${(r * Math.cos(a)).toFixed(1)},${(r * 0.92 * Math.sin(a) - 30).toFixed(1)}`;
              })
              .join(' ')}
            fill="#0D0907"
            stroke="#C2591F"
            strokeOpacity={0.35 + 0.5 * lion}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          <ellipse cx={0} cy={-26} rx={50} ry={46} fill="#1A110B" />
          <path d="M-20,-4 L0,10 L20,-4 L8,-10 L-8,-10Z" fill="#070403" />
          {[-1, 1].map((s) => (
            <g key={s}>
              <ellipse cx={s * 22} cy={-38} rx={22} ry={15} fill="url(#w-ember)" opacity={eyeL} />
              <path d={`M${s * 22 - 13},-38 Q${s * 22},-48 ${s * 22 + 13},-38 Q${s * 22},-31 ${s * 22 - 13},-38Z`} fill="#FFC15A" opacity={eyeL} />
              <ellipse cx={s * 22} cy={-38} rx={2.6} ry={5.5} fill="#120603" />
            </g>
          ))}
        </g>
      </g>

      {/* earth and stone lining */}
      <rect x={-600} y={RIM} width={600 + SHAFT.x0} height={2400} fill="#090B12" />
      <rect x={SHAFT.x1} y={RIM} width={850} height={2400} fill="#090B12" />
      <rect x={SHAFT.x0} y={FLOOR} width={SHAFT.x1 - SHAFT.x0} height={1100} fill="#090B12" />
      {BRICKS.map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={7} fill={mixHex('#12151F', '#2A3042', b.l * (0.55 + 0.45 * day))} stroke="#05060A" strokeWidth={2} />
      ))}
      <rect x={SHAFT.x0 - 96} y={RIM - 22} width={110} height={36} rx={8} fill={mixHex('#232838', '#4A4F5E', day)} />
      <rect x={SHAFT.x1 - 14} y={RIM - 22} width={110} height={36} rx={8} fill={mixHex('#232838', '#4A4F5E', day)} />

      {/* the shaft */}
      <rect x={SHAFT.x0} y={RIM} width={SHAFT.x1 - SHAFT.x0} height={FLOOR - RIM} fill="url(#w-shaft)" />
      <polygon points={`${SHAFT.x0},${RIM} ${SHAFT.x1},${RIM} 680,${FLOOR - 120} 400,${FLOOR - 120}`} fill="url(#w-cone)" />

      {/* below: the dragon, whose mouth is the grave … or a door onto a garden */}
      <g clipPath="url(#w-shaftclip)">
        <g opacity={1 - graceD}>
          <ellipse cx={MAW.x} cy={MAW.y - 40} rx={330} ry={300} fill="url(#w-ember)" opacity={0.35 + 0.65 * dragon} />
          <ellipse cx={MAW.x} cy={MAW.y + 10} rx={262} ry={128} fill="#0A0406" />
          <ellipse cx={MAW.x} cy={MAW.y + 10} rx={236} ry={108} fill="url(#w-maw)" opacity={0.55 + 0.45 * dragon} />
          {TEETH.map((th, i) => {
            const ex = MAW.x + 250 * Math.cos(th.a);
            const ey = MAW.y + 10 + 118 * Math.sin(th.a);
            const ix = MAW.x + (250 - th.len * 1.7) * Math.cos(th.a);
            const iy = MAW.y + 10 + (118 - th.len) * Math.sin(th.a);
            const px = -Math.sin(th.a) * 15;
            const py = Math.cos(th.a) * 8;
            return <polygon key={i} points={`${ex - px},${ey - py} ${ex + px},${ey + py} ${ix},${iy}`} fill="#E4DCC6" stroke="#2A0A08" strokeWidth={1.5} opacity={0.75 + 0.25 * dragon} />;
          })}
          {[-1, 1].map((s) => (
            <g key={s} transform={`translate(${MAW.x + s * 128} ${MAW.y - 168}) rotate(${s * -14})`}>
              <ellipse rx={54} ry={40} fill="url(#w-ember)" opacity={eyeD} />
              <path d="M-36,0 Q0,-24 36,0 Q0,18 -36,0Z" fill="#FFB347" opacity={eyeD} />
              <ellipse rx={5} ry={15} fill="#170303" />
              <path d="M-48,-22 Q0,-48 50,-16" fill="none" stroke="#0A0406" strokeWidth={12} strokeLinecap="round" />
            </g>
          ))}
        </g>
        {graceD > 0 ? (
          <g opacity={graceD}>
            <circle cx={MAW.x} cy={MAW.y - 30} r={470} fill="url(#w-gold)" opacity={0.75} />
            {new Array(9).fill(0).map((_, i) => {
              const a = -Math.PI / 2 + (i - 4) * 0.2;
              return <polygon key={i} points={`${MAW.x - 16},${MAW.y - 120} ${MAW.x + 16},${MAW.y - 120} ${MAW.x + 720 * Math.cos(a) + 46},${MAW.y - 120 + 720 * Math.sin(a)} ${MAW.x + 720 * Math.cos(a) - 46},${MAW.y - 120 + 720 * Math.sin(a)}`} fill="#FFF3C8" opacity={0.035 + 0.02 * Math.sin(t * 1.3 + i)} />;
            })}
            <path d={`M${MAW.x - 132},${FLOOR} L${MAW.x - 132},${MAW.y - 60} A132,132 0 0 1 ${MAW.x + 132},${MAW.y - 60} L${MAW.x + 132},${FLOOR}Z`} fill="url(#w-door)" stroke={C.gold300} strokeWidth={5} />
            {new Array(13).fill(0).map((_, i) => {
              const x = MAW.x - 118 + i * 19.6;
              const h = 30 + 46 * random(`gh${i}`);
              const sw = Math.sin(t * 1.4 + i) * 4;
              return (
                <g key={i}>
                  <path d={`M${x},${FLOOR} Q${x + sw},${FLOOR - h * 0.6} ${x + sw * 1.6},${FLOOR - h}`} fill="none" stroke="#3E8A4E" strokeWidth={3.2} strokeLinecap="round" />
                  <circle cx={x + sw * 1.6} cy={FLOOR - h} r={5.5} fill={['#F4A6B8', '#FFFFFF', '#F6C65A', '#E86A7C'][i % 4]} />
                </g>
              );
            })}
            {new Array(16).fill(0).map((_, i) => {
              const ph = (t * (0.16 + 0.1 * random(`gs${i}`)) + random(`gp${i}`)) % 1;
              return <circle key={i} cx={MAW.x - 150 + 300 * random(`gx${i}`) + 30 * Math.sin(ph * 6 + i)} cy={FLOOR - 40 - ph * 620} r={2 + 2.4 * random(`gr${i}`)} fill="#FFF3C8" opacity={0.85 * (1 - ph)} />;
            })}
          </g>
        ) : null}
      </g>

      {/* … or a tamed horse, standing at the rim */}
      <g transform={`translate(${LION.x} ${LION.y})`}>
        {graceL > 0 ? (
          <g opacity={graceL} transform="translate(40 30) scale(1.45)">
            <circle cx={-6} cy={-70} r={170} fill="url(#w-gold)" opacity={0.6} />
            <path d="M62,2 L62,-74 C60,-104 52,-122 44,-142 L30,-112 C18,-120 2,-118 -10,-110 C-34,-92 -58,-62 -76,-40 C-82,-30 -80,-18 -68,-14 C-56,-12 -46,-22 -32,-30 C-22,-34 -12,-28 -10,-14 C-10,-8 -16,-2 -22,2 Z" fill="#141009" stroke={C.gold300} strokeWidth={4} strokeLinejoin="round" />
            <path d="M46,-136 C66,-110 74,-76 70,-30 M56,-118 C80,-92 84,-60 80,-24" fill="none" stroke={C.gold300} strokeWidth={3} strokeLinecap="round" opacity={0.8} />
            <circle cx={-18} cy={-84} r={5} fill={C.gold300} />
            <path d="M-76,-40 C-60,-52 -38,-76 -22,-100" fill="none" stroke={C.gold300} strokeWidth={2.5} opacity={0.6} />
          </g>
        ) : null}
      </g>

      {/* the fig tree: two roots in the wall, the life-span of the one who hangs from it */}
      <path d={`M${SHAFT.x0 - 6},850 C292,850 322,882 372,906`} fill="none" stroke="url(#w-wood)" strokeWidth={26} strokeLinecap="round" />
      <path d={`M${SHAFT.x0 - 6},992 C296,992 326,952 372,926`} fill="none" stroke="url(#w-wood)" strokeWidth={26} strokeLinecap="round" />
      <path d="M362,916 C430,908 500,876 600,852" fill="none" stroke="url(#w-wood)" strokeWidth={30} strokeLinecap="round" />
      <path d="M600,852 C640,846 676,856 704,872" fill="none" stroke="url(#w-wood)" strokeWidth={15} strokeLinecap="round" />
      <path d="M470,888 C462,850 456,822 452,796 M500,878 C508,838 516,800 520,768 M562,862 C590,832 618,808 642,794 M612,850 C650,836 672,828 690,824" fill="none" stroke="#6E4C2A" strokeWidth={9} strokeLinecap="round" />
      {LEAVES.map(([x, y, r, s], i) => (
        <path key={i} d={LEAF} transform={`translate(${x} ${y}) rotate(${r + Math.sin(t * 1.1 + i) * 3}) scale(${s})`} fill={leaf} stroke="#0C1A10" strokeWidth={1.5} />
      ))}
      {FRUITS.map(([x, y, r, c], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill={c} stroke="#0A0A0A" strokeOpacity={0.5} />
          <circle cx={x - r * 0.3} cy={y - r * 0.35} r={r * 0.28} fill="#fff" opacity={0.45} />
        </g>
      ))}
      {/* what the rats have eaten */}
      {([['white', NOTCH.white, 1], ['black', NOTCH.black, 1]] as const).map(([k, n]) => (
        <g key={k}>
          <path d={`M${n.x - 9 - 9 * notch},${n.y - 16} L${n.x},${n.y - 15 + nW} L${n.x + 9 + 9 * notch},${n.y - 16}Z`} fill="#0A0E19" />
          <path d={`M${n.x - 9 - 9 * notch},${n.y - 14} L${n.x},${n.y - 15 + nW} L${n.x + 9 + 9 * notch},${n.y - 14}`} fill="none" stroke="#C9A067" strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
          {active === k
            ? new Array(5).fill(0).map((_, i) => {
                const ph = (t * 2.2 + i / 5) % 1;
                return <rect key={i} x={n.x - 4 + (random(`ch${k}${i}`) - 0.5) * 36 * ph} y={n.y - 8 + 150 * ph * ph} width={5} height={3} fill="#E0BC84" opacity={1 - ph} transform={`rotate(${ph * 300} ${n.x} ${n.y + 150 * ph * ph})`} />;
              })
            : null}
        </g>
      ))}
      <Rat x={NOTCH.white.x + 74} y={NOTCH.white.y - 34} white active={active === 'white'} t={t} rot={8} />
      <Rat x={NOTCH.black.x + 74} y={NOTCH.black.y - 40} white={false} active={active === 'black'} t={t} rot={-12} />

      {/* the one who hangs there */}
      <path d={`M${MAN.x},${MAN.top} Q${MAN.x + sway * 0.4},${(MAN.top + MAN.y) / 2} ${mx},${MAN.y - 12}`} fill="none" stroke="#C9B48A" strokeWidth={2.5} />
      <circle cx={mx} cy={MAN.y} r={78 + 26 * you} fill="url(#w-gold)" opacity={0.8 + 0.2 * Math.sin(t * TAU)} />
      <circle cx={mx} cy={MAN.y} r={13} fill="#FFFBEA" />
      {you > 0 ? <circle cx={mx} cy={MAN.y} r={30 + 26 * you} fill="none" stroke={C.gold300} strokeWidth={3} opacity={you * 0.8} /> : null}
    </svg>
  );
};
