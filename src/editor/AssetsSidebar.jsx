import { useEffect, useState } from 'react';
import { TRACK_TYPES, ITEM_TYPES, FPS } from './types';
import { itemsOnTrack } from './state';
import { getPrimitivesByCategory } from './extension/primitives';
import { autoDirect, DIRECTOR_DEFAULTS } from './director';

const TABS = [
  { id: 'Visuals', label: 'Visuals' },
  { id: 'Audio', label: 'Audio' },
  { id: 'Effects', label: 'Effects' },
  { id: 'Overlays', label: 'Overlays' },
  { id: 'Director', label: 'AI Director', ai: true },
];
const basename = (src) => (src ? src.split('/').pop() : '');
const CATEGORY_TYPE = { overlay: ITEM_TYPES.OVERLAY, sceneType: ITEM_TYPES.SCENE_TYPE };

function AssetCard({ asset, kind, onAdd }) {
  const [duration, setDuration] = useState(null);

  return (
    <div className="asset-card">
      {kind === 'visual' ? (
        <video
          className="asset-thumb"
          src={`${asset.src}#t=0.1`}
          muted
          preload="metadata"
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        />
      ) : (
        <div className="asset-thumb asset-thumb-audio">♪</div>
      )}
      {kind === 'audio' && (
        <audio
          src={asset.src}
          preload="metadata"
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        />
      )}
      <div className="asset-meta">
        <span className="asset-name" title={asset.name}>
          {asset.name}
        </span>
        <span className="asset-dur">{duration ? `${duration.toFixed(1)}s` : '…'}</span>
      </div>
      {onAdd && (
        <button className="asset-add" onClick={() => onAdd(asset, duration)}>
          + Add to timeline
        </button>
      )}
    </div>
  );
}

function DirectorPanel({ state, dispatch }) {
  const [opts, setOpts] = useState(DIRECTOR_DEFAULTS);
  const toggle = (k) => () => setOpts((o) => ({ ...o, [k]: !o[k] }));

  const run = () => {
    if (!state.baseItems?.length) return;
    dispatch({ type: 'SET_ITEMS', items: autoDirect(state.baseItems, state.script, opts) });
  };
  const reset = () => dispatch({ type: 'SET_ITEMS', items: state.baseItems });

  const TOGGLES = [
    ['cinematic', 'Cinematic frame + grade'],
    ['motion', 'Camera motion per scene'],
    ['autoTransitions', 'Scene transitions'],
    ['kineticText', 'Kinetic emphasis text'],
    ['titleCard', 'Opening title'],
    ['endCard', 'End card'],
  ];

  return (
    <div className="director">
      <p className="muted director-lead">
        Auto-Director reads each scene’s type, length and position, plus the voiceover script,
        and applies a tasteful set of reusable primitives in one pass.
      </p>
      <div className="director-opts">
        {TOGGLES.map(([key, label]) => (
          <label key={key} className="director-check">
            <input type="checkbox" checked={!!opts[key]} onChange={toggle(key)} />
            <span>{label}</span>
          </label>
        ))}
        <label className="director-channel">
          <span>Channel</span>
          <input
            type="text"
            value={opts.channel}
            onChange={(e) => setOpts((o) => ({ ...o, channel: e.target.value }))}
          />
        </label>
      </div>
      <div className="director-actions">
        <button className="btn-primary" onClick={run} disabled={!state.baseItems?.length}>
          ✦ Auto-Direct
        </button>
        <button className="btn-secondary" onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  );
}

export default function AssetsSidebar({ state, dispatch, currentFrame = 0 }) {
  const [tab, setTab] = useState('Visuals');
  const [manifest, setManifest] = useState({ visuals: [], audio: [] });
  const [modalEffect, setModalEffect] = useState(null);
  const [picked, setPicked] = useState(() => new Set());

  useEffect(() => {
    fetch('/demo/manifest.json')
      .then((r) => (r.ok ? r.json() : { visuals: [], audio: [] }))
      .then((m) => setManifest({ visuals: m.visuals ?? [], audio: m.audio ?? [] }))
      .catch(() => {});
  }, []);

  const scenes = itemsOnTrack(state, TRACK_TYPES.V1);

  const eligible = (primitive, i) =>
    primitive.canApply ? !!primitive.canApply(scenes[i], scenes[i + 1]) : true;
  const eligibleIds = (primitive) =>
    scenes.filter((_, i) => eligible(primitive, i)).map((s) => s.id);

  const openEffectModal = (primitive) => {
    setModalEffect(primitive);
    setPicked(new Set(eligibleIds(primitive)));
  };
  const closeModal = () => setModalEffect(null);

  const togglePick = (id) =>
    setPicked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const applyEffectToPicked = () => {
    scenes.forEach((scene) => {
      if (!picked.has(scene.id)) return;
      if (modalEffect.category === 'transition') {
        dispatch({
          type: 'SET_TRANSITION',
          itemId: scene.id,
          transition: { id: modalEffect.id, props: { ...modalEffect.defaultProps } },
        });
      } else {
        dispatch({
          type: 'APPLY_EFFECT',
          itemId: scene.id,
          primitiveId: modalEffect.id,
          props: { ...modalEffect.defaultProps },
        });
      }
    });
    closeModal();
  };

  const totalFrames = state.durationFrames || FPS * 5;

  const addAudioItem = (asset, durationSeconds) => {
    const isVoice = /voice|narrat|^vo[\W_]/i.test(asset.name);
    const fileFrames = durationSeconds ? Math.round(durationSeconds * FPS) : totalFrames;
    dispatch({
      type: 'ADD_ITEM',
      item: {
        type: isVoice ? ITEM_TYPES.VOICEOVER : ITEM_TYPES.SOUNDTRACK,
        trackId: isVoice ? TRACK_TYPES.A1 : TRACK_TYPES.A2,
        src: asset.src,
        startFrame: 0,
        durationFrames: Math.max(FPS, Math.min(fileFrames, totalFrames || fileFrames)),
        volume: isVoice ? 1.0 : 0.2,
      },
    });
  };

  const addPrimitiveItem = (primitive) => {
    const duration = Math.min(Math.round(FPS * 3), Math.max(FPS, totalFrames));
    const startFrame = Math.max(0, Math.min(currentFrame, Math.max(0, totalFrames - duration)));
    dispatch({
      type: 'ADD_ITEM',
      item: {
        type: CATEGORY_TYPE[primitive.category],
        trackId: TRACK_TYPES.O1,
        primitiveId: primitive.id,
        primitiveProps: { ...primitive.defaultProps },
        startFrame,
        durationFrames: duration,
      },
    });
  };

  return (
    <aside className="assets-sidebar">
      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab${tab === t.id ? ' is-active' : ''}${t.ai ? ' is-ai' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.ai ? `✦ ${t.label}` : t.label}
          </button>
        ))}
      </div>

      {tab === 'Visuals' && (
        <div className="asset-grid">
          {manifest.visuals.length === 0 && <p className="muted">No visuals found.</p>}
          {manifest.visuals.map((a) => (
            <AssetCard key={a.src} asset={a} kind="visual" />
          ))}
        </div>
      )}

      {tab === 'Audio' && (
        <div className="asset-grid">
          {manifest.audio.length === 0 && <p className="muted">No audio found.</p>}
          {manifest.audio.map((a) => (
            <AssetCard key={a.src} asset={a} kind="audio" onAdd={addAudioItem} />
          ))}
        </div>
      )}

      {tab === 'Effects' && (
        <div className="effects-list">
          <p className="muted">Pick an effect, then choose which scenes to apply it to.</p>
          {['effect', 'transition'].flatMap((cat) =>
            getPrimitivesByCategory(cat).map((p) => (
              <button key={p.id} className="effect-item" onClick={() => openEffectModal(p)}>
                <span className="effect-cat">{p.category}</span>
                <span className="effect-label">{p.label}</span>
              </button>
            ))
          )}
        </div>
      )}

      {tab === 'Overlays' && (
        <div className="effects-list">
          <p className="muted">Click to drop an overlay or scene-type at the playhead, then position it on the timeline.</p>
          {['overlay', 'sceneType'].flatMap((cat) =>
            getPrimitivesByCategory(cat).map((p) => (
              <button key={p.id} className="effect-item" onClick={() => addPrimitiveItem(p)}>
                <span className="effect-cat">{p.category}</span>
                <span className="effect-label">{p.label}</span>
              </button>
            ))
          )}
        </div>
      )}

      {tab === 'Director' && <DirectorPanel state={state} dispatch={dispatch} />}

      {modalEffect && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <header className="modal-head">
              <h3>Apply “{modalEffect.label}”</h3>
              <span className="muted">{picked.size} selected</span>
            </header>

            {modalEffect.canApply && (
              <p className="muted">
                {modalEffect.label} is only valid on some scenes — ineligible scenes are disabled.
              </p>
            )}

            <div className="modal-actions-top">
              <button onClick={() => setPicked(new Set(eligibleIds(modalEffect)))}>Select all</button>
              <button onClick={() => setPicked(new Set())}>Clear</button>
            </div>

            <ul className="scene-list">
              {scenes.length === 0 && <li className="muted">No scenes on the Visuals track.</li>}
              {scenes.map((scene, i) => {
                const ok = eligible(modalEffect, i);
                return (
                  <li key={scene.id}>
                    <label className={ok ? '' : 'is-disabled'}>
                      <input
                        type="checkbox"
                        disabled={!ok}
                        checked={picked.has(scene.id)}
                        onChange={() => togglePick(scene.id)}
                      />
                      <span className="scene-idx">{i + 1}</span>
                      <span className="scene-name">{basename(scene.src) || scene.id}</span>
                      {!ok && <span className="scene-note">not eligible</span>}
                    </label>
                  </li>
                );
              })}
            </ul>

            <footer className="modal-foot">
              <button className="btn-secondary" onClick={closeModal}>Cancel</button>
              <button
                className="btn-primary"
                disabled={picked.size === 0}
                onClick={applyEffectToPicked}
              >
                Apply to {picked.size} scene{picked.size === 1 ? '' : 's'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </aside>
  );
}
