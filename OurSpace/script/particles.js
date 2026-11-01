/* Wind, dust, falling leaves, grass seed, rain, occasional fireflies.
   Loosely adapted from the particle ideas in VanaVie, completely decoupled
   from player actions and source game mechanics. */
(function (WW) {
  'use strict';
  const U=WW.util;
  const PALETTES={
    leaf:['#8aba63','#b3bd67','#ad8d4a','#5e9e58','#e2b563','#a7c874'],
    dust:['#ded2a4','#d0c8a5','#e6d6ac','#c1bd9a'],
    seed:['#f9f3c2','#fef4d2','#d8e8bd','#c7b899'],
    rain:['#afdef0','#b7e3ee','#6bb6cc'],
    firefly:['#c4eeb3','#dbf9a0','#8edbc5']
  };
  class AirParticle {
    constructor(type,x,y,wind,rng,w,h){
      this.reset(type,x,y,wind,rng,w,h);
    }
    reset(type,x,y,wind,rng,w,h){
      this.type=type;this.x=x;this.y=y;
      this.width=w;this.height=h;
      this.rng=rng;this.life=0;this.maxLife=1;
      this.wave=rng.between(0,U.TAU);this.waveSpeed=rng.between(.8,4.5);
      this.rotation=rng.between(0,U.TAU);this.spin=rng.between(-2.3,2.3);
      this.size=rng.between(1,4);this.gravity=0;this.opacity=1;
      this.color=rng.pick(PALETTES[type]||PALETTES.dust);
      this.vx=0;this.vy=0;this.mass=rng.between(.65,1.65);
      this.flicker=rng.between(0,U.TAU);
      switch(type){
        case 'leaf':
          this.vx=wind*rng.between(9,30);this.vy=rng.between(5,19);
          this.gravity=rng.between(.2,1.9);this.maxLife=rng.between(6,15);
          this.size=rng.between(2,4.5);break;
        case 'dust':
          this.vx=wind*rng.between(13,32);this.vy=rng.between(-3,4);
          this.gravity=0;this.maxLife=rng.between(3,8);
          this.size=rng.between(.5,2);break;
        case 'seed':
          this.vx=wind*rng.between(12,40);this.vy=rng.between(-5,2);
          this.gravity=rng.between(.2,.8);this.maxLife=rng.between(5,13);
          this.size=rng.between(.7,1.9);break;
        case 'rain':
          this.vx=wind*rng.between(14,23);this.vy=rng.between(90,145);
          this.gravity=0;this.maxLife=rng.between(1.8,3.6);
          this.size=rng.between(.7,1.3);break;
        case 'firefly':
          this.vx=wind*rng.between(-3,6);this.vy=rng.between(-5,4);
          this.gravity=0;this.maxLife=rng.between(7,15);
          this.size=rng.between(1.2,2.5);break;
      }
      this.alive=true;
    }
    update(dt,wind,time){
      this.life+=dt;
      if(this.life>=this.maxLife){this.alive=false;return;}
      const inertia=.4+this.mass*.6;
      const fx=Math.sin(this.life*this.waveSpeed+this.wave)*
        (this.type==='leaf'?8:this.type==='firefly'?5:1.5);
      const fy=Math.cos(this.life*this.waveSpeed*.6+this.wave)*
        (this.type==='firefly'?5:this.type==='seed'?3:1.5);
      this.x+=(this.vx+fx+wind*3)*dt/inertia;
      this.y+=(this.vy+fy)*dt;
      this.vy+=this.gravity*dt;
      this.rotation+=this.spin*dt;
      this.opacity=Math.min(1,this.life/.5,(this.maxLife-this.life)/.8);
      if(this.x>this.width+18 || this.y>this.height+18 || this.y< -30 || this.x< -25)
        this.alive=false;
    }
    draw(ctx,time){
      if(!this.alive)return;
      ctx.save();ctx.translate(Math.round(this.x),Math.round(this.y));
      const p=U.clamp(this.opacity,0,1);
      if(this.type==='firefly'){
        const glow=.38+.62*Math.sin(time*3+this.flicker)**2;
        ctx.globalAlpha=p*glow;
        ctx.fillStyle='rgba(196,254,174,.14)';
        ctx.fillRect(-this.size*3,-this.size*3,this.size*6,this.size*6);
        ctx.fillStyle=this.color;
        ctx.fillRect(-this.size*.5,-this.size*.5,this.size,this.size);
      }else if(this.type==='rain'){
        ctx.globalAlpha=p*.47;
        ctx.fillStyle=this.color;
        ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-this.vx/18,5+this.size*3);
        ctx.lineWidth=Math.max(.6,this.size*.5);ctx.strokeStyle=this.color;ctx.stroke();
      }else if(this.type==='leaf'){
        ctx.globalAlpha=p*.8;ctx.rotate(this.rotation);
        ctx.fillStyle=this.color;
        ctx.fillRect(-this.size*.9,-this.size*.3,this.size*1.8,this.size*.7);
        ctx.fillStyle='rgba(255,241,183,.12)';
        ctx.fillRect(-this.size*.15,-this.size*.3,this.size*.25,this.size*.8);
      }else{
        ctx.globalAlpha=p*(this.type==='dust'?.26:.52);
        ctx.fillStyle=this.color;
        ctx.fillRect(0,0,this.size,this.size);
      }
      ctx.restore();
    }
  }
  class ParticleField {
    constructor(world){
      this.world=world;this.time=0;
      this.particles=[];this.recycled=[];
      this.rateBudget={leaf:0,dust:0,seed:0,rain:0,firefly:0};
      this.maxParticles=360;this.density=1;
      this.random=new U.PRNG(world.seed^0xb5e7);
      this.frameCounter=0;this.lastCounts={};
      this.paused=false;
    }
    setDensity(x){this.density=U.clamp(Number(x),0,2);}
    recycle(p){this.recycled.push(p);}
    spawn(type,wind,w,h){
      if(this.particles.length >= this.maxParticles)return;
      const r=this.random;
      let x=r.between(-15,w+15),y=r.between(-15,h+10);
      switch(type){
        case 'rain':x=r.between(-w*.15,w+20);y=-15;break;
        case 'leaf':x=-18;y=r.between(-20,h*.7);break;
        case 'seed':x=-15;y=r.between(h*.2,h*.8);break;
        case 'dust':x=-12;y=r.between(h*.60,h*.95);break;
        case 'firefly':x=r.between(0,w);y=r.between(h*.52,h*.9);break;
      }
      const p=this.recycled.pop();
      if(p)p.reset(type,x,y,wind,r,w,h);
      else this.particles.push(new AirParticle(type,x,y,wind,r,w,h));
      if(p)this.particles.push(p);
    }
    update(dt,camera,weather,light){
      this.time+=dt;this.frameCounter++;
      if(this.paused)return;
      const wind=weather.wind;
      const rain=weather.rain;
      const night=light.night;
      const w=camera.width,h=camera.height;
      const biome=this.world.biomeAt(camera.x+w*.5);
      const foliage=U.clamp(biome.treeDensity,0,1.2);
      const emissions={
        leaf:(.3+foliage*1.2)*this.density*(.3+wind*.8)*(1-rain*.75),
        dust:(.3+wind*.85)*this.density*(1-rain),
        seed:(.1+biome.flowers*.6)*this.density*(.6+wind*.8)*(1-rain),
        rain:rain*85*this.density,
        firefly:night*1.55*this.density*(1-rain*.9)*(biome.water>.45?1.3:1)
      };
      for(const [type,rate] of Object.entries(emissions)){
        this.rateBudget[type]+=rate*dt;
        let count=0;
        while(this.rateBudget[type]>=1&&count++<45){
          this.rateBudget[type]--;this.spawn(type,wind,w,h);
        }
      }
      for(let i=this.particles.length-1;i>=0;i--){
        const p=this.particles[i];p.update(dt,wind,this.time);
        if(!p.alive){this.particles.splice(i,1);this.recycle(p);}
      }
      this.lastCounts={};
      for(const p of this.particles) this.lastCounts[p.type]=(this.lastCounts[p.type]||0)+1;
    }
    draw(ctx,light){
      // Fireflies are seen over the ground; rain crosses all scene layers.
      for(const p of this.particles)if(p.type!=='rain')p.draw(ctx,this.time);
      for(const p of this.particles)if(p.type==='rain')p.draw(ctx,this.time);
    }
    clear(){
      while(this.particles.length)this.recycled.push(this.particles.pop());
      for(const k of Object.keys(this.rateBudget))this.rateBudget[k]=0;
    }
    inspect(){return {current:this.particles.length,max:this.maxParticles,byType:this.lastCounts,
      recycled:this.recycled.length,emitterCount:5};}
  }
  WW.ParticleField=ParticleField;
})(window.WanderingWorld=window.WanderingWorld||{});
