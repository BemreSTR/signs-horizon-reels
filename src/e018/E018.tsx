import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import text from '../../public/ep/e018/text.json';
import {C, FPS} from '../brand/tokens';
import {Dust, Grain, Vignette} from '../components/Atmosphere';
import {Watermark} from '../brandkit/BrandKit';
import {Outro, veil} from '../brandkit/Outro';
import {EASE, clamp, lerp, ramp} from '../lib/anim';
import '../lib/fonts';
import {Chip, Line, fit} from '../e016/Text';
import {CourtDefs, Hall, Letter, Light, Throne} from './Court';
import {Scale} from './Scales';
import {LOOP_SECONDS, MEN, Q, T, EP_FRAMES, TOTAL_FRAMES, WIT, arrival, crownAt, kf, lightVis, scaleOn, throneAt, witnessAt, zoomAt, EP_SECONDS} from './timeline';

const PBUH = text.pbuh;
const EMBER = C.emberLight;

/** The letter's flight: in from the right, a hover in front of the dais, then it lifts away when the emperor sends for the caravan. */
const letterAt = (t: number) => {
  if (t < 3.2 || t > 9.9) return null;
  const a = ramp(t, 3.3, 4.9, EASE.out);
  const out = ramp(t, 9.2, 9.8, EASE.inOut);
  const bob = 7 * Math.sin((2 * Math.PI * (t - 4.9)) / 2.4) * ramp(t, 4.9, 5.4);
  return {x: lerp(1260, 540, a), y: lerp(300, 1300, a) + bob - 60 * out, rot: lerp(24, -3, a), s: lerp(0.8, 1.12, a), op: ramp(t, 3.3, 3.6) * (1 - out), glow: ramp(t, 4.6, 5.4)};
};

const bump = (t: number, a: number, d: number) => Math.sin(Math.PI * clamp((t - a) / d)) ** 2;

/** The court (no text). A pure function of t: t < 0 is the loop pre-roll and the covers use it too. */
export const Scene: React.FC<{t: number; uid: string}> = ({t, uid}) => {
  const th = throneAt(t);
  const cr = crownAt(t);
  const w = witnessAt(t);
  const z = zoomAt(t);
  const so = scaleOn(t);
  const lt = letterAt(t);
  const say = bump(t, T.men + 1.8, 0.7); // "if he lies, say so": the men stir
  const ripples: number[] = [];
  Q.forEach((q) => {
    if (q.items) q.items.forEach((d) => ripples.push(q.t0 + d));
    else ripples.push(q.t0 + q.ans);
  });
  return (
    <AbsoluteFill style={{background: C.night950, overflow: 'hidden'}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <CourtDefs uid={uid} />
        <g transform={`translate(540 1100) scale(${z}) translate(-540 -1100)`}>
          <Hall uid={uid} t={t} floorY={th.y} k={th.k} op={th.hall} />
          <Throne uid={uid} cx={540} y={th.y} k={th.k} op={th.op} glow={cr.glow} lift={cr.lift} t={t} />
          {lt ? (
            <g transform={`translate(${lt.x} ${lt.y}) rotate(${lt.rot}) scale(${lt.s})`} opacity={lt.op}>
              <Letter uid={uid} t={t} glow={lt.glow} />
            </g>
          ) : null}
          {/* the caravan: the leader first, then his men, filing in behind him */}
          {new Array(MEN + 1).fill(0).map((_, i) => {
            const fx = i === 0 ? 540 : 540 + (i - 4) * 74;
            const fy = i === 0 ? w.y : w.compY;
            const p = arrival(t, i);
            const x = lerp(1240 + i * 34, fx, p);
            const y = lerp(fy + 70, fy, p);
            const vis = lightVis(t, i) * (1 - w.away);
            const r = i === 0 ? lerp(24, 28, ramp(t, T.q1 - 1.2, T.q1) * (1 - ramp(t, T.home - 1.2, T.home))) : 8.5 * (1 + 0.35 * say);
            return <Light key={i} uid={uid} x={x} y={y} r={r} op={vis} gold={i === 0 ? w.gold : 0} flick={i === 0 ? w.flicker : 0.5 * w.flicker} t={t} seed={i * 1.7} />;
          })}
          {/* each answer ripples out of the witness */}
          {ripples.map((rt, i) => {
            const u = (t - rt) / 1.0;
            if (u < 0 || u > 1) return null;
            return <circle key={i} cx={540} cy={w.y} r={30 + 190 * EASE.out(u)} fill="none" stroke={w.gold > 0.5 ? C.gold300 : C.ivory} strokeWidth={3 * (1 - u) + 0.5} opacity={0.55 * (1 - u) * (1 - w.away)} />;
          })}
        </g>
        <Scale uid={uid} t={t} cx={540} cy={640} op={so} />
      </svg>
      <Dust t={t} count={46} seed="c18" color={C.gold300} opacity={0.5} area={[60, 300, 1020, 1500]} />
    </AbsoluteFill>
  );
};

/** Several lines at one size (the longest decides), stacked from y; lines arrive a beat of a beat apart and leave together. */
const Stack: React.FC<{t: number; at: number; out: number; lines: string[]; y: number; cap?: number; color?: string; last?: string; gold?: string[]; gap?: number; stagger?: number; italic?: boolean; weight?: 500 | 600 | 700}> = ({
  t, at, out, lines, y, cap = 84, color = C.ivory, last, gold, gap = 1.1, stagger = 0.16, italic = false, weight = 700,
}) => {
  const size = Math.min(...lines.map((l) => fit(l, cap, String(weight), 0.05)));
  return (
    <>
      {lines.map((l, i) => (
        <Line key={i} t={t} at={at + i * stagger} out={out} text={l} y={y + i * size * gap} size={size} color={last && i === lines.length - 1 ? last : color} gold={gold} italic={italic} weight={weight} stagger={0.05} />
      ))}
    </>
  );
};

const Small: React.FC<{t: number; at: number; out: number; text: string; y: number}> = ({t, at, out, text, y}) => (
  <Line t={t} at={at} out={out} text={text} y={y} size={42} weight={600} ls={0.2} color={C.mist} stagger={0.03} />
);

/** The opening claim; its punch starts 0.15 s before frame 0 so the loop flows into it. */
const HookTitle: React.FC<{t: number}> = ({t}) => {
  if (t < -0.2 || t > T.hookOut + 0.6) return null;
  const p = ramp(t, -0.15, 0.12, EASE.out);
  const o = T.hookOut - 0.1 + 9;
  return (
    <AbsoluteFill style={{opacity: p, scale: String(1.12 - 0.12 * p), transformOrigin: '50% 22%'}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,7,12,0.86) 0%, rgba(5,7,12,0.76) 30%, rgba(5,7,12,0) 48%)', opacity: 1 - ramp(t, T.hookOut, T.hookOut + 0.5)}} />
      <Line t={t + 9} at={0} out={o} text="A CHRISTIAN EMPEROR" y={252} size={56} stagger={0} />
      <Line t={t + 9} at={0} out={o} text="PUT THE ENEMY OF" y={322} size={56} stagger={0} />
      <Line t={t + 9} at={0} out={o} text={`MUHAMMAD ${PBUH}`} y={388} size={90} color={C.gold300} stagger={0} />
      <Line t={t + 9} at={0} out={o} text="ON TRIAL." y={504} size={138} stagger={0} />
    </AbsoluteFill>
  );
};

/** One question's text: the question, the witness's answer, and the emperor's reasoning. */
const QUESTIONS: {q: string[]; ans?: string; inf?: string[]; cap?: number}[] = [
  {q: ['DID YOU EVER ACCUSE', 'HIM OF LYING', 'BEFORE HIS CLAIM?'], ans: 'NO.', inf: ['A MAN WHO NEVER LIED', 'ABOUT PEOPLE WILL', 'NOT LIE ABOUT ALLAH.']},
  {q: ['DOES HE EVER', 'BREAK HIS WORD?'], ans: 'NO.', inf: ['“MESSENGERS', 'NEVER BETRAY.”']},
  {q: ['WHO FOLLOWS HIM:', 'THE NOBLES,', 'OR THE WEAK?'], ans: 'THE WEAK.', inf: ['THE WEAK ARE THE', 'FOLLOWERS OF', 'MESSENGERS.']},
  {q: ['DOES ANYONE LEAVE', 'HIS RELIGION', 'OUT OF RESENTMENT?'], ans: 'NO.', inf: ['SUCH IS FAITH WHEN', 'ITS SWEETNESS MIXES', 'WITH THE HEART.']},
  {q: ['WHAT DOES HE', 'COMMAND YOU?']},
];

const QBlock: React.FC<{t: number; i: number}> = ({t, i}) => {
  const c = Q[i];
  const d = QUESTIONS[i];
  const a = c.t0;
  const out = a + c.out;
  return (
    <>
      <Stack t={t} at={a} out={out} lines={d.q} y={290} cap={86} />
      {d.ans ? <Line t={t} at={a + c.ans} out={out} text={d.ans} y={1112} cap={118} color={C.ivory} /> : null}
      {i === 1 ? <Stack t={t} at={a + (c.truce ?? 0)} out={a + c.inf - 0.3} lines={['“WE ARE AT TRUCE.', 'WHO KNOWS WHAT', 'HE WILL DO?”']} y={1252} cap={52} color={C.mist} italic weight={600} gap={1.12} /> : null}
      {d.inf ? (
        <>
          <Chip t={t} at={a + c.inf} out={out} text="HERACLIUS REASONS:" y={1252} size={24} color={C.gold500} />
          <Stack t={t} at={a + c.inf + 0.2} out={out} lines={d.inf} y={1294} cap={58} color={C.gold300} gap={1.08} />
        </>
      ) : null}
      {c.items ? (
        <>
          <Line t={t} at={a + c.items[0]} out={out} text="WORSHIP ALLAH ALONE." y={1112} size={54} color={C.ivory} />
          <Line t={t} at={a + c.items[1]} out={out} text="NOTHING BESIDE HIM." y={1198} size={54} color={C.ivory} />
          <Line t={t} at={a + c.items[2]} out={out} text="PRAYER, TRUTHFULNESS," y={1284} size={54} color={C.ivory} stagger={0.06} />
          <Line t={t} at={a + c.items[2] + 0.2} out={out} text="CHASTITY, FAMILY TIES." y={1360} size={54} color={C.ivory} stagger={0.06} />
        </>
      ) : null}
    </>
  );
};

const LIST = ['EVER CALLED A LIAR?', 'EVER BREAK HIS WORD?', 'WHO FOLLOWS HIM?', 'DOES ANYONE LEAVE?', 'WHAT DOES HE COMMAND?'];
/** The finale's blank answers: each question returns to the viewer with an empty line and a light waiting on it. */
const Blanks: React.FC<{t: number}> = ({t}) => {
  const out = T.home - 0.8;
  const size = Math.min(...LIST.map((l) => fit(l, 54, '700', 0.05)));
  return (
    <>
      {LIST.map((l, i) => {
        const at = T.finale + 1.2 + i * 0.6;
        const o = ramp(t, at, at + 0.4, EASE.out) * (1 - ramp(t, out, out + 0.36, EASE.inOut));
        if (o <= 0) return null;
        const y = 640 + i * 124;
        const pulse = 0.55 + 0.45 * Math.sin(t * 3.1 + i * 1.3);
        return (
          <div key={i} style={{position: 'absolute', left: 0, right: 0, top: y, opacity: o, translate: `0px ${(1 - o) * 18}px`}}>
            <Line t={t} at={at} out={out} text={l} y={0} size={size} color={C.ivory} stagger={0.04} />
            <svg width={1080} height={70} style={{position: 'absolute', left: 0, top: size * 1.05 + 4}}>
              <line x1={330} x2={750} y1={30} y2={30} stroke={C.gold500} strokeWidth={3} strokeDasharray="14 12" opacity={0.75} />
              <circle cx={540} cy={30} r={22 * pulse + 6} fill={C.gold300} opacity={0.18 * pulse} />
              <circle cx={540} cy={30} r={7} fill={C.gold300} opacity={0.5 + 0.5 * pulse} />
            </svg>
          </div>
        );
      })}
    </>
  );
};

/** E018 · The Emperor's Questions. Text, music and effects only. */
export const E018: React.FC = () => {
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
          from={[WIT.x, WIT.hookY]}
        />
        <Vignette strength={0.36} />
        <Grain opacity={0.09} />
        <Watermark opacity={0.36 * (1 - veil(sting))} />
      </AbsoluteFill>
    );
  }
  const home = ramp(t, T.home, EP_SECONDS - 0.05, EASE.inOut);
  const topShade = ramp(t, 2.6, 3.4) * (1 - ramp(t, T.home - 0.2, T.home + 0.4));
  const lowShade = kf(t, [[T.q1 - 1.0, 0], [T.q1, 1], [T.lens - 0.2, 1], [T.lens + 0.8, 0.15], [T.finale, 0.15]]) * (1 - ramp(t, T.home - 0.2, T.home + 0.4));
  const V = T.verdict;
  const L = T.lens;
  const F = T.finale;
  return (
    <AbsoluteFill style={{background: C.night950, overflow: 'hidden'}}>
      <Scene t={t} uid="a" />
      {home > 0 ? (
        <AbsoluteFill style={{opacity: home}}>
          <Scene t={t - LOOP_SECONDS} uid="b" />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,7,12,0.8) 0%, rgba(5,7,12,0.66) 30%, rgba(5,7,12,0) 46%)', opacity: topShade}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,7,12,0) 53%, rgba(5,7,12,0.62) 60%, rgba(5,7,12,0.62) 79%, rgba(5,7,12,0) 85%)', opacity: lowShade}} />

      {/* 0–3 · hook */}
      <HookTitle t={t} />

      {/* 3–22 · how it began */}
      <Chip t={t} at={3.4} out={6.2} text="SAHIH AL-BUKHARI 7 · OUR TRANSLATION" y={226} />
      <Stack t={t} at={3.2} out={6.2} lines={['JERUSALEM.', 'EMPEROR HERACLIUS', 'RECEIVES A LETTER', 'FROM ARABIA.']} y={270} cap={80} last={C.gold300} />
      <Stack t={t} at={6.6} out={9.4} lines={['ITS WRITER CLAIMS', 'TO BE A PROPHET.']} y={290} cap={84} last={C.gold300} />
      <Stack t={t} at={9.8} out={13.0} lines={['HE SUMMONS THE MAN’S', 'FIERCEST ENEMY:', 'ABU SUFYAN.']} y={270} cap={80} last={EMBER} />
      <Stack t={t} at={13.6} out={16.9} lines={['BEHIND HIM, HIS MEN:', '“IF HE LIES,', 'SAY SO.”']} y={290} cap={84} last={C.gold300} />
      <Chip t={t} at={T.admit} out={21.8} text="ABU SUFYAN, LATER" y={236} />
      <Stack t={t} at={T.admit + 0.1} out={21.8} lines={['“I WOULD HAVE LIED.', 'I WAS ASHAMED TO BE', 'CALLED A LIAR.”']} y={290} cap={84} last={EMBER} />

      {/* 22–64 · five questions */}
      <Chip t={t} at={T.q1} out={T.q1 + 4.4} text="THE EMPEROR WEIGHS EACH ANSWER" y={226} />
      {[0, 1, 2, 3, 4].map((i) => (
        <QBlock key={i} t={t} i={i} />
      ))}

      {/* 64–74 · the verdict */}
      <Small t={t} at={V + 0.2} out={V + 4.2} text="THE EMPEROR’S VERDICT" y={1150} />
      <Stack t={t} at={V + 0.6} out={V + 4.2} lines={['“HE WILL SOON RULE', 'THE GROUND UNDER', 'MY FEET.”']} y={1226} cap={74} />
      <Stack t={t} at={V + 4.8} out={V + 9.2} lines={['“IF I COULD', 'REACH HIM, I WOULD', 'WASH HIS FEET.”']} y={1190} cap={86} color={C.gold300} />

      {/* 74–81 · the honest lens */}
      <Stack t={t} at={L + 0.2} out={L + 3.0} lines={['HIS COURT ERUPTED.', 'HE KEPT HIS THRONE.']} y={300} cap={84} last={C.mist} />
      <Stack t={t} at={L + 3.4} out={L + 6.9} lines={['THE ENEMY ON THE', 'STAND LATER', 'ENTERED ISLAM.']} y={290} cap={84} last={C.gold300} />

      {/* 81–89.4 · ask them yourself */}
      <Stack t={t} at={F + 0.2} out={F + 3.3} lines={['THE WITNESS', 'WAS AN ENEMY.']} y={270} cap={84} last={EMBER} />
      <Stack t={t} at={F + 0.6} out={F + 3.3} lines={['THE JUDGE WAS A', 'CHRISTIAN EMPEROR.']} y={438} cap={84} last={C.gold300} />
      <Stack t={t} at={F + 3.9} out={F + 7.0} lines={['NOW ASK THE SAME', 'QUESTIONS YOURSELF.']} y={290} cap={92} last={C.gold300} />
      <Blanks t={t} />

      <Vignette strength={0.36} />
      <Grain opacity={0.09} />
      <Watermark opacity={0.36} />
    </AbsoluteFill>
  );
};
