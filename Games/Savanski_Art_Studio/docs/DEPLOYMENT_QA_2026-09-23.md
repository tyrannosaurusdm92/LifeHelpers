# Savanski merged deployment QA — 2026-09-23

## Merge rule

`Savanski_Authoritative.zip` is the runtime source of truth. The CSS-reorganized package was merged only where doing so does not introduce a second toolbar/menu/shell implementation.

## Authoritative toolbar/menu verification

- [x] `studio.html` is byte-for-byte identical to the authoritative source.
- [x] `toolbar_menus.css` is byte-for-byte identical to the authoritative source.
- [x] `toolbar_menu.js` is byte-for-byte identical to the authoritative source.
- [x] Art Studio toolbar: 16 category buttons, 16 pop-out panels, 291 buttons total under the Art toolbar root.
- [x] 3D Editor toolbar: 15 category buttons, 15 pop-out panels, 175 buttons total under the 3D toolbar root.
- [x] Legacy Art viewport rail controls are no longer visibly mounted; their functions are exposed through the authoritative Art tool windows while engine hooks remain compatible.
- [x] 3D Editor has no visible left/right static-button panels; those engine controls are represented through the authoritative 3D tool windows/hidden compatibility hooks so the viewport remains full-width.
- [x] Home/project launcher remains separate from editor toolbar/menu ownership.

## Competing implementation exclusion

The following reorganized-branch runtime files are intentionally absent:

- `js/savanski-toolbar-integration.js`
- `js/savanski-mode-tabs.js`
- `js/savanski-shell-bridge.js`
- `js/savanski-project-manager.js`
- `js/savanski-extra-image-tools.js`
- `js/three-workspace.js`
- `css/three-editor-retro.css`

Static scan also confirms there are no runtime references to those excluded paths.

## Package integrity

- [x] Exactly one HTML entrypoint: `studio.html`.
- [x] No duplicate HTML IDs.
- [x] No missing local `<script>`, `<link>`, or `<img>` references from `studio.html`.
- [x] All JavaScript files pass `node --check` syntax validation.
- [x] All JSON files parse successfully.
- [x] No alternate toolbar/menu implementation files remain in the runtime tree.
- [x] ZIP integrity test passes after packaging.

## Documentation merged from CSS-reorganized source

Non-runtime reference material was retained where useful. The CSS/tool ownership map was rewritten to describe the authoritative architecture rather than the superseded reorganized toolbar implementation.

## Professional Pass 2 addendum
- The two professional Pass-2 modules are now referenced by `studio.html`; they are not dormant source files.
- Three.js Draco/Basis `.wasm` binaries were moved from `js/` into `script/` and loader paths were updated.
- Static package scan confirms a single Savanski backend endpoint and no AI request routes.
- GitHub-static structure remains compatible with relative URLs; install metadata uses `assets/app/manifest.webmanifest` and bundled app icons.
