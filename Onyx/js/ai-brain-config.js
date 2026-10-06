export const AI_BRAIN_CONFIG = Object.freeze({
  schemaVersion: "4.0-onyx-js-modules",
  githubOwner: "tyrannosaurusdm92",
  githubRepo: "LifeHelpers",
  githubBranch: "main",
  brainPath: "Onyx",
  dataIndexPath: "./knowledge-index.js",
  backendUrl: "https://script.google.com/macros/s/AKfycbwxviV1hERFKIivY5we5W1gVMqfsH6DNY0mNZkEs2SXcoa4gDM88c14tIyraytnSAyKvQ/exec",
  application: "OurSpace",
  module: "Onyx",
  chatAction: "onyx.chat",
  historyAction: "onyx.chat.history",
  maxShards: 8,
  maxContextRecords: 24,
  maxContextChars: 90000,
  publicSurface: "authenticated Onyx module through existing OurSpace backend"
});
if (typeof globalThis !== "undefined") globalThis.AI_BRAIN_CONFIG = AI_BRAIN_CONFIG;
