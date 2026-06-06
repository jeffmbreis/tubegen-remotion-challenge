import { bundle } from '@remotion/bundler';
import { selectComposition, renderStill } from '@remotion/renderer';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const frames = process.argv.slice(2).map(Number).filter((n) => Number.isFinite(n));
const list = frames.length ? frames : [20, 120, 230, 320, 524, 560, 620, 690, 810, 880, 980, 1060];

const out = '/tmp/tg_still';
mkdirSync(out, { recursive: true });

const serveUrl = await bundle({
  entryPoint: path.resolve('src/remotion/index.js'),
  webpackOverride: (config) => {
    config.module.rules.push({ test: /\.m?jsx?$/, resolve: { fullySpecified: false } });
    return config;
  },
});
const composition = await selectComposition({ serveUrl, id: 'main' });
console.log('composition', composition.width, composition.height, composition.durationInFrames);

for (const frame of list) {
  await renderStill({
    serveUrl,
    composition,
    frame,
    output: `${out}/${String(frame).padStart(4, '0')}.png`,
    imageFormat: 'png',
    scale: 0.5,
  });
  console.log('still', frame);
}
process.exit(0);
