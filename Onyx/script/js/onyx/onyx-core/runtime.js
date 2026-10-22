import { ONYX_ACTIONS, ONYX_CORE_CONFIG } from "./config.js";
import { personalityPrompt, ONYX_PUBLIC_PERSONALITY } from "./personality-contract.js";
import { createCapabilityPlan } from "./capability-router.js";
import { loadDomainGuides, loadBrainSources } from "./brain-registry.js";
import { OnyxTransport, publicError } from "./transport.js";
import { OnyxToolRegistry, extractArtifacts } from "./tool-registry.js";
import { OllamaProvider } from "./ollama-provider.js";
import { BoundedAgent } from "./bounded-agent.js";
import { inspectBackendLLMHealth, verifyBackendCompletion, verifyOllamaHealth, verifyOllamaCompletion, LLMVerificationError } from "./llm-verifier.js";
import { profileContinuityContext, verifyProfileCompletion } from "./profile-verifier.js";

const MAX_GUIDE_TEXT = 6000;
const MAX_REFERENCE_TEXT = 24000;

function normalizeHistory(history, limit = ONYX_CORE_CONFIG.limits.historyTurns) {
  return (Array.isArray(history) ? history : [])
    .filter(row => row && ["user", "assistant", "system", "tool"].includes(row.role))
    .slice(-limit)
    .map(row => ({ role: row.role, content: String(row.content || row.text || "").slice(0, 12000) }));
}

function compactJson(value, limit = MAX_GUIDE_TEXT) {
  const seen = new WeakSet();
  try {
    const text = JSON.stringify(value, (key, current) => {
      if (typeof current === "function") return `[function ${current.name || key || "anonymous"}]`;
      if (typeof current === "bigint") return String(current);
      if (current && typeof current === "object") {
        if (seen.has(current)) return "[circular]";
        seen.add(current);
      }
      return current;
    });
    return String(text || "").slice(0, limit);
  } catch {
    return String(value || "").slice(0, limit);
  }
}

function referenceText(payload) {
  const candidates = [payload?.response, payload?.text, payload?.content, payload?.summary, payload?.result?.response, payload?.result?.text];
  const direct = candidates.find(value => typeof value === "string" && value.trim());
  return direct ? direct.slice(0, MAX_REFERENCE_TEXT) : compactJson(payload, MAX_REFERENCE_TEXT);
}

function responseText(payload) {
  return String(payload?.response || payload?.onyxReply || payload?.text || payload?.result?.response || payload?.message?.content || "").trim();
}

function normalizedResult(payload, extra = {}) {
  const response = responseText(payload);
  return {
    ...payload,
    ...extra,
    ok: payload?.ok !== false,
    response,
    onyxReply: response,
    artifacts: Array.isArray(extra.artifacts) ? extra.artifacts : extractArtifacts(payload),
    raw: payload
  };
}

function threadId(transport, requested) {
  const explicit = String(requested || "").replace(/[^a-z0-9._:-]/gi, "-").slice(0, 120);
  return explicit || `ourspace-onyx-${transport.profileKey}`;
}

function uniqueReferences(references) {
  const seen = new Set();
  return (references || []).filter(reference => {
    if (!reference || typeof reference !== "object") return false;
    const key = `${reference.name || "reference"}|${reference.fileId || ""}|${String(reference.text || "").slice(0, 120)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 16);
}

export class OnyxRuntime {
  #llmStatus = Object.freeze({
    schema: "onyx.llm-verification.v1",
    provider: "ourspace-ai-brain",
    configured: false,
    verified: false,
    verificationLevel: "none",
    proof: "not-checked",
    checkedAt: ""
  });
  #profileStatus = Object.freeze({
    schema: "onyx.profile-verification.v1",
    verified: false,
    profileKey: "shared",
    proof: "not-checked",
    checkedAt: ""
  });

  constructor(options = {}) {
    this.config = ONYX_CORE_CONFIG;
    this.transport = options.transport || new OnyxTransport(options.transportOptions);
    this.tools = options.tools || new OnyxToolRegistry(this.transport);
    this.ollama = options.ollama || new OllamaProvider(options.ollamaOptions);
    this.agent = options.agent || new BoundedAgent({ maxSteps: ONYX_CORE_CONFIG.limits.agentSteps });
  }

  setAuthContext(context) { return this.transport.setAuthContext(context); }
  clearAuthContext() { return this.transport.clearAuthContext(); }
  subscribe(listener) { return this.transport.subscribe(listener); }
  status() { return { ...this.transport.snapshot(), ollama: this.ollama.snapshot(), llm: this.#llmStatus, profile: this.#profileStatus }; }
  configureOllama(options) { return this.ollama.configure(options); }

  async connect({ includeCapabilities = true, requireLLM = true, signal } = {}) {
    const health = await this.transport.health({ signal });
    const llm = inspectBackendLLMHealth(health);
    this.#llmStatus = llm;
    if (requireLLM && !llm.verified) throw new LLMVerificationError("The existing OurSpace backend is online, but its AI Brain is not configured.", llm);
    let capabilities = null;
    if (includeCapabilities && this.transport.authenticated) capabilities = await this.transport.capabilities({ signal });
    return { ok: true, health, capabilities, llm, status: this.status() };
  }

  async verifyLLM({ provider = "ourspace-ai-brain", runProbe = false, signal } = {}) {
    if (provider === "ollama") {
      const health = await this.ollama.health({ signal });
      const proof = verifyOllamaHealth(health, this.ollama.snapshot().model);
      this.#llmStatus = proof;
      if (!runProbe) return proof;
      const completion = await this.chat({
        message: "Reply exactly: Onyx LLM verified.",
        provider: "ollama",
        autoRemember: false,
        webSearch: false,
        maxOutputTokens: 40,
        signal
      });
      return completion.llmVerification;
    }
    const connection = await this.connect({ includeCapabilities: true, requireLLM: true, signal });
    if (!runProbe) return connection.llm;
    if (!this.transport.authenticated) throw new LLMVerificationError("An authenticated OurSpace session is required for a completion probe.", connection.llm);
    const completion = await this.chat({
      message: "Reply exactly: Onyx LLM verified.",
      autoRemember: false,
      webSearch: false,
      useDrive: false,
      allowWrites: false,
      allowExternalTools: false,
      maxOutputTokens: 40,
      signal
    });
    return completion.llmVerification;
  }

  async #domainReferences(plan) {
    const guides = await loadDomainGuides(plan.domains, { maxGuides: 8 });
    return guides.map(guide => ({
      name: `Onyx brain guide: ${guide.domain}`,
      mimeType: "application/json",
      source: `Onyx/js/${guide.path}`,
      text: compactJson(guide.value)
    })).filter(reference => reference.text);
  }

  async #corpusReferences(plan) {
    const sources = await loadBrainSources(plan.message, plan.domains, {
      maxSources: 4,
      maxFileBytes: 600000,
      maxTotalChars: MAX_REFERENCE_TEXT
    });
    return sources.map(source => ({
      name: `Onyx corpus: ${source.path}`,
      mimeType: source.path.endsWith(".md") ? "text/markdown" : "text/javascript",
      source: `Onyx/js/${source.path}`,
      text: source.text,
      truncated: source.truncated
    }));
  }

  async #attachmentReferences(input, plan) {
    const references = [];
    const artifacts = [];
    for (const attachment of (input.attachments || []).slice(0, 4)) {
      try {
        let fileId = typeof attachment === "string" ? attachment : String(attachment?.fileId || "");
        if (!fileId && typeof Blob !== "undefined" && attachment instanceof Blob) {
          const uploaded = await this.tools.fileUpload(attachment, {
            signal: input.signal,
            purpose: `Onyx ${plan.surface} attachment`
          });
          artifacts.push(...extractArtifacts(uploaded));
          fileId = String(uploaded.fileId || uploaded.file?.fileId || uploaded.assetId || "");
        }
        if (!fileId) continue;
        const parsed = await this.tools.fileParse(fileId, {
          signal: input.signal,
          instructions: `Read this attachment for the current ${plan.intents.join(", ")} request.`,
          reasoningEffort: plan.reasoningEffort,
          maxOutputTokens: Math.min(plan.maxOutputTokens, 2200)
        });
        references.push({
          name: String(attachment?.name || parsed.fileName || `attachment-${references.length + 1}`),
          mimeType: String(attachment?.type || parsed.mimeType || "text/plain"),
          fileId,
          text: referenceText(parsed)
        });
      } catch (error) {
        references.push({
          name: String(attachment?.name || "attachment"),
          mimeType: "text/plain",
          text: `Attachment could not be read: ${publicError(error)}`
        });
      }
    }
    return { references, artifacts };
  }

  async #prepare(input, plan) {
    const callerReferences = (input.references || []).map((reference, index) => typeof reference === "string"
      ? { name: `reference-${index + 1}`, mimeType: "text/plain", text: reference.slice(0, MAX_REFERENCE_TEXT) }
      : reference);
    const [domainReferences, corpusReferences, attachments] = await Promise.all([
      this.#domainReferences(plan),
      this.#corpusReferences(plan),
      this.#attachmentReferences(input, plan)
    ]);
    return {
      references: uniqueReferences([...callerReferences, ...domainReferences, ...corpusReferences, ...attachments.references]),
      artifacts: attachments.artifacts
    };
  }

  async chat(input = {}) {
    const plan = input.plan || await createCapabilityPlan(input);
    const prepared = await this.#prepare(input, plan);
    if (plan.provider === "ollama") {
      const local = await this.ollama.chat({
        system: personalityPrompt(plan.surface),
        messages: [
          ...normalizeHistory(input.history),
          ...(prepared.references.length ? [{
            role: "system",
            content: `Relevant public Onyx brain guides and user-provided references:\n${prepared.references.map(item => `${item.name}: ${item.text}`).join("\n\n")}`.slice(0, 32000)
          }] : []),
          { role: "user", content: plan.message }
        ],
        options: input.modelOptions || {}
      }, { signal: input.signal });
      const llmVerification = verifyOllamaCompletion(local);
      this.#llmStatus = llmVerification;
      const profileVerification = Object.freeze({
        schema: "onyx.profile-verification.v1",
        verified: false,
        profileKey: "shared",
        proof: "local-provider-does-not-receive-private-profile-context",
        checkedAt: new Date().toISOString()
      });
      this.#profileStatus = profileVerification;
      return normalizedResult(local, {
        provider: "ollama",
        llmVerified: true,
        llmVerification,
        profileVerified: false,
        profileVerification,
        plan,
        continuity: "local-session-only",
        artifacts: prepared.artifacts,
        privacy: { backendProfileContextShared: false }
      });
    }

    const expectedProfileKey = this.transport.profileKey;
    const profileContext = profileContinuityContext(expectedProfileKey);

    const result = await this.transport.request(ONYX_ACTIONS.chat, {
      message: plan.message,
      history: normalizeHistory(input.history),
      references: prepared.references,
      context: {
        ...(input.context || {}),
        application: "OurSpace",
        module: "Onyx",
        surface: plan.surface,
        destination: plan.destination,
        intents: plan.intents,
        domains: plan.domains.map(domain => domain.id),
        personalityContract: ONYX_PUBLIC_PERSONALITY.schema,
        profileContinuity: profileContext,
        unifiedBrainRuntime: ONYX_CORE_CONFIG.schema
      },
      webSearch: plan.permissions.webSearch,
      useDrive: plan.permissions.useDrive,
      allowWrites: plan.permissions.allowWrites && !plan.requiresExplicitWriteConfirmation,
      allowAssetGeneration: plan.permissions.allowAssetGeneration,
      allowExternalTools: plan.permissions.allowExternalTools,
      allowGlobalDrive: plan.permissions.allowGlobalDrive,
      autoRemember: plan.permissions.autoRemember,
      reasoningEffort: plan.reasoningEffort,
      maxOutputTokens: plan.maxOutputTokens,
      threadId: threadId(this.transport, input.threadId),
      sessionId: String(input.aiSessionId || input.sessionId || ""),
      useBrain: true,
      ai: true
    }, { signal: input.signal, timeoutMs: input.timeoutMs });

    const llmVerification = verifyBackendCompletion(result);
    let profileVerification;
    try {
      profileVerification = verifyProfileCompletion(result, expectedProfileKey);
    } catch (error) {
      this.#profileStatus = Object.freeze({
        schema: "onyx.profile-verification.v1",
        verified: false,
        profileKey: "blocked",
        proof: error?.code || "profile-verification-failed",
        checkedAt: new Date().toISOString()
      });
      throw error;
    }
    this.#llmStatus = llmVerification;
    this.#profileStatus = profileVerification;

    return normalizedResult(result, {
      provider: "ourspace-ai-brain",
      llmVerified: true,
      llmVerification,
      profileVerified: true,
      profileVerification,
      plan,
      artifacts: [...prepared.artifacts, ...extractArtifacts(result)],
      continuity: "backend-profile-scoped"
    });
  }

  async runAgent(goal, input = {}) {
    const basePlan = await createCapabilityPlan({ ...input, message: goal });
    const queue = basePlan.urls.map(url => ({ tool: "urlFetch", args: { url }, write: false }));
    queue.push({ tool: "chat", args: {}, write: false, final: true });
    return this.agent.run(goal, {
      signal: input.signal,
      writeConfirmed: input.writeConfirmed === true,
      plan: ({ index }) => queue[index] || null,
      execute: async (step, state) => {
        if (step.tool === "urlFetch") {
          const result = await this.tools.urlFetch(step.args.url, { signal: input.signal });
          return { kind: "url", url: step.args.url, text: referenceText(result), raw: result };
        }
        const gathered = state.observations.filter(item => item?.kind === "url").map(item => ({
          name: item.url,
          mimeType: "text/plain",
          url: item.url,
          text: item.text
        }));
        return this.chat({ ...input, message: goal, plan: basePlan, references: [...(input.references || []), ...gathered] });
      },
      verify: state => ({ ok: Boolean(responseText(state.result)), responsePresent: Boolean(responseText(state.result)) })
    });
  }
}

export { normalizeHistory, responseText };
export default OnyxRuntime;

