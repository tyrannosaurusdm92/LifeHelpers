/* Portal-era chest-up Sleepy module avatar compatibility adapter.
 * Scope: widget/module #onyxCanvas only. Game actors use separate renderers.
 */
(()=>{
  'use strict';
  const mood='sleepy';
  const api={
    version:'portal-chest-up-v1',
    mood,
    fallback:'https://raw.githubusercontent.com/tyrannosaurusdm92/LifeHelpers/main/OurSpace/assets/images/shared/legacy-static/onyx_sleepy.png',
    render(target,options={}){
      if(!window.OnyxMoodRenderers?.renderCanvas) throw new Error('OnyxMoodRenderers unavailable');
      return window.OnyxMoodRenderers.renderCanvas(mood,{...options,target});
    },
    renderToContext(ctx,options={}){
      if(!window.OnyxMoodRenderers?.renderToContext) return false;
      return window.OnyxMoodRenderers.renderToContext(ctx,{...options,state:mood});
    }
  };
  window.OnyxSleepy=Object.freeze(api);
  window['onyx_sleepy']=window.OnyxSleepy;
})();
