import {FPS} from '../brand/tokens';
import {EASE, clamp, lerp, ramp} from '../lib/anim';

/** E017 · The Two Rats (Said Nursi, The Words, 8th Word). No narration; 100 BPM grid, one beat = 0.6 s. */
export const BEAT = 0.6;
export const EP_SECONDS = 57.0; // 95 beats
export const OUTRO_SECONDS = 3;
export const EP_FRAMES = Math.round(EP_SECONDS * FPS);
export const TOTAL_FRAMES = EP_FRAMES + OUTRO_SECONDS * FPS; // 1800
export const LOOP_SECONDS = TOTAL_FRAMES / FPS; // 60

export const T = {
  hookOut: 3.0,
  wide: 3.0, // pull back: the whole well
  lion: 9.0,
  dragon: 12.0,
  rats: 15.0,
  white: 18.6,
  black: 21.0,
  map: 24.0, // tree → lion → dragon → you
  mapLion: 26.4,
  mapDragon: 28.2,
  mapYou: 30.6,
  faster: 32.4,
  stop: 37.8, // Nursi: two brothers
  terror: 40.2,
  again: 42.0,
  horse: 43.8,
  door: 45.6,
  verse: 48.0,
  home: 55.8, // back to the opening close-up
  end: EP_SECONDS,
} as const;

/** Day/night flips: [time, 1 = day | 0 = night]. The white rat gnaws by day, the black one by night. */
const FLIPS: [number, number][] = [[-99, 1], [12.0, 0], [15.0, 1], [16.2, 0], [17.4, 1], [21.0, 0], [23.4, 1], [24.6, 0], [25.8, 1], [27.0, 0], [28.2, 1], [29.4, 0], [30.6, 1], [31.8, 0]];
{
  let t = T.faster;
  let s = 1;
  const steps = [0.6, 0.6, 0.5, 0.5, 0.45, 0.4, 0.4, 0.35, 0.35, 0.3, 0.3, 0.3]; // never faster than ~3 Hz (no strobing)
  for (const d of steps) {
    FLIPS.push([t, s]);
    s = 1 - s;
    t += d;
  }
}
/** 0 = night … 1 = day, smoothed so the sky never snaps. */
export const dayAt = (t: number): number => {
  if (t >= T.stop) {
    if (t < T.terror) return lerp(0.5, 0, ramp(t, T.terror - 0.5, T.terror, EASE.inOut));
    if (t < T.again) return 0;
    return ramp(t, T.again, T.again + 1.6, EASE.inOut);
  }
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
/** How far the rats have eaten through the roots (0..1). Resets, unseen, under the verse. */
export const notchAt = (t: number): number => {
  if (t < T.hookOut) return 0.12;
  if (t < T.faster) return lerp(0.12, 0.5, (t - T.hookOut) / (T.faster - T.hookOut));
  if (t < T.stop) return lerp(0.5, 0.92, EASE.inOut(clamp((t - T.faster) / (T.stop - T.faster))));
  if (t < T.verse + 2.5) return 0.92;
  return 0.12;
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
    const c = mix({...CLOSE, k: CLOSE.k * 1.1}, WIDE, ramp(t, T.wide, T.wide + 2.4, EASE.camera));
    const up = ramp(t, T.lion - 0.3, T.lion + 0.6, EASE.inOut) * (1 - ramp(t, T.dragon - 0.6, T.dragon + 0.3, EASE.inOut));
    const dn = ramp(t, T.dragon - 0.3, T.dragon + 0.6, EASE.inOut) * (1 - ramp(t, T.rats - 0.6, T.rats, EASE.inOut));
    return {...c, ay: c.ay + 70 * up - 90 * dn, k: c.k * (1 + 0.05 * (up + dn))};
  }
  if (t < T.map) return mix(mix(WIDE, ROOTS, ramp(t, T.rats, T.rats + 1.2, EASE.camera)), WIDE, ramp(t, T.map - 0.9, T.map, EASE.camera));
  if (t < T.faster) return WIDE;
  if (t < T.stop) return mix(WIDE, ROOTS, 0.75 * ramp(t, T.faster, T.stop, EASE.inOut));
  if (t < T.home) return mix(mix(WIDE, ROOTS, 0.75), WIDE, ramp(t, T.stop, T.stop + 1.0, EASE.camera));
  return mix(WIDE, CLOSE, ramp(t, T.home, T.end, EASE.inOut));
};
export const camCss = (c: Cam) => ({transformOrigin: '0 0', transform: `translate(${c.ax - c.fx * c.k}px, ${c.ay - c.fy * c.k}px) scale(${c.k})`});
export const toScreen = (c: Cam, x: number, y: number): [number, number] => [c.ax + (x - c.fx) * c.k, c.ay + (y - c.fy) * c.k];
