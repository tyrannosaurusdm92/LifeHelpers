# onyx_widget.zip

Widget only, including Virtual & Health iframe host and deliberately placeholder game.html. No game engines or game HUD.

Both ZIP archives use the identical Onyx-Widget directory root. Extract the widget package first, then overlay Catastrophic.zip into the same directory, allowing its `assets/code/game.html` to replace the placeholder. The only iframe is between onyx_widget.html and game.html; Mosswood is within game.html as a native scene.


## Canonical OurSpace JSON integration (2026-11-06)

The archive includes all 18 JSON files supplied in the OurSpace denominations-only package, at exactly their original paths:

- `json/shared/` — 8 shared files: cats, currency, game rules, life events, manifest, self-care, shop, tasks. This is a *sibling* of `json/onyx widget/`, not a subfolder of it.
- `json/william/` — 5 owner-private files: cats, life events, self-care, shop, tasks.
- `json/jasper/` — the equivalent 5 owner-private files.

The existing consolidated `script/onyx widget/onyx_widget_brain-link.js` now indexes these catalogs, retrieves relevant passages with source paths and injects them into normal Onyx conversation requests (including Virtual Health). `script/onyx widget/onyx-professor.js` also supplies relevant passages to focused sessions and DBT conversations. The chat uses the existing `onyx.chat` backend; no new backend actions, automatic task completion, purchases, coins, or data mutations were introduced. Canonical prices/rewards are left unchanged, with four normalized denominations.

Retrieval prioritizes the matching authenticated profile, also includes shared data, does not load the other user's private catalog, and does not proactively surface sensitive personal life events. For normal chat, context is carried in `localKnowledge.retrievedContext` and `references`; Professor sessions put it in the existing session context. During unverified tester sessions, Professor does not attach owner-private catalog facts. Records are supporting context, not verified real-time state.

**MANDATORY privacy/deployment requirement:** These five-file personal folders contain private health and life-event information. **Do not publish `json/william/` or `json/jasper/` to a publicly reachable static web server, GitHub Pages, or an unrestricted public repository.** The JavaScript owner check avoids accidental cross-profile loading inside the UI but **cannot protect a public JSON URL**. Secure deployment requires moving the two private directories to authenticated, server-controlled owner-scoped storage, serving them through same-origin protected routes (or equivalently replacing the fetches with authenticated backend retrieval), enforcing that the session owns the requested directory **at the server**, and blocking directory listing and direct unauthenticated GET access. Until then, treat this ZIP as a private development package only.

### Smoke tests

From a local HTTP test origin, check that Onyx can retrieve shared data for currency and cats, that William's chat only loads `json/william`, and Jasper's only loads `json/jasper`. Ask about care goals and tasks in both regular Health chat and Professor Onyx. Ask about a sensitive life event only after explicitly opening that subject. Confirm a signed-out/tester view does not fetch owner-private catalogs. Backend availability and real replies still require the existing OurSpace deployment.
