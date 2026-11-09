import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {inflateRawSync} from 'node:zlib';
import {createHash} from 'node:crypto';

const root=fileURLToPath(new URL('../../json/onyx widget/voice-corpus-100k/',import.meta.url));
const expected={work:14700,professor:14240,virtual:5760,leisure:15300};
const archiveHash='85cadc5728dcdcd609aeac8292960af5b79138a0141ed54224d63966efbb605f';
function archive(){
 const parts=Array.from({length:8},(_,i)=>readFileSync(join(root,'archive.part'+String(i).padStart(2,'0')+'.bin')));
 return Buffer.concat(parts);
}
function entries(archive){
 const end=archive.lastIndexOf(Buffer.from([0x50,0x4b,0x05,0x06]));
 assert(end>=0,'ZIP footer required');
 const count=archive.readUInt16LE(end+10),items=new Map();
 let pos=archive.readUInt32LE(end+16);
 for(let i=0;i<count;i++){
  assert.equal(archive.readUInt32LE(pos),0x02014b50);
  const method=archive.readUInt16LE(pos+10),packed=archive.readUInt32LE(pos+20);
  const nameLen=archive.readUInt16LE(pos+28),extra=archive.readUInt16LE(pos+30),comment=archive.readUInt16LE(pos+32);
  const local=archive.readUInt32LE(pos+42);
  const name=archive.subarray(pos+46,pos+46+nameLen).toString('utf8');
  assert.equal(archive.readUInt32LE(local),0x04034b50);
  const offset=local+30+archive.readUInt16LE(local+26)+archive.readUInt16LE(local+28);
  const buf=archive.subarray(offset,offset+packed);
  items.set(name,method===8?inflateRawSync(buf):method===0?buf:null);
  pos+=46+nameLen+extra+comment;
 }
 return items;
}
test('all eight hosted compressed archive parts match the transferred, validated original',()=>{
 const bytes=archive();
 assert.equal(bytes.length,2640718);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),archiveHash);
});
test('every response is addressable in its intended profile/mode without cross-account IDs',()=>{
 const items=entries(archive()),all=new Set(),counts={jasper:{},william:{}};
 for(const profile of ['jasper','william'])for(const [mode,n] of Object.entries(expected)){
  const path='OurSpace/json/onyx widget/voice-corpus-100k/'+profile+'/'+mode+'/onyx_'+mode+'.txt';
  const raw=items.get(path);
  assert(raw,'missing '+path);
  const text=raw.toString('utf8');
  const ids=[...text.matchAll(/^\[([JW]-[A-Za-z0-9-]+)\s+\|/gm)].map(x=>x[1]);
  assert.equal(ids.length,n,path);
  for(const id of ids){assert.equal(id[0],profile==='jasper'?'J':'W');assert(!all.has(id),'duplicate '+id);all.add(id)}
  counts[profile][mode]=ids.length;
 }
 assert.equal(all.size,100000);
 assert(![...items.keys()].some(p=>/MASTER_REFERENCE_NOT_PROFILE_MEMORY/i.test(p)),'private master must not be published');
 console.log('Validated 100,000 response IDs:',JSON.stringify(counts));
});
