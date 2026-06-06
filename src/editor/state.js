// Editor state — useReducer-based.
//
// State shape:
// {
//   items: Item[],          // flat list, see types.js for Item shape
//   selectedItemId: string | null,
//   aspectRatio: '16:9' | '9:16',
//   durationFrames: number, // total composition duration (max endFrame across items, or voiceover length)
// }
//
// TODO (candidate-facing — this is part of the starter, candidates extend it):
//   Implement the actions below. The reducer ships with stubs so the file is parseable;
//   if you find an action missing for a feature you're building, add it here, don't
//   bury state mutations in components.

import { makeItemId } from './types';

// Total composition length = the last frame any item occupies.
const totalDuration = (items) =>
  items.reduce((max, i) => Math.max(max, (i.startFrame ?? 0) + (i.durationFrames ?? 0)), 0);

export const initialState = {
  items: [],
  baseItems: [],
  script: '',
  selectedItemId: null,
  aspectRatio: '16:9',
  durationFrames: 0,
};

export function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_SCENES': {
      // action.scenes: Item[] — typically from scenes.json
      const items = action.scenes.map((s) => ({ ...s, id: s.id ?? makeItemId() }));
      return { ...state, items, baseItems: items, durationFrames: totalDuration(items) };
    }

    case 'LOAD_SCRIPT':
      return { ...state, script: action.script ?? '' };

    case 'SET_ITEMS': {
      // action.items: Item[] — replace the whole timeline (used by the Auto-Director)
      const items = action.items.map((i) => ({ ...i, id: i.id ?? makeItemId() }));
      const selectedItemId = items.some((i) => i.id === state.selectedItemId)
        ? state.selectedItemId
        : null;
      return { ...state, items, selectedItemId, durationFrames: totalDuration(items) };
    }

    case 'SELECT_ITEM':
      return { ...state, selectedItemId: action.id };

    case 'UPDATE_ITEM': {
      // action.id, action.patch (partial Item)
      const items = state.items.map((i) => (i.id === action.id ? { ...i, ...action.patch } : i));
      return { ...state, items, durationFrames: totalDuration(items) };
    }

    case 'MOVE_ITEM': {
      // action.id, action.startFrame
      return reducer(state, { type: 'UPDATE_ITEM', id: action.id, patch: { startFrame: action.startFrame } });
    }

    case 'RESIZE_ITEM': {
      // action.id, action.durationFrames (and optionally action.startFrame for left-edge resize)
      const patch = { durationFrames: action.durationFrames };
      if (action.startFrame != null) patch.startFrame = action.startFrame;
      return reducer(state, { type: 'UPDATE_ITEM', id: action.id, patch });
    }

    case 'ADD_ITEM': {
      // action.item (without id)
      const item = { ...action.item, id: makeItemId() };
      const items = [...state.items, item];
      return { ...state, items, durationFrames: totalDuration(items) };
    }

    case 'REMOVE_ITEM': {
      const items = state.items.filter((i) => i.id !== action.id);
      const selectedItemId = state.selectedItemId === action.id ? null : state.selectedItemId;
      return { ...state, items, selectedItemId, durationFrames: totalDuration(items) };
    }

    case 'APPLY_EFFECT': {
      // action.itemId, action.primitiveId, action.props
      const items = state.items.map((i) => {
        if (i.id !== action.itemId) return i;
        const effects = [...(i.effects ?? []), { id: action.primitiveId, props: action.props }];
        return { ...i, effects };
      });
      return { ...state, items };
    }

    case 'SET_TRANSITION': {
      // action.itemId, action.transition: { id, props } | null
      return reducer(state, {
        type: 'UPDATE_ITEM',
        id: action.itemId,
        patch: { transition: action.transition },
      });
    }

    case 'SET_ASPECT_RATIO':
      return { ...state, aspectRatio: action.aspectRatio };

    default:
      return state;
  }
}

// Selectors — keep derived values here so components don't reinvent them.
export const selectItem = (state, id) => state.items.find((i) => i.id === id) ?? null;

export const itemsOnTrack = (state, trackId) =>
  state.items.filter((i) => i.trackId === trackId).sort((a, b) => a.startFrame - b.startFrame);
