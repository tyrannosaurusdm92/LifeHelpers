/* Save only DBT assignment metadata in the existing OurSpace Household import
 * format. The Household page turns these records into on-demand tasks. */
(()=>{'use strict';
 if(window.OurSpaceModuleBridge?.saveAssignment)return;
 const PREFIX='ourspace.onyx.professor.tasks.v1.',BUCKET='onyx.homework';
 const validProfile=p=>p==='william'||p==='jasper';
 const validPair=p=>p&&/^[a-z0-9-]{4,100}$/.test(String(p.id||''));
 function list(profile){if(!validProfile(profile))return [];
  try{const records=JSON.parse(localStorage.getItem(PREFIX+profile)||'[]');
   return Array.isArray(records)?records.filter(x=>x?.profile===profile&&/^[a-z0-9-]{4,100}$/.test(x.pairId)):[]}
  catch(_){return []}
 }
 function resourceUrl(pair,view,profile){const url=new URL('assets/code/skills.html',document.baseURI);
  url.searchParams.set('onyxProfile',profile);url.hash='read='+encodeURIComponent(pair.id)+'&view='+(view==='worksheets'?'worksheets':'handouts');return url.href}
 function backend(){try{
  if(window.OurSpaceBackend?.request)return window.OurSpaceBackend;
  if(window.parent!==window&&window.parent.OurSpaceBackend?.request)return window.parent.OurSpaceBackend;
 }catch(_){}return null}
 async function saveAssignment(pair,{profile,reason='Professor Onyx DBT practice'}={}){
  if(!validPair(pair)||!validProfile(profile))return {ok:false,error:'Choose a profile and valid DBT resource.'};
  if(window.OnyxTester?.active?.())return {ok:false,error:'Task editing is disabled in tester mode.'};
  const record={pairId:pair.id,profile,title:String(pair.title||'DBT practice').slice(0,160),
   module:String(pair.module||'DBT').slice(0,100),reason:String(reason).slice(0,180),
   handoutUrl:resourceUrl(pair,'handouts',profile),worksheetUrl:resourceUrl(pair,'worksheets',profile),
   createdAt:new Date().toISOString()};
  try{const existing=list(profile).filter(x=>x.pairId!==pair.id);
   existing.unshift(record);localStorage.setItem(PREFIX+profile,JSON.stringify(existing.slice(0,180)));
   window.dispatchEvent(new CustomEvent('ourspace:onyx-task-saved',{detail:{profile,pairId:pair.id}}));
   try{if(window.parent!==window)window.parent.dispatchEvent(new CustomEvent('ourspace:onyx-task-saved',{detail:{profile,pairId:pair.id}}))}catch(_){}
  }catch(_){return {ok:false,error:'Unable to save this Household task on this device.'}}
  const api=backend();let synced=false;
  if(api?.isAuthenticated?.()&&api.profile?.()===profile){try{
   const result=await api.request('record.save',{profileKey:profile,bucket:BUCKET,key:pair.id,
    recordId:'onyx_homework_'+profile+'_'+pair.id+'_'+Date.now().toString(36),
    value:{pairId:pair.id,title:record.title,module:record.module,reason:record.reason,createdAt:record.createdAt}});
   synced=result?.ok!==false;
  }catch(_){/* The local task remains available for Household to import. */}}
  return {ok:true,record,synced,local:true};
 }
 window.OurSpaceModuleBridge=Object.freeze({list,saveAssignment,resourceUrl});
})();
