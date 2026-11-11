import {FPS} from '../brand/tokens';

/** E016 has no narration: the clock is a 100 BPM grid (one beat = 0.6 s) and every cut sits on a beat. */
export const BEAT = 0.6;
export const EP_SECONDS = 46.8; // 78 beats
export const OUTRO_SECONDS = 3;
export const EP_FRAMES = Math.round(EP_SECONDS * FPS); // 1404
export const TOTAL_FRAMES = EP_FRAMES + OUTRO_SECONDS * FPS; // 1494
export const LOOP_SECONDS = TOTAL_FRAMES / FPS; // 49.8

export const T = {
  slam: 1.2, // the price reel lands on THE WHOLE WORLD
  hookOut: 3.0,
  crack: 4.2,
  open: 4.8,
  dive: 5.4,
  tree: 7.2, // one centre
  fruits: 10.2,
  spring: 17.4, // pull back to the whole spring
  turn: 24.0, // "now remove the One"
  lightsOut: 25.8,
  sprout: 27.6, // every fruit grows its own tree
  flood: 33.0,
  world: 34.2, // the meter lands on THE WHOLE WORLD
  quote: 35.4,
  verse: 40.8,
  home: 45.9, // the pomegranate returns to its opening pose
  end: EP_SECONDS,
} as const;

export const HERO = {x: 540, y: 1160, r: 370} as const;
/** Breathing that closes exactly over one loop. */
export const breathe = (t: number) => 1 + 0.012 * Math.sin((2 * Math.PI * 12 * t) / LOOP_SECONDS);
