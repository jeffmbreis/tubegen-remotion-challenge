// Transition: opacity crossfade into the next scene.
//
// A transition lives on the OUTGOING item and plays over its last `durationFrames`
// frames. The outgoing scene keeps rendering underneath (its own Sequence in
// MainComposition); this component fades the incoming scene in over it.
//
// `canApply` restricts where the editor lets you use this: only at the end of an
// image scene when the next scene is also an image. Dissolving two stills is clean;
// dissolving moving footage is not — so TubeGen gates it to image→image boundaries.

import { AbsoluteFill, Freeze, useCurrentFrame, interpolate } from 'remotion';

const CrossfadeRender = ({ props, ctx, renderItem }) => {
  const frame = useCurrentFrame();
  const { durationFrames, nextItem } = ctx;
  const { durationFrames: configured = 15 } = props;
  const dur = Math.min(configured, durationFrames);

  const opacity = interpolate(frame, [0, dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      <Freeze frame={0}>{renderItem(nextItem)}</Freeze>
    </AbsoluteFill>
  );
};

const CrossfadeProps = ({ props, onChange }) => (
  <div className="props-form">
    <label>
      Duration (frames @ 30fps)
      <input
        type="number" step="1" min="1" max="60"
        value={props.durationFrames}
        onChange={(e) => onChange({ ...props, durationFrames: parseInt(e.target.value, 10) || 1 })}
      />
    </label>
  </div>
);

export default {
  id: 'crossfade',
  label: 'Crossfade',
  category: 'transition',
  defaultProps: { durationFrames: 15 },
  RemotionComponent: CrossfadeRender,
  PropertiesEditor: CrossfadeProps,
  canApply: (scene, nextScene) => {
    const still = new Set(['image', 'animation']);
    return still.has(scene?.type) && still.has(nextScene?.type);
  },
};
