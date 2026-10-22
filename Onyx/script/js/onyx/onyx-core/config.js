export const ONYX_BACKEND_URL = "https://script.google.com/macros/s/AKfycbwxviV1hERFKIivY5we5W1gVMqfsH6DNY0mNZkEs2SXcoa4gDM88c14tIyraytnSAyKvQ/exec";

export const ONYX_ACTIONS = Object.freeze({
  health: "onyx.health",
  capabilities: "onyx.ai.capabilities",
  chat: "onyx.chat",
  history: "onyx.chat.history",
  webSearch: "onyx.ai.web.search",
  urlFetch: "onyx.ai.url.fetch",
  fileParse: "onyx.ai.file.parse",
  fileArchive: "onyx.ai.file.archive",
  fileUpload: "onyx.ai.file.upload",
  imageGenerate: "onyx.ai.image.generate",
  petGet: "onyx.pet.state.get",
  petSave: "onyx.pet.state.save"
});

export const ONYX_CORE_CONFIG = Object.freeze({
  schema: "onyx.unified-core.v1",
  version: "1.1.0",
  backendUrl: ONYX_BACKEND_URL,
  application: "OurSpace",
  module: "Onyx",
  workspaceId: "ourspace",
  projectId: "ourspace-onyx",
  defaultProvider: "ourspace-ai-brain",
  surfaces: Object.freeze({
    core: Object.freeze(["chat", "work", "writing", "coding", "ideas", "research"]),
    virtual: Object.freeze(["happy-home", "virtual-pet", "game"])
  }),
  privacy: Object.freeze({
    sessionTokens: "memory-only-or-existing-host-bridge",
    privateProfileContext: "backend-only",
    otherProfileContext: "never-requested",
    personalityDossier: "server-side-authoritative",
    clientCredentials: "never-in-frontend"
  }),
  limits: Object.freeze({
    timeoutMs: 70000,
    uploadBytes: 25000 * 1024,
    historyTurns: 40,
    agentSteps: 6,
    generatedImages: 4
  }),
  donorArchitecture: Object.freeze({
    ollama: "optional-explicit-local-model-adapter",
    autoGpt: "bounded-plan-execute-verify-orchestration",
    onyxCorpus: "domain-routed-local-index-plus-backend-retrieval"
  }),
  assurance: Object.freeze({
    successfulRepliesRequireModelProof: true,
    retrievalOnlyOutputIsNeverAChatReply: true,
    scriptedFallbackMayReportErrorsOnly: true
  })
});

export default ONYX_CORE_CONFIG;

