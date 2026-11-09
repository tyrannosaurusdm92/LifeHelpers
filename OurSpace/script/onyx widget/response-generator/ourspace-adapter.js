/**
 * Connects the complete Pass 7 generator to the existing OurSpace Onyx brain.
 * Account requests stay on the authenticated repository bridge. Tester requests
 * reuse OnyxTester and its existing read-only Apps Script session. No Gemini key,
 * token, new endpoint, or second memory system is introduced here.
 */
const PROFILES = new Set(['william', 'jasper']);
const LANES = new Set(['work', 'leisure', 'health', 'professor']);

function textOf(value) {
  if (!value || typeof value !== 'object') return '';
  for (const item of [value.response, value.onyxReply, value.text, value.reply, value.message]) {
    if (typeof item === 'string' && item.trim()) return item.trim();
  }
  return '';
}

export function resolveActiveProfile(root = globalThis.window || globalThis) {
  const candidates = [];
  try { candidates.push(root.OurSpaceBackend?.profile?.()); } catch {}
  try { candidates.push(root.OurSpaceProfiles?.getActiveProfile?.()); } catch {}
  try { candidates.push(root.OnyxBackendClient?.activeProfile?.()); } catch {}
  try { candidates.push(root.OnyxRepositoryBridge?.status?.().profileKey); } catch {}
  try { candidates.push(root.OurSpaceAccess?.profileKey?.(), root.OurSpaceAccess?.profileKey); } catch {}
  try { candidates.push(root.document?.documentElement?.dataset?.ourspaceProfile); } catch {}
  for (const candidate of candidates) {
    const profile = String(candidate || '').trim().toLowerCase();
    if (PROFILES.has(profile)) return profile;
  }
  return '';
}

function supportMode(lane) {
  return lane === 'professor' ? 'dbt' : lane === 'health' ? 'health' : 'chat';
}

function metadata(reply, {tester = false} = {}) {
  const provider = String(reply?.provider || reply?.llmVerification?.provider || reply?.modelProvider || '').toLowerCase();
  return {
    aiBrain: reply?.aiBrain === true || reply?.llmVerified === true,
    provider: provider.includes('gemini') ? 'gemini' : provider || 'unverified',
    mode: reply?.mode || 'chat',
    testerMode: tester ? reply?.testerMode === true : false,
    readOnly: tester ? reply?.accountWritesEnabled === false : true
  };
}

export function createOurSpaceBackendAdapter(root = globalThis.window || globalThis) {
  const tester = root.OnyxTester;
  return Object.freeze({
    async chat({profile, message, mood = 'auto', context = {}, threadId = '', signal} = {}) {
      const who = String(profile || '').toLowerCase();
      const lane = String(context.mode || context.conversationLane || context.interfaceSurface || 'work').toLowerCase();
      const prompt = String(message || '').trim();
      if (!PROFILES.has(who)) throw new Error('A verified William or Jasper profile is required.');
      if (!LANES.has(lane)) throw new Error('Select Work, Leisure, Virtual & Health, or Professor.');
      if (!prompt) throw new Error('Onyx needs the conversation input.');

      if (tester?.active?.()) {
        const status = tester.publicStatus?.() || {};
        if (status.selectedProfile !== who) throw new Error('Select the matching read-only tester profile before generating.');
        const reply = await tester.chat(prompt, {
          mode: lane,
          supportMode: supportMode(lane),
          threadId: String(threadId || `onyx-response-generator-${who}-${lane}`),
          context: {...context, responseGenerator: 'pass7', doNotAutoSaveGeneratorOutput: true},
          signal
        });
        const resultText = textOf(reply);
        if (reply?.testerMode !== true || !resultText) throw new Error('The existing tester backend did not confirm a read-only AI Brain reply.');
        return {
          text: resultText,
          backendResponseId: String(reply.responseId || ''),
          backendLogged: reply.backendLogged === true,
          rawMetadata: metadata(reply, {tester: true})
        };
      }

      const active = resolveActiveProfile(root);
      if (!active) throw new Error('Sign in to William’s or Jasper’s OurSpace account, or verify the existing email tester code in Work.');
      if (active !== who) throw new Error('The selected profile does not match the signed-in OurSpace account.');
      const bridge = root.OnyxRepositoryBridge;
      const status = bridge?.status?.() || {};
      if (!status.available || typeof bridge?.chat !== 'function') {
        throw new Error('The canonical LifeHelpers/Onyx brain is not ready. Reload OurSpace, then try again.');
      }
      const reply = await bridge.chat({
        message: prompt,
        lane,
        mode: lane,
        mood,
        supportMode: supportMode(lane),
        threadId: String(threadId || `onyx-response-generator-${who}-${lane}`),
        context: {...context, responseGenerator: 'pass7', doNotAutoSaveGeneratorOutput: true},
        history: [],
        memoryPolicy: 'off',
        autoRemember: false,
        webSearch: false,
        useDrive: false,
        allowWrites: false,
        allowAssetGeneration: false,
        allowExternalTools: false,
        maxOutputTokens: 1800
      }, {signal, timeoutMs: 180000});
      const resultText = textOf(reply);
      if (reply?.ok === false || !resultText) throw new Error('The canonical Onyx brain returned no reply.');
      if (reply?.llmVerified !== true) throw new Error('A reply arrived, but the canonical brain did not verify an LLM completion.');
      if (reply?.profileVerified !== true) throw new Error('The canonical brain did not verify the signed-in profile for this reply.');
      return {
        text: resultText,
        backendResponseId: String(reply.responseId || ''),
        backendLogged: reply.backendLogged === true,
        rawMetadata: metadata(reply)
      };
    },

    async testerRequest(email) {
      if (!tester?.requestCode) throw new Error('The existing Onyx tester controls are unavailable.');
      return tester.requestCode(email);
    },
    async testerVerify(code) {
      if (!tester?.verifyCode) throw new Error('The existing Onyx tester controls are unavailable.');
      return tester.verifyCode(code);
    },
    async testerSelect(_token, profile) {
      if (!tester?.select) throw new Error('The existing Onyx tester controls are unavailable.');
      return tester.select(profile);
    },
    async testerStatus() { return tester?.publicStatus?.() || {active: false}; },
    async testerExit() {
      if (!tester?.end) throw new Error('The existing Onyx tester controls are unavailable.');
      return tester.end();
    }
  });
}
