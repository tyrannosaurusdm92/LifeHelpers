/* OurSpace Pass32 integration smoke test; run: node docs/PASS32_INTEGRATION_SMOKE.js
   No backend requests or profile credentials are used. */
'use strict';
const fs=require('node:fs'), path=require('node:path'), vm=require('node:vm'), assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..'),file=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const exists=p=>fs.existsSync(path.join(ROOT,p));
let passed=0;
function check(name,run){run();console.log('PASS',name);passed++;}
const modules=['physics','gait','navigation','profiles','sprites','runtime',
 ...['north','north_east','east','south_east','south','south_west','west','north_west'].map(x=>'move_'+x),
 'jump_up','jump_down','jump_across','stretch','loaf','lounge','curl_ball','eat_drink','sleep','play_hunt','sequences'];
check('Only one top-level HTML entry',()=>assert.deepEqual(fs.readdirSync(ROOT).filter(x=>x.endsWith('.html')),['ourspace.html']));
for(const who of ['william','jasper'])check(who+' profile loads complete Onyx movement engine',()=>{
 const html=file('assets/code/'+who+'.html');
 assert.match(html,/<base\s+href=["']\.\.\/\.\.\/["']/i);
 const scripts=[...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/g)].map(m=>m[1]);
 assert.equal(scripts.filter(x=>x==='js/ourspace-onyx-hooks.js').length,1);
 for(const s of scripts)if(s.startsWith('js/'))assert.ok(exists(s),'Missing '+s);
});
check('All 25 original Pass 23 movement modules present',()=>{
 for(const m of modules)assert.ok(exists('js/onyx/games/virtual/onyx-base-'+m+'.js'),m);
});
check('12 scaled eating/drinking SVG frames present',()=>{
 for(const pose of ['eat','drink'])for(const dir of ['left','right'])for(const frame of ['01','02','03']){
  const p='assets/images/games/virtual/atlases/onyx_'+pose+'_'+dir+'_'+frame+'.svg';
  assert.ok(exists(p),p);
 }
});
check('Happy Home uses the profile-level movement bridge',()=>{
 const env=file('js/onyx/games/virtual/env.js');
 assert.match(env,/window\.OnyxHappyHomeMotion\?\.action/);
 assert.match(env,/window\.OnyxBaseMotion\|\|shellWindow\(\)\?\.OnyxBaseMotion/);
 assert.ok(env.includes("/room/'+asset"),'fish SVG URL missing directory slash');
});
check('Pass 23 runtime registers 18 movement/activity modules',()=>{
 const w={};w.window=w;w.globalThis=w;
 const ctx=vm.createContext({window:w,globalThis:w,console,Math,Image:undefined});
 for(const m of modules)vm.runInContext(file('js/onyx/games/virtual/onyx-base-'+m+'.js'),ctx,{filename:m});
 assert.equal(w.OnyxBaseMotion.version,'23.0');
 assert.equal(w.OnyxBaseMotion.list().length,18);
});
console.log('PASS',passed,'integration checks');
