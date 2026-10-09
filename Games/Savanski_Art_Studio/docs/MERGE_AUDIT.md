# Merge audit

- Broad Savanski Art Studio retained as the primary shell.
- 3D Editor capabilities are integrated directly into the single `studio.html` document as the 3D Editor workspace. No secondary HTML or iframe file is required.
- 3D Editor sculpt, paint, avatar, import/export, capture, swatches and WASM bridge retained.
- Original QA texture/brush/material swatches retained under the package `assets/` folder.
- Existing broad-studio Image / 1D and lightweight 3D Object workspaces retained.
- Standalone Savanski Apps Script backend removed; active backend configuration now points to OurSpace.
- OurSpace iframe/session bridge added to the active `studio.html`.
- Removed chat/generation ribbon controls, assistant panel/client code, remote-generation tool entries, related backend calls, and the obsolete schema.
- Local saving remains functional when the game runs without an OurSpace session.
- Installable-app manifest/service-worker behavior removed so the package is hosted as an OurSpace game rather than its own installable application.


## Single-document workspace pass
- `studio.html` is the only HTML file in the package.
- Top-level workspace tabs: Studio and 3D Editor.
- Desktop title strip target: 1915 × 58 px.
- Desktop toolbar target: 1915 × 80 px.
- Desktop editing workspace target: 1915 × 647 px.
- The stronger model/sculpt/paint/avatar/capture 3D Editor is authoritative; the older lightweight 3D workspace was removed.

## Authoritative + CSS-reorganized consolidation — 2026-09-23
- `Savanski_Authoritative.zip` is the runtime base and source of truth.
- `toolbar_menus.css`, `toolbar_menu.js`, and the corresponding toolbar/menu markup in `studio.html` remain byte-for-byte authoritative.
- No alternate toolbar/menu controller from the CSS-reorganized branch is retained.
- Superseded branch shell/runtime files (`savanski-toolbar-integration.js`, `savanski-mode-tabs.js`, `savanski-shell-bridge.js`, `savanski-project-manager.js`, `savanski-extra-image-tools.js`, `three-workspace.js`, and `three-editor-retro.css`) were not reintroduced.
- Non-runtime reference documentation from the CSS-reorganized branch was merged where it does not create runtime ownership conflicts.
- Home/project-launcher remains under the authoritative shell and was not replaced by the CSS-reorganized branch.
