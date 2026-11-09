# Onyx Response Generator — Pass 3 repair and verification

Date: 2026-11-08. Package version: 3.0.0.

## What actually failed in Pass 2

1. `assets/code/index.html` relied on browser ES module imports from adjacent JS files plus `fetch()` of JSON and WASM. Browsers may block those when the file is opened with `file://`. The workshop therefore stopped at “Loading corpus…” or “Could not load project assets.”
2. `LearningStore.db()` called IndexedDB `open()` without guarding against a synchronous `SecurityError`, causing all setup to fail in restricted origins, even though the core code and corpus were valid.
3. The default provider was the live backend, and its generate/chat flows required a pasted OurSpace session token and a local Node relay. A first-time user who simply opened the HTML saw buttons that required credentials, not a useful generator.
4. Local preview responses reused broad phrasing and did not respond specifically to important problem cues, such as a widget button not clicking after being moved.
5. Local IndexedDB fallback was transient and did not attempt localStorage; saving in some browser contexts could be silently temporary.
6. The Pass 2 test suite tested module functions in Node, but not the fully assembled browser startup path.

## Changes made without replacing the original project

- `assets/code/index.html` is now an independently self-contained HTML page. It embeds the workshop-only CSS, the full 10,000 voice reference records, all browser JavaScript code and the original compiled WASM overlap scorer. There are no external `<script src>`, stylesheet, module imports, or JSON `fetch()` dependencies in that file.
- Source modules, JSON files and native C/WASM code remain in their established folders for widget integration and future maintenance. `script/build-standalone.mjs` builds the standalone HTML deterministically from those sources. `npm run build` regenerates it after source edits. No Python runtime is shipped.
- The generator now defaults to **Local drafting**, which operates without Gemini, network, login or a Node server. Local chat also works and has same-tab continuity. It remains explicitly labeled **not an LLM**.
- Local drafting chooses domain-specific suggestions for click/drag, CSS/layout, backend/API, general programming, writing, music, games and food, while preserving restrained parent-specific Onyx address. It does not pretend to inspect repositories or solve unconstrained problems as an actual model.
- Added guarded IndexedDB opening for approved responses. When IndexedDB cannot be used, localStorage is attempted for approved responses, explicit nonclinical facts and opt-in turns. If browser settings deny both, memory remains session-only; export remains available.
- Live calls still use only the previously named Apps Script `/exec` endpoint, require authenticated session, and use the already present Node local relay on localhost. No Apps Script/backend file has been changed.
- Strict nine-mood contract is unchanged; Professor remains excluded from this Work/Leisure drafting surface. The dossier and all prior 10,000 references are preserved.

## Verification performed

- `npm test` => **22/22 pass**, covering original 17 tests plus self-contained HTML structure, context-specific local drafts, no-token chat and generation, guarded IndexedDB, and localStorage fallback with simulated denied access.
- `node --check script/onyx widget/standalone-bundle.generated.js` => compiled script parses.
- Chromium controlled-browser test using the complete compiled page as inline content (no HTTP asset requests) => **Corpus ready**, 10,000 records, WASM Active, two local generated responses, and a local conversation reply. No JavaScript runtime errors were reported. Direct `file://` navigation was blocked by the automated test environment's administrator policy, so opening by double click on a user's PC was not itself independently tested.
- The browser exercised the specific widget click-after-move prompt and produced a drag/pointer event diagnosis rather than a generic line.

## What remains unverified/not implemented

- Real Gemini requests through your deployed Apps Script could not be verified because this package does not have a real signed-in OurSpace session or access to the backend implementation/permissions. Mock tests confirm the request envelope only. A server may reject `onyx.chat`, the session token, or the field names if deployed code differs.
- Standalone `file://` mode **cannot make secure Gemini calls** across Google Apps Script's browser CORS/redirect constraints. Use `npm start` and the local URL for the existing scoped relay. Public hosting requires a separately authorized secure same-origin relay; do not publish credentials in JavaScript.
- Local drafting is a deterministic rule-and-retrieval composer, not Gemini, model training, a local LLM, a real-time source lookup, or production model-based reasoning. It produces limited suggestions for useful review.
- No GitHub, OurSpace widget, Apps Script backend or cloud Drive files were edited or deployed.
- This repair does not meet the previously requested 10,000–30,000 KB compressed-code increase. More archive bytes would not fix the previously nonworking startup, and code was not artificially padded.

## Quick start

1. Easiest: open the separate `Onyx_Response_Generator_Pass3_Standalone.html` supplied with the delivery (or extract the ZIP and open `Onyx_Response_Generator/assets/code/index.html`). Select **Local drafting**, type a situation, click **Generate responses**. Local chat also works without credentials.
2. For live model replies, install Node.js 18+, enter `Onyx_Response_Generator`, run `npm start`, open `http://127.0.0.1:8765/`, choose Gemini via OurSpace, and enter a valid existing signed-in session token. The backend must actually support `onyx.chat`.
3. To change source code and refresh the standalone page, run `npm run build` followed by `npm test`.
4. When switching William and Jasper, treat this standalone profile selector as a drafting scope, **not secure authentication**. Do not store confidential data in the nonclinical note library.
