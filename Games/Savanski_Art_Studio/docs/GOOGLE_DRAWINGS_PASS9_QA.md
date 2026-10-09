# Savanski Art Studio — Google Drawings Pass 9 QA

## Requested fixes

- Visible Art viewport `#leftRail` removed: **PASS**.
- `brushSize` and `toolOpacity` compatibility hooks retained exactly once under hidden `#artEngineCompatControls`: **PASS**.
- `js/art-google-drawings-pass9.js` is loaded exactly once by `studio.html`: **PASS**.
- Added text, imported images, shapes, tables, charts, connectors, freehand brush strokes, paint strokes and effect strokes share the advanced object-selection/movement system: **implemented**.

## UI preservation

- Home / Projects launcher outer HTML remained byte-for-byte unchanged during this pass.
  - SHA-256 before/after: `c1a54e916377e7c4a237be6f3c5261996583d53ccc8834a13914ac5e1adb4c27`.
- Both authoritative toolbar DOM trees remained byte-for-byte unchanged.
  - SHA-256 before/after combined toolbar DOM: `ea16da816a64b8149e4763e2346fc0f44f72d245524e6578594f705a11eb617c`.
- Art: 16 authoritative categories / 16 authoritative windows.
- 3D: 15 authoritative categories / 15 authoritative windows.
- New Google Drawings controls are runtime sections inside those existing windows; no new toolbar/menu family was added.

## Static/runtime validation

- Duplicate HTML IDs: **0**.
- Missing local HTML script/stylesheet dependencies: **0**.
- JavaScript syntax: every top-level `js/*.js` file plus `service-worker.js` passes `node --check`.
- JSON/manifest parsing: **22/22** parsed.
- WASM: **11/11** files in `script/` use the WebAssembly magic header; `script/` contains no non-WASM files.
- Service-worker shell resources: **34/34** exist.
- Service-worker cache version: `savanski-studio-v9-2026-09-24`.
- Apps Script endpoints found in frontend runtime: exactly one, the requested tested Savanski endpoint.
- Active AI route strings checked in frontend runtime: none found.
- Nested directories outside `assets/`: none.
- Forbidden packaged source/executable extensions (`.c`, `.cpp`, `.py`, `.gs`, `.bat`, `.cmd`, `.exe`, `.dll`, `.app`): none.

## Browser-render limitation

A Chromium `--headless` smoke attempt was made against the local `studio.html`, but the container's Chromium process timed out before page load while repeatedly failing to connect to the system D-Bus/UPower environment. Therefore this QA does **not** claim a successful rendered Chromium click-through. Static dependency, syntax, package, DOM and PWA checks above did complete successfully.
