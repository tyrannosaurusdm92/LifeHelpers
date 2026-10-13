# Savanski: Selection and Accidental Cyan Paint Repair (2026-10-13)

## Root cause found

The visible **Select** button under `#savanski-art-toolbar` previously opened its toolkit menu without activating `LFCanvasEngine.setTool('select')`. Consequently, an earlier brush or spray tool remained active; dragging in the workspace could deposit cyan strokes. Selecting a SceneStore object in the Layers list also previously left the drawing tool active.

The advanced object controller also intercepted empty-canvas selection gestures but discarded them rather than drawing a selection rectangle.

The renderer and overlay fixes made on 2026-10-11 are preserved; they address clearing canvas buffers during re-render and duplicate selection guides.

## Files changed on main

- `js/toolbar_engine_bridge.js` – Clicking the top Select toolkit switches the actual painting tool to Select, including on pointerdown before any canvas activity.
- `js/studio-ui.js` – Cancels outstanding brush/object drag state when tools change and marks Select as the current mode.
- `js/canvas-engine.js` – Defaults new instances to Select and clears the old drag state on every tool change.
- `js/advanced-controller.js` – Drags beginning on empty canvas create a raster selection rectangle without a paint operation; clicking an object in Layers switches to Select first.
- `js/canvas-transform-repair.js` – Adds **Hide Contaminated Paint Layer** in the existing Canvas toolkit. It hides (does not delete) the selected existing raster paint layer, then adds a clean visible layer. The previous selective cyan pixel cleanup and background reset controls remain present.
- `css/advanced-objects.css` – Adds a visual highlight for the actual Select mode.
- `studio.html` – Cache-busts updated JavaScript imports.
- `service-worker.js` – Bumps shell version to v13 and uses network-first scripts and styles while preserving offline fallbacks.
- `Games/index.html` – Cache-busts the Savanski iframe URL at `#savanski-art-studio`.

## Removing marks already saved into a project

A software fix cannot safely distinguish accidental cyan paint already saved in a raster layer from intentional user-created cyan artwork. Nothing is automatically erased. To remove those markings without losing the layer: open **Layers**, select the affected **Paint Layer** (not **Canvas Base**), then in **Canvas → Clean Canvas Background** click **Hide Contaminated Paint Layer**. Confirm to hide the old paint and create a clean paint layer. The old layer is preserved and can be made visible again. If only faint cyan specks need removal, use **Remove Faint Cyan Motes** on the selected layer; this does edit pixels, so save a copy first.

A new transparent Canvas Base is clear, and a new gradient Canvas Base contains only the requested gradient. Neither generates cyan effects.

## Verification and limitations

- The modified JavaScript modules passed syntax compilation.
- A direct controller test confirmed a Select gesture beginning at (10,15) and ending at (90,65) creates a (10,15,80,50) rectangular selection with no paint calls.
- The previous mocked renderer test demonstrated that same-size redraw makes no `canvas.width/height` writes; the previous cyan cleanup test preserved opaque cyan and non-cyan pixels.
- This browser environment blocked local HTTP, file and data navigation, so a live rendered GUI smoke test could **not** be completed. GitHub Pages deployment and the user's cached project data cannot be read from that test environment.
- Frontend contract configuration and API client files were not modified. The deployed Google Apps Script backend has not been edited or included.
- Because previously saved pixels may be intentional, the fixes stop generating accidental paint in Select mode but intentionally do not delete saved artwork automatically.
