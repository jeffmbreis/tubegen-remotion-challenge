import { AbsoluteFill, Freeze, useCurrentFrame, interpolate } from 'remotion';
import { EASE, useCanvasScale } from '../lib/motion';
import { Fields, NumberField } from '../lib/fields';

const hash = (n) => {
  const x = Math.sin(n * 91.7) * 43758.5453;
  return x - Math.floor(x);
};

const GlitchRender = ({ props, ctx, renderItem }) => {
  const frame = useCurrentFrame();
  const { durationFrames, nextItem, prevItem } = ctx;
  const { durationFrames: configured = 16, intensity = 14, scanlines = 0.18 } = props;
  const dur = Math.min(configured, durationFrames);
  const s = useCanvasScale();
  const filterId = `glitch-ca-${prevItem?.id ?? 'x'}`;

  const p = interpolate(frame, [0, dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const eased = EASE.out(p);
  const flicker = hash(frame) > 0.78 ? hash(frame + 7) : 0;
  const reveal = Math.min(1, eased * 1.15 + flicker * 0.5);
  const split = (intensity * s * (1 - eased) + intensity * s * 0.4 * flicker).toFixed(2);

  const tearColors = ['#FF5470', '#3BE3D0', '#F6F8FC'];
  const tears = [0, 1, 2].map((i) => {
    const seed = Math.floor(frame / 2) + i * 31;
    return {
      key: i,
      active: hash(seed) > 0.7 - intensity * 0.01,
      top: `${hash(seed + 3) * 92}%`,
      height: `${1 + hash(seed + 5) * 3}%`,
      color: tearColors[i % tearColors.length],
    };
  });

  return (
    <AbsoluteFill style={{ opacity: reveal }}>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id={filterId}>
          <feOffset in="SourceGraphic" dx={split} dy="0" result="r" />
          <feColorMatrix in="r" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="rc" />
          <feOffset in="SourceGraphic" dx={`-${split}`} dy="0" result="b" />
          <feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="bc" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="gc" />
          <feBlend in="rc" in2="gc" mode="screen" result="rg" />
          <feBlend in="rg" in2="bc" mode="screen" />
        </filter>
      </svg>

      <AbsoluteFill style={{ filter: `url(#${filterId})` }}>
        <Freeze frame={0}>{renderItem(nextItem)}</Freeze>
      </AbsoluteFill>

      {tears.map((t) =>
        t.active ? (
          <div
            key={t.key}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: t.top,
              height: t.height,
              background: t.color,
              mixBlendMode: 'screen',
              opacity: (1 - eased) * 0.8,
            }}
          />
        ) : null
      )}

      {scanlines > 0 && (
        <AbsoluteFill
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,${scanlines}) 0px, rgba(0,0,0,${scanlines}) 1px, transparent 2px, transparent 4px)`,
            mixBlendMode: 'multiply',
            opacity: 1 - eased * 0.6,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

const GlitchProps = ({ props, onChange }) => {
  const set = (k) => (v) => onChange({ ...props, [k]: v });
  return (
    <Fields>
      <NumberField label="Duration (f)" value={props.durationFrames} onChange={set('durationFrames')} step={1} min={4} max={60} />
      <NumberField label="Intensity" value={props.intensity} onChange={set('intensity')} step={1} min={2} max={40} />
      <NumberField label="Scanlines" value={props.scanlines} onChange={set('scanlines')} step={0.02} min={0} max={0.6} />
    </Fields>
  );
};

export default {
  id: 'glitch',
  label: 'Glitch Dissolve',
  category: 'transition',
  defaultProps: { durationFrames: 16, intensity: 14, scanlines: 0.18 },
  RemotionComponent: GlitchRender,
  PropertiesEditor: GlitchProps,
};
