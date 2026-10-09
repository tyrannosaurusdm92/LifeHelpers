(function(global){
  'use strict';
  const LF = global.SavanskiArtTools = global.SavanskiArtTools || {};
  LF.version = '2.0.0';
  LF.config = Object.freeze({
    dpi:300,
    backendUrl:'https://script.google.com/macros/s/AKfycbyuKFvcQGFjmhnIIcgoZUmPtDPDZYMjsO64Wf0-lDjQCnvUwoHSoHLNppN-cSy7IETs/exec',
    backendLibrary:'',
    tokenKey:'savanski-canvas-token'
  });
  LF.util = {
    clamp:(v,min,max)=>Math.min(max,Math.max(min,Number(v))),
    uid:(prefix='id')=>`${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`,
    point:(e,canvas)=>{const r=canvas.getBoundingClientRect(); return {x:(e.clientX-r.left)*(canvas.width/r.width),y:(e.clientY-r.top)*(canvas.height/r.height),pressure:e.pressure>0?e.pressure:0.5};},
    rgba:(hex,alpha=1)=>{let h=String(hex||'#000').replace('#',''); if(h.length===3)h=h.split('').map(x=>x+x).join(''); const n=parseInt(h,16); return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${alpha})`;}
  };
})(typeof window!=='undefined'?window:globalThis);
