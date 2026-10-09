(function(global){
 'use strict'; const LF=global.SavanskiArtTools;
 class CanvasAdapter{
  constructor(canvas,{presetId='canvas-portrait-6x9',background=null}={}){if(!(canvas instanceof HTMLCanvasElement))throw new Error('CanvasAdapter requires canvas');this.canvas=canvas;this.ctx=canvas.getContext('2d',{willReadFrequently:true});this.background=background;this.setPreset(presetId);}
  setPreset(id){const p=global.SavanskiCanvasSizePresets?.[id];if(!p)throw new Error(`Size preset not loaded: ${id}`);this.preset=p;this.canvas.width=p.widthPx;this.canvas.height=p.heightPx;this.canvas.dataset.canvasSizePreset=id;this.canvas.style.aspectRatio=`${p.widthIn}/${p.heightIn}`;this.ctx=this.canvas.getContext('2d',{willReadFrequently:true});this.clear();return p;}
  clear(){this.ctx.save();this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);if(this.background){this.ctx.fillStyle=this.background;this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);}this.ctx.restore();}
  export(type='image/png',quality=0.92){return this.canvas.toDataURL(type,quality);}
 }
 LF.CanvasAdapter=CanvasAdapter;
})(typeof window!=='undefined'?window:globalThis);
