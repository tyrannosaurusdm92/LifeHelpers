(function(global){
 'use strict'; const LF=global.SavanskiArtTools;
 class TextureEngine{
  static apply(ctx,canvas,texture={}){const amount=Number(texture.amount??0.12),size=Math.max(1,Number(texture.size??8));ctx.save();ctx.globalAlpha=amount;ctx.globalCompositeOperation=texture.blend||'multiply';ctx.fillStyle=texture.color||'#001010';if(texture.type==='paper'){for(let y=0;y<canvas.height;y+=size){for(let x=0;x<canvas.width;x+=size){if(Math.random()<.18)ctx.fillRect(x+Math.random()*size,y+Math.random()*size,1+Math.random()*2,1+Math.random()*2);}}}else if(texture.type==='crosshatch'){ctx.lineWidth=1;for(let x=-canvas.height;x<canvas.width;x+=size){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+canvas.height,canvas.height);ctx.strokeStyle=ctx.fillStyle;ctx.stroke();}for(let x=0;x<canvas.width+canvas.height;x+=size){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x-canvas.height,canvas.height);ctx.stroke();}}else if(texture.type==='grain'){const count=Math.min(200000,Math.floor(canvas.width*canvas.height/Math.max(4,size*size)));for(let i=0;i<count;i++)ctx.fillRect(Math.random()*canvas.width,Math.random()*canvas.height,1,1);}ctx.restore();}
 }
 LF.TextureEngine=TextureEngine;
})(typeof window!=='undefined'?window:globalThis);
