/* OurSpace Pass 36: browser-free regression checks; run from OurSpace root with node.
   Exercises original source scripts; does not call Apps Script or change state on GitHub. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'..');
const animSrc=fs.readFileSync(path.join(base,'js/onyx/games/virtual/onyx-animation-controller.js'),'utf8');
const gameSrc=fs.readFileSync(path.join(base,'js/onyx/games/leisure/core-app.js'),'utf8');
new vm.Script(animSrc);new vm.Script(gameSrc);
const aCtx={};aCtx.window={};vm.runInNewContext(animSrc,aCtx);
const controller=aCtx.window.OnyxAnimationController;
assert.equal(controller.version,'36.0');
const a=controller.create({walkCyclePx:100,runCyclePx:100});
a.setAction('walk');a.tick(100,24);
const before=a.getFrame();assert.equal(before.phase,1);
a.setAction('run');assert.equal(a.getFrame().phase,before.phase);
a.tick(100,0);assert.equal(a.getFrame().phase,before.phase);
a.setPaused(true);a.tick(100,50);assert.equal(a.getFrame().phase,before.phase);
a.setPaused(false);a.setReducedMotion(true);assert.equal(a.getFrame().phase,0);
assert.equal(a.setDirection('north').authoredFacing,'north_east');
assert.equal(a.getFrame().approximatedFacing,true);
a.reset();assert.equal(a.getFrame().travelPx,0);
assert.equal(gameSrc.includes('document.body.innerHTML'),false);
const nodes=[];
function makeElement(tag){return {tag,id:'',style:{},setAttribute(){},append(...a){this.children=(this.children||[]).concat(a);},replaceChildren(){this.children=[]},remove(){},addEventListener(type,fn){this.handlers=this.handlers||{};this.handlers[type]=fn;}};}
const host={querySelector(sel){return nodes.find(n=>'#'+n.id===sel)||null;},prepend(n){nodes.unshift(n);}};
const document={querySelector(){return host;},body:host,createElement:makeElement};
const localStorage={getItem(){throw Error('storage denied')},setItem(){throw Error('storage denied')},removeItem(){throw Error('storage denied')}};
const window={matchMedia:()=>({matches:true}),dispatchEvent(){},FHMAudio:null};
const fetch=async()=>{throw Error('network unavailable')};
const sandbox={window,document,localStorage,fetch,CustomEvent:class{constructor(type,init){this.type=type;this.detail=init?.detail}},console:{error(){},log(){}}};
vm.runInNewContext(gameSrc,sandbox);
const game=window.FHM;assert.ok(game);
game.S.level=3;game.S.recipe={id:'test-recipe'};game.saveCheckpoint('market');
assert.equal(game.getCheckpoint().level,3);
assert.equal(game.storageStatus.persistent,false);
assert.ok(nodes.some(n=>n.id==='fhmStorageStatus'));
setImmediate(()=>{
 const alert=nodes.find(n=>n.id==='fhmLoadStatus');
 assert.ok(alert,'Expected scoped failure alert');
 assert.ok(alert.children.some(n=>n.tag==='button'),'Expected retry button');
 console.log('PASS: syntax, gait continuity, zero-motion freeze, pause, reduced motion, 6-view fallback, storage fallback, scoped failure UI');
});
