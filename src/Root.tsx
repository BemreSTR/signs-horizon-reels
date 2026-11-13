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
import {E018} from './e018/E018';
import {E018Cover1, E018Cover2, E018Cover3} from './e018/Covers';
import {E019Cover1, E019Cover2, E019Cover3, E019CoverG} from './e019/Covers';
import {TOTAL_FRAMES as E018_FRAMES} from './e018/timeline';
import {E019} from './e019/E019';
import {TOTAL_FRAMES as E019_FRAMES} from './e019/timeline';
import {E020} from './e020/E020';
import {E020Cover1, E020Cover2, E020Cover3} from './e020/Covers';
import {TOTAL_FRAMES as E020_FRAMES} from './e020/timeline';

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
    <Composition id="E018Cover1" component={E018Cover1} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="E018Cover2" component={E018Cover2} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="E018Cover3" component={E018Cover3} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="E019CoverG" component={E019CoverG} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="E019Cover1" component={E019Cover1} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="E019Cover2" component={E019Cover2} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="E019Cover3" component={E019Cover3} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="E018" component={E018} durationInFrames={E018_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="E019" component={E019} durationInFrames={E019_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="E020Cover1" component={E020Cover1} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="E020Cover2" component={E020Cover2} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="E020Cover3" component={E020Cover3} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="E020" component={E020} durationInFrames={E020_FRAMES} fps={FPS} width={W} height={H} />
  </>
);
