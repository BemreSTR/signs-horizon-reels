import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../brand/tokens';
import {Grain, Vignette} from '../components/Atmosphere';
import {Watermark} from '../brandkit/BrandKit';
import '../lib/fonts';
import {Line} from '../e016/Text';
import {Scene} from './E021';

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

/** t picks the moment of the film used as the picture: 7.5 = chosen, 41.5 = the light nearly out, 52.4 = the dates fall. */
export const E021Cover1: React.FC = () => (
  <Shot t={7.5} uid="c1">
    <Line t={S} at={0} text="SHE WISHED" y={280} cap={165} />
    <Line t={S} at={0} text="TO BE" y={440} cap={165} />
    <Line t={S} at={0} text="FORGOTTEN." y={600} cap={190} color={C.gold300} />
  </Shot>
);

export const E021Cover2: React.FC = () => (
  <Shot t={41.5} uid="c2">
    <Line t={S} at={0} text="HER LOWEST" y={280} cap={165} />
    <Line t={S} at={0} text="MOMENT IS IN" y={440} cap={165} />
    <Line t={S} at={0} text="THE QUR’AN." y={600} cap={190} color={C.gold300} />
  </Shot>
);

export const E021Cover3: React.FC = () => (
  <Shot t={52.4} uid="c3">
    <Line t={S} at={0} text="ALONE IN LABOR," y={290} cap={120} />
    <Line t={S} at={0} text="SHE HEARD:" y={420} cap={120} />
    <Line t={S} at={0} text="“DO NOT GRIEVE.”" y={560} cap={150} color={C.gold300} />
  </Shot>
);
