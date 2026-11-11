import React from 'react';
import {AbsoluteFill} from 'remotion';
import verse from '../../public/ep/e016/verse.json';
import {C} from '../brand/tokens';
import {Dust, Stars} from '../components/Atmosphere';
import {ArabicLine} from '../components/Typography';
import {EASE, lerp, ramp} from '../lib/anim';
import {Pomegranate} from './Pomegranate';
import {Chip, Line} from './Text';
import {HERO, LOOP_SECONDS, T, breathe} from './timeline';

const REST = {y: 1262, k: 0.58};
const LINES = verse.lines as string[][];

/** Scenes 5–6 (35.4–46.8 s): Nursi's sentence, then the verse; the pomegranate eases back to its opening pose for the loop. */
export const Ending: React.FC<{t: number}> = ({t}) => {
  const tl = t - LOOP_SECONDS; // the same clock the loop pre-roll uses, so stars, dust and breathing line up at the seam
  const home = ramp(t, T.home, T.end, EASE.inOut);
  const k = lerp(REST.k, 1, home) * breathe(t);
  const y = lerp(REST.y, HERO.y, home);
  const fadeIn = ramp(t, T.quote, T.quote + 0.9, EASE.out);
  const qOut = T.verse - 0.45;
  const vOut = T.home - 0.15;
  const a1 = T.verse + 0.2;
  const a2 = T.verse + 0.9;
  const vo = 1 - ramp(t, vOut, vOut + 0.4, EASE.inOut);
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 90% 60% at 50% 60%, #150B10 0%, ${C.night950} 70%)`}}>
      <AbsoluteFill style={{opacity: fadeIn}}>
        <Stars t={tl} n={90} seed="hk" maxY={700} opacity={0.5} />
        <Pomegranate x={HERO.x} y={y} r={HERO.r} t={tl} scale={k} />
        <Dust t={tl} count={46} seed="hd" color={C.gold300} opacity={0.55} area={[120, 500, 960, 1700]} />
      </AbsoluteFill>

      {/* Said Nursi, The Words, 22nd Word, 2nd Station, 9th Flash (our translation) */}
      <Line t={t} at={35.6} out={qOut} text="“If these fruits did not" y={286} size={56} weight={500} italic color={C.mist} ls={0.01} stagger={0.04} />
      <Line t={t} at={35.8} out={qOut} text="belong to the One," y={354} size={56} weight={500} italic color={C.mist} ls={0.01} stagger={0.04} gold={['One']} />
      <Line t={t} at={36.4} out={qOut} text="we could not eat" y={456} cap={98} weight={600} ls={0.01} />
      <Line t={t} at={36.9} out={qOut} text="a single pomegranate," y={556} cap={98} weight={600} ls={0.01} />
      <Line t={t} at={37.4} out={qOut} text="even if we gave" y={648} cap={98} weight={600} ls={0.01} />
      <Line t={t} at={37.9} out={qOut} text="the whole world.”" y={748} cap={112} weight={700} ls={0.01} color={C.gold300} />
      <Chip t={t} at={38.6} out={qOut} text="SAID NURSI · THE WORDS · 22ND WORD" y={900} />

      {/* Qur'an 39:62 (verse.json only) */}
      {t >= T.verse ? (
        <AbsoluteFill style={{opacity: vo}}>
          <div style={{position: 'absolute', left: 120, right: 120, top: 262}}>
            <ArabicLine t={t} words={LINES[0]} size={82} styles={LINES[0].map((_, i) => ({at: a1 + i * 0.22, color: i >= 2 ? C.gold300 : C.ivory}))} />
            <ArabicLine t={t} words={LINES[1]} size={82} styles={LINES[1].map((_, i) => ({at: a2 + i * 0.2, color: C.ivory}))} />
          </div>
          <Line t={t} at={T.verse + 1.5} text="Allah is the Creator of all things," y={640} size={48} weight={500} italic ls={0.01} stagger={0.03} gold={['all', 'things']} />
          <Line t={t} at={T.verse + 1.65} text="and He is, over all things," y={702} size={48} weight={500} italic ls={0.01} stagger={0.03} />
          <Line t={t} at={T.verse + 1.8} text="Disposer of affairs." y={764} size={48} weight={500} italic ls={0.01} stagger={0.03} />
          <Chip t={t} at={T.verse + 2.2} text="QUR’AN 39:62 · SAHEEH INTERNATIONAL" y={862} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
