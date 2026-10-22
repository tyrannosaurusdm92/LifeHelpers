const REGISTRY_URL = new URL("../../../../json/shared/onyx-core/brain-domains.json", import.meta.url);
const FILE_INDEX_URL = new URL("../../../../json/shared/onyx-core/brain-file-index.json", import.meta.url);
const ONYX_LEGACY_JS_ROOT = new URL("../../../../js/", import.meta.url);

const FALLBACK_DOMAINS = [
  { id: "code", tags: ["code", "coding", "debug", "javascript", "html", "css", "api"] },
  { id: "creative-writing", tags: ["write", "writing", "story", "fiction", "dialogue", "plot"] },
  { id: "worldbuilding", tags: ["worldbuilding", "setting", "lore", "pantheon", "ttrpg"] },
  { id: "game-design", tags: ["game", "mechanic", "level", "quest", "balance"] },
  { id: "organization", tags: ["organize", "plan", "task", "schedule", "project"] },
  { id: "mental-health", tags: ["mental health", "support", "coping", "emotion"] },
  { id: "file-intelligence", tags: ["file", "document", "archive", "parse", "extract"] }
];

let registryPromise;
let fileIndexPromise;

const STOP_WORDS = new Set(["about", "after", "again", "also", "because", "before", "being", "could", "from", "have", "help", "into", "just", "like", "make", "more", "need", "please", "should", "some", "that", "their", "then", "there", "these", "they", "this", "through", "want", "what", "when", "where", "which", "with", "would", "your"]);

function tokens(value) {
  return new Set(String(value || "").normalize("NFKC").toLowerCase().match(/[\p{L}\p{N}+#_-]{2,}/gu) || []);
}

function normalizeRegistry(value) {
  const list = Array.isArray(value?.domains) ? value.domains : Array.isArray(value) ? value : [];
  return list.map(item => ({
    ...item,
    id: String(item.id || item.domain || ""),
    tags: [...new Set([item.id, ...(item.tags || []), ...(item.capabilities || [])].filter(Boolean).map(String))],
    guides: Array.isArray(item.guides) ? item.guides.filter(Boolean).map(String) : []
  })).filter(item => item.id);
}

export async function loadBrainRegistry({ refresh = false } = {}) {
  if (!registryPromise || refresh) {
    registryPromise = fetch(REGISTRY_URL, { cache: refresh ? "reload" : "default" })
      .then(response => {
        if (!response.ok) throw new Error(`Brain registry HTTP ${response.status}`);
        return response.json();
      })
      .then(normalizeRegistry)
      .catch(() => normalizeRegistry(FALLBACK_DOMAINS));
  }
  return registryPromise;
}

export async function loadBrainFileIndex({ refresh = false } = {}) {
  if (!fileIndexPromise || refresh) {
    fileIndexPromise = fetch(FILE_INDEX_URL, { cache: refresh ? "reload" : "default" })
      .then(response => {
        if (!response.ok) throw new Error(`Brain file index HTTP ${response.status}`);
        return response.json();
      })
      .then(value => ({
        schema: String(value?.schema || "onyx.brain-file-index.v1"),
        sourceCommit: String(value?.sourceCommit || ""),
        fileCount: Number(value?.fileCount || 0),
        totalBytes: Number(value?.totalBytes || 0),
        files: (Array.isArray(value?.files) ? value.files : []).filter(row => Array.isArray(row) && typeof row[0] === "string")
      }))
      .catch(() => ({ schema: "onyx.brain-file-index.v1", sourceCommit: "", fileCount: 0, totalBytes: 0, files: [] }));
  }
  return fileIndexPromise;
}

export async function routeBrainDomains(query, { limit = 8 } = {}) {
  const queryTokens = tokens(query);
  const domains = await loadBrainRegistry();
  return domains.map(domain => {
    const haystack = tokens([domain.id, domain.description, ...(domain.tags || [])].join(" "));
    let score = 0;
    for (const token of queryTokens) if (haystack.has(token)) score += token.length > 5 ? 3 : 2;
    for (const tag of domain.tags || []) {
      const phrase = String(tag).toLowerCase();
      if (phrase.includes(" ") && String(query).toLowerCase().includes(phrase)) score += 5;
    }
    return { ...domain, score };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, Math.max(1, limit));
}

export async function searchBrainFiles(query, { domains = [], limit = 16 } = {}) {
  const index = await loadBrainFileIndex();
  const queryTokens = [...tokens(query)].filter(token => token.length >= 3 && !STOP_WORDS.has(token));
  const domainIds = new Set((domains || []).map(domain => String(domain?.id || domain)).filter(Boolean));
  const results = [];
  for (const [path, rawSize] of index.files) {
    if (!/\.(?:js|md)$/i.test(path)) continue;
    const domain = path.includes("/") ? path.split("/")[0] : "core";
    const pathTokens = tokens(path.replace(/--variant-[a-f0-9-]+/gi, " ").replace(/\.[^.]+$/, "").replace(/[-_/]+/g, " "));
    let score = domainIds.has(domain) ? 6 : 0;
    let matches = 0;
    for (const token of queryTokens) {
      if (pathTokens.has(token)) { score += token.length > 6 ? 5 : 3; matches += 1; continue; }
      if ([...pathTokens].some(candidate => candidate.startsWith(token) || token.startsWith(candidate))) { score += 1; matches += 1; }
    }
    if (!matches) continue;
    if (/domain-guide|source-pointer-index|manifest/i.test(path)) score -= 1;
    if (/--variant-/i.test(path)) score -= 2;
    results.push({ path, domain, size: Number(rawSize || 0), score });
  }
  return results.sort((a, b) => b.score - a.score || a.size - b.size || a.path.localeCompare(b.path)).slice(0, Math.max(1, limit));
}

export function resolveLegacyBrainModule(path) {
  const cleanPath = String(path || "").replace(/^\/+/, "");
  if (!cleanPath || cleanPath.includes("..") || cleanPath.includes("\\")) throw new Error("Invalid Onyx brain module path.");
  return new URL(cleanPath, ONYX_LEGACY_JS_ROOT);
}

export async function loadDomainGuides(domains, { maxGuides = 8 } = {}) {
  const selected = [];
  for (const domain of domains || []) {
    for (const path of domain.guides || []) {
      if (selected.length >= maxGuides) break;
      try {
        const module = await import(resolveLegacyBrainModule(path).href);
        const value = module.default ?? module;
        selected.push({ domain: domain.id, path, value });
      } catch {}
    }
    if (selected.length >= maxGuides) break;
  }
  return selected;
}

export async function loadBrainSources(query, domains, { maxSources = 4, maxFileBytes = 600000, maxTotalChars = 24000 } = {}) {
  const candidates = await searchBrainFiles(query, { domains, limit: Math.max(maxSources * 8, 16) });
  const sources = [];
  const canonical = new Set();
  let remaining = Math.max(1000, Number(maxTotalChars) || 24000);
  for (const candidate of candidates) {
    if (sources.length >= maxSources || remaining <= 0) break;
    if (candidate.size <= 0 || candidate.size > maxFileBytes) continue;
    const dedupeKey = candidate.path.replace(/--variant-[a-f0-9-]+(?=\.)/gi, "");
    if (canonical.has(dedupeKey)) continue;
    canonical.add(dedupeKey);
    try {
      const response = await fetch(resolveLegacyBrainModule(candidate.path), { cache: "default" });
      if (!response.ok) continue;
      const fullText = await response.text();
      const text = fullText.slice(0, Math.min(remaining, 8000));
      if (!text.trim()) continue;
      remaining -= text.length;
      sources.push({ ...candidate, text, truncated: text.length < fullText.length });
    } catch {}
  }
  return sources;
}

export default Object.freeze({ loadBrainRegistry, loadBrainFileIndex, routeBrainDomains, searchBrainFiles, resolveLegacyBrainModule, loadDomainGuides, loadBrainSources });
