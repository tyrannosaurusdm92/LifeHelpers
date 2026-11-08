# Third-party notices for the Onyx unified brain runtime

No third-party source code is vendored by this integration. The new files are original glue code that interoperates with or adapts architectural ideas from the following projects.

## Ollama

- Project: Ollama
- Source: <https://github.com/ollama/ollama>
- License: MIT
- Use here: optional HTTP-compatible local-model adapter; disabled by default. Ollama itself is not bundled.

## AutoGPT Classic concepts

- Project: AutoGPT
- Source: <https://github.com/Significant-Gravitas/AutoGPT>
- License boundary reviewed from the supplied source snapshot.
- Use here: original bounded plan/execute/verify orchestration inspired by common agent-loop concepts. The AutoGPT Platform and its Polyform Shield-licensed implementation are not copied or bundled.

## Existing Onyx corpus

The existing `Onyx/js/` knowledge corpus remains in its original repository locations. The integration adds a domain registry and dynamic guide loader; it does not duplicate or relicense that corpus.


## Supplied repository reference set

The user-supplied Drive repository archives were inventoried and their README, notices, and file listings reviewed. Relevant architectural patterns are summarized in `Onyx/json/shared/onyx-core/donor-architecture-map.json`. This is a reference map, not vendored code. Existing Gemini/AI-Brain service remains the generation and durable-memory provider. One Drive archive could not be downloaded because Drive returned a malware/spam block; its public repository README was reviewed instead.
