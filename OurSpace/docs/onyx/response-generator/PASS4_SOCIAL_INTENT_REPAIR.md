# Pass 4 — Social intent, stable routing and Gemini-result honesty

## Reproduced failure

Input (William, Leisure): `Hey buddy how are you doing?`

Prior observed reply: `Papa, I would begin by separating what is known from what we are assuming. That gives us a practical next step without pretending to possess information I have not seen. Which part would you like to settle first?`

Root cause, verified from the Pass 3 source: `local-composer.js` considered CSS, widget dragging, backend, code, writing, games, music and food, then a `general` fallback. It had no conversational-intent category for greetings, welfare checks or affectionate chat. The generic fallback supplied an analytic thought and an unrelated problem-solving question. The live model prompt likewise had no hard instruction to prefer answering the greeting's social purpose over unrelated style examples.

## Fixed contracts

1. `conversation-intents.js`: purpose-first detection. Family check-in, hello, what Onyx is doing, thanks, affection, seeking company, saying goodbye, listening and user-reported day are social acts. An actual task mentioned alongside a greeting remains a task.
2. `social-replies.js`: small local response composer for social language. Produces plausible ordinary *fictional* cat states (resting, a quiet day, keeping family company), not claims to know what the real cat is doing at this instant. The small pieces vary across turns; this is **not** a neural model and cannot supply genuine unconstrained language generation.
3. `local-composer.js`: social route evaluated **before** Work advice lookup; unknown Leisure utterances no longer default to technical analyses.
4. `conversation-engine.js`: social purpose is explicit in the LLM instruction; unrelated 10,000-reference examples are omitted for social prompts. Quality warnings cause one backend rewrite request. If both model attempts remain clearly irrelevant, the result becomes an *explicitly identified local fallback*, never secretly presented as Gemini.
5. `onyx-responses.js`: both standalone generation and interactive conversation use purpose-first matching. In live generation, socially off-target text receives one revision, then a clearly labeled local fallback.
6. `quality-guard.js`: tests detect phrases like "separate what is known", "practical next step" and "which part would you like to settle" when the input is ordinary social chat. This is a **heuristic**; subtler errors still require user review.
7. `generator-app.js`: UI distinguishes backend, offline, and guarded local fallback sources. There is an opt-in `Test authenticated backend conversation` button that uses the existing `onyx.chat` endpoint only. No new backend, keys, token persistence, automatic memory, or clinical calls.
8. `json/onyx widget/voice-strategy.json`: permanent social-priority rule and positive/negative regression examples.

## Example expected outputs

- William: "Hey buddy how are you doing?" → "Papa, I am comfortable, thank you for asking. A little company suits me nicely. There is room beside me, you know." (one local possible output)
- Jasper: "I love you, little man" → warm reciprocal affection, addressed to Momma only when direct address is naturally needed.
- Either parent: "Hey buddy, how do I fix the CSS?" → actual CSS investigation, not a greeting-only answer.
- "Goodnight, my boy" → goodnight, not a request to clarify the situation.

No single sample is a required phrase. In Gemini mode the model should generate its own authentic reply within Onyx's voice constraints.

## Tests and provenance

The package passes 31/31 Node regression tests. New tests verify the user's exact prompt, multiple greetings, several family addresses, overlapping work tasks, 12 variation attempts, the old off-target text, correct and incorrect mocked AI replies, and the real generation/chat module paths. The package's compiled standalone HTML embeds the corpus, C-compiled WASM scorer and JavaScript with no external file requests for offline use. Direct Chromium UI navigation was blocked in this testing environment; no user-desktop or authenticated live Gemini test is claimed.

## Existing endpoint limit

Only the existing Apps Script `/exec` address is present. The client assumes the `onyx.chat` action envelope documented in the prior package; the deployed Apps Script's actual action support and Gemini provider configuration **have not been verified**. A model requires working authorized inference; the project ZIP's byte size does not supply model weights or Gemini credentials.

## Compressed-code target

The requested 10,000–30,000 KB of additional compressed code is **not met**. The archive intentionally does not pad itself with unused upstream repositories, repeated sentences, random bytes or mislabeled Python. Quality repairs and testability take priority over unverifiable claims of additional intelligence. Retained 10,000 examples are voice references, not neural training.
