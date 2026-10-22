function textFrom(payload) {
  return String(payload?.response || payload?.onyxReply || payload?.text || payload?.message?.content || "").trim();
}

export class LLMVerificationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "LLMVerificationError";
    this.code = "ONYX_LLM_NOT_VERIFIED";
    this.details = details;
  }
}

export function inspectBackendLLMHealth(payload) {
  const brain = payload?.aiBrain || payload?.health?.aiBrain || payload?.contract?.aiBrain || null;
  const configured = Boolean(payload?.ok !== false && brain?.ok !== false && brain?.configured === true);
  return Object.freeze({
    schema: "onyx.llm-verification.v1",
    provider: "ourspace-ai-brain",
    configured,
    verified: configured,
    verificationLevel: "live-provider-configuration",
    proof: "onyx.health.aiBrain.configured",
    providerVersion: String(brain?.version || ""),
    checkedAt: new Date().toISOString()
  });
}

export function verifyBackendCompletion(payload) {
  const response = textFrom(payload);
  if (payload?.ok === false || payload?.aiBrain !== true || !response) {
    throw new LLMVerificationError("The OurSpace backend did not prove that this response came from its AI Brain.", {
      provider: "ourspace-ai-brain",
      ok: payload?.ok !== false,
      aiBrain: payload?.aiBrain === true,
      responsePresent: Boolean(response)
    });
  }
  return Object.freeze({
    schema: "onyx.llm-verification.v1",
    provider: "ourspace-ai-brain",
    configured: true,
    verified: true,
    verificationLevel: "model-completion",
    proof: "onyx.chat.aiBrain",
    responseId: String(payload.responseId || ""),
    toolRounds: Number(payload.toolRounds || 0),
    checkedAt: new Date().toISOString()
  });
}

export function verifyOllamaHealth(payload, configuredModel) {
  const wanted = String(configuredModel || "").trim();
  const names = (payload?.models || []).flatMap(model => [model?.name, model?.model]).filter(Boolean).map(String);
  const installed = Boolean(wanted && names.some(name => name === wanted || name.split(":")[0] === wanted.split(":")[0]));
  if (payload?.ok !== true || !installed) {
    throw new LLMVerificationError("The configured Ollama model is not available from the live Ollama API.", {
      provider: "ollama",
      model: wanted,
      endpointReachable: payload?.ok === true,
      installed
    });
  }
  return Object.freeze({
    schema: "onyx.llm-verification.v1",
    provider: "ollama",
    configured: true,
    verified: true,
    verificationLevel: "live-provider-configuration",
    proof: "ollama.api.tags",
    model: wanted,
    checkedAt: new Date().toISOString()
  });
}

export function verifyOllamaCompletion(payload) {
  const response = textFrom(payload);
  const model = String(payload?.model || "").trim();
  if (payload?.ok !== true || payload?.provider !== "ollama" || !model || !response) {
    throw new LLMVerificationError("Ollama did not return a verifiable model completion.", {
      provider: "ollama",
      ok: payload?.ok === true,
      modelPresent: Boolean(model),
      responsePresent: Boolean(response)
    });
  }
  return Object.freeze({
    schema: "onyx.llm-verification.v1",
    provider: "ollama",
    configured: true,
    verified: true,
    verificationLevel: "model-completion",
    proof: "ollama.api.chat",
    model,
    doneReason: String(payload.doneReason || ""),
    checkedAt: new Date().toISOString()
  });
}

export default Object.freeze({
  inspectBackendLLMHealth,
  verifyBackendCompletion,
  verifyOllamaHealth,
  verifyOllamaCompletion
});
