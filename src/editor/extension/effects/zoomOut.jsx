// Camera effect: gradual zoom-out over the item's duration.

import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

const ZoomOutRender = ({ props, ctx, children }) => {
  const frame = useCurrentFrame();
  const { durationFrames } = ctx;
  const { startScale = 1.15, endScale = 1.0 } = props;

  const scale = interpolate(
    frame,
    [0, Math.max(1, durationFrames)],
    [startScale, endScale],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: '50% 50%' }}>
      {children}
    </AbsoluteFill>
  );
};

const ZoomOutProps = ({ props, onChange }) => (
  <div className="props-form">
    <label>
      Start scale
      <input
        type="number" step="0.05" min="0.5" max="2"
        value={props.startScale}
        onChange={(e) => onChange({ ...props, startScale: parseFloat(e.target.value) })}
      />
    </label>
    <label>
      End scale
      <input
        type="number" step="0.05" min="0.5" max="2"
        value={props.endScale}
        onChange={(e) => onChange({ ...props, endScale: parseFloat(e.target.value) })}
      />
    </label>
  </div>
);

export default {
  id: 'zoomOut',
  label: 'Zoom Out',
  category: 'effect',
  defaultProps: { startScale: 1.15, endScale: 1.0 },
  RemotionComponent: ZoomOutRender,
  PropertiesEditor: ZoomOutProps,
};
