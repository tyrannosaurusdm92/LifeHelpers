/* Approved sidebar placement: no admin editor or export controls. */
(()=>{'use strict';const root=document.getElementById('sidebar-messenger-root');if(!root)return;
const who=document.documentElement.dataset.profile==='jasper'?'jasper':'william';
const cfg={"widthPx":170,"heightPx":911,"topPx":0,"rightPx":0,"contentScale":1,"spacingPx":10,"panels":{"quick":{"left":1289,"top":89,"width":453,"height":488},"friends":{"left":1386,"top":117.5,"width":356,"height":465},"today":{"left":1302,"top":323,"width":440,"height":580},"unread":{"left":1302,"top":195.125,"width":440,"height":580},"rooms":{"left":1298,"top":111.21875,"width":440,"height":580}}};
// Preserve the rail's prior size/spacing, but default its presence to a closed drawer.
const DRAWER_KEY='ourspace.sidebar-messenger.drawer.v1.'+who;
let drawerOpen=(()=>{try{return localStorage.getItem(DRAWER_KEY)==='open'}catch(_){return false}})();
const drawerButton=document.createElement('button');
drawerButton.id='osMessengerDrawerHeart';drawerButton.type='button';drawerButton.className='os-messenger-drawer-heart';
drawerButton.setAttribute('aria-controls','mpMenuScroll');drawerButton.setAttribute('aria-label','Open Messenger drawer');
drawerButton.setAttribute('title','Open Messenger drawer');
// The user-supplied mockup uses ONE heart-shaped scrollbar thumb on a
// full-height yellow/orange track, not a second small orange marker.
const HEART_SVG='<svg class="os-heart-art" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 65" aria-hidden="true"><path fill="#00FFFF" stroke="#083F40" stroke-width="2.2" d="M28 60 C20 53 3 38 3 23 C3 11 10 5 18 5 C23 5 26 9 28 13 C31 8 35 5 41 5 C50 5 54 12 54 23 C54 38 38 52 28 60Z"/><path fill="#FFF600" d="M28 51 C20 43 10 34 10 23 C10 16 14 12 19 12 C23 12 26 17 28 20 C30 16 35 12 40 12 C45 12 48 17 48 23 C48 34 37 44 28 51Z"/></svg>';
drawerButton.innerHTML=HEART_SVG+'<span class="os-heart-alert" aria-hidden="true"></span>';
const siteRail=document.createElement('div');
siteRail.id='osMessengerPageScrollRail';siteRail.setAttribute('role','scrollbar');
siteRail.setAttribute('aria-orientation','vertical');siteRail.setAttribute('aria-label','Scroll the OurSpace page');
siteRail.setAttribute('aria-valuemin','0');siteRail.setAttribute('aria-valuemax','100');
siteRail.tabIndex=0;
const siteFill=document.createElement('span');siteFill.className='os-messenger-page-scroll-fill';siteFill.setAttribute('aria-hidden','true');
siteRail.append(siteFill,drawerButton);root.appendChild(siteRail);
let activePageScroller=null,trackDrag=null,heartDrag=null,suppressHeartClick=false;
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
function scrollRange(el){return el?Math.max(0,el.scrollHeight-el.clientHeight):0}
function visibleElement(el){if(!el||!el.isConnected)return false;const b=el.getBoundingClientRect();return b.width>0&&b.height>0&&getComputedStyle(el).visibility!=='hidden'}
function isScrollable(el){if(!el||!visibleElement(el)||scrollRange(el)<=8)return false;const style=getComputedStyle(el);return /auto|scroll|overlay/.test(style.overflowY)||el===document.scrollingElement}
function choosePageScroller(){
 const full=document.fullscreenElement||document.webkitFullscreenElement;
 if(full){
  const candidates=[full,...full.querySelectorAll('*')].filter(el=>el!==root&&!root.contains(el)&&isScrollable(el));
  if(candidates.length){candidates.sort((a,b)=>scrollRange(b)-scrollRange(a));return candidates[0]}
  if(scrollRange(full)>8)return full;
 }
 const native=document.scrollingElement||document.documentElement;
 const possible=[document.querySelector('#ourspacePageArea'),document.querySelector('.profile-frame'),document.querySelector('#profileApp'),document.querySelector('.page-content')];
 if(scrollRange(native)>8&&getComputedStyle(native).overflowY!=='hidden')return native;
 const candidate=possible.find(isScrollable);return candidate||native;
}
// 25.6% initial placement precisely matches the supplied image's heart at 527/2048.
// The thumb itself carries real page position (0% -> 100% from 25.6% to 74.4%).
const START=.256,TRAVEL=.488;
function thumbFraction(y){const b=siteRail.getBoundingClientRect();return clamp(((y-b.top)/Math.max(1,b.height)-START)/TRAVEL,0,1)}
function refreshSiteRail(){
 activePageScroller=choosePageScroller();
 const extent=scrollRange(activePageScroller);
 const fraction=extent?clamp(activePageScroller.scrollTop/extent,0,1):0;
 siteRail.style.setProperty('--os-rail-heart-position',`${(START+fraction*TRAVEL)*100}%`);
 siteRail.setAttribute('aria-valuenow',String(Math.round(fraction*100)));
 siteRail.setAttribute('aria-valuetext',`${Math.round(fraction*100)}% of page`);
 siteRail.setAttribute('aria-disabled',String(!extent));
}
function siteRailScroll(y){const el=choosePageScroller(),extent=scrollRange(el);if(!extent)return;el.scrollTop=thumbFraction(y)*extent;refreshSiteRail()}
siteRail.addEventListener('pointerdown',e=>{
 if(e.target===drawerButton||drawerButton.contains(e.target)||!drawerOpen)return;
 if(e.button!==0&&e.pointerType!=='touch')return;
 e.preventDefault();trackDrag=e.pointerId;siteRail.setPointerCapture(e.pointerId);siteRailScroll(e.clientY);
});
siteRail.addEventListener('pointermove',e=>{if(trackDrag===e.pointerId)siteRailScroll(e.clientY)});
function trackRelease(e){if(trackDrag!==e.pointerId)return;trackDrag=null;try{siteRail.releasePointerCapture(e.pointerId)}catch(_){}}
siteRail.addEventListener('pointerup',trackRelease);siteRail.addEventListener('pointercancel',trackRelease);
// Click = drawer, drag = scrollbar. The same heart is both controls.
drawerButton.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType!=='touch')return;heartDrag={id:e.pointerId,startY:e.clientY,dragged:false};drawerButton.setPointerCapture(e.pointerId)});
drawerButton.addEventListener('pointermove',e=>{
 if(!heartDrag||heartDrag.id!==e.pointerId)return;
 if(Math.abs(e.clientY-heartDrag.startY)>6)heartDrag.dragged=true;
 if(heartDrag.dragged&&drawerOpen){e.preventDefault();siteRailScroll(e.clientY)}
});
function heartRelease(e){if(!heartDrag||heartDrag.id!==e.pointerId)return;
 suppressHeartClick=heartDrag.dragged&&drawerOpen;heartDrag=null;
 try{drawerButton.releasePointerCapture(e.pointerId)}catch(_){}
}
drawerButton.addEventListener('pointerup',heartRelease);drawerButton.addEventListener('pointercancel',heartRelease);
siteRail.addEventListener('wheel',e=>{if(!drawerOpen)return;const target=choosePageScroller();if(!scrollRange(target))return;e.preventDefault();target.scrollTop+=e.deltaY;refreshSiteRail()},{passive:false});
siteRail.addEventListener('keydown',e=>{
 if(e.target!==siteRail)return;
 const el=choosePageScroller(),amt={'ArrowDown':48,'ArrowUp':-48,'PageDown':el.clientHeight*.85,'PageUp':-el.clientHeight*.85,'Home':-Infinity,'End':Infinity}[e.key];
 if(amt===undefined)return;e.preventDefault();el.scrollTop=amt===Infinity?scrollRange(el):amt===-Infinity?0:el.scrollTop+amt;refreshSiteRail();
});
document.addEventListener('scroll',refreshSiteRail,{capture:true,passive:true});
window.addEventListener('resize',refreshSiteRail,{passive:true});
window.addEventListener('ourspace:page-changed',refreshSiteRail);
function drawerState(save=false){
 root.classList.toggle('os-drawer-open',drawerOpen);
 root.dataset.drawerState=drawerOpen?'open':'closed';
 document.documentElement.classList.toggle('os-messenger-drawer-open',drawerOpen);
 drawerButton.setAttribute('aria-expanded',String(drawerOpen));
 drawerButton.setAttribute('aria-label',drawerOpen?'Close Messenger drawer':'Open Messenger drawer');
 drawerButton.title=drawerOpen?'Close Messenger drawer':'Open Messenger drawer';
 if(save)try{localStorage.setItem(DRAWER_KEY,drawerOpen?'open':'closed')}catch(_){ }
 apply();requestAnimationFrame(refreshSiteRail);
 window.dispatchEvent(new CustomEvent('ourspace:messenger-drawer-state',{detail:{open:drawerOpen}}));
}
drawerButton.addEventListener('click',e=>{if(suppressHeartClick){e.preventDefault();e.stopPropagation();suppressHeartClick=false;return}drawerOpen=!drawerOpen;drawerState(true)});
const state={...(who==='william'?cfg:cfg),...(()=>{try{return JSON.parse(localStorage.getItem('ourspace.sidebar-messenger.layout.v1.'+who)||'null')||{}}catch(_){return {}}})()};
const minmax=(x,a,b)=>Math.max(a,Math.min(b,+x||a));
// Recent alert categories rotate in place without moving the heart or covering the screen.
const alertVisuals={quick:'⚡',chat:'🗨️',room:'🏰',pin:'📌',calendar:'📆',call:'📞'};
const alertSpot=drawerButton.querySelector('.os-heart-alert');
let recentAlerts=[];let alertIndex=0;
function refreshAlertSpot(){
  const list=recentAlerts.filter(x=>Date.now()-x.createdAt<86400000);
  recentAlerts=list;
  if(!list.length){alertSpot.textContent='';drawerButton.setAttribute('data-alerts','0');return;}
  alertSpot.textContent=alertVisuals[list[alertIndex++%list.length].type]||'';
  drawerButton.dataset.alerts=String(list.length);
  drawerButton.title=`${drawerOpen?'Close':'Open'} Messenger drawer · ${list.length} recent alert type${list.length===1?'':'s'}`;
}
function recordAlert(type){
  if(!alertVisuals[type])return;
  recentAlerts=recentAlerts.filter(x=>x.type!==type);
  recentAlerts.unshift({type,createdAt:Date.now()});
  recentAlerts=recentAlerts.slice(0,5);alertIndex=0;refreshAlertSpot();
}
window.addEventListener('ourspace:messenger-alert',e=>recordAlert(e.detail?.type));
for(const [event,type] of [['ourspace:calendar-alert','calendar'],['ourspace:pin-alert','pin'],['ourspace:room-alert','room'],['ourspace:quick-chat-alert','quick']])window.addEventListener(event,()=>recordAlert(type));
window.setInterval(refreshAlertSpot,1750);
window.OurSpaceMessengerAlert={notify:recordAlert,clear:()=>{recentAlerts=[];refreshAlertSpot()},get:()=>recentAlerts.map(x=>({...x}))};
function apply(){
 const vw=Math.max(280,window.innerWidth||document.documentElement.clientWidth);
 const vh=Math.max(300,window.innerHeight||document.documentElement.clientHeight);
 // The 338px-wide reference shows a 246px white drawer plus a 60px yellow rail.
 const w=Math.round(Math.min(246,Math.max(180,vw-78)));
 const css=document.documentElement.style;
 css.setProperty('--os-sidebar-drawer-width',w+'px');
 // The drawer is an overlay; never reserve a game-HUD or page-layout gutter.
 css.setProperty('--os-sidebar-width','0px');
 css.setProperty('--os-sidebar-right','0px');css.setProperty('--os-sidebar-top','0px');
 css.setProperty('--os-sidebar-height',vh+'px');
 css.setProperty('--os-sidebar-scale','1');css.setProperty('--os-sidebar-gap-size','6px');
 const rail=root.querySelector('[data-sidebar]');if(rail){rail.style.setProperty('--os-sidebar-scale','1');rail.style.setProperty('--os-sidebar-gap-size','6px')}
}
function applyPanels(){const messenger=window.ourspaceMessenger;if(!messenger)return;try{messenger.panelGeometry={...(messenger.panelGeometry||{}),...(state.panels||{})};messenger.configureOpenPanel?.()}catch(_){}}
const sourceParent=root.parentNode,sourceNext=root.nextSibling;
// Native fullscreen only paints descendants of the fullscreen element. Keep Jump NAV
// independent, movable and reachable alongside the Messenger heart handle.
const jumpNav=document.getElementById('profileJumpNav');
const jumpParent=jumpNav?.parentNode,jumpNext=jumpNav?.nextSibling;
function keepDrawerVisibleInFullscreen(){
  const full=document.fullscreenElement||document.webkitFullscreenElement;
  if(full){
    if(!full.contains(root))full.appendChild(root);
    if(jumpNav&&!full.contains(jumpNav))full.appendChild(jumpNav);
    if(drawerOpen){drawerOpen=false;drawerState(false)}
  }else if(sourceParent&&root.parentNode!==sourceParent){
    if(sourceNext&&sourceNext.parentNode===sourceParent)sourceParent.insertBefore(root,sourceNext);
    else sourceParent.appendChild(root);
  }
  if(!full&&jumpNav&&jumpParent&&jumpNav.parentNode!==jumpParent){
    if(jumpNext&&jumpNext.parentNode===jumpParent)jumpParent.insertBefore(jumpNav,jumpNext);
    else jumpParent.appendChild(jumpNav);
  }
  apply();
  window.dispatchEvent(new Event('ourspace:messenger-drawer-state'));requestAnimationFrame(refreshSiteRail);
}
document.addEventListener('fullscreenchange',keepDrawerVisibleInFullscreen);
document.addEventListener('webkitfullscreenchange',keepDrawerVisibleInFullscreen);
window.addEventListener('resize',apply);drawerState(false);requestAnimationFrame(applyPanels);
window.OurSpaceSidebarLayout={get:()=>({...state,drawerOpen}),isAdmin:false,refresh:apply,open:()=>{drawerOpen=true;drawerState(true)},close:()=>{drawerOpen=false;drawerState(true)},toggle:()=>{drawerOpen=!drawerOpen;drawerState(true)}};
})();
