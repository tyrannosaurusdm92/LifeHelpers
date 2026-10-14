(()=>{
'use strict';
const C=window.FEED_HIM_MEOW_RECIPE_CATALOG||{recipes:[]};
const IC=(window.FEED_HIM_MEOW_JSON||{}).ingredient_catalog||{ingredients:[]};
const ingredients=(IC.ingredients||[]).filter(x=>x&&x.id);
const byId=Object.fromEntries(ingredients.map(x=>[String(x.id),x]));
const pantry=ingredients.filter(x=>x.recipeEligible!==false&&x.gardenCollectable!==false);
const spices=ingredients.filter(x=>x.category==='seasoning').map(x=>x.id);
const herbs=ingredients.filter(x=>x.category==='herb').map(x=>x.id);
let bag=[],active=null;
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const title=v=>String(v||'').replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function amountFor(x){if(!x)return'1 serving';if(x.liquid||['sauce','dairy'].includes(x.category))return'1/2 cup';if(['vegetable','starch','pantry'].includes(x.category))return'1 cup';return'1 serving'}
function supportFor(anchor,i){
 const wanted=anchor.category==='fish'||anchor.category==='protein'?['vegetable','starch']:anchor.category==='vegetable'?['protein','fish','starch']:anchor.category==='starch'?['protein','fish','vegetable']:['protein','vegetable','starch'];
 const out=[];
 for(let k=0;k<wanted.length&&out.length<2;k++){
   const pool=pantry.filter(x=>x.id!==anchor.id&&x.category===wanted[k]);
   if(pool.length)out.push(pool[(i*7+k*11)%pool.length]);
 }
 return out;
}


function generatedRecipes(){
 return pantry.map((anchor,i)=>{
   const supports=supportFor(anchor,i),all=[anchor,...supports].filter((x,j,a)=>a.findIndex(y=>y.id===x.id)===j);
   const seasoning=spices.length?[spices[i%spices.length],spices[(i+5)%spices.length]].filter((x,j,a)=>a.indexOf(x)===j):[];
   const freshHerbs=herbs.length?[herbs[i%herbs.length]]:[];
   const ing=all.map(x=>({id:x.id,name:x.name||title(x.id),amount:amountFor(x)}));
   const primary=anchor.name||title(anchor.id);
   return{
     id:`g${String(i+1).padStart(3,'0')}`,
     name:`Pantry Table: ${primary}`,
     category:`ingredient_driven_${anchor.category||'pantry'}`,
     difficulty:1+(i%5),
     gardenCollectable:true,
     ingredients:ing,seasonings:seasoning,freshHerbs,
     gameplay:{requiredIngredientIds:all.map(x=>x.id)},
     generated:true,
     notes:'Ingredient-driven Garden recipe generated from the expanded ingredient catalog.'
   };
 });
}
const FEATURED=[...(C.featuredRecipes||[])];
const GENERATED=(C.recipes||[]).filter(r=>r.generated);
const ALL=[...FEATURED,...(C.recipes||[])];
function targetDifficulty(){const lvl=Math.max(1,Number(window.FeedHimMeowRun?.getState?.().selectedLevel||1));if(lvl<=10)return 1;if(lvl<=25)return 2;if(lvl<=50)return 3;if(lvl<=90)return 4;if(lvl<=140)return 5;return 6}
function draw(){if(!bag.length){const d=targetDifficulty(),pool=ALL.filter(r=>Number(r.difficulty||1)===d);bag=shuffle(pool.length?pool:ALL)}active=bag.pop()||null;return active}
function setActive(r){active=r;window.FEED_HIM_MEOW_ACTIVE_RECIPE=r;window.FeedHimMeowRun?.setRecipe(r);window.dispatchEvent(new CustomEvent('feed-him-meow:recipe-selected',{detail:{recipe:r,run:window.FeedHimMeowRun?.snapshot?.()}}))}
window.FeedHimMeowRecipes={catalog:C,recipes:ALL,coreRecipes:(C.recipes||[]),featuredRecipes:FEATURED,authoredRecipes:(C.recipes||[]).filter(r=>!r.generated),generatedRecipes:GENERATED,draw,setActive,getActive:()=>active,targetDifficulty};
const card=document.getElementById('recipeCard'),gen=document.getElementById('generateRecipeBtn'),cont=document.getElementById('continueRecipeBtn');
function render(r){if(!r)return;const ingredients=(r.ingredients||[]).map(x=>`<li><b>${esc(x.amount||'1 unit')}</b> ${esc(x.name||title(x.id))}</li>`).join(''),seasons=(r.seasonings||[]).map(x=>esc(title(x))).join(', '),fresh=(r.freshHerbs||[]).map(x=>esc(title(x))).join(', ');card.innerHTML=`<div class="recipe-kicker">Recipe ${esc(String(r.id||''))} / ${ALL.length} · ${esc(title(r.difficultyLabel||('difficulty '+r.difficulty)))}</div><h2>${esc(r.name)}</h2><div class="recipe-meta"><span>${esc(String(r.category||'').replaceAll('_',' '))}</span></div><div class="recipe-grid"><section><h3>Garden ingredient goals</h3><ul>${ingredients}</ul></section><section><h3>Seasonings</h3><p>${seasons||'None'}</p><h3>Herbs</h3><p>${fresh||'None'}</p></section></div>`;card.hidden=false;cont.hidden=false;cont.textContent='Continue → Ingredient Garden';card.focus({preventScroll:true})}

gen?.addEventListener('click',()=>{const r=draw();setActive(r);render(r)});
cont?.addEventListener('click',()=>{if(active){setActive(active);window.FeedHimMeowRun?.continueFromRecipe()}});
window.addEventListener('feed-him-meow:run-started',()=>{active=null;bag=[];window.FEED_HIM_MEOW_ACTIVE_RECIPE=null;card.hidden=true;card.innerHTML='';cont.hidden=true;gen?.focus?.({preventScroll:true})});
})();
