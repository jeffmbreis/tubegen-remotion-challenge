// App — 3-pane editor shell. Loads scenes.json on mount, wires up state, and renders
// the three panes around a Remotion <Player> preview.
//
// Layout:
//   ┌────────────┬───────────────────────────────┬────────────┐
//   │            │      Remotion <Player>         │            │
//   │  Assets    ├───────────────────────────────┤ Properties │
//   │  Sidebar   │           Timeline             │   Panel    │
//   └────────────┴───────────────────────────────┴────────────┘
//
// TODO: wire up the <Player> for live preview. See @remotion/player docs.

import { useEffect, useReducer, useRef, useState } from 'react';
import { Player } from '@remotion/player';
import { reducer, initialState } from './editor/state';
import { ASPECT_RATIOS, FPS } from './editor/types';
import { MainComposition } from './remotion/MainComposition';
import Timeline from './editor/Timeline';
import PropertiesPanel from './editor/PropertiesPanel';
import AssetsSidebar from './editor/AssetsSidebar';

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const playerRef = useRef(null);
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    fetch('/demo/scenes.json')
      .then((r) => r.json())
      .then((scenes) => dispatch({ type: 'LOAD_SCENES', scenes }))
      .catch((err) => console.error('Failed to load scenes.json', err));
    fetch('/demo/assets/script.txt')
      .then((r) => (r.ok ? r.text() : ''))
      .then((script) => dispatch({ type: 'LOAD_SCRIPT', script }))
      .catch(() => {});
  }, []);

  // Keep the timeline playhead in sync with the Player's current frame.
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const onFrame = (e) => setCurrentFrame(e.detail.frame);
    player.addEventListener('frameupdate', onFrame);
    return () => player.removeEventListener('frameupdate', onFrame);
  }, [state.durationFrames > 0]);

  // Spacebar toggles play/pause of the preview (unless typing in a field or the
  // Player itself is focused and handling its own shortcut).
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Space') return;
      const el = document.activeElement;
      const tag = el?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (el?.closest?.('.preview')) return;
      const player = playerRef.current;
      if (!player) return;
      e.preventDefault();
      player.isPlaying() ? player.pause() : player.play();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Seek the player and move the playhead immediately (frameupdate doesn't fire
  // for a programmatic seek while paused).
  const seek = (frame) => {
    setCurrentFrame(frame);
    playerRef.current?.seekTo(frame);
  };

  const { width, height } = ASPECT_RATIOS[state.aspectRatio];

  return (
    <div className="app">
      <AssetsSidebar state={state} dispatch={dispatch} currentFrame={currentFrame} />

      <main className="stage">
        <div className="preview">
          {state.durationFrames > 0 && (
            <Player
              ref={playerRef}
              component={MainComposition}
              durationInFrames={state.durationFrames}
              compositionWidth={width}
              compositionHeight={height}
              fps={FPS}
              style={{ width: '100%', height: '100%' }}
              controls
              inputProps={{ items: state.items, aspectRatio: state.aspectRatio }}
            />
          )}
        </div>
        <Timeline
          state={state}
          dispatch={dispatch}
          currentFrame={currentFrame}
          onSeek={seek}
        />
      </main>

      <PropertiesPanel state={state} dispatch={dispatch} />
    </div>
  );
}
