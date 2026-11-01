/* VanaVie-derived parallax layering: painted skies, distant terrain and near
   foliage move at independent velocities. Mirrored tiles remove hard edges. */
(function (WW) {
  'use strict';
  const U=WW.util;
  const LAYERS={
    1:[{n:2,rate:.09,alpha:.90},{n:3,rate:.20,alpha:.95},{n:5,rate:.37,alpha:.80},{n:8,rate:.51,alpha:.95}],
    2:[{n:2,rate:.08,alpha:.90},{n:3,rate:.19,alpha:.94},{n:4,rate:.44,alpha:.92}],
    3:[{n:2,rate:.11,alpha:.95},{n:3,rate:.12,alpha:.36},{n:4,rate:.36,alpha:.99}],
    4:[{n:2,rate:.10,alpha:.84},{n:3,rate:.25,alpha:.98},{n:4,rate:.49,alpha:.97}],
    5:[{n:2,rate:.06,alpha:.95},{n:3,rate:.22,alpha:.91},{n:4,rate:.49,alpha:.97}],
    6:[{n:2,rate:.10,alpha:.75},{n:3,rate:.24,alpha:.97}],
    7:[{n:2,rate:.20,alpha:.96}],
    8:[]
  };
  class Backdrop {
    constructor(world,assets) {
      this.world=world;this.assets=assets;
      this.clouds=[];this.stars=[];this.distantBirds=[];
      this.seed=world.seed;this.time=0;this.wind=1;this._skyCache=null;
      this.createSkyLife();
    }
    createSkyLife() {
      const r=new U.PRNG(this.seed ^ 40031);
      for(let i=0;i<132;i++){
        this.clouds.push({x:r.between(0,this.world.length),y:r.between(.045,.42),
          scale:r.between(.45,2.1),width:r.between(35,125),phase:r.between(0,U.TAU),
          opacity:r.between(.25,.8),layer:r.int(0,2),shade:r.next()});
      }
      for(let i=0;i<190;i++) this.stars.push({x:r.next(),y:r.between(.01,.65),
        size:r.pick([1,1,1,2]),twinkle:r.between(0,U.TAU),brightness:r.between(.35,1)});
      for(let i=0;i<84;i++) this.distantBirds.push({x:r.next()*this.world.length,
        y:r.between(.12,.46),speed:r.between(3,9),phase:r.next()*U.TAU,flap:r.between(1.2,3.7),
        size:r.between(.75,2),species:r.pick(Object.keys(WW.birdFrames.species)),
        direction:r.sign()});
    }
    update(dt,weather) {this.time+=dt;this.wind=weather?.wind ?? .5;}
    draw(ctx,camera,light) {
      const w=camera.width,h=camera.height;
      const plan=this.world.blendAt(camera.x+w*.48);
      this.drawBaseSky(ctx,w,h,plan,light);
      // Crossfade real landscape sources. Layer scrolling still continues
      // independently as the viewpoint progresses through each transition.
      this.drawTheme(ctx,camera,plan.a,1-plan.t,light);
      if(plan.t>.001) this.drawTheme(ctx,camera,plan.b,plan.t,light);
      this.drawHorizonHaze(ctx,camera,plan,light);
      this.drawClouds(ctx,camera,plan,light);
      this.drawSkyBirds(ctx,camera,light);
    }
    drawBaseSky(ctx,w,h,plan,light) {
      const {a,b,t}=plan;
      const tone=U.colorMix(a.sky,b.sky,t);
      const top=U.colorMix(tone,'#10345f',light.night*.68);
      const low=U.colorMix(U.colorMix(a.horizon,b.horizon,t),'#425c68',light.night*.75);
      const g=U.canvasGradient(ctx,0,0,0,h,[[0,top],[.55,tone],[1,low]]);
      ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
      this.drawDistantGlow(ctx,w,h,light);
      this.drawStars(ctx,w,h,light);
    }
    drawDistantGlow(ctx,w,h,light) {
      const intensity=Math.max(.1,1-light.night);
      const angle=light.phase*U.TAU - Math.PI/2;
      const sx=(.12+.75*(light.phase))*w;
      const sy=(.41-.32*Math.sin(light.phase*U.TAU))*h;
      const radius=Math.max(14,h*.046);
      if(sy > -.2*h && sy < .95*h) {
        const g=ctx.createRadialGradient(sx,sy,radius*.3,sx,sy,radius*5);
        g.addColorStop(0,`rgba(255,235,165,${.18*intensity})`);
        g.addColorStop(1,'rgba(255,232,178,0)');
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy,radius*5,0,U.TAU);ctx.fill();
        ctx.fillStyle=`rgba(255,249,198,${.65*intensity})`;
        ctx.fillRect(Math.round(sx-radius*.62),Math.round(sy-radius*.62),Math.round(radius*1.24),Math.round(radius*1.24));
      }
      if(light.night>.15) {
        const moonX=w*(.8-.55*light.phase);
        const moonY=h*(.12+.10*Math.sin(light.phase*U.TAU));
        ctx.globalAlpha=light.night*.85;
        ctx.fillStyle='#dde5dd';ctx.beginPath();ctx.arc(moonX,moonY,Math.max(5,h*.018),0,U.TAU);ctx.fill();
        ctx.fillStyle='#d3ddd1';ctx.fillRect(Math.round(moonX+4),Math.round(moonY-6),3,3);
        ctx.globalAlpha=1;
      }
    }
    drawStars(ctx,w,h,light) {
      if(light.night<.18)return;
      ctx.save();ctx.globalAlpha=light.night;
      for(let i=0;i<this.stars.length;i++){
        const s=this.stars[i];
        const breath=.55+.45*Math.sin(this.time*.5+s.twinkle);
        ctx.globalAlpha=light.night*s.brightness*breath;
        ctx.fillStyle=i%4===0?'#8ee0ef':'#f0fff8';
        ctx.fillRect(Math.floor(s.x*w),Math.floor(s.y*h),s.size,s.size);
      }
      ctx.restore();
    }
    drawTheme(ctx,camera,biome,weight,light) {
      if(!biome||weight<=.0001)return;
      const w=camera.width,h=camera.height;
      const nature=biome.nature;
      const sky=this.assets.layer(nature,1);
      ctx.save();ctx.globalAlpha=weight;
      // Source sky images have opaque backgrounds: softened so biomes have
      // coherent skylight as the sunlight changes, even during travel.
      if(sky) {
        ctx.globalAlpha=weight*(nature===6?.73:nature===8?.90:.44);
        this.drawWallpaper(ctx,sky,w,h,camera.distance*.015);
      }
      ctx.globalAlpha=weight;
      for(const layer of LAYERS[nature]||[]){
        const im=this.assets.layer(nature,layer.n);
        if(!im)continue;
        ctx.globalAlpha=weight*layer.alpha;
        const rate=layer.rate;
        this.drawMirroredBand(ctx,im,camera.distance*rate,w,h,0);
      }
      ctx.restore();
    }
    drawWallpaper(ctx,image,w,h,drift) {
      const iw=image.naturalWidth,ih=image.naturalHeight;
      if(!iw||!ih)return;
      // A small camera-relative crop pans across one full source panorama.
      const overscan=Math.max(12,w*.12);
      const sourceW=iw,sourceH=ih;
      ctx.drawImage(image,0,0,sourceW,sourceH,-overscan + Math.sin(drift*.0005)*overscan*.4,
        -h*.01,w+overscan*2,h*1.02);
    }
    drawMirroredBand(ctx,image,offset,w,h,yShift=0) {
      if(!image||!image.naturalWidth)return;
      const height=h*1.02;
      const width=Math.max(1, Math.round(height*image.naturalWidth/image.naturalHeight));
      const position=U.modulo(offset,width*2);
      const start=Math.floor(offset/width)-2;
      const count=Math.ceil(w/width)+5;
      for(let i=0;i<count;i++){
        const tile=start+i;
        const x=Math.round(tile*width-offset);
        if(x> w+2||x+width < -2)continue;
        const mirror=U.modulo(tile,2)===1;
        if(mirror){
          ctx.save();ctx.translate(x+width,0);ctx.scale(-1,1);
          ctx.drawImage(image,0,Math.round(-h*.02+yShift),width,height);
          ctx.restore();
        }else ctx.drawImage(image,x,Math.round(-h*.02+yShift),width,height);
      }
    }
    drawHorizonHaze(ctx,camera,plan,light) {
      const w=camera.width,h=camera.height;
      const mist=U.lerp(plan.a.mist,plan.b.mist,plan.t);
      const base=this.world.getWeatherAt(camera.x+w*.5);
      const opacity=U.clamp(mist*.9+base.mist*.13,0,.33);
      if(opacity<.01)return;
      const g=U.canvasGradient(ctx,0,h*.43,0,h*.88,
        [[0,'rgba(244,252,243,0)'],[.65,`rgba(234,242,220,${opacity})`],
          [1,'rgba(197,226,203,0)']]);
      ctx.fillStyle=g;ctx.fillRect(0,h*.42,w,h*.48);
      if(light.night>.5){
        ctx.fillStyle=`rgba(45,75,92,${opacity*.35*light.night})`;
        ctx.fillRect(0,h*.6,w,h*.2);
      }
    }
    drawClouds(ctx,camera,plan,light) {
      const w=camera.width,h=camera.height;
      const biomeCloud=U.lerp(plan.a.mist,plan.b.mist,plan.t);
      const darkness=U.clamp(light.night*.75,0,.8);
      for(const cloud of this.clouds){
        const layerSpeed=[.11,.21,.32][cloud.layer];
        const x=U.wrapDelta(cloud.x+this.time*this.wind*(cloud.layer+1)*.8,camera.distance*layerSpeed,this.world.length);
        if(x < -200 || x>w+200) continue;
        const y=cloud.y*h;
        const size=cloud.width*cloud.scale;
        const alpha=cloud.opacity*(.15+biomeCloud*.34)*(.8-light.night*.22);
        ctx.globalAlpha=alpha;
        ctx.fillStyle=cloud.shade<.35?'#d7f4f1':darkness>.4?'#83a9ac':'#ffffff';
        this.drawPixelCloud(ctx,x,y,size,cloud.scale);
      }
      ctx.globalAlpha=1;
    }
    drawPixelCloud(ctx,x,y,w,scale=1) {
      const s=Math.max(2,Math.round(scale*3));
      const p=(a,b,c,d)=>ctx.fillRect(Math.round(x+a*w),Math.round(y+b*s),Math.ceil(c*w),Math.max(1,Math.ceil(d*s)));
      p(0.12,1,.68,5);p(.21,-1,.47,6);p(.32,-3,.24,7);
      p(.02,3,.87,2);p(.11,5,.72,2);p(.24,-4,.16,3);
      ctx.globalAlpha*=.65;p(.49,-5,.16,6);p(.68,0,.2,5);
    }
    drawSkyBirds(ctx,camera,light){
      const w=camera.width,h=camera.height;
      ctx.save();ctx.imageSmoothingEnabled=false;
      for(const bird of this.distantBirds){
        const x=U.wrapDelta(bird.x+this.time*bird.speed*bird.direction,
          camera.distance*.12,this.world.length);
        if(x<-30||x>w+30)continue;
        const y=bird.y*h+Math.sin(this.time*.53+bird.phase)*2;
        const atlas=this.assets.bird(bird.species);
        if(!atlas)continue;
        const frame=Math.floor(this.time*bird.flap*4+bird.phase)%28;
        const size=Math.max(10,Math.round(18*bird.size));
        ctx.save();ctx.translate(Math.round(x),Math.round(y));
        if(bird.direction<0)ctx.scale(-1,1);
        ctx.globalAlpha=.58;
        if(light.night>.25)ctx.filter=`brightness(${1-light.night*.4})`;
        ctx.drawImage(atlas,(frame%6)*256,Math.floor(frame/6)*256,256,256,
          -size/2,-size/2,size,size);
        ctx.restore();
      }
      ctx.restore();
    }
    inspect() { return {clouds:this.clouds.length,stars:this.stars.length,
      distantBirds:this.distantBirds.length,natureSources:Object.keys(LAYERS).length,
      mirroredParallax:true,cycleReady:true}; }
  }
  WW.Backdrop=Backdrop;
})(window.WanderingWorld=window.WanderingWorld||{});
