# Referenced Google Drive materials (pass 2)

Drive folder: https://drive.google.com/drive/folders/1BUXfq9K9Rtevg9V0J0QH6ZikZxghIOgw

The folder was accessed via the authorized Google Drive connector. Its direct children include substantial third-party AI-project archives (AutoGPT, MetaGPT, vLLM, Transformers, OpenHands, Ollama, open-webui, langchain, etc.). The following were actually downloaded and inspected as architectural references:

1. `learn-claude-code-main.zip` (source: https://drive.google.com/file/d/1nVAfhKSfckketxzk-hoTX3zAkMR8sr_P/view). README and `agents/s06_context_compact.py` reviewed for conversation-history compaction, agent/model separation, tool-result restraint. Its Python sample was **not** copied, executed in the shipped program, or presented as a valid WebAssembly conversion. Concepts were independently implemented in JavaScript.
2. `open-webui-main.zip` (https://drive.google.com/file/d/1UJv2UOKRCVG_PvoRDORYZMkl8sZ4JBwp/view). Root README and licensing reviewed as reference for model-vs-interface separation; no source was copied or bundled. The project's license has conditions and does not authorize arbitrary uncredited inclusion.
3. `LLMs-from-scratch-main.zip` (https://drive.google.com/file/d/1ADYlZ980alFOx4asa5Nr0jK0vPksD7Mh/view). README reviewed to distinguish real weight training from prompt/retrieval harness engineering; no Python, PyTorch, trained weights or dependencies bundled.

Other listed archives were not unpacked, converted to WebAssembly or imported. Their presence in Drive is not evidence of a working local LLM. These sources are not included in the distributed ZIP; no 10–30 MB third-party “padding” was added.

## Source hierarchy

* User-supplied `Onyx_Full_Personality_Dossier_9_Moods_10000_Work_Leisure_Responses_2026-11-08(2).txt` remains definitive for Onyx canon; the dated pass-2 appendix is supplied separately.
* User-supplied `Eight_Historical_and_Contemporary_Personality_Dossiers_100000_Words(4).txt` informs eight **thought facets**, not imitations or additional moods.
* User-supplied generator ZIP was used as the code base. Existing folder layout, 10,000 exemplars and functional unit tests were preserved.
* Gemini API and Apps Script implementation details are documented in Google's official references, but this bundle deliberately delegates model calls to the preexisting Apps Script backend.
