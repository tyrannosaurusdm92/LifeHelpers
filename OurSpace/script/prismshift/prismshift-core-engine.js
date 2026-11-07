import {parseColor,toCss,rgb,remapSurface,mapText,remapBorder,makePalette,contrastRatio} from './prismshift-core-color.js';
import {normalizeOptions,guardedStorage,loadMode,saveMode,createScheduler} from './prismshift-core-options.js';

const MEDIA='img,video,canvas,picture,iframe,object,embed,svg,audio,source,track,script,style,link,meta,noscript,template';
const STYLE_MARK='data-prism-stylesheet';
const ownStyles=['--prism-bg','--prism-fg','--prism-border','--prism-decoration'];
const elish=v=>v&&v.nodeType===1;
function own(fn){try{return fn()}catch{return null}}
function event(win,name,detail,root){try{root?.dispatchEvent(new win.CustomEvent('prism:'+name,{detail,bubbles:true,composed:true}))}catch{}}
/** A namespaced, independently disposable color engine. No HTML or built-in UI. */
export class PrismShift {
 constructor(config={}){
  this.options=normalizeOptions(config);this.root=this.options.root??(typeof document!=='undefined'?document:null);
  if(!this.root)throw new Error('PrismShift requires a Document, ShadowRoot or Element root');
  this.doc=this.root.nodeType===9?this.root:this.root.ownerDocument;
  this.win=this.doc?.defaultView;if(!this.win)throw new Error('A browser document is required');
  this.container=this.root.nodeType===9?this.doc.documentElement:(this.root.host??this.root);
  this._saved=new Map();this._themes=new Map();this._dirty=new Set();this._registered=new Set([this.root]);this._rootAttrs=new Map();
  this._styles=new Map();this._observers=new Map();this._controls=new Set();this._listeners=new Set();this._started=false;this._destroyed=false;this._paused=false;
  this._rememberRoot(this.container);
  this._stats={visited:0,painted:0,skipped:0,unparsed:0,flushes:0};
  this.storage=guardedStorage(this.options.storage);
  this.selectedMode=this.options.remember?(loadMode(this.storage,this.options.storageKey)??this.options.mode):this.options.mode;
  this._scheme=this.win.matchMedia?.('(prefers-color-scheme: dark)')??null;
  this._forced=this.win.matchMedia?.('(forced-colors: active)')??null;
  this._boundScheme=()=>{if(this.selectedMode==='auto')this._applyMode()};
  this._boundStorage=e=>{if(this.options.syncTabs&&e.key===this.options.storageKey&&e.storageArea===this.storage){const next=loadMode(this.storage,this.options.storageKey)??'auto';if(next!==this.selectedMode)this.setMode(next,{persist:false})}};
  this._scheduler=createScheduler(this.win,()=>this._flush());
 }
 _rememberRoot(el){if(el&&!this._rootAttrs.has(el))this._rootAttrs.set(el,['data-prism-mode','data-prism-filter','data-prism-preserve-media'].map(k=>[k,el.getAttribute(k)]))}
 _rootElement(root){return root.nodeType===9?root.documentElement:(root.host??root)}
 get resolvedMode(){if(this.selectedMode==='auto')return this._scheme?.matches?'dark':'light';return this.selectedMode}
 getState(){return Object.freeze({selectedMode:this.selectedMode,resolvedMode:this._effectiveMode(),running:this._started&&!this._paused,statistics:{...this._stats},roots:this._registered.size})}
 _effectiveMode(){if(this.options.forcedColorsRespect&&this._forced?.matches)return 'off';return this.resolvedMode}
 start(){if(this._destroyed)throw new Error('Engine already destroyed');if(this._started)return this;
  this._started=true;this._scheme?.addEventListener?.('change',this._boundScheme);if(!this._scheme?.addEventListener)this._scheme?.addListener?.(this._boundScheme);
  this._forced?.addEventListener?.('change',this._boundScheme);this.win.addEventListener('storage',this._boundStorage);
  this._applyMode();return this;
 }
 setMode(mode,{persist=true}={}){if(!['off','light','dark','invert','contrast','auto'].includes(mode))throw new RangeError('Unknown mode');if(this._destroyed)throw new Error('Destroyed');this.selectedMode=mode;if(persist&&this.options.remember)saveMode(this.storage,this.options.storageKey,mode);if(this._started)this._applyMode();return this.getState()}
 toggle(){return this.setMode(this.resolvedMode==='dark'?'light':'dark')}
 cycle(modes=['auto','light','dark','invert','contrast']){const i=modes.indexOf(this.selectedMode);return this.setMode(modes[(i+1)%modes.length])}
 configure(config={}){this.options=normalizeOptions({...this.options,...config});if(this._started)this._applyMode();return this}
 pause(){if(this._paused)return this;this._paused=true;this._scheduler.cancel();this._disconnectObservers();return this}
 resume(){if(!this._paused)return this;this._paused=false;this._applyMode();return this}
 _applyMode(){if(!this._started||this._paused)return;this._scheduler.cancel();this._disconnectObservers();this._dirty.clear();this._restorePaint();
  const mode=this._effectiveMode();for(const root of this._registered){const c=this._rootElement(root);this._rememberRoot(c);c.setAttribute('data-prism-mode',mode);this._inject(root)}
  const filter=(mode==='invert'||(mode==='dark'&&this.options.strategy==='filter'));
  if(filter){for(const root of this._registered){const c=this._rootElement(root);c.setAttribute('data-prism-filter','true');if(this.options.mediaCorrection)c.setAttribute('data-prism-preserve-media','true');else c.removeAttribute('data-prism-preserve-media')}}
  else for(const root of this._registered){const c=this._rootElement(root);c.removeAttribute('data-prism-filter');c.removeAttribute('data-prism-preserve-media')}
  if((mode==='dark'&&this.options.strategy==='adaptive')||(mode==='contrast'&&this.options.strategy!=='tokens'))for(const root of this._registered)this._enqueueTree(root);
  else if((mode==='dark'||mode==='contrast')&&this.options.strategy==='tokens')this._setTokens();
  if(this.options.observe)this._listen();this._emit('change');
 }
 _inject(root){if(this._styles.has(root))return;let style=this.doc.createElement('style');style.setAttribute(STYLE_MARK,'');if(this.options.nonce)style.setAttribute('nonce',this.options.nonce);style.textContent=root.nodeType===11?this._shadowRules():this._rules();
  const host=root.nodeType===9?(root.head??root.documentElement):root;try{host.appendChild(style);this._styles.set(root,style)}catch(e){this._emit('error',e)}
 }
 _rules(){return `
 [data-prism-mode="dark"], [data-prism-mode="contrast"] {color-scheme:dark}
 [data-prism-mode="light"] {color-scheme:light}
 [data-prism-mode="dark"] .prism-painted,[data-prism-mode="dark"].prism-painted,[data-prism-mode="contrast"] .prism-painted,[data-prism-mode="contrast"].prism-painted {background-color:var(--prism-bg,transparent)!important;color:var(--prism-fg,inherit)!important;border-color:var(--prism-border,currentColor)!important;text-decoration-color:var(--prism-decoration,currentColor)!important}
 [data-prism-filter="true"] {filter:invert(1) hue-rotate(180deg)}
 [data-prism-filter="true"][data-prism-preserve-media="true"] :is(img,video,canvas,iframe,object,embed,[data-prism-media]):not([data-prism-invert-media]) {filter:invert(1) hue-rotate(180deg)}
 @media(forced-colors:active){[data-prism-mode] .prism-painted{forced-color-adjust:auto}}
 ${this.options.reducedMotionRespect?'@media(prefers-reduced-motion:reduce){[data-prism-mode] *{transition-duration:.01ms!important;animation-duration:.01ms!important}}':''}
 [data-prism-mode="contrast"] :focus-visible {outline:2px solid currentColor!important;outline-offset:2px}
 `}
 _shadowRules(){return this._rules().replaceAll('[data-prism-mode="dark"] .prism-painted',':host([data-prism-mode="dark"]) .prism-painted').replaceAll('[data-prism-mode="contrast"] .prism-painted',':host([data-prism-mode="contrast"]) .prism-painted')+`\n:host([data-prism-mode="dark"]),:host([data-prism-mode="contrast"]){color-scheme:dark}`}
 _setTokens(){const palette=makePalette(this.options.palette??{},this.options);const c=this.container;const tokens={'--prism-semantic-bg':toCss(palette.surface),'--prism-semantic-surface':toCss(palette.surface),'--prism-semantic-fg':toCss(palette.foreground),'--prism-semantic-border':toCss(palette.border),'--prism-semantic-accent':toCss(palette.accent)};this._save(c,Object.keys(tokens));for(const [key,value] of Object.entries(tokens))c.style.setProperty(key,value);c.setAttribute('data-prism-tokens','true')}
 _enqueue(element){if(!elish(element))return;this._dirty.add(element);this._scheduler.schedule()}
 _enqueueTree(root){const starting=root.nodeType===9?root.documentElement:root.host??root;
  if(root.nodeType!==11&&elish(starting))this._enqueue(starting);
  const els=own(()=>root.querySelectorAll('*'));if(els)for(const el of els){if(this._eligible(el))this._enqueue(el);if(this.options.observeShadows&&el.shadowRoot&&el.shadowRoot.mode==='open')this.registerRoot(el.shadowRoot);if(this.options.observeIframes&&el.localName==='iframe'){const nested=own(()=>el.contentDocument);if(nested?.documentElement)this.registerRoot(nested)}}
 }
 _eligible(el){if(!elish(el)||typeof el.matches!=='function'||el.matches(MEDIA)||el.hasAttribute(STYLE_MARK))return false;
  if(this.options.ignoreSelector&&own(()=>el.closest(this.options.ignoreSelector)))return false;
  if(this.options.includeSelector&&!own(()=>el.matches(this.options.includeSelector)))return false;
  return true;
 }
 _flush(){if(this._destroyed||this._paused)return;this._disconnectObservers(true);let count=0;const budget=this.options.frameBudget;
  try{for(const el of this._dirty){this._dirty.delete(el);if(!el.isConnected&&!el.getRootNode()?.host)continue;this._stats.visited++;if(this._eligible(el))this._paint(el);else this._stats.skipped++;if(++count>=budget)break}}
  finally{this._stats.flushes++;if(this.options.observe)this._listen();if(this._dirty.size)this._scheduler.schedule();else this._emit('complete')}
 }
 _paint(el){const view=el.ownerDocument?.defaultView??this.win;
  // Re-read the app's unpainted CSS on updates so dark colors never drift.
  const wasPainted=el.classList.contains('prism-painted');
  if(wasPainted)el.classList.remove('prism-painted');
  const style=own(()=>view.getComputedStyle(el));
  const bg=style?parseColor(style.backgroundColor):null,fg=style?parseColor(style.color):null,border=style?parseColor(style.borderTopColor):null;
  if(wasPainted)el.classList.add('prism-painted');
  if(!style)return;
  // Color channels were resolved above with the original unthemed class.

  if(!bg&&!fg&&!border){this._stats.unparsed++;return}
  const isRoot=el===this.container||el===this.doc.documentElement;const parent=el.parentElement;
  const background=bg&&bg.a>.01?remapSurface(bg,this.options):(isRoot?remapSurface(rgb(255,255,255),this.options):null);
  // Traverse upward to locate the nearest painted surface; transparent children inherit it.
  let nearestBg=background;for(let p=parent;!nearestBg&&p;p=p.parentElement){const css=p.style.getPropertyValue('--prism-bg');const parsed=parseColor(css);if(parsed&&parsed.a>.01)nearestBg=parsed}
  nearestBg??=rgb(23,25,28);
  let paintForeground=Boolean(fg);
  // Inherited color already painted by an ancestor should not be remapped twice.
  if(parent?.classList.contains('prism-painted')&&style.color===view.getComputedStyle(parent).color)paintForeground=false;
  this._save(el,ownStyles);
  if(background)el.style.setProperty('--prism-bg',toCss(background));else el.style.setProperty('--prism-bg','transparent');
  if(paintForeground)el.style.setProperty('--prism-fg',toCss(mapText(fg,nearestBg,{minimum:this._effectiveMode()==='contrast'?7:this.options.minimumContrast})));
  else el.style.setProperty('--prism-fg','inherit');
  if(border)el.style.setProperty('--prism-border',toCss(remapBorder(border,nearestBg)));
  el.classList.add('prism-painted');this._stats.painted++;
 }
 _save(el,keys){let snapshot=this._saved.get(el);if(!snapshot){snapshot={values:new Map(),hadClass:el.classList.contains('prism-painted'),tokens:el.getAttribute('data-prism-tokens')};this._saved.set(el,snapshot)}for(const key of keys)if(!snapshot.values.has(key))snapshot.values.set(key,[el.style.getPropertyValue(key),el.style.getPropertyPriority(key)]);return snapshot}
 _restoreOne(el,snap){for(const [key,[value,priority]] of snap.values){if(value)el.style.setProperty(key,value,priority);else el.style.removeProperty(key)}if(!snap.hadClass)el.classList.remove('prism-painted');if(snap.tokens===null)el.removeAttribute('data-prism-tokens');else el.setAttribute('data-prism-tokens',snap.tokens)}
 _prune(el){if(!elish(el))return;for(const e of [el,...el.querySelectorAll('*')]){const snap=this._saved.get(e);if(snap)this._restoreOne(e,snap);this._saved.delete(e);this._dirty.delete(e)}}
 _restorePaint(){for(const [el,snap] of this._saved)this._restoreOne(el,snap);this._saved.clear()}
 _consumeMutations(records){
  for(const record of records){if(record.type==='childList'){
   for(const el of record.removedNodes)this._prune(el);
   for(const el of record.addedNodes){if(el.nodeType!==1)continue;this._enqueue(el);for(const node of el.querySelectorAll('*'))this._enqueue(node);if(this.options.observeShadows&&el.shadowRoot)this.registerRoot(el.shadowRoot)}
  }else if(record.target?.nodeType===1){const el=record.target;if(el.hasAttribute(STYLE_MARK))continue;this._enqueue(el);if(record.attributeName==='class'||record.attributeName==='style')for(const child of el.querySelectorAll('*'))this._enqueue(child)}
  }
 }
 _listen(){this._disconnectObservers(true);if(!this._started||this._paused||!this.options.observe)return;
  for(const root of this._registered){const target=root.nodeType===9?root.documentElement:root;
   const view=target.ownerDocument?.defaultView??this.win;
   const mo=new view.MutationObserver(records=>this._consumeMutations(records));
   try{mo.observe(target,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','hidden']});this._observers.set(root,mo)}catch{}
  }
 }
 _disconnectObservers(drain=false){const pending=[];for(const observer of this._observers.values()){if(drain)pending.push(...observer.takeRecords());observer.disconnect()}this._observers.clear();if(pending.length)this._consumeMutations(pending)}
 registerRoot(root){if(this._registered.has(root))return this;const ok=root?.nodeType===9||root?.nodeType===11||root?.nodeType===1;if(!ok)throw new TypeError('Expected Document, ShadowRoot or Element');
  this._registered.add(root);const c=this._rootElement(root);this._rememberRoot(c);if(this._started){this._inject(root);const mode=this._effectiveMode();c.setAttribute('data-prism-mode',mode);if(mode==='invert'||(mode==='dark'&&this.options.strategy==='filter')){c.setAttribute('data-prism-filter','true');if(this.options.mediaCorrection)c.setAttribute('data-prism-preserve-media','true')}if(mode==='dark'||mode==='contrast')this._enqueueTree(root);this._listen()}return this;
 }
 unregisterRoot(root){if(root===this.root)throw new Error('Cannot unregister main root');for(const [el,snap] of [...this._saved]){if(root.contains?.(el)) {this._restoreOne(el,snap);this._saved.delete(el)}}const host=this._rootElement(root);this._restoreRootAttrs(host);this._registered.delete(root);this._observers.get(root)?.disconnect();this._observers.delete(root);this._styles.get(root)?.remove();this._styles.delete(root);return this}
 _restoreRootAttrs(element){const old=this._rootAttrs.get(element);if(!old)return;for(const [key,value] of old){if(value===null)element.removeAttribute(key);else element.setAttribute(key,value)}this._rootAttrs.delete(element)}
 refresh(){if(!this._started)return this;this._applyMode();return this}
 /** Link any existing button, checkbox or select. Does not create or require markup. */
 bindControl(element,{cycle=['auto','light','dark','invert'],eventType}={}){
  if(!elish(element))throw new TypeError('A DOM element is required');const type=eventType??((element.matches('select,input'))?'change':'click');
  const handler=()=>{if(element.matches('select'))this.setMode(element.value);else if(element.matches('input[type=checkbox]'))this.setMode(element.checked?'dark':'light');else this.cycle(cycle)};
  const sync=()=>{if(element.matches('select'))element.value=this.selectedMode;else if(element.matches('input[type=checkbox]'))element.checked=this.resolvedMode==='dark';else element.setAttribute('aria-label',`Color mode: ${this.resolvedMode}`)};
  element.addEventListener(type,handler);const off=this.subscribe(sync);sync();const clean=()=>{element.removeEventListener(type,handler);off();this._controls.delete(clean)};this._controls.add(clean);return clean;
 }
 subscribe(fn){if(typeof fn!=='function')throw new TypeError('Function required');this._listeners.add(fn);return ()=>this._listeners.delete(fn)}
 _emit(type,error){const detail={...this.getState(),...(error?{error:String(error)}:{})};for(const fn of this._listeners)own(()=>fn(detail,type));event(this.win,type,detail,this.container)}
 destroy(){if(this._destroyed)return;this._scheduler.cancel();this._disconnectObservers();this._restorePaint();for(const clean of [...this._controls])clean();for(const el of this._styles.values())el.remove();this._styles.clear();
  for(const el of [...this._rootAttrs.keys()])this._restoreRootAttrs(el);
  this._scheme?.removeEventListener?.('change',this._boundScheme);this._scheme?.removeListener?.(this._boundScheme);this._forced?.removeEventListener?.('change',this._boundScheme);this.win.removeEventListener('storage',this._boundStorage);this._registered.clear();this._started=false;this._destroyed=true;this._listeners.clear();
 }
}
export function createPrismShift(options){return new PrismShift(options)}
