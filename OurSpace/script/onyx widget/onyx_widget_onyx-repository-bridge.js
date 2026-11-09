import {chatWithSocialRepair} from "./response-generator/reply-quality-bridge.js";

/*
 * OurSpace interface -> canonical LifeHelpers/Onyx brain.
 * Presentation, Professor, Work, Leisure, and games stay in OurSpace.
 * Only the authenticated backend may supply private personality/profile data.
 */
let OnyxCore = null;
let loadError = "";
try {
  // From OurSpace/script/onyx widget/ up to repository root, then Onyx/.
  const module = await import("../../../Onyx/script/js/onyx/onyx-core/index.js");
  OnyxCore = module.default || module.OnyxCore || null;
} catch (error) {
  loadError = String(error?.message || error || "Onyx brain could not load.");
  console.warn("Onyx repository brain is unavailable:", loadError);
}

const config = Object.freeze({
  schema: "ourspace.onyx.repository-bridge.v2",
  source: "LifeHelpers/Onyx",
  brainModule: "Onyx/script/js/onyx/onyx-core/index.js",
  surfaces: Object.freeze(["health", "virtual", "leisure", "work", "professor", "game"]),
  privateContext: "authenticated-backend-only"
});

function status() {
  const state = OnyxCore?.status?.() || {};
  return {
    ...state,
    available: !!OnyxCore,
    source: config.source,
    brainModule: config.brainModule,
    error: loadError || "",
    authenticated: Boolean(state.authenticated),
    profileKey: state.profileKey || "shared"
  };
}

function cleanContext(input, lane) {
  const context = input.context && typeof input.context === "object" && !Array.isArray(input.context)
    ? { ...input.context }
    : (typeof input.context === "string" ? { additionalGuidance: input.context.slice(0, 12000) } : {});
  // UI identity describes the consuming surface; the authenticated session
  // still determines which private profile and relationship rules are active.
  const surface = ["health", "virtual", "leisure", "work", "professor", "game"].includes(lane) ? lane : "health";
  return {
    ...context,
    caller: "OurSpace Onyx widget",
    interfaceSurface: surface,
    conversationLane: surface,
    ...(typeof input.supportMode === "string" ? { requestedSupportMode: input.supportMode } : {}),
    ...(typeof input.chatMode === "string" ? { requestedChatMode: input.chatMode } : {}),
    ...(input.listenOnly === true ? { listenOnly: true } : {})
  };
}

async function chat(payload = {}, options = {}) {
  if (!OnyxCore) throw new Error("Onyx's repository brain could not load. " + (loadError || "Refresh OurSpace and try again."));
  const message = String(payload.message || payload.text || "").trim();
  if (!message) throw new Error("Onyx needs a message.");
  const lane = String(payload.lane || payload.context?.tabLane || payload.context?.lane ||
    payload.context?.interfaceSurface || (payload.supportMode === "dbt" ? "professor" : "health")).toLowerCase();
  const coreInput = {
    message,
    surface: "core", // Onyx owns one brain, not a second game/virtual brain.
    lane,
    history: Array.isArray(payload.history) ? payload.history : [],
    references: Array.isArray(payload.references) ? payload.references : [],
    attachments: Array.isArray(payload.attachments) ? payload.attachments : [],
    context: cleanContext(payload, lane),
    threadId: String(payload.threadId || ""),
    aiSessionId: String(payload.aiSessionId || payload.sessionId || ""),
    listenOnly: payload.listenOnly === true || payload.responseIntent === "listen_only",
    responseIntent: String(payload.responseIntent || ""),
    supportMode: String(payload.supportMode || ""),
    chatMode: String(payload.chatMode || ""),
    mode: String(payload.mode || ""),
    mood: String(payload.mood || ""),
    memoryClass: String(payload.memoryClass || ""),
    memoryPolicy: String(payload.memoryPolicy || "auto"),
    webSearch: payload.webSearch === true,
    useDrive: payload.useDrive === true,
    ...(typeof payload.allowWrites === "boolean" ? { allowWrites: payload.allowWrites } : {}),
    ...(typeof payload.allowAssetGeneration === "boolean" ? { allowAssetGeneration: payload.allowAssetGeneration } : {}),
    ...(typeof payload.allowExternalTools === "boolean" ? { allowExternalTools: payload.allowExternalTools } : {}),
    autoRemember: payload.autoRemember === true,
    reasoningEffort: payload.reasoningEffort || "medium",
    maxOutputTokens: payload.maxOutputTokens || 1800,
    timeoutMs: options.timeoutMs || options.timeout || payload.timeoutMs,
    signal: options.signal || payload.signal
  };
  // The core retrieves Onyx corpus guides, sends one authenticated onyx.chat,
  // then verifies both real AI completion and the backend's personality/profile proof.
  // One voice-enrichment pass for Work, Leisure, Virtual & Health, and Professor.
  // Any unavailable corpus silently falls back to the canonical Onyx brain.
  const prepared = await (window.OnyxVoiceContext?.enrich?.(coreInput, lane) ||
    Promise.resolve(window.OnyxVoiceContext?.decorate?.(coreInput, lane) || coreInput));
  const inspector = window.OnyxVoiceContext?.inspectReply;
  if (typeof inspector !== "function") return OnyxCore.chat(prepared);
  return chatWithSocialRepair(prepared, {
    chat: request => OnyxCore.chat(request),
    inspectReply: (...args) => window.OnyxVoiceContext.inspectReply(...args),
    options: { signal: options.signal || payload.signal }
  });
}

async function enrich(payload = {}, options = {}) {
  // Older integrations can request the canonical planner without duplicating
  // corpus references: OnyxCore.chat() already loads them once.
  if (!OnyxCore || options.signal?.aborted || !String(payload.message || payload.text || "").trim()) return payload;
  const plan = await OnyxCore.createCapabilityPlan(payload);
  return {
    ...payload,
    context: {
      ...cleanContext(payload, String(payload.lane || payload.context?.tabLane || "health")),
      repositoryBrain: { schema: config.schema, repository: config.source,
        domains: plan.domains.map(domain => domain.id), intents: plan.intents, readOnly: true }
    }
  };
}

window.OnyxRepositoryBridge = Object.freeze({ config, core: OnyxCore, chat, enrich, status });
window.dispatchEvent(new CustomEvent("onyx:repository-brain-ready", {
  detail: { source: config.source, available: !!OnyxCore, error: loadError || "" }
}));
