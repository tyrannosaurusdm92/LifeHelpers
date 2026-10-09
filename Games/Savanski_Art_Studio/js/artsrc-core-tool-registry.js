(function(global){
  'use strict'; const LF=global.SavanskiArtTools;
  class ToolRegistry{
    constructor(){this.tools=new Map();this.active=null;}
    register(tool){if(!tool?.id) throw new Error('Tool requires id'); this.tools.set(tool.id,tool); return tool;}
    get(id){return this.tools.get(id)||null;}
    list(){return [...this.tools.values()];}
    activate(id,ctx){if(this.active?.deactivate)this.active.deactivate(ctx); this.active=this.get(id); if(!this.active)throw new Error(`Unknown tool: ${id}`); this.active.activate?.(ctx); return this.active;}
    dispatch(type,event,ctx){const fn=this.active?.[type]; return typeof fn==='function'?fn.call(this.active,event,ctx):undefined;}
  }
  LF.ToolRegistry=ToolRegistry;
})(typeof window!=='undefined'?window:globalThis);
