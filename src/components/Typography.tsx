import React from 'react';
import {C, FONT} from '../brand/tokens';
import {EASE, ramp} from '../lib/anim';

export interface ArabicStyle {at: number; color: string}

/**
 * One line of Arabic (words come from verse.json only, H81). Each word is revealed right-to-left by a soft ink mask
 * starting at its own `at` (seconds on the same clock as `t`). No glitch, shake or colour shift on verse text.
 */
export const ArabicLine: React.FC<{
  t: number;
  words: string[];
  styles: ArabicStyle[];
  size: number;
  inkSeconds?: number;
  style?: React.CSSProperties;
}> = ({t, words, styles, size, inkSeconds = 0.9, style}) => (
  <div
    dir="rtl"
    lang="ar"
    style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      columnGap: size * 0.3,
      fontFamily: FONT.quran,
      fontSize: size,
      lineHeight: 1.9,
      textAlign: 'center',
      color: C.ivory,
      ...style,
    }}
  >
    {words.map((w, i) => {
      const s = styles[i] ?? {at: 0, color: C.ivory};
      const p = ramp(t, s.at, s.at + inkSeconds, EASE.glide);
      const o = ramp(t, s.at, s.at + 0.22, EASE.out);
      return (
        <span
          key={i}
          style={{
            display: 'inline-block',
            padding: `${size * 0.36}px ${size * 0.14}px`,
            margin: `${-size * 0.36}px ${-size * 0.14}px`,
            color: s.color,
            opacity: o,
            clipPath: `inset(-30% -12% -30% ${(1 - p) * 112 - 12}%)`,
          }}
        >
          {w}
        </span>
      );
    })}
  </div>
);

/** Small mono reference chip (künye). */
export const RefChip: React.FC<{text: string; opacity?: number; size?: number}> = ({text, opacity = 1, size = 26}) => (
  <div
    style={{
      textAlign: 'center',
      fontFamily: FONT.mono,
      fontWeight: 500,
      fontSize: size,
      letterSpacing: '0.12em',
      color: C.mist,
      opacity,
      textShadow: '0 2px 12px rgba(0,0,0,0.9)',
    }}
  >
    {text}
  </div>
);
