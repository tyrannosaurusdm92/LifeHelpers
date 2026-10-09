(function(){
'use strict';
const S=window.Savanski,st=S.state;
S.drawGrid=function(ctx){const p=st.project,m=st.map;if(!p||!m.enabled||m.gridType==='none')return;const size=Math.max(8,+m.gridSize||70);ctx.save();ctx.globalAlpha=S.clamp(+m.gridOpacity||.38,0,1);ctx.strokeStyle='#001010';ctx.lineWidth=Math.max(1,size/70);ctx.beginPath();
  if(m.gridType==='square'){for(let x=0;x<=p.width;x+=size){ctx.moveTo(x,0);ctx.lineTo(x,p.height)}for(let y=0;y<=p.height;y+=size){ctx.moveTo(0,y);ctx.lineTo(p.width,y)}}
  else if(m.gridType==='iso'){const h=size/2;for(let x=-p.height;x<p.width+p.height;x+=size){ctx.moveTo(x,0);ctx.lineTo(x+p.height*2,p.height);ctx.moveTo(x,0);ctx.lineTo(x-p.height*2,p.height)}for(let y=0;y<p.height;y+=h*2){ctx.moveTo(0,y);ctx.lineTo(p.width,y)}}
  else if(m.gridType==='hex'){const r=size/2,h=Math.sqrt(3)*r,dx=1.5*r;for(let col=0,x=r;x<p.width+r;x+=dx,col++){const yOff=col%2?h/2:0;for(let y=yOff;y<p.height+h;y+=h){ctx.moveTo(x+r,y);ctx.lineTo(x+r/2,y+h/2);ctx.lineTo(x-r/2,y+h/2);ctx.lineTo(x-r,y);ctx.lineTo(x-r/2,y-h/2);ctx.lineTo(x+r/2,y-h/2);ctx.closePath()}}}
  ctx.stroke();ctx.restore()
};
S.applyMapSettings=function(){st.map.enabled=true;st.map.gridType=S.$('#gridType').value;st.map.gridSize=S.clamp(+S.$('#gridSize').value||70,8,512);st.map.gridOpacity=(+S.$('#gridOpacity').value||38)/100;st.map.units=Math.max(.1,+S.$('#gridUnits').value||5);st.map.unitName=(S.$('#gridUnitName').value||'ft').slice(0,12);st.map.exportGrid=S.$('#exportGrid').checked;if(st.project)st.project.map={...st.map};S.renderLayers();S.autosave?.()};
S.resetFog=function(){let l=st.project.layers.find(x=>x.kind==='fog');if(!l){l=S.newLayer('Fog of War',{kind:'fog'})}l.ctx.clearRect(0,0,l.canvas.width,l.canvas.height);l.ctx.fillStyle='#001010';l.ctx.fillRect(0,0,l.canvas.width,l.canvas.height);l.opacity=.82;l.blend='source-over';st.map.enabled=true;S.setActiveLayer(l.id);S.renderLayers();S.renderLayerList();S.autosave?.();S.setTool('fogReveal');S.toast('Fog layer ready. Use Reveal to uncover areas.','success')};
S.addLightingLayer=function(){let l=st.project.layers.find(x=>x.kind==='lighting');if(!l)l=S.newLayer('Lighting',{kind:'lighting'});l.blend='screen';l.opacity=.95;st.map.enabled=true;S.setActiveLayer(l.id);S.renderLayerList();S.setTool('light');S.toast('Lighting layer ready. Click the canvas with Light.','success')};
S.applyMapPreset=function(){const [w,h]=String(S.$('#mapPreset').value||'1920x1080').split('x').map(Number);S.resizeCanvas(w,h,true);st.map.enabled=true;S.applyMapSettings();S.setWorkspace('canvas');S.fitCanvas();S.toast(`Map canvas set to ${w} × ${h}`,'success')};
})();
