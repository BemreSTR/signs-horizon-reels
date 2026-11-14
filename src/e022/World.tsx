import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {C} from '../brand/tokens';
import {Stars} from '../components/Atmosphere';
import {EASE, clamp, ramp} from '../lib/anim';
import {
  CUB_HEAD, CUB_UP, CX, CY, DUSK, FLAME, GROUND, HEAD, MEAT_EATEN, MEAT_X, MILK, THREADS, WING, ZOOM, X, kf,
} from './timeline';

/* ------------------------------------------------------------------ colour helpers */
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, p: number) => {
  const A = hex(a), B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * p)).join(',')})`;
};

/* ------------------------------------------------------------------ ground layers */
interface Layer {base: number; amp: number; f1: number; p1: number; f2: number; p2: number; fac: number}
const NEAR: Layer = {base: GROUND, amp: 9, f1: 0.0041, p1: 1.1, f2: 0.0113, p2: 2.3, fac: 1};
const MID: Layer = {base: 1352, amp: 24, f1: 0.0029, p1: 0.4, f2: 0.0087, p2: 4.0, fac: 0.5};
const FAR: Layer = {base: 1296, amp: 46, f1: 0.0019, p1: 2.2, f2: 0.0061, p2: 1.5, fac: 0.25};
const dy = (L: Layer, wx: number) => L.base + L.amp * Math.sin(wx * L.f1 + L.p1) + L.amp * 0.45 * Math.sin(wx * L.f2 + L.p2);
const groundY = (wx: number) => dy(NEAR, wx);
const duneD = (L: Layer, a = -900, b = 4900) => {
  let d = `M ${a} 9000`;
  for (let x = a; x <= b; x += 24) d += ` L ${x} ${dy(L, x).toFixed(1)}`;
  return `${d} L ${b} 9000 Z`;
};

/** Camera transform for a layer that scrolls at `fac` of the world. */
const cam = (z: number, cx: number, cy: number, fac: number) =>
  `translate(540 1250) scale(${z}) translate(${-(540 + fac * (cx - 540))} ${-cy})`;

const RIM = '#F4B666';

/* ------------------------------------------------------------------ lioness (and cub) */
const L_TORSO = 'M -172 -196 C -150 -218 -80 -214 -10 -216 C 60 -222 110 -232 152 -222 L 178 -176 C 170 -140 140 -114 100 -106 C 30 -98 -20 -114 -70 -116 C -120 -120 -158 -134 -180 -160 Z';
const L_NECK = 'M 134 -226 C 180 -250 214 -246 226 -214 L 240 -154 C 214 -134 172 -142 154 -164 Z';
const L_HEAD = 'M 214 -206 C 216 -230 236 -242 262 -240 C 290 -238 316 -226 338 -214 C 352 -210 358 -200 354 -188 C 350 -178 340 -176 328 -174 C 318 -166 306 -158 288 -152 C 262 -146 236 -150 224 -162 C 214 -172 212 -190 214 -206 Z';
const L_FLEG = 'M 104 -150 L 156 -150 L 151 -26 Q 153 -6 170 -2 L 120 -2 Q 108 -8 114 -28 Z';
const L_HLEG = 'M -158 -166 C -196 -126 -186 -90 -168 -58 L -174 -4 L -128 -4 L -130 -50 C -116 -80 -94 -118 -88 -158 Z';
const FUR = '#0A0910';
const FUR_FAR = '#06050B';

const Feline: React.FC<{x: number; y: number; s: number; head: number; t: number; cub?: boolean; flip?: boolean; rim: number; sway?: number; id: string}> = ({
  x, y, s, head, t, cub = false, flip = false, rim, sway = 1, id,
}) => {
  const hs = cub ? 1.22 : 1;
  const tail = (cub ? 4 : 6) * Math.sin(t * 1.3 + (cub ? 2 : 0)) * sway;
  const stroke = {stroke: RIM, strokeOpacity: rim, strokeWidth: 2.4 / s, strokeLinejoin: 'round' as const};
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {/* far legs */}
      <path d={L_FLEG} transform="translate(-36 0)" fill={FUR_FAR} />
      <path d={L_HLEG} transform="translate(44 0)" fill={FUR_FAR} />
      {/* tail */}
      <g transform={`rotate(${tail} -176 -190)`}>
        <path d="M -176 -190 C -230 -184 -276 -146 -272 -84" stroke={FUR} strokeWidth={cub ? 15 : 13} fill="none" strokeLinecap="round" />
        <ellipse cx={-272} cy={-72} rx={cub ? 13 : 11} ry={cub ? 24 : 25} transform="rotate(-6 -272 -72)" fill={FUR} />
      </g>
      <path d={L_HLEG} fill={FUR} {...stroke} strokeOpacity={rim * 0.6} />
      <path d={L_TORSO} fill={FUR} {...stroke} />
      <ellipse cx={-122} cy={-146} rx={60} ry={62} fill={FUR} />
      <path d={L_FLEG} fill={FUR} {...stroke} strokeOpacity={rim * 0.6} />
      {/* neck + head, pivot at the shoulder */}
      <g transform={`rotate(${head} 190 -190)`}>
        <path d={L_NECK} fill={FUR} />
        <g transform={`translate(${190 * (1 - hs * 1.12)} ${-190 * (1 - hs * 1.12)}) scale(${hs * 1.12})`}>
          <g transform={cub ? 'translate(36 0) scale(0.83 1)' : undefined}>
          <path d={L_HEAD} fill={FUR} {...stroke} />
          <ellipse cx={240} cy={-246} rx={cub ? 22 : 17} ry={cub ? 23 : 18} fill={FUR} {...stroke} strokeOpacity={rim * 0.7} />
          <ellipse cx={226} cy={-240} rx={12} ry={14} fill={FUR_FAR} />
          <circle cx={298} cy={-208} r={3.2} fill="#FFC87A" opacity={0.85} />
          <path d="M 326 -190 C 336 -189 346 -188 354 -187" stroke="#1A1620" strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={0.7} />
          </g>
        </g>
      </g>
      <title>{id}</title>
    </g>
  );
};

const Meat: React.FC<{x: number; y: number; eaten: number}> = ({x, y, eaten}) => (
  <g transform={`translate(${x} ${y}) scale(${1 - eaten * 0.55} ${1 - eaten * 0.7})`}>
    <ellipse cx={0} cy={-18} rx={48} ry={26} fill="#5C1B22" />
    <ellipse cx={-10} cy={-28} rx={26} ry={10} fill="#8E2C32" opacity={0.85} />
    <rect x={30} y={-26} width={44} height={9} rx={4} fill="#E9DCC0" />
    <circle cx={76} cy={-24} r={9} fill="#E9DCC0" />
    <path d="M -48 -18 C -44 -2 44 -2 48 -18" stroke={RIM} strokeOpacity={0.4} strokeWidth={2} fill="none" />
  </g>
);

/* a thread of light that leaves a mother and reaches the small one */
const Thread: React.FC<{t: number; at: number; a: [number, number]; b: [number, number]; id: string; bow?: number}> = ({t, at, a, b, id, bow = -60}) => {
  const p = ramp(t, at, at + 1.1, EASE.out);
  if (p <= 0) return null;
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + bow;
  const d = `M ${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}`;
  const o = clamp(p) * (0.55 + 0.12 * Math.sin(t * 3.1));
  return (
    <g opacity={o}>
      <path d={d} stroke={`url(#${id})`} strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.28} pathLength={1} strokeDasharray={`${p} 1`} />
      <path d={d} stroke="#FFE9B8" strokeWidth={2.6} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} />
    </g>
  );
};

/* ------------------------------------------------------------------ acacia on the mid layer */
const Acacia: React.FC<{x: number; s: number}> = ({x, s}) => {
  const y = dy(MID, x) + 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="#07060D">
      <path d="M -9 0 C -6 -50 -14 -90 -34 -128 L -24 -132 C -8 -104 2 -94 6 -66 C 8 -96 22 -112 44 -132 L 52 -126 C 28 -102 18 -78 12 0 Z" />
      <ellipse cx={0} cy={-142} rx={118} ry={19} />
      <ellipse cx={-52} cy={-132} rx={64} ry={14} />
      <ellipse cx={58} cy={-138} rx={70} ry={15} />
      <ellipse cx={-10} cy={-156} rx={72} ry={12} />
    </g>
  );
};

/* ------------------------------------------------------------------ fig tree with its roots */
const LEAF = 'M 0 0 C -26 -8 -58 -26 -62 -58 C -42 -50 -30 -58 -27 -86 C -10 -68 -4 -88 0 -118 C 4 -88 10 -68 27 -86 C 30 -58 42 -50 62 -58 C 58 -26 26 -8 0 0 Z';
const FIGS = [[-150, -300], [-60, -262], [30, -300], [120, -275], [190, -318], [-215, -332]]; // relative to the trunk top
const BX = 0, BY = -232; // the trunk top, relative to the trunk base

const bez = (p0: number[], p1: number[], p2: number[], p3: number[], u: number) => {
  const m = 1 - u;
  return [m * m * m * p0[0] + 3 * m * m * u * p1[0] + 3 * m * u * u * p2[0] + u * u * u * p3[0], m * m * m * p0[1] + 3 * m * m * u * p1[1] + 3 * m * u * u * p2[1] + u * u * u * p3[1]];
};

const Fig: React.FC<{t: number; u: string; x: number}> = ({t, u, x}) => {
  const g = groundY(x);
  const roots = [
    {d: 'M 0 6 C -10 90 -40 150 -70 230', w: 11}, {d: 'M 0 6 C 14 100 30 170 52 260', w: 10},
    {d: 'M -6 30 C -90 50 -160 80 -250 150', w: 7}, {d: 'M 6 40 C 90 60 180 70 280 140', w: 7},
    {d: 'M -40 120 C -100 140 -130 190 -190 240', w: 5}, {d: 'M 28 150 C 90 170 140 200 190 255', w: 5},
  ];
  const wake = ramp(t, 15.0, 16.4, EASE.out);
  const crown = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const sway = 0.7 * Math.sin(t * 0.8);
  return (
    <g transform={`translate(${x} ${g})`}>
      {/* soil cut-away */}
      <g opacity={ramp(t, 14.4, 15.4)}>
        <rect x={-430} y={0} width={860} height={420} rx={30} fill={`url(#${u}-soil)`} />
        <path d="M -430 0 L 430 0" stroke="#4A6A4A" strokeWidth={5} opacity={0.5} />
        {new Array(40).fill(0).map((_, i) => (
          <circle key={i} cx={-410 + 820 * random(`sx${i}`)} cy={20 + 380 * random(`sy${i}`)} r={2 + 5 * random(`sr${i}`)} fill="#3B261B" opacity={0.7} />
        ))}
        {roots.map((r, i) => (
          <g key={i}>
            <path d={r.d} stroke="#1A100B" strokeWidth={r.w + 6} fill="none" strokeLinecap="round" />
            <path d={r.d} stroke="#6A4A32" strokeWidth={r.w} fill="none" strokeLinecap="round" />
            <path d={r.d} stroke="#F7E3A8" strokeWidth={r.w * 0.34} fill="none" strokeLinecap="round" pathLength={100} strokeDasharray="7 17" strokeDashoffset={t * 30 + i * 9} opacity={0.75 * wake} />
          </g>
        ))}
      </g>
      {/* trunk, branches, crown */}
      <g transform={`rotate(${sway * 0.3} 0 0)`}>
        <path d="M -78 8 C -40 -20 -50 -60 -46 -110 C -42 -170 -50 -200 -40 -236 L 34 -238 C 44 -200 36 -170 40 -110 C 44 -60 40 -20 84 8 Z" fill="#0A0A10" />
        {[
          'M -10 -224 C -80 -250 -150 -270 -210 -330', 'M 6 -226 C 70 -250 150 -272 200 -320', 'M -2 -226 C -6 -290 6 -340 0 -400', 'M -20 -226 C -40 -280 -90 -320 -120 -360', 'M 14 -226 C 40 -280 90 -320 130 -366',
        ].map((d, i) => (
          <path key={i} d={d} stroke="#0A0A10" strokeWidth={26 - 3 * i} fill="none" strokeLinecap="round" />
        ))}
        {/* rim light on the trunk */}
        <path d="M 46 0 C 30 -80 46 -160 36 -232" stroke={RIM} strokeOpacity={0.12 + 0.2 * DUSK(t)} strokeWidth={3} fill="none" />
        {crown.map((i) => {
          const a = (i / crown.length) * Math.PI * 2;
          const cxr = Math.cos(a) * 175 + (random(`cx${i}`) - 0.5) * 40, cyr = BY - 160 + Math.sin(a) * 92 + (random(`cy${i}`) - 0.5) * 30;
          return <ellipse key={i} cx={cxr} cy={cyr} rx={96 + 30 * random(`cr${i}`)} ry={70 + 24 * random(`cq${i}`)} fill="#0A0F0D" />;
        })}
        <ellipse cx={0} cy={BY - 165} rx={185} ry={104} fill="#0B100E" />
        {new Array(15).fill(0).map((_, i) => {
          const a = random(`la${i}`) * Math.PI * 2, rr = 0.62 + 0.45 * random(`lr${i}`);
          const lx = Math.cos(a) * 230 * rr, ly = BY - 175 + Math.sin(a) * 118 * rr;
          const rot = (random(`lo${i}`) - 0.5) * 120 + sway * 2 * Math.sin(t * 1.2 + i);
          const sc = 0.62 + 0.4 * random(`ls${i}`);
          return (
            <g key={i} transform={`translate(${lx} ${ly}) rotate(${rot}) scale(${sc})`}>
              <path d={LEAF} fill={i % 3 ? '#0C1612' : '#102019'} stroke="#8FB38A" strokeOpacity={0.1 + 0.2 * DUSK(t)} strokeWidth={1.6} />
            </g>
          );
        })}
        {/* figs */}
        {FIGS.map(([fx, fy], i) => {
          const arrive = MILK[i];
          const glow = ramp(t, arrive, arrive + 0.9, EASE.out);
          const pulse = clamp(1 - (t - arrive) / 1.2);
          return (
            <g key={i}>
              <path d={`M ${fx} ${fy - 22} L ${fx} ${fy - 8}`} stroke="#0A0F0D" strokeWidth={4} />
              <g transform={`translate(${fx} ${fy})`}>
                {glow > 0 ? <circle r={44} fill={`url(#${u}-halo)`} opacity={0.55 * glow} /> : null}
                <path d="M 0 -18 C 15 -18 19 5 9 22 C 5 31 -5 31 -9 22 C -19 5 -15 -18 0 -18 Z" fill={mixc('#2C1A33', '#7A5A72', glow)} />
                <ellipse cx={-4} cy={-4} rx={3} ry={7} fill="#E8D9E6" opacity={0.2 + 0.4 * glow} />
                {pulse > 0 && t > arrive ? <circle r={14 + 36 * (1 - pulse)} fill="none" stroke="#FFF1CC" strokeWidth={2} opacity={0.7 * pulse} /> : null}
              </g>
            </g>
          );
        })}
      </g>
      {/* the milk: a light that travels from the roots through the trunk to each fig */}
      {FIGS.map(([fx, fy], i) => {
        const arrive = MILK[i], depart = arrive - 2.3;
        const p = (t - depart) / (arrive - depart);
        if (p <= 0 || p >= 1.02) return null;
        const q = EASE.inOut(clamp(p));
        const P0 = [i % 2 ? 52 : -70, i % 2 ? 250 : 230];
        const at = (qq: number) => {
          const a = clamp(qq / 0.5), b = clamp((qq - 0.5) / 0.5);
          if (qq < 0.5) return bez(P0, [P0[0] * 0.3, 90], [0, 40], [0, -20 - 190 * a], a);
          return bez([0, -20 - 190], [0, BY - 40], [fx * 0.5, BY - 70 + (fy - BY) * 0.3], [fx, fy - 20], b);
        };
        const trail = [0, 0.03, 0.06, 0.09, 0.13, 0.18].map((dq) => at(clamp(q - dq)));
        return (
          <g key={i} opacity={clamp(p * 4) * (1 - ramp(p, 0.96, 1.02))}>
            {trail.map((pt, k) => (
              <circle key={k} cx={pt[0]} cy={pt[1]} r={9 - k * 1.2} fill="#FFF3D2" opacity={0.85 - k * 0.13} />
            ))}
            <circle cx={trail[0][0]} cy={trail[0][1]} r={22} fill={`url(#${u}-halo)`} opacity={0.6} />
          </g>
        );
      })}
    </g>
  );
};
const mixc = mix;

/* ------------------------------------------------------------------ the house, its lit window and the room inside */
const WIN = {w: 150, h: 170, y: 1235};
const Room: React.FC<{t: number; u: string}> = ({t, u}) => {
  const swing = 5.5 * Math.sin((2 * Math.PI * t) / 3.4);
  const fl = 0.9 + 0.1 * Math.sin(t * 9.1) * Math.sin(t * 5.3 + 1);
  return (
    <g>
      <rect x={0} y={0} width={900} height={1020} fill={`url(#${u}-wall)`} />
      <ellipse cx={130} cy={420} rx={620} ry={560} fill={`url(#${u}-lamp)`} opacity={0.55 * fl} />
      {/* floor and rug */}
      <rect x={0} y={880} width={900} height={140} fill="#20120C" />
      <rect x={110} y={900} width={680} height={90} rx={8} fill="#5B2328" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} x={110 + 20 + i * 96} y={904} width={34} height={82} fill={i % 2 ? '#C98F4C' : '#2B3A5E'} opacity={0.8} />
      ))}
      {/* beam */}
      <rect x={0} y={32} width={900} height={52} fill="#1C0F09" />
      <rect x={0} y={32} width={900} height={6} fill="#6A4126" opacity={0.7} />
      {/* shelf with a milk jug */}
      <rect x={650} y={600} width={230} height={16} fill="#2A170E" />
      <path d="M 730 600 C 722 560 726 520 744 500 C 750 486 764 486 770 500 C 790 520 794 560 786 600 Z" fill="#E9E0CC" />
      <path d="M 736 596 C 732 560 734 530 748 508" stroke="#FFFFFF" strokeWidth={5} fill="none" opacity={0.5} />
      <path d="M 786 540 C 818 536 824 576 790 584" stroke="#E9E0CC" strokeWidth={9} fill="none" />
      <rect x={742} y={482} width={26} height={10} rx={4} fill="#CDBFA6" />
      {/* hanging lamp */}
      <line x1={130} y1={84} x2={130} y2={322} stroke="#3A2A1B" strokeWidth={5} />
      <path d="M 100 340 L 160 340 L 152 400 C 146 416 114 416 108 400 Z" fill="#E4B65E" opacity={0.9} />
      <rect x={96} y={322} width={68} height={20} rx={5} fill="#3A2A1B" />
      <ellipse cx={130} cy={386} rx={34 * fl} ry={50 * fl} fill={`url(#${u}-flame)`} />
      <ellipse cx={130} cy={392} rx={11} ry={24} fill="#FFFBE8" opacity={0.95} />
      {/* the cradle, hanging from the beam and swinging */}
      <g transform={`rotate(${swing} 450 84)`}>
        <line x1={300} y1={84} x2={262} y2={566} stroke="#9A6E44" strokeWidth={9} />
        <line x1={600} y1={84} x2={638} y2={566} stroke="#9A6E44" strokeWidth={9} />
        <ellipse cx={450} cy={620} rx={230} ry={150} fill={`url(#${u}-baby)`} opacity={0.55 + 0.1 * Math.sin(t * 2)} />
        <path d="M 236 520 C 232 560 236 600 244 640 L 280 640 L 270 540 Z" fill="#5A331C" />
        <path d="M 664 520 C 668 560 664 600 656 640 L 620 640 L 630 540 Z" fill="#5A331C" />
        <path d="M 236 560 C 244 700 340 762 450 762 C 560 762 656 700 664 560 Z" fill="#4A2A18" />
        <path d="M 236 560 C 244 700 340 762 450 762 C 560 762 656 700 664 560" fill="none" stroke="#B9824A" strokeWidth={5} opacity={0.8} />
        {[300, 360, 420, 480, 540, 600].map((x, i) => (
          <path key={i} d={`M ${x} 566 C ${x + (x < 450 ? -6 : 6)} 650 ${x + (x < 450 ? 8 : -8)} 720 ${x < 450 ? x + 40 : x - 40} 752`} fill="none" stroke="#2E190E" strokeWidth={4} opacity={0.7} />
        ))}
        <ellipse cx={450} cy={560} rx={214} ry={34} fill="#2A150C" />
        <ellipse cx={450} cy={560} rx={214} ry={34} fill="none" stroke="#C99860" strokeWidth={5} opacity={0.9} />
        {/* the little one, a light under a blanket */}
        <ellipse cx={450} cy={566} rx={150} ry={34} fill={`url(#${u}-core)`} opacity={0.9} />
        <path d="M 304 566 C 340 520 560 520 596 566 C 560 596 340 596 304 566 Z" fill="#8E3D4A" opacity={0.95} />
        <path d="M 330 560 C 380 534 520 534 570 560" stroke="#F2D9A8" strokeWidth={6} fill="none" opacity={0.7} />
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={360 + i * 45} cy={556 - 6 * Math.sin((i / 4) * Math.PI)} r={7} fill="#F2D9A8" opacity={0.75} />
        ))}
      </g>
    </g>
  );
};

const House: React.FC<{t: number; u: string; x: number}> = ({t, u, x}) => {
  const g = groundY(x);
  const lit = 0.85 + 0.15 * Math.sin(t * 7.3) * Math.sin(t * 3.7);
  const wy = WIN.y, wx = x - WIN.w / 2;
  const night = 1 - DUSK(t);
  return (
    <g>
      {/* walls */}
      <path d={`M ${x - 290} ${g + 6} L ${x - 290} ${g - 330} L ${x + 290} ${g - 330} L ${x + 290} ${g + 6} Z`} fill="#0B0A12" />
      <path d={`M ${x - 306} ${g - 330} L ${x + 306} ${g - 330} L ${x + 306} ${g - 352} L ${x - 306} ${g - 352} Z`} fill="#0D0C16" />
      <path d={`M ${x - 306} ${g - 352} L ${x + 306} ${g - 352}`} stroke={RIM} strokeOpacity={0.03 + 0.4 * DUSK(t)} strokeWidth={3} />
      {/* door */}
      <path d={`M ${x - 244} ${g + 6} L ${x - 244} ${g - 190} Q ${x - 204} ${g - 236} ${x - 164} ${g - 190} L ${x - 164} ${g + 6} Z`} fill="#050509" />
      <path d={`M ${x - 244} ${g - 190} Q ${x - 204} ${g - 236} ${x - 164} ${g - 190}`} stroke="#2A1D14" strokeWidth={4} fill="none" />
      {/* dark window */}
      <rect x={x + 150} y={wy - 66} width={74} height={110} fill="#05050A" />
      {/* the lit window: a halo, the frame, and the room (drawn at 900 x 1020 units, scaled into the frame) */}
      <ellipse cx={x} cy={wy} rx={300} ry={260} fill={`url(#${u}-halo)`} opacity={0.22 * lit * (0.5 + 0.5 * night)} />
      <rect x={wx - 14} y={wy - WIN.h / 2 - 14} width={WIN.w + 28} height={WIN.h + 28} fill="#26160D" />
      <clipPath id={`${u}-wclip`}>
        <rect x={wx} y={wy - WIN.h / 2} width={WIN.w} height={WIN.h} />
      </clipPath>
      <g clipPath={`url(#${u}-wclip)`}>
        <g transform={`translate(${wx} ${wy - WIN.h / 2}) scale(${WIN.w / 900} ${WIN.h / 1020})`}>
          <Room t={t} u={u} />
        </g>
      </g>
      <rect x={wx} y={wy - WIN.h / 2} width={WIN.w} height={WIN.h} fill="none" stroke="#1A0E08" strokeWidth={3} />
      <rect x={wx - 22} y={wy + WIN.h / 2 + 14} width={WIN.w + 44} height={12} fill="#201209" />
    </g>
  );
};

/* ------------------------------------------------------------------ the answer: a wing of light lowered over a small flame */
const FEATHERS = 9;
const Wing: React.FC<{t: number; u: string; x: number}> = ({t, u, x}) => {
  const g = groundY(x);
  const P = WING(t);
  const f = FLAME(t);
  const childX = x - 190, childY = g - 110;
  const parX = x + 170, parY = g - 32;
  const shelter = EASE.inOut(P);
  // Feather angles: raised (fanned up and back) -> lowered (reaching forward over the small flame)
  const feathers = new Array(FEATHERS).fill(0).map((_, k) => {
    const q = k / (FEATHERS - 1);
    const up = -118 + q * 78; // raised fan
    const down = -26 + q * 40; // lowered fan, arches over the flame
    const a = up + (down - up) * shelter;
    const L = 230 + 130 * Math.sin(q * Math.PI * 0.8 + 0.3) + 12 * Math.sin(t * 1.2 + k);
    return {a, L, wdt: 38 + 16 * Math.sin(q * 3), q};
  });
  const flick = 0.07 * (1 - shelter) * Math.sin(t * 13) + 0.04 * (1 - shelter) * Math.sin(t * 21);
  const If = f + flick;
  return (
    <g>
      <ellipse cx={x} cy={g + 12} rx={640} ry={52} fill={`url(#${u}-halo)`} opacity={0.14} />
      {/* ground details */}
      {[-300, -90, 40, 330, 150, -420].map((dx, i) => (
        <ellipse key={i} cx={x + dx} cy={g + 14 + (i % 3) * 8} rx={14 + (i % 4) * 7} ry={6 + (i % 3) * 2} fill="#0A0B12" />
      ))}
      {/* the small flame (the parents) */}
      <ellipse cx={parX} cy={g + 6} rx={150 * If} ry={16 * If} fill={`url(#${u}-halo)`} opacity={0.5} />
      <circle cx={parX} cy={parY} r={120 * (0.5 + 0.7 * If)} fill={`url(#${u}-halo)`} opacity={clamp(If * 1.1)} />
      <ellipse cx={parX} cy={parY} rx={9 + 8 * If} ry={15 + 14 * If} fill={`url(#${u}-flame)`} />
      <ellipse cx={parX} cy={parY + 4} rx={4 + 3 * If} ry={9 + 8 * If} fill="#FFFBE8" />
      {/* the grown light (the child) and its wing */}
      <circle cx={childX} cy={childY} r={250} fill={`url(#${u}-halo)`} opacity={0.75} />
      <g transform={`translate(${childX + 14} ${childY - 6})`}>
        {feathers.map((fe, i) => (
          <g key={i} transform={`rotate(${fe.a})`}>
            <path d={`M 0 0 C ${fe.L * 0.25} ${-fe.wdt} ${fe.L * 0.72} ${-fe.wdt * 0.8 + fe.L * 0.08} ${fe.L} ${fe.L * 0.13} C ${fe.L * 0.76} ${fe.wdt * 0.6 + fe.L * 0.07} ${fe.L * 0.26} ${fe.wdt * 0.8} 0 0 Z`} fill={`url(#${u}-feather)`} opacity={0.62} />
            <path d={`M 0 0 C ${fe.L * 0.3} -2 ${fe.L * 0.7} ${fe.L * 0.04} ${fe.L} ${fe.L * 0.13}`} stroke="#FFF1CC" strokeWidth={1.6} fill="none" opacity={0.5} />
          </g>
        ))}
      </g>
      <circle cx={childX} cy={childY} r={28} fill={`url(#${u}-core)`} />
      {/* mercy given back: sparks that drift from under the wing to the flame once it is lowered */}
      {new Array(9).fill(0).map((_, i) => {
        const ph = ((t * 0.35 + i / 9) % 1 + 1) % 1;
        const sx = lerp2(childX + 140, parX - 20, ph), sy = lerp2(childY + 20, parY - 20, ph) - 50 * Math.sin(ph * Math.PI);
        return <circle key={i} cx={sx} cy={sy} r={3.5} fill="#FFF1CC" opacity={shelter * 0.8 * Math.sin(ph * Math.PI)} />;
      })}
    </g>
  );
};
const lerp2 = (a: number, b: number, p: number) => a + (b - a) * p;

/* ------------------------------------------------------------------ the wide shot: three lights of one mercy */
const Beams: React.FC<{t: number; u: string}> = ({t, u}) => {
  const p = ramp(t, 29.4, 31.4, EASE.out) * (1 - 0.5 * ramp(t, 40, 46));
  if (p <= 0.002) return null;
  const widen = ramp(t, 29.6, 33.5, EASE.inOut) * (1 - 0.45 * ramp(t, 40, 46));
  const H = 1250;
  return (
    <g>
      <ellipse cx={1500} cy={1290} rx={2500 * (0.4 + 0.6 * widen)} ry={150 + 700 * widen} fill={`url(#${u}-halo)`} opacity={0.55 * widen} />
      {[X.LION - 30, X.FIG, X.HOUSE].map((bx, i) => {
        const g = groundY(bx);
        return (
          <g key={i}>
            <circle cx={bx} cy={g - 40} r={120 + 40 * Math.sin(t * 2 + i)} fill={`url(#${u}-halo)`} opacity={0.55 * p} />
            {new Array(26).fill(0).map((_, k) => {
              const ph = (((t - 29.4) * (0.07 + 0.06 * random(`mv${i}${k}`)) + random(`mp${i}${k}`)) % 1 + 1) % 1;
              const x = bx + (random(`mx${i}${k}`) - 0.5) * 220 * (0.35 + ph) + 24 * Math.sin(ph * 7 + k);
              const y = g - 40 - ph * H;
              return <circle key={k} cx={x} cy={y} r={4 + 8 * random(`mr${i}${k}`) * Math.sin(ph * Math.PI)} fill="#FFE9B8" opacity={p * 0.9 * Math.sin(ph * Math.PI) ** 0.8} />;
            })}
          </g>
        );
      })}
    </g>
  );
};

/* ------------------------------------------------------------------ the whole world as a pure function of t */
export const World: React.FC<{t: number; uid: string}> = ({t, uid}) => {
  const u = uid;
  const z = ZOOM(t), cx = CX(t), cy = CY(t);
  const d = DUSK(t);
  const night = 1 - d;
  const lx = X.LION - 200, ly = groundY(lx);
  const ls = 0.82;
  const cubX = 880, cubY = groundY(cubX);
  const meatX = MEAT_X(t) + 0, meatY = groundY(meatX) + 2;
  const hd = HEAD(t);
  const rim = 0.12 + 0.5 * d;
  const horizon = mix('#3A2237', '#E0884A', d);
  const glowOp = 0.35 + 0.5 * d;
  const star = clamp(night * 1.2) * 0.95;
  return (
    <AbsoluteFill style={{background: C.night950}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id={`${u}-sky`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1380">
            <stop offset="0" stopColor={mix('#02040A', '#161C42', d)} />
            <stop offset="0.5" stopColor={mix('#070C1B', '#4A3358', d)} />
            <stop offset="0.82" stopColor={mix('#14183D', '#B8625A', d)} />
            <stop offset="1" stopColor={horizon} />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={1080} height={1920} fill={`url(#${u}-sky)`} />
      </svg>
      <Stars t={t} n={200} seed="e22" maxY={1200} opacity={star} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id={`${u}-far`} gradientUnits="userSpaceOnUse" x1="0" y1="1200" x2="0" y2="1700">
            <stop offset="0" stopColor={mix('#14192F', '#4A2F46', d)} />
            <stop offset="1" stopColor="#0B0C18" />
          </linearGradient>
          <linearGradient id={`${u}-mid`} gradientUnits="userSpaceOnUse" x1="0" y1="1260" x2="0" y2="1800">
            <stop offset="0" stopColor={mix('#0E1222', '#2C1E33', d)} />
            <stop offset="1" stopColor="#080910" />
          </linearGradient>
          <linearGradient id={`${u}-near`} gradientUnits="userSpaceOnUse" x1="0" y1="1400" x2="0" y2="1950">
            <stop offset="0" stopColor={mix('#0F0F18', '#241824', d)} />
            <stop offset="1" stopColor="#040509" />
          </linearGradient>
          <radialGradient id={`${u}-halo`}>
            <stop offset="0" stopColor="#FFE9B8" stopOpacity="0.85" />
            <stop offset="0.2" stopColor="#F3C77A" stopOpacity="0.42" />
            <stop offset="0.55" stopColor="#E29A55" stopOpacity="0.12" />
            <stop offset="1" stopColor="#E29A55" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${u}-core`}>
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.5" stopColor="#FFF0C8" />
            <stop offset="1" stopColor="#F3DDA2" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${u}-flame`}>
            <stop offset="0" stopColor="#FFF4CF" />
            <stop offset="0.45" stopColor="#FFC25E" />
            <stop offset="1" stopColor="#E2603A" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${u}-lamp`}>
            <stop offset="0" stopColor="#FFC66E" stopOpacity="0.9" />
            <stop offset="0.5" stopColor="#E0894A" stopOpacity="0.35" />
            <stop offset="1" stopColor="#E0894A" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${u}-baby`}>
            <stop offset="0" stopColor="#FFF4D6" stopOpacity="0.95" />
            <stop offset="0.4" stopColor="#F6C985" stopOpacity="0.4" />
            <stop offset="1" stopColor="#F6C985" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${u}-wall`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3B2216" />
            <stop offset="1" stopColor="#1A0E0A" />
          </linearGradient>
          <linearGradient id={`${u}-soil`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2A1B13" />
            <stop offset="1" stopColor="#0C0807" />
          </linearGradient>
          <linearGradient id={`${u}-thread`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1080" y2="0">
            <stop offset="0" stopColor="#F3DDA2" />
            <stop offset="1" stopColor="#FFE9B8" />
          </linearGradient>
          <linearGradient id={`${u}-beam`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#FFE2A0" stopOpacity="0.5" />
            <stop offset="1" stopColor="#FFE2A0" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${u}-feather`} gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FFF1CC" stopOpacity="0.95" />
            <stop offset="1" stopColor="#E6C377" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {/* horizon glow and the setting sun (screen space, hardly moves) */}
        <ellipse cx={740} cy={1250} rx={760} ry={190} fill={`url(#${u}-halo)`} opacity={glowOp * d} />
        <circle cx={760} cy={1262} r={72} fill="#FFC27A" opacity={0.85 * d * d} />
        <g transform={cam(z, cx, cy, 0.25)}>
          <path d={duneD(FAR)} fill={`url(#${u}-far)`} />
        </g>
        <g transform={cam(z, cx, cy, 0.5)}>
          <path d={duneD(MID)} fill={`url(#${u}-mid)`} />
          {[-120, 160, 690, 1300, 1870, 2400, 3050, 3500, 4100].map((ax, i) => (
            <Acacia key={i} x={ax} s={0.62 + 0.3 * random(`ac${i}`)} />
          ))}
        </g>
        <g transform={cam(z, cx, cy, 1)}>
          <path d={duneD(NEAR)} fill={`url(#${u}-near)`} />
          {/* the lion: starving, with a meal she has won */}
          <Thread t={t} at={THREADS.lion} a={[lx + 130 * ls, ly - 100 * ls]} b={[cubX - 120 * 0.46, cubY - 66]} id={`${u}-thread`} bow={-60} />
          <Meat x={meatX} y={meatY} eaten={MEAT_EATEN(t)} />
          <Feline id="lioness" x={lx} y={ly} s={ls} head={hd} t={t} rim={rim} />
          <Feline id="cub" x={cubX + CUB_UP(t) * 0} y={cubY} s={0.44 + 0.04 * CUB_UP(t)} head={CUB_HEAD(t)} t={t} cub flip rim={rim} />
          <Fig t={t} u={u} x={X.FIG} />
          <House t={t} u={u} x={X.HOUSE} />
          <Wing t={t} u={u} x={X.WING} />
          <Beams t={t} u={u} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

void kf;
