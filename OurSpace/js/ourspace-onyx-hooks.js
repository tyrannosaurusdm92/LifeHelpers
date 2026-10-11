/* OurSpace Pass 25 Onyx integration loader. Existing ourspace.html references this
   exact filename, so the application's main page and backend remain untouched. */
(function(root){
"use strict";
if(root.__onyxPass25Loader)return;
const activeScript=document.currentScript;
const prefix=new URL("onyx/games/virtual/",activeScript?.src||new URL("js/",document.baseURI));
const names=[
"onyx-base-runtime.js",
"onyx-base-move_north.js","onyx-base-move_north_east.js",
"onyx-base-move_east.js","onyx-base-move_south_east.js",
"onyx-base-move_south.js","onyx-base-move_south_west.js",
"onyx-base-move_west.js","onyx-base-move_north_west.js",
"onyx-base-jump_up.js","onyx-base-jump_down.js","onyx-base-jump_across.js",
"onyx-base-stretch.js","onyx-base-loaf.js","onyx-base-lounge.js",
"onyx-base-curl_ball.js","onyx-base-eat_drink.js","onyx-base-sleep.js",
"onyx-base-play_hunt.js",
"onyx-base-happy-home-bridge.js"
];
const state={status:"loading",loaded:[],errors:[]};
root.__onyxPass25Loader=state;
function load(name){
 return new Promise((resolve,reject)=>{
  const s=document.createElement("script");
  s.src=new URL(name,prefix).href;s.async=false;
  s.onload=()=>{state.loaded.push(name);resolve(name);};
  s.onerror=()=>reject(new Error("Cannot load "+name));document.head.append(s);
 });
}
async function start(){
 // The runtime and action files are small; loading them individually preserves source editability.
 for(const name of names){
  try{await load(name);}catch(e){state.errors.push(e.message);console.error("[Onyx]",e);}
 }
 state.status=state.errors.length?"partial":"ready";
 const adapter=root.OnyxHappyHomeMotion;
 if(root.OnyxImperialExpedition&&adapter)adapter.start();
 root.dispatchEvent(new CustomEvent("ourspace-onyx-integration-loaded",{
  detail:{status:state.status,loaded:state.loaded.slice(),errors:state.errors.slice()}
 }));
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
else start();
})(window);
