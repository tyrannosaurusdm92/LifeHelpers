/* Portal-era chest-up Snuggly module avatar compatibility adapter.
 * Scope: widget/module #onyxCanvas only. Game actors use separate renderers.
 */
(()=>{
  'use strict';
  const mood='snuggly';
  const api={
    version:'portal-chest-up-v1',
    mood,
    fallback:'../../assets/onyx_widget_onyx_snuggly.png',
    render(target,options={}){
      if(!window.OnyxMoodRenderers?.renderCanvas) throw new Error('OnyxMoodRenderers unavailable');
      return window.OnyxMoodRenderers.renderCanvas(mood,{...options,target});
    },
    renderToContext(ctx,options={}){
      if(!window.OnyxMoodRenderers?.renderToContext) return false;
      return window.OnyxMoodRenderers.renderToContext(ctx,{...options,state:mood});
    }
  };
  window.OnyxSnuggly=Object.freeze(api);
  window['onyx_snuggly']=window.OnyxSnuggly;
})();
