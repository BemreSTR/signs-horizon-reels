import {FPS} from '../brand/tokens';
import {EASE, clamp, lerp, ramp} from '../lib/anim';

/** E020 · That Bee Is a She (Qur'an 16:68–69). No narration: 120 BPM grid, one beat = 0.5 s, every slam sits on a beat. */
export const BEAT = 0.5;
export const EP_SECONDS = 35.0; // 70 beats
export const OUTRO_SECONDS = 3;
export const EP_FRAMES = Math.round(EP_SECONDS * FPS); // 1050
export const TOTAL_FRAMES = EP_FRAMES + OUTRO_SECONDS * FPS; // 1140
export const LOOP_SECONDS = TOTAL_FRAMES / FPS; // 38.0

/** Shot starts (seconds). Cuts marked "wipe" are hex transitions centred on the time. */
export const T = {
  hook: 0.0,
  she: 1.5,
  meadow: 3.0, // wipe
  drone: 6.0,
  workers: 8.5,
  chapter: 10.5, // wipe
  verse: 14.0,
  p2: 17.0,
  p3: 20.0,
  lens: 23.0, // wipe
  honey: 28.0, // wipe
  lesson: 31.0,
  dive: 34.0,
  home: 34.8, // wipe: the dive ends in the hook's first frame
  end: EP_SECONDS,
} as const;
export const WIPE_HALF = 0.2;
export const WIPES = [T.meadow, T.chapter, T.lens, T.honey, T.home];

/** Every text/sound cue in one place (the audio script mirrors these numbers). */
export const CUE = {
  that: 0.0,
  bee: 0.5,
  isASHE: 1.5,
  heart: 2.0,
  foraging: 3.5,
  areFemale: 4.5,
  males: 6.0,
  dontForage: 7.0,
  workersL1: 8.5,
  workersL2: 9.5,
  title: 10.5,
  q1: 11.0,
  q2: 11.5,
  ph: [14.0, 17.0, 20.0],
  femLabel: [15.0, 18.0, 21.0],
  lensL1: 23.0,
  lensL2: 24.5,
  lensL3: 26.0,
  quote: 28.5,
  lessonL1: 31.0,
  lessonL2: 32.0,
  lessonL3: 33.0,
} as const;

export const kf = (t: number, pts: [number, number][], ease: (x: number) => number = EASE.inOut) => {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i][0]) {
      const [a, va] = pts[i - 1];
      const [b, vb] = pts[i];
      return lerp(va, vb, ease(clamp((t - a) / (b - a))));
    }
  }
  return pts[pts.length - 1][1];
};

/** Decaying scale kick after a slam. */
export const punch = (t: number, at: number, amp = 0.03, dur = 0.28) => (t < at ? 0 : amp * (1 - ramp(t, at, at + dur, EASE.out)));
