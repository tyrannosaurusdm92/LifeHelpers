# Bon Apatite recipe research + coverage pass

This pass expands the game recipe graph without copying third-party recipe instructions.

Research references used for ingredient pairing and cooking-method sanity checks:
- TheMealDB API Guide — https://themealdb.com/docs_api_guide.php (ingredient/category lookup; public recipe API)
- yfchinn/food-recipes-dataset — https://github.com/yfchinn/food-recipes-dataset (866-recipe research dataset: 304 TheMealDB + 562 Food.com)
- Serious Eats, pasta-water technique — https://www.seriouseats.com/tip-for-boiling-pasta-in-less-water-11972027
- Food Network, gravy method — https://www.foodnetwork.com/recipes/food-network-kitchen/perfect-gravy-recipe-1928388
- RecipeDB research paper / public resource — 118,171 recipes, 23,548 ingredients, 268 cooking processes, and 69 utensils; used as a broader sanity-check that the game coverage families span realistic ingredient/process combinations.
- Recipe1M+ research corpus — over one million structured cooking recipes; used as a scale/reference check for broad ingredient co-occurrence rather than copied recipe text.

The generated coverage recipes are original game recipes derived from common pairing families. They are not copied recipe text.

Coverage requirements enforced by machine validation:
- every ingredient ID: at least 50 recipe associations
- every interactive kitchen asset/tool/prop: at least 20 recipe-use associations
- pot liquid contents tracked by ingredient ID
- water + pasta and water/broth + rice pot flows
- broth + flour + heat + wooden-spoon stirring -> gravy


## Coverage semantics

Every catalog ingredient now appears in at least 50 actual recipe records through `gameplay.recipeAssociationIds`. Food/liquid items remain in `requiredIngredientIds`; dry seasonings and fresh herbs remain in the rack/planter workflow through `requiredFlavorIds`, so recipe coverage does not incorrectly force spices into Ingredient Garden inventory.


# Pass 17 difficulty research and game rubric

This pass treats culinary difficulty as a **game-design rubric**, not a universal real-world rating. Research anchors were used to set the ends of the scale, then Feed Him MEOW adds acquisition/prep complexity on top.

Research anchors:
- Food Network, “How to Create Three-Ingredient Recipes” and its related three-ingredient collections: used as support that very small ingredient counts are a reasonable beginner/super-easy pattern and reduce prep burden.
- Food Network, “30 Meals With 5 Ingredients or Less”: used as an easy/weeknight simplicity anchor.
- BBC Good Food, “Five ingredients or less recipes”: used as another easy/quick-fix simplicity anchor.
- Bon Appetit, Char Siu Wellington: used as a multi-component project-dish reference because it involves separately prepared components, assembly, chilling, searing/baking, and sauce work.
- Serious Eats easy salmon examples were reviewed as a reminder that salmon can be easy to cook in real life. Feed Him MEOW intentionally starts **all fish at Medium** anyway because fish recipes invoke the extra Pinball Fishing acquisition route and fish handling state, so the game tier includes whole-run complexity rather than stove technique alone.

Core ingredient count excludes `sauce`, `seasoning`, and `herb` exactly as requested. Liquids and other substantial ingredients still count unless they are one of those three catalog classes.

| Game category | Core ingredients | Garden / generator policy |
|---|---:|---|
| Super Easy | 2–3 | Tier-1 ingredients only; no fish |
| Easy | 3–5 | Tier-1/2 ingredients only; no fish |
| Medium | 5–7 | Fish may begin; tier <=3 |
| Hard | 8–10 | Tier <=4 |
| Super Hard | 11–14 | Tier <=5 |
| Expert | 15–18 | Tier <=6; 15+ guaranteed for core recipes |

The recipe generator and Ingredient Garden must resolve the same six difficulty bands. Garden required objectives and filler candidates are both rejected when `gardenMinimumDifficulty > active recipe difficulty`. This prevents Easy Garden boards from quietly spawning salmon or another higher-tier ingredient as filler.

`My Famous Barbecue Chicken` remains a user-authored featured recipe and is retained as a documented featured exception to the automatic core-count generator; its measured sauces/flavors are preserved.
