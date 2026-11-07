/* OurSpace canonical JSON adapter: data lives in the site's own /json folders.
 * Original canonical JSON files are never modified by this adapter.
 * Personal files deployed to public GitHub Pages are publicly accessible by URL.
 * These UI account checks are not a confidentiality/security boundary.
 * Onyx uses these same canonical local JSON paths without any duplicate copies.
 */
(()=>{'use strict';
const OWNER_KINDS=new Set(['tasks','shop','cats','self_care','life_events']);
const SHARED_KINDS=new Set(['tasks','shop','cats','self_care','life_events','currency','game_rules','manifest']);
const cache=new Map();
const dayNum={sunday:0,monday:1,tuesday:2,wednesday:3,thursday:4,friday:5,saturday:6};
function current(){
 const profile=String(document.documentElement.dataset.profile||'').toLowerCase();
 if(!['william','jasper'].includes(profile))throw new Error('Unknown OurSpace profile.');
 if(window.OurSpaceAuth?.authorize&&!window.OurSpaceAuth.authorize(profile))throw new Error('Sign in to your OurSpace page to use its catalog.');
 return {profile};
}
function denominations(d){
 if(!d||typeof d!=='object')throw new Error('Missing canonical denominations.');
 const result={};for(const name of ['platinum','gold','silver','copper']){
  const n=d[name];if(!Number.isInteger(n)||n<0||(name!=='platinum'&&n>9))throw new Error('Invalid '+name+' denomination.');result[name]=n;
 }return result;
}
function toCopper(d){const c=denominations(d);return c.platinum*1000+c.gold*100+c.silver*10+c.copper;}
function fromCopper(value){let n=Math.max(0,Math.floor(Number(value)||0)),platinum=Math.floor(n/1000);n%=1000;const gold=Math.floor(n/100);n%=100;const silver=Math.floor(n/10);return{platinum,gold,silver,copper:n%10};}
function sourceUrl(kind,scope='owner'){
 const {profile}=current();const where=scope==='shared'?'shared':profile;
 if(!(scope==='shared'?SHARED_KINDS:OWNER_KINDS).has(kind))throw new Error('Unsupported JSON document kind or scope.');
 return new URL('../../json/'+where+'/'+kind+'.json',document.baseURI);
}
async function read(kind,opts={}){
 const {profile}=current();const scope=opts.scope==='shared'?'shared':'owner';
 const key=profile+':'+scope+':'+kind;
 if(!opts.refresh&&cache.has(key))return cache.get(key);
 const url=sourceUrl(kind,scope);
 const promise=fetch(url.href,{method:'GET',cache:'no-store',credentials:'same-origin'}).then(async response=>{
  if(!response.ok)throw new Error('Cannot load '+scope+'/'+kind+'.json (HTTP '+response.status+').');
  const documentData=await response.json();
  if(!documentData||typeof documentData!=='object'||Array.isArray(documentData))throw new Error('Invalid '+kind+'.json format.');
  if(scope==='owner'&&documentData.profile&&String(documentData.profile).toLowerCase()!==profile)throw new Error('Profile JSON mismatch.');
  return documentData;
 }).catch(error=>{cache.delete(key);throw error;});
 cache.set(key,promise);return promise;
}
async function catalog(kind,opts={}){
 if(kind!=='tasks'&&kind!=='shop')throw new Error('Only tasks and shop are catalogs.');
 const {profile}=current();const docs=await Promise.all([read(kind),opts.includeShared===false?Promise.resolve(null):read(kind,{scope:'shared'})]);
 const field=kind==='tasks'?'tasks':'items',entries=[],used=new Set();
 docs.forEach((doc,index)=>{
  if(!doc)return;
  for(const item of Array.isArray(doc[field])?doc[field]:[]){
   if(!item||!item.id)continue;
   if(Array.isArray(item.availableTo)&&!item.availableTo.includes(profile))continue;
   if(item.profile&&item.profile!=='shared'&&item.profile!==profile)continue;
   const id=String(item.id);if(used.has(id))continue;
   used.add(id);entries.push({...item,canonicalScope:index?'shared':'owner'});
  }
 });
 return {profile,kind,version:docs[0].version,entries};
}
function toStoreItem(item){
 const d=denominations(item.priceDenominations);
 return {
  id:String(item.id),name:String(item.name||item.title||'Reward'),category:String(item.aisle||item.category||'Rewards'),
  source:'OurSpace canonical shop JSON',emoji:String(item.emoji||'🎁'),notes:String(item.notes||''),link:'',
  price:{...d,totalCopper:toCopper(d)},fulfillmentType:'partner-request',
  requiresManualFulfillment:item.requiresHouseholdFulfillment!==false,
  restrictedCheckout:!!(item.manualReview||item.adultOnly),repeatable:true,
  originalMetadata:{canonicalId:item.id,canonicalScope:item.canonicalScope||'owner',priceDenominations:d,
   tags:Array.isArray(item.tags)?item.tags:[],adultOnly:!!item.adultOnly,manualReview:!!item.manualReview}
 };
}
function toTask(item,profile){
 const reward=denominations(item.rewardDenominations),s=item.schedule||{};
 const frequency=String(s.type||'as_needed').toLowerCase();
 // Preserve special interval requirements in metadata and treat flexible/"as able"
 // schedules as on-demand instead of forcing an incorrect daily recurrence.
 const normalized=['daily','weekly','monthly','annually'].includes(frequency)&&!s.asNeeded?frequency:'on_demand';
 const type=/care|health|hydration|med|self.care|rest/i.test(String(item.category||''))?'care':'task';
 const days=Array.isArray(s.daysOfWeek)?s.daysOfWeek:[];
 return {
  id:String(item.id),title:String(item.title||item.name||'Task'),type,
  description:String(item.notes||item.description||''),frequency:normalized,
  rewardCopper:toCopper(reward),rewardDenominations:reward,assignee:profile,priority:'medium',
  tags:[String(item.category||'Task'),String(item.area||''),'canonical'].filter(Boolean),
  reminder:false,active:true,time:'',
  weekdays:days.map(day=>typeof day==='number'?day:dayNum[String(day).toLowerCase()]).filter(Number.isInteger),
  dayOfMonth:Number(s.dayOfMonth||1),month:Number(s.month||1),
  createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),
  canonicalSource:true,canonicalScope:item.canonicalScope||'owner',canonicalSchedule:s,
  partialCompletionAllowed:!!item.partialCompletionAllowed,
  requiresUserConfirmation:true,autoComplete:false
 };
}
// Local state only: each account keeps independent sessions and pet progress.
// Another Onyx widget may replace this storage via the API or its event hooks.
function storageKey(kind,slot){
 const {profile}=current();const normalized=String(slot||'default').replace(/[^a-z0-9_-]/gi,'_').slice(0,60);
 return 'ourspace:canonical:'+profile+':'+kind+':'+normalized;
}
function getSaved(kind,slot){
 try{const raw=localStorage.getItem(storageKey(kind,slot));return raw?JSON.parse(raw):null;}
 catch(error){console.warn('[OurSpace] Unable to read local '+kind+' state',error);return null;}
}
function putSaved(kind,slot,state){
 if(!state||typeof state!=='object'||Array.isArray(state))throw new Error('State must be an object.');
 const {profile}=current();const key=storageKey(kind,slot);
 localStorage.setItem(key,JSON.stringify(state));
 const type=kind==='session'?'ourspace:canonical:session-saved':'ourspace:canonical:pet-state-saved';
 window.dispatchEvent(new CustomEvent(type,{detail:{profile,slot:String(slot),state}}));
 return {ok:true,profile,slot:String(slot),storage:'local'};
}
async function getSession(slot='default'){return getSaved('session',slot);}
async function saveSession(slot,state){return putSaved('session',slot,state);}
async function getPetState(slot='default'){return getSaved('pet',slot);}
async function savePetState(slot,state){return putSaved('pet',slot,state);}
async function getVirtualPets(){return{profile:current().profile,owner:await read('cats'),shared:await read('cats',{scope:'shared'}),rules:await read('game_rules',{scope:'shared'})};}
async function onyxContext({includeSelfCare=false,includeLifeEvents=false}={}){
 const data={profile:current().profile,pets:await getVirtualPets(),session:await getSession('onyx')};
 if(includeSelfCare)data.selfCare=await read('self_care');
 if(includeLifeEvents)data.lifeEvents=await read('life_events');
 return data;
}
const api=Object.freeze({version:'2.0.0-canonical-2026-11-06',source:'local-json',read,catalog,sourceUrl,
 toCopper,fromCopper,denominations,toTask,toStoreItem,getVirtualPets,onyxContext,
 getSession,saveSession,getPetState,savePetState,
 invalidate(){cache.clear();}});
window.OurSpaceCanonical=api;
window.dispatchEvent(new CustomEvent('ourspace:canonical:ready',{detail:{version:api.version,source:'local-json',hooksAvailable:true}}));
})();
