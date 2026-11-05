import React from 'react';
import {Composition} from 'remotion';
import {E015} from './E015';
import {FPS, H, W} from './brand/tokens';
import {TOTAL_FRAMES} from './lib/data';
import {Cover1, Cover2, Cover3} from './covers/Covers';

export const Root: React.FC = () => (
  <>
    <Composition id="Cover1" component={Cover1} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="Cover2" component={Cover2} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="Cover3" component={Cover3} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="E015" component={E015} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
  </>
);
