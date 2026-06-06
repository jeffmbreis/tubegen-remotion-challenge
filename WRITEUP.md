# Writeup — TubeGen Final Cut

The demo is a faceless YouTube explainer ("Why your dog barks at night"). My goal was to make it feel
like a channel a real creator ships: a cinematic, cohesive grade, motion that serves the voiceover,
emphasis where the script lands, and two genuine data moments — all built as **reusable primitives**,
never hand-placed on this footage.

## Primitives I added (why → what)

Everything sits on a small shared design system so the look is consistent and resolution-independent:
- **`extension/lib/tokens.js`** — colors, type scale, spacing, radii, shadows + a `scaleForHeight` helper.
- **`extension/lib/motion.jsx`** — easing/spring presets, `useSpringValue`, `useCanvasScale`, `ramp`,
  `exitFade`, stagger, and `AnimatedEntry` / `AnimatedWords` (fade+translate, spring, word stagger).
- **`extension/lib/fields.jsx`** — typed PropertiesEditor controls (Number/Range/Text/Color/Select) so
  every primitive's editor is one declarative block.

| Why I added it | Primitive(s) |
|---|---|
| Still-ish footage needs life and a focal intent | **Ken Burns** (focal point + zoom + drift), **Camera Shake** (handheld / one-shot impact) |
| One consistent, gradeable cinematic look | **Color Grade**, **Cinematic Frame** (letterbox + vignette + film grain) |
| Cuts should feel intentional, not mechanical | **Dip to Color**, **Slide**, **Glitch Dissolve** (the brain "reveal") |
| Land the key phrase the VO is saying | **Kinetic Text** (word-stagger emphasis, not full captions) |
| Point at what matters on screen | **Callout** (anchored dot + drawn leader line + label) |
| Show the science, not just say it | **Stat Meter** (animated gauge), **Bar Chart** (data-driven scene) |
| Open and close like a real upload | **Title Card**, **End Card** (the brief shipped no `sceneType` example — these are two) |

Reusability bar: no primitive imports a demo asset, hardcodes a scene index, or bakes in this VO's timing.
All sizing scales with the canvas, so they work at 16:9 or 9:16. Each prop is exposed in its editor.
The final cut lives entirely in `public/demo/scenes.json` (data), not in the primitives (code).

## How a primitive plugs in

One file under `extension/<category>/`, one line in `extension/primitives.js`. The Timeline,
PropertiesPanel, AssetsSidebar and the Remotion compositions all read the registry generically — I added
**zero** primitive-specific branches to `MainComposition.jsx` / `VideoItem.jsx`. Where the starter's seam
stopped, I extended it (without breaking it): a shared `lib/`, an **Overlays** tab that drops
overlay/`sceneType` instances onto a new **O1** timeline track (drag to move, edge to resize), a **Music**
(A2) track, and editing/deleting of placed items in the PropertiesPanel.

## Extras (beyond the brief)

- **✦ AI Director** (`src/editor/director.js`, the "✦ AI Director" tab) — the optional AI feature. A
  content-aware auto-edit that reads each scene's **type, length and position** plus the **voiceover
  transcript**, then applies a tasteful set of the primitives above in one pass (grade + cinematic frame,
  per-scene Ken Burns/handheld, sparse intentional transitions, kinetic emphasis pulled from the script,
  title + end card). Deterministic and idempotent — it recomputes from the base scenes, and **Reset**
  reverts. Scoped tight on purpose; the obvious next step is swapping the heuristic for an LLM pass.
- **AI-generated soundtrack** — the music bed is generated with the kie.ai (Suno) API
  (`scripts/gen-music.mjs`), trimmed with fades and mixed ~12 dB under the voiceover on the **A2** track so
  the narration stays clearly on top. The script falls back to a locally-synthesized ffmpeg ambient bed
  when no API key is set, and the rendered `soundtrack.mp3` is committed — so `npm run render` needs no
  network or key.
- **Extended the editor seam** — added overlay/`sceneType` placement (Overlays tab → new **O1** track with
  drag/resize/delete), an **A2 music** track you can drop audio onto, item editing in the PropertiesPanel,
  and a shared design-system lib (`extension/lib/` — tokens/motion/fields) so every primitive stays
  consistent and resolution-independent across 16:9 and 9:16.
- **Fixed a starter bug** — `npm run render` was broken as shipped: `package.json` is `"type": "module"`,
  so webpack treats the Remotion entry as strict ESM and rejects the extensionless `./Root` imports
  (`fullySpecified`). Added `remotion.config.js` with a `{ resolve: { fullySpecified: false } }` override;
  render now works end-to-end.

## What I'd ship next (another 24h)

- Per-word kinetic captions auto-synced from the transcript (the director already parses it).
- True sidechain ducking of the music to the voiceover instead of a fixed level.
- A waveform / EQ `sceneType` (continuous audio-reactive motion).
- LLM-backed director that proposes emphasis copy and transition intent per beat.

## Hours & cuts

- **Hours spent:** ~3h.
- **What I cut for time:** a `9:16` re-frame pass, undo/redo, and a richer chart editor (color picker presets).
