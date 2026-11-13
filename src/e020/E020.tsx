import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import verse from '../../public/ep/e020/verse.json';
import {FPS} from '../brand/tokens';
import {Dust, Grain, Vignette} from '../components/Atmosphere';
import {ArabicLine} from '../components/Typography';
import {Watermark} from '../brandkit/BrandKit';
import {Outro, veil} from '../brandkit/Outro';
import {EASE, clamp, lerp, ramp} from '../lib/anim';
import '../lib/fonts';
import {CUE, EP_FRAMES, LOOP_SECONDS, T, TOTAL_FRAMES, WIPES, kf, punch} from './timeline';
import {HexBurst, HexField, HexShape, HexWipe} from './Hex';
import {F, K} from './tokens';
import {measureText} from '@remotion/layout-utils';
import {Slam, Tag, fitA, fitB} from './Type';

const IMG_H = 1935; // 1438x2576 photo covering 1080 wide

/** A photo (or cut-out) covering the frame, with a camera: scale s about (ox, oy), shifted by (x, y). */
const Photo: React.FC<{src: string; s?: number; x?: number; y?: number; ox?: number; oy?: number; rot?: number; grade?: boolean}> = ({src, s = 1, x = 0, y = 0, ox = 540, oy = 960, rot = 0, grade = true}) => (
  <Img
    src={staticFile(`ep/e020/${src}`)}
    style={{
      position: 'absolute',
      left: 0,
      top: (1920 - IMG_H) / 2,
      width: 1080,
      height: IMG_H,
      transformOrigin: `${ox}px ${oy - (1920 - IMG_H) / 2}px`,
      transform: `translate(${x}px, ${y}px) scale(${s}) rotate(${rot}deg)`,
      filter: grade ? 'saturate(1.1) contrast(1.04)' : undefined,
    }}
  />
);

const Fill: React.FC<{children: React.ReactNode}> = ({children}) => <AbsoluteFill style={{overflow: 'hidden'}}>{children}</AbsoluteFill>;

/** Size that fits the longest of several lines into `w`. */
const same = (lines: string[], cap: number, w = 664) => Math.min(...lines.map((l) => fitA(l, cap, w)));

/* ------------------------------------------------------------------ 0–3 · hook */
const HOOK_O: [number, number] = [470, 980];
/** Before frame 0 the camera already sits where the first hit's kick puts it (1.04 + 0.035), so the loop seam has no jump in scale. */
const hookScale = (t: number) => (t < 0 ? 1.075 + 0.01 * t : kf(t, [[0, 1.04], [3.0, 1.22]], EASE.linear));
const THAT = fitA('THAT', 520, 700);
const BEE = Math.round(THAT * 1.12);
const BEE_W = measureText({text: 'BEE', fontFamily: 'Anton', fontSize: BEE, fontWeight: '400', letterSpacing: '0.01em'}).width;
const SHE = fitA('SHE.', 560, 640);
const ISA = fitA('IS A', 150, 360);

const Hook: React.FC<{t: number}> = ({t}) => {
  const s = hookScale(t) + punch(t, 0, 0.035) + punch(t, 0.5, 0.025) + punch(t, CUE.isASHE, 0.04) + punch(t, CUE.heart, 0.03);
  const drift = kf(t, [[-3, 0], [0, 0], [3, -26]], EASE.linear);
  const glow = '0 0 50px rgba(255,255,255,0.75), 0 0 14px rgba(255,255,255,0.6)';
  const heart = 1 + punch(t, CUE.heart, 0.05, 0.3);
  return (
    <Fill>
      <Photo src="hero.jpg" s={s} ox={HOOK_O[0]} oy={HOOK_O[1]} />
      {/* THAT BEE sits BEHIND the bee */}
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${drift}px)`}}>
        <Slam t={t} at={-0.15} text="THAT" y={196} size={THAT} color={K.ink} slab={null} textShadow={glow} kick={0.3} />
        <Slam t={t} at={CUE.bee} text="BEE" y={196 + THAT * 0.86} size={BEE} color={K.ink} slab={null} textShadow={glow} kick={0.3} dx={-(720 - BEE_W) / 2} />
      </div>
      <Photo src="hero_cut.png" s={s} ox={HOOK_O[0]} oy={HOOK_O[1]} />
      <Dust t={t} count={22} seed="h20" color="#FFF6D8" opacity={0.7} />
      <div style={{transform: `scale(${heart})`, transformOrigin: '50% 1250px'}}>
        <Slam t={t} at={CUE.isASHE} text="IS A" y={1040} size={ISA} color={K.white} slab={K.ink} padX={26} kick={0.25} />
        <Slam t={t} at={CUE.isASHE + 0.07} text="SHE." y={1040 + ISA * 1.2} size={SHE} color={K.honey} slab={K.ink} padX={34} padY={0} kick={0.3} />
      </div>
    </Fill>
  );
};

/* ------------------------------------------------------------------ 3–6 · meadow */
const Meadow: React.FC<{t: number}> = ({t}) => {
  const lt = t - T.meadow;
  const s = 1.02 + 0.2 * (lt / 3) + punch(t, CUE.foraging, 0.03) + punch(t, CUE.areFemale, 0.03);
  const sz = same(['FORAGING HONEYBEES', 'ARE FEMALE.'], 120);
  return (
    <Fill>
      <Photo src="meadow.jpg" s={s} ox={540} oy={1050} x={-lt * 8} />
      <Dust t={t} count={26} seed="m20" color="#FFF6D8" opacity={0.6} />
      <Slam t={t} at={CUE.foraging} out={T.drone} text="FORAGING HONEYBEES" y={300} size={sz} color={K.ink} slab={K.honey} />
      <Slam t={t} at={CUE.areFemale} out={T.drone} text="ARE FEMALE." y={300 + sz * 1.3} size={sz} color={K.white} slab={K.ink} dx={22} />
    </Fill>
  );
};

/* ------------------------------------------------------------------ 6–8.5 · drone (a poster) */
const Drone: React.FC<{t: number}> = ({t}) => {
  const lt = t - T.drone;
  const pop = ramp(lt, 0, 0.26, EASE.out);
  const spring = 1 + 0.08 * Math.sin(Math.PI * clamp(lt / 0.26)) * (1 - pop);
  const s = (0.55 + 0.45 * pop) * spring * (1 + 0.035 * lt) + punch(t, CUE.dontForage, 0.04);
  const rot = (1 - pop) * -7;
  const sz = fitA('THE MALES', 400, 700);
  return (
    <Fill>
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 80% 55% at 50% 46%, ${K.honeyPale} 0%, ${K.honey} 50%, ${K.honeyDeep} 100%)`}} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 0.16}}>
        <defs>
          <pattern id="dp" width="193.9" height="336" patternUnits="userSpaceOnUse">
            <polygon points="96.9,0 193.9,56 193.9,168 96.9,224 0,168 0,56" fill="none" stroke={K.ink} strokeWidth={5} transform="translate(0 -56)" />
            <polygon points="96.9,168 193.9,224 193.9,336 96.9,392 0,336 0,224" fill="none" stroke={K.ink} strokeWidth={5} transform="translate(0 -56)" />
          </pattern>
        </defs>
        <rect width={1080} height={1920} fill="url(#dp)" />
      </svg>
      <Slam t={t} at={CUE.males} text="THE MALES" y={236} size={sz} color={K.ink} slab={null} kick={0.28} />
      <div style={{position: 'absolute', inset: 0, transform: `translateY(150px) rotate(${rot}deg)`, transformOrigin: '540px 900px'}}>
        <Photo src="drone_cut.png" s={s} ox={560} oy={960} grade={false} />
      </div>
      <Slam t={t} at={CUE.dontForage} text="DON'T FORAGE." y={1360} size={same(["DON'T FORAGE."], 130, 640)} color={K.white} slab={K.ink} padX={30} />
    </Fill>
  );
};

/* ------------------------------------------------------------------ 8.5–10.5 · workers */
const Workers: React.FC<{t: number}> = ({t}) => {
  const lt = t - T.workers;
  const s = 1.06 + 0.16 * (lt / 2) + punch(t, CUE.workersL1, 0.03) + punch(t, CUE.workersL2, 0.03);
  const sz = same(['EVERY WORKER', 'IS FEMALE.'], 130);
  return (
    <Fill>
      <Photo src="workers.jpg" s={s} ox={620} oy={900} x={-lt * 14} />
      <Dust t={t} count={18} seed="w20" color="#FFE9A8" opacity={0.6} />
      <Slam t={t} at={CUE.workersL1} out={T.chapter} text="EVERY WORKER" y={1040} size={sz} color={K.ink} slab={K.honey} rot={-1.5} />
      <Slam t={t} at={CUE.workersL2} out={T.chapter} text="IS FEMALE." y={1040 + sz * 1.3} size={sz} color={K.white} slab={K.ink} dx={26} rot={-1.5} />
    </Fill>
  );
};

/* ------------------------------------------------------------------ 10.5–14 · the question */
const TITLE = verse.title[0];
const Chapter: React.FC<{t: number}> = ({t}) => {
  const lt = t - T.chapter;
  const pop = ramp(lt, 0, 0.3, EASE.out);
  const q1 = 'HOW DOES THE QUR’AN';
  const q2 = 'SPEAK TO THE BEE?';
  const sz = same([q1, q2], 120);
  return (
    <Fill>
      <HexField t={t} seed="ch" lit={9} />
      <HexShape x={540} y={760} r={360 + 30 * (1 - pop)} stroke={K.honey} sw={10} opacity={pop} />
      <HexShape x={540} y={760} r={330} fill={K.honey} opacity={0.1 * pop} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, opacity: pop, transform: `scale(${1.2 - 0.2 * pop})`, transformOrigin: '50% 760px'}}>
        <ArabicLine t={t} words={[TITLE]} styles={[{at: T.chapter, color: K.white}]} size={250} inkSeconds={0.45} />
      </div>
      <HexBurst t={t} at={T.chapter} x={540} y={760} r0={300} r1={900} />
      <Tag t={t} at={T.chapter} text="QUR’AN 16:68–69" y={250} size={40} color={K.honey} />
      <Slam t={t} at={CUE.q1} text={q1} y={1180} size={sz} color={K.ink} slab={K.honey} />
      <Slam t={t} at={CUE.q2} text={q2} y={1180 + sz * 1.3} size={sz} color={K.ink} slab={K.white} dx={24} />
    </Fill>
  );
};

/* ------------------------------------------------------------------ 14–23 · the verse */
const PHRASES = verse.phrases;
const PH_AT = [T.verse, T.p2, T.p3];
const Verse: React.FC<{t: number}> = ({t}) => {
  const i = t >= T.p3 ? 2 : t >= T.p2 ? 1 : 0;
  const p = PHRASES[i];
  const at = PH_AT[i];
  const out = i < 2 ? PH_AT[i + 1] : T.lens;
  const lt = t - at;
  const en2 = (p as unknown as {en2: string[]}).en2;
  const enSize = Math.min(...en2.map((l) => fitB(l, 120, 720, '800', 0.03)));
  const fem = CUE.femLabel[i];
  return (
    <Fill>
      <HexField t={t} seed={`v${i}`} lit={8} />
      <HexBurst t={t} at={at} x={540} y={800} r0={160} r1={820} />
      <div style={{position: 'absolute', left: 170, right: 170, top: 470, transform: `scale(${1 + punch(t, at, 0.03)})`, transformOrigin: '50% 300px'}}>
        <ArabicLine
          t={t}
          words={p.words}
          styles={p.words.map((_, k) => ({at: at + 0.04 * (p.words.length - 1 - k), color: k === p.verb ? K.honey : K.white}))}
          size={144}
          inkSeconds={0.42}
        />
      </div>
      <Slam t={t} at={fem} out={out} text="FEMININE FORM" y={1040} size={64} color={K.ink} slab={K.honey} padX={24} />
      <HexBurst t={t} at={fem} x={540} y={800} r0={120} r1={520} dur={0.45} w={6} />
      {en2.map((l, k) => (
        <Slam key={k} t={t} at={at + 0.05 * k} out={out} text={l} y={1180 + k * enSize * 1.0} size={enSize} font="sub" color={K.white} slab={null} ls={0.03} kick={0.1} textShadow="0 3px 18px rgba(0,0,0,0.8)" />
      ))}
      <Tag t={t} at={at} out={out} text="OUR TRANSLATION" y={1180 + enSize * 2.05} size={30} color={K.honey} ls={0.3} />
    </Fill>
  );
};

/* ------------------------------------------------------------------ 23–28 · the honest lens */
const Lens: React.FC<{t: number}> = ({t}) => {
  const lt = t - T.lens;
  const g = same(['GRAMMAR TREATS', '“BEES” AS FEMININE.'], 100);
  const b = same(['WORKER BEES', 'ARE FEMALE.'], 100);
  const c = same(['WE CLAIM', 'NOTHING MORE.'], 100);
  return (
    <Fill>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 960, overflow: 'hidden'}}>
        <Photo src="workers.jpg" s={1.12 + 0.05 * (lt / 5)} y={-420} ox={600} oy={1000} x={-lt * 8} />
      </div>
      <div style={{position: 'absolute', left: 0, top: 960, width: 1080, height: 960, overflow: 'hidden'}}>
        <Photo src="hero.jpg" s={1.12 + 0.05 * (lt / 5)} y={-520} ox={470} oy={1000} x={lt * 8} />
      </div>
      <div style={{position: 'absolute', left: 0, top: 952, width: 1080, height: 16, background: K.honey}} />
      <Tag t={t} at={CUE.lensL1} out={T.lens + 3} text="AL-QURTUBI: “NAHL” IS FEMININE IN HIJAZI ARABIC" y={246} size={27} color={K.white} slab={K.ink} ls={0.12} />
      <Slam t={t} at={CUE.lensL1} text="GRAMMAR TREATS" y={330} size={g} color={K.ink} slab={K.honey} rot={-1} />
      <Slam t={t} at={CUE.lensL1 + 0.07} text="“BEES” AS FEMININE." y={330 + g * 1.28} size={g} color={K.ink} slab={K.honey} rot={-1} dx={16} />
      <Slam t={t} at={CUE.lensL2} text="WORKER BEES" y={800} size={b} color={K.ink} slab={K.white} rot={1} />
      <Slam t={t} at={CUE.lensL2 + 0.07} text="ARE FEMALE." y={800 + b * 1.28} size={b} color={K.ink} slab={K.white} rot={1} dx={-16} />
      <Slam t={t} at={CUE.lensL3} text="WE CLAIM" y={1250} size={c} color={K.honey} slab={K.ink} rot={-1} />
      <Slam t={t} at={CUE.lensL3 + 0.07} text="NOTHING MORE." y={1250 + c * 1.28} size={c} color={K.honey} slab={K.ink} rot={-1} dx={16} />
    </Fill>
  );
};

/* ------------------------------------------------------------------ 28–31 · 16:69 */
const Honey: React.FC<{t: number}> = ({t}) => {
  const lt = t - T.honey;
  const q1 = '“A DRINK OF';
  const q2 = 'VARYING COLORS.”';
  const sz = same([q1, q2], 130);
  return (
    <Fill>
      <Photo src="honey.jpg" s={1.12 + 0.1 * (lt / 3)} y={-70 * (lt / 3) + 30} ox={540} oy={700} />
      <Dust t={t} count={20} seed="y20" color="#FFD766" opacity={0.7} />
      <Tag t={t} at={T.honey + 0.5} text="QUR’AN 16:69 · OUR TRANSLATION" y={1070} size={32} color={K.white} slab={K.ink} ls={0.14} />
      <Slam t={t} at={CUE.quote} text={q1} y={1160} size={sz} color={K.white} slab={K.ink} rot={-1} />
      <Slam t={t} at={CUE.quote + 0.07} text={q2} y={1160 + sz * 1.3} size={sz} color={K.ink} slab={K.honey} rot={-1} dx={22} />
    </Fill>
  );
};

/* ------------------------------------------------------------------ 31–34.8 · the lesson, then the dive */
const Lesson: React.FC<{t: number}> = ({t}) => {
  const lt = t - T.lesson;
  const dive = ramp(t, T.dive, T.home, EASE.snap);
  const s = 1.1 + 0.12 * ramp(lt, 0, 3, EASE.linear) + 6 * dive;
  const a = 'THE SMALLEST WORKER';
  const b = 'IS ADDRESSED AS';
  const sz = same([a, b], 120);
  const out = T.dive + 0.12;
  const you = fitA('“YOU.”', 420, 640);
  return (
    <Fill>
      <Photo src="cell.jpg" s={s} ox={540} oy={930} />
      <Slam t={t} at={CUE.lessonL1} out={out} text={a} y={260} size={sz} color={K.white} slab={K.ink} rot={-1} />
      <Slam t={t} at={CUE.lessonL2} out={out} text={b} y={260 + sz * 1.3} size={sz} color={K.ink} slab={K.white} rot={-1} dx={20} />
      <Slam t={t} at={CUE.lessonL3} out={out} text="“YOU.”" y={260 + sz * 2.7} size={you} color={K.honey} slab={K.ink} padX={40} padY={4} rot={-1} kick={0.35} />
    </Fill>
  );
};

/** The whole picture as a pure function of t (t < 0 is the loop pre-roll; the covers use it too). */
export const Scene: React.FC<{t: number}> = ({t}) => {
  if (t < T.meadow) return <Hook t={t} />;
  if (t < T.drone) return <Meadow t={t} />;
  if (t < T.workers) return <Drone t={t} />;
  if (t < T.chapter) return <Workers t={t} />;
  if (t < T.verse) return <Chapter t={t} />;
  if (t < T.lens) return <Verse t={t} />;
  if (t < T.honey) return <Lens t={t} />;
  if (t < T.lesson) return <Honey t={t} />;
  return <Lesson t={t} />;
};

export const E020: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (frame >= EP_FRAMES) {
    const sting = (frame - EP_FRAMES) / FPS;
    const loopT = (frame - TOTAL_FRAMES) / FPS;
    return (
      <AbsoluteFill style={{background: K.ink}}>
        <Outro t={sting} base={<Scene t={loopT} />} from={[HOOK_O[0], HOOK_O[1]]} />
        <Vignette strength={0.2} />
        <Grain opacity={0.07} />
        <Watermark opacity={0.45 * (1 - veil(sting))} />
      </AbsoluteFill>
    );
  }
  const st = t >= T.home ? t - LOOP_SECONDS : t;
  return (
    <AbsoluteFill style={{background: K.ink, overflow: 'hidden'}}>
      <Scene t={st} />
      {WIPES.map((w, i) => (
        <HexWipe key={w} t={t} cut={w} dir={i % 2 ? 'up' : 'down'} seed={`w${i}`} />
      ))}
      <Vignette strength={0.2} />
      <Grain opacity={0.07} />
      <Watermark opacity={0.45} />
    </AbsoluteFill>
  );
};
