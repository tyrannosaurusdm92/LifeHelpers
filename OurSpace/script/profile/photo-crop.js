/* OurSpace profile picture: independent uploader, free hand-drawn portrait crop or fit. */
(()=>{'use strict';
const q=new URLSearchParams(location.search);if((q.get('page')||'profile')!=='profile'||q.get('public')==='1')return;
const who=document.documentElement.dataset.profile||'william';
const root=document.getElementById('profile-photo'),open=document.getElementById('pictureEditButton'),dialog=document.getElementById('photoCropDialog');if(!root||!open||!dialog)return;
const canvas=document.getElementById('photoCropCanvas'),ctx=canvas.getContext('2d'),file=document.getElementById('photoFile'),status=document.getElementById('profilePictureStatus'),hint=document.getElementById('photoCropHint');
const display=document.getElementById('profilePictureDisplay'),empty=document.getElementById('profilePictureEmpty');
const store='ourspace.profile-picture.v1.'+who;
const WIDTH=600,HEIGHT=700,ASPECT=WIDTH/HEIGHT;
let image=null,imageRect=null,selection=null,start=null,mode='crop',lastData='';
function label(s){status.textContent=s;hint.textContent=s;}
function show(data){if(!data)return;display.src=data;display.hidden=false;empty.hidden=true;lastData=data;}
try{const saved=JSON.parse(localStorage.getItem(store)||'null');if(saved?.dataUrl?.startsWith('data:image/')){show(saved.dataUrl);status.textContent='Saved picture loaded.'}}catch(_){ }
function calcImageRect(){if(!image)return null;const ratio=Math.min(canvas.width/image.naturalWidth,canvas.height/image.naturalHeight);return{x:(canvas.width-image.naturalWidth*ratio)/2,y:(canvas.height-image.naturalHeight*ratio)/2,w:image.naturalWidth*ratio,h:image.naturalHeight*ratio};}
function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#eff4fa';ctx.fillRect(0,0,canvas.width,canvas.height);if(!image)return;imageRect=calcImageRect();const r=imageRect;ctx.drawImage(image,r.x,r.y,r.w,r.h);
 if(mode==='crop'&&selection){ctx.fillStyle='rgba(5,15,29,.45)';ctx.fillRect(0,0,canvas.width,canvas.height);const v=selection;ctx.drawImage(image,v.x/image.naturalWidth*image.naturalWidth,v.y/image.naturalHeight*image.naturalHeight,v.w,v.h,r.x+v.x/image.naturalWidth*r.w,r.y+v.y/image.naturalHeight*r.h,v.w/image.naturalWidth*r.w,v.h/image.naturalHeight*r.h);ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.setLineDash([10,6]);ctx.strokeRect(r.x+v.x/image.naturalWidth*r.w,r.y+v.y/image.naturalHeight*r.h,v.w/image.naturalWidth*r.w,v.h/image.naturalHeight*r.h);ctx.setLineDash([])}
}
function toImagePoint(evt){if(!imageRect||!image)return null;const bound=canvas.getBoundingClientRect(),px=(evt.clientX-bound.x)/bound.width*canvas.width,py=(evt.clientY-bound.y)/bound.height*canvas.height;return{x:Math.max(0,Math.min(image.naturalWidth,(px-imageRect.x)/imageRect.w*image.naturalWidth)),y:Math.max(0,Math.min(image.naturalHeight,(py-imageRect.y)/imageRect.h*image.naturalHeight))}}
function setSelection(first,point){if(!first||!point||!image)return;const dx=point.x-first.x,dy=point.y-first.y;let w=Math.max(1,Math.abs(dx)),h=Math.max(1,Math.abs(dy));const signX=dx>=0?1:-1,signY=dy>=0?1:-1;
 if(w/h>ASPECT)w=h*ASPECT;else h=w/ASPECT;
 // Ensure the portrait crop stays inside the source image.
 w=Math.min(w,signX>0?image.naturalWidth-first.x:first.x);h=Math.min(h,signY>0?image.naturalHeight-first.y:first.y);if(w/h>ASPECT)w=h*ASPECT;else h=w/ASPECT;
 selection={x:signX>0?first.x:first.x-w,y:signY>0?first.y:first.y-h,w:Math.max(1,w),h:Math.max(1,h)};draw();}
canvas.addEventListener('pointerdown',e=>{if(!image||mode!=='crop')return;start=toImagePoint(e);if(!start)return;selection=null;canvas.setPointerCapture(e.pointerId);e.preventDefault()});
canvas.addEventListener('pointermove',e=>{if(!start)return;setSelection(start,toImagePoint(e))});
canvas.addEventListener('pointerup',e=>{if(!start)return;setSelection(start,toImagePoint(e));start=null;hint.textContent='Crop selected. Press Save picture to keep it.'});
canvas.addEventListener('pointercancel',()=>{start=null});
file.addEventListener('change',async()=>{const item=file.files?.[0];if(!item)return;if(!item.type.startsWith('image/'))return label('Select a supported image file.');if(item.size>25*1024*1024)return label('The image is too large. Maximum 25 MB.');
 const url=URL.createObjectURL(item),img=new Image();img.onload=()=>{image=img;selection=null;mode='crop';draw();URL.revokeObjectURL(url);document.getElementById('photoSave').disabled=false;label('Draw a rectangle to crop, or select Fit entire picture.');};img.onerror=()=>{URL.revokeObjectURL(url);label('The selected image could not be decoded.');};img.src=url;
});
document.getElementById('photoCropSelection').addEventListener('click',()=>{mode='crop';draw();label('Drag a rectangle over the photo to select the portrait crop.')});
document.getElementById('photoFitFrame').addEventListener('click',()=>{mode='fit';selection=null;draw();label('Fit entire photo selected. Save keeps the complete image inside the portrait frame.')});
const close=()=>{dialog.close();start=null;};document.getElementById('photoCropClose').addEventListener('click',close);
open.addEventListener('click',()=>{dialog.showModal();draw()});
function output(){const out=document.createElement('canvas');out.width=WIDTH;out.height=HEIGHT;const c=out.getContext('2d');c.fillStyle='#eef4f8';c.fillRect(0,0,WIDTH,HEIGHT);const w=image.naturalWidth,h=image.naturalHeight;
 if(mode==='fit'){const scale=Math.min(WIDTH/w,HEIGHT/h);c.drawImage(image,(WIDTH-w*scale)/2,(HEIGHT-h*scale)/2,w*scale,h*scale)}
 else{let r=selection;if(!r||r.w<10||r.h<10){const w0=Math.min(w,h*ASPECT),h0=w0/ASPECT;r={x:(w-w0)/2,y:(h-h0)/2,w:w0,h:h0}}c.drawImage(image,r.x,r.y,r.w,r.h,0,0,WIDTH,HEIGHT)}
 return out.toDataURL('image/webp',.82);
}
document.getElementById('photoSave').addEventListener('click',async()=>{if(!image)return;const data=output(),saved={schema:'ourspace.profile-picture.v1',profileKey:who,mode,width:WIDTH,height:HEIGHT,dataUrl:data,updatedAt:new Date().toISOString()};
 try{localStorage.setItem(store,JSON.stringify(saved));show(data);status.textContent='Picture saved on this browser.';close()}catch(_){label('Local picture storage is full; choose a smaller photo or free browser storage.');return}
 if(window.OurSpaceAuth?.isAuthenticated?.()&&window.OurSpaceAuth.profile()===who){try{await window.OurSpaceAuth.request('profile.avatar.save',{profileKey:who,image:data,mode,format:'image/webp'});status.textContent='Picture saved to your account.'}catch(_){status.textContent='Saved on this device. Account image sync needs a supported backend operation.'}}
 });
window.OurSpaceProfilePicture={image:()=>lastData,open:()=>{dialog.showModal();draw()}};
})();
