import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {C} from '../brand/tokens';
import {Dust, Stars} from '../components/Atmosphere';
import {EASE, clamp, lerp, ramp} from '../lib/anim';
import {Pomegranate, TARGET_ARIL} from './Pomegranate';
import {Chip, Line, Reel, ReelStep} from './Text';
import {HERO, T, breathe} from './timeline';

const PRICE: ReelStep[] = [
  {at: -9, lines: ['A COIN']},
  {at: 0.2, lines: ['A PURSE']},
  {at: 0.4, lines: ['A HOUSE']},
  {at: 0.6, lines: ['A CITY']},
  {at: 0.8, lines: ['A KINGDOM']},
  {at: 1.0, lines: ['AN EMPIRE']},
  {at: T.slam, lines: ['THE WHOLE', 'WORLD'], slam: true},
];

const TARGET = TARGET_ARIL(HERO.r);

/** Scene 1 (0–7.2 s, and the loop pre-roll for t < 0): the hero pomegranate, the price reel, the opening, the dive into one aril. */
export const Hook: React.FC<{t: number}> = ({t}) => {
  const sl = t - T.slam;
  const thump = sl >= 0 ? Math.exp(-sl / 0.22) : 0;
  const s = breathe(t) * (1 + 0.05 * thump);
  const titleIn = ramp(t, -0.15, 0.12, EASE.out);
  const crack = ramp(t, T.crack, T.crack + 0.5, EASE.out);
  const open = ramp(t, T.open, T.open + 1.5, EASE.glide);
  const dive = ramp(t, T.dive, T.tree + 0.1, EASE.snap);
  const zoom = lerp(1, 11, dive);
  const tx = HERO.x + TARGET.x * s;
  const ty = HERO.y + TARGET.y * s;
  const gold = ramp(t, 6.0, 6.9, EASE.inOut);
  const ring = sl >= 0 && sl < 0.9 ? sl / 0.9 : -1;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 90% 60% at 50% 60%, #150B10 0%, ${C.night950} 70%)`}}>
      <AbsoluteFill style={{transformOrigin: `${tx}px ${ty}px`, scale: String(zoom), translate: `${(540 - tx) * dive}px ${(960 - ty) * dive}px`}}>
        <Stars t={t} n={90} seed="hk" maxY={700} opacity={0.5} />
        <Pomegranate x={HERO.x} y={HERO.y} r={HERO.r} t={t} scale={s} open={open} crack={crack} goldAril={gold} lit={1 + 0.5 * thump} />
        <Dust t={t} count={46} seed="hd" color={C.gold300} opacity={0.55} area={[120, 500, 960, 1700]} />
        {ring >= 0 ? (
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
            <circle cx={HERO.x} cy={HERO.y} r={HERO.r * (1 + 1.5 * EASE.out(ring))} fill="none" stroke={C.gold300} strokeWidth={5 * (1 - ring)} opacity={0.7 * (1 - ring)} />
            {new Array(34).fill(0).map((_, i) => {
              const a = random(`hb${i}`) * Math.PI * 2;
              const d = HERO.r * (1.02 + (0.5 + 1.1 * random(`hd${i}`)) * EASE.out(ring));
              return <circle key={i} cx={HERO.x + d * Math.cos(a)} cy={HERO.y + d * Math.sin(a) * 0.96} r={2 + 3 * random(`hr${i}`)} fill={C.gold300} opacity={0.9 * (1 - ring)} />;
            })}
          </svg>
        ) : null}
      </AbsoluteFill>
      {/* hook: the label and the price reel (t < 0 is the loop pre-roll: the punch starts at -0.15) */}
      {t >= -0.2 && t < T.hookOut + 0.6 ? (
        <AbsoluteFill style={{opacity: titleIn, scale: String(1.12 - 0.12 * titleIn), transformOrigin: '50% 22%'}}>
          <Line t={t + 9} at={0} out={T.hookOut - 0.1 + 9} text="ONE POMEGRANATE" y={236} cap={84} ls={0.06} stagger={0} />
          <Reel t={t} steps={PRICE} y={338} cap={150} out={T.hookOut - 0.1} />
        </AbsoluteFill>
      ) : null}
      <Line t={t} at={3.4} out={4.85} text="A CLAIM BY" y={250} size={54} weight={600} ls={0.2} color={C.mist} />
      <Line t={t} at={3.55} out={4.85} text="SAID NURSI." y={322} cap={128} color={C.gold300} />
      <Chip t={t} at={3.9} out={4.85} text="THE WORDS · 22ND WORD" y={476} />
      <Line t={t} at={5.15} out={6.7} text="HERE IS" y={262} cap={96} />
      <Line t={t} at={5.25} out={6.7} text="HIS REASONING." y={366} cap={96} />
      {dive > 0.55 ? <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, #FFF6DA 0%, ${C.gold300} 45%, ${C.gold500} 100%)`, opacity: 0.6 * clamp((dive - 0.55) / 0.4)}} /> : null}
    </AbsoluteFill>
  );
};
