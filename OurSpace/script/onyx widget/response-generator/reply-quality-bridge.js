/**
 * One narrowly scoped retry for a live reply that plainly misses a casual
 * greeting. It calls the same canonical brain with the same user message,
 * history and profile; only the quality guidance changes. It never substitutes
 * a canned local response or labels a local draft as an LLM completion.
 */
function responseText(result) {
  return String(result?.response || result?.onyxReply || result?.text ||
    result?.result?.response || result?.message?.content || '').trim();
}

const retryGuidance = [
  'VOICE QUALITY RETRY: the prior answer did not answer a casual social check-in.',
  'Answer the person’s latest words directly as Onyx in one or two natural conversational sentences.',
  'If asked how you are, say how you are in the present conversational sense and acknowledge the person.',
  'Do not offer a framework, fact/assumption analysis, troubleshooting plan, checklist, or request that they identify a problem.',
  'Do not mention this retry or the rejected answer. Keep the established Onyx identity, selected profile, lane, and recent-turn continuity.'
].join(' ');

export async function chatWithSocialRepair(payload, {chat, inspectReply, options = {}} = {}) {
  if (typeof chat !== 'function' || typeof inspectReply !== 'function') {
    throw new TypeError('The canonical brain and conversation quality inspector are required.');
  }
  const first = await chat(payload, options);
  const initialReview = inspectReply(payload?.message || payload?.text || '', responseText(first), payload?.lane || payload?.context?.interfaceSurface);
  if (!initialReview?.socialMismatch) return first;

  const context = payload?.context && typeof payload.context === 'object' && !Array.isArray(payload.context)
    ? payload.context : {};
  const voice = context.onyxVoiceGuidance && typeof context.onyxVoiceGuidance === 'object'
    ? context.onyxVoiceGuidance : {};
  const retryPayload = {
    ...payload,
    // The retry is not a second memory-learning event.
    autoRemember: false,
    memoryPolicy: 'off',
    context: {
      ...context,
      onyxVoiceGuidance: {
        ...voice,
        instructions: [voice.instructions, retryGuidance].filter(Boolean).join('\n')
      },
      onyxVoiceQualityRetry: {schema: 'ourspace.onyx.voice-quality-retry.v1', attempt: 1, check: 'social-intent'}
    }
  };
  const second = await chat(retryPayload, options);
  const finalReview = inspectReply(payload?.message || payload?.text || '', responseText(second), payload?.lane || payload?.context?.interfaceSurface);
  return {
    ...second,
    voiceQualityReview: {
      schema: 'ourspace.onyx.voice-quality-review.v1',
      retryCount: 1,
      status: finalReview?.shouldReview ? 'needs-review' : 'passed',
      initialIssue: 'social-intent-mismatch'
    }
  };
}

export {responseText};
