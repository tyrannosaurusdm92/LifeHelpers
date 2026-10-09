(function(){
'use strict';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number(v)||0));
const fallback={
  sv5_clamp:(v,a,b)=>Math.max(Number(a)||0,Math.min(Number(b)||0,Number(v)||0)),
  sv5_smoothstep:x=>{x=clamp(x);return x*x*(3-2*x)},
  sv5_radial:(d,r,h)=>{r=Math.max(1e-6,Number(r)||1);d=Math.max(0,Number(d)||0);if(d>=r)return 0;const t=1-d/r,s=t*t*(3-2*t),hard=clamp(h);return s*(1-hard)+s*s*hard},
  sv5_luma:(r,g,b)=>.2126*(Number(r)||0)+.7152*(Number(g)||0)+.0722*(Number(b)||0),
  sv5_mix:(a,b,t)=>(Number(a)||0)+((Number(b)||0)-(Number(a)||0))*clamp(t),
  sv5_soft_similarity:(d,inner,outer)=>{d=Math.max(0,Number(d)||0);inner=Math.max(0,Number(inner)||0);outer=Math.max(inner+1e-6,Number(outer)||inner+1);if(d<=inner)return 1;if(d>=outer)return 0;const x=1-(d-inner)/(outer-inner);return x*x*(3-2*x)}
};
const api={kernel:fallback,ready:false,wasm:false,async init(){if(this.ready)return this.wasm;if(typeof WebAssembly==='undefined'){this.ready=true;return false}try{const res=await fetch('script/savanski-pass5-kernel.wasm',{cache:'no-store'});if(!res.ok)throw new Error('HTTP '+res.status);const out=await WebAssembly.instantiate(await res.arrayBuffer(),{});this.kernel=Object.assign({},fallback,out.instance?.exports||out.exports||{});this.wasm=true;this.ready=true;return true}catch(err){console.warn('Savanski Pass-5 WASM fallback active',err);this.kernel=fallback;this.ready=true;return false}}};
window.SavanskiPass5Wasm=api;
api.init();
})();
