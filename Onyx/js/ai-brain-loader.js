import { BRAIN_SHARDS } from "./knowledge-index.js";
const byPath = new Map(BRAIN_SHARDS.map(item => [item.path, item]));
const cache = new Map();
function normalizePath(path) {
  let value = String(path || "").replace(/^\.\//, "").replace(/^\/+/, "");
  if (value.startsWith("js/")) value = value.slice(3);
  if (value.includes("..") || value.includes("\\")) throw new Error("Invalid local knowledge module path.");
  return value;
}
export function resolveBrainModule(path) {
  const value = normalizePath(path);
  const item = byPath.get(value);
  if (!item) throw new Error("Unknown local knowledge module: " + value);
  return new URL(item.module, import.meta.url).href;
}
export async function fetchBrainModule(path, { refresh = false } = {}) {
  const value = normalizePath(path);
  const item = byPath.get(value);
  if (!item) throw new Error("Unknown local knowledge module: " + value);
  if (!refresh && cache.has(item.path)) return cache.get(item.path);
  const pending = import(new URL(item.module, import.meta.url).href).then(mod => mod.default);
  cache.set(item.path, pending);
  try { return await pending; } catch (error) { cache.delete(item.path); throw error; }
}
export async function loadCatalog() { return { shards: BRAIN_SHARDS }; }
export function clearBrainCache() { cache.clear(); }
if (typeof globalThis !== "undefined") globalThis.AIBrainLoader = { resolveBrainModule, fetchBrainModule, loadCatalog, clearBrainCache };
