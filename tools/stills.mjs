// usage: node tools/stills.mjs <compId> <outDir> <seconds...>   (full-size PNG stills, bundle once)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
const [, , id, outDir, ...times] = process.argv;
const BROWSER = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const comp = await selectComposition({serveUrl, id, browserExecutable: BROWSER});
for (const s of times) {
  const frame = Math.min(comp.durationInFrames - 1, Math.round(parseFloat(s) * comp.fps));
  const output = path.join(outDir, `${id}_${String(s).replace('.', '_')}.png`);
  await renderStill({composition: comp, serveUrl, output, frame, imageFormat: 'png', browserExecutable: BROWSER});
  console.log('ok', s, frame);
}
