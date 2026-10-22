import { routeBrainDomains } from "./brain-registry.js";

const RULES = Object.freeze({
  coding: /\b(code|coding|debug|bug|javascript|typescript|html|css|api|database|program|refactor|test|repository|github)\b/i,
  writing: /\b(write|writing|rewrite|edit|story|fiction|dialogue|plot|novel|poem|prose|character)\b/i,
  ideas: /\b(idea|brainstorm|concept|possibilit|what if|help me think|inspiration)\b/i,
  research: /\b(research|search|source|citation|current|latest|today|verify|look up|web)\b/i,
  files: /\b(file|document|pdf|zip|archive|folder|upload|parse|extract|spreadsheet|image attachment)\b/i,
  image: /\b(generate|create|make|draw|render|design)\b.{0,28}\b(image|picture|art|illustration|texture|sprite|portrait)\b|\bimage generation\b/i,
  project: /\b(project|plan|milestone|task|organize|workflow|roadmap|checklist)\b/i,
  game: /\b(game|gaming|minecraft|fallout|ttrpg|d&d|quest|level|npc|mechanic|build)\b/i,
  fresh: /\b(latest|current|today|right now|this week|version|release|patch|price|availability|schedule|news)\b/i,
  writeAction: /\b(create|save|write|edit|update|delete|remove|publish|upload|archive|export|generate)\b/i,
  listenOnly: /\b(just listen|do not advise|don't advise|no advice|let me vent|need to vent)\b/i,
  sensitive: /\b(crisis|suicid|self[- ]?harm|abuse|medical emergency|diagnos|medication|dose|seizure|oxygen|blood sugar)\b/i
});

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function extractUrls(text) {
  const urls = [];
  for (const raw of String(text || "").match(/https?:\/\/[^\s<>"')\]]+/gi) || []) {
    try { const url = new URL(raw); if (!urls.includes(url.href)) urls.push(url.href); } catch {}
  }
  return urls.slice(0, 4);
}

function intentList(text) {
  const intents = Object.entries(RULES)
    .filter(([name, rule]) => !["fresh", "writeAction", "listenOnly", "sensitive"].includes(name) && rule.test(text))
    .map(([name]) => name);
  return intents.length ? intents : ["chat"];
}

export async function createCapabilityPlan(input = {}) {
  const message = String(input.message || input.text || "").trim();
  if (!message) throw new Error("Onyx needs a message.");
  const surface = input.surface === "virtual" || input.lane === "virtual" ? "virtual" : "core";
  const intents = intentList(message);
  const urls = extractUrls(message);
  const domains = await routeBrainDomains(message, { limit: input.domainLimit || 8 });
  const explicitWrite = input.allowWrites === true || RULES.writeAction.test(message);
  const imageIntent = input.allowAssetGeneration === true || RULES.image.test(message);
  const hasAttachments = Array.isArray(input.attachments) && input.attachments.length > 0;
  const freshness = RULES.fresh.test(message);
  const explicitResearch = intents.includes("research") || input.webSearch === true;
  const listenOnly = input.listenOnly === true || RULES.listenOnly.test(message);
  const sensitive = RULES.sensitive.test(message);
  const complex = message.length > 900 || intents.length > 2 || /\b(step by step|deep|thorough|complete|architecture|compare)\b/i.test(message);
  return Object.freeze({
    schema: "onyx.capability-plan.v1",
    message,
    surface,
    destination: surface === "virtual" ? "games/virtual" : "onyx-core",
    intents: unique(intents),
    domains: domains.map(domain => ({ id: domain.id, score: domain.score, guides: domain.guides || [] })),
    urls,
    listenOnly,
    sensitive,
    permissions: Object.freeze({
      webSearch: !listenOnly && (explicitResearch || freshness || urls.length > 0),
      useDrive: !listenOnly && (input.useDrive === true || hasAttachments || intents.some(intent => ["files", "project", "coding", "writing"].includes(intent))),
      allowWrites: !listenOnly && explicitWrite,
      allowAssetGeneration: !listenOnly && imageIntent,
      allowExternalTools: !listenOnly && (explicitResearch || urls.length > 0 || hasAttachments || explicitWrite || imageIntent),
      autoRemember: input.autoRemember === true || (input.autoRemember !== false && !sensitive),
      allowGlobalDrive: input.allowGlobalDrive === true
    }),
    reasoningEffort: input.reasoningEffort || (complex || sensitive ? "high" : "medium"),
    maxOutputTokens: Math.max(400, Math.min(5000, Number(input.maxOutputTokens || (complex ? 2400 : 1400)))),
    requiresExplicitWriteConfirmation: input.allowWrites === true && !RULES.writeAction.test(message) && input.writeConfirmed !== true,
    provider: String(input.provider || "ourspace-ai-brain")
  });
}

export { RULES, extractUrls };
export default createCapabilityPlan;
