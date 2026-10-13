/* OurSpace Pass 37: renderer, distance continuity, and session-save regressions. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(base,p),'utf8');
const profSrc=read('js/onyx/onyx-core/shared-prof.js');
const frameSrc=read('js/onyx/onyx-core/shared-onyx-frame-animation.js');
const bipedSrc=read('js/onyx/games/virtual/biped_professor.js');
const envSrc=read('js/onyx/games/virtual/env.js');
const hostSrc=read('assets/code/william.html');
const coreSrc=read('js/onyx/games/leisure/core-app.js');
for(const src of [profSrc,frameSrc,bipedSrc,envSrc,coreSrc])new vm.Script(src);

assert.ok(hostSrc.includes('js/onyx/onyx-core/shared-prof.js'),'profile loads the existing Professor renderer');
assert.ok(envSrc.includes('bipedGaitDistancePx+=traveledPx'),'Happy Home measures actual screen travel');
assert.ok(envSrc.includes('gaitDistancePx:bipedGaitDistancePx,gaitSpeedPxPerSec:bipedGaitSpeedPxPerSec'),'Happy Home sends distance and speed to the renderer');
assert.ok(profSrc.includes('runtime.gaitPhase'),'renderer uses a normalized distance-driven phase');

class FakeImage{constructor(){this.complete=false;this.naturalWidth=0;this.naturalHeight=0;this.decoding='';this.src='';}}
const actorContext=vm.createContext({
 window:{},
 Image:FakeImage,
 matchMedia:()=>({matches:false}),
 performance:{now:()=>0},
 console
});
vm.runInContext(frameSrc,actorContext);
vm.runInContext(bipedSrc,actorContext);
vm.runInContext(profSrc,actorContext);
const actor=actorContext.window.OnyxProfessorContactSheetFactory.createProfessorActor();
actor.enterProfessor(0,'manual','standing');
const surface={width:96,height:96,dataset:{},getContext:()=>({clearRect(){},drawImage(){},imageSmoothingEnabled:false})};
const first=actor.render(surface,{time:5000,facing:'right',moving:true,gaitDistancePx:30,gaitSpeedPxPerSec:100});
assert.equal(actor.getState().mode,'standing');
assert.equal(first.frame,'f034','screen distance selects the matching biped contact frame');
const stalled=actor.render(surface,{time:5008,facing:'right',moving:true,gaitDistancePx:30,gaitSpeedPxPerSec:0});
assert.equal(stalled.frame,first.frame,'stationary distance holds the current gait pose');
const speedChanged=actor.render(surface,{time:5016,facing:'right',moving:true,gaitDistancePx:30,gaitSpeedPxPerSec:200});
assert.equal(speedChanged.frame,first.frame,'a speed-only change must not jump the actor backward in its gait');
const progressed=actor.render(surface,{time:5032,facing:'right',moving:true,gaitDistancePx:67,gaitSpeedPxPerSec:200});
assert.equal(progressed.frame,'f032','new travel advances the normalized gait cycle');
assert.equal(surface.dataset.onyxAtlasFrame,progressed.frame);

function makeElement(tag){return{tag,id:'',style:{},children:[],setAttribute(){},append(...items){this.children.push(...items)},replaceChildren(){this.children=[]},remove(){},addEventListener(type,fn){this.handlers=this.handlers||{};this.handlers[type]=fn}}}
function makeHost(nodes){return{querySelector(sel){return nodes.find(n=>'#'+n.id===sel)||null},prepend(node){nodes.unshift(node)}}}
const nodes=[],host=makeHost(nodes);
const document={querySelector:()=>host,body:host,createElement:makeElement};
const persisted=new Map([['fhm.run.v3',JSON.stringify({level:1,phase:'old'})]]);
const localStorage={
 getItem(key){return persisted.has(key)?persisted.get(key):null},
 setItem(){throw new Error('quota exceeded')},
 removeItem(){throw new Error('storage unavailable')}
};
const gameWindow={matchMedia:()=>({matches:false}),dispatchEvent(){},FHMAudio:null};
const gameContext=vm.createContext({
 window:gameWindow,document,localStorage,
 fetch:async()=>{throw new Error('network unavailable')},
 CustomEvent:class{constructor(type,init){this.type=type;this.detail=init?.detail}},
 console:{error(){},log(){}}
});
vm.runInContext(coreSrc,gameContext);
const game=gameWindow.FHM;
assert.ok(game);
game.S.level=8;game.S.recipe={id:'test'};
game.saveCheckpoint('garden');
assert.equal(game.getCheckpoint().level,8,'new session save takes precedence over stale readable storage');
assert.equal(game.getCheckpoint().phase,'garden');
assert.equal(game.storageStatus.persistent,false);
assert.ok(nodes.some(n=>n.id==='fhmStorageStatus'),'storage failure is announced');
setImmediate(()=>{
 const alert=nodes.find(n=>n.id==='fhmLoadStatus');
 assert.ok(alert,'failed data load has a scoped alert');
 assert.ok(alert.children.some(n=>n.tag==='button'),'failed data load offers retry');
 console.log('PASS: actual Professor distance-gait, speed-change continuity, scoped vector/keyframe phase, storage quota fallback, retry UI, syntax and host wiring');
});
