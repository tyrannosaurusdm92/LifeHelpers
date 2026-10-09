(function(){
'use strict';
const cache=new Map();
function texturePattern(ctx,data){if(!data)return null;let im=cache.get(data);if(!im){im=new Image();cache.set(data,im);im.onload=()=>window.LFStudio?.engine&&window.LFTextEngine?.render(window.LFStudio.engine,window.LFStudio.engine.activeLayer());im.src=data;return null}if(!im.complete||!im.naturalWidth)return null;try{return ctx.createPattern(im,'repeat')}catch{return null}}
function pt(engine,v){return Math.max(1,Number(v)||1)*engine.project.dpi/72}
function fontString(engine,m){return `${m.italic?'italic ':''}${m.bold?'700 ':'400 '}${pt(engine,m.fontSize)}px "${m.fontFamily||'Arial'}"`}
function styleAt(m,index){let s={color:m.color,opacity:m.opacity,highlight:null};for(const r of (m.runs||[])){if(index>=r.start&&index<r.end)s={...s,...r.style};}return s}
function splitLines(ctx,text,maxWidth,letterSpacing){if(!maxWidth)return text.split('\n');const out=[];for(const raw of text.split('\n')){const words=raw.split(/(\s+)/);let line='';for(const w of words){const test=line+w;const width=ctx.measureText(test).width+Math.max(0,test.length-1)*letterSpacing;if(width>maxWidth&&line.trim()){out.push(line.trimEnd());line=w.trimStart()}else line=test}out.push(line)}return out}
function applyTransform(ctx,engine,m){ctx.translate(m.x,m.y);const yScale=Math.max(.05,Math.abs(Math.cos((m.rotateY||0)*Math.PI/180)));ctx.transform(yScale,Math.tan((m.skewY||0)*Math.PI/180),Math.tan((m.skewX||0)*Math.PI/180),1,0,0);ctx.rotate((m.rotation||0)*Math.PI/180)}
function getFill(ctx,m,w,h){const texture=texturePattern(ctx,m.textureData);if(texture)return texture;if(m.gradient?.enabled){const a=(m.gradient.angle||0)*Math.PI/180,cx=Math.cos(a),cy=Math.sin(a),g=ctx.createLinearGradient(-w*cx/2,-h*cy/2,w*cx/2,h*cy/2);g.addColorStop(0,m.gradient.from||m.color);g.addColorStop(1,m.gradient.to||'#ffffff');return g}return m.color}
function charAdvance(ctx,ch,spacing){return ctx.measureText(ch).width+spacing}
function renderFlat(engine,layer){const m=layer.meta,c=layer.canvas,x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);x.save();x.font=fontString(engine,m);x.textBaseline='alphabetic';x.textAlign='left';x.lineJoin='round';applyTransform(x,engine,m);const size=pt(engine,m.fontSize),spacing=pt(engine,m.letterSpacing||0),lineGap=size*(m.lineHeight||1.08),maxWidth=m.boxWidth?pt(engine,m.boxWidth):0,lines=splitLines(x,m.text||'',maxWidth,spacing);let totalH=lines.length*lineGap;let baseY=-totalH/2+size;
 for(let li=0,global=0;li<lines.length;li++){
  const line=lines[li];let width=0;for(const ch of line)width+=charAdvance(x,ch,spacing);let px=m.align==='left'?0:m.align==='right'?-width:-width/2;
  for(let i=0;i<line.length;i++,global++){
   const ch=line[i],adv=charAdvance(x,ch,spacing),s=styleAt(m,global);x.save();x.globalAlpha=s.opacity??m.opacity??1;
   if(s.highlight||m.highlight){x.fillStyle=s.highlight||m.highlight;x.globalAlpha=(s.highlightOpacity??m.highlightOpacity??.75);x.fillRect(px-spacing*.25,baseY-size*.85,adv+spacing*.2,size*1.08);x.globalAlpha=s.opacity??m.opacity??1}
   const fill=getFill(x,{...m,color:s.color||m.color},width,totalH);
   if(m.shadow?.enabled){x.shadowColor=m.shadow.color||'#000';x.shadowBlur=pt(engine,m.shadow.blur||2);x.shadowOffsetX=pt(engine,m.shadow.x||2);x.shadowOffsetY=pt(engine,m.shadow.y||2)}
   if(m.depth>0){x.shadowColor='transparent';const depth=Math.min(80,Math.round(pt(engine,m.depth)));x.strokeStyle=m.depthColor||'#222';x.fillStyle=m.depthColor||'#222';for(let d=depth;d>0;d-=Math.max(1,Math.ceil(depth/30))){x.fillText(ch,px+d*.45,baseY+d*.45)}}
   x.fillStyle=fill;if(m.strokeWidth>0){x.lineWidth=pt(engine,m.strokeWidth);x.strokeStyle=m.strokeColor||'#fff';x.strokeText(ch,px,baseY)}x.fillText(ch,px,baseY);
   if(m.underline){x.fillStyle=s.color||m.color;x.fillRect(px,baseY+size*.08,Math.max(1,adv-spacing),Math.max(1,size*.045))}if(m.strike){x.fillStyle=s.color||m.color;x.fillRect(px,baseY-size*.32,Math.max(1,adv-spacing),Math.max(1,size*.045))}
   x.restore();px+=adv;
  }global++;// newline token
  baseY+=lineGap;
 }
 x.restore();}
function renderBent(engine,layer){const m=layer.meta,c=layer.canvas,ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);ctx.save();ctx.font=fontString(engine,m);ctx.textBaseline='middle';ctx.textAlign='center';ctx.lineJoin='round';applyTransform(ctx,engine,m);const text=(m.text||'').replace(/\n/g,' '),spacing=pt(engine,m.letterSpacing||0),radius=Math.max(pt(engine,25),pt(engine,Math.abs(m.bendRadius||150))),dir=(m.bendRadius||150)>=0?1:-1;let widths=[...text].map(ch=>charAdvance(ctx,ch,spacing)),total=widths.reduce((a,b)=>a+b,0),angleTotal=Math.min(Math.PI*1.8,total/radius),angle=-angleTotal/2;
 [...text].forEach((ch,i)=>{const da=angleTotal*(widths[i]/total),a=angle+da/2,st=styleAt(m,i);ctx.save();ctx.rotate(a*dir);ctx.translate(0,-radius*dir);ctx.rotate(-a*dir);ctx.globalAlpha=st.opacity??m.opacity??1;if(m.shadow?.enabled){ctx.shadowColor=m.shadow.color||'#000';ctx.shadowBlur=pt(engine,m.shadow.blur||2);ctx.shadowOffsetX=pt(engine,m.shadow.x||2);ctx.shadowOffsetY=pt(engine,m.shadow.y||2)}ctx.fillStyle=st.color||m.color;if(m.strokeWidth>0){ctx.lineWidth=pt(engine,m.strokeWidth);ctx.strokeStyle=m.strokeColor;ctx.strokeText(ch,0,0)}ctx.fillText(ch,0,0);ctx.restore();angle+=da});ctx.restore()}
const api={
 defaultMeta(w,h){return {text:'Canvas Title',x:w/2,y:h/2,fontFamily:'Arial',fontSize:64,bold:false,italic:false,underline:false,strike:false,align:'center',color:'#111111',opacity:1,highlight:null,highlightOpacity:.75,strokeColor:'#ffffff',strokeWidth:0,letterSpacing:0,lineHeight:1.08,boxWidth:0,rotation:0,rotateY:0,skewX:0,skewY:0,bend:false,bendRadius:170,depth:0,depthColor:'#222222',shadow:{enabled:false,color:'#000000',opacity:.55,blur:3,x:3,y:3},gradient:{enabled:false,from:'#00cfd1',to:'#6d2bd0',angle:45},runs:[],textureData:null};},
 insertAt(engine,x,y,text='Canvas Title'){const snap=engine.history.capture('Add Text');const l=engine.createLayer('Text','text');l.meta.x=x;l.meta.y=y;l.meta.text=text;engine.canvas().layers.push(l);engine.activeLayerId=l.id;api.render(engine,l);engine.history.push(snap);engine.render();engine.emit('layers');engine.emit('activeLayer',l);return l},
 render(engine,layer){if(!layer||layer.type!=='text'||!layer.meta)return;layer.meta.bend?renderBent(engine,layer):renderFlat(engine,layer);engine.render();engine.emit('layers')},
 update(engine,patch){const l=engine.activeLayer();if(!l||l.type!=='text')return false;Object.assign(l.meta,patch);api.render(engine,l);return true},
 applyRun(engine,start,end,style){const l=engine.activeLayer();if(!l||l.type!=='text')return false;start=Math.max(0,start|0);end=Math.max(start,end|0);l.meta.runs=l.meta.runs||[];l.meta.runs.push({start,end,style});api.render(engine,l);return true},
 clearRuns(engine){const l=engine.activeLayer();if(l?.type==='text'){l.meta.runs=[];api.render(engine,l)}},
 async loadCustomFont(file){const name=`LF-${file.name.replace(/\.[^.]+$/,'').replace(/[^a-z0-9_-]/gi,'-')}`;const buf=await file.arrayBuffer();const ff=new FontFace(name,buf);await ff.load();document.fonts.add(ff);return name;},
 async textureFromFile(file){return await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)})}
};
window.LFTextEngine=api;
})();
