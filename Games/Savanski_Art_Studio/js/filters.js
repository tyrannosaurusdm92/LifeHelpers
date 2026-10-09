(function(){
'use strict';
const S=window.Savanski;
function active(){const l=S.activeLayer();if(!l||l.locked){S.toast(l?'Layer is locked.':'No active layer.','error');return null}return l}
function canvasFilter(l,filter){const p=S.state.project,tmp=document.createElement('canvas');tmp.width=p.width;tmp.height=p.height;const c=tmp.getContext('2d');c.filter=filter;c.drawImage(l.canvas,0,0);l.ctx.clearRect(0,0,p.width,p.height);l.ctx.drawImage(tmp,0,0)}
function convolve(l,k,div=1,bias=0){const w=l.canvas.width,h=l.canvas.height,src=l.ctx.getImageData(0,0,w,h),dst=l.ctx.createImageData(w,h),s=src.data,d=dst.data;for(let y=0;y<h;y++){for(let x=0;x<w;x++){let r=0,g=0,b=0,a=0;for(let ky=-1;ky<=1;ky++){for(let kx=-1;kx<=1;kx++){const sx=Math.min(w-1,Math.max(0,x+kx)),sy=Math.min(h-1,Math.max(0,y+ky)),si=(sy*w+sx)*4,kv=k[(ky+1)*3+(kx+1)];r+=s[si]*kv;g+=s[si+1]*kv;b+=s[si+2]*kv;a+=s[si+3]*Math.abs(kv)}}const i=(y*w+x)*4;d[i]=S.clamp(r/div+bias,0,255);d[i+1]=S.clamp(g/div+bias,0,255);d[i+2]=S.clamp(b/div+bias,0,255);d[i+3]=S.clamp(a/Math.max(1,k.reduce((q,v)=>q+Math.abs(v),0)),0,255)}}l.ctx.putImageData(dst,0,0)}
function pixelFilter(l,fn){const im=l.ctx.getImageData(0,0,l.canvas.width,l.canvas.height),d=im.data;for(let i=0;i<d.length;i+=4)fn(d,i);l.ctx.putImageData(im,0,0)}
S.applyFilter=function(name){const l=active();if(!l)return;S.snapshot(`Filter ${name}`);const intensity=(+S.$('#filterIntensity').value||100)/100;switch(name){
case'brightness':canvasFilter(l,`brightness(${Math.max(0,100*intensity)}%)`);break;
case'contrast':canvasFilter(l,`contrast(${Math.max(0,100*intensity)}%)`);break;
case'saturate':canvasFilter(l,`saturate(${Math.max(0,100*intensity)}%)`);break;
case'grayscale':canvasFilter(l,`grayscale(${Math.min(100,50*intensity)}%)`);break;
case'sepia':canvasFilter(l,`sepia(${Math.min(100,50*intensity)}%)`);break;
case'invert':canvasFilter(l,`invert(${Math.min(100,50*intensity)}%)`);break;
case'blur':canvasFilter(l,`blur(${Math.max(0,.01+intensity*4)}px)`);break;
case'sharpen':convolve(l,[0,-1,0,-1,5+Math.max(0,intensity-1)*2,-1,0,-1,0],1);break;
case'posterize':{const levels=Math.max(2,Math.round(10-intensity*4)),step=255/(levels-1);pixelFilter(l,(d,i)=>{d[i]=Math.round(d[i]/step)*step;d[i+1]=Math.round(d[i+1]/step)*step;d[i+2]=Math.round(d[i+2]/step)*step});break}
case'pixelate':{const p=S.state.project,size=Math.max(2,Math.round(4+intensity*18)),small=document.createElement('canvas');small.width=Math.max(1,Math.ceil(p.width/size));small.height=Math.max(1,Math.ceil(p.height/size));const c=small.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(l.canvas,0,0,small.width,small.height);l.ctx.clearRect(0,0,p.width,p.height);l.ctx.imageSmoothingEnabled=false;l.ctx.drawImage(small,0,0,p.width,p.height);l.ctx.imageSmoothingEnabled=true;break}
case'warm':pixelFilter(l,(d,i)=>{d[i]=S.clamp(d[i]+28*intensity,0,255);d[i+1]=S.clamp(d[i+1]+9*intensity,0,255);d[i+2]=S.clamp(d[i+2]-18*intensity,0,255)});break;
case'cool':pixelFilter(l,(d,i)=>{d[i]=S.clamp(d[i]-18*intensity,0,255);d[i+1]=S.clamp(d[i+1]+5*intensity,0,255);d[i+2]=S.clamp(d[i+2]+28*intensity,0,255)});break;
default:return}
S.renderLayers();S.autosave?.();S.toast(`${name} applied`,'success')};
S.autoEnhance=function(){const l=active();if(!l)return;S.snapshot('Auto enhance');const im=l.ctx.getImageData(0,0,l.canvas.width,l.canvas.height),d=im.data,h=new Uint32Array(256);let count=0;for(let i=0;i<d.length;i+=4){if(!d[i+3])continue;h[Math.round(.2126*d[i]+.7152*d[i+1]+.0722*d[i+2])]++;count++}let low=0,high=255,acc=0;const cut=count*.01;for(let i=0;i<256;i++){acc+=h[i];if(acc>=cut){low=i;break}}acc=0;for(let i=255;i>=0;i--){acc+=h[i];if(acc>=cut){high=i;break}}const range=Math.max(20,high-low);for(let i=0;i<d.length;i+=4){for(let c=0;c<3;c++){let v=(d[i+c]-low)*255/range;const mean=(d[i]+d[i+1]+d[i+2])/3;v=mean+(v-mean)*1.08;d[i+c]=S.clamp(v,0,255)}}l.ctx.putImageData(im,0,0);S.renderLayers();S.autosave?.();S.toast('Auto enhancement applied','success')};
})();
