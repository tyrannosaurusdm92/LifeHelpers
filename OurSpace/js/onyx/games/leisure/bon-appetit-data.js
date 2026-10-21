/* Shared Bon Appétit data loader for the integrated Feed Him MEOW cartridge.
 * The JSON files remain the authoritative source. A small compatibility path
 * also lets an exported ZIP opened as file:// use the catalog already shipped
 * in runtime_data.js/recipe_catalog.js instead of leaving the kitchen blank. */
(()=>{
  const scriptUrl=document.currentScript?.src||location.href;
  const readJson=relative=>{
    const url=new URL(relative,scriptUrl);
    if(url.protocol==='file:')return Promise.reject(new Error('Local JSON uses the bundled catalog.'));
    return fetch(url).then(response=>{
      if(!response.ok)throw new Error('HTTP '+response.status);
      return response.json();
    }).catch(fetchError=>{
      // Chromium blocks fetch(file://...). In browsers that permit local XHR,
      // use the same exact asset URL before falling back to the bundled data.
      if(url.protocol!=='file:')throw fetchError;
      return new Promise((resolve,reject)=>{
        const request=new XMLHttpRequest();
        request.open('GET',url.href);
        request.onload=()=>{
          if(request.status===200||request.status===0){try{resolve(JSON.parse(request.responseText));}catch(error){reject(error);}}
          else reject(new Error('HTTP '+request.status));
        };
        request.onerror=()=>reject(fetchError);
        request.send();
      });
    });
  };
  const routeFor=item=>{
    const text=((item?.category||'')+' '+(item?.subCategory||'')+' '+(item?.id||'')).toLowerCase();
    return /(liquid|starch|stock|water|broth|rice|pasta|noodle)/.test(text)?'pot':/(sauce|season|herb|dairy|spice|flour|sugar|pantry)/.test(text)?'bowl':'pan';
  };
  const normalizeAsset=value=>String(value||'').replace('/shared/mystery_sock.svg','/shared/junk/mystery_sock.svg');
  const fallbackData=()=>{
    const runtime=window.FHM_RUNTIME_DATA?.ingredient_catalog;
    const rawLibrary=window.FEED_HIM_MEOW_RECIPE_CATALOG;
    const sourceIngredients=runtime?.ingredients;
    const sourceRecipes=rawLibrary?.recipes;
    if(!Array.isArray(sourceIngredients)||!Array.isArray(sourceRecipes)||!sourceRecipes.length)return null;
    const catalog=Object.fromEntries(sourceIngredients.map(item=>[item.id,{...item,asset:normalizeAsset(item.asset||item.runtimeAssetAlias||item.sourceAsset)}]));
    const recipes=sourceRecipes.map(raw=>{
      const entries=(raw.ingredients||[]).map(item=>typeof item==='string'?{id:item}:item).filter(item=>item?.id&&catalog[item.id]);
      const coreIds=[...(raw.gameplay?.requiredIngredientIds||entries.map(item=>item.id))].filter(id=>catalog[id]);
      const flavorIds=[...(raw.gameplay?.requiredFlavorIds||[...(raw.seasonings||[]),...(raw.freshHerbs||[])])].filter(id=>catalog[id]);
      const ingredients=[...new Set(coreIds)];
      const amounts=Object.fromEntries(entries.map(item=>[item.id,item.amount||'1 portion']));
      const routes=Object.fromEntries(ingredients.map(id=>[id,routeFor(catalog[id])]));
      const sourceSteps=Array.isArray(raw.steps)&&raw.steps.length?raw.steps.slice():Object.values(raw.stations||{}).flat();
      return {id:raw.id,name:raw.name,difficulty:Number(raw.difficulty)||1,band:raw.difficultyLabel||raw.libraryFileDifficulty||'super_easy',coreCount:Number(raw.difficultyProfile?.coreIngredientCount)||ingredients.length,ingredients,amounts,flavors:[...new Set(flavorIds)],routes,ovenRequired:/bake|roast|oven|chicken|pastry|cake|pizza/i.test(raw.name||''),heatTarget:[48,76],cookSeconds:12,ovenSeconds:8,sourceSteps};
    }).filter(recipe=>recipe.ingredients.length);
    return {rules:{tastingSeconds:1.8,scoreWeights:{sort:15,measuring:15,route:15,cooking:30,flavor:15,completeness:10}},version:rawLibrary.schemaVersion||'bundled',catalog,recipes,recipeCount:rawLibrary.liveCount||rawLibrary.count||recipes.length,bands:rawLibrary.categoryCounts||{}};
  };
  window.MeowBonDataReady=Promise.all([
    readJson('../../../../json/shared/ingredient_catalog.json'),
    readJson('../../../../json/bon_appetit/recipes.json'),
    readJson('../../../../json/bon_appetit/kitchen_rules.json')
  ]).then(([rawCatalog,library,rules])=>{
    const list=Array.isArray(rawCatalog)?rawCatalog:(Array.isArray(rawCatalog?.ingredients)?rawCatalog.ingredients:Object.values(rawCatalog||{}));
    const catalog=Object.fromEntries(list.map(item=>[item.id,{...item,asset:normalizeAsset(item.asset||item.runtimeAssetAlias||item.sourceAsset)}]));
    if(!library||!Array.isArray(library.recipes)||!library.recipes.length)throw new Error('Game data is incomplete.');
    window.MeowData={rules,version:library.version,catalog,recipes:library.recipes,recipeCount:library.recipeCount,bands:library.bands};
    return window.MeowData;
  }).catch(error=>{
    const fallback=fallbackData();
    if(fallback){console.warn('Bon Appétit JSON unavailable; using the bundled catalog.',error);window.MeowData=fallback;return fallback;}
    throw error;
  });
  window.MeowBonDataReady.catch(error=>{
    console.error('Bon Appétit data failed to load',error);
    const viewport=document.getElementById('gameViewport');
    if(viewport)viewport.dataset.bonDataError='true';
  });
})();
