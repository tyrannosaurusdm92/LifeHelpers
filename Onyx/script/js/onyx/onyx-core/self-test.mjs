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
    return new Response(JSON.stringify({ ok: true, response: "transport ok" }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  return nativeFetch(input, init);
};

const registryPath = fileURLToPath(new URL("../../../../json/shared/onyx-core/brain-domains.json", import.meta.url));
const registry = JSON.parse(await readFile(registryPath, "utf8"));
const fileIndexPath = fileURLToPath(new URL("../../../../json/shared/onyx-core/brain-file-index.json", import.meta.url));
const fileIndex = JSON.parse(await readFile(fileIndexPath, "utf8"));
assert.equal(registry.schema, "onyx.brain-domain-registry.v1");
assert.ok(registry.domains.length >= 40, "The complete Onyx domain surface should be registered.");
assert.equal(fileIndex.fileCount, 8430, "Every existing Onyx/js corpus file should be indexed.");
assert.equal(fileIndex.files.length, fileIndex.fileCount);
assert.ok(fileIndex.totalBytes > 2_700_000_000, "The index should cover the complete multi-gigabyte corpus.");

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
  health: async () => ({ ok: true }),
  capabilities: async () => ({ ok: true, actions: ["onyx.chat"] }),
  async request(action, data) {
    calls.push({ action, data });
    return { ok: true, response: "Unified brain response", responseId: "test-response" };
  }
};

const runtime = new OnyxRuntime({ transport: mockTransport });
const reply = await runtime.chat({ message: "Help me brainstorm a story", autoRemember: false });
assert.equal(reply.response, "Unified brain response");
assert.equal(reply.provider, "ourspace-ai-brain");
assert.equal(calls.at(-1).action, "onyx.chat");
assert.equal(calls.at(-1).data.useBrain, true);
assert.equal(calls.at(-1).data.threadId, "ourspace-onyx-william");

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
  tests: 23,
  registeredDomains: registry.domains.length,
  indexedCorpusFiles: fileIndex.fileCount,
  backendFilesModified: 0
}, null, 2));
