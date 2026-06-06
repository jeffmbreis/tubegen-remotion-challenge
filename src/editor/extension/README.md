# The Extension Contract

This is where the editor is extended. **Read this whole file before adding anything to the editor.**

Every new transition, camera effect, overlay, or scene type you add is a **primitive**. Primitives are typed, configurable, and registered in one place: [`primitives.js`](./primitives.js). The Timeline, PropertiesPanel, AssetsSidebar, and Remotion compositions all consume the registry — so adding a primitive is one new file plus one registry entry. Nothing else.

If you find yourself reaching into `MainComposition.jsx`, `VideoItem.jsx`, or `Timeline.jsx` to add a new primitive, **stop**. The seam is broken or you missed it. Re-read this doc.

## What is a primitive?

A primitive is an object that declares:

```js
{
  id: 'zoomIn',                       // unique slug
  label: 'Zoom In',                   // human-readable, shown in the UI
  category: 'effect',                 // 'transition' | 'effect' | 'overlay' | 'sceneType'
  defaultProps: { startScale: 1.0, endScale: 1.15 }, // initial props for a new instance
  RemotionComponent: ZoomInRender,    // (props, ctx) => JSX, rendered inside the composition
  PropertiesEditor: ZoomInPropsUI,    // (props, onChange) => JSX, rendered in PropertiesPanel
}
```

That's the entire contract.

- `id` — must be unique across all primitives.
- `label` — short. Shown in the AssetsSidebar tab and in the PropertiesPanel header when the primitive is selected.
- `category` — one of:
  - `transition` — applies *between* two consecutive items on the same track (e.g., crossfade, wipe).
  - `effect` — applies *to* a single item (e.g., camera pan, color filter).
  - `overlay` — its own item type on the timeline (e.g., lower-third, title card, callout box).
  - `sceneType` — a data-driven scene with no media URL (e.g., chart, map, animated text). Used like overlays but typically generated from structured data rather than user-positioned.
- `defaultProps` — the props object copied when the user adds an instance of this primitive. Must be JSON-serializable (no functions, no refs). This is what makes primitives template-able: the same primitive can be applied to a hundred different items, each with its own props.
- `RemotionComponent` — the Remotion render function. Receives `{ props, ctx, children }` where `props` is the user-tuned values and `ctx` provides `{ durationFrames, item }` (effects) or `{ durationFrames, prevItem, nextItem }` plus a `renderItem(item)` helper (transitions). Wraps the underlying media (effects) or renders standalone (overlays / scene types / transitions).
- `PropertiesEditor` — the React component for tuning props in the right-hand PropertiesPanel. Receives `({ props, onChange })`. Must be controlled.
- `canApply?` *(optional)* — `(scene, nextScene) => boolean`. Restricts where the editor lets a user apply this primitive. The crossfade transition uses it to allow itself only at the end of an image scene whose next scene is also an image. Omit it and the primitive can be applied to any scene.

## Adding a new primitive — step by step

1. **Pick a file** under `src/editor/extension/<category>/<your-id>.{js,jsx}`. One primitive per file.
2. **Implement the RemotionComponent and PropertiesEditor.** Copy a worked example as a starting point:
   - Camera effect → [`effects/zoomIn.jsx`](./effects/zoomIn.jsx) (also `zoomOut`, `panLeft`, `panRight`)
   - Transition → [`transitions/crossfade.jsx`](./transitions/crossfade.jsx) (shows `ctx`, `renderItem`, and `canApply`)
   - Overlay → [`overlays/lowerThird.jsx`](./overlays/lowerThird.jsx)
   - Scene type → no example ships — building one (a chart, a map, animated text) is a great way to show the seam works.
3. **Export a single default object** matching the contract above.
4. **Register it** in [`primitives.js`](./primitives.js):
   ```js
   import myPrimitive from './transitions/my-primitive';
   export const PRIMITIVES = [
     // ... existing
     myPrimitive,
   ];
   ```
5. **That's it.** Run `npm run dev` — your primitive appears in the AssetsSidebar under its category tab, can be dragged onto the timeline, and its PropertiesEditor shows up when the user selects an instance.

## What makes a primitive reusable (vs hardcoded)

This is the bar we're evaluating you against. A primitive is reusable if it works on **any** project, not just the demo.

✅ **Reusable:**
- `defaultProps` are sane defaults that look reasonable on any scene.
- Props are typed (use TypeScript or JSDoc — your choice, but be consistent).
- The RemotionComponent reads from `props` and `ctx`, never from module-scope state or hardcoded asset paths.
- Color, font, duration, intensity — all configurable.

❌ **Not reusable:**
- The component imports a specific asset from `/public/demo/`.
- Duration is hardcoded to match this voiceover's pacing.
- The overlay text is hardcoded to "Episode 1: The Rise of Espresso".
- The effect only works at a specific aspect ratio.

If your primitive depends on data, accept that data as a prop. If it depends on the host project (e.g., a transcript-driven primitive needs the voiceover transcript), pull it from `ctx`, not from a hardcoded import.

## Worked examples

Several primitives ship with the starter. Read them in order, fastest first:

1. **[`effects/zoomIn.jsx`](./effects/zoomIn.jsx)** — simplest. ~30 lines. Scales the item over its duration. Shows the camera-effect category.
2. **[`effects/panLeft.jsx`](./effects/panLeft.jsx)** / **[`panRight.jsx`](./effects/panRight.jsx)** / **[`zoomOut.jsx`](./effects/zoomOut.jsx)** — variations on the camera-effect category with their own props.
3. **[`overlays/lowerThird.jsx`](./overlays/lowerThird.jsx)** — overlay category. Standalone item with text props.
4. **[`transitions/crossfade.jsx`](./transitions/crossfade.jsx)** — transition category. Reads `nextItem` from `ctx`, dissolves into the next scene, and uses `canApply` to restrict itself to image→image boundaries.

`sceneType` examples now ship too: **`sceneTypes/titleCard.jsx`**, **`sceneTypes/barChart.jsx`** (data-driven), and **`sceneTypes/endCard.jsx`**.

## The shared design lib (`lib/`)

New primitives build on a small design system so the whole editor stays consistent and resolution-independent. Import from `../lib/*`:

- **`lib/tokens.js`** — `COLORS`, `GRADIENTS`, `FONTS`, `TYPE` (size scale), `WEIGHT`, `TRACKING`, `LEADING`, `SPACE`, `RADIUS`, `SHADOW`, and `scaleForHeight(height)`.
- **`lib/motion.jsx`** — `EASE`, `SPRING` presets, `useCanvasScale()` (= `height/1080`, multiply every px by it), `useSpringValue(delay, config)`, `ramp(frame, inRange, outRange, easing)` (clamped interpolate), `exitFade(frame, dur, exitFrames)` (0-safe), `staggerDelay`, `toWords`, and the `AnimatedEntry` / `AnimatedWords` components.
- **`lib/fields.jsx`** — controlled PropertiesEditor inputs: `Fields`, `NumberField`, `RangeField`, `TextField`, `ColorField`, `SelectField`. Each `onChange` hands back the already-parsed value, so a whole editor is one declarative block.

Resolution independence is part of the contract: size everything off `useCanvasScale()` rather than raw pixels, and a primitive will look right at 16:9 or 9:16.

## Placing overlays & scene types (editor seam)

Effects and transitions are *applied to existing scenes* (the **Effects** tab → scene-picker modal). Overlays and scene types are *their own timeline items*, so they need to be placed:

- The **Overlays** tab lists every `overlay` / `sceneType` primitive. Clicking one drops an instance on the **O1** overlay track at the playhead.
- O1 items are authorable: drag the body to move, drag an edge to resize, edit start/duration or delete in the PropertiesPanel. (Scene clips on V1 stay locked.)
- Audio lives on **A1** (voiceover) and **A2** (music).

All of this reads the registry generically — adding a primitive still means *one file + one registry line*, with no edits to `Timeline.jsx`, `AssetsSidebar.jsx`, `MainComposition.jsx`, or `VideoItem.jsx`.

## Anti-patterns we flag

- **Forking VideoItem.jsx or MainComposition.jsx** to add a new render branch instead of using the registry. Don't.
- **Storing primitive props in component state** instead of on the timeline item. Primitives must be serializable so the same project can be rendered headless via `npm run render`.
- **Mutating `defaultProps`** at runtime (e.g., `defaultProps.x++`). It's the *template*. Treat it as frozen.
- **Side effects in the RemotionComponent** (timers, network calls, refs that survive frames). Remotion's frame model is pure — components are called many times per frame during chunked rendering.

## Performance notes

The starter renders frame-by-frame via `@remotion/renderer`. If your primitive does heavy work per frame:

- **Memoize.** `useMemo` on expensive derived values. Remotion calls components ~30 times per second of output × the chunk size.
- **Use `Sequence` with `premountFor`** when overlaying videos, to avoid black flashes while the underlying `<video>` element seeks.
- **Avoid `setState` inside RemotionComponent.** Remotion components should be pure functions of `props + frame`.

A 90-second render at 30fps = 2,700 frames. If each frame takes 50ms more than it should because of an unnecessary recompute, that's 2.25 extra minutes of render time. Multiply by every render iteration the candidate runs.
