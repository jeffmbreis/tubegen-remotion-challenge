import { AbsoluteFill, Freeze, useCurrentFrame, interpolate } from 'remotion';
import { ramp } from '../lib/motion';
import { Fields, NumberField, ColorField } from '../lib/fields';

const DipToColorRender = ({ props, ctx, renderItem }) => {
  const frame = useCurrentFrame();
  const { durationFrames, nextItem } = ctx;
  const { durationFrames: configured = 18, color = '#000000' } = props;
  const dur = Math.min(configured, durationFrames);

  const p = interpolate(frame, [0, dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const colorOpacity = interpolate(p, [0, 0.5, 1], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const incomingOpacity = ramp(p, [0.5, 1], [0, 1]);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: incomingOpacity }}>
        <Freeze frame={0}>{renderItem(nextItem)}</Freeze>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: color, opacity: colorOpacity }} />
    </AbsoluteFill>
  );
};

const DipToColorProps = ({ props, onChange }) => {
  const set = (k) => (v) => onChange({ ...props, [k]: v });
  return (
    <Fields>
      <NumberField label="Duration (f)" value={props.durationFrames} onChange={set('durationFrames')} step={1} min={4} max={60} />
      <ColorField label="Color" value={props.color} onChange={set('color')} />
    </Fields>
  );
};

export default {
  id: 'dipToColor',
  label: 'Dip to Color',
  category: 'transition',
  defaultProps: { durationFrames: 18, color: '#000000' },
  RemotionComponent: DipToColorRender,
  PropertiesEditor: DipToColorProps,
};
