/* Bulletin — standalone offline-first corkboard workspace. No messaging services. */
(()=>{'use strict';
const PROFILE=document.documentElement.dataset.profile==='jasper'?'jasper':'william';
const $=(s,root=document)=>root.querySelector(s),$$=(s,root=document)=>Array.from(root.querySelectorAll(s));
const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const uid=()=>globalThis.crypto?.randomUUID?.()||('id-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const stamp=()=>new Date().toISOString();
// Only supported Google Fonts families may be requested. Font files are loaded from
// Google's CSS2 endpoint on demand; offline use falls back to installed fonts.
const GOOGLE_FONTS=['Roboto','Open Sans','Lato','Montserrat','Poppins','Nunito','Quicksand','Playfair Display','Merriweather','Cormorant Garamond','Libre Baskerville','Dancing Script','Caveat','Pacifico','Patrick Hand','Indie Flower','Kalam','Special Elite','Bebas Neue','Permanent Marker','DM Sans','Fraunces','Oswald','Inter'];
const fontChoices=[['','System font (works offline)'],...GOOGLE_FONTS.map(name=>[name,name])];
const requestedFonts=new Set();
function loadGoogleFont(name){
 if(!GOOGLE_FONTS.includes(name)||requestedFonts.has(name))return;
 requestedFonts.add(name);
 const link=document.createElement('link');link.rel='stylesheet';link.dataset.bulletinFont=name;
 link.href='https://fonts.googleapis.com/css2?family='+encodeURIComponent(name).replace(/%20/g,'+')+'&display=swap';
 document.head.append(link);
}
function safeStyle(raw={}){
 const family=GOOGLE_FONTS.includes(raw.fontFamily)?raw.fontFamily:'';
 const hex=c=>/^#[\da-fA-F]{6}$/.test(String(c||''))?String(c):'';
 return {fontFamily:family,fontSize:clamp(Number(raw.fontSize)||16,10,72),bold:!!raw.bold,italic:!!raw.italic,
 underline:!!raw.underline,align:['left','center','right'].includes(raw.align)?raw.align:'left',
 fontColor:hex(raw.fontColor),borderColor:hex(raw.borderColor)||'#ad8333',
 borderWidth:clamp(Number(raw.borderWidth)||0,0,20)};
}
function typographyFields(x={}){
 const f=safeStyle(x.textStyle||{});
 return [{info:'Text is styled per object. Google Fonts need an internet connection; your chosen family is saved and an offline fallback remains visible.'},
 {name:'caption',label:'Text caption (visible on photos and stickers)',value:x.caption||'',maxLength:500},
 {name:'fontFamily',label:'Font family · Google Fonts',type:'select',value:f.fontFamily,options:fontChoices},
 {name:'fontSize',label:'Text size',type:'range',value:f.fontSize,min:10,max:72,step:1},
 {name:'bold',label:'Bold',type:'checkbox',value:f.bold},{name:'italic',label:'Italic',type:'checkbox',value:f.italic},
 {name:'underline',label:'Underline',type:'checkbox',value:f.underline},
 {name:'align',label:'Text alignment',type:'select',value:f.align,options:[['left','Left'],['center','Center'],['right','Right']]},
 {name:'fontColor',label:'Text color (blank defaults to automatic contrast)',value:f.fontColor,placeholder:'#1c1a15'},
 {name:'borderWidth',label:'Border weight (0 = no extra border)',type:'range',value:f.borderWidth,min:0,max:20,step:1},
 {name:'borderColor',label:'Border color',type:'color',value:f.borderColor}];
}
function styleFromForm(v){const f=safeStyle(v);loadGoogleFont(f.fontFamily);return f;}
function decorateTypographyText(el,x){
 const s=x.textStyle;if(!s)return;
 const t=safeStyle(s);loadGoogleFont(t.fontFamily);
 if(t.fontFamily)el.style.fontFamily='"'+t.fontFamily+'", "Segoe UI", sans-serif';
 el.style.fontSize=t.fontSize+'px';el.style.fontWeight=t.bold?'700':'400';el.style.fontStyle=t.italic?'italic':'normal';
 el.style.textDecoration=t.underline?'underline':'none';el.style.textAlign=t.align;
 if(t.fontColor)el.style.color=t.fontColor;
}
function decorateItemBorder(el,x){
 if(!x.textStyle)return;const s=safeStyle(x.textStyle);
 if(s.borderWidth){el.style.border=s.borderWidth+'px solid '+s.borderColor;}
}

const nav=[
{id:'pinboard',emoji:'📌',name:'Pinboard',desc:'Boards & canvas',items:[['Open Pinboard','open-board','📍'],['My Bulletin','my-bulletin','📋'],['New board ＋','new-board','＋'],['Switch boards','switch-board','🔀'],['Rename board','rename-board','✎'],['Duplicate board','duplicate-board','⧉'],['Delete board','delete-board','🗑'],['Board privacy (private/public)','privacy-board','🔒'],['Share this board with partner','share-board','♡']]},
{id:'pins',emoji:'📍',name:'Pins',desc:'Pin management',items:[['Create new pin','new-pin','＋'],['Add photo','add-photo','🖼'],['Add note / Post-it','add-note','📝'],['Add link / webpage','add-link','🔗'],['Add document','add-document','📄'],['Add quote','add-quote','❞'],['Add event','add-event','📅'],['Edit pins','edit-pins','✎'],['Pin details and tags','pin-details','🏷']]},
{id:'grid',emoji:'▦',name:'Grid',desc:'Views & layouts',items:[['Grid view','view-grid','▦'],['Masonry view','view-masonry','▤'],['Freeform canvas','view-freeform','⬚'],['List view','view-list','≡'],['Compact view','view-compact','▥'],['Thumbnail sizes','thumb-size','◫'],['Sort and filter','sort-filter','⇅'],['Zoom controls','zoom-dialog','🔎']]},
{id:'journal',emoji:'📖',name:'Journal',desc:'Junk journal',items:[['New journal page','journal-new','＋'],['Add scrap','journal-scrap','✂'],['Add photo','journal-photo','🖼'],['Add handwritten note','journal-handwriting','✎'],['Add washi tape','journal-washi','〰'],['Add paper backgrounds','journal-paper','▧'],['Page templates','journal-template','▣'],['Journal covers','journal-cover','📕'],['Page flipping / navigation','journal-open','⇆']]},
{id:'reading',emoji:'📚',name:'Reading',desc:'Reading space',items:[['Reading list','reading-list','☷'],['Saved articles','reading-articles','▤'],['Books and documents','reading-books','📚'],['Reading notes','reading-notes','✎'],['Highlights','reading-highlights','◈'],['Bookmarks','reading-bookmarks','🔖'],['Quotes and excerpts','reading-quotes','❞'],['Reading progress','reading-progress','◴']]},
{id:'arrange',emoji:'✥',name:'Arrange',desc:'Organize & edit',items:[['Arrange mode: On / Off','arrange-toggle','✥'],['Drag and drop','arrange-drag','✋'],['Resize items','arrange-resize','⤡'],['Rotate items','arrange-rotate','⟳'],['Layer forward / backward','arrange-layers','⇅'],['Align and distribute','arrange-align','⚏'],['Group / ungroup','arrange-group','⚯'],['Lock / unlock items','arrange-lock','🔐'],['Undo / redo','arrange-history','↶']]},
{id:'craft',emoji:'✂',name:'Craft Studio',desc:'Creative tools',items:[['Photo stickers','craft-sticker','🏵'],['Glitter stencils','craft-glitter','♥︎'],['Ink stamps','craft-stamp','◉'],['Decorations','craft-decor','❀'],['✂ Create sticker from photo','craft-cutout','✂'],['Post-it decoration','craft-postit','🗒'],['Stencils and patterns','craft-pattern','✳'],['Scrapbook embellishments','craft-embellish','⚜'],['Textures and effects','craft-texture','◈'],['Add scrap','craft-scrap','✂']]},
{id:'library',emoji:'🗂',name:'Library',desc:'Saved items',items:[['All items','lib-all','🗂'],['Clipping basket','lib-clips','🧺'],['Favorites ★','lib-favorites','★'],['Archive','lib-archive','▣'],['Recent items','lib-recent','◴'],['Photos','lib-photos','🖼'],['Stickers','lib-stickers','🏵'],['Scraps','lib-scraps','✂'],['Saved documents','lib-documents','📄']]},
{id:'settings',emoji:'⚙',name:'Settings',desc:'Board controls',items:[['Zoom − / 100% / ＋','zoom-dialog','🔎'],['Fit to screen','fit','▢'],['Fullscreen','fullscreen','⛶'],['Board settings','board-settings','⚙'],['Background settings','background-settings','▧'],['Grid and snapping settings','grid-settings','▦'],['Import backup','import-backup','⇩'],['Export archive','export-backup','⇧'],['Restore board','restore-board','↶'],['Privacy settings','privacy-settings','🔒']]}];
const initial=()=>{const demo=[
 {kind:'note',title:'Welcome to Bulletin',text:'Welcome to Bulletin\nChampagne Gold · #F7E7CE\nA private creative pinboard.',textStyle:{align:'left'},color:'#F7E7CE',x:7,y:9,w:20,h:23,rotation:-2,tags:'welcome,guide'},
 {kind:'note',title:'One object, many contexts',text:'One object, many contexts\nAmethyst Purple · #9966CC\nCreative, curious, exploratory.',textStyle:{align:'center'},color:'#9966CC',x:32,y:9,w:20,h:23,rotation:2,tags:'research,architecture'},
 {kind:'note',title:'Research reference',text:'Research reference\nSterling Silver · #BFC1C2\nSave what inspires you.',textStyle:{align:'right'},color:'#BFC1C2',x:57,y:9,w:20,h:23,rotation:-2,tags:'source,research'},
 {kind:'note',title:'Example event scrap',text:'Example event scrap\nSage Green · #9CAF88\nPlan a meaningful moment.',textStyle:{align:'center'},color:'#9CAF88',x:78,y:9,w:18,h:23,rotation:2,tags:'event,example'},
 {kind:'sticker',title:'Taped clover sticker',data:'../../assets/images/bulletin/openmoji-clover-sticker.svg',arrangement:'taped-sticker',x:13,y:47,w:19,h:28,rotation:-5,tags:'sticker,washi,preview'},
 {kind:'sticker',title:'Pressed flower in paper vase',data:'../../assets/images/bulletin/openmoji-botanical-flower.svg',arrangement:'dried-flower',x:41,y:44,w:19,h:32,rotation:3,tags:'botanical,flower,preview'},
 {kind:'sticker',title:'Pinned leaf stencil',data:'../../assets/images/bulletin/openmoji-stencil-leaves.svg',arrangement:'pinned-stencil',x:70,y:45,w:19,h:29,rotation:-3,tags:'stencil,drawing,preview'}
 ];
 const board={id:uid(),name:'My Bulletin',private:true,background:'cork',created:stamp(),items:demo.map((x,i)=>({id:uid(),kind:x.kind,title:x.title,text:x.text||'',x:x.x,y:x.y,w:x.w,h:x.h,rotation:x.rotation,z:i+2,created:stamp(),tags:x.tags||'',color:x.color||null,textStyle:x.textStyle?{...x.textStyle}:undefined,data:x.data||'',arrangement:x.arrangement||'',favorite:i===0,clipped:false,archived:false,locked:false})),journal:[],reading:[]};return {version:1,boards:[board],currentBoard:board.id,deletedBoards:[],zoom:100,view:'freeform',thumb:'medium',sort:'newest',filter:'all',arrange:false,showGrid:false,snap:false}};
let state=initial(),menu='pinboard',menuVisible=false,workspace='board',workspaceFilter='all',selected=new Set(),currentJournal=null,pointerItem=null,undoStack=[],redoStack=[],lastSave=null,toastTimer=null,dialogAction=null,uploadAction=null,dragMenu=null,db=null,renderPending=false;
const board=()=>state.boards.find(b=>b.id===state.currentBoard)||state.boards[0];
const currentItems=()=>board()?.items||[];
const item=id=>currentItems().find(x=>x.id===id);
const allItems=()=>state.boards.flatMap(b=>b.items.map(x=>({...x,source:'pin',boardId:b.id,boardName:b.name})));
const libraryEntries=()=>state.boards.flatMap(b=>[...b.items.map(x=>({...x,source:'pin',boardId:b.id,boardName:b.name})),...b.journal.map(p=>({...p,kind:'journal',source:'journal',boardId:b.id,boardName:b.name})),...b.reading.map(r=>({...r,kind:r.type==='document'?'document':'reading',source:'reading',boardId:b.id,boardName:b.name})),...b.journal.flatMap(p=>(p.scraps||[]).map(t=>({...t,source:'journal-scrap',kind:t.kind==='washi'?'washi':'scrap',pageId:p.id,boardId:b.id,boardName:b.name})))]);
const saneText=s=>String(s||'').slice(0,10000);
const notice=s=>{const t=$('#bulletinToast');t.textContent=s;t.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('visible'),2700)};
// IndexedDB stores photos, documents, and snapshots without localStorage's small-image quota.
const readStore=(key)=>new Promise(resolve=>{if(!db){resolve(null);return}try{const r=db.transaction('records','readonly').objectStore('records').get(key);r.onsuccess=()=>resolve(r.result?.value||null);r.onerror=()=>resolve(null)}catch(_){resolve(null)}});
const writeStore=(key,value)=>new Promise(resolve=>{if(!db){resolve(false);return}try{const r=db.transaction('records','readwrite').objectStore('records').put({key,value});r.onsuccess=()=>resolve(true);r.onerror=()=>resolve(false)}catch(_){resolve(false)}});
async function initStore(){
 if('indexedDB' in globalThis){
  try{db=await Promise.race([new Promise(resolve=>{const r=indexedDB.open('bulletin-creative-space-'+PROFILE,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('records'))r.result.createObjectStore('records',{keyPath:'key'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>resolve(null)}),new Promise(resolve=>setTimeout(()=>resolve(null),1200))]);}
  catch(_){db=null}
 }
 const saved=await readStore('state');
 if(saved?.version===1 && Array.isArray(saved.boards))state=saved;
 else {try{const raw=localStorage.getItem('bulletin.state.v1.'+PROFILE);const parsed=raw?JSON.parse(raw):null;if(parsed?.version===1&&Array.isArray(parsed.boards))state=parsed}catch(_){}}
 if(!board())state=initial();for(const b of state.boards){if(!Array.isArray(b.journal))b.journal=[];if(!Array.isArray(b.reading))b.reading=[]}
 // Update only untouched, original sample Post-its in existing local saves.
 // User-edited text, colors, and typography are never overwritten.
 const samples={
  'Welcome to Bulletin':{color:'#F7E7CE',old:'Champagne Gold · #F7E7CE\nA private creative pinboard.',fresh:'Welcome to Bulletin\nChampagne Gold · #F7E7CE\nA private creative pinboard.',align:'left'},
  'One object, many contexts':{color:'#9966CC',old:'Amethyst Purple · #9966CC\nCreative, curious, exploratory.',fresh:'One object, many contexts\nAmethyst Purple · #9966CC\nCreative, curious, exploratory.',align:'center'},
  'Research reference':{color:'#BFC1C2',old:'Sterling Silver · #BFC1C2\nSave what inspires you.',fresh:'Research reference\nSterling Silver · #BFC1C2\nSave what inspires you.',align:'right'},
  'Example event scrap':{color:'#9CAF88',old:'Sage Green · #9CAF88\nPlan a meaningful moment.',fresh:'Example event scrap\nSage Green · #9CAF88\nPlan a meaningful moment.',align:'center'}
 };
 let migrated=false;
 for(const b of state.boards)for(const x of b.items||[]){
  const spec=samples[x.title];
  if(!spec||x.text!==spec.old||String(x.color||'').toUpperCase()!==spec.color||x.textStyle)continue;
  x.kind='note';x.text=spec.fresh;x.textStyle={align:spec.align};migrated=true;
 }
 if(migrated)queueSave();
}

function queueSave(){clearTimeout(lastSave);lastSave=setTimeout(async()=>{if(!await writeStore('state',state)){try{localStorage.setItem('bulletin.state.v1.'+PROFILE,JSON.stringify(state))}catch(_){notice('Storage full. Export a backup to keep your work.')}}},300)}
function commit(fn,message){undoStack.push(JSON.stringify(state));if(undoStack.length>45)undoStack.shift();redoStack=[];fn();queueSave();render();if(message)notice(message)}
function undo(){if(!undoStack.length){notice('Nothing to undo');return}redoStack.push(JSON.stringify(state));state=JSON.parse(undoStack.pop());selected.clear();queueSave();render();notice('Undid last change')}
function redo(){if(!redoStack.length){notice('Nothing to redo');return}undoStack.push(JSON.stringify(state));state=JSON.parse(redoStack.pop());selected.clear();queueSave();render();notice('Redid change')}
function navBuild(){const host=$('#bulletin-nav-inner');host.innerHTML='';nav.forEach(n=>{const b=document.createElement('button');b.type='button';b.className='nav-tile';b.dataset.menu=n.id;b.setAttribute('aria-expanded','false');b.innerHTML=`<span class="nav-emoji" aria-hidden="true">${n.emoji}</span><span><span class="nav-label">${n.name}</span><span class="nav-desc">${n.desc}</span></span>`;b.addEventListener('click',()=>toggleMenu(n.id));host.append(b)});}
function toggleMenu(id){if(menu===id&&menuVisible){menuVisible=false;$('#menu-popout').hidden=true}else{menu=id;menuVisible=true;paintMenu();$('#menu-popout').hidden=false;const btn=$(`[data-menu="${id}"]`);btn?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'})}renderNavActive()}
function paintMenu(){const n=nav.find(x=>x.id===menu);if(!n)return;$('#menu-heading').textContent=n.emoji+'  '+n.name;$('#menu-intro').textContent=n.desc+' · Choose an action below';$('#menu-actions').innerHTML='';n.items.forEach(([label,action,emoji])=>{const b=document.createElement('button');b.type='button';b.className='menu-action';b.dataset.action=action;b.innerHTML=`<span aria-hidden="true">${emoji}</span><span>${esc(label)}</span>`;$('#menu-actions').append(b)})}
function renderNavActive(){$$('.nav-tile').forEach(b=>{const active=menuVisible&&b.dataset.menu===menu;b.classList.toggle('active',active);b.setAttribute('aria-expanded',String(active))})}
/* Corkboard-only vertical progress scrollbar: independent of the non-scrolling header. */
function setupViewportScrollbar(){
 const scroller=$('#workspace-viewport'),track=$('#heart-scrollbar'),handle=$('#heart-scrollbar-handle'),fill=$('#heart-scrollbar-fill');
 if(!scroller||!track||!handle||!fill)return;
 let activePointer=null,frame=0;
 const maximum=()=>Math.max(0,scroller.scrollHeight-scroller.clientHeight);
 function update(){
  frame=0;
  const max=maximum(),progress=max?clamp(scroller.scrollTop/max,0,1):0;
  const range=Math.max(0,track.clientHeight-handle.offsetHeight-10);
  const offset=5+range*progress;
  handle.style.top=offset+'px';
  fill.style.height=Math.min(track.clientHeight,offset+handle.offsetHeight*.53)+'px';
  track.setAttribute('aria-valuenow',String(Math.round(progress*100)));
  track.setAttribute('aria-valuetext',max?Math.round(progress*100)+'% through the board':'Board fits, no vertical scrolling needed');
  track.setAttribute('aria-disabled',String(!max));
  track.classList.toggle('is-scrollable',Boolean(max));
 }
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
 function seek(e){
  const max=maximum();if(!max)return;
  const bounds=track.getBoundingClientRect();
  const travel=Math.max(1,track.clientHeight-handle.offsetHeight-10);
  const pct=clamp((e.clientY-bounds.top-handle.offsetHeight/2-5)/travel,0,1);
  scroller.scrollTop=pct*max;
  schedule();
 }
 track.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'&&e.button!==0)return;
  if(!maximum())return;
  activePointer=e.pointerId;
  track.setPointerCapture(e.pointerId);
  seek(e);e.preventDefault();
 });
 track.addEventListener('pointermove',e=>{if(activePointer===e.pointerId)seek(e)});
 const release=e=>{if(activePointer===e.pointerId)activePointer=null};
 track.addEventListener('pointerup',release);track.addEventListener('pointercancel',release);
 track.addEventListener('keydown',e=>{
  const max=maximum();if(!max)return;
  let dest=scroller.scrollTop;
  switch(e.key){
   case 'ArrowDown':dest+=55;break;case 'ArrowUp':dest-=55;break;
   case 'PageDown':dest+=scroller.clientHeight*.85;break;case 'PageUp':dest-=scroller.clientHeight*.85;break;
   case 'Home':dest=0;break;case 'End':dest=max;break;
   default:return;
  }
  e.preventDefault();scroller.scrollTo({top:clamp(dest,0,max),behavior:'instant'});
 });
 track.addEventListener('wheel',e=>{if(!maximum())return;e.preventDefault();scroller.scrollTop+=e.deltaY},{passive:false});
 scroller.addEventListener('scroll',schedule,{passive:true});
 if('ResizeObserver' in globalThis){const observer=new ResizeObserver(schedule);observer.observe(scroller);observer.observe($('#board-surface'));observer.observe(track);observer.observe($('#workspace-shell'))}
 globalThis.addEventListener('resize',schedule);
 // Board content can grow when a note is added; recalculate the full thumb travel.
 if('MutationObserver' in globalThis){const changes=new MutationObserver(schedule);changes.observe($('#board-surface'),{subtree:true,childList:true,attributes:true,attributeFilter:['style','class']});}
 schedule();
}
/* A resized menu really resizes its content: buttons, headings, spacing and tools. */
function setupAdaptiveMenus(){
 const panels=[
  {node:$('#menu-popout'),w:400,h:460,min:.82,max:1.48},
  {node:$('#bulletinCraftDialog'),w:1080,h:835,min:.84,max:1.35},
  {node:$('#designerPanel'),w:470,h:790,min:.84,max:1.4}
 ];
 function apply(spec){
  if(!spec.node)return;
  const r=spec.node.getBoundingClientRect();if(!r.width||!r.height)return;
  const wr=r.width/spec.w,hr=r.height/spec.h;
  // Neither dimension gets to overwhelm the other: height-only resizing also scales.
  const value=clamp(Math.sqrt(wr*hr),spec.min,spec.max);
  spec.node.style.setProperty('--panel-scale',value.toFixed(3));
 }
 if('ResizeObserver' in globalThis){
  const observer=new ResizeObserver(entries=>{
   for(const entry of entries){const spec=panels.find(p=>p.node===entry.target);if(spec)apply(spec)}
  });
  panels.forEach(spec=>{if(spec.node){observer.observe(spec.node);apply(spec)}});
 }else{
  globalThis.addEventListener('resize',()=>panels.forEach(apply));
  panels.forEach(apply);
 }
}
/* Legacy pin coordinates used the ORIGINAL 1771 x 1335 board. Pass 10 extended
   ONLY the cork artwork to 1771 x 3000. Keep old object dimensions in their
   original coordinate space so post-its, photos, stencils, and stickers cannot
   stretch. New pins may occupy the expanded lower section of the board. */
const BOARD_ART_HEIGHT = 3000;
const BOARD_LEGACY_HEIGHT = 1335;
const BOARD_Y_RATIO = BOARD_LEGACY_HEIGHT / BOARD_ART_HEIGHT;
const BOARD_Y_CAP = 100 / BOARD_Y_RATIO;
const boardYPercent = value => (Number(value) || 0) * BOARD_Y_RATIO + '%';
function sizeBoard(){const el=$('#board-surface'),v=$('#workspace-viewport');const base=Math.min(1130,Math.max(300,v.clientWidth-26));el.style.width=(base*state.zoom/100)+'px';$('#zoom-display').textContent=state.zoom+'%'}
function render(){if(renderPending)return;renderPending=true;requestAnimationFrame(()=>{renderPending=false;const b=board();if(!b)return;$('#board-name').textContent=b.name;$('#board-caption').textContent=b.name;$('#privacy-pill').textContent=b.private?'PRIVATE BOARD':'PUBLIC BOARD';$('#board-subtitle').textContent=`${b.items.length} pins · ${b.private?'Private':'Public'}`;$('#mode-label').textContent='Arrange: '+(state.arrange?'On':'Off');$('#board-status').textContent=workspace==='board'?'Your creative pinboard canvas':`Viewing ${workspace}`;$('#board-grid').classList.toggle('visible',state.showGrid);const bg=b.background||'cork';$('#board-surface').style.background=bg==='cork'?'#c18e5d url("../../assets/images/bulletin/classic-brown-cork-board.png") center / 100% auto no-repeat':bg==='paper'?'#fff8e7':bg==='chalk'?'#283b3a':'#d6b991';sizeBoard();renderItems();renderInspector();renderOverlay();renderNavActive()})}
function renderItems(){const host=$('#board-items');host.replaceChildren();for(const x of currentItems().filter(x=>!x.archived)){const el=document.createElement('div');el.className='pin-item '+esc(x.kind)+(x.id&&selected.has(x.id)?' selected':'')+(state.arrange?' arrange-mode':'')+(x.locked?' locked':'')+(x.glitter?' glitter':'')+(x.arrangement?' arrangement-'+String(x.arrangement).replace(/[^a-z0-9-]/gi,''):'');el.dataset.itemId=x.id;el.style.left=x.x+'%';el.style.top=boardYPercent(x.y);el.style.width=x.w+'%';el.style.height=boardYPercent(x.h);el.style.transform=`rotate(${x.rotation||0}deg)`;el.style.zIndex=String(x.z||2);if(x.color)el.style.backgroundColor=x.color;decorateItemBorder(el,x);if(x.kind==='photo'||x.kind==='sticker'||x.kind==='drawing'){const img=document.createElement('img');img.src=x.data||'';img.alt=x.title||x.kind;img.draggable=false;if(x.shape)img.className='shape-'+x.shape;el.append(img);if(x.caption){const label=document.createElement('div');label.className='bulletin-object-caption';label.textContent=x.caption;decorateTypographyText(label,x);el.append(label)}}else{const t=document.createElement('div');t.className='pin-text';t.textContent=x.text||x.title||'';if(x.color && /^#[0-9a-f]{6}$/i.test(x.color)){const hex=x.color.slice(1);const rgb=[0,2,4].map(n=>parseInt(hex.slice(n,n+2),16)/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);t.style.color=rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722 > .179?'#172219':'#fff'}decorateTypographyText(t,x);el.append(t)}if(Array.isArray(x.effects)){for(const effect of x.effects){if(!effect?.dataUrl)continue;const mark=document.createElement('img');mark.className='bulletin-craft-applied';mark.src=effect.dataUrl;mark.alt='';mark.draggable=false;mark.style.left=(+effect.x||50)+'%';mark.style.top=(+effect.y||50)+'%';mark.style.width=(+effect.size||30)+'%';mark.style.transform='translate(-50%,-50%) rotate('+(+effect.rotation||0)+'deg)';el.append(mark)}}if(x.id&&selected.has(x.id)&&state.arrange){for(const dir of ['nw','n','ne','e','se','s','sw','w']){const grip=document.createElement('span');grip.className='resize-handle';grip.dataset.dir=dir;grip.setAttribute('aria-hidden','true');el.append(grip)}}host.append(el)}}
function renderInspector(){const h=$('#item-inspector');const ids=[...selected];const x=item(ids[0]);if(!x||workspace!=='board'){h.hidden=true;return}h.hidden=false;h.innerHTML=`<div class="inspector-title">${esc(ids.length>1?`${ids.length} selected`:x.title||x.kind)}<button class="icon-button" type="button" data-inspector="clear" aria-label="Deselect">×</button></div><div class="mini-details">${esc(x.kind)} · ${esc(x.tags||'No tags')}${x.locked?' · Locked':''}</div><div class="inspector-controls"><button class="inspector-btn" data-inspector="edit">✎ Edit</button><button class="inspector-btn" data-inspector="tags">🏷 Tags</button><button class="inspector-btn wide" data-inspector="typography">✒ Fonts · formatting · border</button>${['note','quote','scrap','link','event'].includes(x.kind)?'<button class="inspector-btn wide" data-inspector="decorate">♥︎ Decorate Post-it</button>':''}<button class="inspector-btn" data-inspector="fav">${x.favorite?'★ Unfavorite':'☆ Favorite'}</button><button class="inspector-btn" data-inspector="clip">${x.clipped?'✓ Clipped':'🧺 Clip'}</button><button class="inspector-btn" data-inspector="rotate">⟳ Rotate</button><button class="inspector-btn" data-inspector="front">↑ Forward</button><button class="inspector-btn" data-inspector="back">↓ Backward</button><button class="inspector-btn" data-inspector="lock">${x.locked?'Unlock':'Lock'}</button><button class="inspector-btn" data-inspector="duplicate">⧉ Duplicate</button><button class="inspector-btn" data-inspector="archive">${x.archived?'Unarchive':'Archive'}</button><button class="inspector-btn wide" data-inspector="download">⇩ Download / open file</button><button class="inspector-btn wide" data-inspector="delete">🗑 Delete selected</button></div>`}
function makeItem(kind,attrs={}){const count=currentItems().length,base={id:uid(),kind,title:kind[0].toUpperCase()+kind.slice(1),text:'',x:36+(count%4)*12,y:13+(count%4)*13,w:21,h:20,z:2+count,rotation:0,created:stamp(),tags:'',favorite:false,clipped:false,archived:false,locked:false};if(kind==='photo'||kind==='sticker')Object.assign(base,{w:25,h:27});if(kind==='washi')Object.assign(base,{w:30,h:5});if(kind==='stencil'||kind==='stamp')Object.assign(base,{w:22,h:18});if(kind==='drawing')Object.assign(base,{w:25,h:25});const view=$('#workspace-viewport'),surface=$('#board-surface');
 if(view&&surface&&view.scrollTop>70){
  const scrollUnits=view.scrollTop/Math.max(1,surface.offsetHeight)*BOARD_Y_CAP;
  base.y=clamp(Math.max(base.y,scrollUnits+8),0,BOARD_Y_CAP-base.h);
 }
 return {...base,...attrs}}
function addItem(kind,attrs,msg){
 const publiclyShared=kind==='link'&&!board().private;
 commit(()=>{const x=makeItem(kind,attrs);board().items.push(x);selected=new Set([x.id]);workspace='board';menuVisible=false;$('#menu-popout').hidden=true},msg||'Added to your board');
 if(publiclyShared)window.OurSpaceActivity?.publish({type:'pin',author:PROFILE,title:attrs?.title||'Pinned article',body:attrs?.text||'',url:attrs?.url||'',source:'Bulletin Board',reason:'Pinned to public board'});
}
function showDialog(title,fields,cb,submit='Save'){dialogAction=cb;$('#dialog-title').textContent=title;$('#dialog-submit').textContent=submit;const root=$('#dialog-body');root.innerHTML='';fields.forEach(f=>{if(f.info){const p=document.createElement('p');p.className='form-help';p.textContent=f.info;root.append(p);return}const label=document.createElement('label');label.htmlFor='df-'+f.name;label.textContent=f.label||f.name;root.append(label);let el;if(f.type==='textarea')el=document.createElement('textarea');else if(f.type==='select'){el=document.createElement('select');(f.options||[]).forEach(o=>{const opt=document.createElement('option');if(typeof o==='string'){opt.value=o;opt.textContent=o}else{opt.value=o[0];opt.textContent=o[1]}el.append(opt)})}else{el=document.createElement('input');el.type=f.type||'text';if(f.type==='checkbox')el.checked=Boolean(f.value)}el.name=f.name;el.id='df-'+f.name;if(f.type!=='checkbox')el.value=f.value??'';if(f.placeholder)el.placeholder=f.placeholder;if(f.maxLength)el.maxLength=f.maxLength;if(f.min!=null)el.min=f.min;if(f.max!=null)el.max=f.max;if(f.step!=null)el.step=f.step;root.append(el);if(f.type==='range'){const output=document.createElement('output');output.className='bulletin-range-value';output.htmlFor=el.id;output.textContent=String(el.value)+(f.name==='fontSize'||f.name==='borderWidth'?' px':'');el.addEventListener('input',()=>{output.textContent=el.value+' px'});root.append(output)}if(f.name==='fontFamily'){el.addEventListener('change',()=>loadGoogleFont(el.value));loadGoogleFont(el.value)}});$('#bulletin-dialog').showModal();const first=$('#dialog-body input,#dialog-body textarea,#dialog-body select');first?.focus()}
function closeDialog(){$('#bulletin-dialog').close();dialogAction=null}
function askName(title,value,cb){showDialog(title,[{name:'name',label:'Name',value,maxLength:100}],v=>{if(v.name.trim())cb(v.name.trim());else notice('Please enter a name')})}
function confirmAction(title,message,fn){showDialog(title,[{info:message}],fn,'Confirm')}
function promptItem(kind,title='Create a pin'){showDialog(title,[{name:'title',label:'Title',value:''},{name:'text',label:'Content',type:'textarea',placeholder:'Write something...'},{name:'color',label:'Paper color',type:'select',options:(window.BulletinPostitColors?.colors().map(c=>[c.hex,c.name+' · '+c.family])||[['#ffeb9a','Yellow'],['#fff9e9','Cream'],['#f9d3d7','Blush'],['#d9ebed','Blue'],['#e9d9f5','Lavender'],['#e2f0cf','Mint']])},...typographyFields()],v=>addItem(kind,{title:saneText(v.title)||'Untitled',text:saneText(v.text)||v.title,color:v.color,caption:saneText(v.caption),textStyle:styleFromForm(v)},'Added a new pin'))}
async function fileRead(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(new Error('Could not read file'));r.readAsDataURL(file)})}
function chooseFile(kind){uploadAction=kind;const f=$('#file-input');f.value='';f.accept=['photo','sticker','cutout','journal-photo','decor'].includes(kind)?'image/png,image/jpeg,image/webp,image/gif':'image/*,.pdf,.txt,.md,.doc,.docx,.odt';f.click()}
async function processUpload(file,kind){if(!file)return;if(file.size>22*1024*1024){notice('Choose a file under 22 MB');return}const data=await fileRead(file);if(kind==='photo'||kind==='decor'){addItem('photo',{title:file.name,data,text:file.name},'Photo added')}else if(kind==='sticker'||kind==='cutout'){showDialog('Create photo sticker',[{name:'title',label:'Sticker name',value:file.name},{name:'shape',label:'Cutout shape',type:'select',options:[['rounded','Rounded'],['circle','Circle'],['heart','Heart'],['none','Original shape']]},{name:'remove',label:'Remove solid background (uses upper-left corner color)',type:'checkbox',value:false},{name:'tolerance',label:'Background tolerance (0–120)',type:'number',value:30,min:0,max:120}],async v=>{let output=data;if(v.remove){try{output=await removeBackground(data,Number(v.tolerance)||30)}catch(e){notice('Could not remove background; original used')}}addItem('sticker',{title:v.title||file.name,data:output,shape:v.shape},'Sticker added to board')})}else if(kind==='journal-photo'){withJournal(p=>{p.scraps.push({id:uid(),kind:'photo',data,title:file.name});notice('Photo added to journal page')})}else{addItem('document',{title:file.name,text:`📄 ${file.name}`,data,mime:file.type},'Document attached')}}
async function removeBackground(data,tolerance){const img=new Image();img.src=data;await img.decode();const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),d=pixels.data;const bg=[d[0],d[1],d[2]];for(let i=0;i<d.length;i+=4){const dist=Math.sqrt((d[i]-bg[0])**2+(d[i+1]-bg[1])**2+(d[i+2]-bg[2])**2);if(dist<tolerance)d[i+3]=0}ctx.putImageData(pixels,0,0);return canvas.toDataURL('image/png')}
function selectedUpdate(fn,msg='Updated item'){const ids=[...selected];if(!ids.length){notice('Select a pin first');return}commit(()=>currentItems().filter(x=>ids.includes(x.id)).forEach(fn),msg)}
function editSelected(){const x=item([...selected][0]);if(!x){notice('Select an item to edit');return}showDialog('Edit '+x.kind,[{name:'title',label:'Title',value:x.title},{name:'text',label:'Content',type:'textarea',value:x.text||''},{name:'color',label:'Background hex color (optional)',value:x.color||'',placeholder:'#ffeb9a'},...typographyFields(x)],v=>selectedUpdate(t=>{t.title=saneText(v.title);t.text=saneText(v.text);t.caption=saneText(v.caption);t.textStyle=styleFromForm(v);t.color=/^#[0-9a-f]{6}$/i.test(v.color)?v.color:t.color},'Item edited'))}
function handleInspector(action){const x=item([...selected][0]);if(action==='clear'){selected.clear();render();return}if(!x)return;if(action==='decorate'){window.BulletinCraftStudio?.open('glitter',x.id);return}if(action==='edit'){editSelected();return}if(action==='typography'){showDialog('Fonts, formatting and border',typographyFields(x),v=>selectedUpdate(t=>{t.caption=saneText(v.caption);t.textStyle=styleFromForm(v)},'Text and border styling saved'));return}if(action==='tags'){showDialog('Pin details and tags',[{name:'title',label:'Title',value:x.title},{name:'tags',label:'Comma-separated tags',value:x.tags||''}],v=>selectedUpdate(t=>{t.title=v.title;t.tags=v.tags},'Tags saved'));return}if(action==='download'){if(!x.data){if(x.url)window.open(x.url,'_blank','noopener');else notice('No attached file on this pin');return}const a=document.createElement('a');a.href=x.data;a.download=x.title||'bulletin-file';a.click();return}if(action==='delete'){confirmAction('Delete pins?','Selected pins will be removed from this board. You can use Undo immediately afterward.',()=>commit(()=>{board().items=board().items.filter(i=>!selected.has(i.id));selected.clear()},'Pins deleted'));return}if(action==='duplicate'){commit(()=>{const clones=currentItems().filter(i=>selected.has(i.id)).map(i=>({...structuredClone(i),id:uid(),x:clamp(i.x+5,0,95),y:clamp(i.y+5,0,95),created:stamp()}));board().items.push(...clones);selected=new Set(clones.map(c=>c.id))},'Pins duplicated');return}const edits={fav:i=>i.favorite=!i.favorite,clip:i=>i.clipped=!i.clipped,rotate:i=>i.rotation=((i.rotation||0)+15)%360,front:i=>i.z=(i.z||1)+1,back:i=>i.z=Math.max(1,(i.z||2)-1),lock:i=>i.locked=!i.locked,archive:i=>i.archived=!i.archived};if(edits[action])selectedUpdate(edits[action],'Updated selected pins')}
function goBoard(){workspace='board';selected.clear();render()}
function changeBoard(id){const b=state.boards.find(x=>x.id===id);if(!b)return;commit(()=>{state.currentBoard=id;selected.clear();currentJournal=null;workspace='board'},'Opened '+b.name)}
function journalPage(){const pages=board().journal||[];return pages.find(x=>x.id===currentJournal)||pages[pages.length-1]}
function withJournal(fn){if(!board().journal?.length){commit(()=>{const p={id:uid(),title:'Journal page 1',body:'',paper:'lined',cover:'kraft',scraps:[],created:stamp()};board().journal=[p];currentJournal=p.id},'Created your first journal page')}const p=journalPage();if(!p)return;commit(()=>{fn(p);workspace='journal';currentJournal=p.id},'Journal updated')}
function journalNew(){askName('New journal page','Untitled journal page',name=>{commit(()=>{const p={id:uid(),title:name,body:'',paper:'lined',cover:'kraft',scraps:[],created:stamp()};board().journal.push(p);currentJournal=p.id;workspace='journal'},'Journal page created')})}
function journalScrap(kind='scrap'){if(kind==='photo'){chooseFile('journal-photo');return}if(kind==='drawing'){startDrawing(true);return}if(kind==='washi'){withJournal(p=>p.scraps.push({id:uid(),kind:'washi',title:'Washi tape'}));return}askName(kind==='scrap'?'Add a paper scrap':'Add an embellishment','A little keepsake...',name=>withJournal(p=>p.scraps.push({id:uid(),kind,title:name})))}
function startDrawing(toJournal=false){showDialog('Handwritten note',[{info:'Use a mouse, touchscreen, or pen to draw on the paper. The drawing is saved with your board.'},{name:'color',label:'Ink color',type:'select',options:[['#252525','Black'],['#225e87','Blue'],['#ab1538','Crimson'],['#886821','Gold']]}],v=>{const canvas=$('#draw-canvas');if(!canvas)return;const img=canvas.toDataURL('image/png');if(toJournal)withJournal(p=>p.scraps.push({id:uid(),kind:'drawing',title:'Handwritten note',data:img}));else addItem('drawing',{title:'Handwritten note',data:img},'Handwriting added')});const body=$('#dialog-body');const canvas=document.createElement('canvas');canvas.id='draw-canvas';canvas.width=700;canvas.height=420;canvas.className='drawing-canvas';body.append(canvas);const ctx=canvas.getContext('2d');ctx.clearRect(0,0,700,420);let down=false;canvas.addEventListener('pointerdown',e=>{down=true;canvas.setPointerCapture(e.pointerId);const r=canvas.getBoundingClientRect();ctx.beginPath();ctx.moveTo((e.clientX-r.left)*700/r.width,(e.clientY-r.top)*420/r.height)});canvas.addEventListener('pointermove',e=>{if(!down)return;const r=canvas.getBoundingClientRect();ctx.strokeStyle=$('#df-color')?.value||'#252525';ctx.lineWidth=4;ctx.lineCap='round';ctx.lineJoin='round';ctx.lineTo((e.clientX-r.left)*700/r.width,(e.clientY-r.top)*420/r.height);ctx.stroke()});canvas.addEventListener('pointerup',()=>down=false);canvas.addEventListener('pointercancel',()=>down=false)}
function readingOpen(filter='all'){workspace='reading';workspaceFilter=filter;render()}
function addReading(type='article'){showDialog('Add to reading space',[{name:'type',label:'Type',type:'select',value:type,options:[['article','Saved article'],['book','Book'],['document','Document'],['quote','Quote / excerpt']]},{name:'title',label:'Title',value:''},{name:'url',label:'Link (optional)',type:'url',placeholder:'https://example.com'},{name:'notes',label:'Notes or quote',type:'textarea'},{name:'progress',label:'Progress (0–100%)',type:'number',value:0,min:0,max:100}],v=>{commit(()=>{board().reading.push({id:uid(),type:v.type,title:v.title||'Untitled',url:v.url,notes:v.notes,progress:clamp(+v.progress||0,0,100),bookmarked:false,highlights:'',created:stamp()});workspace='reading';workspaceFilter='all'},'Saved to reading list')})}
function readingEdit(id){const x=board().reading.find(r=>r.id===id);if(!x)return;showDialog('Reading notes and progress',[{name:'title',label:'Title',value:x.title},{name:'notes',label:'Reading notes',value:x.notes,type:'textarea'},{name:'highlights',label:'Highlights / excerpts',value:x.highlights||'',type:'textarea'},{name:'progress',label:'Progress (%)',type:'number',value:x.progress||0,min:0,max:100},{name:'bookmarked',label:'Bookmark this item',type:'checkbox',value:x.bookmarked}],v=>commit(()=>{Object.assign(x,{title:v.title,notes:v.notes,highlights:v.highlights,progress:clamp(+v.progress||0,0,100),bookmarked:v.bookmarked})},'Reading entry saved'))}
function inspectReading(action){const x=board().reading.at(-1);if(!x){addReading(action==='reading-quotes'?'quote':'article');return}if(action==='reading-bookmarks'){readingOpen('bookmarked');return}if(action==='reading-highlights'){readingOpen('highlights');return}if(action==='reading-progress'){readingOpen('all');return}if(action==='reading-notes'){readingOpen('all');return}}
function setView(v){commit(()=>{state.view=v;workspace=v==='freeform'?'board':'collection';workspaceFilter=v},v+' view selected')}
function libraryOpen(filter){workspace='library';workspaceFilter=filter;render()}
function drawOverlayCard(title,subtitle,buttonHTML){return `<div class="workspace-card"><div><strong>${esc(title)}</strong><small>${esc(subtitle)}</small></div><div class="workspace-actions">${buttonHTML}</div></div>`}
function renderOverlay(){const host=$('#workspace-overlay');if(workspace==='board'){host.hidden=true;return}host.hidden=false;let html=`<div class="workspace-actions"><button class="gold-button small" data-overlay="board">← Back to pinboard</button></div>`;
if(workspace==='boards'){html+='<h2>Your Pinboards</h2><p class="subdued">Choose a board to open, or create another workspace.</p>';for(const b of state.boards){html+=drawOverlayCard(b.name,`${b.items.length} pins · ${b.private?'Private':'Public'}`,`<button class="gold-button small" data-overlay="switch" data-id="${b.id}">Open</button>`)}html+='<button class="gold-button" data-action="new-board">＋ New board</button>'}
if(workspace==='collection'){const filtered=sortItems(allItems().filter(x=>!x.archived && (state.filter==='all'||(state.filter==='notes'&&['note','quote'].includes(x.kind))||(state.filter==='photos'&&x.kind==='photo')||(state.filter==='favorites'&&x.favorite))));html+=`<h2>${esc(state.view[0].toUpperCase()+state.view.slice(1))} view</h2><p class="subdued">Change item layout without moving your corkboard pins.</p>`;const tileWidth=state.view==='compact'?100:({small:135,medium:190,large:265}[state.thumb]||190);const layout=state.view==='list'?'display:block':state.view==='masonry'?'columns:'+Math.max(2,Math.floor(window.innerWidth/tileWidth))+';column-gap:11px':'display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax('+tileWidth+'px,1fr))';html+='<div class="collection-grid" style="'+layout+'">';for(const x of filtered){html+=`<article class="workspace-card" style="display:block;break-inside:avoid"><strong>${esc(x.title)}</strong><small>${esc(x.text||x.kind).slice(0,130)}</small><div class="workspace-actions"><button class="gold-button small" data-overlay="item" data-id="${x.id}" data-board="${x.boardId}">On board</button></div></article>`}html+='</div>'}
if(workspace==='journal'){const pages=board().journal;if(!pages.length){html+='<h2>Junk Journal</h2><p>Your journal has no pages yet.</p><button class="gold-button" data-action="journal-new">＋ New page</button>'}else{const p=journalPage();if(!p)return;const index=pages.findIndex(x=>x.id===p.id);html+=`<h2>📖 ${esc(p.title)}</h2><p class="subdued">Page ${index+1} of ${pages.length} · ${esc(p.cover||'kraft')} cover</p><div class="workspace-actions"><button class="gold-button small" data-overlay="page-prev">← Previous</button><button class="gold-button small" data-overlay="page-next">Next →</button><button class="gold-button small" data-action="journal-new">＋ Page</button><button class="gold-button small" data-action="journal-scrap">✂ Scrap</button><button class="gold-button small" data-action="journal-washi">Washi tape</button></div><div class="journal-sheet" data-cover="${esc(p.cover||'kraft')}" data-paper="${esc(p.paper||'lined')}"><h3>${esc(p.title)}</h3><textarea id="journal-textarea" aria-label="Journal writing" placeholder="Begin writing your journal page...">${esc(p.body)}</textarea><div class="journal-scraps">`;for(const s of p.scraps){html+=`<div class="workspace-card"><div><strong>${esc(s.title)}</strong><small>${esc(s.kind)}</small></div>${s.data?`<img src="${s.data}" alt="${esc(s.title)}" style="height:60px;max-width:110px;object-fit:contain">`:s.kind==='washi'?'<div style="width:130px;height:16px;background:repeating-linear-gradient(45deg,#ffd28e,#d69aba 13px,#eecf83 25px)"></div>':''}<button class="gold-button small" data-overlay="scrap-delete" data-id="${s.id}">Remove</button></div>`}html+='</div></div>'}}
if(workspace==='reading'){const entries=board().reading.filter(x=>workspaceFilter==='all'||workspaceFilter===x.type||(workspaceFilter==='bookmarked'&&x.bookmarked)||(workspaceFilter==='highlights'&&x.highlights));html+=`<h2>📚 Reading space</h2><p class="subdued">Saved articles, documents, bookmarks, notes, and progress.</p><div class="workspace-actions"><button class="gold-button small" data-overlay="reading-add">＋ Add reading item</button><button class="gold-button small" data-overlay="reading-filter" data-filter="all">All</button><button class="gold-button small" data-overlay="reading-filter" data-filter="bookmarked">Bookmarks</button><button class="gold-button small" data-overlay="reading-filter" data-filter="highlights">Highlights</button></div>`;for(const x of entries){html+=drawOverlayCard(x.title,`${x.type} · ${x.progress||0}% complete · ${x.notes||'No notes yet'}`,`<button class="gold-button small" data-overlay="reading-edit" data-id="${x.id}">Notes / Progress</button>${x.url?`<button class="gold-button small" data-overlay="reading-open" data-id="${x.id}">Open link</button>`:''}<button class="gold-button small" data-overlay="reading-remove" data-id="${x.id}">Delete</button>`)}if(!entries.length)html+='<p class="subdued">No reading items in this section yet.</p>'}
if(workspace==='library'){let entries=libraryEntries();const filters={all:x=>true,clips:x=>x.clipped,favorites:x=>x.favorite,archive:x=>x.archived,recent:x=>true,photos:x=>x.kind==='photo',stickers:x=>x.kind==='sticker',scraps:x=>['scrap','washi','stencil','stamp','drawing'].includes(x.kind),documents:x=>x.kind==='document'};entries=entries.filter(filters[workspaceFilter]||filters.all);entries=sortItems(entries);html+=`<h2>🗂 Library · ${esc(workspaceFilter)}</h2><p class="subdued">Browse all boards and your collected content.</p><div class="workspace-actions"><button class="gold-button small" data-overlay="library-filter" data-filter="all">All</button><button class="gold-button small" data-overlay="library-filter" data-filter="favorites">Favorites</button><button class="gold-button small" data-overlay="library-filter" data-filter="archive">Archive</button></div>`;for(const x of entries){html+=drawOverlayCard(x.title||x.kind,`${x.kind} · ${x.boardName}${x.tags?' · '+x.tags:''}`,`<button class="gold-button small" data-overlay="item" data-source="${x.source}" data-page="${x.pageId||''}" data-id="${x.id}" data-board="${x.boardId}">Open</button><button class="gold-button small" data-overlay="library-fav" data-source="${x.source}" data-id="${x.id}" data-board="${x.boardId}">${x.favorite?'★':'☆'}</button>${x.archived?`<button class="gold-button small" data-overlay="library-unarchive" data-id="${x.id}" data-board="${x.boardId}">Restore pin</button>`:''}`)}if(!entries.length)html+='<p class="subdued">Nothing saved to this collection yet.</p>'}
if(workspace==='restore'){html+='<h2>Restore deleted board</h2><p class="subdued">Deleted boards are kept here until you restore them. Export a backup for a permanent copy.</p>';for(const b of state.deletedBoards){html+=drawOverlayCard(b.name,`${b.items.length} pins · deleted`, `<button class="gold-button small" data-overlay="restore" data-id="${b.id}">Restore</button>`)}if(!state.deletedBoards.length)html+='<p>No deleted boards to restore.</p>'}
host.innerHTML=html}
function sortItems(items){return [...items].sort((a,b)=>state.sort==='oldest'?String(a.created).localeCompare(b.created):state.sort==='title'?a.title.localeCompare(b.title):String(b.created).localeCompare(a.created))}
function overlayAction(target){const a=target.dataset.overlay,id=target.dataset.id;if(a==='board'){goBoard();return}if(a==='switch'){changeBoard(id);return}if(a==='item'){state.currentBoard=target.dataset.board;const source=target.dataset.source;
 if(source==='journal'||source==='journal-scrap'){workspace='journal';currentJournal=source==='journal'?id:target.dataset.page;selected.clear()}
 else if(source==='reading'){workspace='reading';workspaceFilter='all';selected.clear()}
 else {workspace='board';selected=new Set([id]);if(item(id)?.archived){notice('Restore this archived pin from Library to see it on your board')}}render();return}if(a==='restore'){commit(()=>{const i=state.deletedBoards.findIndex(b=>b.id===id);if(i<0)return;const b=state.deletedBoards.splice(i,1)[0];state.boards.push(b);state.currentBoard=b.id;workspace='board'},'Board restored');return}if(a==='reading-add'){addReading();return}if(a==='reading-edit'){readingEdit(id);return}if(a==='reading-open'){const x=board().reading.find(r=>r.id===id);if(x?.url&&/^https?:\/\//i.test(x.url))window.open(x.url,'_blank','noopener');return}if(a==='reading-remove'){confirmAction('Remove reading entry?','This deletes this reading item.',()=>commit(()=>{board().reading=board().reading.filter(r=>r.id!==id)},'Reading entry removed'));return}if(a==='reading-filter'){workspaceFilter=target.dataset.filter;render();return}if(a==='library-filter'){workspaceFilter=target.dataset.filter;render();return}if(a==='library-fav'){commit(()=>{const b=state.boards.find(b=>b.id===target.dataset.board);if(!b)return;const x=[...b.items,...b.journal,...b.reading,...b.journal.flatMap(p=>p.scraps||[])].find(i=>i.id===id);if(x)x.favorite=!x.favorite},'Favorites updated');return}
 if(a==='library-unarchive'){commit(()=>{const x=state.boards.find(b=>b.id===target.dataset.board)?.items.find(i=>i.id===id);if(x)x.archived=false},'Pin restored to board');return}if(a==='page-prev'||a==='page-next'){const pages=board().journal,i=pages.findIndex(p=>p.id===journalPage()?.id),next=clamp(i+(a==='page-next'?1:-1),0,pages.length-1);currentJournal=pages[next].id;render();return}if(a==='scrap-delete'){commit(()=>{journalPage().scraps=journalPage().scraps.filter(s=>s.id!==id)},'Scrap removed')}}
function exportBackup(){const date=new Date().toISOString().slice(0,10),blob=new Blob([JSON.stringify({type:'bulletin-backup',exportedAt:stamp(),state},null,2)],{type:'application/json'});const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=`Bulletin_Backup_${date}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);notice('Backup archive downloaded')}
function importBackup(){uploadAction='backup';const f=$('#file-input');f.value='';f.accept='application/json,.json';f.click()}
function convertLegacyArchive(raw){
 const source=raw?.state||raw;
 const boards=source?.boards||(source?.board?{[source.board.id]:source.board}:null),placements=source?.placements,items=source?.items;
 if(!boards||!placements||!items)throw Error('Not a legacy Bulletin archive');
 const boardDefs=source.board?[source.board]:Object.values(boards);
 if(!boardDefs.length)throw Error('No boards were present');
 const converted={...initial(),boards:[],deletedBoards:[],zoom:Math.round((source.zoom||1)*100)};
 for(const oldBoard of boardDefs){
  const b={id:uid(),name:oldBoard.title||oldBoard.name||'Imported board',private:oldBoard.private!==false,background:['cork','paper','chalk','linen'].includes(oldBoard.theme)?oldBoard.theme:'cork',created:oldBoard.createdAt||stamp(),items:[],journal:[],reading:[]};
  for(const p of Object.values(placements).filter(x=>x.boardId===oldBoard.id)){
   const x=items[p.itemId];if(!x)continue;
   let data=x.asset?.dataUrl||x.asset?.localPath||'';
   let kind=x.type==='image'?'sticker':x.type==='file'?'document':x.type==='event'?'event':x.type||'note';
   b.items.push({id:uid(),kind,title:x.title||'Untitled',text:x.body||'',url:x.source?.originalUrl||'',data,
    x:clamp((+p.x||100)/13,0,94),y:clamp((+p.y||100)/9.7,0,94),w:clamp((+p.width||250)/13.3,5,70),h:clamp((+p.height||230)/9.3,5,70),
    z:+p.z||2,rotation:+p.rotation||0,color:p.noteColor||'#F7E7CE',created:x.createdAt||stamp(),tags:Array.isArray(x.tags)?x.tags.join(', '):x.tags||'',
    favorite:!!x.favorite,clipped:!!x.inbox,archived:!!x.archived,locked:!!p.locked,effects:Array.isArray(p.effects)?p.effects:[],arrangement:x.scrapbookArrangement||''});
  }
  converted.boards.push(b);
  if(oldBoard.id===source.activeBoardId)converted.currentBoard=b.id;
 }
 if(!converted.boards.some(b=>b.id===converted.currentBoard))converted.currentBoard=converted.boards[0].id;
 return converted;
}
async function readBackup(file){try{
 const raw=JSON.parse(await file.text());let incoming=null;
 if(raw?.type==='bulletin-backup'&&raw?.state?.version===1&&Array.isArray(raw.state.boards))incoming=raw.state;
 else if(raw?.format==='Bulletin Archive'||raw?.format==='Bulletin Board'||(raw?.schemaVersion===1&&raw?.placements))incoming=convertLegacyArchive(raw);
 else throw Error('Unrecognized backup: expected Bulletin backup, archive, or board export');
 confirmAction('Import Bulletin backup?',`Import ${incoming.boards.length} board(s) and replace your current workspace? Export your current archive first if you want to preserve it.`,()=>commit(()=>{state=incoming;selected.clear();workspace='board'},'Bulletin archive imported'));
 }catch(error){console.error(error);notice('Import failed: '+error.message)}}

function setBackground(){showDialog('Board background',[{name:'background',label:'Background',value:board().background||'cork',type:'select',options:[['cork','Classic brown cork (uploaded image)'],['paper','Cream paper'],['linen','Warm linen'],['chalk','Dark chalkboard']]}],v=>commit(()=>{board().background=v.background},'Board background changed'))}
function gridSettings(){showDialog('Grid and snapping settings',[{name:'showGrid',label:'Show alignment grid',type:'checkbox',value:state.showGrid},{name:'snap',label:'Snap dragged items to 5% grid',type:'checkbox',value:state.snap}],v=>commit(()=>{state.showGrid=v.showGrid;state.snap=v.snap},'Grid preferences saved'))}
function zoomDialog(){showDialog('Zoom controls',[{name:'zoom',label:'Zoom percentage (35–250)',type:'number',value:state.zoom,min:35,max:250}],v=>commit(()=>{state.zoom=clamp(+v.zoom||100,35,250)},'Zoom updated'))}
function fit(){const v=$('#workspace-viewport');const base=Math.min(1130,Math.max(300,v.clientWidth-26));const desired=Math.min(100,Math.floor((v.clientHeight-26)/(base*3000/1771)*100));commit(()=>{state.zoom=clamp(desired,35,250)},'Fit board to screen')}
function toggleFullscreen(){
 const host=$('#bulletin-root');
 if(document.fullscreenElement===host){document.exitFullscreen?.().catch(()=>notice('Unable to exit fullscreen'));return}
 if(!host.requestFullscreen){notice('Fullscreen is unavailable in this browser');return}
 host.requestFullscreen().catch(()=>notice('Fullscreen was blocked by the browser'));
}
function exitBulletinFullscreen(){
 if(document.fullscreenElement===$('#bulletin-root'))document.exitFullscreen?.().catch(()=>notice('Unable to exit fullscreen'));
}
function alignSelected(){const a=currentItems().filter(x=>selected.has(x.id));if(a.length<2){notice('Select two or more pins using Shift-click');return}showDialog('Align and distribute',[{name:'align',label:'Alignment',type:'select',options:[['left','Align left'],['center','Center horizontally'],['top','Align top'],['middle','Align vertically'],['space-x','Distribute horizontally'],['space-y','Distribute vertically']]}],v=>selectedUpdate(x=>{if(v.align==='left')x.x=Math.min(...a.map(i=>i.x));if(v.align==='top')x.y=Math.min(...a.map(i=>i.y));if(v.align==='center')x.x=a.reduce((s,i)=>s+i.x+i.w/2,0)/a.length-x.w/2;if(v.align==='middle')x.y=a.reduce((s,i)=>s+i.y+i.h/2,0)/a.length-x.h/2;if(['space-x','space-y'].includes(v.align)){const axis=v.align==='space-x'?'x':'y',sorted=[...a].sort((l,r)=>l[axis]-r[axis]),i=sorted.findIndex(t=>t.id===x.id),min=sorted[0][axis],max=sorted.at(-1)[axis];x[axis]=min+(max-min)*i/Math.max(1,sorted.length-1)}},'Pins aligned'))}
function groupSelected(){const a=currentItems().filter(x=>selected.has(x.id));if(!a.length){notice('Select one or more pins first');return}const g=a.every(i=>i.group&&i.group===a[0].group)?null:uid();selectedUpdate(i=>i.group=g,g?'Pins grouped':'Pins ungrouped')}
function arrangeHint(msg){if(!state.arrange)commit(()=>state.arrange=true,'Arrange mode enabled');notice(msg)}
async function shareBulletinBoard(){
 const current=board();
 if(!current||current.sharedFrom)return notice('Choose one of your own boards to share.');
 if(!globalThis.OurSpaceActivity?.shareCollection)return notice('Sign into OurSpace to share a board.');
 // Sharing is explicit. Only pins, notes, and safe links go to the partner.
 // Junk-journal pages, reading notes, archived content and local blobs stay private.
 const items=current.items.filter(i=>!i.archived).slice(0,70).map(pin=>({
  id:pin.id,title:pin.title||'Pin',kind:pin.kind||'note',
  body:String(pin.text||'').slice(0,600),
  url:/^https?:\/\//i.test(pin.url||'')?pin.url:''
 }));
 try{
  await globalThis.OurSpaceActivity.shareCollection({
   category:'bulletin',id:current.id,name:current.name,
   collectionType:'board',entries:items
  });
  commit(()=>{current.shared=true;current.private=false},'Board shared with your OurSpace partner.');
 }catch(err){notice('Board sharing was not confirmed: '+err.message)}
}
let processingSharedBoards=false;
function importSharedBulletinBoards(){
 if(processingSharedBoards)return;
 processingSharedBoards=true;
 try{
  const incoming=globalThis.OurSpaceActivity?.sharedCollections?.().filter(e=>
   e.author!==PROFILE&&e.metadata?.sharedCollection?.category==='bulletin')||[];
  let change=false;
  for(const event of incoming){
   const c=event.metadata.sharedCollection,id='partner-bulletin-'+event.author+'-'+c.id;
   let target=state.boards.find(b=>b.id===id);
   if(target?.sharedRevision&&Date.parse(target.sharedRevision)>=Date.parse(event.createdAt))continue;
   if(!target){
    target={id,name:'♥ '+c.name+' ('+event.author+')',private:false,
     shared:true,sharedFrom:event.author,background:'cork',created:stamp(),
     items:[],journal:[],reading:[]};
    state.boards.push(target);
   }
   target.sharedRevision=event.createdAt;
   target.items=(c.entries||[]).map((entry,index)=>({
    id:'shared-pin-'+index+'-'+entry.id,kind:entry.kind||'note',
    title:entry.title||'Shared pin',text:entry.body||'',
    url:/^https?:\/\//i.test(entry.url||'')?entry.url:'',
    x:8+(index%5)*17,y:12+Math.floor(index/5)*15,w:16,h:14,
    rotation:0,z:index+2,created:stamp(),color:'#F7E7CE',
    favorite:false,clipped:false,archived:false,locked:false
   }));
   change=true;
  }
  if(change){queueSave();render();notice('A partner-shared Bulletin board was updated.')}
 }finally{processingSharedBoards=false}
}
function action(a){switch(a){
case 'open-board':case 'my-bulletin':goBoard();break;
case 'new-board':askName('Name your new board','New Bulletin',name=>commit(()=>{const b={id:uid(),name,private:true,background:'cork',created:stamp(),items:[],journal:[],reading:[]};state.boards.push(b);state.currentBoard=b.id;selected.clear();workspace='board'},'New board created'));break;
case 'switch-board':workspace='boards';render();break;
case 'rename-board':askName('Rename board',board().name,name=>commit(()=>{board().name=name},'Board renamed'));break;
case 'duplicate-board':askName('Duplicate board',board().name+' (copy)',name=>commit(()=>{const b=structuredClone(board());b.id=uid();b.name=name;b.created=stamp();b.items.forEach(i=>i.id=uid());b.journal.forEach(p=>p.id=uid());b.reading.forEach(r=>r.id=uid());state.boards.push(b);state.currentBoard=b.id;selected.clear();workspace='board'},'Board duplicated'));break;
case 'delete-board':confirmAction('Delete current board?',`“${board().name}” will be moved to the Restore board area.`,()=>commit(()=>{const b=board();state.deletedBoards.push(b);state.boards=state.boards.filter(x=>x.id!==b.id);if(!state.boards.length){const n={id:uid(),name:'My Bulletin',private:true,background:'cork',created:stamp(),items:[],journal:[],reading:[]};state.boards.push(n)}state.currentBoard=state.boards[0].id;workspace='board';selected.clear()},'Board moved to restore area'));break;
case 'share-board':void shareBulletinBoard();break;
case 'privacy-board':case 'privacy-settings':showDialog('Board privacy',[{name:'privacy',label:'Visibility',type:'select',value:board().private?'private':'public',options:[['private','Private'],['public','Public (local label only)']]},{info:'Public is a visibility label only. This standalone offline Bulletin has no cloud publishing or sharing service.'}],v=>commit(()=>{board().private=v.privacy==='private'},'Board visibility updated'));break;
case 'new-pin':promptItem('note','Create a pin');break;case 'add-event':showDialog('Add event pin',[{name:'title',label:'Event title',value:''},{name:'date',label:'Event date / time',type:'datetime-local',value:''},{name:'location',label:'Location',value:''},{name:'text',label:'Details',type:'textarea',value:''}],v=>addItem('event',{title:saneText(v.title)||'Event',text:[v.date?new Date(v.date).toLocaleString():'',v.location,saneText(v.text)].filter(Boolean).join('\n'),eventDate:v.date,eventLocation:saneText(v.location)},'Event pin added'));break;
case 'add-photo':chooseFile('photo');break;
case 'add-note':promptItem('note','Add Post-it note');break;
case 'add-link':showDialog('Pin a webpage',[{name:'title',label:'Link title'},{name:'url',label:'Web address',type:'url',placeholder:'https://example.com'},{name:'description',label:'Description',type:'textarea'}],v=>{if(!/^https?:\/\//i.test(v.url)){notice('Enter a valid http(s) link');return}addItem('link',{title:v.title||v.url,text:v.description||'🔗 '+v.url,url:v.url,color:'#fff9e7'})});break;
case 'add-document':chooseFile('document');break;
case 'add-quote':promptItem('quote','Add quote / excerpt');break;
case 'edit-pins':arrangeHint('Select a pin to edit, drag or resize it');break;
case 'pin-details':if(selected.size)renderInspector();else{workspace='collection';state.view='list';render()}break;
case 'view-grid':setView('grid');break;case 'view-masonry':setView('masonry');break;case 'view-freeform':setView('freeform');break;case 'view-list':setView('list');break;case 'view-compact':setView('compact');break;
case 'thumb-size':showDialog('Thumbnail size',[{name:'size',label:'Size',value:state.thumb,type:'select',options:[['small','Small'],['medium','Medium'],['large','Large']]}],v=>commit(()=>{state.thumb=v.size;if(workspace==='board')workspace='collection'},'Thumbnail size updated'));break;
case 'sort-filter':showDialog('Sort and filter',[{name:'sort',label:'Sort order',type:'select',value:state.sort,options:[['newest','Newest first'],['oldest','Oldest first'],['title','Title A–Z']]},{name:'filter',label:'Content',type:'select',value:state.filter,options:[['all','All pins'],['notes','Notes'],['photos','Photos'],['favorites','Favorites']]}],v=>commit(()=>{state.sort=v.sort;state.filter=v.filter;workspace='collection'},'Sort and filter updated'));break;
case 'exit-fullscreen':exitBulletinFullscreen();break;case 'zoom-dialog':zoomDialog();break;case 'zoom-in':commit(()=>{state.zoom=clamp(state.zoom+10,35,250)},'Zoomed in');break;case 'zoom-out':commit(()=>{state.zoom=clamp(state.zoom-10,35,250)},'Zoomed out');break;case 'zoom-reset':commit(()=>state.zoom=100,'Zoom reset');break;case 'fit':fit();break;case 'fullscreen':toggleFullscreen();break;
case 'journal-new':journalNew();break;case 'journal-open':workspace='journal';if(!board().journal.length){journalNew()}else{currentJournal=journalPage().id;render()}break;case 'journal-scrap':journalScrap('scrap');break;case 'journal-photo':journalScrap('photo');break;case 'journal-handwriting':journalScrap('drawing');break;case 'journal-washi':journalScrap('washi');break;
case 'journal-paper':showDialog('Journal paper background',[{name:'paper',label:'Paper',type:'select',options:[['lined','Lined cream'],['kraft','Brown kraft'],['floral','Soft floral'],['vintage','Vintage parchment']]}],v=>withJournal(p=>p.paper=v.paper));break;
case 'journal-template':showDialog('Journal templates',[{name:'template',label:'Template',type:'select',options:[['free','Free writing'],['gratitude','Gratitude journal'],['memory','Memory keeper'],['scrapbook','Scrapbook layout'],['reading','Reading reflections']]}],v=>withJournal(p=>{const templates={free:'',gratitude:'Today I am grateful for…\n\nOne small thing that went well…\n\n',memory:'Date:\nLocation:\nA memory I want to keep…\n\n',scrapbook:'Today’s keepsakes:\n\n',reading:'Book / Article:\nFavorite passage:\nMy thoughts:\n\n'};p.body+=(p.body?'\n\n':'')+(templates[v.template]||'')}));break;
case 'journal-cover':showDialog('Journal cover',[{name:'cover',label:'Cover texture',type:'select',options:[['kraft','Brown kraft'],['gold','Golden'],['red','Crimson'],['white','White linen']]}],v=>withJournal(p=>p.cover=v.cover));break;
case 'reading-list':readingOpen('all');break;case 'reading-articles':readingOpen('article');break;case 'reading-books':readingOpen('book');break;case 'reading-notes':case 'reading-highlights':case 'reading-bookmarks':case 'reading-progress':inspectReading(a);break;case 'reading-quotes':addReading('quote');break;
case 'arrange-toggle':commit(()=>{state.arrange=!state.arrange},'Arrange mode '+(state.arrange?'on':'off'));break;case 'arrange-drag':arrangeHint('Drag a selected unlocked pin to move it');break;case 'arrange-resize':arrangeHint('Select a pin, then drag its red corner or edge handles');break;case 'arrange-rotate':selectedUpdate(x=>x.rotation=((x.rotation||0)+15)%360,'Rotated selected items');break;case 'arrange-layers':if(!selected.size)notice('Select a pin; use Forward / Backward controls');else renderInspector();break;case 'arrange-align':alignSelected();break;case 'arrange-group':groupSelected();break;case 'arrange-lock':selectedUpdate(x=>x.locked=!x.locked,'Lock state changed');break;case 'arrange-history':showDialog('Undo and redo',[{info:`Undo available: ${undoStack.length} · Redo available: ${redoStack.length}`},{name:'choice',label:'Choose',type:'select',options:[['undo','Undo last change'],['redo','Redo last undone change']]}],v=>v.choice==='undo'?undo():redo(),'Apply');break;
case 'craft-sticker':window.BulletinCraftStudio?.open('stickers');break;case 'craft-cutout':window.BulletinCraftStudio?.open('stickers');break;
case 'craft-glitter':window.BulletinCraftStudio?.open('glitter');break;
case 'craft-stamp':window.BulletinCraftStudio?.open('stamps');break;
case 'craft-decor':window.BulletinCraftStudio?.open('decorations');break;
case 'craft-postit':promptItem('note','Decorate a Post-it');break;
case 'craft-pattern':showDialog('Stencils and patterns',[{name:'symbol',label:'Stencil pattern',type:'select',options:[['✶ ✶ ✶','Stars'],['♥ ♥ ♥','Hearts'],['✿ ✿ ✿','Flowers'],['◆ ◆ ◆','Diamonds']]},{name:'glitter',label:'Apply glitter fill',type:'checkbox',value:false}],v=>addItem('stencil',{title:'Pattern stencil',text:v.symbol,glitter:v.glitter},'Pattern added'));break;
case 'craft-embellish':showDialog('Scrapbook embellishments',[{name:'text',label:'Embellishment text',value:'A little treasure'},{name:'color',label:'Paper texture',type:'select',options:[['#f2dcc0','Kraft'],['#f4dce8','Blush'],['#e6e7c7','Olive']]}],v=>addItem('scrap',{title:'Embellishment',text:v.text,color:v.color},'Embellishment added'));break;
case 'craft-texture':showDialog('Textures and effects',[{name:'kind',label:'Texture',type:'select',options:[['washi','Washi tape'],['scrap','Rough paper'],['stencil','Glitter star']]},{name:'text',label:'Optional text',value:'★'}],v=>addItem(v.kind,{title:'Texture',text:v.text,glitter:v.kind==='stencil'},'Texture added'));break;
case 'craft-scrap':promptItem('scrap','Add scrapbook scrap');break;
case 'lib-all':libraryOpen('all');break;case 'lib-clips':libraryOpen('clips');break;case 'lib-favorites':libraryOpen('favorites');break;case 'lib-archive':libraryOpen('archive');break;case 'lib-recent':libraryOpen('recent');break;case 'lib-photos':libraryOpen('photos');break;case 'lib-stickers':libraryOpen('stickers');break;case 'lib-scraps':libraryOpen('scraps');break;case 'lib-documents':libraryOpen('documents');break;
case 'board-settings':showDialog('Board settings',[{name:'name',label:'Board name',value:board().name},{name:'private',label:'Keep board private',type:'checkbox',value:board().private}],v=>commit(()=>{board().name=v.name||board().name;board().private=v.private},'Board settings saved'));break;case 'background-settings':setBackground();break;case 'grid-settings':gridSettings();break;case 'import-backup':importBackup();break;case 'export-backup':exportBackup();break;case 'restore-board':workspace='restore';render();break;
default:notice('Unknown action: '+a)
}}
function pointerOnItem(e){if(e.button!==0&&e.pointerType==='mouse')return;const target=e.target.closest('.pin-item');if(!target)return;const x=item(target.dataset.itemId);if(!x)return;const dir=e.target.closest('.resize-handle')?.dataset.dir||null;const multi=e.shiftKey||e.ctrlKey;if(multi){if(selected.has(x.id))selected.delete(x.id);else selected.add(x.id)}else if(!selected.has(x.id)){selected=new Set([x.id])}renderInspector();$$('.pin-item').forEach(el=>{el.classList.toggle('selected',selected.has(el.dataset.itemId));el.classList.toggle('arrange-mode',state.arrange)});
if(!state.arrange||x.locked||multi){render();return}const parent=$('#board-surface').getBoundingClientRect();const start={x:e.clientX,y:e.clientY},original={x:x.x,y:x.y,w:x.w,h:x.h};const affected=(!dir&&x.group)?currentItems().filter(y=>y.group===x.group):[x];pointerItem={id:x.id,dir,target,pid:e.pointerId,start,original,affected:affected.map(y=>({ref:y,x:y.x,y:y.y})),parent,moved:false};target.setPointerCapture(e.pointerId);target.classList.add('dragging');e.preventDefault()}
function pointerMoving(e){const p=pointerItem;if(!p||e.pointerId!==p.pid)return;const dx=(e.clientX-p.start.x)/p.parent.width*100,dy=(e.clientY-p.start.y)/p.parent.height*BOARD_Y_CAP;const snap=n=>state.snap?Math.round(n/5)*5:n;const x=item(p.id);if(!x)return;const d=p.dir;const next={...p.original};if(d){if(d.includes('e'))next.w=clamp(p.original.w+dx,3,100-p.original.x);if(d.includes('s'))next.h=clamp(p.original.h+dy,3,BOARD_Y_CAP-p.original.y);if(d.includes('w')){next.x=clamp(p.original.x+dx,0,p.original.x+p.original.w-3);next.w=p.original.w+p.original.x-next.x}if(d.includes('n')){next.y=clamp(p.original.y+dy,0,p.original.y+p.original.h-3);next.h=p.original.h+p.original.y-next.y}x.x=snap(next.x);x.y=snap(next.y);x.w=snap(next.w);x.h=snap(next.h)}else{p.affected.forEach(a=>{a.ref.x=snap(clamp(a.x+dx,0,100-a.ref.w));a.ref.y=snap(clamp(a.y+dy,0,BOARD_Y_CAP-a.ref.h))})}p.moved=true;for(const a of p.affected){const el=$(`[data-item-id="${a.ref.id}"]`);if(el){el.style.left=a.ref.x+'%';el.style.top=boardYPercent(a.ref.y);el.style.width=a.ref.w+'%';el.style.height=boardYPercent(a.ref.h)}}}
function pointerDone(e){const p=pointerItem;if(!p||e.pointerId!==p.pid)return;pointerItem=null;if(p.moved){const before=structuredClone(state);p.affected.forEach(a=>{const prev=before.boards.find(b=>b.id===state.currentBoard)?.items.find(i=>i.id===a.ref.id);if(prev){prev.x=a.x;prev.y=a.y;prev.w=p.original.w;prev.h=p.original.h}});undoStack.push(JSON.stringify(before));if(undoStack.length>45)undoStack.shift();redoStack=[];queueSave();notice(p.dir?'Pin resized':'Pin moved')}render()}
function connectMenuDrag(){const bar=$('#menu-drag'),p=$('#menu-popout');bar.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;const r=p.getBoundingClientRect(),stage=$('#board-stage').getBoundingClientRect();dragMenu={pointer:e.pointerId,startX:e.clientX,startY:e.clientY,left:r.left-stage.left,top:r.top-stage.top};bar.setPointerCapture(e.pointerId);e.preventDefault()});bar.addEventListener('pointermove',e=>{if(!dragMenu||dragMenu.pointer!==e.pointerId)return;const st=$('#board-stage');p.style.left=clamp(dragMenu.left+e.clientX-dragMenu.startX,0,Math.max(0,st.clientWidth-p.offsetWidth))+'px';p.style.top=clamp(dragMenu.top+e.clientY-dragMenu.startY,0,Math.max(0,st.clientHeight-p.offsetHeight))+'px'});bar.addEventListener('pointerup',()=>dragMenu=null);bar.addEventListener('pointercancel',()=>dragMenu=null)}
function connectEvents(){$('#bulletin-root').addEventListener('click',e=>{const actionBtn=e.target.closest('[data-action]');if(actionBtn){action(actionBtn.dataset.action);return}const overlayBtn=e.target.closest('[data-overlay]');if(overlayBtn){overlayAction(overlayBtn);return}const ins=e.target.closest('[data-inspector]');if(ins){handleInspector(ins.dataset.inspector);return}});
$('#menu-close').addEventListener('click',()=>{menuVisible=false;$('#menu-popout').hidden=true;renderNavActive()});$('#dialog-close').addEventListener('click',closeDialog);$('#dialog-cancel').addEventListener('click',closeDialog);
$('#bulletin-form').addEventListener('submit',async e=>{e.preventDefault();if(!dialogAction){closeDialog();return}const cb=dialogAction;const data={};for(const el of $$('[name]',$('#dialog-body')))data[el.name]=el.type==='checkbox'?el.checked:el.value;$('#bulletin-dialog').close();dialogAction=null;try{await cb(data)}catch(error){console.error(error);notice('Could not complete that action')}});
$('#file-input').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;const kind=uploadAction;uploadAction=null;try{if(kind==='backup')await readBackup(f);else await processUpload(f,kind)}catch(err){console.error(err);notice('Could not open this file')}});
$('#board-items').addEventListener('pointerdown',pointerOnItem);$('#board-items').addEventListener('pointermove',pointerMoving);$('#board-items').addEventListener('pointerup',pointerDone);$('#board-items').addEventListener('pointercancel',pointerDone);$('#board-surface').addEventListener('click',e=>{if(!e.target.closest('.pin-item')&&selected.size){selected.clear();render()}});
$('#workspace-overlay').addEventListener('input',e=>{if(e.target.id==='journal-textarea'){const p=journalPage();if(p){p.body=e.target.value;queueSave()}}});
document.addEventListener('keydown',e=>{if(!$('#bulletin-root').contains(document.activeElement)&&!$('#bulletin-dialog').open)return;if($('#bulletin-dialog').open||/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||''))return;if((e.ctrlKey||e.metaKey)&&e.key==='z'){e.preventDefault();e.shiftKey?redo():undo()}else if((e.ctrlKey||e.metaKey)&&e.key==='y'){e.preventDefault();redo()}else if(e.key==='Delete'&&selected.size){e.preventDefault();handleInspector('delete')}else if(e.key==='Escape'&&selected.size){selected.clear();render()}});
connectMenuDrag();globalThis.addEventListener('resize',()=>{sizeBoard()});}
async function start(){await initStore();navBuild();connectEvents();render();setupViewportScrollbar();setupAdaptiveMenus();
 importSharedBulletinBoards();
 globalThis.addEventListener('ourspace:activity-updated',importSharedBulletinBoards);
 document.addEventListener('fullscreenchange',()=>{
  const isFull=document.fullscreenElement===$('#bulletin-root');
  $('#bulletin-fullscreen-exit').setAttribute('aria-hidden',String(!isFull));
  if(isFull)$('#bulletin-fullscreen-exit').focus({preventScroll:true});
  requestAnimationFrame(()=>{sizeBoard();render()});
 });
 globalThis.Bulletin={getState:()=>structuredClone(state),exportBackup,openMenu:toggleMenu,openBoard:goBoard,undo,redo};globalThis.BulletinCreativeAPI={getBoard:()=>board(),getSelectedId:()=>[...selected][0]||null,addArt:(name,src,opts={})=>{addItem('sticker',{title:name,data:src,shape:'none',arrangement:opts.arrangement||'craft-decoration',w:clamp((opts.width||220)/11.3,10,45),h:clamp((opts.height||245)/7.9,9,45),tags:'craft,sticker,decoration'},'Craft item added')},applyEffect:(id,effect)=>commit(()=>{const x=item(id);if(x){x.effects=Array.isArray(x.effects)?x.effects:[];x.effects.push(effect)}},'Decoration applied to Post-it'),undoEffect:(id)=>commit(()=>{const x=item(id);if(x?.effects?.length)x.effects.pop()},'Last decoration removed')};notice('Welcome to Bulletin — your creative space')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
