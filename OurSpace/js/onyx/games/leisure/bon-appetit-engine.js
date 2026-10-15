/* Feed Him MEOW · Bon Appétit. Deterministic, pause-safe kitchen simulation. */
(function(root){
  'use strict';
  const K=root.MeowKitchen;
  const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
  const copy=x=>JSON.parse(JSON.stringify(x));
  function rng(seed){let s=(Number(seed)>>>0)||0x9e3779b9;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;};}
  function shuffle(items,random){const a=items.slice();for(let i=a.length-1;i>0;i--){const j=K.randomInt(0,i,random);[a[i],a[j]]=[a[j],a[i]];}return a;}
  function difficulty(level){return level<=30?1:level<=60?2:level<=100?3:level<150?4:level<=199?5:6;}
  function pickRecipe(data,level,seed,previousId){
    const d=difficulty(level),random=rng(seed);
    let pool=data.recipes.filter(r=>r.difficulty===d&&(level>30||r.ingredients.length<4)&&(level<150||r.coreCount>=10));
    if(pool.length>1)pool=pool.filter(r=>r.id!==previousId);
    if(!pool.length)throw new Error('No valid recipes in this level band.');
    return copy(pool[K.randomInt(0,pool.length-1,random)]);
  }
  function starsFor(score){return score>=94?5:score>=82?4:score>=65?3:score>=45?2:score>=20?1:0;}
  // Standalone Bon Appétit has no level selection. Every supplied recipe is eligible.
  function pickOrder(data,seed,recent=[]){
    const excluded=new Set(recent),pool=data.recipes.filter(r=>!excluded.has(r.id));
    const eligible=pool.length?pool:data.recipes;
    if(!eligible.length)throw new Error('No recipes are available.');
    return copy(eligible[K.randomInt(0,eligible.length-1,rng(seed))]);
  }
  function amountSpec(source){
    const text=String(source||'to taste').trim();
    const match=text.match(/^(\d+(?:\s+\d+\/\d+|\/\d+|\.\d+)?)\s*(.*)$/);
    if(!match)return {source:text,target:1,unit:'taste dose',tool:'taste',qualitative:true,step:.25};
    const parts=match[1].split(/\s+/);let target=0;
    for(const part of parts){const bits=part.split('/').map(Number);target+=bits.length===2?bits[0]/bits[1]:bits[0];}
    const unit=match[2]||'portion';
    const tool=/^(oz|lb|g|kg|grams?|ounces?|pounds?)\b/i.test(unit)?'scale':/^(cups?|tbsp|tsp|ml|l|tablespoons?|teaspoons?)\b/i.test(unit)?'cup':'count';
    return {source:text,target,unit,tool,qualitative:false,step:tool==='count'?1:target/4};
  }
  function planRecipe(recipe){
    const core=recipe.ingredients.filter(id=>!recipe.flavors.includes(id));
    // Routes are the source adapter's declared preparation contract. Bowl-only
    // food needs no stove; oven dishes cook in their assembled batch, while pot
    // components (for example pasta) get their own stove step first.
    const stoveIds=core.filter(id=>recipe.routes[id]!=='bowl'&&(!recipe.ovenRequired||recipe.routes[id]==='pot'));
    return {core,stoveIds,preassemble:!!recipe.ovenRequired,noHeat:!recipe.ovenRequired&&!stoveIds.length};
  }
  class Run {
    constructor(data,{level=1,seed=1,recipeId,previousId,inventory,priorScores=null}={}){
      this.data=data;this.catalog=data.catalog;this.random=rng(seed);this.events=[];
      const recipe=recipeId?data.recipes.find(r=>r.id===recipeId):pickRecipe(data,level,seed,previousId);
      if(!recipe)throw new Error('Unknown recipe ID.');
      this.recipe=copy(recipe);this.level=clamp(Math.floor(level)||1,1,99999);this.seed=Number(seed)>>>0;
      this.plan=planRecipe(this.recipe);this.measureIndex=0;this.measureFill=0;this.measureTool='cup';this.measurements=[];this.preBatch=[];this.submission=null;
      this.id=this.seed+':'+this.recipe.id;this.phase='brief';this.time=0;this.phaseTime=0;this.index=0;this.routeIndex=0;this.selected=null;this.fall=0;this.cooldown=0;
      this.accepted=[];this.rejected=[];this.vessels={pan:[],bowl:[],pot:[]};this.routes=[];this.sorts=[];
      this.plate=new K.Plate(Object.keys(this.catalog));this.flavorHits={};this.flavorShots=[];
      this.heat=50;this.momentum=0;this.goodHeat=0;this.coldTime=0;this.hotTime=0;this.cookElapsed=0;this.cookQuality=0;this.cookState='raw';
      this.ovenProgress=0;this.ovenQuality=this.recipe.ovenRequired?0:1;this.air=0;
      this.paused=false;this.a11y={};this.effects={steadyHeat:false,steadyOven:false};this.result=null;this.rewarded=false;this.priorScores=priorScores;
      this.missingStock=[];this.log=[];
      const all=this.recipe.ingredients;
      let supplied=all.slice();
      if(Array.isArray(inventory)){
        supplied=[];for(const part of inventory){const id=typeof part==='string'?part:part.id||part.ingredientId;const n=typeof part==='object'?Number(part.quantity??part.quantityCollected??1):1;if(this.catalog[id]&&n>0&&!supplied.includes(id))supplied.push(id);}
        this.missingStock=all.filter(id=>!supplied.includes(id));
      }
      const eligible=Object.values(this.catalog).filter(x=>!x.isJunk&&!all.includes(x.id)&&(x.minimumDifficulty||1)<=this.recipe.difficulty);
      const decoys=shuffle(eligible,this.random).slice(0,Math.min(4,2+Math.floor(this.recipe.difficulty/2))).map(x=>x.id);
      const trash=shuffle(Object.values(this.catalog).filter(x=>x.isJunk),this.random).slice(0,this.recipe.difficulty>=4?2:1).map(x=>x.id);
      this.pool=shuffle([...new Set([...supplied,...decoys,...trash])],this.random).map((id,i)=>({id,uid:this.id+':'+i,required:all.includes(id),isJunk:!!this.catalog[id].isJunk,cookState:'raw',quality:0,plated:false}));
      const flavorDecoys=shuffle(Object.values(this.catalog).filter(x=>['sauce','seasoning','herb'].includes(x.category)&&!this.recipe.flavors.includes(x.id)&&(x.minimumDifficulty||1)<=this.recipe.difficulty),this.random).slice(0,Math.min(5,2+this.recipe.difficulty));
      this.targets=shuffle([...this.recipe.flavors,...flavorDecoys.map(x=>x.id)],this.random);
      this.note('order','Order taken: '+this.recipe.name);this.event('recipe:generated',{recipeId:this.recipe.id});
    }
    event(type,detail={}){this.events.push({type,...detail});}
    drainEvents(){return this.events.splice(0);}
    note(kind,text){this.log.push({kind,text,time:this.time});if(this.log.length>70)this.log.shift();}
    setPhase(next){this.phase=next;this.phaseTime=0;this.selected=null;this.fall=0;this.cooldown=0;this.event('bon-appetit:'+next+'-started');}
    begin(){if(this.phase==='brief'){this.setPhase('sort');return true;}return false;}
    current(){return this.phase==='sort'?this.pool[this.index]:this.phase==='measure'?this.accepted[this.measureIndex]:this.phase==='route'?this.accepted[this.routeIndex]:null;}
    currentMeasure(){const item=this.current();return item?amountSpec(this.recipe.amounts[item.id]):null;}
    adjustMeasure(delta){if(this.paused||this.phase!=='measure'||!Number.isFinite(delta))return false;const s=this.currentMeasure();this.measureFill=clamp(this.measureFill+delta,0,s.target*2);return true;}
    chooseMeasureTool(tool){if(this.paused||this.phase!=='measure'||!['cup','scale','count','taste'].includes(tool))return false;this.measureTool=tool;return true;}
    confirmMeasure(){
      if(this.paused||this.phase!=='measure')return false;
      const item=this.current(),s=this.currentMeasure();if(!item)return false;
      const ratio=this.measureFill/s.target;
      const accuracy=s.qualitative?(ratio>=.5&&ratio<=1.5?1:clamp(1-Math.abs(1-ratio))):clamp(1-Math.abs(1-ratio)*2);
      const quality=accuracy*(this.measureTool===s.tool?1:.5);
      const entry={id:item.id,uid:item.uid,source:s.source,target:s.target,actual:this.measureFill,unit:s.unit,tool:this.measureTool,expectedTool:s.tool,quality,qualitative:s.qualitative};
      this.measurements.push(entry);item.measure=copy(entry);item.prepared=true;
      this.note(quality>=.8?'good':'bad',this.catalog[item.id].name+': '+Number(this.measureFill.toFixed(3))+' '+s.unit+' prepared (order: '+s.source+').');
      this.event('bon-appetit:portion-prepared',{id:item.id,quality});this.measureIndex++;this.measureFill=0;this.measureTool='cup';
      if(this.measureIndex>=this.accepted.length)this.setPhase('route');return true;
    }
    select(index){if(!['sort','route'].includes(this.phase)||this.cooldown>0)return;const count=this.phase==='sort'?2:3;this.selected=((Math.round(index)%count)+count)%count;}
    rotate(delta){
      if(this.paused)return;this.momentum=clamp(this.momentum+Math.abs(delta)*8,0,45);
      if(['sort','route'].includes(this.phase)&&Math.abs(delta)>0.06){this.rotation=(this.rotation||0)+delta;if(Math.abs(this.rotation)>(this.a11y.sortSnap?.3:.6)){this.select((this.selected??0)+Math.sign(this.rotation));this.rotation=0;}}
    }
    sortTo(destination){
      if(this.paused||this.phase!=='sort'||this.cooldown>0||!['yum','yuck'].includes(destination))return false;
      const item=this.current();if(!item)return false;
      const correct=item.required?destination==='yum':destination==='yuck';
      this.sorts.push({id:item.id,destination,correct,junk:item.isJunk,required:item.required});
      (destination==='yum'?this.accepted:this.rejected).push(item);
      const name=this.catalog[item.id].name;
      this.note(correct?'good':'bad',correct?(destination==='yum'?name+' → YUM.':name+' kept out of this recipe.'):(destination==='yum'?name+' went into the food.':name+' is now missing.'));
      this.event(item.isJunk&&destination==='yum'?'bon-appetit:junk-to-yum':'bon-appetit:'+destination+'-'+(correct?'correct':'wrong'),{id:item.id});
      this.index++;this.fall=0;this.selected=null;this.cooldown=.27;
      if(this.index>=this.pool.length){if(this.accepted.length)this.setPhase('measure');else this.afterRouting();}
      return correct;
    }
    routeTo(vessel){
      if(this.paused||this.phase!=='route'||this.cooldown>0||!this.vessels[vessel])return false;
      const item=this.current();if(!item)return false;
      const target=this.recipe.routes[item.id];const correct=target===vessel;
      item.vessel=vessel;item.routeCorrect=correct;this.vessels[vessel].push(item);this.routes.push({id:item.id,vessel,target,correct});
      this.note(correct?'good':'bad',this.catalog[item.id].name+' → '+vessel+(correct?' ✓':target?' (order calls for '+target+').':' (not in the order).'));
      this.event('bon-appetit:'+(correct?vessel+'-correct':'cookware-wrong'),{id:item.id,vessel});
      if(!this.plan.stoveIds.includes(item.id)&&!this.recipe.ovenRequired){item.cookState='ready';item.quality=1;}
      this.routeIndex++;this.fall=0;this.selected=null;this.cooldown=.27;if(this.routeIndex>=this.accepted.length)this.afterRouting();return correct;
    }
    afterRouting(){if(this.plan.stoveIds.length)this.setPhase('cook');else{this.cookQuality=1;this.cookState='ready';this.afterCooking();}}
    afterCooking(){this.setPhase(this.plan.preassemble?'preassemble':this.targets.length?'flavor':'assemble');}
    addBatchGroup(name){
      if(this.paused||this.phase!=='preassemble'||!this.vessels[name])return false;
      let count=0;for(const item of this.vessels[name])if(!this.recipe.flavors.includes(item.id)&&!this.preBatch.some(x=>x.uid===item.uid)){this.preBatch.push(item);count++;}
      if(count){this.note('good',name+' components added to the baking dish.');this.event('bon-appetit:batch-assembled',{group:name,count});}return count>0;
    }
    beginOven(){if(this.paused||this.phase!=='preassemble')return false;this.note('order','The assembled baking dish went into the oven.');this.setPhase('oven');return true;}
    tick(dt,{heatHeld=false,blowHeld=false,mic=0,sweep=0}={}){
      if(this.paused||!Number.isFinite(dt)||dt<=0)return;
      dt=Math.min(dt,.1);this.time+=dt;this.phaseTime+=dt;this.cooldown=Math.max(0,this.cooldown-dt);this.momentum*=Math.exp(-1.4*dt);
      if(['sort','route'].includes(this.phase)&&this.cooldown===0&&!this.a11y.nonTimed){
        const seconds=(this.a11y.slowSorter?9:Math.max(3.4,6.5-this.recipe.difficulty*.35));this.fall+=dt/seconds;
        if(this.fall>=1){if(this.phase==='sort')this.sortTo(['yum','yuck'][this.selected??1]);else this.routeTo(['pan','bowl','pot'][this.selected??0]);}
      }
      if(this.phase==='measure'&&heatHeld){this.adjustMeasure(dt*this.currentMeasure().target*.4);}
      if(this.phase==='cook'){
        const [lo,hi]=this.recipe.heatTarget;
        if(heatHeld||this.effects.steadyHeat){this.heat+=(lo+(hi-lo)*.5-this.heat)*Math.min(1,2*dt);}
        else this.heat=clamp(this.heat+(this.momentum*.6+(sweep?9:0)-7)*dt,0,100);
        this.cookElapsed+=dt;
        if(this.heat>=lo&&this.heat<=hi)this.goodHeat+=dt;else if(this.heat<lo)this.coldTime+=dt;else this.hotTime+=dt;
        this.cookQuality=clamp(this.goodHeat/Math.max(.01,this.cookElapsed))*clamp(this.cookElapsed/this.recipe.cookSeconds);
        this.cookState=this.hotTime>this.recipe.cookSeconds*.3?'burned':this.cookElapsed>=this.recipe.cookSeconds&&this.cookQuality>=.65?'cooked':this.cookQuality<.3?'raw':'cooking';
        if(this.cookElapsed>this.recipe.cookSeconds*2.2&&!this.a11y.nonTimed)this.finishCook();
      }else if(this.phase==='oven'){
        this.air=clamp(blowHeld?1:mic);if(this.effects.steadyOven)this.air=1;
        this.ovenProgress=clamp(this.ovenProgress+dt*this.air/this.recipe.ovenSeconds);
        if(this.ovenProgress>=1||(!this.a11y.nonTimed&&this.phaseTime>this.recipe.ovenSeconds*4))this.finishOven();
      }else if(this.phase==='tasting'&&this.phaseTime>=(this.data.rules?.tastingSeconds||1.8)){this.result=this.evaluate();this.setPhase('results');this.event('stars:calculated',{stars:this.result.stars,score:this.result.score});}
    }
    finishCook(){
      if(this.paused||this.phase!=='cook')return false;
      const q=clamp(this.goodHeat/Math.max(.01,this.cookElapsed))*clamp(this.cookElapsed/this.recipe.cookSeconds);
      this.cookQuality=this.cookState==='burned'?Math.min(q,.25):q;
      for(const item of this.accepted){if(!this.plan.stoveIds.includes(item.id))continue;item.quality=item.vessel==='bowl'?0:this.cookQuality*(item.routeCorrect?1:.65);item.cookState=this.cookState==='burned'?'burned':item.quality>=.65?'cooked':'raw';}
      this.note(this.cookQuality>=.65?'good':'bad','Cooking quality: '+Math.round(this.cookQuality*100)+'%.');this.event('bon-appetit:stove-completed',{quality:this.cookQuality});
      this.afterCooking();return true;
    }
    finishOven(){
      if(this.paused||this.phase!=='oven')return false;this.ovenQuality=this.ovenProgress;
      for(const batched of this.preBatch){const item=this.accepted.find(x=>x.uid===batched.uid);if(!item)continue;item.baked=true;item.quality=this.ovenQuality*(item.routeCorrect?1:.65);item.cookState=item.quality>=.65?'cooked':'raw';}
      this.note(this.ovenQuality>=.8?'good':'bad','Oven complete: '+Math.round(this.ovenQuality*100)+'%.');this.event('bon-appetit:oven-completed',{quality:this.ovenQuality});this.setPhase(this.targets.length?'flavor':'assemble');return true;
    }
    shoot(id){
      if(this.paused||this.phase!=='flavor'||!this.targets.includes(id))return false;
      const required=this.recipe.flavors.includes(id);const stocked=this.accepted.some(x=>x.id===id);
      if(!stocked){this.note('bad',this.catalog[id].name+' is not in the prepared stock. No portion is available.');this.event('bon-appetit:flavor-no-stock',{id});return false;}
      const count=(this.flavorHits[id]||0)+1;this.flavorHits[id]=count;
      const correct=required&&count===1;this.flavorShots.push({id,correct,count});
      this.note(correct?'good':'bad',this.catalog[id].name+(correct?' applied ✓':required?' applied too many times.':' does not belong in this order.'));
      this.event('bon-appetit:flavor-'+(correct?'correct':'wrong'),{id,count});return correct;
    }
    finishFlavor(){if(this.paused||this.phase!=='flavor')return;this.event('bon-appetit:flavor-completed');this.setPhase('assemble');}
    availableGroups(){
      const groups={};for(const name of ['pan','bowl','pot']){
        const base=this.vessels[name].filter(x=>!this.recipe.flavors.includes(x.id));if(base.length)groups[name]=base;
      }
      const finish=Object.entries(this.flavorHits).filter(([,n])=>n>0).map(([id,n])=>({id,uid:this.id+':finish:'+id,plated:false,quality:1,cookState:'finish',hits:n,measure:this.accepted.find(x=>x.id===id)?.measure,isJunk:!!this.catalog[id].isJunk}));
      if(finish.length)groups.finish=finish;return groups;
    }
    addGroup(name){
      if(this.paused||this.phase!=='assemble')return false;
      const group=this.availableGroups()[name];if(!group)return false;
      const count=K.transferPortions(group,this.plate);if(count){this.note('good',(name==='finish'?'Finishing flavors':name+' components')+' moved to the plate.');this.event('bon-appetit:component-assembled',{group:name,count});}return count>0;
    }
    undoGroup(name){
      if(this.paused||this.phase!=='assemble')return false;
      const ids=new Set((this.availableGroups()[name]||[]).map(x=>x.uid));this.plate.items=this.plate.items.filter(x=>!ids.has(x.uid));
      for(const x of this.vessels[name]||[])x.plated=false;return true;
    }
    serve(){if(this.paused||this.phase!=='assemble')return false;this.submission=copy({recipeId:this.recipe.id,plate:this.plate.items,measurements:this.measurements,sorts:this.sorts,routes:this.routes,flavorHits:this.flavorHits,flavorShots:this.flavorShots,cookState:this.cookState,ovenQuality:this.ovenQuality,time:this.time});this.note('order','Served to Onyx.');this.event('bon-appetit:dish-revealed');this.setPhase('tasting');return true;}
    evaluate(){
      const served=this.submission||{plate:this.plate.items,measurements:this.measurements,sorts:this.sorts,routes:this.routes,flavorHits:this.flavorHits,flavorShots:this.flavorShots,cookState:this.cookState,ovenQuality:this.ovenQuality};
      const recipe=this.recipe,items=served.plate,delivered=K.compareDelivery(recipe.ingredients,items);
      const sort=served.sorts.length?served.sorts.filter(x=>x.correct).length/served.sorts.length:0;
      const wantedRoutes=served.routes.filter(x=>recipe.ingredients.includes(x.id));const route=wantedRoutes.length?wantedRoutes.filter(x=>x.correct).length/wantedRoutes.length:0;
      const core=recipe.ingredients.filter(id=>!recipe.flavors.includes(id));const corePresent=core.filter(id=>items.some(x=>x.id===id));const completeness=corePresent.length/Math.max(1,core.length);
      const cooking=core.reduce((sum,id)=>{const item=items.find(x=>x.id===id);return sum+(item?recipe.ovenRequired&&!item.baked?Math.min(.2,item.quality):item.quality:0);},0)/Math.max(1,core.length);
      const measuring=recipe.ingredients.reduce((sum,id)=>sum+(served.measurements.find(x=>x.id===id)?.quality||0),0)/Math.max(1,recipe.ingredients.length);
      const correctFlavors=recipe.flavors.filter(id=>items.some(x=>x.id===id)&&(served.flavorHits[id]||0)===1).length;
      const extraShots=served.flavorShots.filter(x=>!x.correct).length;
      const flavor=recipe.flavors.length?clamp(correctFlavors/recipe.flavors.length-extraShots*.15):clamp(1-extraShots*.25);
      const junk=items.filter(x=>x.isJunk).length;
      const weights=this.data.rules?.scoreWeights||{sort:15,measuring:15,route:15,cooking:30,flavor:15,completeness:10};
      let score=Object.entries({sort,measuring,route,cooking,flavor,completeness}).reduce((sum,[key,value])=>sum+value*weights[key],0);
      score=score*(.35+.65*completeness)-junk*24-delivered.unexpected.length*7;
      if(delivered.missing.length)score-=Math.min(15,delivered.missing.length*3);
      if(completeness<.6||cooking<.3||(recipe.ovenRequired&&served.ovenQuality<.35))score=Math.min(score,60);
      if(!corePresent.length)score=0;
      score=Math.round(clamp(score,0,100));
      const bonScore=score;
      if(this.priorScores&&Number.isFinite(this.priorScores.market)&&Number.isFinite(this.priorScores.garden))score=Math.round(clamp(this.priorScores.market,0,100)*.25+clamp(this.priorScores.garden,0,100)*.25+bonScore*.5);
      const stars=starsFor(score);
      const reasons=[];
      if(delivered.missing.length)reasons.push('Missing: '+delivered.missing.map(id=>this.catalog[id].name).join(', '));
      if(delivered.unexpected.length)reasons.push('Wrong additions: '+delivered.unexpected.map(id=>this.catalog[id].name).join(', '));
      if(cooking<.65)reasons.push(served.cookState==='burned'?'Food was scorched.':'Some food missed its cooking step or needed more target heat.');
      if(measuring<.8)reasons.push('Some measured portions or measuring tools did not match the order.');
      if(recipe.ovenRequired&&served.ovenQuality<.8)reasons.push('The oven step was incomplete.');
      if(extraShots)reasons.push(extraShots+' wrong or extra flavor shot'+(extraShots===1?'':'s')+'.');
      if(route<1)reasons.push('Some ingredients missed their recipe cookware.');
      if(!reasons.length)reasons.push('Every component made it to the plate. Beautifully done.');
      return {score,bonScore,stars,mood:stars>=3?'purring':'judgmental',metrics:{sort,measuring,route,cooking,flavor,completeness},missing:delivered.missing,unexpected:delivered.unexpected,junk,reasons,coins:stars*12+served.sorts.filter(x=>x.correct).length*2,priorScores:this.priorScores};
    }
    checkpoint(){const s={};for(const key of Object.keys(this)){if(!['data','catalog','random','events','plate','a11y'].includes(key))s[key]=this[key];}s.plate=this.plate.items;s.schemaVersion=1;s.module='bon_appetit';return copy(s);}
    static restore(data,snapshot){
      if(!snapshot||snapshot.module!=='bon_appetit'||snapshot.schemaVersion!==1)throw new Error('Not a Bon Appétit checkpoint.');
      if(!data.recipes.some(r=>r.id===snapshot.recipe?.id))throw new Error('Checkpoint recipe is unavailable.');
      const run=new Run(data,{level:snapshot.level,seed:snapshot.seed,recipeId:snapshot.recipe.id});
      const known=Object.keys(run).filter(x=>!['data','catalog','random','events','plate','a11y'].includes(x));
      for(const key of known)if(Object.hasOwn(snapshot,key))run[key]=copy(snapshot[key]);
      run.plate=new K.Plate(Object.keys(data.catalog));for(const x of snapshot.plate||[])if(data.catalog[x.id])run.plate.tryAddIngredient(x);
      run.paused=false;run.events=[];return run;
    }
  }
  root.MeowEngine={Run,rng,shuffle,pickRecipe,pickOrder,amountSpec,planRecipe,difficulty,starsFor};
  if(typeof module!=='undefined')module.exports=root.MeowEngine;
})(typeof window!=='undefined'?window:globalThis);
