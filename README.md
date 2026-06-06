# TubeGen Video Editor — Take-Home Challenge

A 24-hour take-home for the **Video Editor Engineer** role at [TubeGen](https://tubegen.ai).

You're given a working React + Vite + Remotion video editor and a demo project. Your job is to
produce the most compelling final cut you can — by adding **reusable editor primitives**, not
one-off hacks — and render it to MP4.

## This submission

See **[`WRITEUP.md`](./WRITEUP.md)** for the full rationale. In short:

- **19 reusable primitives** on a shared design system (`src/editor/extension/lib/` — tokens, motion,
  fields). New this fork: Ken Burns, Camera Shake, Color Grade (effects); Dip-to-Color, Slide, Glitch
  Dissolve (transitions); Kinetic Text, Callout, Stat Meter, Cinematic Frame (overlays); Title Card,
  Bar Chart, End Card (scene types). None reference the demo's assets, durations, or scene indices.
- **Extended editor surface:** an Overlays tab to place overlay/scene-type items on a new **O1** track
  (drag/resize), a **Music (A2)** track, and item editing/deletion — all driven by the registry, with no
  primitive-specific code in `MainComposition.jsx` / `VideoItem.jsx`.
- **Bonus — AI Auto-Director** (`src/editor/director.js`, "✦ AI Director" tab): content-aware auto-edit from
  scene type/length/position + the transcript, idempotent with a Reset.
- **Starter bug fixed:** `npm run render` failed to bundle (`"type": "module"` + extensionless ESM
  imports). Fixed with `remotion.config.js`. The final cut is in `public/demo/scenes.json`; render output
  is `out/final.mp4`.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173 — live editor
npm run render       # renders the demo project to out/final.mp4
```

A ~35s render at 30fps takes a few minutes on a laptop; plan your render-iteration time.

## Read these, in order

1. **[`CHALLENGE.md`](./CHALLENGE.md)** — the full brief: goal, deliverables, time budget, bonus.
2. **[`src/editor/extension/README.md`](./src/editor/extension/README.md)** — ★ the extension contract. How a new primitive plugs in, with worked examples. Read before writing any code.
3. **[`RUBRIC.md`](./RUBRIC.md)** — exactly how you're scored.

## How the editor works (read this)

This mirrors how TubeGen actually works, so the constraints are deliberate:

- **Scenes are fixed.** Each scene's position and duration come from `scenes.json` and are
  **locked** — you can't move, trim, or extend scenes on the timeline. TubeGen's AI lays out the
  scene timing against the voiceover; your job is to *enhance* each scene, not re-cut the edit.
- **You enhance scenes with primitives.** Transitions, camera effects, overlays, and scene types
  are all **reusable primitives** registered in `src/editor/extension/`. Pick an effect in the
  Effects tab and choose which scenes to apply it to.
- **Scene `type` matters.** A scene is `image`, `animation`, or `broll`. Types drive editing rules —
  e.g. **Crossfade only applies at the end of an `image` scene whose next scene is also an `image`**
  (a primitive declares this with an optional `canApply` predicate). The timeline plays whatever the
  file actually is (video files play; image files render as stills) regardless of the tag.
- **The playhead** follows the preview; click or drag anywhere on the timeline to scrub.

## Repo layout

```
src/
├── App.jsx                            3-pane layout + Remotion <Player> preview
├── editor/
│   ├── types.js                       ITEM_TYPES, TRACK_TYPES, ASPECT_RATIOS, FPS
│   ├── state.js                       Editor reducer (items, selection, duration)
│   ├── Timeline.jsx                   Two tracks, drag-move, edge-resize, playhead
│   ├── PropertiesPanel.jsx            Selected-item / primitive props editor
│   ├── AssetsSidebar.jsx              Tabs: Visuals / Audio / Effects
│   └── extension/
│       ├── README.md                  ★ How to add a new primitive — read this first
│       ├── primitives.js              Primitive registry
│       ├── transitions/crossfade.jsx  Worked example (transition, image→image only)
│       ├── effects/                   Worked examples: zoomIn, zoomOut, panLeft, panRight
│       └── overlays/lowerThird.jsx    Worked example (overlay)
└── remotion/
    ├── index.js / Root.jsx            registerRoot
    ├── MainComposition.jsx            Track orchestration + primitive registry
    ├── VideoItem.jsx                  Renders a video-track item + its effects
    └── AudioTrack.jsx

public/demo/
├── assets/voiceover.mp3              narration
├── assets/visuals/001.mp4 … 012.mp4  visual clips
├── assets/script.txt                 the voiceover script
├── scenes.json                       wires the demo onto the timeline (loaded on mount)
└── manifest.json                     generated from assets/ on dev/build (gen-manifest.mjs)

scripts/
├── gen-manifest.mjs                  scans public/demo/assets → manifest.json
└── render.js                         `npm run render` entry point
```

## Submission

Push everything to a **public GitHub repo** and reply to your recruiter email with:

1. Repo URL
2. Loom URL (3–5 min walkthrough)
3. Link to `out/final.mp4` (or commit it if <100MB)

Good luck — have fun with it.
