/*
 * OurSpace -> existing Onyx repository brain adapter.
 * Keeps the current authenticated backend and private profile contracts unchanged.
 */
// The upstream repository module is optional and was not present in either input ZIP.
// Keep the existing backend client working when this separate repository is absent.
let OnyxCore=null;
// This is a classic <script>, not a module: do not use top-level await.
// The sibling Onyx brain is optional; the authenticated backend remains primary.
(async()=>{
 try {
   const source=await import('../../Onyx/script/js/onyx/onyx-core/index.js');
   OnyxCore=source?.OnyxCore||source?.default||null;
 } catch(_) { /* Keep normal support/DBT/work chat connected to the backend. */ }
 window.dispatchEvent(new CustomEvent('onyx:repository-brain-ready',{
   detail:{source:'LifeHelpers/Onyx',available:Boolean(OnyxCore)}
 }));
})();


const config = Object.freeze({
  schema: "ourspace.onyx.repository-bridge.v1",
  source: "LifeHelpers/Onyx",
  maxSources: 3,
  maxTotalChars: 12000
});

async function enrich(payload = {}, options = {}) {
  const message = String(payload.message || payload.text || "").trim();
  if (!message || options.signal?.aborted || !OnyxCore) return payload;

  const plan = await OnyxCore.createCapabilityPlan({
    message,
    surface: payload.surface === "virtual" ? "virtual" : "core",
    lane: payload.lane,
    listenOnly: payload.listenOnly === true,
    webSearch: payload.webSearch === true,
    useDrive: payload.useDrive === true,
    allowWrites: payload.allowWrites === true,
    allowAssetGeneration: payload.allowAssetGeneration === true,
    autoRemember: payload.autoRemember === true,
    reasoningEffort: payload.reasoningEffort,
    maxOutputTokens: payload.maxOutputTokens
  });

  const sources = await OnyxCore.loadBrainSources(
    message, plan.domains,
    { maxSources: config.maxSources, maxTotalChars: config.maxTotalChars }
  );
  if (options.signal?.aborted) return payload;

  const references = Array.isArray(payload.references) ? payload.references.slice() : [];
  const sourcePaths = [];
  for (const source of sources) {
    if (!source?.text ||
        references.some(ref => ref.path === source.path || ref.name === "Onyx corpus: " + source.path)) continue;
    sourcePaths.push(source.path);
    references.push({
      name: "Onyx corpus: " + source.path,
      path: source.path,
      mimeType: "text/plain",
      text: source.text
    });
  }

  return {
    ...payload,
    references: references.slice(0, 32),
    context: {
      ...(payload.context && typeof payload.context === "object" ? payload.context : {}),
      repositoryBrain: {
        schema: config.schema,
        repository: config.source,
        domains: plan.domains.map(domain => domain.id),
        intents: plan.intents,
        sourcePaths,
        readOnly: true
      }
    }
  };
}

window.OnyxRepositoryBridge = Object.freeze({
  config,
  enrich,
  get core(){return OnyxCore;},
  status: () => OnyxCore?.status?.() || {available:false,reason:'Optional repository brain is not bundled; existing OurSpace backend remains unchanged.'}
});

