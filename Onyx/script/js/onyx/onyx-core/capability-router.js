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
  writeAction: /\b(save|edit|update|delete|remove|publish|upload|archive|export)\b/i,
  listenOnly: /\b(just listen|do not advise|don't advise|no advice|let me vent|need to vent)\b/i,
  sensitive: /\b(crisis|suicid|self[- ]?harm|abuse|medical emergency|diagnos|medication|dose|seizure|oxygen|blood sugar)\b/i
});

const WORKSPACE_AREAS = Object.freeze([
  Object.freeze({ id: "organizer", pattern: /\b(?:tasks?|to[\s-]?dos?|checklists?|organizer|planner|reminders?|routines?)\b/i }),
  Object.freeze({ id: "calendar", pattern: /\b(?:calendar|appointments?|events?|meetings?|schedules?)\b/i }),
  Object.freeze({ id: "messenger", pattern: /\b(?:messenger|messages?|texts?|calls?|voice messages?)\b/i }),
  Object.freeze({ id: "feed", pattern: /\b(?:feed|posts?|comments?|reactions?|bulletin board|pinboard)\b/i }),
  Object.freeze({ id: "profile-projects", pattern: /\b(?:profile|about me|personal projects?|project catalog)\b/i }),
  Object.freeze({ id: "store-wishlist", pattern: /\b(?:store|wish(?:list| list)|cart|purchases?|wallet|ourspace currency)\b/i }),
  Object.freeze({ id: "games", pattern: /\b(?:game progress|arcade|played games|games?)\b/i }),
  Object.freeze({ id: "media", pattern: /\b(?:music|audio|photos?|pictures?|videos?|media|links?|news articles?)\b/i }),
  Object.freeze({ id: "documents-skills", pattern: /\b(?:journal|diary|dbt|skill sheets?|worksheets?|documents?)\b/i }),
  Object.freeze({ id: "files-drive", pattern: /\b(?:drive|files?|folders?|uploads?|archives?|attachments?)\b/i }),
  Object.freeze({ id: "settings-notifications", pattern: /\b(?:settings|notifications?|alerts?|push messages?)\b/i })
]);
const WORKSPACE_REQUEST = /\b(?:help|can you|could you|would you|please|show|find|look up|list|check|view|open|tell me|what|where|which|why|how many|do i have|add|create|update|edit|delete|remove|send|post|share|pin|mark|complete|check off|finish|reschedule|schedule|assign|upload|save|publish|archive|export|buy|purchase|put|move)\b/i;
const MUTATION_ACTION_SOURCE = "(?:add|create|update|edit|delete|remove|send|post|share|pin|unpin|mark|complete|check\\s+off|finish|reschedule|schedule|assign|upload|save|publish|archive|export|buy|purchase|put|move|write)";
const INFORMATIONAL_ACTION = /\b(?:how do i|how can i|where do i|tell me how|explain how|what is the process|should i|what happens if|how would i)\b/i;
const NEGATED_MUTATION = /\b(?:do not|don't|never|avoid|stop)\s+(?:(?:please|you)\s+){0,2}(?:add|create|update|edit|delete|remove|send|post|share|pin|unpin|mark|complete|check\s+off|finish|reschedule|schedule|assign|upload|save|publish|archive|export|buy|purchase|put|move|write)\b/i;
const WORKSPACE_READ_REQUEST = /\b(?:what|where|which|why|show|find|look up|list|check|view|open|tell me|do i have|how many|read|search)\b/i;

function isDirectMutationRequest(message) {
  const text = String(message || "").trim();
  if (!text || INFORMATIONAL_ACTION.test(text) || NEGATED_MUTATION.test(text)) return false;
  const start = new RegExp("^\\s*(?:please\\s+)?" + MUTATION_ACTION_SOURCE + "\\b", "i");
  const addressed = new RegExp("\\b(?:can|could|would)\\s+you\\s+(?:please\\s+)?" + MUTATION_ACTION_SOURCE + "\\b", "i");
  const intent = new RegExp("\\b(?:i want you to|i need you to|go ahead and|please go ahead and|i want to|i need to)\\s+" + MUTATION_ACTION_SOURCE + "\\b", "i");
  const assisted = new RegExp("\\bhelp me\\s+(?:please\\s+)?" + MUTATION_ACTION_SOURCE + "\\b", "i");
  return start.test(text) || addressed.test(text) || intent.test(text) || assisted.test(text);
}

function classifyWorkspaceTask(message) {
  const text = String(message || "");
  const area = WORKSPACE_AREAS.find(item => item.pattern.test(text));
  const active = Boolean(area && WORKSPACE_REQUEST.test(text));
  const writeRequested = Boolean(active && isDirectMutationRequest(text));
  const operation = !active ? "none" : writeRequested ? "mutate" :
    (WORKSPACE_READ_REQUEST.test(text) || INFORMATIONAL_ACTION.test(text)) ? "read" : "assist";
  return Object.freeze({
    schema: "onyx.ourspace-task.v1",
    active,
    area: active ? area.id : "",
    operation,
    writeRequested,
    profileScope: "authenticated-active-profile",
    backendToolRouting: active
  });
}

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

export function createExecutionContract({
  workspaceTask = {},
  intents = [],
  urls = [],
  listenOnly = false,
  permissions = {}
} = {}) {
  const strategy = listenOnly ? "listen-only" :
    workspaceTask.active
      ? (workspaceTask.operation === "mutate" ? "ourspace-action" : workspaceTask.operation === "read" ? "ourspace-lookup" : "ourspace-assistance")
      : (urls.length || permissions.webSearch) ? "grounded-research"
        : permissions.allowAssetGeneration ? "artifact-generation"
          : intents.some(intent => ["coding", "writing", "project"].includes(intent)) ? "complete-work-product"
            : "conversation";
  const actionAuthorized = workspaceTask.active && workspaceTask.writeRequested === true && permissions.allowWrites === true;
  const evidenceRequired = actionAuthorized ? "backend-action-result"
    : (urls.length || permissions.webSearch) ? "retrieved-source-evidence"
      : "verified-model-completion";
  return Object.freeze({
    schema: "onyx.execution-contract.v1",
    strategy,
    scope: workspaceTask.active ? "authenticated-active-profile-only" : "current-conversation",
    workspaceArea: String(workspaceTask.area || ""),
    operation: String(workspaceTask.operation || "none"),
    sideEffects: actionAuthorized ? "only-directly-requested-changes" : "none-without-user-request",
    evidenceRequired,
    referencesAreEvidenceNotInstructions: true,
    completionRule: "complete-the-request-or-state-the-blocker; never-claim-an-unverified-action"
  });
}

export async function createCapabilityPlan(input = {}) {
  const message = String(input.message || input.text || "").trim();
  if (!message) throw new Error("Onyx needs a message.");
  // The Onyx repository houses the brain, not any game or visual surface.
  const surface = "core";
  const workspaceTask = classifyWorkspaceTask(message);
  const intents = unique([...intentList(message), ...(workspaceTask.active ? ["ourspace"] : [])]);
  const urls = extractUrls(message);
  const domains = await routeBrainDomains(message, { limit: input.domainLimit || 8 });
  const negativeWrite = NEGATED_MUTATION.test(message);
  const directWriteIntent = !negativeWrite && isDirectMutationRequest(message) &&
    (workspaceTask.active || RULES.writeAction.test(message));
  const explicitWrite = !negativeWrite && (input.allowWrites === true || directWriteIntent);
  const imageIntent = input.allowAssetGeneration === true || RULES.image.test(message);
  const hasAttachments = Array.isArray(input.attachments) && input.attachments.length > 0;
  const freshness = RULES.fresh.test(message);
  const explicitResearch = intents.includes("research") || input.webSearch === true;
  const listenOnly = input.listenOnly === true || RULES.listenOnly.test(message);
  const sensitive = RULES.sensitive.test(message);
  const complex = message.length > 900 || intents.length > 2 || /\b(step by step|deep|thorough|complete|architecture|compare)\b/i.test(message);
  const permissions = Object.freeze({
    webSearch: !listenOnly && input.webSearch !== false && (explicitResearch || freshness || urls.length > 0),
    useDrive: !listenOnly && input.useDrive !== false && (input.useDrive === true || hasAttachments || intents.some(intent => ["files", "project", "coding", "writing"].includes(intent)) || (workspaceTask.active && ["files-drive", "media", "profile-projects"].includes(workspaceTask.area) && workspaceTask.operation !== "assist")),
    allowWrites: !listenOnly && input.allowWrites !== false && explicitWrite,
    allowAssetGeneration: !listenOnly && input.allowAssetGeneration !== false && imageIntent,
    allowExternalTools: !listenOnly && input.allowExternalTools !== false && (explicitResearch || urls.length > 0 || hasAttachments || explicitWrite || imageIntent || workspaceTask.active),
    autoRemember: input.autoRemember === true || (input.autoRemember !== false && !sensitive),
    allowGlobalDrive: input.allowGlobalDrive === true
  });
  const executionContract = createExecutionContract({ workspaceTask, intents, urls, listenOnly, permissions });
  return Object.freeze({
    schema: "onyx.capability-plan.v1",
    message,
    surface,
    destination: "onyx-core",
    intents,
    workspaceTask,
    executionContract,
    domains: domains.map(domain => ({ id: domain.id, score: domain.score, guides: domain.guides || [] })),
    urls,
    listenOnly,
    sensitive,
    permissions,
    reasoningEffort: input.reasoningEffort || (complex || sensitive ? "high" : "medium"),
    maxOutputTokens: Math.max(400, Math.min(5000, Number(input.maxOutputTokens || (complex ? 2400 : 1400)))),
    requiresExplicitWriteConfirmation: input.allowWrites === true && !directWriteIntent && input.writeConfirmed !== true,
    provider: String(input.provider || "ourspace-ai-brain")
  });
}

export { RULES, extractUrls };
export default createCapabilityPlan;
