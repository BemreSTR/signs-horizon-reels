import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, FPS} from '../brand/tokens';
import {Grain, Vignette} from '../components/Atmosphere';
import {Watermark} from '../brandkit/BrandKit';
import {Outro, veil} from '../brandkit/Outro';
import {EASE, lerp, ramp} from '../lib/anim';
import '../lib/fonts';
import {Chip, Line} from '../e016/Text';
import {NOTCH, Well, WellState} from './Well';
import {CLOSE, COL, EP_FRAMES, LOOP_SECONDS, T, TOTAL_FRAMES, camAt, camCss, dayAt, lionAt, manAt, notchAt, toScreen} from './timeline';

const NIGHT = '#A9B8E0';
const EMBER = C.emberLight;
const win = (t: number, a: number, b: number) => ramp(t, a, a + 0.4, EASE.out) * (1 - ramp(t, b - 0.4, b, EASE.inOut));

/** One well and its camera (0 … T.stop). t < 0 is the loop pre-roll: the opening close-up, before the man arrives. */
export const Scene: React.FC<{t: number}> = ({t}) => {
  const pre = t < 0;
  const day = pre ? 1 : dayAt(t);
  const man = pre ? {on: 0, hang: 0} : manAt(t);
  const lion = pre ? {x: -420, run: 1} : lionAt(t);
  return (
    <AbsoluteFill style={{background: '#090B12', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, ...camCss(pre ? CLOSE : camAt(t))}}>
        <Well
          t={t}
          day={day}
          notch={pre ? 0.12 : notchAt(t)}
          active={day > 0.5 ? 'white' : 'black'}
          lion={Math.max(win(t, T.run + 0.4, T.jump + 0.4) * 0.7, win(t, T.lion, T.dragon), win(t, T.mapLion, T.mapDragon))}
          dragon={Math.max(win(t, T.dragon, T.rats), win(t, T.mapDragon, T.faster))}
          graceL={0}
          graceD={0}
          you={win(t, T.you + 1.4, T.map)}
          manX={man.x}
          manY={man.y}
          manOn={man.on}
          hang={man.hang}
          lionX={lion.x}
          lionRun={lion.run}
        />
      </div>
    </AbsoluteFill>
  );
};

const Column: React.FC<{left: number; state: WellState; dim: number; uid: string}> = ({left, state, dim, uid}) => (
  <div style={{position: 'absolute', left, top: COL.top, width: COL.w, height: 1920 - COL.top, overflow: 'hidden', background: '#090B12'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: `translate(${-COL.wx0 * COL.k}px, 0px) scale(${COL.k})`}}>
      <Well {...state} uid={uid} />
    </div>
    {dim > 0 ? <div style={{position: 'absolute', inset: 0, background: 'rgba(5,7,12,0.66)', opacity: dim}} /> : null}
  </div>
);

/** The same well, twice: the first brother's on the left, the second brother's on the right. */
const TwoWells: React.FC<{t: number}> = ({t}) => {
  const base = {t, notch: 0.92, graceL: 0, graceD: 0, you: 0, hang: 1, manOn: 1};
  const fear = ramp(t, T.first, T.first + 1.2, EASE.inOut);
  const pulse = 0.75 + 0.25 * Math.sin(t * 5);
  const left: WellState = {...base, day: lerp(0.45, 0.04, fear), active: 'black', lion: lerp(0.3, pulse, fear), dragon: lerp(0.3, pulse, fear)};
  const wake = ramp(t, T.second, T.second + 2.0, EASE.inOut);
  const open = ramp(t, T.door, T.door + 1.4, EASE.inOut);
  const right: WellState = {
    ...base,
    day: lerp(lerp(0.45, 0.7, wake), 1, open),
    active: 'white',
    lion: 0.3 * (1 - wake),
    dragon: 0.3 * (1 - wake),
    link: ramp(t, T.link, T.link + 4.6, EASE.linear) * (1 - ramp(t, T.door - 0.3, T.door + 0.6)),
    you: win(t, T.call, T.door + 0.4),
    graceD: open,
    graceL: ramp(t, T.horse, T.horse + 1.2, EASE.inOut),
  };
  const back = 1 - ramp(t, T.lesson, T.lesson + 0.8, EASE.inOut);
  return (
    <AbsoluteFill style={{background: C.night950}}>
      <Column uid="wl" left={0} state={left} dim={ramp(t, T.second, T.second + 0.8, EASE.inOut) * back} />
      <Column uid="wr" left={1080 - COL.w} state={right} dim={ramp(t, T.first, T.first + 0.8, EASE.inOut) * (1 - ramp(t, T.second, T.second + 0.8, EASE.inOut))} />
      <div style={{position: 'absolute', left: 538, top: COL.top, width: 4, bottom: 0, background: C.gold500, opacity: 0.7}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: COL.top - 2, height: 3, background: C.gold500, opacity: 0.5}} />
    </AbsoluteFill>
  );
};

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

const Small: React.FC<{t: number; at: number; out: number; text: string; y: number}> = ({t, at, out, text, y}) => (
  <Line t={t} at={at} out={out} text={text} y={y} size={44} weight={600} ls={0.2} color={C.mist} stagger={0.03} />
);
/** "THE X" (small) over what it stands for (large). */
const Pair: React.FC<{t: number; at: number; out: number; k: string; v: string; y: number; color?: string; cap?: number}> = ({t, at, out, k, v, y, color = C.gold300, cap = 120}) => (
  <>
    <Small t={t} at={at} out={out} text={k} y={y} />
    <Line t={t} at={at + 0.15} out={out} text={v} y={y + 58} cap={cap} color={color} />
  </>
);

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
  const split = ramp(t, T.stop, T.stop + 0.7, EASE.inOut);
  const home = ramp(t, T.home, T.end - 0.05, EASE.inOut);
  const o1 = T.dragon - 0.25;
  const TOPBAND = 250;
  return (
    <AbsoluteFill style={{background: C.night950, overflow: 'hidden'}}>
      {t < T.stop + 0.8 ? <Scene t={t} /> : null}
      {split > 0 ? (
        <AbsoluteFill style={{opacity: split * (1 - home)}}>
          <TwoWells t={t} />
        </AbsoluteFill>
      ) : null}
      {home > 0 ? (
        <AbsoluteFill style={{opacity: home}}>
          <Scene t={t - LOOP_SECONDS} />
        </AbsoluteFill>
      ) : null}

      {/* 0–3 · hook */}
      <HookTitle t={t} />

      {/* 3–9.6 · how he got there */}
      <Line t={t} at={T.run} out={T.jump - 0.1} text="A MAN RUNS" y={420} cap={110} />
      <Line t={t} at={T.run + 0.2} out={T.jump - 0.1} text="FROM A LION." y={532} cap={110} color={EMBER} />
      <Line t={t} at={T.jump + 0.2} out={T.lion - 0.3} text="HE JUMPS INTO A WELL" y={420} cap={96} />
      <Line t={t} at={T.caught + 0.1} out={T.lion - 0.3} text="AND CATCHES A TREE." y={500} cap={96} />

      {/* 9.6–16.2 · above, below, and the roots */}
      <Line t={t} at={T.lion + 0.2} out={o1} text="ABOVE," y={610} cap={84} />
      <Line t={t} at={T.lion + 0.35} out={o1} text="THE LION WAITS." y={696} cap={110} color={EMBER} />
      <Line t={t} at={T.dragon + 0.2} out={T.rats - 0.25} text="BELOW, A DRAGON." y={900} cap={104} color={EMBER} />
      <Line t={t} at={T.rats + 0.2} out={T.you - 0.25} text="AND TWO RATS" y={300} cap={110} />
      <Line t={t} at={T.rats + 0.4} out={T.you - 0.25} text="GNAW THE ROOTS." y={410} cap={110} />

      {/* 16.2–19.8 · it is you */}
      <Line t={t} at={T.you + 0.3} out={T.map - 0.3} text="THIS IS NOT A FAIRY TALE." y={440} cap={80} />
      <Line t={t} at={T.you + 1.5} out={T.map - 0.3} text="IT IS YOU." y={540} cap={170} color={C.gold300} />

      {/* 19.8–34.2 · what everything is */}
      <Pair t={t} at={T.map} out={T.mapTree - 0.25} k="THE WELL" v="YOUR BODY, YOUR TIME." y={420} cap={96} />
      <Pair t={t} at={T.mapTree} out={T.mapWhite - 0.25} k="THE TREE" v="YOUR LIFESPAN." y={556} cap={110} />
      <Pair t={t} at={T.mapWhite} out={T.mapBlack - 0.25} k="THE WHITE RAT" v="THE DAY." y={420} />
      <Pair t={t} at={T.mapBlack} out={T.mapLion - 0.25} k="THE BLACK RAT" v="THE NIGHT." y={420} color={NIGHT} />
      <Pair t={t} at={T.mapLion} out={T.mapDragon - 0.25} k="THE LION" v="DEATH." y={500} color={EMBER} cap={150} />
      <Pair t={t} at={T.mapDragon} out={T.faster - 0.25} k="THE DRAGON’S MOUTH" v="THE GRAVE." y={1060} color={EMBER} />

      {/* 34.2–39.6 · faster */}
      <Line t={t} at={T.faster + 0.6} out={T.stop - 0.5} text="NO ONE HAS EVER" y={300} cap={92} />
      <Line t={t} at={T.faster + 0.9} out={T.stop - 0.5} text="STOPPED THE RATS." y={396} cap={100} />

      {/* 39.6–75.6 · two brothers, the same well */}
      <Line t={t} at={T.stop + 0.9} out={T.first - 0.3} text="TWO BROTHERS FELL" y={TOPBAND - 14} cap={88} />
      <Line t={t} at={T.stop + 1.2} out={T.first - 0.3} text="INTO THIS SAME WELL." y={TOPBAND + 78} cap={88} gold={['SAME']} />
      <Chip t={t} at={T.stop + 1.6} out={T.first - 0.3} text="SAID NURSI · THE WORDS · 8TH WORD" y={TOPBAND - 66} />

      <Line t={t} at={T.first + 0.3} out={49.6} text="THE FIRST SAW" y={TOPBAND} cap={76} />
      <Line t={t} at={T.first + 0.5} out={49.6} text="ONLY ENEMIES." y={TOPBAND + 80} cap={92} color={EMBER} />
      <Line t={t} at={49.9} out={T.second - 0.3} text="NEITHER DYING NOR LIVING," y={TOPBAND} cap={68} />
      <Line t={t} at={50.2} out={T.second - 0.3} text="HE HUNG THERE IN TERROR." y={TOPBAND + 76} cap={68} color={EMBER} />

      <Line t={t} at={T.second + 0.3} out={T.link - 0.3} text="THE SECOND THOUGHT:" y={TOPBAND + 36} cap={84} />
      <Line t={t} at={T.link} out={61.5} text="“ALL THIS IS CONNECTED." y={TOPBAND} cap={76} ls={0.03} />
      <Line t={t} at={T.link + 0.3} out={61.5} text="THERE IS A SECRET HERE.”" y={TOPBAND + 80} cap={76} ls={0.03} color={C.gold300} />
      <Line t={t} at={61.8} out={T.call - 0.3} text="“SOMEONE IS TESTING ME," y={TOPBAND} cap={68} ls={0.03} />
      <Line t={t} at={62.1} out={T.call - 0.3} text="AND CALLING ME.”" y={TOPBAND + 76} cap={84} ls={0.03} color={C.gold300} />
      <Line t={t} at={T.call + 0.1} out={T.door - 0.2} text="SO HE CALLED OUT TO HIM." y={TOPBAND + 36} cap={80} />

      <Line t={t} at={T.door + 0.3} out={T.horse - 0.3} text="THE DRAGON’S MOUTH BECAME" y={TOPBAND + 4} cap={62} />
      <Line t={t} at={T.door + 0.6} out={T.horse - 0.3} text="A DOOR TO A GARDEN." y={TOPBAND + 74} cap={86} color={C.gold300} />
      <Line t={t} at={T.horse + 0.3} out={T.lesson - 0.3} text="THE LION BECAME" y={TOPBAND} cap={76} />
      <Line t={t} at={T.horse + 0.6} out={T.lesson - 0.3} text="A TAMED HORSE." y={TOPBAND + 80} cap={96} color={C.gold300} />

      {/* 75.6–81.3 · the lesson */}
      {t >= T.lesson ? <AbsoluteFill style={{background: 'radial-gradient(ellipse 76% 30% at 50% 50%, rgba(5,7,12,0.93) 0%, rgba(5,7,12,0.82) 55%, rgba(5,7,12,0) 100%)', opacity: ramp(t, T.lesson, T.lesson + 0.5) * (1 - home)}} /> : null}
      <Line t={t} at={T.lesson + 0.3} out={T.faith - 0.3} text="SAME WELL." y={780} cap={120} />
      <Line t={t} at={T.lesson + 0.9} out={T.faith - 0.3} text="SAME LION." y={900} cap={120} />
      <Line t={t} at={T.lesson + 1.5} out={T.faith - 0.3} text="SAME RATS." y={1020} cap={120} />
      <Line t={t} at={T.faith} out={T.home - 0.1} text="THE DIFFERENCE" y={820} cap={100} />
      <Line t={t} at={T.faith + 0.25} out={T.home - 0.1} text="WAS FAITH." y={930} cap={190} color={C.gold300} />

      <Vignette strength={0.36} />
      <Grain opacity={0.09} />
      <Watermark opacity={0.36} />
    </AbsoluteFill>
  );
};
