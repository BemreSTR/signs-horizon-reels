import {Easing, useCurrentFrame} from 'remotion';
import {FPS} from '../brand/tokens';

export const EASE = {
  glide: Easing.bezier(0.16, 1, 0.3, 1),
  camera: Easing.bezier(0.65, 0, 0.35, 1),
  inOut: Easing.bezier(0.45, 0, 0.55, 1),
  out: Easing.bezier(0.22, 1, 0.36, 1),
  snap: Easing.bezier(0.7, 0, 0.84, 0),
  linear: (x: number) => x,
} as const;

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
/** 0 → 1 between seconds a and b (eased). */
export const ramp = (t: number, a: number, b: number, ease: (x: number) => number = EASE.linear) => ease(clamp((t - a) / (b - a)));
export const span = (t: number, a: number, b: number) => (t >= a && t < b ? 1 : 0);
export const smooth = (x: number) => {
  const c = clamp(x);
  return c * c * (3 - 2 * c);
};
/** Seconds of the current frame (global when used outside a Sequence). */
export const useTime = () => useCurrentFrame() / FPS;
