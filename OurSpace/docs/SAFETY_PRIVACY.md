# Safety and privacy

`brain-link.js` bundles the safety kernel and health runtime. Safety classification remains centralized in that kernel, and backend safety remains authoritative when available. Sensitive/profile-specific facts stay out of frontend data files. Health durable memory defaults off, and serious turns never auto-save durably.

Private profile knowledge is retrieved only by the authenticated backend. The bridge forwards chat through the existing `onyx.chat` action with `useBrain: true`; it does not include private brain corpus data in the JavaScript bundle.
