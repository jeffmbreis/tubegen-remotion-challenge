import { AbsoluteFill, Freeze, useCurrentFrame, interpolate } from 'remotion';
import { EASE, ramp } from '../lib/motion';
import { Fields, NumberField, SelectField } from '../lib/fields';

const START = {
  left: { axis: 'X', from: 100 },
  right: { axis: 'X', from: -100 },
  up: { axis: 'Y', from: 100 },
  down: { axis: 'Y', from: -100 },
};

const SlideRender = ({ props, ctx, renderItem }) => {
  const frame = useCurrentFrame();
  const { durationFrames, nextItem } = ctx;
  const { durationFrames: configured = 18, direction = 'left', easing = 'inOut' } = props;
  const dur = Math.min(configured, durationFrames);

  const t = ramp(frame, [0, dur], [0, 1], EASE[easing] ?? EASE.inOut);
  const move = START[direction] ?? START.left;
  const offset = interpolate(t, [0, 1], [move.from, 0]);
  const transform = move.axis === 'X' ? `translateX(${offset}%)` : `translateY(${offset}%)`;

  return (
    <AbsoluteFill
      style={{
        transform,
        boxShadow: '0 0 60px rgba(0,0,0,0.6)',
        willChange: 'transform',
      }}
    >
      <Freeze frame={0}>{renderItem(nextItem)}</Freeze>
    </AbsoluteFill>
  );
};

const SlideProps = ({ props, onChange }) => {
  const set = (k) => (v) => onChange({ ...props, [k]: v });
  return (
    <Fields>
      <NumberField label="Duration (f)" value={props.durationFrames} onChange={set('durationFrames')} step={1} min={4} max={60} />
      <SelectField label="Direction" value={props.direction} onChange={set('direction')} options={['left', 'right', 'up', 'down']} />
      <SelectField label="Easing" value={props.easing} onChange={set('easing')} options={['out', 'inOut', 'linear']} />
    </Fields>
  );
};

export default {
  id: 'slide',
  label: 'Slide',
  category: 'transition',
  defaultProps: { durationFrames: 18, direction: 'left', easing: 'inOut' },
  RemotionComponent: SlideRender,
  PropertiesEditor: SlideProps,
};
