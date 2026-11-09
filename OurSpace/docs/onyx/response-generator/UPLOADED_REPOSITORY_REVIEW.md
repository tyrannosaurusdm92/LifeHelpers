# Uploaded AI-source archives — Pass 4 review and integration boundary

The supplied archives were inspected directly for their package inventories, top-level READMEs and architectural scope. These are separate projects with distinct build systems, licenses, dependencies and often Python or CUDA requirements; none is a drop-in JS/WASM language model for this workshop. No whole archive was copied into the delivered application.

| Uploaded source | Relevant idea to study | Why it is not pasted into Onyx |
|---|---|---|
| crawl4ai-main.zip | source acquisition, extraction, RAG document provenance | network crawling is a separate authorized tool; a read-only private chat does not need automatic crawling |
| transformers-main.zip | tokenizer/model/pipeline abstractions | training/inference stacks and weights are not converted into WASM merely by renaming Python |
| ECC-main.zip | agent engineering conventions and review workflows | broad agent rules cannot replace authenticated backend tools |
| MetaGPT-main.zip | task-role separation and collaboration orchestration | multiple fictional agents would fragment the single Onyx persona |
| ai-engineering-from-scratch-main.zip | evaluation-driven development, retrieval and agent runtime architecture | educational Python experiments are not a browser LLM or trained model weights |
| unsloth-main.zip | model fine-tuning workflows | native/GPU model tuning and checkpoint artifacts not supplied as deployable JS/WASM model |
| archify-main.zip | browser UI and user-directed interactions | a separate full application UI is not needed inside an Onyx widget |
| vllm-main.zip | high-throughput model serving | serving infrastructure typically requires models and server hardware; not portable to a static page |
| deer-flow-main.zip | orchestration and workflow graphs | extra autonomous agents would expand attack surface and violate no-new-backend constraint |
| OpenHands-main.zip | tool boundaries, verification and code-agent workflows | its tools are not authorized as part of an Onyx Leisure conversation |
| LlamaFactory-main.zip | data preparation and fine-tuning | model training artifacts and serving infrastructure must be provided/deployed independently |

**What actually changed after reviewing the references:** response intent is classified before retrieval and model prompting; source examples are treated as untrusted data; independent quality tests verify output fit; no outputs claim tools were used; and live model inference is kept behind the pre-existing `onyx.chat` Apps Script client. These are original, small JavaScript modules. The existing C-to-WASM scorer remains real WASM. There is **no** Python runtime in the package and no claim of bulk Python-to-WASM conversion.
