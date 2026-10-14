(()=>{
'use strict';
const STORE_KEY='feedHimMEOW.uiWindowSizes.v1';
const SELECTORS=[
  '.game-toolbar','.global-game-status','.panel','.master-panel','.booster-panel',
  '.level-hud','.level-map-shell','.level-dialog','.recipe-launcher','.recipe-card',
  '.garden-shell','.garden-top','.game-rail','.garden-relay-panel','.garden-result-card'
];
const DIRS=['n','ne','e','se','s','sw','w','nw'];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
let saved={};try{saved=JSON.parse(localStorage.getItem(STORE_KEY)||'{}')||{}}catch(_){saved={}}
let serial=0;
function keyFor(el){if(el.dataset.uiResizeKey)return el.dataset.uiResizeKey;let key=el.id||el.dataset.panel||'';if(!key){const cls=[...el.classList].find(c=>!['ui-resizable-surface','open','pinned'].includes(c));if(cls){const peers=[...document.getElementsByClassName(cls)];const idx=Math.max(0,peers.indexOf(el));key=cls+(peers.length>1?'-'+idx:'')}else key='surface-'+(++serial)}el.dataset.uiResizeKey=key;return key}
function save(el){const key=keyFor(el),r=el.getBoundingClientRect(),scale=Number(el.style.getPropertyValue('--ui-resize-scale')||1);saved[key]={width:Math.round(r.width),height:Math.round(r.height),scale:Number(scale.toFixed(3))};try{localStorage.setItem(STORE_KEY,JSON.stringify(saved))}catch(_){}}
function baseFor(el){let bw=Number(el.dataset.uiBaseW),bh=Number(el.dataset.uiBaseH);const r=el.getBoundingClientRect();if(!(bw>0))bw=Math.max(180,r.width||parseFloat(getComputedStyle(el).width)||320);if(!(bh>0))bh=Math.max(90,r.height||parseFloat(getComputedStyle(el).height)||180);el.dataset.uiBaseW=String(bw);el.dataset.uiBaseH=String(bh);return{bw,bh}}
function updateScale(el,w,h){const {bw,bh}=baseFor(el);const sx=w/bw,sy=h/bh,scale=clamp((sx+sy)/2,.58,1.85);el.style.setProperty('--ui-resize-scale',String(scale));el.dataset.uiScale=scale.toFixed(2);if(el.classList.contains('game-toolbar'))document.documentElement.style.setProperty('--toolbar-h',Math.max(44,Math.round(h))+'px');window.dispatchEvent(new CustomEvent('feed-him-meow:ui-surface-resized',{detail:{key:keyFor(el),width:w,height:h,scale}}))}
function restore(el){const rec=saved[keyFor(el)];if(!rec)return;const maxW=Math.max(220,innerWidth-16),maxH=Math.max(120,innerHeight-90),w=clamp(Number(rec.width)||0,180,maxW),h=clamp(Number(rec.height)||0,90,maxH);if(w)el.style.width=w+'px';if(h)el.style.height=h+'px';el.style.maxWidth='calc(100vw - 12px)';el.style.maxHeight='calc(100dvh - 82px)';updateScale(el,w,h)}
function reset(el){el.style.removeProperty('width');el.style.removeProperty('height');el.style.removeProperty('max-width');el.style.removeProperty('max-height');el.style.removeProperty('--ui-resize-scale');delete saved[keyFor(el)];try{localStorage.setItem(STORE_KEY,JSON.stringify(saved))}catch(_){}requestAnimationFrame(()=>{delete el.dataset.uiBaseW;delete el.dataset.uiBaseH;delete el.dataset.uiResizePrimed;baseFor(el);if(el.classList.contains('game-toolbar'))document.documentElement.style.removeProperty('--toolbar-h');window.dispatchEvent(new CustomEvent('resize'))})}
function movable(el){const p=getComputedStyle(el).position;return p==='fixed'||p==='absolute'}
function prime(el){if(!el||el.dataset.uiResizePrimed==='1')return;const r=el.getBoundingClientRect();if(r.width<=40||r.height<=30)return;el.dataset.uiResizePrimed='1';baseFor(el);restore(el)}
function install(el){if(!el)return;if(el.dataset.uiResizable==='1'){prime(el);return;}el.dataset.uiResizable='1';el.classList.add('ui-resizable-surface');if(getComputedStyle(el).position==='static')el.style.position='relative';DIRS.forEach(dir=>{const h=document.createElement('span');h.className='ui-resize-handle ui-resize-'+dir;h.dataset.resizeDir=dir;h.setAttribute('aria-hidden','true');h.title='Drag to resize this window; double-click to reset';h.addEventListener('dblclick',e=>{e.preventDefault();e.stopPropagation();reset(el)});h.addEventListener('pointerdown',e=>{
  if(e.button!=null&&e.button!==0)return;e.preventDefault();e.stopPropagation();
  const r=el.getBoundingClientRect(),start={x:e.clientX,y:e.clientY,w:r.width,h:r.height,left:r.left,top:r.top},base=baseFor(el),isMove=movable(el);h.setPointerCapture?.(e.pointerId);el.classList.add('ui-is-resizing');
  const minW=Math.max(160,Math.min(base.bw*.48,360)),minH=Math.max(86,Math.min(base.bh*.48,240));
  const move=ev=>{let dx=ev.clientX-start.x,dy=ev.clientY-start.y,w=start.w,hg=start.h,left=start.left,top=start.top;if(dir.includes('e'))w=start.w+dx;if(dir.includes('s'))hg=start.h+dy;if(dir.includes('w')){w=start.w-dx;if(isMove)left=start.left+dx}if(dir.includes('n')){hg=start.h-dy;if(isMove)top=start.top+dy}const maxW=Math.max(minW,innerWidth-(isMove?Math.max(4,left):8)-4),maxH=Math.max(minH,innerHeight-(isMove?Math.max(76,top):82)-6);w=clamp(w,minW,maxW);hg=clamp(hg,minH,maxH);if(isMove){if(dir.includes('w'))left=start.left+(start.w-w);if(dir.includes('n'))top=start.top+(start.h-hg);if(el.classList.contains('panel')&&el.classList.contains('pinned')){el.style.setProperty('--pin-x',Math.max(4,left)+'px');el.style.setProperty('--pin-y',Math.max(76,top)+'px')}else if(el.tagName!=='DIALOG'){el.style.left=Math.max(4,left)+'px';el.style.top=Math.max(76,top)+'px'}}el.style.width=w+'px';el.style.height=hg+'px';el.style.maxWidth='calc(100vw - 12px)';el.style.maxHeight='calc(100dvh - 82px)';updateScale(el,w,hg)};
  const up=()=>{el.classList.remove('ui-is-resizing');h.removeEventListener('pointermove',move);h.removeEventListener('pointerup',up);h.removeEventListener('pointercancel',up);save(el);window.dispatchEvent(new CustomEvent('resize'))};h.addEventListener('pointermove',move);h.addEventListener('pointerup',up);h.addEventListener('pointercancel',up);
 });el.appendChild(h)});
 requestAnimationFrame(()=>prime(el))
}
function scan(){SELECTORS.forEach(sel=>document.querySelectorAll(sel).forEach(install))}
scan();
const mo=new MutationObserver(()=>scan());mo.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open','hidden','class']});
window.addEventListener('resize',()=>{document.querySelectorAll('.ui-resizable-surface').forEach(el=>{const r=el.getBoundingClientRect();if(r.width>innerWidth-8)el.style.width=Math.max(180,innerWidth-12)+'px';if(r.height>innerHeight-76)el.style.height=Math.max(90,innerHeight-84)+'px'})});
window.FeedHimMeowUIResize={scan,resetAll(){saved={};try{localStorage.removeItem(STORE_KEY)}catch(_){}document.querySelectorAll('.ui-resizable-surface').forEach(reset)}};
})();
