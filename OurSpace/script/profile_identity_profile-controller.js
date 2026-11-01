(()=>{'use strict';
const root=document.querySelector('[data-os-design-scope="profile_identity"]');if(!root)return;
const kind=root.dataset.moduleKind;
const requestedProfile=(new URLSearchParams(location.search).get('profile')||document.documentElement.dataset.profile||document.body.dataset.profile||'william').toLowerCase();
const profileScope=requestedProfile==='jasper'?'jasper':'william';
const key='myspace_module_'+profileScope+'_'+kind;
const $=s=>root.querySelector(s), $$=s=>[...root.querySelectorAll(s)];
let entries=[];try{entries=JSON.parse(localStorage.getItem(key)||(profileScope==='william'?localStorage.getItem('myspace_module_'+kind):null)||'[]');if(!Array.isArray(entries))entries=[]}catch(_){entries=[]}
function save(){try{localStorage.setItem(key,JSON.stringify(entries))}catch(_){status('Browser storage is unavailable or full; export your data instead.')}}
function status(v){let n=$('[data-status]');if(n)n.textContent=v}
function clear(n){while(n.firstChild)n.firstChild.remove()}
function node(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=String(text);if(cls)e.className=cls;return e}
function validLink(v){try{let u=new URL(v,location.href);return ['https:','http:','mailto:'].includes(u.protocol)?u.href:''}catch(_){return ''}}
function itemView(x,i){const card=node('article',undefined,'ms-item');
Object.entries(x).forEach(([name,value])=>{if(name==='id'||!value)return;
const line=node('div');const key=node('strong',name.replace(/([A-Z])/g,' $1')+': ');line.append(key);
if(typeof value==='string' && value.startsWith('data:image/')){const im=document.createElement('img');im.src=value;im.alt=name;im.loading='lazy';line.append(im)}
else if(['url','imageUrl','thumbnailUrl','pageUrl'].includes(name)&&validLink(String(value))){const a=node('a',value);a.href=validLink(value);a.target='_blank';a.rel='noopener noreferrer';line.append(a)}
else line.append(node('span',value));card.append(line)});
const del=node('button','Delete');del.type='button';del.dataset.delete=String(i);del.setAttribute('aria-label','Delete entry');card.append(del);return card}
function render(){const list=$('[data-module-items]');if(list){clear(list);entries.forEach((x,i)=>list.append(itemView(x,i)));const blank=$('.empty-state[data-empty]');if(blank)blank.hidden=entries.length>0}
if(kind==='pictures'){const img=$('[data-carousel-image]');const caption=$('[data-carousel-caption]');const counter=$('[data-carousel-counter]');let idx=+(root.dataset.current||0);if(entries.length){idx=((idx%entries.length)+entries.length)%entries.length;root.dataset.current=idx;if(img){img.hidden=false;img.src=entries[idx].image||entries[idx].imageUrl||'';img.alt=entries[idx].caption||'Gallery photo'}if(caption)caption.textContent=entries[idx].caption||'';if(counter)counter.textContent=(idx+1)+' / '+entries.length}else{if(img)img.hidden=true;if(caption)caption.textContent='No pictures yet';if(counter)counter.textContent='0 / 0'}}
if(kind==='music'){const list=$('[data-track-list]');if(list){clear(list);entries.forEach((x,i)=>{let b=node('button',x.title||x.name||'Track '+(i+1));b.type='button';b.dataset.track=i;list.append(b)})}}}
for(const form of $$('form'))form.addEventListener('submit',async e=>{e.preventDefault();const fd=new FormData(form),obj={};for(const [name,value] of fd){if(value instanceof File){if(value.size){if(value.size>2400000){status('Files above 2.4 MB are too large for local storage; use a URL instead.');return}obj[name]=await new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>resolve('');r.readAsDataURL(value)})}}else obj[name]=String(value).trim()}
if(kind==='music'&&obj.file&&!obj.audio)obj.audio=obj.file;
if(kind==='pictures'){obj.image=obj.image||obj.file||obj.imageUrl||obj.url||'';if(!obj.image){status('Choose an image or supply an image URL.');return}}
if(kind==='donate'||kind==='about'||kind==='identity'){entries=[obj]}else entries.unshift(obj);
save();render();form.reset();status('Saved in this browser.');});
root.addEventListener('click',e=>{const btn=e.target.closest('[data-delete],[data-carousel-step],[data-track]');if(!btn)return;if(btn.hasAttribute('data-delete')){const i=+btn.dataset.delete;if(Number.isInteger(i)){entries.splice(i,1);save();render()}}if(btn.hasAttribute('data-carousel-step')){root.dataset.current=+(root.dataset.current||0)+(+btn.dataset.carouselStep);render()}if(btn.hasAttribute('data-track')){const track=entries[+btn.dataset.track],player=$('audio');if(track&&player){player.src=track.audio||track.file||track.url||'';player.play().catch(()=>status('Press play to authorize audio on this device.'))}}});
const exp=$('[data-export]');if(exp)exp.addEventListener('click',()=>{const blob=new Blob([JSON.stringify({module:kind,entries},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=kind+'_export.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2500)});
const imp=$('[data-import]');if(imp)imp.addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{const d=JSON.parse(await f.text());const arr=Array.isArray(d)?d:d.entries;if(!Array.isArray(arr))throw Error();entries=arr.filter(x=>x&&typeof x==='object').slice(0,1000);save();render();status('Imported '+entries.length+' entries.')}catch(_){status('Could not read that module JSON file.')}});
window.OurSpaceModuleControllers=window.OurSpaceModuleControllers||{};
window.OurSpaceModuleControllers[root.dataset.osDesignScope]={getEntries:()=>JSON.parse(JSON.stringify(entries)),importLegacy:raw=>{if(entries.length||!Array.isArray(raw)||!raw.length)return false;entries=raw.filter(x=>x&&typeof x==='object').slice(0,250);save();render();return true},refresh:render};
render();})();
