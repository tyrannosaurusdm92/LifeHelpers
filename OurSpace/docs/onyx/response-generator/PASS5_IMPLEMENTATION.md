# Onyx Response Generator — Pass 5 Implementation & Verification

## Deliverable status
The Pass 4 project was updated in place in a new deliverable. **Only one HTML file**, `assets/code/index.html`, exists. It embeds the workshop CSS, the existing 10,000-reference corpus, compiled lexical WASM and the JavaScript application. The canonical source remains under `script/onyx widget/`; `generator.css` is not widget styling and should never be copied to the OurSpace widget. The reference examples are not newly generated training weights.

## Behavior changes that matter
1. `turn-understanding.js`: recognizes everyday social intent, short replies, conversation continuation, mixed greeting + work requests, and an explicit boundary for clinical topics. It gives the Gemini prompt a social/task response contract rather than copying a canned response from the library.
2. `dialogue-evaluator.js`: checks contextual fit, including unsolicited advice in check-ins, generic AI filler, scripted royal tropes, repetition and the exact rejected Pass 3 analytical response. It does not pretend to be a full semantic evaluator.
3. `conversation-engine.js`: includes the dialogue plan and recent context in the model prompt, attempts a single quality rewrite, and uses a **clearly labeled local repair** when a backend answer is grossly mismatched to a familiar social turn. No invisible switch to a local fallback is represented as Gemini output.
4. `onyx-responses.js`: applies the contextual quality evaluator to generation, uses the revised prompt structure and preserves the reusable ESM API for later widget integration. It does not replace the live OurSpace widget automatically.
5. `backend-client.js`: parses several common returned JSON envelopes, rejects missing/HTML replies, and distinguishes explicit `aiBrain=true` from an explicitly declared Gemini model/provider. A backend reply with no provider identity remains *unverified*.
6. `context-memory.js`: ignores unrelated approved notes instead of placing the last five facts into every prompt. The user can still explicitly ask what was remembered. Storage remains profile/mode scoped; conversation persistence still requires opt-in.
7. `social-replies.js`: uses the conversation understanding layer for short follow-up messages. The offline composer remains limited rule-based software and is never called a language model.

## Voice continuity
Onyx is a very old, sleepy, perceptive black cat with green-gold eyes, a royal bowtie, an ancient formerly-human identity in family lore, and fierce affection toward both parents. He can be semi-formal and vaguely old-world without pretending to be Shakespeare. He uses **Papa** for William and **Momma** for Jasper; **Father** and **Mother** are reserved for affectionate displeasure. No joke, food theft, imperial bureaucracy, theatrical proclamation or nickname is mandatory. The original nine moods are maintained, with Professor exclusively reserved for authorized psychiatry/therapy assistance, not the Work/Leisure generator.

The eight research influences are treated as abstract traits of thought and care, not imitations of their language or identities. Dialogue should prioritize what the parent actually said. Ordinary greetings deserve ordinary companion replies; work deserves grounded, substantive work.

## Backend honesty
The only backend destination remains:
`https://script.google.com/macros/s/AKfycbwxviV1hERFKIivY5we5W1gVMqfsH6DNY0mNZkEs2SXcoa4gDM88c14tIyraytnSAyKvQ/exec`.

The client still sends `namespace=ourspace.onyx`, `action=onyx.chat`, profile scope, mood, thread, and `useBrain=true` as a request to the **existing** service. These fields were inherited from the uploaded package; there is **no proof** that the deployed Apps Script accepts this exact schema or calls Gemini. The integration is available for authenticated testing, but an end-to-end Gemini result was **not** obtained. Do not claim the connection works until a genuine logged-in session passes a live test and identifies the backend's Gemini provider. No backend was edited, no tokens or credentials were read or stored, and no new remote endpoint was deployed.

For local testing, `npm start` launches the inherited localhost-only relay. For static hosting, Gemini requires a compatible trusted same-origin bridge or an authorized host integration; opening a file directly permits only offline drafting.

## Automated verification
From the project root: `npm test`. Tests cover the original corpus and WASM, 10,000 reference count, generation and approved libraries, local and backend mock conversations, profile isolation, greeting regression, short-term follow-ups, memory relevance, metadata parsing, social reply quality and the distinction between a reported AI Brain and verified Gemini. `npm run build` generates the single HTML file from source modules; `node --check` validates the bundle.

**Limitations:** The browser smoke test in this environment did not finish (Chromium headless timed out), so this version does not claim a completed interactive browser end-to-end pass. The backend test is mocked, not a live Gemini request. Local drafts remain formula-based and cannot be guaranteed to sound as natural as a model-written conversation.

## Why not copy the 19 archives?
The uploaded sources are distinct, often server-side Python, Go, CUDA or web frameworks with different licenses, build chains and dependencies. Some (e.g. a complete model server) cannot be converted to browser WebAssembly merely by renaming files, and none supplies the authorized Gemini session or a deployable Onyx-specific trained model. See `NINETEEN_SOURCE_ARCHIVES.md` for the file-by-file audit. Inflating the release to the requested 10–30 MB post-compression with unrelated source would create a less reliable product; this size target remains **unmet**.
