(function(){
'use strict';
const api={ready:false,kernel:null,error:null};
api.init=async function(){
 if(api.ready&&api.kernel)return api.kernel;
 try{
  const r=await fetch('script/savanski-pass7-kernel.wasm',{cache:'no-store'});
  if(!r.ok)throw new Error('HTTP '+r.status);
  const mod=await WebAssembly.instantiate(await r.arrayBuffer(),{});
  api.kernel=mod.instance.exports;
  api.ready=true;
  return api.kernel;
 }catch(err){api.error=err;console.warn('Savanski Pass-7 WASM unavailable; JS fallbacks remain active.',err);return null}
};
window.SavanskiPass7Wasm=api;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>api.init());else api.init();
})();