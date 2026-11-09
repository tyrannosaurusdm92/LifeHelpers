# Pass 7 OurSpace integration verification — 2026-11-09

- Automated Node tests: **66 passed, 0 failed**.
- Coverage includes the 10,000-entry source corpus, both functional WASM scorers, all four lanes, signed-in and tester adapter routing, profile isolation, the exact Leisure greeting regression, social-reply retry through the canonical brain bridge, and Professor conversation capability and privacy.
- Professor scenarios covered emotional reflection, DBT STOP practice, plain-language psychoeducation, clinician preparation, listening without advice, thread continuity, and no persistent local turns or notes.
- The widget smoke checks verify the existing single Work fullscreen entry, lazy module loading, existing widget stylesheet usage, no `generator.css` reference, and the Onyx repository brain connection.
- The suite uses deterministic test doubles. **Live Gemini completion and the deployed widget in both signed-in accounts remain unverified**; those require the live backend plus an authenticated account or valid tester code.

Run from the repository root:

```sh
node --test "OurSpace/script/onyx widget/response-generator/"*.test.mjs "OurSpace/script/onyx widget/onyx-widget-conversation-guidance.test.mjs"
```

Older standalone-package test reports are retained in their Pass-specific history files and are not this integration's current results.
