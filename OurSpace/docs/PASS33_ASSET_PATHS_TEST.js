/* Pass33: checks source asset URLs without making backend requests. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const script='https://tyrannosaurusdm92.github.io/LifeHelpers/OurSpace/js/onyx/games/virtual/onyx-base-eat_drink.js';
let def;const w={OnyxBaseMotion:{register:d=>{def=d}}};
vm.runInNewContext(read('js/onyx/games/virtual/onyx-base-eat_drink.js'),{window:w,document:{currentScript:{src:script},baseURI:'https://tyrannosaurusdm92.github.io/LifeHelpers/OurSpace/'},URL,console});
assert.ok(def,'feeding action not registered');
for(const mode of ['eat','drink'])for(const side of ['left','right'])for(let n=1;n<=3;n++){
 const sample=def.sample(null,{hold:false,elapsedMs:[0,650,2520][n-1],durationMs:2600,data:{mode,side}});
 const expected='https://tyrannosaurusdm92.github.io/LifeHelpers/OurSpace/assets/images/games/virtual/atlases/onyx_'+mode+'_'+side+'_';
 assert.ok(sample.url.startsWith(expected),sample.url);
 assert.ok(fs.existsSync(path.join(root,new URL(sample.url).pathname.split('/OurSpace/')[1])));
}
const atlas='assets/images/games/virtual/atlases/onyx_meow_sprite_atlas.png';
assert.ok(fs.existsSync(path.join(root,atlas)));
const spr={};spr.window=spr;class FakeImage{constructor(){this.width=1919;this.height=1408}set src(v){this.onload?.()}}
vm.runInNewContext(read('js/onyx/games/virtual/onyx-base-sprites.js'),{window:spr,Image:FakeImage,Math,Promise,console});
const renderer=new spr.OnyxBaseSprites.Sprites();assert.equal(renderer.path,atlas);
renderer.atlas={width:1919,height:1408};const ctx={drawImage(...args){this.last=args}};
assert.equal(renderer.draw(ctx,{direction:'north_east',side:'right',row:0,phase:4},100,150),true);
assert.equal(ctx.last[3],63,'must stay within original 1919px atlas');
assert.ok(read('js/onyx/games/virtual/onyx-base-runtime.js').includes("new URL('"+atlas+"',assetBase).href"));
for(const profile of ['william','jasper']){let html=read('assets/code/'+profile+'.html');assert.match(html,/<base\s+href=['"]\.\.\/\.\.\//);assert.ok(html.includes('js/ourspace-onyx-hooks.js'));}
console.log('PASS Pass33: all 12 feeding SVGs, atlas path and crop, two profiles');