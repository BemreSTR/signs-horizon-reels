import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../brand/tokens';
import {Dust, Grain, Stars, Vignette} from '../components/Atmosphere';
import {Watermark} from '../brandkit/BrandKit';
import '../lib/fonts';
import {Pomegranate} from './Pomegranate';
import {Line} from './Text';
import {TreeScene} from './TreeScene';
import {HERO} from './timeline';

/** Covers (H75): independent compositions, 3–5 words, inside the Instagram 3:4 crop (y 240–1680). */
const Finish: React.FC = () => (
  <>
    <Vignette strength={0.42} />
    <Grain opacity={0.1} />
    <Watermark opacity={0.4} />
  </>
);
const S = 100; // static clock for the text components

export const E016Cover1: React.FC = () => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse 90% 60% at 50% 60%, #1A0C12 0%, ${C.night950} 70%)`}}>
    <Stars t={0} n={90} seed="c1" maxY={700} opacity={0.5} />
    <Pomegranate x={HERO.x} y={1130} r={HERO.r} t={2} open={1} id="c1" />
    <Dust t={3} count={50} seed="c1d" color={C.gold300} opacity={0.6} area={[120, 500, 960, 1650]} />
    <Line t={S} at={0} text="WORTH THE" y={286} cap={130} />
    <Line t={S} at={0} text="WHOLE WORLD?" y={420} cap={130} color={C.gold300} />
    <Finish />
  </AbsoluteFill>
);

export const E016Cover2: React.FC = () => (
  <AbsoluteFill style={{background: C.night950}}>
    <TreeScene t={16.6} bare />
    <Line t={S} at={0} text="A THOUSAND FRUITS," y={300} cap={110} />
    <Line t={S} at={0} text="ONE ROOT." y={410} cap={170} color={C.gold300} />
    <Finish />
  </AbsoluteFill>
);

export const E016Cover3: React.FC = () => (
  <AbsoluteFill style={{background: C.night950}}>
    <TreeScene t={33.95} bare />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 34% at 50% 26%, rgba(5,7,12,0.94) 0%, rgba(5,7,12,0.8) 55%, rgba(5,7,12,0) 100%)'}} />
    <Line t={S} at={0} text="REMOVE" y={330} cap={150} />
    <Line t={S} at={0} text="THE ONE." y={476} cap={190} color={C.gold300} />
    <Finish />
  </AbsoluteFill>
);
