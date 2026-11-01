/* Onyx Adventures gameplay: pure functions, independent of rendering and the trusted wallet. MIT original code. */
(function(root, factory) {
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root){root.WanderingWorld=root.WanderingWorld||{};root.WanderingWorld.GameplayCore=api;}
})(typeof globalThis==='object'?globalThis:undefined,function(){
  'use strict';
  const IDS=Object.freeze(['onyx','callie','harvey']);
  const BIOMES=Object.freeze(['greenwood','sunmeadow','bluegrass','mosswood','snowcrown','standingstones','starlit','seabright']);
  const LEVELS=Object.freeze([0,3,8,16]);
  function finite(x,lo=0,hi=Number.MAX_SAFE_INTEGER){x=Number(x);return Number.isFinite(x)?Math.min(hi,Math.max(lo,Math.floor(x))):lo;}
  function cents(total){const n=finite(total);return {copper:n%10,silver:Math.floor(n/10)%10,gold:Math.floor(n/100)%10,platinum:Math.floor(n/1000),totalCopper:n};}
  function totalFromCoins(obj){if(obj&&Object.prototype.hasOwnProperty.call(obj,'totalCopper'))return finite(obj.totalCopper);return ['copper','silver','gold','platinum'].reduce((s,k,i)=>s+finite(obj?.[k])*[1,10,100,1000][i],0);}
  function level(xp){xp=finite(xp);return xp>=16?4:xp>=8?3:xp>=3?2:1;}
  function pay(lvl){return [0,4,6,9,12][Math.min(4,Math.max(1,finite(lvl,1,4)))];}
  function newCoverage(){return Object.fromEntries(IDS.map(cat=>[cat,Object.fromEntries(BIOMES.map(b=>[b,{visits:0,activeSeconds:0,actionIds:[],workIds:[],discoveryIds:[],fulfilled:false}]))]));}
  function newProgress(){return {schema:3,coverage:newCoverage(),careers:Object.fromEntries(IDS.map(x=>[x,{xp:0,level:1,skills:{observe:0,inspect:0,communicate:0,deliver:0,teamwork:0},shiftIds:[]}])) ,guide:{sightings:{},landmarks:[],moments:[]},rewards:{claims:[],confirmed:[],pending:[]},lastSeenChapter:null,updatedAt:null};}
  function mergeProgress(raw){const result=newProgress();if(!raw||typeof raw!=='object')return result;
    for(const cat of IDS){const c=raw.careers?.[cat]||{};result.careers[cat].xp=finite(c.xp,0,100000);result.careers[cat].level=level(c.xp);result.careers[cat].skills=Object.fromEntries(Object.keys(result.careers[cat].skills).map(k=>[k,finite(c.skills?.[k],0,100000)]));result.careers[cat].shiftIds=uniques(c.shiftIds,1000);
      for(const b of BIOMES){const q=raw.coverage?.[cat]?.[b]||{};const at=result.coverage[cat][b];at.visits=finite(q.visits,0,999999);at.activeSeconds=finite(q.activeSeconds,0,10000000);at.actionIds=uniques(q.actionIds,200);at.workIds=uniques(q.workIds,200);at.discoveryIds=uniques(q.discoveryIds,200);at.fulfilled=at.activeSeconds>=20 && at.actionIds.length>=2;}}
    result.guide={sightings:{},landmarks:uniques(raw.guide?.landmarks,300),moments:uniques(raw.guide?.moments,500)};
    for(const [bird,count] of Object.entries(raw.guide?.sightings||{}))if(/^[a-z]{2,24}$/.test(bird))result.guide.sightings[bird]=finite(count,0,100000);
    result.rewards={claims:uniques(raw.rewards?.claims,500),confirmed:uniques(raw.rewards?.confirmed,500),pending:uniques(raw.rewards?.pending,500)};
    result.lastSeenChapter=raw.lastSeenChapter==null?null:finite(raw.lastSeenChapter,0,15);
    result.updatedAt=typeof raw.updatedAt==='string'?raw.updatedAt:null;
    return result;
  }
  function uniques(arr,max){return Array.isArray(arr)?[...new Set(arr.filter(x=>typeof x==='string'&&x.length>0&&x.length<180))].slice(-max):[];}
  function usedCount(progress){return IDS.reduce((sum,id)=>sum+BIOMES.filter(b=>!!progress.coverage?.[id]?.[b]?.fulfilled).length,0);}
  function markEntered(progress,cat,biome){const rec=progress.coverage?.[cat]?.[biome];if(!rec)return false;rec.visits=finite(rec.visits+1);return true;}
  function addDwell(progress,cat,biome,dt){const rec=progress.coverage?.[cat]?.[biome];if(!rec||!Number.isFinite(dt)||dt<=0)return false;rec.activeSeconds=Math.min(10000000,rec.activeSeconds+dt);rec.fulfilled=rec.activeSeconds>=20&&rec.actionIds.length>=2;return rec.fulfilled;}
  function markActivity(progress,cat,biome,eventId,kind='ordinary'){
    const entry=progress.coverage?.[cat]?.[biome];if(!entry||typeof eventId!=='string'||eventId.length>180)return false;
    const key=kind==='work'?'workIds':kind==='discovery'?'discoveryIds':'actionIds';
    if(entry[key].includes(eventId))return false;
    entry[key].push(eventId);
    // Work and discoveries count toward meaningful biome experiences when actually visibly completed.
    if(kind!=='ordinary'&&!entry.actionIds.includes(eventId))entry.actionIds.push(eventId);
    entry.fulfilled=entry.activeSeconds>=20&&entry.actionIds.length>=2;
    return true;
  }
  function markShift(progress,cat,shiftId,skill='inspect'){
    const c=progress.careers?.[cat];if(!c||typeof shiftId!=='string'||shiftId.length>180||c.shiftIds.includes(shiftId))return false;
    c.shiftIds.push(shiftId);if(c.shiftIds.length>1000)c.shiftIds.shift();
    c.xp+=1;c.level=level(c.xp);if(Object.hasOwn(c.skills,skill))c.skills[skill]++;
    return true;
  }
  function rewardId(profile,cat,biome,shiftId){return 'adventure:v3:'+profile+':'+cat+':'+biome+':'+shiftId;}
  function nextUnseen(options,seen,rng){const available=options.filter(x=>!seen.includes(x.id));const pool=available.length?available:options;return pool.length?pool[Math.floor(Math.min(.999999,Math.max(0,rng()))*pool.length)]:null;}
  function runtimeSafe(cat){return !!cat&&!cat.rest&&!cat.care&&!cat.jump&&!cat.vocal&&!cat.cuedAction&&!cat.contactVisual&&!cat.jobTask&&(!cat.busyUntil||cat.busyUntil<=cat.clock||cat.busyUntil<=0);}
  function wrapDelta(a,b,len){return ((a-b+len*1.5)%len+len)%len-len*.5;}
  function estimate(x){return typeof x==='number'&&Number.isFinite(x)?Math.max(0,x).toFixed(0):'—';}
  return Object.freeze({IDS,BIOMES,LEVELS,finite,cents,totalFromCoins,level,pay,newCoverage,newProgress,mergeProgress,usedCount,markEntered,addDwell,markActivity,markShift,rewardId,nextUnseen,runtimeSafe,wrapDelta,estimate});
});
