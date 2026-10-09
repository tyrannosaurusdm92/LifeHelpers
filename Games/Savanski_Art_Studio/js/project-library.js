(function(){
'use strict';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const Lib={mode:'studio',active3DProjectId:null,pending3DImport:false,intent:'',
 init(){
   if(!$('#launcher')||!window.LFStorage)return;
   this.enhanceHome();this.patchStudio();this.bind();this.setMode('studio');this.refresh();
 },
 enhanceHome(){
   const left=$('#launcher .launcher-left');
   if(left&&!$('#launcherProjectName')){
     const first=left.querySelector('.launcher-section');
     const section=document.createElement('section');section.className='launcher-section sav-project-identity';
     section.innerHTML='<h2>Project</h2><label class="sav-home-field"><span>Name</span><input id="launcherProjectName" maxlength="120" value="Untitled Project" autocomplete="off"></label>';
     first?.after(section);
   }
   const ws=$('#launcherOpen3D')?.closest('.launcher-section');
   if(ws&&!$('#launcher3DOptions')){
     const sec=document.createElement('section');sec.className='launcher-section';sec.id='launcher3DOptions';sec.hidden=true;
     sec.innerHTML='<h2>3D Starting Geometry</h2><div class="launcher-choice-row sav-3d-starters"><button class="pill selected" data-3d-starter="empty" type="button">Empty Scene</button><button class="pill" data-3d-starter="sphere" type="button">Sculpt-Ready Ball</button><button class="pill" data-3d-starter="cat" type="button">Cat Blockout</button></div><p class="small muted">Start simple, then sculpt, paint, rig, keyframe, and export from the existing 3D tool windows.</p>';
     ws.after(sec);
   }
   const right=$('#launcher .launcher-right');
   if(right&&!$('#trashProjects')){
     const sec=document.createElement('section');sec.className='launcher-section sav-trash-section';
     sec.innerHTML='<div class="sav-home-section-head"><h2>Recently Deleted</h2><button class="mini" id="emptyTrashBtn" type="button">Empty Trash</button></div><div class="saved-list" id="trashProjects"></div><div class="empty-card compact" id="trashEmpty"><div><p class="muted">Deleted projects can be restored here.</p></div></div>';
     right.appendChild(sec);
   }
 },
 patchStudio(){
   const S=window.LFStudio;if(!S)return;
   S.refreshSaved=()=>this.refresh();
   const originalOpen=S.openWorkspace.bind(S);S.openWorkspace=()=>{this.mode='studio';this.active3DProjectId=null;originalOpen();};
   const originalHandle=S.handleImport.bind(S);S.handleImport=async file=>{if(!file)return;const fromHome=!!S.pendingImport;S.pendingImport=false;if(fromHome&&!(/json$/i.test(file.name)||file.name.endsWith('.lfstudio'))){const name=this.projectName(file.name.replace(/\.[^.]+$/,''));await S.engine.newProject({canvasSizeId:$('#canvasSizeSelect').value,projectType:S.projectType,canvasBase:S.canvasBase,dpi:300,name});S.openWorkspace();try{await S.engine.importImage(file);S.toast(`Imported ${file.name}`)}catch(e){S.toast('Import failed: '+e.message)}return;}await originalHandle(file);};
 },
 bind(){
   document.addEventListener('click',e=>{
     const t=e.target.closest?.('#launcherStudioTab,#launcher3DTab,#launcherOpen3D,#newProjectBtn,#newProjectBtn2,#importCard,[data-3d-starter]');if(!t)return;
     if(t.matches('[data-3d-starter]')){e.preventDefault();e.stopImmediatePropagation();$('#launcher3DOptions').querySelectorAll('[data-3d-starter]').forEach(b=>b.classList.toggle('selected',b===t));return;}
     if(t.id==='launcherStudioTab'){e.preventDefault();e.stopImmediatePropagation();this.setMode('studio');return;}
     if(t.id==='launcher3DTab'||t.id==='launcherOpen3D'){e.preventDefault();e.stopImmediatePropagation();this.setMode('3d');return;}
     if((t.id==='newProjectBtn'||t.id==='newProjectBtn2')&&this.mode==='3d'){e.preventDefault();e.stopImmediatePropagation();this.create3D();return;}
     if(t.id==='importCard'&&this.mode==='3d'){e.preventDefault();e.stopImmediatePropagation();this.pending3DImport=true;$('#modelInput')?.click();return;}
   },true);
   $('#emptyTrashBtn')?.addEventListener('click',async()=>{const trash=await LFStorage.listTrash();if(!trash.length)return;if(!confirm(`Permanently delete ${trash.length} project${trash.length===1?'':'s'}? This cannot be undone.`))return;await LFStorage.emptyTrash();this.refresh();});
   window.addEventListener('savanski:3d-import-complete',async()=>{if(!this.pending3DImport)return;this.pending3DImport=false;const A=window.Savanski3D;if(!A?.meshes?.().length)return;this.active3DProjectId=LFStorage.makeId('3d');A.$('#projectName').value=this.projectName(A.$('#projectName').value||'Imported 3D Project');await this.save3D({silent:true});this.enter3D();});
   window.addEventListener('savanski:home-request',()=>this.openHome(document.body.dataset.workspace==='3d'?'3d':'studio'));
 },
 projectName(fallback='Untitled Project'){const v=$('#launcherProjectName')?.value?.trim();return (v&&v!=='Untitled Project'?v:fallback).slice(0,120)||fallback;},
 setMode(mode){this.mode=mode==='3d'?'3d':'studio';$('#launcherStudioTab')?.classList.toggle('selected',this.mode==='studio');$('#launcher3DTab')?.classList.toggle('selected',this.mode==='3d');$('#launcherOpen3D')?.classList.toggle('selected',this.mode==='3d');const options=$('#launcher3DOptions');if(options)options.hidden=this.mode!=='3d';const canvas=$('#canvasSizeSelect')?.closest('.launcher-section');if(canvas)canvas.hidden=this.mode==='3d';const base=$('#canvasBaseSection');if(base)base.hidden=this.mode==='3d'||window.LFStudio?.projectType==='canvas-set';const imp=$('#importCard .text .muted');if(imp)imp.textContent=this.mode==='3d'?'Open a 3D model or Savanski .sas3d.json project.':'Open an image or a Savanski editable project.';const title=$('#launcherProjectName');if(title&&(!title.value||/^Untitled/.test(title.value)))title.value=this.mode==='3d'?'Untitled 3D Project':'Untitled Art Project';},
 openHome(mode=this.mode,{intent=''}={}){this.intent=intent;this.setMode(mode);const l=$('#launcher');if(l)l.hidden=false;if(intent==='import'&&mode==='3d'){this.pending3DImport=true;requestAnimationFrame(()=>$('#modelInput')?.click())}},
 async create3D(){const A=window.Savanski3D;if(!A?.clearRoot)return;A.clearRoot();A.resetPaintCanvas?.();const name=this.projectName('Untitled 3D Project');A.$('#projectName').value=name;this.active3DProjectId=LFStorage.makeId('3d');const starter=$('#launcher3DOptions [data-3d-starter].selected')?.dataset.threeDStarter||$('#launcher3DOptions [data-3d-starter].selected')?.getAttribute('data-3d-starter')||'empty';if(starter==='sphere'){if(A.createSculptSphere)A.createSculptSphere();else A.addPrimitive?.('sphere')}else if(starter==='cat'){if(A.createCatBlockout)A.createCatBlockout();else A.addPrimitive?.('sphere')}await this.save3D({silent:true});this.enter3D();},
 enter3D(){window.SavanskiToolbarMenus?.switchWorkspace?.('3d');const l=$('#launcher');if(l)l.hidden=true;requestAnimationFrame(()=>window.Savanski3D?.frameAll?.());},
 async save3D({silent=false}={}){const A=window.Savanski3D;if(!A?.projectData)return null;if(!this.active3DProjectId){A.toast?.('Open or create the 3D project from Home before saving.','error');this.openHome('3d');return null;}const name=A.$('#projectName')?.value?.trim()||'Untitled 3D Project';const record={id:this.active3DProjectId,name,projectType:'uniform-3d',createdAt:Date.now(),updatedAt:Date.now(),project3d:A.projectData()};const old=await LFStorage.get(this.active3DProjectId).catch(()=>null);if(old?.createdAt)record.createdAt=old.createdAt;const saved=await LFStorage.put(record);A.$('#localStatus').textContent='Saved locally';if(window.SavanskiBackend?.canSync?.()){try{await window.SavanskiBackend.saveProject(saved);A.$('#localStatus').textContent='Saved + synced'}catch(e){console.warn('Backend backup skipped',e);A.$('#localStatus').textContent='Saved locally'}}if(!silent)A.toast?.('3D project saved','success');this.refresh();return saved;},
 async openProject(p){const full=await LFStorage.get(p.id,{includeDeleted:false});if(!full)return;if(full.projectType==='uniform-3d'){const A=window.Savanski3D;if(!A?.importProjectData)return;A.importProjectData(full.project3d||full);this.active3DProjectId=full.id;this.mode='3d';this.enter3D();return;}this.active3DProjectId=null;this.mode='studio';await window.LFStudio.engine.deserialize(full);window.LFStudio.openWorkspace();},
 async rename(p){const name=prompt('Rename project',p.name||'Untitled Project');if(name===null||!name.trim())return;const n=await LFStorage.rename(p.id,name);if(this.active3DProjectId===p.id&&window.Savanski3D)window.Savanski3D.$('#projectName').value=n.name;if(window.LFStudio?.engine?.project?.id===p.id)window.LFStudio.engine.project.name=n.name;this.refresh();},
 async duplicate(p){const suggested=`${p.name||'Untitled'} Copy`;const name=prompt('Name the duplicate',suggested);if(name===null)return;await LFStorage.duplicate(p.id,name||suggested);this.refresh();},
 async trash(p){if(!confirm(`Delete “${p.name||'Untitled Project'}”? You can recover it from Recently Deleted.`))return;await LFStorage.remove(p.id);this.refresh();},
 async restore(p){await LFStorage.restore(p.id);this.refresh();},
 async purge(p){if(!confirm(`Permanently delete “${p.name||'Untitled Project'}”? This cannot be undone.`))return;await LFStorage.purge(p.id);this.refresh();},
 projectRow(p,trash=false){const row=document.createElement('div');row.className='saved-row sav-project-row';row.tabIndex=0;const label=document.createElement('button');label.type='button';label.className='sav-project-open grow';const kind=p.projectType==='uniform-3d'?'3D':'Art';const detail=p.projectType==='uniform-3d'?(p.project3d?.scene?'Editable 3D scene':'3D project'):(p.canvasSizeName||p.canvasSizeId||'Canvas');label.innerHTML=`<strong>${esc(p.name||'Untitled')}</strong><small>${kind} · ${esc(detail)} · ${new Date(p.updatedAt||p.createdAt).toLocaleString()}</small>`;if(!trash)label.onclick=()=>this.openProject(p);const actions=document.createElement('span');actions.className='sav-project-actions';if(trash){actions.append(this.actionButton('↶','Restore',()=>this.restore(p)),this.actionButton('×','Delete permanently',()=>this.purge(p)));}else{actions.append(this.actionButton('✎','Rename',()=>this.rename(p)),this.actionButton('⧉','Duplicate',()=>this.duplicate(p)),this.actionButton('⌫','Delete',()=>this.trash(p)));}row.append(label,actions);return row;},
 actionButton(text,title,fn){const b=document.createElement('button');b.type='button';b.className='mini';b.textContent=text;b.title=title;b.onclick=e=>{e.stopPropagation();fn()};return b;},
 async refresh(){try{const [list,trash]=await Promise.all([LFStorage.list(),LFStorage.listTrash()]);const wrap=$('#savedProjects');if(wrap){wrap.innerHTML='';list.forEach(p=>wrap.appendChild(this.projectRow(p,false)))}if($('#projectEmpty'))$('#projectEmpty').hidden=list.length>0;if($('#savedEmpty'))$('#savedEmpty').hidden=list.length>0;const tw=$('#trashProjects');if(tw){tw.innerHTML='';trash.forEach(p=>tw.appendChild(this.projectRow(p,true)))}if($('#trashEmpty'))$('#trashEmpty').hidden=trash.length>0;if($('#emptyTrashBtn'))$('#emptyTrashBtn').disabled=!trash.length;}catch(e){console.warn('Project library refresh failed',e)}}
};
window.SavanskiProjectLibrary=Lib;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>Lib.init(),0));else setTimeout(()=>Lib.init(),0);
})();
