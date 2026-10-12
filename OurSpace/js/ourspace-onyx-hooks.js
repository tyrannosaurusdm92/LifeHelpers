/* OurSpace Pass 31 — load original Pass23 movement modules in dependency order.
 * The frontend and backend of the existing application are left intact.
 */
(function(root){'use strict';
 if(root.__onyxPass31Loader)return;
 const source=document.currentScript;
 const base=new URL('onyx/games/virtual/',source?.src||new URL('js/',document.baseURI));
 const modules=[
  'onyx-base-physics.js','onyx-base-gait.js','onyx-base-navigation.js',
  'onyx-base-profiles.js','onyx-base-sprites.js','onyx-base-flipbook.js','onyx-animation-controller.js','onyx-base-runtime.js',
  'onyx-base-move_north.js','onyx-base-move_north_east.js',
  'onyx-base-move_east.js','onyx-base-move_south_east.js',
  'onyx-base-move_south.js','onyx-base-move_south_west.js',
  'onyx-base-move_west.js','onyx-base-move_north_west.js',
  'onyx-base-jump_up.js','onyx-base-jump_down.js','onyx-base-jump_across.js',
  'onyx-base-stretch.js','onyx-base-loaf.js','onyx-base-lounge.js',
  'onyx-base-curl_ball.js','onyx-base-eat_drink.js','onyx-base-sleep.js',
  'onyx-base-play_hunt.js',
  // This conductor accesses OnyxBaseMotion on initialization: load AFTER runtime.
  'onyx-base-sequences.js','onyx-base-happy-home-bridge.js'
 ];
 const status={version:'31.0',status:'loading',loaded:[],errors:[]};
 root.__onyxPass31Loader=status;
 function add(file){return new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src=new URL(file,base).href;script.async=false;
  script.onload=()=>{status.loaded.push(file);resolve();};
  script.onerror=()=>reject(new Error('Failed loading '+file));document.head.appendChild(script);
 });}
 async function initialize(){
  for(const name of modules){try{await add(name)}catch(error){
   status.errors.push(String(error?.message||error));console.error('[Onyx Pass31]',error);
   // Dependencies are required for a correct runtime. Never execute action modules
   // against a partially loaded engine.
   if(name==='onyx-base-runtime.js'||name==='onyx-base-physics.js'||name==='onyx-base-sprites.js')break;
  }}
  if(root.OnyxBaseMotion?.version!=='23.0')status.errors.push('Original Pass23 movement runtime unavailable');
  status.status=status.errors.length?'partial':'ready';
  if(status.status==='ready')root.OnyxHappyHomeMotion?.start();
  root.dispatchEvent?.(new CustomEvent('ourspace-onyx-integration-loaded',{detail:{...status,loaded:status.loaded.slice(),errors:status.errors.slice()}}));
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});
 else initialize();
})(window);
