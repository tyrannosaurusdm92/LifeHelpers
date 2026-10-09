(function(global){
 'use strict'; const LF=global.SavanskiArtTools;
 class LayerStack{
  constructor(width,height){this.width=width;this.height=height;this.layers=[];this.activeId=null;this.add('Layer 1');}
  add(name='Layer'){const canvas=document.createElement('canvas');canvas.width=this.width;canvas.height=this.height;const layer={id:LF.util.uid('layer'),name,canvas,visible:true,opacity:1,blendMode:'source-over',locked:false};this.layers.push(layer);this.activeId=layer.id;return layer;}
  active(){return this.layers.find(l=>l.id===this.activeId)||this.layers.at(-1);}
  remove(id){if(this.layers.length<=1)return false;const i=this.layers.findIndex(l=>l.id===id);if(i<0)return false;this.layers.splice(i,1);this.activeId=this.layers[Math.max(0,i-1)].id;return true;}
  move(id,to){const i=this.layers.findIndex(l=>l.id===id);if(i<0)return false;const [x]=this.layers.splice(i,1);this.layers.splice(Math.max(0,Math.min(to,this.layers.length)),0,x);return true;}
  resize(width,height,preserve=true){this.width=width;this.height=height;for(const l of this.layers){const tmp=document.createElement('canvas');tmp.width=l.canvas.width;tmp.height=l.canvas.height;tmp.getContext('2d').drawImage(l.canvas,0,0);l.canvas.width=width;l.canvas.height=height;if(preserve)l.canvas.getContext('2d').drawImage(tmp,0,0,width,height);}}
  composite(target){const c=target.getContext('2d');c.clearRect(0,0,target.width,target.height);for(const l of this.layers){if(!l.visible)continue;c.save();c.globalAlpha=l.opacity;c.globalCompositeOperation=l.blendMode;c.drawImage(l.canvas,0,0,target.width,target.height);c.restore();}}
 }
 LF.LayerStack=LayerStack;
})(typeof window!=='undefined'?window:globalThis);
