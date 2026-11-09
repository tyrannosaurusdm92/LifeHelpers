/** Regression tests for all 100,000 provided voice examples and lane routing. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {join,dirname} from 'node:path';
import {CORPUS_COUNTS,CORPUS_TOTAL,loadVoiceShard,retrieveVoiceExamples,auditVoiceCorpus} from './voice-corpus-100k.js';

const assets=join(dirname(fileURLToPath(import.meta.url)),'../../../json/onyx widget/voice-corpus-100k');
let fetches=[];
const localFetch=async url=>{
  const path=new URL(url).pathname.match(/voice-corpus-100k\/(william|jasper)\/(work|leisure|virtual|professor)\.json\.gz$/);
  assert.ok(path,'Only a matching profile/lane asset is requested');
  fetches.push(`${path[1]}/${path[2]}`);
  const bytes=await readFile(join(assets,path[1],path[2]+'.json.gz'));
  const arrayBuffer=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
  return {ok:true,arrayBuffer:async()=>arrayBuffer};
};

test('all eight immutable archives hold exactly 100,000 unique response IDs and texts',async()=>{
  const allIds=new Set();let total=0;
  for(const profile of ['william','jasper']){
    for(const lane of ['work','leisure','virtual','professor']){
      const gz=await readFile(join(assets,profile,lane+'.json.gz'));
      const payload=JSON.parse(gunzipSync(gz).toString('utf-8'));
      assert.equal(payload.schema,'onyx.voice-corpus.v2');
      assert.equal(payload.profile,profile);assert.equal(payload.lane,lane);
      assert.equal(payload.count,CORPUS_COUNTS[profile][lane]);
      for(const [header,cue,reply] of payload.entries){
        const id=header.split(' | ')[0];
        assert.ok(id.startsWith(profile==='william'?'W-':'J-'));
        assert.ok(!allIds.has(id),'Duplicate '+id);
        assert.ok(reply.length>0);
        assert.equal(typeof cue,'string');
        allIds.add(id);total++;
      }
    }
  }
  assert.equal(total,100000);assert.equal(allIds.size,100000);assert.equal(CORPUS_TOTAL,100000);
});

test('voice references are dynamically loaded by exact account and lane',async()=>{
  fetches=[];
  for(const profile of ['william','jasper']){
    for(const [lane,prompt] of [
      ['work','The button looks fine but clicking does nothing'],
      ['leisure','Could we discuss a meal together?'],
      ['virtual','I feel persistent sadness and need compassionate support'],
      ['professor','Please explain DBT wise mind']]){
      const result=await retrieveVoiceExamples({profile,lane,message:prompt,fetchImpl:localFetch});
      assert.ok(result.length>0,`No matches for ${profile}/${lane}`);
      assert.ok(result.length<=3);
      assert.ok(result.every(x=>x.id.startsWith(profile==='william'?'W-':'J-')));
      assert.ok(result.every(x=>x.styleOnly && x.cue && x.mood));
      assert.ok(result.every(x=>!x.styleOnly.includes('TEST-MARKER-MEMORY')));
    }
  }
  assert.equal(new Set(fetches).size,8,'Each shard loads once, without cross-profile fallback');
});

test('a plain greeting does not force a mismatched technical voice answer',async()=>{
  const replies=await retrieveVoiceExamples({profile:'william',lane:'leisure',message:'Hey buddy how are you doing?',fetchImpl:localFetch});
  assert.ok(replies.length<=1,'Greeting references must remain sparing');
  assert.ok(!replies.some(x=>/button click routing|research evaluation|wise mind/i.test(x.cue)));
});

test('the complete corpus audit checks every example, including Virtual and Professor',async()=>{
  const r=await auditVoiceCorpus({fetchImpl:localFetch});
  assert.equal(r.total,100000);assert.equal(r.uniqueIds,100000);
  assert.equal(r.lanes.length,8);assert.equal(r.profileCounts.william,50000);assert.equal(r.profileCounts.jasper,50000);
});

test('profile and lane mismatches are rejected before any corpus fetch',async()=>{
  await assert.rejects(()=>loadVoiceShard('shared','work',{fetchImpl:localFetch}),/verified account/i);
  await assert.rejects(()=>loadVoiceShard('william','professor-and-work',{fetchImpl:localFetch}),/verified account/i);
});