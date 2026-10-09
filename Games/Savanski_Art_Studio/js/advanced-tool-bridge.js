
(function(global){
'use strict';
function boot(){
 if(!global.LFToolRegistry||!global.LFAdvancedController)return setTimeout(boot,25);
 if(global.LFToolRegistry.__advanced)return;
 const base=global.LFToolRegistry,extras=[
  ['object-inspector','Object Inspector','Objects','ui','Open editable object properties including transforms, crop and effects.'],
  ['skew-object','Skew Object','Transform','ui','Change horizontal and vertical skew non-destructively.'],
  ['perspective-object','Perspective / Distort','Transform','ui','Adjust all four perspective corners non-destructively.'],
  ['crop-shape','Shape Crop / Mask','Image','ui','Crop an image or object to rectangle, square, circle, diamond, heart, star, polygon or custom shape.'],
  ['brush-shape','Brush / Nib Shape','Draw','ui','Use any supported shape as the editable brush nib.'],
  ['object-effects','Editable Effects','Adjustments','ui','Change brightness, contrast, saturation, hue, sepia, transparency, blur, sharpness, grain and more after creation.'],
  ['object-gradient','Editable Gradient','Color','ui','Apply or edit a non-destructive gradient on the selected object.'],
  ['object-border','Editable Border','Objects','ui','Apply or edit a non-destructive border on the selected object.'],
  ['shape-capture-preset','Capture Shape as Mask / Nib','Shapes','local-action','Capture the selected shape so it can be reused as a crop mask or brush nib.'],
  ['preset-catalog','Shape & Brush Preset Catalog','Shapes','ui','Open the lazy-loaded vector-shape and brush-dynamics catalog.'],
  ['text-dimension','1D / 2D / 3D Text','Text','ui','Switch editable text between flat line-style, standard 2D, or extruded 3D rendering.'],
  ['object-front','Bring Object Front','Layers','local-action','Bring the selected editable object to the front.'],
  ['object-back','Send Object Back','Layers','local-action','Send the selected editable object to the back.'],
  ['object-duplicate','Duplicate Object','Layers','local-action','Duplicate the selected editable object.'],
  ['object-delete','Delete Object','Layers','local-action','Delete the selected editable object.'],
  ['object-recolor','Recolor Object','Color','local-action','Change the selected editable stroke, shape, text or object color.'],
  ['crop-circle','Crop Circle','Image','local-action','Crop selected object to a circle.'],
  ['crop-heart','Crop Heart','Image','local-action','Crop selected object to a heart.'],
  ['crop-diamond','Crop Diamond','Image','local-action','Crop selected object to a diamond.'],
  ['crop-star','Crop Star','Image','local-action','Crop selected object to a star.']
 ].map(([id,name,category,mode,description])=>({id,name,category,source:'Savanski Art Studio merged Studio',mode,description,action:id}));
 const map=new Map(extras.map(x=>[x.id,x])),oldAll=base.all,oldGet=base.get,oldCat=base.categories,oldExec=base.execute;
 base.all=()=>[...oldAll(),...extras];base.get=id=>map.get(id)||oldGet(id);base.categories=()=>[...new Set([...oldCat(),...extras.map(x=>x.category)])];
 base.execute=async function(id,args={}){
  const t=map.get(id),ctl=global.LFAdvancedController,o=ctl.store.selected();
  if(!t&&o){
   const b=ctl.renderer.bounds(o),e=ctl.engine,val=(fallback)=>Number(args.value??fallback);
   if(id==='rotate-left')return ctl.store.update(o.id,{transform:{rotation:(o.transform.rotation||0)-90}},'Rotate object');
   if(id==='rotate-right')return ctl.store.update(o.id,{transform:{rotation:(o.transform.rotation||0)+90}},'Rotate object');
   if(id==='flip-horizontal')return ctl.store.update(o.id,{transform:{scaleX:-(o.transform.scaleX??1)}},'Flip object');
   if(id==='flip-vertical')return ctl.store.update(o.id,{transform:{scaleY:-(o.transform.scaleY??1)}},'Flip object');
   if(id==='center-layer')return ctl.store.update(o.id,{transform:{x:(e.width/2)-(b.x+b.w/2),y:(e.height/2)-(b.y+b.h/2)}},'Center object');
   if(id==='fit-layer'||id==='fill-layer'){
     const fit=id==='fit-layer',sx=e.width/Math.max(1,b.w),sy=e.height/Math.max(1,b.h),sc=fit?Math.min(sx,sy):Math.max(sx,sy);
     return ctl.store.update(o.id,{transform:{scaleX:Math.sign(o.transform.scaleX||1)*sc,scaleY:Math.sign(o.transform.scaleY||1)*sc,x:(e.width/2)-(b.x+b.w/2),y:(e.height/2)-(b.y+b.h/2)}},fit?'Fit object':'Fill canvas with object');
   }
   const effectMap={brightness:['brightness',1.1],contrast:['contrast',1.12],saturation:['saturation',1.12],hue:['hue',15],grayscale:['grayscale',1],sepia:['sepia',1],invert:['invert',1],blur:['blur',3],sharpen:['sharpness',1],grain:['grain',.08],vignette:['vignette',.45]};
   if(effectMap[id]){const [key,def]=effectMap[id];return ctl.store.update(o.id,{effects:{[key]:val(def)}},`Adjust ${id}`)}
   if(id==='unblur'||id==='clarity'||id==='dehaze')return ctl.store.update(o.id,{effects:{sharpness:val(id==='unblur'?1.4:.7),contrast:Math.max(o.effects.contrast||1,id==='dehaze'?1.12:1)}},`Adjust ${id}`);
   if(id==='auto-enhance')return ctl.store.update(o.id,{effects:{brightness:1.04,contrast:1.08,saturation:1.06,sharpness:.35}},'Auto enhance object');
   if(id==='cool')return ctl.store.update(o.id,{effects:{temperature:-25,saturation:1.03}},'Cool filter');
   if(id==='warm')return ctl.store.update(o.id,{effects:{temperature:25,saturation:1.04}},'Warm filter');
   if(id==='noir')return ctl.store.update(o.id,{effects:{grayscale:1,contrast:1.28,brightness:.96}},'Noir filter');
   if(id==='fade')return ctl.store.update(o.id,{effects:{contrast:.86,saturation:.78,brightness:1.04}},'Fade filter');
   if(id==='vintage')return ctl.store.update(o.id,{effects:{sepia:.42,saturation:.82,contrast:.92,temperature:18,grain:.06}},'Vintage filter');
   if(id==='text-inspector'||id==='text-stroke'||id==='text-spacing'||id==='text-bend'||id==='text-shadow'||id==='text-gradient'||id==='text-3d'||id==='text-perspective'){ctl.openInspector(true);return}
   if(id==='custom-font'&&o.type==='text'){document.querySelector('#fontInput')?.click();return}
   if(id==='text-texture'&&o.type==='text'){document.querySelector('#textTextureInput')?.click();return}
  }
  if(!t)return oldExec.call(base,id,args);
  if(t.mode==='ui'){if(id==='preset-catalog')return global.LFPresetCatalog?.open();ctl.openInspector(true);return}
  if(!o)throw new Error('Select an editable object first.');
  if(id==='object-front')return ctl.store.bringFront();if(id==='object-back')return ctl.store.sendBack();if(id==='object-duplicate')return ctl.store.duplicate();if(id==='object-delete')return ctl.store.remove();
  if(id==='object-recolor'){const c=args.color||global.LFStudio?.engine?.primary||'#000000';return ctl.store.update(o.id,{style:{color:c,fill:c,stroke:c}},'Recolor object')}
  if(id==='shape-capture-preset'){if(o.type!=='shape')throw new Error('Select a shape object first.');ctl.savedShapePreset={shape:o.geometry?.shape||'rectangle',customPath:o.geometry?.customPath?JSON.parse(JSON.stringify(o.geometry.customPath)):null};return ctl.savedShapePreset}
  if(id.startsWith('crop-'))return ctl.store.update(o.id,{crop:{shape:id.slice(5)}},'Shape crop');
 };
 base.__advanced=true;
 global.LFStudio?.buildToolLibrary?.();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,40));else setTimeout(boot,40);
})(window);
