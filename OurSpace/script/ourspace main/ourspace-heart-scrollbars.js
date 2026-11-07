/* Four true, draggable and keyboard-accessible heart scrollbars; no Diary cards or Messenger sidebar. */
(()=>{'use strict';
 const contexts=[
  {kind:'audio',find:()=>document.querySelector('[data-ourspace-page="audio"] .osm-list[aria-label="Playlists"]'),small:true},
  {kind:'communication',find:()=>document.querySelector('[data-ourspace-page="communication"] #oscom-thread')},
  {kind:'household',find:()=>document.querySelector('[data-ourspace-page="household"] #householdMain .task-list')||document.querySelector('[data-ourspace-page="household"] #householdMain .ledger')},
  {kind:'feed',find:()=>document.querySelector('[data-ourspace-page="feed"] .feed-stream[data-feed-stream]')}
 ];
 const instances=new Map();const svg='<svg aria-hidden="true" viewBox="0 0 48 48"><path d="M24 43 C20.2 39.8 5 29.8 5 17.3 C5 10.1 10.3 5 16.6 5 C20.1 5 22.6 6.8 24 9.1 C25.4 6.8 27.9 5 31.4 5 C37.7 5 43 10.1 43 17.3 C43 29.8 27.8 39.8 24 43Z"/></svg>';
 const ownsPage=kind=>(new URLSearchParams(location.search).get('page')||'profile')===kind;
 function setup(conf,node){const parent=node.parentElement;if(!parent)return;
  node.classList.add('os-heart-target');
  const track=document.createElement('div');track.className='os-heart-track'+(conf.small?' os-heart-small':'');
  track.setAttribute('role','scrollbar');track.tabIndex=0;track.setAttribute('aria-label',conf.kind+' vertical heart scrollbar');
  track.setAttribute('aria-orientation','vertical');track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');
  const fill=document.createElement('div');fill.className='os-heart-fill';
  const handle=document.createElement('div');handle.className='os-heart-handle';handle.innerHTML=svg;track.append(fill,handle);
  parent.style.position='relative';parent.classList.add('os-heart-holder');parent.append(track);
  let dragging=null;
  function update(){if(!track.isConnected)return;
   const max=Math.max(0,node.scrollHeight-node.clientHeight),pct=max?node.scrollTop/max:0;
   track.setAttribute('aria-valuenow',String(Math.round(pct*100)));track.setAttribute('aria-disabled',String(max===0));
   handle.style.top=`calc(${Math.round(pct*100)}% - ${Math.round(pct*100)*.01*18}px)`;
   fill.style.height=Math.round(pct*100)+'%';track.hidden=!max;
  }
  function dragTo(y){const r=track.getBoundingClientRect();const f=Math.min(1,Math.max(0,(y-r.top-9)/Math.max(1,r.height-18)));node.scrollTop=f*(node.scrollHeight-node.clientHeight)}
  track.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();dragging=e.pointerId;track.setPointerCapture(e.pointerId);dragTo(e.clientY)});
  track.addEventListener('pointermove',e=>{if(dragging===e.pointerId)dragTo(e.clientY)});
  const finish=e=>{if(dragging===e.pointerId){dragging=null;try{track.releasePointerCapture(e.pointerId)}catch(_){}}};track.addEventListener('pointerup',finish);track.addEventListener('pointercancel',finish);
  track.addEventListener('keydown',e=>{const delta={'ArrowDown':44,'ArrowUp':-44,'PageDown':node.clientHeight*.9,'PageUp':-node.clientHeight*.9,Home:-Infinity,End:Infinity}[e.key];if(delta===undefined)return;e.preventDefault();if(delta===Infinity)node.scrollTop=node.scrollHeight;else if(delta===-Infinity)node.scrollTop=0;else node.scrollTop+=delta});
  node.addEventListener('scroll',update,{passive:true});
  const resize=typeof ResizeObserver!=='undefined'?new ResizeObserver(update):null;resize?.observe(node);if(node.firstElementChild)resize?.observe(node.firstElementChild);
  instances.set(conf.kind,{node,track,resize,update});update();
 }
 let timer;
 function refresh(){cancelAnimationFrame(timer);timer=requestAnimationFrame(()=>{for(const conf of contexts){if(!ownsPage(conf.kind))continue;
  const node=conf.find();const previous=instances.get(conf.kind);if(!node||node===previous?.node){previous?.update();continue}
  if(previous){previous.resize?.disconnect();previous.track.remove();instances.delete(conf.kind)}setup(conf,node);
 }})}
 const obs=new MutationObserver(refresh);
 const start=()=>{obs.observe(document.getElementById('ourspacePageArea')||document.body,{subtree:true,childList:true});refresh()};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
 window.addEventListener('resize',refresh);window.addEventListener('ourspace:page-changed',refresh);
})();
