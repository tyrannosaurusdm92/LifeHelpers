/*
 * OurSpace -> existing Onyx repository brain adapter.
 * Keeps the current authenticated backend and private profile contracts unchanged.
 */
import OnyxCore from "../../../../Onyx/script/js/onyx/onyx-core/index.js";

const config = Object.freeze({
  schema: "ourspace.onyx.repository-bridge.v1",
  source: "LifeHelpers/Onyx",
  maxSources: 3,
  maxTotalChars: 12000
});

async function enrich(payload = {}, options = {}) {
  const message = String(payload.message || payload.text || "").trim();
  if (!message || options.signal?.aborted) return payload;

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
  core: OnyxCore,
  status: () => OnyxCore.status()
});
window.dispatchEvent(new CustomEvent(
  "onyx:repository-brain-ready",
  { detail: { source: config.source } }
));
