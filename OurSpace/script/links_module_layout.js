/* Frozen Links Module layout from the supplied links_module.json; no admin editing. */
(()=>{'use strict';
const params=new URLSearchParams(location.search);if((params.get('page')||'profile')!=='profile'||params.get('public')==='1')return;
const section=document.getElementById('profile-links'),flow=section?.querySelector('#linksModuleFlow'),body=section?.querySelector('.lm-body'),module=section?.querySelector('#linksModuleShell');
if(!section||!flow||!body||!module)return;
const who=document.documentElement.dataset.profile,app=document.getElementById('profileApp');
const cols={main:app?.querySelector('.profile-main'),sidebar:app?.querySelector('.profile-sidebar')};
const SAVED={"schema":"ourspace.links-module-placement.v1","version":1,"generatedAt":"2026-10-31T16:49:19.058Z","moduleId":"links_module","profiles":{"william":{"column":"main","index":2,"afterId":"profile-about","beforeId":"profile-posts","widthPx":617,"heightPx":399,"horizontalOffsetPx":0,"verticalGapPx":0,"sizingMode":"proportional-content","scaleFactor":0.71268,"referenceWidthPx":860,"referenceHeightPx":525,"unscaledContentHeightPx":434,"measured":{"leftPx":0,"topPx":160,"pageLeftPx":817,"pageTopPx":369},"viewport":{"widthPx":1920,"heightPx":911}},"jasper":null},"notes":"The entire links_module scales proportionally within one normal-flow profile section. Save on william.html in #admin. Reimport this JSON with the package to establish permanent defaults."};
const cfg=SAVED.profiles?.[who],BASE=860,MIN=145;
const num=(n,otherwise=0)=>Number.isFinite(Number(n))?Number(n):otherwise;
const px=n=>(Math.round(n*100)/100)+'px';
let scale=1,requestedWidth=num(cfg?.widthPx)||null;
function redraw(){if(section.classList.contains('is-collapsed'))return;const unscaled=Math.max(75,flow.scrollHeight||flow.offsetHeight||434);const savedMin=cfg?.heightPx?cfg.heightPx*(section.getBoundingClientRect().width/cfg.widthPx):0;const header=section.querySelector('.box-head')?.offsetHeight||24;
 const size=Math.max(unscaled*scale,savedMin-header);body.style.height=px(size);module.style.height=px(size);}
function size(){const max=section.parentElement?.clientWidth||MIN;const width=Math.max(Math.min(MIN,max),Math.min(max,requestedWidth||max));section.style.width=px(width);section.style.maxWidth='100%';section.style.marginLeft=px(Math.min(Math.max(0,num(cfg?.horizontalOffsetPx)),Math.max(0,max-width)));section.style.marginTop=px(Math.max(0,num(cfg?.verticalGapPx)));section.style.height='';
 scale=Math.max(.05,(width-4)/BASE);flow.style.setProperty('--lm-visual-scale',String(scale));flow.style.transform='scale('+scale+')';redraw();}
function place(){if(cfg&&cols[cfg.column]){const parent=cols[cfg.column],after=cfg.afterId&&document.getElementById(cfg.afterId),before=cfg.beforeId&&document.getElementById(cfg.beforeId);if(before?.parentElement===parent)parent.insertBefore(section,before);else if(after?.parentElement===parent)parent.insertBefore(section,after.nextElementSibling);else parent.append(section)}size()}
place();if('ResizeObserver'in window)new ResizeObserver(redraw).observe(flow);window.addEventListener('resize',size);section.addEventListener('click',e=>{if(e.target.closest('[data-collapse]'))requestAnimationFrame(redraw)});
window.OurSpaceLinksLayout={get:()=>({editing:false,placement:cfg}),refresh:redraw,isAdmin:false};
})();