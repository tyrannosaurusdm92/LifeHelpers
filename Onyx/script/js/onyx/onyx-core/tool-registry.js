import { ONYX_ACTIONS, ONYX_CORE_CONFIG } from "./config.js";

const TOOL_DEFINITIONS = Object.freeze({
  health: Object.freeze({ action: ONYX_ACTIONS.health, write: false, timeoutMs: 20000 }),
  capabilities: Object.freeze({ action: ONYX_ACTIONS.capabilities, write: false, timeoutMs: 30000 }),
  history: Object.freeze({ action: ONYX_ACTIONS.history, write: false, timeoutMs: 30000 }),
  webSearch: Object.freeze({ action: ONYX_ACTIONS.webSearch, write: false, timeoutMs: 70000 }),
  urlFetch: Object.freeze({ action: ONYX_ACTIONS.urlFetch, write: false, timeoutMs: 60000 }),
  fileParse: Object.freeze({ action: ONYX_ACTIONS.fileParse, write: false, timeoutMs: 90000 }),
  fileUpload: Object.freeze({ action: ONYX_ACTIONS.fileUpload, write: true, timeoutMs: 90000 }),
  fileArchive: Object.freeze({ action: ONYX_ACTIONS.fileArchive, write: true, timeoutMs: 90000 }),
  imageGenerate: Object.freeze({ action: ONYX_ACTIONS.imageGenerate, write: true, timeoutMs: 120000 }),
  petGet: Object.freeze({ action: ONYX_ACTIONS.petGet, write: false, timeoutMs: 30000 }),
  petSave: Object.freeze({ action: ONYX_ACTIONS.petSave, write: true, timeoutMs: 30000 })
});

function readBlobAsDataUrl(blob, signal) {
  return new Promise((resolve, reject) => {
    if (!(blob instanceof Blob)) return reject(new TypeError("A Blob or File is required."));
    if (signal?.aborted) return reject(signal.reason || new Error("Request cancelled."));
    const reader = new FileReader();
    const cancel = () => { try { reader.abort(); } catch {} };
    signal?.addEventListener?.("abort", cancel, { once: true });
    reader.onerror = () => reject(new Error("The selected file could not be read."));
    reader.onabort = () => reject(new Error("File reading was cancelled."));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onloadend = () => signal?.removeEventListener?.("abort", cancel);
    reader.readAsDataURL(blob);
  });
}

function safeName(value, fallback = "onyx-file") {
  return String(value || fallback).replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "_").trim().slice(0, 180) || fallback;
}

function safeUrl(value) {
  try {
    const url = new URL(String(value || ""), globalThis.location?.href || "https://localhost/");
    return /^https?:$/i.test(url.protocol) ? url.href : "";
  } catch { return ""; }
}

export function extractArtifacts(payload) {
  const candidates = [
    ...(Array.isArray(payload?.artifacts) ? payload.artifacts : []),
    ...(Array.isArray(payload?.assets) ? payload.assets : []),
    ...(Array.isArray(payload?.images) ? payload.images : []),
    payload?.file,
    payload?.archive
  ].filter(Boolean);
  const seen = new Set();
  const artifacts = [];
  for (const item of candidates) {
    if (!item || typeof item !== "object") continue;
    const record = {
      kind: /^image\//i.test(String(item.mimeType || "")) ? "image" : "file",
      fileId: String(item.fileId || item.assetId || item.id || ""),
      name: safeName(item.name || item.fileName || item.title || "onyx-file"),
      mimeType: String(item.mimeType || item.type || "application/octet-stream"),
      sizeBytes: Number(item.sizeBytes || item.size || 0) || 0,
      url: safeUrl(item.url || item.driveUrl || item.downloadUrl || ""),
      base64: typeof item.base64 === "string" ? item.base64 : ""
    };
    const key = `${record.fileId}|${record.url}|${record.name}|${record.base64.length}`;
    if (seen.has(key)) continue;
    seen.add(key);
    artifacts.push(record);
  }
  return artifacts;
}

export class OnyxToolRegistry {
  constructor(transport) {
    if (!transport || typeof transport.request !== "function") throw new TypeError("OnyxToolRegistry requires an Onyx transport.");
    this.transport = transport;
  }

  list() {
    return Object.entries(TOOL_DEFINITIONS).map(([name, definition]) => ({ name, ...definition }));
  }

  async execute(name, args = {}, options = {}) {
    const tool = TOOL_DEFINITIONS[name];
    if (!tool) throw new Error(`Unknown Onyx tool: ${name}`);
    if (tool.write && options.writeConfirmed !== true) throw new Error(`${name} requires an explicit user write request.`);
    return this.transport.request(tool.action, args, {
      signal: options.signal,
      timeoutMs: options.timeoutMs || tool.timeoutMs
    });
  }

  health(options) { return this.execute("health", {}, options); }
  capabilities(options) { return this.execute("capabilities", {}, options); }
  history(limit = 100, options) {
    return this.execute("history", { limit: Math.max(1, Math.min(500, Number(limit) || 100)) }, options);
  }
  webSearch(query, options = {}) {
    return this.execute("webSearch", {
      query: String(query || ""),
      reasoningEffort: options.reasoningEffort || "medium",
      maxOutputTokens: options.maxOutputTokens || 1800,
      sessionId: options.sessionId || ""
    }, options);
  }
  urlFetch(url, options = {}) {
    return this.execute("urlFetch", {
      url: String(url || ""),
      extract: options.extract || "readable text and useful structured data",
      cite: options.cite !== false,
      sessionId: options.sessionId || ""
    }, options);
  }
  fileParse(input, options = {}) {
    const data = {
      instructions: String(options.instructions || "Analyze this file faithfully for the current request. Preserve useful structure and state uncertainty."),
      maxChars: Math.max(1000, Math.min(240000, Number(options.maxChars) || 120000)),
      allowShared: options.allowShared === true,
      sessionId: options.sessionId || "",
      reasoningEffort: options.reasoningEffort || "medium",
      maxOutputTokens: options.maxOutputTokens || 2000
    };
    if (typeof input === "string") data.fileId = input;
    else if (input?.fileId) data.fileId = String(input.fileId);
    else if (input?.dataUrl || input?.base64) Object.assign(data, input);
    else throw new Error("A file ID or encoded file packet is required.");
    return this.execute("fileParse", data, options);
  }
  async fileUpload(file, options = {}) {
    if (!(file instanceof Blob)) throw new TypeError("A Blob or File is required.");
    if (file.size > ONYX_CORE_CONFIG.limits.uploadBytes) throw new Error("Upload too large. The existing OurSpace limit is 25,000 KB.");
    const dataUrl = await readBlobAsDataUrl(file, options.signal);
    return this.execute("fileUpload", {
      fileName: safeName(file.name || options.fileName || "file"),
      mimeType: file.type || options.mimeType || "application/octet-stream",
      dataUrl,
      kind: options.kind || "onyx-ai-upload",
      purpose: options.purpose || "Onyx conversation attachment"
    }, { ...options, writeConfirmed: true });
  }
  fileArchive(fileIds, name = "onyx-files", options = {}) {
    return this.execute("fileArchive", {
      fileIds: (fileIds || []).map(String).filter(Boolean).slice(0, 50),
      name: safeName(name, "onyx-files").replace(/\.zip$/i, ""),
      allowShared: options.allowShared === true
    }, options);
  }
  imageGenerate(prompt, options = {}) {
    return this.execute("imageGenerate", {
      prompt: String(prompt || ""),
      name: safeName(options.name || "onyx-image"),
      width: Number(options.width || 1024),
      height: Number(options.height || 1024),
      count: Math.max(1, Math.min(ONYX_CORE_CONFIG.limits.generatedImages, Number(options.count) || 1)),
      transparentBackground: options.transparentBackground === true,
      quality: options.quality || "auto",
      sessionId: options.sessionId || ""
    }, options);
  }
}

export { TOOL_DEFINITIONS, readBlobAsDataUrl };
export default OnyxToolRegistry;
