/* Node development test runner. Does NOT execute in the shipped browser page.
   Usage: node ../../script/gameplay-tests.js
   Original cat wasm, 8 biome catalog, career scenarios and wallet adapter contracts. */
'use strict';
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const C=require('./gameplay-core.js');
global.window=global;window.WanderingWorld=window.WanderingWorld||{};
window.addEventListener=()=>{};window.dispatchEvent=()=>{};global.document={hidden:false,addEventListener(){}};
global.location={protocol:'file:'};
global.localStorage={items:new Map(),getItem(k){return this.items.get(k)||null;},setItem(k,v){this.items.set(k,String(v));}};
class CustomEvent {constructor(name,opts){this.type=name;this.detail=opts?.detail;}}global.CustomEvent=CustomEvent;
window.WanderingWorld.util={modulo:(n,m)=>((n%m)+m)%m,wrapDelta:(a,b,len)=>((a-b+len*1.5)%len+len)%len-len*.5};
require('./gameplay-data.js');require('./ourspace-economy.js');require('./adventure-gameplay.js');
const WW=window.WanderingWorld;
let checks=0;function check(name,fun){const result=fun();assert(result,name);checks++;console.log('PASS',name);}
function simulateCoverage(){let p=C.newProgress();for(const cat of C.IDS)for(const b of C.BIOMES){
   C.markEntered(p,cat,b);C.addDwell(p,cat,b,25);C.markActivity(p,cat,b,b+'.'+cat+'.habit.1');C.markActivity(p,cat,b,b+'.'+cat+'.habit.2');}
 return p;}
function makeFakeApp(){
 const world={length:46080,chapterWidth:2880,seed:604203,route:['greenwood','sunmeadow','bluegrass','mosswood','snowcrown','standingstones','sunmeadow','seabright','bluegrass','greenwood','mosswood','starlit','snowcrown','standingstones','sunmeadow','greenwood'],
   chapterAt(x){const n=((x%46080)+46080)%46080,i=Math.floor(n/2880);return {index:i,name:this.route[i],x:n,local:n-i*2880};},
   biomeAt(x){const id=this.chapterAt(x).name;return {id};}};
 function makeCat(id,x){return {id,w:80,frame:0,frameBounds:Array.from({length:32},()=>[0,0,60,60]),position:x,busyUntil:0,socialUntil:0,clock:0,hunger:.3,thirst:.3,brain:{
   target:null,come_to(v){this.target=v;},force(){},place(v){this.target=null;this.owner.position=v;}},
   worldX(){return this.position;}};}
 const catList=[makeCat('onyx',320),makeCat('callie',430),makeCat('harvey',540)];
 catList.forEach(cat=>cat.brain.owner=cat);
 const cats={ready:true,clock:0,commonFootY:410,cats:catList,get(id){return catList.find(c=>c.id===id);},busyState(){return false;},
   invite(cat,v){cat.brain.come_to(v);},limitTentTarget(_cat,_from,target){return target;},
   update(dt){this.clock+=dt;for(const c of catList){c.frame=Math.floor(this.clock*4)%6;if(typeof c.brain.target==='number'){
      const delta=c.brain.target-c.position;const step=Math.sign(delta)*Math.min(Math.abs(delta),18*dt);c.position+=step;}}}
 };
 return {world,cats,camera:{x:100,width:900,paused:false},birds:{visibleBirds:()=>[]}};
}
async function main(){
 check('exactly 8 known biomes',()=>C.BIOMES.length===8 && Object.keys(WW.GameplayData.biomes).length===8);
 check('120 distinct authored activity and work definitions',()=>Object.values(WW.GameplayData.biomes).flatMap(b=>Object.values(b.cats).flatMap(c=>[...c.habits,...c.jobs])).length===120);
 check('all cats have four career levels',()=>C.IDS.every(id=>WW.GameplayData.careers[id].levels.length===4));
 check('all 24 coverage cells can be fulfilled by two distinct visible actions and dwell',()=>C.usedCount(simulateCoverage())===24);
 check('initial profile has zero coverage',()=>C.usedCount(C.newProgress())===0);
 check('merging raw save does not forge fulfilled coverage',()=>{let raw=C.newProgress();raw.coverage.onyx.greenwood.fulfilled=true;return !C.mergeProgress(raw).coverage.onyx.greenwood.fulfilled;});
 check('canonical coin carry, platinum unbounded',()=>JSON.stringify(C.cents(12345))===JSON.stringify({copper:5,silver:4,gold:3,platinum:12,totalCopper:12345}));
 check('base pay cannot exceed 12 copper',()=>[1,2,3,4].map(C.pay).join(',')==='4,6,9,12');
 check('idempotent shifts',()=>{const s=C.newProgress();return C.markShift(s,'onyx','id-1')&&!C.markShift(s,'onyx','id-1')&&s.careers.onyx.xp===1;});
 check('skill tiers promote at explicit levels',()=>[0,2,3,7,8,15,16].map(C.level).join(',')==='1,1,2,2,3,3,4');
 check('real three WASM cat engines retained',()=>C.IDS.every(id=>fs.existsSync(path.join(root,'script',id+'-engine.wasm'))));
 check('21 attached bird contact images retained',()=>C.IDS.every(id=>['bluejay','cardinal','sparrow','finch','dove','robin','hummingbird'].every(b=>fs.existsSync(path.join(root,'assets','cat-contact-'+id+'-'+b+'.png')))));
 for(const id of C.IDS){const bytes=fs.readFileSync(path.join(root,'script',id+'-engine.wasm'));const mod=new WebAssembly.Module(bytes);const e=new WebAssembly.Instance(mod).exports;check(id+' WASM exposes real movement',()=>['init','tick','come_to','place','get'].every(k=>typeof e[k]==='function'));}
 const cModule=new WebAssembly.Module(fs.readFileSync(path.join(root,'script','gameplay-kernel.wasm'))),math=new WebAssembly.Instance(cModule).exports;
 check('gameplay math compiles to true WASM',()=>math.total_coverage(0xffffff)===24 && math.normalize_remainder(3288,10)===8);
 const app=makeFakeApp();const g=new WW.AdventureGameplay(app);await g.start();g.preferences.autoWork=false;g.preferences.autoExplore=false;
 check('guest is not linked to OurSpace wallet',()=>!g.economy.identity);
 check('guest can start a real-actor shift',()=>g.startWork('onyx')===true && g.jobs.size===1);
 for(let i=0;i<65*20;i++){app.cats.update(.05);g.update(.05);}
 check('true walk/action/return progression grants one career XP',()=>g.progress.careers.onyx.xp===1 && g.jobs.size===0);
 check('guest shift does not forge spendable copper',()=>g.economy.pending.size===0 && g.economy.balance===null);
 check('second shift can only be offered if cat is free',()=>g.startWork('onyx')===true && g.startWork('onyx')===false);
 check('cancelled shift does not grant XP',()=>{g.cancelWork('onyx');return g.progress.careers.onyx.xp===1;});
 let remote=0,calls=0;const host={async getBalance(){return {totalCopper:remote};},async earn(e){calls++;remote+=e.amountCopper;return {balance:{totalCopper:remote}};},openStore(){}};
 await g.economy.connect({profileKey:'william',hostAdapter:host}).refresh();
 // in a browser the profile shell event changes game scope; test emulates this explicitly
 await g.loadProfile('william');g.preferences.autoWork=false;g.preferences.autoExplore=false;
 check('authenticated shift starts with existing cat',()=>g.startWork('harvey'));
 for(let i=0;i<67*20;i++){app.cats.update(.05);g.update(.05);}
 await g.economy.flush();
 check('existing OurSpace adapter credits once after verified work',()=>remote===4 && calls===1 && g.progress.careers.harvey.xp===1);
 check('confirmed reward not duplicated on flush',()=>g.economy.pending.size===0 && g.economy.confirmed.size===1);
 await g.economy.flush();
 check('repeated flush cannot repeat credits',()=>remote===4 && calls===1);
 const disconnected=new WW.OurSpaceEconomy();let authRejected=false;try{disconnected.connect({profileKey:'guest',sessionToken:'fake'});}catch(e){authRejected=true;}
 check('unsupported guest cannot authenticate as currency owner',()=>authRejected);
 console.log('TOTAL',checks,'checks passed');
}
main().catch(e=>{console.error('TEST FAILURE:',e);process.exitCode=1;});
