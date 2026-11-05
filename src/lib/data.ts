import wordsJson from '../../public/ep/e015/words.json';
import cuesJson from '../../public/ep/e015/cues.json';
import {FPS} from '../brand/tokens';

export type Word = {text: string; startMs: number; endMs: number; pageBreakAfter?: boolean};
export const WORDS = wordsJson as Word[];
const CUES = cuesJson.cues as Record<string, {ms: number; frame: number; word: string; wordIndex: number}>;

export const AUDIO_SECONDS = cuesJson.audioDurationMs / 1000;
/** Silence after the last word so the loop can breathe (docs/10 §3). */
export const LOOP_TAIL = 0.45;
export const OUTRO_SECONDS = 3;
export const EPISODE_FRAMES = Math.ceil((AUDIO_SECONDS + LOOP_TAIL) * FPS);
export const TOTAL_FRAMES = EPISODE_FRAMES + OUTRO_SECONDS * FPS;

/** Seconds of a named cue (start of its word). */
export const cue = (name: string): number => {
  const c = CUES[name];
  if (!c) throw new Error(`unknown cue ${name}`);
  return c.ms / 1000;
};
/** Start / end seconds of word i, checked against the expected text (H65). */
export const wordAt = (i: number, expected: string) => {
  const w = WORDS[i];
  if (!w || !w.text.toLowerCase().includes(expected.toLowerCase())) throw new Error(`word ${i} is "${w?.text}", expected "${expected}"`);
  return w.startMs / 1000;
};
export const wordEnd = (i: number) => WORDS[i].endMs / 1000;
