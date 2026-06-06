// PropertiesPanel — right-hand pane. Edits the currently selected item.
//
//   - selectedItemId null → hint.
//   - Core props (start / duration, and volume for audio) edit via UPDATE_ITEM.
//   - Applied `effects[]` and an outgoing `transition` each render their primitive's
//     PropertiesEditor; onChange patches that entry back onto the item.
//   - OVERLAY / SCENE_TYPE items edit primitiveProps through their primitive's editor.
//
// The primitive's own PropertiesEditor owns its UI — this panel just looks up the right
// primitive and wires props/onChange through.

import { FPS, ITEM_TYPES } from './types';
import { selectItem } from './state';
import { getPrimitive } from './extension/primitives';

const AUDIO_TYPES = new Set([ITEM_TYPES.VOICEOVER, ITEM_TYPES.SOUNDTRACK]);
const PRIMITIVE_ITEM_TYPES = new Set([ITEM_TYPES.OVERLAY, ITEM_TYPES.SCENE_TYPE]);
const basename = (src) => (src ? src.split('/').pop() : '');

export default function PropertiesPanel({ state, dispatch }) {
  const item = state.selectedItemId ? selectItem(state, state.selectedItemId) : null;

  if (!item) {
    return (
      <aside className="properties-panel">
        <p className="muted">Select a clip to edit its properties.</p>
      </aside>
    );
  }

  const patch = (p) => dispatch({ type: 'UPDATE_ITEM', id: item.id, patch: p });
  const isAudio = AUDIO_TYPES.has(item.type);
  const isPrimitive = PRIMITIVE_ITEM_TYPES.has(item.type);
  const primitive = isPrimitive ? getPrimitive(item.primitiveId) : null;
  const seconds = (frames) => (frames / FPS).toFixed(2);
  const title = primitive?.label ?? basename(item.src) ?? item.type;
  const intOr = (raw, fallback) => {
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : fallback;
  };

  // Effect editor → patch the matching effects[] entry.
  const onEffectChange = (idx) => (nextProps) => {
    const effects = (item.effects ?? []).map((e, i) => (i === idx ? { ...e, props: nextProps } : e));
    patch({ effects });
  };
  const removeEffect = (idx) =>
    patch({ effects: (item.effects ?? []).filter((_, i) => i !== idx) });

  // Transition editor → patch the transition entry.
  const onTransitionChange = (nextProps) =>
    patch({ transition: { ...item.transition, props: nextProps } });

  return (
    <aside className="properties-panel">
      <header className="pp-header">
        <span className="pp-title">{title}</span>
        <span className="pp-type">{item.type}</span>
      </header>

      <section className="props-form">
        {isPrimitive ? (
          <>
            <label>
              Start (f)
              <input
                type="number"
                min="0"
                step="1"
                value={item.startFrame}
                onChange={(e) => patch({ startFrame: Math.max(0, intOr(e.target.value, item.startFrame)) })}
              />
            </label>
            <label>
              Duration (f)
              <input
                type="number"
                min="1"
                step="1"
                value={item.durationFrames}
                onChange={(e) => patch({ durationFrames: Math.max(1, intOr(e.target.value, item.durationFrames)) })}
              />
            </label>
          </>
        ) : (
          <>
            <div className="pp-row">
              <span>Start</span>
              <span>{item.startFrame} f · {seconds(item.startFrame)}s</span>
            </div>
            <div className="pp-row">
              <span>Duration</span>
              <span>{item.durationFrames} f · {seconds(item.durationFrames)}s</span>
            </div>
          </>
        )}
        <p className="pp-hint">
          {seconds(item.startFrame)}s → {seconds(item.startFrame + item.durationFrames)}s
        </p>

        {isAudio && (
          <label>
            Volume
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={item.volume ?? 1}
              onChange={(e) => patch({ volume: parseFloat(e.target.value) })}
            />
          </label>
        )}
      </section>

      {/* Overlay / scene-type primitive props */}
      {isPrimitive && primitive?.PropertiesEditor && (
        <section className="pp-section">
          <div className="pp-section-head">
            <h4 className="pp-section-title">{primitive.label}</h4>
            <button className="pp-remove" onClick={() => dispatch({ type: 'REMOVE_ITEM', id: item.id })}>
              Delete
            </button>
          </div>
          <primitive.PropertiesEditor
            props={item.primitiveProps ?? primitive.defaultProps}
            onChange={(p) => patch({ primitiveProps: p })}
          />
        </section>
      )}

      {/* Applied effects */}
      {(item.effects ?? []).map((effect, idx) => {
        const primitive = getPrimitive(effect.id);
        if (!primitive) return null;
        const { PropertiesEditor } = primitive;
        return (
          <section className="pp-section" key={`${effect.id}-${idx}`}>
            <div className="pp-section-head">
              <h4 className="pp-section-title">Effect · {primitive.label}</h4>
              <button className="pp-remove" onClick={() => removeEffect(idx)}>
                Remove
              </button>
            </div>
            {PropertiesEditor && (
              <PropertiesEditor
                props={effect.props ?? primitive.defaultProps}
                onChange={onEffectChange(idx)}
              />
            )}
          </section>
        );
      })}

      {/* Outgoing transition */}
      {item.transition &&
        (() => {
          const primitive = getPrimitive(item.transition.id);
          if (!primitive) return null;
          const { PropertiesEditor } = primitive;
          return (
            <section className="pp-section">
              <div className="pp-section-head">
                <h4 className="pp-section-title">Transition · {primitive.label}</h4>
                <button className="pp-remove" onClick={() => patch({ transition: null })}>
                  Remove
                </button>
              </div>
              {PropertiesEditor && (
                <PropertiesEditor
                  props={item.transition.props ?? primitive.defaultProps}
                  onChange={onTransitionChange}
                />
              )}
            </section>
          );
        })()}
    </aside>
  );
}
