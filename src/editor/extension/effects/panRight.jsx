// Camera effect: horizontal pan to the right over the item's duration.
// Zooms in slightly so the pan never reveals empty edges. Pan amount is a
// percentage of width, so it is resolution-independent.

import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

const PanRightRender = ({ props, ctx, children }) => {
  const frame = useCurrentFrame();
  const { durationFrames } = ctx;
  const { scale = 1.2, pan = 6 } = props;

  const x = interpolate(
    frame,
    [0, Math.max(1, durationFrames)],
    [-pan, pan],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ transform: `scale(${scale}) translateX(${x}%)`, transformOrigin: '50% 50%' }}>
      {children}
    </AbsoluteFill>
  );
};

const PanRightProps = ({ props, onChange }) => (
  <div className="props-form">
    <label>
      Zoom
      <input
        type="number" step="0.05" min="1" max="2"
        value={props.scale}
        onChange={(e) => onChange({ ...props, scale: parseFloat(e.target.value) })}
      />
    </label>
    <label>
      Pan amount (%)
      <input
        type="number" step="1" min="0" max="20"
        value={props.pan}
        onChange={(e) => onChange({ ...props, pan: parseFloat(e.target.value) })}
      />
    </label>
  </div>
);

export default {
  id: 'panRight',
  label: 'Pan Right',
  category: 'effect',
  defaultProps: { scale: 1.2, pan: 6 },
  RemotionComponent: PanRightRender,
  PropertiesEditor: PanRightProps,
};
