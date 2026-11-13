import {loadFont} from '@remotion/fonts';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';

const handle = delayRender('fonts');
const f = (family: string, file: string, weight: string, style: 'normal' | 'italic' = 'normal') =>
  loadFont({family, url: staticFile(`fonts/${file}`), weight, style, format: 'woff2'});

Promise.all([
  f('Cormorant Garamond', 'cormorant-garamond-latin-500-normal.woff2', '500'),
  f('Cormorant Garamond', 'cormorant-garamond-latin-600-normal.woff2', '600'),
  f('Cormorant Garamond', 'cormorant-garamond-latin-700-normal.woff2', '700'),
  f('Cormorant Garamond', 'cormorant-garamond-latin-500-italic.woff2', '500', 'italic'),
  f('Inter', 'inter-latin-500-normal.woff2', '500'),
  f('Inter', 'inter-latin-600-normal.woff2', '600'),
  f('Inter', 'inter-latin-700-normal.woff2', '700'),
  f('IBM Plex Mono', 'ibm-plex-mono-latin-500-normal.woff2', '500'),
  f('Amiri Quran', 'amiri-quran-arabic-400-normal.woff2', '400'),
  f('Anton', 'anton-latin-400-normal.woff2', '400'),
  f('Barlow Condensed', 'barlow-condensed-latin-700-normal.woff2', '700'),
  f('Barlow Condensed', 'barlow-condensed-latin-800-normal.woff2', '800'),
])
  .then(() => document.fonts.ready)
  .then(() => continueRender(handle))
  .catch((e) => cancelRender(e));
