import React from 'react';
import {AbsoluteFill, Img, random, staticFile, useCurrentFrame} from 'remotion';
import {C, FPS, H, W} from '../brand/tokens';

/** Film grain: one overlay-blended image, shifted every frame by seeded offsets. */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.1}) => {
  const f = useCurrentFrame();
  const dx = Math.round((random(`gx${f}`) - 0.5) * 120);
  const dy = Math.round((random(`gy${f}`) - 0.5) * 160);
  return (
    <AbsoluteFill style={{overflow: 'hidden', pointerEvents: 'none', mixBlendMode: 'overlay', opacity}}>
      <Img src={staticFile('tex/grain.png')} style={{position: 'absolute', left: -60 + dx, top: -90 + dy, width: 1200, height: 2100}} />
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.38}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(ellipse 85% 70% at 50% 50%, rgba(5,7,12,0) 45%, rgba(5,7,12,${strength}) 100%)`,
    }}
  />
);

export const Glow: React.FC<{x: number; y: number; r: number; color?: string; opacity?: number}> = ({x, y, r, color = C.gold300, opacity = 1}) => (
  <div
    style={{
      position: 'absolute',
      left: x - r,
      top: y - r,
      width: r * 2,
      height: r * 2,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 68%)`,
      opacity,
      pointerEvents: 'none',
    }}
  />
);

/** Slow drifting motes (plain circles, no blend modes: H70). */
export const Dust: React.FC<{t: number; count?: number; seed?: string; color?: string; opacity?: number; area?: [number, number, number, number]}> = ({
  t,
  count = 60,
  seed = 'dust',
  color = C.gold300,
  opacity = 1,
  area = [0, 0, W, H],
}) => {
  const [x0, y0, x1, y1] = area;
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity}}>
      {new Array(count).fill(0).map((_, i) => {
        const sp = 6 + 16 * random(`${seed}s${i}`);
        const ph = random(`${seed}p${i}`) * 100;
        const x = x0 + ((random(`${seed}x${i}`) * (x1 - x0) + 14 * Math.sin(t * 0.4 + ph)) % (x1 - x0));
        const y = y0 + ((((random(`${seed}y${i}`) * (y1 - y0) - t * sp) % (y1 - y0)) + (y1 - y0)) % (y1 - y0));
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * (0.8 + 1.4 * random(`${seed}t${i}`)) + ph));
        const r = 0.8 + 2.2 * random(`${seed}r${i}`) ** 2;
        return <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={(0.1 + 0.5 * random(`${seed}o${i}`)) * tw} />;
      })}
    </svg>
  );
};

export const Stars: React.FC<{t: number; n?: number; seed?: string; maxY?: number; opacity?: number}> = ({t, n = 160, seed = 'st', maxY = 1500, opacity = 1}) => (
  <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity}}>
    {new Array(n).fill(0).map((_, i) => {
      const tw = 0.55 + 0.45 * Math.sin(t * (1.2 + 2 * random(`${seed}t${i}`)) + i * 2.3);
      return (
        <circle
          key={i}
          cx={random(`${seed}x${i}`) * W}
          cy={random(`${seed}y${i}`) ** 1.25 * maxY}
          r={0.6 + 1.7 * random(`${seed}r${i}`) ** 3}
          fill={C.ivory}
          opacity={(0.12 + 0.6 * random(`${seed}o${i}`) ** 2) * tw}
        />
      );
    })}
  </svg>
);

export const sec = (frame: number) => frame / FPS;
