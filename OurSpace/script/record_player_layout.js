/* Record player placement is finalized from the user's record-player.json.
   No move, resize, save, export, or admin editor controls are installed. */
(()=>{'use strict';
const params=new URLSearchParams(location.search);
if((params.get('page')||'profile')!=='profile'||params.get('public')==='1')return;
const player=document.getElementById('profile-music'),flow=document.getElementById('recordPlayerFlow'),body=player?.querySelector('.rp-body');
const frame=document.getElementById('profileApp');if(!player||!flow||!body||!frame)return;
const profile=document.documentElement.dataset.profile;
const columns={main:frame.querySelector('.profile-main'),sidebar:frame.querySelector('.profile-sidebar')};
const PRESET={"schema":"ourspace.record-player-placement.v1","version":2,"generatedAt":"2026-10-31T09:48:51.365Z","moduleId":"record_player","profiles":{"william":{"column":"sidebar","index":2,"afterId":"profile-identity","beforeId":"profile-contact","widthPx":327,"heightPx":408,"horizontalOffsetPx":0,"verticalGapPx":0,"sizingMode":"proportional-content","scaleFactor":0.32959,"referenceWidthPx":980,"unscaledContentHeightPx":768,"measured":{"leftPx":0,"topPx":335,"pageLeftPx":472,"pageTopPx":544},"viewport":{"widthPx":1920,"heightPx":911}},"jasper":null},"notes":"Whole player content scales proportionally, without clipping or overlays. widthPx and heightPx are rendered dimensions; sizingMode and scaleFactor retain the exact artwork scale. This module stays in the normal page flow."};
const BASE_WIDTH=980,BORDER=4,MIN_WIDTH=190;
let requestedWidth=null,currentScale=1;
const clamp=(v,low,high)=>Math.max(low,Math.min(v,high));
const number=(v,fallback=0)=>Number.isFinite(Number(v))?Number(v):fallback;
const px=v=>Math.round(v*100)/100+'px';
function height(){if(player.classList.contains('is-collapsed'))return;const full=flow.offsetHeight;if(!full)return;
 // The approved 327×408 export describes the final *section* size, including
 // its expanded-content clearance. Do not shrink the saved section to a bare
 // artwork height when the record's optional track details are closed.
 const saved=PRESET.profiles?.[profile];const requestedHeight=number(saved?.heightPx,0);
 const widthRatio=saved?.widthPx>0?player.getBoundingClientRect().width/saved.widthPx:1;
 const chrome=Math.max(0,player.offsetHeight-body.offsetHeight);
 const minBody=requestedHeight>0?Math.max(0,requestedHeight*widthRatio-chrome):0;
 body.style.height=px(Math.max(full*currentScale,minBody));}
function measure(){const max=Math.max(MIN_WIDTH,player.parentElement?.clientWidth||MIN_WIDTH);const width=clamp(requestedWidth||max,Math.min(MIN_WIDTH,max),max);player.style.width=px(width);player.style.maxWidth='100%';player.style.height='';player.classList.add('rp-scale-enabled');currentScale=Math.max(.01,(width-BORDER)/BASE_WIDTH);flow.style.setProperty('--rp-visual-scale',currentScale);flow.style.transform='scale('+currentScale+')';height();window.dispatchEvent(new Event('ourspace:record-player-resized'))}
function setPlacement(record){if(!record||typeof record!=='object')return;
 const parent=columns[record.column==='sidebar'?'sidebar':'main'];if(!parent)return;
 let before=record.beforeId&&parent.querySelector('#'+CSS.escape(record.beforeId));
 if(!before&&record.afterId){const previous=parent.querySelector('#'+CSS.escape(record.afterId));if(previous)before=previous.nextElementSibling}
 if(!before&&Number.isInteger(record.index)){const siblings=[...parent.children].filter(el=>el!==player&&el.id!=='profileTitle');before=siblings[clamp(record.index,0,siblings.length)]||null}
 parent.insertBefore(player,before||null);
 requestedWidth=number(record.widthPx,0)||null;
 player.style.marginLeft=px(clamp(number(record.horizontalOffsetPx),0,Math.max(0,parent.clientWidth-MIN_WIDTH)));
 player.style.marginTop=px(clamp(number(record.verticalGapPx),0,500));
 measure();
}
// Packaged default: user's exact approved placement, independent of old browser-admin editor state.
setPlacement(PRESET.profiles?.[profile]);
measure();
if('ResizeObserver' in window){new ResizeObserver(()=>height()).observe(flow)}
window.addEventListener('resize',measure);
player.addEventListener('click',e=>{if(e.target.closest('[data-collapse]'))requestAnimationFrame(height)});
window.OurSpaceRecordPlayerLayout={get:()=>({profile,widthPx:Math.round(player.getBoundingClientRect().width),scaleFactor:currentScale,editing:false}),refresh:height,isAdmin:false};
})();
