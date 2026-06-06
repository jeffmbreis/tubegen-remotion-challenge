import crossfade from './transitions/crossfade';
import dipToColor from './transitions/dipToColor';
import slide from './transitions/slide';
import glitch from './transitions/glitch';

import zoomIn from './effects/zoomIn';
import zoomOut from './effects/zoomOut';
import panLeft from './effects/panLeft';
import panRight from './effects/panRight';
import kenBurns from './effects/kenBurns';
import cameraShake from './effects/cameraShake';
import colorGrade from './effects/colorGrade';

import lowerThird from './overlays/lowerThird';
import kineticText from './overlays/kineticText';
import callout from './overlays/callout';
import statMeter from './overlays/statMeter';
import cinematicFrame from './overlays/cinematicFrame';

import titleCard from './sceneTypes/titleCard';
import barChart from './sceneTypes/barChart';
import endCard from './sceneTypes/endCard';

export const PRIMITIVES = [
  crossfade,
  dipToColor,
  slide,
  glitch,
  zoomIn,
  zoomOut,
  panLeft,
  panRight,
  kenBurns,
  cameraShake,
  colorGrade,
  lowerThird,
  kineticText,
  callout,
  statMeter,
  cinematicFrame,
  titleCard,
  barChart,
  endCard,
];

const byId = new Map(PRIMITIVES.map((p) => [p.id, p]));
const byCategory = PRIMITIVES.reduce((acc, p) => {
  (acc[p.category] ??= []).push(p);
  return acc;
}, {});

export const getPrimitive = (id) => byId.get(id);
export const getPrimitivesByCategory = (category) => byCategory[category] ?? [];

export const CATEGORIES = ['transition', 'effect', 'overlay', 'sceneType'];
