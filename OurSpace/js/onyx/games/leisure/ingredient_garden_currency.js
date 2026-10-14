(function (root, factory) {
  "use strict";
  const core = (typeof module !== "undefined" && module.exports) ? require("./garden_randomizer_core.js") : root.GardenRandomizerCore;
  const api = factory(core);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.IngredientGardenCurrency = api;
})(typeof window !== "undefined" ? window : globalThis, function (Core) {
  "use strict";
  if (!Core) throw new Error("GardenRandomizerCore is required.");

  const VALUES = { copper: 1, silver: 10, gold: 100, platinum: 1000 };
  const ORDER = ["copper", "silver", "gold", "platinum"];

  function emptyWallet() { return { copper: 0, silver: 0, gold: 0, platinum: 0 }; }

  function toCopper(wallet) {
    wallet = wallet || {};
    return ORDER.reduce(function (total, id) {
      return total + Math.max(0, Math.floor(Number(wallet[id]) || 0)) * VALUES[id];
    }, 0);
  }

  function fromCopper(total) {
    total = Math.max(0, Math.floor(Number(total) || 0));
    const wallet = emptyWallet();
    wallet.platinum = Math.floor(total / 1000); total %= 1000;
    wallet.gold = Math.floor(total / 100); total %= 100;
    wallet.silver = Math.floor(total / 10); total %= 10;
    wallet.copper = total;
    return wallet;
  }

  function normalize(wallet) { return fromCopper(toCopper(wallet)); }

  function add(wallet, delta) { return fromCopper(toCopper(wallet) + toCopper(delta)); }

  function canAfford(wallet, cost) { return toCopper(wallet) >= toCopper(cost); }

  function spend(wallet, cost) {
    const have = toCopper(wallet), price = toCopper(cost);
    if (price < 0 || have < price) return { ok: false, wallet: normalize(wallet), spent: emptyWallet() };
    return { ok: true, wallet: fromCopper(have - price), spent: normalize(cost) };
  }

  function format(wallet, symbols) {
    const w = normalize(wallet), s = Object.assign({ copper: "🟤", silver: "⚪", gold: "🪙", platinum: "🔘" }, symbols || {});
    return s.copper + w.copper + " " + s.silver + w.silver + " " + s.gold + w.gold + " " + s.platinum + w.platinum;
  }

  function highestSatisfiedBonus(rules, key, value) {
    let best = 0;
    (Array.isArray(rules) ? rules : []).forEach(function (rule) {
      if (Number(value) >= Number(rule[key])) best = Math.max(best, Number(rule.copper) || 0);
    });
    return best;
  }

  function calculateReward(result, currencyConfig) {
    result = result || {};
    const rules = (currencyConfig && currencyConfig.rewardRules) || {};
    if (!result.completed) return { copperEquivalent: 0, wallet: emptyWallet(), breakdown: {} };
    const breakdown = {};
    breakdown.completion = Number(rules.completionCopper) || 0;
    breakdown.firstClear = result.firstClear ? (Number(rules.firstClearCopper) || 0) : 0;
    breakdown.personalBest = result.newPersonalBest ? (Number(rules.newPersonalBestCopper) || 0) : 0;
    breakdown.perfect = result.perfectPerformance ? (Number(rules.perfectPerformanceCopper) || 0) : 0;
    const stars = Core.clamp(Math.floor(Number(result.stars) || 1), 1, 3);
    const starTable = Array.isArray(rules.starCopper) ? rules.starCopper : [0, 1, 3, 6];
    breakdown.stars = Number(starTable[stars]) || 0;
    const scaling = rules.levelScaling || {};
    breakdown.level = Math.min(Number(scaling.maximumCopper) || 18, Math.floor(Math.log2(Math.max(1, Number(result.level) || 1) + 1) * (Number(scaling.multiplier) || 0)));
    breakdown.combo = highestSatisfiedBonus(rules.comboBonuses, "minimumCombo", result.bestCombo || 0);
    breakdown.trace = highestSatisfiedBonus(rules.traceBonuses, "minimumChain", result.bestChain || 0);
    breakdown.remaining = highestSatisfiedBonus(rules.remainingLimitBonuses, "minimumRatio", result.remainingLimitRatio || 0);
    let copper = Object.keys(breakdown).reduce(function (sum, key) { return sum + breakdown[key]; }, 0);
    const multiplier = Math.max(1, Number(result.rewardMultiplier) || 1);
    copper = Math.floor(copper * multiplier);
    return { copperEquivalent: copper, wallet: fromCopper(copper), breakdown: breakdown, multiplier: multiplier };
  }

  return Object.freeze({
    version: "1.0.0", VALUES: VALUES, ORDER: ORDER, emptyWallet: emptyWallet,
    toCopper: toCopper, fromCopper: fromCopper, normalize: normalize, add: add,
    canAfford: canAfford, spend: spend, format: format, calculateReward: calculateReward
  });
});
