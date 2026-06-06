import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from 'remotion';
import { scaleForCanvas } from './tokens';

export const EASE = Object.freeze({
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.55, 0, 0.85, 0),
  linear: (t) => t,
});

export const SPRING = Object.freeze({
  gentle: { damping: 200, stiffness: 110, mass: 1 },
  snappy: { damping: 24, stiffness: 220, mass: 0.7 },
  bouncy: { damping: 11, stiffness: 170, mass: 0.9 },
});

const clamp01 = (v) => Math.min(1, Math.max(0, v));

export const useCanvasScale = () => {
  const { width, height } = useVideoConfig();
  return scaleForCanvas(width, height);
};

export const useSpringValue = (delay = 0, config = SPRING.gentle) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame, fps, config, delay });
};

export const ramp = (frame, range, output, easing = EASE.out) =>
  interpolate(frame, range, output, {
    easing,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

export const exitFade = (frame, durationFrames, exitFrames = 12) => {
  if (!exitFrames || exitFrames <= 0) return 1;
  return interpolate(frame, [durationFrames - exitFrames, durationFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

export const enterExit = (frame, durationFrames, enterFrames = 12, exitFrames = 12) => {
  const enter = interpolate(frame, [0, enterFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return Math.min(enter, exitFade(frame, durationFrames, exitFrames));
};

export const staggerDelay = (index, perItem = 3, base = 0) => base + index * perItem;

export const toWords = (text) =>
  String(text ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

const OFFSET = {
  up: (d) => [0, d],
  down: (d) => [0, -d],
  left: (d) => [d, 0],
  right: (d) => [-d, 0],
  none: () => [0, 0],
};

export const AnimatedEntry = ({
  delay = 0,
  from = 'up',
  distance = 40,
  scaleFrom = 1,
  config = SPRING.gentle,
  display = 'block',
  style,
  children,
}) => {
  const progress = useSpringValue(delay, config);
  const [ox, oy] = (OFFSET[from] ?? OFFSET.up)(distance);
  const tx = interpolate(progress, [0, 1], [ox, 0]);
  const ty = interpolate(progress, [0, 1], [oy, 0]);
  const sc = interpolate(progress, [0, 1], [scaleFrom, 1]);
  return (
    <div
      style={{
        display,
        opacity: clamp01(progress),
        transform: `translate(${tx}px, ${ty}px) scale(${sc})`,
        willChange: 'transform, opacity',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const AnimatedWords = ({
  text,
  delay = 0,
  perItem = 2.5,
  from = 'up',
  distance = 22,
  config = SPRING.snappy,
  wordStyle,
  style,
}) => (
  <span style={{ display: 'inline-flex', flexWrap: 'wrap', justifyContent: 'inherit', ...style }}>
    {toWords(text).map((word, i) => (
      <AnimatedEntry
        key={`${word}-${i}`}
        delay={staggerDelay(i, perItem, delay)}
        from={from}
        distance={distance}
        config={config}
        display="inline-block"
        style={{ marginRight: '0.28em', ...wordStyle }}
      >
        {word}
      </AnimatedEntry>
    ))}
  </span>
);
