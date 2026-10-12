/* Portal-era chest-up Thoughtful module avatar compatibility adapter.
 * Scope: widget/module #onyxCanvas only. Game actors use separate renderers.
 */
(()=>{
  'use strict';
  const mood='thoughtful';
  const api={
    version:'portal-chest-up-v1',
    mood,
    fallback:'https://raw.githubusercontent.com/tyrannosaurusdm92/LifeHelpers/main/OurSpace/assets/images/shared/legacy-static/onyx_thoughtful.png',
    render(target,options={}){
      if(!window.OnyxMoodRenderers?.renderCanvas) throw new Error('OnyxMoodRenderers unavailable');
      return window.OnyxMoodRenderers.renderCanvas(mood,{...options,target});
    },
    renderToContext(ctx,options={}){
      if(!window.OnyxMoodRenderers?.renderToContext) return false;
      return window.OnyxMoodRenderers.renderToContext(ctx,{...options,state:mood});
    }
  };
  window.OnyxThoughtful=Object.freeze(api);
  window['onyx_thoughtful']=window.OnyxThoughtful;
})();
