import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import verseData from '../../public/ep/e021/verse.json';
import {C, FPS} from '../brand/tokens';
import {Dust, Grain, Vignette} from '../components/Atmosphere';
import {ArabicLine} from '../components/Typography';
import {Watermark} from '../brandkit/BrandKit';
import {Outro, veil} from '../brandkit/Outro';
import {EASE, ramp} from '../lib/anim';
import '../lib/fonts';
import {Chip, Line, fit} from '../e016/Text';
import {EP_FRAMES, EP_SECONDS, LOOP_SECONDS, T, TOTAL_FRAMES} from './timeline';
import {World} from './World';

const EMBER = C.emberLight;

/** Timed lines at one size (the longest decides); a line arrives at its own beat. */
export const Lines: React.FC<{t: number; out: number; y: number; gap?: number; cap?: number; size?: number; color?: string; colors?: string[]; items: [number, string][]; weight?: 500 | 600 | 700; italic?: boolean}> = ({
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

/** Soft dark underlay behind a text block (readability over the palm and the veil). */
const Under: React.FC<{t: number; a: number; b: number; y: number; h?: number; k?: number}> = ({t, a, b, y, h = 30, k = 0.55}) => {
  const o = ramp(t, a, a + 0.4) * (1 - ramp(t, b, b + 0.4));
  if (o <= 0.003) return null;
  return <AbsoluteFill style={{background: `radial-gradient(ellipse 88% ${h}% at 50% ${y}%, rgba(3,5,10,${k}) 0%, rgba(3,5,10,0) 100%)`, opacity: o}} />;
};

/** Hook: its punch starts 0.15 s before frame 0 so the loop flows into it. */
const H1 = fit('SHE WISHED', 150, '700', 0.05);
const H3 = fit('FORGOTTEN.', 160, '700', 0.05);
const HC = fit('THE WOMEN OF THE WORLDS.', 64, '600', 0.05);
const HY = 330;
export const HookTitle: React.FC<{t: number}> = ({t}) => {
  if (t < -0.2 || t > T.hookOut + 0.6) return null;
  const p = ramp(t, -0.15, 0.12, EASE.out);
  const o = T.hookOut - 0.1 + 9;
  const tt = t + 9;
  const off = ramp(t, T.hookOut - 0.1, T.hookOut + 0.4);
  const y3 = HY + H1 * 2.28;
  const ys = y3 + H3 * 1.22 + 36;
  return (
    <AbsoluteFill style={{opacity: p, scale: String(1.1 - 0.1 * p), transformOrigin: '50% 40%'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 40% at 50% 36%, rgba(3,5,10,0.62) 0%, rgba(3,5,10,0) 100%)', opacity: 1 - off}} />
      <Line t={tt} at={0} out={o} text="SHE WISHED" y={HY} size={H1} stagger={0} />
      <Line t={tt} at={0} out={o} text="TO BE" y={HY + H1 * 1.14} size={H1} stagger={0} />
      <Line t={tt} at={0} out={o} text="FORGOTTEN." y={y3} size={H3} color={C.gold300} stagger={0} />
      <Line t={t} at={1.5} out={T.hookOut - 0.1} text="SHE WAS CHOSEN ABOVE" y={ys} size={HC} weight={600} color={C.mist} stagger={0.03} />
      <Line t={t} at={2.5} out={T.hookOut - 0.1} text="THE WOMEN OF THE WORLDS." y={ys + HC * 1.16} size={HC} weight={600} color={C.ivory} stagger={0.03} />
    </AbsoluteFill>
  );
};

/** The scene without text; t < 0 is the loop pre-roll. */
export const Scene: React.FC<{t: number; uid: string}> = ({t, uid}) => (
  <AbsoluteFill style={{background: C.night950, overflow: 'hidden'}}>
    <World t={t} uid={uid} />
    <Dust t={t} count={34} seed="e21" color={C.gold300} opacity={0.3} area={[60, 300, 1020, 1500]} />
  </AbsoluteFill>
);

const V = verseData.verses;
const AR_342 = (V['3:42'] as {excerptLines: string[][]}).excerptLines;
const AR_1923 = (V['19:23'] as {excerptLines: string[][]}).excerptLines;
const AR_1926 = (V['19:26'] as {excerptLines: string[][]}).excerptLines;
const ArabicBlock: React.FC<{t: number; lines: string[][]; start: number; step: number; out: number; top: number; pitch?: number; size?: number; gold?: RegExp}> = ({
  t, lines, start, step, out, top, pitch = 150, size = 84, gold,
}) => {
  const o = 1 - ramp(t, out, out + 0.4);
  if (o <= 0.003 || t < start - 0.05) return null;
  let k = 0;
  return (
    <AbsoluteFill style={{opacity: o}}>
      {lines.map((ws, i) => {
        const at0 = start + i * step;
        k += ws.length;
        return (
          <ArabicLine
            key={i}
            t={t}
            words={ws}
            styles={ws.map((w, j) => ({at: at0 + j * 0.26, color: gold && gold.test(w) ? C.gold300 : C.ivory}))}
            size={size}
            style={{position: 'absolute', left: 170, right: 170, top: top + i * pitch}}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Text-off windows are not needed (no captions); the whole overlay is one function of t. */
export const Overlay: React.FC<{t: number}> = ({t}) => (
  <>
    <HookTitle t={t} />

    {/* 5 – 11.5 · chosen (3:42) */}
    <Under t={t} a={5.0} b={11.0} y={34} h={36} />
    <Chip t={t} at={5.0} out={11.0} text="QUR’AN 3:42 · OUR TRANSLATION" y={236} />
    <ArabicBlock t={t} lines={AR_342} start={5.5} step={0.8} out={11.0} top={290} />
    <Lines t={t} out={11.0} y={790} cap={78} weight={600} italic colors={[C.ivory, C.ivory, C.ivory, C.gold300]} items={[[6.0, '“ALLAH HAS CHOSEN YOU,'], [7.0, 'PURIFIED YOU, AND'], [8.0, 'CHOSEN YOU ABOVE THE'], [9.0, 'WOMEN OF THE WORLDS.”']]} />

    {/* 11.5 – 18.5 · she withdraws (19:16–17) */}
    <Under t={t} a={11.5} b={18.2} y={22} h={26} />
    <Chip t={t} at={11.5} out={18.2} text="QUR’AN 19:16–17 · OUR TRANSLATION" y={236} />
    <Lines t={t} out={15.0} y={330} cap={96} items={[[12.0, 'SHE LEFT HER PEOPLE'], [13.0, 'FOR AN EASTERN PLACE.']]} />
    <Lines t={t} out={18.25} y={330} cap={96} colors={[C.ivory, C.gold300]} items={[[15.0, 'AND PUT UP A SCREEN'], [16.0, 'BETWEEN THEM AND HER.']]} />

    {/* 18.5 – 30.5 · the visitor, the question, the answer (19:17–21) */}
    <Under t={t} a={18.5} b={30.2} y={22} h={30} />
    <Chip t={t} at={18.5} out={30.2} text="QUR’AN 19:17–21 · OUR TRANSLATION" y={236} />
    <Lines t={t} out={23.3} y={330} cap={90} colors={[C.mist, C.ivory, C.ivory, C.ivory]} items={[[19.0, 'A MESSENGER CAME.'], [20.0, 'SHE SAID: “I SEEK REFUGE'], [21.0, 'IN THE MOST MERCIFUL'], [22.0, 'FROM YOU…”']]} />
    <Lines t={t} out={27.8} y={330} cap={90} colors={[C.gold300, C.ivory, C.ivory]} items={[[23.5, 'HE SAID: “A PURE BOY.”'], [24.5, 'SHE ASKED: “HOW?'], [25.5, 'NO MAN HAS TOUCHED ME.”']]} />
    <Lines t={t} out={30.2} y={400} size={118} color={C.gold300} items={[[T.easy, '“IT IS EASY'], [T.easy + 0.5, 'FOR ME.”']]} />

    {/* 30.5 – 34.5 · she carries and withdraws far (19:22) */}
    <Under t={t} a={30.6} b={34.2} y={20} h={22} />
    <Chip t={t} at={30.6} out={34.2} text="QUR’AN 19:22 · OUR TRANSLATION" y={236} />
    <Lines t={t} out={34.5} y={330} cap={104} items={[[31.0, 'SHE CARRIED HIM,'], [32.0, 'AND WITHDREW'], [33.0, 'TO A FAR PLACE.']]} />

    {/* 34.5 – 46 · labour and the wish (19:23) */}
    <Under t={t} a={34.6} b={45.6} y={30} h={44} k={0.5} />
    <Chip t={t} at={34.6} out={45.4} text="QUR’AN 19:23 · OUR TRANSLATION" y={236} />
    <Lines t={t} out={38.3} y={330} cap={100} items={[[35.0, 'THE PAINS OF LABOR'], [36.0, 'DROVE HER TO A PALM.']]} />
    <ArabicBlock t={t} lines={AR_1923} start={38.5} step={0.8} out={45.4} top={290} />
    <Lines t={t} out={45.4} y={790} cap={78} weight={600} italic items={[[T.wish, '“I WISH I HAD DIED'], [40.0, 'BEFORE THIS, AND WAS'], [41.0, 'SOMETHING FORGOTTEN,'], [42.0, 'COMPLETELY FORGOTTEN.”']]} colors={[C.ivory, C.ivory, C.ivory, EMBER]} />

    {/* 46 – 54.5 · comfort (19:24–26) */}
    <Under t={t} a={46.0} b={54.2} y={26} h={34} />
    <Chip t={t} at={46.0} out={54.2} text="QUR’AN 19:24–26 · OUR TRANSLATION" y={236} />
    <Lines t={t} out={49.25} y={330} size={124} color={C.gold300} items={[[46.5, '“DO NOT GRIEVE.”']]} />
    <Lines t={t} out={49.25} y={520} size={64} weight={600} color={C.ivory} items={[[47.5, 'A STREAM BENEATH YOU.']]} />
    <Lines t={t} out={52.25} y={330} cap={96} items={[[T.shake, 'SHAKE THE TRUNK:'], [50.5, 'FRESH DATES WILL FALL.']]} />
    <ArabicBlock t={t} lines={AR_1926} start={T.eat + 0.2} step={0.8} out={54.2} top={290} size={78} />
    <Lines t={t} out={54.3} y={530} cap={104} color={C.gold300} items={[[T.eat, 'EAT. DRINK.'], [T.eat + 1.0, 'BE COMFORTED.']]} />

    {/* 54.5 – 63 · the honest lens */}
    <Under t={t} a={54.6} b={62.8} y={26} h={34} />
    <Chip t={t} at={54.6} out={62.8} text="REPORTED · TAFSIR IBN KATHIR" y={236} />
    <Lines t={t} out={59.0} y={330} cap={92} colors={[C.ivory, C.mist, C.gold300]} items={[[55.0, 'WHO CALLED FROM BELOW?'], [56.0, 'SCHOLARS DIFFER:'], [57.0, 'THE ANGEL, OR THE NEWBORN ‘ISA.']]} />
    <Lines t={t} out={63.0} y={330} cap={92} colors={[C.ivory, C.mist, C.gold300]} items={[[59.0, 'THE QUR’AN KEEPS HER WORDS.'], [60.0, 'THE NEXT VERSE:'], [61.0, '“DO NOT GRIEVE.”']]} />

    {/* 63 – 67 · the ending */}
    <Under t={t} a={63.0} b={66.7} y={28} h={30} />
    <Lines t={t} out={66.55} y={330} size={104} items={[[T.close, 'SHE WAS CHOSEN.'], [T.close + 1.0, 'SHE WAS ALONE.']]} gap={1.2} />
    <Lines t={t} out={66.55} y={640} size={fit('BOTH ARE IN THE QUR’AN.', 70)} weight={600} color={C.gold300} items={[[T.close + 2.0, 'BOTH ARE IN THE QUR’AN.']]} />
  </>
);

export const E021: React.FC = () => {
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
          from={[540, 1390]}
        />
        <Vignette strength={0.4} />
        <Grain opacity={0.09} />
        <Watermark opacity={0.36 * (1 - veil(sting))} />
      </AbsoluteFill>
    );
  }
  const home = ramp(t, EP_SECONDS - 1.0, EP_SECONDS - 0.05, EASE.inOut);
  return (
    <AbsoluteFill style={{background: C.night950, overflow: 'hidden'}}>
      <Scene t={t} uid="a" />
      {home > 0 ? (
        <AbsoluteFill style={{opacity: home}}>
          <Scene t={t - LOOP_SECONDS} uid="b" />
        </AbsoluteFill>
      ) : null}
      <Overlay t={t} />
      <Vignette strength={0.4} />
      <Grain opacity={0.09} />
      <Watermark opacity={0.36} />
    </AbsoluteFill>
  );
};
