# OurSpace game integration

Entry: `studio.html`  
Game id: `savanski-art-studio`  
Backend: `https://script.google.com/macros/s/AKfycbyuKFvcQGFjmhnIIcgoZUmPtDPDZYMjsO64Wf0-lDjQCnvUwoHSoHLNppN-cSy7IETs/exec`

## Parent → game

```js
iframe.contentWindow.postMessage({
  type: 'ourspace:game-context',
  gameId: 'savanski-art-studio',
  sessionToken,
  profileKey,
  clientId,
  theme: 'dark' // or 'light'
}, '*');
```

The game accepts context only from its actual parent window. Session data is held in memory/session storage and is not hard-coded in the package.

## Game → parent

The game emits:
- `ourspace:game-ready` when the iframe is ready for host context.
- `ourspace:game-saved` after an authenticated OurSpace backup succeeds.
- `ourspace:game-close-request` when the embedded **← Games** control is used.

## Storage

Local IndexedDB remains the resilient fallback. Authenticated OurSpace backups use `upload.media` for the serialized project and `record.save` for small metadata. This matches the existing backend rather than shipping a separate Savanski Apps Script backend.
