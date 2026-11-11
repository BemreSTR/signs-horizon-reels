import {random} from 'remotion';

export interface Seg {x0: number; y0: number; x1: number; y1: number; cx: number; cy: number; depth: number; d0: number; len: number; parent: number}
export interface Tip {x: number; y: number; d: number; order: number; sprout: number}

const MAXD = 6;
export const ROOT = {x: 540, y: 1430} as const;
const CROWN_TOP = 660;
const HALF_W = 385;

const qlen = (s: {x0: number; y0: number; x1: number; y1: number; cx: number; cy: number}) => {
  let L = 0;
  let px = s.x0;
  let py = s.y0;
  for (let i = 1; i <= 8; i++) {
    const u = i / 8;
    const x = (1 - u) * (1 - u) * s.x0 + 2 * (1 - u) * u * s.cx + u * u * s.x1;
    const y = (1 - u) * (1 - u) * s.y0 + 2 * (1 - u) * u * s.cy + u * u * s.y1;
    L += Math.hypot(x - px, y - py);
    px = x;
    py = y;
  }
  return L;
};

const build = () => {
  const segs: Seg[] = [];
  const tipIdx: number[] = [];
  const rec = (x: number, y: number, ang: number, len: number, depth: number, parent: number, key: string) => {
    const x1 = x + len * Math.cos(ang);
    const y1 = y + len * Math.sin(ang);
    const bend = (random(`tb${key}`) - 0.5) * len * 0.3;
    const idx = segs.length;
    segs.push({x0: x, y0: y, x1, y1, cx: (x + x1) / 2 - Math.sin(ang) * bend, cy: (y + y1) / 2 + Math.cos(ang) * bend, depth, d0: 0, len: 0, parent});
    if (depth >= MAXD) {
      tipIdx.push(idx);
      return;
    }
    const spreads = depth < 2 ? [-0.66, 0.04, 0.7] : [-0.44, 0.42];
    spreads.forEach((sp, j) => {
      const a = ang + sp * (0.78 + 0.5 * random(`ta${key}${j}`)) + (random(`tj${key}${j}`) - 0.5) * 0.12;
      rec(x1, y1, a, len * (0.69 + 0.13 * random(`tl${key}${j}`)), depth + 1, idx, `${key}${j}`);
    });
  };
  rec(0, 0, -Math.PI / 2, 1, 0, -1, 'r');
  // fit the crown into the frame: root stays at ROOT
  let maxX = 0;
  let minY = 0;
  for (const s of segs) {
    maxX = Math.max(maxX, Math.abs(s.x1), Math.abs(s.cx));
    minY = Math.min(minY, s.y1, s.cy);
  }
  const sx = HALF_W / maxX;
  const sy = (ROOT.y - CROWN_TOP) / -minY;
  for (const s of segs) {
    s.x0 = ROOT.x + s.x0 * sx;
    s.x1 = ROOT.x + s.x1 * sx;
    s.cx = ROOT.x + s.cx * sx;
    s.y0 = ROOT.y + s.y0 * sy;
    s.y1 = ROOT.y + s.y1 * sy;
    s.cy = ROOT.y + s.cy * sy;
    s.len = qlen(s);
  }
  segs.forEach((s) => {
    s.d0 = s.parent < 0 ? 0 : segs[s.parent].d0 + segs[s.parent].len;
  });
  const maxD = Math.max(...segs.map((s) => s.d0 + s.len));
  // fruits: pop order is shuffled; sprout order starts near the top centre (the one the viewer is taught with)
  const raw = tipIdx.map((i) => ({x: segs[i].x1, y: segs[i].y1, d: segs[i].d0 + segs[i].len}));
  const pop = raw.map((_, i) => i).sort((a, b) => random(`po${a}`) - random(`po${b}`));
  const first = raw.map((_, i) => i).sort((a, b) => Math.hypot(raw[a].x - 540, raw[a].y - 760) - Math.hypot(raw[b].x - 540, raw[b].y - 760))[0];
  const spr = raw.map((_, i) => i).sort((a, b) => (a === first ? -1 : b === first ? 1 : random(`so${a}`) - random(`so${b}`)));
  const tips: Tip[] = raw.map((r, i) => ({...r, order: pop.indexOf(i), sprout: spr.indexOf(i)}));
  return {segs, tips, maxD};
};

export const TREE = build();
export const N_FRUIT = TREE.tips.length;
export const segPath = (s: Seg) => `M${s.x0.toFixed(1)},${s.y0.toFixed(1)} Q${s.cx.toFixed(1)},${s.cy.toFixed(1)} ${s.x1.toFixed(1)},${s.y1.toFixed(1)}`;

/** A little tree of its own (roots, trunk, branches) around a fruit hanging at (0,0). Longest sub-path ~ 70 units. */
export const miniTree = (seed: string) => {
  const j = (k: string, a: number) => (random(`${seed}${k}`) - 0.5) * a;
  const m = random(`${seed}m`) < 0.5 ? -1 : 1;
  const bx = j('bx', 14);
  const by = 92 + j('by', 16);
  const fx = j('fx', 6);
  const fy = 26 + j('fy', 8);
  const P = (x: number, y: number) => `${(m * x).toFixed(1)},${y.toFixed(1)}`;
  return [
    `M${P(bx, by)} Q${P(bx + 9, by - 34)} ${P(fx, fy)}`,
    `M${P(fx, fy)} Q${P(fx - 4, 12)} ${P(0, 0)}`,
    `M${P(fx, fy)} Q${P(-22 + j('a', 8), 18)} ${P(-38 + j('b', 10), -8 + j('c', 10))}`,
    `M${P(fx, fy)} Q${P(20 + j('d', 8), 16)} ${P(34 + j('e', 10), -14 + j('f', 10))}`,
    `M${P(-38, -8)} L${P(-56 + j('g', 8), -30 + j('h', 8))}`,
    `M${P(-38, -8)} L${P(-30 + j('i', 8), -36 + j('k', 8))}`,
    `M${P(34, -14)} L${P(52 + j('l', 8), -34 + j('n', 8))}`,
    `M${P(34, -14)} L${P(22 + j('o', 8), -40 + j('p', 8))}`,
    `M${P(bx, by)} L${P(bx - 22 + j('q', 6), by + 15)}`,
    `M${P(bx, by)} L${P(bx + 20 + j('r', 6), by + 17)}`,
    `M${P(bx, by)} L${P(bx + 2, by + 24)}`,
  ].join(' ');
};
export const MINI_L = 74;
