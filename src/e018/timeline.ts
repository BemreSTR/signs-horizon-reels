import {FPS} from '../brand/tokens';
import {EASE, clamp, lerp, ramp} from '../lib/anim';

/** E018 · The Emperor's Questions (Sahih al-Bukhari 7). No narration: 100 BPM grid, one beat = 0.6 s, every cut sits on a beat. */
export const BEAT = 0.6;
export const EP_SECONDS = 89.4; // 149 beats
export const OUTRO_SECONDS = 3;
export const EP_FRAMES = Math.round(EP_SECONDS * FPS); // 2682
export const TOTAL_FRAMES = EP_FRAMES + OUTRO_SECONDS * FPS; // 2772
export const LOOP_SECONDS = TOTAL_FRAMES / FPS; // 92.4

export const T = {
  hookOut: 3.0,
  letter: 3.0, // a letter reaches the emperor
  claim: 6.6, // the writer claims to be a prophet
  summon: 9.6, // he summons the man's fiercest enemy
  men: 13.6, // his own men stand behind him
  admit: 17.4, // "I would have lied"
  q1: 22.2,
  q2: 30.0,
  q3: 40.2,
  q4: 47.4,
  q5: 54.6,
  verdict: 64.2,
  lens: 73.8,
  finale: 81.0,
  home: 88.8,
  end: EP_SECONDS,
} as const;

/** Cue offsets (seconds from the block start) for the five questions. */
export interface QCue {
  t0: number;
  ans: number; // the witness answers
  inf: number; // the emperor's inference (not for the last question)
  out: number; // everything of this block leaves
  drop: number; // the weight starts to fall
  truce?: number; // Q2: the enemy tries to slip in a doubt
  pebble?: number;
  items?: number[]; // Q5: the commands, one by one
}
export const Q: QCue[] = [
  {t0: T.q1, ans: 1.8, inf: 2.8, drop: 3.6, out: 7.2},
  {t0: T.q2, ans: 1.8, truce: 2.8, pebble: 2.8, inf: 6.6, drop: 7.2, out: 9.6},
  {t0: T.q3, ans: 1.8, inf: 2.8, drop: 3.6, out: 6.6},
  {t0: T.q4, ans: 1.8, inf: 2.8, drop: 3.6, out: 6.6},
  {t0: T.q5, ans: 1.8, inf: 9, drop: 5.4, out: 9.0, items: [1.8, 3.6, 5.4]},
];
export const FALL = 0.4;
/** When each weight lands in the pan (absolute seconds). */
export const LANDS = Q.map((q) => q.t0 + q.drop + FALL);
export const PEBBLE = Q[1].t0 + (Q[1].pebble ?? 0) + FALL;

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

/** The scale's beam angle (radians, + = right pan down): it starts leaning to the left (a claim is presumed false) and each weight tips it a little. */
const THETA0 = -0.1;
const DELTA = 0.092;
const spring = (u: number) => (u < 0 ? 0 : 1 - Math.exp(-u / 0.2) * Math.cos((2 * Math.PI * u) / 0.8));
export const thetaAt = (t: number) => THETA0 + LANDS.reduce((a, l) => a + DELTA * spring(t - l), 0) - 0.032 * spring(t - PEBBLE);
/** How many weights have landed (smooth 0..5), for the crown's glow. */
export const evidenceAt = (t: number) => LANDS.reduce((a, l) => a + ramp(t, l, l + 0.5, EASE.out), 0);
export const scaleOn = (t: number) => ramp(t, T.q1 - 0.6, T.q1 + 0.6, EASE.out) * (1 - ramp(t, T.verdict, T.verdict + 0.8, EASE.inOut));

const S = T.q1;
/** The throne, as the stage keeps it: big at the opening, a dim backdrop behind the questions, bright for the verdict, and back to the opening pose before the loop. */
export const throneAt = (t: number) => ({
  k: kf(t, [[S - 1.2, 0.8], [S + 0.2, 0.86], [T.verdict, 0.86], [T.verdict + 1.2, 1.0], [T.lens, 1.0], [T.lens + 1.2, 0.86], [T.home - 1.2, 0.86], [T.home, 0.8]]),
  y: kf(t, [[S - 1.2, 1210], [S + 0.2, 980], [T.verdict, 980], [T.verdict + 1.2, 1120], [T.lens, 1120], [T.lens + 1.2, 980], [T.home - 1.2, 980], [T.home, 1210]]),
  op: kf(t, [[S - 1.2, 1], [S + 0.2, 0.42], [T.verdict - 1.0, 0.42], [T.verdict + 1.2, 1], [T.lens, 1], [T.lens + 1.4, 0.42], [T.finale + 0.8, 0.22], [T.home - 1.2, 0.22], [T.home, 1]]),
  hall: kf(t, [[S - 1.2, 1], [S + 0.2, 0.5], [T.verdict - 1.0, 0.5], [T.verdict + 1.2, 0.95], [T.lens, 0.95], [T.lens + 1.4, 0.5], [T.finale + 0.8, 0.3], [T.home - 1.2, 0.3], [T.home, 1]]),
});
/** The crown: its glow is the emperor's growing conviction; it lifts for the verdict and settles back when he keeps his throne. */
export const crownAt = (t: number) => {
  const ev = evidenceAt(t);
  const verdict = ramp(t, T.verdict + 0.6, T.verdict + 2.2, EASE.glide) * (1 - ramp(t, T.lens + 0.1, T.lens + 0.7, EASE.snap));
  const dip = ramp(t, T.lens + 0.7, T.lens + 1.6, EASE.out);
  const reset = ramp(t, T.home - 1.2, T.home, EASE.inOut);
  const glow = (0.4 + 0.12 * ev + 0.5 * verdict) * (1 - 0.5 * dip);
  return {glow: lerp(glow, 0.4, reset), lift: 46 * verdict};
};

/** The witness (Abu Sufyan) and the men behind him: a leader light and seven companions. */
export const MEN = 7;
export const WIT = {x: 540, hookY: 1330, qY: 1034};
export const witnessAt = (t: number) => {
  const back = ramp(t, T.home - 1.0, T.home - 0.2, EASE.inOut); // before the loop the lights return to the opening pose
  const q = kf(t, [[S - 1.2, 0], [S + 0.2, 1], [T.home - 1.2, 1], [T.home, 0]]);
  const away =
    Math.min(1, ramp(t, T.verdict - 1.0, T.verdict + 0.4, EASE.inOut) * (1 - ramp(t, T.lens + 3.0, T.lens + 3.8, EASE.inOut)) + ramp(t, T.finale + 0.2, T.finale + 1.2, EASE.inOut)) * (1 - back);
  const gold = ramp(t, T.lens + 4.2, T.lens + 5.2, EASE.inOut) * (1 - back);
  const flicker = ramp(t, T.admit, T.admit + 0.4) * (1 - ramp(t, T.admit + 2.8, T.admit + 3.6)) + 0.6 * ramp(t, Q[1].t0 + 3.0, Q[1].t0 + 3.4) * (1 - ramp(t, Q[1].t0 + 6.4, Q[1].t0 + 6.8));
  return {y: lerp(WIT.hookY, WIT.qY, q), compY: lerp(WIT.hookY + 100, WIT.qY + 54, q), away, gold, flicker};
};
/** Visibility of light i (0 = the leader) while the story is told: seen in the hook, gone while the letter travels, then the caravan files in. */
export const lightVis = (t: number, i: number) => {
  if (t < 9.6) return 1 - ramp(t, T.hookOut, T.hookOut + 0.8, EASE.inOut);
  const e = 9.7 + i * 0.26;
  return ramp(t, e, e + 0.5, EASE.out);
};
/** Where the caravan light is while it files in (progress 0..1; 1 = in place). */
export const arrival = (t: number, i: number) => (t < 9.6 ? 1 : ramp(t, 9.7 + i * 0.26, 11.3 + i * 0.26, EASE.out));

/** Slow breathing of the whole hall; the opening pushes in from frame 0 (movement in the first half second) and settles back for the loop. */
export const zoomAt = (t: number) => kf(t, [[-3, 1.0], [0, 1.022], [3.0, 1.05], [9.6, 1.0]], EASE.linear);
