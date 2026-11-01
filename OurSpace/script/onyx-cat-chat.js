/* Onyx's Adventures — three cat conversations, one existing Virtual & Health history.
 * Reuses LIVE WASM companions and their already-rendered sprite bounds.
 * No clone animals, backend replacement, new HTML, or extra hidden store.
 */
(function(){
'use strict';
const CAT_IDS=['onyx','callie','harvey'];
const NAMES={onyx:'Onyx',callie:'Callie',harvey:'Harvey'};
const BUBBLE_MAX=210;
const scene=document.querySelector('#slowPetGame .adventure-scene');
const form=document.getElementById('chatForm'),input=document.getElementById('chatInput');
const title=document.getElementById('chatTitle'),legacyLog=document.getElementById('chatLog');
const bubbleLayer=scene?.querySelector('.cat-voice-layer')||null;
if(!scene||!form||!input||!legacyLog){console.warn('Three-cat chat: Adventures chat/scene missing');return;}
const state={selected:'onyx',lines:{onyx:[],callie:[],harvey:[]},seen:new Set(),pending:false,profile:'',bubbles:{},layer:null,logs:{},buttons:{}};
const CLIP=8000;
const prefixRx=/^(?:To\s+(Onyx|Callie|Harvey)|(?:(Onyx|Callie|Harvey)))\s*:\s*/i;
const professorRx=/\b(?:professor onyx|(?:hello|hey|hi) professor|(?:enter|start|activate|switch to) professor(?: mode)?|dbt\s+(?:skill|skills|worksheet|worksheets|handout|handouts|practice|coaching)|(?:help me with|teach me|practice|learn|use) dbt|(?:distress tolerance|emotion regulation|interpersonal effectiveness)\s+(?:skill|worksheet|handout|practice)|mindfulness worksheet|(?:teach|show|give|walk me through|help me with)\s+(?:me\s+)?(?:a\s+|some\s+)?coping skill|(?:help me (?:make|write|build)|make me) (?:a |my )?safety plan|(?:i need|i'd like|i would like|can we have|please start|start) (?:a |my |our )?therapy session)\b/i;
const crisisRx=/\b(?:suicid\w*|kill myself|hurt myself|end my life|overdos\w*|cannot keep myself safe|can't stay safe|immediate danger|medical emergency)\b/i;
function game(){return window.WanderingWorld?.app||null;}
function active(){return document.documentElement.dataset.runtimeMode==='slow-game'&&!document.getElementById('slowPetGame')?.hidden;}
function currentProfile(){const host=window.OnyxVirtualPet?.getState?.();return String(host?.backendProfile||window.OurSpaceBackend?.profile?.()||document.documentElement.dataset.ourspaceProfile||'guest').toLowerCase();}
function note(role,catId,text,meta={}){
  const id=CAT_IDS.includes(catId)?catId:'onyx';
  const clean=String(text||'').slice(0,CLIP).trim();if(!clean)return;
  const arr=state.lines[id];arr.push({role,text:clean,...meta});if(arr.length>100)arr.splice(0,arr.length-100);
  const container=state.logs[id];if(!container)return;
  const node=document.createElement('div');node.className='cat-chat-line '+(role==='user'?'user':role==='system'?'system':'assistant');
  const label=document.createElement('strong');label.textContent=role==='user'?'You':role==='system'?'Notice':NAMES[id];
  const body=document.createElement('span');body.textContent=clean;node.append(label,body);container.append(node);
  while(container.childElementCount>100)container.firstElementChild.remove();
  container.scrollTop=container.scrollHeight;
}
function choose(id){if(!CAT_IDS.includes(id))return;state.selected=id;
  for(const cat of CAT_IDS){const on=cat===id;state.buttons[cat].setAttribute('aria-selected',String(on));state.buttons[cat].tabIndex=on?0:-1;state.logs[cat].hidden=!on;}
  if(title)title.textContent='Virtual & Health · '+NAMES[id];
  input.placeholder='Talk to '+NAMES[id]+'…';input.setAttribute('aria-label','Message '+NAMES[id]);
}
function addBubble(id,text){
 const cat=game()?.cats?.get?.(id);if(!cat||!state.layer)return;
 const message=String(text||'').replace(/\s+/g,' ').trim();if(!message)return;
 const existing=state.bubbles[id]||{};let el=existing.element;
 if(!el){el=document.createElement('div');el.className='cat-voice-anchor';el.dataset.cat=id;el.setAttribute('aria-hidden','true');
  const child=document.createElement('div');child.className='cat-voice-message';el.append(child);state.layer.append(el);}
 const visible=message.length>BUBBLE_MAX?message.slice(0,BUBBLE_MAX-1).trimEnd()+'…':message;
 el.firstElementChild.textContent=visible;
 el.dataset.length=visible.length<15?'tiny':visible.length<62?'short':visible.length<120?'medium':'long';
 const duration=Math.min(15,Math.max(4,3.2+visible.length/17));
 state.bubbles[id]={element:el,until:performance.now()+duration*1000};
 renderBubbles();
}
function renderBubbles(){
 if(!state.layer)return;
 const app=game(),camera=app?.camera,canvas=app?.canvas;
 if(!active()||!app?._loaded||!app?.cats?.ready||!canvas||!camera){for(const entry of Object.values(state.bubbles))entry.element.hidden=true;return;}
 const sr=scene.getBoundingClientRect(),cr=canvas.getBoundingClientRect();
 if(cr.width<=1||cr.height<=1)return;
 for(const [id,bubble] of Object.entries(state.bubbles)){
  const el=bubble.element,cat=app.cats.get(id);
  if(!cat||performance.now()>bubble.until){el.hidden=true;continue;}
  const bounds=app.cats.bounds(cat,camera),dir=cat.facing()<0?-1:1;
  // The origin is INSIDE the actual current sprite rectangle, at the visible
  // head/muzzle height. Only the bubble/text is DOM; the cat stays WASM+PNG.
  const mouthX=bounds.centerX+dir*bounds.w*.22;
  const mouthY=bounds.y+bounds.h*.45;
  const x=(cr.left-sr.left)+mouthX/camera.width*cr.width;
  const y=(cr.top-sr.top)+mouthY/camera.height*cr.height;
  if(x<0||x>sr.width||y<0||y>sr.height){el.hidden=true;continue;}
  el.hidden=false;el.style.left=x.toFixed(1)+'px';el.style.top=y.toFixed(1)+'px';
  el.dataset.side=x>sr.width*.55?'left':'right';
  el.dataset.placement=y<105?'below':'above';
  el.style.setProperty('--voice-max',Math.min(238,Math.max(58,sr.width*.45))+'px');
 }
}
function setup(){
 if(!state.layer){state.layer=document.createElement('div');state.layer.className='cat-voice-layer';state.layer.setAttribute('aria-hidden','true');scene.append(state.layer);}
 const runtime=document.getElementById('chatRuntimeLabel');
 if(runtime)runtime.textContent='Onyx: synchronized with Virtual & Health · Callie & Harvey: local personality dialogue';
 const header=document.createElement('div');header.className='cat-chat-channels';header.setAttribute('role','tablist');header.setAttribute('aria-label','Talk to each cat');
 const intro=document.querySelector('#hud-chat .chat-intro');
 if(intro)intro.before(header);
 const hint=document.createElement('p');hint.className='cat-chat-sync-note';hint.textContent='Onyx uses the same Virtual & Health conversation as the floating widget. Callie and Harvey have their own game channels; their messages also appear in Virtual & Health with their names. Sleeping cats may not answer. Professor requests always take priority.';
 header.after(hint);
 const logs=document.createElement('div');logs.className='cat-channel-logs';legacyLog.before(logs);legacyLog.dataset.threeCatHidden='true';legacyLog.setAttribute('aria-hidden','true');
 for(const id of CAT_IDS){
  const button=document.createElement('button');button.className='cat-channel-button';button.type='button';button.dataset.cat=id;button.id='cat-channel-tab-'+id;button.textContent=NAMES[id];button.setAttribute('role','tab');button.setAttribute('aria-controls','cat-channel-log-'+id);
  button.addEventListener('click',()=>choose(id));
  button.addEventListener('keydown',e=>{const i=CAT_IDS.indexOf(id);if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const next=CAT_IDS[(i+(e.key==='ArrowRight'?1:2))%3];choose(next);state.buttons[next].focus();}});
  header.append(button);state.buttons[id]=button;
  const log=document.createElement('div');log.className='cat-channel-log';log.id='cat-channel-log-'+id;log.setAttribute('role','tabpanel');log.setAttribute('aria-label',NAMES[id]+' conversation');log.setAttribute('aria-live','polite');log.hidden=id!=='onyx';logs.append(log);state.logs[id]=log;
 }
 choose('onyx');
 const clear=document.getElementById('clearChat');
 clear?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();const id=state.selected;if(!confirm('Clear '+NAMES[id]+' game chat display? The shared Virtual & Health history is unchanged.'))return;state.lines[id]=[];state.logs[id].replaceChildren();},{capture:true});
 const exportBtn=document.getElementById('exportChat');
 exportBtn?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();const id=state.selected;const data={channel:id,conversation:state.lines[id]};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='onyx-adventures-'+id+'-chat.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);},{capture:true});
 state.profile=currentProfile();
 importWidgetHistory();
}
function importWidgetHistory(){
 const history=window.OnyxVirtualPet?.getLaneHistory?.('health');if(!Array.isArray(history))return;
 for(const row of history.slice(-55))mirror({tab:'health',role:row.role==='user'?'user':'assistant',content:row.content,messageId:row.id,restore:true},{suppressBubble:true});
}
function mirror(detail,{suppressBubble=false}={}){
 if(!detail||detail.tab!=='health'||!detail.content||detail.role==='system')return;
 const id=detail.messageId;
 if(id&&state.seen.has(id))return;
 if(id){state.seen.add(id);if(state.seen.size>400)state.seen.clear();}
 let content=String(detail.content||'').trim(),catId='onyx';
 const prefix=content.match(prefixRx);
 if(prefix){catId=(prefix[1]||prefix[2]).toLowerCase();content=content.slice(prefix[0].length).trim();}
 if(!content)return;
 note(detail.role==='user'?'user':'assistant',catId,content);
 if(detail.role==='assistant'&&!detail.restore&&!suppressBubble&&active())addBubble(catId,content);
}
function asleep(id){const cat=game()?.cats?.get?.(id);if(!cat)return false;
 return cat.rest?.phase==='sleep'||cat.pose==='sleep'||cat.stateName==='sleep';
}
function replies(id,msg){
 const s=msg.toLowerCase();
 const onyx={
  food:['Food is a matter of imperial importance. Where is the gravy?','This meal requires closer inspection. And possibly more gravy.'],
  blanket:['The blanket arrangement was under review. Adjust it carefully.','A suitable blanket is essential to government operations.'],
  work:['The emperor will inspect the meadow after his very important nap.','Imperial inspections proceed at my own pace.'],
  love:['You are one of my people. Now stay close.','A very solemn slow blink. I approve.'],
  hello:['Ahem. The emperor acknowledges your presence.','Ah. You have arrived. I was supervising.'],
  default:['Hrrrm. I heard you. My opinion is still being formulated.','I shall consider that after my nap.','*A long, judgmental blink.* Very well.']};
 const callie={
  food:['The catering department has been notified.','I heard that. My bowl remains suspiciously empty.'],
  comfort:['I have selected this seat. The matter is settled.','I am toasting my beans. Please respect the schedule.'],
  work:['HR has reviewed your request. I will get to it when I choose.','This location passes comfort inspection. For now.'],
  harvey:['Harvey has interrupted another perfectly respectable nap.','My sister may run the office. I run the approval committee.'],
  hello:['*Long owl-eyed stare.* Your request is being considered.','Hello. I am quite comfortable where I am.'],
  default:['I have reviewed this carefully. *Stares.*','The HR director is considering her options.','Hmm. This seat is still mine.']};
 const harvey={
  water:['SINK JUICE! Is that a faucet?','Water? Running water? I need to investigate!'],
  play:['YES! Wait. Is that a leaf? I must see it!','A game! I can go fast! Oh! Something shiny!'],
  food:['Is that a banana? I need to sniff it!','I heard food. I was somewhere else, but now I am HERE.'],
  work:['Message delivered! Wait—was I supposed to carry something back?','Secretary reporting for duty! And possibly a detour!'],
  callie:['Callie! Callie! Chase me! ...She is doing that stare.','My sister was grooming. I had a VERY important idea.'],
  hello:['HI HI! I came running!','Hello! Look at my little sock feet!'],
  default:['Ooh! Tell me more! Wait, what is that over there?','I heard you! I was just running somewhere important!','*Motorboat purr.* I found you!']};
 const pool=id==='callie'?callie:id==='harvey'?harvey:onyx;
 let key='default';
 if(/\b(food|hungry|dinner|treat|eat|gravy|turkey|ham|banana|bowl)\b/.test(s))key='food';
 else if(/\b(water|drink|faucet|sink|juice|river|pond)\b/.test(s))key=id==='harvey'?'water':'comfort';
 else if(/\b(play|game|run|zoom|chase|jump)\b/.test(s))key=id==='harvey'?'play':id==='callie'?'harvey':'work';
 else if(/\b(work|job|career|inspection|office|manager|secretary)\b/.test(s))key='work';
 else if(/\b(hello|hi|hey|good morning|good evening)\b/.test(s))key='hello';
 else if(/\b(love|cuddle|snuggle|sweet|good cat|thank)\b/.test(s))key=id==='onyx'?'love':'comfort';
 else if(/\b(blanket|pillow|nap|sleep|bed|cozy|chair|warm)\b/.test(s))key='comfort';
 else if(/\b(harvey|sister)\b/.test(s))key=id==='callie'?'harvey':'default';
 const arr=pool[key]||pool.default;
 const count=state.lines[id].filter(x=>x.role==='assistant').length;
 return arr[count%arr.length];
}
async function sendFromGame(raw){
 const msg=String(raw||'').trim();if(!msg)return false;
 if(msg.length>CLIP){note('system',state.selected,'Please send a shorter message.');return true;}
 const target=state.selected,widget=window.OnyxVirtualPet;
 // Existing Professor Onyx emergency/support trigger takes precedence over
 // sleep, persona banter, busy state or choice of recipient.
 const deniedProfessor=/\b(?:don't|do not|not|never)\b.{0,40}\b(?:professor|dbt|worksheet)\b/i.test(msg);
 if(window.OnyxProfessor?.isStartIntent?.(msg)||(!deniedProfessor&&professorRx.test(msg))){
  if(widget?.importGameMessage)widget.importGameMessage({role:'user',catId:target,text:msg});else note('user',target,msg);
  window.OnyxProfessor?.open?.({initialMessage:msg,source:'three-cat-game-chat'});
  note('system',target,'Professor Onyx has priority over sleeping and ordinary cat conversation.');
  return true;
 }
 if(crisisRx.test(msg)){
  if(target!=='onyx')widget?.importGameMessage?.({role:'user',catId:target,text:msg});
  if(widget?.chat)await widget.chat(msg,'health');
  else note('system',target,'Please seek urgent human support or emergency services if you are in immediate danger.');
  return true;
 }
 const sleeper=asleep(target);
 // An asleep cat may, but need not, answer. No sleep, timer, or WASM frame is
 // reset or forced. Triggered Professor interactions bypass this gate.
 if(sleeper&&Math.random()<(target==='callie'?.78:target==='onyx'?.7:.52)){
  if(widget?.importGameMessage)widget.importGameMessage({role:'user',catId:target,text:msg});else note('user',target,msg);
  note('system',target,NAMES[target]+' is asleep and chooses not to answer just now.');
  return true;
 }
 if(target==='onyx' && widget?.chat){
  if(widget?.getState?.()?.busyTabs?.includes?.('health')){note('system','onyx','Onyx is still answering. Let him finish that message first.');return true;}
  try{const reply=await widget.chat(msg,'health');
   if(reply?.error){const fallback=replies('onyx',msg);widget.importGameMessage?.({role:'assistant',catId:'onyx',text:fallback});}
  }catch(_){widget.importGameMessage?.({role:'user',catId:'onyx',text:msg});widget.importGameMessage?.({role:'assistant',catId:'onyx',text:replies('onyx',msg)});}
  return true;
 }
 // Callie and Harvey are locally scripted personalities; never misrepresent
 // their replies as server/AI responses or medical advice.
 if(widget?.importGameMessage)widget.importGameMessage({role:'user',catId:target,text:msg});else note('user',target,msg);
 const reply=replies(target,msg);
 if(widget?.importGameMessage)widget.importGameMessage({role:'assistant',catId:target,text:reply});else {note('assistant',target,reply);addBubble(target,reply);}
 return true;
}
window.addEventListener('onyx:chat-line',e=>mirror(e.detail));
window.addEventListener('ourspace:signed-out',()=>{state.seen.clear();for(const id of CAT_IDS){state.lines[id]=[];state.logs[id]?.replaceChildren();state.bubbles[id]?.element?.remove();delete state.bubbles[id];}});
window.addEventListener('ourspace:auth',()=>{const p=currentProfile();if(p!==state.profile){state.profile=p;state.seen.clear();for(const id of CAT_IDS){state.lines[id]=[];state.logs[id]?.replaceChildren();state.bubbles[id]?.element?.remove();delete state.bubbles[id];}importWidgetHistory();}});
setup();
window.OnyxCatChat=Object.freeze({sendFromGame,renderBubbles,select:choose,channel:()=>state.selected,lines:id=>(state.lines[id]||[]).map(x=>({...x})),show:(id,text)=>addBubble(id,text),isSleeping:asleep});
})();
