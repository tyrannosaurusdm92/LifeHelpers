/* Onyx 100,000-example library. Original examples remain reference data, never fixed answers.
 * Supports local ZIP import without publishing family histories in this public repository.
 * Optional static chat files can be served from json/onyx widget/voice-corpus-100k/.
 * Verified active account determines retrieval scope; tester must be verified separately.
 */
(function(root){
'use strict';
const COUNTS=Object.freeze({work:14700,professor:14240,virtual:5760,leisure:15300});
const USERS=Object.freeze(['jasper','william']);
const LANES=Object.freeze(Object.keys(COUNTS));
const DATABASE='ourspace.onyx.response-corpus.v1',STORE='files';
const PREFIX='json/onyx widget/voice-corpus-100k/';
const cache=new Map();
let dbPromise=null;
const words=s=>(String(s||'').toLowerCase().match(/[a-z0-9]{3,}/g)||[]).filter(w=>!STOP.has(w));
const STOP=new Set('the and for from with this that have your what which where when their they about into just please would could should some there these also then than been were will said does able help need make more some only much want can how while whose'.split(' '));
const valid=(user,lane)=>USERS.includes(user)&&LANES.includes(lane);
const key=(user,lane)=>user+'/'+lane;
function database(){
 if(!('indexedDB' in root))return Promise.resolve(null);
 if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{
   const req=indexedDB.open(DATABASE,1);
   req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE)};
   req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
 }).catch(error=>{console.warn('Onyx corpus storage unavailable:',error);return null});
 return dbPromise;
}
async function write(key,value){
 const db=await database();if(!db)throw new Error('Local corpus storage is unavailable in this browser.');
 return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(value,key);tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error)});
}
async function read(key){
 const db=await database();if(!db)return null;
 return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const req=tx.objectStore(STORE).get(key);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)}).catch(()=>null);
}
function parse(text,user,lane){
 const expected=user==='jasper'?'J':'W', entries=[];
 // Original heading/cue lines are not roleplay facts. Only lines with stable source IDs count.
 for(const line of String(text||'').split(/\r?\n/)){
   const m=line.match(/^\[([JW]-[A-Za-z0-9-]+)\s+\|\s+([^\]]+)\]\s+(.+)$/);
   if(!m||m[1][0]!==expected)continue;
   const fields=m[2].split(/\s*\|\s*/);
   const id=m[1],body=m[3].trim(),category=fields[0]||lane,mood=fields[1]||'thoughtful';
   entries.push({id,category,mood,topic:(fields[2]||category).slice(0,160),text:body});
 }
 if(entries.length!==COUNTS[lane])throw new Error('Onyx corpus validation failed for '+key(user,lane)+': '+entries.length+'/'+COUNTS[lane]);
 const ids=new Set(entries.map(e=>e.id));
 if(ids.size!==entries.length)throw new Error('Duplicate source IDs found in '+key(user,lane));
 return entries;
}
async function staticText(user,lane){
 const url=new URL(PREFIX+user+'/'+lane+'/onyx_'+lane+'.txt',document.baseURI);
 const res=await fetch(url.href,{credentials:'same-origin',cache:'force-cache'});
 if(!res.ok)return null;
 return res.text();
}

let staticArchivePromise=null;
async function staticArchivedText(user,lane){
 const scope=key(user,lane);
 if(!staticArchivePromise)staticArchivePromise=(async()=>{
  const parts=await Promise.all(Array.from({length:8},async(_,i)=>{
   const relative=PREFIX+'archive.part'+String(i).padStart(2,'0')+'.bin';
   const url=new URL(relative,document.baseURI);
   const res=await fetch(url.href,{credentials:'same-origin',cache:'force-cache'});
   if(!res.ok)throw new Error('Missing Onyx archive segment '+i+': '+res.status);
   return new Uint8Array(await res.arrayBuffer());
  }));
  const size=parts.reduce((n,p)=>n+p.byteLength,0);
  if(size!==2640718)throw new Error('Incomplete 100k archive: '+size+' bytes');
  const full=new Uint8Array(size);let offset=0;
  for(const part of parts){full.set(part,offset);offset+=part.byteLength}
  return full.buffer;
 })().catch(error=>{staticArchivePromise=null;throw error});
 const buffer=await staticArchivePromise;
 const matching=await zipFiles({name:'Onyx_100k_OurSpace_Deploy_Package.zip',arrayBuffer:async()=>buffer},scope);
 return matching.get(scope)||null;
}

async function load(user,lane){
 if(!valid(user,lane))throw new Error('A verified profile and chat lane are required.');
 const scope=key(user,lane);
 if(cache.has(scope))return cache.get(scope);
 const promise=(async()=>{
   let saved=await read(scope);
   // Only accept a complete local corpus; otherwise try the static file.
   if(typeof saved!=='string'){try{saved=await staticText(user,lane)}catch(_){}}
   if(typeof saved!=='string'){try{saved=await staticArchivedText(user,lane)}catch(error){console.warn('Onyx compressed archive unavailable:',String(error?.message||error))}}
   if(typeof saved!=='string')return null;
   try{return parse(saved,user,lane)}catch(error){console.warn('Onyx corpus rejected:',error);return null}
 })();
 cache.set(scope,promise);
 const result=await promise;if(!result)cache.delete(scope);
 return result;
}
function score(query,record){
 let hits=0;const topic=record.topic.toLowerCase(),category=record.category.toLowerCase();
 const body=record.text.toLowerCase().slice(0,700);
 for(const word of query){if(topic.includes(word))hits+=5;else if(category.includes(word))hits+=3;else if(body.includes(word))hits+=1}
 return hits;
}
async function retrieve({profile,lane,input,limit=2}={}){
 if(!valid(profile,lane))return [];
 const records=await load(profile,lane);if(!records||!input)return [];
 const query=[...new Set(words(input))].slice(0,35);
 if(!query.length)return [];
 const top=[];for(const record of records){
   const s=score(query,record);
   if(s<2)continue;
   if(top.length<8||s>top[top.length-1].score){
     top.push({entry:record,score:s});top.sort((a,b)=>b.score-a.score||a.entry.id.localeCompare(b.entry.id));if(top.length>8)top.pop()
   }
 }
 const output=[],topics=new Set();for(const hit of top){
   if(topics.has(hit.entry.topic)&&output.length<Math.max(1,limit-1))continue;
   output.push(hit);topics.add(hit.entry.topic);if(output.length>=Math.max(1,Math.min(4,limit)))break;
 }
 return output;
}
function bytes(data,offset=0,n=data.byteLength-offset){return new Uint8Array(data,offset,n)}
function u16(view,pos){return view.getUint16(pos,true)}
function u32(view,pos){return view.getUint32(pos,true)}
async function zipFiles(file,onlyScope=''){
 if(!file||!String(file.name).toLowerCase().endsWith('.zip'))throw new Error('Select the original Onyx_100000_By_User_Chat.zip archive.');
 const buffer=await file.arrayBuffer(),view=new DataView(buffer),decoder=new TextDecoder('utf-8'),size=buffer.byteLength;
 let end=-1;for(let at=size-22;at>=Math.max(0,size-65557);at--){if(u32(view,at)===0x06054b50){end=at;break}}
 if(end<0)throw new Error('ZIP central directory missing.');
 const count=u16(view,end+10),start=u32(view,end+16),results=new Map();let pos=start;
 for(let i=0;i<count;i++){
  if(u32(view,pos)!==0x02014b50)throw new Error('Unexpected ZIP entry structure.');
  const method=u16(view,pos+10),packed=u32(view,pos+20),nameLen=u16(view,pos+28),extra=u16(view,pos+30),comment=u16(view,pos+32),local=u32(view,pos+42);
  const name=decoder.decode(bytes(buffer,pos+46,nameLen)).replace(/\\/g,'/');
  const match=name.match(/(?:^|\/)(jasper|william)\/(work|professor|virtual|leisure)\/onyx_\2\.txt$/);
  if(match && (!onlyScope || key(match[1],match[2])===onlyScope)){
    const user=match[1],lane=match[2],scope=key(user,lane);
    if(results.has(scope))throw new Error('Duplicate ZIP chat entry: '+scope);
    if(u32(view,local)!==0x04034b50)throw new Error('Bad ZIP local file header.');
    const offset=local+30+u16(view,local+26)+u16(view,local+28);
    const packedBlob=new Blob([bytes(buffer,offset,packed)]);
    let raw;
    if(method===0)raw=await packedBlob.text();
    else if(method===8 && typeof DecompressionStream==='function'){
       raw=await new Response(packedBlob.stream().pipeThrough(new DecompressionStream('deflate-raw'))).text();
    }else throw new Error('This browser cannot decompress ZIP method '+method+'. Use a current Chrome/Edge/Firefox browser.');
    parse(raw,user,lane);results.set(scope,raw);
  }
  pos+=46+nameLen+extra+comment;
 }
 if(!onlyScope&&results.size!==8)throw new Error('The ZIP must contain all eight original chat files; found '+results.size+'.');
 if(onlyScope&&results.size!==1)throw new Error('The selected account/mode corpus entry is absent: '+onlyScope);
 return results;
}
async function importZip(file){
 const data=await zipFiles(file);
 for(const [scope,contents] of data){await write(scope,contents);cache.delete(scope)}
 await write('manifest',{count:100000,chatFiles:8,installedAt:new Date().toISOString(),counts:COUNTS});
 return {count:100000,files:8,stored:true,profiles:USERS.slice(),counts:{...COUNTS}};
}
async function status(){
 const manifest=await read('manifest');
 return {installed:manifest?.count===100000,count:manifest?.count||0,expected:100000,files:manifest?.chatFiles||0};
}
root.OnyxCorpus100k=Object.freeze({load,retrieve,importZip,status,expected:100000,counts:COUNTS,profiles:USERS,lanes:LANES});
const fileInput=document.getElementById('onyxCorpusImport');
const statusElement=document.getElementById('onyxCorpusImportStatus');
if(fileInput){
 fileInput.addEventListener('change',async event=>{
  const file=event.target.files?.[0];
  if(!file)return;
  fileInput.disabled=true;
  if(statusElement)statusElement.textContent='Validating all eight chat libraries…';
  try{
   const summary=await importZip(file);
   if(statusElement)statusElement.textContent='Imported '+summary.count.toLocaleString()+' original responses across '+summary.files+' account/mode files. Available for this browser; not uploaded.';
   root.dispatchEvent(new CustomEvent('onyx:corpus-100k-ready',{detail:summary}));
  }catch(error){if(statusElement)statusElement.textContent='Import rejected: '+String(error?.message||error);}
  finally{fileInput.disabled=false;fileInput.value='';}
 });
 status().then(result=>{if(result.installed&&statusElement)statusElement.textContent='100,000 response examples are installed locally and available for profile-scoped retrieval.'}).catch(()=>{});
}

})(window);
