
(function(global){
'use strict';
const A=global.LFAdvanced=global.LFAdvanced||{};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
const d2r=d=>(Number(d)||0)*Math.PI/180;
const makeCanvas=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w));c.height=Math.max(1,Math.ceil(h));return c};
const imageCache=new Map();
function getImage(src,onload){if(!src)return null;if(imageCache.has(src))return imageCache.get(src);const im=new Image();imageCache.set(src,im);im.onload=()=>onload?.();im.onerror=()=>imageCache.delete(src);im.src=src;return im}
function seedHash(s){let h=2166136261;for(let i=0;i<String(s).length;i++){h^=String(s).charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
function polygonPoints(n,r,cx,cy,rotation=-Math.PI/2){const p=[];for(let i=0;i<n;i++){const a=rotation+i*Math.PI*2/n;p.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r])}return p}
function traceShape(ctx,shape,x,y,w,h,customPath){
  shape=shape||'rectangle';ctx.beginPath();
  if(shape==='free'||shape==='rectangle'||shape==='square'){ctx.rect(x,y,w,h);return}
  if(shape==='rounded-rectangle'){const r=Math.min(w,h)*.15;ctx.roundRect?ctx.roundRect(x,y,w,h,r):(ctx.rect(x,y,w,h));return}
  if(shape==='circle'||shape==='ellipse'){ctx.ellipse(x+w/2,y+h/2,Math.abs(w/2),Math.abs(h/2),0,0,Math.PI*2);return}
  if(shape==='diamond'){ctx.moveTo(x+w/2,y);ctx.lineTo(x+w,y+h/2);ctx.lineTo(x+w/2,y+h);ctx.lineTo(x,y+h/2);ctx.closePath();return}
  if(shape==='triangle'){ctx.moveTo(x+w/2,y);ctx.lineTo(x+w,y+h);ctx.lineTo(x,y+h);ctx.closePath();return}
  if(shape==='heart'){const cx=x+w/2,cy=y+h*.34;ctx.moveTo(cx,y+h);ctx.bezierCurveTo(x-w*.05,y+h*.58,x,y+h*.22,x+w*.25,y+h*.19);ctx.bezierCurveTo(cx,y+h*.17,cx,y+h*.35,cx,y+h*.4);ctx.bezierCurveTo(cx,y+h*.35,cx,y+h*.17,x+w*.75,y+h*.19);ctx.bezierCurveTo(x+w,y+h*.22,x+w*1.05,y+h*.58,cx,y+h);ctx.closePath();return}
  if(shape==='star'){const cx=x+w/2,cy=y+h/2,ro=Math.min(w,h)/2,ri=ro*.42;for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?ri:ro,px=cx+Math.cos(a)*r,py=cy+Math.sin(a)*r;i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath();return}
  if(shape==='hexagon'||shape==='octagon'||shape==='pentagon'){const n=shape==='hexagon'?6:shape==='octagon'?8:5;const pts=polygonPoints(n,Math.min(w,h)/2,x+w/2,y+h/2);pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();return}
  if(shape==='arrow'){ctx.moveTo(x,y+h*.35);ctx.lineTo(x+w*.58,y+h*.35);ctx.lineTo(x+w*.58,y);ctx.lineTo(x+w,y+h/2);ctx.lineTo(x+w*.58,y+h);ctx.lineTo(x+w*.58,y+h*.65);ctx.lineTo(x,y+h*.65);ctx.closePath();return}
  if(shape==='cloud'){const cx=x+w/2,cy=y+h/2;ctx.moveTo(x+w*.15,y+h*.7);ctx.bezierCurveTo(x-w*.05,y+h*.65,x,y+h*.38,x+w*.2,y+h*.38);ctx.bezierCurveTo(x+w*.18,y+h*.16,x+w*.44,y+h*.08,x+w*.56,y+h*.28);ctx.bezierCurveTo(x+w*.78,y+h*.14,x+w*.94,y+h*.32,x+w*.88,y+h*.48);ctx.bezierCurveTo(x+w*1.08,y+h*.52,x+w*1.03,y+h*.78,x+w*.82,y+h*.78);ctx.lineTo(x+w*.2,y+h*.78);ctx.closePath();return}
  if(shape==='speech'){const r=Math.min(w,h)*.1;ctx.roundRect?ctx.roundRect(x,y,w,h*.78,r):ctx.rect(x,y,w,h*.78);ctx.moveTo(x+w*.25,y+h*.77);ctx.lineTo(x+w*.18,y+h);ctx.lineTo(x+w*.45,y+h*.78);ctx.closePath();return}
  if(shape==='custom'&&Array.isArray(customPath)){customPath.forEach((p,i)=>{const px=x+(p.x??p[0]??0)*w,py=y+(p.y??p[1]??0)*h;i?ctx.lineTo(px,py):ctx.moveTo(px,py)});ctx.closePath();return}
  ctx.rect(x,y,w,h);
}
function boundsOf(o){
  const g=o.geometry||{};
  if(o.type==='stroke'||o.type==='eraser-stroke'||o.type==='effect-stroke'){const pts=g.points||[];if(!pts.length)return{x:0,y:0,w:1,h:1};let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;for(const p of pts){minX=Math.min(minX,p.x);minY=Math.min(minY,p.y);maxX=Math.max(maxX,p.x);maxY=Math.max(maxY,p.y)}const pad=(o.style?.size||o.style?.strokeWidth||10)*1.5;return{x:minX-pad,y:minY-pad,w:Math.max(1,maxX-minX+pad*2),h:Math.max(1,maxY-minY+pad*2)}}
  if(o.type==='text'){return{x:g.x||0,y:g.y||0,w:Math.max(8,g.width||300),h:Math.max(8,g.height||100)}}
  return{x:g.x||0,y:g.y||0,w:Math.max(1,g.width||100),h:Math.max(1,g.height||100)}
}
function cssFilter(e={}){
 const transparency=clamp(e.transparency,0,1),temp=Number(e.temperature)||0;
 let brightness=Math.max(.01,Number(e.brightness??1)),saturate=Math.max(0,Number(e.saturation??1));
 if(temp>0){brightness*=1+Math.min(.25,temp/400)}else if(temp<0){saturate*=1+Math.min(.2,Math.abs(temp)/500)}
 return `brightness(${brightness}) contrast(${Math.max(.01,Number(e.contrast??1))}) saturate(${saturate}) hue-rotate(${Number(e.hue)||0}deg) sepia(${clamp(e.sepia,0,1)}) grayscale(${clamp(e.grayscale,0,1)}) invert(${clamp(e.invert,0,1)}) blur(${Math.max(0,Number(e.blur)||0)}px) opacity(${1-transparency})`;
}
function applySharpen(canvas,amount){
 amount=Number(amount)||0;if(Math.abs(amount)<.01)return;
 const ctx=canvas.getContext('2d',{willReadFrequently:true}),w=canvas.width,h=canvas.height;if(w*h>8_000_000)return;
 const src=ctx.getImageData(0,0,w,h),out=ctx.createImageData(w,h),d=src.data,o=out.data;
 const a=Math.max(-2,Math.min(5,amount)),center=1+4*a;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;for(let c=0;c<3;c++){const v=center*d[i+c]-a*((x?d[i-4+c]:d[i+c])+(x<w-1?d[i+4+c]:d[i+c])+(y?d[i-w*4+c]:d[i+c])+(y<h-1?d[i+w*4+c]:d[i+c]));o[i+c]=Math.max(0,Math.min(255,v))}o[i+3]=d[i+3]}ctx.putImageData(out,0,0)
}
function applyGrain(canvas,amount,seed){amount=clamp(amount,0,1);if(!amount)return;const ctx=canvas.getContext('2d',{willReadFrequently:true}),w=canvas.width,h=canvas.height;if(w*h>5_000_000)return;const im=ctx.getImageData(0,0,w,h),d=im.data,r=rng(seed);for(let i=0;i<d.length;i+=4){const n=(r()-.5)*255*amount;d[i]=clamp(d[i]+n,0,255);d[i+1]=clamp(d[i+1]+n,0,255);d[i+2]=clamp(d[i+2]+n,0,255)}ctx.putImageData(im,0,0)}
function fillStyle(ctx,style,w,h,onload){
 if(style?.texture?.src){const im=getImage(style.texture.src,onload);if(im?.complete&&im.naturalWidth)return ctx.createPattern(im,style.texture.repeat||'repeat')}
 if(style?.gradient?.enabled){const a=d2r(style.gradient.angle||0),cx=w/2,cy=h/2,dx=Math.cos(a)*w/2,dy=Math.sin(a)*h/2,g=ctx.createLinearGradient(cx-dx,cy-dy,cx+dx,cy+dy);g.addColorStop(0,style.gradient.from||style.fill||'#000');g.addColorStop(1,style.gradient.to||'#fff');return g}
 return style?.fill||style?.color||'#000000'
}
function nibPath(ctx,shape,x,y,r,customPath){
 ctx.beginPath();
 if(shape==='square')ctx.rect(x-r,y-r,r*2,r*2);
 else if(shape==='diamond'){ctx.moveTo(x,y-r);ctx.lineTo(x+r,y);ctx.lineTo(x,y+r);ctx.lineTo(x-r,y);ctx.closePath()}
 else if(shape==='heart'){traceShape(ctx,'heart',x-r,y-r,r*2,r*2)}
 else if(shape==='star'){traceShape(ctx,'star',x-r,y-r,r*2,r*2)}
 else if(shape==='triangle'){traceShape(ctx,'triangle',x-r,y-r,r*2,r*2)}
 else if(shape==='custom'&&Array.isArray(customPath)){traceShape(ctx,'custom',x-r,y-r,r*2,r*2,customPath)}
 else ctx.arc(x,y,r,0,Math.PI*2)
}
function drawStroke(ctx,o,b,ox,oy,onload){
 const pts=o.geometry?.points||[],s=o.style||{},kind=s.brushKind||'brush',size=Math.max(.5,Number(s.size||s.strokeWidth||12)),seed=seedHash(o.id),rand=rng(seed);
 if(!pts.length)return;ctx.globalAlpha=Math.max(.01,Number(s.opacity??1));ctx.globalCompositeOperation=o.type==='eraser-stroke'?'destination-out':(s.blendMode||'source-over');
 const local=pts.map(p=>({x:p.x-b.x+ox,y:p.y-b.y+oy,pressure:p.pressure??.5}));
 const color=(s.texture?.src||s.gradient?.enabled)?fillStyle(ctx,s,b.w,b.h,onload):(s.color||s.stroke||s.fill||'#000');ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineJoin=s.lineJoin||'round';ctx.lineCap=s.lineCap||'round';
 if(['pencil','marker','brush','calligraphy','crayon','watercolor','oil','pixel'].includes(kind)){
   ctx.beginPath();local.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.lineWidth=size*(kind==='pencil'?.28:kind==='marker'?1.2:kind==='crayon'?1.15:1);if(kind==='marker')ctx.globalAlpha*=.45;if(kind==='crayon')ctx.globalAlpha*=.68;if(kind==='watercolor')ctx.globalAlpha*=.24;if(kind==='oil')ctx.globalAlpha*=.88;if(kind==='pixel'){ctx.imageSmoothingEnabled=false;ctx.lineCap='square'}ctx.stroke();if(kind==='crayon'){for(let k=0;k<6;k++){ctx.save();ctx.globalAlpha*=.12;ctx.lineWidth=Math.max(.6,size*(.12+rand()*.12));ctx.translate((rand()-.5)*size*.25,(rand()-.5)*size*.25);ctx.stroke();ctx.restore()}}
   if(kind==='watercolor'){for(let k=0;k<5;k++){ctx.save();ctx.globalAlpha*=.25;ctx.lineWidth=size*(1.1+k*.18);ctx.stroke();ctx.restore()}}
 } else {
   const spray=kind==='airbrush'||kind==='spray',spacing=Math.max(1,size*(s.spacing??.18));
   for(let i=1;i<local.length;i++){const a=local[i-1],z=local[i],dist=Math.hypot(z.x-a.x,z.y-a.y),n=Math.max(1,Math.ceil(dist/spacing));for(let j=0;j<=n;j++){const t=j/n,x=a.x+(z.x-a.x)*t,y=a.y+(z.y-a.y)*t,p=a.pressure+(z.pressure-a.pressure)*t,r=size*.5*(s.pressure?Math.max(.1,p):1);if(spray){const dots=Math.max(4,Math.round(size*.35));for(let d=0;d<dots;d++){const ang=rand()*Math.PI*2,rr=Math.sqrt(rand())*r*1.8,nr=Math.max(.35,r*.055*rand());ctx.globalAlpha=Math.max(.02,(s.opacity??1)*(.04+rand()*.13));nibPath(ctx,s.nibShape||'circle',x+Math.cos(ang)*rr,y+Math.sin(ang)*rr,nr,s.nibCustomPath);ctx.fill()}}else{nibPath(ctx,s.nibShape||'circle',x,y,r,s.nibCustomPath);ctx.fill()}}}}
}
function drawText(ctx,o,w,h,onload){
 const g=o.geometry||{},m=o.meta||{},style=o.style||{},text=String(m.text??g.text??'Text'),size=Math.max(1,Number(m.fontSize||style.fontSize||64)),family=m.fontFamily||style.fontFamily||'Arial',weight=m.bold?'700':(m.fontWeight||'400'),italic=m.italic?'italic ':'',depth=Math.max(0,Number(m.depth||0)),depthColor=m.depthColor||'#222';
 ctx.font=`${italic}${weight} ${size}px "${String(family).replace(/"/g,'')}", sans-serif`;ctx.textBaseline='top';ctx.textAlign=m.align||'left';
 let x=8,y=8;const fill=fillStyle(ctx,{...style,fill:m.color||style.fill,gradient:m.gradient||style.gradient,texture:m.textureData?{src:m.textureData}:style.texture},w,h,onload);
 if(m.shadow?.enabled){ctx.shadowColor=m.shadow.color||'#000';ctx.shadowBlur=Number(m.shadow.blur)||0;ctx.shadowOffsetX=Number(m.shadow.x)||0;ctx.shadowOffsetY=Number(m.shadow.y)||0}
 if((m.dimensionMode||'2D')==='3D'||depth>0){const d=Math.max(depth,Number(m.extrusionDepth)||8),step=Math.max(1,Math.min(4,d/12));ctx.fillStyle=depthColor;for(let z=d;z>0;z-=step)ctx.fillText(text,x+z,y+z,w-16)}
 const dim=m.dimensionMode||'2D';ctx.fillStyle=fill;if(dim==='1D'){ctx.strokeStyle=m.strokeColor||style.stroke||style.color||'#000';ctx.lineWidth=Math.max(1,Number(m.strokeWidth||style.strokeWidth||Math.max(1,size*.035)));ctx.strokeText(text,x,y,w-16)}else{if(m.strokeWidth>0||style.strokeWidth>0){ctx.strokeStyle=m.strokeColor||style.stroke||'#fff';ctx.lineWidth=Number(m.strokeWidth||style.strokeWidth);ctx.strokeText(text,x,y,w-16)}ctx.fillText(text,x,y,w-16)}
 if(m.underline){ctx.fillRect(x,y+size*1.05,Math.min(w-16,ctx.measureText(text).width),Math.max(1,size*.04))}
 if(m.strike){ctx.fillRect(x,y+size*.55,Math.min(w-16,ctx.measureText(text).width),Math.max(1,size*.035))}
}
function drawShape(ctx,o,w,h,onload){
 const s=o.style||{},shape=o.geometry?.shape||o.meta?.shape||'rectangle';
 if(shape==='line'){ctx.beginPath();ctx.moveTo(2,h/2);ctx.lineTo(w-2,h/2);ctx.strokeStyle=s.stroke||s.color||'#000';ctx.lineWidth=Math.max(1,s.strokeWidth||2);ctx.stroke();return}
 traceShape(ctx,shape,2,2,w-4,h-4,o.geometry?.customPath);ctx.fillStyle=fillStyle(ctx,s,w,h,onload);if(s.fill!=='transparent')ctx.fill();if((s.strokeWidth||0)>0){ctx.strokeStyle=s.stroke||'#000';ctx.lineWidth=s.strokeWidth;ctx.stroke()}
}
function drawImage(ctx,o,w,h,onload){
 const src=o.meta?.src||o.geometry?.src;if(!src)return;const im=getImage(src,onload);if(im?.complete&&im.naturalWidth){const c=o.crop||{},sx=clamp(c.x,0,1)*im.naturalWidth,sy=clamp(c.y,0,1)*im.naturalHeight,sw=Math.max(1,clamp(c.width,0,1)*im.naturalWidth),sh=Math.max(1,clamp(c.height,0,1)*im.naturalHeight);ctx.drawImage(im,sx,sy,sw,sh,0,0,w,h)}
}
function affineTriangle(ctx,img,s0,s1,s2,d0,d1,d2){
 const den=s0.x*(s1.y-s2.y)+s1.x*(s2.y-s0.y)+s2.x*(s0.y-s1.y);if(Math.abs(den)<1e-6)return;
 const a=(d0.x*(s1.y-s2.y)+d1.x*(s2.y-s0.y)+d2.x*(s0.y-s1.y))/den;
 const c=(d0.x*(s2.x-s1.x)+d1.x*(s0.x-s2.x)+d2.x*(s1.x-s0.x))/den;
 const e=(d0.x*(s1.x*s2.y-s2.x*s1.y)+d1.x*(s2.x*s0.y-s0.x*s2.y)+d2.x*(s0.x*s1.y-s1.x*s0.y))/den;
 const b=(d0.y*(s1.y-s2.y)+d1.y*(s2.y-s0.y)+d2.y*(s0.y-s1.y))/den;
 const d=(d0.y*(s2.x-s1.x)+d1.y*(s0.x-s2.x)+d2.y*(s1.x-s0.x))/den;
 const f=(d0.y*(s1.x*s2.y-s2.x*s1.y)+d1.y*(s2.x*s0.y-s0.x*s2.y)+d2.y*(s0.x*s1.y-s1.x*s0.y))/den;
 ctx.save();ctx.beginPath();ctx.moveTo(d0.x,d0.y);ctx.lineTo(d1.x,d1.y);ctx.lineTo(d2.x,d2.y);ctx.closePath();ctx.clip();ctx.transform(a,b,c,d,e,f);ctx.drawImage(img,0,0);ctx.restore();
}
function drawWarped(ctx,img,w,h,perspective){
 const p=perspective||{},tl={x:p.tl?.x||0,y:p.tl?.y||0},tr={x:w+(p.tr?.x||0),y:p.tr?.y||0},br={x:w+(p.br?.x||0),y:h+(p.br?.y||0)},bl={x:p.bl?.x||0,y:h+(p.bl?.y||0)};
 const steps=8,bilinear=(u,v)=>({x:(1-u)*(1-v)*tl.x+u*(1-v)*tr.x+u*v*br.x+(1-u)*v*bl.x,y:(1-u)*(1-v)*tl.y+u*(1-v)*tr.y+u*v*br.y+(1-u)*v*bl.y});
 for(let iy=0;iy<steps;iy++)for(let ix=0;ix<steps;ix++){const u0=ix/steps,u1=(ix+1)/steps,v0=iy/steps,v1=(iy+1)/steps,s00={x:u0*w,y:v0*h},s10={x:u1*w,y:v0*h},s11={x:u1*w,y:v1*h},s01={x:u0*w,y:v1*h},d00=bilinear(u0,v0),d10=bilinear(u1,v0),d11=bilinear(u1,v1),d01=bilinear(u0,v1);affineTriangle(ctx,img,s00,s10,s11,d00,d10,d11);affineTriangle(ctx,img,s00,s11,s01,d00,d11,d01)}
}
function retouchKernel(canvas,kind,strength){
 const x=canvas.getContext('2d',{willReadFrequently:true}),w=canvas.width,h=canvas.height;if(w*h>8_000_000)return;
 if(kind==='sharpen-brush'){applySharpen(canvas,.4+Math.max(0,Number(strength)||0)*1.8);return}
 const tmp=makeCanvas(w,h),t=tmp.getContext('2d');
 if(kind==='blur-brush'||kind==='smudge')t.filter=`blur(${Math.max(.4,(Number(strength)||.5)*4)}px)`;
 else if(kind==='dodge')t.filter=`brightness(${1.05+(Number(strength)||.5)*.55})`;
 else if(kind==='burn')t.filter=`brightness(${Math.max(.25,1-(Number(strength)||.5)*.55)})`;
 t.drawImage(canvas,0,0);x.clearRect(0,0,w,h);x.drawImage(tmp,0,0);
}
function effectStrokeMask(w,h,o,b){
 const m=makeCanvas(w,h),x=m.getContext('2d'),pts=o.geometry?.points||[],size=Math.max(1,Number(o.style?.size)||24),local=pts.map(p=>({x:p.x-b.x,y:p.y-b.y}));
 x.strokeStyle='#fff';x.fillStyle='#fff';x.lineCap='round';x.lineJoin='round';x.lineWidth=size;if(local.length){x.beginPath();local.forEach((p,i)=>i?x.lineTo(p.x,p.y):x.moveTo(p.x,p.y));x.stroke();for(const p of local){x.beginPath();x.arc(p.x,p.y,size/2,0,Math.PI*2);x.fill()}}return m;
}
function effectWithTransform(o){
 const tr=o.transform||{},b=boundsOf(o),cx=b.x+b.w/2,cy=b.y+b.h/2,sx=tr.scaleX??1,sy=tr.scaleY??1,kx=Math.tan(d2r(tr.skewX||0)),ky=Math.tan(d2r(tr.skewY||0)),a=d2r(tr.rotation||0),ca=Math.cos(a),sa=Math.sin(a),persp=tr.perspective||{};
 const warp=(x,y)=>{const u=b.w?clamp((x-b.x)/b.w,0,1):0,v=b.h?clamp((y-b.y)/b.h,0,1):0,tl=persp.tl||{},tt=persp.tr||{},br=persp.br||{},bl=persp.bl||{};return{x:x+(1-u)*(1-v)*(tl.x||0)+u*(1-v)*(tt.x||0)+u*v*(br.x||0)+(1-u)*v*(bl.x||0),y:y+(1-u)*(1-v)*(tl.y||0)+u*(1-v)*(tt.y||0)+u*v*(br.y||0)+(1-u)*v*(bl.y||0)}};
 const map=p=>{let x=p.x-cx,y=p.y-cy,nx=sx*x+kx*sy*y,ny=ky*sx*x+sy*y,rx=nx*ca-ny*sa,ry=nx*sa+ny*ca,q=warp(cx+rx+(tr.x||0),cy+ry+(tr.y||0));return{...p,x:q.x,y:q.y}};
 return {...o,geometry:{...(o.geometry||{}),points:(o.geometry?.points||[]).map(map)},transform:{x:0,y:0,scaleX:1,scaleY:1,rotation:0,skewX:0,skewY:0,perspective:{tl:{x:0,y:0},tr:{x:0,y:0},br:{x:0,y:0},bl:{x:0,y:0}}}};
}
function drawEffectStroke(target,o,b){
 const pts=o.geometry?.points||[];if(!pts.length)return;const kind=o.meta?.effectKind||'blur-brush',strength=Number(o.style?.strength??.5),opacity=clamp(o.style?.opacity??1,0,1),w=Math.max(1,Math.ceil(b.w)),h=Math.max(1,Math.ceil(b.h));
 if(kind==='clone-stamp'){
   const src=o.meta?.cloneSource;if(!src)return;const size=Math.max(1,Number(o.style?.size)||24),first=pts[0],snapshot=makeCanvas(target.canvas.width,target.canvas.height),sx=snapshot.getContext('2d');sx.drawImage(target.canvas,0,0);target.save();target.globalAlpha=opacity;target.beginPath();for(const p of pts){target.moveTo(p.x+size/2,p.y);target.arc(p.x,p.y,size/2,0,Math.PI*2)}target.clip();target.drawImage(snapshot,src.x-first.x,src.y-first.y);target.restore();return;
 }
 const src=makeCanvas(w,h),sx=src.getContext('2d');sx.drawImage(target.canvas,b.x,b.y,w,h,0,0,w,h);retouchKernel(src,kind,strength);const mask=effectStrokeMask(w,h,o,b);const fx=makeCanvas(w,h),f=fx.getContext('2d');f.drawImage(src,0,0);f.globalCompositeOperation='destination-in';f.drawImage(mask,0,0);target.save();target.globalAlpha=opacity;target.drawImage(fx,b.x,b.y);target.restore();
}
class SceneRenderer{
 constructor(canvas,store,onNeedRender){this.canvas=canvas;this.ctx=canvas.getContext('2d',{willReadFrequently:true});this.store=store;this.onNeedRender=onNeedRender;this.hitCanvas=makeCanvas(1,1)}
 resize(w,h){this.canvas.width=w;this.canvas.height=h;this.ctx=this.canvas.getContext('2d',{willReadFrequently:true})}
 render(targetCtx=this.ctx,{clear=false,objects=this.store.list()}={}){
  const ctx=targetCtx;if(clear)ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
  for(const o of objects)if(o.visible!==false)this.drawObject(ctx,o);
 }
 renderLocal(o,b,w,h,pad){
  const c=makeCanvas(w+pad*2,h+pad*2),ctx=c.getContext('2d',{willReadFrequently:true});ctx.save();ctx.translate(pad,pad);ctx.globalAlpha=Math.max(0,Math.min(1,o.style?.opacity??1));ctx.filter=cssFilter(o.effects);
  const onload=()=>this.onNeedRender?.();
  if(o.crop?.shape&&o.crop.shape!=='free'){traceShape(ctx,o.crop.shape,0,0,w,h,o.crop.customPath);ctx.clip()}
  if(o.type==='stroke'||o.type==='eraser-stroke')drawStroke(ctx,o,b,0,0,onload);
  else if(o.type==='effect-stroke'){const proxy={...o,type:'stroke',style:{...o.style,color:o.meta?.effectKind==='burn'?'rgba(0,0,0,.18)':'rgba(255,255,255,.18)',brushKind:'brush'}};drawStroke(ctx,proxy,b,0,0,onload);}
  else if(o.type==='shape')drawShape(ctx,o,w,h,onload);
  else if(o.type==='text')drawText(ctx,o,w,h,onload);
  else if(o.type==='image'||o.type==='generated-image')drawImage(ctx,o,w,h,onload);
  else if(o.type==='fill'){ctx.fillStyle=fillStyle(ctx,o.style,w,h,onload);ctx.fillRect(0,0,w,h)}
  ctx.restore();if(o.effects?.sharpness)applySharpen(c,o.effects.sharpness);if(o.effects?.grain)applyGrain(c,o.effects.grain,seedHash(o.id));
  return c;
 }
 drawObject(ctx,o){
  const b=boundsOf(o),tr=o.transform||{},border=o.style?.border||{};
  if(o.type==='effect-stroke'){const eo=effectWithTransform(o),eb=boundsOf(eo);drawEffectStroke(ctx,eo,eb);return}
  const pad=Math.ceil(Math.max(8,(border.enabled?border.width:0)+Math.abs(o.effects?.blur||0)*3+8)),w=Math.max(1,Math.ceil(b.w)),h=Math.max(1,Math.ceil(b.h)),buf=this.renderLocal(o,b,w,h,pad);
  const cx=b.x+b.w/2+(tr.x||0),cy=b.y+b.h/2+(tr.y||0);ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation=o.style?.blendMode||'source-over';ctx.translate(cx,cy);ctx.rotate(d2r(tr.rotation));ctx.transform(tr.scaleX??1,Math.tan(d2r(tr.skewY)),Math.tan(d2r(tr.skewX)),tr.scaleY??1,0,0);ctx.translate(-buf.width/2,-buf.height/2);
  const persp=tr.perspective||{},hasPerspective=Object.values(persp).some(p=>Math.abs(p?.x||0)>.001||Math.abs(p?.y||0)>.001);
  if(hasPerspective)drawWarped(ctx,buf,buf.width,buf.height,persp);else ctx.drawImage(buf,0,0);
  if(border.enabled&&border.width>0){ctx.save();ctx.strokeStyle=border.color||'#000';ctx.lineWidth=border.width;ctx.setLineDash(border.style==='dashed'?[border.width*3,border.width*2]:border.style==='dotted'?[border.width,border.width*2]:[]);ctx.strokeRect(pad,pad,w,h);ctx.restore()}
  ctx.restore();
 }
 drawSelection(overlay,o){
   const x=overlay.getContext('2d'),b=boundsOf(o),tr=o.transform||{},cx=b.x+b.w/2+(tr.x||0),cy=b.y+b.h/2+(tr.y||0),w=b.w*Math.abs(tr.scaleX??1),h=b.h*Math.abs(tr.scaleY??1);x.save();x.translate(cx,cy);x.rotate(d2r(tr.rotation));x.strokeStyle='#00aaff';x.fillStyle='#ffffff';x.lineWidth=Math.max(1,overlay.width/1300);x.setLineDash([8,5]);x.strokeRect(-w/2,-h/2,w,h);x.setLineDash([]);const hs=Math.max(6,overlay.width/250);for(const [px,py] of [[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]]){x.fillRect(px-hs/2,py-hs/2,hs,hs);x.strokeRect(px-hs/2,py-hs/2,hs,hs)}x.beginPath();x.moveTo(0,-h/2);x.lineTo(0,-h/2-hs*3);x.stroke();x.beginPath();x.arc(0,-h/2-hs*3,hs*.65,0,Math.PI*2);x.fill();x.stroke();x.restore();
 }
 hitTest(px,py){
   const a=this.store.list();for(let i=a.length-1;i>=0;i--){const o=a[i];if(o.visible===false||o.locked)continue;const b=boundsOf(o),tr=o.transform||{},cx=b.x+b.w/2+(tr.x||0),cy=b.y+b.h/2+(tr.y||0),ang=-d2r(tr.rotation),dx=px-cx,dy=py-cy,rx=(dx*Math.cos(ang)-dy*Math.sin(ang))/((tr.scaleX||1)||.001),ry=(dx*Math.sin(ang)+dy*Math.cos(ang))/((tr.scaleY||1)||.001);if(Math.abs(rx)<=b.w/2&&Math.abs(ry)<=b.h/2)return o}return null
 }
 bounds(o){return boundsOf(o)}
}
A.SceneRenderer=SceneRenderer;A.traceShape=traceShape;A.boundsOf=boundsOf;A.cssFilter=cssFilter;A.imageCache=imageCache;
})(window);
