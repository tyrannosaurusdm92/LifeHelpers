/* OurSpace Layout Studio. Archived MySpace rules are data, never executable CSS. */
(()=>{'use strict';
const BUNDLES=window.OurSpaceLayoutCategories||[];
const ORIGINALS=BUNDLES.flatMap(b=>b.layouts);
const BY_ID=new Map(ORIGINALS.map(x=>[x.id,x]));
const CATEGORIES=['Aesthetics','Goth/Horror/Emo','Nature','Seasonal','Animals','Fandoms','Romance','Fantasy','History','Pride & Identity','Real Life'];
const PAGES=[['profile','About / Profile'],['household','Household'],['journal','Journal & Diary Cards'],['feed','Feed'],['skills','Skills'],['communication','Communication'],['audio','Audio'],['visual','Visual'],['store','Store']];
// Resolve the page from navigation first; the static HTML attribute is only a fallback.
const requestedPage=new URLSearchParams(location.search).get('page');
const page=PAGES.some(([id])=>id===requestedPage)?requestedPage:(PAGES.some(([id])=>id===document.documentElement.dataset.ourspaceCurrentPage)?document.documentElement.dataset.ourspaceCurrentPage:'profile');
const previewOnly=new URLSearchParams(location.search).has('os-layout-preview');
// Uploaded artwork remains in memory during Preview; no live account storage
// writes occur until the user explicitly Applies or Saves the preset.
const stagedImages=new Map();
const KEY='ourspace:'+String(window.OurSpaceDesignContext?.account||'site')+':myspace-layout-studio:v1';
const FONT_CHOICES=['','Verdana,Arial,sans-serif','Arial,Helvetica,sans-serif','Georgia,serif','"Times New Roman",serif','"Trebuchet MS",sans-serif','Tahoma,sans-serif','"Courier New",monospace','system-ui,sans-serif'];
const REPEAT_CHOICES=['','repeat','no-repeat','repeat-x','repeat-y','space','round'];
const ATTACH_CHOICES=['','fixed','scroll','local'];
const COLOR_FIELDS=[['page','Page background'],['panel','Panel background'],['header','Heading background'],['text','Text / labels'],['headerText','Heading text'],['border','Borders'],['button','Buttons'],['buttonText','Button text'],['buttonHover','Button hover'],['hoverText','Hover text'],['nav','Navigation'],['navText','Navigation text'],['navHover','Navigation hover'],['navHoverText','Navigation hover text'],['navSelected','Selected navigation'],['navSelectedText','Selected navigation text'],['input','Inputs'],['accent','Accent'],['link','Links'],['scrollTrack','Scrollbar track'],['scrollThumb','Scrollbar thumb'],['scrollHover','Scrollbar hover'],['overlayColor','Overlay color'],['hudCyanLight','Cyan · Light'],['hudCyanMedium','Cyan · Medium'],['hudCyanDeep','Cyan · Deep'],['hudPersimmonLight','Persimmon orange · Light'],['hudPersimmonMedium','Persimmon orange · Medium'],['hudPersimmonDeep','Persimmon orange · Deep'],['hudCadmiumLight','Cadmium yellow · Light'],['hudCadmiumMedium','Cadmium yellow · Medium'],['hudCadmiumDeep','Cadmium yellow · Deep'],['hudSteelBlueLight','Steel blue · Light'],['hudSteelBlueMedium','Steel blue · Medium'],['hudSteelBlueDeep','Steel blue · Deep'],['hudTealLight','Teal · Light'],['hudTealMedium','Teal · Medium'],['hudTealDeep','Teal · Deep']];
const SOURCE_COLORS=['page','panel','header','button','buttonHover','nav','navHover','navSelected','input','border','accent','scrollTrack','scrollThumb','scrollHover','overlayColor','selected'];
const TEXT_COLORS=['text','headerText','buttonText','hoverText','navText','navHoverText','navSelectedText','link','selectedText','muted','focus'];
const HUD_FAMILY_KEYS=['hudCyan','hudPersimmon','hudCadmium','hudSteelBlue','hudTeal'].flatMap(k=>['Light','Medium','Deep'].map(s=>k+s));
/* Custom layouts reference their archive source instead of copying its CSS and
 * assets into localStorage. Rehydrate legacy Pass 14 records and compact records
 * with the same archive record, preserving all original credits and images. */
const CUSTOM_FIELDS=['id','title','parentId','baseMode','originalMode','customBase','customModeOverrides','customImage','customPosition','customSize','customRepeat','customAttachment','customFontFamily','customFontWeight','customFontStyle'];
function compactCustom(layout){const compact={};for(const key of CUSTOM_FIELDS)if(Object.hasOwn(layout,key))compact[key]=layout[key];return compact}
function hydrateCustom(record){
 if(!record||typeof record.id!=='string'||!record.id.startsWith('custom-')||typeof record.title!=='string')return null;
 const source=BY_ID.get(record.parentId);if(!source)return null;
 const values=compactCustom(record);
 return {...source,...values,parentId:source.id,group:source.group,subcategory:source.subcategory,
  customModeOverrides:{light:record.customModeOverrides?.light||{},dark:record.customModeOverrides?.dark||{}}};
}
const stored=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}};
const saved=stored();
const state={pages:saved?.pages&&typeof saved.pages==='object'?saved.pages:{},global:saved?.global||null,previousPage:saved?.previousPage||{},previousGlobal:saved?.previousGlobal||null,preGlobalPages:saved?.preGlobalPages&&typeof saved.preGlobalPages==='object'?saved.preGlobalPages:null,history:Array.isArray(saved?.history)?saved.history.slice(-25):[],favorites:Array.isArray(saved?.favorites)?saved.favorites:[],recent:Array.isArray(saved?.recent)?saved.recent:[],custom:Array.isArray(saved?.custom)?saved.custom.map(hydrateCustom).filter(Boolean):[]};
for(const x of state.custom)BY_ID.set(x.id,x);
const layouts=()=>[...ORIGINALS,...state.custom];
let selected=ORIGINALS[0],category='',subcategory='',filter='',query='',mode=selected.originalMode||'light',draftByMode={light:{},dark:{}},previewPage=PAGES.some(x=>x[0]===page)?page:'profile',activeAssignment=null,frameLoaded=false,studio=null;
let themeRevision=0;
const $=id=>document.getElementById(id);
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp','<':'&lt','>':'&gt','"':'&quot'}[c]));
const safeColor=s=>/^#[a-f\d]{6}$/i.test(String(s||''))?String(s).toLowerCase():null;
const api=()=>window.PrismShiftEngine;
function parse(s){return api()?.parseColor(s)||api()?.parseColor('#808080')}
function hex(c){return api()?.toHex(c)||'#808080'}
function contrast(fg,bg,min=4.5){return hex(api().ensureContrast(parse(fg),parse(bg),min))}
function dark(c,elev=.20){return hex(api().remapSurface(parse(c),{surfaceLightness:elev,chroma:.82}))}
function light(c,level=.91){const lab=api().toOKLab(parse(c));return hex(api().fromOKLab({L:level,a:lab.a*.48,b:lab.b*.48,alpha:1}))}
function validImage(value){const v=String(value||'').trim();if(!v)return '';if(/^data:image\/(png|gif|jpeg|webp|avif|svg\+xml);base64,[a-z0-9+/=]+$/i.test(v))return v;if(/^ourspace-bg:[\w-]+$/i.test(v)||/^ourspace-pending:[\w-]+$/i.test(v))return v;try{const u=new URL(v);return u.protocol==='https:'?u.href:''}catch{return ''}}
function imageURL(url){return url?'url('+JSON.stringify(url).replace(/</g,'\\u003c')+')':'none'}
function persist(){try{localStorage.setItem(KEY,JSON.stringify({...state,custom:state.custom.map(compactCustom)}));return true}catch{setStatus('Browser storage is full. Export your customized layouts or try a smaller image.');return false}}
function discardStagedImages(){for(const {url} of stagedImages.values())URL.revokeObjectURL(url);stagedImages.clear()}
// Revoke only assets no longer referenced by either appearance mode.
function pruneStagedImages(){const used=new Set(Object.values(draftByMode).map(v=>v.backgroundImage));for(const [id,item] of stagedImages){if(!used.has(id)){URL.revokeObjectURL(item.url);stagedImages.delete(id)}}}
async function commitStagedImages(){
 const refs=[...new Set(Object.values(draftByMode).map(v=>v.backgroundImage).filter(v=>stagedImages.has(v)))];
 for(const ref of refs){
  const item=stagedImages.get(ref);
  try{
   if(!window.OurSpaceBackgroundStore?.save)throw Error('Image storage is unavailable');
   const savedRef=await window.OurSpaceBackgroundStore.save(item.file);
   for(const changes of Object.values(draftByMode))if(changes.backgroundImage===ref)changes.backgroundImage=savedRef;
  }catch(error){setStatus('Image could not be saved: '+(error.message||String(error)));return false}
 }
 discardStagedImages();return true;
}
function baseTokens(x,variant){
 if(x.customBase){const copy={...x.customBase};if(x.baseMode!==variant){for(const key of HUD_FAMILY_KEYS)delete copy[key];
  for(const key of SOURCE_COLORS)if(safeColor(copy[key]))copy[key]=variant==='dark'?dark(copy[key],key==='panel'?.23:.17):light(copy[key],key==='panel'?.94:.86);
  const pairs=[['text','panel'],['headerText','header'],['buttonText','button'],['hoverText','buttonHover'],['navText','nav'],['navHoverText','navHover'],['navSelectedText','navSelected'],['selectedText','selected'],['link','panel'],['muted','panel'],['focus','panel']];
  for(const [fg,bg] of pairs)copy[fg]=contrast(copy[fg]||'#778899',copy[bg]||'#ffffff',fg==='focus'?3:4.5);
 }
 return {...copy,...(x.customModeOverrides?.[variant]||{})};}
 const p=x.palette||{},body=x.sourceStyle?.backgroundColor;
 let t={page:safeColor(body)||p.light||'#e8edf3',panel:p.paper||'#fff',header:p.header||'#325b7a',button:p.button||'#4f739b',buttonHover:p.buttonHover||'#365c80',nav:p.nav||'#4f739b',navHover:p.buttonHover||'#365c80',navSelected:p.header||'#325b7a',input:p.light||'#f1f4f6',border:p.border||'#627f91',accent:safeColor(x.thumbColor)||p.border||'#457da4',scrollTrack:p.light||'#dae8f0',scrollThumb:p.nav||'#5a91b1',scrollHover:p.buttonHover||'#337fa5',overlayColor:p.mast||'#607d8b',selected:p.header||'#325b7a'};
 if(variant==='dark')for(const k of SOURCE_COLORS)t[k]=dark(t[k],k==='panel'?.22:k==='page'?.13:.24);
 else if(x.originalMode==='dark'){
  t.page=light(t.page,.92);t.panel=light(t.panel,.97);t.input=light(t.input,.91);t.nav=light(t.nav,.77);t.header=light(t.header,.65);t.button=light(t.button,.72);t.buttonHover=light(t.buttonHover,.60);t.scrollTrack=light(t.scrollTrack,.88);
 }
 Object.assign(t,{text:contrast(p.bodyText||'#202633',t.panel),headerText:contrast(p.headerText||'#ffffff',t.header),buttonText:contrast(p.buttonText||'#ffffff',t.button),hoverText:contrast(p.buttonHoverText||'#ffffff',t.buttonHover),navText:contrast(p.navText||'#ffffff',t.nav),navHoverText:contrast(p.navText||'#ffffff',t.navHover),navSelectedText:contrast(p.headerText||'#ffffff',t.navSelected),selectedText:contrast(p.headerText||'#ffffff',t.selected),link:contrast(p.nav||'#337aaa',t.panel,4.5),muted:contrast('#667588',t.panel,3.2),focus:contrast(t.accent,t.panel,3)});
 return t;
}
function resolved(x,variant,edits={}){
 const t={...baseTokens(x,variant)};
 for(const [key,val] of Object.entries(edits)){
  if(COLOR_FIELDS.some(y=>y[0]===key)&&safeColor(val))t[key]=safeColor(val);
  if(key==='overlayOpacity')t[key]=Math.min(.85,Math.max(0,Number(val)||0));
  if(key==='backgroundImage')t[key]=validImage(val);
  if(key==='backgroundPosition'&&/^[\w\s%.-]{1,55}$/.test(val))t[key]=val;
  if(key==='backgroundSize'&&/^[\w\s%.-]{1,55}$/.test(val))t[key]=val;
  if(key==='backgroundRepeat'&&REPEAT_CHOICES.includes(val))t[key]=val;
  if(key==='backgroundAttachment'&&ATTACH_CHOICES.includes(val))t[key]=val;
  if(key==='fontFamily'&&FONT_CHOICES.includes(val))t[key]=val;
  if(key==='fontWeight'&&['','normal','bold'].includes(val))t[key]=val;
  if(key==='fontStyle'&&['','normal','italic'].includes(val))t[key]=val;
 }
 t.overlayOpacity??=0.08;
 t.backgroundImage??=x.customImage??x.sourceStyle?.backgroundImage??'';
 t.backgroundPosition??=x.customPosition??x.sourceStyle?.backgroundPosition??'center top';
 t.backgroundSize??=x.customSize??x.sourceStyle?.backgroundSize??'auto';
 t.backgroundRepeat??=x.customRepeat??x.sourceStyle?.backgroundRepeat??'repeat';
  t.backgroundAttachment??=x.customAttachment??x.sourceStyle?.backgroundAttachment??'scroll';
 t.fontFamily??=x.customFontFamily??'';t.fontWeight??=x.customFontWeight??'';t.fontStyle??=x.customFontStyle??'';

 t.navHover??=t.buttonHover;t.navSelected??=t.selected;t.navHoverText??=contrast(t.navText,t.navHover);t.navSelectedText??=contrast(t.selectedText,t.navSelected);
 const families={hudCyan:t.accent,hudPersimmon:t.button,hudCadmium:t.selected,hudSteelBlue:t.input,hudTeal:t.nav};
 for(const [family,base] of Object.entries(families)){
  t[family+'Light']??=light(base,variant==='dark'?.72:.91);
  t[family+'Medium']??=base;
  t[family+'Deep']??=dark(base,variant==='dark'?.11:.28);
 }
 t.pageText=contrast(t.text,t.page);t.inputText=contrast(t.text,t.input);t.inputPlaceholder=contrast(t.muted,t.input);
 return t;
}
function sanitizeEdits(edits){const clean={};if(!edits||typeof edits!=='object')return clean;
 for(const [key,val] of Object.entries(edits)){
  if(COLOR_FIELDS.some(y=>y[0]===key)&&safeColor(val))clean[key]=safeColor(val);
  else if(key==='overlayOpacity')clean[key]=Math.min(.85,Math.max(0,Number(val)||0));
  else if(key==='backgroundImage')clean[key]=validImage(val);
  else if((key==='fontFamily'&&FONT_CHOICES.includes(val))||(key==='fontWeight'&&['','normal','bold'].includes(val))||(key==='fontStyle'&&['','normal','italic'].includes(val))||(key==='backgroundRepeat'&&REPEAT_CHOICES.includes(val))||(key==='backgroundAttachment'&&ATTACH_CHOICES.includes(val)))clean[key]=val;
  else if((key==='backgroundPosition'||key==='backgroundSize')&&typeof val==='string'&&/^[\w\s%.-]{1,55}$/.test(val))clean[key]=val;
 }return clean}
function setTokens(x,variant,edits={}){
 const root=document.documentElement,t=resolved(x,variant,edits);
 const revision=++themeRevision;
 if(window.OurSpaceAppearance?.mode==='dark')window.OurSpaceAppearance.setMode('light',{save:false,broadcast:false});
 root.dataset.osLayoutActive='true';root.dataset.osLayoutId=x.parentId||x.id;root.dataset.osLayoutBundle=x.bundle;root.dataset.osLayoutMode=variant;root.dataset.osLayoutFont=t.fontFamily||x.sourceStyle?.fontFamily&&x.sourceStyle.fontFamily.toLowerCase()!=='inherit'?'on':'off';root.dataset.osLayoutBold=(t.fontWeight||x.sourceStyle?.fontWeight)==='bold'?'on':'off';root.dataset.osLayoutItalic=(t.fontStyle||x.sourceStyle?.fontStyle)==='italic'||(!t.fontStyle&&x.sourceStyle?.fontStyle==='oblique')?'on':'off';root.style.setProperty('--osls-font-choice',FONT_CHOICES.includes(t.fontFamily)&&t.fontFamily?t.fontFamily:(x.sourceStyle?.fontFamily||'inherit'));
 for(const [key,val] of Object.entries({page:t.page,pageText:t.pageText,panel:t.panel,header:t.header,text:t.text,inputText:t.inputText,inputPlaceholder:t.inputPlaceholder,headerText:t.headerText,border:t.border,button:t.button,buttonText:t.buttonText,buttonHover:t.buttonHover,hoverText:t.hoverText,nav:t.nav,navText:t.navText,navHover:t.navHover,navHoverText:t.navHoverText,navSelected:t.navSelected,navSelectedText:t.navSelectedText,input:t.input,accent:t.accent,link:t.link,scrollTrack:t.scrollTrack,scrollThumb:t.scrollThumb,scrollHover:t.scrollHover,muted:t.muted,focus:t.focus,selected:t.selected,selectedText:t.selectedText}))root.style.setProperty('--osls-'+key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),val);
 for(const family of ['hudCyan','hudPersimmon','hudCadmium','hudSteelBlue','hudTeal'])for(const shade of ['Light','Medium','Deep']){const key=family+shade;root.style.setProperty('--osls-'+key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),t[key]);}
 // A converted theme uses the original CSS image stack (including gradients) until the user chooses another image.
 // Never paste archived MySpace geometry or selectors into the host document.
 const actualBackground=x.sourceStyle?.backgroundImage||'';
 const background=t.backgroundImage===''?'':(validImage(t.backgroundImage)||actualBackground);
 const archiveLayers=x.sourceStyle?.backgroundLayers||'';
 root.style.setProperty('--osls-background-image',background&&background===actualBackground&&archiveLayers?archiveLayers:imageURL(background));
 root.style.setProperty('--osls-background-position',t.backgroundPosition);
 root.style.setProperty('--osls-background-size',t.backgroundSize);
 root.style.setProperty('--osls-background-repeat',t.backgroundRepeat||x.sourceStyle?.backgroundRepeat||'repeat');
 root.style.setProperty('--osls-background-attachment',t.backgroundAttachment||x.sourceStyle?.backgroundAttachment||'scroll');
 const rgb=parse(t.overlayColor),opacity=Math.min(.85,Math.max(0,Number(t.overlayOpacity)||0));
 root.style.setProperty('--osls-overlay',`rgba(${rgb.r},${rgb.g},${rgb.b},${opacity})`);
 const storage=window.OurSpaceBackgroundStore;
 if(background.startsWith('ourspace-bg:')&&storage?.ensure)storage.ensure(background).then(url=>{if(revision===themeRevision)root.style.setProperty('--osls-background-image',imageURL(url))}).catch(()=>{});
 document.dispatchEvent(new CustomEvent('ourspace:layoutchange',{detail:{layoutId:x.id,mode:variant,preview:previewOnly}}));
 updateModeButton(variant);return t;
}
function clearTokens(){themeRevision++;const root=document.documentElement;delete root.dataset.osLayoutActive;delete root.dataset.osLayoutId;delete root.dataset.osLayoutBundle;delete root.dataset.osLayoutMode;delete root.dataset.osLayoutFont;delete root.dataset.osLayoutBold;delete root.dataset.osLayoutItalic;for(const key of [...root.style])if(key.startsWith('--osls-'))root.style.removeProperty(key);activeAssignment=null;try{const prior=localStorage.getItem('ourspace:appearance:prismshift:v1');if(prior)window.OurSpaceAppearance?.setMode(prior,{save:false,broadcast:false})}catch{}}
function getAssignment(){return state.global||state.pages[page]||null}
function assignmentEdits(a){return a.modeOverrides?.[a.mode]||a.overrides||{}}
function applyLive(){if(previewOnly)return;const a=getAssignment(),x=a&&BY_ID.get(a.id);if(x){activeAssignment=a;setTokens(x,a.mode||x.originalMode,assignmentEdits(a))}else{clearTokens();updateModeButton(window.OurSpaceAppearance?.mode||'light')}}
function updateModeButton(variant){const b=$('osPrismShiftToggle');if(!b)return;if(!getAssignment()||previewOnly)return;const next=variant==='dark'?'Light':'Dark';b.setAttribute('aria-label','Switch this OurSpace layout to '+next.toLowerCase()+' mode');b.setAttribute('title','Switch layout to '+next.toLowerCase()+' mode');b.setAttribute('aria-pressed',String(variant==='dark'));const icon=b.querySelector('.os-appearance-icon');if(icon)icon.textContent=variant==='dark'?'◐':'◑';const label=b.querySelector('.os-appearance-label');if(label)label.textContent=next+' Mode';b.classList.toggle('os-show-light',variant==='dark');}
function setupModeButton(){const b=$('osPrismShiftToggle');if(!b)return;b.addEventListener('click',e=>{
 if(!getAssignment())return;
 e.preventDefault();e.stopImmediatePropagation();snapshot();
 // Switching the mode of THIS page must not silently switch every other page.
 // Undo can restore the preceding account-wide state in one action.
 if(state.global){
  if(!state.preGlobalPages)state.preGlobalPages=structuredClone(state.pages);
  for(const [id] of PAGES)state.pages[id]=structuredClone(state.global);
  state.global=null;
 }
 const a=state.pages[page];if(!a)return;
 state.previousPage[page]=structuredClone(a);
 if(!a.modeOverrides)a.modeOverrides={light:a.mode==='light'?{...(a.overrides||{})}:{},dark:a.mode==='dark'?{...(a.overrides||{})}:{}};
 a.mode=a.mode==='dark'?'light':'dark';
 persist();applyLive();if(studio?.open){mode=a.mode;renderControls();sendPreview()}
},true)}
window.OurSpaceLayoutPalette=Object.freeze({count:ORIGINALS.length,categories:[...CATEGORIES],resolve:(id,variant,edits={})=>{const x=BY_ID.get(id);if(!x)throw Error('Unknown layout');return resolved(x,variant==='dark'?'dark':'light',edits)},originals:()=>ORIGINALS.map(x=>({id:x.id,title:x.title,group:x.group,originalMode:x.originalMode}))});
if(previewOnly){
 let currentPreviewId='';
 window.addEventListener('message',e=>{if(e.source!==window.parent)return;if(e.origin!==location.origin&&e.origin!=='null'&&location.origin!=='null')return;if(e.data?.type==='osls-preview-theme'){
  // The parent can create/import a custom preset after this real Demo Account
  // preview iframe has loaded. Rehydrate that single preset from its original
  // archive entry rather than forcing a second page load or copying raw CSS.
  let x=BY_ID.get(e.data.id);
  if(e.data.custom?.id===e.data.id){
   const updated=hydrateCustom(e.data.custom);
   if(updated){x=updated;BY_ID.set(updated.id,updated)}
  }
  if(x){
   currentPreviewId=x.id;
   const chosen=e.data.mode==='dark'?'dark':'light';
   setTokens(x,chosen,sanitizeEdits(e.data.overrides));
   window.parent.postMessage({type:'osls-preview-applied',id:x.id,mode:chosen},'*');
  }else window.parent.postMessage({type:'osls-preview-error',id:e.data.id},'*');
 }else if(e.data?.type==='osls-preview-background'&&e.data.id===currentPreviewId&&/^blob:/.test(e.data.url||'')){
  document.documentElement.style.setProperty('--osls-background-image',imageURL(e.data.url));
 }});
 document.addEventListener('click',e=>{const a=e.target.closest('a[data-page-link],a[href^="?page="]');if(!a)return;const u=new URL(a.href,location.href);u.searchParams.set('os-layout-preview','1');a.href=u.href;window.parent.postMessage({type:'osls-preview-page',page:u.searchParams.get('page')},'*')},true);
 window.parent.postMessage({type:'osls-preview-ready',page},'*');
 const reportBounds=()=>{const profile=document.getElementById('profileApp');const inner=profile?.querySelector('.profile-content');const width=Math.ceil(Math.max(document.documentElement.scrollWidth,profile?.scrollWidth||0,(inner?.getBoundingClientRect().right||0)+100));const height=Math.ceil(Math.max(document.documentElement.scrollHeight,profile?.scrollHeight||0,inner?.getBoundingClientRect().bottom||0));window.parent.postMessage({type:'osls-preview-dimensions',width,height},'*')};
 window.addEventListener('load',reportBounds,{once:true});setTimeout(reportBounds,300);return;
}
function setStatus(s){const node=$('oslsStatus');if(node)node.textContent=s}
function snapshot(){state.history.push({pages:structuredClone(state.pages),global:structuredClone(state.global),preGlobalPages:structuredClone(state.preGlobalPages),previousPage:structuredClone(state.previousPage),previousGlobal:structuredClone(state.previousGlobal)});state.history=state.history.slice(-25)}
function assignment(){return {id:selected.id,mode,overrides:{...draftByMode[mode]},modeOverrides:{light:{...draftByMode.light},dark:{...draftByMode.dark}}}}
async function apply(scope){
 if(!(await commitStagedImages()))return;
 snapshot();const a=assignment(),target=PAGES.some(x=>x[0]===previewPage)?previewPage:page;
 if(scope==='global'){
  state.previousGlobal=structuredClone(state.global);
  if(!state.global)state.preGlobalPages=structuredClone(state.pages);
  state.global=a;
 }else{
  // Switching out of an account-wide theme must not silently change the OTHER pages.
  // Materialize its currently visible appearance as independent assignments first.
  if(state.global){for(const [id] of PAGES)state.pages[id]=structuredClone(state.global);state.global=null;}
  state.previousPage[target]=structuredClone(state.pages[target]||null);
  state.pages[target]=a;
 }
 state.recent=[a.id,...state.recent.filter(id=>id!==a.id)].slice(0,20);
 const stored=persist();applyLive();renderList();
 const label=PAGES.find(x=>x[0]===target)?.[1]||target;
 setStatus(stored?(scope==='global'?'Applied to all nine OurSpace pages. Individual assignments are saved for restoration.':'Applied only to '+label+'. Other pages keep their existing appearance.'):'Layout applied for this session only. Browser storage is full; assignments may be lost on navigation.');
}
function restore(type){
 if(type==='undo'){
  const last=state.history.pop();if(!last)return setStatus('No earlier layout assignment to restore.');
  state.pages=last.pages;state.global=last.global;state.preGlobalPages=last.preGlobalPages;
  state.previousPage=last.previousPage;state.previousGlobal=last.previousGlobal;
 }else{
  snapshot();
  const target=PAGES.some(x=>x[0]===previewPage)?previewPage:page;
  if(type==='page'){
   if(state.global){for(const [id] of PAGES)state.pages[id]=structuredClone(state.global);state.global=null;}
   const old=state.previousPage[target];if(old)state.pages[target]=structuredClone(old);else delete state.pages[target];
  }
  if(type==='global'){state.global=structuredClone(state.previousGlobal);}
  if(type==='individual'){
   state.global=null;
   if(state.preGlobalPages){state.pages=structuredClone(state.preGlobalPages);state.preGlobalPages=null;}
  }
 }
 persist();applyLive();setStatus(type==='individual'?'Restored the individual page assignments saved before account-wide application.':'Restored the previous layout assignment.');
}
function regenerateAlternateMode(){
 const target=mode==='dark'?'light':'dark', current=selectedTokens();
 const generated={...draftByMode[target]};
 // Convert color tokens intelligently, rather than filtering/inverting images.
 for(const key of SOURCE_COLORS){
  const value=safeColor(current[key]);if(!value)continue;
  generated[key]=target==='dark'?dark(value,key==='panel'?.22:key==='page'?.13:.24):light(value,key==='panel'?.97:key==='page'?.92:.77);
 }
 const pairs=[['text','panel'],['headerText','header'],['buttonText','button'],['hoverText','buttonHover'],['navText','nav'],['navHoverText','navHover'],['navSelectedText','navSelected'],['selectedText','selected'],['link','panel'],['muted','panel'],['focus','panel']];
 for(const [ink,surface] of pairs)generated[ink]=contrast(current[ink]||'#617689',generated[surface]||'#ffffff',ink==='focus'?3:4.5);
 const families={hudCyan:'accent',hudPersimmon:'button',hudCadmium:'selected',hudSteelBlue:'input',hudTeal:'nav'};
 for(const [family,source] of Object.entries(families)){
  const color=generated[source]||'#6789ab';
  generated[family+'Light']=light(color,target==='dark'?.72:.91);
  generated[family+'Medium']=color;
  generated[family+'Deep']=dark(color,target==='dark'?.11:.28);
 }
 // Decorative image/GIF is kept unchanged on purpose; the two modes can
 // subsequently customize their own backgrounds and typography independently.
 for(const key of ['backgroundImage','backgroundPosition','backgroundSize','backgroundRepeat','backgroundAttachment','fontFamily','fontWeight','fontStyle','overlayOpacity'])generated[key]=current[key];
 draftByMode[target]=generated;mode=target;renderControls();sendPreview();
 setStatus('Generated the '+target+' counterpart from your edits. The original artwork is unchanged; each mode can now be edited independently.');
}
function draft(){return draftByMode[mode]}
function selectedTokens(){return resolved(selected,mode,draft())}
function selectLayout(x){discardStagedImages();selected=x;mode=x.originalMode||x.baseMode||'light';draftByMode={light:{},dark:{}};renderControls();renderList();sendPreview()}
function filtered(){const term=query.toLowerCase();return layouts().filter(x=>{
 if(category&&x.group!==category)return false;
 if(subcategory&&x.subcategory!==subcategory)return false;
 if(filter==='favorites'&&!state.favorites.includes(x.id))return false;
 if(filter==='recent'&&!state.recent.includes(x.id))return false;
 if(filter==='mine'&&!x.parentId)return false;
 return !term||[x.title,x.group,x.subcategory,x.author,x.source,x.id].join(' ').toLowerCase().includes(term)
 })}
function renderCategories(){const box=$('oslsCategories');if(!box)return;box.replaceChildren();for(const cat of ['',...CATEGORIES]){const b=document.createElement('button');b.type='button';b.textContent=cat||'All';b.setAttribute('aria-pressed',String(cat===category));b.title=(cat?layouts().filter(x=>x.group===cat):layouts()).length+' layouts';b.onclick=()=>{category=cat;subcategory='';renderCategories();renderSubcategories();renderList()};box.append(b)}}
function renderSubcategories(){const sel=$('oslsSubcategory');sel.replaceChildren(new Option('All subcategories',''));for(const name of [...new Set(layouts().filter(x=>!category||x.group===category).map(x=>x.subcategory).filter(Boolean))].sort())sel.append(new Option(name,name));sel.value=subcategory}
function renderList(){renderLooksPresetCatalog();const found=filtered();$('oslsCount').textContent=found.length+' of '+layouts().length+' layouts';const box=$('oslsList');box.replaceChildren();for(const x of found){const b=document.createElement('button');b.type='button';b.className='osls-card'+(x.id===selected.id?' selected':'');b.title=x.title+' · '+(x.author||x.source||'Archive');b.setAttribute('aria-pressed',String(x.id===selected.id));const art=document.createElement('span');art.className='osls-card-art';art.style.setProperty('--thumb',safeColor(x.thumbColor)||'#8ca7c5');const url=validImage(x.thumbImage||x.sourceStyle?.backgroundImage);if(url)art.style.setProperty('--thumb-image',imageURL(url));const info=document.createElement('span');const title=document.createElement('strong');title.textContent=x.title;const sub=document.createElement('small');sub.textContent=x.group+' · '+(x.subcategory||'Archive')+' · '+(x.author||x.source||'');info.append(title,sub);const fav=document.createElement('span');fav.textContent=state.favorites.includes(x.id)?'★':'☆';b.append(art,info,fav);b.onclick=()=>selectLayout(x);box.append(b)}}
function colorField(key,label,value){const wrap=document.createElement('label');wrap.textContent=label;const row=document.createElement('span');row.className='osls-color';const picker=document.createElement('input');picker.type='color';picker.value=safeColor(value)||'#808080';picker.dataset.color=key;const typed=document.createElement('input');typed.type='text';typed.value=picker.value;typed.maxLength=7;typed.setAttribute('aria-label',label+' hex color');const update=v=>{if(!safeColor(v))return;picker.value=safeColor(v);typed.value=picker.value;draft()[key]=picker.value;sendPreview()};picker.oninput=()=>update(picker.value);typed.onchange=()=>update(typed.value);row.append(picker,typed);wrap.append(row);return wrap}

 function renderSourceComparison(){
  const original=$('oslsSourceArtwork'),converted=$('oslsConvertedArtwork'),info=$('oslsSourceFacts');
  if(!original||!converted||!info)return;
  const src=selected.sourceStyle||{},t=selectedTokens();
  const originalImage=src.backgroundLayers||(validImage(src.backgroundImage)?imageURL(src.backgroundImage):'none');
  const convertedImage=t.backgroundImage===src.backgroundImage&&src.backgroundLayers?src.backgroundLayers:imageURL(validImage(t.backgroundImage));
  for(const [node,img,size,repeat,position,attachment] of [
   [original,originalImage,src.backgroundSize||'auto',src.backgroundRepeat||'repeat',src.backgroundPosition||'0% 0%',src.backgroundAttachment||'scroll'],
   [converted,convertedImage,t.backgroundSize,t.backgroundRepeat,t.backgroundPosition,t.backgroundAttachment]]){
    node.style.backgroundImage=img||'none';node.style.backgroundColor=t.page;
    node.style.backgroundSize=size||'auto';node.style.backgroundRepeat=repeat||'repeat';
    node.style.backgroundPosition=position||'center';node.style.backgroundAttachment=attachment||'scroll';
  }
  original.style.backgroundColor=src.backgroundColor||selected.thumbColor||'#e0e0e0';
  const assets=$('oslsCompareAssets');if(assets){assets.replaceChildren();
   for(const [label,url] of [['Panel texture',src.panelImage],['Header artwork',src.headerImage],['Decorative art',src.ornamentImage],['Border artwork',src.borderImage]]){
    if(!validImage(url))continue;
    const item=document.createElement('figure'),art=document.createElement('div'),caption=document.createElement('figcaption');
    art.className='osls-art-asset';art.style.backgroundImage=imageURL(url);caption.textContent=label;
    item.append(art,caption);assets.append(item);
   }
  }
  info.textContent=['Original '+selected.id,'position '+(src.backgroundPosition||'not recorded'),
    'size '+(src.backgroundSize||'auto'),'repeat '+(src.backgroundRepeat||'repeat'),
    'attachment '+(src.backgroundAttachment||'scroll'),src.sourceHasAnimatedGif?'Animated GIF reference retained':'Static or unspecified source artwork',
    'Border '+(src.panelBorderStyle||src.borderStyle||'unspecified'),
    'Font '+(src.fontFamily||'unspecified')].join(' · ');
 }
function renderEditor(){renderSourceComparison();const vals=selectedTokens(),box=$('oslsEditorGrid');box.replaceChildren();for(const [key,label] of COLOR_FIELDS)box.append(colorField(key,label,vals[key]));const opacity=$('oslsOpacity');opacity.value=vals.overlayOpacity; $('oslsOpacityValue').textContent=Math.round(vals.overlayOpacity*100)+'%';$('oslsImage').value=vals.backgroundImage?.startsWith('data:')||vals.backgroundImage?.startsWith('ourspace-bg:')||vals.backgroundImage?.startsWith('ourspace-pending:')?'':(vals.backgroundImage||'');$('oslsPosition').value=vals.backgroundPosition;$('oslsSize').value=vals.backgroundSize;$('oslsRepeat').value=REPEAT_CHOICES.includes(vals.backgroundRepeat)?vals.backgroundRepeat:'';$('oslsAttachment').value=ATTACH_CHOICES.includes(vals.backgroundAttachment)?vals.backgroundAttachment:'';$('oslsFont').value=FONT_CHOICES.includes(vals.fontFamily)?vals.fontFamily:'';$('oslsWeight').value=vals.fontWeight||'';$('oslsFontStyle').value=vals.fontStyle||'';}
function renderControls(){if(!studio)return;$('oslsTitle').textContent=selected.title;$('oslsMeta').textContent=(selected.parentId?'Custom preset · ':'Original archive · ')+selected.group+' / '+(selected.subcategory||'All')+' · '+(selected.author||selected.source||'Archive')+' · #'+selected.id;
 $('oslsMode').value=mode;$('oslsFavorite').textContent=state.favorites.includes(selected.id)?'★ Favorited':'☆ Favorite';$('oslsSource').href=selected.url||'#';$('oslsSource').hidden=!selected.url;$('oslsArtNote').textContent=(selected.sourceStyle?.images?.length||0)+' original image / GIF references preserved · '+(selected.rawCode?.length||0).toLocaleString()+' source characters';renderEditor()}
let previewImageRevision=0;
function sendPreview(){renderSourceComparison();if(!frameLoaded)return;const f=$('oslsFrame');
 // The iframe holds the actual Demo Account, but cannot know about presets
 // created since it loaded. Send only the compact custom delta (never a CSS
 // override sheet or a second site's HTML) when one is selected.
 f?.contentWindow?.postMessage({type:'osls-preview-theme',id:selected.id,mode,overrides:{...draft()},custom:selected.parentId?compactCustom(selected):null},'*');
 const image=selectedTokens().backgroundImage,revision=++previewImageRevision,id=selected.id;
 if(image?.startsWith('ourspace-pending:')&&stagedImages.has(image)){
  f?.contentWindow?.postMessage({type:'osls-preview-background',id,url:stagedImages.get(image).url},'*');
 }else if(image?.startsWith('ourspace-bg:'))window.OurSpaceBackgroundStore?.ensure(image).then(url=>{
  if(revision===previewImageRevision&&frameLoaded)f?.contentWindow?.postMessage({type:'osls-preview-background',id,url},'*');
 }).catch(()=>setStatus('The saved background image is unavailable in this browser.'));
}
function loadFrame(){
 frameLoaded=false;previewVirtual={width:2200,height:3500};fitPreview();
 const frame=$('oslsFrame');
  // Preview an actual OurSpace host only. Never invent/sample a website and
  // never recurse into design_widget.html itself.
  const configured=window.OurSpaceLayoutPreviewURL||document.documentElement.dataset.ourspacePreviewUrl;
  const ownWidget=/\/design_widget\.html$/i.test(location.pathname);
  if((ownWidget||document.documentElement.hasAttribute("data-os-design-widget-standalone"))&&!configured){
    frame.removeAttribute('src');frame.srcdoc='<html><body style="font:14px system-ui;padding:24px;color:#334155;background:#fff">Connect this floating widget to the actual OurSpace page to preview themes. No demo website is included.</body></html>';
    frameLoaded=false;return;
  }
  const target=new URL(configured||location.href,location.href);target.search='';target.hash='';
 target.searchParams.set('page',previewPage);target.searchParams.set('os-layout-preview','1');
 frame.src=target.href;frame.onload=()=>{frameLoaded=true;sendPreview()};
}
let previewVirtual={width:2200,height:3500},previewZoom='fit';
function fitPreview(){if(!$('oslsPreview'))return;
 const box=$('oslsPreview'),frame=$('oslsFrame'),w=Math.max(2200,Math.min(4200,previewVirtual.width)),h=Math.max(1200,Math.min(7000,previewVirtual.height));
 const scale=previewZoom==='fit'?Math.max(.12,Math.min(1,(box.clientWidth-24)/w)):Number(previewZoom);
 frame.style.width=w+'px';frame.style.height=h+'px';
 const canvas=$('oslsCanvas');canvas.style.setProperty('--osls-preview-scale',scale);canvas.style.setProperty('--osls-preview-w',(w*scale)+'px');canvas.style.setProperty('--osls-preview-h',(h*scale)+'px');
 if($('oslsZoom'))$('oslsZoom').value=previewZoom;
}

function download(name,content){const url=URL.createObjectURL(new Blob([content],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000)}
async function saveCustom(){const name=prompt('Name this new layout preset:',selected.title+' · Custom');if(!name?.trim())return;
 if(!(await commitStagedImages()))return;
 const id='custom-'+(crypto.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));const t=selectedTokens();const source=selected.parentId?BY_ID.get(selected.parentId):selected;const custom={...source,id,title:name.trim().slice(0,100),parentId:source?.id||selected.id,group:selected.group,subcategory:selected.subcategory,baseMode:mode,originalMode:mode,customBase:t,customImage:t.backgroundImage,customPosition:t.backgroundPosition,customSize:t.backgroundSize,customRepeat:t.backgroundRepeat,customAttachment:t.backgroundAttachment,customFontFamily:t.fontFamily,customFontWeight:t.fontWeight,customFontStyle:t.fontStyle,customModeOverrides:{[mode]:{...draftByMode[mode]},[mode==='dark'?'light':'dark']:{...draftByMode[mode==='dark'?'light':'dark']}}};state.custom.push(custom);BY_ID.set(id,custom);const stored=persist();selectLayout(custom);renderCategories();renderSubcategories();setStatus(stored?'Saved '+name.trim()+' as a new layout preset. The original remains available.':'Created '+name.trim()+' for this session only. Export your layouts to keep a copy.')}
function exportCustom(){download('OurSpace_Custom_Layouts.json',JSON.stringify({format:'ourspace.demo.layouts.v1',layouts:state.custom.map(compactCustom)},null,2));setStatus('Exported '+state.custom.length+' saved layout presets with references to their original archive layouts.')}
async function importCustom(file){try{const data=JSON.parse(await file.text());if(data?.format!=='ourspace.demo.layouts.v1'||!Array.isArray(data.layouts))throw Error('This is not an OurSpace layout preset file.');let count=0;for(const item of data.layouts){
 const source=BY_ID.get(item.parentId);if(!source||!CATEGORIES.includes(source.group)||typeof item.title!=='string')continue;
 const variant=item.baseMode==='dark'?'dark':'light',base=baseTokens(source,variant);
 for(const key of [...SOURCE_COLORS,...TEXT_COLORS,...HUD_FAMILY_KEYS])if(safeColor(item.customBase?.[key]))base[key]=safeColor(item.customBase[key]);
 base.backgroundImage=Object.hasOwn(item.customBase||{},'backgroundImage')?validImage(item.customBase.backgroundImage):(source.sourceStyle?.backgroundImage||'');
 base.backgroundPosition=/^[\w\s%.-]{1,55}$/.test(item.customBase?.backgroundPosition||'')?item.customBase.backgroundPosition:'center top';
 base.backgroundRepeat=REPEAT_CHOICES.includes(item.customBase?.backgroundRepeat)?item.customBase.backgroundRepeat:'';
  base.backgroundAttachment=ATTACH_CHOICES.includes(item.customBase?.backgroundAttachment)?item.customBase.backgroundAttachment:source.sourceStyle?.backgroundAttachment||'scroll';
 base.fontFamily=FONT_CHOICES.includes(item.customBase?.fontFamily)?item.customBase.fontFamily:'';
 base.fontWeight=['','normal','bold'].includes(item.customBase?.fontWeight)?item.customBase.fontWeight:'';
 base.fontStyle=['','normal','italic'].includes(item.customBase?.fontStyle)?item.customBase.fontStyle:'';
 base.backgroundSize=/^[\w\s%.-]{1,55}$/.test(item.customBase?.backgroundSize||'')?item.customBase.backgroundSize:'auto';
 base.overlayOpacity=Math.min(.85,Math.max(0,Number(item.customBase?.overlayOpacity)||0));
 const id='custom-'+(crypto.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
 const custom={...source,id,parentId:source.id,title:item.title.trim().slice(0,100)||'Imported layout',originalMode:variant,baseMode:variant,customBase:base,customImage:base.backgroundImage,customPosition:base.backgroundPosition,customSize:base.backgroundSize,customRepeat:base.backgroundRepeat,customAttachment:base.backgroundAttachment,customFontFamily:base.fontFamily,customFontWeight:base.fontWeight,customFontStyle:base.fontStyle,customModeOverrides:{light:sanitizeEdits(item.customModeOverrides?.light),dark:sanitizeEdits(item.customModeOverrides?.dark)}};
 state.custom.push(custom);BY_ID.set(id,custom);count++;
 }if(!count)throw Error('No valid presets were found.');const stored=persist();renderCategories();renderSubcategories();renderList();setStatus(stored?'Imported '+count+' custom layout presets.':'Imported '+count+' presets for this session only. Export them to keep a copy.');
 }catch(err){setStatus('Import failed: '+(err.message||String(err)))}}
function openStudio(){if(!studio)return;studio.showModal();renderCategories();renderSubcategories();renderControls();renderList();loadFrame();fitPreview()}
let looksSearch='',looksCategory='',looksFilter='';
function renderLooksPresetCatalog(){const host=$('osLooksPresetCatalog');if(!host)return;
 const categories=$('osLooksPresetCategory');if(categories&&categories.options.length===0){categories.add(new Option('All categories',''));for(const category of CATEGORIES)categories.add(new Option(category,category))}
 if(categories)categories.value=looksCategory;
 if($('osLooksPresetFilter'))$('osLooksPresetFilter').value=looksFilter;
 if($('osLooksPresetSearch'))$('osLooksPresetSearch').value=looksSearch;
 const found=layouts().filter(x=>(!looksCategory||x.group===looksCategory)&&(!looksFilter||(looksFilter==='mine'?!!x.parentId:looksFilter==='recent'?state.recent.includes(x.id):state.favorites.includes(x.id)))&&(!looksSearch||[x.title,x.author,x.source,x.group,x.subcategory,x.id].join(' ').toLowerCase().includes(looksSearch.toLowerCase())));
 if($('osLooksPresetCount'))$('osLooksPresetCount').textContent=found.length+' of '+layouts().length+' presets';
 const fragment=document.createDocumentFragment();
 for(const item of found){const row=document.createElement('div');row.className='os-looks-preset-row';
  const browse=document.createElement('button');browse.type='button';browse.className='ui os-looks-preset-select';browse.dataset.oslsPresetId=item.id;
  const icon=document.createElement('span');icon.className='os-looks-preset-art';icon.style.setProperty('--osls-thumb-color',safeColor(item.thumbColor)||'#808080');const thumb=validImage(item.thumbImage||item.sourceStyle?.backgroundImage);if(thumb)icon.style.backgroundImage=imageURL(thumb);
  const info=document.createElement('span');const title=document.createElement('strong');title.textContent=item.title;const sub=document.createElement('small');sub.textContent=item.group+' · '+(item.subcategory||'')+' · '+(item.author||item.source||'Archive');info.append(title,sub);browse.append(icon,info);
  const star=document.createElement('button');star.type='button';star.className='ui os-looks-preset-star';star.dataset.oslsFavId=item.id;star.title=state.favorites.includes(item.id)?'Remove favorite':'Add favorite';star.setAttribute('aria-label',star.title+' '+item.title);star.textContent=state.favorites.includes(item.id)?'★':'☆';row.append(browse,star);fragment.append(row)
 }
 host.replaceChildren(fragment);
}
function setupLooksPresets(){const looks=$('view-looks');if(!looks)return;
 new MutationObserver(()=>{if(looks.querySelector('#osLooksPresetCatalog'))renderLooksPresetCatalog()}).observe(looks,{childList:true});
 looks.addEventListener('input',e=>{if(e.target.id==='osLooksPresetSearch'){looksSearch=e.target.value;renderLooksPresetCatalog()}});
 looks.addEventListener('change',e=>{if(e.target.id==='osLooksPresetCategory'){looksCategory=e.target.value;renderLooksPresetCatalog()}else if(e.target.id==='osLooksPresetFilter'){looksFilter=e.target.value;renderLooksPresetCatalog()}});
 looks.addEventListener('click',e=>{const select=e.target.closest('[data-osls-preset-id]'),favorite=e.target.closest('[data-osls-fav-id]');if(select){const x=BY_ID.get(select.dataset.oslsPresetId);if(x){selectLayout(x);openStudio()}}else if(favorite){const id=favorite.dataset.oslsFavId;const i=state.favorites.indexOf(id);if(i<0)state.favorites.push(id);else state.favorites.splice(i,1);persist();renderLooksPresetCatalog();if(studio?.open){renderControls();renderList()}}else if(e.target.closest('[data-osls-open-presets]'))openStudio()});
 renderLooksPresetCatalog();
}
function setupStudio(){studio=document.createElement('dialog');studio.id='osLayoutStudio';studio.setAttribute('aria-label','OurSpace MySpace Layout Design Studio');studio.innerHTML=`<div class="osls"><header class="osls-head"><div><h2>MySpace Layout Design Studio</h2><p>OurSpace · 247 original layouts and your saved variations</p></div><button id="oslsClose" type="button" aria-label="Close studio">×</button></header><div class="osls-layout"><aside class="osls-sidebar"><div class="osls-tabs" id="oslsCategories" aria-label="Layout categories"></div><label>Search layouts<input id="oslsSearch" type="search" placeholder="Title, creator, category, archive ID"></label><div class="osls-filters"><label>Subcategory<select id="oslsSubcategory"></select></label><label>Show<select id="oslsFilter"><option value="">All layouts</option><option value="favorites">Favorites</option><option value="recent">Recently used</option><option value="mine">My layouts</option></select></label></div><div id="oslsCount" class="osls-count"></div><div id="oslsList" class="osls-list" aria-label="Layout presets"></div></aside><section class="osls-work"><div class="osls-title"><div><h3 id="oslsTitle"></h3><p id="oslsMeta"></p></div><button id="oslsFavorite" type="button"></button></div><div class="osls-actions"><label>Preview page<select id="oslsPage"></select></label><label>Theme mode<select id="oslsMode"><option value="light">Light mode</option><option value="dark">Dark mode</option></select></label><label>Preview zoom<select id="oslsZoom"><option value="fit">Fit full site width</option><option value="0.4">40%</option><option value="0.65">65%</option><option value="0.85">85%</option><option value="1">100%</option></select></label><button id="oslsFullscreen" type="button">Full-screen preview</button><button id="oslsCancelPreview" type="button">Cancel preview</button></div><div id="oslsPreview" class="osls-preview"><div id="oslsCanvas" class="osls-canvas"><iframe id="oslsFrame" title="Actual OurSpace site layout preview" loading="lazy"></iframe></div></div><div class="osls-details"><a id="oslsSource" target="_blank" rel="noopener noreferrer">Archived source / credit</a><span id="oslsArtNote"></span><button id="oslsDownload" type="button">Download original code</button></div><details class="osls-editor" id="oslsEditor"><summary>Customize colors, artwork, and overlay</summary><div class="osls-editor-grid" id="oslsEditorGrid"></div><div class="osls-editor-grid"><label class="wide">Background image / GIF URL<input id="oslsImage" type="url" placeholder="https://…"></label><label>Or upload image / GIF<input id="oslsImageFile" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/svg+xml"></label><label>Image position<input id="oslsPosition" type="text" placeholder="center top"></label><label>Image size<input id="oslsSize" type="text" placeholder="auto or cover"></label><label>Image repeat<select id="oslsRepeat"><option value="">Archive original</option><option value="repeat">Tile</option><option value="no-repeat">No repeat</option><option value="repeat-x">Horizontal tile</option><option value="repeat-y">Vertical tile</option><option value="space">Spaced tile</option><option value="round">Rounded tile</option></select></label><label>Background motion / attachment<select id="oslsAttachment"><option value="">Archive original</option><option value="fixed">Fixed to viewport</option><option value="scroll">Scroll with page</option><option value="local">Scroll inside content</option></select></label><label>Font family<select id="oslsFont"><option value="">Archive original</option><option value="Verdana,Arial,sans-serif">Verdana</option><option value="Arial,Helvetica,sans-serif">Arial</option><option value="Georgia,serif">Georgia</option><option value="&quot;Times New Roman&quot;,serif">Times New Roman</option><option value="&quot;Trebuchet MS&quot;,sans-serif">Trebuchet MS</option><option value="Tahoma,sans-serif">Tahoma</option><option value="&quot;Courier New&quot;,monospace">Courier New</option><option value="system-ui,sans-serif">System UI</option></select></label><label>Font weight<select id="oslsWeight"><option value="">Archive original</option><option value="normal">Normal</option><option value="bold">Bold</option></select></label><label>Font style<select id="oslsFontStyle"><option value="">Archive original</option><option value="normal">Normal</option><option value="italic">Italic</option></select></label><label>Overlay transparency <span id="oslsOpacityValue"></span><input id="oslsOpacity" type="range" min="0" max="0.85" step="0.01"></label></div><div class="osls-actions"><button id="oslsReset" type="button">Reset customizations</button><button id="oslsOriginal" type="button">Restore original colors</button><button id="oslsRegenerateMode" type="button">Generate other mode from edits</button><button id="oslsSave" type="button">Save as new preset</button></div></details><div id="oslsStatus" role="status" aria-live="polite" class="osls-status">Preview a layout, then choose where to apply it.</div></section></div><footer class="osls-foot"><button id="oslsApplyPage" type="button">Apply to selected page only</button><button id="oslsApplyGlobal" type="button">Apply to entire account</button><button id="oslsIndividual" type="button">Return to individual pages</button><button id="oslsRestorePage" type="button">Restore previous page</button><button id="oslsRestoreGlobal" type="button">Restore previous account layout</button><button id="oslsUndo" type="button">Undo last application</button><button id="oslsExportCustom" type="button">Export my layouts</button><button id="oslsImportCustom" type="button">Import layouts</button><input id="oslsImportFile" type="file" accept="application/json" hidden></footer></div>`;
  document.body.append(studio);
  const comparison=document.createElement('details');comparison.className='osls-source-compare';
  comparison.innerHTML='<summary>Compare original artwork and converted background</summary><p>Artwork-only fidelity inspection. It does not create a Demo Account or substitute OurSpace modules. An actual OurSpace host is needed for live module geometry previews.</p><div class="osls-compare-grid"><figure><div id="oslsSourceArtwork" class="osls-artwork-tile" role="img" aria-label="Original archive background and animation"></div><figcaption>Original archive background</figcaption></figure><figure><div id="oslsConvertedArtwork" class="osls-artwork-tile" role="img" aria-label="Converted background with current edits"></div><figcaption>Converted design background</figcaption></figure></div><div id="oslsCompareAssets" class="osls-compare-assets" aria-label="Original secondary artwork"></div><p id="oslsSourceFacts"></p>';
  studio.querySelector('.osls-details').after(comparison);
 for(const [id,label] of PAGES)$('oslsPage').append(new Option(label,id));$('oslsPage').value=previewPage;
 $('oslsClose').onclick=()=>studio.close();studio.addEventListener('close',()=>{discardStagedImages();frameLoaded=false;$('oslsFrame').removeAttribute('src')});
 $('oslsSearch').oninput=e=>{query=e.target.value.trim();renderList()};$('oslsSubcategory').onchange=e=>{subcategory=e.target.value;renderList()};$('oslsFilter').onchange=e=>{filter=e.target.value;renderList()};
 $('oslsPage').onchange=e=>{previewPage=e.target.value;loadFrame()};$('oslsZoom').onchange=e=>{previewZoom=e.target.value;fitPreview()};$('oslsMode').onchange=e=>{mode=e.target.value;renderEditor();sendPreview()};
 $('oslsFavorite').onclick=()=>{const i=state.favorites.indexOf(selected.id);if(i<0)state.favorites.push(selected.id);else state.favorites.splice(i,1);persist();renderControls();renderList()};
 $('oslsApplyPage').onclick=()=>apply('page');$('oslsApplyGlobal').onclick=()=>apply('global');$('oslsIndividual').onclick=()=>restore('individual');$('oslsRestorePage').onclick=()=>restore('page');$('oslsRestoreGlobal').onclick=()=>restore('global');$('oslsUndo').onclick=()=>restore('undo');$('oslsExportCustom').onclick=exportCustom;$('oslsImportCustom').onclick=()=>$('oslsImportFile').click();$('oslsImportFile').onchange=e=>{const file=e.target.files?.[0];if(file)importCustom(file);e.target.value=''};
 $('oslsReset').onclick=()=>{discardStagedImages();draftByMode={light:{},dark:{}};renderEditor();sendPreview();setStatus('Unsaved changes reset for both modes.')};$('oslsOriginal').onclick=()=>{discardStagedImages();if(selected.parentId&&BY_ID.has(selected.parentId))selected=BY_ID.get(selected.parentId);draftByMode={light:{},dark:{}};mode=selected.originalMode||'light';renderControls();renderList();sendPreview();setStatus('Original archive colors and artwork restored in preview.')};$('oslsSave').onclick=saveCustom;$('oslsRegenerateMode').onclick=regenerateAlternateMode;
 $('oslsDownload').onclick=()=>download('myspace-'+selected.id+'-original-code.txt',selected.rawCode||'');
 $('oslsImage').onchange=e=>{const url=validImage(e.target.value);if(e.target.value&&!url){setStatus('Enter an HTTPS image or GIF URL.');return}draft().backgroundImage=url;pruneStagedImages();sendPreview()};
 $('oslsImageFile').onchange=e=>{const file=e.target.files?.[0];if(!file)return;
 try{
  if(!window.OurSpaceBackgroundStore?.validImage(file))throw Error('Choose a supported image or GIF file.');
  const marker='ourspace-pending:'+(crypto.randomUUID?.()||Date.now().toString(36));
  stagedImages.set(marker,{file,url:URL.createObjectURL(file)});
  draft().backgroundImage=marker;pruneStagedImages();
  renderEditor();sendPreview();setStatus(file.name+' is preview-only. The image will be stored only if you Apply or Save a preset.');
 }catch(err){setStatus(err.message||String(err))}e.target.value=''};
 $('oslsPosition').onchange=e=>{draft().backgroundPosition=e.target.value;sendPreview()};$('oslsSize').onchange=e=>{draft().backgroundSize=e.target.value;sendPreview()};for(const [field,key] of [['oslsRepeat','backgroundRepeat'],['oslsAttachment','backgroundAttachment'],['oslsFont','fontFamily'],['oslsWeight','fontWeight'],['oslsFontStyle','fontStyle']])$(field).onchange=e=>{draft()[key]=e.target.value;sendPreview()};
 $('oslsOpacity').oninput=e=>{draft().overlayOpacity=+e.target.value;$('oslsOpacityValue').textContent=Math.round(e.target.value*100)+'%';sendPreview()};
 $('oslsCancelPreview').onclick=()=>{draftByMode={light:{},dark:{}};renderEditor();sendPreview();studio.close()};
 $('oslsFullscreen').onclick=async()=>{const preview=$('oslsPreview');if(document.fullscreenElement){await document.exitFullscreen()}else if(preview.requestFullscreen){try{await preview.requestFullscreen()}catch{studio.dataset.expanded=studio.dataset.expanded==='true'?'false':'true'}}else studio.dataset.expanded=studio.dataset.expanded==='true'?'false':'true';fitPreview()};
 document.addEventListener('fullscreenchange',fitPreview);new ResizeObserver(fitPreview).observe($('oslsPreview'));
 window.addEventListener('message',e=>{if(e.source!==$('oslsFrame')?.contentWindow)return;
 if(e.origin!==location.origin&&e.origin!=='null'&&location.origin!=='null')return;
 if(e.data?.type==='osls-preview-ready'){frameLoaded=true;sendPreview()}
 if(e.data?.type==='osls-preview-applied'){$('oslsFrame').dataset.previewLayoutId=e.data.id;$('oslsFrame').dataset.previewMode=e.data.mode}
 if(e.data?.type==='osls-preview-error')setStatus('Preview could not resolve this custom preset. Reload the preview or reimport the layout.');
 if(e.data?.type==='osls-preview-dimensions'){const w=Math.max(2200,Math.min(4200,Number(e.data.width)||2200)),h=Math.max(1200,Math.min(7000,Number(e.data.height)||3500));if(w!==previewVirtual.width||h!==previewVirtual.height){previewVirtual={width:w,height:h};fitPreview()}}if(e.data?.type==='osls-preview-page'&&PAGES.some(x=>x[0]===e.data.page)){$('oslsPage').value=previewPage=e.data.page}});

 window.OurSpaceLayoutStudio={open:openStudio,getCatalog:()=>layouts().map(({rawCode,...meta})=>meta),getAssignments:()=>({pages:structuredClone(state.pages),global:structuredClone(state.global),preGlobalPages:structuredClone(state.preGlobalPages)}),preview:(id,variant)=>{const x=BY_ID.get(id);if(x){selectLayout(x);if(variant){mode=variant;renderControls()}openStudio()}},apply:(id,variant,scope='page')=>{const x=BY_ID.get(id);if(!x)throw Error('Unknown layout');selected=x;mode=variant||x.originalMode;draftByMode={light:{},dark:{}};return apply(scope)}};
}
function init(){document.documentElement.dataset.ourspaceCurrentPage=page;if(ORIGINALS.length!==247||BUNDLES.length!==8){console.error('Layout catalog incomplete',ORIGINALS.length,BUNDLES.length);return}applyLive();setupStudio();setupLooksPresets();setupModeButton()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
