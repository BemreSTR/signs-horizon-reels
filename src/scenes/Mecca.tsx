import React from 'react';
import {AbsoluteFill} from 'remotion';
import {noise2D} from '@remotion/noise';
import {C, FONT, TEXT_COLUMN} from '../brand/tokens';
import {Dust, Glow, Stars} from '../components/Atmosphere';
import {ArabicLine, RefChip} from '../components/Typography';
import {EASE, clamp, lerp, ramp} from '../lib/anim';
import {cue, wordAt} from '../lib/data';
import verse from '../../public/ep/e015/verse.json';

/** Where the lone light of Abu Lahab sits (screen space), shared with the Passage scene. */
export const EMBER = {x: 540, y: 1102};

const DECREE = verse.excerpts.decree.words; // 111:3 from verse.json (H81)
const MEAL = verse.verses['111:3'].translation;

const Contours: React.FC<{t: number}> = ({t}) => {
  const rows = 24;
  const out: React.ReactNode[] = [];
  for (let j = 0; j < rows; j++) {
    const base = 1130 + j * 26;
    const amp = 40 + j * 7;
    const pts: string[] = [];
    for (let x = -40; x <= 1120; x += 20) {
      const edge = Math.abs(x - 540) / 540;
      const valley = 0.12 + 0.88 * edge ** 1.25;
      const n = noise2D('mecca', x * 0.0032, j * 0.13 + t * 0.035);
      const n2 = noise2D('mecca2', x * 0.011, j * 0.21);
      pts.push(`${x},${(base - amp * valley * (0.55 + 0.55 * n) - 6 * n2).toFixed(1)}`);
    }
    const line = pts.join(' ');
    const op = 0.16 + 0.5 * (j / rows) ** 1.4;
    out.push(
      <g key={j}>
        <polygon points={`${line} 1120,1960 -40,1960`} fill={C.night950} opacity={0.94} />
        <polyline points={line} fill="none" stroke={j % 5 === 0 ? C.gold400 : C.gold500} strokeWidth={j % 5 === 0 ? 2.4 : 1.5} opacity={op} />
      </g>,
    );
  }
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {out}
    </svg>
  );
};

const CityLights: React.FC<{t: number}> = ({t}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    {new Array(34).fill(0).map((_, i) => {
      const x = 380 + 320 * ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 320;
      const y = 1600 + 90 * ((Math.sin(i * 78.233) * 12345.6789) % 1 + 1) % 90;
      const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * (0.9 + (i % 5) * 0.4) + i));
      return <circle key={i} cx={x} cy={y} r={1.6 + (i % 3) * 0.7} fill={C.gold300} opacity={0.55 * tw} />;
    })}
  </svg>
);

const Meal: React.FC<{text: string}> = ({text}) => (
  <>
    {text.split(/(\[[^\]]+\])/).map((part, i) =>
      part.startsWith('[') ? (
        <span key={i} style={{color: C.mist, opacity: 0.95}}>
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      ),
    )}
  </>
);

/** Mecca by night: layered topographic contours, the decree (111:3) in gold on the sky, then the lone light that is still alive. */
export const Mecca: React.FC<{t: number}> = ({t}) => {
  const tRev = wordAt(13, 'declared') - 0.45; // verse starts to ink in as "declared" is spoken
  const tBurn = wordAt(22, 'burn');
  const tBlaze = cue('blazing');
  const tCond = cue('condemned');
  const tAlive = wordAt(31, 'alive');
  const cam = 1.02 + 0.04 * ramp(t, 3.9, 15);
  const camY = lerp(40, -30, ramp(t, 3.9, 15, EASE.inOut));
  // verse group: fully readable ~1 s after the sentence ends (11.96), then recedes under "condemned ... alive"
  const verseOut = 1 - 0.78 * ramp(t, 12.95, 13.55, EASE.inOut);
  const mealIn = ramp(t, wordAt(17, 'fiercest') + 0.15, wordAt(17, 'fiercest') + 0.75, EASE.out);
  const chipIn = ramp(t, tRev + 1.2, tRev + 1.7, EASE.out);
  const gold1 = ramp(t, tBurn - 0.05, tBurn + 0.35);
  const gold2 = ramp(t, tBlaze - 0.05, tBlaze + 0.35);
  const GOLD = C.gold400;
  // the lone light
  const aliveIn = ramp(t, tAlive - 0.12, tAlive + 0.5, EASE.out);
  const beat = (tb: number) => Math.exp(-((t - tb) ** 2) / 0.0035);
  const pulse = 1 + 0.05 * Math.sin(t * 3) + 0.38 * beat(tAlive + 0.12) + 0.3 * beat(tAlive + 0.42);
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.night950} 0%, ${C.night900} 34%, ${C.night800} 58%, #1A2236 74%, ${C.night900} 100%)`, overflow: 'hidden'}}>
      <AbsoluteFill style={{transformOrigin: '540px 960px', scale: String(cam), translate: `0px ${camY}px`}}>
        <Stars t={t} n={170} seed="mecca" maxY={1050} />
        <Glow x={540} y={1330} r={820} color={C.desertLight} opacity={0.2} />
        {/* the decree "in the sky": soft gold haze behind the verse */}
        <Glow x={540} y={720} r={560} color={C.gold700} opacity={0.34 * ramp(t, tRev, tRev + 1.4) * verseOut} />
        <Contours t={t} />
        <CityLights t={t} />
        <Dust t={t} count={34} seed="mdust" opacity={0.7} area={[0, 200, 1080, 1500]} />
      </AbsoluteFill>
      {/* verse stage (no camera shake on verse text) */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, opacity: verseOut}}>
        <div style={{position: 'absolute', left: 90, right: 90, top: 420}}>
          <ArabicLine
            t={t}
            words={DECREE.slice(0, 2)}
            styles={[
              {at: tRev, color: C.ivory},
              {at: tRev + 0.35, color: gold1 > 0.5 ? GOLD : C.ivory},
            ]}
            size={96}
            inkSeconds={1.1}
          />
        </div>
        <div style={{position: 'absolute', left: 90, right: 90, top: 604}}>
          <ArabicLine
            t={t}
            words={DECREE.slice(2, 4)}
            styles={[
              {at: tRev + 0.75, color: C.ivory},
              {at: tRev + 1.1, color: gold2 > 0.5 ? GOLD : C.ivory},
            ]}
            size={96}
            inkSeconds={1.1}
          />
        </div>
        {/* gold glow under the words that just turned gold */}
        <Glow x={400} y={520} r={190} color={C.gold400} opacity={0.16 * gold1} />
        <Glow x={420} y={704} r={190} color={C.gold400} opacity={0.16 * gold2} />
        <div
          style={{
            position: 'absolute',
            left: TEXT_COLUMN.x0,
            width: TEXT_COLUMN.w,
            top: 880,
            textAlign: 'center',
            fontFamily: FONT.display,
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 48,
            lineHeight: 1.18,
            color: C.ivory,
            opacity: mealIn,
            translate: `0px ${(1 - mealIn) * 14}px`,
            textShadow: '0 3px 24px rgba(0,0,0,0.9)',
          }}
        >
          <Meal text={MEAL} />
        </div>
        <div style={{position: 'absolute', left: TEXT_COLUMN.x0, width: TEXT_COLUMN.w, top: 1042}}>
          <RefChip text="QUR'AN 111:3 · SAHEEH INTERNATIONAL" opacity={chipIn} size={25} />
        </div>
      </div>
      {/* the lone light (a person is only ever a point of light), still alive */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: aliveIn}}>
        <defs>
          <radialGradient id="emb">
            <stop offset="0" stopColor="#FFE9BE" />
            <stop offset="0.28" stopColor="#F0A25F" stopOpacity={0.9} />
            <stop offset="0.6" stopColor={C.emberLight} stopOpacity={0.35} />
            <stop offset="1" stopColor={C.emberLight} stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx={EMBER.x} cy={EMBER.y} r={120 * pulse} fill="url(#emb)" />
        <circle cx={EMBER.x} cy={EMBER.y} r={13 * pulse} fill="#FFF1D6" />
      </svg>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,7,12,0.0) 70%, rgba(5,7,12,0.55) 100%)'}} />
      <div style={{display: 'none'}}>{clamp(tCond)}</div>
    </AbsoluteFill>
  );
};
