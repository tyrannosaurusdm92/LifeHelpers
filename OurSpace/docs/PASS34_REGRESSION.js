/* Pass 34 isolated regression suite; run: node docs/PASS34_REGRESSION.js */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const dir=path.join(__dirname,'..'),source=p=>fs.readFileSync(path.join(dir,p),'utf8');let passed=0;
function check(name,fn){fn();passed++;console.log('PASS',name);}
const sprite={};vm.runInNewContext(source('js/onyx/games/virtual/onyx-base-flipbook.js'),sprite);
check('weighted pose loop',()=>{const f=sprite.OnyxBaseFlipbook;assert.equal(f.loop(50,400,[1,2,1]),0);assert.equal(f.loop(150,400,[1,2,1]),1);assert.equal(f.loop(350,400,[1,2,1]),2);assert.equal(f.loop(450,400,[1,2,1]),0);});
check('nonloop and reduced motion',()=>{const f=sprite.OnyxBaseFlipbook;assert.equal(f.oneShot(250,[100,200,100]),1);assert.equal(f.oneShot(450,[100,200,100]),2);assert.equal(f.loop(350,400,[1,2,1],{reducedMotion:true}),0);});
check('original six angles',()=>{const f=sprite.OnyxBaseFlipbook;assert.equal(f.facing('north','left'),'north_west');assert.equal(f.facing('south','right'),'south_east');});
const storage=new Map([['ONYX_LEISURE_SHARED_CHAT_V1','[{"role":"user","text":"old shared history"}]']]),listeners={},root={dataset:{profile:'william'}};
const document={documentElement:root,querySelector(){return null;},createElement(){return {appendChild(){}};}};
const window={addEventListener(k,f){listeners[k]=f;},dispatchEvent(e){listeners[e.type]?.(e);}};
const C=class{constructor(type,opts){this.type=type;this.detail=opts?.detail;}};
vm.runInNewContext(source('js/onyx/games/leisure/chat-sync.js'),{window,document,CustomEvent:C,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},Math,Date,setTimeout,clearTimeout,console});
check('profile-local leisure history',()=>{window.recordAdventure('William cat');root.dataset.profile='jasper';window.recordAdventure('Jasper cat');assert.match(storage.get('ONYX_LEISURE_CHAT_V2.william'),/William cat/);assert.doesNotMatch(storage.get('ONYX_LEISURE_CHAT_V2.jasper'),/William cat/);assert.match(storage.get('ONYX_LEISURE_CHAT_V2.jasper'),/Jasper cat/);});
check('original shared cache preserved',()=>assert.match(storage.get('ONYX_LEISURE_SHARED_CHAT_V1'),/old shared history/));
check('late cross-profile event ignored',()=>{const before=storage.get('ONYX_LEISURE_CHAT_V2.jasper');listeners['onyx:chat-line']({detail:{profile:'william',tab:'leisure',role:'onyx',content:'secret'}});assert.equal(storage.get('ONYX_LEISURE_CHAT_V2.jasper'),before);});
check('anonymous profile not persisted',()=>{root.dataset.profile='';window.recordAdventure('anonymous');assert.equal(storage.has('ONYX_LEISURE_CHAT_V2.anonymous'),false);});
const market=source('js/onyx/games/leisure/phase-market_madness.js');
check('primary pointer and cancellation present',()=>{assert.match(market,/e.pointerId!==activePointer/);assert.match(market,/e.isPrimary===false/);assert.match(market,/visibilitychange/);assert.match(market,/function keyboardCell/);});
check('loader orders flipbook before runtime',()=>{const l=source('js/ourspace-onyx-hooks.js');assert.ok(l.indexOf("'onyx-base-flipbook.js'")>=0&&l.indexOf("'onyx-base-flipbook.js'")<l.indexOf("'onyx-base-runtime.js'"));});
console.log('PASS '+passed+' total');
