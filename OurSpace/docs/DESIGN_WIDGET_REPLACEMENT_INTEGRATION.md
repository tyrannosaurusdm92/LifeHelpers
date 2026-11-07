# OurSpace Design Widget — replacement integration

- New canonical standalone page: `assets/code/design_widget.html`. The same new widget markup and runtime (one instance only) are embedded in William and Jasper pages so Design Studio can edit live page targets directly. Do not load the standalone page in an iframe on a profile page.
- The existing Jump Nav Design Widget button, after page navigation, controls `#designWidget` via `window.OurSpaceDesignJumpHook`. Its account/page-specific visibility preferences remain unchanged.
- Onyx’s Design Widget buttons in `assets/code/onyx_widget.html` relay same-origin requests through `script/onyx widget/ourspace-onyx-frame-bridge.js` to the parent `script/onyx widget/ourspace-onyx-host-integration.js`, which invokes this same Jump Nav hook. No second Design Widget runs inside Onyx.
- Original account and page design registries are retained, and the expanded Design Studio, PrismShift, the 247-layout library, appearance controls, CSS category sources and new registry are loaded once, using the supplied Pass21 component implementation.
- Design state remains account- and page-scoped. `design-account-sync.js` calls the existing `preference.get` and `preference.set` backend actions when the OurSpace account is authenticated; no backend source is included or changed.
- Earlier `design-sync.js` and `ourspace-background-store.js` are removed as superseded duplicate loaders. Canonical replacement: `design-account-sync.js` and `design-background-store.js`.
- The supplied original artwork `assets/images/design-bubble.png` is used by the widget and was not recolored. The original Onyx widget and `assets/code/game.html` placeholder are untouched.
- The large original MySpace source archive is preserved as `script/design/design-source-library.js` but is intentionally not loaded by default, matching the supplied standalone contract. Legacy `ourspace_design_widget.js` is not added because it conflicts with the canonical `design-widget.js`.
- Local syntax, path and archive-integrity checks are not a substitute for testing authenticated design sync, theme application across all pages and in-device widget behavior.
