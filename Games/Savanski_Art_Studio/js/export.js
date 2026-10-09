(function(){
'use strict';
function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);}
async function canvasBlob(canvas,type='image/png',quality=.94){return await new Promise(r=>canvas.toBlob(r,type,quality));}
window.LFExport={
 download,
 async image(engine,format='png'){
  engine.render(); const clean=format.toLowerCase(); const mime=clean==='jpg'||clean==='jpeg'?'image/jpeg':clean==='webp'?'image/webp':'image/png';
  let c=engine.surface;
  if(mime==='image/jpeg'){const flat=document.createElement('canvas');flat.width=c.width;flat.height=c.height;const x=flat.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,flat.width,flat.height);x.drawImage(c,0,0);c=flat;}
  const blob=await canvasBlob(c,mime,.95);download(blob,`${engine.safeName()}.${clean==='jpeg'?'jpg':clean}`);
 },
 async project(engine){const data=await engine.serialize();const blob=new Blob([JSON.stringify(data)],{type:'application/json'});download(blob,`${engine.safeName()}.lfstudio.json`);},
 async canvasSet(engine){const original=engine.canvasIndex;const parts=[];for(let i=0;i<engine.project.canvases.length;i++){engine.canvasIndex=i;engine.render();const b=await canvasBlob(engine.surface,'image/png');parts.push({name:`canvas-${String(i+1).padStart(3,'0')}.png`,blob:b});}engine.canvasIndex=original;engine.render();
   // Browser-native project intentionally avoids bundled zip libraries. Export canvases one-by-one.
   for(const p of parts)download(p.blob,p.name);
 }
};
})();
