# Settings / Backend QA — 2026-09-23

Static implementation checks completed for the account/storage settings pass.

- Allowed project roots only: `studio.html`, `js`, `css`, `script`, `assets`, `json`, `docs`.
- No nested directories outside `assets`; `assets` uses only `images`, `audio`, and `app`.
- No duplicate static HTML IDs.
- Editor Settings button is statically before the editor theme button.
- Home Settings button is statically before the Home dark-mode control.
- All local CSS/JS references resolve.
- `js/backend-api.js` and `js/settings.js` pass Node syntax checking.
- Updated Apps Script source passes JavaScript syntax checking when checked as `.js`.
- All JSON files parse.
- Frontend backend URL matches the supplied v3 deployment URL.
- Backend source contains account signup/signin, remembered sessions, password change, new password-recovery routes, storage pricing/status, Stripe donation URL, payment claims, project storage, and no AI routes.

A Chromium visual smoke test was attempted, but this execution environment blocks browser navigation to local/file URLs with `ERR_BLOCKED_BY_ADMINISTRATOR`; therefore the final QA is structural/syntax based rather than a rendered-browser screenshot test.
