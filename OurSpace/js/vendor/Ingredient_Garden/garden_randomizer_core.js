(function (root, factory) {
  "use strict";
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.GardenRandomizerCore = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function clone(value) {
    if (value == null || typeof value !== "object") return value;
    return JSON.parse(JSON.stringify(value));
  }

  function clamp(value, min, max) {
    value = Number(value);
    if (!Number.isFinite(value)) value = min;
    return Math.max(min, Math.min(max, value));
  }

  function hashString(input) {
    let h = 2166136261 >>> 0;
    const s = String(input == null ? "ingredient-garden-seed" : input);
    for (let i = 0; i < s.length; i += 1) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function rngFromSeed(seed) {
    let a = hashString(seed);
    return function rng() {
      a += 0x6D2B79F5;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeSeed() {
    return Array.from(arguments).map(function (v) {
      if (v == null) return "";
      if (typeof v === "object") return stableStringify(v);
      return String(v);
    }).join("::");
  }

  function stableStringify(value) {
    if (value == null || typeof value !== "object") return JSON.stringify(value);
    if (Array.isArray(value)) return "[" + value.map(stableStringify).join(",") + "]";
    return "{" + Object.keys(value).sort().map(function (k) {
      return JSON.stringify(k) + ":" + stableStringify(value[k]);
    }).join(",") + "}";
  }

  function int(rng, min, max) {
    min = Math.ceil(min); max = Math.floor(max);
    return Math.floor(rng() * (max - min + 1)) + min;
  }

  function pick(rng, list) {
    if (!Array.isArray(list) || !list.length) return null;
    return list[Math.min(list.length - 1, Math.floor(rng() * list.length))];
  }

  function shuffle(rng, list) {
    const out = Array.isArray(list) ? list.slice() : [];
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      const t = out[i]; out[i] = out[j]; out[j] = t;
    }
    return out;
  }

  function weightedPick(rng, entries, weightAccessor) {
    const list = Array.isArray(entries) ? entries.filter(Boolean) : [];
    if (!list.length) return null;
    const weights = list.map(function (entry) {
      const raw = typeof weightAccessor === "function" ? weightAccessor(entry) :
        (entry && typeof entry === "object" ? entry.weight : 1);
      return Math.max(0, Number(raw) || 0);
    });
    const total = weights.reduce(function (a, b) { return a + b; }, 0);
    if (total <= 0) return pick(rng, list);
    let roll = rng() * total;
    for (let i = 0; i < list.length; i += 1) {
      roll -= weights[i];
      if (roll <= 0) return list[i];
    }
    return list[list.length - 1];
  }

  function weightedId(rng, weights) {
    const entries = Object.keys(weights || {}).map(function (id) { return { id: id, weight: weights[id] }; });
    const selected = weightedPick(rng, entries);
    return selected ? selected.id : null;
  }

  function scoreAndPick(rng, candidates, scoreFn) {
    const scored = (Array.isArray(candidates) ? candidates : []).map(function (candidate) {
      return { candidate: candidate, score: Math.max(0.0001, Number(scoreFn(candidate)) || 0.0001) };
    }).sort(function (a, b) { return b.score - a.score; });
    return weightedPick(rng, scored, function (x) { return x.score; });
  }

  function normalizeId(value) {
    return String(value == null ? "" : value).trim().toLowerCase().replace(/[\s-]+/g, "_").replace(/[^a-z0-9_]/g, "");
  }

  return Object.freeze({
    version: "1.0.0",
    clone: clone, clamp: clamp, hashString: hashString, rngFromSeed: rngFromSeed,
    makeSeed: makeSeed, stableStringify: stableStringify, int: int, pick: pick,
    shuffle: shuffle, weightedPick: weightedPick, weightedId: weightedId,
    scoreAndPick: scoreAndPick, normalizeId: normalizeId
  });
});
