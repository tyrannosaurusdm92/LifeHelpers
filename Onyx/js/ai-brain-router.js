import { AI_BRAIN_CONFIG } from "./ai-brain-config.js";
import { fetchBrainJson } from "./ai-brain-loader.js";
const clean = s => String(s || "").normalize("NFKC").toLocaleLowerCase().replace(/[^\p{L}\p{N}+_#&/-]+/gu, " ").replace(/\s+/g, " ").trim();
const unique = xs => [...new Set(xs.filter(Boolean))];
export async function routeIntent(text) {
  const query = String(text || "").slice(0, 2000);
  const [data, registry] = await Promise.all([
    fetchBrainJson(AI_BRAIN_CONFIG.routesPath).catch(() => ({ routes: [] })),
    fetchBrainJson(AI_BRAIN_CONFIG.capabilityPath).catch(() => ({ families: [] }))
  ]);
  const q = clean(query), hits = [];
  for (const route of data.routes || []) {
    const terms = [...(route.keywords || []), ...(route.aliases || []), route.label || ""].map(clean).filter(Boolean);
    const matched = terms.filter(term => q.includes(term));
    if (matched.length) hits.push({ id: route.id, score: matched.length, terms: matched, route });
  }
  hits.sort((a,b) => b.score - a.score || a.id.localeCompare(b.id));
  const selected = hits.slice(0, 3);
  const capabilities = unique(selected.map(x => x.id));
  const tags = unique(selected.flatMap(x => x.terms));
  const legacy = registry.capabilities || {};
  for (const [cap, terms] of Object.entries(legacy)) {
    if (q.includes(clean(cap.replaceAll("_"," "))) || (Array.isArray(terms) && terms.some(term => q.includes(clean(term.replaceAll("_"," "))))))
      capabilities.push(cap);
  }
  const domains = capabilities.length ? unique(capabilities) : ["core_chat_support"];
  return { query, capabilities: unique(capabilities.length ? capabilities : domains), domains, tags, matches: selected };
}
if (typeof globalThis !== "undefined") globalThis.AIBrainRouter = { routeIntent };
