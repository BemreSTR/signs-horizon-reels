import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import verse from '../../public/ep/e017/verse.json';
import {C, FPS} from '../brand/tokens';
import {Grain, Vignette} from '../components/Atmosphere';
import {ArabicLine} from '../components/Typography';
import {Watermark} from '../brandkit/BrandKit';
import {Outro, veil} from '../brandkit/Outro';
import {EASE, ramp} from '../lib/anim';
import '../lib/fonts';
import {Chip, Line} from '../e016/Text';
import {NOTCH, Well} from './Well';
import {CLOSE, EP_FRAMES, T, TOTAL_FRAMES, camAt, camCss, dayAt, notchAt, toScreen} from './timeline';

const LINES = verse.lines as string[][];
const NIGHT = '#A9B8E0';
const EMBER = C.emberLight;
const win = (t: number, a: number, b: number) => ramp(t, a, a + 0.4, EASE.out) * (1 - ramp(t, b - 0.4, b, EASE.inOut));

/** The well and its camera at time t (t < 0 is the loop pre-roll: the opening close-up). */
export const Scene: React.FC<{t: number}> = ({t}) => {
  const day = t < 0 ? 1 : dayAt(t);
  const still = t >= T.stop && t < T.again;
  const graceOut = 1 - ramp(t, T.home, T.home + 0.9, EASE.inOut);
  return (
    <AbsoluteFill style={{background: '#090B12', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, ...camCss(t < 0 ? CLOSE : camAt(t))}}>
        <Well
          t={t}
          day={day}
          notch={t < 0 ? 0.12 : notchAt(t)}
          active={still ? 'none' : day > 0.5 ? 'white' : 'black'}
          lion={Math.max(win(t, T.lion, T.lion + 2.6), win(t, T.mapLion, T.mapDragon), win(t, T.terror, T.again))}
          dragon={Math.max(win(t, T.dragon, T.dragon + 2.6), win(t, T.mapDragon, T.mapYou), win(t, T.terror, T.again))}
          graceL={ramp(t, T.horse, T.horse + 0.9, EASE.inOut) * graceOut}
          graceD={ramp(t, T.door, T.door + 1.1, EASE.inOut) * graceOut}
          you={win(t, T.mapYou, T.faster)}
        />
      </div>
    </AbsoluteFill>
  );
};

const Small: React.FC<{t: number; at: number; out: number; text: string; y: number}> = ({t, at, out, text, y}) => (
  <Line t={t} at={at} out={out} text={text} y={y} size={44} weight={600} ls={0.2} color={C.mist} stagger={0.03} />
);

/** The opening claim; its punch starts 0.15 s before frame 0 so the loop flows into it. */
const HookTitle: React.FC<{t: number}> = ({t}) => {
  if (t < -0.2 || t > T.hookOut + 0.6) return null;
  const p = ramp(t, -0.15, 0.12, EASE.out);
  return (
    <AbsoluteFill style={{opacity: p, scale: String(1.12 - 0.12 * p), transformOrigin: '50% 22%'}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,7,12,0.82) 0%, rgba(5,7,12,0.7) 26%, rgba(5,7,12,0) 44%)', opacity: 1 - ramp(t, T.hookOut, T.hookOut + 0.5)}} />
      <Line t={t + 9} at={0} out={T.hookOut - 0.1 + 9} text="TWO RATS ARE EATING" y={248} cap={92} stagger={0} />
      <Line t={t + 9} at={0} out={T.hookOut - 0.1 + 9} text="YOUR LIFE." y={352} cap={190} color={C.gold300} stagger={0} />
    </AbsoluteFill>
  );
};

/** E017 · The Two Rats. Text, music and effects only. */
export const E017: React.FC = () => {
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
              <Scene t={loopT} />
              <HookTitle t={loopT} />
            </>
          }
          from={toScreen(CLOSE, NOTCH.white.x, NOTCH.white.y)}
        />
        <Vignette strength={0.36} />
        <Grain opacity={0.09} />
        <Watermark opacity={0.36 * (1 - veil(sting))} />
      </AbsoluteFill>
    );
  }
  const dim = ramp(t, T.verse - 0.3, T.verse + 0.6, EASE.inOut) * (1 - ramp(t, T.home - 0.3, T.home + 0.5, EASE.inOut));
  const vOut = T.home - 0.35;
  const vo = 1 - ramp(t, vOut, vOut + 0.4, EASE.inOut);
  return (
    <AbsoluteFill style={{background: C.night950, overflow: 'hidden'}}>
      <Scene t={t} />
      {dim > 0 ? <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,7,12,0.93) 0%, rgba(5,7,12,0.9) 70%, rgba(5,7,12,0.55) 100%)', opacity: dim}} /> : null}

      {/* 0–3 · hook */}
      <HookTitle t={t} />

      {/* 3–15 · the well, the lion, the dragon */}
      <Line t={t} at={3.7} out={8.3} text="A MAN HANGS IN A WELL," y={400} cap={78} />
      <Line t={t} at={4.0} out={8.3} text="HOLDING A FIG TREE." y={486} cap={78} />
      <Line t={t} at={T.lion + 0.2} out={T.lion + 2.4} text="ABOVE: A LION." y={470} cap={112} color={EMBER} />
      <Line t={t} at={T.dragon + 0.2} out={T.dragon + 2.4} text="BELOW: A DRAGON." y={1090} cap={104} color={EMBER} />

      {/* 15–24 · the two rats */}
      <Line t={t} at={15.3} out={18.2} text="AND THE TWO RATS" y={300} cap={86} />
      <Line t={t} at={15.6} out={18.2} text="NEVER STOP." y={392} cap={120} />
      <Small t={t} at={T.white} out={20.7} text="THE WHITE RAT" y={296} />
      <Line t={t} at={T.white + 0.15} out={20.7} text="IS THE DAY." y={356} cap={128} color={C.gold300} />
      <Small t={t} at={T.black} out={23.2} text="THE BLACK RAT" y={296} />
      <Line t={t} at={T.black + 0.15} out={23.2} text="IS THE NIGHT." y={356} cap={128} color={NIGHT} />

      {/* 24–32.4 · what everything is */}
      <Small t={t} at={T.map} out={T.mapLion - 0.25} text="THE TREE" y={556} />
      <Line t={t} at={T.map + 0.15} out={T.mapLion - 0.25} text="YOUR LIFETIME." y={614} cap={96} color={C.gold300} />
      <Small t={t} at={T.mapLion} out={T.mapDragon - 0.25} text="THE LION" y={400} />
      <Line t={t} at={T.mapLion + 0.15} out={T.mapDragon - 0.25} text="DEATH." y={458} cap={140} color={EMBER} />
      <Small t={t} at={T.mapDragon} out={T.mapYou - 0.25} text="THE DRAGON’S MOUTH" y={1128} />
      <Line t={t} at={T.mapDragon + 0.15} out={T.mapYou - 0.25} text="THE GRAVE." y={1186} cap={124} color={EMBER} />
      <Small t={t} at={T.mapYou} out={T.faster - 0.25} text="THE ONE WHO HANGS THERE" y={1100} />
      <Line t={t} at={T.mapYou + 0.15} out={T.faster - 0.25} text="YOU." y={1158} cap={170} color={C.gold300} />

      {/* 32.4–37.8 · faster */}
      <Line t={t} at={33.0} out={37.2} text="NO ONE HAS EVER" y={300} cap={92} />
      <Line t={t} at={33.3} out={37.2} text="STOPPED THEM." y={396} cap={112} />

      {/* 37.8–48 · Nursi: two brothers, two readings */}
      <Line t={t} at={T.stop + 0.3} out={T.terror - 0.3} text="SAID NURSI: TWO BROTHERS" y={400} cap={78} gold={['SAID', 'NURSI']} />
      <Line t={t} at={T.stop + 0.6} out={T.terror - 0.3} text="FELL INTO THIS WELL." y={486} cap={78} />
      <Chip t={t} at={T.stop + 0.9} out={T.terror - 0.3} text="THE WORDS · 8TH WORD" y={590} />
      <Line t={t} at={T.terror + 0.15} out={T.again - 0.25} text="ONE SAW ONLY TERROR." y={440} cap={96} color={EMBER} />
      <Line t={t} at={T.again + 0.15} out={T.horse - 0.25} text="THE OTHER LOOKED AGAIN." y={440} cap={96} />
      <Small t={t} at={T.horse + 0.1} out={T.door - 0.25} text="THE LION" y={420} />
      <Line t={t} at={T.horse + 0.25} out={T.door - 0.25} text="A TAMED HORSE." y={478} cap={110} color={C.gold300} />
      <Small t={t} at={T.door + 0.1} out={T.verse - 0.3} text="THE GRAVE" y={1090} />
      <Line t={t} at={T.door + 0.25} out={T.verse - 0.3} text="A DOOR TO A GARDEN." y={1148} cap={104} color={C.gold300} />

      {/* 48–55.5 · Qur'an 103:1–3 (verse.json only) */}
      {t >= T.verse ? (
        <AbsoluteFill style={{opacity: vo}}>
          <div style={{position: 'absolute', left: 110, right: 110, top: 270}}>
            <ArabicLine t={t} words={LINES[0]} size={78} styles={LINES[0].map(() => ({at: T.verse + 0.5, color: C.gold300}))} />
            <ArabicLine t={t} words={LINES[1]} size={78} styles={LINES[1].map((_, i) => ({at: T.verse + 1.0 + i * 0.16, color: C.ivory}))} />
            <ArabicLine t={t} words={LINES[2]} size={78} styles={LINES[2].map((_, i) => ({at: T.verse + 1.7 + i * 0.14, color: C.ivory}))} />
            <ArabicLine t={t} words={LINES[3]} size={78} styles={LINES[3].map((_, i) => ({at: T.verse + 2.4 + i * 0.14, color: C.ivory}))} />
          </div>
          {['By time,', 'Indeed, mankind is in loss,', 'Except for those who have believed', 'and done righteous deeds and advised', 'each other to truth and advised', 'each other to patience.'].map((ln, i) => (
            <Line key={ln} t={t} at={T.verse + 1.2 + i * 0.22} text={ln} y={930 + i * 56} size={44} weight={500} italic ls={0.01} stagger={0.02} gold={i === 0 ? ['time'] : []} />
          ))}
          <Chip t={t} at={T.verse + 2.8} text="QUR’AN 103:1–3 · SAHEEH INTERNATIONAL" y={1296} />
        </AbsoluteFill>
      ) : null}

      <Vignette strength={0.36} />
      <Grain opacity={0.09} />
      <Watermark opacity={0.36} />
    </AbsoluteFill>
  );
};
