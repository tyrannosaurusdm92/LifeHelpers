(function(){
'use strict';
const api=window.SavanskiPass6Wasm=window.SavanskiPass6Wasm||{kernel:null,ready:false,promise:null};
api.init=function(){
 if(api.promise)return api.promise;
 api.promise=fetch('script/savanski-pass6-kernel.wasm').then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return WebAssembly.instantiateStreaming?WebAssembly.instantiateStreaming(Promise.resolve(r),{}):r.arrayBuffer().then(b=>WebAssembly.instantiate(b,{}))}).then(result=>{api.kernel=(result.instance||result).exports;api.ready=true;return api.kernel}).catch(async err=>{
   console.warn('Savanski Pass 6 WASM streaming load failed; retrying as ArrayBuffer.',err);
   try{const r=await fetch('script/savanski-pass6-kernel.wasm');const b=await r.arrayBuffer();const result=await WebAssembly.instantiate(b,{});api.kernel=result.instance.exports;api.ready=true;return api.kernel}catch(e){console.warn('Savanski Pass 6 WASM unavailable; JavaScript fallbacks remain active.',e);api.kernel=null;return null}
 });
 return api.promise;
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>api.init());else api.init();
})();
