
(function(global){
'use strict';
const $=s=>document.querySelector(s);
function asDataURL(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)})}
async function installFontFromData(name,data){try{const bin=await (await fetch(data)).arrayBuffer(),ff=new FontFace(name,bin);await ff.load();document.fonts.add(ff);return true}catch(e){console.warn('Font restore failed',e);return false}}
function boot(){
 if(!global.LFAdvancedController||!$('#fontInput'))return setTimeout(boot,30);
 const ctl=global.LFAdvancedController;
 $('#fontInput').addEventListener('change',async e=>{
   const f=e.target.files?.[0],o=ctl.store.selected();if(!f||!o||o.type!=='text')return;
   try{const data=await asDataURL(f),name=`LF-${f.name.replace(/\.[^.]+$/,'').replace(/[^a-z0-9_-]/gi,'-')}`;await installFontFromData(name,data);ctl.store.update(o.id,{meta:{fontFamily:name,fontData:data,fontFileName:f.name}},'Upload font');ctl.openInspector(true)}catch(err){console.error(err)}
 },true);
 $('#textTextureInput')?.addEventListener('change',async e=>{
   const f=e.target.files?.[0],o=ctl.store.selected();if(!f||!o)return;try{const src=await asDataURL(f);ctl.store.update(o.id,{style:{texture:{src,repeat:'repeat'}}},'Apply object texture');ctl.openInspector(true)}catch(err){console.error(err)}
 },true);
 const oldLoad=ctl.store.load.bind(ctl.store);ctl.store.load=function(data,reset){const r=oldLoad(data,reset);for(const objs of this.canvases.values())for(const o of objs)if(o.type==='text'&&o.meta?.fontData&&o.meta?.fontFamily)installFontFromData(o.meta.fontFamily,o.meta.fontData);return r}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,50));else setTimeout(boot,50);
})(window);
