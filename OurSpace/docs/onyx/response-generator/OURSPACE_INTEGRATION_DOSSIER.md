# Onyx Response Generator · OurSpace Integration Dossier

## What is integrated

The full Pass 7 response generator now runs from the existing `assets/code/onyx_widget.html` entry point, within fullscreen Work’s Voice Library. Its modular JavaScript engine, complete 10,000-example voice corpus, rebuilt single-file JavaScript bundle, build tooling, template source, canon and strategy JSON, both WASM rankers, tests, and dossiers are maintained in Onyx-specific subfolders. The generator bundle is loaded only after Voice Library opens. The original standalone HTML markup is merged into the existing widget page; no second HTML page is added. The separate generator stylesheet is not loaded; the interface uses the existing Onyx widget stylesheet.

The source modules retain response drafting, social-intent classification, conversational continuity, quality checks, profile-scoped local approvals, explicit opt-in nonclinical notes, and JSON / `onyx-responses.js` export. The Work panel exposes Work, Leisure, Virtual & Health, and Professor lanes.

## Backend and privacy routing

- Signed-in requests go through `OnyxRepositoryBridge` to the canonical `LifeHelpers/Onyx` brain. The page does not call Gemini directly and contains no Gemini credential.
- Read-only tester requests reuse `OnyxTester` and its existing email-code session at the configured Apps Script endpoint. The generator does not create a second token flow.
- The adapter checks the active account or selected tester profile before every request. It rejects a cross-profile mismatch.
- All lanes set `autoRemember`, Drive access, writes, asset generation, and external tools off for generated voice samples. The canonical brain remains responsible for knowledge retrieval and language-model completion.
- Work and Leisure turns or notes are stored locally only when the user opts in. Professor and Virtual & Health turns, notes, and approved response samples are not persisted by this workshop.
- Local preview is labeled as non-LLM and is unavailable in Professor and Virtual & Health.

## Conversation behavior

Onyx answers the actual message first. Social greetings and “how are you?” check-ins are classified before task language; they receive a direct, familiar reply rather than a troubleshooting framework. A model reply that fails social-context checks receives one rewrite request; if it still fails, the interface marks the local social repair as not an LLM response.

The shared voice guidance is also used by normal widget chats, including Professor Onyx, through the existing `OnyxRepositoryBridge` to the canonical `LifeHelpers/Onyx` brain. If the live brain returns the known kind of analytical framework for a casual greeting, the bridge makes one quality-repair call to that same brain, with the same user message, lane, profile, and history. The retry disables memory learning and never inserts a canned offline response. A second mismatch remains marked for review.

The voice remains semi-formal, gently old-world, perceptive, affectionate, and understated. “Papa” and “Momma” are optional familiar forms of address. “Father” and “Mother” are reserved for displeasure. There is no obligatory meow, joke, royal flourish, or faux-archaic speech.

Professor uses the `professor` lane and `dbt` support mode. It can respond to emotional-support, DBT skill, worksheet, psychology-education, and clinician-preparation requests without being rejected by the ordinary Work / Leisure filter. Its instructions prohibit diagnosis, false clinical credentials, pressure to disclose, and treating a casual greeting as therapy. Urgent-risk language is routed through the canonical brain’s safety guidance. Health and Professor conversations remain ephemeral in the workshop.

## Runtime and verification limits

The included Node suite checks source inventory, WASM loading, four-lane routing, Professor / health boundaries, social-intent repair, profile separation, tester routing, and widget integration without importing generator CSS. The build script can regenerate the complete JavaScript bundle from the modular source and 10,000 references; it does not emit another HTML page or stylesheet. A passing local suite confirms the code paths and test doubles. It does not prove a live deployed Gemini completion; that requires a valid tester session or signed-in account and the deployed Apps Script / backend to be reachable.

The existing `script/onyx widget/onyx-responses.js` loader brings in the rebuilt Pass 7 bundle on demand. The bundle contains the full corpus and engine for a self-contained script load, while the modular source remains canonical for maintenance. The local development server serves the existing widget at `/` and retains only the original scoped backend relay behavior. The original generator stylesheet is excluded; all workshop styling is scoped into the existing Onyx widget stylesheet.
