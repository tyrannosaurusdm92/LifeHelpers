import { ONYX_ACTIONS, ONYX_BACKEND_URL, ONYX_CORE_CONFIG } from "./config.js";

const ALLOWED_ACTIONS = new Set(Object.values(ONYX_ACTIONS));
const PUBLIC_ACTIONS = new Set([ONYX_ACTIONS.health]);

function abortError() {
  try { return new DOMException("Request cancelled.", "AbortError"); }
  catch { const error = new Error("Request cancelled."); error.name = "AbortError"; return error; }
}

function clean(value, limit = 1000) {
  return String(value ?? "").replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim().slice(0, limit);
}

function publicError(error) {
  const raw = clean(error?.message || error);
  if (/session|sign.?in|auth/i.test(raw)) return "Sign in to OurSpace to use Onyx.";
  if (/abort|cancel/i.test(raw)) return "That Onyx request was cancelled.";
  if (/timeout/i.test(raw)) return "Onyx could not finish before the request timed out.";
  if (/network|fetch|http/i.test(raw)) return "Onyx could not reach the existing OurSpace backend.";
  return raw || "Onyx could not complete that action.";
}

function timeoutController(timeoutMs, outerSignal) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error("Backend timeout")), timeoutMs);
  const relay = () => controller.abort(outerSignal?.reason || abortError());
  if (outerSignal) {
    if (outerSignal.aborted) relay();
    else outerSignal.addEventListener("abort", relay, { once: true });
  }
  return {
    signal: controller.signal,
    close() {
      clearTimeout(timer);
      outerSignal?.removeEventListener?.("abort", relay);
    }
  };
}

function hostBackend() {
  const candidates = [globalThis.OurSpaceBackend];
  try {
    if (globalThis.parent && globalThis.parent !== globalThis) candidates.push(globalThis.parent.OurSpaceBackend);
  } catch {}
  return candidates.find(candidate => candidate && typeof candidate.request === "function") || null;
}

export class OnyxTransport {
  #sessionToken = "";
  #profileKey = "";
  #listeners = new Set();
  #status = { online: false, lastAction: "", lastError: "", checkedAt: "", profileKey: "" };

  constructor({ endpoint = ONYX_BACKEND_URL, timeoutMs = ONYX_CORE_CONFIG.limits.timeoutMs } = {}) {
    this.endpoint = endpoint;
    this.timeoutMs = timeoutMs;
  }

  setAuthContext({ sessionToken = "", token = "", profileKey = "", profile = "" } = {}) {
    const nextToken = String(sessionToken || token).trim();
    const nextProfile = String(profileKey || profile).trim().toLowerCase();
    if (nextToken) this.#sessionToken = nextToken;
    if (["william", "jasper", "shared"].includes(nextProfile)) this.#profileKey = nextProfile;
    this.#status.profileKey = this.#profileKey;
    this.#status.lastError = "";
    this.#emit();
    return this.snapshot();
  }

  clearAuthContext() {
    this.#sessionToken = "";
    this.#profileKey = "";
    this.#status = { online: false, lastAction: "", lastError: "", checkedAt: new Date().toISOString(), profileKey: "" };
    this.#emit();
  }

  get profileKey() {
    const hostProfile = hostBackend()?.profile?.();
    const value = String(this.#profileKey || hostProfile || "shared").toLowerCase();
    return ["william", "jasper", "shared"].includes(value) ? value : "shared";
  }

  get authenticated() {
    const host = hostBackend();
    return Boolean(host?.isAuthenticated?.() || host?.token?.() || this.#sessionToken);
  }

  subscribe(listener) {
    if (typeof listener !== "function") throw new TypeError("listener must be a function");
    this.#listeners.add(listener);
    listener(this.snapshot());
    return () => this.#listeners.delete(listener);
  }

  snapshot() {
    return Object.freeze({
      ...this.#status,
      endpoint: this.endpoint,
      authenticated: this.authenticated,
      profileKey: this.profileKey,
      sessionTokenExposed: false
    });
  }

  #emit() {
    const snapshot = this.snapshot();
    for (const listener of this.#listeners) {
      try { listener(snapshot); } catch {}
    }
    try { globalThis.dispatchEvent?.(new CustomEvent("onyx:core-status", { detail: snapshot })); } catch {}
  }

  async request(action, data = {}, options = {}) {
    const requestedAction = String(action || "");
    if (!ALLOWED_ACTIONS.has(requestedAction)) throw new Error(`Unsupported Onyx action: ${requestedAction}`);
    if (!PUBLIC_ACTIONS.has(requestedAction) && !this.authenticated) throw new Error("OurSpace session is not available.");

    this.#status.lastAction = requestedAction;
    this.#status.lastError = "";
    this.#emit();

    const timeoutMs = Math.max(1000, Number(options.timeoutMs || this.timeoutMs));
    const timed = timeoutController(timeoutMs, options.signal);
    try {
      let result;
      const host = hostBackend();
      if (host) {
        result = await host.request(requestedAction, data, { ...options, signal: timed.signal });
      } else {
        const payload = { action: requestedAction, data };
        if (this.#sessionToken) payload.sessionToken = this.#sessionToken;
        const response = await fetch(this.endpoint, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=UTF-8" },
          body: JSON.stringify(payload),
          cache: "no-store",
          credentials: "omit",
          redirect: "follow",
          signal: timed.signal
        });
        if (!response.ok) throw new Error(`Backend HTTP ${response.status}`);
        result = await response.json();
      }
      if (!result || result.ok === false) throw new Error(String(result?.error?.message || result?.error || result?.message || "Backend rejected request."));
      this.#status.online = true;
      this.#status.checkedAt = new Date().toISOString();
      this.#status.profileKey = String(result.profileKey || this.profileKey);
      this.#emit();
      return result;
    } catch (error) {
      if (timed.signal.aborted || options.signal?.aborted) throw abortError();
      this.#status.online = false;
      this.#status.lastError = publicError(error);
      this.#status.checkedAt = new Date().toISOString();
      this.#emit();
      throw error;
    } finally {
      timed.close();
    }
  }

  health(options = {}) {
    return this.request(ONYX_ACTIONS.health, {}, { ...options, timeoutMs: options.timeoutMs || 20000 });
  }

  capabilities(options = {}) {
    return this.request(ONYX_ACTIONS.capabilities, {}, { ...options, timeoutMs: options.timeoutMs || 30000 });
  }
}

export { abortError, clean, publicError };
export default OnyxTransport;
