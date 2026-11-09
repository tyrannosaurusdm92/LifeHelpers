# Current OurSpace integration

The modular Pass 7 response generator is integrated into `OurSpace/assets/code/onyx_widget.html`, inside the existing fullscreen Work view. The widget still has one HTML file. No generator CSS, second frontend, second AI backend, or duplicate brain is installed.

See [OURSPACE_INTEGRATION_DOSSIER.md](OURSPACE_INTEGRATION_DOSSIER.md) for full behavior and privacy details.

## Runtime files

| Path | Role |
| --- | --- |
| `assets/code/onyx_widget.html` | Existing single widget document; includes the Work-only workshop and four lane controls. |
| `script/onyx widget/onyx-responses.js` | Lazy-loads the full workshop when Voice Library opens. |
| `script/onyx widget/response-generator/` | Generation, conversation planning, quality checks, memory boundaries, account/tester adapter, and tests. |
| `script/onyx widget/onyx_widget_onyx-repository-bridge.js` | Existing authenticated bridge to the repository brain, with a single quality retry for a plainly mismatched social check-in. |
| `json/onyx widget/response-generator/` | Full 10,000-example corpus and voice strategy/canon data. |
| `script/wasm/onyx-response-generator/` | WASM lexical rankers used by the generator. |
| `style/onyx widget/onyx_widget_style.css` | Existing widget CSS, with scoped response-workshop layout rules appended. |
| `docs/onyx/response-generator/` | Dossier, current test results, source notes, and release guidance. |

## Request routing

- Signed-in account: the existing `OnyxRepositoryBridge` routes through the canonical `LifeHelpers/Onyx` brain and backend.
- Read-only tester: the existing `OnyxTester` email-code session is reused; profile selection is verified before a request.
- Professor: `professor` conversation lane with `dbt` support routing. No local-preview replies or local retention.
- Virtual & Health: health support lane through the same canonical brain. No local-preview replies or local retention.
- Work and Leisure: canonical brain for live replies; optional browser-local approvals/notes/transcripts remain explicit and profile-scoped.

Do not treat the profile control as authorization. The authenticated account or backend-issued read-only tester session is authoritative. No Gemini key is sent to the browser. The supplied Apps Script deployment and provider configuration remain server-side.

## Response export

`exportWidgetJS(profile)` exports only responses the user explicitly approved in that browser/profile. It does not retrain Gemini. These examples guide voice style; they are not a default canned-response inventory.
