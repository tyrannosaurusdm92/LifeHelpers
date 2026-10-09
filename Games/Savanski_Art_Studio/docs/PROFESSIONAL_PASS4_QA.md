# Professional Pass 4 QA

Date: 2026-09-24

## Runtime / package validation

- All JavaScript files pass `node --check`.
- All bundled JSON files parse successfully.
- `script/` contains WebAssembly binaries only.
- `savanski-pass4-kernel.wasm` compiles and exposes its expected computation helpers.
- No `.gs`, `.py`, `.c`, `.cc`, `.cpp`, `.cxx`, `.h`, `.hpp`, `.bat`, `.cmd`, `.exe`, `.dll`, or `.app` files are shipped.
- Top level remains exactly: `studio.html`, `js`, `css`, `script`, `assets`, `json`, `docs`.
- No nested directories exist inside `js`, `css`, `script`, `json`, or `docs`.
- `assets` contains only the `images`, `app`, and `audio` subdirectories.
- Static HTML contains no duplicate IDs.
- All local `src` / `href` dependencies referenced by `studio.html` exist.
- Authoritative toolbar category structure remains 16 Art Studio categories and 15 3D Editor categories.
- The frontend references only the configured tested Savanski backend URL.
- No active frontend AI request routes were found.

## Pass-4 activation

`studio.html` explicitly loads:

- `js/professional-pass4-wasm.js`
- `js/art-professional-pass4.js`
- `js/uniform3d-professional-pass4.js`

The 3D organic paint module remains loaded before the Pass-4 rig layer so Pass 4 can build on Bubble Rig / weight-paint state rather than duplicating it.

## Browser smoke-test limitation

Automated structural/runtime validation is included above. A full real-browser pointer/stylus interaction test is still required on an unrestricted browser host for final release QA, especially for large-canvas raster perspective warps and complex skinned-mesh weight editing.
