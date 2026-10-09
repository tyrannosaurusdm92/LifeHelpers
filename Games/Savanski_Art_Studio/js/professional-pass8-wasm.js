(function(){
'use strict';
const api=window.SavanskiPass8Wasm=window.SavanskiPass8Wasm||{kernel:null,ready:false,promise:null,error:null};
api.init=function(){
 if(api.promise)return api.promise;
 api.promise=fetch('script/savanski-pass8-kernel.wasm',{cache:'no-store'})
  .then(async r=>{if(!r.ok)throw new Error('HTTP '+r.status);const b=await r.arrayBuffer();return WebAssembly.instantiate(b,{})})
  .then(result=>{api.kernel=(result.instance||result).exports;api.ready=true;return api.kernel})
  .catch(err=>{api.error=err;api.kernel=null;console.warn('Savanski Pass 8 WASM unavailable; JavaScript fallbacks remain active.',err);return null});
 return api.promise;
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>api.init());else api.init();
})();