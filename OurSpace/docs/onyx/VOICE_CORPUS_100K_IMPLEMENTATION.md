# Onyx 100,000-response cross-mode voice reference — 8 November 2026

## Deployment

The owner's complete 100,000-example corpus is hosted as eight binary parts of one validated ZIP. Files are at:

OurSpace/json/onyx widget/voice-corpus-100k/archive.part00.bin
... archive.part07.bin

The eight parts concatenate to a 2,640,718-byte ZIP, SHA-256:
85cadc5728dcdcd609aeac8292960af5b79138a0141ed54224d63966efbb605f

The archive contains all eight original account/mode TXT example files without rewritten response lines. The private master reference containing personal history is deliberately NOT hosted.

| Profile | Work | Professor | Virtual | Leisure | Total |
|---|---:|---:|---:|---:|---:|
| Jasper | 14,700 | 14,240 | 5,760 | 15,300 | 50,000 |
| William | 14,700 | 14,240 | 5,760 | 15,300 | 50,000 |
| Total | 29,400 | 28,480 | 11,520 | 30,600 | 100,000 |

## Runtime

- assets/code/onyx_widget.html loads the 100k archive loader, safe shared voice guidance and existing brain.
- script/onyx widget/onyx-corpus-100k.js downloads the eight parts, concatenates them, decompresses the selected user/chat TXT, verifies count and IDs and caches results. An optional local ZIP import is supported for offline testing.
- script/onyx widget/onyx-voice-100k-bridge.js adds one canonical voice guidance contract with eight historical craft influences and nine moods to Work, Professor, Virtual & Health and Leisure.
- The shared backend AI brain generates new replies; only 1–2 topic-matched response excerpts are provided as stylistic references per request, never all 100,000 at once.
- Work tester allows a verified read-only tester to select any of the four lanes and either profile. The existing backend must verify tester token and account choice, not trust a browser label.
- The Onyx core personality contract reinforces identity continuity, not a second chatbot.

## Safety and privacy

This is a PUBLIC repository: fictional examples can be downloaded by anyone. The private master narrative was omitted. Never treat these fictional examples as clinical evidence, current events, personal memories or permissions for new actions.

Only the existing authenticated backend may supply profile-specific private memory. Work tester is read-only and cannot perform writes or claim sensing or medical diagnosis.

## Validation

The archive transfer was verified byte-for-byte via Git blob object hashes, and the local ZIP contains 100,000 distinct source IDs. To repeat archive and profile/lane validation from a checked-out repository, run:

    node "OurSpace/script/onyx widget/onyx-corpus-100k.test.mjs"

The original 10,000 Work/Leisure examples remain an emergency fallback if the hosted 100k archive cannot load. A static corpus test does not prove the deployed external Gemini/Apps Script backend is reachable. Test authenticated live chats separately.
