import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createCapabilityPlan } from "./capability-router.js";
import { searchBrainFiles } from "./brain-registry.js";
import { OnyxRuntime } from "./runtime.js";
import { OnyxToolRegistry } from "./tool-registry.js";
import { OllamaProvider } from "./ollama-provider.js";
import { OnyxTransport } from "./transport.js";
import { ONYX_ACTIONS } from "./config.js";
import { inspectBackendLLMHealth, verifyBackendCompletion, verifyOllamaCompletion } from "./llm-verifier.js";
import { ONYX_DOSSIER_SOURCES, profileContinuityContext, verifyProfileCompletion, ProfileVerificationError } from "./profile-verifier.js";

const nativeFetch = globalThis.fetch;
let transportRequest = null;
globalThis.fetch = async (input, init) => {
  const url = new URL(String(input));
  if (url.protocol === "file:") {
    try { return new Response(await readFile(fileURLToPath(url)), { status: 200 }); }
    catch { return new Response("Not found", { status: 404 }); }
  }
  if (url.hostname === "backend.example.test") {
    transportRequest = { url: url.href, init };
    return new Response(JSON.stringify({ ok: true, response: "transport ok", profileKey: "william" }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  return nativeFetch(input, init);
};

const registryPath = fileURLToPath(new URL("../../../../json/shared/onyx-core/brain-domains.json", import.meta.url));
const registry = JSON.parse(await readFile(registryPath, "utf8"));
const fileIndexPath = fileURLToPath(new URL("../../../../json/shared/onyx-core/brain-file-index.json", import.meta.url));
const fileIndex = JSON.parse(await readFile(fileIndexPath, "utf8"));
const profileContractPath = fileURLToPath(new URL("../../../../json/shared/onyx-core/profile-runtime-contract.json", import.meta.url));
const profileContract = JSON.parse(await readFile(profileContractPath, "utf8"));
assert.equal(registry.schema, "onyx.brain-domain-registry.v1");
assert.ok(registry.domains.length >= 40, "The complete Onyx domain surface should be registered.");
assert.equal(fileIndex.fileCount, 8430, "Every existing Onyx/js corpus file should be indexed.");
assert.equal(fileIndex.files.length, fileIndex.fileCount);
assert.ok(fileIndex.totalBytes > 2_700_000_000, "The index should cover the complete multi-gigabyte corpus.");
assert.equal(profileContract.schema, "onyx.profile-runtime-contract.v1");
assert.equal(profileContract.dossierFingerprints.masterSha256, ONYX_DOSSIER_SOURCES.masterSha256);
assert.equal(profileContract.dossierFingerprints.finchAddendumSha256, ONYX_DOSSIER_SOURCES.finchAddendumSha256);
assert.equal(profileContract.localProvider.profileVerified, false);

const indexedMatches = await searchBrainFiles("ADHD cleaning and decluttering", { domains: [{ id: "adhd" }], limit: 5 });
assert.ok(indexedMatches.length > 0);
assert.ok(indexedMatches.some(match => match.path.startsWith("adhd/")));

const listening = await createCapabilityPlan({ message: "Please just listen; don't advise while I vent." });
assert.equal(listening.listenOnly, true);
assert.equal(listening.permissions.webSearch, false);
assert.equal(listening.permissions.allowWrites, false);

const work = await createCapabilityPlan({ message: "Debug this JavaScript file and write the fixed code." });
assert.equal(work.surface, "core");
assert.ok(work.intents.includes("coding"));
assert.equal(work.permissions.allowWrites, true);
assert.equal(work.requiresExplicitWriteConfirmation, false);

const virtual = await createCapabilityPlan({ message: "Help me plan this room", surface: "virtual" });
assert.equal(virtual.destination, "games/virtual");

const calls = [];
const mockTransport = {
  profileKey: "william",
  authenticated: true,
  snapshot: () => ({ online: true, authenticated: true, profileKey: "william" }),
  subscribe(listener) { listener(this.snapshot()); return () => {}; },
  setAuthContext: context => context,
  clearAuthContext() {},
  health: async () => ({ ok: true, aiBrain: { ok: true, configured: true, version: "test" } }),
  capabilities: async () => ({ ok: true, actions: ["onyx.chat"] }),
  async request(action, data) {
    calls.push({ action, data });
    return { ok: true, aiBrain: true, response: "Unified brain response", responseId: "test-response", profileKey: this.profileKey, personalityFiltered: true };
  }
};

const runtime = new OnyxRuntime({ transport: mockTransport });
const connection = await runtime.connect();
assert.equal(connection.llm.verified, true);
assert.equal(connection.llm.proof, "onyx.health.aiBrain.configured");
const reply = await runtime.chat({
  message: "Help me brainstorm a story",
  autoRemember: false,
  context: { profileContinuity: { expectedProfileKey: "jasper", authority: "caller" } }
});
assert.equal(reply.response, "Unified brain response");
assert.equal(reply.provider, "ourspace-ai-brain");
assert.equal(reply.llmVerified, true);
assert.equal(reply.llmVerification.verificationLevel, "model-completion");
assert.equal(reply.profileVerified, true);
assert.equal(reply.profileVerification.profileKey, "william");
assert.equal(reply.profileVerification.personalityFiltered, true);
assert.equal(calls.at(-1).action, "onyx.chat");
assert.equal(calls.at(-1).data.useBrain, true);
assert.equal(calls.at(-1).data.threadId, "ourspace-onyx-william");
assert.equal(calls.at(-1).data.context.profileContinuity.expectedProfileKey, "william");
assert.equal(calls.at(-1).data.context.profileContinuity.authority, "authenticated-backend-session");
assert.equal(calls.at(-1).data.context.profileContinuity.dossier.masterSha256, ONYX_DOSSIER_SOURCES.masterSha256);

const jasperCalls = [];
const jasperTransport = {
  ...mockTransport,
  profileKey: "jasper",
  snapshot: () => ({ online: true, authenticated: true, profileKey: "jasper" }),
  async request(action, data) {
    jasperCalls.push({ action, data });
    return { ok: true, aiBrain: true, response: "Jasper-profile brain response", responseId: "jasper-response", profileKey: "jasper", personalityFiltered: true };
  }
};
const jasperRuntime = new OnyxRuntime({ transport: jasperTransport });
const jasperReply = await jasperRuntime.chat({ message: "Stay with me while I think this through", autoRemember: false });
assert.equal(jasperReply.profileVerified, true);
assert.equal(jasperReply.profileVerification.profileKey, "jasper");
assert.equal(jasperCalls.at(-1).data.context.profileContinuity.expectedProfileKey, "jasper");

const mismatchedProfileRuntime = new OnyxRuntime({
  transport: {
    ...mockTransport,
    async request() {
      return { ok: true, aiBrain: true, response: "Wrong-profile response", profileKey: "jasper", personalityFiltered: true };
    }
  }
});
await assert.rejects(
  () => mismatchedProfileRuntime.chat({ message: "Hello" }),
  error => error instanceof ProfileVerificationError && /different authenticated profile/i.test(error.message)
);

const unfilteredProfileRuntime = new OnyxRuntime({
  transport: {
    ...mockTransport,
    async request() {
      return { ok: true, aiBrain: true, response: "Unfiltered response", profileKey: "william" };
    }
  }
});
await assert.rejects(
  () => unfilteredProfileRuntime.chat({ message: "Hello" }),
  error => error instanceof ProfileVerificationError && /personality filter/i.test(error.message)
);

const missingProfileRuntime = new OnyxRuntime({
  transport: {
    ...mockTransport,
    async request() {
      return { ok: true, aiBrain: true, response: "Unbound response", personalityFiltered: true };
    }
  }
});
await assert.rejects(
  () => missingProfileRuntime.chat({ message: "Hello" }),
  error => error instanceof ProfileVerificationError && /did not prove which authenticated profile/i.test(error.message)
);

const serverEstablishedProfile = verifyProfileCompletion({ profileKey: "jasper", personalityFiltered: true }, "shared");
assert.equal(serverEstablishedProfile.verified, true);
assert.equal(serverEstablishedProfile.profileKey, "jasper");
const neutralProfileContext = profileContinuityContext("unknown");
assert.equal(neutralProfileContext.expectedProfileKey, "shared");
assert.equal(Object.hasOwn(neutralProfileContext.dossier, "privateText"), false);

assert.equal(inspectBackendLLMHealth({ ok: true, aiBrain: { configured: false } }).verified, false);
assert.throws(() => verifyBackendCompletion({ ok: true, response: "scripted text" }), /did not prove/i);
assert.throws(() => verifyOllamaCompletion({ ok: true, provider: "ollama", model: "test", response: "" }), /verifiable model completion/i);

const unverifiedRuntime = new OnyxRuntime({
  transport: {
    ...mockTransport,
    async request() { return { ok: true, response: "A canned fallback must not pass." }; }
  }
});
await assert.rejects(() => unverifiedRuntime.chat({ message: "Say hello" }), /did not prove/i);

const guardedTools = new OnyxToolRegistry(mockTransport);
await assert.rejects(() => guardedTools.imageGenerate("a black cat"), /explicit user write request/i);

const local = new OllamaProvider({ endpoint: "https://models.example.test", model: "test" });
assert.throws(() => local.configure({ enabled: true }), /non-loopback/i);

const transport = new OnyxTransport({ endpoint: "https://backend.example.test/exec" });
transport.setAuthContext({ sessionToken: "memory-only-test-token", profileKey: "william" });
assert.equal(transport.snapshot().sessionTokenExposed, false);
await transport.request(ONYX_ACTIONS.chat, { message: "hello" });
const packet = JSON.parse(transportRequest.init.body);
assert.equal(packet.action, "onyx.chat");
assert.equal(packet.sessionToken, "memory-only-test-token");
assert.equal(packet.data.sessionToken, undefined);
assert.equal(transportRequest.init.headers["Content-Type"], "text/plain;charset=UTF-8");

console.log(JSON.stringify({
  ok: true,
  tests: 51,
  registeredDomains: registry.domains.length,
  indexedCorpusFiles: fileIndex.fileCount,
  backendFilesModified: 0
}, null, 2));

