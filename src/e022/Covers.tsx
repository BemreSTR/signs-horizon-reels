import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../brand/tokens';
import {Grain, Vignette} from '../components/Atmosphere';
import {Watermark} from '../brandkit/BrandKit';
import '../lib/fonts';
import {Line} from '../e016/Text';
import {Scene} from './E022';

const S = 99; // all words are in by then
const TOP = 'linear-gradient(180deg, rgba(5,7,12,0.9) 0%, rgba(5,7,12,0.78) 26%, rgba(5,7,12,0) 48%)';

const Shot: React.FC<{t: number; uid: string; children: React.ReactNode}> = ({t, uid, children}) => (
  <AbsoluteFill style={{background: C.night950, overflow: 'hidden'}}>
    <Scene t={t} uid={uid} />
    <AbsoluteFill style={{background: TOP}} />
    {children}
    <Vignette strength={0.4} />
    <Grain opacity={0.09} />
    <Watermark opacity={0.4} />
  </AbsoluteFill>
);

/** t picks the moment of the film used as the picture: 4.6 = the cub eats, 18.6 = milk in the figs, 58.0 = the wing over the flame. */
export const E022Cover1: React.FC = () => (
  <Shot t={4.6} uid="c1">
    <Line t={S} at={0} text="SHE WAS" y={280} cap={165} />
    <Line t={S} at={0} text="STARVING." y={440} cap={165} />
    <Line t={S} at={0} text="SHE GAVE IT AWAY." y={600} cap={110} color={C.gold300} />
  </Shot>
);

export const E022Cover2: React.FC = () => (
  <Shot t={18.6} uid="c2">
    <Line t={S} at={0} text="A FIG TREE" y={280} cap={165} />
    <Line t={S} at={0} text="NURSES" y={440} cap={165} />
    <Line t={S} at={0} text="ITS FRUIT." y={600} cap={190} color={C.gold300} />
  </Shot>
);

export const E022Cover3: React.FC = () => (
  <Shot t={58.0} uid="c3">
    <Line t={S} at={0} text="“LOWER THE WING" y={290} cap={110} />
    <Line t={S} at={0} text="OF MERCY" y={410} cap={150} />
    <Line t={S} at={0} text="TO YOUR PARENTS.”" y={560} cap={110} color={C.gold300} />
  </Shot>
);
