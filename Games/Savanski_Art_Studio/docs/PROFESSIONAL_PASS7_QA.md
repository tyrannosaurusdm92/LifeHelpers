# Savanski Professional Pass 7 — QA

Date: 2026-09-24

This file records automated structural validation performed on the Pass-7 package.

## Protected architecture
- No new toolbar family.
- No new top-level navigation family.
- Existing toolbar CSS/JS preserved.
- Existing Home / Projects launcher markup preserved.
- Existing Settings frontend preserved.
- Existing tested backend URL preserved.
- Existing PWA manifest and app-icon set preserved.

## New runtime files
- `js/professional-pass7-wasm.js`
- `js/art-professional-pass7.js`
- `js/uniform3d-professional-pass7.js`
- `script/savanski-pass7-kernel.wasm`

## Existing-window placement
Art Studio:
- Layout → Drawing Assistants & Reference Board
- Retouch → Smart Repair & Frequency Separation

3D Editor:
- Sculpt → Sculpt Regions / Face Sets
- Sculpt → Curvature & UV Stencil Masks
- Paint → Surface Detail Map Baking

## PWA
The root service worker cache version is advanced to Pass 7 and pre-caches the new Pass-7 runtime modules/WASM. The application still launches through `studio.html` / Home.

## Validation
See final conversation response for the executed syntax, JSON, dependency, folder-layout, service-worker, toolbar-count, and ZIP integrity checks.


## Executed results

- JavaScript syntax: 130 files + root service worker passed `node --check`.
- JSON/manifest parsing: 22 files passed.
- Duplicate HTML IDs: 0.
- Missing local HTML dependencies: 0.
- Art toolbar: 16 categories, 16 windows, 291 static buttons.
- 3D toolbar: 15 categories, 15 windows, 175 static buttons.
- Service-worker shell resources: 29 listed, 29 present.
- Manifest icons: 7 listed, 7 present.
- WASM binaries: 10; all begin with a valid WebAssembly header.
- Prohibited packaged source/application extensions: 0.
- Nested folders outside `assets`: 0.
- Active Google Apps Script backend URLs in HTML/JS/JSON: exactly the configured Savanski backend.
- Active AI route mentions in HTML/JS/JSON: 0.
- Authoritative toolbar JS/CSS hashes: unchanged.
- Settings JS/CSS: unchanged.
- Project-library JS: unchanged.
- PWA runtime and manifest: unchanged.
- Home launcher markup: byte-for-byte unchanged.
- Art toolbar markup: byte-for-byte unchanged.
- 3D toolbar markup: byte-for-byte unchanged.

## Browser smoke-test limitation

A local HTTP server was started and Chromium headless was invoked twice. The container's Chromium process aborted before loading the page because its crashpad / system-bus environment is unavailable. Therefore this QA does not claim a rendered browser click-through test. Static dependency, syntax, package, and structural checks above did complete successfully.
