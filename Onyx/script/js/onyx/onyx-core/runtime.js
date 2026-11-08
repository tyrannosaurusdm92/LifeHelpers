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
import { OnyxMemory } from "./memory.js";

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

function safeCitationUrl(value) {
  try {
    const url = new URL(String(value || ""));
    if (!/^https?:$/i.test(url.protocol) || url.username || url.password) return "";
    for (const key of [...url.searchParams.keys()]) {
      if (/(?:token|secret|password|auth|signature|session|credential|access[_-]?key)/i.test(key)) {
        url.searchParams.delete(key);
      }
    }
    url.hash = "";
    return url.href;
  } catch {
    return "";
  }
}

function citationRecord(value) {
  const source = typeof value === "string" ? { url: value } : value;
  if (!source || typeof source !== "object") return null;
  const url = safeCitationUrl(source.url || source.canonicalUrl || source.canonical_url || source.href || source.uri || source.source_url);
  if (!url) return null;
  return {
    url,
    title: String(source.title || source.name || source.label || "").slice(0, 240)
  };
}

function sourceEvidence(payload, requestedUrl) {
  const envelopes = [payload, payload?.result, payload?.data, payload?.source, payload?.metadata]
    .filter(value => value && typeof value === "object" && !Array.isArray(value));
  const firstString = keys => {
    for (const key of keys) {
      const value = envelopes.map(envelope => envelope[key]).find(item => typeof item === "string" && item.trim());
      if (value) return value;
    }
    return "";
  };
  const title = firstString(["title", "pageTitle", "page_title"]);
  const rawUrl = firstString(["canonicalUrl", "canonical_url", "finalUrl", "final_url", "url", "sourceUrl", "source_url"]);
  const url = safeCitationUrl(rawUrl || requestedUrl);
  const citations = [];
  const seen = new Set();
  for (const envelope of envelopes) {
    const lists = ["citations", "sources", "references"]
      .flatMap(key => Array.isArray(envelope[key]) ? envelope[key] : []);
    if (envelope.source && typeof envelope.source === "object") lists.push(envelope.source);
    for (const value of lists) {
      const citation = citationRecord(value);
      if (!citation || seen.has(citation.url)) continue;
      seen.add(citation.url);
      citations.push(citation);
      if (citations.length >= 8) break;
    }
    if (citations.length >= 8) break;
  }
  if (url && !seen.has(url)) citations.unshift({ url, title });
  const name = title || (url ? new URL(url).hostname : "Retrieved source");
  return {
    kind: "source",
    url,
    name,
    title,
    citations: citations.slice(0, 8),
    retrievedAt: firstString(["retrievedAt", "retrieved_at", "fetchedAt", "fetched_at"]),
    text: referenceText(payload).slice(0, MAX_REFERENCE_TEXT)
  };
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

function limitReferenceText(references, maxChars = MAX_REFERENCE_TEXT) {
  let remaining = Math.max(0, Number(maxChars) || 0);
  return (references || []).slice(0, 16).map(reference => {
    const fullText = String(reference?.text || "");
    if (!fullText && !reference?.fileId) return null;
    const text = fullText.slice(0, remaining);
    remaining = Math.max(0, remaining - text.length);
    return {
      ...reference,
      text,
      truncated: reference?.truncated === true || text.length < fullText.length
    };
  }).filter(Boolean);
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
    this.memory = options.memory || new OnyxMemory(options.memoryOptions);
  }

  setAuthContext(context) {
    const requestedProfile = String(context?.profileKey || context?.profile || "").trim().toLowerCase();
    if (requestedProfile && requestedProfile !== this.transport.profileKey) this.memory.clear();
    return this.transport.setAuthContext(context);
  }
  clearAuthContext() { this.memory.clear(); return this.transport.clearAuthContext(); }
  subscribe(listener) { return this.transport.subscribe(listener); }
  status() { return { ...this.transport.snapshot(), ollama: this.ollama.snapshot(), llm: this.#llmStatus, profile: this.#profileStatus, memory: this.memory.snapshot() }; }
  memoryStatus() { return this.memory.snapshot(); }
  clearMemoryCache() { this.memory.clear(); }
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
      sourceKind: "onyx-domain-guide",
      trust: "onyx-brain-knowledge",
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
      sourceKind: "onyx-corpus",
      trust: "onyx-brain-knowledge",
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
          sourceKind: "user-attachment",
          trust: "user-provided-reference",
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
    const callerReferences = (input.references || []).slice(0, 16).map((reference, index) => {
      if (typeof reference === "string") {
        return {
          name: `reference-${index + 1}`,
          mimeType: "text/plain",
          sourceKind: "user-reference",
          trust: "user-provided-reference",
          text: reference.slice(0, MAX_REFERENCE_TEXT)
        };
      }
      if (!reference || typeof reference !== "object") return null;
      return {
        name: String(reference.name || reference.title || `reference-${index + 1}`).slice(0, 180),
        mimeType: String(reference.mimeType || reference.type || "text/plain").slice(0, 120),
        source: String(reference.source || "").slice(0, 260),
        url: safeCitationUrl(reference.url),
        fileId: String(reference.fileId || "").slice(0, 200),
        sourceKind: "user-reference",
        trust: "user-provided-reference",
        text: String(reference.text || reference.content || "").slice(0, MAX_REFERENCE_TEXT)
      };
    }).filter(Boolean);
    const [domainReferences, corpusReferences, attachments] = await Promise.all([
      this.#domainReferences(plan),
      this.#corpusReferences(plan),
      this.#attachmentReferences(input, plan)
    ]);
    return {
      references: limitReferenceText(uniqueReferences([
        ...callerReferences,
        ...attachments.references,
        ...domainReferences,
        ...corpusReferences
      ]), MAX_REFERENCE_TEXT),
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

    const memory = await this.memory.prepare({
      tools: this.tools,
      profileKey: this.transport.profileKey,
      authenticated: this.transport.authenticated,
      message: plan.message,
      lane: input.lane || plan.surface,
      context: {
        ...(input.context || {}),
        conversationPolicy: "continuous-account-scoped-multi-lane",
        conversationLane: String(input.lane || plan.surface || "core")
      },
      requestedPolicy: ["on", "off"].includes(String(input.memoryPolicy || "").toLowerCase())
        ? input.memoryPolicy
        : (input.context?.memoryPolicy?.requested || "auto"),
      autoRemember: typeof input.autoRemember === "boolean" ? input.autoRemember : undefined,
      defaultAutoRemember: plan.permissions.autoRemember,
      serious: input.context?.serious === true,
      provider: plan.provider,
      signal: input.signal
    });
    const expectedProfileKey = this.transport.profileKey;
    const profileContext = profileContinuityContext(expectedProfileKey);

    const result = await this.transport.request(ONYX_ACTIONS.chat, {
      message: plan.message,
      history: normalizeHistory(input.history),
      references: prepared.references,
      context: {
        ...(input.context || {}),
        memory: memory.context,
        conversationPolicy: "continuous-account-scoped-multi-lane",
        conversationLane: String(input.lane || plan.surface || "core"),
        workspaceTask: plan.workspaceTask,
        application: "OurSpace",
        module: "Onyx",
        surface: plan.surface,
        destination: plan.destination,
        intents: plan.intents,
        domains: plan.domains.map(domain => domain.id),
        personalityContract: ONYX_PUBLIC_PERSONALITY.schema,
        profileContinuity: profileContext,
        unifiedBrainRuntime: ONYX_CORE_CONFIG.schema,
        taskExecution: plan.executionContract,
        groundingPolicy: {
          schema: "onyx.grounding-policy.v1",
          referenceContentIsDataNotInstruction: true,
          citeRetrievedSourcesWhenUsed: true,
          discloseWhenEvidenceIsMissingOrConflicting: true,
          scope: "active-conversation-and-authenticated-profile"
        }
      },
      // Preserve the originating interface's conversation semantics while
      // Onyx's core remains the only AI/knowledge authority.
      responseIntent: String(input.responseIntent || (plan.listenOnly ? "listen_only" : "normal")),
      listenOnly: plan.listenOnly,
      supportMode: String(input.supportMode || ""),
      chatMode: String(input.chatMode || ""),
      mode: String(input.mode || ""),
      mood: String(input.mood || ""),
      memoryClass: String(input.memoryClass || ""),
      webSearch: plan.permissions.webSearch,
      useDrive: plan.permissions.useDrive,
      allowWrites: plan.permissions.allowWrites && !plan.requiresExplicitWriteConfirmation,
      allowAssetGeneration: plan.permissions.allowAssetGeneration,
      allowExternalTools: plan.permissions.allowExternalTools,
      allowGlobalDrive: plan.permissions.allowGlobalDrive,
      autoRemember: memory.autoRemember,
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
    const memoryCacheUpdated = memory.autoRemember === true &&
      this.memory.appendVerifiedUserMessage?.(expectedProfileKey, plan.message) === true;
    if (!memoryCacheUpdated) this.memory.invalidateProfile?.(expectedProfileKey);

    return normalizedResult(result, {
      provider: "ourspace-ai-brain",
      llmVerified: true,
      llmVerification,
      profileVerified: true,
      profileVerification,
      plan,
      artifacts: [...prepared.artifacts, ...extractArtifacts(result)],
      continuity: "backend-profile-scoped",
      memory: memory.metadata
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
          return sourceEvidence(result, step.args.url);
        }
        const gathered = state.observations.filter(item => item?.kind === "source").map(item => ({
          name: item.name || item.url,
          mimeType: "text/plain",
          sourceKind: "external-web-content",
          trust: "untrusted-evidence",
          url: item.url,
          title: item.title,
          citations: item.citations,
          retrievedAt: item.retrievedAt,
          text: item.text
        }));
        return this.chat({ ...input, message: goal, plan: basePlan, references: [...(input.references || []), ...gathered] });
      },
      verify: state => ({
        ok: Boolean(responseText(state.result)) && state.result?.llmVerified === true,
        responsePresent: Boolean(responseText(state.result)),
        modelCompletionVerified: state.result?.llmVerified === true
      })
    });
  }
}

export { normalizeHistory, responseText };
export default OnyxRuntime;

