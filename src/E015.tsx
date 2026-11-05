import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useCurrentFrame} from 'remotion';
import {C, FPS, H} from './brand/tokens';
import {Captions} from './components/Captions';
import {Glow, Grain, Vignette} from './components/Atmosphere';
import {Outro, veil} from './brandkit/Outro';
import {Watermark} from './brandkit/BrandKit';
import {EASE, ramp} from './lib/anim';
import {EPISODE_FRAMES, TOTAL_FRAMES} from './lib/data';
import './lib/fonts';
import {Desk, SEAL} from './scenes/Desk';
import {Mecca} from './scenes/Mecca';
import {Passage} from './scenes/Passage';

// Scene boundaries sit in the pauses of the narration (docs/10 §3).
const T_TILT_UP: [number, number] = [3.95, 4.75]; // desk -> Mecca night (camera tilts up)
const T_LEAK: [number, number] = [14.35, 14.95]; // Mecca -> the road (light leak)
const T_TILT_DOWN: [number, number] = [41.8, 42.6]; // door -> back to the desk (camera tilts down)

/** Captions are closed while the same words are shown large (H19). */
const CAPTION_OFF: [number, number][] = [
  [0, 0.95],
  [28.2, 32.75], // I accept your faith. / The door was wide open.
  [36.05, 41.95], // never walked through it. / the honest lens
];

const bell = (p: number) => Math.sin(Math.PI * p);

export const E015: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const loopT = (frame - TOTAL_FRAMES) / FPS; // negative: time left until frame 0 of the next loop
  const wm = 0.36;

  if (frame >= EPISODE_FRAMES) {
    const sting = (frame - EPISODE_FRAMES) / FPS;
    return (
      <AbsoluteFill style={{background: C.night950}}>
        <Outro t={sting} base={<Desk t={loopT} />} from={[SEAL.x, SEAL.y]} />
        <Vignette strength={0.34} />
        <Grain opacity={0.09} />
        <Watermark opacity={wm * (1 - veil(sting))} />
      </AbsoluteFill>
    );
  }

  const up = ramp(t, T_TILT_UP[0], T_TILT_UP[1], EASE.camera);
  const down = ramp(t, T_TILT_DOWN[0], T_TILT_DOWN[1], EASE.camera);
  const leak = ramp(t, T_LEAK[0], T_LEAK[1], EASE.inOut);
  const blurUp = 16 * bell(up);
  const blurDown = 16 * bell(down);

  return (
    <AbsoluteFill style={{background: C.night950, overflow: 'hidden'}}>
      {t < T_TILT_UP[1] + 0.05 ? (
        <AbsoluteFill style={{translate: `0px ${up * H}px`, filter: blurUp > 0.3 ? `blur(${blurUp}px)` : undefined}}>
          <Desk t={t} />
        </AbsoluteFill>
      ) : null}
      {t >= T_TILT_UP[0] - 0.05 && t < T_LEAK[1] + 0.05 ? (
        <AbsoluteFill style={{translate: `0px ${-(1 - up) * H}px`, filter: blurUp > 0.3 ? `blur(${blurUp}px)` : undefined}}>
          <Mecca t={t} />
        </AbsoluteFill>
      ) : null}
      {t >= T_LEAK[0] - 0.05 && t < T_TILT_DOWN[1] + 0.05 ? (
        <AbsoluteFill style={{opacity: leak, translate: `0px ${-down * H}px`, filter: blurDown > 0.3 ? `blur(${blurDown}px)` : undefined}}>
          <Passage t={t} />
        </AbsoluteFill>
      ) : null}
      {t >= T_TILT_DOWN[0] - 0.05 ? (
        <AbsoluteFill style={{translate: `0px ${(1 - down) * H}px`, filter: blurDown > 0.3 ? `blur(${blurDown}px)` : undefined}}>
          <Desk t={loopT} />
        </AbsoluteFill>
      ) : null}
      {leak > 0 && leak < 1 ? <Glow x={540} y={1102} r={900} color={C.gold300} opacity={0.5 * bell(leak)} /> : null}
      <Vignette strength={0.34} />
      <Captions t={t} off={CAPTION_OFF} />
      <Grain opacity={0.09} />
      <Watermark opacity={wm} />
    </AbsoluteFill>
  );
};
