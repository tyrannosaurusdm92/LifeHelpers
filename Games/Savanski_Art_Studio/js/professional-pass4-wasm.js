(function(){
'use strict';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,+v||0));
const fallback={
  sv_clamp:(v,a,b)=>Math.max(+a||0,Math.min(+b||0,+v||0)),
  sv_smoothstep:x=>{x=clamp(x);return x*x*(3-2*x)},
  sv_brush_weight:(d,r,h)=>{r=Math.max(1e-6,+r||1);if(d>=r)return 0;const t=1-Math.max(0,+d||0)/r,s=t*t*(3-2*t),hard=clamp(h);return s*(1-hard)+s*s*hard},
  sv_luma:(r,g,b)=>.2126*(+r||0)+.7152*(+g||0)+.0722*(+b||0),
  sv_mix:(a,b,t)=>(+a||0)+((+b||0)-(+a||0))*clamp(t),
  sv_clamp_angle:(v,min,max)=>Math.max(+min||0,Math.min(+max||0,+v||0)),
  sv_soft_threshold:(v,lo,hi,feather)=>{v=+v||0;lo=+lo||0;hi=+hi||0;feather=Math.max(0,+feather||0);if(lo>hi){const t=lo;lo=hi;hi=t}if(v>=lo&&v<=hi)return 1;if(!feather)return 0;const d=v<lo?lo-v:v-hi;if(d>=feather)return 0;const x=1-d/feather;return x*x*(3-2*x)},
  sv_normalize4:(a,b,c,d)=>{const s=Math.max(1e-12,(+a||0)+(+b||0)+(+c||0)+(+d||0));return [a/s,b/s,c/s,d/s]}
};
const api={
  kernel:fallback,
  ready:false,
  wasm:false,
  async init(){
    if(this.ready)return this.wasm;
    if(typeof WebAssembly==='undefined'){this.ready=true;return false}
    try{
      const res=await fetch('script/savanski-pass4-kernel.wasm',{cache:'no-store'});
      if(!res.ok)throw new Error('HTTP '+res.status);
      const out=await WebAssembly.instantiate(await res.arrayBuffer(),{});
      const ex=out.instance?.exports||out.exports||{};
      this.kernel=Object.assign({},fallback,ex);
      this.wasm=true;
      this.ready=true;
      return true;
    }catch(err){
      console.warn('Savanski Pass-4 WASM fallback active',err);
      this.kernel=fallback;
      this.ready=true;
      return false;
    }
  },
  normalize4(a,b,c,d){
    const fn=this.kernel?.sv_normalize4;
    if(fn&&fn!==fallback.sv_normalize4){
      // The tiny WASM kernel exposes scalar helpers only; JS keeps the four-output shape.
      const s=Math.max(1e-12,(+a||0)+(+b||0)+(+c||0)+(+d||0));
      return [a/s,b/s,c/s,d/s];
    }
    return fallback.sv_normalize4(a,b,c,d);
  }
};
window.SavanskiPass4Wasm=api;
api.init();
})();
