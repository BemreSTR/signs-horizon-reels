import {FPS} from '../brand/tokens';
import {EASE, clamp, lerp, ramp} from '../lib/anim';
import {kf} from '../e018/timeline';

/**
 * E019 · She Who Disputes (Qur'an 58:1). Narrated: the clock is the voice (public/ep/e019/words.json, ElevenLabs word times).
 * Every scene value is a pure function of t; t < 0 is the loop pre-roll (the 3 s outro runs Scene(t - LOOP_SECONDS)).
 */
export const VOICE_END = 71.745;
export const EP_SECONDS = 72.6;
export const OUTRO_SECONDS = 3;
export const EP_FRAMES = Math.round(EP_SECONDS * FPS); // 2178
export const TOTAL_FRAMES = EP_FRAMES + OUTRO_SECONDS * FPS; // 2268
export const LOOP_SECONDS = TOTAL_FRAMES / FPS; // 75.6

/** Word starts (s) taken from the narration SRT. */
export const T = {
  hookOut: 4.35,
  chapterLine: 2.403, // "A chapter was named after her."
  medina: 4.5,
  khawla: 5.46,
  anger: 7.027,
  quote: 9.835, // "you are to me like my mother's back"
  custom: 12.539, // the trap
  notDivorced: 15.856,
  notWife: 17.358,
  nowhere: 18.612,
  reports: 19.984,
  limboEnd: 23.8,
  went: 24.059,
  muhammad: 24.542,
  fear: 26.41,
  cousin: 28.735,
  noRev: 29.936,
  notLeave: 31.726,
  turned: 32.98,
  aisha: 35.056,
  heard: 38.348,
  verseSay: 40.294,
  verse: 41.704,
  verseEnd: 48.797,
  wrong: 48.993,
  atone: 52.153,
  free: 53.904,
  fast: 54.896,
  feed: 55.902,
  chapter: 57.796,
  disputes: 59.847,
  reported: 61.296,
  versesAre: 62.916,
  queen: 64.744,
  scholar: 66.051,
  woman: 67.331,
  kept: 70.021,
  home: 64.7, // from here the camera comes back to the opening pose
} as const;

export const L0 = {x: 540, y: 1090}; // the street's vanishing point, where she begins and where the loop returns
const DOORFOOT = {x: 790, y: 1262};

/** The light that is Khawla (position in world coordinates). */
export const lightPos = (t: number) => {
  const f = kf(t, [[T.went + 0.1, 0], [T.went + 2.0, 1], [34.95, 1], [35.3, 0]], EASE.inOut);
  return {x: lerp(L0.x, DOORFOOT.x, f), y: lerp(L0.y, DOORFOOT.y, f)};
};
/** Perspective size: nearer = bigger. */
export const lightScale = (t: number) => 1 + (lightPos(t).y - L0.y) / 190;
/** Brightness: dimmed in limbo, rises when she turns to Allah. */
export const glowAt = (t: number) => kf(t, [[0, 1], [12.5, 0.95], [23.8, 0.5], [26, 0.56], [31.7, 0.56], [33.2, 0.95], [34.9, 1], [72.6, 1]]);

/** Camera: world point F is shown at screen point P with zoom z. */
export const camAt = (t: number) => {
  const z = kf(t, [[0, 1.0], [12.5, 1.17], [23.8, 1.33], [26, 1.4], [31.7, 1.46], [35, 1.5], [35.3, 1.0], [40.3, 1.0], [49, 1.05], [57.7, 1.02], [T.home, 1.0], [EP_SECONDS, 1.0]], EASE.inOut);
  const lp = lightPos(t);
  const sky = ramp(t, 35.3, 35.31);
  const fx = lerp(lp.x, 540, sky);
  const fyStreet = lp.y;
  const fySky = kf(t, [[40.3, 700], [49, 660], [57.7, 760], [T.home, 820], [EP_SECONDS, L0.y]], EASE.inOut);
  const fy = t < 35.3 ? fyStreet : fySky;
  const py = kf(t, [[0, L0.y], [35, L0.y], [35.3, 1060], [57, 1060], [EP_SECONDS, L0.y]], EASE.inOut);
  return {z, fx, fy, py};
};

/** Rings of sound leave the light. Emission stops in limbo and returns when she turns to Allah. */
export const emitAt = (t: number) => kf(t, [[0, 1], [12.0, 0.85], [13.6, 0], [32.9, 0], [34.4, 1], [57.7, 0.9], [T.home, 1], [EP_SECONDS, 1]], EASE.linear);
export const RING = {v: 95, gap: 150, max: 1500};
/** One-off, faster rings (the complaint reaches Allah; the verse; the chapter's name; the loop). */
export const PULSES = [T.turned, T.heard, T.verse, T.wrong, T.chapter, T.disputes, T.kept];

/** The grey chain: his sentence closes around her; the Qur'an calls his words "a wrong and a falsehood" and it breaks. */
export const chainAt = (t: number) => {
  const on = ramp(t, T.custom, T.custom + 0.9, EASE.out) * (1 - ramp(t, T.wrong + 1.2, T.wrong + 1.9));
  const R = t < T.limboEnd ? kf(t, [[T.custom, 330], [T.limboEnd, 54]], EASE.inOut) : 54 + 2.4 * Math.sin(t * 2.2);
  const shatter = clamp((t - T.wrong) / 1.6);
  return {on, R, shatter};
};

/** Stars lean toward the light: the sky is listening. */
export const leanAt = (t: number) => kf(t, [[0, 0], [39.0, 0], [41.7, 1.6], [49, 1.6], [57.7, 0.6], [68, 0], [EP_SECONDS, 0]], EASE.inOut);

/** The room (Aisha is in the corner; she cannot catch every word). */
export const roomAt = (t: number) => ramp(t, 34.7, 35.05, EASE.inOut) * (1 - ramp(t, 39.45, 40.2, EASE.inOut));

/** The door glows when she arrives; the doorway is never a person. */
export const doorAt = (t: number) => ramp(t, T.limboEnd, T.went + 2.0, EASE.inOut) * (1 - ramp(t, 35.0, 35.3));

/** Three steps of atonement as three lights rising into the sky (screen coordinates). */
export const STEPS = [
  {t: T.free, x: 390, y: 1060},
  {t: T.fast, x: 540, y: 910},
  {t: T.feed, x: 690, y: 760},
];
export const stepVis = (t: number, i: number) => ramp(t, STEPS[i].t - 0.1, STEPS[i].t + 0.5, EASE.out) * (1 - ramp(t, 62.2, 63.6));
