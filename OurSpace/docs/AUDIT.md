# OurSpace Full Replacement Audit

Generated: 2026-06-25 21:30 America/New_York

## Included entry files
- `ourspace.html` — lowercase GitHub Pages entry for `/LifeHelpers/OurSpace/ourspace.html`.
- `OurSpace.html` — matching uppercase copy for older links.
- `william.html` and `jasper.html` — private user pages.
- `manifest.webmanifest`, `service-worker.js`, `browserconfig.xml`, app icons, audio, and runtime catalogs.
- `backend/OurSpace_Unified_Merged_Backend.gs` — backend source copy for reference/deployment.

## Fixed
- Added visible install buttons to login, William, Jasper, and Sync.
- Rebuilt the manifest around `/LifeHelpers/OurSpace/ourspace.html` and `/LifeHelpers/OurSpace/` scope.
- Rebuilt the service worker so install does not fail by caching missing JSON paths.
- Added a Sync page that exposes backend actions except reserved actions.
- Preserved reserved backend code in the uploaded Apps Script file but did not surface it in front-end controls.
- Added weekly/monthly disability-kindness chores and care tasks with tiny steps for William, Jasper, and shared chores.
- GiftLink remains near the top of Store and has a Sync-page connector for backend login/share/list/address/request actions.
- Store aisle dropdowns remain in place with Show all.

## Backend URL
`https://script.google.com/macros/s/AKfycbwL1e8Gv-o0wC8kAhseMwoNhs97OBvCfCB5FV4zwNnCRa9jYWbYwm2B-wYwUOjlnjg_vA/exec`
