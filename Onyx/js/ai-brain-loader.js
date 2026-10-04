import { AI_BRAIN_CONFIG } from "./ai-brain-config.js";
const cache = new Map();
export function resolveBrainUrl(path, mode = "pages") {
  if (mode && mode !== "pages" && mode !== "same-origin" && mode !== "raw")
    throw new Error("Only same-origin corpus loading is supported.");
  const value = String(path || "").replace(/^\/+/, "");
  if (!/^json\/[A-Za-z0-9_./-]+\.json$/.test(value) || value.includes(".."))
    throw new Error("Only local JSON knowledge files can be loaded.");
  const url = new URL(value, AI_BRAIN_CONFIG.pagesBase);
  if (typeof location !== "undefined" && url.origin !== location.origin)
    throw new Error("Knowledge files must remain on the current origin.");
  return url.href;
}
export async function fetchBrainJson(path, { mode = "pages", signal, refresh = false } = {}) {
  const url = resolveBrainUrl(path, mode), key = url;
  if (!refresh && cache.has(key)) return cache.get(key);
  const pending = fetch(url, { signal, credentials: "same-origin", cache: refresh ? "reload" : "force-cache" })
    .then(res => { if (!res.ok) throw new Error("AI-Brain fetch failed " + res.status + ": " + path); return res.json(); })
    .catch(error => { cache.delete(key); throw error; });
  cache.set(key, pending);
  return pending;
}
export async function loadCatalog(opts = {}) { return fetchBrainJson(AI_BRAIN_CONFIG.catalogPath, opts); }
export function clearBrainCache() { cache.clear(); }
if (typeof globalThis !== "undefined") globalThis.AIBrainLoader = { resolveBrainUrl, fetchBrainJson, loadCatalog, clearBrainCache };
