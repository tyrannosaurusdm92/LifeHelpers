# Onyx Work Tab — ChatGPT-style workspace

This package is a frontend-only Work tab for the existing Onyx module. It does **not** add or replace the Apps Script backend.

## Drop-in paths

Copy the contents of this ZIP into `LifeHelpers/OurSpace/` so these paths exist:

- `OurSpace/work-tab.html`
- `OurSpace/css/onyx/onyx-core/work-tab.css`
- `OurSpace/js/onyx/onyx-core/work-tab.js`
- `OurSpace/json/work-tabs.json`
- `OurSpace/json/work-schema.json`
- `OurSpace/json/discord-patterns.json`
- `OurSpace/docs/...`

The JavaScript dynamically imports `../../Onyx/js/ai-brain-config.js` when available. From `OurSpace/js/onyx/onyx-core/work-tab.js`, that resolves to `LifeHelpers/Onyx/js/ai-brain-config.js`. If direct import is unavailable, the client falls back to the same existing Apps Script endpoint supplied for this build.

## Work tab hierarchy

Top-level Work tabs are deliberately fixed and alphabetized:

1. Coding
2. Gaming
3. Household
4. Idea Help
5. Image Creation
6. Writing

Each top-level tab behaves like a Discord server. Each subtab behaves like a channel. Users can create any number of subtabs. The subtab list and each subtab's local transcript are stored in browser localStorage, so no new backend schema or backend file is necessary.

## Existing backend actions used

- `onyx.health`
- `onyx.chat`
- `onyx.ai.file.parse`
- `onyx.ai.image.generate`

The chat request sends a stable Work `threadId`, recent per-subtab local history, the selected Work tab/subtab as context, the user's web-search preference, and whether relevant OurSpace Drive context may be used.

## Session behavior

The backend requires the signed-in OurSpace `sessionToken`. Work checks the common existing browser key `ourspace_session_token` first, plus compatible variants. A Work settings dialog can store a session token locally when the page is being tested outside the normal signed-in shell.

## No backend duplication

There is intentionally no `.gs` file in this package. The existing backend remains the single API/data authority.

## Direct-open preview

`work-tab.html` is intentionally safe to open directly from an extracted folder with a `file://` URL. In that mode, browsers may block JSON `fetch()` calls, so the complete six-tab Work configuration is embedded in `js/onyx/onyx-core/work-tab.js` as a fallback. When served from GitHub/OurSpace over HTTP(S), the same client loads `json/work-tabs.json` normally.

## Project brain/catalog merge
The Work clone now includes a Project Catalog drawer inspired by Universal Project AI Directory v3. It supports categories, project metadata, search/sort, drag/drop project and subtab ordering, dropped-file metadata cataloging, and opening projects as Work subtabs. It does not ship a new backend.


## Work-only Onyx mood window

The left subtab sidebar now contains a compact Onyx portrait window using the supplied Work mood PNGs.

Active conversation states are selected from `listening`, `thinking`, `thoughtful`, `judgmental`, and `purring` based on the user's current input and Onyx's returned output. Backend state hints are accepted only when they map into that Work-safe set.

Idle behavior is deterministic:

- 3 minutes since the most recent user/Onyx chat activity → `snuggly`
- 5 minutes since the most recent user/Onyx chat activity → `sleepy`

The idle clock is paused while a backend response is actively processing. The Work mood set is documented in `json/work-moods.json`.
