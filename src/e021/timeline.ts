import {FPS} from '../brand/tokens';
import {EASE} from '../lib/anim';
import {kf, punch} from '../e020/timeline';

export {kf, punch};

/**
 * E021 · She Wished to Be Forgotten (Maryam, Qur'an 3:42 and 19:16–26). No narration: 120 BPM grid, one beat = 0.5 s.
 * Every scene value is a pure function of t; t < 0 is the loop pre-roll (the 3 s outro runs Scene(t - LOOP_SECONDS)).
 */
export const BEAT = 0.5;
export const EP_SECONDS = 67.0; // 134 beats
export const OUTRO_SECONDS = 3;
export const EP_FRAMES = Math.round(EP_SECONDS * FPS); // 2010
export const TOTAL_FRAMES = EP_FRAMES + OUTRO_SECONDS * FPS; // 2100
export const LOOP_SECONDS = TOTAL_FRAMES / FPS; // 70.0

/** Segment starts (s). */
export const T = {
  hookOut: 5.0,
  chosen: 5.0, // 3:42
  withdraw: 11.5, // 19:16
  screen: 15.0, // 19:17
  afraid: 18.5, // 19:17–21
  easy: 28.0,
  carry: 30.5, // 19:22
  labor: 34.5, // 19:23
  wish: 39.0,
  grieve: 46.0, // 19:24–26
  shake: 49.5,
  eat: 52.25,
  lens: 54.5,
  close: 63.0,
  home: 62.5, // the camera starts back to the opening pose
  end: EP_SECONDS,
} as const;

/** Contractions: light pulses (the audio mirrors these times). */
export const PULSES = [36.0, 37.2, 38.2, 39.0] as const;
/** Palm pushes (the trunk is shaken), then the dates fall one by one. */
export const SHAKES = [49.5, 50.0, 50.5] as const;
export const FALLS = [50.5, 50.7, 50.95, 51.15, 51.4, 51.65, 51.9, 52.2] as const;
export const FALL_G = 2300; // px/s²

/** Ring births (the soft pings in the audio come from the same list). amp = 0..1 */
export const RINGS: {t: number; amp: number}[] = [
  ...[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((t) => ({t, amp: 0.5})),
  ...[5, 6, 7, 8, 9, 10, 11].map((t) => ({t, amp: 0.7})),
  ...[13, 15.5, 17.5].map((t) => ({t, amp: 0.3})),
  {t: 28.0, amp: 0.8},
  {t: 36.0, amp: 0.5},
  ...PULSES.slice(1).map((t) => ({t: t + 0.05, amp: 0.45})),
  {t: 47.0, amp: 0.8},
  {t: 52.5, amp: 0.6},
  ...[63, 64, 65, 66].map((t) => ({t, amp: 0.5})),
];

export const LIGHT_I = (t: number) =>
  kf(
    t,
    [
      [-5, 1], [4.5, 1], [6, 1.3], [11, 1.3], [13, 1], [18.5, 1], [19, 0.75], [23, 0.75], [24, 0.95], [27.5, 0.95],
      [28, 1.25], [30.5, 1.1], [32, 0.85], [36, 0.85], [38.5, 0.9], [40.5, 0.25], [42, 0.15], [45.5, 0.18], [48.5, 0.95],
      [54, 1.05], [62.5, 1.05], [66.95, 1.0],
    ],
    EASE.inOut,
  );

/** Flicker (the visitor, 19:17–18) and contractions (19:23) on top of the base light. */
export const LIGHT_MOD = (t: number) => {
  const fear = t > 19.0 && t < 23.4 ? Math.min(1, (t - 19.0) / 0.4) * Math.min(1, (23.4 - t) / 0.6) : 0;
  const flick = fear * (0.1 * Math.sin(t * 11) + 0.07 * Math.sin(t * 17 + 1));
  let pulse = 0;
  for (const p of PULSES) pulse += 0.35 * Math.exp(-(((t - p) / 0.22) ** 2));
  return flick + pulse;
};

/** Scroll of the world (px at zoom 1) and the camera zoom; both end where they begin so the loop closes. */
export const SCROLL = (t: number) =>
  kf(t, [[11.5, 0], [18.5, 520], [30.5, 560], [36, 1170], [62.5, 1190], [66.95, 0]], EASE.inOut);
export const ZOOM = (t: number) =>
  kf(
    t,
    [[-3, 0.956], [5, 1.0735], [11.5, 1.1], [13, 1.0], [30.5, 1.0], [32.5, 0.92], [35.5, 0.92], [38.5, 1.45], [45.5, 1.5], [54, 1.4], [62.5, 1.2], [66.95, 0.956]],
    EASE.linear,
  );
export const LIGHT_X = (t: number) => kf(t, [[34, 540], [36.5, 720], [62.5, 720], [66.95, 540]], EASE.inOut);
export const LIGHT_Y = (t: number) =>
  kf(t, [[5, 1390], [8.5, 1305], [11.5, 1305], [13.5, 1385], [34, 1385], [36.5, 1380], [62.5, 1380], [66.95, 1390]], EASE.inOut);
export const PIVOT_Y = 1390;
