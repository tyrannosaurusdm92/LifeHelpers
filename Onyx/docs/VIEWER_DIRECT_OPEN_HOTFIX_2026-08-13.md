# Onyx Viewer Direct-Open Hotfix — 2026-08-13

## Reproduced failure

The Windows/Chrome `file:///.../Onyx_Cat_Only/index.html` screenshot showed:

`ReferenceError: Cannot access 'MORPH_INSPECTION_CONTROLS' before initialization`

The call chain was `startViewer -> init -> bindInspectionUI -> bindMorphInspectionSliders`.

## Root cause

The bundled Emscripten Ammo runtime may return a thenable whose `.then()` callback runs synchronously. The viewer previously invoked `startViewer()` from that callback near the top of `viewer.js`. That allowed `init()` to execute before later top-level `const` declarations had initialized. `MORPH_INSPECTION_CONTROLS` was therefore still in its temporal dead zone when the inspection UI bound its sliders.

## Repair

Viewer boot is now deferred with `window.setTimeout(bootViewer, 0)`. This guarantees the complete classic script finishes evaluating before Ammo (including a synchronously resolving thenable) is allowed to call `init()`.

The physics-optional fallback remains intact. This repair does not alter the canonical FBX/BIN, morph layers, body corrections, textures, dossier runtime, progression runtime, backend bridge, or animation libraries.

## Regression test

`development/tools/test_direct_open_startup.js` deliberately emulates a synchronous Ammo thenable and verifies that morph inspection binding can execute only after all declarations initialize.

Expected output:

`PASS: synchronous Ammo thenable cannot start viewer before MORPH_INSPECTION_CONTROLS initialization.`

The package validator also executes this regression test.

## Browser validation boundary

The container's headless Chromium GPU process cannot initialize its available EGL/ANGLE implementation, so a true rendered WebGL screenshot cannot be produced here. This is an environment limitation, not counted as a successful visual test. The exact startup race from the supplied Chrome screenshot is separately reproduced and regression-tested without requiring a GPU context.
