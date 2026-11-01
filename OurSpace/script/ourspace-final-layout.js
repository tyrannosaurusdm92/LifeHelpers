/* #admin-only final module editing. Other module placements, including Communication, are read-only. */
(()=>{'use strict';
 const who=document.documentElement.dataset.profile==='jasper'?'jasper':'william';
 const page=document.documentElement.dataset.ourspaceCurrentPage;
 const auth=window.OurSpaceAuth;
 if(!auth?.authorize?.(who))return;
 const admin=who==='william'&&!!auth.isAdmin?.()&&new URLSearchParams(location.search).get('public')!=='1';
 const pages=['household','skills'];const moduleNames={household:'Household',skills:'Skills'};
 const schema='ourspace.final-modules-placement.v1',key='ourspace.final-modules.placement.v1.'+who;
 const defaults={household:{moduleId:'household',index:0,widthPx:null,heightPx:1080,offsetX:0,offsetY:12,flow:'normal'},skills:{moduleId:'skills',index:0,widthPx:null,heightPx:1500,offsetX:0,offsetY:12,flow:'normal'}};
 let state=null;try{state=JSON.parse(localStorage.getItem(key)||'null')}catch(_){state=null}
 if(state?.schema!==schema)state={schema,version:1,profile:who,pages:{}};
 for(const pg of pages){state.pages[pg]??={modules:{}};state.pages[pg].modules??={};state.pages[pg].modules[pg]={...defaults[pg],...state.pages[pg].modules[pg]};}
 const n=(v,d=0)=>v==null||v===''?d:Number.isFinite(Number(v))?Number(v):d;
 const clamp=(v,a,b)=>Math.max(a,Math.min(v,b));
 function persist(){try{localStorage.setItem(key,JSON.stringify(state));return true}catch(_){return false}}
 const controllers=new Map();
 function install(pg){
  const flow=document.getElementById('osFinalFlow-'+pg),frame=document.getElementById('osFinalFrame-'+pg),host=document.getElementById('osFinalFlow-'+pg)?.parentElement;
  if(!flow||!frame||!host)return;
  const m=state.pages[pg].modules[pg];let pointer=null;
  const area=()=>{const st=getComputedStyle(flow);const w=flow.clientWidth||Math.max(500,document.getElementById('ourspacePageArea')?.clientWidth||innerWidth-320);return Math.max(340,w-n(parseFloat(st.paddingLeft))-n(parseFloat(st.paddingRight))-8)};
  const apply=()=>{
   const avail=area(),x=clamp(n(m.offsetX),0,Math.max(0,avail-140)),w=clamp(n(m.widthPx,avail-x),Math.min(140,avail-x),avail-x),h=clamp(n(m.heightPx,defaults[pg].heightPx),360,18000),y=clamp(n(m.offsetY),0,1800);
   Object.assign(m,{moduleId:pg,index:0,widthPx:Math.round(w),heightPx:Math.round(h),offsetX:Math.round(x),offsetY:Math.round(y),flow:'normal'});
   frame.style.setProperty('--final-width',m.widthPx+'px');frame.style.setProperty('--final-height',m.heightPx+'px');frame.style.setProperty('--final-left',m.offsetX+'px');frame.style.setProperty('--final-top',m.offsetY+'px');
   const out=frame.querySelector('.os-final-admin-bar output');if(out)out.textContent=`${m.widthPx} × ${m.heightPx}px · X ${m.offsetX}px · Y ${m.offsetY}px`;
  };
  function down(e,dir,handle){if(e.button!==0)return;e.preventDefault();e.stopPropagation();pointer={id:e.pointerId,dir,handle,x:e.clientX,y:e.clientY,start:{...m}};try{handle.setPointerCapture(e.pointerId)}catch(_){}}
  function move(e){if(!pointer||e.pointerId!==pointer.id)return;e.preventDefault();const d=pointer.dir,dx=e.clientX-pointer.x,dy=e.clientY-pointer.y,old=pointer.start;
   let x=n(old.offsetX),y=n(old.offsetY),w=n(old.widthPx,area()-x),h=n(old.heightPx,defaults[pg].heightPx);
   if(d==='move'){x+=dx;y+=dy}else{
    if(d.includes('e'))w+=dx;if(d.includes('w')){w-=dx;x+=dx}
    if(d.includes('s'))h+=dy;if(d.includes('n')){h-=dy;y+=dy}
   }
   Object.assign(m,{offsetX:Math.round(x),offsetY:Math.round(y),widthPx:Math.round(w),heightPx:Math.round(h)});apply();
  }
  function up(e){if(!pointer||e.pointerId!==pointer.id)return;let el=pointer.handle;pointer=null;try{el.releasePointerCapture(e.pointerId)}catch(_){}persist()}
  function wire(el,dir){el.addEventListener('pointerdown',e=>down(e,dir,el));el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)}
  if(admin){frame.classList.add('os-final-admin');
   const bar=document.createElement('div');bar.className='os-final-admin-bar';const drag=document.createElement('button');drag.type='button';drag.textContent='✥ Drag '+moduleNames[pg]+' module';drag.setAttribute('aria-label','Move '+pg+' module in normal document flow');
   const out=document.createElement('output');out.setAttribute('aria-label','Module dimensions and position');bar.append(drag,out);frame.prepend(bar);wire(drag,'move');
   for(const edge of ['nw','n','ne','w','e','sw','s','se']){
    const handle=document.createElement('span');handle.className='os-final-handle';handle.dataset.edge=edge;handle.setAttribute('role','button');handle.tabIndex=0;handle.setAttribute('aria-label','Resize '+pg+' module from '+edge);frame.append(handle);wire(handle,edge);
    handle.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const delta=(e.shiftKey?25:10),dx=e.key==='ArrowLeft'?-delta:e.key==='ArrowRight'?delta:0,dy=e.key==='ArrowUp'?-delta:e.key==='ArrowDown'?delta:0;
      if(edge.includes('e'))m.widthPx+=dx;if(edge.includes('w')){m.widthPx-=dx;m.offsetX+=dx}if(edge.includes('s'))m.heightPx+=dy;if(edge.includes('n')){m.heightPx-=dy;m.offsetY+=dy}apply();persist()});
   }
  }
  apply();window.addEventListener('resize',apply);controllers.set(pg,{apply,state:m});
 }
 pages.forEach(install);
 function exportLayout(){for(const p of controllers.values())p.apply();state.generatedAt=new Date().toISOString();persist();const pages=JSON.parse(JSON.stringify(state.pages));const payload={schema,version:1,generatedAt:state.generatedAt,profile:who,pages,profiles:{[who]:{pages:JSON.parse(JSON.stringify(pages))}},notes:'Native Household and Skills page module dimensions and flow-based position, no iframe or Shadow DOM. Communication and Store editors retired.'};
  const blob=new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='final-modules.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
  const st=document.getElementById('osFinalStatus-'+page);if(st){st.hidden=false;st.textContent='Saved locally and exported final-modules.json.'}return payload;
 }
 if(admin&&pages.includes(page)){
  const b=document.createElement('button');b.id='osFinalExport';b.type='button';b.textContent='Save layout & export final-modules.json';b.addEventListener('click',exportLayout);document.body.append(b);
 }
 window.OurSpaceFinalLayout={isAdmin:admin,get:()=>JSON.parse(JSON.stringify(state)),refresh:()=>controllers.forEach(x=>x.apply()),save:admin?exportLayout:null};
})();
