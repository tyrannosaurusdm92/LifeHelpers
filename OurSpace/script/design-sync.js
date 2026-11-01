/* Account-scoped quill designer synchronization using the existing OurSpace backend.
   Do not invent profile.design.* actions: the supplied V1 backend uses preference.*. */
(()=>{'use strict';
 const auth=window.OurSpaceAuth,ctx=window.OurSpaceDesignContext;
 if(!ctx||!auth?.isAuthenticated?.()||auth.profile()!==ctx.account)return;
 let restoring=true,dirty=false,pending=null,revision=0;
 const show=(msg)=>{const el=document.querySelector('#designerStatus');if(el)el.textContent=msg};
 const actionData=page=>({profileKey:ctx.account,scope:'design',key:'page-'+page});
 async function send(page,state){
   if(!state)return;
   try{
     await auth.request('preference.set',{...actionData(page),value:{schema:'ourspace.page-design.v1',state,revision:++revision}});
     show('Design synced with account · '+page);
   }catch(error){show('Design saved locally; account sync unavailable. Export for backup.');}
 }
 window.addEventListener('ourspace:design-updated',event=>{
   if(restoring||event.detail?.profile!==ctx.account)return;
   dirty=true;clearTimeout(pending);const {page,state}=event.detail;
   pending=setTimeout(()=>send(page,state),900);
 });
 window.addEventListener('ourspace:design-copy',event=>{
   if(event.detail?.account!==ctx.account)return;
   for(const page of event.detail.destinations||[]){
     try{const state=JSON.parse(localStorage.getItem('ourspace.design.v2.'+ctx.account+'.'+page)||'null');if(state)send(page,state)}catch(_){}
   }
 });
 (async()=>{
   try{
     const result=await auth.request('preference.get',actionData(ctx.page),{timeout:10000});
     const state=result?.value?.state;
     if(state&&!dirty&&window.OurSpaceDesignWidget?.loadState)window.OurSpaceDesignWidget.loadState(state);
   }catch(_){show('Offline designer · changes remain local until connection returns.');}
   finally{restoring=false;}
 })();
})();
