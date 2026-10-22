import { ONYX_ACTIONS, ONYX_BACKEND_URL, ONYX_CORE_CONFIG } from "./config.js";
import { ONYX_PUBLIC_PERSONALITY } from "./personality-contract.js";
import { createCapabilityPlan } from "./capability-router.js";
import { loadBrainRegistry, loadBrainFileIndex, routeBrainDomains, searchBrainFiles, loadDomainGuides, loadBrainSources } from "./brain-registry.js";
import { OnyxTransport } from "./transport.js";
import { OnyxToolRegistry } from "./tool-registry.js";
import { OllamaProvider } from "./ollama-provider.js";
import { BoundedAgent } from "./bounded-agent.js";
import { OnyxRuntime } from "./runtime.js";

export const onyx = new OnyxRuntime();

export const OnyxCore = Object.freeze({
  config: ONYX_CORE_CONFIG,
  actions: ONYX_ACTIONS,
  backendUrl: ONYX_BACKEND_URL,
  personality: ONYX_PUBLIC_PERSONALITY,
  runtime: onyx,
  chat: input => onyx.chat(input),
  runAgent: (goal, input) => onyx.runAgent(goal, input),
  connect: options => onyx.connect(options),
  status: () => onyx.status(),
  setAuthContext: context => onyx.setAuthContext(context),
  clearAuthContext: () => onyx.clearAuthContext(),
  configureOllama: options => onyx.configureOllama(options),
  createCapabilityPlan,
  loadBrainRegistry,
  loadBrainFileIndex,
  routeBrainDomains,
  searchBrainFiles,
  loadDomainGuides,
  loadBrainSources,
  classes: Object.freeze({ OnyxRuntime, OnyxTransport, OnyxToolRegistry, OllamaProvider, BoundedAgent })
});

if (typeof globalThis !== "undefined") globalThis.OnyxCore = OnyxCore;

export {
  ONYX_ACTIONS,
  ONYX_BACKEND_URL,
  ONYX_CORE_CONFIG,
  ONYX_PUBLIC_PERSONALITY,
  createCapabilityPlan,
  loadBrainRegistry,
  loadBrainFileIndex,
  routeBrainDomains,
  searchBrainFiles,
  loadDomainGuides,
  loadBrainSources,
  OnyxRuntime,
  OnyxTransport,
  OnyxToolRegistry,
  OllamaProvider,
  BoundedAgent
};

export default OnyxCore;
