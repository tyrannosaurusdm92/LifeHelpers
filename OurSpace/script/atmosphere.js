/* Day/night, sunrise glow, weather fronts and an optional gentle time cycle.
   Continuity is spatial: at the end of the world the light returns seamlessly. */
(function (WW) {
  'use strict';
  const U=WW.util;
  class Atmosphere {
    constructor(world) {
      this.world=world;this.phase=0;
      this.manualHour=10;this.autoTime=true;
      this.weatherMode='auto';this.wind=.5;this.rain=0;this.mist=.1;
      this.cloud=.2;this.night=0;this.daylight=1;
      this.sunAltitude=.5;this.twilight=0;
      this.hour=6;this.seconds=0;
      this.currentWeather='clear';this.lightLevel=1;
      this.weatherBlend=.1;this.light={};this.weather={};
      this.rendering=true;this._transitions=0;
    }
    setWeather(mode) {
      this.weatherMode=['auto','clear','rain','mist','breeze'].includes(mode)?mode:'auto';
    }
    setAutoTime(value) {this.autoTime=!!value;}
    setHour(v) {this.manualHour=U.modulo(Number(v)||0,24);}
    update(dt,camera,worldX) {
      this.seconds+=dt;
      const p=this.autoTime?U.modulo(camera.x,this.world.length)/this.world.length:
        U.modulo((this.manualHour-6)/24,1);
      this.phase=p;
      // The solar phase's endpoints are identical, including its derivative.
      const solar=Math.sin(U.TAU*p+.25);
      this.sunAltitude=solar;
      this.night=1-U.smoothstep(-.48,.17,solar);
      this.daylight=1-this.night;
      this.twilight=1-U.clamp(Math.abs(solar+.10)/.65,0,1);
      this.hour=U.modulo(6+24*p,24);
      this.lightLevel=U.lerp(.2,1,this.daylight);
      const climate=this.world.getWeatherAt(camera.x+camera.width*.5);
      let targetRain=climate.rain;
      let targetWind=climate.wind;
      let targetMist=climate.mist;
      let cloud=climate.cloud;
      switch(this.weatherMode){
        case 'clear':targetRain=0;targetMist=.02;cloud=.18;break;
        case 'rain':targetRain=.87;targetWind=.55;targetMist=.22;cloud=.83;break;
        case 'mist':targetRain=0;targetMist=.52;cloud=.55;break;
        case 'breeze':targetRain=0;targetWind=1.14;targetMist=.04;break;
      }
      const duration=Math.max(0,dt);
      this.rain=U.damp(this.rain,targetRain,.65,duration);
      this.wind=U.damp(this.wind,targetWind,.75,duration);
      this.mist=U.damp(this.mist,targetMist,.5,duration);
      this.cloud=U.damp(this.cloud,cloud,.7,duration);
      const prev=this.currentWeather;
      this.currentWeather=this.rain>.35?'rain':this.mist>.28?'mist':
        this.wind>.97?'breezy':'clear';
      if(prev!==this.currentWeather)this._transitions++;
      this.light={phase:p,night:this.night,daylight:this.daylight,
        solar:this.sunAltitude,twilight:this.twilight,lightLevel:this.lightLevel,
        hour:this.hour};
      this.weather={rain:this.rain,wind:this.wind,mist:this.mist,cloud:this.cloud,
        label:this.currentWeather};
      return {light:this.light,weather:this.weather};
    }
    drawLightOverlay(ctx,camera) {
      const w=camera.width,h=camera.height;
      if(this.night>.03){
        ctx.fillStyle=`rgba(8,24,55,${this.night*.56})`;
        ctx.fillRect(0,0,w,h);
      }
      if(this.twilight>.05){
        const fade=this.twilight*(.18-.10*this.night);
        const g=U.canvasGradient(ctx,0,h*.35,0,h,
          [[0,'rgba(234,155,106,0)'],[.56,`rgba(245,163,111,${fade})`],
            [1,'rgba(246,200,153,0)']]);
        ctx.fillStyle=g;ctx.fillRect(0,h*.35,w,h*.65);
      }
      if(this.rain>.24){
        ctx.fillStyle=`rgba(40,75,93,${this.rain*.075})`;
        ctx.fillRect(0,0,w,h);
      }
    }
    drawMist(ctx,camera) {
      if(this.mist<.05)return;
      const w=camera.width,h=camera.height;
      ctx.save();
      const y=h*.66;
      const g=U.canvasGradient(ctx,0,y,0,h,
        [[0,'rgba(214,231,216,0)'],[.43,`rgba(223,233,228,${this.mist*.28})`],
          [1,'rgba(202,217,204,0)']]);
      ctx.fillStyle=g;ctx.fillRect(0,y,w,h-y);
      ctx.restore();
    }
    drawVignette(ctx,camera,intensity=.035){
      const w=camera.width,h=camera.height;
      if(!intensity)return;
      const g=ctx.createRadialGradient(w*.5,h*.46,Math.min(w,h)*.15,
        w*.5,h*.48,Math.max(w,h)*.7);
      g.addColorStop(0,'rgba(0,0,0,0)');
      g.addColorStop(1,`rgba(10,37,39,${intensity})`);
      ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    }
    formatTime(){
      const h=Math.floor(this.hour),m=Math.floor((this.hour-h)*60);
      const meridian=h>=12?'PM':'AM';
      const hour12=h%12||12;
      return hour12+':'+String(m).padStart(2,'0')+' '+meridian;
    }
    getTimeOfDay(){
      if(this.hour<5||this.hour>=21)return 'Night';
      if(this.hour<8)return 'Dawn';
      if(this.hour<12)return 'Morning';
      if(this.hour<17)return 'Afternoon';
      if(this.hour<20)return 'Evening';
      return 'Dusk';
    }
    inspect(){return {phase:this.phase,hour:this.formatTime(),night:this.night,
      rain:this.rain,wind:this.wind,mist:this.mist,weatherMode:this.weatherMode,
      transitions:this._transitions,periodic:true};}
  }
  WW.Atmosphere=Atmosphere;
})(window.WanderingWorld=window.WanderingWorld||{});
