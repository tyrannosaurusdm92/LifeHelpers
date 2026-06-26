# Validation Notes

Checks performed in the sandbox:
- Zip extracted and repacked without dropping files.
- Runtime catalog JSON parsed successfully.
- Added weekly/monthly task IDs are unique and present in both tasks/care where appropriate.
- User-facing text search did not find reserved backend module references in HTML/catalog/runtime assets.
- Manifest JSON parsed successfully and points to the GitHub Pages OurSpace route.
- Service worker references only files that exist in this replacement folder at build time or the generated lowercase entry.
- Inline scripts from `OurSpace.html`, `ourspace.html`, `william.html`, and `jasper.html` were extracted and passed Node syntax checks.
- Backend Apps Script source is included under `backend/` but reserved actions are intentionally not exposed in the front-end action selector.

Browser rendering is not available in this sandbox environment, so device-mode testing is represented by static responsive CSS checks plus syntax/cache/manifest validation.


## 2026-06-25 mobile/backend auth patch
- Updated all frontend backend URLs to the new Apps Script deployment.
- Changed signup flow so the backend account is created only after William/Jasper profile selection, matching backend requirements.
- Changed signin flow to use the backend as the shared source of truth, with local browser records only as fallback/migration.
- Sessions are per device/browser and are not globally invalidated, so William and Jasper can stay signed in on phones, tablets, and computers at the same time.
- Added JSONP GET fallback support in the included Apps Script backend and frontend callers for mobile browsers that block readable cross-origin Apps Script fetches.
- Bumped PWA cache to force mobile installs to refresh stale service-worker files.
