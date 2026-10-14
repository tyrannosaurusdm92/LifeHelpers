/* Portal-era chest-up Hungry module avatar compatibility adapter.
 * Scope: widget/module #onyxCanvas only. Game actors use separate renderers.
 */
(()=>{
  'use strict';
  const mood='hungry';
  const api={
    version:'portal-chest-up-v1',
    mood,
    fallback:'assets/images/shared/legacy-static/onyx_hungry.png',
    render(target,options={}){
      if(!window.OnyxMoodRenderers?.renderCanvas) throw new Error('OnyxMoodRenderers unavailable');
      return window.OnyxMoodRenderers.renderCanvas(mood,{...options,target});
    },
    renderToContext(ctx,options={}){
      if(!window.OnyxMoodRenderers?.renderToContext) return false;
      return window.OnyxMoodRenderers.renderToContext(ctx,{...options,state:mood});
    }
  };
  window.OnyxHungry=Object.freeze(api);
  window['onyx_hungry']=window.OnyxHungry;
})();
