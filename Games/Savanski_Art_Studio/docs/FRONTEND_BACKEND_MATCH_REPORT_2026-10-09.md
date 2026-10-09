# Frontend ↔ Routed Backend Compatibility Report

Source: user-supplied `savanski_backend_routed(1).gs`. Backend left untouched and omitted from package.

## Repaired mismatches

1. Frontend version was `2026.09.23-v3.0.1-settings`; backend reports `2026.10.09-v3-routed-sas-pwa`.
2. Replaced obsolete `health` with GET `ping`.
3. Replaced nonexistent `project.save` with POST `saveProject`; `project.list` / `project.get` with GET `listProjects` / `getProject`.
4. Replaced nonexistent `binary.save` with POST `saveBinary`.
5. Removed simulated sign-in/signup, password change/recovery, storage pricing and donation claims; backend has no such routes.
6. Replaced session-token cloud gating with the backend's shared `clientKey` identity; personal mode omits clientKey.
7. Enforced backend's 8 MiB inline transfer limit (was incorrectly 20 MiB in frontend; JSON metadata also incorrectly claimed 25 MiB).
8. Added separate personal Drive connector URL and `?action=connect` flow without inventing a second URL.
9. Added cloud project listing and local-copy restoration; did not invent unsupported cloud deletion.
10. Added public `appInstallInfo`, `aiBrainStatus`, and server-side `aiBrain` handling while keeping AI secret keys off the browser.
11. Added installation selector `#installAppBtn` and updated manifest metadata/cache version.
12. Shared library requests use real `listLibrary` / `getLibraryFile` contracts, with Drive link fallback.
13. Auto-cloud-backup is opt-in, and backend network failures preserve local saves without claiming successful backup.
14. The original local 2D/3D tools, brush assets, 3D and WASM implementations remain in place.

## Verification boundary

Node syntax and mocked transport/contract tests are in `docs/ROUTED_BACKEND_TESTS.md`. Deployment access and Google Drive consent cannot be validated without an accessible live backend; POST CORS behavior may require the deployment environment to permit readable responses. See `docs/BACKEND.md`.
