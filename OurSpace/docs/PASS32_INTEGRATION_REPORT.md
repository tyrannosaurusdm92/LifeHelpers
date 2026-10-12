# OurSpace Pass 32 — Happy Home movement integration

This direct-file pass repairs Onyx's connection to the existing personalized OurSpace profiles and preserves the original backend.

## Changes

- William and Jasper's original profile pages each load the existing `js/ourspace-onyx-hooks.js` integration loader once, after their existing scripts.
- Happy Home `env.js` now uses the profile-level Pass 23 movement adapter for exposed directional and activity commands, with fallback to existing room APIs.
- The fish-catch notification image URL now correctly contains `room/` before the fish SVG filename.
- The Happy Home adapter refuses to report successful movement when the native Onyx room actor is unavailable.
- A repeatable, source-level integration smoke test is at `docs/PASS32_INTEGRATION_SMOKE.js`.

## Preservation and QA

Pass 15 `ourspace.html`, `service-worker.js`, `manifest.webmanifest`, and `assets/code/skills.html` were verified byte-for-byte unchanged. Twelve feeding/drinking SVG frames, all 25 original Pass 23 movement support/action modules, existing DBT, profiles, game assets, and the deployed backend were preserved.

`node docs/PASS32_INTEGRATION_SMOKE.js`: 7/7 checks passed against the full local project; original Pass 23 regression suites: 8/8 passed; bridge smoke test passed for walk/run, steering, jumps, and rejection while the native renderer is missing. All local JavaScript syntax checks passed.

**Visual browser validation was not completed.** The Chromium environment rejected localhost navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`. The original mood atlas contains six authored viewing angles and the movement engine approximates north/south using nearest available drawings.

No ZIP files, backend updates, extra top-level HTML files, or unrelated repository edits were included.
