import React from 'react';
import {random} from 'remotion';
import {C} from '../brand/tokens';
import {clamp, lerp} from '../lib/anim';

export const RIM = 300;
export const FLOOR = 1980; // the shaft runs out of frame: no floor line
export const DOOR_BASE = 1700;
export const SHAFT = {x0: 250, x1: 830} as const;
export const MAN = {x: 585, top: 858, y: 1012} as const;
export const LION = {x: 150, y: RIM} as const; // where the lion settles: the left rim, head over the opening
export const MAW = {x: 548, y: 1480} as const; // the dragon's head
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
  manX?: number; // the man (a point of light); defaults to hanging from the tree
  manY?: number;
  manOn?: number; // 0..1 visibility
  hang?: number; // 0..1: the cord from the branch
  lionX?: number; // lion position along the ground (feet), defaults to the rim
  lionRun?: number; // 0..1 running
  link?: number; // 0..1: golden threads showing that everything here answers to one command
  uid?: string; // prefix for gradient ids: two wells on screen must not share ids (url(#id) is document-wide)
}

/** A lion in profile, facing right, feet at (0,0). */
const Lion: React.FC<{t: number; run: number; day: number; fury: number; uid: string}> = ({t, run, day, fury, uid}) => {
  const tawny = mixHex('#7C5527', '#CE9440', day);
  const pale = mixHex('#A98450', '#EBC98C', day);
  const mane = mixHex('#3A220E', '#6B3E16', day);
  const sw = Math.sin(t * TAU * 3.2) * 34 * run;
  const bob = Math.abs(Math.sin(t * TAU * 3.2)) * -10 * run;
  const leg = 62 - 24 * (1 - run);
  const Leg: React.FC<{x: number; a: number; dark?: boolean}> = ({x, a, dark}) => (
    <rect x={x - 11} y={-56} width={22} height={leg} rx={10} fill={dark ? mixHex('#5E3F1C', '#A87530', day) : tawny} transform={`rotate(${a} ${x} -52)`} />
  );
  return (
    <g transform={`translate(0 ${bob - (62 - leg)})`}>
      <circle cx={70} cy={-90} r={210} fill={`url(#${uid}-ember)`} opacity={0.15 + 0.6 * fury} />
      <path d={`M-146,-84 C-196,-100 -222,${-60 + sw * 0.3} -204,-26`} fill="none" stroke={tawny} strokeWidth={10} strokeLinecap="round" />
      <circle cx={-204} cy={-22} r={13} fill={mane} />
      <Leg x={-112} a={-sw} dark />
      <Leg x={56} a={sw} dark />
      <path d="M-152,-72 C-152,-116 -60,-122 22,-116 C72,-112 96,-90 96,-60 C96,-34 62,-26 0,-26 C-70,-24 -152,-30 -152,-72Z" fill={tawny} />
      <Leg x={-86} a={sw} />
      <Leg x={80} a={-sw} />
      {new Array(10).fill(0).map((_, i) => {
        const a = (i / 10) * TAU;
        return <circle key={i} cx={92 + 40 * Math.cos(a)} cy={-104 + 40 * Math.sin(a)} r={30} fill={mane} />;
      })}
      <circle cx={92} cy={-104} r={50} fill={mane} />
      <circle cx={84} cy={-146} r={13} fill={tawny} />
      <circle cx={84} cy={-146} r={6} fill={mane} />
      <circle cx={112} cy={-102} r={36} fill={tawny} />
      <path d="M128,-110 C150,-114 172,-108 174,-94 C176,-80 160,-72 136,-74 Z" fill={pale} />
      <path d="M160,-108 L176,-104 L168,-94 Z" fill="#1A0E08" />
      <path d="M168,-94 C160,-84 148,-82 138,-84" fill="none" stroke="#3A1E0C" strokeWidth={3} strokeLinecap="round" />
      <path d="M150,-80 l3,10 l5,-9 Z M140,-80 l3,9 l4,-8 Z" fill="#FFF6E0" opacity={0.5 + 0.5 * fury} />
      <ellipse cx={126} cy={-112} rx={8} ry={5.5} fill="#FFC15A" />
      <ellipse cx={127} cy={-112} rx={2.4} ry={4.6} fill="#120603" />
      <path d="M114,-122 L138,-116" stroke="#3A1E0C" strokeWidth={4} strokeLinecap="round" />
    </g>
  );
};

/** A dragon's head in profile, facing +x, jaw hinge at (0,0). */
const DragonHead: React.FC<{open: number; glow: number; uid: string}> = ({open, glow, uid}) => {
  const teeth = (y: number, dir: number) =>
    new Array(7).fill(0).map((_, i) => {
      const x = 58 + i * 21;
      return <path key={i} d={`M${x - 7},${y} L${x + 7},${y} L${x + 2},${y + dir * (22 - i * 1.5)}Z`} fill="#F0E8D2" stroke="#1A0A08" strokeWidth={1} />;
    });
  return (
    <g>
      <path d="M-20,-52 C-66,-106 -122,-118 -164,-104" fill="none" stroke="#D2BC84" strokeWidth={15} strokeLinecap="round" />
      <path d="M-34,-30 C-80,-66 -124,-66 -156,-50" fill="none" stroke="#B9A26C" strokeWidth={11} strokeLinecap="round" />
      <path d="M26,6 L212,-6 L206,54 L26,26 Z" fill={`url(#${uid}-maw)`} opacity={0.6 + 0.4 * glow} />
      <g transform={`rotate(${open * 0.55})`}>
        <path d="M-10,12 C90,10 176,26 214,52 C160,80 60,78 -14,54 Z" fill="#12291F" stroke="#07140F" strokeWidth={2} />
        <path d="M0,40 C70,58 150,62 200,54" fill="none" stroke="#3F7A58" strokeWidth={7} strokeLinecap="round" opacity={0.7} />
        {teeth(14, -1)}
      </g>
      <g transform={`rotate(${-open * 0.45})`}>
        <path d="M-46,-6 C-50,-56 10,-74 70,-66 C140,-58 204,-40 232,-10 C214,2 130,6 30,6 C0,8 -30,10 -46,-6 Z" fill="#1B4435" stroke="#07140F" strokeWidth={2} />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M${-30 + i * 34},-58 l12,-22 l12,24`} fill="#2E6A4E" stroke="#07140F" strokeWidth={1.5} />
        ))}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M${20 + i * 30},-30 q10,-9 20,0`} fill="none" stroke="#0E2A20" strokeWidth={3} />
        ))}
        <circle cx={216} cy={-18} r={5} fill="#07140F" />
        <ellipse cx={52} cy={-36} rx={30} ry={22} fill={`url(#${uid}-ember)`} opacity={0.5 + 0.5 * glow} />
        <path d="M32,-36 Q52,-52 74,-36 Q52,-24 32,-36Z" fill="#FFB347" />
        <ellipse cx={53} cy={-37} rx={3.4} ry={9} fill="#170303" />
        <path d="M24,-50 Q54,-66 84,-44" fill="none" stroke="#07140F" strokeWidth={9} strokeLinecap="round" />
        {teeth(4, 1)}
      </g>
    </g>
  );
};

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
export const Well: React.FC<WellState> = ({t, day, notch, active, lion, dragon, graceL, graceD, you, manX, manY, manOn = 1, hang = 1, lionX = LION.x, lionRun = 0, link = 0, uid = 'w'}) => {
  const grace = Math.max(graceL, graceD);
  const sky = mixHex('#060914', '#2B4F84', day);
  const skyLow = mixHex('#0C1226', '#E9B872', day * 0.85);
  const shaftTop = mixHex('#0B1020', '#1B2740', day);
  const leaf = mixHex('#1F3D2B', '#3F7A4A', day * 0.8 + grace * 0.4);
  const terror = Math.max(lion * (1 - graceL), dragon * (1 - graceD));
  const sway = Math.sin(t * TAU * 0.5) * 7 + Math.sin(t * TAU * 1.5) * 2 * terror;
  const mx = manX ?? MAN.x + sway;
  const my = manY ?? MAN.y;
  const nW = 24 * notch;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky} />
          <stop offset="1" stopColor={skyLow} />
        </linearGradient>
        <linearGradient id={`${uid}-shaft`} gradientUnits="userSpaceOnUse" x1="0" y1={RIM} x2="0" y2={1700}>
          <stop offset="0" stopColor={shaftTop} />
          <stop offset="0.5" stopColor="#070A14" />
          <stop offset="1" stopColor="#020308" />
        </linearGradient>
        <linearGradient id={`${uid}-cone`} gradientUnits="userSpaceOnUse" x1="0" y1={RIM} x2="0" y2={1560}>
          <stop offset="0" stopColor={mixHex('#9FB6E8', '#FFE9B8', day)} stopOpacity={0.05 + 0.13 * day} />
          <stop offset="1" stopColor={mixHex('#9FB6E8', '#FFE9B8', day)} stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${uid}-maw`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FFB060" />
          <stop offset="0.35" stopColor="#E0421C" />
          <stop offset="0.75" stopColor="#5A0D08" />
          <stop offset="1" stopColor="#120304" />
        </radialGradient>
        <radialGradient id={`${uid}-ember`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FF6A2C" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FF6A2C" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-gold`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FFF6DA" stopOpacity="0.95" />
          <stop offset="0.3" stopColor={C.gold300} stopOpacity="0.45" />
          <stop offset="1" stopColor={C.gold300} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-door`} gradientUnits="userSpaceOnUse" x1="0" y1={DOOR_BASE - 330} x2="0" y2={DOOR_BASE}>
          <stop offset="0" stopColor="#FFF8DF" />
          <stop offset="0.55" stopColor="#F2DC9A" />
          <stop offset="1" stopColor="#9CCB86" />
        </linearGradient>
        <linearGradient id={`${uid}-wood`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8A6238" />
          <stop offset="1" stopColor="#4A3018" />
        </linearGradient>
        <radialGradient id={`${uid}-sun`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FFF4CC" />
          <stop offset="0.45" stopColor="#F6C65A" />
          <stop offset="1" stopColor="#F6C65A" stopOpacity="0" />
        </radialGradient>
        <mask id={`${uid}-moon`}>
          <rect x={300} y={20} width={280} height={260} fill="#fff" />
          <circle cx={466} cy={136} r={44} fill="#000" />
        </mask>
        <clipPath id={`${uid}-shaftclip`}>
          <rect x={SHAFT.x0} y={RIM} width={SHAFT.x1 - SHAFT.x0} height={FLOOR - RIM} />
        </clipPath>
      </defs>

      {/* sky, sun and moon */}
      <rect x={-600} y={-900} width={2280} height={900 + RIM} fill={`url(#${uid}-sky)`} />
      {new Array(40).fill(0).map((_, i) => (
        <circle key={i} cx={random(`sx${i}`) * 1080} cy={random(`sy${i}`) * 270} r={0.8 + 1.4 * random(`sr${i}`)} fill="#fff" opacity={(1 - day) * (0.35 + 0.5 * random(`so${i}`))} />
      ))}
      <circle cx={440} cy={150} r={130} fill={`url(#${uid}-sun)`} opacity={day} />
      <circle cx={440} cy={150} r={50} fill="#FFF1C4" opacity={day} />
      <circle cx={440} cy={150} r={50} fill="#EDE9DC" opacity={1 - day} mask={`url(#${uid}-moon)`} />

      {/* earth and stone lining */}
      <rect x={-600} y={RIM} width={600 + SHAFT.x0} height={2400} fill="#090B12" />
      <rect x={SHAFT.x1} y={RIM} width={850} height={2400} fill="#090B12" />
      {BRICKS.map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={7} fill={mixHex('#12151F', '#2A3042', b.l * (0.55 + 0.45 * day))} stroke="#05060A" strokeWidth={2} />
      ))}
      <rect x={SHAFT.x0 - 96} y={RIM - 22} width={110} height={36} rx={8} fill={mixHex('#232838', '#4A4F5E', day)} />
      <rect x={SHAFT.x1 - 14} y={RIM - 22} width={110} height={36} rx={8} fill={mixHex('#232838', '#4A4F5E', day)} />

      {/* the shaft */}
      <rect x={SHAFT.x0} y={RIM} width={SHAFT.x1 - SHAFT.x0} height={FLOOR - RIM} fill={`url(#${uid}-shaft)`} />
      <polygon points={`${SHAFT.x0},${RIM} ${SHAFT.x1},${RIM} 680,1560 400,1560`} fill={`url(#${uid}-cone)`} />

      {/* below: the dragon rising out of the dark, whose mouth is the grave … or a door onto a garden */}
      <g clipPath={`url(#${uid}-shaftclip)`}>
        <g opacity={1 - graceD}>
          <ellipse cx={MAW.x} cy={MAW.y + 60} rx={340} ry={330} fill={`url(#${uid}-ember)`} opacity={0.3 + 0.7 * dragon} />
          {(() => {
            const wob = Math.sin(t * 1.3) * 14;
            const neck = `M${740 + wob},2000 C${800 + wob},1820 ${400 - wob},1800 ${470 - wob * 0.5},1640 C500,1580 536,1560 ${MAW.x - 6},${MAW.y + 26}`;
            return (
              <>
                <path d={neck} fill="none" stroke="#07140F" strokeWidth={156} strokeLinecap="round" />
                <path d={neck} fill="none" stroke="#1B4435" strokeWidth={148} strokeLinecap="round" />
                <path d={neck} fill="none" stroke="#0E2A20" strokeWidth={148} strokeDasharray="4 30" />
                <path d={neck} fill="none" stroke="#3F7A58" strokeWidth={44} strokeLinecap="round" opacity={0.55} transform="translate(26 6)" />
              </>
            );
          })()}
          <g transform={`translate(${MAW.x} ${MAW.y}) rotate(${-76 + Math.sin(t * 1.3) * 3}) scale(1.22)`}>
            <DragonHead open={20 + 12 * dragon + 4 * Math.sin(t * 2.1)} glow={dragon} uid={uid} />
          </g>
        </g>
        {graceD > 0 ? (
          <g opacity={graceD}>
            <circle cx={540} cy={DOOR_BASE - 180} r={520} fill={`url(#${uid}-gold)`} opacity={0.75} />
            {new Array(9).fill(0).map((_, i) => {
              const a = -Math.PI / 2 + (i - 4) * 0.2;
              const y0 = DOOR_BASE - 300;
              return <polygon key={i} points={`${524},${y0} ${556},${y0} ${540 + 760 * Math.cos(a) + 46},${y0 + 760 * Math.sin(a)} ${540 + 760 * Math.cos(a) - 46},${y0 + 760 * Math.sin(a)}`} fill="#FFF3C8" opacity={0.035 + 0.02 * Math.sin(t * 1.3 + i)} />;
            })}
            <path d={`M${540 - 142},${DOOR_BASE} L${540 - 142},${DOOR_BASE - 190} A142,142 0 0 1 ${540 + 142},${DOOR_BASE - 190} L${540 + 142},${DOOR_BASE}Z`} fill={`url(#${uid}-door)`} stroke={C.gold300} strokeWidth={5} />
            <rect x={SHAFT.x0} y={DOOR_BASE} width={SHAFT.x1 - SHAFT.x0} height={4} fill={C.gold300} opacity={0.5} />
            {new Array(14).fill(0).map((_, i) => {
              const x = 540 - 128 + i * 19.6;
              const h = 30 + 50 * random(`gh${i}`);
              const sw = Math.sin(t * 1.4 + i) * 4;
              return (
                <g key={i}>
                  <path d={`M${x},${DOOR_BASE} Q${x + sw},${DOOR_BASE - h * 0.6} ${x + sw * 1.6},${DOOR_BASE - h}`} fill="none" stroke="#3E8A4E" strokeWidth={3.2} strokeLinecap="round" />
                  <circle cx={x + sw * 1.6} cy={DOOR_BASE - h} r={5.5} fill={['#F4A6B8', '#FFFFFF', '#F6C65A', '#E86A7C'][i % 4]} />
                </g>
              );
            })}
            {new Array(16).fill(0).map((_, i) => {
              const ph = (t * (0.16 + 0.1 * random(`gs${i}`)) + random(`gp${i}`)) % 1;
              return <circle key={i} cx={390 + 300 * random(`gx${i}`) + 30 * Math.sin(ph * 6 + i)} cy={DOOR_BASE - 40 - ph * 640} r={2 + 2.4 * random(`gr${i}`)} fill="#FFF3C8" opacity={0.85 * (1 - ph)} />;
            })}
          </g>
        ) : null}
      </g>

      {/* above: the lion … or a tamed horse */}
      <g transform={`translate(${lionX} ${LION.y}) rotate(${13 * (1 - lionRun)} 70 0)`} opacity={1 - graceL}>
        <Lion t={t} run={lionRun} day={day} fury={lion} uid={uid} />
      </g>
      {graceL > 0 ? (
        <g opacity={graceL} transform={`translate(${LION.x + 96} ${LION.y}) scale(-1.5 1.5)`}>
          <circle cx={-6} cy={-70} r={170} fill={`url(#${uid}-gold)`} opacity={0.6} />
          <path d="M62,2 L62,-74 C60,-104 52,-122 44,-142 L30,-112 C18,-120 2,-118 -10,-110 C-34,-92 -58,-62 -76,-40 C-82,-30 -80,-18 -68,-14 C-56,-12 -46,-22 -32,-30 C-22,-34 -12,-28 -10,-14 C-10,-8 -16,-2 -22,2 Z" fill="#141009" stroke={C.gold300} strokeWidth={4} strokeLinejoin="round" />
          <path d="M46,-136 C66,-110 74,-76 70,-30 M56,-118 C80,-92 84,-60 80,-24" fill="none" stroke={C.gold300} strokeWidth={3} strokeLinecap="round" opacity={0.8} />
          <circle cx={-18} cy={-84} r={5} fill={C.gold300} />
          <path d="M-76,-40 C-60,-52 -38,-76 -22,-100" fill="none" stroke={C.gold300} strokeWidth={2.5} opacity={0.6} />
        </g>
      ) : null}

      {/* the fig tree: two roots in the wall, the life-span of the one who hangs from it */}
      <path d={`M${SHAFT.x0 - 6},850 C292,850 322,882 372,906`} fill="none" stroke={`url(#${uid}-wood)`} strokeWidth={26} strokeLinecap="round" />
      <path d={`M${SHAFT.x0 - 6},992 C296,992 326,952 372,926`} fill="none" stroke={`url(#${uid}-wood)`} strokeWidth={26} strokeLinecap="round" />
      <path d="M362,916 C430,908 500,876 600,852" fill="none" stroke={`url(#${uid}-wood)`} strokeWidth={30} strokeLinecap="round" />
      <path d="M600,852 C640,846 676,856 704,872" fill="none" stroke={`url(#${uid}-wood)`} strokeWidth={15} strokeLinecap="round" />
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

      {/* everything here answers to one command */}
      {link > 0
        ? ([[364, 812], [366, 952], [520, 850], [lionX + 150, RIM - 110], [MAW.x + 20, MAW.y - 60], [mx, my]] as [number, number][]).map(([x, y], i) => {
            const p = clamp(link * 6 - i);
            const len = Math.hypot(x - 640, y - 130);
            return <line key={i} x1={640} y1={130} x2={x} y2={y} stroke={C.gold300} strokeWidth={2.6} strokeDasharray={`${len * p} ${len}`} opacity={0.75} />;
          })
        : null}
      {link > 0 ? <circle cx={640} cy={130} r={70 + 8 * Math.sin(t * 3)} fill={`url(#${uid}-gold)`} opacity={clamp(link * 3)} /> : null}

      {/* the man: a point of light */}
      {manOn > 0 ? (
        <g opacity={manOn}>
          {hang > 0 ? <path d={`M${MAN.x},${MAN.top} Q${MAN.x + sway * 0.4},${(MAN.top + my) / 2} ${mx},${my - 12}`} fill="none" stroke="#C9B48A" strokeWidth={2.5} opacity={hang} /> : null}
          <circle cx={mx} cy={my} r={78 + 26 * you} fill={`url(#${uid}-gold)`} opacity={0.8 + 0.2 * Math.sin(t * TAU)} />
          <circle cx={mx} cy={my} r={13} fill="#FFFBEA" />
          {you > 0 ? <circle cx={mx} cy={my} r={30 + 26 * you} fill="none" stroke={C.gold300} strokeWidth={3} opacity={you * 0.8} /> : null}
        </g>
      ) : null}
    </svg>
  );
};
