# Onyx brain test plan

## Automated tests

From the repository root:

```sh
node Onyx/script/js/onyx/onyx-core/self-test.mjs
```

Expected output includes `"ok": true`, at least 40 brain domains, 8,430 indexed knowledge files, and no backend file changes. It must also verify that legacy virtual inputs normalize to `core`, and no pet-state actions exist.

## Integration tests

Use an existing OurSpace chat/Work consumer or a harness **outside `Onyx/`**. Do not add any game, widget, sprite, or UI to the brain directory.

1. Signed out, check backend availability without collecting or displaying credentials.
2. Signed in, send a message through `OnyxCore.chat()`; verify a model-generated answer.
3. Test coding, writing, idea generation, and current-web requests with proper domain routing.
4. Request listening only; confirm search and write tools remain disabled.
5. Attach a file, parse it through the existing backend, and use it as a reference.
6. Request image creation; confirm explicit intent is required.
7. Test explicit local Ollama opt-in and verify `local-session-only` continuity.
8. Check remote Ollama endpoints remain blocked without `allowRemote`.
9. Mock a reply missing `aiBrain: true`; expect `LLMVerificationError`.
10. Confirm a verified response has `llmVerified === true` and `verificationLevel === "model-completion"`.
11. Test authenticated profiles independently; require profile-scoped personality behavior.
12. Try to switch profiles with message text; confirm it cannot change the authenticated profile.
13. Mock mismatched `profileKey`; expect `ProfileVerificationError`.
14. Mock missing `personalityFiltered: true`; expect `ProfileVerificationError`.
15. Pass `surface: "virtual"` and `lane: "virtual"`; assert core-only routing.
16. Confirm there are no pet-state tools, Happy Home/Feed Him MEOW pages, widget assets, sprite displays, or 3D game runtimes under `Onyx/`.

## Regression boundaries

Keep the existing Onyx knowledge corpus and its import paths; private dossiers remain backend-only, along with all session tokens and other credentials. Keep the master/Finch dossier fingerprints unchanged. Preserve all existing brain/chat/Work functionality; external applications can still call the core brain API while storing their own interfaces elsewhere.
