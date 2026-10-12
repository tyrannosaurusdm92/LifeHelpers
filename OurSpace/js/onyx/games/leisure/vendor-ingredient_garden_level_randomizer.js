(function (root, factory) {
  "use strict";
  const isNode = typeof module !== "undefined" && module.exports;
  const Core = isNode ? require("./garden_randomizer_core.js") : root.GardenRandomizerCore;
  const RecipeBridge = isNode ? require("./ingredient_garden_recipe_bridge.js") : root.IngredientGardenRecipeBridge;
  const Currency = isNode ? require("./ingredient_garden_currency.js") : root.IngredientGardenCurrency;
  const api = factory(Core, RecipeBridge, Currency);
  if (isNode) module.exports = api;
  root.IngredientGardenLevelRandomizer = api;
})(typeof window !== "undefined" ? window : globalThis, function (Core, RecipeBridge, Currency) {
  "use strict";
  if (!Core || !RecipeBridge || !Currency) throw new Error("Ingredient Garden randomizer dependencies are missing.");

  const BOARD_LAYOUTS = [{"id":"board-type1","number":1,"name":"Greenhouse Starter","topology":"full","width":8,"height":8,"cellCount":64,"rows":["11111111","11111111","11111111","11111111","11111111","11111111","11111111","11111111"],"difficulty":2,"features":["regular-grid","downward-gravity"],"unlockLevel":1,"satellites":[],"sourceMoves":31},{"id":"board-type2","number":2,"name":"Sunlit Tall Rows","topology":"full","width":8,"height":10,"cellCount":80,"rows":["11111111","11111111","11111111","11111111","11111111","11111111","11111111","11111111","11111111","11111111"],"difficulty":2,"features":["regular-grid","downward-gravity"],"unlockLevel":4,"satellites":[],"sourceMoves":32},{"id":"board-type3","number":3,"name":"Orchard Highway","topology":"full","width":10,"height":8,"cellCount":80,"rows":["1111111111","1111111111","1111111111","1111111111","1111111111","1111111111","1111111111","1111111111"],"difficulty":3,"features":["regular-grid","downward-gravity"],"unlockLevel":7,"satellites":[],"sourceMoves":26},{"id":"board-type4","number":4,"name":"Rounded Seedbed","topology":"rounded","width":9,"height":9,"cellCount":73,"rows":["001111100","111111111","111111111","111111111","111111111","111111111","111111111","111111111","001111100"],"difficulty":2,"features":["irregular-grid","downward-gravity"],"unlockLevel":10,"satellites":[],"sourceMoves":31},{"id":"board-type5","number":5,"name":"Diamond Orchard","topology":"diamond","width":9,"height":9,"cellCount":41,"rows":["000010000","000111000","001111100","011111110","111111111","011111110","001111100","000111000","000010000"],"difficulty":3,"features":["irregular-grid","downward-gravity"],"unlockLevel":12,"satellites":[],"sourceMoves":28},{"id":"board-type6","number":6,"name":"Hourglass Harvest","topology":"hourglass","width":9,"height":9,"cellCount":51,"rows":["111111111","011111110","001111100","000111000","000111000","000111000","001111100","011111110","111111111"],"difficulty":3,"features":["irregular-grid","downward-gravity"],"unlockLevel":15,"satellites":[],"sourceMoves":26},{"id":"board-type7","number":7,"name":"Crossvine Beds","topology":"cross","width":9,"height":9,"cellCount":45,"rows":["000111000","000111000","000111000","111111111","111111111","111111111","000111000","000111000","000111000"],"difficulty":3,"features":["irregular-grid","downward-gravity"],"unlockLevel":18,"satellites":[],"sourceMoves":27},{"id":"board-type8","number":8,"name":"Clover Crown","topology":"clover","width":9,"height":9,"cellCount":60,"rows":["000000000","001111110","011111111","011111111","011111111","011111111","011111111","011111111","001111110"],"difficulty":2,"features":["irregular-grid","downward-gravity"],"unlockLevel":21,"satellites":[],"sourceMoves":32},{"id":"board-type9","number":9,"name":"Twin Terrace Beds","topology":"twin","width":10,"height":8,"cellCount":68,"rows":["1111001111","1111001111","1111001111","1111111111","1111111111","1111001111","1111001111","1111001111"],"difficulty":3,"features":["irregular-grid","downward-gravity","linked-mini-boards","satellite-effects-main-board"],"unlockLevel":24,"satellites":[{"id":"board-type9-satellite-1","name":"Pollen Pod","width":3,"height":5,"cellCount":15,"rows":["111","111","111","111","111"],"effect":{"type":"unlock-main-cells","target":"main","cells":[{"x":4,"y":0},{"x":5,"y":0}]},"display":{"placement":"left","scale":0.58,"zIndex":1}}],"sourceMoves":26},{"id":"board-type10","number":10,"name":"Stacked Pocket Orchard","topology":"stacked-side-pockets","width":9,"height":8,"cellCount":62,"rows":["011111110","111111111","111111111","110011011","110011011","111111111","111111111","011111110"],"difficulty":3,"features":["screenshot-inspired-layout","starting-special-pieces","blocker-layers","satellite-effects-main-board","irregular-grid","downward-gravity","linked-mini-boards"],"unlockLevel":27,"satellites":[{"id":"board-type10-satellite-1","name":"Music Pod","width":4,"height":4,"cellCount":16,"rows":["1111","1111","1111","1111"],"effect":{"type":"clear-main-blockers","target":"main","cells":[{"x":1,"y":1},{"x":4,"y":3}],"layers":["dirt","ice","cn","jam"]},"display":{"placement":"left","scale":0.5,"zIndex":1}},{"id":"board-type10-satellite-2","name":"Root Cellar","width":5,"height":4,"cellCount":16,"rows":["01110","11111","11111","01110"],"effect":{"type":"open-main-gate","target":"main","gateId":"board-type10-gate-2","cells":[{"x":1,"y":1}]},"display":{"placement":"right","scale":0.5,"zIndex":2}}],"sourceMoves":27},{"id":"board-type11","number":11,"name":"Split Garden Beds","topology":"split-garden","width":8,"height":8,"cellCount":52,"rows":["11100111","01111110","11111111","11100111","11100111","11111111","01111110","11100111"],"difficulty":2,"features":["irregular-grid","downward-gravity"],"unlockLevel":29,"satellites":[],"sourceMoves":32},{"id":"board-type12","number":12,"name":"Cross-Channel Conveyor","topology":"segmented-horizontal-lanes","width":12,"height":9,"cellCount":78,"rows":["111111111111","111111111111","001111111100","000111111000","000011110000","000011110000","001111111100","111111111111","111111111111"],"difficulty":2,"features":["screenshot-inspired-layout","starting-special-pieces","blocker-layers","satellite-effects-main-board","irregular-grid","downward-gravity","linked-mini-boards"],"unlockLevel":32,"satellites":[{"id":"board-type12-satellite-1","name":"Seed Tray","width":5,"height":3,"cellCount":15,"rows":["11111","11111","11111"],"effect":{"type":"add-main-moves","target":"main","amount":4},"display":{"placement":"left","scale":0.5,"zIndex":1}},{"id":"board-type12-satellite-2","name":"Side Garden","width":5,"height":4,"cellCount":18,"rows":["11011","11111","11111","11011"],"effect":{"type":"charge-main-booster","target":"main","booster":"garden-bloom","charge":2},"display":{"placement":"right","scale":0.5,"zIndex":2}}],"sourceMoves":30},{"id":"board-type13","number":13,"name":"Three Sprout Satellites","topology":"layered-main-and-pods","width":11,"height":10,"cellCount":74,"rows":["11111111111","11111111111","00111111100","00011111000","00001110000","00001110000","00011111000","00111111100","11111111111","11111111111"],"difficulty":3,"features":["screenshot-inspired-layout","starting-special-pieces","blocker-layers","satellite-effects-main-board","irregular-grid","downward-gravity","linked-mini-boards"],"unlockLevel":35,"satellites":[{"id":"board-type13-satellite-1","name":"Side Garden","width":5,"height":4,"cellCount":18,"rows":["11011","11111","11111","11011"],"effect":{"type":"open-main-gate","target":"main","gateId":"board-type13-gate-1","cells":[{"x":5,"y":1}]},"display":{"placement":"left","scale":0.5,"zIndex":1}},{"id":"board-type13-satellite-2","name":"Key Room","width":3,"height":5,"cellCount":15,"rows":["111","111","111","111","111"],"effect":{"type":"shift-main-gravity","target":"main","direction":"left","durationMoves":4},"display":{"placement":"right","scale":0.5,"zIndex":2}},{"id":"board-type13-satellite-3","name":"Order Dock","width":4,"height":4,"cellCount":16,"rows":["1111","1111","1111","1111"],"effect":{"type":"clear-main-blockers","target":"main","cells":[{"x":5,"y":1},{"x":5,"y":4},{"x":1,"y":8},{"x":9,"y":8}],"layers":["dirt","ice","cn","jam"]},"display":{"placement":"top","scale":0.5,"zIndex":3}}],"sourceMoves":27},{"id":"board-type14","number":14,"name":"Keyhole Garden Lattice","topology":"stacked-keyhole-lanes","width":8,"height":12,"cellCount":72,"rows":["00111100","01111110","11111111","11111111","01111110","00111100","00111100","01111110","11111111","11111111","01111110","00111100"],"difficulty":2,"features":["screenshot-inspired-layout","starting-special-pieces","blocker-layers","satellite-effects-main-board","irregular-grid","downward-gravity","linked-mini-boards"],"unlockLevel":38,"satellites":[{"id":"board-type14-satellite-1","name":"Key Room","width":3,"height":5,"cellCount":15,"rows":["111","111","111","111","111"],"effect":{"type":"release-main-seeds","target":"main","ingredient":"carrots","count":3,"entryCells":[{"x":2,"y":0},{"x":3,"y":0}]},"display":{"placement":"left","scale":0.5,"zIndex":1}},{"id":"board-type14-satellite-2","name":"Order Dock","width":4,"height":4,"cellCount":16,"rows":["1111","1111","1111","1111"],"effect":{"type":"open-main-bridge","target":"main","cells":[{"x":0,"y":0},{"x":1,"y":0},{"x":6,"y":0}],"bridgeId":"board-type14-bridge-2"},"display":{"placement":"right","scale":0.5,"zIndex":2}},{"id":"board-type14-satellite-3","name":"Music Pod","width":5,"height":4,"cellCount":16,"rows":["01110","11111","11111","01110"],"effect":{"type":"drop-ingredient-to-main","target":"main","ingredient":"garden keys","count":3,"exitCell":{"x":2,"y":0}},"display":{"placement":"top","scale":0.5,"zIndex":3}}],"sourceMoves":32},{"id":"board-type15","number":15,"name":"Split-Lane Ingredient Run","topology":"split-lane-with-gates","width":9,"height":12,"cellCount":90,"rows":["011111110","111111111","110110111","110110111","111111111","011111110","001111100","111111111","110110111","110110111","111111111","011111110"],"difficulty":3,"features":["screenshot-inspired-layout","starting-special-pieces","blocker-layers","satellite-effects-main-board","irregular-grid","downward-gravity","linked-mini-boards"],"unlockLevel":41,"satellites":[{"id":"board-type15-satellite-1","name":"Order Dock","width":4,"height":4,"cellCount":16,"rows":["1111","1111","1111","1111"],"effect":{"type":"charge-main-booster","target":"main","booster":"garden-bloom","charge":1},"display":{"placement":"left","scale":0.5,"zIndex":1}},{"id":"board-type15-satellite-2","name":"Music Pod","width":5,"height":4,"cellCount":16,"rows":["01110","11111","11111","01110"],"effect":{"type":"unlock-main-cells","target":"main","cells":[{"x":0,"y":0},{"x":8,"y":0},{"x":2,"y":2}],"bridgeId":"board-type15-bridge-2"},"display":{"placement":"right","scale":0.5,"zIndex":2}}],"sourceMoves":26},{"id":"board-type16","number":16,"name":"Twin Order Trays","topology":"stepped-order-trays","width":10,"height":12,"cellCount":96,"rows":["0011111100","0111111110","1111111111","1111111111","0111111110","0011111100","0011111100","0111111110","1111111111","1111111111","0111111110","0011111100"],"difficulty":2,"features":["screenshot-inspired-layout","starting-special-pieces","blocker-layers","satellite-effects-main-board","irregular-grid","downward-gravity","linked-mini-boards"],"unlockLevel":44,"satellites":[{"id":"board-type16-satellite-1","name":"Music Pod","width":5,"height":4,"cellCount":16,"rows":["01110","11111","11111","01110"],"effect":{"type":"shift-main-gravity","target":"main","direction":"down","durationMoves":3},"display":{"placement":"left","scale":0.5,"zIndex":1}},{"id":"board-type16-satellite-2","name":"Root Cellar","width":5,"height":3,"cellCount":15,"rows":["11111","11111","11111"],"effect":{"type":"clear-main-blockers","target":"main","cells":[{"x":3,"y":1},{"x":6,"y":2},{"x":2,"y":4}],"layers":["dirt","ice","cn","jam"]},"display":{"placement":"right","scale":0.5,"zIndex":2}}],"sourceMoves":31},{"id":"board-type17","number":17,"name":"Music-Box Seed Vault","topology":"keyed-music-pockets","width":9,"height":12,"cellCount":86,"rows":["011111110","111111111","111111111","110111011","110011011","110001011","110001011","110011011","110111011","111111111","111111111","011111110"],"difficulty":3,"features":["screenshot-inspired-layout","starting-special-pieces","blocker-layers","satellite-effects-main-board","irregular-grid","downward-gravity","linked-mini-boards"],"unlockLevel":46,"satellites":[{"id":"board-type17-satellite-1","name":"Root Cellar","width":5,"height":3,"cellCount":15,"rows":["11111","11111","11111"],"effect":{"type":"open-main-bridge","target":"main","cells":[{"x":0,"y":0},{"x":8,"y":0}],"bridgeId":"board-type17-bridge-1"},"display":{"placement":"left","scale":0.5,"zIndex":1}},{"id":"board-type17-satellite-2","name":"Seed Tray","width":5,"height":4,"cellCount":18,"rows":["11011","11111","11111","11011"],"effect":{"type":"drop-ingredient-to-main","target":"main","ingredient":"flower buds","count":2,"exitCell":{"x":1,"y":0}},"display":{"placement":"right","scale":0.5,"zIndex":2}}],"sourceMoves":28},{"id":"board-type18","number":18,"name":"S-Path Greenway","topology":"sshape","width":9,"height":9,"cellCount":66,"rows":["111111111","111111111","000011111","000011111","001111111","001111111","111111000","111111111","111111111"],"difficulty":3,"features":["irregular-grid","downward-gravity","linked-mini-boards","satellite-effects-main-board"],"unlockLevel":49,"satellites":[{"id":"board-type18-satellite-1","name":"Seed Shed","width":5,"height":4,"cellCount":18,"rows":["11011","11111","11111","11011"],"effect":{"type":"unlock-main-cells","target":"main","cells":[{"x":0,"y":2},{"x":1,"y":2}]},"display":{"placement":"left","scale":0.58,"zIndex":1}}],"sourceMoves":26},{"id":"board-type19","number":19,"name":"Stairway to Spring","topology":"staircase","width":8,"height":10,"cellCount":50,"rows":["11111000","11111000","01111100","01111100","01111100","00111110","00111110","00111110","00011111","00011111"],"difficulty":2,"features":["irregular-grid","downward-gravity"],"unlockLevel":52,"satellites":[],"sourceMoves":31},{"id":"board-type20","number":20,"name":"Pyramid Pantry","topology":"pyramid","width":9,"height":9,"cellCount":57,"rows":["001111000","001111000","001111100","001111110","001111110","011111110","111111110","111111110","111111111"],"difficulty":3,"features":["irregular-grid","downward-gravity"],"unlockLevel":55,"satellites":[],"sourceMoves":28},{"id":"board-type21","number":21,"name":"Inverted Orchard","topology":"inverted","width":9,"height":9,"cellCount":57,"rows":["111111111","111111110","111111110","011111110","001111110","001111110","001111100","001111000","001111000"],"difficulty":3,"features":["irregular-grid","downward-gravity"],"unlockLevel":58,"satellites":[],"sourceMoves":26},{"id":"board-type22","number":22,"name":"Four Petal Beds","topology":"fourpetal","width":9,"height":9,"cellCount":65,"rows":["001111100","001111100","111111111","111111111","111111111","111111111","111111111","001111100","001111100"],"difficulty":2,"features":["irregular-grid","downward-gravity"],"unlockLevel":61,"satellites":[],"sourceMoves":31},{"id":"board-type23","number":23,"name":"Blooming Garden","topology":"bloom","width":11,"height":11,"cellCount":112,"rows":["00011111100","01111111111","01111111111","11111111111","11111111111","11111111111","11111111111","11111111111","11111111111","01111111111","01111111111"],"difficulty":3,"features":["irregular-grid","downward-gravity"],"unlockLevel":63,"satellites":[],"sourceMoves":28},{"id":"board-type24","number":24,"name":"Honeycomb Beds","topology":"honeycomb","width":10,"height":9,"cellCount":76,"rows":["0011111100","1111111111","0111111110","1111111111","0111111110","1111111111","0111111110","1111111111","0011111100"],"difficulty":3,"features":["irregular-grid","downward-gravity"],"unlockLevel":66,"satellites":[],"sourceMoves":26},{"id":"board-type25","number":25,"name":"Winding Creek","topology":"meander","width":10,"height":10,"cellCount":54,"rows":["0011111100","0000111110","0000011111","0000111111","0001111100","0011111000","1111110000","1111100000","0111110000","0011111100"],"difficulty":3,"features":["irregular-grid","downward-gravity"],"unlockLevel":69,"satellites":[],"sourceMoves":27},{"id":"board-type26","number":26,"name":"Forked River Plot","topology":"fork","width":11,"height":10,"cellCount":62,"rows":["11111110111","11101110111","11101111111","11101110111","11101110111","00001110000","00001110000","00001110000","00001110000","00001110000"],"difficulty":3,"features":["irregular-grid","downward-gravity"],"unlockLevel":72,"satellites":[],"sourceMoves":28},{"id":"board-type27","number":27,"name":"Funnel Field","topology":"funnel","width":9,"height":10,"cellCount":66,"rows":["111111111","111111111","011111110","001111100","000111000","000111000","000111000","111111111","111111111","111111111"],"difficulty":2,"features":["irregular-grid","downward-gravity","linked-mini-boards","satellite-effects-main-board"],"unlockLevel":75,"satellites":[{"id":"board-type27-satellite-1","name":"Pollen Pod","width":5,"height":3,"cellCount":15,"rows":["11111","11111","11111"],"effect":{"type":"unlock-main-cells","target":"main","cells":[{"x":0,"y":2},{"x":8,"y":2}]},"display":{"placement":"left","scale":0.58,"zIndex":1}}],"sourceMoves":30},{"id":"board-type28","number":28,"name":"Pinwheel Patch","topology":"pinwheel","width":9,"height":9,"cellCount":54,"rows":["001111100","001111100","111100111","110111011","110111011","110111011","111000111","001111100","001111100"],"difficulty":3,"features":["irregular-grid","downward-gravity"],"unlockLevel":78,"satellites":[],"sourceMoves":27},{"id":"board-type29","number":29,"name":"Keyhole Gate","topology":"keyhole","width":9,"height":10,"cellCount":52,"rows":["000111000","011111110","011111110","111111111","011111110","011111110","000111000","000111000","000111000","000111000"],"difficulty":3,"features":["irregular-grid","downward-gravity"],"unlockLevel":80,"satellites":[],"sourceMoves":28},{"id":"board-type30","number":30,"name":"Four Courtyards","topology":"courtyards","width":11,"height":9,"cellCount":99,"rows":["11111111111","11111111111","11111111111","11111111111","11111111111","11111111111","11111111111","11111111111","11111111111"],"difficulty":3,"features":["regular-grid","downward-gravity","linked-mini-boards","satellite-effects-main-board"],"unlockLevel":83,"satellites":[{"id":"board-type30-satellite-1","name":"Seed Shed","width":4,"height":4,"cellCount":16,"rows":["1111","1111","1111","1111"],"effect":{"type":"add-main-moves","target":"main","amount":4},"display":{"placement":"left","scale":0.58,"zIndex":1}}],"sourceMoves":26},{"id":"board-type31","number":31,"name":"Central Spine Garden","topology":"spine","width":9,"height":10,"cellCount":60,"rows":["111111000","111111000","111111000","000111111","000111111","000111111","111111000","111111000","000111111","000111111"],"difficulty":2,"features":["irregular-grid","downward-gravity"],"unlockLevel":86,"satellites":[],"sourceMoves":31},{"id":"board-type32","number":32,"name":"Diagonal Stair Farm","topology":"diagonal","width":10,"height":10,"cellCount":44,"rows":["1110000000","1111000000","1111100000","0111110000","0011111000","0001111100","0000111110","0000011111","0000001111","0000000111"],"difficulty":3,"features":["irregular-grid","downward-gravity"],"unlockLevel":89,"satellites":[],"sourceMoves":28},{"id":"board-type33","number":33,"name":"Riverbend Orchard","topology":"riverbend","width":9,"height":9,"cellCount":44,"rows":["001111100","000111110","000011111","000001111","000011111","001111110","011111000","111110000","111100000"],"difficulty":3,"features":["irregular-grid","downward-gravity"],"unlockLevel":92,"satellites":[],"sourceMoves":26},{"id":"board-type34","number":34,"name":"Lower Basin","topology":"lowerbasin","width":10,"height":10,"cellCount":70,"rows":["0001110000","0001110000","0001110000","0011111000","0111111100","1111111110","1111111111","1111111111","1111111111","1111111111"],"difficulty":3,"features":["irregular-grid","downward-gravity"],"unlockLevel":95,"satellites":[],"sourceMoves":27},{"id":"board-type35","number":35,"name":"Upper Basin","topology":"upperbasin","width":10,"height":10,"cellCount":81,"rows":["1111111111","1111111111","1111111111","1111111111","1111111111","1111111111","0111111110","0011111100","0001111000","0001110000"],"difficulty":3,"features":["irregular-grid","downward-gravity","linked-mini-boards","satellite-effects-main-board"],"unlockLevel":97,"satellites":[{"id":"board-type35-satellite-1","name":"Compost Nook","width":4,"height":4,"cellCount":16,"rows":["1111","1111","1111","1111"],"effect":{"type":"open-main-bridge","target":"main","cells":[{"x":0,"y":6},{"x":9,"y":6},{"x":0,"y":7}],"bridgeId":"board-type35-bridge-1"},"display":{"placement":"left","scale":0.58,"zIndex":1}}],"sourceMoves":28},{"id":"board-type36","number":36,"name":"Double Ring Beds","topology":"doublering","width":11,"height":9,"cellCount":61,"rows":["01111111111","11111111111","11000110001","10000110000","10000110000","10000110000","11000110001","11111111111","01111111111"],"difficulty":3,"features":["irregular-grid","downward-gravity"],"unlockLevel":100,"satellites":[],"sourceMoves":26},{"id":"board-type37","number":37,"name":"Triple Pantry","topology":"triple","width":11,"height":8,"cellCount":78,"rows":["11111111111","11111111111","11111111111","00000000010","11111111111","11111111111","11111111111","11111111111"],"difficulty":3,"features":["irregular-grid","downward-gravity","linked-mini-boards","satellite-effects-main-board"],"unlockLevel":103,"satellites":[{"id":"board-type37-satellite-1","name":"Bee Annex","width":5,"height":3,"cellCount":15,"rows":["11111","11111","11111"],"effect":{"type":"clear-main-blockers","target":"main","cells":[{"x":1,"y":1},{"x":5,"y":5}],"layers":["dirt","ice","cn","jam"]},"display":{"placement":"left","scale":0.46,"zIndex":1}},{"id":"board-type37-satellite-2","name":"Root Cellar","width":5,"height":4,"cellCount":18,"rows":["11011","11111","11111","11011"],"effect":{"type":"open-main-gate","target":"main","gateId":"board-type37-gate-2","cells":[{"x":1,"y":1}]},"display":{"placement":"right","scale":0.46,"zIndex":2}}],"sourceMoves":27},{"id":"board-type38","number":38,"name":"Parallel Beds","topology":"parallel","width":10,"height":9,"cellCount":62,"rows":["1110000111","1110000111","1111111111","1110000111","1110000111","1110000111","1111111111","1110000111","1110000111"],"difficulty":2,"features":["irregular-grid","downward-gravity"],"unlockLevel":106,"satellites":[],"sourceMoves":32},{"id":"board-type39","number":39,"name":"Garden Wall Doors","topology":"doors","width":10,"height":10,"cellCount":84,"rows":["1111001111","1111001111","1111111111","1111001111","1111001111","1111001111","1111001111","1111111111","1111001111","1111001111"],"difficulty":3,"features":["irregular-grid","downward-gravity"],"unlockLevel":109,"satellites":[],"sourceMoves":26},{"id":"board-type40","number":40,"name":"Rainbow Rapids Track","topology":"rapids","width":10,"height":10,"cellCount":70,"rows":["1111111000","1111111000","1111111000","0001111111","0001111111","0001111111","1111111000","1111111000","1111111000","0001111111"],"difficulty":3,"features":["irregular-grid","downward-gravity"],"unlockLevel":112,"satellites":[],"sourceMoves":27},{"id":"board-type41","number":41,"name":"Three-Island Archipelago","topology":"archipelago","width":11,"height":9,"cellCount":61,"rows":["01110000000","11111000000","11111110000","11111111000","11111111100","00111111111","00011111111","00001111111","00000011111"],"difficulty":3,"features":["irregular-grid","downward-gravity","linked-mini-boards","satellite-effects-main-board"],"unlockLevel":114,"satellites":[{"id":"board-type41-satellite-1","name":"Compost Nook","width":5,"height":4,"cellCount":16,"rows":["01110","11111","11111","01110"],"effect":{"type":"release-main-seeds","target":"main","ingredient":"coconuts","count":3,"entryCells":[{"x":1,"y":0},{"x":2,"y":0}]},"display":{"placement":"left","scale":0.46,"zIndex":1}},{"id":"board-type41-satellite-2","name":"Seed Shed","width":5,"height":3,"cellCount":15,"rows":["11111","11111","11111"],"effect":{"type":"open-main-bridge","target":"main","cells":[{"x":0,"y":0},{"x":4,"y":0},{"x":5,"y":0}],"bridgeId":"board-type41-bridge-2"},"display":{"placement":"right","scale":0.46,"zIndex":2}}],"sourceMoves":28},{"id":"board-type42","number":42,"name":"Comb Rows","topology":"comb","width":10,"height":9,"cellCount":90,"rows":["1111111111","1111111111","1111111111","1111111111","1111111111","1111111111","1111111111","1111111111","1111111111"],"difficulty":2,"features":["regular-grid","downward-gravity"],"unlockLevel":117,"satellites":[],"sourceMoves":30},{"id":"board-type43","number":43,"name":"Ribbon of Vines","topology":"ribbon","width":10,"height":10,"cellCount":59,"rows":["0011111100","0000111111","0000011111","0000111111","0011111100","1111110000","1111100000","1111110000","0111111100","0000111111"],"difficulty":3,"features":["irregular-grid","downward-gravity","linked-mini-boards","satellite-effects-main-board"],"unlockLevel":120,"satellites":[{"id":"board-type43-satellite-1","name":"Bee Annex","width":5,"height":4,"cellCount":18,"rows":["11011","11111","11111","11011"],"effect":{"type":"shift-main-gravity","target":"main","direction":"down","durationMoves":3},"display":{"placement":"left","scale":0.58,"zIndex":1}}],"sourceMoves":27},{"id":"board-type44","number":44,"name":"Double Chamber Garden","topology":"doublechamber","width":11,"height":9,"cellCount":93,"rows":["11111011111","11111011111","11111011111","11111111111","11111111111","11111111111","11111011111","11111011111","11111011111"],"difficulty":3,"features":["irregular-grid","downward-gravity","linked-mini-boards","satellite-effects-main-board"],"unlockLevel":123,"satellites":[{"id":"board-type44-satellite-1","name":"Root Cellar","width":3,"height":5,"cellCount":15,"rows":["111","111","111","111","111"],"effect":{"type":"open-main-bridge","target":"main","cells":[{"x":5,"y":0},{"x":5,"y":1},{"x":5,"y":2}],"bridgeId":"board-type44-bridge-1"},"display":{"placement":"left","scale":0.46,"zIndex":1}},{"id":"board-type44-satellite-2","name":"Pollen Pod","width":4,"height":4,"cellCount":16,"rows":["1111","1111","1111","1111"],"effect":{"type":"drop-ingredient-to-main","target":"main","ingredient":"green beans","count":2,"exitCell":{"x":0,"y":0}},"display":{"placement":"right","scale":0.46,"zIndex":2}}],"sourceMoves":28},{"id":"board-type45","number":45,"name":"Branching Orchard","topology":"branching","width":10,"height":10,"cellCount":58,"rows":["1110110111","0111111110","0011111100","0011111100","0001111000","0000110000","0001111000","0011111100","0011111100","0111111110"],"difficulty":3,"features":["irregular-grid","downward-gravity","linked-mini-boards","satellite-effects-main-board"],"unlockLevel":126,"satellites":[{"id":"board-type45-satellite-1","name":"Pollen Pod","width":4,"height":4,"cellCount":16,"rows":["1111","1111","1111","1111"],"effect":{"type":"unlock-main-cells","target":"main","cells":[{"x":3,"y":0},{"x":6,"y":0}]},"display":{"placement":"left","scale":0.58,"zIndex":1}}],"sourceMoves":26},{"id":"board-type46","number":46,"name":"Spiral Pocket Garden","topology":"spiral","width":11,"height":11,"cellCount":100,"rows":["11111111111","11111111111","11011000011","11111111011","11111111011","11111100011","11011100011","11011100011","11000111111","11111111111","11111111111"],"difficulty":3,"features":["irregular-grid","downward-gravity","linked-mini-boards","satellite-effects-main-board"],"unlockLevel":129,"satellites":[{"id":"board-type46-satellite-1","name":"Waterwheel","width":5,"height":4,"cellCount":16,"rows":["01110","11111","11111","01110"],"effect":{"type":"clear-main-blockers","target":"main","cells":[{"x":5,"y":3},{"x":2,"y":5}],"layers":["dirt","ice","cn","jam"]},"display":{"placement":"left","scale":0.46,"zIndex":1}},{"id":"board-type46-satellite-2","name":"Compost Nook","width":5,"height":3,"cellCount":15,"rows":["11111","11111","11111"],"effect":{"type":"open-main-gate","target":"main","gateId":"board-type46-gate-2","cells":[{"x":5,"y":3}]},"display":{"placement":"right","scale":0.46,"zIndex":2}}],"sourceMoves":27},{"id":"board-type47","number":47,"name":"Ladder Greenhouse","topology":"ladder","width":10,"height":10,"cellCount":70,"rows":["1111111111","1100000011","1111111111","1100000011","1111111111","1100000011","1111111111","1100000011","1111111111","1100000011"],"difficulty":3,"features":["irregular-grid","downward-gravity","linked-mini-boards","satellite-effects-main-board"],"unlockLevel":131,"satellites":[{"id":"board-type47-satellite-1","name":"Compost Nook","width":5,"height":3,"cellCount":15,"rows":["11111","11111","11111"],"effect":{"type":"drop-ingredient-to-main","target":"main","ingredient":"cucumbers","count":1,"exitCell":{"x":0,"y":0}},"display":{"placement":"left","scale":0.58,"zIndex":1}}],"sourceMoves":28},{"id":"board-type48","number":48,"name":"Crown Canopy","topology":"crown","width":11,"height":9,"cellCount":93,"rows":["11101110111","11101110111","11101110111","11111111111","11111111111","11111111111","11111111111","11111111111","11111111111"],"difficulty":2,"features":["irregular-grid","downward-gravity","linked-mini-boards","satellite-effects-main-board"],"unlockLevel":134,"satellites":[{"id":"board-type48-satellite-1","name":"Seed Shed","width":5,"height":4,"cellCount":18,"rows":["11011","11111","11111","11011"],"effect":{"type":"add-main-moves","target":"main","amount":4},"display":{"placement":"left","scale":0.46,"zIndex":1}},{"id":"board-type48-satellite-2","name":"Bee Annex","width":3,"height":5,"cellCount":15,"rows":["111","111","111","111","111"],"effect":{"type":"charge-main-booster","target":"main","booster":"garden-bloom","charge":2},"display":{"placement":"right","scale":0.46,"zIndex":2}}],"sourceMoves":30},{"id":"board-type49","number":49,"name":"Slalom Beds","topology":"slalom","width":10,"height":10,"cellCount":50,"rows":["1111100000","1111100000","0000111110","0000111110","1111100000","1111100000","0000111110","0000111110","1111100000","1111100000"],"difficulty":3,"features":["irregular-grid","downward-gravity","linked-mini-boards","satellite-effects-main-board"],"unlockLevel":137,"satellites":[{"id":"board-type49-satellite-1","name":"Bee Annex","width":3,"height":5,"cellCount":15,"rows":["111","111","111","111","111"],"effect":{"type":"open-main-gate","target":"main","gateId":"board-type49-gate-1","cells":[{"x":6,"y":7}]},"display":{"placement":"left","scale":0.58,"zIndex":1}}],"sourceMoves":27},{"id":"board-type50","number":50,"name":"Bowtie Bridges","topology":"bowtie","width":10,"height":8,"cellCount":60,"rows":["1111001111","1111111111","1111111111","0000110000","0000110000","1111111111","1111111111","1111001111"],"difficulty":3,"features":["irregular-grid","downward-gravity","linked-mini-boards","satellite-effects-main-board"],"unlockLevel":140,"satellites":[{"id":"board-type50-satellite-1","name":"Root Cellar","width":4,"height":4,"cellCount":16,"rows":["1111","1111","1111","1111"],"effect":{"type":"release-main-seeds","target":"main","ingredient":"blackberries","count":3,"entryCells":[{"x":0,"y":0},{"x":1,"y":0}]},"display":{"placement":"left","scale":0.46,"zIndex":1}},{"id":"board-type50-satellite-2","name":"Pollen Pod","width":5,"height":4,"cellCount":16,"rows":["01110","11111","11111","01110"],"effect":{"type":"open-main-bridge","target":"main","cells":[{"x":4,"y":0},{"x":5,"y":0},{"x":0,"y":3}],"bridgeId":"board-type50-bridge-2"},"display":{"placement":"right","scale":0.46,"zIndex":2}}],"sourceMoves":28}];

  function sumOutstanding(objectives) {
    return (objectives || []).reduce(function (sum, item) { return sum + Math.max(0, Number(item.outstanding) || 0); }, 0);
  }

  function modeFor(rng, config) {
    return Core.weightedId(rng, config.modeWeights || { trace: 0.5, swap: 0.5 }) || "swap";
  }

  function difficultyFor(level, recipe, objectives, fishingModifier, config) {
    const d = config.difficulty || {};
    const ingredientCount = Math.max(1, Number(recipe.difficultyProfile && recipe.difficultyProfile.coreIngredientCount) || (recipe.ingredients || []).length);
    const totalUnits = sumOutstanding(objectives);
    const base = Math.min(Number(d.maximumBase) || 0.97,
      (Number(d.base) || 0.08) +
      Math.log2(level + 1) * (Number(d.levelLog2Weight) || 0) +
      ingredientCount * (Number(d.recipeIngredientWeight) || 0) +
      totalUnits * (Number(d.targetUnitWeight) || 0) +
      Math.max(1, Number(recipe.difficulty) || 1) * (Number(d.recipeDifficultyWeight) || 0)
    );
    const effective = base * Number(fishingModifier || 1);
    return { base: Number(base.toFixed(6)), fishingModifier: Number(fishingModifier || 1), effective: Number(effective.toFixed(6)), normalized: Number(Math.min(1, effective).toFixed(6)) };
  }

  function requiredMatchedTiles(objectives) {
    return (objectives || []).reduce(function (sum, item) {
      const rate = Math.max(0.01, Number(item.ingredientYieldRate) || 1);
      const remaining = Math.max(0, Number(item.outstanding) || 0);
      return sum + (remaining > 0 ? Math.ceil(remaining / rate) : 0);
    }, 0);
  }

  function chooseLimit(rng, level, difficulty, objectives, recipe, accessibility, config, mode) {
    const limits = config.limits || {}, pacing = config.pacing || {}, planning = pacing.movePlanning || {};
    const excludeTimed = !!(accessibility && accessibility.excludeTimedLevels);
    const timedAllowed = !excludeTimed && level >= (Number(limits.timedUnlockLevel) || 1);
    let type = "moves";
    if (timedAllowed) type = Core.weightedId(rng, { moves: Number(limits.moveWeight) || 0.82, time: Number(limits.timeWeight) || 0.18 }) || "moves";
    const ingredientCount = Math.max(1, objectives.filter(function (x) { return Number(x.outstanding) > 0; }).length || Number(recipe.difficultyProfile && recipe.difficultyProfile.coreIngredientCount) || (recipe.ingredients || []).length);
    const matchedTiles = Math.max(1, requiredMatchedTiles(objectives));
    const efficiencyMap = planning.expectedObjectiveTilesPerTurn || {};
    const expectedPerTurn = Math.max(1, Number(efficiencyMap[mode]) || (mode === "trace" ? 4 : 2.2));
    const productiveTurns = Math.max(1, Math.ceil(matchedTiles / expectedPerTurn));
    const safety = Math.max(1, (Number(planning.baseSafetyMultiplier) || 1.15) + difficulty.normalized * (Number(planning.difficultySafetyBonus) || 0.12));
    const diversityTurns = Math.ceil(ingredientCount * Math.max(0, Number(planning.ingredientDiversityTurns) || 0.25));
    const plannedMoves = Math.max(Number(planning.minimumMoveBudget) || 4, Math.ceil(productiveTurns * safety) + diversityTurns);
    if (type === "time") {
      const secondsPerTurn = Math.max(1, Number(planning.timedSecondsPerPlannedTurn) || 5);
      const baseSeconds = Math.max(0, Number(planning.timedBaseSeconds) || 18);
      const minSeconds = Math.max(1, Number(planning.minimumTimedSeconds) || Number((limits.timeSeconds || {}).minimum) || 40);
      const configuredMaxSeconds = Math.max(minSeconds, Number(planning.maximumTimedSeconds) || Number((limits.timeSeconds || {}).maximum) || 3600);
      const seconds = Math.ceil(baseSeconds + plannedMoves * secondsPerTurn);
      // Playability wins over an arbitrary ceiling: never shorten a timed board below its objective-derived plan.
      const maxSeconds = Math.max(configuredMaxSeconds, seconds);
      return { type: "time", timeSeconds: Math.floor(Core.clamp(seconds, minSeconds, maxSeconds)), moves: null, plannedMoves: plannedMoves, requiredMatchedTiles: matchedTiles, expectedObjectiveTilesPerTurn: expectedPerTurn };
    }
    const m = limits.moves || {};
    const minMoves = Math.max(1, Number(planning.minimumMoveBudget) || Number(m.minimum) || 4);
    const maxMoves = Math.max(plannedMoves, Number(m.maximum) || 999);
    return { type: "moves", moves: Math.floor(Core.clamp(plannedMoves, minMoves, maxMoves)), timeSeconds: null, plannedMoves: plannedMoves, requiredMatchedTiles: matchedTiles, expectedObjectiveTilesPerTurn: expectedPerTurn };
  }

  function activeIngredientPool(rng, recipe, objectives, ingredientCatalog, difficulty, config) {
    const required = objectives.filter(function (x) { return x.outstanding > 0; }).map(function (x) { return x.id; });
    const recipeDifficulty = Math.max(1, Math.min(6, Number(recipe && recipe.difficulty) || 1));
    const all = (ingredientCatalog && ingredientCatalog.ingredients || []).filter(function (x) {
      const minDifficulty = Math.max(1, Number(x.gardenMinimumDifficulty || x.minimumDifficulty || 1));
      return x.gardenCollectable !== false && x.fillerEligible !== false && minDifficulty <= recipeDifficulty;
    }).map(function (x) { return x.id; });
    const allowed = new Set(all);
    const invalidRequired = required.filter(function(id){ return !allowed.has(id); });
    if (invalidRequired.length) throw new Error('Recipe contains Ingredient Garden objectives above its difficulty band: ' + invalidRequired.join(', '));
    const board = config.board || {};
    const minActive = Math.max(required.length, Number(board.minimumActiveIngredients) || 5);
    const maxActive = Math.max(required.length, Number(board.maximumActiveIngredients) || 10);
    const desired = Math.floor(Core.clamp(minActive + Math.round(difficulty.normalized * 3), minActive, maxActive));
    const filler = Core.shuffle(rng, all.filter(function (id) { return required.indexOf(id) < 0; }));
    const pool = required.slice();
    for (let i = 0; pool.length < desired && i < filler.length; i += 1) pool.push(filler[i]);
    if (pool.length < 3) {
      for (let i = 0; pool.length < 3 && i < all.length; i += 1) if (pool.indexOf(all[i]) < 0) pool.push(all[i]);
    }
    return pool;
  }

  function spawnWeights(pool, objectives, config) {
    const rule = config.spawnWeights || {};
    const byId = Object.create(null);
    objectives.forEach(function (x) { byId[x.id] = x; });
    const maxOutstanding = Math.max(1, ...objectives.map(function (x) { return x.outstanding; }));
    const out = {};
    pool.forEach(function (id) {
      const obj = byId[id];
      if (!obj || obj.outstanding <= 0) out[id] = Number(rule.filler) || 1;
      else out[id] = (Number(rule.requiredBase) || 4.2) + (obj.outstanding / maxOutstanding) * (Number(rule.requiredOutstandingBonus) || 2.4);
    });
    return out;
  }

  function weightedIngredient(rng, candidates, weights) {
    return Core.weightedPick(rng, candidates, function (id) { return weights[id] == null ? 1 : weights[id]; });
  }

  function matchSet(board, rows, cols) {
    const found = new Set();
    function idx(r, c) { return r * cols + c; }
    for (let r = 0; r < rows; r += 1) {
      let start = 0;
      while (start < cols) {
        let end = start + 1;
        while (end < cols && board[idx(r, end)] === board[idx(r, start)]) end += 1;
        if (board[idx(r, start)] && end - start >= 3) for (let c = start; c < end; c += 1) found.add(idx(r, c));
        start = end;
      }
    }
    for (let c = 0; c < cols; c += 1) {
      let start = 0;
      while (start < rows) {
        let end = start + 1;
        while (end < rows && board[idx(end, c)] === board[idx(start, c)]) end += 1;
        if (board[idx(start, c)] && end - start >= 3) for (let r = start; r < end; r += 1) found.add(idx(r, c));
        start = end;
      }
    }
    return found;
  }

  function legalSwapExists(board, rows, cols) {
    function idx(r, c) { return r * cols + c; }
    for (let r = 0; r < rows; r += 1) for (let c = 0; c < cols; c += 1) {
      const a = idx(r, c);
      const tests = [[r, c + 1], [r + 1, c]];
      for (let k = 0; k < tests.length; k += 1) {
        const rr = tests[k][0], cc = tests[k][1];
        if (rr >= rows || cc >= cols) continue;
        const b = idx(rr, cc);
        if (board[a] === board[b]) continue;
        const copy = board.slice();
        const t = copy[a]; copy[a] = copy[b]; copy[b] = t;
        if (matchSet(copy, rows, cols).size) return true;
      }
    }
    return false;
  }

  function traceChainExists(board, rows, cols, minChain) {
    const seen = new Set();
    function idx(r, c) { return r * cols + c; }
    for (let start = 0; start < board.length; start += 1) {
      if (seen.has(start)) continue;
      const type = board[start];
      if (!type) { seen.add(start); continue; }
      const stack = [start]; let count = 0;
      while (stack.length) {
        const pos = stack.pop();
        if (seen.has(pos) || board[pos] !== type) continue;
        seen.add(pos); count += 1;
        const r = Math.floor(pos / cols), c = pos % cols;
        for (let dr = -1; dr <= 1; dr += 1) for (let dc = -1; dc <= 1; dc += 1) {
          if (!dr && !dc) continue;
          const rr = r + dr, cc = c + dc;
          if (rr < 0 || rr >= rows || cc < 0 || cc >= cols) continue;
          const n = idx(rr, cc);
          if (!seen.has(n) && board[n] === type) stack.push(n);
        }
      }
      if (count >= minChain) return true;
    }
    return false;
  }

  function fillSwapBoard(rng, rows, cols, pool, weights) {
    const board = new Array(rows * cols);
    function idx(r, c) { return r * cols + c; }
    for (let r = 0; r < rows; r += 1) for (let c = 0; c < cols; c += 1) {
      const banned = new Set();
      if (c >= 2 && board[idx(r, c - 1)] === board[idx(r, c - 2)]) banned.add(board[idx(r, c - 1)]);
      if (r >= 2 && board[idx(r - 1, c)] === board[idx(r - 2, c)]) banned.add(board[idx(r - 1, c)]);
      let candidates = pool.filter(function (id) { return !banned.has(id); });
      if (!candidates.length) candidates = pool;
      board[idx(r, c)] = weightedIngredient(rng, candidates, weights);
    }
    return board;
  }

  function topologyMask(rows, cols, id) {
    const mask = Array(rows * cols).fill(true);
    const off = (r,c) => { if (r>=0&&r<rows&&c>=0&&c<cols) mask[r*cols+c]=false; };
    if (id === "ring_bed") {
      const r0=Math.floor(rows/2)-1,c0=Math.floor(cols/2)-1; for(let r=r0;r<r0+2;r++)for(let c=c0;c<c0+2;c++)off(r,c);
    } else if (id === "diamond") {
      for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const edge=Math.min(r,rows-1-r)+Math.min(c,cols-1-c);if(edge<1)off(r,c);}
    } else if (id === "split_garden") {
      const c=Math.floor(cols/2)-1; for(let r=1;r<rows-1;r++) if(![2,5].includes(r)) { off(r,c); off(r,c+1); }
    } else if (id === "terraces") {
      off(0,0);off(0,1);off(1,0);off(0,cols-1);off(rows-1,0);off(rows-1,1);off(rows-2,0);off(rows-1,cols-1);
    } else if (id === "flower_cross") {
      const mr=Math.floor(rows/2),mc=Math.floor(cols/2); off(mr-1,mc-1);off(mr-1,mc);off(mr,mc-1);off(mr,mc);
      off(0,0);off(0,cols-1);off(rows-1,0);off(rows-1,cols-1);
    } else if (id === "twin_islands") {
      const c=Math.floor(cols/2)-1; for(let r=0;r<rows;r++) if(![1,4,6].includes(r)){off(r,c);off(r,c+1);}
    }
    return mask;
  }

  function layoutMask(layout) {
    const rows = Number(layout.height) || 8, cols = Number(layout.width) || 8;
    const strings = Array.isArray(layout.rows) ? layout.rows : [];
    const mask = [];
    for (let r = 0; r < rows; r += 1) {
      const line = String(strings[r] || "").padEnd(cols, "0");
      for (let c = 0; c < cols; c += 1) mask.push(line[c] === "1");
    }
    return mask;
  }

  function boardLayoutFor(rng, level, difficulty, forceId) {
    if (forceId) {
      const exact = BOARD_LAYOUTS.find(function (x) { return x.id === forceId || String(x.number) === String(forceId); });
      if (exact) return exact;
    }
    const unlocked = BOARD_LAYOUTS.filter(function (x) { return level >= Number(x.unlockLevel || 1); });
    if (!unlocked.length) return BOARD_LAYOUTS[0] || null;
    // Layout families are level-stable so every one of the 50 imported shapes
    // appears across the main progression instead of being left to chance.
    const target = 1 + Math.floor(Math.min(139, Math.max(0, level - 1)) * 49 / 139);
    return unlocked.reduce(function (best, x) {
      const bd=Math.abs(Number(best.number)-target),xd=Math.abs(Number(x.number)-target);
      return xd<bd?x:best;
    }, unlocked[0]);
  }

  function topologyFor(rng, level, difficulty, config, forceId) {
    const layout = boardLayoutFor(rng, level, difficulty, forceId);
    if (layout) {
      return {
        id: layout.topology || layout.id,
        layoutId: layout.id,
        layoutNumber: layout.number,
        layoutName: layout.name,
        rows: Number(layout.height) || 8,
        cols: Number(layout.width) || 8,
        mask: layoutMask(layout),
        satellites: Core.clone(layout.satellites || []),
        features: Core.clone(layout.features || []),
        sourceMoves: Number(layout.sourceMoves) || null
      };
    }
    const b=config.board||{},rows=Number(b.rows)||8,cols=Number(b.cols)||8;
    return{id:"classic",layoutId:"classic",layoutName:"Classic Garden",rows,cols,mask:topologyMask(rows,cols,"classic"),satellites:[]};
  }

  function fillSwapBoardMasked(rng, rows, cols, pool, weights, mask) {
    const board = new Array(rows * cols).fill(null); const idx=(r,c)=>r*cols+c;
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
      const at=idx(r,c); if(!mask[at]) continue; const banned=new Set();
      if(c>=2&&mask[idx(r,c-1)]&&mask[idx(r,c-2)]&&board[idx(r,c-1)]===board[idx(r,c-2)])banned.add(board[idx(r,c-1)]);
      if(r>=2&&mask[idx(r-1,c)]&&mask[idx(r-2,c)]&&board[idx(r-1,c)]===board[idx(r-2,c)])banned.add(board[idx(r-1,c)]);
      let candidates=pool.filter(id=>!banned.has(id));if(!candidates.length)candidates=pool;board[at]=weightedIngredient(rng,candidates,weights);
    }
    return board;
  }

  function generateBoard(rng, mode, pool, weights, config, topology) {
    const b=config.board||{},rows=Math.max(3,Number(topology?.rows)||Number(b.rows)||8),cols=Math.max(3,Number(topology?.cols)||Number(b.cols)||8),attempts=Number(b.maxGenerationAttempts)||240,mask=topology?.mask||topologyMask(rows,cols,"classic");
    for(let attempt=0;attempt<attempts;attempt++){
      const board=mode==="swap"?fillSwapBoardMasked(rng,rows,cols,pool,weights,mask):Array.from({length:rows*cols},(_,i)=>mask[i]?weightedIngredient(rng,pool,weights):null);
      if(mode==="swap"){
        if(!matchSet(board,rows,cols).size&&legalSwapExists(board,rows,cols))return{rows,cols,cells:board,activeMask:mask,topology:topology?.id||"classic",layoutId:topology?.layoutId||topology?.id||"classic",layoutName:topology?.layoutName||topology?.id||"Classic Garden",layoutNumber:topology?.layoutNumber||null,features:Core.clone(topology?.features||[]),generationAttempts:attempt+1,startsPlayable:true};
      }else if(traceChainExists(board,rows,cols,Number((config.trace||{}).minimumChain)||3))return{rows,cols,cells:board,activeMask:mask,topology:topology?.id||"classic",layoutId:topology?.layoutId||topology?.id||"classic",layoutName:topology?.layoutName||topology?.id||"Classic Garden",layoutNumber:topology?.layoutNumber||null,features:Core.clone(topology?.features||[]),generationAttempts:attempt+1,startsPlayable:true};
    }
    throw new Error("Unable to generate a playable Ingredient Garden board for this seed/configuration.");
  }

  function programFor(rng,level,difficulty,config){
    const defs=[
      {id:'calm_beds',unlock:1,weight:2.4,focus:null,description:'Open beds with light garden pressure.'},
      {id:'petal_release',unlock:14,weight:2.6,focus:'flower',description:'Strip flower petals to release protected ingredients.'},
      {id:'vine_watch',unlock:18,weight:2.7,focus:'vine',description:'Cut creeping vines before they lock more ingredients.'},
      {id:'muddy_patch',unlock:20,weight:2.0,focus:'mud',description:'Sticky mud and soft ground create a slower, messier planting bed.'},
      {id:'honey_hive',unlock:22,weight:2.15,focus:'honey',description:'Honey traps ingredients while bees drift between protected cells.'},
      {id:'quicksand_bog',unlock:26,weight:1.75,focus:'quicksand',description:'Quicksand periodically sinks unattended ingredients and forces quick rescues.'},
      {id:'thorn_maze',unlock:32,weight:2.0,focus:'thorn',description:'Layered thorns turn the board into a pruning puzzle.'},
      {id:'cascade_orchard',unlock:24,weight:2.0,focus:'cascade',description:'Pre-seeded specials reward deliberate chain reactions.'},
      {id:'relay_greenhouse',unlock:Number(config.multiBoard?.unlockLevel||18),weight:2.1,focus:'relay',description:'A linked mini-garden feeds effects into the main bed.'},
      {id:'mixed_ecology',unlock:48,weight:2.0,focus:'mixed',description:'Flowers, vines, bees, honey, mud, thorns, and cascades interact together.'}
    ].filter(x=>level>=x.unlock);
    const chosen=Core.weightedPick(rng,defs,x=>x.weight*(x.id==='mixed_ecology'?(.5+difficulty.normalized):1))||defs[0];return Core.clone(chosen);
  }

  function blockersFor(rng, level, difficulty, board, config, program) {
    const rules=config.blockers||{},hazards=config.hazards||{},available=(rules.types||[]).filter(x=>level>=Number(x.unlockLevel||1));if(!available.length)return[];
    const raw=Math.floor(difficulty.normalized*(Number(rules.countDifficultyWeight)||8)+Math.log2(level+1)*(Number(rules.levelLog2Weight)||.7)-3),count=Math.floor(Core.clamp(raw,0,Number(rules.maximumCells)||14));
    const rows=board.rows,cols=board.cols,eligible=(board.activeMask||board.cells.map(Boolean)).map((ok,i)=>ok&&board.cells[i]?i:null).filter(i=>i!=null),open=new Set(eligible),out=[];
    const typeWeight=x=>{let w=Number(x.weight)||1;if(program?.focus===x.id)w*=3.2;if(program?.focus==='mixed'&&['flower','vine','thorn','mud','quicksand','honey','bee'].includes(x.id))w*=1.65;if(program?.focus==='cascade'&&['concrete','chain'].includes(x.id))w*=.55;return w};
    const edge=i=>{const r=Math.floor(i/cols),c=i%cols;return r===0||c===0||r===rows-1||c===cols-1};
    const centerScore=i=>{const r=Math.floor(i/cols),c=i%cols;return Math.abs(r-(rows-1)/2)+Math.abs(c-(cols-1)/2)};
    for(let k=0;k<count&&open.size>12;k++){
      const type=Core.weightedPick(rng,available,typeWeight);if(!type)break;let candidates=[...open];
      if(type.id==='vine'){const e=candidates.filter(edge);if(e.length)candidates=e;}
      else if(type.id==='mud'||type.id==='quicksand'){
        const low=candidates.filter(i=>Math.floor(i/cols)>=Math.floor(rows*.45));if(low.length)candidates=low;
      }
      else if(type.id==='honey'){
        const mid=candidates.slice().sort((a,b)=>centerScore(a)-centerScore(b));candidates=mid.slice(0,Math.max(6,Math.ceil(mid.length*.65)));
      }
      else if(type.id==='bee'){
        const anchors=out.filter(x=>['flower','honey'].includes(x.type)).map(x=>x.cell);if(anchors.length){const near=candidates.filter(i=>anchors.some(f=>{const a=Math.floor(i/cols),b=i%cols,c=Math.floor(f/cols),d=f%cols;return Math.abs(a-c)+Math.abs(b-d)<=2}));if(near.length)candidates=near;}
      }
      else if(type.id==='flower'){
        const flowers=out.filter(x=>x.type==='flower').map(x=>x.cell);if(flowers.length){const near=new Set();for(const f of flowers){const r=Math.floor(f/cols),c=f%cols;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const rr=r+dr,cc=c+dc,n=rr*cols+cc;if(rr>=0&&rr<rows&&cc>=0&&cc<cols&&open.has(n))near.add(n)}}if(near.size)candidates=[...near];}
        else candidates.sort((a,b)=>centerScore(a)-centerScore(b));
      } else if(type.id==='thorn'){
        const flowers=out.filter(x=>x.type==='flower').map(x=>x.cell);if(flowers.length){const near=candidates.filter(i=>flowers.some(f=>{const a=Math.floor(i/cols),b=i%cols,c=Math.floor(f/cols),d=f%cols;return Math.abs(a-c)+Math.abs(b-d)<=2}));if(near.length)candidates=near;}
      }
      const span=type.id==='flower'&&!out.some(x=>x.type==='flower')?Math.max(1,Math.ceil(candidates.length*.38)):candidates.length,cell=candidates[Math.floor(rng()*span)];if(cell==null)continue;open.delete(cell);let layer=Core.int(rng,1,Math.max(1,Number(type.maxLayer)||1));if(type.id==='flower'){const f=hazards.flower||{};layer=Core.int(rng,Number(f.minPetals)||2,Number(f.maxPetals)||4);}else if(type.id==='honey'){const h=hazards.honey||{};layer=Core.int(rng,Number(h.minLayers)||1,Number(h.maxLayers)||3);}else if(type.id==='quicksand'){const q=hazards.quicksand||{};layer=Core.int(rng,Number(q.minDepth)||1,Number(q.maxDepth)||3);}out.push({cell,type:type.id,layer});
    }
    return out;
  }

  function seedInitialSpecials(rng,board,difficulty,program){
    let count=program?.focus==='cascade'?Math.max(1,Math.round(1+difficulty.normalized*2)):difficulty.normalized>.74?1:0;if(!count)return[];const cells=(board.activeMask||[]).map((ok,i)=>ok&&board.cells[i]?i:null).filter(i=>i!=null),types=['row','col','area'];const out=[];for(const i of Core.shuffle(rng,cells).slice(0,count))out.push({cell:i,special:types[Core.int(rng,0,types.length-1)]});return out;
  }

  function satelliteFor(rng,level,difficulty,pool,weights,config,program){
    const m=config.multiBoard||{};if(m.enabled===false||level<Number(m.unlockLevel||18))return null;const chance=program?.focus==='relay'?1:Math.min(.88,Number(m.baseChance||.18)+difficulty.normalized*Number(m.difficultyChanceBonus||.42));if(rng()>chance)return null;
    const defs=m.layouts||[{id:"pollinator_plot",rows:4,cols:4,weight:1}],def=Core.weightedPick(rng,defs,x=>Number(x.weight)||1)||defs[0],rows=Math.max(3,Number(def.rows)||4),cols=Math.max(3,Number(def.cols)||4),cells=Array.from({length:rows*cols},()=>weightedIngredient(rng,pool,weights));
    // Guarantee at least one immediate 3+ cluster so the relay starts actionable.
    if(cells.length>=3){const id=weightedIngredient(rng,pool,weights);cells[0]=id;cells[1]=id;cells[cols]=id;}
    return{id:def.id||"pollinator_plot",rows,cols,cells,charges:Number(m.startingCharges)||1,maxCharges:Number(m.maxCharges)||4,effectMap:Core.clone(m.effectMap||{})};
  }

  function satelliteMask(def) {
    const rows=Math.max(1,Number(def.height)||Number(def.size?.height)||4),cols=Math.max(1,Number(def.width)||Number(def.size?.width)||4),strings=def.rows||[],mask=[];
    for(let r=0;r<rows;r++){const line=String(strings[r]||"").padEnd(cols,"0");for(let c=0;c<cols;c++)mask.push(line[c]==="1");}
    return{rows,cols,mask};
  }

  function seedSatelliteCluster(cells,mask,rows,cols,rng,pool,weights){
    const active=mask.map((ok,i)=>ok?i:null).filter(i=>i!=null);
    for(const at of active){const r=Math.floor(at/cols),c=at%cols,near=active.filter(n=>{const rr=Math.floor(n/cols),cc=n%cols;return n!==at&&Math.abs(rr-r)<=1&&Math.abs(cc-c)<=1;});if(near.length>=2){const id=weightedIngredient(rng,pool,weights);cells[at]=id;cells[near[0]]=id;cells[near[1]]=id;return;}}
  }

  function satelliteBoardsForLayout(rng, topology, level, difficulty, pool, weights, config, program) {
    const defs=topology?.satellites||[],m=config.multiBoard||{};
    if(defs.length){return defs.map(function(def,index){const shape=satelliteMask(def),cells=shape.mask.map(ok=>ok?weightedIngredient(rng,pool,weights):null);seedSatelliteCluster(cells,shape.mask,shape.rows,shape.cols,rng,pool,weights);return{id:def.id||`${topology.layoutId}-linked-${index+1}`,name:def.name||`Linked Garden ${index+1}`,rows:shape.rows,cols:shape.cols,activeMask:shape.mask,cells,charges:Number(m.startingCharges)||1,maxCharges:Number(m.maxCharges)||4,effectMap:Core.clone(m.effectMap||{}),linkedEffect:Core.clone(def.effect||{}),display:Core.clone(def.display||{}),sourceLayoutId:topology.layoutId};});}
    const fallback=satelliteFor(rng,level,difficulty,pool,weights,config,program);
    return fallback?[fallback]:[];
  }

  function scoreThresholds(objectives, limit, difficulty, config) {
    const scoring = config.scoring || {};
    const total = requiredMatchedTiles(objectives);
    const objectiveValue = total * ((Number(scoring.pointsPerCleared) || 100) + (Number(scoring.targetBonusPerCleared) || 75));
    const efficiency = limit.type === "moves" ? (limit.moves || 20) * 25 : Math.round((limit.timeSeconds || 90) * 5);
    const base = Math.max(1000, Math.round(objectiveValue + efficiency + difficulty.normalized * 1200));
    const multipliers = scoring.starMultipliers || [0.65, 1, 1.35];
    return multipliers.map(function (m) { return Math.max(1, Math.round(base * Number(m))); });
  }

  function freeBoosterEligibility(result, config) {
    const hp = config.highPerformance || {};
    return !!(
      (hp.threeStars && Number(result.stars) >= 3) ||
      Number(result.bestChain || 0) >= Number(hp.traceChainAtLeast || 12) ||
      Number(result.bestCombo || 0) >= Number(hp.comboAtLeast || 5) ||
      Number(result.remainingLimitRatio || 0) >= Number(hp.remainingLimitRatioAtLeast || 0.35) ||
      (!!result.newPersonalBest && hp.personalBestRequiredForBestRule !== false)
    );
  }

  function chooseFreeBooster(seed, level, boostersConfig) {
    const rng = Core.rngFromSeed(Core.makeSeed("free-booster", seed, level));
    const boosters = (boostersConfig && boostersConfig.boosters || []).filter(function (b) { return level >= Number(b.unlockLevel || 1); });
    const weights = (boostersConfig && boostersConfig.freeAwardWeights) || {};
    const selected = Core.weightedPick(rng, boosters, function (b) { return Number(weights[b.id]) || 1; });
    return selected ? selected.id : null;
  }

  function generateLevel(options) {
    options = options || {};
    const config = options.config || {};
    const ingredientCatalog = options.ingredientCatalog || { ingredients: [] };
    const recipeCatalog = options.recipeCatalog || null;
    const level = Math.max(1, Math.floor(Number(options.level) || 1));
    const runSeed = String(options.runSeed == null ? ("level-" + level) : options.runSeed);
    let recipe = options.recipe ? Core.clone(options.recipe) : RecipeBridge.selectRecipe({ level: level, runSeed: runSeed, catalog: recipeCatalog, excludeRecipeIds: options.excludeRecipeIds });
    const allowedIds = (ingredientCatalog.allowedIngredientIds || RecipeBridge.ingredientIdsFrom(recipeCatalog));
    RecipeBridge.validateRecipe(recipe, allowedIds);
    const seed = Core.makeSeed("ingredient-garden-level", level, runSeed, recipe.id);
    const rng = Core.rngFromSeed(seed);
    // Interaction family is level-stable unless the player explicitly selects an accessible mode.
    const requestedMode = String(options.accessibility && options.accessibility.preferredMode || "").toLowerCase();
    const mode = (requestedMode === "swap" || requestedMode === "trace") ? requestedMode : modeFor(Core.rngFromSeed(Core.makeSeed("ingredient-garden-mode", level)), config);
    const objectives = RecipeBridge.computeObjectives(recipe, { level: level, runSeed: runSeed, fishInventory: options.fishInventory || {} }, config, ingredientCatalog);
    const fishMod = options.runType === "garden" ? 1 : RecipeBridge.fishingDifficultyModifier(recipe, objectives, options.fishingPerformance, config);
    const difficulty = difficultyFor(level, recipe, objectives, fishMod, config);
    const limit = chooseLimit(rng, level, difficulty, objectives, recipe, options.accessibility || {}, config, mode);
    const pool = activeIngredientPool(rng, recipe, objectives, ingredientCatalog, difficulty, config);
    const weights = spawnWeights(pool, objectives, config);
    const program = programFor(rng, level, difficulty, config);
    const topology = topologyFor(rng, level, difficulty, config, options.boardLayoutId);
    const board = generateBoard(rng, mode, pool, weights, config, topology);
    let blockers = blockersFor(rng, level, difficulty, board, config, program);
    const simplifiedBoard = !!(options.accessibility && options.accessibility.simplifiedBoard);
    if (simplifiedBoard) {
      const safeTypes = new Set(["flower", "mud", "honey"]);
      blockers = blockers.filter(function(b){ return safeTypes.has(b.type); }).slice(0, Math.max(1, Math.ceil(blockers.length * 0.42)));
    }
    const initialSpecials = seedInitialSpecials(rng, board, difficulty, program);
    const satelliteBoards = simplifiedBoard ? [] : satelliteBoardsForLayout(rng, topology, level, difficulty, pool, weights, config, program);
    const satelliteBoard = satelliteBoards[0] || null;
    const thresholds = scoreThresholds(objectives, limit, difficulty, config);
    const requiresFishing = RecipeBridge.requiresFishing(recipe, (config.fishing || {}).fishIngredientIds);
    const soloOrDuo = options.soloOrDuo === "duo" ? "duo" : "solo";
    return Core.clone({
      schemaVersion: 1,
      engine: "feed-him-meow-ingredient-garden-randomizer",
      level: level,
      seed: seed,
      runSeed: runSeed,
      mode: mode,
      recipeId: recipe.id,
      recipeName: recipe.name,
      recipeIngredients: recipe.ingredients,
      fishRequired: requiresFishing ? RecipeBridge.fishRequirements(recipe, (config.fishing || {}).fishIngredientIds) : [],
      fishInventory: options.fishInventory || {},
      fishingPerformance: options.fishingPerformance || null,
      fishingDifficultyModifier: fishMod,
      difficulty: difficulty,
      recipeDifficulty: Math.max(1, Number(recipe.difficulty) || 1),
      ingredientPoolPolicy: 'catalog.minimumDifficulty <= recipe.difficulty',
      gardenOutstanding: objectives,
      totalOutstandingUnits: sumOutstanding(objectives),
      activeIngredientPool: pool,
      spawnWeights: weights,
      limitType: limit.type,
      movesRemaining: limit.moves,
      timeRemaining: limit.timeSeconds,
      plannedMoves: Math.max(1, Number(limit.plannedMoves) || 1),
      requiredMatchedTiles: Math.max(1, Number(limit.requiredMatchedTiles) || requiredMatchedTiles(objectives)),
      expectedObjectiveTilesPerTurn: Math.max(1, Number(limit.expectedObjectiveTilesPerTurn) || (mode === "trace" ? 4 : 2.2)),
      ingredientYieldRate: RecipeBridge.yieldRateForLevel(level, config),
      ingredientYieldPercent: Math.round(RecipeBridge.yieldRateForLevel(level, config) * 100),
      recipeRequirementMultiplier: Math.max(1, Number(config.pacing && config.pacing.recipeRequirementMultiplier) || 1),
      objectiveMultiplier: Math.max(1, Number(config.pacing && config.pacing.objectiveMultiplier) || 1),
      runType: options.runType || "full",
      board: board,
      topology: topology.id,
      boardLayoutId: topology.layoutId,
      boardLayoutNumber: topology.layoutNumber,
      boardLayoutName: topology.layoutName,
      boardFeatures: Core.clone(topology.features||[]),
      levelProgram: program,
      initialSpecials: initialSpecials,
      blockers: blockers,
      satelliteBoard: satelliteBoard,
      satelliteBoards: satelliteBoards,
      hazards: {
        vineCreepEveryTurns: Number(config.hazards?.vine?.creepEveryTurns)||2,
        beeMoveEveryTurns: Number(config.hazards?.bee?.moveEveryTurns)||3,
        quicksandSinkEveryTurns: Number(config.hazards?.quicksand?.sinkEveryTurns)||3,
        hazardClock: Core.clone(config.hazards?.hazardClock||{})
      },
      scoring: { starThresholds: { one: thresholds[0], two: thresholds[1], three: thresholds[2] }, pointsPerCleared: (config.scoring || {}).pointsPerCleared || 100 },
      soloOrDuo: soloOrDuo,
      activePlayer: soloOrDuo === "duo" ? ((config.duo || {}).firstPlayer || "Jasper") : null,
      nextDuoPlayer: soloOrDuo === "duo" ? ((config.duo || {}).secondPlayer || "William") : null,
      score: 0,
      stars: 0,
      wallet: Currency.normalize(options.wallet || {}),
      boosterInventory: Core.clone(options.boosterInventory || {}),
      bestScore: Math.max(0, Number(options.bestScore) || 0),
      bestStars: Math.floor(Core.clamp(options.bestStars || 0, 0, 3)),
      accessibility: Core.clone(options.accessibility || {}),
      generatedForReplay: !!options.isReplay
    });
  }

  function generateLevelBatch(accountLevel, pathConfig) {
    const perBatch = Math.max(1, Number(pathConfig && pathConfig.visibleLevelsPerPath) || Number(pathConfig && pathConfig.visibleLevelsPerBatch) || 45);
    accountLevel = Math.max(1, Math.floor(Number(accountLevel) || 1));
    const batch = Math.floor((accountLevel - 1) / perBatch) + 1;
    const start = (batch - 1) * perBatch + 1;
    const positions = (pathConfig && pathConfig.positions) || [];
    return Array.from({ length: perBatch }, function (_, i) {
      const level = start + i;
      const pos = positions[i] || { slot: i + 1, x: null, y: null };
      return { slot: i + 1, level: level, x: pos.x, y: pos.y, state: level < accountLevel ? "completed" : (level === accountLevel ? "current" : "locked") };
    });
  }

  function nextDuoPlayer(current, config) {
    const duo = (config && config.duo) || {};
    const first = duo.firstPlayer || "Jasper", second = duo.secondPlayer || "William";
    return current === first ? second : first;
  }

  return Object.freeze({
    version: "2.5.0-pass25-50-board-layouts", generateLevel: generateLevel, generateLevelBatch: generateLevelBatch,
    freeBoosterEligibility: freeBoosterEligibility, chooseFreeBooster: chooseFreeBooster,
    nextDuoPlayer: nextDuoPlayer, matchSet: matchSet, legalSwapExists: legalSwapExists,
    traceChainExists: traceChainExists, boardLayouts: Core.clone(BOARD_LAYOUTS), boardLayoutFor: boardLayoutFor
  });
});
