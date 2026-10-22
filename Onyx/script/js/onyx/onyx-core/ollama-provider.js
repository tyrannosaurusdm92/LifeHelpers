function normalizeEndpoint(value) {
  const url = new URL(String(value || "http://127.0.0.1:11434"));
  url.pathname = url.pathname.replace(/\/+$/, "");
  return url;
}

function loopback(url) {
  return ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
}

function timeoutSignal(timeoutMs, outerSignal) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error("Local model timeout")), timeoutMs);
  const relay = () => controller.abort(outerSignal?.reason);
  if (outerSignal) {
    if (outerSignal.aborted) relay();
    else outerSignal.addEventListener("abort", relay, { once: true });
  }
  return { signal: controller.signal, close: () => { clearTimeout(timer); outerSignal?.removeEventListener?.("abort", relay); } };
}

export class OllamaProvider {
  constructor(options = {}) {
    this.enabled = options.enabled === true;
    this.endpoint = normalizeEndpoint(options.endpoint);
    this.model = String(options.model || "");
    this.allowRemote = options.allowRemote === true;
    this.timeoutMs = Math.max(1000, Number(options.timeoutMs || 120000));
  }

  configure(options = {}) {
    if (options.endpoint) this.endpoint = normalizeEndpoint(options.endpoint);
    if (options.model !== undefined) this.model = String(options.model || "");
    if (options.enabled !== undefined) this.enabled = options.enabled === true;
    if (options.allowRemote !== undefined) this.allowRemote = options.allowRemote === true;
    if (options.timeoutMs !== undefined) this.timeoutMs = Math.max(1000, Number(options.timeoutMs));
    if (this.enabled) this.#assertAllowed();
    return this.snapshot();
  }

  #assertAllowed() {
    if (!this.enabled) throw new Error("The optional Ollama adapter is disabled.");
    if (!loopback(this.endpoint) && !this.allowRemote) throw new Error("A non-loopback Ollama endpoint requires explicit allowRemote configuration.");
    if (!this.model) throw new Error("Choose an installed Ollama model before using the local adapter.");
  }

  snapshot() {
    return Object.freeze({
      provider: "ollama",
      enabled: this.enabled,
      endpoint: this.endpoint.href.replace(/\/$/, ""),
      model: this.model,
      loopback: loopback(this.endpoint),
      privateBackendContextShared: false
    });
  }

  async #request(path, payload, options = {}) {
    this.#assertAllowed();
    const timed = timeoutSignal(options.timeoutMs || this.timeoutMs, options.signal);
    try {
      const response = await fetch(new URL(path, `${this.endpoint.href.replace(/\/$/, "")}/`), {
        method: payload ? "POST" : "GET",
        headers: payload ? { "Content-Type": "application/json" } : undefined,
        body: payload ? JSON.stringify(payload) : undefined,
        cache: "no-store",
        credentials: "omit",
        signal: timed.signal
      });
      if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`);
      return response;
    } finally {
      timed.close();
    }
  }

  async health(options = {}) {
    const response = await this.#request("api/tags", null, options);
    const data = await response.json();
    return { ok: true, models: data.models || [], configuredModel: this.model };
  }

  async chat({ messages = [], system = "", tools = [], format, options = {} } = {}, requestOptions = {}) {
    const rows = [];
    if (system) rows.push({ role: "system", content: String(system) });
    for (const message of messages) {
      if (!message || !["system", "user", "assistant", "tool"].includes(message.role)) continue;
      rows.push({ ...message, content: String(message.content || "") });
    }
    const response = await this.#request("api/chat", {
      model: this.model,
      messages: rows,
      stream: false,
      tools: Array.isArray(tools) && tools.length ? tools : undefined,
      format,
      options,
      keep_alive: requestOptions.keepAlive || "5m"
    }, requestOptions);
    const data = await response.json();
    return {
      ok: true,
      provider: "ollama",
      model: data.model || this.model,
      response: String(data.message?.content || ""),
      message: data.message || {},
      toolCalls: data.message?.tool_calls || [],
      doneReason: data.done_reason || "",
      usage: {
        promptTokens: Number(data.prompt_eval_count || 0),
        completionTokens: Number(data.eval_count || 0)
      },
      raw: data
    };
  }

  async *streamChat({ messages = [], system = "", tools = [], format, options = {} } = {}, requestOptions = {}) {
    const rows = system ? [{ role: "system", content: String(system) }, ...messages] : messages;
    const response = await this.#request("api/chat", {
      model: this.model,
      messages: rows,
      stream: true,
      tools: Array.isArray(tools) && tools.length ? tools : undefined,
      format,
      options,
      keep_alive: requestOptions.keepAlive || "5m"
    }, requestOptions);
    if (!response.body) throw new Error("Ollama streaming response has no body.");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) if (line.trim()) yield JSON.parse(line);
      if (done) break;
    }
    if (buffer.trim()) yield JSON.parse(buffer);
  }
}

export default OllamaProvider;
