# Integration

`js/onyx/onyx-core/brain-link.js` is the single browser entry for Onyx backend, memory, data, safety, WASM, health, DBT, retrieval, and conversation code. It combines nine runtime sections in their original dependency order and exposes `OnyxBrainLink`.

The bridge sends chat through the authenticated OurSpace backend using `onyx.chat`, `useBrain: true`, and `ai: true`. The frontend endpoint and `LifeHelpers/Onyx/js/ai-brain-config.js` backend URL currently match. The large Onyx corpus remains in `LifeHelpers/Onyx`; it is not embedded or fetched directly by this frontend. Profile-private retrieval stays backend-only.

The bundled Apps Script client is not the backend implementation. A matching URL and action verify the frontend contract; they do not prove that the live server has loaded the latest repository modules. The server source is not included in this export, so live corpus retrieval still needs a signed-in integration run.

Drive remains explicit/bound context rather than an automatic search of personal files for generic Work questions. Attachments are turn-scoped: they remain available after cancellation/error so the user can retry, and clear after a successful response.
