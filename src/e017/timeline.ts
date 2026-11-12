import {FPS} from '../brand/tokens';
import {EASE, clamp, lerp, ramp} from '../lib/anim';

/** E017 · The Two Rats (Said Nursi, The Words, 8th Word). No narration; 100 BPM grid, one beat = 0.6 s. */
export const BEAT = 0.6;
export const EP_SECONDS = 82.2; // 137 beats
export const OUTRO_SECONDS = 3;
export const EP_FRAMES = Math.round(EP_SECONDS * FPS);
export const TOTAL_FRAMES = EP_FRAMES + OUTRO_SECONDS * FPS; // 2556
export const LOOP_SECONDS = TOTAL_FRAMES / FPS; // 85.2

export const T = {
  hookOut: 3.0,
  wide: 3.0, // pull back: an empty well, a tree, two rats
  run: 4.2, // a man runs from a lion
  jump: 6.0,
  caught: 7.2, // he catches the tree
  lion: 9.6,
  dragon: 11.7,
  rats: 13.8,
  you: 16.2, // this is not a fairy tale
  map: 19.8, // the well → the tree → white → black → lion → dragon
  mapTree: 22.2,
  mapWhite: 24.6,
  mapBlack: 27.0,
  mapLion: 29.4,
  mapDragon: 31.8,
  faster: 34.2,
  stop: 39.6, // two brothers, the same well twice
  first: 45.6,
  second: 55.2,
  link: 57.9,
  call: 65.4,
  door: 67.2,
  horse: 71.4,
  lesson: 75.6,
  faith: 79.2,
  home: 81.3,
  end: EP_SECONDS,
} as const;

/** Day/night flips: [time, 1 = day | 0 = night]. The white rat gnaws by day, the black one by night. */
const FLIPS: [number, number][] = [[-99, 1], [11.7, 0], [13.8, 1], [15.0, 0], [16.2, 1], [20.4, 0], [21.6, 1], [23.0, 0], [24.6, 1], [27.0, 0], [29.4, 1], [30.6, 0], [31.8, 1], [33.0, 0]];
{
  let t: number = T.faster;
  let s = 1;
  const steps = [0.6, 0.6, 0.5, 0.5, 0.45, 0.4, 0.4, 0.35, 0.35, 0.3, 0.3, 0.3]; // never faster than ~3 Hz (no strobing)
  for (const d of steps) {
    FLIPS.push([t, s]);
    s = 1 - s;
    t += d;
  }
}
/** 0 = night … 1 = day, smoothed so the sky never snaps (single-well part, t < T.stop). */
export const dayAt = (t: number): number => {
  if (t >= T.stop) return 0.5;
  let i = 0;
  for (let k = 0; k < FLIPS.length; k++) if (t >= FLIPS[k][0]) i = k;
  const cur = FLIPS[i][1];
  const prev = i > 0 ? FLIPS[i - 1][1] : cur;
  const next = i + 1 < FLIPS.length ? FLIPS[i + 1][0] : T.stop;
  const w = Math.min(0.24, (next - FLIPS[i][0]) * 0.45);
  const d = lerp(prev, cur, ramp(t, FLIPS[i][0], FLIPS[i][0] + w, EASE.inOut));
  // as the flips speed up, the swing between day and night narrows: it reads as speed, not as a strobe
  const soft = t > T.faster ? 0.5 + (d - 0.5) * lerp(1, 0.5, ramp(t, T.faster, T.stop)) : d;
  return t > T.stop - 0.4 ? lerp(soft, 0.5, ramp(t, T.stop - 0.4, T.stop)) : soft;
};
/** How far the rats have eaten through the roots (0..1). */
export const notchAt = (t: number): number => {
  if (t < T.hookOut) return 0.12;
  if (t < T.faster) return lerp(0.12, 0.5, (t - T.hookOut) / (T.faster - T.hookOut));
  return lerp(0.5, 0.92, EASE.inOut(clamp((t - T.faster) / (T.stop - T.faster))));
};

/** The man (a point of light): runs along the ground, jumps, falls, catches the tree. */
export const manAt = (t: number): {x?: number; y?: number; on: number; hang: number} => {
  if (t < T.run) return {on: 0, hang: 0};
  if (t < T.jump) {
    const u = (t - T.run) / (T.jump - T.run);
    return {x: lerp(-30, 470, u), y: 266 - 14 * Math.abs(Math.sin(u * Math.PI * 7)), on: ramp(t, T.run, T.run + 0.25), hang: 0};
  }
  if (t < T.caught) {
    const u = (t - T.jump) / (T.caught - T.jump);
    return {x: lerp(470, 585, clamp(u * 1.8)), y: lerp(266, 1012, u * u) - 90 * Math.sin(Math.PI * clamp(u * 2.2)), on: 1, hang: 0};
  }
  return {on: 1, hang: ramp(t, T.caught, T.caught + 0.2)};
};
/** The lion: chases along the ground, then settles at the rim. */
export const lionAt = (t: number): {x: number; run: number} => {
  if (t < T.run + 0.25) return {x: -420, run: 1};
  if (t < T.caught + 0.4) {
    const u = EASE.out(clamp((t - T.run - 0.25) / (T.caught + 0.4 - T.run - 0.25)));
    return {x: lerp(-420, 150, u), run: 1 - ramp(t, T.caught - 0.3, T.caught + 0.4, EASE.inOut)};
  }
  return {x: 150, run: 0};
};

export interface Cam {k: number; fx: number; fy: number; ax: number; ay: number}
export const CLOSE: Cam = {k: 2.5, fx: 348, fy: 925, ax: 540, ay: 1190};
export const WIDE: Cam = {k: 1, fx: 540, fy: 960, ax: 540, ay: 960};
const ROOTS: Cam = {k: 1.55, fx: 350, fy: 930, ax: 540, ay: 1120};
const mix = (a: Cam, b: Cam, p: number): Cam => ({k: lerp(a.k, b.k, p), fx: lerp(a.fx, b.fx, p), fy: lerp(a.fy, b.fy, p), ax: lerp(a.ax, b.ax, p), ay: lerp(a.ay, b.ay, p)});
export const camAt = (t: number): Cam => {
  // the hook pushes in from the first frame (movement in the first half second), then the camera pulls back
  if (t < T.wide) return {...CLOSE, k: CLOSE.k * (1 + 0.1 * EASE.out(clamp(t / T.wide)))};
  if (t < T.rats) {
    const c = mix({...CLOSE, k: CLOSE.k * 1.1}, WIDE, ramp(t, T.wide, T.wide + 2.0, EASE.camera));
    const up = ramp(t, T.lion - 0.2, T.lion + 0.7, EASE.inOut) * (1 - ramp(t, T.dragon - 0.5, T.dragon + 0.3, EASE.inOut));
    const dn = ramp(t, T.dragon - 0.2, T.dragon + 0.7, EASE.inOut) * (1 - ramp(t, T.rats - 0.5, T.rats, EASE.inOut));
    return {...c, ay: c.ay + 110 * up - 150 * dn, ax: c.ax + 90 * up, k: c.k * (1 + 0.16 * up + 0.12 * dn)};
  }
  if (t < T.map) return mix(mix(WIDE, ROOTS, ramp(t, T.rats, T.rats + 1.0, EASE.camera)), WIDE, ramp(t, T.you, T.you + 0.9, EASE.camera));
  if (t < T.faster) return WIDE;
  return mix(WIDE, ROOTS, 0.75 * ramp(t, T.faster, T.stop, EASE.inOut));
};
export const camCss = (c: Cam) => ({transformOrigin: '0 0', transform: `translate(${c.ax - c.fx * c.k}px, ${c.ay - c.fy * c.k}px) scale(${c.k})`});
export const toScreen = (c: Cam, x: number, y: number): [number, number] => [c.ax + (x - c.fx) * c.k, c.ay + (y - c.fy) * c.k];

/** The two-wells layout (from T.stop): each column shows world x 140–840 at scale COL.k. */
export const COL = {w: 538, top: 440, k: 0.769, wx0: 140} as const;
