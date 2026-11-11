import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, FPS} from '../brand/tokens';
import {Grain, Vignette} from '../components/Atmosphere';
import {Watermark} from '../brandkit/BrandKit';
import {Outro, veil} from '../brandkit/Outro';
import '../lib/fonts';
import {Ending} from './Ending';
import {Hook} from './Hook';
import {TreeScene} from './TreeScene';
import {EP_FRAMES, HERO, T, TOTAL_FRAMES} from './timeline';

/** E016 · The Pomegranate Problem. No narration: text, music and effects only. */
export const E016: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const loopT = (frame - TOTAL_FRAMES) / FPS; // negative: time left until frame 0 of the next loop
  const wm = 0.36;
  if (frame >= EP_FRAMES) {
    const sting = (frame - EP_FRAMES) / FPS;
    return (
      <AbsoluteFill style={{background: C.night950}}>
        <Outro t={sting} base={<Hook t={loopT} />} from={[HERO.x, HERO.y]} />
        <Vignette strength={0.34} />
        <Grain opacity={0.09} />
        <Watermark opacity={wm * (1 - veil(sting))} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{background: C.night950, overflow: 'hidden'}}>
      {t < T.tree ? <Hook t={t} /> : t < T.quote ? <TreeScene t={t} /> : <Ending t={t} />}
      <Vignette strength={0.34} />
      <Grain opacity={0.09} />
      <Watermark opacity={wm} />
    </AbsoluteFill>
  );
};
