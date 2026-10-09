(function(){
'use strict';
const FALLBACK={
 smooth_weight:(distance,radius,hardness)=>{const r=Math.max(1e-6,+radius||1),d=Math.max(0,+distance||0),h=Math.max(0,Math.min(1,+hardness||0));const t=Math.max(0,1-d/r),a=t*t*(3-2*t);return a*(1-h)+a*a*h;},
 laplacian_mix:(current,avg,strength)=>current+(avg-current)*Math.max(0,Math.min(1,+strength||0)),
 crease_delta:(distance,radius,strength,hardness)=>{const t=FALLBACK.smooth_weight(distance,radius,hardness);return -(+strength||0)*t*t;},
 clay_delta:(distance,radius,strength,hardness)=>{const t=FALLBACK.smooth_weight(distance,radius,hardness);return (+strength||0)*t*(0.35+0.65*t);},
 scrape_delta:(planeDistance,strength,weight)=>-(+planeDistance||0)*Math.max(0,Math.min(1,(+strength||0)*(+weight||0))),
 skin_falloff:(distance,radius)=>{const r=Math.max(1e-6,+radius||1),x=Math.max(0,1-(+distance||0)/r);return x*x*(3-2*x);},
 soft_threshold:(value,target,tolerance,feather)=>{const d=Math.abs((+value||0)-(+target||0)),t=Math.max(0,+tolerance||0),f=Math.max(1e-6,+feather||0);if(d<=t)return 1;if(d>=t+f)return 0;const x=1-(d-t)/f;return x*x*(3-2*x);},
 luma:(r,g,b)=>0.2126*(+r||0)+0.7152*(+g||0)+0.0722*(+b||0),
 lab_distance2:(l1,a1,b1,l2,a2,b2)=>{const dl=l1-l2,da=a1-a2,db=b1-b2;return dl*dl+da*da+db*db;},
 catmull:(p0,p1,p2,p3,t)=>{const t2=t*t,t3=t2*t;return .5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3);},
 smoothstep01:t=>{t=Math.max(0,Math.min(1,+t||0));return t*t*(3-2*t);},
 mask_blend:(current,target,weight,strength)=>{const s=Math.max(0,Math.min(1,(+weight||0)*(+strength||0)));return Math.max(0,Math.min(1,(+current||0)+((+target||0)-(+current||0))*s));},
 weight_blend:(current,target,weight,strength)=>{const s=Math.max(0,Math.min(1,(+weight||0)*(+strength||0)));return Math.max(0,Math.min(1,(+current||0)+((+target||0)-(+current||0))*s));}
};
let kernel=FALLBACK,ready=false,attempted=false;
async function instantiate(bytes){const result=await WebAssembly.instantiate(bytes,{});return result.instance?result.instance.exports:result.exports;}
async function init(){
 if(attempted)return ready;attempted=true;
 if(typeof WebAssembly==='undefined')return false;
 try{
   let bytes=null;
   if(location.protocol!=='file:'){try{const r=await fetch('script/savanski-professional-kernel.wasm',{cache:'no-store'});if(r.ok)bytes=await r.arrayBuffer();}catch(_e){}}
   if(!bytes){const raw=atob('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'),u8=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)u8[i]=raw.charCodeAt(i);bytes=u8.buffer;}
   const ex=await instantiate(bytes);kernel=Object.assign({},FALLBACK,ex);ready=true;
 }catch(e){console.warn('Savanski professional WASM fallback active',e);kernel=FALLBACK;ready=false;}
 api.kernel=kernel;api.ready=ready;return ready;
}
const api={kernel,ready,init};
window.SavanskiProfessionalWasm=api;
})();
