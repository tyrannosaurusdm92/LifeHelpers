/* PrismShift 1.0 classic browser bundle - generated from ES modules. */
(function(g){
"use strict";

/* MODULE: core/color.js */
/** PrismShift color science. No DOM side effects. All channels use sRGB (0..255). */
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:a));
const byte=v=>Math.round(clamp(v,0,255));
const rgb=(r,g,b,a=1)=>({r:byte(r),g:byte(g),b:byte(b),a:clamp(a)});
const parseChannel=s=>s.trim().endsWith('%')?clamp(parseFloat(s)/100)*255:parseFloat(s);
const parseAlpha=s=>s===undefined?1:(s.trim().endsWith('%')?parseFloat(s)/100:parseFloat(s));
const hue=s=>{const value=parseFloat(s);if(!Number.isFinite(value))return NaN;const factor=s.endsWith('turn')?360:s.endsWith('rad')?180/Math.PI:s.endsWith('grad')?0.9:1;return ((value*factor)%360+360)%360};
function fromHsl(h,s,l,a=1){s=clamp(s);l=clamp(l);const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;const p=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return rgb(...p.map(v=>(v+m)*255),a)}
const CSS_NAMED={black:'#000',white:'#fff',red:'#f00',green:'#008000',blue:'#00f',gray:'#808080',grey:'#808080',silver:'#c0c0c0',yellow:'#ff0',cyan:'#0ff',aqua:'#0ff',magenta:'#f0f',fuchsia:'#f0f',orange:'#ffa500',purple:'#800080',rebeccapurple:'#663399',transparent:'#00000000',navy:'#000080',teal:'#008080',maroon:'#800000',olive:'#808000',lime:'#00ff00'};
/** Parse common CSS color syntaxes; optionally use an element's browser CSS resolver for named colors. */
function parseColor(input,resolver){
 if(typeof input!=='string')return null;
 let s=input.trim().toLowerCase();if(!s||s==='currentcolor'||s==='inherit'||s==='initial'||s==='unset'||s==='none')return null;
 s=CSS_NAMED[s]??s;
 if(/^#[\da-f]{3,4}$/.test(s)){const a=[...s.slice(1)].map(v=>parseInt(v+v,16));return rgb(a[0],a[1],a[2],a[3]===undefined?1:a[3]/255)}
 if(/^#[\da-f]{6}(?:[\da-f]{2})?$/.test(s)){return rgb(parseInt(s.slice(1,3),16),parseInt(s.slice(3,5),16),parseInt(s.slice(5,7),16),s.length===9?parseInt(s.slice(7,9),16)/255:1)}
 const fn=/^(rgba?|hsla?|hwb|color)\((.*)\)$/.exec(s);
 if(fn){const kind=fn[1];let str=fn[2].trim();if(kind==='color'){
   const m=/^srgb\s+(.+)$/.exec(str);if(m){const [r,g,b,a]=m[1].replace(/\s*\/\s*/,' ').split(/[\s,]+/).map(Number);if([r,g,b].every(Number.isFinite))return rgb(r*255,g*255,b*255,a??1)}
 }else{const args=str.replace(/\s*\/\s*/,' ').split(/[\s,]+/).filter(Boolean);if(args.length>=3){const a=parseAlpha(args[3]);if(!Number.isFinite(a))return null;
 if(kind==='rgb'||kind==='rgba'){const vals=args.slice(0,3).map(parseChannel);if(vals.every(Number.isFinite))return rgb(...vals,a)}
 if(kind==='hsl'||kind==='hsla'){const h=hue(args[0]),sat=parseFloat(args[1])/100,lit=parseFloat(args[2])/100;if([h,sat,lit].every(Number.isFinite))return fromHsl(h,sat,lit,a)}
 if(kind==='hwb'){const h=hue(args[0]),w=clamp(parseFloat(args[1])/100),bk=clamp(parseFloat(args[2])/100);if(Number.isFinite(h)){const c=fromHsl(h,1,.5);if(w+bk>=1)return rgb(255*w/(w+bk),255*w/(w+bk),255*w/(w+bk),a);const k=1-w-bk;return rgb(c.r*k+255*w,c.g*k+255*w,c.b*k+255*w,a)}}
 }}}
 if(typeof resolver==='function'){const resolved=resolver(s);if(resolved&&resolved!==s)return parseColor(resolved)}
 return null;
}
const toHex=(c,alpha=false)=>'#'+[c.r,c.g,c.b,...(alpha?[Math.round(c.a*255)]:[])].map(n=>byte(n).toString(16).padStart(2,'0')).join('');
const toCss=c=>`rgba(${c.r}, ${c.g}, ${c.b}, ${+clamp(c.a).toFixed(5)})`;
const srgbToLinear=v=>{v=clamp(v/255);return v<=.04045?v/12.92:((v+.055)/1.055)**2.4};
const linearToSrgb=v=>{v=clamp(v);return byte(255*(v<=.0031308?v*12.92:1.055*v**(1/2.4)-.055))};
function luminance(c){return .2126*srgbToLinear(c.r)+.7152*srgbToLinear(c.g)+.0722*srgbToLinear(c.b)}
const contrastRatio=(a,b)=>{const aa=luminance(a),bb=luminance(b);return (Math.max(aa,bb)+.05)/(Math.min(aa,bb)+.05)};
const mix=(a,b,t)=>rgb(a.r+(b.r-a.r)*clamp(t),a.g+(b.g-a.g)*clamp(t),a.b+(b.b-a.b)*clamp(t),a.a+(b.a-a.a)*clamp(t));
const composite=(fg,bg)=>rgb(fg.r*fg.a+bg.r*(1-fg.a),fg.g*fg.a+bg.g*(1-fg.a),fg.b*fg.a+bg.b*(1-fg.a));
const invertColor=(c,{keepAlpha=true}={})=>rgb(255-c.r,255-c.g,255-c.b,keepAlpha?c.a:1);
/** Force black/white inversion using relative luminance (default WCAG-derived threshold). */
const invertBlackWhite=(c,threshold=.179)=>luminance(c)>clamp(threshold)?rgb(0,0,0,c.a):rgb(255,255,255,c.a);
/** OKLab: Björn Ottosson's perceptual space, for balanced lightness remapping. */
function toOKLab(c){const r=srgbToLinear(c.r),g=srgbToLinear(c.g),b=srgbToLinear(c.b);const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);return {L:.2104542553*l+.793617785*m-.0040720468*s,a:1.9779984951*l-2.428592205*m+.4505937099*s,b:.0259040371*l+.7827717662*m-.808675766*s,alpha:c.a}}
function fromOKLab({L,a,b,alpha=1}){const l=(L+.3963377774*a+.2158037573*b)**3,m=(L-.1055613458*a-.0638541728*b)**3,s=(L-.0894841775*a-1.291485548*b)**3;return rgb(linearToSrgb(4.0767416621*l-3.3077115913*m+.2309699292*s),linearToSrgb(-1.2684380046*l+2.6097574011*m-.3413193965*s),linearToSrgb(-.0041960863*l-.7034186147*m+1.707614701*s),alpha)}
function remapSurface(original,opts={}){
 const {surfaceLightness=.12,chroma=.72}=opts;const lab=toOKLab(original);
 // A white surface becomes deep charcoal; darker source surfaces retain slight elevation.
 const target=clamp(surfaceLightness+(1-lab.L)*.21,.055,.38);
 return fromOKLab({L:target,a:lab.a*chroma,b:lab.b*chroma,alpha:original.a});
}
function ensureContrast(foreground,background,minimum=4.5){
 const bg=background.a<1?composite(background,rgb(18,20,24)):background;
 let fg=foreground.a<1?composite(foreground,bg):foreground;
 if(contrastRatio(fg,bg)>=minimum)return foreground;
 const white=rgb(255,255,255),black=rgb(0,0,0),target=contrastRatio(white,bg)>=contrastRatio(black,bg)?white:black;
 // Interpolate in perceptual OKLab space and preserve hue where possible.
 const initial=toOKLab(foreground),goal=toOKLab(target);let best=target,lo=0,hi=1;
 for(let i=0;i<18;i++){const t=(lo+hi)/2,attempt=fromOKLab({L:initial.L+(goal.L-initial.L)*t,a:initial.a*(1-t),b:initial.b*(1-t),alpha:foreground.a});const effective=attempt.a<1?composite(attempt,bg):attempt;if(contrastRatio(effective,bg)>=minimum){best=attempt;hi=t}else lo=t}
 return rgb(best.r,best.g,best.b,foreground.a);
}
function mapText(original,background,{minimum=4.5}={}){
 let lab=toOKLab(original);if(lab.L<.67)lab.L=clamp(.72+lab.L*.27,.72,.96);else lab.L=clamp(lab.L,.72,.98);
 return ensureContrast(fromOKLab(lab),background,minimum);
}
const remapBorder=(c,bg)=>mix(remapSurface(c,{surfaceLightness:.3}),bg,.35);
function makePalette(source={},options={}){const base=parseColor(source.background??'#ffffff')??rgb(255,255,255);const surface=remapSurface(base,options);const foreground=mapText(parseColor(source.foreground??'#202124')??rgb(24,24,24),surface,{minimum:options.minimumContrast??4.5});const border=remapBorder(parseColor(source.border??'#ccc')??rgb(204,204,204),surface);return {surface,foreground,border,accent:ensureContrast(parseColor(source.accent??'#5b87d3')??rgb(91,135,211),surface,3)}}
/** CSS `color(display-p3 ...)` and lab colors are left untouched if not resolved by the browser. */


/* MODULE: core/options.js */
/** Configuration validation, responsive scheduler, defensive storage. */
const MODES=Object.freeze(['off','light','dark','invert','contrast','auto']);
const DEFAULTS=Object.freeze({mode:'auto',strategy:'adaptive',storageKey:'prismshift:mode',remember:true,syncTabs:true,observe:true,observeShadows:true,observeIframes:false,frameBudget:120,minimumContrast:4.5,surfaceLightness:.12,mediaCorrection:true,forcedColorsRespect:true,reducedMotionRespect:true,nonce:null,ignoreSelector:'[data-prism-ignore], [data-no-dark], [data-prism-preserve]',includeSelector:null,root:null});
function normalizeOptions(config={}){const v={...DEFAULTS,...config};if(!MODES.includes(v.mode))throw new RangeError('Unknown mode: '+v.mode);if(!['adaptive','tokens','filter'].includes(v.strategy))throw new RangeError('Unknown strategy: '+v.strategy);v.frameBudget=Math.max(10,Math.min(1500,Math.floor(Number(v.frameBudget)||120)));v.minimumContrast=Math.max(1,Math.min(21,Number(v.minimumContrast)||4.5));v.surfaceLightness=Math.max(.04,Math.min(.4,Number(v.surfaceLightness)||.12));return v}
function guardedStorage(storage){try{if(storage)return storage;if(typeof localStorage!=='undefined')return localStorage}catch{}return null}
function loadMode(storage,key){try{const x=storage?.getItem(key);return MODES.includes(x)?x:null}catch{return null}}
function saveMode(storage,key,mode){try{if(mode===null)storage?.removeItem(key);else storage?.setItem(key,mode);return true}catch{return false}}
function createScheduler(win,callback){let token=0,kind='';return {schedule(){if(token)return;const run=()=>{token=0;kind='';callback()};if(typeof win?.requestIdleCallback==='function'){kind='idle';token=win.requestIdleCallback(run,{timeout:180})}else if(typeof win?.requestAnimationFrame==='function'){kind='frame';token=win.requestAnimationFrame(run)}else {kind='timeout';token=setTimeout(run,0)}},cancel(){if(token){if(kind==='idle')win.cancelIdleCallback(token);else if(kind==='frame')win.cancelAnimationFrame(token);else clearTimeout(token);token=0;kind=''}}}}


/* MODULE: core/pixels.js */
/** Pixel pipelines; alpha is never inverted, and mutating is opt-in. */

const modes={invert:0,grayscale:1,sepia:2,threshold:3,brightness:4};
function processPixels(input,{mode='invert',mutate=false,strength=1,threshold=127,brightness=0}={}){
 if(!(input instanceof Uint8ClampedArray))throw new TypeError('Expected Uint8ClampedArray RGBA pixels');
 if(input.length%4!==0)throw new RangeError('RGBA pixel array length must be a multiple of 4');
 if(!(mode in modes))throw new RangeError('Unsupported pixel mode: '+mode);
 const out=mutate?input:new Uint8ClampedArray(input);strength=clamp(strength);brightness=clamp(brightness,-255,255);
 for(let i=0;i<out.length;i+=4){const r=out[i],g=out[i+1],b=out[i+2];let nr=r,ng=g,nb=b;
 switch(mode){case 'invert':nr=255-r;ng=255-g;nb=255-b;break;
 case 'grayscale':nr=ng=nb=.2126*r+.7152*g+.0722*b;break;
 case 'sepia':nr=.393*r+.769*g+.189*b;ng=.349*r+.686*g+.168*b;nb=.272*r+.534*g+.131*b;break;
 case 'threshold':nr=ng=nb=(.2126*r+.7152*g+.0722*b)>=threshold?255:0;break;
 case 'brightness':nr=r+brightness;ng=g+brightness;nb=b+brightness;break;
 }
 out[i]=r+(nr-r)*strength;out[i+1]=g+(ng-g)*strength;out[i+2]=b+(nb-b)*strength;
 }
 return out;
}
function processImageData(imageData,options={}){if(!imageData||!Number.isInteger(imageData.width)||!Number.isInteger(imageData.height)||!(imageData.data instanceof Uint8ClampedArray))throw new TypeError('Expected ImageData-like object');const pixels=processPixels(imageData.data,options);if(options.mutate)return imageData;if(typeof ImageData!=='undefined')return new ImageData(pixels,imageData.width,imageData.height);return {data:pixels,width:imageData.width,height:imageData.height}}
function invertPixels(pixels,options={}){return processPixels(pixels,{...options,mode:'invert'})}
const invertImageData=(imageData,options={})=>processImageData(imageData,{...options,mode:'invert'});
/** Optional WASM vectorized path with chunked copying, no network calls by this helper. */
async function createWasmProcessor(source){
 if(typeof WebAssembly==='undefined')throw new Error('WebAssembly unavailable');
 let binary=source;
 if(source instanceof WebAssembly.Module){const instance=await WebAssembly.instantiate(source,{});return wasmWrapper(instance.exports)}
 if(source instanceof WebAssembly.Instance)return wasmWrapper(source.exports);
 if(source instanceof ArrayBuffer||ArrayBuffer.isView(source)){binary=source;}
 else throw new TypeError('Supply WASM bytes, Module, or Instance; loading is the host’s responsibility');
 const instance=await WebAssembly.instantiate(binary,{});return wasmWrapper(instance.instance?.exports??instance.exports);
}
function wasmWrapper(ex){if(!ex.memory||typeof ex.process_rgba!=='function')throw new Error('Incompatible WASM module');const bytes=new Uint8Array(ex.memory.buffer);return {
 process(pixels,{mode='invert',mutate=false,strength=1,threshold=127,brightness=0}={}){
  if(!(pixels instanceof Uint8ClampedArray)||pixels.length%4)throw new TypeError('RGBA pixels required');if(!(mode in modes))throw new RangeError('Unknown mode');const output=mutate?pixels:new Uint8ClampedArray(pixels);const offset=131072;const chunk=(bytes.byteLength-offset)-((bytes.byteLength-offset)%4);
  if(chunk<4)throw new Error('WASM memory too small');for(let i=0;i<output.length;i+=chunk){const n=Math.min(chunk,output.length-i);bytes.set(output.subarray(i,i+n),offset);ex.process_rgba(offset,n,modes[mode],Math.round(clamp(strength)*65535),Math.round(clamp(threshold,0,255)),Math.round(clamp(brightness,-255,255)));output.set(bytes.subarray(offset,offset+n),i)}return output;
 },
 memoryBytes:bytes.byteLength
 }}


/* MODULE: core/engine.js */



const MEDIA='img,video,canvas,picture,iframe,object,embed,svg,audio,source,track,script,style,link,meta,noscript,template';
const STYLE_MARK='data-prism-stylesheet';
const ownStyles=['--prism-bg','--prism-fg','--prism-border','--prism-decoration'];
const elish=v=>v&&v.nodeType===1;
function own(fn){try{return fn()}catch{return null}}
function event(win,name,detail,root){try{root?.dispatchEvent(new win.CustomEvent('prism:'+name,{detail,bubbles:true,composed:true}))}catch{}}
/** A namespaced, independently disposable color engine. No HTML or built-in UI. */
class PrismShift {
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
function createPrismShift(options){return new PrismShift(options)}


/* MODULE: adapters/ansi.js */
/** Streaming, lossless SGR foreground/background/underline color conversion. */

const flip8=n=>n<=7?7-n:n<=15?23-n:n<=231?247-n:n<=255?487-n:n;
function flipIndex(n){if(n<0||n>255)return n;return flip8(n)}
function mapSgr(parameters,{foreground=true,background=true,underline=true,base16=true,palette256=true,truecolor=true}={}){
 const p=parameters.split(';');let last=0;for(let i=0;i<p.length;i++){
  const raw=p[i],n=Number(raw);if(raw===''||!Number.isInteger(n))continue;
  if(base16){if(foreground&&n>=30&&n<=37)p[i]=String(37-(n-30));else if(background&&n>=40&&n<=47)p[i]=String(47-(n-40));else if(foreground&&n>=90&&n<=97)p[i]=String(97-(n-90));else if(background&&n>=100&&n<=107)p[i]=String(107-(n-100))}
  if(n!==38&&n!==48&&n!==58)continue;const allowed=n===38?foreground:n===48?background:underline;
  const mode=Number(p[i+1]);if(mode===5&&i+2<p.length){const idx=Number(p[i+2]);if(allowed&&palette256&&Number.isInteger(idx)&&idx>=0&&idx<=255)p[i+2]=String(flipIndex(idx));i+=2;continue}
  if(mode===2&&i+4<p.length){if(allowed&&truecolor){for(let j=2;j<=4;j++){const v=Number(p[i+j]);if(Number.isInteger(v)&&v>=0&&v<=255)p[i+j]=String(255-v)}}i+=4;continue}
  last=i;
 }
 return p.join(';');
}
/** ANSI CSI patterns without SGR are left exactly as supplied. */
function invertAnsi(text,options={}){if(typeof text!=='string')throw new TypeError('String required');return text.replace(/\x1b\[([0-9;]*)m/g,(sequence,params)=>'\x1b['+mapSgr(params,options)+'m')}
/** Keeps incomplete escape sequences until the next chunk; call finish() to drain. */
function createAnsiTransformer(options={}){let pending='';const maxPending=Math.max(32,Math.min(4096,options.maxPending??256));return {
 write(chunk){if(typeof chunk!=='string')throw new TypeError('String chunks only');let s=pending+chunk;pending='';
  const i=s.lastIndexOf('\x1b');if(i>=0){const tail=s.slice(i);if(/^\x1b(?:\[[0-9;]*)?$/.test(tail)&&tail.length<=maxPending){pending=tail;s=s.slice(0,i)}}
  return invertAnsi(s,options);
 },
 finish(){const result=pending;pending='';return result},
 get pendingLength(){return pending.length}
 }}
function invertAnsiColorPair(foreground,background){const fg=parseColor(foreground),bg=parseColor(background);return {foreground:fg?toCss(invertColor(fg)):foreground,background:bg?toCss(invertColor(bg)):background}}


/* MODULE: adapters/stylesheets.js */
/** Non-destructive alternate stylesheet manager, inspired by prefers-color-scheme usage. */
function createStylesheetController(doc,{darkSelector='link[rel="stylesheet"][data-theme="dark"]',lightSelector='link[rel="stylesheet"][data-theme="light"]'}={}){
 if(!doc?.querySelectorAll)throw new TypeError('Document required');const original=new Map();
 const get=()=>({dark:[...doc.querySelectorAll(darkSelector)],light:[...doc.querySelectorAll(lightSelector)]});
 function activate(mode){if(!['dark','light','off'].includes(mode))throw new RangeError('Bad mode');const {dark,light}=get();for(const el of [...dark,...light]){if(!original.has(el))original.set(el,el.getAttribute('media'));el.setAttribute('media',mode==='off'?'not all':((mode==='dark')===dark.includes(el)?'all':'not all'))}return {dark:dark.length,light:light.length}}
 return {activate,restore(){for(const [el,media] of original){if(media===null)el.removeAttribute('media');else el.setAttribute('media',media)}original.clear()},getState:()=>({managed:original.size})};
}
/** A host can supply its own mapping of semantic design-system variables. */
function createTokenMapper(element,mapping={}){if(!element?.style)throw new TypeError('Element required');const prior=new Map();return {
 apply(palette){for(const [variable,path] of Object.entries(mapping)){if(!/^--[\w-]+$/.test(variable))throw new TypeError('Invalid CSS variable');if(!prior.has(variable))prior.set(variable,[element.style.getPropertyValue(variable),element.style.getPropertyPriority(variable)]);const value=palette[path];if(typeof value==='string')element.style.setProperty(variable,value)}},
 restore(){for(const [variable,[value,priority]] of prior){if(value)element.style.setProperty(variable,value,priority);else element.style.removeProperty(variable)}prior.clear()}
 }}


/* MODULE: adapters/contrast-audit.js */

/** Reports actual text/background contrast without modifying the host. */
function auditContrast(root,{minimum=4.5,maxNodes=5000,ignoreSelector='[data-prism-ignore]'}={}){
 const doc=root.nodeType===9?root:root.ownerDocument;const win=doc?.defaultView;if(!win)throw new Error('Browser DOM required');
 const nodes=root.querySelectorAll('*'),issues=[];let inspected=0,unknown=0,passing=0;
 for(const el of nodes){if(inspected>=maxNodes)break;if(el.matches('script,style,svg,path,img,video,canvas')||el.closest(ignoreSelector))continue;
  // Skip non-text containers: detect own text nodes so repeated ancestors are not counted.
  if(![...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;
  const computed=win.getComputedStyle(el);if(computed.display==='none'||computed.visibility==='hidden'||computed.opacity==='0')continue;
  const foreground=parseColor(computed.color);if(!foreground){unknown++;continue}
  let bg=rgb(255,255,255),found=false;let current=el;
  while(current){const c=parseColor(win.getComputedStyle(current).backgroundColor);if(c&&c.a>0){bg=composite(c,bg);found=true;if(c.a===1)break}current=current.parentElement}
  if(!found){const fallback=parseColor(win.getComputedStyle(doc.documentElement).backgroundColor);if(fallback)bg=composite(fallback,bg)}
  const ratio=contrastRatio(composite(foreground,bg),bg);inspected++;if(ratio<minimum)issues.push({element:el,ratio:+ratio.toFixed(2),foreground:computed.color,background:bg,minimum});else passing++;
 }
 return {inspected,passing,failing:issues.length,unknown,issues};
}


/* MODULE: adapters/sway-theme.js */
/** Optional Sway/i3 IPC CONFIG TEXT exporter, not an operating-system control program.
 * A host application must explicitly choose whether/how to submit these commands.
 * No source code from the Sway compositor is embedded.
 */

const safeColor=value=>{const c=parseColor(value);if(!c)throw new TypeError('Expected CSS hex/rgb color: '+String(value));return toHex(c)};
const STATES=['focused','focused_inactive','unfocused','urgent','placeholder'];
function makeSwayTheme({background='#ececec',foreground='#222222',accent='#477bba',urgent='#bf4a3f'}={}){
 const base=parseColor(background),text=parseColor(foreground),focus=parseColor(accent),alarm=parseColor(urgent);
 const dark=remapSurface(base),font=mapText(text,dark,{minimum:4.5});
 return {
  focused:[toHex(focus),toHex(dark),toHex(font),toHex(focus),toHex(focus)],
  focused_inactive:[toHex(mix(focus,dark,.55)),toHex(mix(base,dark,.83)),toHex(font),toHex(dark),toHex(dark)],
  unfocused:[toHex(dark),toHex(dark),toHex(font),toHex(dark),toHex(dark)],
  urgent:[toHex(alarm),toHex(dark),toHex(font),toHex(alarm),toHex(alarm)],
  placeholder:[toHex(dark),toHex(dark),toHex(font),toHex(dark),toHex(dark)]
 };
}
function toSwayConfig(theme){return STATES.map(key=>{const value=theme[key];if(!Array.isArray(value)||value.length!==5)throw new TypeError('Bad Sway palette');return `client.${key} ${value.map(safeColor).join(' ')}`}).join('\n')+'\n'}
function getSwayCommands(theme){return toSwayConfig(theme).trim().split('\n')}


/* MODULE: adapters/presets.js */
/** Host-independent presets. None assumes any particular application's colors. */

const COLOR_PRESETS=Object.freeze({
 charcoal:Object.freeze({background:'#f8fafc',foreground:'#222731',accent:'#557ec8',surfaceLightness:.11}),
 midnight:Object.freeze({background:'#faf6ee',foreground:'#302d31',accent:'#5a6ba9',surfaceLightness:.075}),
 oled:Object.freeze({background:'#ffffff',foreground:'#121212',accent:'#5178cc',surfaceLightness:.04}),
 soft:Object.freeze({background:'#fffaf2',foreground:'#383534',accent:'#79936e',surfaceLightness:.22}),
 highContrast:Object.freeze({background:'#ffffff',foreground:'#111111',accent:'#226fbd',surfaceLightness:.045,minimumContrast:7})
});
function presetTokens(name,overrides={}){const preset=COLOR_PRESETS[name];if(!preset)throw new RangeError('Unknown preset');const settings={...preset,...overrides};const p=makePalette(settings,settings);return {'--prism-semantic-bg':toCss(p.surface),'--prism-semantic-fg':toCss(p.foreground),'--prism-semantic-surface':toCss(p.surface),'--prism-semantic-border':toCss(p.border),'--prism-semantic-accent':toCss(p.accent)}}


g.PrismShiftEngine=Object.freeze({PrismShift,createPrismShift,MODES,DEFAULTS,normalizeOptions,parseColor,toHex,toCss,rgb,luminance,contrastRatio,invertColor,invertBlackWhite,ensureContrast,toOKLab,fromOKLab,remapSurface,mapText,makePalette,mix,composite,processPixels,processImageData,invertPixels,invertImageData,createWasmProcessor,invertAnsi,createAnsiTransformer,invertAnsiColorPair,createStylesheetController,createTokenMapper,auditContrast,makeSwayTheme,toSwayConfig,getSwayCommands,COLOR_PRESETS,presetTokens});
})(typeof globalThis!=="undefined"?globalThis:this);
