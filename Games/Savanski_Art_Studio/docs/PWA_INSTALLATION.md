# Savanski Studio — PWA Installation

Savanski can be hosted as a static GitHub Pages/browser build and installed by supported browsers as a standalone app.

## Required files

- `studio.html`
- `service-worker.js` at repository root
- `assets/app/manifest.webmanifest`
- Savanski icon PNGs in `assets/app/`
- normal `js/`, `css/`, `script/`, `json/`, and `assets/` runtime files

`service-worker.js` is intentionally a root-level exception to the project-folder list because a service worker's default scope is based on the folder containing the worker. Keeping it beside `studio.html` allows it to cover the whole static application without requiring a special `Service-Worker-Allowed` server header.

## Hosting

For normal PWA installation, serve Savanski over HTTPS (GitHub Pages satisfies this) or on localhost during development. Opening `studio.html` directly with a `file://` URL can still display the static application where browser security allows it, but service-worker installation is not available from `file://`.

## Icons

The manifest uses the existing Savanski PNG icons:

- 32×32
- 64×64
- 128×128
- 180×180
- 192×192
- 256×256
- 512×512

192×192 and 512×512 entries are included for installability, while the smaller sizes support tabs, shortcuts, and platform UI where applicable. The existing 180×180 icon remains the Apple touch icon.

## Launch behavior

The installed app launches `studio.html`, which opens the normal Savanski shell/Home/project library. It does not use a shortcut that bypasses Home to create or continue a project.

## Offline/runtime cache

The service worker pre-caches the small application shell, manifest, icons, and core project/settings files. Other same-origin assets are cached as they are fetched. Navigation is network-first with a cached `studio.html` fallback. Backend requests are cross-origin and are never placed into the Savanski service-worker cache.
