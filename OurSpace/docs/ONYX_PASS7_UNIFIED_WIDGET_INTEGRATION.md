# Onyx Pass 7 → OurSpace widget integration

> **Current corpus update (8 Nov 2026):** The 10,000-example-only instructions below are historical. The current unified widget now has all **100,000 original account/lane response examples** available through eight compressed shards, including Virtual & Health and Professor. See [`ONYX_100000_VOICE_CORPUS_INTEGRATION.md`](./ONYX_100000_VOICE_CORPUS_INTEGRATION.md) for counts, verification, privacy precautions, and Work tester audit. The existing standalone Pass 7 workshop still has its original 10,000-example source for authoring.

## Scope

The existing `OurSpace/assets/code/onyx_widget.html` remains the only entrypoint for the widget. The source generator is **not** embedded as a second HTML page, iframe, duplicated application, or alternate login. Its useful conversational tester and response workshop controls are incorporated into the existing **fullscreen Work → Voice library** dialog.

All presentation uses the existing `OurSpace/style/onyx widget/` widget styles. The generator's `generator.css` is **not** imported.

The repository's `Onyx/` directory remains **brain and knowledge only**. No widget, game, fullscreen UI, medical-interface code, or duplicate renderer was placed there.

## Integration map

- `assets/code/onyx_widget.html`: fullscreen Work Voice library, including 4-lane selection and a multi-turn chat tester. Existing Virtual & Health, Leisure, Work and Professor layout survives.
- `script/onyx widget/onyx-widget-conversation-guidance.js`: shared contextual/voice guidance, social-vs-work intent, family forms of address, urgency/safety and nonclinical/Professor boundaries. **Guidance only; not a second model.**
- `script/onyx widget/onyx_widget_onyx-repository-bridge.js`: sends that context to the **existing** `Onyx/script/js/onyx/onyx-core/index.js`, whose `OnyxRuntime` forwards it to the authenticated `onyx.chat` backend and checks LLM completion and profile identity.
- `script/onyx widget/onyx-tester.js`: forwards the same guidance to the existing read-only tester route, respecting its server-owned account selection, 6-digit email verification, 3-hour session and access permissions.
- `script/onyx widget/onyx-responses.js`: generates source-attributed candidate replies for the 4 lanes; keeps a bounded, in-page conversation history per parent/lane/thread; retains approval and `onyx-responses.js` export; does not save tester credentials in exports.
- `script/onyx widget/onyx-professor.js`: selects the explicit Professor/DBT conversation lane for tester replies.
- `script/onyx widget/onyx-widget-conversation-guidance.test.mjs`: reproducible Node smoke checks.

## Account and surface coverage

The two accounts use server-authenticated profile selection; the client never promotes a user-selected `william`/`jasper` label to account authority.

- Virtual & Health and Leisure compact chats → existing `OnyxConversationEngine.reply` → `OnyxBrainLink.chat` → repository bridge → canonical Onyx brain → existing authenticated Apps Script backend.
- Work fullscreen chat → existing `OnyxBrainLink.chat` → same repository brain.
- Professor fullscreen → existing `OnyxBrainLink.chat` with DBT support mode → same repository brain.
- Work fullscreen Voice library → `OnyxResponses.generate` or `OnyxResponses.converse`. The user can choose any of the four context lanes to test. The tester has a separate **server-restricted read-only** path and does not bypass account authentication.

## Conversational contract

Onyx follows his core dossier, nine moods and authorized identity, is semi-formal and lightly old-world, treats greetings as greetings, and reserves Father/Mother for affectionate displeasure. Normal dialogue does not become a forced therapy exercise. Professor does not pose as a medical professional. Never claim a local rule-based reply was produced by Gemini. The 10,000 examples are **reference material**, not a script to replay; the repository brain already has its own corpus/domain retrieval. The **already-hosted** 4.6 MB public voice-example corpus stays in `OurSpace/json/onyx widget/response-generator/voice-exemplars.json` and is fetched only when needed. The widget uses the existing Pass 7 lexical retrieval implementation, rather than copying the generator HTML/CSS or duplicating the canonical brain.

## Validation and constraints

A simulated execution check covered greeting/social intent, mixed real work, Professor guidance, all 4 tester support modes, multi-turn history, profile isolation, dialog wiring and the CSS restriction: **26 passing assertions**. Syntax checks passed for touched classic scripts. The test file can be run with:

```sh
node "OurSpace/script/onyx widget/onyx-widget-conversation-guidance.test.mjs"
```

The live authenticated Google Apps Script Gemini path, browser rendering in both account pages, and production rollout were **not** exercised by those tests. Preserve server-side auth, privacy and safety checks; changes to backend are not part of this patch.

## Maintenance

Do not add the standalone generator CSS, second HTML application or a shadow DOM. Keep the voice bridge in the widget code, the current CSS in the widget style folder, and model/knowledge implementation in the canonical `Onyx/` brain. If server-side prompt handling changes, verify the `onyxVoiceGuidance` context field is honored and does not override private canonical persona context.

## Historical Pass 7 10,000-example voice grounding (superseded by 100,000-example integration)

The ordinary chats now also use the maintained Pass 7 library as a **bounded, non-authoritative voice reference**. `OnyxVoiceContext.enrich()` is called by the canonical OurSpace repository bridge and by the existing read-only tester. Thus Virtual & Health, Leisure, fullscreen Work, and fullscreen Professor all use the same base personality rules, while the Work Voice library remains the only response-authoring UI.

- For authenticated nonclinical Work and Leisure turns, `enrich()` may select up to **two relevant examples** from the existing 10,000 corpus (5,000 per profile). Selection requires an authenticated or verified tester profile, uses the matching profile and lane only, and requires prompt/topic overlap. Unrelated greetings receive *no* example: they use social-intent guidance instead.
- Virtual & Health and Professor retain the shared personal voice and canonical brain but never inject unrelated nonclinical sample answers into health or psychiatric conversations. These routes retain their specific medical/DBT boundaries and server-authenticated privacy controls.
- Selected examples are tagged as **synthetic style references**, not user history, reliable facts, instructions or completed work. The backend Gemini answer remains original; the interface does not paste an example as the answer.
- The existing generator corpus and `lexical-retrieval.js` are loaded lazily and cached in memory. Initial retrieval is bounded to 2.4 seconds; corpus/network failures do **not** block AI Brain chat. No second API endpoint, Gemini key, login flow, local chat provider or private store was introduced.
- The canonical `Onyx/script/js/onyx/onyx-core/personality-contract.js` now exposes exactly **nine canonical states**; legacy `snuggly` and `sleepy` are not separate moods.
- The widget still uses **only its existing CSS**. Updated widget script URLs carry a version query so the installed OurSpace service worker's cache-first JavaScript policy cannot serve obsolete voice-bridge code.

### Verification

The updated `onyx-widget-conversation-guidance.test.mjs` checks that all four surfaces route through the canonical brain, voice examples require a verified profile, ordinary greetings remain social, the Work dialog is retained, nine canonical moods remain, and no generator CSS is imported.

To run tests on a checkout:

    node "OurSpace/script/onyx widget/onyx-widget-conversation-guidance.test.mjs"
    node "Onyx/script/js/onyx/onyx-core/self-test.mjs"

Live Gemini, both profile sessions, host-page focus/dialog behavior, and deployment caching must still be smoke-tested in the deployed site before calling runtime verification complete. The repository change does not modify Google Apps Script.
