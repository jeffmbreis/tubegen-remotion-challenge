import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Fields, RangeField, NumberField, ColorField } from '../lib/fields';

const CinematicFrameRender = ({ props, ctx }) => {
  const frame = useCurrentFrame();
  const {
    bars = 0.09,
    vignette = 0.42,
    grain = 0.07,
    tint = '#0B0E14',
    tintStrength = 0.12,
  } = props;
  const grainId = `cine-grain-${ctx.item?.id ?? 'x'}`;
  const barPct = `${Math.max(0, bars) * 100}%`;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {tintStrength > 0 && (
        <AbsoluteFill style={{ background: tint, mixBlendMode: 'multiply', opacity: tintStrength }} />
      )}

      {vignette > 0 && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(120% 120% at 50% 50%, transparent 45%, rgba(0,0,0,${vignette}) 100%)`,
          }}
        />
      )}

      {grain > 0 && (
        <AbsoluteFill style={{ opacity: grain, mixBlendMode: 'overlay' }}>
          <svg width="100%" height="100%" viewBox="0 0 240 135" preserveAspectRatio="none">
            <filter id={grainId}>
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 100} stitchTiles="stitch" />
            </filter>
            <rect width="240" height="135" filter={`url(#${grainId})`} />
          </svg>
        </AbsoluteFill>
      )}

      {bars > 0 && (
        <>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: barPct, background: '#000' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: barPct, background: '#000' }} />
        </>
      )}
    </AbsoluteFill>
  );
};

const CinematicFrameProps = ({ props, onChange }) => {
  const set = (k) => (v) => onChange({ ...props, [k]: v });
  return (
    <Fields>
      <RangeField label="Letterbox" value={props.bars} onChange={set('bars')} step={0.01} min={0} max={0.2} />
      <RangeField label="Vignette" value={props.vignette} onChange={set('vignette')} step={0.02} min={0} max={0.9} />
      <RangeField label="Grain" value={props.grain} onChange={set('grain')} step={0.01} min={0} max={0.3} />
      <ColorField label="Tint" value={props.tint} onChange={set('tint')} />
      <RangeField label="Tint strength" value={props.tintStrength} onChange={set('tintStrength')} step={0.02} min={0} max={0.6} />
    </Fields>
  );
};

export default {
  id: 'cinematicFrame',
  label: 'Cinematic Frame',
  category: 'overlay',
  defaultProps: {
    bars: 0.09,
    vignette: 0.42,
    grain: 0.07,
    tint: '#0B0E14',
    tintStrength: 0.12,
  },
  RemotionComponent: CinematicFrameRender,
  PropertiesEditor: CinematicFrameProps,
};
