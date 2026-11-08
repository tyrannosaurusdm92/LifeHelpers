function stableValue(value, seen = new WeakSet()) {
  if (value === null || typeof value !== "object") {
    if (typeof value === "bigint" || typeof value === "function" || typeof value === "symbol") {
      throw new TypeError("Agent step arguments must be JSON-safe.");
    }
    return value;
  }
  if (seen.has(value)) throw new TypeError("Agent step arguments cannot be circular.");
  seen.add(value);
  if (Array.isArray(value)) {
    const result = value.map(item => stableValue(item, seen));
    seen.delete(value);
    return result;
  }
  const result = {};
  for (const key of Object.keys(value).sort()) result[key] = stableValue(value[key], seen);
  seen.delete(value);
  return result;
}

function stepKey(step) {
  return `${step.tool || step.type || "answer"}:${JSON.stringify(stableValue(step.args || step.input || {}))}`;
}

function safeStepSummary(step) {
  const summary = {
    tool: String(step.tool || step.type || "answer").replace(/[\r\n\t]/g, " ").slice(0, 80),
    write: step.write === true,
    final: step.final === true
  };
  const rawArgs = step.args ?? step.input;
  const args = rawArgs && typeof rawArgs === "object" ? rawArgs : {};
  if (args.area) summary.area = String(args.area).slice(0, 80);
  if (args.operation) summary.operation = String(args.operation).slice(0, 40);
  if (args.url) {
    try {
      const url = new URL(String(args.url));
      summary.target = `${url.origin}${url.pathname}`.slice(0, 260);
    } catch {
      summary.target = "[invalid URL]";
    }
  }
  return Object.freeze(summary);
}

function safeError(error) {
  return String(error?.message || error || "Agent step failed")
    .replace(/https?:\/\/[^\s)]+/gi, "[external URL]")
    .replace(/\b(token|secret|password|api[_-]?key)=([^\s&]+)/gi, "$1=[redacted]")
    .replace(/[\r\n\t]+/g, " ")
    .slice(0, 240);
}

function tracedError(error, trace) {
  const result = error instanceof Error ? error : new Error(String(error));
  result.agentTrace = trace.slice();
  return result;
}

export class BoundedAgent {
  constructor({ maxSteps = 6, requireFinalStep = true } = {}) {
    this.maxSteps = Math.max(1, Math.min(12, Number(maxSteps) || 6));
    this.requireFinalStep = requireFinalStep !== false;
  }

  async run(goal, { plan, execute, verify, signal, writeConfirmed = false } = {}) {
    if (typeof plan !== "function" || typeof execute !== "function") {
      throw new TypeError("BoundedAgent requires plan and execute functions.");
    }
    const trace = [];
    const seen = new Set();
    let state = { goal: String(goal || ""), observations: [], result: null };
    let finalStepReached = false;

    for (let index = 0; index < this.maxSteps; index += 1) {
      if (signal?.aborted) throw signal.reason || new Error("Agent run cancelled.");
      let step;
      try {
        step = await plan({ ...state, index, remaining: this.maxSteps - index });
      } catch (error) {
        trace.push({ index, stage: "plan", ok: false, error: safeError(error), finishedAt: new Date().toISOString() });
        throw tracedError(error, trace);
      }
      if (!step) break;
      if (typeof step !== "object" || Array.isArray(step)) {
        const error = new TypeError("The agent planner returned an invalid step.");
        trace.push({ index, stage: "plan", ok: false, error: safeError(error), finishedAt: new Date().toISOString() });
        throw tracedError(error, trace);
      }
      const toolName = step.tool ?? step.type;
      if ((toolName != null && (typeof toolName !== "string" || toolName.length > 100)) ||
          (step.args != null && (typeof step.args !== "object" || Array.isArray(step.args))) ||
          (step.input != null && (typeof step.input !== "object" || Array.isArray(step.input))) ||
          (step.write != null && typeof step.write !== "boolean")) {
        const error = new TypeError("The agent planner returned an invalid step shape.");
        trace.push({ index, step: safeStepSummary(step), stage: "plan", ok: false, error: safeError(error), finishedAt: new Date().toISOString() });
        throw tracedError(error, trace);
      }

      let key;
      try {
        key = stepKey(step);
      } catch (error) {
        trace.push({ index, stage: "plan", ok: false, error: safeError(error), finishedAt: new Date().toISOString() });
        throw tracedError(error, trace);
      }
      if (seen.has(key)) {
        const error = new Error("Bounded agent stopped a repeated step.");
        trace.push({ index, step: safeStepSummary(step), stage: "plan", ok: false, error: safeError(error), finishedAt: new Date().toISOString() });
        throw tracedError(error, trace);
      }
      seen.add(key);
      if (step.write === true && !writeConfirmed) {
        const error = new Error("A planned write step requires an explicit user request.");
        trace.push({ index, step: safeStepSummary(step), stage: "authorization", ok: false, error: safeError(error), finishedAt: new Date().toISOString() });
        throw tracedError(error, trace);
      }

      const startedAt = new Date().toISOString();
      try {
        const observation = await execute(step, { ...state, index, signal, writeConfirmed });
        trace.push({ index, step: safeStepSummary(step), stage: "execute", ok: true, startedAt, finishedAt: new Date().toISOString() });
        state = { ...state, observations: [...state.observations, observation], result: observation };
        if (step.final === true) {
          finalStepReached = true;
          break;
        }
      } catch (error) {
        trace.push({ index, step: safeStepSummary(step), stage: "execute", ok: false, error: safeError(error), startedAt, finishedAt: new Date().toISOString() });
        throw tracedError(error, trace);
      }
    }

    let verification;
    try {
      const check = typeof verify === "function" ? await verify(state, trace) : { ok: state.result != null };
      const checkResult = typeof check === "boolean" ? { ok: check } : (check && typeof check === "object" ? check : { ok: Boolean(check) });
      const complete = !this.requireFinalStep || finalStepReached;
      verification = Object.freeze({
        ...checkResult,
        ok: complete && checkResult.ok !== false,
        finalStepReached,
        stepLimitReached: trace.length >= this.maxSteps
      });
    } catch (error) {
      trace.push({ stage: "verification", ok: false, error: safeError(error), finishedAt: new Date().toISOString() });
      throw tracedError(error, trace);
    }

    return {
      ok: verification.ok,
      goal: state.goal,
      result: state.result,
      observations: state.observations,
      verification,
      trace
    };
  }
}

export default BoundedAgent;
