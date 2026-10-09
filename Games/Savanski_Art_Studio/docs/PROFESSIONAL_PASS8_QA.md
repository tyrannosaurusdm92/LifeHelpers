# Savanski Professional Pass 8 — QA

Date: 2026-09-24

## Required invariants

- No new toolbar family.
- No new menu family.
- Home / Projects remains the project entry point.
- Existing Settings placement remains unchanged.
- Existing tested backend endpoint remains the only Savanski Apps Script endpoint.
- Root `service-worker.js` remains present.
- Existing `assets/app` install icons remain present.
- `script/` contains WebAssembly binaries only.
- No `.gs`, `.c`, `.cpp`, `.py`, `.bat`, `.cmd`, `.exe`, `.dll`, or `.app` files are packaged.

## Pass 8 runtime additions

- `js/professional-pass8-wasm.js`
- `js/art-professional-pass8.js`
- `js/uniform3d-professional-pass8.js`
- `script/savanski-pass8-kernel.wasm`

## UI insertion targets

Art:
- Shapes -> Vector Pen / Bézier Paths
- Transform -> Content-Aware Layer Scale

3D:
- Geometry -> Surface Retopology / Poly Build
- Sculpt -> Pose Sculpt Region

All controls are injected into existing window bodies at runtime.

## PWA

The root service-worker cache version advances to `savanski-studio-v8-2026-09-24` and pre-caches the Pass 8 runtime additions.


## Automated validation result

- JavaScript files checked (including service worker): 134
- JavaScript syntax errors: 0
- JSON / manifest files parsed: 22
- JSON errors: 0
- WebAssembly binaries: 11
- Invalid non-WASM entries in `script/`: 0
- Duplicate HTML IDs: 0
- Art authoritative toolbar: 16 categories / 16 windows / 291 static buttons
- 3D authoritative toolbar: 15 categories / 15 windows / 175 static buttons
- Missing local HTML dependencies: 0
- Service-worker shell resources: 32 / missing 0
- Original pre-script HTML markup preserved byte-for-byte: True
- `js/toolbar_menu.js` preserved byte-for-byte: True
- `css/toolbar_menus.css` preserved byte-for-byte: True
- Nested folders outside `assets`: 0
- Forbidden packaged source/executable files: 0
- Active AI runtime hits: 0
- Pass-8 WASM required exports: `clamp01,edge_energy,falloff,luma,smoothstep01`
- Active Apps Script endpoints: `https://script.google.com/macros/s/AKfycbyuKFvcQGFjmhnIIcgoZUmPtDPDZYMjsO64Wf0-lDjQCnvUwoHSoHLNppN-cSy7IETs/exec`
