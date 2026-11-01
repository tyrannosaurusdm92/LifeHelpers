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
 function attachSaveButton(card,pair,profile=activeProfile(),reason='DBT practice'){
  if(!safePair(pair))return null;const b=document.createElement('button');b.type='button';b.className='onyx-save-to-tasks';b.textContent='Save to Tasks';b.addEventListener('click',()=>{const r=saveAssignment(pair,{profile,reason});b.textContent=r.ok?'Saved to Household Tasks':r.error;b.disabled=!!r.ok;});card.append(b);return b;
 }
 function createAssignmentCard(pair,profile=activeProfile(),reason='DBT practice'){
  if(!safePair(pair))return null;const card=document.createElement('aside');card.className='onyx-dbt-chat-card onyx-professor-resource';
  const heading=document.createElement('strong');heading.textContent='📚 Professor Onyx assigned: '+String(pair.title||'DBT practice');card.append(heading);
  const copy=document.createElement('p');copy.textContent=String(reason||'DBT practice').slice(0,180);card.append(copy);
  for(const [label,view] of [['Read handout','handouts'],['Open editable worksheet','worksheets']]){const a=document.createElement('a');a.href=resourceUrl(pair,view,profile);a.target='_blank';a.rel='noopener noreferrer';a.textContent=label;card.append(a);}
  attachSaveButton(card,pair,profile,reason);return card;
 }
 window.OurSpaceModuleBridge=Object.freeze({list,saveAssignment,resourceUrl,createAssignmentCard,attachSaveButton,activeProfile});
})();
