import OnyxCore from "../../onyx-core/index.js";

const OBSERVATION_LIMIT = 24;

function safeSnapshot(value, depth = 0) {
  if (depth > 3 || value == null) return value == null ? null : String(value);
  if (Array.isArray(value)) return value.slice(0, 20).map(item => safeSnapshot(item, depth + 1));
  if (typeof value === "object") {
    const output = {};
    for (const [key, item] of Object.entries(value).slice(0, 30)) {
      if (/token|password|secret|credential|authorization/i.test(key)) continue;
      output[key] = safeSnapshot(item, depth + 1);
    }
    return output;
  }
  if (typeof value === "string") return value.slice(0, 1200);
  return value;
}

export class VirtualBrainBridge {
  #observations = [];

  constructor(core = OnyxCore) {
    this.core = core;
  }

  setAuthContext(context) { return this.core.setAuthContext(context); }
  clearAuthContext() { return this.core.clearAuthContext(); }
  connect(options) { return this.core.connect(options); }
  status() { return this.core.status(); }
  subscribe(listener) { return this.core.runtime.subscribe(listener); }

  observe(type, detail = {}) {
    const observation = Object.freeze({
      type: String(type || "virtual.event").slice(0, 80),
      at: new Date().toISOString(),
      detail: safeSnapshot(detail)
    });
    this.#observations = [...this.#observations, observation].slice(-OBSERVATION_LIMIT);
    return observation;
  }

  clearObservations() { this.#observations = []; }

  async talk(message, options = {}) {
    const context = {
      virtual: {
        room: String(options.room || "base-room").slice(0, 80),
        petState: safeSnapshot(options.petState || {}),
        gameState: safeSnapshot(options.gameState || {}),
        recentObservations: this.#observations.slice(-12)
      },
      ...(options.context || {})
    };
    const result = await this.core.chat({
      ...options,
      message,
      surface: "virtual",
      lane: "virtual",
      context,
      threadId: options.threadId || ""
    });
    this.observe("onyx.response", { responseId: result.responseId || "", mood: result.mood || "" });
    return result;
  }

  runAgent(goal, options = {}) {
    return this.core.runAgent(goal, { ...options, surface: "virtual", lane: "virtual" });
  }
}

export const OnyxVirtualBrain = new VirtualBrainBridge();
if (typeof globalThis !== "undefined") globalThis.OnyxVirtualBrain = OnyxVirtualBrain;
export default OnyxVirtualBrain;
