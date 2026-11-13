import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Grain, Vignette} from '../components/Atmosphere';
import {Watermark} from '../brandkit/BrandKit';
import '../lib/fonts';
import {Scene} from './E020';

/** E020 covers: the video's own frames (same Scene, pure function of t), text inside y 240–1680 and x 180–900. */
const Cover: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Scene t={t} />
    <Vignette strength={0.2} />
    <Grain opacity={0.07} />
    <Watermark opacity={0.45} />
  </AbsoluteFill>
);

export const E020Cover1: React.FC = () => <Cover t={2.4} />; // THAT BEE / IS A SHE.
export const E020Cover2: React.FC = () => <Cover t={7.6} />; // THE MALES / DON'T FORAGE.
export const E020Cover3: React.FC = () => <Cover t={33.5} />; // the smallest worker is addressed as "you"
