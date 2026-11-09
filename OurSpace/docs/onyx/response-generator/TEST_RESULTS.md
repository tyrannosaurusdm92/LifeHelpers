# Pass 7 OurSpace integration verification — 2026-11-09

- Automated Node tests: **65 passed, 0 failed** after the tester prompt repair.
- Coverage includes the 10,000-entry source corpus, WASM loading, all four lanes, signed-in and tester routing, profile isolation, the exact Leisure greeting regression, and Professor support/privacy.
- New regression checks reproduce the inappropriate “separate what is known” greeting, confirm a compact tester rewrite stays in Leisure, verify the tester session is retained, and reject oversize input without silent truncation.
- Professor cases cover emotional reflection, DBT STOP practice, plain-language psychoeducation, clinician preparation, listening without advice, thread continuity, and no persistent local turns or notes.
- Widget checks verify that the existing fullscreen Work Voice Library lazily imports the maintained ESM source, uses the Onyx widget stylesheet, excludes `generator.css`, and remains connected to the Onyx repository bridge.
- The build command succeeds and regenerates the 14-module single-file JavaScript artifact; the deployed page imports the maintained source modules directly so source fixes take effect without bundle drift.
- Tests use deterministic back-end doubles. **Live tester generation and Gemini provider identity still require the deployed page and backend check below.** A reply from the tester route alone does not prove Gemini was the upstream model.

Run from the repository root:

```sh
node --test "OurSpace/script/onyx widget/response-generator/"*.test.mjs "OurSpace/script/onyx widget/onyx-widget-conversation-guidance.test.mjs"
```

Older standalone-package test reports are retained in their Pass-specific history files and are not this integration's current results.
