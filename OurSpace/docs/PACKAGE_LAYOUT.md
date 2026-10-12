# OurSpace profiles — package layout

`ourspace.html` is the **existing root-level portal** (parent of `assets/code/`). It was not supplied and is not replaced.

The two full profile pages are `assets/code/william.html` and `assets/code/jasper.html`, both derived from the original Onyx host page. `onyx.html` has been removed. Their blank content layer is a viewport-sized `about:blank` iframe below the Onyx widget.

Supporting paths remain unchanged: `js/onyx/onyx-core/`, `js/onyx/games/`, `js/dbt/`, `css/`, `json/`, and `assets/`. `assets/code/skills.html` and `assets/code/dbt/` remain. `js/ourspace-core/profile-routing.js` integrates with the existing portal on successful sign-in. `manifest.webmanifest` and the service worker are root-level contributions.

No backend source is included. See `docs/PROFILE_ROUTING.md` for exact integration steps.
