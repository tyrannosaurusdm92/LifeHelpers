# Onyx single-canvas control recovery — 2026-08-13

## Symptom

Onyx loaded visibly, but keyboard movement and drag/orbit appeared completely frozen.

## Root cause

The bundled Ammo/Emscripten runtime exposes a synchronous thenable rather than a normal Promise.
The previous boot path used:

`ammoResult.then(...).catch(...)`

The success callback could start the viewer synchronously, then the non-Promise return value caused
`.catch` itself to throw. The outer fallback handler then started the viewer a second time.

That produced two full-screen renderer canvases in the same `#viewer`. Global `renderer`, `controls`,
`catObject`, and animation-loop references were replaced by the second instance, while the first
canvas could remain the one visible to the user. Input therefore changed one control instance while
the active render loop was reading another.

## Repair

- Ammo's thenable is assimilated with `Promise.resolve(ammoResult).then(success, failure)`.
- `startViewer()` has a hard single-instance guard.
- the animation loop has a hard single-start guard.
- `initRenderer()` removes any stale viewer canvas before creating the renderer.
- pointer drag and wheel input are never discarded just because a 2.5D preset was selected;
  deliberate orbit input switches back to free inspection.
- keyboard movement keys prevent browser scrolling and remain attached at `window` level.
- keyboard/pointer state is cleared on window blur to prevent stuck keys.
- canvas layout is explicitly full-screen with touch-action disabled.
- blank areas of the inspection panel pass pointer input through to the canvas while the actual
  buttons/selects/sliders remain interactive.
- `Onyx_Cat_Only_dossier_documented(4)` is preserved under
  `development/input_recovery_donor/` as the known-working control reference.

## Protected model

No model or texture rebuild was performed in this repair.

- `cat.fbx` SHA-256: `8eaf0de737301de0f378ef3cf42c55a0bf2978514f6ebcc1d6d8c427597edd37`
- `cat.bin` SHA-256: `779934308199e3641dd59983c6cb61f1125e33ad58686c4465577d44fcbc122c`

Those hashes match the uploaded older working donor.

## Regression test

`development/tools/test_direct_open_startup.js` now emulates the problematic synchronous Ammo
thenable whose `.then()` returns `undefined`. It verifies that the viewer starts exactly once and
that stale-canvas cleanup is present.

This repair intentionally changes control/bootstrap code only; the later Onyx body, morph,
dossier, behavior, backend, and movement-recovery layers remain present.
