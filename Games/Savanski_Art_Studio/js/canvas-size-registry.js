(function(){
  'use strict';
  const presets = new Map();
  window.LFCanvasSizeRegistry = {
    register(preset){ presets.set(preset.id, Object.freeze({...preset})); },
    get(id){ return presets.get(id); },
    all(){ return Array.from(presets.values()); },
    byCategory(category){ return this.all().filter(p=>p.category===category); },
    pixels(id,dpi=300){ const p=this.get(id); if(!p) throw new Error('Unknown canvas size preset: '+id); return {width:Math.round(p.widthIn*dpi),height:Math.round(p.heightIn*dpi)}; }
  };
})();
