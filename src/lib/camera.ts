import {EASE, ramp, smooth} from './anim';

/** Passage world (units are arbitrary "metres"): a 1,186-unit road (3,600 days) ending at an open door. */
export const CAM_STOP = 1186;
export const DOOR_Z = 1200;
export const RUN_START = 15.55;
export const RUN_END = 19.95;
export const PULL_FROM = 32.6;
export const PULL_TO = 37.4;
export const PULL = 10;
export const GATE_EVERY = 120; // one year gate every 120 units (≈ 360 days)
export const MONTH_EVERY = 10;

/** Forward run (before the pull-back); the lone light stays 9 units ahead of this. */
export const runZ = (t: number) => CAM_STOP * smooth((t - RUN_START) / (RUN_END - RUN_START));
export const camZ = (t: number) => runZ(t) - PULL * ramp(t, PULL_FROM, PULL_TO, EASE.inOut);
export const speed = (t: number) => (runZ(t + 1 / 60) - runZ(t - 1 / 60)) * 30;
/** The counter reaches 3,600 as "days" is spoken (19.42 s); the road keeps gliding the last few units. */
const LOCK_T = 19.42;
export const dayOf = (t: number) => Math.max(1, Math.min(3600, Math.round((3600 * runZ(t)) / runZ(LOCK_T))));
