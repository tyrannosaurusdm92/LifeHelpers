(function(){
'use strict';
const S=window.Savanski;
function slots(layout,n,W,H,gap){
  const out=[];const push=(x,y,w,h)=>out.push({x:x+gap,y:y+gap,w:Math.max(1,w-gap*2),h:Math.max(1,h-gap*2)});
  if(layout==='horizontal'){const w=W/n;for(let i=0;i<n;i++)push(i*w,0,w,H);return out}
  if(layout==='vertical'){const h=H/n;for(let i=0;i<n;i++)push(0,i*h,W,h);return out}
  if(layout==='heroLeft'){if(n){push(0,0,W*.58,H);const rw=W*.42,h=H/Math.max(1,n-1);for(let i=1;i<n;i++)push(W*.58,(i-1)*h,rw,h)}return out}
  if(layout==='heroTop'){if(n){push(0,0,W,H*.58);const bh=H*.42,w=W/Math.max(1,n-1);for(let i=1;i<n;i++)push((i-1)*w,H*.58,w,bh)}return out}
  if(layout==='triptych'){const w=W/3;for(let i=0;i<Math.min(n,3);i++)push(i*w,0,w,H);for(let i=3;i<n;i++)push((i-3)%3*w,H*.66,w,H*.34);return out}
  if(layout==='polaroid'){const cols=Math.ceil(Math.sqrt(n)),rows=Math.ceil(n/cols),cw=W/cols,ch=H/rows;for(let i=0;i<n;i++){const r=Math.floor(i/cols),c=i%cols;push(c*cw+cw*.05,r*ch+ch*.04,cw*.9,ch*.84)}return out}
  const dim=layout==='grid4'?4:layout==='grid3'?3:2,cellW=W/dim,cellH=H/dim;for(let i=0;i<n;i++){const r=Math.floor(i/dim),c=i%dim;if(r>=dim)break;push(c*cellW,r*cellH,cellW,cellH)}return out
}
function coverDims(iw,ih,sw,sh,mode){const scale=mode==='contain'?Math.min(sw/iw,sh/ih):Math.max(sw/iw,sh/ih);return{w:iw*scale,h:ih*scale}}
S.setCollageFiles=function(files){S.state.collageFiles=[...files].filter(f=>f.type.startsWith('image/'));const q=S.$('#collageQueue');q.innerHTML='';S.state.collageFiles.forEach((f,i)=>{const d=document.createElement('div');d.className='queue-item';d.innerHTML=`<b>${i+1}</b><span>${S.escapeHTML(f.name)}</span><small>${S.formatBytes(f.size)}</small>`;q.append(d)});S.status(`${S.state.collageFiles.length} collage image${S.state.collageFiles.length===1?'':'s'} ready`)};
S.buildCollage=async function(layout='grid2'){
  const files=S.state.collageFiles;if(!files.length){S.toast('Choose some images first.','error');return}const p=S.state.project,gap=+S.$('#collageGap').value||0,radius=+S.$('#collageRadius').value||0,bg=S.$('#collageBackground').value,fit=S.$('#collageFit').value||'cover';
  const places=slots(layout,files.length,p.width,p.height,gap);if(!places.length)return;
  const bgLayer=S.newLayer('Collage background',{kind:'collage-background'});bgLayer.ctx.fillStyle=bg;bgLayer.ctx.fillRect(0,0,p.width,p.height);const bi=p.layers.findIndex(x=>x.id===bgLayer.id);if(bi>0){p.layers.splice(bi,1);p.layers.unshift(bgLayer)}
  for(let i=0;i<places.length;i++){const f=files[i],slot=places[i],url=URL.createObjectURL(f);try{const im=await S.loadImage(url),l=S.newLayer(`Collage ${i+1}: ${f.name}`,{kind:'collage'}),ctx=l.ctx,d=coverDims(im.naturalWidth,im.naturalHeight,slot.w,slot.h,fit),dx=slot.x+(slot.w-d.w)/2,dy=slot.y+(slot.h-d.h)/2;ctx.save();ctx.beginPath();if(radius){const r=Math.min(radius,slot.w/2,slot.h/2);ctx.roundRect(slot.x,slot.y,slot.w,slot.h,r)}else ctx.rect(slot.x,slot.y,slot.w,slot.h);ctx.clip();ctx.drawImage(im,dx,dy,d.w,d.h);ctx.restore()}finally{URL.revokeObjectURL(url)}}
  S.renderLayers();S.renderLayerList();S.setWorkspace('canvas');S.fitCanvas();S.autosave?.();S.toast('Collage built as editable layers','success')
};
})();
