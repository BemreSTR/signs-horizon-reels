import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../brand/tokens';
import {Grain, Vignette} from '../components/Atmosphere';
import {Watermark} from '../brandkit/BrandKit';
import '../lib/fonts';
import {Line} from '../e016/Text';
import {Well, WellState} from './Well';
import {CLOSE, Cam, WIDE, camCss} from './timeline';

/** Covers (H75): independent compositions, 3–5 words, inside the Instagram 3:4 crop (y 240–1680). */
const S = 100;
const Shot: React.FC<{cam: Cam; state: Omit<WellState, 't'>; shade?: string; children: React.ReactNode}> = ({cam, state, shade, children}) => (
  <AbsoluteFill style={{background: '#090B12', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, ...camCss(cam)}}>
      <Well t={0.3} {...state} />
    </div>
    {shade ? <AbsoluteFill style={{background: shade}} /> : null}
    {children}
    <Vignette strength={0.42} />
    <Grain opacity={0.1} />
    <Watermark opacity={0.4} />
  </AbsoluteFill>
);
const TOP = 'linear-gradient(180deg, rgba(5,7,12,0.86) 0%, rgba(5,7,12,0.74) 28%, rgba(5,7,12,0) 46%)';
const base = {day: 1, notch: 0.45, active: 'white' as const, lion: 0, dragon: 0, graceL: 0, graceD: 0, you: 0, lionX: 150};

export const E017Cover1: React.FC = () => (
  <Shot cam={CLOSE} state={{...base, manOn: 0}} shade={TOP}>
    <Line t={S} at={0} text="TWO RATS." y={270} cap={170} />
    <Line t={S} at={0} text="ONE LIFE." y={430} cap={170} color={C.gold300} />
  </Shot>
);

export const E017Cover2: React.FC = () => (
  <Shot cam={{...WIDE, ay: 1000}} state={{...base, day: 0, active: 'black', lion: 1, dragon: 1}}>
    <Line t={S} at={0} text="LION ABOVE." y={470} cap={120} color={C.emberLight} />
    <Line t={S} at={0} text="DRAGON BELOW." y={1130} cap={110} color={C.emberLight} />
  </Shot>
);

export const E017Cover3: React.FC = () => (
  <Shot cam={WIDE} state={{...base, graceL: 1, graceD: 1}}>
    <Line t={S} at={0} text="THE GRAVE:" y={400} cap={120} />
    <Line t={S} at={0} text="A DOOR TO A GARDEN?" y={530} cap={110} color={C.gold300} />
  </Shot>
);
