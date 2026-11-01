/* Onyx's Adventures audio: one bundled bird loop per environment, restrained
   wind, and explicit user-controlled cat voices. Nothing autoplays. */
(function (WW) {
  'use strict';
  const U=WW.util;
  class Soundscape {
    constructor(config={}) {
      this.ctx=null;this.master=null;this.windNode=null;this.windGain=null;
      this.windFilter=null;this.noiseSource=null;
      this.enabled=false;this.gain=.15;this.hudLevel=1;this.activeCalls=0;this.callsTotal=0;
      this.maxVoices=4;this.lastCall=0;this.lastResume=0;
      this._noiseBuffer=null;this.lastWeather=null;
      this._suspended=false;this._setupComplete=false;
      this._paused=false;this.currentBiome='';this.birdTrack=null;
      this.birdTracks=new Map();this.externalAudios=new Map();
      this.audioManifest=config.birdAudio||WW.BIRD_AUDIO_MANIFEST||{};
      this.audioErrors=[];
    }
    async enable(){
      if(this.enabled)return true;
      const AudioContext=window.AudioContext||window.webkitAudioContext;
      try{
        if(AudioContext){
          if(!this.ctx)this.ctx=new AudioContext({latencyHint:'interactive'});
          if(this.ctx.state==='suspended')await this.ctx.resume();
          if(!this._setupComplete)this.setup();
        }
        this.enabled=true;
        if(this.master&&this.ctx)this.master.gain.setTargetAtTime(this.gain,this.ctx.currentTime,.25);
        this.syncAllAudio();
        await this.playBirdTrack();
        return true;
      }catch(err){console.info('Sound could not be enabled:',err);this.syncAllAudio();return false;}
    }
    disable(){
      this.enabled=false;
      if(this.master&&this.ctx)
        this.master.gain.setTargetAtTime(0,this.ctx.currentTime,.1);
      if(this.birdTrack){this.birdTrack.pause();this.birdTrack.muted=true;}
      this.syncExternalAudio();
    }
    async toggle(){return this.enabled?(this.disable(),false):await this.enable();}
    setup(){
      const ctx=this.ctx;
      this.master=ctx.createGain();this.master.gain.value=0;
      this.master.connect(ctx.destination);
      this.windFilter=ctx.createBiquadFilter();this.windFilter.type='lowpass';
      this.windFilter.frequency.value=180;
      this.windGain=ctx.createGain();this.windGain.gain.value=.025;
      this.windFilter.connect(this.windGain);this.windGain.connect(this.master);
      const buffer=this.makeNoiseBuffer();
      this.noiseSource=ctx.createBufferSource();this.noiseSource.buffer=buffer;
      this.noiseSource.loop=true;this.noiseSource.connect(this.windFilter);
      this.noiseSource.start();this._setupComplete=true;
    }
    makeNoiseBuffer(){
      const ctx=this.ctx;
      if(this._noiseBuffer)return this._noiseBuffer;
      const len=ctx.sampleRate*3;
      const b=ctx.createBuffer(1,len,ctx.sampleRate);
      const data=b.getChannelData(0);
      const r=new U.PRNG(4456102);
      let filtered=0;
      for(let i=0;i<len;i++){
        const white=r.next()*2-1;
        filtered=(filtered*.97+white*.03);
        data[i]=filtered*.85+(white*.065);
      }
      this._noiseBuffer=b;return b;
    }
    update(weather,light){
      this.lastWeather=weather;
      if(!this.enabled||!this.ctx||!this._setupComplete)return;
      const now=this.ctx.currentTime;
      const wind=U.clamp(weather.wind,0,1.6);
      this.windGain.gain.setTargetAtTime(.09+wind*.18+weather.rain*.12,now,.6);
      this.windFilter.frequency.setTargetAtTime(120+wind*145,now,1);
    }
    // Bird calls are supplied by the selected environment loop. The old
    // synthesized per-bird chirps are intentionally disabled so each biome
    // has exactly one bird recording, rather than a second hidden sound layer.
    chirp(){return false;}
    setBiome(id){
      const next=String(id||'');
      if(!next||next===this.currentBiome)return;
      if(this.birdTrack){this.birdTrack.pause();this.birdTrack.currentTime=0;this.birdTrack.muted=true;}
      this.currentBiome=next;
      const definition=this.audioManifest[next];
      this.birdTrack=null;
      if(definition?.file){
        const existing=this.birdTracks.get(next);
        const track=existing||new Audio(definition.file);
        track.preload='auto';track.loop=true;track.setAttribute('aria-hidden','true');
        if(!existing)track.addEventListener('error',()=>{
          if(!this.audioErrors.includes(definition.file))this.audioErrors.push(definition.file);
        });
        this.birdTracks.set(next,track);this.birdTrack=track;
        this.syncTrack(track);
        if(this.enabled&&!this._paused)this.playBirdTrack();
      }
    }
    async playBirdTrack(){
      const track=this.birdTrack;
      if(!track||!this.enabled||this._paused||this.hudLevel<=0)return false;
      this.syncTrack(track);
      try{await track.play();return true;}catch(_){return false;}
    }
    syncTrack(track){
      if(!track)return;
      track.volume=U.clamp(.24*this.hudLevel,0,1);
      track.muted=!this.enabled||this._paused||this.hudLevel<=0;
    }
    registerAudio(audio,baseVolume=.38){
      if(!audio||typeof audio!=='object')return ()=>{};
      this.externalAudios.set(audio,U.clamp(Number(baseVolume)||0,0,1));
      this.syncExternal(audio);
      return ()=>this.unregisterAudio(audio);
    }
    unregisterAudio(audio){
      this.externalAudios.delete(audio);
      try{audio.pause();audio.muted=true;}catch(_){ }
    }
    syncExternal(audio,base=this.externalAudios.get(audio)){
      if(!audio)return;
      try{
        audio.volume=U.clamp((base??.38)*this.hudLevel,0,1);
        audio.muted=!this.enabled||this._paused||this.hudLevel<=0;
        if((!this.enabled||this._paused||this.hudLevel<=0)&&!audio.paused)audio.pause();
      }catch(_){ }
    }
    syncExternalAudio(){for(const [audio,base] of this.externalAudios)this.syncExternal(audio,base);}
    syncAllAudio(){this.syncTrack(this.birdTrack);this.syncExternalAudio();}
    setHudVolume(value){
      const level=Number(value);
      this.hudLevel=[0,.35,1].includes(level)?level:(level<=0?0:level<.7?.35:1);
      this.setVolume(this.hudLevel===0?0:this.hudLevel===.35?.07:.15);
    }
    setVolume(value){
      const numeric=U.clamp(Number(value)||0,0,.4);
      this.gain=numeric;
      if(numeric===0)this.hudLevel=0;
      else if(numeric<=.08)this.hudLevel=.35;
      else this.hudLevel=1;
      if(this.ctx&&this.master)
        this.master.gain.setTargetAtTime(this.enabled?this.gain:0,this.ctx.currentTime,.15);
      this.syncAllAudio();
      if(this.enabled&&!this._paused&&this.hudLevel>0)this.playBirdTrack();
    }
    setPaused(v){
      this._paused=!!v;
      if(this.birdTrack){
        if(this._paused)this.birdTrack.pause();
        else if(this.enabled)this.playBirdTrack();
      }
      if(this.ctx){
        if(v&&this.enabled){this.master.gain.setTargetAtTime(0,this.ctx.currentTime,.12);this._suspended=true;}
        else if(!v&&this._suspended){
          this.master.gain.setTargetAtTime(this.enabled?this.gain:0,this.ctx.currentTime,.15);
          this._suspended=false;
        }
      }
      this.syncExternalAudio();
    }
    inspect(){return {enabled:this.enabled,available:!!(window.AudioContext||window.webkitAudioContext),
      voices:this.activeCalls,generatedCalls:this.callsTotal,autoplay:false,
      natureOnly:true,currentBiome:this.currentBiome,
      birdLoop:this.birdTrack?.src||null,birdLoopCount:this.birdTracks.size,
      externalAudioCount:this.externalAudios.size,audioErrors:this.audioErrors.slice()};}
  }
  WW.Soundscape=Soundscape;
})(window.WanderingWorld=window.WanderingWorld||{});
