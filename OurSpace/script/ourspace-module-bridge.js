/* The ONLY cross-module interface: Professor Onyx chat -> household tasks, and document hyperlinks.
   No tabs, navigation, iframes, server credentials, medical transcripts, or worksheet answers. */
(()=>{'use strict';
 const PREFIX='ourspace.onyx.professor.tasks.v1.';
 const isProfile=s=>/^(william|jasper)$/.test(String(s||''));
 const activeProfile=()=>{const p=window.OnyxTester?.publicStatus?.().selectedProfile||window.OurSpaceBackend?.profile?.()||document.documentElement.dataset.profile||'william';return isProfile(p)?p:'william'};
 const safePair=p=>p&&typeof p==='object'&&/^[a-z0-9-]{4,100}$/.test(String(p.id||''))&&/^(?:skills\/assets\/code\/dbt\/|DBT\/)[a-z0-9_-]+\.html$/i.test(String(p.path||''));
 function resourceUrl(pair,view='worksheets',profile=activeProfile()){
  if(!safePair(pair))return '';const base=new URL('./',document.baseURI);const u=new URL(pair.path.replace(/^skills\/assets\/code\/dbt\//,'DBT/'),base);if(isProfile(profile))u.searchParams.set('onyxProfile',profile);u.hash=view==='handouts'?'handouts':'worksheets';return u.href;
 }
 function list(profile=activeProfile()){
  if(!isProfile(profile))return [];try{const x=JSON.parse(localStorage.getItem(PREFIX+profile)||'[]');return Array.isArray(x)?x.filter(p=>p&&p.profile===profile&&/^[a-z0-9-]{4,100}$/.test(p.pairId)):[];}catch(_){return []}
 }
 function saveAssignment(pair,{profile=activeProfile(),reason='Professor Onyx DBT assignment'}={}){
  if(!safePair(pair)||!isProfile(profile))return {ok:false,error:'Invalid DBT resource or profile'};
  const handoutUrl=resourceUrl(pair,'handouts',profile),worksheetUrl=resourceUrl(pair,'worksheets',profile);
  const record={pairId:pair.id,profile,title:String(pair.title||'DBT Practice').slice(0,160),module:String(pair.module||'DBT').slice(0,100),reason:String(reason||'DBT practice').slice(0,180),handoutUrl,worksheetUrl,createdAt:new Date().toISOString()};
  try{const rows=list(profile).filter(item=>item.pairId!==record.pairId);rows.unshift(record);localStorage.setItem(PREFIX+profile,JSON.stringify(rows.slice(0,180)));window.dispatchEvent(new CustomEvent('ourspace:onyx-task-saved',{detail:{profile,pairId:record.pairId}}));return {ok:true,record};}
  catch(_){return {ok:false,error:'Local storage is unavailable. Try opening Household from its own page.'}}
 }

 const TASK_BUCKET='onyx.homework';
 async function syncRecordToBackend(record){
  const backend=window.OurSpaceBackend;
  if(window.OnyxTester?.active?.()||!backend?.request||!backend?.isAuthenticated?.()||backend.profile?.()!==record.profile)return false;
  const result=await backend.request('record.save',{profileKey:record.profile,bucket:TASK_BUCKET,key:record.pairId,
   recordId:'onyx_hw_'+record.profile+'_'+record.pairId+'_'+Date.now().toString(36),
   value:{pairId:record.pairId,title:record.title,module:record.module,reason:record.reason,createdAt:record.createdAt}});
  return result?.ok!==false;
 }
 let lastSync=0,syncPending=null;
 async function syncFromBackend({force=false}={}){
  const profile=activeProfile(),backend=window.OurSpaceBackend;
  if(!isProfile(profile)||window.OnyxTester?.active?.()||!backend?.request||!backend?.isAuthenticated?.()||backend.profile?.()!==profile)return false;
  if(syncPending)return syncPending;
  if(!force&&Date.now()-lastSync<180000)return false;
  syncPending=(async()=>{
   const result=await backend.request('record.list',{bucket:TASK_BUCKET});
   if(result?.ok===false||!Array.isArray(result.records))return false;
   const pairs=new Map((window.OnyxDBTAssignments?.pairings?.()||[]).map(p=>[p.id,p]));
   const known=new Set(list(profile).map(p=>p.pairId));let saved=0;
   for(const row of result.records){
    let data=row.json??row.Json??row.value??row.Value;
    if(typeof data==='string'){try{data=JSON.parse(data)}catch(_){continue}}
    if(!data||typeof data!=='object')continue;
    const pair=pairs.get(data.pairId);if(!safePair(pair)||known.has(pair.id))continue;
    const r=saveAssignment(pair,{profile,reason:data.reason||'Professor Onyx homework'});
    if(r.ok){known.add(pair.id);saved++}
   }
   lastSync=Date.now();return saved>0;
  })().catch(()=>false).finally(()=>{syncPending=null});
  return syncPending;
 }
 function attachSaveButton(card,pair,profile=activeProfile(),reason='DBT practice'){
  if(!safePair(pair))return null;const b=document.createElement('button');b.type='button';b.className='onyx-save-to-tasks';b.textContent='Add to tasks';b.addEventListener('click',async()=>{if(window.OnyxTester?.active?.()){b.textContent='Unavailable in read-only tester mode';return;}b.disabled=true;b.textContent='Saving…';const r=saveAssignment(pair,{profile,reason});if(!r.ok){b.textContent=r.error;b.disabled=false;return;}try{const synced=await syncRecordToBackend(r.record);b.textContent=synced?'Added to Household tasks':'Added locally · account sync pending';}catch(_){b.textContent='Added locally · account sync pending';}});card.append(b);return b;
 }
 function createAssignmentCard(pair,profile=activeProfile(),reason='DBT practice'){
  if(!safePair(pair))return null;const card=document.createElement('aside');card.className='onyx-dbt-chat-card onyx-professor-resource';
  const heading=document.createElement('strong');heading.textContent='📚 Professor Onyx assigned: '+String(pair.title||'DBT practice');card.append(heading);
  const copy=document.createElement('p');copy.textContent=String(reason||'DBT practice').slice(0,180);card.append(copy);
  for(const [label,view] of [['Read handout','handouts'],['Open editable worksheet','worksheets']]){const a=document.createElement('a');a.href=resourceUrl(pair,view,profile);a.target='_blank';a.rel='noopener noreferrer';a.textContent=label;card.append(a);}
  attachSaveButton(card,pair,profile,reason);return card;
 }
 window.OurSpaceModuleBridge=Object.freeze({list,saveAssignment,syncFromBackend,resourceUrl,createAssignmentCard,attachSaveButton,activeProfile});
 function refresh(){void syncFromBackend();}
 window.addEventListener('focus',refresh);window.addEventListener('onyx:profile-change',()=>{lastSync=0;refresh()});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
 setTimeout(refresh,2800);
})();
