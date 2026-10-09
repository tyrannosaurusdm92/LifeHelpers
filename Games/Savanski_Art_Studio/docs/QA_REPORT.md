# Savanski Studio — Integration QA Report

Date: 2026-09-24

## Architecture
- HTML files in package: **1** (`studio.html`).
- Authoritative visible Art toolbar categories/panels: **16 / 16**.
- Authoritative visible 3D toolbar categories/panels: **15 / 15**.
- Static duplicate DOM IDs in `studio.html`: **0**.
- No alternate legacy toolbar/category-panel implementation is active.
- 3D has **no visible static left/right side-panel DOM**; compatibility controls needed by the existing engine remain non-viewport implementation details.

## Desktop geometry contract
- Shared desktop target width: **1915 px**.
- Title/header strip: **58 px**.
- Toolbar: **80 px**.
- Studio editing workspace: **647 px**.
- 3D editing workspace: **647 px**.
- Art and 3D therefore share the same editing-area footprint instead of a 3D three-column side-panel layout.

## Project authority
- Home/Projects remains the creation and continuation authority for both Art and 3D projects.
- Project library supports rename, duplicate, soft delete, restore, permanent delete, and Empty Trash.
- Delete/permanent-delete/Empty Trash use confirmation prompts.
- Art canvas can be resized after project creation; the starting canvas size is not permanent.

## Settings / backend
- Settings entry point exists on Home.
- Shared editor Settings icon is immediately left of the light/dark toggle and is used by both Art and 3D.
- Active frontend endpoint is exactly:
  `https://script.google.com/macros/s/AKfycbyuKFvcQGFjmhnIIcgoZUmPtDPDZYMjsO64Wf0-lDjQCnvUwoHSoHLNppN-cSy7IETs/exec`
- No backend `.gs` source is bundled or generated.
- No active AI request route was found in first-party HTML/JS/JSON.

## Professional Pass 3 validation
- `js/professional-pass3-wasm.js` is explicitly loaded by `studio.html`.
- `js/art-professional-pass3.js` is explicitly loaded by `studio.html`.
- `js/uniform3d-professional-pass3.js` is explicitly loaded by `studio.html`.
- Pass-3 Art controls are injected into existing Image, Retouch, Adjustments, Gradient, Layers, and Layout windows.
- Pass-3 3D controls are injected into existing Geometry, Avatar, Paint, and Scene windows.
- No Pass-3 code creates an additional top-level toolbar or menu system.

## Packaging rules
- Top-level entries are restricted to `studio.html`, `js/`, `css/`, `script/`, `assets/`, `json/`, and `docs/`.
- `assets/` contains only `images/`, `app/`, and `audio/` immediate subfolders.
- There are no nested directories under `js/`, `css/`, `script/`, `json/`, or `docs/`.
- `script/` contains only `.wasm` files.
- No `.wasm` file exists outside `script/`.
- No `.gs`, `.py`, `.c`, `.cc`, `.cpp`, `.cxx`, `.bat`, `.exe`, `.dll`, or `.app` file is bundled.
- The PWA manifest remains at `assets/app/manifest.webmanifest` with bundled mobile/desktop icon sizes and `studio.html` as the start URL.

## Automated static validation
- All first-party JavaScript files pass `node --check`.
- All files under `json/` parse as JSON.
- All local `src` / `href` references in `studio.html` resolve to existing files.
- WebAssembly files have valid `\0asm` headers.
- ZIP integrity is checked after packaging.

## Browser-test limitation
A rendered headless-browser interaction test is not claimed here. The build environment used for this pass has not provided a reliable local Chromium run, so the automated QA above is static/runtime-structure validation rather than a visual browser certification.
