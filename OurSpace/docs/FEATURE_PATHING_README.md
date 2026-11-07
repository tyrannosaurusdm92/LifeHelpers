# OurSpace — feature-folder path cleanup

This package is an in-place reorganization of the **uploaded**
`OurSpace_Messenger_Heart_Thumb_Scrollbar_Canonical_CSS_Fixed (2).zip`.

- All **741 original files** from that upload are preserved (no deleted files reconstructed).
- All CSS files are now in named `style/<feature>/` directories. There is no `style/css/` directory and no CSS directly under `style/`.
- All JavaScript files are in named `script/<feature>/` directories. The existing binary `script/wasm/` folder is preserved; there is no `script/js/` directory.
- All JSON assets under `json/` are in named `json/<feature>/` directories. The root `ourspace-pwa-config.json` remains at the project root because it is the PWA's public configuration file, not a JSON catalog in `json/`.
- Original `assets/`, including user-created categories inside `assets/images/`, retains its structure and all its files.
- The existing service worker, web manifest, and OurSpace backend URL remain in place; only path-specific changes were made.

## Repaired references

`ourspace.html`, the signed-in account pages, the Onyx widget, the Skills page, and all 103 DBT worksheet pages were updated to point to the correct feature folders. CSS `url(...)` links, module imports, dynamically loaded game scripts, WASM paths, game images, PWA precache targets, asset catalogs, and icon references were migrated when the targets existed in the upload.

References to **absent scripts** were deleted from the active HTML and inline loading lists. Missing quill and Picnic Panic logo images were changed into small text/emoji fallbacks; the missing image files were **not** recreated. Existing icons were reused for favicon paths.

One optional Onyx source import still points outside this package:
`../../Onyx/script/js/onyx/onyx-core/index.js`.
Its JavaScript caller already catches the import failure and falls back to the connected backend, so this external repo was not added.

Some historical JSON catalogs and audit documents mention files previously removed or sources outside this ZIP (for example, real-life image references and old Onyx audio). Their historical entries were not silently rewritten to pretend those files exist. See `PATH_REPAIR_QA.json` and `PATH_REORGANIZATION_MAP.json`.

## Validation

- JavaScript syntax validation: all 223 JS files pass.
- JSON syntax validation: all JSON files and the PWA manifest pass.
- CSS asset `url(...)` resolution: all pass.
- HTML static local asset references: 0 unresolved.
- Onyx Adventures game logic validation: 27 of 27 checks pass, including native WASM loading and saved-wallet state logic.

This verification is static/local. Full live testing of authenticated backend calls, browser-specific push notifications, account pages, and visual layout in a deployed browser is still required.
