import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { EASE, ramp } from '../lib/motion';
import { Fields, NumberField, SelectField } from '../lib/fields';

const KenBurnsRender = ({ props, ctx, children }) => {
  const frame = useCurrentFrame();
  const { durationFrames } = ctx;
  const {
    startScale = 1.06,
    endScale = 1.2,
    originX = 50,
    originY = 50,
    panX = 0,
    panY = 0,
    easing = 'out',
  } = props;

  const ease = EASE[easing] ?? EASE.out;
  const t = durationFrames > 1 ? ramp(frame, [0, durationFrames - 1], [0, 1], ease) : 1;
  const scale = interpolate(t, [0, 1], [startScale, endScale]);
  const x = interpolate(t, [0, 1], [0, panX]);
  const y = interpolate(t, [0, 1], [0, panY]);

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale}) translate(${x}%, ${y}%)`,
        transformOrigin: `${originX}% ${originY}%`,
        willChange: 'transform',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const KenBurnsProps = ({ props, onChange }) => {
  const set = (k) => (v) => onChange({ ...props, [k]: v });
  return (
    <Fields>
      <NumberField label="Start scale" value={props.startScale} onChange={set('startScale')} step={0.02} min={1} max={2} />
      <NumberField label="End scale" value={props.endScale} onChange={set('endScale')} step={0.02} min={1} max={2} />
      <NumberField label="Focus X (%)" value={props.originX} onChange={set('originX')} step={5} min={0} max={100} />
      <NumberField label="Focus Y (%)" value={props.originY} onChange={set('originY')} step={5} min={0} max={100} />
      <NumberField label="Drift X (%)" value={props.panX} onChange={set('panX')} step={1} min={-12} max={12} />
      <NumberField label="Drift Y (%)" value={props.panY} onChange={set('panY')} step={1} min={-12} max={12} />
      <SelectField label="Easing" value={props.easing} onChange={set('easing')} options={['out', 'inOut', 'linear']} />
    </Fields>
  );
};

export default {
  id: 'kenBurns',
  label: 'Ken Burns',
  category: 'effect',
  defaultProps: {
    startScale: 1.06,
    endScale: 1.2,
    originX: 50,
    originY: 50,
    panX: 0,
    panY: 0,
    easing: 'out',
  },
  RemotionComponent: KenBurnsRender,
  PropertiesEditor: KenBurnsProps,
};
