const DATA_FILES = ["001-ai-brain-creative-packs-pt1.js","002-ai-brain-creative-packs-pt2.js","003-ai-brain-creative-packs-pt3.js","004-ai-brain-creative-packs-pt4.js","005-ai-brain-creative-atlas-pt1.js","006-ai-brain-creative-atlas-pt2.js","007-ai-brain-creative-atlas-pt3.js","008-ai-brain-creative-atlas-pt4.js","009-ai-brain-creative-packs-pt1.js","010-ai-brain-creative-packs-pt2.js","011-ai-brain-creative-packs-pt3.js","012-ai-brain-creative-packs-pt4.js","013-ai-brain-creative-packs-pt5.js","014-ai-brain-creative-packs-pt6.js","015-ai-brain-creative-packs-pt7.js","016-ai-brain-creative-packs-pt8.js","017-ai-brain-creative-packs-pt9.js","018-ai-brain-creative-packs-pt10.js","019-ai-brain-creative-expansion_packs-pt1.js","020-ai-brain-creative-expansion_packs-pt2.js","021-ai-brain-creative-expansion_packs-pt3.js","022-ai-brain-creative-expansion_packs-pt4.js","023-ai-brain-creative-packs-pt1.js","024-ai-brain-creative-packs-pt2.js","025-ai-brain-world-model-atlas-pt1.js","026-ai-brain-world-model-atlas-pt1.js","027-ai-brain-world-model-atlas-pt2.js","028-ai-brain-world-model-atlas-pt3.js","029-ai-brain-world-model-atlas-pt4.js","030-ai-brain-world-model-atlas-pt5.js","031-ai-brain-world-model-atlas-pt6.js","032-ai-brain-world-model-atlas-pt7.js","033-ai-brain-world-model-atlas-pt8.js","034-ai-brain-world-model-atlas-pt9.js","035-ai-brain-world-model-atlas-pt10.js","036-ai-brain-world-model-atlas-pt11.js","037-ai-brain-world-model-research_packs-pt1.js","038-ai-brain-world-model-research_packs-pt2.js","039-ai-brain-world-model-research_packs-pt3.js","040-ai-brain-world-model-research_packs-pt4.js","041-ai-brain-world-model-packs-pt1.js","042-ai-brain-world-model-packs-pt1.js","043-ai-brain-world-model-packs-pt2.js","044-ai-brain-world-model-packs-pt1.js","045-ai-brain-world-model-packs-pt2.js"];
const RUNTIME_FILES = ["ai-brain-persona.js","ai-brain-safety.js","ai-brain-memory.js","ai-brain-world-model.js","ai-brain-retrieval.js","context-assembler.js","context-composer.js","ai-brain-core.js","ai-brain-provider-bridge.js","ai-brain-creative.pt1.js","ai-brain-creative.pt2.js","ai-brain-router.js","ai-brain-index.js","debug-trace.js"];
let writerHelperPromise;
function loadClassic(relativePath) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = false;
    script.src = new URL(relativePath, import.meta.url).href;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load Writer Helper module: ' + relativePath));
    document.head.appendChild(script);
  });
}
export function loadWriterHelper() {
  if (!writerHelperPromise) writerHelperPromise = (async () => {
    for (const file of DATA_FILES) await loadClassic('./data/' + file);
    for (const file of RUNTIME_FILES) await loadClassic('./runtime/' + file);
    const api = globalThis.WriterHelperReady;
    if (!api) throw new Error('Writer Helper runtime failed to register.');
    globalThis.OnyxWriterHelper = api;
    return api;
  })();
  return writerHelperPromise;
}
export default loadWriterHelper;
