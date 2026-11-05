import React from 'react';
import {AbsoluteFill} from 'remotion';
import {fitText} from '@remotion/layout-utils';
import {C, FONT, H, TEXT_COLUMN, W} from '../brand/tokens';
import {Grain, Vignette} from '../components/Atmosphere';
import {Watermark} from '../brandkit/BrandKit';
import '../lib/fonts';
import {Desk} from '../scenes/Desk';
import {Mecca} from '../scenes/Mecca';
import {Passage} from '../scenes/Passage';

/** Cover titles (H75): ≤ 3–5 words, inside the Instagram 3:4 crop (y 240–1680), legible at ~180x320. */
interface Line {text: string; gold?: boolean; max?: number}

const TitleBlock: React.FC<{lines: Line[]; top: number; shade?: [number, number]; gap?: number}> = ({lines, top, shade, gap = 6}) => {
  const rows = lines.map((l) => {
    const w: number = TEXT_COLUMN.w;
    const size = Math.min(l.max ?? 190, fitText({text: l.text, withinWidth: w, fontFamily: 'Cormorant Garamond', fontWeight: '700', letterSpacing: '0.06em'}).fontSize);
    return {...l, size};
  });
  return (
    <>
      {shade ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: shade[0], height: shade[1] - shade[0], background: `linear-gradient(180deg, rgba(5,7,12,0) 0%, rgba(5,7,12,0.74) 22%, rgba(5,7,12,0.74) 78%, rgba(5,7,12,0) 100%)`}} />
      ) : null}
      <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center', gap}}>
        {rows.map((r) => (
          <div
            key={r.text}
            style={{
              fontFamily: FONT.display, fontWeight: 700, fontSize: r.size, lineHeight: 1.02, letterSpacing: '0.06em', whiteSpace: 'nowrap',
              color: r.gold ? C.gold300 : C.ivory,
              textShadow: r.gold ? '0 0 46px rgba(230,195,119,0.45), 0 6px 40px rgba(0,0,0,0.95)' : '0 6px 40px rgba(0,0,0,0.95), 0 0 6px rgba(0,0,0,0.6)',
            }}
          >
            {r.text}
          </div>
        ))}
      </div>
    </>
  );
};

const Finish: React.FC = () => (
  <>
    <Vignette strength={0.42} />
    <Grain opacity={0.1} />
    <Watermark opacity={0.4} />
  </>
);

/** Kapak 1 · conflict: the cracked wax seal on basalt. */
export const Cover1: React.FC = () => (
  <AbsoluteFill style={{background: C.night950}}>
    <Desk t={4.3} />
    <TitleBlock lines={[{text: 'THE TEN-YEAR', max: 190}, {text: 'OPEN CHECK', gold: true, max: 190}]} top={310} gap={10} />
    <Finish />
  </AbsoluteFill>
);

/** Kapak 2 · hero object + big claim: the open door at the end of 3,600 days. */
export const Cover2: React.FC = () => (
  <AbsoluteFill style={{background: C.night950}}>
    <Passage t={19.55} />
    <TitleBlock lines={[{text: 'ONE SENTENCE', max: 150}, {text: 'TO DESTROY', max: 150}, {text: 'ISLAM', gold: true, max: 230}]} top={1090} shade={[1020, 1640]} />
    <Finish />
  </AbsoluteFill>
);

/** Kapak 3 · evidence + irony: 111:3 (verse.json) and the question. */
export const Cover3: React.FC = () => (
  <AbsoluteFill style={{background: C.night950}}>
    <Mecca t={11.7} />
    <TitleBlock lines={[{text: "WHY DIDN'T HE", max: 150}, {text: 'JUST LIE?', gold: true, max: 230}]} top={1180} shade={[1110, 1600]} />
    <Finish />
  </AbsoluteFill>
);
