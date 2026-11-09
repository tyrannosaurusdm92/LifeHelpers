# Security and deployment

## Existing backend and credentials

This integration does not deploy or alter the Apps Script backend and contains no Gemini API key. Signed-in account traffic passes through the existing authenticated OurSpace bridge into `LifeHelpers/Onyx`; model selection and private knowledge stay server-side. The response workshop disables Drive access, writes, web search, asset generation, external tools, and automatic memory for its generated samples.

The existing email-code tester remains a separate read-only route. It requires the backend-issued six-digit verification and selected William/Jasper profile. Its existing JSONP actions place the test code, temporary tester token, and message in HTTPS query parameters, which may appear in diagnostic/network logs. Use it only for non-sensitive testing; do not enter private health, family, or account details through that route.

## Model and persistence boundaries

The 10,000-reference corpus contains ordinary voice examples, not clinical guidance or model weights. Professor and Virtual & Health inputs are accepted only through the canonical live brain, with lane-specific support instructions. They are unavailable in local preview and cannot be stored as approved local samples or notes.

Work and Leisure approvals, optional notes, and transcript turns are local to the current browser and profile. They are saved only after an explicit user action. Clearing a profile's local records does not affect the backend. The backend may separately log live requests according to its existing policy; this frontend cannot promise otherwise.

The social quality guard can make one additional call to the same brain when a response plainly answers a casual greeting as an analytical framework. It keeps the original user message and disables memory learning on the retry. This may create an additional backend request/log entry. It does not insert a canned or offline answer.

## Verification limits

The Node suite uses test doubles for the backend and does not prove that Gemini is configured, that the deployed Apps Script matches a local source document, or that both account pages load the latest assets. Confirm provider configuration within the backend; `aiBrain:true` proves only that the brain path completed, not which model answered. Live verification requires a valid signed-in account or the read-only tester session.

The generator expects its JSON and WASM files to be served at their repository-relative paths over the same hosted origin as the widget. The exported standalone generator stylesheet is not used; workshop layout rules live in the existing Onyx widget stylesheet.
