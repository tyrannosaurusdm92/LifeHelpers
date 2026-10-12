(()=>{'use strict';
// The existing MessengerPlugin instance is the only message state owner.
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const profile=()=>document.documentElement.dataset.profile==='jasper'?'jasper':'william';
const isSignedIn=()=>!$('#page-portal.is-active');
const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const allowedRooms=new Set(['ourspace-shared','household-chat','plans-chat','dm-jasper-william']);
const chat=window.ourspaceMessenger;
if(!chat)return;
const pinnedKey='ourspace.comms.pins.v1.'+profile();
const pinnedChatsKey='ourspace.comms.pinned-chats.v1.'+profile();
const sharedKey='ourspace.two-person.shared-messages.v1';
// Preserve the same conversation history when the master navigation switches accounts
// in this browser. Neither profile gets an extra account or invented remote transport.
function restoreShared(){const snapshots=[safeRead(sharedKey,{}),safeRead('ourspace.messenger.v3.william',{}).messages||{},safeRead('ourspace.messenger.v3.jasper',{}).messages||{}];let changed=false;
 for(const entries of snapshots)for(const [room,messages] of Object.entries(entries||{})){if(!allowedRooms.has(room)||!Array.isArray(messages))continue;const arr=chat.messages[room]||[];const known=new Set(arr.map(x=>x.id));for(const m of messages){if(m?.id&&['william','jasper'].includes(m.authorId)&&!known.has(m.id)){arr.push(m);known.add(m.id);changed=true}}arr.sort((a,b)=>(a.createdAt||'').localeCompare(b.createdAt||''));chat.messages[room]=arr;}if(changed){chat.persist();chat.renderAll()}}
function saveShared(){const out={};for(const room of allowedRooms)out[room]=(chat.messages[room]||[]).filter(x=>['william','jasper'].includes(x.authorId)).slice(-200);try{localStorage.setItem(sharedKey,JSON.stringify(out))}catch(_){/* Browser storage quota, app keeps its own session history. */}}

const dateKey=()=>{const d=new Date;return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const safeRead=(k,otherwise)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??otherwise}catch(_){return otherwise}};
let pinnedChats=safeRead(pinnedChatsKey,[]);if(!Array.isArray(pinnedChats))pinnedChats=[];
let pins=safeRead(pinnedKey,{});if(!pins||Array.isArray(pins)||typeof pins!=='object')pins={};
let chosen='ourspace-shared', quickOpen=false,quickTab='chats';
let pinChannel;try{pinChannel=new BroadcastChannel('ourspace-two-person-pins');pinChannel.onmessage=e=>{if(e.data?.profile===profile()&&e.data?.type==='pin'){pins=safeRead(pinnedKey,{});refreshAll()}}}catch(_){}
function togglePinnedChat(id){if(!allowedRooms.has(id))return;pinnedChats=pinnedChats.includes(id)?pinnedChats.filter(x=>x!==id):[...pinnedChats,id];try{localStorage.setItem(pinnedChatsKey,JSON.stringify(pinnedChats))}catch(_){}chat.renderFooter();refreshAll()}
const storePins=()=>{try{localStorage.setItem(pinnedKey,JSON.stringify(pins))}catch(_){};try{pinChannel?.postMessage({type:'pin',profile:profile()})}catch(_){};chat.renderFooter();refreshAll()};
const isPinned=(id,mid)=>Boolean((pins[id]||[]).includes(mid));
function togglePin(id,mid){if(!allowedRooms.has(id)||!mid)return;let list=Array.isArray(pins[id])?pins[id]:[];pins[id]=list.includes(mid)?list.filter(x=>x!==mid):[...list,mid].slice(-60);storePins();}
function pinnedMessages(){const items=[];for(const [room,ids] of Object.entries(pins)){if(!allowedRooms.has(room)||!Array.isArray(ids))continue;for(const id of ids){const m=(chat.messages[room]||[]).find(x=>x.id===id);if(m)items.push({room,m})}}return items.sort((a,b)=>(b.m.createdAt||'').localeCompare(a.m.createdAt||''));}
function todayItems(){const state=safeRead('ourspace_household_organizer_v1',{});const day=dateKey();const who=profile();const counts={tasks:[],events:[]};
 for(const t of Array.isArray(state.tasks)?state.tasks:[]){if(t.active===false||t.assignee&&!['shared',who].includes(t.assignee))continue;const f=t.frequency||'on_demand';let due=false;
 if(f==='daily')due=true;else if(f==='weekly'){const w=new Date(day+'T12:00:00').getDay();due=(t.weekdays||[]).includes(w)}else if(f==='monthly')due=Number((t.startDate||t.date||'').slice(-2))===Number(day.slice(-2));else if(f==='annually')due=(t.startDate||t.date||'').slice(5)===day.slice(5);else if(f==='none')due=t.date===day;
 if(due && !(state.completions||[]).some(c=>c.taskId===t.id&&c.date===day&&!c.undoneAt))counts.tasks.push(t);
 }
 for(const e of Array.isArray(state.events)?state.events:[]){if(e.assignee&&!['shared',who].includes(e.assignee))continue;let due=e.date===day||e.frequency==='daily'&&e.startDate<=day;if(!due&&e.frequency==='weekly'){const a=new Date((e.startDate||day)+'T12:00:00'),b=new Date(day+'T12:00:00');due=a<=b&&a.getDay()===b.getDay()}if(due)counts.events.push(e)}return counts;}
const unreadCount=()=>Object.values(chat.unread||{}).reduce((n,v)=>n+Number(v||0),0);
const buttonHTML=(label,action,cls='')=>`<button type="button" data-osquick="${action}" class="${cls}">${label}</button>`;
const quick=document.createElement('section');quick.id='osQuickDock';quick.setAttribute('aria-label','OurSpace quick chat, pinned messages and today');quick.innerHTML='<div class="os-quick-hd"><strong>⚡ OurSpace • Quick Chat</strong><button type="button" data-osquick="close" aria-label="Close quick chat">✕</button></div><div class="os-quick-body" id="osQuickBody"></div>';
document.body.append(quick);
const photo=document.createElement('div');photo.id='osPhotoDialog';photo.setAttribute('role','dialog');photo.setAttribute('aria-modal','true');photo.setAttribute('aria-label','Camera and video messages');
photo.innerHTML='<div class="os-photo-panel"><h2>Camera</h2><video id="osMediaPreview" autoplay muted playsinline></video><img id="osSelectedImage" alt="Selected photo" hidden style="max-width:100%;max-height:54dvh;object-fit:contain"/><div class="os-photo-controls"><label for="osFilter">Filter</label><select id="osFilter"><option value="none">Original</option><option value="sepia(1)">Golden</option><option value="saturate(2)">Vivid</option><option value="hue-rotate(120deg)">Electric</option><option value="contrast(1.4)">Contrast</option><option value="grayscale(1)">Black & White</option></select><label style="display:inline-flex;align-items:center;gap:5px">Upload photo<input type="file" id="osPhotoUpload" accept="image/*" style="width:min(170px,100%)"/></label><button type="button" data-osphoto="snap">📸 Photo</button><button type="button" data-osphoto="start">⏺ Record</button><button type="button" data-osphoto="stop" disabled>⏹ Stop & Send</button><button type="button" data-osphoto="close">Close</button></div><span class="os-photo-note" id="osMediaStatus">Camera and microphone access require permission and a secure browser context.</span></div>';
document.body.append(photo);
let stream=null,recorder=null,recorded=[],targetRoom='ourspace-shared',selectedImage=null;
function setStatus(t){$('#osMediaStatus').textContent=t}
function closePhoto(){try{if(recorder?.state==='recording')recorder.stop()}catch(_){};try{stream?.getTracks().forEach(t=>t.stop())}catch(_){};stream=null;selectedImage=null;$('#osSelectedImage').hidden=true;$('#osMediaPreview').hidden=false;$('#osMediaPreview').srcObject=null;photo.classList.remove('open');$('#osFilter').value='none';$('#osMediaPreview').style.filter='none'}
async function launchCamera(room){targetRoom=allowedRooms.has(room)?room:'ourspace-shared';photo.classList.add('open');setStatus('Requesting camera access…');try{if(!navigator.mediaDevices?.getUserMedia)throw new Error('Requires HTTPS or localhost');stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:true});$('#osMediaPreview').srcObject=stream;setStatus('Camera ready. Choose a filter, photo, or video.')}catch(e){setStatus('Camera unavailable: '+e.message)}}
function applyFilterToCanvas(ctx,filter){ctx.filter=filter==='none'?'none':filter}
async function fileFromBlob(blob,name){if(blob.size>4_500_000){setStatus('This clip is too large for browser-only message storage. Record a shorter clip.');return false}const f=new File([blob],name,{type:blob.type||'application/octet-stream'});await chat.handleFiles(targetRoom,[f]);setStatus('Sent to '+targetRoom);return true}
async function snapshot(){if(!stream&&!selectedImage)return;const v=selectedImage||$('#osMediaPreview');const ow=v.naturalWidth||v.videoWidth,oh=v.naturalHeight||v.videoHeight;if(!ow)return;const c=document.createElement('canvas');c.width=Math.min(ow,1280);c.height=Math.round(c.width*oh/ow);const ctx=c.getContext('2d');applyFilterToCanvas(ctx,$('#osFilter').value);ctx.drawImage(v,0,0,c.width,c.height);c.toBlob(async b=>{if(b)await fileFromBlob(b,'photo-'+Date.now()+'.jpg')},'image/jpeg',.8)}
function startRecording(){if(!stream||!window.MediaRecorder){setStatus('Video recording unavailable.');return}const typ=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(x=>MediaRecorder.isTypeSupported(x));if(!typ){setStatus('Video recording is not supported in this browser.');return}recorded=[];recorder=new MediaRecorder(stream,{mimeType:typ});recorder.ondataavailable=e=>{if(e.data?.size)recorded.push(e.data)};recorder.onstop=async()=>{if(!recorded.length)return;const blob=new Blob(recorded,{type:typ});await fileFromBlob(blob,'video-'+Date.now()+'.webm')};recorder.start();setStatus('Recording video…');photo.querySelector('[data-osphoto="start"]').disabled=true;photo.querySelector('[data-osphoto="stop"]').disabled=false}
function stopRecording(){if(recorder?.state==='recording')recorder.stop();photo.querySelector('[data-osphoto="start"]').disabled=false;photo.querySelector('[data-osphoto="stop"]').disabled=true;setStatus('Processing video…')}
photo.addEventListener('click',e=>{const x=e.target.closest('[data-osphoto]')?.dataset.osphoto;if(x==='close')closePhoto();if(x==='snap')snapshot();if(x==='start')startRecording();if(x==='stop')stopRecording()});$('#osFilter').addEventListener('change',e=>{$('#osMediaPreview').style.filter=e.target.value;$('#osSelectedImage').style.filter=e.target.value});$('#osPhotoUpload').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f||!f.type.startsWith('image/'))return;selectedImage=new Image();const url=URL.createObjectURL(f);selectedImage.onload=()=>{const img=$('#osSelectedImage');img.src=url;img.hidden=false;$('#osMediaPreview').hidden=true;setStatus('Choose a filter, then select Photo to send the edited image.')};selectedImage.src=url});
function dictation(){const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;const field=$('#oscom-text');if(!SpeechRecognition||!field){alert('Talk-to-text is not supported by this browser.');return}const r=new SpeechRecognition();r.lang=navigator.language||'en-US';r.interimResults=false;r.maxAlternatives=1;r.onresult=e=>{field.value+=(field.value?' ':'')+e.results[0][0].transcript;field.focus()};r.onerror=()=>{};r.start()}
function readRoom(){return allowedRooms.has(chosen)?chosen:'ourspace-shared'}
function renderQuick(){const body=$('#osQuickBody'),pinned=pinnedMessages(),today=todayItems(),unread=unreadCount();const me=profile()==='william'?'William':'Jasper';
 let parts=`<div class="os-quick-tabs">${['chats','pinned','today'].map((x)=>buttonHTML((x==='chats'?'Chats':x==='pinned'?`📌 Pinned (${pinned.length})`:`📅 Today (${today.tasks.length+today.events.length})`),x,quickTab===x?'is-current':'')).join('')}</div>`;
 if(quickTab==='chats'){
  parts+=`<label for="osQuickRoom">Conversation</label><select id="osQuickRoom">${[['ourspace-shared','Shared Lounge'],['dm-jasper-william',profile()==='william'?'Jasper':'William'],['household-chat','Household'],['plans-chat','Plans & Notes']].map(([id,label])=>`<option value="${id}" ${id===readRoom()?'selected':''}>${label}</option>`).join('')}</select>`;
  const m=(chat.messages[readRoom()]||[]).slice(-6);parts+=`<div class="os-quick-list">${m.length?m.map(x=>`<div class="os-quick-item"><span><b>${escapeHTML(x.authorLabel||'Member')}:</b> ${escapeHTML(x.text||'📎 Media message').slice(0,180)}</span></div>`).join(''):'<div class="os-quick-item">No messages yet.</div>'}</div><form class="os-quick-compose" id="osQuickForm"><input id="osQuickMessage" aria-label="Quick message" placeholder="Message ${escapeHTML(me==='William'?'Jasper':'William')}…" maxlength="10000" required/><button type="submit">Send ↗</button></form>`;
 }else if(quickTab==='pinned')parts+=`<div class="os-quick-list"><strong>📌 Pinned chats</strong>${pinnedChats.length?pinnedChats.map(id=>`<div class="os-quick-item"><button type="button" data-os-open-chat="${escapeHTML(id)}">${escapeHTML(chat.getConversation(id)?.label||id)} ↗</button><button type="button" data-os-unpin-chat="${escapeHTML(id)}">Unpin</button></div>`).join(''):'<div class="os-quick-item">No pinned chats.</div>'}<strong>📌 Messages</strong>${pinned.length?pinned.map(({room,m})=>`<div class="os-quick-item"><span>📌 <b>${escapeHTML(m.authorLabel||'Member')}</b> · ${escapeHTML(m.text||'Media').slice(0,160)}</span><button type="button" data-os-unpin="${escapeHTML(room)}" data-os-mid="${escapeHTML(m.id)}">Unpin</button></div>`).join(''):'<div class="os-quick-item">No pinned messages.</div>'}</div>`;
 else parts+=`<div class="os-quick-list"><strong>Tasks</strong>${today.tasks.length?today.tasks.map(x=>`<div class="os-quick-item"><span>☐ ${escapeHTML(x.time?x.time+' · ':'')}${escapeHTML(x.title)}</span></div>`).join(''):'<div class="os-quick-item">No outstanding tasks for today.</div>'}<strong>Appointments & events</strong>${today.events.length?today.events.map(x=>`<div class="os-quick-item"><span>📅 ${escapeHTML(x.time?x.time+' · ':'')}${escapeHTML(x.title)}</span></div>`).join(''):'<div class="os-quick-item">No appointments today.</div>'}</div>`;
 parts+=`<div class="os-quick-note">${unread} unread · Shared conversation history with Communication · Stored in this browser until a server is connected.</div>`;
 body.innerHTML=parts;
}
function renderFooterExtras(){const footer=$('[data-footer]',chat.root);if(!footer||!isSignedIn())return;const n=unreadCount(),today=todayItems(),p=pinnedMessages();const btn=document.createElement('button');btn.type='button';btn.className='mp-footer-button';btn.dataset.osQuickToggle='';btn.textContent='⚡ Quick Chat';footer.prepend(btn);const status=document.createElement('button');status.type='button';status.className='mp-footer-button';status.dataset.osQuickNotices='';status.textContent=`🔔 ${n} unread · 📌 ${p.length} messages · 📅 ${today.tasks.length+today.events.length} today`;footer.append(status);for(const id of pinnedChats){const room=chat.getConversation(id);if(!room)continue;const b=document.createElement('button');b.type='button';b.className='mp-dock-tab';b.dataset.osOpenChat=id;b.textContent='📌 '+room.label;footer.append(b)}}
const oldRenderFooter=chat.renderFooter.bind(chat);chat.renderFooter=function(){const out=oldRenderFooter();renderFooterExtras();return out};
function annotateMessages(){const thread=$('#oscom-thread');if(!thread)return;const list=chat.messages[readRoom()]||[],rows=$$('.oscom-bubble',thread);
 rows.forEach((row,i)=>{const m=list.slice(-400)[i];if(!m||!m.id)return;row.dataset.osmessageId=m.id;if(row.querySelector('.oscom-pin-btn')){const b=row.querySelector('.oscom-pin-btn');b.setAttribute('aria-pressed',String(isPinned(readRoom(),m.id)));b.textContent=isPinned(readRoom(),m.id)?'📌 Unpin':'📌 Pin';return}const meta=$('.oscom-msgmeta',row);if(meta){const b=document.createElement('button');b.className='oscom-pin-btn';b.type='button';b.dataset.osPin=m.id;b.setAttribute('aria-pressed',String(isPinned(readRoom(),m.id)));b.textContent=isPinned(readRoom(),m.id)?'📌 Unpin':'📌 Pin';meta.append(b)}const body=$('.oscom-msgbody',row);if(body&&/https?:\/\//.test(body.textContent)){const text=body.textContent;body.replaceChildren();const re=/(https?:\/\/[^\s]+)/g;let last=0,match;while((match=re.exec(text))){body.append(document.createTextNode(text.slice(last,match.index)));try{const u=new URL(match[1]);if(!['http:','https:'].includes(u.protocol))throw Error();const a=document.createElement('a');a.href=u.href;a.textContent=match[1];a.target='_blank';a.rel='noopener noreferrer';body.append(a)}catch(_){body.append(document.createTextNode(match[1]))}last=re.lastIndex}body.append(document.createTextNode(text.slice(last)))}
 });}
function extraControls(){const form=$('#oscom-compose-form');if(!form||$('#oscom-extra-actions'))return;const container=document.createElement('div');container.className='oscom-extra-actions';container.id='oscom-extra-actions';container.innerHTML='<button type="button" data-osextra="camera">📸 Camera & filters</button><button type="button" data-osextra="video">🎬 Video message</button><button type="button" data-osextra="gif">🎞 GIF</button><button type="button" data-osextra="dictate">🗣 Talk to text</button><button type="button" data-osextra="pinchat">📌 Pin chat</button><button type="button" data-osextra="pinned">📌 Pinned</button><button type="button" data-osextra="today">📅 Today</button>';form.append(container);const top=$('#oscom-chatinfo');if(top)top.textContent='William and Jasper only · Messages and media shared with the footer';}
function renderPinnedOverview(){const chatPanel=$('.oscom-chat'),form=$('#oscom-compose-form');if(!chatPanel||!form)return;let el=$('#oscomPinnedOverview');if(!el){el=document.createElement('div');el.id='oscomPinnedOverview';el.className='oscom-pinned-overview';chatPanel.insertBefore(el,form)}const arr=pinnedMessages().filter(x=>x.room===readRoom()).slice(-5);el.innerHTML=arr.length?`<b>📌 Pinned</b> ${arr.map(x=>`<button type="button" data-os-pin-go="${escapeHTML(x.m.id)}">${escapeHTML(x.m.text||'Media message').slice(0,64)}</button>`).join('')}`:'';el.style.display=arr.length?'flex':'none'}
let scheduled=false;function refreshAll(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;renderQuick();renderPinnedOverview();annotateMessages()})}
chat.addMessage=(function(base){return function(...args){const ret=base.apply(this,args);saveShared();refreshAll();return ret}})(chat.addMessage);
chat.renderAll=(function(base){return function(...args){const ret=base.apply(this,args);refreshAll();return ret}})(chat.renderAll);
/* Account-backed text transport. MessengerPlugin remains the sole message state owner.
   Attachments, locally recorded voice notes and browser WebRTC signaling are NOT sent
   as plain text or advertised as cross-device delivery. */
const backend=(()=>{try{return window.parent?.OurSpaceBackend||window.OurSpaceBackend}catch(_){return null}})();
const roomsForSync=['dm-jasper-william','ourspace-shared','household-chat','plans-chat'];
const validAccount=()=>!!backend?.token?.()&&backend.profile?.()===profile()&&!backend.isAdmin?.();
let checking=false;let transportConnected=false;
window.OurSpaceMessageTransport={get connected(){return transportConnected},rooms:roomsForSync};
const originalSendText=chat.sendText.bind(chat);
chat.sendText=async function(room,text){
 const trimmed=String(text||'').trim();if(!trimmed||!allowedRooms.has(room))return;
 if(!validAccount())return originalSendText(room,trimmed);
 // If the backend refuses delivery, do NOT mark it as sent on the other device.
 let response;try{response=await backend.request('message.send',{channelId:room,fromProfile:profile(),toProfile:profile()==='william'?'jasper':'william',kind:'text',text:trimmed})}catch(err){chat.toast?.('Message not sent: '+err.message);return false}
 if(!response?.messageId){chat.toast?.('Message not sent: server did not confirm a message ID.');return false}
 const m=chat.makeMessage(room,'message',trimmed,[]);m.id=response.messageId;m.delivery='server';
 chat.addMessage(m,true);await chat.bridge.send('message',m);
 transportConnected=true;window.dispatchEvent(new Event('ourspace:transport-status'));return true;
};
async function pullAllRooms(){
 if(checking||document.hidden||!validAccount())return;checking=true;
 try{for(const room of roomsForSync){
   const result=await backend.request('message.list',{channelId:room,limit:150});
   if(!Array.isArray(result?.messages))continue;
   for(const record of result.messages){
     const id=record.messageId||record.id||record.MessageId;if(!id)continue;
     const author=record.fromProfile||record.FromProfile;
     if(!['william','jasper'].includes(author))continue;
     if((chat.messages[room]||[]).some(x=>x.id===id))continue;
     const text=String(record.text||record.Text||'');
     // Do not duplicate earlier same-browser messages after first server sync.
     const similar=(chat.messages[room]||[]).find(x=>x.authorId===author&&x.text===text&&x.id!==id&&!x.delivery&&Math.abs(new Date(x.createdAt).getTime()-new Date(record.createdAt||record.CreatedAt).getTime())<90000);
     if(similar){similar.id=id;similar.delivery='server';chat.persist();continue}
     const payload={id,conversationId:room,authorId:author,authorLabel:author==='william'?'William':'Jasper',kind:'message',text,attachments:[],createdAt:record.createdAt||record.CreatedAt||new Date().toISOString(),delivery:'server'};
     chat.addMessage(payload,author===profile());
   }
  }
  transportConnected=true;window.dispatchEvent(new Event('ourspace:transport-status'));
 }catch(error){transportConnected=false;window.dispatchEvent(new Event('ourspace:transport-status'));console.info('Message sync unavailable:',error.message)}
 finally{checking=false}
}
window.addEventListener('focus',pullAllRooms);
window.addEventListener('ourspace:page-changed',pullAllRooms);
window.addEventListener('ourspace:auth',pullAllRooms);
setInterval(pullAllRooms,25000);
setTimeout(pullAllRooms,800);

restoreShared();chat.renderFooter();extraControls();refreshAll();
document.addEventListener('click',e=>{const b=e.target.closest('[data-osquick],[data-os-quick-toggle],[data-os-quick-notices],[data-osextra],[data-os-pin],[data-os-unpin],[data-os-pin-go],[data-os-open-chat],[data-oscom-id]');if(!b||quick.contains(b))return;
 if(b.dataset.osQuickToggle!==undefined||b.dataset.osQuickNotices!==undefined){quickOpen=!quickOpen;quick.classList.toggle('open',quickOpen);if(b.dataset.osQuickNotices!==undefined)quickTab='today';renderQuick();return}
 if(b.dataset.osquick==='close'){quickOpen=false;quick.classList.remove('open');return}
 if(['chats','pinned','today'].includes(b.dataset.osquick)){quickTab=b.dataset.osquick;renderQuick();return}
 if(b.dataset.osOpenChat){const id=b.dataset.osOpenChat;if(allowedRooms.has(id)){chosen=id;chat.openConversation(id);refreshAll()}return}
 if(b.dataset.osUnpin)togglePin(b.dataset.osUnpin,b.dataset.osMid);
 if(b.dataset.osPin)togglePin(readRoom(),b.dataset.osPin);
 if(b.dataset.oscomId){chosen=allowedRooms.has(b.dataset.oscomId)?b.dataset.oscomId:chosen;refreshAll()}
 if(b.dataset.osPinGo){const x=$$('.oscom-bubble').find(r=>r.dataset.osmessageId===b.dataset.osPinGo);x?.scrollIntoView({behavior:'smooth',block:'center'})}
 if(b.dataset.osextra){const a=b.dataset.osextra;if(a==='camera'||a==='video')launchCamera(readRoom());if(a==='gif'){const u=prompt('GIF image URL (https://)');if(u){try{const url=new URL(u);if(url.protocol==='https:'||url.protocol==='http:')chat.sendGif(readRoom(),url.href)}catch(_){}}}if(a==='dictate')dictation();if(a==='pinchat')togglePinnedChat(readRoom());if(a==='pinned'){quickTab='pinned';quick.classList.add('open');quickOpen=true;renderQuick()}if(a==='today'){quickTab='today';quick.classList.add('open');quickOpen=true;renderQuick()}}
});
quick.addEventListener('click',e=>{const b=e.target.closest('[data-osquick],[data-os-unpin],[data-os-open-chat],[data-os-unpin-chat]');if(!b)return; if(b.dataset.osOpenChat){const id=b.dataset.osOpenChat;if(allowedRooms.has(id)){chosen=id;chat.openConversation(id);refreshAll()}return}
 if(b.dataset.osUnpinChat)togglePinnedChat(b.dataset.osUnpinChat);else if(b.dataset.osOpenChat){chosen=b.dataset.osOpenChat;chat.openConversation(chosen);renderQuick()}else if(b.dataset.osUnpin)togglePin(b.dataset.osUnpin,b.dataset.osMid);else if(b.dataset.osquick==='close'){quickOpen=false;quick.classList.remove('open')}else if(['chats','pinned','today'].includes(b.dataset.osquick)){quickTab=b.dataset.osquick;renderQuick()}});
quick.addEventListener('change',e=>{if(e.target.id==='osQuickRoom'){chosen=allowedRooms.has(e.target.value)?e.target.value:'ourspace-shared';renderQuick()}});
quick.addEventListener('submit',async e=>{if(e.target.id!=='osQuickForm')return;e.preventDefault();const input=$('#osQuickMessage');const text=input?.value.trim();if(text){input.value='';try{const result=await chat.sendText(readRoom(),text);if(result===false)input.value=text}catch(_){input.value=text}refreshAll()}});
window.addEventListener('ourspace:page-active',()=>{chat.renderFooter();extraControls();refreshAll()});
window.addEventListener('ourspace:page-changed',()=>{chat.renderFooter();if(!isSignedIn()){quick.classList.remove('open');quickOpen=false;closePhoto()}else{extraControls();refreshAll()}});
window.addEventListener('ourspace-messenger-changed',refreshAll);
window.addEventListener('storage',e=>{if(e.key===pinnedKey){pins=safeRead(pinnedKey,{});refreshAll()}if(e.key===pinnedChatsKey){pinnedChats=safeRead(pinnedChatsKey,[]);chat.renderFooter();refreshAll()}if(e.key==='ourspace_household_organizer_v1')refreshAll();if(e.key===sharedKey){restoreShared();refreshAll()}});
window.addEventListener('keydown',e=>{if(e.key==='Escape'){closePhoto();quickOpen=false;quick.classList.remove('open')}});
// The feed module listens to this exact event. Seed verified article links, and provide
// publisher links even when browser-direct news services are unreachable offline.
const verified=[
 {title:'Michigan Senate debate: El-Sayed and Rogers',summary:'Coverage of the October 8 Michigan Senate debate.',url:'https://www.aljazeera.com/news/2026/10/9/key-takeaways-from-us-senate-debate-in-michigan-between-el-sayed-rogers',source:'Al Jazeera',time:'2026-10-09T12:00:00Z'},
 {title:'UN extends Darfur arms embargo',summary:'Reporting on the UN Security Council sanctions decision.',url:'https://www.aljazeera.com/news/2026/10/9/un-extends-darfur-arms-embargo-blocks-broader-sudan-sanctions-proposal',source:'Al Jazeera',time:'2026-10-09T12:00:00Z'},
 {title:'Spanish housing protests after death of Maricarmen',summary:'Coverage of protests and the housing debate in Spain.',url:'https://www.aljazeera.com/news/2026/10/9/protests-debate-follow-death-of-maricarmen-87-spain-protest-symbol',source:'Al Jazeera',time:'2026-10-09T12:00:00Z'},
 {title:'US science awards to technology executives',summary:'Reporting on the 2026 US science awards.',url:'https://www.aljazeera.com/news/2026/10/8/trump-gives-top-us-science-awards-to-elon-musk-and-other-tech-executives',source:'Al Jazeera',time:'2026-10-08T16:00:00Z'}
];
const publisher=[['Al Jazeera','https://www.aljazeera.com/news/'],['Democracy Now!','https://www.democracynow.org/'],['openDemocracy','https://www.opendemocracy.net/'],['Common Dreams','https://www.commondreams.org/'],['African Arguments','https://africanarguments.org/'],['Novara Media','https://novaramedia.com/'],['Jacobin','https://jacobin.com/']];
let feedSeeded=new WeakSet();
function mountNews(host){
 if(!host?.shadowRoot||feedSeeded.has(host))return;
 const root=host.shadowRoot;if(!root.querySelector('[data-feed-stream]'))return;
 feedSeeded.add(host);
 let current=verified;
 const fire=(entries)=>document.dispatchEvent(new CustomEvent('ourspace:news-items',{detail:{source:'OurSpace sources',sourceLabel:'News links',entries}}));
 const screens=root.querySelectorAll('[data-feed-screen]');
 function show(entries){
  screens.forEach((screen,i)=>{
   screen.replaceChildren();
   const title=document.createElement('strong');title.textContent=['World','Headlines','More news','Sources'][i]||'News';screen.append(title);
   const start=i*Math.ceil(entries.length/4),stories=entries.slice(start,start+Math.ceil(entries.length/4));
   for(const story of stories){
    const item=document.createElement('article');item.style.cssText='margin:9px 0;padding:8px;border:1px solid #009B9B;background:#D1FFFF;border-radius:8px;color:#000';
    const a=document.createElement('a');a.href=story.url;a.rel='noopener noreferrer';a.target='_blank';a.textContent=story.title;a.style.cssText='font-weight:800;color:#421900';
    const by=document.createElement('small');by.style.cssText='display:block;color:#421900';by.textContent=story.source||'';
    item.append(a,by);screen.append(item);
   }
  });
 }
 show(current);setTimeout(()=>fire(current),120);
 const existing=root.querySelector('[data-feed-stream]')?.closest('.module');
 const sec=document.createElement('section');sec.id='osFeedPublisherLinks';sec.style.cssText='border:2px solid #009B9B;background:#D1FFFF;border-radius:12px;padding:12px;margin:10px 0;color:#421900';
 const h=document.createElement('h3');h.textContent='News sources';sec.append(h);
 for(const [name,url] of publisher){const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=name+' ↗';a.style.cssText='display:inline-block;margin:4px;padding:7px;border:1px solid #009B9B;border-radius:7px;background:#FFF600;color:#421900';sec.append(a)}
 const refresh=document.createElement('button');refresh.type='button';refresh.textContent='↻ Refresh news';refresh.style.cssText='background:#00FFFF;color:#000;border:2px solid #009B9B;border-radius:8px;padding:8px;cursor:pointer;min-height:36px';sec.append(refresh);
 const status=document.createElement('small');status.style.cssText='display:block;margin:8px 0;color:#421900';status.textContent='News snapshot: October 9, 2026 · Live refresh requires an internet connection.';sec.append(status);
 existing?.append(sec);
 let fetching=false;
 async function refreshLive(){
  if(fetching)return;fetching=true;refresh.disabled=true;status.textContent='Loading current headlines…';
  const controller=new AbortController(),t=setTimeout(()=>controller.abort(),10000);
  try{
   // The GDELT 2.0 endpoint is drawn from the attached feed-source registry.
   const q=new URLSearchParams({query:'world',mode:'artlist',format:'json',maxrecords:'20',sort:'datedesc',timespan:'24h'});
   const res=await fetch('https://api.gdeltproject.org/api/v2/doc/doc?'+q.toString(),{signal:controller.signal,mode:'cors'});
   if(!res.ok)throw new Error('No connection');
   const data=await res.json();const rows=(data.articles||[]).map(x=>{
    try{const url=new URL(x.url);if(!['https:','http:'].includes(url.protocol))return null;return {title:String(x.title||'').trim().slice(0,250),url:url.href,source:x.domain||'News',summary:'',time:x.seendate&&/^\d{14}$/.test(x.seendate)?`${x.seendate.slice(0,4)}-${x.seendate.slice(4,6)}-${x.seendate.slice(6,8)}T${x.seendate.slice(8,10)}:${x.seendate.slice(10,12)}:00Z`:new Date().toISOString()}}
    catch(_){return null}
   }).filter(x=>x&&x.title).slice(0,16);
   if(!rows.length)throw new Error('No recent headlines returned');
   current=rows;show(rows);fire(rows);status.textContent='Live headlines · '+new Date().toLocaleString();
  }catch(e){status.textContent='Live headlines unavailable. Verified article and publisher links are still available.'}
  finally{clearTimeout(t);fetching=false;refresh.disabled=false}
 }
 refresh.addEventListener('click',refreshLive);
 // Keep startup usable offline; try for fresh articles without blocking the page.
 refreshLive();
}
window.addEventListener('ourspace:native-mounted',e=>{if(e.detail?.key==='feed')mountNews(e.detail.host);if(e.detail?.key==='record-native'){const shadow=e.detail.host.shadowRoot;const c=shadow?.getElementById('waveformCanvas');if(c){c.setAttribute('aria-label','Soundwave display and playback position');const f=shadow.getElementById('waveformFrame');if(f)f.style.minHeight='130px'}}});
for(const host of document.querySelectorAll('[data-embedded-module]')){if(host.dataset.embeddedModule==='feed'&&host.shadowRoot)mountNews(host)}
setInterval(()=>{if(isSignedIn())refreshAll()},60_000);
// Relationship shortcuts use the existing navigator; no duplicate media player or chat.
const relatedAside=document.querySelector('.oscom-details');
if(relatedAside&&!relatedAside.querySelector('[data-os-related]')){
 const panel=document.createElement('div');panel.className='oscom-detail-card';panel.dataset.osRelated='';
 const title=document.createElement('strong');title.textContent='Shared profiles & media';panel.append(title);
 for(const [page,label] of [['retrobuilder','Profiles'],['feed','Shared Feed'],['audio','Audio'],['visual','Visual']]){
  const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',()=>{window.ourspaceNavigatePage?.(page)});panel.append(b);
 }
 relatedAside.append(panel);
}
window.OurSpaceCommsUpgrade={app:chat,pinnedMessages,todayItems,openQuick(tab='chats'){quickTab=tab;quickOpen=true;quick.classList.add('open');renderQuick()}};
})();

