# Savanski Professional Pass 5 — QA Checklist

This file records the automated checks run for the Pass 5 package.

## Invariants to verify

- Existing authoritative toolbar/menu files remain byte-identical to the input package.
- Home/project launcher markup remains byte-identical to the input package.
- Art Studio remains 16 top-level toolbar categories / 16 existing panels.
- 3D Editor remains 15 top-level toolbar categories / 15 existing panels.
- No new top-level toolbar/menu family is introduced.
- Pass 5 controls are injected only into existing Art Adjustments/Retouch and 3D Paint/Avatar panels.
- Exact tested backend URL remains configured; no `.gs` backend is shipped.
- Forgotten-password controls remain capability-gated because v3.0.1 does not advertise forgot/reset routes.
- `service-worker.js` is root-scoped and `studio.html` registers it through `js/pwa-runtime.js`.
- Manifest references existing icon files and includes 192×192 and 512×512 icons.
- `script/` contains WASM only.
- `assets/` contains only the expected `images/`, `app/`, and `audio/` subfolders.
- No C/C++/Python source, Windows batch file, executable, DLL, `.app`, or backend `.gs` is shipped.
- JavaScript syntax passes.
- JSON/manifest parsing passes.
- No duplicate HTML IDs.
- Local HTML script/style/icon/manifest references resolve.
- ZIP integrity passes.

## Automated result — 2026-09-24

- JavaScript syntax: PASS (all `js/*.js` plus root `service-worker.js`).
- JSON/manifest parse: PASS (22 files including the web manifest).
- WebAssembly headers: PASS (8 `.wasm` files; `script/` contains no non-WASM files).
- Duplicate HTML IDs: PASS (0 duplicates).
- Local HTML dependencies: PASS (0 missing script/style/icon/manifest references).
- Art toolbar structure: PASS (16 top-level tools, 16 panels).
- 3D toolbar structure: PASS (15 top-level tools, 15 panels).
- `js/toolbar_menu.js`: PASS, byte-identical SHA-256 to input package: `0f533207f8b894e018e6fa60c1150e2303edddb7aca9d66d0770d7fe4bc8af23`.
- `css/toolbar_menus.css`: PASS, byte-identical SHA-256 to input package: `63443eb654ad795b9f497668347f3a5704c233555ccd7390d3881743ba4c9e81`.
- Home launcher subtree: PASS, byte-identical SHA-256 to input package: `c1a54e916377e7c4a237be6f3c5261996583d53ccc8834a13914ac5e1adb4c27`.
- Header Settings ordering: PASS (`Settings` → light/dark → Home).
- Home Settings control: PASS.
- Backend endpoint uniqueness: PASS; only the required Savanski v3 endpoint is present among Apps Script web-app URLs.
- Backend source packaged: PASS (none).
- Backend recovery capability: confirmed that v3.0.1 advertises `auth.password.change` but not `auth.password.forgot` / `auth.password.reset`; frontend recovery controls therefore remain capability-gated.
- PWA manifest: PASS; existing 192×192 and 512×512 install icons present.
- PWA service worker shell references: PASS (20/20 present).
- Prohibited source/native file extensions: PASS (no `.gs`, C/C++/Python source, `.bat`, `.cmd`, `.exe`, `.dll`, or `.app`).
- Nested folders outside `assets/`: PASS (none).
- Final ZIP CRC/integrity: PASS (`zipfile.testzip()` returned no damaged member in the packaged archive).
