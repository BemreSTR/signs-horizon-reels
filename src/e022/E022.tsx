import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, FPS} from '../brand/tokens';
import verseData from '../../public/ep/e022/verse.json';
import {Dust, Grain, Vignette} from '../components/Atmosphere';
import {ArabicLine} from '../components/Typography';
import {Watermark} from '../brandkit/BrandKit';
import {Outro, veil} from '../brandkit/Outro';
import {EASE, ramp} from '../lib/anim';
import '../lib/fonts';
import {Chip, Line, fit} from '../e016/Text';
import {Lines} from '../e021/E021';
import {EP_FRAMES, EP_SECONDS, LOOP_SECONDS, T, TOTAL_FRAMES} from './timeline';
import {World} from './World';

/** The scene without text; t < 0 is the loop pre-roll. */
export const Scene: React.FC<{t: number; uid: string}> = ({t, uid}) => (
  <AbsoluteFill style={{background: C.night950, overflow: 'hidden'}}>
    <World t={t} uid={uid} />
    <Dust t={t} count={30} seed="e22" color={C.gold300} opacity={0.26} area={[60, 300, 1020, 1500]} />
  </AbsoluteFill>
);

/** Soft dark underlay behind a text block. */
const Under: React.FC<{t: number; a: number; b: number; y: number; h?: number; k?: number}> = ({t, a, b, y, h = 30, k = 0.55}) => {
  const o = ramp(t, a, a + 0.4) * (1 - ramp(t, b, b + 0.4));
  if (o <= 0.003) return null;
  return <AbsoluteFill style={{background: `radial-gradient(ellipse 88% ${h}% at 50% ${y}%, rgba(3,5,10,${k}) 0%, rgba(3,5,10,0) 100%)`, opacity: o}} />;
};

/** Hook: its punch starts 0.15 s before frame 0 so the loop flows into it. */
const H1 = fit('SHE WAS', 170, '700', 0.05);
const H2 = fit('STARVING.', 170, '700', 0.05);
const HC = fit('THE MEAL WAS HERS.', 70, '600', 0.05);
const HY = 330;
export const HookTitle: React.FC<{t: number}> = ({t}) => {
  if (t < -0.2 || t > T.hookOut + 0.6) return null;
  const p = ramp(t, -0.15, 0.12, EASE.out);
  const o = T.hookOut - 0.1 + 9;
  const tt = t + 9;
  const off = ramp(t, T.hookOut - 0.1, T.hookOut + 0.4);
  const y2 = HY + H1 * 1.12;
  const ys = y2 + H2 * 1.22 + 40;
  return (
    <AbsoluteFill style={{opacity: p, scale: String(1.1 - 0.1 * p), transformOrigin: '50% 40%'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 40% at 50% 34%, rgba(3,5,10,0.6) 0%, rgba(3,5,10,0) 100%)', opacity: 1 - off}} />
      <Line t={tt} at={0} out={o} text="SHE WAS" y={HY} size={H1} stagger={0} />
      <Line t={tt} at={0} out={o} text="STARVING." y={y2} size={H2} color={C.gold300} stagger={0} />
      <Line t={t} at={1.5} out={T.hookOut - 0.1} text="THE MEAL WAS HERS." y={ys} size={HC} weight={600} color={C.mist} stagger={0.03} />
      <Line t={t} at={T.nudge} out={T.hookOut - 0.1} text="SHE GAVE IT AWAY." y={ys + HC * 1.16} size={HC} weight={600} color={C.ivory} stagger={0.03} />
    </AbsoluteFill>
  );
};

const V = verseData.verses['17:24'] as {linesA: string[][]; linesB: string[][]};
const ArabicBlock: React.FC<{t: number; lines: string[][]; start: number; step: number; out: number; top: number; pitch?: number; size?: number}> = ({
  t, lines, start, step, out, top, pitch = 140, size = 84,
}) => {
  const o = 1 - ramp(t, out, out + 0.4);
  if (o <= 0.003 || t < start - 0.05) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      {lines.map((ws, i) => {
        const at0 = start + i * step;
        return (
          <ArabicLine
            key={i}
            t={t}
            words={ws}
            styles={ws.map((_, j) => ({at: at0 + j * 0.26, color: C.ivory}))}
            size={size}
            style={{position: 'absolute', left: 170, right: 170, top: top + i * pitch}}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const SRC = 'THE TENTH WORD · OUR TRANSLATION';

/** Text-off windows are not needed (no captions); the whole overlay is one function of t. */
export const Overlay: React.FC<{t: number}> = ({t}) => (
  <>
    <HookTitle t={t} />

    {/* 5 – 13 · the lion (Sözler, Onuncu Söz, İkinci Hakikat, footnote) */}
    <Under t={t} a={5.0} b={12.7} y={30} h={36} />
    <Chip t={t} at={5.0} out={13.0} text="SAID NURSI · TURKISH MUSLIM SCHOLAR" y={226} size={24} />
    <Chip t={t} at={5.2} out={13.0} text="THE WORDS · TENTH WORD · OUR TRANSLATION" y={270} size={22} color={C.gold400} />
    <Lines t={t} out={13.0} y={350} cap={80} weight={600} italic colors={[C.ivory, C.ivory, C.ivory, C.ivory, C.gold300]} items={[[5.5, '“A HUNGRY LION'], [6.5, 'PREFERS ITS WEAK CUB'], [7.5, 'TO ITSELF — IT DOES NOT EAT'], [9.0, 'THE MEAT IT GOT'], [10.0, 'AND GIVES IT TO ITS CUB.”']]} />

    {/* 13 – 15 · to the tree */}
    <Line t={t} at={13.3} out={14.9} text="THEN A TREE." y={400} cap={118} color={C.gold300} />

    {/* 15 – 20.5 · the fig tree */}
    <Under t={t} a={15.0} b={20.2} y={27} h={30} />
    <Chip t={t} at={15.0} out={20.4} text={SRC} y={236} size={24} />
    <Lines t={t} out={20.4} y={330} cap={96} weight={600} italic colors={[C.ivory, C.ivory, C.ivory, C.gold300]} items={[[15.4, '“AND A FIG TREE,'], [16.4, 'EATING MUD ITSELF,'], [17.4, 'GIVES PURE MILK'], [18.4, 'TO ITS FRUIT.”']]} />

    {/* 22 – 28.3 · all mothers */}
    <Under t={t} a={22.0} b={28.0} y={29} h={38} k={0.6} />
    <Chip t={t} at={22.0} out={28.3} text={SRC} y={236} size={24} />
    <Lines t={t} out={28.3} y={330} cap={82} weight={600} italic colors={[C.ivory, C.mist, C.ivory, C.ivory, C.ivory, C.gold300]} items={[[22.0, '“ALL MOTHERS —'], [22.8, 'PLANT, ANIMAL, HUMAN —'], [23.8, 'WITH THEIR MERCIFUL'], [24.8, 'COMPASSION AND A TENDER'], [25.8, 'FOOD LIKE MILK, RAISE'], [26.8, 'THEIR WEAK YOUNG.”']]} />

    {/* 28.5 – 31.5 · the conclusion */}
    <Under t={t} a={28.5} b={31.2} y={24} h={30} />
    <Chip t={t} at={28.6} out={31.4} text={SRC} y={236} size={24} />
    <Lines t={t} out={31.4} y={330} cap={124} colors={[C.ivory, C.ivory, C.gold300]} items={[[28.8, '“HOW WIDE A MERCY'], [29.6, 'IS AT WORK'], [30.4, 'IS PLAIN.”']]} weight={600} italic />

    {/* 31.5 – 37.5 · whom they act for */}
    <Under t={t} a={31.6} b={37.2} y={27} h={34} />
    <Chip t={t} at={31.6} out={37.4} text={SRC} y={236} size={24} />
    <Lines t={t} out={37.4} y={330} cap={82} weight={600} italic colors={[C.ivory, C.ivory, C.ivory, C.gold300, C.gold300]} items={[[31.8, '“THEY SHOW, TO ANYONE'], [32.8, 'NOT BLIND, THAT THEY ACT'], [33.8, 'ON BEHALF OF ONE'], [34.8, 'INFINITELY MERCIFUL,'], [35.8, 'GENEROUS, COMPASSIONATE.”']]} />

    {/* 37.5 – 46.5 · the honest lens */}
    <Under t={t} a={37.6} b={46.2} y={28} h={36} />
    <Chip t={t} at={37.6} out={46.4} text="HONEST LENS" y={226} size={24} color={C.gold400} />
    <Chip t={t} at={37.8} out={46.4} text="HE USES IT AS A STEP TOWARD THE HEREAFTER" y={270} size={21} />
    <Lines t={t} out={41.5} y={350} cap={98} colors={[C.ivory, C.gold300]} items={[[38.0, 'AN ARGUMENT FROM SIGNS,'], [39.0, 'NOT A LAB PROOF.']]} />
    <Lines t={t} out={46.4} y={350} cap={86} weight={600} colors={[C.ivory, C.ivory, C.ivory, C.mist, C.gold300]} items={[[41.6, 'BIOLOGISTS EXPLAIN'], [42.4, 'PARENTAL CARE'], [43.2, 'THROUGH EVOLUTION.'], [44.2, 'NURSI READS THE SAME LOVE'], [45.2, 'AS A SIGN OF MERCY.']]} />

    {/* 46.5 – 49.2 · the child's side */}
    <Under t={t} a={46.6} b={49.0} y={24} h={26} />
    <Line t={t} at={46.8} out={49.1} text="THE CHILD’S SIDE?" y={330} cap={120} color={C.gold300} />
    <Line t={t} at={47.8} out={49.1} text="THE QUR’AN ANSWERS IT." y={500} cap={82} weight={600} />

    {/* 49.3 – 55.2 · 17:24, first half */}
    <Under t={t} a={49.4} b={54.9} y={30} h={36} k={0.58} />
    <Chip t={t} at={49.4} out={55.1} text="QUR’AN 17:24 · OUR TRANSLATION" y={226} size={24} />
    <Chip t={t} at={49.6} out={55.1} text="17:23 · IF ONE OR BOTH REACH OLD AGE WITH YOU" y={270} size={21} color={C.mist} />
    <ArabicBlock t={t} lines={V.linesA} start={49.8} step={0.9} out={55.1} top={310} />
    <Lines t={t} out={55.1} y={640} cap={80} weight={600} italic colors={[C.ivory, C.gold300]} items={[[50.6, '“LOWER TO THEM THE WING'], [51.6, 'OF HUMILITY, OUT OF MERCY,']]} />
    <Chip t={t} at={52.6} out={55.1} text="IBN KATHIR · HUMBLE TOWARD THEM IN YOUR ACTIONS" y={860} size={21} color={C.mist} />

    {/* 55.2 – 62 · 17:24, second half */}
    <Under t={t} a={55.3} b={61.7} y={32} h={40} k={0.58} />
    <Chip t={t} at={55.3} out={61.9} text="QUR’AN 17:24 · OUR TRANSLATION" y={226} size={24} />
    <ArabicBlock t={t} lines={V.linesB} start={55.5} step={0.9} out={61.9} top={290} />
    <Lines t={t} out={61.9} y={620} cap={80} weight={600} italic colors={[C.ivory, C.ivory, C.ivory, C.gold300]} items={[[56.2, 'AND SAY: “MY LORD,'], [57.1, 'HAVE MERCY ON THEM'], [58.0, 'AS THEY RAISED ME'], [58.9, 'WHEN I WAS SMALL.”']]} />

    {/* 62 – 67 · the lesson */}
    <Under t={t} a={62.0} b={66.6} y={26} h={34} />
    <Lines t={t} out={66.55} y={330} size={118} items={[[T.close, 'A MOTHER’S LOVE'], [T.close + 0.7, 'IS GIVEN FIRST.']]} gap={1.16} colors={[C.ivory, C.gold300]} />
    <Line t={t} at={T.close + 2.0} out={66.55} text="NURSI: A SIGN OF MERCY." y={660} size={fit('QUR’AN: THE REPLY IS A PRAYER.', 66, '600')} weight={600} color={C.gold300} />
    <Line t={t} at={T.close + 3.0} out={66.55} text="QUR’AN: THE REPLY IS A PRAYER." y={660 + 80} size={fit('QUR’AN: THE REPLY IS A PRAYER.', 66, '600')} weight={600} />
  </>
);

export const E022: React.FC = () => {
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
          from={[540, 1300]}
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
