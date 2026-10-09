# Routed frontend tests (2026-10-09)

The contract was checked against the user's attached `savanski_backend_routed(1).gs` (version `2026.10.09-v3-routed-sas-pwa`) without editing, embedding or redeploying it.

Automated Node.js mocked-transport checks passed for:
- Exact backend version and 8 MiB inline file maximum.
- Existing persistent 48-character shared storage identity and opt-in backup.
- GET `ping`, `storageStatus`, `listProjects`, `getProject`, `listLibrary`, `appInstallInfo`, `aiBrainStatus`.
- POST `saveProject` shared-key payload and AI-Brain request secret filtering.
- Personal connector `/exec` and omission of the shared client key in personal mode.
- Rejection of oversized uploads and unsupported legacy actions.
- JSONP fallback on failed browser GET fetch.

Static checks passed for:
- JavaScript parse/syntax of edited frontend scripts.
- 149 HTML script/stylesheet/icon links pointing to existing files.
- All service worker core precache paths resolving.
- Frontend JSON files and web manifest parsing.
- Absence of `.gs` backend source files from the frontend package.

**Unverified:** The testing environment cannot resolve `script.google.com` to execute live GET/POST operations or Drive OAuth authorization. A headless Chromium end-to-end run also timed out, so full interactive rendering and live cloud save are **not** claimed verified. The settings panel is integrated by DOM creation on page load, and network failures never produce misleading “cloud saved” feedback.

**Browser POST limitation:** The Apps Script source returns ContentService JSON with no explicit cross-origin POST response accommodation. Depending on browser and deployment policy, readable cross-origin POST responses can be blocked. This cannot be corrected solely in the frontend without an accessible same-origin proxy or server response change. The original backend remains immutable as requested.
