import React from 'react';
import {C, FONT} from '../brand/tokens';

export interface WatermarkProps {
  opacity?: number;
  color?: string;
  size?: number;
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
  showIcon?: boolean;
}

/** Brand watermark (@signsinthehorizon), top-left safe zone (docs/08 §8, H79). */
export const Watermark: React.FC<WatermarkProps> = ({opacity = 0.36, color = C.ivory, size = 18, top = 130, left = 80, right, bottom, showIcon = true}) => (
  <div
    style={{
      position: 'absolute',
      top: top !== undefined ? top : undefined,
      left: left !== undefined ? left : undefined,
      right: right !== undefined ? right : undefined,
      bottom: bottom !== undefined ? bottom : undefined,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: FONT.mono,
      fontSize: size,
      fontWeight: 500,
      letterSpacing: '0.18em',
      color,
      opacity,
      pointerEvents: 'none',
      userSelect: 'none',
      textShadow: '0 2px 10px rgba(0,0,0,0.85)',
      zIndex: 50,
    }}
  >
    {showIcon && (
      <span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: C.gold400, boxShadow: '0 0 8px rgba(230, 195, 119, 0.8)'}} />
    )}
    <span>@signsinthehorizon</span>
  </div>
);
