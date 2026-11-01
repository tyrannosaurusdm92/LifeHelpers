/* Onyx’s Adventures: outdoor-only interface plugged into the shell HUD.
   The scenic camera remains still until the future Onyx locomotion controller exists. */
(function(WW){
  'use strict';
  class ViewerInterface {
    constructor(app){
      this.app=app;this.lastChapter=-1;this.lastClock='';this.lastWeather='';
      this.lastStatus=0;this.dragging=false;this.ready=false;this.saved={};
      this.lowStimulation=!!window.onyxAdventuresShell?.getSnapshot?.().preferences.lowStimulation;
      this.loading=document.getElementById('loading');
      this.progress=document.getElementById('loadProgress');
      this.loadingText=document.getElementById('loadingText');
      this.statusNode=document.getElementById('onyxIntegratedStatus');
      this.locationName=document.getElementById('locationName');
      this.locationCaption=document.getElementById('locationCaption');
      this.timeLabel=document.getElementById('timeLabel');
      this.weatherLabel=document.getElementById('weatherLabel');
      this.canvas=document.getElementById('outdoorCanvas');
      app.camera.autoScroll=false;app.camera.speed=0;app.camera.setSpeed(0);
      app.atmosphere.setAutoTime(false);app.atmosphere.setHour(10);app.atmosphere.setWeather('clear');
      app.sound.setVolume(.15);
      this.configControls();this.bind();
      app.assets.onProgress(({loaded,total,failed})=>{
        if(this.progress)this.progress.style.width=total?Math.round(loaded/total*100)+'%':'0%';
        if(this.loadingText)this.loadingText.textContent=`Preparing outdoor scenery… ${loaded}/${total}${failed?' ('+failed+' unavailable)':''}`;
      });
    }
    el(id){return document.getElementById(id);}
    configControls(){
      try{this.saved=JSON.parse(localStorage.getItem('onyx-adventures-world:v1')||'{}');}catch(_){this.saved={};}
      const c=this.saved;
      this.el('worldBirdDensity').value=c.birds??1;
      this.el('worldParticleDensity').value=c.particles??1;
      this.el('worldWeather').value=c.weather??'clear';
      this.el('worldAutoTime').checked=!!c.autoTime;
      this.el('worldHour').value=c.hour??10;
      this.el('worldAllowPan').checked=c.allowPan!==false;
      this.applyControlValues();
    }
    applyControlValues(){
      const b=+this.el('worldBirdDensity').value,p=+this.el('worldParticleDensity').value;
      this.app.birds.setDensity(this.lowStimulation?Math.min(b,.35):b);this.app.particles.setDensity(this.lowStimulation?Math.min(p,.25):p);
      this.app.atmosphere.setWeather(this.el('worldWeather').value);
      this.app.atmosphere.setAutoTime(this.el('worldAutoTime').checked);
      this.app.atmosphere.setHour(+this.el('worldHour').value);
      this.app.allowDrag=this.el('worldAllowPan').checked;
      this.el('birdDensityValue').textContent=Math.round((this.lowStimulation?Math.min(b,.35):b)*100)+'%'+(this.lowStimulation?' (low stimulation)':'');
      this.el('particleDensityValue').textContent=Math.round((this.lowStimulation?Math.min(p,.25):p)*100)+'%'+(this.lowStimulation?' (low stimulation)':'');
      const h=+this.el('worldHour').value;
      this.el('worldHourValue').textContent=(Math.floor(h)%12||12)+':'+((h%1)*60?'30':'00')+(h>=12?' PM':' AM');
      this.el('worldHour').disabled=this.el('worldAutoTime').checked;
      this.app.camera.autoScroll=false;this.app.camera.setSpeed(0);
    }
    save(){
      const c={birds:+this.el('worldBirdDensity').value,particles:+this.el('worldParticleDensity').value,
        weather:this.el('worldWeather').value,autoTime:this.el('worldAutoTime').checked,
        hour:+this.el('worldHour').value,allowPan:this.el('worldAllowPan').checked};
      try{localStorage.setItem('onyx-adventures-world:v1',JSON.stringify(c));}catch(_){}
    }
    bind(){
      window.addEventListener('onyx-adventures:low-stimulation',e=>{this.lowStimulation=!!e.detail?.enabled;this.applyControlValues();});
      for(const id of ['worldBirdDensity','worldParticleDensity','worldWeather','worldAutoTime','worldHour','worldAllowPan']){
        const el=this.el(id);el.addEventListener(el.type==='range'?'input':'change',()=>{this.applyControlValues();this.save();});
      }
      const c=this.app.camera;
      this.el('worldReset').addEventListener('click',()=>{
        this.el('worldBirdDensity').value=1;this.el('worldParticleDensity').value=1;
        this.el('worldWeather').value='clear';this.el('worldAutoTime').checked=false;
        this.el('worldHour').value=10;this.el('worldAllowPan').checked=true;
        this.applyControlValues();this.save();
      });
      this.el('worldCenter').addEventListener('click',()=>c.jumpToChapter(0));
      this.el('worldViewLeft').addEventListener('click',()=>c.pan(-Math.max(85,c.width*.42)));
      this.el('worldViewRight').addEventListener('click',()=>c.pan(Math.max(85,c.width*.42)));
      this.canvas.addEventListener('pointerdown',e=>{
        if(this.app.cats?.onPointerDown(e))return;
        if(this.app.allowDrag&&c.startDrag(e))this.dragging=true;
      });
      this.canvas.addEventListener('pointermove',e=>c.drag(e));
      for(const ev of ['pointerup','pointercancel','lostpointercapture'])
        this.canvas.addEventListener(ev,e=>{
          if(ev==='pointerup' && this.app.cats?.onPointerUp(e))return;
          if(ev!=='pointerup')this.app.cats.petPointer=null;
          c.stopDrag(e);this.dragging=false;
        });
      this.canvas.addEventListener('keydown',e=>{
        if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
          e.preventDefault();c.pan((e.key==='ArrowLeft'?-1:1)*Math.max(85,c.width*.42));
        }
      });
    }
    update(timestamp){
      const app=this.app,c=app.camera,world=app.world;
      const biome=world.biomeAt(c.screenToWorld(c.width*.47));
      if(this.lastChapter!==biome.id){this.locationName.textContent=biome.label;
        this.locationCaption.textContent=biome.caption;this.lastChapter=biome.id;}
      const time=app.atmosphere.getTimeOfDay()+' · '+app.atmosphere.formatTime();
      if(this.lastClock!==time){this.timeLabel.textContent=time;this.lastClock=time;}
      if(this.lastWeather!==app.atmosphere.currentWeather){
        const map={clear:'Soft breeze',rain:'Gentle rain',mist:'Soft mist',breeze:'Fresh wind'};
        this.weatherLabel.textContent=map[app.atmosphere.currentWeather]||app.atmosphere.currentWeather;
        this.lastWeather=app.atmosphere.currentWeather;
      }
      if(timestamp-this.lastStatus>1000){this.statusNode.textContent=(c.paused?'Paused — ':'')+biome.label;
        const hunt=app.birds.catchPeriodStatus();
        const timer=s=>`${Math.floor(s/60)}:${String(Math.ceil(s%60)).padStart(2,'0')}`;
        const birdPhase=hunt.active?
          `Low-flight window · ${timer(hunt.remainingSeconds)} left (2/3 swooping)`:
          `Next 90-second bird swoop in ${timer(hunt.secondsUntilNext)}`;
        this.el('worldOverview').textContent=`${biome.label} · ${c.paused?'paused':'Onyx-led meadow'} · ${app.birds.visible} birds nearby · ${birdPhase}`;
        this.lastStatus=timestamp;}
    }
    finishLoading(info){this.ready=true;this.loading.classList.add('loaded');
      this.loading.setAttribute('aria-hidden','true');
      this.progress.style.width='100%';
      if(info.failed>0)this.loadingText.textContent=`World opened with ${info.failed} missing assets.`;
    }
    inspect(){return {scenery:true,catSprite:false,autoScroll:false,interface:'adventures HUD',settings:this.saved};}
  }
  WW.ViewerInterface=ViewerInterface;
})(window.WanderingWorld=window.WanderingWorld||{});
