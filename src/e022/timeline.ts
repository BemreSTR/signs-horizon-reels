import {FPS} from '../brand/tokens';
import {EASE, lerp} from '../lib/anim';
import {kf, punch} from '../e020/timeline';

export {kf, punch};

/**
 * E022 · The Lion Who Gave Away Her Meal (Said Nursi, Sözler, Onuncu Söz, İkinci Hakikat + Qur'an 17:24).
 * No narration: 120 BPM grid, one beat = 0.5 s. Every scene value is a pure function of t; t < 0 is the loop pre-roll.
 */
export const BEAT = 0.5;
export const EP_SECONDS = 67.0; // 134 beats
export const OUTRO_SECONDS = 3;
export const EP_FRAMES = Math.round(EP_SECONDS * FPS); // 2010
export const TOTAL_FRAMES = EP_FRAMES + OUTRO_SECONDS * FPS; // 2100
export const LOOP_SECONDS = TOTAL_FRAMES / FPS; // 70.0

/** World x of the four tableaux (the camera travels along them). */
export const X = {LION: 500, FIG: 1580, HOUSE: 2660, WING: 3760} as const;
export const GROUND = 1420;

/** Segment starts (s). */
export const T = {
  hookOut: 5.0,
  nudge: 2.9, // she pushes the meat to the cub (2.9 - 4.2)
  cubEats: 4.2,
  lionQ: 5.0,
  figPan: 13.0,
  figQ: 15.0,
  housePan: 20.0,
  windowIn: 21.6,
  mothersQ: 22.0,
  wide: 28.0,
  wideQ: 28.5,
  actQ: 31.5,
  lens: 37.5,
  wingPan: 44.5,
  bridge: 46.5,
  verseA: 49.3,
  verseB: 55.2,
  close: 62.0,
  end: EP_SECONDS,
} as const;

/** Rings of light (the audio mirrors this list): a slow heartbeat of the hook, then one ring per gift. amp = 0..1 */
export const GIFTS: {t: number; x: number; y: number; amp: number}[] = []; // filled by the world (positions); times mirrored in audio

/** Light threads of mercy: gift times (audio mirrors these). */
export const THREADS = {lion: 4.0, fig: 17.0, house: 24.5};
/** Fig: milk drops reach the figs at these times (the audio mirrors them). */
export const MILK = [17.2, 17.9, 18.5, 19.1, 19.6, 20.0] as const;

/** Camera: world centre, anchored at screen (540, 1250); zoom is interpolated in log space. */
export const CX = (t: number) =>
  kf(
    t,
    [
      [-5, X.LION], [12.8, X.LION + 20], [14.9, X.FIG], [20.0, X.FIG + 22], [21.6, X.HOUSE], [23.4, X.HOUSE],
      [28.0, X.HOUSE], [30.6, 1500], [44.5, 1500], [47.0, X.WING], [67.0, X.WING],
    ],
    EASE.inOut,
  );
export const CY = (t: number) =>
  kf(
    t,
    [[-5, 1250], [20.0, 1250], [21.6, 1250], [23.4, 1222], [28.0, 1222], [30.6, 1180], [44.5, 1180], [47.0, 1250], [67.0, 1250]],
    EASE.inOut,
  );
const LZ = (z: number) => Math.log(z);
export const ZOOM = (t: number) =>
  Math.exp(
    kf(
      t,
      [
        [-3, LZ(0.956)], [5, LZ(1.0735)], [12.8, LZ(1.12)], [14.9, LZ(1.0)], [20.0, LZ(1.06)], [21.6, LZ(1.0)], [23.4, LZ(6.0)],
        [28.0, LZ(6.0)], [30.6, LZ(0.35)], [44.5, LZ(0.35)], [47.0, LZ(1.0)], [67.0, LZ(1.06)],
      ],
      EASE.inOut,
    ),
  );

/** 1 = golden dusk, 0 = night. */
export const DUSK = (t: number) =>
  kf(t, [[-5, 1], [12.0, 1], [19.0, 0.55], [23.0, 0.12], [30.0, 0.1], [44.0, 0.04], [67.0, 0.04]], EASE.inOut);

/** Lioness (local degrees: + = nose down) and the cub. */
export const HEAD = (t: number) =>
  kf(t, [[-5, 11], [2.5, 11], [3.1, 30], [3.7, 30], [4.3, -3], [12, -6], [67, -6]], EASE.inOut) + (t < 2.4 ? 1.6 * Math.sin(t * 1.9) : 0);
export const MEAT_X = (t: number) => kf(t, [[2.9, 640], [4.2, 690]], EASE.inOut);
export const MEAT_EATEN = (t: number) => kf(t, [[4.4, 0], [12.5, 0.62]], EASE.linear);
export const CUB_HEAD = (t: number) => (t < 4.2 ? 26 + 1.5 * Math.sin(t * 2.3) : 34 + 5 * Math.sin((t - 4.2) * 9.5));
export const CUB_UP = (t: number) => kf(t, [[3.8, 0], [4.6, 1]], EASE.out);

/** Light of the hook / lion scene. */
export const lerpN = lerp;

/** Qur'an 17:24: the wing lowers over the small flame (0 raised → 1 lowered). */
export const WING = (t: number) => kf(t, [[49.3, 0], [53.3, 1]], EASE.inOut);
export const FLAME = (t: number) => kf(t, [[46, 0.28], [54.0, 0.32], [58.5, 0.85], [62, 0.9]], EASE.inOut);
