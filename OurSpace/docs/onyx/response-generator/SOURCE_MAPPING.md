# Traceability: supplied dossiers, backend and Google Drive resources

## Dossier inputs

- `Onyx_Full_Personality_Dossier_9_Moods_10000_Work_Leisure_Responses_2026-11-08(1).txt`: The `§15B` labeled corpus was parsed into **10,000 exact source entries**, preserving the stable IDs, profile, Work/Leisure mode, source mood, scenario cue, and dialogue. `§15A` supplied the nine-mood names and voice rules; `§02–§03` supplied high-level nonclinical personality and relationship facts. The source itself says examples are reference material, **not** prerecorded replies.
- `Eight_Historical_and_Contemporary_Personality_Dossiers_100000_Words(2).txt`: Eight named figures informed the interpretive craft-level facets in `influences.json`. No alleged private thoughts, fictional direct quotes, author impersonation, or actual celebrity dialogue was copied. This file cautions that biographies and performances cannot be treated as complete personality profiles.
- `OurSpace_Unified_Backend_3.4.6_Drive_Media_2026-11-07(2).txt`: Used to ground the existing Apps Script action (`onyx.chat`), the `sessionToken` authentication shape, the server-to-AI-Brain route, read/write flags, and the existing chat-log behavior. The backend file **was not embedded** in the client package or edited.

## Google Drive resource inventory

The user-provided folder `1BUXfq9K9Rtevg9V0J0QH6ZikZxghIOgw` was accessible and listed **24 ZIP archives**, including AutoGPT, MetaGPT, ai-engineering-from-scratch, unsloth, archify, vLLM, deer-flow, OpenHands, LlamaFactory, Hermes-agent, crawl4ai, transformers, open-webui, learn-claude-code, LangChain, Dify, caveman, graphify, LLMs-from-scratch, browser-use, firecrawl, Ollama, ponytail, and ECC.

The smaller `learn-claude-code-main.zip` archive was downloaded and the `docs/en/s01-the-agent-loop.md` and `docs/en/s06-context-compact.md` concepts inspected. Its ideas about clear model/tool boundaries and bounded context informed the adapter separation and the decision to send only a few retrieved examples per request. **No third-party source code was copied or Python runtime packaged.** The other 23 archives were inventoried but **not unpacked or incorporated**; they are not needed to replace a Gemini server already owned by OurSpace. The current client is not a fine-tuned transformer, vLLM runtime, autonomous agent, or browser automation framework.

## Source priority and limitations

The owner's canon and nine-mood contract override generalized personality stereotypes. The sample library is nonclinical only, and distinct signed-in profile contexts must not merge. The backend is authoritative for AI provider, authentication, and memory; the static workshop cannot attest that the production deployment currently matches every line of the uploaded backend or that Gemini's provider key is configured.
