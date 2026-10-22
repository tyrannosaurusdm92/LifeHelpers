function stepKey(step) {
  return `${step.tool || step.type || "answer"}:${JSON.stringify(step.args || step.input || {})}`;
}

export class BoundedAgent {
  constructor({ maxSteps = 6 } = {}) {
    this.maxSteps = Math.max(1, Math.min(12, Number(maxSteps) || 6));
  }

  async run(goal, { plan, execute, verify, signal, writeConfirmed = false } = {}) {
    if (typeof plan !== "function" || typeof execute !== "function") throw new TypeError("BoundedAgent requires plan and execute functions.");
    const trace = [];
    const seen = new Set();
    let state = { goal: String(goal || ""), observations: [], result: null };
    for (let index = 0; index < this.maxSteps; index += 1) {
      if (signal?.aborted) throw signal.reason || new Error("Agent run cancelled.");
      const step = await plan({ ...state, index, remaining: this.maxSteps - index });
      if (!step) break;
      const key = stepKey(step);
      if (seen.has(key)) throw new Error("Bounded agent stopped a repeated step.");
      seen.add(key);
      if (step.write === true && !writeConfirmed) throw new Error("A planned write step requires an explicit user request.");
      const startedAt = new Date().toISOString();
      try {
        const observation = await execute(step, { ...state, index, signal, writeConfirmed });
        trace.push({ index, step, ok: true, startedAt, finishedAt: new Date().toISOString() });
        state = { ...state, observations: [...state.observations, observation], result: observation };
        if (step.final === true) break;
      } catch (error) {
        trace.push({ index, step, ok: false, error: String(error?.message || error), startedAt, finishedAt: new Date().toISOString() });
        throw Object.assign(error instanceof Error ? error : new Error(String(error)), { agentTrace: trace });
      }
    }
    const verification = typeof verify === "function" ? await verify(state, trace) : { ok: state.result != null };
    return { ok: verification?.ok !== false, goal: state.goal, result: state.result, observations: state.observations, verification, trace };
  }
}

export default BoundedAgent;
