/* Decorative world renderer. Solid landscape, occasional water, independent
   trees, wildflowers, reeds, moss, stones and ground cover. Nothing is a game. */
(function (WW) {
  'use strict';
  const U=WW.util;
  const TREE_VISUAL_SCALE=3.0625; // 1.75x of the previous 1.75x rendering
  const BIOME_COLORS={
    greenwood:{bark:'#695543',leaf:'#459c58',shadow:'#256940',flower:'#ffe1ab'},
    sunmeadow:{bark:'#896e51',leaf:'#5fba64',shadow:'#35854a',flower:'#fbe7a2'},
    snowcrown:{bark:'#66675b',leaf:'#59896c',shadow:'#375e59',flower:'#f0e7cb'},
    mosswood:{bark:'#5b554c',leaf:'#48825c',shadow:'#284d43',flower:'#d7baef'},
    bluegrass:{bark:'#68654e',leaf:'#369e63',shadow:'#286956',flower:'#fff4a7'},
    starlit:{bark:'#46545c',leaf:'#327b7d',shadow:'#1e4c60',flower:'#c3f3dc'},
    standingstones:{bark:'#7d796b',leaf:'#7c9d65',shadow:'#4c7158',flower:'#ffdbcc'},
    seabright:{bark:'#9a8368',leaf:'#6aa57b',shadow:'#386f6d',flower:'#f1e6a7'}
  };
  class TerrainRenderer {
    constructor(world,assets) {
      this.world=world;this.assets=assets;this.time=0;
      this.wind=.5;this.groundSamples=[];this.cachedWidth=-1;
      this.cachedCamera=-1;this.debug=false;this.drawCount=0;
    }
    update(dt,weather) {this.time+=dt;this.wind=weather?.wind??.5;}
    treeBaseY(camera){
      // Shared flat baseline: no cat or trunk follows vertical hill undulations.
      // Preserve the former 50px downshift where the canvas has room.
      return Math.round(Math.min(camera.height-40,camera.height*.765+50));
    }
    palette(worldX) {
      const {a,b,t}=this.world.blendAt(worldX);
      const pa=BIOME_COLORS[a.id]||BIOME_COLORS.greenwood;
      const pb=BIOME_COLORS[b.id]||BIOME_COLORS.greenwood;
      const colors={};
      for(const key of Object.keys(pa)) colors[key]=U.colorMix(pa[key],pb[key],t);
      return colors;
    }
    draw(ctx,camera,light,opts={}) {
      this.drawCount=0;
      this.drawGround(ctx,camera,light);
      this.drawTrail(ctx,camera,light);
      const objects=this.world.objectsNear(camera.x,camera.width,280);
      // Back-to-front contract. Terrain and ground cover, including every
      // pond, stream/river surface, log and stone, are ALWAYS behind trees.
      // Depth sorting still applies *inside* each pass, never across passes.
      const rear=new Set(['rock','pond','river','stream','creek','water',
        'log','fallen_log','driftwood','shore','reed','seagrass','monolith']);
      const trunks=new Set(['tree']);
      for(const entry of objects){
        if(rear.has(entry.item.type))this.drawObject(ctx,camera,entry,light);
      }
      // Fine foreground plants sit over ground textures but behind trunks.
      this.drawGroundDetails(ctx,camera,light);
      for(const entry of objects){
        if(!rear.has(entry.item.type)&&!trunks.has(entry.item.type))
          this.drawObject(ctx,camera,entry,light);
      }
      // Explicit LAST scenic-object pass: no log, pond, creek or rock can
      // overpaint a tree, even if its depth/x sorts after that tree.
      for(const entry of objects){
        if(trunks.has(entry.item.type))this.drawObject(ctx,camera,entry,light);
      }
      return this.drawCount;
    }
    groundProfile(camera,step=6) {
      const n=Math.ceil(camera.width/step)+2;
      const arr=this.groundSamples;
      arr.length=0;
      for(let i=0;i<=n;i++){
        const x=i*step;
        const worldX=camera.screenToWorld(x);
        arr.push([x, Math.round(this.world.groundY(worldX,camera.height)),worldX]);
      }
      return arr;
    }
    drawGround(ctx,camera,light) {
      const w=camera.width,h=camera.height;
      const samples=this.groundProfile(camera);
      if(!samples.length)return;
      const centerX=camera.screenToWorld(w*.5);
      const a=this.world.blendAt(centerX);
      const ground=U.colorMix(a.a.ground,a.b.ground,a.t);
      const grass=U.colorMix(a.a.grass,a.b.grass,a.t);
      ctx.save();ctx.beginPath();ctx.moveTo(-1,h+1);
      for(const [x,y] of samples)ctx.lineTo(Math.round(x),y);
      ctx.lineTo(w+5,h+1);ctx.closePath();
      const gradient=U.canvasGradient(ctx,0,h*.71,0,h,
        [[0,grass],[.19,ground],[1,U.colorMix(ground,'#273d30',.32)]]);
      ctx.fillStyle=gradient;ctx.fill();
      ctx.save();ctx.clip();
      this.drawGroundTones(ctx,camera,light,samples,ground,grass);
      ctx.restore();
      ctx.strokeStyle=U.colorMix(grass,'#163e30',.15);
      ctx.lineWidth=2;ctx.beginPath();
      for(let i=0;i<samples.length;i++){
        const [x,y]=samples[i];if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      ctx.stroke();
      ctx.restore();
    }
    drawGroundTones(ctx,camera,light,samples,ground,grass) {
      const w=camera.width,h=camera.height;
      const t=this.time;
      const seed=this.world.seed;
      // Deterministic larger soil bands, connected through the world seam.
      for(let band=0;band<4;band++){
        const yBase=h*(.81+band*.052);
        const noiseAmp=3+band*3;
        ctx.fillStyle=U.colorMix(ground,band%2?'#2f6548':'#d4be75',band%2?.08:.055);
        ctx.beginPath();ctx.moveTo(0,h);
        for(let x=0;x<=w+10;x+=9){
          const wx=camera.screenToWorld(x);
          const roll=this.world.noise.sample(wx/this.world.length,.11+band*.14,64,64,49);
          const yy=yBase+(roll-.5)*noiseAmp*2;
          ctx.lineTo(x,yy);
        }
        ctx.lineTo(w,h);ctx.closePath();ctx.fill();
      }
      // Pixel moss and tiny soil flecks, stationary in world-space.
      const first=Math.floor(camera.x/13)-5;
      const n=Math.ceil(w/13)+12;
      for(let i=0;i<n;i++){
        const cell=first+i;
        const wx=U.modulo(cell*13,this.world.length);
        const sx=U.wrapDelta(wx,camera.x,this.world.length);
        const rand=U.hashUnit(cell,4,seed);
        const rand2=U.hashUnit(cell,15,seed);
        const y=this.world.groundY(wx,h)+Math.round(6+rand*120);
        if(y>h||sx<-8||sx>w+8)continue;
        const size=rand2>.88?3:rand2>.5?2:1;
        ctx.fillStyle=rand>.66?'rgba(214,229,139,.26)':rand>.33?'rgba(13,73,44,.22)':'rgba(225,188,127,.18)';
        ctx.fillRect(Math.round(sx),Math.round(y),size,size);
      }
    }
    drawTrail(ctx,camera,light) {
      // A meandering, subtle earth stripe gives a sense of moving at walking
      // height. It never ends, has no gameplay or pathfinding requirements.
      const w=camera.width,h=camera.height;
      const x0=camera.x;
      const yBase=h*.945;
      ctx.save();ctx.beginPath();
      for(let i=0;i<=w+8;i+=8){
        const wx=camera.screenToWorld(i);
        const p=this.world.noise.sample(wx/this.world.length,.91,48,48,18);
        const y=yBase+(p-.5)*16;
        if(i===0)ctx.moveTo(i,y);else ctx.lineTo(i,y);
      }
      for(let i=w+8;i>=0;i-=8){
        const wx=camera.screenToWorld(i);
        const p=this.world.noise.sample(wx/this.world.length,.91,48,48,18);
        ctx.lineTo(i,yBase+26+(p-.5)*18);
      }
      ctx.closePath();ctx.fillStyle='rgba(158,131,91,.15)';ctx.fill();
      ctx.restore();
      // Tire- and foot-free. The texture is natural sediment and gravel only.
      const start=Math.floor(x0/53)-4;
      for(let j=0;j<Math.ceil(w/53)+8;j++){
        const i=start+j;
        const random=U.hashUnit(i,8,this.world.seed);
        const x=U.wrapDelta(U.modulo(i*53+random*18,this.world.length),x0,this.world.length);
        const y=yBase+6+U.hashUnit(i,9,this.world.seed)*15;
        if(x<0||x>w)continue;
        ctx.fillStyle=random>.5?'rgba(236,213,161,.19)':'rgba(75,85,52,.15)';
        ctx.fillRect(x,y,2+random*5,1+random*3);
      }
    }
    drawObject(ctx,camera,entry,light) {
      const {item,screenX}=entry;
      const x=Math.round(screenX);
      const h=camera.height;
      const ground=this.world.groundY(item.x,h);
      const depth=item.depth;
      const y=Math.round(ground+(depth-1)*h*.05);
      const scale=item.size*(.75+depth*.2);
      const colors=BIOME_COLORS[item.biome]||BIOME_COLORS.greenwood;
      ctx.save();
      if(depth<.73)ctx.globalAlpha=.7;
      switch(item.type){
        case 'tree':this.drawTree(ctx,item,x,y,scale,colors,light);break;
        case 'shrub':this.drawShrub(ctx,item,x,y,scale,colors,light);break;
        case 'flowers':this.drawFlowers(ctx,item,x,y,scale,colors,light);break;
        case 'rock':this.drawRock(ctx,item,x,y,scale,colors,light);break;
        case 'grass':this.drawGrass(ctx,item,x,y,scale,colors,light);break;
        case 'pond':this.drawPond(ctx,item,x,y,scale,colors,light);break;
        case 'reed':this.drawReed(ctx,item,x,y,scale,colors,light);break;
        case 'log':this.drawLog(ctx,item,x,y,scale,colors,light);break;
        case 'mushroom':this.drawMushroom(ctx,item,x,y,scale,colors,light);break;
        case 'monolith':this.drawMonolith(ctx,item,x,y,scale,colors,light);break;
        case 'seagrass':this.drawSeaGrass(ctx,item,x,y,scale,colors,light);break;
      }
      this.drawCount++;
      ctx.restore();
    }
    drawTree(ctx,o,x,y,s,colors,light) {
      const tall=o.variant%3===0;
      const im=this.assets.tree(tall?'slender':'canopy');
      // Reference anatomy: typical bird visible body = 34px, cat = 42.5px.
      // Trees are now 75% larger than the immediately preceding version.
      const ht=74.375*TREE_VISUAL_SCALE*(.94+.055*Math.min(2,Math.max(.4,s)));
      const wd=ht*(im ? (im.naturalWidth/im.naturalHeight) : (tall?.76:1.07));
      const sway=Math.sin(this.time*.65+o.seedPhase)*this.wind*(1.2+o.bend);
      const drawY=this.treeBaseY({height:ctx.canvas.height});
      ctx.save();
      ctx.fillStyle='rgba(18,53,37,.13)';
      ctx.beginPath();ctx.ellipse(x,drawY+2,wd*.30,4*s,0,0,U.TAU);ctx.fill();
      ctx.translate(x,drawY);ctx.rotate((sway/Math.max(1,ht))*.34);
      if(im){
        if(o.flip)ctx.scale(-1,1);
        ctx.imageSmoothingEnabled=false;
        // Filter the sprite *as it is drawn*. source-atop on the entire
        // panorama canvas darkened the rectangular image bounds at night.
        if(light.night>.2)ctx.filter=`brightness(${1-light.night*.25}) saturate(${1-light.night*.12})`;
        ctx.drawImage(im,-Math.floor(wd/2),-Math.floor(ht),Math.ceil(wd),Math.ceil(ht));
        ctx.filter='none';
      }else this.drawProceduralTree(ctx,o,0,0,ht,wd,colors);
      ctx.restore();
      if(o.variant%6===0){
        ctx.fillStyle='rgba(241,240,198,.30)';
        ctx.fillRect(x-Math.ceil(wd*.3),drawY-Math.ceil(ht*.25),2,3);
      }
    }
    drawProceduralTree(ctx,o,x,y,h,w,colors) {
      ctx.fillStyle=colors.bark;
      ctx.fillRect(-w*.085,-h*.60,w*.17,h*.60);
      const c=colors.leaf,d=colors.shadow;
      for(let i=0;i<7;i++){
        const pos=i/6;
        const cx=Math.sin((i*4.13+o.seed)*.01)*w*.1;
        const cy=-h*(.64+pos*.25);
        const rad=w*(.30+.16*Math.sin(pos*Math.PI));
        ctx.fillStyle=i%3===0?d:c;
        ctx.fillRect(cx-rad,cy-rad*.5,rad*2,rad*.75);
      }
    }
    drawShrub(ctx,o,x,y,s,colors,light) {
      const width=15*s,height=9*s;
      const wind=Math.sin(this.time*.95+o.seedPhase)*this.wind*.8;
      ctx.save();ctx.translate(x,y);ctx.translate(wind,0);
      ctx.fillStyle=colors.shadow;
      ctx.fillRect(-width*.48,-height*.83,width,height*.81);
      ctx.fillStyle=colors.leaf;
      ctx.fillRect(-width*.61,-height*.52,width*1.28,height*.55);
      ctx.fillRect(-width*.47,-height,width*.6,height*.47);
      ctx.fillRect(width*.04,-height*1.22,width*.43,height*.77);
      ctx.fillStyle='rgba(199,234,141,.24)';
      for(let i=0;i<4;i++){
        const p=U.hashUnit(o.seed,i,11);
        ctx.fillRect(Math.floor((p-.5)*width),-height*(.4+p*.5),2,2);
      }
      ctx.restore();
    }
    drawFlowers(ctx,o,x,y,s,colors,light) {
      const pal=['#fff9c7','#e7d8fa','#ffbed1','#ffe7a3','#cdeefe','#ffffff','#d9ead5'];
      const amount=o.quantity;
      const rng=new U.PRNG(o.seed);
      for(let i=0;i<amount;i++){
        const dx=rng.between(-o.spread,o.spread)*s*.5;
        const dy=rng.between(-5,7)*s;
        const ht=(3+rng.next()*8)*s;
        const sway=Math.sin(this.time*1.1+rng.next()*3+o.seedPhase)*this.wind*s*.5;
        ctx.fillStyle='#3e8b4d';ctx.fillRect(x+dx,y+dy-ht,1.4*s,ht);
        const petal=pal[(o.variant+i)%pal.length];
        ctx.fillStyle=petal;
        this.pixelFlower(ctx,x+dx+sway,y+dy-ht,Math.max(1,Math.round(s*.9)));
      }
    }
    pixelFlower(ctx,x,y,r) {
      const n=Math.max(1,Math.floor(r));
      ctx.fillRect(Math.round(x-n),Math.round(y),n,n);
      ctx.fillRect(Math.round(x+n),Math.round(y),n,n);
      ctx.fillRect(Math.round(x),Math.round(y-n),n,n);
      ctx.fillRect(Math.round(x),Math.round(y+n),n,n);
      ctx.fillStyle='#f6d271';ctx.fillRect(Math.round(x),Math.round(y),n,n);
    }
    drawRock(ctx,o,x,y,s,colors,light) {
      const w=12*s,h=7*s;
      const grey=U.colorMix('#8b9c8d',colors.bark,.24);
      ctx.fillStyle='rgba(20,51,35,.18)';ctx.fillRect(x-w*.6,y-1,w*1.4,2);
      ctx.fillStyle=U.colorMix(grey,'#3d6258',light.night*.25);
      ctx.beginPath();ctx.moveTo(x-w*.58,y);ctx.lineTo(x-w*.45,y-h*.76);
      ctx.lineTo(x-w*.1,y-h);ctx.lineTo(x+w*.32,y-h*.68);
      ctx.lineTo(x+w*.59,y-h*.19);ctx.lineTo(x+w*.5,y);ctx.closePath();ctx.fill();
      ctx.fillStyle='rgba(235,248,208,.25)';
      ctx.fillRect(x-w*.18,y-h*.83,w*.19,h*.17);
      ctx.fillStyle='rgba(41,69,55,.19)';
      ctx.fillRect(x+w*.19,y-h*.40,w*.14,h*.28);
    }
    drawGrass(ctx,o,x,y,s,colors,light) {
      const grass=this.world.biomeAt(o.x).grass;
      const c=U.colorMix(grass,colors.shadow,.2+o.tint*.2);
      const h=5*s;
      ctx.strokeStyle=c;ctx.lineWidth=Math.max(1,s*.7);ctx.lineCap='butt';
      for(let i=0;i<o.quantity;i++){
        const dx=(i-(o.quantity-1)/2)*2.2*s;
        const lean=Math.sin(this.time*1.3+i*.5+o.seedPhase)*1.5*this.wind*s;
        ctx.beginPath();ctx.moveTo(x+dx,y);
        ctx.lineTo(x+dx+lean+(i%2?-2:2)*s,y-h*(.6+U.hashUnit(o.seed,i,5)*1.2));
        ctx.stroke();
      }
    }
    drawPond(ctx,o,x,y,s,colors,light) {
      const w=36*s,h=4.3*s;
      const edge='#5e9988',water='#76bbcb';
      ctx.save();ctx.globalAlpha*=.65;
      ctx.fillStyle=edge;ctx.beginPath();ctx.ellipse(x,y+1,w/2,h,0,0,U.TAU);ctx.fill();
      ctx.fillStyle=water;ctx.beginPath();ctx.ellipse(x,y,w*.40,h*.55,0,0,U.TAU);ctx.fill();
      for(let i=0;i<4;i++){
        const yy=y+(i-1.5)*h*.21;
        const dx=Math.sin(this.time*.7+o.seedPhase+i)*s*2;
        ctx.fillStyle='rgba(223,246,234,.40)';
        ctx.fillRect(x-w*.25+i*w*.14+dx,yy,w*.12,1);
      }
      ctx.restore();
    }
    drawReed(ctx,o,x,y,s,colors,light) {
      ctx.save();ctx.strokeStyle='#4d9d62';ctx.lineWidth=Math.max(1,1*s);
      for(let k=0;k<5;k++){
        const hx=(k-2)*3*s;
        const high=(7+U.hashUnit(o.seed,k,132)*13)*s;
        const lean=Math.sin(this.time*.8+o.seedPhase+k)*this.wind*2;
        ctx.beginPath();ctx.moveTo(x+hx,y);
        ctx.quadraticCurveTo(x+hx+lean*2,y-high*.5,x+hx+lean,y-high);ctx.stroke();
        if(k%2===0){ctx.fillStyle='#b8ac63';ctx.fillRect(x+hx+lean-1,y-high-5*s,2*s,6*s);}
      }
      ctx.restore();
    }
    drawLog(ctx,o,x,y,s,colors,light) {
      const w=22*s,h=4.4*s;
      ctx.save();ctx.translate(x,y);ctx.rotate((o.variant-3)*.06);
      ctx.fillStyle=colors.bark;ctx.fillRect(-w*.5,-h,w,h);
      ctx.fillStyle='#a7926f';ctx.fillRect(-w*.5,-h,w*.15,h*.94);
      ctx.fillStyle='rgba(13,36,25,.25)';ctx.fillRect(-w*.3,-h*.8,w*.55,1.2*s);
      ctx.fillStyle='#d1b993';ctx.fillRect(w*.37,-h*.8,w*.06,h*.5);
      ctx.restore();
    }
    drawMushroom(ctx,o,x,y,s,colors,light) {
      const r=new U.PRNG(o.seed);
      for(let i=0;i<2+r.int(0,2);i++){
        const dx=r.between(-8,8)*s, height=r.between(3,5)*s;
        const width=r.between(3,6)*s;
        ctx.fillStyle='#e5cba5';ctx.fillRect(x+dx-width*.14,y-height,width*.28,height);
        ctx.fillStyle=o.variant%2?'#b54d48':'#d7bd82';
        ctx.fillRect(x+dx-width*.42,y-height,width*.84,height*.42);
        ctx.fillStyle='rgba(245,231,189,.75)';ctx.fillRect(x+dx-width*.18,y-height,width*.15,1.5*s);
      }
    }
    drawMonolith(ctx,o,x,y,s,colors,light) {
      const h=(30+o.variant*4)*s,w=11*s;
      const base='#7c8076';
      ctx.save();ctx.translate(x,y);
      ctx.rotate((o.variant-3)*.026);
      ctx.fillStyle='#5b6e69';ctx.beginPath();
      ctx.moveTo(-w*.7,0);ctx.lineTo(-w*.52,-h*.94);
      ctx.lineTo(-w*.17,-h);ctx.lineTo(w*.34,-h*.84);
      ctx.lineTo(w*.6,-h*.06);ctx.lineTo(w*.38,0);ctx.closePath();ctx.fill();
      ctx.fillStyle='#acb1a4';ctx.fillRect(-w*.35,-h*.82,w*.14,h*.68);
      ctx.fillStyle='rgba(204,225,192,.3)';ctx.fillRect(w*.12,-h*.62,w*.1,h*.3);
      ctx.restore();
    }
    drawSeaGrass(ctx,o,x,y,s,colors,light) {
      const len=12*s;
      ctx.save();ctx.strokeStyle=o.variant%2?'#7eab7a':'#bad0a1';
      ctx.lineWidth=Math.max(1,.8*s);
      for(let i=0;i<6;i++){
        const lean=Math.sin(this.time*.8+i+o.seedPhase)*this.wind*3*s;
        ctx.beginPath();ctx.moveTo(x+(i-3)*s*1.3,y);
        ctx.quadraticCurveTo(x+(i-3)*s*1.4+lean,y-len*.5,
          x+(i-3)*s*1.5+lean,y-len*(.45+U.hashUnit(o.seed,i,11)*.6));
        ctx.stroke();
      }
      ctx.restore();
    }
    drawGroundDetails(ctx,camera,light) {
      const w=camera.width,h=camera.height;
      const cell=29,begin=Math.floor(camera.x/cell)-3;
      const end=begin+Math.ceil(w/cell)+6;
      for(let i=begin;i<=end;i++){
        const wx=U.modulo(i*cell,this.world.length);
        const x=U.wrapDelta(wx,camera.x,this.world.length);
        if(x<-20||x>w+20)continue;
        const base=this.world.groundY(wx,h);
        const seed=this.world.seed;
        const coin=U.hashUnit(i,seed,72);
        if(coin>.84){
          const y=base+1;
          ctx.fillStyle='#b7d57d';ctx.fillRect(Math.round(x),Math.round(y),2,2);
          ctx.fillStyle='#759e58';ctx.fillRect(Math.round(x)+3,Math.round(y)+1,1,3);
        }
      }
    }
    inspect() {return {renderedLastFrame:this.drawCount,objects:this.world.items.length,
      artTrees:this.assets.has('tree-canopy')&&this.assets.has('tree-slender'),
      naturalSway:true,periodicGround:true,treeVisualScale:TREE_VISUAL_SCALE};}
  }
  WW.TREE_VISUAL_SCALE=TREE_VISUAL_SCALE;
  WW.TerrainRenderer=TerrainRenderer;
})(window.WanderingWorld=window.WanderingWorld||{});
