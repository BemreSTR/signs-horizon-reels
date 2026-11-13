import React from 'react';
import {fitText} from '@remotion/layout-utils';
import {EASE, clamp, ramp} from '../lib/anim';
import {F, K} from './tokens';

/** Font size that makes `text` as wide as `width` (capped). Anton is a one-weight face. */
export const fitA = (text: string, cap = 400, width = 720, ls = 0.01) =>
  Math.min(cap, fitText({text, withinWidth: width, fontFamily: 'Anton', fontWeight: '400', letterSpacing: `${ls}em`}).fontSize);

export const fitB = (text: string, cap = 120, width = 720, weight = '800', ls = 0.04) =>
  Math.min(cap, fitText({text, withinWidth: width, fontFamily: 'Barlow Condensed', fontWeight: weight, letterSpacing: `${ls}em`}).fontSize);

export interface SlamProps {
  t: number;
  at: number;
  out?: number;
  text: string;
  y: number;
  size: number;
  color?: string;
  slab?: string | null; // slab colour behind the text, or none
  font?: 'head' | 'sub';
  padX?: number;
  padY?: number;
  rot?: number;
  dx?: number;
  ls?: number;
  kick?: number; // initial overscale
  shadow?: boolean;
  weight?: number;
  textShadow?: string;
}

/** One line that SLAMS in on a beat: scale 1.2 → 1 in ~5 frames, the slab wipes in from the left. Leaves in 2 frames. */
export const Slam: React.FC<SlamProps> = ({t, at, out = 1e9, text, y, size, color = K.white, slab = K.ink, font = 'head', padX = 28, padY = 6, rot = 0, dx = 0, ls = 0.01, kick = 0.2, shadow = false, weight, textShadow}) => {
  if (t < at || t > out + 0.1) return null;
  const p = ramp(t, at, at + 0.17, EASE.out);
  const o = 1 - ramp(t, out, out + 0.07);
  const sc = 1 + kick * (1 - p);
  const wipe = ramp(t, at, at + 0.12, EASE.out);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateX(${dx}px) rotate(${rot}deg) scale(${sc})`, transformOrigin: '50% 60%'}}>
      <div
        style={{
          position: 'relative',
          padding: slab ? `${padY}px ${padX}px` : 0,
          background: slab ?? undefined,
          clipPath: slab ? `inset(0 ${(1 - wipe) * 100}% 0 0)` : undefined,
        }}
      >
        <div
          style={{
            whiteSpace: 'nowrap',
            fontFamily: font === 'head' ? F.head : F.sub,
            fontWeight: weight ?? (font === 'head' ? 400 : 800),
            fontSize: size,
            lineHeight: font === 'head' ? 1.08 : 1.0,
            letterSpacing: `${ls}em`,
            color,
            textShadow: textShadow ?? (shadow ? '0 4px 24px rgba(0,0,0,0.45)' : undefined),
            opacity: clamp(p * 3),
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

/** A small tracked label (chip). */
export const Tag: React.FC<{t: number; at: number; out?: number; text: string; y: number; size?: number; color?: string; slab?: string | null; ls?: number}> = ({
  t, at, out = 1e9, text, y, size = 34, color = K.white, slab = null, ls = 0.22,
}) => {
  if (t < at || t > out + 0.1) return null;
  const o = ramp(t, at, at + 0.12) * (1 - ramp(t, out, out + 0.07));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: o}}>
      <div style={{background: slab ?? undefined, padding: slab ? '6px 18px' : 0, fontFamily: F.sub, fontWeight: 700, fontSize: size, letterSpacing: `${ls}em`, paddingLeft: slab ? 18 + size * ls * 0.5 : undefined, color, whiteSpace: 'nowrap', textShadow: slab ? undefined : '0 2px 14px rgba(0,0,0,0.6)'}}>
        {text}
      </div>
    </div>
  );
};
