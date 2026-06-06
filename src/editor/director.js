import { ITEM_TYPES, TRACK_TYPES, FPS } from './types';

export const DIRECTOR_DEFAULTS = Object.freeze({
  cinematic: true,
  motion: true,
  autoTransitions: true,
  kineticText: true,
  titleCard: true,
  endCard: true,
  channel: '@yourchannel',
});

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'of', 'to', 'in', 'on', 'at', 'for', 'with', 'your',
  'their', 'they', 'them', 'that', 'this', 'what', 'when', 'its', 'is', 'are', 'was', 'you',
  'most', 'than', 'far', 'more', 'about', 'it', 'as', 'be', 'by', 'from', 'into', 'do', 'dont',
  'just', 'maybe', 'like', 'been', 'have', 'has', 'far', 'much', 'years', 'something', 'someone',
]);

const isVideo = (i) => i.trackId === TRACK_TYPES.V1;

const titleFromScript = (script) => {
  const match = String(script).match(/^\s*title:\s*(.+)$/im);
  if (match) return match[1].trim();
  const first = String(script).split(/(?<=[.!?])\s+/)[0];
  return (first || 'Untitled').trim();
};

const sentencesFromScript = (script) =>
  String(script)
    .replace(/^\s*title:.*$/gim, '')
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

const emphasisFromSentence = (sentence) => {
  const words = String(sentence)
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));
  const ranked = [...new Set(words)].sort((a, b) => b.length - a.length).slice(0, 2);
  return ranked.join(' ');
};

const cameraFor = (scene, index) => {
  const even = index % 2 === 0;
  const short = scene.durationFrames <= 50;
  const origin = [34, 50, 66][index % 3];
  return {
    id: 'kenBurns',
    props: {
      startScale: even ? 1.06 : short ? 1.14 : 1.2,
      endScale: even ? (short ? 1.26 : 1.2) : 1.06,
      originX: origin,
      originY: even ? 42 : 56,
      panX: scene.type === 'broll' ? (even ? 6 : -6) : 0,
      panY: 0,
      easing: 'out',
    },
  };
};

const gradeEffect = () => ({
  id: 'colorGrade',
  props: { contrast: 1.1, saturate: 1.16, brightness: 1.0, vignette: 0.32, tint: '#16243F', tintStrength: 0.12 },
});

const transitionFor = (scene, next, index, revealIndex) => {
  if (!next) return null;
  if (index === revealIndex) return { id: 'glitch', props: { durationFrames: 15, intensity: 16, scanlines: 0.18 } };
  if (index > 0 && index % 4 === 3) return { id: 'dipToColor', props: { durationFrames: 16, color: '#05070C' } };
  if (scene.type === 'image' && next.type === 'image') return { id: 'crossfade', props: { durationFrames: 14 } };
  return null;
};

export function autoDirect(baseItems, script, options) {
  const opts = { ...DIRECTOR_DEFAULTS, ...options };
  const scenes = baseItems.filter(isVideo).sort((a, b) => a.startFrame - b.startFrame);
  const passthrough = baseItems.filter(
    (i) => i.trackId === TRACK_TYPES.A1 || i.trackId === TRACK_TYPES.A2
  );
  if (scenes.length === 0) return baseItems;

  const total = scenes.reduce((m, s) => Math.max(m, s.startFrame + s.durationFrames), 0);
  const revealIndex = scenes.findIndex((s, i) => i < scenes.length - 1 && s.type === 'broll' && scenes[i + 1].type !== 'broll');
  const sentences = sentencesFromScript(script);

  const directedScenes = scenes.map((scene, index) => {
    const effects = [];
    if (opts.cinematic) effects.push(gradeEffect());
    if (opts.motion) effects.push(cameraFor(scene, index));
    if (opts.motion && scene.type === 'broll') {
      effects.push({ id: 'cameraShake', props: { amplitude: 5, frequency: 1.8, rotation: 0.25, mode: 'handheld', decay: 3.5, zoom: 1.05 } });
    }
    const next = scenes[index + 1];
    const transition = opts.autoTransitions ? transitionFor(scene, next, index, revealIndex) : null;
    return { ...scene, effects, transition: transition ?? null };
  });

  const overlays = [];

  if (opts.cinematic) {
    overlays.push({
      type: ITEM_TYPES.OVERLAY,
      trackId: TRACK_TYPES.O1,
      primitiveId: 'cinematicFrame',
      primitiveProps: { bars: 0.08, vignette: 0.4, grain: 0.06, tint: '#0B0E14', tintStrength: 0.12 },
      startFrame: 0,
      durationFrames: total,
    });
  }

  if (opts.titleCard) {
    const first = directedScenes[0];
    overlays.push({
      type: ITEM_TYPES.SCENE_TYPE,
      trackId: TRACK_TYPES.O1,
      primitiveId: 'titleCard',
      primitiveProps: {
        kicker: '',
        title: titleFromScript(script),
        subtitle: '',
        align: 'center',
        vAlign: 'center',
        background: 'scrim',
        accent: '#7C5CFF',
        titleColor: '#F6F8FC',
        exitFrames: 16,
      },
      startFrame: first.startFrame,
      durationFrames: Math.min(first.durationFrames, Math.round(FPS * 2.6)),
    });
  }

  if (opts.kineticText && sentences.length) {
    directedScenes.forEach((scene, index) => {
      if (index === 0 || scene.durationFrames < 70) return;
      const mid = scene.startFrame + scene.durationFrames / 2;
      const sentenceIndex = Math.min(sentences.length - 1, Math.floor((mid / total) * sentences.length));
      const text = emphasisFromSentence(sentences[sentenceIndex]);
      if (!text) return;
      overlays.push({
        type: ITEM_TYPES.OVERLAY,
        trackId: TRACK_TYPES.O1,
        primitiveId: 'kineticText',
        primitiveProps: {
          text,
          position: index % 2 === 0 ? 'lower' : 'center',
          size: 'h1',
          color: '#F6F8FC',
          highlight: '#7C5CFF',
          highlightStyle: 'underline',
          animation: index % 2 === 0 ? 'rise' : 'pop',
          uppercase: true,
          scrim: 0.35,
          exitFrames: 12,
        },
        startFrame: scene.startFrame + 6,
        durationFrames: scene.durationFrames - 10,
      });
    });
  }

  if (opts.endCard) {
    const last = directedScenes[directedScenes.length - 1];
    const dur = Math.min(last.durationFrames, Math.round(FPS * 2.6));
    overlays.push({
      type: ITEM_TYPES.SCENE_TYPE,
      trackId: TRACK_TYPES.O1,
      primitiveId: 'endCard',
      primitiveProps: {
        headline: 'Follow for more',
        handle: opts.channel || '@yourchannel',
        cta: 'Subscribe',
        accent: '#7C5CFF',
        background: 'scrim',
        exitFrames: 0,
      },
      startFrame: last.startFrame + last.durationFrames - dur,
      durationFrames: dur,
    });
  }

  return [...passthrough, ...directedScenes, ...overlays];
}
