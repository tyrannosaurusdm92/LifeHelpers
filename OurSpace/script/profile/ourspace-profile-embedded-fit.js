/* OurSpace embedded artwork fit: visual scale only; never modifies grid geometry.
   The native Bulletin workspace remains scrollable by its existing heart track. */
(()=>{'use strict';
const params=new URLSearchParams(location.search);
if(params.get('public')==='1'||(params.get('page')||'profile')!=='profile')return;
const $=id=>document.getElementById(id);
let pending=0,recordNaturalHeight=0;
function fit(){
 pending=0;
 const bulletin=$('profile-bulletins'),board=$('bulletinBoardFlow'),boardShell=$('bulletinBoardModule'),bbBody=bulletin?.querySelector('.bb-body');
 if(bulletin&&board&&boardShell&&bbBody){
  if(bulletin.classList.contains('is-collapsed')){bbBody.style.height='0px';boardShell.style.height='0px'}
  else{
   const head=bulletin.querySelector(':scope > .box-head');
   const availableHeight=Math.max(1,bulletin.clientHeight-(head?.offsetHeight||0)-4);
   const availableWidth=Math.max(1,bulletin.clientWidth-4);
   // Preserve the artwork's original 1180px width, but let its workspace
   // grow vertically to fill this already-sized module (no white dead zone).
   // Only the inner pinboard viewport/heart track gains vertical room.
   const scale=Math.max(.01,Math.min(availableWidth/1180,availableHeight/790));
   const innerHeight=Math.max(790,availableHeight/scale);
   board.style.setProperty('--os-bb-inner-height',innerHeight+'px');
   bbBody.style.setProperty('height',availableHeight+'px','important');
   boardShell.style.setProperty('height',availableHeight+'px','important');
   board.style.setProperty('transform','scale('+scale+')','important');
   board.style.setProperty('--bb-visual-scale',String(scale));
  }
 }
 const section=$('profile-music'),flow=$('recordPlayerFlow'),body=section?.querySelector('.rp-body');
 if(section&&flow&&body){
  if(section.classList.contains('is-collapsed'))body.style.height='0px';
  else{
   const head=section.querySelector(':scope > .box-head');
   const availableHeight=Math.max(1,section.clientHeight-(head?.offsetHeight||0)-4);
   const availableWidth=Math.max(1,section.clientWidth-4);
   // The CSS's 980px working canvas is measured before applying its transform.
   // Recalculate after expanding music details so neither scrollbar is needed.
   const natural=Math.max(1,flow.scrollHeight,flow.offsetHeight);
   recordNaturalHeight=natural;
   const scale=Math.max(.01,Math.min(availableWidth/980,availableHeight/natural));
   body.style.setProperty('height',availableHeight+'px','important');
   flow.style.setProperty('transform','scale('+scale+')','important');
   flow.style.setProperty('--rp-visual-scale',String(scale));
  }
 }
}
function refresh(){if(pending)return;pending=requestAnimationFrame(fit)}
function init(){
 const bulletin=$('profile-bulletins'),record=$('profile-music');
 if(!bulletin||!record)return;
 bulletin.classList.add('os-embedded-fit');record.classList.add('os-embedded-fit');
 refresh();
 if('ResizeObserver' in window){const observer=new ResizeObserver(refresh);
  for(const el of [bulletin,record,bulletin.querySelector(':scope > .box-head'),record.querySelector(':scope > .box-head')])if(el)observer.observe(el);
 }
 const details=record.querySelector('.rp-track-links');details?.addEventListener('toggle',refresh);
 // Dynamic playlist entries do not change the saved frame size.
 if('MutationObserver' in window){
  const music=$('musicList');if(music)new MutationObserver(refresh).observe(music,{childList:true,subtree:true});
  for(const section of [bulletin,record])new MutationObserver(refresh).observe(section,{attributes:true,attributeFilter:['class']});
 }
 window.addEventListener('resize',refresh);
 document.fonts?.ready?.then(refresh).catch(()=>{});
 window.OurSpaceEmbeddedProfileFit={refresh,get:()=>({recordNaturalHeight,bulletin:{width:bulletin.clientWidth,height:bulletin.clientHeight},record:{width:record.clientWidth,height:record.clientHeight}})};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
