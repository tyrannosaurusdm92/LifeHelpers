# Savanski Studio — Routed Backend Contract (2026-10-09)

## Immutable backend

The user-supplied backend `savanski_backend_routed(1).gs` was inspected solely to determine its public API. The `.gs` source is **not part of this frontend archive**, was not changed, and was not redeployed.

**Routed deployment:** `https://script.google.com/macros/s/AKfycbyuKFvcQGFjmhnIIcgoZUmPtDPDZYMjsO64Wf0-lDjQCnvUwoHSoHLNppN-cSy7IETs/exec`  
**Contract version:** `2026.10.09-v3-routed-sas-pwa`  
**Public install route:** `https://thetransgendertrex.com/Savanski_Art_Studio`

The browser-facing implementation is `js/backend-config.js`, `js/backend-api.js`, `js/settings.js`, and `css/settings.css`. It keeps the existing studio menu and settings window, local IndexedDB projects, 3D tools, offline assets, and WebAssembly files.

## Supported actions

| Transport | action | Request parameters | Result |
|---|---|---|---|
| GET | `ping` | none | `{ok,app,version,service}` |
| GET | `storageStatus` | `mode=shared` with `clientKey`, or `mode=personal` through personal connector | `{ok,mode,folderName}` |
| GET | `listProjects` | `clientKey` for shared; omit for personal | `{ok,items:[{id,name,modified,size}]}` |
| GET | `getProject` | `id`; `clientKey` for shared | `{ok,id,name,project}` |
| GET | `listLibrary` | `q`,`type` | `{ok,items:[{id,name,mimeType,kind,size,modified,path}]}` |
| GET | `getLibraryFile` | `id` | `{ok,id,name,mimeType,size,dataUrl}` (8 MiB limit) |
| GET | `appInstallInfo` | none | public installation manifest metadata |
| GET | `aiBrainStatus` | none | non-secret server-side AI-Brain configuration status |
| POST | `saveProject` | `project`, `title`, `storageMode`, `clientKey` for shared | `{ok,id,name,mode,updated}` |
| POST | `saveBinary` | `base64`,`filename`,`mimeType`,`category`,`storageMode`,`clientKey` for shared | `{ok,id,name,mode}` |
| POST | `aiBrain` / `aiBrain.request` | `{request:{...}}` | `{ok,http,response}` |
| GET HTML | `action=connect` | optional `folderId`; **on separately deployed user-executed connector** | Google Drive authorization page |
| GET | `route=install-info` | none | same public install metadata as `appInstallInfo` |

The service also has public HTML routes `route=app`, `route=offline`, `route=manifest`, and `route=icon`; they are service-shell routes, not art-editor actions.

**Not supported by this backend:** account signup/signin/password recovery, billing, quota purchasing, session-token authentication, deleteProject, and backend install-event recording. The frontend does not send these old actions.

## Shared and personal Drive identity

Shared storage groups files by a persistent 24–100-character `clientKey`. The frontend uses the existing `savanski.clientKey` localStorage key and generates a cryptographically random 48-character hexadecimal key only if none exists. This key is effectively a bearer storage credential: do not post or share it publicly. The Settings window can copy and restore it across devices. This service is not a username/password account system.

Personal Drive requires a *separate* Google Apps Script deployment configured as **Execute as User accessing the web app**. Store its public `/exec` URL in Settings → Google Drive. Choose Personal and click Connect My Drive to open `?action=connect` in a browser tab. Refresh status on returning. The service URL supplied here is the shared deployment; a distinct personal deployment URL is not supplied in this package.

Auto-backup is disabled by default. Turning it on causes local saves to request Drive backup in the selected storage mode. Manual **Back Up Open Project** is also available in Settings. The app preserves local projects when Drive is unavailable.

## Browser CORS limitation

The Apps Script endpoint returns `ContentService` JSON. Cross-origin GET requests use `fetch` with a JSONP fallback using the backend's explicit `callback` support. Browser POST requests use the backend's raw JSON `text/plain` contract. The backend does **not** implement a JSONP fallback for POST, and the browser must be allowed to read the response to confirm saving. Some Apps Script access/deployment environments block cross-origin POST responses; this frontend cannot override those policies without a server-side change. A blocked or unreadable response is reported as *not confirmed*, never falsely as saved. The backend itself was not changed to solve this limitation.

Because the live deployment could not be accessed from this environment, end-to-end network calls and Google authorization require browser verification at the actual public domain.

## Install behavior

The frontend declares `manifest.webmanifest`, an in-scope `service-worker.js`, app icons in `assets/app/`, `#installAppBtn`, and `[data-savanski-install]` controls. Install prompts are browser-controlled; if none exists, Settings gives Add to Home Screen instructions. App icons install the studio hosted at the public route, **not** the backend Apps Script service-shell page.
