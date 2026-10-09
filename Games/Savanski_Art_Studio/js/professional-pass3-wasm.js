(function(){
'use strict';
const fallback={
 sv_lerp:(a,b,t)=>a+(b-a)*Math.max(0,Math.min(1,+t||0)),
 sv_taubin:(c,a,f)=>c+(a-c)*(+f||0),
 sv_smoothstep:x=>{x=Math.max(0,Math.min(1,+x||0));return x*x*(3-2*x)},
 sv_soft_band:(d,tol,feather)=>{d=Math.max(0,+d||0);tol=Math.max(0,+tol||0);feather=Math.max(0,+feather||0);if(d<=tol)return 1;if(!feather||d>=tol+feather)return 0;let x=1-(d-tol)/feather;x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)},
 sv_reinhard:(x,exposure)=>{const v=Math.max(0,(+x||0)*(+exposure||1));return v/(1+v)},
 sv_brush_weight:(d,r,h)=>{r=Math.max(1e-6,+r||1);if(d>=r)return 0;let t=1-Math.max(0,+d||0)/r,s=t*t*(3-2*t);h=Math.max(0,Math.min(1,+h||0));return s*(1-h)+s*s*h},
 sv_lab_distance2:(l1,a1,b1,l2,a2,b2)=>{const dl=l1-l2,da=a1-a2,db=b1-b2;return dl*dl+da*da+db*db}
};
const api={kernel:fallback,ready:false,async init(){if(this.ready)return true;if(typeof WebAssembly==='undefined'){this.ready=true;return false}try{const res=await fetch('script/savanski-pass3-kernel.wasm',{cache:'no-store'});if(!res.ok)throw new Error('HTTP '+res.status);const out=await WebAssembly.instantiate(await res.arrayBuffer(),{});this.kernel=Object.assign({},fallback,out.instance?.exports||out.exports||{});this.ready=true;return true}catch(e){console.warn('Savanski Pass-3 WASM fallback active',e);this.kernel=fallback;this.ready=true;return false}}};
window.SavanskiPass3Wasm=api;api.init();
})();
