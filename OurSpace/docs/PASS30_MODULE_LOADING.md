# OurSpace Pass 30: movement support module loading

The existing `ourspace.html`, profiles, assets, service worker and backend remain unchanged.

The existing `js/ourspace-onyx-hooks.js` loader now loads all six preserved Pass 23 support modules **before** the Pass 25 runtime and the 18 action modules. This avoids leaving those restored source files unreachable from the live application. The Pass 25 runtime remains the active movement API; the original Pass 23 modules are retained as separate APIs for further full-runtime integration. This is not a claim of complete Pass 15 restoration or visual QA.

No ZIP archives are committed. Existing GitHub asset paths are not deleted. The original 12 feeding SVGs and missing Pass 15 JavaScript are still outstanding.
