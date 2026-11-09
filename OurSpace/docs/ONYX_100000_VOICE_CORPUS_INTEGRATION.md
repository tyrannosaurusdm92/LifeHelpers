# Onyx — 100,000 user/lane voice examples (8 November 2026)

## Provenance and boundary

Source: user-supplied `Onyx_100000_By_User_Chat(1).zip`. The eight account/lane text files were imported **without changing the original response ID, header, or response text**. For each entry, its enclosing illustrative cue/heading is included as retrieval metadata. The full original 100,000-response archive is not a trained model and does not prove that an AI call or external action happened.

**Do not publish or preload `Onyx_MASTER_REFERENCE_NOT_PROFILE_MEMORY.txt`**. The source archive explicitly identifies it as containing private background accounts. It is intentionally NOT present in this repository integration, not included in prompts, and not used as cross-account history.

Each stored shard is binary gzip JSON (`onyx.voice-corpus.v2`). Its `entries` are arrays `[sourceHeader, illustrativeCue, verbatimResponseText]`. There are no API keys, tester codes, backdoor secrets, or profile-memory records in the new shards.

## Complete inventory

| Account | Work | Leisure | Virtual & Health | Professor | Total |
|---|---:|---:|---:|---:|---:|
| William | 14,700 | 15,300 | 5,760 | 14,240 | 50,000 |
| Jasper | 14,700 | 15,300 | 5,760 | 14,240 | 50,000 |
| **Total** | **29,400** | **30,600** | **11,520** | **28,480** | **100,000** |

The eight actual archives are in `OurSpace/json/onyx widget/voice-corpus-100k/{william,jasper}/{work,leisure,virtual,professor}.json.gz`. Their total gzip size is approximately 2.66 MB. **All 100,000 IDs occur once and only once.**

## Conversation routing

Every conversation reaches the **existing** canonical `Onyx/script/js/onyx/onyx-core/` brain and existing Apps Script `onyx.chat`. Its frontend bridge calls `OnyxVoiceContext.enrich()` before the request. The module `OurSpace/script/onyx widget/response-generator/voice-corpus-100k.js` lazily fetches the relevant account/lane shard, validates its schema, profile, lane, count and ID uniqueness, and selects **up to three relevant synthetic voice examples**. Only the small selected examples, never the full corpus, are included in the backend context to avoid huge prompts and canned replies.

- **Work** selects the authenticated parent's 14,700 Work examples.
- **Leisure** selects the same parent's 15,300 Leisure examples.
- **Virtual & Health** selects the same parent's 5,760 Virtual examples. These are style references and must not be treated as diagnoses, personalized treatment or current medical sensing.
- **Professor** selects the same parent's 14,240 Professor examples; DBT/CBT and mental-health references are non-diagnostic, not professional licensure.
- In **fullscreen Work → Voice library**, the existing read-only email tester supports all four selected lanes, including Virtual & Health and Professor, using the **same existing Apps Script backend**. The new **Verify 100,000 voice references** control checks all eight archives without contacting Gemini or changing account data.

Greeting replies still receive direct social guidance; irrelevant technical/clinical examples should not be forced into a greeting. Urgent safety turns rely on safe canonical policy, not hypothetical response text.

The selected profile MUST come from a server-authenticated session or the existing verified tester session. The DOM's profile label and message content are NOT valid identity proof. The voice dataset is not a new memory store; approving new Work/Leisure responses remains an explicit separate action. Individual static voice assets are **publicly readable** because LifeHelpers is a public GitHub repository; profile-scoped retrieval prevents accidental mixing inside Onyx but does not make those source examples private.

## Runtime characteristics

- Uses JavaScript `fetch`, `DecompressionStream('gzip')`, and lazy in-memory per-lane caching. No Python, model key, second LLM/backend, generator CSS, new HTML page, new profile login, shadow DOM or iframe is required.
- On an unavailable asset or unsupported browser, Onyx continues with his canonical personality and AI Brain; this is reported as `not-ready` rather than pretending the corpus was loaded.
- Full ZIP was independently parsed to verify exactly 100,000 IDs; repository tests assert counts, uniqueness, format, account isolation, four-lane matching, and audit functionality.

## Validation commands

```
node --test "OurSpace/script/onyx widget/response-generator/voice-corpus-100k.test.mjs"
node --test "OurSpace/script/onyx widget/onyx-widget-conversation-guidance.test.mjs"
node "Onyx/script/js/onyx/onyx-core/self-test.mjs"
```

**Limitations:** Browser UI, both live authenticated profile sessions, and a real Gemini answer after the new corpus integration still need checking on the deployed site. A 100,000-example retrieval library supplies writing and conversation guidance; it does not fine-tune Gemini or grant new tool permissions.
