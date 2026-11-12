import React from 'react';
import {Composition} from 'remotion';
import {E015} from './E015';
import {FPS, H, W} from './brand/tokens';
import {TOTAL_FRAMES} from './lib/data';
import {Cover1, Cover2, Cover3} from './covers/Covers';
import {E016} from './e016/E016';
import {E017} from './e017/E017';
import {E017Cover1, E017Cover2, E017Cover3} from './e017/Covers';
import {TOTAL_FRAMES as E017_FRAMES} from './e017/timeline';
import {E016Cover1, E016Cover2, E016Cover3} from './e016/Covers';
import {TOTAL_FRAMES as E016_FRAMES} from './e016/timeline';

export const Root: React.FC = () => (
  <>
    <Composition id="Cover1" component={Cover1} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="Cover2" component={Cover2} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="Cover3" component={Cover3} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="E015" component={E015} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="E016Cover1" component={E016Cover1} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="E016Cover2" component={E016Cover2} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="E016Cover3" component={E016Cover3} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="E016" component={E016} durationInFrames={E016_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="E017Cover1" component={E017Cover1} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="E017Cover2" component={E017Cover2} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="E017Cover3" component={E017Cover3} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="E017" component={E017} durationInFrames={E017_FRAMES} fps={FPS} width={W} height={H} />
  </>
);
