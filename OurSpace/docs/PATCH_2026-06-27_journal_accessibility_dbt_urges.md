# Patch 2026-06-27 — Integrated Journal Accessibility + DBT Urges Layout

## Summary

- Replaced the older pre-add-on journaling module assets with the integrated accessibility journaling module.
- Added the accessibility scanner mount point to both `william.html` and `jasper.html` under the Home → Journal page.
- Added `journal-accessibility-addon.css` and `journal-accessibility-addon.js` to the active site assets.
- Kept the backend URL set to:
  `https://script.google.com/macros/s/AKfycbwL1e8Gv-o0wC8kAhseMwoNhs97OBvCfCB5FV4zwNnCRa9jYWbYwm2B-wYwUOjlnjg_vA/exec`
- Repositioned the diary-card urges/rating section so it sits beside the `DBT Skills Side Menu` and above the reflection fill-in and `*USED SKILLS scale` sections.

## Active files changed

- `william.html`
- `jasper.html`
- `assets/css/journal-module.css`
- `assets/css/journal-accessibility-addon.css`
- `assets/js/docx-lite-reader.js`
- `assets/js/journal-module.js`
- `assets/js/journal-accessibility-addon.js`

## Notes

The scanner uses browser speech synthesis for text-to-speech and browser/camera APIs for camera scanning. Camera scanning requires HTTPS or localhost in most browsers. Picture-to-text upload remains available on desktop, tablet, and mobile.
- `service-worker.js` cache name and active asset list were updated so browsers do not keep serving the pre-add-on journal assets.
