import React from 'react';
import {C, FONT, TEXT_COLUMN} from '../brand/tokens';
import {EASE, clamp, ramp} from '../lib/anim';
import {WORDS} from '../lib/data';

type Page = {from: number; to: number; words: {text: string; s: number; e: number}[]};

/** Pages: ≤ 2 short lines, broken at sentence ends, long pauses and ~34 characters. */
const buildPages = (): Page[] => {
  const pages: Page[] = [];
  let cur: Page['words'] = [];
  let chars = 0;
  const flush = () => {
    if (cur.length) pages.push({from: cur[0].s, to: cur[cur.length - 1].e, words: cur});
    cur = [];
    chars = 0;
  };
  WORDS.forEach((w, i) => {
    const s = w.startMs / 1000;
    const e = w.endMs / 1000;
    const text = w.text.trim();
    const prevEnd = i ? WORDS[i - 1].endMs / 1000 : 0;
    if (cur.length && (chars + text.length > 34 || s - prevEnd > 0.4)) flush();
    cur.push({text, s, e});
    chars += text.length + 1;
    if (w.pageBreakAfter || /[,;]$/.test(text) && chars > 20) flush();
  });
  flush();
  return pages;
};
export const PAGES = buildPages();

/** `off` windows (seconds) hide the captions while the same words are on screen in large type (H19). */
export const Captions: React.FC<{t: number; off?: [number, number][]; top?: number}> = ({t, off = [], top = 1236}) => {
  const idx = PAGES.findIndex((p, i) => {
    const next = PAGES[i + 1];
    const end = Math.min(p.to + 0.18, next ? next.from - 0.02 : 99);
    return t >= p.from - 0.05 && t < end;
  });
  if (idx < 0) return null;
  const p = PAGES[idx];
  // touching / overlapping windows are one window: otherwise their fades cross and the captions leak at the seam
  const merged = [...off]
    .sort((x, y) => x[0] - y[0])
    .reduce<[number, number][]>((acc, w) => {
      const last = acc[acc.length - 1];
      if (last && w[0] <= last[1] + 0.2) last[1] = Math.max(last[1], w[1]);
      else acc.push([w[0], w[1]]);
      return acc;
    }, []);
  const offFade = merged.reduce((m, [a, b]) => Math.min(m, 1 - ramp(t, a, a + 0.12) * (1 - ramp(t, b - 0.12, b))), 1);
  const enter = ramp(t, p.from - 0.05, p.from + 0.1, EASE.out);
  const next = PAGES[idx + 1];
  const leave = 1 - ramp(t, Math.min(p.to + 0.1, next ? next.from - 0.04 : 99), p.to + 0.18);
  const vis = enter * leave * offFade;
  if (vis < 0.01) return null;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: top - 90,
          height: 330,
          background: 'linear-gradient(180deg, rgba(5,7,12,0) 0%, rgba(5,7,12,0.55) 38%, rgba(5,7,12,0.55) 62%, rgba(5,7,12,0) 100%)',
          opacity: vis,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: TEXT_COLUMN.x0,
          width: TEXT_COLUMN.w,
          top,
          minHeight: 150,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          fontFamily: FONT.body,
          fontWeight: 600,
          fontSize: 60,
          lineHeight: 1.18,
          textWrap: 'balance' as never,
          opacity: vis,
          translate: `0px ${(1 - enter) * 12}px`,
          textShadow: '0 3px 18px rgba(0,0,0,0.95), 0 0 3px rgba(0,0,0,0.8)',
        }}
      >
        <div>
          {p.words.map((w, i) => {
            const spoken = t >= w.s - 0.02;
            const active = t >= w.s - 0.02 && t < w.e + 0.04;
            return (
              <span key={i} style={{color: active ? C.gold300 : C.ivory, opacity: spoken ? 1 : 0.42}}>
                {w.text}
                {i < p.words.length - 1 ? ' ' : ''}
              </span>
            );
          })}
        </div>
      </div>
    </>
  );
};

export const visibleOpacity = (t: number, a: number, b: number) => clamp(ramp(t, a, a + 0.12) * (1 - ramp(t, b - 0.12, b)));
