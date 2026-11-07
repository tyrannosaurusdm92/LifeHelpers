/* Account-scoped quill designer synchronization using the existing OurSpace backend.
   Do not invent profile.design.* actions: the supplied V1 backend uses preference.*. */
(()=>{'use strict';
 const auth=window.OurSpaceAuth,ctx=window.OurSpaceDesignContext;
 if(!ctx||!auth?.isAuthenticated?.()||auth.profile()!==ctx.account||auth.isAdmin?.())return;
 let restoring=true,dirty=false,pending=null,revision=0;
 const show=(msg)=>{const el=document.querySelector('#designerStatus');if(el)el.textContent=msg};
 const actionData=page=>({profileKey:ctx.account,scope:'design',key:'page-'+page});
 async function publishProfileAppearance(){
   // The owner explicitly publishes their profile appearance. No account data,
   // conversation state, local-storage keys or private module records are copied.
   if(ctx.page!=='profile'||auth.isAdmin?.())return;
   const css=window.OurSpaceDesignWidget?.getCSS?.();
   if(typeof css!=='string')return;
   if(css.length>40000){show('Design saved, but the public appearance exceeds the safe publishing size.');return;}
   const theme={schema:'ourspace.native-profile.css.v1',css,updatedAt:new Date().toISOString()};
   await auth.request('public.profile.save',{profileKey:ctx.account,theme});
 }
 async function send(page,state){
   if(!state)return;
   try{
     await auth.request('preference.set',{...actionData(page),value:{schema:'ourspace.page-design.v1',state,revision:++revision}});
     // Public profile data remains a separate, explicitly published record.
     // Only its style snapshot is changed; no private profile fields are sent.
     if(page==='profile'&&ctx.page==='profile')await publishProfileAppearance();
     show('Design synced with account'+(page==='profile'?' and published profile appearance':'')+' · '+page);
   }catch(error){show('Design saved locally; public/account sync unavailable. Export for backup.');}
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
     if(state&&!dirty&&window.OurSpaceDesignWidget?.loadState){
       window.OurSpaceDesignWidget.loadState(state);
       if(ctx.page==='profile')await publishProfileAppearance();
     }
   }catch(_){show('Offline designer · changes remain local until connection returns.');}
   finally{restoring=false;}
 })();
})();

