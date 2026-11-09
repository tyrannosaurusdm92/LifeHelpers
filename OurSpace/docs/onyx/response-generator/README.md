# Onyx Response Generator · OurSpace Pass 7 integration

This is the current integrated release for the existing OurSpace widget. The single HTML entry remains `OurSpace/assets/code/onyx_widget.html`; the full response workshop opens inside fullscreen Work. There is no second HTML page or duplicate Onyx brain.

## Start here

Read [OURSPACE_INTEGRATION_DOSSIER.md](OURSPACE_INTEGRATION_DOSSIER.md) for the complete architecture and [TEST_RESULTS.md](TEST_RESULTS.md) for the current verification record. Older Pass 2–7 source documents are retained as provenance; where their standalone-package instructions differ, this integration guide and dossier describe the current repository state.

## What is included

- Full modular Pass 7 response and conversation source under `script/onyx widget/response-generator/`.
- The original 10,000 voice-reference entries and lane/canon JSON under `json/onyx widget/response-generator/`.
- The active lexical C/WASM ranker plus the preserved auxiliary similarity primitive and their C sources under `script/wasm/onyx-response-generator/`.
- The lazy Work-view loader at `script/onyx widget/onyx-responses.js`.
- Targeted workshop rules appended to the existing `style/onyx widget/onyx_widget_style.css`. The standalone `generator.css` is excluded.
- The current dossier, test record, and Pass 7 source documentation under `docs/onyx/response-generator/`.

## Backend and conversation lanes

The workshop uses the existing verified William/Jasper account session or the already existing read-only tester flow. Its adapter routes replies through `OnyxRepositoryBridge` to `LifeHelpers/Onyx`; it does not call Gemini directly or carry a provider key. Work and Leisure permit explicit opt-in local notes and transcript retention. Virtual & Health and Professor require the live backend and keep their workshop turns, notes, and approvals ephemeral.

Professor uses the canonical `professor` / `dbt` support route. Tests cover emotional reflection, DBT skill practice, plain-language psychology education, clinician preparation, listening requests, thread-scoped continuity, and the no-local-persistence boundary. The 10,000 examples guide voice retrieval; they are not training weights or random canned answers.

A shared check-in quality guard retries one plainly mismatched casual greeting against the same canonical brain, preserving the original user message, profile, lane, and history. It never substitutes an offline canned response.

## Run the tests

From the LifeHelpers repository root:

```sh
node --test "OurSpace/script/onyx widget/response-generator/"*.test.mjs "OurSpace/script/onyx widget/onyx-widget-conversation-guidance.test.mjs"
```

Passing local tests use deterministic mock backends. They do not prove a live Gemini completion or runtime loading from both deployed account pages. Verify provider selection within the existing backend; `aiBrain:true` alone does not identify the model provider.
