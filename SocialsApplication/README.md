# Socials Application

**Socials Application** is a compact open-source social media alternative for a small private network of friends and loved ones. It merges the useful, safe ideas from the provided merged Discord, Snapchat-style, and Zoom-style packages into one Windows-friendly project with shallow paths and no duplicate dependency/vendor trees.

## What it does

- **Feed:** posts, media attachments, comments, and emoji reactions.
- **Channels:** Discord-like named channels with message history, media, reactions, and JSON import/export.
- **Messenger Plug-in:** native bottom-docked retro IM with Facebook-style footer tabs, MySpaceIM-style friend presence, GIFs, stickers, files, image/camera sharing, voice notes, and up-to-10-person call signaling.
- **Camera & Stories:** Snap-style local camera, filters, draggable overlays, text stickers, local gallery, and expiring stories.
- **Rooms:** Zoom-style private rooms with WebRTC video/audio, screen sharing, room chat, reactions, hand raise, local recording export, notes, transcript import, browser captions where supported, and meeting exports.
- **Shared backend storage:** the deployed Google Apps Script backend is embedded by default, with local `data/socials-data.json` kept as an offline/testing fallback.
- **Color-law facelift:** random project theming enforces Lightest ↔ Darkest readable combinations while reserving Light/Medium/Dark colors for accents only.


## Shared Google Apps Script backend

This package now includes a copy/paste backend at `google_apps_script/social_application_backend.gs`. The deployed `/exec` URL is already embedded in `app/social-backend-config.js`. The same deployment can be reused by every project because the frontend sends a per-project ID. Use **Backend connected** only to replace the URL or type `LOCAL` to test offline in one browser.

The shared backend covers login/register, Google Password Manager-friendly forms, presence with a 10-active-person cap, feed/channels/stories/events, game-session logging, Messenger Plug-in history, file/media storage, and WebRTC signaling mailboxes for calls/video chat. Browser APIs still handle the actual camera, filters, microphone, screen sharing, recording, and live media.

See `docs/GOOGLE_APPS_SCRIPT_SHARED_BACKEND.md` and `docs/SHARED_BACKEND_FULL_EMBED.md` for deployment and project-reuse notes.

## Windows quick start

1. Install Node.js 18 or newer.
2. Unzip this folder.
3. Double-click `start-windows.bat`.
4. Open the local URL printed in the terminal, usually `http://127.0.0.1:8080`.

## Terminal start

```bash
npm start
```

Optional LAN test:

```bash
set HOST=0.0.0.0
npm start
```

Camera and microphone access work reliably on `localhost`. Browser security rules may require HTTPS for camera/mic access from other devices over a LAN.

## Project layout

```text
Socials Application/
  app/                 browser UI, styles, manifest, overlay assets, messenger plug-in files
  docs/                audits, manifests, licensing notes
  server.js            Node.js static server, API, SSE, room signalling, and messenger envelope backend
  package.json         no external runtime dependencies
  start-windows.bat    Windows launcher
```

## Safety and privacy notes

This is a self-hosted local/LAN app, not a hardened public social network. Use it with trusted people on a trusted network. Do not expose it directly to the public internet without adding authentication, HTTPS, rate limits, backups, and a proper database.

The runnable app intentionally excludes token scraping, account cracking, leaked-client code, unofficial account automation, and third-party service impersonation.


## Integrated Mobile Games

The app now includes a **Games** tab with the uploaded offline mobile keep-set copied into `app/games/`. Multiplayer-capable games use the live site/messenger presence roster: people with an active saved profile/browser session are listed as available players and the selected roster is passed into the game iframe through URL parameters, postMessage, localStorage/sessionStorage, and a `socials-players` custom event for compatibility with the existing game bridge.

Run with `npm start`, open the app, save a display name, then use the Games tab. For LAN testing with multiple people/devices, set `HOST=0.0.0.0` before starting.
