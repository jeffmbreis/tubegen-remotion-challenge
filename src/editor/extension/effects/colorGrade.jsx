import { AbsoluteFill } from 'remotion';
import { Fields, RangeField, ColorField } from '../lib/fields';

const ColorGradeRender = ({ props, children }) => {
  const {
    contrast = 1.08,
    saturate = 1.12,
    brightness = 1.0,
    vignette = 0.3,
    tint = '#16243F',
    tintStrength = 0,
  } = props;

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          filter: `contrast(${contrast}) saturate(${saturate}) brightness(${brightness})`,
        }}
      >
        {children}
      </AbsoluteFill>
      {vignette > 0 && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(120% 120% at 50% 50%, transparent 50%, rgba(0,0,0,${vignette}) 100%)`,
            pointerEvents: 'none',
          }}
        />
      )}
      {tintStrength > 0 && (
        <AbsoluteFill
          style={{
            background: tint,
            mixBlendMode: 'soft-light',
            opacity: tintStrength,
            pointerEvents: 'none',
          }}
        />
      )}
    </AbsoluteFill>
  );
};

const ColorGradeProps = ({ props, onChange }) => {
  const set = (k) => (v) => onChange({ ...props, [k]: v });
  return (
    <Fields>
      <RangeField label="Contrast" value={props.contrast} onChange={set('contrast')} step={0.02} min={0.5} max={2} />
      <RangeField label="Saturate" value={props.saturate} onChange={set('saturate')} step={0.02} min={0} max={2} />
      <RangeField label="Brightness" value={props.brightness} onChange={set('brightness')} step={0.02} min={0.5} max={1.6} />
      <RangeField label="Vignette" value={props.vignette} onChange={set('vignette')} step={0.02} min={0} max={0.9} />
      <ColorField label="Tint" value={props.tint} onChange={set('tint')} />
      <RangeField label="Tint strength" value={props.tintStrength} onChange={set('tintStrength')} step={0.02} min={0} max={0.6} />
    </Fields>
  );
};

export default {
  id: 'colorGrade',
  label: 'Color Grade',
  category: 'effect',
  defaultProps: {
    contrast: 1.08,
    saturate: 1.12,
    brightness: 1.0,
    vignette: 0.3,
    tint: '#16243F',
    tintStrength: 0,
  },
  RemotionComponent: ColorGradeRender,
  PropertiesEditor: ColorGradeProps,
};
