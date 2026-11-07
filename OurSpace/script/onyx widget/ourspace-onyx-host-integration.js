/* OurSpace's single Onyx host: one lazy iframe, one canonical JSON tree, one Household task bridge.
   This file does NOT embed or reimplement the widget, game, worksheets or Apps Script backend. */
(()=>{'use strict';
 const html=document.documentElement;
 const profile=String(html.dataset.profile||'').toLowerCase();
 if(!['william','jasper'].includes(profile)||new URLSearchParams(location.search).get('public')==='1')return;
 const page=String(html.dataset.ourspaceCurrentPage||'profile');
 if(page==='skills'){const f=document.getElementById('osSkillsWorkbookFrame');if(f){const target=new URL(f.dataset.skillsSrc,document.baseURI);f.src=target.href;}}
 const KEY='ourspace.onyx.professor.tasks.v1.'+profile;
 const pairPattern=/^[a-z0-9-]{4,100}$/;
 const bookHref=(id,view)=>{
  const url=new URL('skills.html',new URL('../../assets/code/',document.baseURI));
  url.searchParams.set('onyxProfile',profile);
  url.hash='read='+encodeURIComponent(id)+'&view='+(view==='worksheets'?'worksheets':'handouts');
  return url.href;
 };
 const read=()=>{try{const rows=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(rows)?rows.filter(row=>row?.profile===profile&&pairPattern.test(String(row.pairId||''))):[]}catch(_){return []}};
 const notify=(pairId)=>{
  document.dispatchEvent(new CustomEvent('ourspace:onyx-task-saved',{detail:{profile,pairId}}));
  window.dispatchEvent(new CustomEvent('ourspace:onyx-task-saved',{detail:{profile,pairId}}));
 };
 async function addTask(task={},pair={}){
  if(window.OurSpaceAuth?.authorize&&!window.OurSpaceAuth.authorize(profile))return {ok:false,error:'Please sign in first.'};
  if(String(task.profileKey||profile)!==profile||!pairPattern.test(String(pair.id||'')))return {ok:false,error:'Invalid DBT task or account.'};
  const items=read(),already=items.find(row=>row.pairId===pair.id);
  const record={pairId:String(pair.id),profile,title:String(pair.title||task.title||'DBT practice').slice(0,160),
   module:String(pair.module||'DBT').slice(0,100),reason:String(task.description||'Professor Onyx DBT practice').slice(0,250),
   handoutUrl:bookHref(pair.id,'handouts'),worksheetUrl:bookHref(pair.id,'worksheets'),
   createdAt:items.find(row=>row.pairId===pair.id)?.createdAt||new Date().toISOString(),status:'assigned'};
  const next=[record,...items.filter(row=>row.pairId!==pair.id)].slice(0,180);
  try{localStorage.setItem(KEY,JSON.stringify(next))}catch(err){return {ok:false,error:'Could not save homework on this device.'}};
  notify(record.pairId);
  let synced=false;
  const auth=window.OurSpaceAuth;
  if(!already&&auth?.isAuthenticated?.()&&auth.profile?.()===profile){
   try{
    const response=await auth.request('record.save',{profileKey:profile,bucket:'onyx.homework',key:record.pairId,
     recordId:'onyx_homework_'+profile+'_'+record.pairId+'_'+Date.now().toString(36),
     value:record});
    synced=response?.ok!==false;
   }catch(err){console.warn('Homework was saved locally; optional backend sync failed:',err.message)}
  }
  return {ok:true,local:true,synced,record};
 }
 window.OurSpaceHouseholdTasks={addTask,list:read};
 async function pullHomeworkFromBackend(){
  const auth=window.OurSpaceAuth;
  if(!auth?.isAuthenticated?.()||auth.profile?.()!==profile)return;
  try{
   const response=await auth.request('record.list',{bucket:'onyx.homework',profileKey:profile});
   if(!Array.isArray(response?.records))return;
   const existing=read(),seen=new Set(existing.map(x=>x.pairId));let additions=0;
   for(const row of response.records){
    const raw=row?.Json??row?.json??row?.value;
    let value=raw;
    if(typeof raw==='string'){try{value=JSON.parse(raw)}catch(_){continue}}
    if(!value||value.profile!==profile||!pairPattern.test(String(value.pairId||''))||seen.has(value.pairId))continue;
    const id=String(value.pairId);seen.add(id);
    existing.push({pairId:id,profile,title:String(value.title||'DBT practice').slice(0,160),module:String(value.module||'DBT').slice(0,100),
     reason:String(value.reason||'Professor Onyx practice').slice(0,250),
     handoutUrl:bookHref(id,'handouts'),worksheetUrl:bookHref(id,'worksheets'),
     createdAt:value.createdAt||new Date().toISOString(),status:'assigned'});additions++;
   }
   if(additions){localStorage.setItem(KEY,JSON.stringify(existing.slice(-180)));notify('backend-sync')}
  }catch(err){console.warn('Onyx homework backend recovery is optional:',err.message)}
 }
 // Do not fetch data for another account, a public visitor, or the #admin preview.
 void pullHomeworkFromBackend();
 // When in-page UI or widget is on a different frame, only accept same-origin, same-profile instructions.
 window.addEventListener('message',async event=>{
  if(event.origin!==location.origin)return;
  const data=event.data;
  if(!data||typeof data!=='object'||data.profile!==profile)return;
  if(data.type==='ourspace:onyx-homework-add'){
   const result=await addTask(data.task,data.pair);
   event.source?.postMessage({type:'ourspace:onyx-homework-result',requestId:data.requestId,result},event.origin);
  }
 });
 // A single embedded widget frame. No site-wide replacement of the page logo or existing Design Studio.
 const frame=document.createElement('iframe');
 frame.id='ourspaceOnyxIntegrationFrame';frame.title='Onyx Widget';frame.dataset.ourspaceOnyxWidget='';
 frame.dataset.onyxPage=page;frame.className='os-onyx-embedded-frame os-onyx-layout-bubble';
 frame.hidden=true;frame.setAttribute('aria-hidden','true');
 frame.setAttribute('allow','microphone; clipboard-read; clipboard-write; fullscreen; autoplay');
 const src=new URL('onyx_widget.html',new URL('../../assets/code/',document.baseURI));
 src.searchParams.set('profile',profile);src.searchParams.set('embedded','1');
 let started=false;
 const show=()=>{frame.hidden=false;frame.setAttribute('aria-hidden','false');if(!started){started=true;frame.src=src.href;}};
 const hide=()=>{frame.hidden=true;frame.setAttribute('aria-hidden','true');};
 const mode=(name)=>{
  frame.classList.remove('os-onyx-layout-bubble','os-onyx-layout-panel','os-onyx-layout-fullscreen');
  frame.classList.add('os-onyx-layout-'+(name==='fullscreen'?'fullscreen':name==='panel'?'panel':'bubble'));
 };

 // A clipped, full-viewport iframe makes both the bubble and the open panel
 // freely movable while leaving clicks outside their rectangles on OurSpace.
 const shape=rect=>{
  if(!rect||![rect.x,rect.y,rect.w,rect.h].every(Number.isFinite)||rect.w<=0||rect.h<=0)return '';
  const left=Math.max(0,Math.floor(rect.x)-8),top=Math.max(0,Math.floor(rect.y)-8);
  const right=Math.min(window.innerWidth,Math.ceil(rect.x+rect.w)+8);
  const bottom=Math.min(window.innerHeight,Math.ceil(rect.y+rect.h)+8);
  return right>left&&bottom>top?`M ${left} ${top} H ${right} V ${bottom} H ${left} Z`:'';
 };
 const applyGeometry=data=>{
  const shapes=data.mode==='fullscreen'?[]:[shape(data.bubble),data.mode==='panel'?shape(data.panel):''].filter(Boolean);
  const clip=data.mode==='fullscreen'?'none':shapes.length?`path("${shapes.join(' ')}")`:'inset(0 100% 100% 0)';
  frame.style.clipPath=clip;frame.style.webkitClipPath=clip;
 };
 document.body.append(frame);
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==frame.contentWindow)return;
  const d=event.data;if(!d||d.profile!==profile)return;
  if(d.type==='ourspace:onyx-frame-layout')mode(d.mode);
  if(d.type==='ourspace:onyx-frame-geometry'){mode(d.mode);applyGeometry(d);}
  if(d.type==='ourspace:onyx-design-toggle'){
   const hook=window.OurSpaceDesignJumpHook;
   if(typeof d.visible==='boolean'&&hook){
    if(d.visible&&typeof hook.show==='function')hook.show();
    else if(!d.visible&&typeof hook.hide==='function')hook.hide();
    else hook.toggle?.();
   }else if(hook?.toggle)hook.toggle();
   else if(window.OurSpaceDesignWidget?.open)window.OurSpaceDesignWidget.open();
   // Keep the host editor in front of the widget, but never hide the widget itself.
   const studio=document.getElementById('designWidget');
   if(studio){studio.style.setProperty('z-index','2147483647','important')}
  }
 });
 if(window.OurSpaceOnyxJumpHook?.registerAdapter){
  window.OurSpaceOnyxJumpHook.registerAdapter({show,hide,isVisible:()=>!frame.hidden});
  // Refresh without reviving a legacy widget or changing the stored visibility preference.
  window.OurSpaceOnyxJumpHook.refresh?.();
 }
 window.OurSpaceIntegratedOnyx=Object.freeze({frame,show:()=>window.OurSpaceOnyxJumpHook?.show?.()||show(),hide:()=>window.OurSpaceOnyxJumpHook?.hide?.()||hide(),readHomework:read,addHomework:addTask,skillsUrl:(id,view)=>id?bookHref(id,view):new URL('skills.html',new URL('../../assets/code/',document.baseURI)).href});
 document.dispatchEvent(new CustomEvent('ourspace:onyx-widget-ready',{detail:{profileKey:profile,page}}));
})();
