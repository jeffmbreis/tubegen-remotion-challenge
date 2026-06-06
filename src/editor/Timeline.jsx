import { useRef } from 'react';
import { FPS, TRACK_TYPES, ITEM_TYPES } from './types';
import { itemsOnTrack } from './state';
import { getPrimitive } from './extension/primitives';

const PX_PER_FRAME = 4;
const GUTTER = 84;
const MIN_DURATION = Math.round(FPS * 0.3);

const TRACKS = [
  { id: TRACK_TYPES.V1, label: 'Visuals' },
  { id: TRACK_TYPES.O1, label: 'Overlays' },
  { id: TRACK_TYPES.A1, label: 'Voiceover' },
  { id: TRACK_TYPES.A2, label: 'Music' },
];

const AUDIO_TYPES = new Set([ITEM_TYPES.VOICEOVER, ITEM_TYPES.SOUNDTRACK]);
const PRIMITIVE_TYPES = new Set([ITEM_TYPES.OVERLAY, ITEM_TYPES.SCENE_TYPE]);

const frameToPx = (f) => f * PX_PER_FRAME;
const pxToFrame = (px) => Math.round(px / PX_PER_FRAME);
const basename = (src) => (src ? src.split('/').pop() : '');
const fmtTime = (frames) => {
  const s = frames / FPS;
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, '0')}`;
};

const clipLabel = (item) => {
  if (PRIMITIVE_TYPES.has(item.type)) return getPrimitive(item.primitiveId)?.label ?? item.type;
  return basename(item.src) || item.type;
};

export default function Timeline({ state, dispatch, currentFrame = 0, onSeek }) {
  const contentRef = useRef(null);

  const totalFrames = Math.max(
    state.durationFrames,
    ...state.items.map((i) => i.startFrame + i.durationFrames),
    FPS * 5
  );
  const contentWidth = frameToPx(totalFrames) + 48;

  const seekFromEvent = (e) => {
    if (!onSeek || !contentRef.current) return;
    const rect = contentRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - GUTTER;
    if (x < 0) return;
    onSeek(Math.max(0, Math.min(totalFrames, pxToFrame(x))));
  };
  const endScrub = () => {
    window.removeEventListener('pointermove', seekFromEvent);
    window.removeEventListener('pointerup', endScrub);
  };
  const startScrub = (e) => {
    seekFromEvent(e);
    window.addEventListener('pointermove', seekFromEvent);
    window.addEventListener('pointerup', endScrub);
  };

  const startItemDrag = (e, item, mode) => {
    e.stopPropagation();
    dispatch({ type: 'SELECT_ITEM', id: item.id });
    const originX = e.clientX;
    const { startFrame, durationFrames } = item;
    const end = startFrame + durationFrames;

    const onMove = (ev) => {
      const delta = pxToFrame(ev.clientX - originX);
      if (mode === 'move') {
        const next = Math.max(0, Math.min(totalFrames - durationFrames, startFrame + delta));
        dispatch({ type: 'MOVE_ITEM', id: item.id, startFrame: next });
      } else if (mode === 'resize-r') {
        const dur = Math.max(MIN_DURATION, durationFrames + delta);
        dispatch({ type: 'RESIZE_ITEM', id: item.id, durationFrames: dur });
      } else if (mode === 'resize-l') {
        const nextStart = Math.max(0, Math.min(end - MIN_DURATION, startFrame + delta));
        dispatch({ type: 'RESIZE_ITEM', id: item.id, startFrame: nextStart, durationFrames: end - nextStart });
      }
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const onSurfacePointerDown = (e) => {
    dispatch({ type: 'SELECT_ITEM', id: null });
    startScrub(e);
  };
  const onClipPointerDown = (e, item, movable) => {
    e.stopPropagation();
    dispatch({ type: 'SELECT_ITEM', id: item.id });
    if (movable) startItemDrag(e, item, 'move');
    else startScrub(e);
  };
  const onPlayheadPointerDown = (e) => {
    e.stopPropagation();
    startScrub(e);
  };

  const ticks = [];
  for (let f = 0; f <= totalFrames; f += FPS) ticks.push(f);

  return (
    <div className="timeline">
      <div className="tl-scroll">
        <div
          className="tl-content"
          ref={contentRef}
          style={{ width: contentWidth }}
          onPointerDown={onSurfacePointerDown}
        >
          <div className="tl-playhead" style={{ left: GUTTER + frameToPx(currentFrame) }}>
            <div className="tl-playhead-head" onPointerDown={onPlayheadPointerDown} />
          </div>

          <div className="tl-ruler" style={{ width: contentWidth }}>
            <div className="tl-gutter" />
            <div className="tl-lane tl-ruler-lane">
              {ticks.map((f) => (
                <div key={f} className="tl-tick" style={{ left: frameToPx(f) }}>
                  <span>{fmtTime(f)}</span>
                </div>
              ))}
            </div>
          </div>

          {TRACKS.map((track) => {
            const items = itemsOnTrack(state, track.id);
            const isOverlayTrack = track.id === TRACK_TYPES.O1;
            return (
              <div key={track.id} className="tl-track">
                <div className="tl-gutter tl-track-label">{track.label}</div>
                <div className="tl-lane">
                  {items.map((item) => {
                    const isAudio = AUDIO_TYPES.has(item.type);
                    const isOverlay = PRIMITIVE_TYPES.has(item.type);
                    const selected = item.id === state.selectedItemId;
                    const label = clipLabel(item);
                    const cls = isAudio ? ' is-audio' : isOverlay ? ' is-overlay' : '';
                    return (
                      <div
                        key={item.id}
                        className={`tl-clip${cls}${selected ? ' is-selected' : ''}${
                          isOverlayTrack ? ' is-movable' : ''
                        }`}
                        style={{
                          left: frameToPx(item.startFrame),
                          width: frameToPx(item.durationFrames),
                        }}
                        onPointerDown={(e) => onClipPointerDown(e, item, isOverlayTrack)}
                        title={isOverlayTrack ? label : `${label} · timing locked`}
                      >
                        {isOverlayTrack && selected && (
                          <div
                            className="tl-handle tl-handle-l"
                            onPointerDown={(e) => startItemDrag(e, item, 'resize-l')}
                          />
                        )}
                        <span className="tl-clip-label">
                          {isAudio ? '♪ ' : ''}
                          {label}
                        </span>
                        {isOverlayTrack && selected && (
                          <div
                            className="tl-handle tl-handle-r"
                            onPointerDown={(e) => startItemDrag(e, item, 'resize-r')}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
