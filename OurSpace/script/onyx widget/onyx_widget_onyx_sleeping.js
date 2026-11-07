/* Combined Sleepy + Snuggly widget state (game actors are independent). */
(()=>{
  'use strict';
  const mood='sleeping';
  const api=Object.freeze({
    version:'resting-state-v2',mood,
    fallback:'assets/images/onyx widget/onyx_widget_onyx_sleeping.png',
    render(target,options={}){
      if(!window.OnyxMoodRenderers?.renderCanvas) throw new Error('OnyxMoodRenderers unavailable');
      return window.OnyxMoodRenderers.renderCanvas(mood,{...options,target});
    },
    renderToContext(ctx,options={}){
      if(!window.OnyxMoodRenderers?.renderToContext) return false;
      return window.OnyxMoodRenderers.renderToContext(ctx,{...options,state:mood});
    }
  });
  window.OnyxSleeping=api;
  window.onyx_sleeping=api;
  // Compatibility for cached scripts. These are aliases, NOT additional mood states/assets.
  window.OnyxSleepy=api;window.OnyxSnuggly=api;
  window.onyx_sleepy=api;window.onyx_snuggly=api;
})();
