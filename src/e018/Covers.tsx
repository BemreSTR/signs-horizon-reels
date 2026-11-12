import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../brand/tokens';
import {Grain, Vignette} from '../components/Atmosphere';
import {Watermark} from '../brandkit/BrandKit';
import '../lib/fonts';
import {Line} from '../e016/Text';
import {Scene} from './E018';

/** Covers (H75): independent compositions, 3–5 words, inside the Instagram 3:4 crop (y 240–1680), text in x 180–900. */
const S = 100;
const TOP = 'linear-gradient(180deg, rgba(5,7,12,0.88) 0%, rgba(5,7,12,0.78) 28%, rgba(5,7,12,0) 48%)';
const Shot: React.FC<{t: number; shade?: string; children: React.ReactNode}> = ({t, shade = TOP, children}) => (
  <AbsoluteFill style={{background: C.night950, overflow: 'hidden'}}>
    <Scene t={t} uid="cv" />
    <AbsoluteFill style={{background: shade}} />
    {children}
    <Vignette strength={0.42} />
    <Grain opacity={0.1} />
    <Watermark opacity={0.4} />
  </AbsoluteFill>
);

export const E018Cover1: React.FC = () => (
  <Shot t={0.3}>
    <Line t={S} at={0} text="AN ENEMY" y={290} cap={160} />
    <Line t={S} at={0} text="ON TRIAL." y={440} cap={170} color={C.gold300} />
  </Shot>
);

export const E018Cover2: React.FC = () => (
  <Shot t={62.0}>
    <Line t={S} at={0} text="FIVE ANSWERS." y={290} cap={130} />
    <Line t={S} at={0} text="ONE VERDICT." y={420} cap={130} color={C.gold300} />
  </Shot>
);

export const E018Cover3: React.FC = () => (
  <Shot t={67.0} shade="linear-gradient(180deg, rgba(5,7,12,0) 62%, rgba(5,7,12,0.7) 74%, rgba(5,7,12,0.7) 90%, rgba(5,7,12,0) 100%)">
    <Line t={S} at={0} text="THE EMPEROR’S" y={1180} cap={120} />
    <Line t={S} at={0} text="VERDICT." y={1300} cap={150} color={C.gold300} />
  </Shot>
);
