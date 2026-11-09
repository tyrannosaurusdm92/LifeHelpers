/**
 * Work-only loader for the complete Pass 7 response generator. It lazily imports
 * the maintained ESM source after Voice Library opens, so deployed fixes use the
 * same files that are tested; the integrated page and widget stylesheet remain
 * the only runtime shell.
 */
(() => {
  'use strict';
  let loading = null;
  const open = async () => {
    const dialog = document.getElementById('onyxVoiceDialog');
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    if (!loading) {
      const moduleUrl = new URL('./response-generator/generator-app.js', import.meta.url).href;
      loading = import(moduleUrl).then(() => ({loaded:true,source:'maintained-modules'})).catch(error => {
        loading = null;
        const status = document.getElementById('status') || document.getElementById('onyxVoiceStatus');
        if (status) status.textContent = 'The response generator modules could not load: ' + String(error?.message || error);
        throw error;
      });
    }
    return loading;
  };
  const button = document.getElementById('onyxVoiceOpen');
  button?.addEventListener('click', () => { open().catch(() => {}); });

  // The Work fullscreen tester can verify every account/lane corpus shard
  // without issuing an LLM call or exposing stored tester credentials.
  const auditButton=document.getElementById('audit-100k');
  const auditStatus=document.getElementById('audit-100k-status');
  auditButton?.addEventListener('click',async()=>{
    if(auditButton.disabled)return;
    auditButton.disabled=true;
    if(auditStatus)auditStatus.textContent='Checking all eight voice libraries…';
    try{
      const voice=window.OnyxVoiceContext;
      if(typeof voice?.auditCorpus!=='function')throw new Error('The shared Onyx voice reference loader did not start.');
      const result=await voice.auditCorpus(({profile,lane,count,total})=>{
        if(auditStatus)auditStatus.textContent='Verified '+total.toLocaleString()+
          ' references so far · '+profile+' / '+lane+': '+count.toLocaleString()+'.';
      });
      if(!result.ok||result.total!==100000||result.uniqueIds!==100000)throw new Error('The complete 100,000-example inventory did not validate.');
      if(auditStatus)auditStatus.textContent='Verified all 100,000 unique voice examples: '+
        '50,000 William and 50,000 Jasper, across Work, Leisure, Virtual & Health, and Professor. '+
        'Select any lane above and use your existing authenticated tester code to test Gemini.';
    }catch(error){
      if(auditStatus)auditStatus.textContent='Voice library verification failed: '+String(error?.message||error);
    }finally{
      auditButton.disabled=false;
    }
  });

  window.OnyxResponseWorkshop = Object.freeze({ open });
})();
