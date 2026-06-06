# Loom script (3–5 min)

> Goal of the rubric's 5%: show the final cut first, then prove the seam works on one primitive.
> Speak to *why* before *what*. Keep it tight.

## 0. Cold open (0:00–0:15)
"This is the TubeGen take-home. First, the final cut — then I'll open the editor and show how a new
primitive plugs into the extension seam."

## 1. The final cut (0:15–1:15) — play `out/final.mp4`
Let it play. Narrate lightly, once:
- "Everything you see is a **reusable primitive**, not hand-placed: a cinematic grade + letterbox tie the
  whole thing together, Ken Burns gives the still-ish art motion, kinetic text lands the key phrase the
  voiceover is saying, and there are two real data moments — an animated bar chart and a threat-threshold
  meter — plus a title and end card."
- "Music is an AI-generated bed mixed under the narration."

## 2. The editor + the seam (1:15–3:30)
Open `npm run dev`.
- **Effects tab:** "Effects and transitions apply *to* existing scenes — pick one, choose scenes."
- **Overlays tab:** click *Stat Meter* → "overlays and scene-types are their own items; clicking drops one
  on the O1 track at the playhead." Drag it / resize it. Select it → tweak props live in the Properties panel.
- **Open one primitive file** — `src/editor/extension/sceneTypes/barChart.jsx`:
  - "The entire chart is driven by the `data` prop — no demo data baked in. Sizes scale off
    `useCanvasScale` so it works at any resolution. It's pure: frame + props only."
  - Point to the default export `{ id, label, category, defaultProps, RemotionComponent, PropertiesEditor }`.
- **Show the registry** — `src/editor/extension/primitives.js`: "One import, one line in the array. That's
  the whole contract. Nothing in `MainComposition` or `VideoItem` knows this primitive exists."

## 3. Bonus — AI Auto-Director (3:30–4:30)
- **✦ AI Director tab** → toggle a couple options → **Auto-Direct**.
- "It reads each scene's type, length and position plus the voiceover transcript, then applies a tasteful
  primitive set in one pass. It's deterministic and idempotent — **Reset** reverts to the base scenes."
- Scrub to show grade + motion + kinetic emphasis appear on the timeline (O1 fills with overlays).

## 4. Close (4:30–5:00)
- "I also fixed a starter bug — `npm run render` couldn't bundle because of an ESM/`fullySpecified` issue;
  one `remotion.config.js` override fixes it."
- "Full rationale's in `WRITEUP.md`. Thanks!"

## Tips
- Have `out/final.mp4`, the editor, and `barChart.jsx` open in tabs before recording.
- One take is fine; the cut carries it.
