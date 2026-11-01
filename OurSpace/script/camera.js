/* Camera evolved from VanaVie's smooth-follow camera; there is no player.
   It follows a perpetual, automatically moving viewport around a circle. */
(function (WW) {
  'use strict';
  const U=WW.util;
  class ScenicCamera {
    constructor(world,canvas) {
      this.world=world;this.canvas=canvas;this.x=0;this.distance=0;
      this.speed=world.config.cameraSpeed ?? 0;
      this.targetSpeed=this.speed;
      this.paused=false;this.width=960;this.height=540;
      this.scale=1;this.targetScale=1;this.prevScroll=0;
      this.manualVelocity=0;this.dragging=false;
      this.dragLastX=0;this.dragPointer=null;
      this.travelDirection=1;this.elapsed=0;
      this.resized=true; this.autoScroll=false;this.manualUntil=0;this.manualUntil=0;
      this._lastResize={w:0,h:0}; this.debug=false;
    }
    resize() {
      const rect=this.canvas.getBoundingClientRect();
      const cssWidth=Math.max(320,rect.width || window.innerWidth);
      const cssHeight=Math.max(200,rect.height || window.innerHeight);
      const resolution=cssWidth>1100?2:window.devicePixelRatio>2?2:1.8;
      const cw=Math.max(320,Math.ceil(cssWidth / resolution));
      const ch=Math.max(200,Math.ceil(cssHeight / resolution));
      if (this.canvas.width!==cw||this.canvas.height!==ch) {
        this.canvas.width=cw;this.canvas.height=ch;
        this.canvas.style.imageRendering='pixelated';
        this.resized=true;
      }
      this.width=cw;this.height=ch;
      this._lastResize={w:cssWidth,h:cssHeight,ratio:cssWidth/cw};
      return this._lastResize;
    }
    setSpeed(v) {this.targetSpeed=U.clamp(Number(v)||0,0,180);}
    setPaused(v) {this.paused=!!v;}
    togglePaused() {this.paused=!this.paused;return this.paused;}
    setMotionReduced(v) {this.motionReduced=!!v;}
    jumpToChapter(index) {
      const i=U.modulo(index,this.world.route.length);
      this.x=i*this.world.chapterWidth;
      this.distance=this.x; this.manualVelocity=0;this.manualUntil=this.elapsed+20;this.manualUntil=this.elapsed+20;
    }
    update(dt) {
      dt=U.clamp(dt,0,.06);
      this.elapsed+=dt;
      if(this.paused)return;
      this.speed=U.damp(this.speed,this.targetSpeed,1.9,dt);
      if(this.motionReduced)this.speed=Math.min(this.speed,8);
      const manualTravel=this.dragging?0:this.manualVelocity*dt;
      if(!this.dragging){
        this.manualVelocity*=Math.exp(-5*dt);
        if(Math.abs(this.manualVelocity)<.01)this.manualVelocity=0;
      }
      const automatic=this.autoScroll&&!this.dragging?this.speed*dt*this.travelDirection:0;
      const advance=automatic+manualTravel;
      this.distance+=advance;
      this.x=U.modulo(this.x+advance,this.world.length);
      this.prevScroll=advance;
    }
    pan(delta) {
      // Manual inspection temporarily suspends following Onyx, so the
      // visible left/right look buttons and canvas drags remain usable.
      this.manualUntil=this.elapsed+20;
      this.distance+=delta;this.x=U.modulo(this.x+delta,this.world.length);
    }
    startDrag(evt) {
      if(evt.target!==this.canvas)return false;
      if(evt.button!==undefined&&evt.button!==0)return false;
      this.dragging=true;this.dragLastX=evt.clientX;
      this.dragPointer=evt.pointerId ?? null;
      this.manualVelocity=0;
      if(this.canvas.setPointerCapture&&evt.pointerId!==undefined)
        try{this.canvas.setPointerCapture(evt.pointerId);}catch(_){}
      return true;
    }
    drag(evt) {
      if(!this.dragging)return;
      if(this.dragPointer!==null&&evt.pointerId!==this.dragPointer)return;
      const d=this.dragLastX-evt.clientX;
      this.dragLastX=evt.clientX;
      this.pan(d / Math.max(.1,this._lastResize.ratio));
      this.manualVelocity=d*8/Math.max(.1,this._lastResize.ratio);
    }
    stopDrag(evt) {
      if(this.dragPointer!==null&&evt&&evt.pointerId!==this.dragPointer)return;
      this.dragging=false;this.dragPointer=null;
    }
    worldToScreen(x,y,depth=1) {
      return {x:U.wrapDelta(x,this.x,this.world.length)*depth,y:y};
    }
    screenToWorld(x) {return U.modulo(this.x+x,this.world.length);}
    isVisible(x,width=0,margin=100) {
      const s=U.wrapDelta(x,this.x,this.world.length);
      return s>=-margin-width&&s<=this.width+margin;
    }
    getProgress() {return this.x/this.world.length;}
    getLap() {return Math.floor(Math.max(0,this.distance)/this.world.length);}
    getTimeToLapMinutes() {
      return this.targetSpeed>0?this.world.length/this.targetSpeed/60:Infinity;
    }
  }
  WW.ScenicCamera=ScenicCamera;
})(window.WanderingWorld=window.WanderingWorld||{});
