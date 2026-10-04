export const AI_BRAIN_CONFIG = Object.freeze({
  schemaVersion: "3.4-ourspace-onyx-corpus",
  githubOwner: "tyrannosaurusdm92",
  githubRepo: "LifeHelpers",
  githubBranch: "main",
  brainPath: "Onyx",
  pagesBase: new URL("../", import.meta.url).href,
  catalogPath: "json/core/shard-catalog.json",
  routesPath: "json/core/source-intent-routes.json",
  capabilityPath: "json/core/capability-registry.json",
  healthPolicyPath: "json/core/health-retrieval-policy.json",
  backendUrl: "https://script.google.com/macros/s/AKfycbwxviV1hERFKIivY5we5W1gVMqfsH6DNY0mNZkEs2SXcoa4gDM88c14tIyraytnSAyKvQ/exec",
  application: "OurSpace",
  module: "Onyx",
  chatAction: "onyx.chat",
  historyAction: "onyx.chat.history",
  maxShards: 8,
  maxContextRecords: 24,
  maxContextChars: 90000,
  publicSurface: "authenticated Onyx module through existing OurSpace backend",
  upstreamCorpusUrl: "https://github.com/tyrannosaurusdm92/An_Admins_Place/tree/main/AI-Brain",
  onyxCorpusUrl: "https://github.com/tyrannosaurusdm92/LifeHelpers/tree/main/Onyx"
});
if (typeof globalThis !== "undefined") globalThis.AI_BRAIN_CONFIG = AI_BRAIN_CONFIG;
