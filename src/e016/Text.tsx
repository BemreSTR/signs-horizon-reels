import React from 'react';
import {fitText} from '@remotion/layout-utils';
import {C, FONT, TEXT_COLUMN} from '../brand/tokens';
import {EASE, clamp, ramp} from '../lib/anim';

export const fit = (text: string, cap = 160, weight = '700', ls = 0.05, width: number = TEXT_COLUMN.w) =>
  Math.min(cap, fitText({text, withinWidth: width, fontFamily: 'Cormorant Garamond', fontWeight: weight, letterSpacing: `${ls}em`}).fontSize);

const SHADOW = '0 6px 36px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.7)';

/** One centred line; words arrive with a short stagger (rise + de-blur) and leave together. */
export const Line: React.FC<{
  t: number;
  at: number;
  out?: number;
  text: string;
  y: number;
  size?: number;
  cap?: number;
  color?: string;
  weight?: 500 | 600 | 700;
  italic?: boolean;
  ls?: number;
  stagger?: number;
  glow?: boolean;
  gold?: string[];
}> = ({t, at, out = 1e9, text, y, size, cap = 120, color = C.ivory, weight = 700, italic = false, ls = 0.05, stagger = 0.07, glow = false, gold = []}) => {
  if (t < at - 0.02 || t > out + 0.5) return null;
  const fs = size ?? fit(text, cap, String(weight), ls);
  const o = 1 - ramp(t, out, out + 0.36, EASE.inOut);
  const words = text.split(' ');
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: y,
        textAlign: 'center',
        whiteSpace: 'nowrap',
        fontFamily: FONT.display,
        fontWeight: weight,
        fontStyle: italic ? 'italic' : 'normal',
        fontSize: fs,
        lineHeight: 1.05,
        letterSpacing: `${ls}em`,
        opacity: o,
        translate: `0px ${-14 * (1 - o)}px`,
      }}
    >
      {words.map((w, i) => {
        const a = at + i * stagger;
        const p = ramp(t, a, a + 0.42, EASE.glide);
        const isGold = gold.includes(w.replace(/[^A-Za-z']/g, ''));
        const col = isGold ? C.gold300 : color;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              marginRight: i < words.length - 1 ? '0.26em' : 0,
              color: col,
              opacity: clamp(p * 1.6),
              translate: `0px ${(1 - p) * 26}px`,
              filter: p < 0.98 ? `blur(${(1 - p) * 7}px)` : undefined,
              textShadow: glow || isGold || col === C.gold300 ? `0 0 44px rgba(230,195,119,0.42), ${SHADOW}` : SHADOW,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

export interface ReelStep {at: number; lines: string[]; color?: string; slam?: boolean}

/**
 * A "price reel": words flick past (rise in from below, short blur) and the last step slams in.
 * Used for the hook and again for the meter at the end, so the pay-off echoes the opening.
 */
export const Reel: React.FC<{t: number; steps: ReelStep[]; y: number; cap?: number; lineGap?: number; out?: number; width?: number}> = ({t, steps, y, cap = 150, lineGap = 1.04, out = 1e9, width = TEXT_COLUMN.w}) => {
  let idx = -1;
  for (let i = 0; i < steps.length; i++) if (t >= steps[i].at) idx = i;
  if (idx < 0 || t > out + 0.5) return null;
  const s = steps[idx];
  const dt = t - s.at;
  const o = 1 - ramp(t, out, out + 0.36, EASE.inOut);
  const p = s.slam ? ramp(dt, 0, 0.2, EASE.out) : ramp(dt, 0, 0.11, EASE.out);
  const scale = s.slam ? 1.45 - 0.45 * p : 1;
  const dy = s.slam ? 0 : (1 - p) * 54;
  const blur = s.slam ? (1 - p) * 10 : (1 - p) * 12;
  const col = s.color ?? C.gold300;
  let top = 0;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, opacity: o, translate: `0px ${dy - 14 * (1 - o)}px`, scale: String(scale), transformOrigin: '50% 40%', filter: blur > 0.4 ? `blur(${blur}px)` : undefined}}>
      {s.lines.map((ln, i) => {
        const fs = fit(ln, cap, '700', 0.05, width);
        const el = (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top,
              textAlign: 'center',
              whiteSpace: 'nowrap',
              fontFamily: FONT.display,
              fontWeight: 700,
              fontSize: fs,
              lineHeight: 1,
              letterSpacing: '0.05em',
              color: col,
              opacity: clamp(p * 2),
              textShadow: `0 0 50px rgba(230,195,119,${s.slam ? 0.55 : 0.3}), ${SHADOW}`,
            }}
          >
            {ln}
          </div>
        );
        top += fs * lineGap;
        return el;
      })}
    </div>
  );
};

/** Small mono label. */
export const Chip: React.FC<{t: number; at: number; out?: number; text: string; y: number; size?: number; color?: string}> = ({t, at, out = 1e9, text, y, size = 26, color = C.mist}) => {
  const o = ramp(t, at, at + 0.4, EASE.out) * (1 - ramp(t, out, out + 0.36, EASE.inOut));
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: FONT.mono, fontWeight: 500, fontSize: size, letterSpacing: '0.16em', color, opacity: o, textShadow: '0 2px 12px rgba(0,0,0,0.9)'}}>
      {text}
    </div>
  );
};
