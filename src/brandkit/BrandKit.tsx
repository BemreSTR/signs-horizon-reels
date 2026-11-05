import React from 'react';
import {C} from '../brand/tokens';
import verseJson from '../../public/brand/verse.json';

export {Watermark, type WatermarkProps} from './Watermark';

/** Channel identity, "Signs in the Horizon" (Qur'an 41:53): one point of light rising over a curved horizon. */
export const CHANNEL = 'Signs in the Horizon';
export const SIGNS = verseJson.excerpts.signs_41_53.words;

export const Defs: React.FC<{id: string}> = ({id}) => (
  <defs>
    <radialGradient id={`${id}-night`} cx="50%" cy="58%" r="70%">
      <stop offset="0" stopColor={C.night800} />
      <stop offset="0.55" stopColor={C.night900} />
      <stop offset="1" stopColor={C.night950} />
    </radialGradient>
    <radialGradient id={`${id}-dawn`}>
      <stop offset="0" stopColor={C.desertLight} stopOpacity={0.42} />
      <stop offset="0.45" stopColor={C.gold700} stopOpacity={0.16} />
      <stop offset="1" stopColor={C.gold700} stopOpacity={0} />
    </radialGradient>
    <linearGradient id={`${id}-line`} x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stopColor={C.gold500} stopOpacity={0} />
      <stop offset="0.22" stopColor={C.gold500} stopOpacity={0.75} />
      <stop offset="0.5" stopColor={C.gold300} />
      <stop offset="0.78" stopColor={C.gold500} stopOpacity={0.75} />
      <stop offset="1" stopColor={C.gold500} stopOpacity={0} />
    </linearGradient>
    <linearGradient id={`${id}-glitter`} x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stopColor={C.gold300} stopOpacity={0.55} />
      <stop offset="1" stopColor={C.gold300} stopOpacity={0} />
    </linearGradient>
    <radialGradient id={`${id}-halo`}>
      <stop offset="0" stopColor={C.gold400} stopOpacity={0.6} />
      <stop offset="0.35" stopColor={C.gold500} stopOpacity={0.22} />
      <stop offset="1" stopColor={C.gold500} stopOpacity={0} />
    </radialGradient>
    <radialGradient id={`${id}-core`}>
      <stop offset="0" stopColor="#FFF8E6" />
      <stop offset="0.55" stopColor={C.gold300} />
      <stop offset="1" stopColor={C.gold400} />
    </radialGradient>
  </defs>
);
