# Brain link — Testing pass 3

## Bridge contents and checks

- The single browser bundle is `js/onyx/onyx-core/brain-link.js` (121,386 bytes, about 118.5 KiB), well below the 15,000 KB pre-compression limit. It contains the nine Onyx backend, memory, data, safety, WASM, health, DBT, retrieval, and conversation runtime sections, followed by the explicit brain-link facade.
- `onyx.html` loads `brain-link.js` once, after `onyx-config.js` and before `onyx-core.js`. The conversation engine calls `OnyxBrainLink.chat`; the facade forwards to the authenticated backend and forces `useBrain: true` and `ai: true`.
- The bridge endpoint, `OnyxConfig.backendEndpoint`, and the current `AI_BRAIN_CONFIG.backendUrl` in `LifeHelpers/Onyx/js/ai-brain-config.js` match. The configured action is `onyx.chat`; the linked brain repository path is `LifeHelpers/Onyx`.
- `OnyxBrainLink.snapshot()` now reports endpoint/config agreement, route support, route readiness, and whether authentication is available or still pending. The mocked bridge test confirmed one `onyx.chat` request with `useBrain: true` and `ai: true`.
- The large corpus is not copied into the frontend bundle. The Onyx brain is exposed through the authenticated backend contract; profile-private retrieval stays server-side.

## Package checks

- 55/55 JavaScript files pass `node --check`; 26/26 JSON, GeoJSON, and webmanifest files parse.
- All 83 local HTML references resolve; all 35 packaged asset files match the current GitHub `OurSpace/assets` blobs, and none of the 22 package JSON paths collide with current `OurSpace/json` paths.
- The WASM file has the expected `00 61 73 6d` header. The pass-3 ZIP has one `Onyx_export/` root and passes CRC validation.

## Integration boundary

The current `OurSpace` GitHub directory contains `assets/` and `json/`, but no application shell. The Apps Script backend source is outside the linked repository and is not included in this package. I verified the frontend route/configuration contract and the local bridge with a mocked backend; I could not verify that the live Apps Script service currently loads every module from `LifeHelpers/Onyx`, or run a signed-in end-to-end chat. `routeReady` indicates frontend configuration and action agreement, not a completed live backend request.

## Current Onyx source contract

Checked on `main`: `Onyx/js/ai-brain-config.js` (blob `c05530b50ec6204970ca5b48bb540b884bbdc3e3`), `ai-brain-loader.js` (`a48165cf94be27b7487e6324cc238bb05f946cd2`), `ai-brain-retrieval.js` (`e7fbd8efb8f22c9adde92ca560270d1a3d8243b2`), and `ai-brain-router.js` (`15a4fee6b642868fddb71098e84aea78bac94298`). The contract specifies the same backend URL, OurSpace application, Onyx module, `onyx.chat` route, and authenticated public surface.
