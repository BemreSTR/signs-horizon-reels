import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import text from '../../public/ep/e019/text.json';
import verseData from '../../public/ep/e019/verse.json';
import wordsJson from '../../public/ep/e019/words.json';
import {C, FPS, FONT} from '../brand/tokens';
import {Dust, Grain, Vignette} from '../components/Atmosphere';
import {Captions, buildPages, CapWord} from '../components/Captions';
import {ArabicLine} from '../components/Typography';
import {Watermark} from '../brandkit/BrandKit';
import {Outro, veil} from '../brandkit/Outro';
import {EASE, ramp} from '../lib/anim';
import '../lib/fonts';
import {Chip, Line, fit} from '../e016/Text';
import {EP_FRAMES, EP_SECONDS, LOOP_SECONDS, T, TOTAL_FRAMES, L0} from './timeline';
import {World} from './World';

const PBUH = text.pbuh;
const PAGES = buildPages(wordsJson as CapWord[]);
const SILVER = '#C9CCDC';
const EMBER = C.emberLight;

/** Timed lines at one size (the longest decides): each line arrives with its own word time. */
const Lines: React.FC<{t: number; out: number; y: number; gap?: number; cap?: number; size?: number; color?: string; colors?: string[]; items: [number, string][]; weight?: 500 | 600 | 700; italic?: boolean}> = ({
  t, out, y, gap = 1.14, cap = 92, size, color = C.ivory, colors, items, weight = 700, italic = false,
}) => {
  const fs = Math.min(...items.map(([, s]) => fit(s, size ?? cap, String(weight), 0.05)));
  return (
    <>
      {items.map(([at, s], i) => (
        <Line key={i} t={t} at={at} out={out} text={s} y={y + i * fs * gap} size={fs} color={colors?.[i] ?? color} weight={weight} italic={italic} stagger={0.05} />
      ))}
    </>
  );
};

/** Opening claim: its punch starts 0.15 s before frame 0 so the loop flows into it. */
const H1 = fit('A WOMAN ARGUED', 120, '700', 0.05);
const H3 = fit('PROPHET.', 190, '700', 0.05);
const HC = fit('A CHAPTER WAS NAMED', 64, '600', 0.05);
const HookTitle: React.FC<{t: number}> = ({t}) => {
  if (t < -0.2 || t > T.hookOut + 0.6) return null;
  const p = ramp(t, -0.15, 0.12, EASE.out);
  const o = T.hookOut - 0.1 + 9;
  const tt = t + 9;
  const off = ramp(t, T.hookOut - 0.1, T.hookOut + 0.4);
  return (
    <AbsoluteFill style={{opacity: p, scale: String(1.1 - 0.1 * p), transformOrigin: '50% 40%'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 38% at 50% 38%, rgba(3,5,10,0.62) 0%, rgba(3,5,10,0) 100%)', opacity: 1 - off}} />
      <Line t={tt} at={0} out={o} text="A WOMAN ARGUED" y={400} size={H1} stagger={0} />
      <Line t={tt} at={0} out={o} text="WITH A" y={400 + H1 * 1.14} size={H1} stagger={0} />
      <Line t={tt} at={0} out={o} text="PROPHET." y={400 + H1 * 2.28} size={H3} color={C.gold300} stagger={0} />
      <Line t={t} at={T.chapterLine} out={T.hookOut - 0.1} text="A CHAPTER WAS NAMED" y={780} size={HC} weight={600} color={C.mist} stagger={0.03} />
      <Line t={t} at={T.chapterLine + 0.55} out={T.hookOut - 0.1} text="AFTER HER." y={780 + HC * 1.16} size={HC} weight={600} color={C.ivory} stagger={0.03} />
    </AbsoluteFill>
  );
};

/** The scene without text; t < 0 is the loop pre-roll. */
export const Scene: React.FC<{t: number; uid: string}> = ({t, uid}) => (
  <AbsoluteFill style={{background: C.night950, overflow: 'hidden'}}>
    <World t={t} uid={uid} />
    <Dust t={t} count={34} seed="e19" color={C.gold300} opacity={0.32} area={[60, 300, 1020, 1500]} />
  </AbsoluteFill>
);

const ARABIC_LINES = verseData.verses['58:1'].excerptLines as string[][];
const ARABIC_AT = [41.62, 43.2, 44.95, 46.55];
const Verse: React.FC<{t: number}> = ({t}) => {
  const o = ramp(t, T.verse - 0.3, T.verse + 0.2) * (1 - ramp(t, 48.55, 48.95));
  if (o <= 0.003) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 34% at 50% 34%, rgba(3,5,10,0.55) 0%, rgba(3,5,10,0) 100%)'}} />
      {ARABIC_LINES.map((ws, i) => (
        <ArabicLine
          key={i}
          t={t}
          words={ws}
          styles={ws.map((w, k) => ({at: ARABIC_AT[i] + k * 0.26, color: /ٱللَّه/.test(w) ? C.gold300 : C.ivory}))}
          size={84}
          style={{position: 'absolute', left: 150, right: 150, top: 290 + i * 150}}
        />
      ))}
    </AbsoluteFill>
  );
};

const OFF: [number, number][] = [
  [0, 4.4], [4.45, 7.0], [9.8, 12.45], [15.8, 19.98], [24.0, 26.3], [26.4, 29.85], [29.9, 31.7], [31.7, 35.05], [35.0, 38.3], [38.3, 40.25],
  [48.99, 52.1], [53.9, 57.7], [57.8, 61.3], [61.3, 64.75], [64.7, EP_SECONDS],
];

export const Overlay: React.FC<{t: number}> = ({t}) => (
  <>
    <HookTitle t={t} />
    {/* 4.5 – 12.9 · the name, the sentence */}
    <Chip t={t} at={T.medina} out={6.9} text="MEDINA" y={236} />
    <Lines t={t} out={6.95} y={440} size={170} color={C.gold300} items={[[5.75, 'KHAWLA']]} />
    <Lines t={t} out={12.4} y={330} cap={96} color={SILVER} items={[[T.quote, '“YOU ARE TO ME'], [11.207, 'LIKE MY MOTHER’S BACK.”']]} italic weight={600} />
    {/* 15.8 – 20.4 · the trap */}
    <Lines t={t} out={19.95} y={300} size={112} items={[[T.notDivorced, 'NOT DIVORCED.'], [T.notWife, 'NOT A WIFE.']]} />
    <Line t={t} at={T.nowhere} out={19.95} text="NOWHERE." y={560} size={fit('NOWHERE.', 172)} color={EMBER} stagger={0} />
    <Chip t={t} at={20.05} out={23.7} text="REPORTED · TAFSIR IBN KATHIR" y={236} />
    {/* 24 – 35 · the door, the answer, the turn */}
    <Lines t={t} out={26.25} y={330} size={92} items={[[T.went, 'SHE WENT TO']]} />
    <Line t={t} at={T.muhammad} out={26.25} text={`MUHAMMAD ${PBUH}`} y={440} size={84} color={C.gold300} stagger={0.05} />
    <Lines t={t} out={29.85} y={330} cap={100} items={[[T.fear, '“FEAR ALLAH.'], [T.cousin, 'HE IS YOUR COUSIN.”']]} />
    <Lines t={t} out={31.65} y={640} size={76} color={C.mist} items={[[T.noRev, 'NO REVELATION'], [30.9, 'HAD COME YET.']]} />
    <Lines t={t} out={34.95} y={330} cap={104} items={[[T.notLeave, 'SHE DID NOT LEAVE.']]} />
    <Lines t={t} out={35.0} y={560} size={88} color={C.gold300} items={[[T.turned, 'SHE TURNED HER'], [33.5, 'COMPLAINT TO ALLAH.']]} />
    {/* 35 – 41 · the room */}
    <Lines t={t} out={38.3} y={300} cap={84} items={[[T.aisha, 'AISHA, IN THE SAME ROOM,'], [36.558, 'COULD NOT CATCH EVERY WORD.']]} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 13% at 50% 35%, rgba(3,4,10,0.55) 0%, rgba(3,4,10,0) 100%)', opacity: ramp(t, 38.3, 38.6) * (1 - ramp(t, 40.0, 40.3))}} />
    <Lines t={t} out={40.2} y={560} size={118} color={C.ivory} items={[[T.heard, 'BUT ALLAH'], [39.1, 'HEARD ALL OF IT.']]} />
    {/* 41.6 – 48.9 · the verse */}
    <Chip t={t} at={41.5} out={48.4} text="QUR’AN 58:1 · OUR TRANSLATION" y={236} />
    <Verse t={t} />
    {/* 49 – 65 · what the Qur'an says, the steps, the name of the chapter */}
    <Chip t={t} at={T.wrong} out={51.9} text="QUR’AN 58:2" y={236} />
    <Lines t={t} out={52.0} y={330} cap={104} colors={[C.ivory, EMBER]} items={[[T.wrong, 'A WRONG'], [50.35, 'AND A FALSEHOOD.']]} />
    <Lines t={t} out={57.55} y={300} cap={84} colors={[C.ivory, C.ivory, C.gold300]} items={[[T.free, 'FREE A SLAVE.'], [T.fast, 'FAST TWO MONTHS.'], [T.feed, 'FEED SIXTY POOR PEOPLE.']]} gap={1.3} />
    <Lines t={t} out={61.25} y={330} cap={130} colors={[C.gold300]} items={[[T.chapter, 'AL-MUJADILA']]} />
    <Lines t={t} out={61.25} y={480} cap={104} items={[[T.disputes, 'SHE WHO DISPUTES.']]} />
    <Lines t={t} out={64.6} y={640} size={62} weight={600} color={C.mist} items={[[T.reported, 'HER STORY IS REPORTED.'], [T.versesAre, 'THE VERSES ARE THE QURAN.']]} />
    {/* 64.7 – 72 · the ending */}
    <Lines t={t} out={67.2} y={290} cap={84} items={[[T.queen, 'SHE WAS NOT A QUEEN.'], [T.scholar, 'SHE WAS NOT A SCHOLAR.']]} gap={1.2} />
    <Lines t={t} out={69.95} y={300} cap={84} color={C.gold300} items={[[T.woman, 'SHE WAS A WOMAN WHO'], [68.376, 'WOULD NOT STOP ASKING.']]} gap={1.2} />
    <Lines t={t} out={72.3} y={520} size={104} color={C.gold300} items={[[T.kept, 'ALLAH KEPT'], [70.7, 'HER QUESTION.']]} />
  </>
);

export const E019: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const loopT = (frame - TOTAL_FRAMES) / FPS;
  if (frame >= EP_FRAMES) {
    const sting = (frame - EP_FRAMES) / FPS;
    return (
      <AbsoluteFill style={{background: C.night950}}>
        <Outro
          t={sting}
          base={
            <>
              <Scene t={loopT} uid="o" />
              <HookTitle t={loopT} />
            </>
          }
          from={[L0.x, L0.y]}
        />
        <Vignette strength={0.4} />
        <Grain opacity={0.09} />
        <Watermark opacity={0.36 * (1 - veil(sting))} />
      </AbsoluteFill>
    );
  }
  const home = ramp(t, 71.9, EP_SECONDS - 0.05, EASE.inOut);
  return (
    <AbsoluteFill style={{background: C.night950, overflow: 'hidden'}}>
      <Scene t={t} uid="a" />
      {home > 0 ? (
        <AbsoluteFill style={{opacity: home}}>
          <Scene t={t - LOOP_SECONDS} uid="b" />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(3,5,10,0.62) 0%, rgba(3,5,10,0.4) 26%, rgba(3,5,10,0) 44%)', opacity: ramp(t, 4.2, 5.0)}} />
      <Overlay t={t} />
      <Captions t={t} off={OFF} pages={PAGES} />
      <Vignette strength={0.4} />
      <Grain opacity={0.09} />
      <Watermark opacity={0.36} />
    </AbsoluteFill>
  );
};
void FONT;
