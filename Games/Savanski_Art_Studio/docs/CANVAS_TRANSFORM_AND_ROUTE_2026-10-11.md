# Canvas Rendering, Editable Paint and Routing Repair — 2026-10-11

## Frontend-only GitHub changes
- **js/advanced-renderer.js:** No longer assigns canvas width/height on every render. HTML canvas width/height assignment *clears pixels even when unchanged*. This preserves the underlying raster, gradient or transparent base while SceneStore objects are composited.
- **js/advanced-controller.js:** Removes a duplicate selection-overlay render. Selection handles remain visual-only and are never added to the exported raster.
- **js/canvas-transform-repair.js:** Extends the existing Select/Move tool with corner scaling and a rotation handle for individual painted strokes, airbrush/spray, shapes and imported images. Existing numeric object-transform inspector, copying, scene layer ordering and project serialization remain intact.
- **Layers toolkit:** Adds Lift Selected Paint and Lift Raster Layer for older artwork rendered directly into a paint canvas. Pixels are cut only where they have nonzero alpha, moved into a transformable image object, and source alpha is restored on undo. Both scene object data and the original raster source remain part of the existing project format.
- **Canvas toolkit:** Adds Remove Faint Cyan Motes (only low-opacity blue-green pixels in the selected raster layer; may remove intentionally faint cyan marks, so review before use) and Reset Canvas Base (regenerates transparent/solid/gradient Canvas Base only).
- **studio.html** loads canvas-transform-repair.js. **service-worker.js** increments the offline-cache namespace to v12, including the repaired files.
- **Savanski_Art_Studio/index.html** at the repository root redirects directory traffic to Games/Savanski_Art_Studio/studio.html, preserving query/hash parameters.

## Backend invariants
- Existing deployed Apps Script endpoint: https://script.google.com/macros/s/AKfycbyuKFvcQGFjmhnIIcgoZUmPtDPDZYMjsO64Wf0-lDjQCnvUwoHSoHLNppN-cSy7IETs/exec
- js/backend-config.js and js/backend-api.js were **not edited**.
- No Google Apps Script backend source or replacement server has been added.
- Prior contract report: FRONTEND_BACKEND_MATCH_REPORT_2026-10-09.md (v3 routed API, 8 MiB inline maximum, shared client key / optional personal Drive, opt-in cloud backup).

## Verification
- Updated JavaScript files parse successfully.
- A mock rendering test shows resizing to unchanged dimensions makes **zero** width/height writes and thus does not clear the art canvas.
- A mock pointer test resized a selected stroke object from (1,1) to (2,2.5) scale through a corner grip and committed a scene update.
- A mock faint-cyan cleanup test removed a low-opacity cyan pixel while preserving an opaque cyan pixel and unrelated colored artwork.
- Confirmed studio.html loads the module; both the existing Layers and Canvas toolkits contain the target panels.
- Both the custom domain and Apps Script endpoint failed externally routed network checks, so live hosting, cross-origin POST saves, Drive OAuth authorization, and complete browser interactions have **not** been validated.
- The root alias works only if the site's host publishes this repository root at thetransgendertrex.com. If the domain is served from another repository, web host, or a different publishing source, configure its DNS/deployment and path route there; committing an alias here alone cannot guarantee the public URL.

## Limitations
- Pixel-based raster artwork that was already flattened cannot be reconstructed into individual historic brush strokes automatically. It can be separated with rectangular selection into individually transformable objects using Lift Selected Paint.
- The artifact cleanup deliberately does not silently erase saved user artwork or all cyan pixels. Low-opacity cyan painting may be legitimate. Use the explicit cleanup control only on the layer that contains unwanted specks.
- This update does not add a new backend, account system, menu category, or package archive.
