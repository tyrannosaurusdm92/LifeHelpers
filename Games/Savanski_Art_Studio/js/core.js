(function(){
'use strict';
const S=window.Savanski=window.Savanski||{};
S.VERSION='2026.08.08-v1';
S.$=(s,r=document)=>r.querySelector(s);S.$$=(s,r=document)=>[...r.querySelectorAll(s)];
S.clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
S.uid=(p='id')=>`${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;
S.sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
S.escapeHTML=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
S.safeName=(v,ext='')=>{let s=String(v||'Untitled').replace(/[\\/:*?"<>|\x00-\x1f]+/g,' ').replace(/\s+/g,' ').trim().slice(0,120)||'Untitled';return ext&& !s.toLowerCase().endsWith(ext.toLowerCase())?s+ext:s};
S.formatBytes=(n)=>{n=Number(n)||0;const u=['B','KB','MB','GB'];let i=0;while(n>=1024&&i<u.length-1){n/=1024;i++}return `${n.toFixed(i?1:0)} ${u[i]}`};
S.debounce=(fn,ms=250)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}};
S.downloadBlob=(blob,name)=>{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)};
S.dataURLToBlob=(data)=>{const [head,b64]=data.split(',');const mime=(head.match(/data:([^;]+)/)||[])[1]||'application/octet-stream';const bin=atob(b64||'');const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return new Blob([u],{type:mime})};
S.fileToDataURL=(file)=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)});
S.loadImage=(src)=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src});
S.canvasBlob=(c,type='image/png',quality=.94)=>new Promise(r=>c.toBlob(r,type,quality));
S.getClientKey=()=>{let k=localStorage.getItem('savanski.clientKey');if(!/^[A-Za-z0-9_-]{24,100}$/.test(k||'')){const a=new Uint8Array(24);crypto.getRandomValues(a);k=[...a].map(x=>x.toString(16).padStart(2,'0')).join('');localStorage.setItem('savanski.clientKey',k)}return k};
S.status=(msg)=>{const e=S.$('#statusText');if(e)e.textContent=msg||'Ready'};
S.toast=(msg,type='info')=>{S.status(msg);const old=S.$('.toast');if(old)old.remove();const d=document.createElement('div');d.className=`toast toast-${type}`;d.textContent=msg;Object.assign(d.style,{position:'fixed',zIndex:4000,left:'50%',bottom:'34px',transform:'translateX(-50%)',maxWidth:'min(90vw,700px)',padding:'8px 12px',border:'2px solid #001010',background:type==='error'?'#F18240':type==='success'?'#FFF600':'#F2FFFF',color:'#001010',boxShadow:'4px 4px 0 #001010',fontWeight:'700'});document.body.append(d);setTimeout(()=>d.remove(),2800)};
S.isMac=/Mac|iPhone|iPad/.test(navigator.platform||navigator.userAgent);
S.state={
  project:null,activeLayerId:null,tool:'pencil',zoom:1,history:[],redo:[],clipboard:null,selection:null,pointer:null,isDrawing:false,
  animation:{frame:0,frames:90,fps:30,keyframes:{},playing:false,stop:false},
  map:{enabled:false,gridType:'square',gridSize:70,gridOpacity:.38,units:5,unitName:'ft',exportGrid:true},
  settings:{autosave:true,checker:true,showRotate:true,theme:'light'},
  collageFiles:[],driveMode:'shared',three:null
};
S.makeProject=(w=1600,h=900,name='Untitled Project')=>({
  format:'savanski-art-studio',version:S.VERSION,id:S.uid('project'),name,width:w,height:h,transparent:true,background:'#F2FFFF',
  createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),layers:[],map:{...S.state.map},animation:{frames:90,fps:30,keyframes:{}},meta:{app:'Savanski Art Studio'}
});
S.setWorkspace=(name)=>{S.$$('.workspace-tab').forEach(b=>{const on=b.dataset.workspace===name;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on))});S.$$('.workspace-panel').forEach(p=>p.classList.toggle('active',p.dataset.panel===name));if(name==='three')S.three?.resize?.();};
S.setInspector=(name)=>{S.$$('.inspector-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.inspector===name));S.$$('.inspector-body').forEach(p=>p.classList.toggle('active',p.dataset.inspectorPanel===name));};
S.setTool=(tool)=>{S.state.tool=tool;S.$$('#toolGrid .tool').forEach(b=>b.classList.toggle('active',b.dataset.tool===tool));const c=S.$('#interactionCanvas');if(c)c.style.cursor=['text'].includes(tool)?'text':['eyedropper','magicErase'].includes(tool)?'cell':['fogReveal','eraser'].includes(tool)?'crosshair':'crosshair';S.status(`${tool.replace(/([A-Z])/g,' $1')} tool`)};
S.settingsLoad=()=>{try{Object.assign(S.state.settings,JSON.parse(localStorage.getItem('savanski.settings')||'{}'))}catch{};const v=S.state.settings.theme||'light';document.documentElement.dataset.theme=v==='system'?(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'):v;};
S.settingsSave=()=>{localStorage.setItem('savanski.settings',JSON.stringify(S.state.settings));S.settingsLoad()};
S.openFiles=(accept='image/*',multiple=false)=>new Promise(resolve=>{const i=document.createElement('input');i.type='file';i.accept=accept;i.multiple=multiple;i.onchange=()=>resolve([...i.files]);i.click()});
S.keyboardEditable=()=>/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName||'');
S.detectPortrait=()=>matchMedia('(orientation:portrait)').matches&&Math.min(innerWidth,innerHeight)<900;
S.updateRotateNotice=()=>{const e=S.$('#rotateNotice');if(!e)return;e.hidden=!(S.state.settings.showRotate&&S.detectPortrait()&&!sessionStorage.getItem('savanski.rotateDismissed'))};
window.addEventListener('orientationchange',()=>setTimeout(S.updateRotateNotice,250));window.addEventListener('resize',S.debounce(S.updateRotateNotice,180));
})();
