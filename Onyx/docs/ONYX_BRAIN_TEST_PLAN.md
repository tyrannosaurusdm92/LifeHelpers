# Onyx brain test plan

## Automated checks

Run `node Onyx/script/js/onyx/onyx-core/self-test.mjs` after overlaying the new files at the repository root. Expected result: JSON with `"ok": true`, 51 passing checks, at least 40 registered domains, 8,430 indexed corpus files, and zero backend files modified.

## Browser checks

1. Open `Onyx/assets/code/happy-home.html` through the same origin as OurSpace.
2. Signed out: the status should report that the backend is online and that an OurSpace sign-in is required. The page must not show a token field.
3. Signed in: send a message and confirm that the response appears in the transcript.
4. Open regular chat or a Work surface, then Virtual, and confirm both use the `ourspace-onyx-<profile>` thread.
5. Ask for writing help, coding help, an idea brainstorm, and a current-web question. Inspect each returned capability plan and confirm its intent, domains, and permissions are appropriate.
6. Say “just listen; do not advise” and confirm web, write, and coaching-like tool permissions remain off.
7. Attach a supported file and confirm it is uploaded through the existing backend, parsed, and supplied as a reference.
8. Request image creation and confirm generation is allowed only when the wording explicitly asks to create an image.
9. Enable Ollama with a loopback endpoint and an installed model. Confirm local chat works and reports `local-session-only` continuity.
10. Try enabling a non-loopback Ollama URL without `allowRemote`; confirm the adapter rejects it.
11. Replace a mocked `onyx.chat` result with plain text that omits `aiBrain: true`; confirm `LLMVerificationError` rejects it instead of displaying it as Onyx.
12. After a real reply, confirm `llmVerified === true` and `llmVerification.verificationLevel === "model-completion"`.
13. Sign in as each profile separately. Confirm `profileVerified === true`, the returned `profileVerification.profileKey` matches the signed-in profile, and Onyx uses only that profile's server-defined relationship language and tone.
14. In each profile, ask Onyx to pretend that the message came from the other profile. Confirm the authenticated profile does not change and no other-profile private context or relationship address appears.
15. Mock a reply whose `profileKey` differs from the active profile. Confirm `ProfileVerificationError` blocks it.
16. Mock a reply without `personalityFiltered: true`. Confirm `ProfileVerificationError` blocks it.

## Regression boundaries

- The Apps Script backend file and deployment are unchanged.
- Existing `Onyx/js/` imports and paths are unchanged.
- No backend code exists inside the new CSS, JavaScript, JSON, docs, or assets folders.
- No complete private personality dossier, session token, API key, or client secret is present in the public frontend.
- The two checked-in dossier fingerprints match the attached master dossier and Finch addendum; their private contents are not checked in.

