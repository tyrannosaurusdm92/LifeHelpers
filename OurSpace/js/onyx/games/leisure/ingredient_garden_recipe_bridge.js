(function (root, factory) {
  "use strict";
  const core = (typeof module !== "undefined" && module.exports) ? require("./garden_randomizer_core.js") : root.GardenRandomizerCore;
  const api = factory(core);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.IngredientGardenRecipeBridge = api;
})(typeof window !== "undefined" ? window : globalThis, function (Core) {
  "use strict";
  if (!Core) throw new Error("GardenRandomizerCore is required.");

  function recipesFrom(catalog) {
    if (Array.isArray(catalog)) return catalog;
    return catalog && Array.isArray(catalog.recipes) ? catalog.recipes : [];
  }

  function ingredientIdsFrom(catalog) {
    if (!catalog) return [];
    if (Array.isArray(catalog.allowedIngredientIds)) return catalog.allowedIngredientIds.slice();
    if (catalog.catalogRules && Array.isArray(catalog.catalogRules.allowedIngredientIds)) return catalog.catalogRules.allowedIngredientIds.slice();
    return [];
  }

  function validateRecipe(recipe, allowedIngredientIds) {
    if (!recipe || !Array.isArray(recipe.ingredients) || !recipe.ingredients.length) throw new Error("Recipe must contain ingredients.");
    const allowed = new Set((allowedIngredientIds || []).map(Core.normalizeId));
    const seen = new Set();
    recipe.ingredients.forEach(function (ingredient) {
      const id = Core.normalizeId(ingredient && ingredient.id);
      if (!id) throw new Error("Recipe contains an ingredient without an id.");
      if (allowed.size && !allowed.has(id)) throw new Error("Recipe ingredient is not in the supplied Ingredient Garden catalogue: " + id);
      if (seen.has(id)) throw new Error("Recipe contains duplicate ingredient id: " + id);
      seen.add(id);
    });
    return true;
  }


  function roundUnits(value) {
    return Math.max(0, Math.round((Number(value) || 0) * 100) / 100);
  }

  function yieldRateForLevel(level, config) {
    level = Math.max(1, Number(level) || 1);
    const pacing = (config && config.pacing) || {};
    const curve = Array.isArray(pacing.yieldCurve) && pacing.yieldCurve.length ? pacing.yieldCurve : [
      { level: 1, rate: 0.92 }, { level: 10, rate: 0.89 }, { level: 25, rate: 0.86 },
      { level: 50, rate: 0.82 }, { level: 90, rate: 0.75 }, { level: 140, rate: 0.68 }
    ];
    const points = curve.map(function (x) { return { level: Math.max(1, Number(x.level) || 1), rate: Number(x.rate) || 0.68 }; }).sort(function (a,b) { return a.level-b.level; });
    const floor = Math.max(0.01, Math.min(1, Number(pacing.minimumYieldRate) || 0.68));
    if (level <= points[0].level) return Math.max(floor, Math.min(1, points[0].rate));
    for (let i = 1; i < points.length; i += 1) {
      const a = points[i-1], b = points[i];
      if (level <= b.level) {
        const t = (level - a.level) / Math.max(1, b.level - a.level);
        const rate = a.rate + (b.rate - a.rate) * t;
        return Math.max(floor, Math.min(1, Math.round(rate * 10000) / 10000));
      }
    }
    return floor;
  }

  function targetRecipeDifficulty(level) {
    level = Math.max(1, Math.floor(Number(level) || 1));
    if (level <= 10) return 1;
    if (level <= 25) return 2;
    if (level <= 50) return 3;
    if (level <= 90) return 4;
    if (level <= 140) return 5;
    return 6;
  }

  function selectRecipe(options) {
    options = options || {};
    const list = recipesFrom(options.catalog);
    if (!list.length) throw new Error("Recipe catalog is empty.");
    const level = Math.max(1, Math.floor(Number(options.level) || 1));
    const seed = Core.makeSeed("recipe", level, options.runSeed || "default-run");
    const rng = Core.rngFromSeed(seed);
    const excluded = new Set((options.excludeRecipeIds || []).map(String));
    const targetDifficulty = targetRecipeDifficulty(level);
    const usable = list.filter(function (r) { return !excluded.has(String(r.id)); });
    const candidates = usable.length ? usable : list;
    const exact = candidates.filter(function (r) { return Math.max(1, Number(r.difficulty) || 1) === targetDifficulty; });
    const pool = exact.length ? exact : candidates;
    const selected = pool[Math.floor(rng() * pool.length)] || pool[0];
    return Core.clone(selected);
  }

  function requiresFishing(recipe, fishIds) {
    const fish = new Set((fishIds || ["salmon", "shrimp"]).map(Core.normalizeId));
    return (recipe && recipe.ingredients || []).some(function (i) { return fish.has(Core.normalizeId(i.id)); });
  }

  function fishRequirements(recipe, fishIds) {
    const fish = new Set((fishIds || ["salmon", "shrimp"]).map(Core.normalizeId));
    return (recipe && recipe.ingredients || []).filter(function (i) { return fish.has(Core.normalizeId(i.id)); }).map(function (i) { return Core.normalizeId(i.id); });
  }

  function generatedUnits(ingredient, context, config) {
    const g = config.gardenUnits || {};
    const level = Math.max(1, Number(context.level) || 1);
    const count = Math.max(1, Number(context.recipeIngredientCount) || 1);
    const recipeDifficulty = Math.max(1, Number(context.recipeDifficulty) || 1);
    const seed = Core.makeSeed("garden-units", context.runSeed, context.recipeId, level, ingredient.id);
    const rng = Core.rngFromSeed(seed);
    const base = Number(g.base) || 3;
    const levelPressure = Math.log2(level + 1) * (Number(g.levelLog2Weight) || 0);
    const recipePressure = recipeDifficulty * (Number(g.recipeDifficultyWeight) || 0);
    const randomPressure = rng() * (Number(g.randomSpread) || 0);
    const recipeReduction = Math.max(0, count - 5) * (Number(g.largeRecipeReductionPerIngredientOver5) || 0);
    const value = Math.round(base + levelPressure + recipePressure + randomPressure - recipeReduction);
    return Math.floor(Core.clamp(value, Number(g.minimumPerIngredient) || 3, Number(g.maximumPerIngredient) || 14));
  }

  function computeObjectives(recipe, context, config, ingredientCatalog) {
    context = context || {}; config = config || {};
    const fishIds = ((config.fishing || {}).fishIngredientIds || ["salmon", "shrimp"]).map(Core.normalizeId);
    const fishSet = new Set(fishIds);
    const aliases = (config.fishing || {}).ingredientCatchAliases || {};
    const inventory = context.fishInventory || {};
    const ingredients = recipe.ingredients || [];
    const gardenMeta = new Map(((ingredientCatalog && ingredientCatalog.ingredients) || []).map(function(x){ return [Core.normalizeId(x.id), x]; }));
    return ingredients.filter(function(ingredient){
      const meta = gardenMeta.get(Core.normalizeId(ingredient.id));
      return !meta || meta.gardenCollectable !== false;
    }).map(function (ingredient) {
      const id = Core.normalizeId(ingredient.id);
      const rawQuota = Math.max(0, Math.floor(Number(ingredient.gardenUnits) || generatedUnits(ingredient, {
        level: context.level,
        runSeed: context.runSeed,
        recipeId: recipe.id,
        recipeIngredientCount: Math.max(1, Number(recipe.difficultyProfile && recipe.difficultyProfile.coreIngredientCount) || ingredients.length),
        recipeDifficulty: recipe.difficulty
      }, config)));
      const pacingMultiplier = Math.max(1, Number(config.pacing && config.pacing.objectiveMultiplier) || 1);
      const recipeRequirementMultiplier = Math.max(1, Number(config.pacing && config.pacing.recipeRequirementMultiplier) || 1);
      const quota = rawQuota > 0 ? Math.max(0.01, roundUnits(rawQuota * pacingMultiplier * recipeRequirementMultiplier)) : 0;
      const yieldRate = yieldRateForLevel(context.level, config);
      const catchId = Core.normalizeId(aliases[id] || id);
      const carried = fishSet.has(id) ? Math.max(0, Number(inventory[id] ?? inventory[catchId]) || 0) : 0;
      const carriedApplied = Math.min(quota, roundUnits(carried));
      const outstanding = roundUnits(Math.max(0, quota - carriedApplied));
      return {
        id: id,
        name: ingredient.name || id,
        amount: ingredient.amount == null ? "" : String(ingredient.amount),
        baseGardenUnits: rawQuota,
        objectiveMultiplier: pacingMultiplier,
        recipeRequirementMultiplier: recipeRequirementMultiplier,
        gardenUnits: quota,
        ingredientYieldRate: yieldRate,
        ingredientYieldPercent: Math.round(yieldRate * 100),
        requiredMatchedTiles: outstanding > 0 ? Math.ceil(outstanding / yieldRate) : 0,
        carriedFromFishing: carriedApplied,
        outstanding: outstanding,
        fish: fishSet.has(id)
      };
    }).filter(function (x) { return x.gardenUnits > 0; });
  }

  function fishingDifficultyModifier(recipe, objectives, fishingPerformance, config) {
    config = config || {};
    const fishing = config.fishing || {};
    if (!requiresFishing(recipe, fishing.fishIngredientIds)) return 1;
    const short = (objectives || []).some(function (x) { return x.fish && x.outstanding > 0; });
    const state = Core.normalizeId(fishingPerformance && (fishingPerformance.state || fishingPerformance.result || fishingPerformance));
    const lowStates = new Set((fishing.lowPerformanceStates || ["low", "poor", "fail", "failed", "partial"]).map(Core.normalizeId));
    return (short || lowStates.has(state)) ? Number(fishing.difficultyMultiplier || 1.05) : 1;
  }

  return Object.freeze({
    version: "1.2.0-pass22-fractional-yield", recipesFrom: recipesFrom, ingredientIdsFrom: ingredientIdsFrom,
    validateRecipe: validateRecipe, selectRecipe: selectRecipe, requiresFishing: requiresFishing,
    fishRequirements: fishRequirements, computeObjectives: computeObjectives,
    fishingDifficultyModifier: fishingDifficultyModifier, targetRecipeDifficulty: targetRecipeDifficulty,
    yieldRateForLevel: yieldRateForLevel
  });
});
