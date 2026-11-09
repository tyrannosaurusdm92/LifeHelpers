# Source inventory: 19 uploaded AI repositories

**Scope:** Reviewed archive inventories, root READMEs when available, and root LICENSE metadata. They were used as architectural references for an original Onyx-specific JavaScript/WASM implementation. This is not a claim of downloading live releases, checking every source file, converting the projects, or integrating their pretrained models. No third-party source archive was copied into the release. Licensing and dependencies therefore remain with the source projects rather than becoming undisclosed parts of the widget.

| Archive | Study focus | Applied decision / reason not copied wholesale |
|---|---|---|
| `transformers-main.zip` | Model/tokenizer/pipeline interfaces, pretrained checkpoints | Keep generation separate from retrieval. This archive is primarily Python code; no deployable browser Onyx model weights are supplied. |
| `ECC-main.zip` | Agent instructions, stable conventions, tests, JavaScript examples | Document clear contracts, minimize ambiguous fallback behavior, and add regression tests. Do not embed a second unrelated agent configuration system. |
| `MetaGPT-main.zip` | Decomposition and verification of complex tasks | Separate turn understanding, voice, reply evaluation, and backend requests without creating fictional multi-agent Onyx personalities. |
| `ai-engineering-from-scratch-main.zip` | Evaluation-driven AI design, retrieval patterns | Use explicit before/after quality criteria and mocked end-to-end tests, not unverified marketing claims. |
| `unsloth-main.zip` | Training and fine-tuning workflow | Training is not available just because a browser can display text; preserve an approved exemplar library instead of claiming Gemini has been fine-tuned. |
| `vllm-main.zip` | Production inference serving, batching, model IO | Avoid a local model-server dependency and keep the user's existing Apps Script service; model weights and GPU services are absent. |
| `deer-flow-main.zip` | Agent-flow separation and tool safety | Preserve one Onyx identity, with separately scoped Work and Leisure requests, not an uncontrolled agent swarm. |
| `AutoGPT-master (1).zip` | Stateful workflows, planning versus execution | Do not treat Onyx's reply or task plan as proof an external action ran. Require verified results before claiming completion. |
| `learn-claude-code-main.zip` | Harness engineering, context/tool contract | Put context assembly and factual boundaries in independently testable JS rather than one giant conditional prompt. |
| `open-webui-main.zip` | Accessible chat UI, provider boundaries and history | Make the provider and fallback states explicit in the workshop. Did not copy Svelte UI or self-hosted backend. |
| `langchain-master.zip` | Retrieval, document and model adapters | Maintain a bounded, provenance-aware retrieval layer without shipping unused Python dependencies. |
| `dify-main.zip` | Workflow configuration, app-level model orchestration | Preserve modular model prompt and result normalization; do not copy an entire multi-service stack into static HTML. |
| `caveman-main.zip` | Context compaction, token-efficiency | Keep only relevant approved memories and bounded recent turns in prompts. |
| `graphify-8.zip` | Knowledge graphs, entity linking, document provenance | Do not infer personal relationships or sensitive knowledge from unrelated corpus text. Only explicitly approved profile-scoped notes are treated as memory. |
| `LLMs-from-scratch-main.zip` | Token prediction, attention, training methodology | A deterministic local composer cannot legitimately be advertised as a trained LLM; actual model weights and inference are necessary. |
| `browser-use-main.zip` | Browser interaction, tool-result verification | Do not claim browser use or web access without an actual authorized tool. The generator is not an agentic browsing runtime. |
| `firecrawl-main.zip` | Crawling, extraction, source lineage | Retrieval of outside pages is a separate permissioned capability; no uncontrolled crawling or leaking private profile data from the widget. |
| `ollama-main (1).zip` | Local model serving and inference | This is primarily a Go/native model-serving system. It is not a drop-in browser WASM model and is not a replacement for the requested existing Gemini backend. |
| `ponytail-main.zip` | Concise agent behavior and minimal output | Favor response fit and useful brevity over long generic assistant explanations; avoid copying another assistant's scripted persona. |

## Transferable patterns actually implemented

- **Understand before composing:** the new `turn-understanding.js` separates social, task, and continuing turns before retrieval or prompting.
- **Verify response fit:** `dialogue-evaluator.js` can reject the known greeting failure and non sequiturs, with a bounded model rewrite and a truthfully labeled local fallback when appropriate.
- **Keep model/provider boundaries explicit:** `backend-client.js` preserves the existing Apps Script /exec destination, and does not call a response Gemini merely because it arrived from that endpoint.
- **Keep saved state authorized and scoped:** `context-memory.js` returns only relevant approved notes unless the user explicitly asks for saved facts.
- **Control claims:** No file editing, backend deployment, live Gemini invocation, training, or model-weights installation is claimed unless it actually happened.

## Portability and sizes

Most upstream stacks are designed for Python, native Go, server-side JS/TS, CUDA, GPUs, or external dependencies. Python packages cannot be made into functional WebAssembly modules by changing extensions. The two inherited C WASM ranking source files remain in `script/wasm/`; they are compiled WASM functions, not neural network weights. This pass did not include a GPU/transformer runtime because the user-supplied source archives do not provide a verified, licensing-compatible, browser-ready Onyx model package. Including unused source to reach a 10–30 MB compressed-code quota would not improve correctness and is intentionally avoided.
