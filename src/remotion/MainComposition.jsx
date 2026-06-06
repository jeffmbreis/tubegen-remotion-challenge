// Main composition — orchestrates video and audio tracks, applies primitives from the
// registry. Candidates should generally NOT need to edit this file. If you do, the
// extension seam is probably broken for your use case — open a discussion in your
// writeup explaining what extension point was missing.

import { AbsoluteFill, Sequence } from 'remotion';
import { TRACK_TYPES } from '../editor/types';
import { getPrimitive } from '../editor/extension/primitives';
import { VideoItem } from './VideoItem';
import { AudioTrack } from './AudioTrack';

const sortByStart = (a, b) => a.startFrame - b.startFrame;

export const MainComposition = ({ items, aspectRatio = '16:9' }) => {
  const v1 = items.filter((i) => i.trackId === TRACK_TYPES.V1).sort(sortByStart);
  const o1 = items.filter((i) => i.trackId === TRACK_TYPES.O1).sort(sortByStart);
  const audio = items.filter((i) => i.trackId === TRACK_TYPES.A1 || i.trackId === TRACK_TYPES.A2);

  const renderItem = (it) => <VideoItem item={it} aspectRatio={aspectRatio} />;

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {/* V1 — primary video track. Each scene renders for its fixed window. */}
      {v1.map((item) => (
        <Sequence key={item.id} from={item.startFrame} durationInFrames={item.durationFrames}>
          {renderItem(item)}
        </Sequence>
      ))}

      {/* Transitions — a transition lives on the OUTGOING item and bridges into the
          next scene, playing over the outgoing scene's last `dur` frames. */}
      {v1.map((item, idx) => {
        const next = v1[idx + 1];
        if (!item.transition || !next) return null;
        const primitive = getPrimitive(item.transition.id);
        if (!primitive) return null;
        const props = item.transition.props ?? primitive.defaultProps;
        const dur = Math.max(1, Math.min(props.durationFrames ?? 15, item.durationFrames));
        const { RemotionComponent } = primitive;
        return (
          <Sequence
            key={`${item.id}_transition`}
            from={item.startFrame + item.durationFrames - dur}
            durationInFrames={dur}
          >
            <RemotionComponent
              props={props}
              ctx={{ durationFrames: dur, prevItem: item, nextItem: next }}
              renderItem={renderItem}
            />
          </Sequence>
        );
      })}

      {/* O1 — overlays (lower-thirds, callouts, scene-type primitives) */}
      {o1.map((item) => {
        const primitive = getPrimitive(item.primitiveId);
        if (!primitive) return null;
        const { RemotionComponent } = primitive;
        return (
          <Sequence key={item.id} from={item.startFrame} durationInFrames={item.durationFrames}>
            <RemotionComponent
              props={item.primitiveProps ?? primitive.defaultProps}
              ctx={{ durationFrames: item.durationFrames, item }}
            />
          </Sequence>
        );
      })}

      {/* Audio tracks */}
      {audio.map((item) => (
        <AudioTrack key={item.id} item={item} />
      ))}
    </AbsoluteFill>
  );
};
