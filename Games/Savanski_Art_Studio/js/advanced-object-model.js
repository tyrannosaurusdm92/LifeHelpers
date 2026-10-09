
(function(global){
'use strict';
const A=global.LFAdvanced=global.LFAdvanced||{};
const deep=v=>v==null?v:JSON.parse(JSON.stringify(v));
const uid=(p='obj')=>`${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;
const defaults={
 transform:{x:0,y:0,scaleX:1,scaleY:1,rotation:0,skewX:0,skewY:0,
   perspective:{tl:{x:0,y:0},tr:{x:0,y:0},br:{x:0,y:0},bl:{x:0,y:0}}},
 style:{fill:'#000000',stroke:'#000000',strokeWidth:0,opacity:1,blendMode:'source-over',
   lineCap:'round',lineJoin:'round',nibShape:'circle',brushKind:'brush',texture:null,
   gradient:null,border:{enabled:false,color:'#000000',width:0,style:'solid'}},
 effects:{brightness:1,contrast:1,saturation:1,hue:0,sepia:0,grayscale:0,invert:0,
   blur:0,sharpness:0,transparency:0,temperature:0,tint:0,vignette:0,grain:0},
 crop:{shape:'free',x:0,y:0,width:1,height:1,feather:0,customPath:null},
 meta:{}
};
function merge(base,extra){const o={...base,...(extra||{})};for(const k of ['transform','style','effects','crop','meta'])o[k]={...base[k],...(extra?.[k]||{})};o.transform.perspective={...base.transform.perspective,...(extra?.transform?.perspective||{})};o.style.border={...base.style.border,...(extra?.style?.border||{})};return o;}
class SceneStore{
 constructor(){this.canvases=new Map();this.canvasId='canvas-1';this.selectedId=null;this.clipboard=null;this.undoStack=[];this.redoStack=[];this.limit=120;this.ensureCanvas(this.canvasId);}
 ensureCanvas(id){if(!this.canvases.has(id))this.canvases.set(id,[]);return this.canvases.get(id)}
 setCanvas(id){this.canvasId=id||'canvas-1';this.ensureCanvas(this.canvasId);this.selectedId=null;return this.list()}
 list(){return this.ensureCanvas(this.canvasId)}
 selected(){return this.list().find(o=>o.id===this.selectedId)||null}
 create(type,props={}){
   const d=merge(defaults,props);
   return {...d,id:props.id||uid(type),type,name:props.name||type.replace(/(^|-)(\w)/g,(_,a,b)=>' '+b.toUpperCase()).trim(),
     visible:props.visible!==false,locked:!!props.locked,createdAt:props.createdAt||Date.now(),updatedAt:Date.now()};
 }
 add(type,props={},select=true){this.snapshot(`Add ${type}`);const o=this.create(type,props);this.list().push(o);if(select)this.selectedId=o.id;this.changed('add',o);return o}
 insertObject(obj,select=true){this.snapshot(`Insert ${obj?.type||'object'}`);const o=this.create(obj.type||'object',obj);this.list().push(o);if(select)this.selectedId=o.id;this.changed('add',o);return o}
 select(id){this.selectedId=this.list().some(o=>o.id===id)?id:null;this.changed('select',this.selected());return this.selected()}
 clearSelection(){this.selectedId=null;this.changed('select',null)}
 remove(id=this.selectedId){const a=this.list(),i=a.findIndex(o=>o.id===id);if(i<0)return false;this.snapshot('Delete object');a.splice(i,1);if(this.selectedId===id)this.selectedId=null;this.changed('remove');return true}
 duplicate(id=this.selectedId){const o=this.list().find(x=>x.id===id);if(!o)return null;this.snapshot('Duplicate object');const c=deep(o);c.id=uid(o.type);c.name=`${o.name} copy`;c.transform.x+=Math.max(8,(c.geometry?.width||30)*.04);c.transform.y+=Math.max(8,(c.geometry?.height||30)*.04);c.createdAt=c.updatedAt=Date.now();this.list().push(c);this.selectedId=c.id;this.changed('duplicate',c);return c}
 reorder(id=this.selectedId,delta=1){const a=this.list(),i=a.findIndex(o=>o.id===id);if(i<0)return false;const j=Math.max(0,Math.min(a.length-1,i+delta));if(i===j)return false;this.snapshot('Reorder object');const [o]=a.splice(i,1);a.splice(j,0,o);this.changed('reorder',o);return true}
 bringFront(id=this.selectedId){const a=this.list(),i=a.findIndex(o=>o.id===id);if(i<0||i===a.length-1)return;this.snapshot('Bring to front');a.push(a.splice(i,1)[0]);this.changed('reorder')}
 sendBack(id=this.selectedId){const a=this.list(),i=a.findIndex(o=>o.id===id);if(i<=0)return;this.snapshot('Send to back');a.unshift(a.splice(i,1)[0]);this.changed('reorder')}
 update(id,patch,label='Edit object'){const o=this.list().find(x=>x.id===id);if(!o||o.locked)return null;this.snapshot(label);this.patchObject(o,patch);this.changed('update',o);return o}
 patchObject(o,patch){for(const [k,v] of Object.entries(patch||{})){if(['transform','style','effects','crop','meta'].includes(k))o[k]={...o[k],...deep(v)};else o[k]=deep(v)}if(patch?.transform?.perspective)o.transform.perspective={...o.transform.perspective,...deep(patch.transform.perspective)};if(patch?.style?.border)o.style.border={...o.style.border,...deep(patch.style.border)};o.updatedAt=Date.now();return o}
 mutate(id,fn,label='Edit object'){const o=this.list().find(x=>x.id===id);if(!o||o.locked)return null;this.snapshot(label);fn(o);o.updatedAt=Date.now();this.changed('update',o);return o}
 copy(){const o=this.selected();if(!o)return null;this.clipboard=deep(o);return this.clipboard}
 cut(){const c=this.copy();if(c)this.remove();return c}
 paste(){if(!this.clipboard)return null;const c=deep(this.clipboard);delete c.id;c.transform.x=(c.transform.x||0)+24;c.transform.y=(c.transform.y||0)+24;return this.insertObject(c)}
 snapshot(label='Change'){const s=this.serialize();s._label=label;this.undoStack.push(s);if(this.undoStack.length>this.limit)this.undoStack.shift();this.redoStack.length=0}
 undo(){if(!this.undoStack.length)return false;this.redoStack.push(this.serialize());const s=this.undoStack.pop();this.load(s,false);this.changed('history',{label:s._label||'Undo'});return true}
 redo(){if(!this.redoStack.length)return false;this.undoStack.push(this.serialize());const s=this.redoStack.pop();this.load(s,false);this.changed('history',{label:s._label||'Redo'});return true}
 serialize(){const canvases={};for(const [id,objs] of this.canvases)canvases[id]=deep(objs);return{schema:'savanski.scene/v3',version:'3.0.0',canvasId:this.canvasId,selectedId:this.selectedId,canvases}}
 load(data,resetHistory=true){this.canvases.clear();for(const [id,objs] of Object.entries(data?.canvases||{}))this.canvases.set(id,deep(objs));this.canvasId=data?.canvasId||Object.keys(data?.canvases||{})[0]||'canvas-1';this.ensureCanvas(this.canvasId);this.selectedId=data?.selectedId||null;if(resetHistory){this.undoStack=[];this.redoStack=[]}this.changed('load')}
 clear(){this.canvases.clear();this.canvasId='canvas-1';this.ensureCanvas(this.canvasId);this.selectedId=null;this.undoStack=[];this.redoStack=[];this.changed('clear')}
 onChange(fn){(this.listeners||(this.listeners=[])).push(fn);return()=>this.listeners=this.listeners.filter(x=>x!==fn)}
 changed(type,payload){for(const fn of this.listeners||[])try{fn(type,payload)}catch(e){console.error(e)}}
}
A.defaults=defaults;A.SceneStore=SceneStore;A.deep=deep;A.uid=uid;
})(window);
