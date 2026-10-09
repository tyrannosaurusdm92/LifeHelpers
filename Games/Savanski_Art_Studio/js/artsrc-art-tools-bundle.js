(function(global){
 'use strict'; const LF=global.SavanskiArtTools;
 LF.createHost = function(canvas,{presetId='canvas-portrait-6x9',background=null,emit=()=>{}}={}){
   const adapter=new LF.CanvasAdapter(canvas,{presetId,background});
   const registry=new LF.ToolRegistry();
   const brush=new LF.BrushEngine(adapter.ctx);
   const history=new LF.History();
   const host={canvas,context:adapter.ctx,adapter,registry,brush,history,emit,settings:{color:'#001010',size:24,opacity:1},toolInstance:null};
   for(const t of Object.values(LF.tools||{})) registry.register(t);
   host.setPreset=id=>{const p=adapter.setPreset(id);host.context=adapter.ctx;host.brush=new LF.BrushEngine(host.context);history.capture(canvas,'resize');return p;};
   host.setTool=(id,settings={})=>{host.settings={...host.settings,...settings};const descriptor=registry.activate(id,host);host.toolInstance=descriptor.create?.(host.settings)||descriptor;return host.toolInstance;};
   host.pointerDown=e=>host.toolInstance?.pointerDown?.(e,host);
   host.pointerMove=e=>host.toolInstance?.pointerMove?.(e,host);
   host.pointerUp=e=>host.toolInstance?.pointerUp?.(e,host);
   host.apply=(id,args={})=>{const t=registry.get(id);if(!t?.apply)throw new Error(`${id} is not an apply-style tool`);return t.apply(host,args);};
   host.bindPointerEvents=()=>{canvas.style.touchAction='none';canvas.addEventListener('pointerdown',host.pointerDown);canvas.addEventListener('pointermove',host.pointerMove);canvas.addEventListener('pointerup',host.pointerUp);canvas.addEventListener('pointercancel',host.pointerUp);};
   host.destroy=()=>{canvas.removeEventListener('pointerdown',host.pointerDown);canvas.removeEventListener('pointermove',host.pointerMove);canvas.removeEventListener('pointerup',host.pointerUp);canvas.removeEventListener('pointercancel',host.pointerUp);};
   history.capture(canvas,'initial');
   return host;
 };
})(typeof window!=='undefined'?window:globalThis);
