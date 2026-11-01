/* Approved sidebar placement: no admin editor or export controls. */
(()=>{'use strict';const root=document.getElementById('sidebar-messenger-root');if(!root)return;
const who=document.documentElement.dataset.profile==='jasper'?'jasper':'william';
const cfg={"widthPx":170,"heightPx":911,"topPx":0,"rightPx":0,"contentScale":1,"spacingPx":10,"panels":{"quick":{"left":1289,"top":89,"width":453,"height":488},"friends":{"left":1386,"top":117.5,"width":356,"height":465},"today":{"left":1302,"top":323,"width":440,"height":580},"unread":{"left":1302,"top":195.125,"width":440,"height":580},"rooms":{"left":1298,"top":111.21875,"width":440,"height":580}}};
const state={...(who==='william'?cfg:cfg),...(()=>{try{return JSON.parse(localStorage.getItem('ourspace.sidebar-messenger.layout.v1.'+who)||'null')||{}}catch(_){return {}}})()};
const minmax=(x,a,b)=>Math.max(a,Math.min(b,+x||a));
function apply(){const w=minmax(state.widthPx,100,Math.min(440,innerWidth*.57));const h=minmax(state.heightPx,160,Math.max(160,innerHeight));const css=document.documentElement.style;
 css.setProperty('--os-sidebar-width',w+'px');css.setProperty('--os-sidebar-right',minmax(state.rightPx||0,0,innerWidth-w)+'px');css.setProperty('--os-sidebar-top',minmax(state.topPx||0,0,innerHeight-h)+'px');css.setProperty('--os-sidebar-height',h+'px');
 const factor=minmax((w/252*.7+h/Math.max(540,innerHeight)*.3)*minmax(state.contentScale||1,.55,1.7),.55,1.55);
 css.setProperty('--os-sidebar-scale',factor.toFixed(4));css.setProperty('--os-sidebar-gap-size',minmax(state.spacingPx||10,1,28)+'px');
 const rail=root.querySelector('[data-sidebar]');if(rail){rail.style.setProperty('--os-sidebar-scale',factor.toFixed(4));rail.style.setProperty('--os-sidebar-gap-size',minmax(state.spacingPx||10,1,28)+'px');}}
function applyPanels(){const messenger=window.ourspaceMessenger;if(!messenger)return;try{messenger.panelGeometry={...(messenger.panelGeometry||{}),...(state.panels||{})};messenger.configureOpenPanel?.()}catch(_){}}
window.addEventListener('resize',apply);apply();requestAnimationFrame(applyPanels);
window.OurSpaceSidebarLayout={get:()=>({...state}),isAdmin:false,refresh:apply};
})();
