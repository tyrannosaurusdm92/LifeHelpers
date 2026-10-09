# Savanski Professional Pass 6 — QA

## Authoritative UI preservation
- `js/toolbar_menu.js`: byte-for-byte unchanged from the supplied Pass-5 base.
- `css/toolbar_menus.css`: byte-for-byte unchanged from the supplied Pass-5 base.
- Home / Projects (`#launcher`) raw HTML subtree: byte-for-byte unchanged from the supplied base.
- Art Studio: 16 top-level toolbar categories and 16 existing tool windows.
- 3D Editor: 15 top-level toolbar categories and 15 existing tool windows.
- No new toolbar/menu/navigation family was introduced.

## Pass-6 runtime integration
- `js/professional-pass6-wasm.js` is loaded by `studio.html`.
- `js/art-professional-pass6.js` is loaded by `studio.html`.
- `js/uniform3d-professional-pass6.js` is loaded by `studio.html` before `uniform3d-app.js`.
- `script/savanski-pass6-kernel.wasm` is listed in the root service-worker shell.
- Pass-6 service-worker cache version is isolated from earlier passes.

## Static validation
- 128 JavaScript files, including the root service worker, pass Node syntax checking.
- 22 JSON / web-manifest files parse successfully.
- No duplicate HTML IDs were detected.
- Every local `script[src]` and stylesheet `link[href]` dependency referenced by `studio.html` exists.
- All service-worker shell resources exist.
- All 9 files in `script/` have a valid WebAssembly magic header; `script/` contains WASM only.
- `savanski-pass6-kernel.wasm` instantiates as a valid WebAssembly module and exposes the expected Savanski computation helpers.

## Packaging policy
Root entries are limited to:
- `studio.html`
- `service-worker.js` (required for root PWA scope)
- `js/`
- `css/`
- `script/`
- `assets/`
- `json/`
- `docs/`

There are no nested directories under `js`, `css`, `script`, `json`, or `docs`. `assets/` remains the only tree allowed to contain its existing `images`, `app`, and `audio` subdirectories.

The release contains no `.c`, `.cc`, `.cpp`, `.cxx`, `.py`, `.gs`, `.bat`, `.cmd`, `.exe`, `.dll`, or `.app` files.

## Backend / account / storage
- Active frontend code references only the supplied Savanski backend:
  `https://script.google.com/macros/s/AKfycbyuKFvcQGFjmhnIIcgoZUmPtDPDZYMjsO64Wf0-lDjQCnvUwoHSoHLNppN-cSy7IETs/exec`
- No backend source file is included or modified.
- No active OpenAI/Gemini/AI-Brain route or endpoint is present in the frontend.
- Settings remains before the light/dark control in the shared editor header and in Home.
- Existing sign-up, sign-in, password-manager-compatible remembering, show-password, recovery capability detection, storage selector, Stripe payment link, and storage-claim UI remain intact.

## Home project lifecycle
Existing Home project management remains intact:
- create/import/open;
- rename;
- duplicate;
- soft delete with confirmation;
- Recently Deleted recovery;
- permanent deletion with confirmation;
- Empty Trash with confirmation.

## PWA / installability
- `service-worker.js` exists at root scope.
- `assets/app/manifest.webmanifest` remains linked by `studio.html`.
- All manifest icons exist, including required 192×192 and 512×512 install icons, using the existing Savanski icon assets.
- Installed launches continue to start at `studio.html`, which opens the Home / Projects flow rather than bypassing it.

## Browser test limitation
Static/runtime-file validation completed. A full graphical interaction test still depends on a browser environment that permits local/server navigation and WebGL; do not interpret the static checks above as a rendered browser click-through certification.
