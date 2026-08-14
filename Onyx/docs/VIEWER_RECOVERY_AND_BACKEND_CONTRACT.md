# Viewer recovery and backend contract pass — 2026-08-13

## Recovery source

This pass starts from the reshared **Onyx_Cat_Only_Dossier_Canonical_Correction_Pass** rather than trusting the later broken-viewer branch. The protected `cat.fbx` and `cat.bin` remain the canonical SmellyCat-lineage source assets.

## Viewer failure containment

The viewer now has two runtime paths:

1. **Physics path** — bundled Ammo initializes and provides collision, gravity, locomotion and jump trajectory.
2. **Inspection-safe path** — if Ammo is absent or rejects initialization, Onyx still loads with the same FBX, textures, morph layers, animation mixer, orbit/zoom, wireframe, skeleton, measurements, dossier references and kinematic movement/jump preview.

Ammo is therefore no longer allowed to make the inspection viewer blank.

A VM smoke test deliberately omits Ammo and verifies that startup proceeds past the dependency gate. A real GPU/WebGL screenshot remains environment-dependent; the container Chromium build cannot create EGL/ANGLE here, so the audit does not pretend otherwise.

## Backend contract

Endpoint configured in `runtime/onyx-dossier-runtime.js`:

`https://script.google.com/macros/s/AKfycbwxviV1hERFKIivY5we5W1gVMqfsH6DNY0mNZkEs2SXcoa4gDM88c14tIyraytnSAyKvQ/exec`

The attached Apps Script source was treated as authoritative. The frontend bridge now:

- sends a JSON `data` envelope because the backend parses `payload.data` before runtime routing;
- sends `behavior` and `activity` to `onyx.runtime.behavior.sync` (not the previous mismatched `currentBehavior/currentActivity` names);
- can call `onyx.runtime.health`, `onyx.runtime.capabilities.report`, `onyx.runtime.mode.select`, `onyx.runtime.behavior.sync`, and `onyx.runtime.activity.sync`;
- never requires the backend in order to load the cat or viewer;
- supports `?profileKey=william` and `?profileKey=jasper`, with an allow-list rather than arbitrary profile keys.

## Ordinary play vs inspection

The dossier says ordinary presentation must use controlled 2.5D cameras, while the canonical instruction file requires unrestricted inspection. These are both implemented without contradiction:

- **Inspection: free 360°** — unrestricted orbit, top, underside, side, smooth zoom.
- **Ordinary 2.5D preview** — dossier-approved fixed yaw/pitch presets; dragging/wheel orbit is disabled.

The full room is still intentionally not fabricated in this cat-only package.
