/*
  Onyx upgraded module shell/runtime.
  Presentation, profile-scoped local chat organization, and module design only.
  Conversation generation, pet behavior, files, tools, and backend calls remain
  owned by OnyxVirtualPet / OnyxConversationEngine / OnyxBackendClient.
*/
(() => {
  'use strict';

  const SERVERS=Object.freeze({health:'Virtual & Health',leisure:'Leisure',work:'Work'});
  const TABS=Object.freeze({...SERVERS,design:'Design'});
  const REACTIONS=Object.freeze([
    {id:'praise',glyph:'👍',label:'Praise'},
    {id:'love',glyph:'❤️',label:'Love'},
    {id:'laugh',glyph:'😂',label:'Funny'},
    {id:'thinking',glyph:'🤔',label:'Unsure'},
    {id:'dissatisfied',glyph:'👎',label:'Dissatisfied'}
  ]);
  const PROMPTS=Object.freeze({
    health:Object.freeze([
      {id:'pet-chat',label:'Companion chat',text:'Keep me company for a bit in your familiar Onyx way.'},
      {id:'pet-care',label:'Pet care',text:'Check in as my virtual pet companion and tell me what kind of care or attention you want right now.'},
      {id:'health-checkin',label:'Gentle check-in',text:'Do a gentle health and stress check-in with me, then help me choose one realistic next step.'},
      {id:'health-dbt',label:'DBT help',text:'Help me choose the most fitting DBT skill for what I am dealing with right now and explain it clearly.'},
      {id:'health-appointment',label:'Appointment prep',text:'Help me organize what to say for a health or psychiatric appointment, including the key points and questions.'}
    ]),
    leisure:Object.freeze([
      {id:'leisure-rec',label:'Recommendations',text:'Recommend something fun for me based on my interests and explain why it fits.'},
      {id:'leisure-game',label:'Game advice',text:'Help me with a game question, strategy issue, or build idea in a natural conversational way.'},
      {id:'leisure-web',label:'Look it up',text:'Look up current information about a game, hobby, or media topic I am interested in and summarize the useful parts.',forceWeb:true}
    ]),
    work:Object.freeze([
      {id:'work-ttrpg',label:'TTRPG help',text:'Help me build or strengthen a TTRPG idea, encounter, character, or worldbuilding problem.'},
      {id:'work-writing',label:'Writing help',text:'Help me brainstorm, organize, or strengthen a writing or worldbuilding problem while keeping continuity in mind.'},
      {id:'work-code',label:'Code + files',text:'Help me work through a coding, file, or project problem, and use uploaded files when relevant.'}
    ])
  });
  const ALERT_TYPES=Object.freeze({
    alert:Object.freeze({glyph:'🔔',label:'Alert'}),
    writing:Object.freeze({glyph:'📝',label:'Writing'}),
    thinking:Object.freeze({glyph:'💭',label:'Thinking'}),
    responded:Object.freeze({glyph:'💬',label:'Responded'}),
    important:Object.freeze({glyph:'📢',label:'Important'}),
    virtual_pet:Object.freeze({image:'assets/images/shared/onyx-alert-virtual-pet.svg',label:'Virtual Pet'})
  });
  const widget=document.querySelector('[data-jump-nav="onyx-widget"]');
  if(!widget)return;
  const orb=widget.querySelector('#onyxBubble,.jump-orb');
  const panel=widget.querySelector('#onyxPopout,.jump-panel');
  const tabs=Array.from(widget.querySelectorAll('.jump-tab'));
  const panes=Array.from(widget.querySelectorAll('.jump-pane'));
  const fullscreenExit=widget.querySelector('[data-global-fullscreen-exit]');
  const toastEl=widget.querySelector('.widget-toast');
  const state={config:{profileKey:''},activeTab:'health',activeServer:'health',servers:Object.fromEntries(Object.keys(SERVERS).map(k=>[k,{threads:[],currentThreadId:'',search:''}]))};
  let toastTimer=0;
  const composeState=Object.fromEntries(Object.keys(SERVERS).map(k=>[k,{forceWeb:false,remember:k!=='health'}]));
  const retentionState=Object.fromEntries(Object.keys(SERVERS).map(k=>[k,k==='health'?'session':'device']));
  const SUPPORT_PREF_DEFAULTS=Object.freeze({lowEnergy:false,cognitiveLoad:'standard',sensorySensitive:false,avoidBreathing:false,communication:'natural',interoceptionDifficulty:false});
  let supportPrefs={...SUPPORT_PREF_DEFAULTS};
  const THREAD_STORAGE_BUDGET_BYTES=2_500_000;
  let lastStorageWarningAt=0;

  function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
  function cssEscape(value){const raw=String(value??'');if(window.CSS&&typeof CSS.escape==='function')return CSS.escape(raw);return raw.replace(/[^a-zA-Z0-9_-]/g,ch=>'\\'+ch.codePointAt(0).toString(16)+' ')}
  function uid(){try{return crypto.randomUUID()}catch(_){return 'onyx-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10)}}
  function cleanName(value){return String(value||'').replace(/[\\/:*?"<>|\x00-\x1f]/g,' ').replace(/\s+/g,' ').trim().slice(0,80)||'Onyx chat'}
  function safeHttpUrl(value){try{const u=new URL(String(value||''),location.href);return /^https?:$/i.test(u.protocol)?u.href:''}catch(_){return''}}
  function compactTime(value){const d=new Date(value||0);return Number.isNaN(d.getTime())?'':d.toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}
  function toast(message){if(!toastEl)return;toastEl.textContent=String(message||'');toastEl.classList.add('is-visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastEl.classList.remove('is-visible'),2600)}
  function storageWarning(scope='local changes'){const now=Date.now();if(now-lastStorageWarningAt<8000)return;lastStorageWarningAt=now;toast(`Could not save ${scope}. This session still works, but those local changes may not survive a refresh.`);window.dispatchEvent(new CustomEvent('onyx:storage-warning',{detail:{scope}}))}
  function utf8Bytes(value){const text=String(value??'');try{return new TextEncoder().encode(text).byteLength}catch(_){return text.length*2}}
  function artifactForStorage(art){if(!art||typeof art!=='object')return null;const safe={};for(const key of ['kind','name','fileName','mimeType','type','fileId','id','url','size','sizeBytes','createdAt']){const value=art[key];if(value===undefined||value===null)continue;if(typeof value==='string')safe[key]=value.slice(0,key==='url'?4096:512);else if(typeof value==='number'||typeof value==='boolean')safe[key]=value}return Object.keys(safe).length?safe:null}
  function messageForStorage(m){return{...m,artifacts:Array.isArray(m?.artifacts)?m.artifacts.slice(0,16).map(artifactForStorage).filter(Boolean):[],citations:Array.isArray(m?.citations)?m.citations.slice(0,16).map(c=>typeof c==='string'?c.slice(0,4096):(c&&typeof c==='object'?Object.fromEntries(Object.entries(c).filter(([k,v])=>['string','number','boolean'].includes(typeof v)).slice(0,12)):c)):[]}}
  function threadForStorage(t){return{...t,messages:Array.isArray(t?.messages)?t.messages.slice(-240).map(messageForStorage):[]}}
  function profileKey(){const fromClient=window.OnyxBackendClient?.activeProfile?.();return String(fromClient||state.config.profileKey||document.documentElement?.dataset?.profile||'shared').toLowerCase().replace(/[^a-z0-9_-]+/g,'-')||'shared'}
  function threadStoreKey(){return `ourspace.onyx.module.threads.v4.${profileKey()}`}
  function sessionThreadStoreKey(){return `ourspace.onyx.module.threads.session.v1.${profileKey()}`}
  function retentionPrefKey(){return `ourspace.onyx.module.retention.v1.${profileKey()}`}
  function memoryPrefKey(){return `ourspace.onyx.module.memory.v1.${profileKey()}`}
  function supportPrefKey(){return `ourspace.onyx.module.support-preferences.v1.${profileKey()}`}
  function normalizeSupportPrefs(raw){const src=raw&&typeof raw==='object'?raw:{};const cognitive=String(src.cognitiveLoad||'').toLowerCase(),communication=String(src.communication||'').toLowerCase();return{lowEnergy:Boolean(src.lowEnergy),cognitiveLoad:['standard','low'].includes(cognitive)?cognitive:'standard',sensorySensitive:Boolean(src.sensorySensitive),avoidBreathing:Boolean(src.avoidBreathing),communication:['natural','literal','minimal'].includes(communication)?communication:'natural',interoceptionDifficulty:Boolean(src.interoceptionDifficulty)}}
  function renderSupportPrefs(){widget.querySelectorAll('[data-support-pref-check]').forEach(input=>{input.checked=Boolean(supportPrefs[input.dataset.supportPrefCheck])});widget.querySelectorAll('[data-support-pref-select]').forEach(select=>{const key=select.dataset.supportPrefSelect;if(Object.prototype.hasOwnProperty.call(supportPrefs,key))select.value=String(supportPrefs[key])})}
  function loadSupportPrefs(){let raw=null;try{raw=JSON.parse(localStorage.getItem(supportPrefKey())||'null')}catch(_){}supportPrefs=normalizeSupportPrefs(raw);renderSupportPrefs();return supportPrefs}
  function saveSupportPrefs(){try{localStorage.setItem(supportPrefKey(),JSON.stringify(supportPrefs))}catch(_){storageWarning('support preferences')}try{window.dispatchEvent(new CustomEvent('onyx:support-preferences-change',{detail:{profileKey:profileKey(),preferences:{...supportPrefs}}}))}catch(_){}return supportPrefs}
  function setSupportPref(key,value){if(!Object.prototype.hasOwnProperty.call(SUPPORT_PREF_DEFAULTS,key))return false;supportPrefs=normalizeSupportPrefs({...supportPrefs,[key]:value});saveSupportPrefs();renderSupportPrefs();toast('Support preferences updated.');return true}
  function renderMemoryControl(server){if(!SERVERS[server])return;const on=Boolean(composeState[server]?.remember),b=widget.querySelector(`[data-memory-button="${server}"]`),form=widget.querySelector(`[data-chat-form="${server}"]`);if(form)form.dataset.memoryPolicy=on?'on':'off';if(b){b.innerHTML=`<span class="onyx-protected-emoji" aria-hidden="true">🧠</span><span class="onyx-protected-icon" aria-hidden="true">${on?'✓':'×'}</span> <span>Memory</span>`;b.classList.toggle('is-active',on);b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label',on?'Durable memory on':'Durable memory off');b.title=on?'Durable memory on':'Durable memory off'}}
  function loadMemoryPrefs(){let raw={};try{raw=JSON.parse(localStorage.getItem(memoryPrefKey())||'{}')||{}}catch(_){}for(const server of Object.keys(SERVERS)){composeState[server].remember=typeof raw[server]==='boolean'?raw[server]:(server!=='health');renderMemoryControl(server)}}
  function saveMemoryPrefs(){const raw=Object.fromEntries(Object.keys(SERVERS).map(server=>[server,Boolean(composeState[server]?.remember)]));try{localStorage.setItem(memoryPrefKey(),JSON.stringify(raw))}catch(_){storageWarning('memory preferences')}}
  function setComposeMemory(server,on){if(!SERVERS[server])return;composeState[server].remember=Boolean(on);saveMemoryPrefs();renderMemoryControl(server)}
  function renderRetentionControl(server){if(!SERVERS[server])return;const mode=retentionState[server]==='session'?'session':'device',b=widget.querySelector(`[data-retention-button="${server}"]`);if(!b)return;b.textContent=mode==='session'?'Session only':'Device history';b.dataset.retentionMode=mode;b.setAttribute('aria-pressed',String(mode==='device'));b.setAttribute('aria-label',mode==='session'?'Local history is session only. Activate to keep this tab on this device.':'Local history is saved on this device. Activate to make this tab session only.');b.title=mode==='session'?'Session only: cleared when this browser session ends':'Device history: saved in this browser'}
  function loadRetentionPrefs(){let raw={};try{raw=JSON.parse(localStorage.getItem(retentionPrefKey())||'{}')||{}}catch(_){}for(const server of Object.keys(SERVERS)){const mode=String(raw[server]||'').toLowerCase();retentionState[server]=mode==='session'||mode==='device'?mode:(server==='health'?'session':'device');renderRetentionControl(server)}}
  function saveRetentionPrefs(){try{localStorage.setItem(retentionPrefKey(),JSON.stringify(retentionState))}catch(_){storageWarning('history privacy preferences')}}
  function setRetentionMode(server,mode){if(!SERVERS[server])return;const next=mode==='session'?'session':'device';if(retentionState[server]===next)return;retentionState[server]=next;saveRetentionPrefs();writeThreads();renderRetentionControl(server);window.dispatchEvent(new CustomEvent('onyx:local-retention-change',{detail:{profileKey:profileKey(),server,mode:next}}));toast(next==='session'?'This tab now keeps local chat history for this browser session only.':'This tab now keeps local chat history on this device.')}
  function safeThread(raw,server){if(!raw||typeof raw!=='object')return null;const now=new Date().toISOString();return{threadId:String(raw.threadId||uid()),server,title:String(raw.title||'Chat').slice(0,100),createdAt:String(raw.createdAt||now),updatedAt:String(raw.updatedAt||raw.createdAt||now),pinned:Boolean(raw.pinned),savedFileId:String(raw.savedFileId||''),messages:Array.isArray(raw.messages)?raw.messages.slice(-240).map(m=>({id:String(m.id||uid()),role:m.role==='user'?'user':m.role==='assistant'||m.role==='onyx'?'assistant':'system',content:String(m.content||'').slice(0,32000),createdAt:String(m.createdAt||now),pinned:Boolean(m.pinned),reactions:m.reactions&&typeof m.reactions==='object'?{...m.reactions}:{},artifacts:Array.isArray(m.artifacts)?m.artifacts.slice(0,16).map(artifactForStorage).filter(Boolean):[],citations:Array.isArray(m.citations)?m.citations.slice(0,16):[]})):[]}}
  function readThreads(){let device={},session={};try{device=JSON.parse(localStorage.getItem(threadStoreKey())||'{}')||{}}catch(_){}try{session=JSON.parse(sessionStorage.getItem(sessionThreadStoreKey())||'{}')||{}}catch(_){}let migrated=false;for(const server of Object.keys(SERVERS)){const mode=retentionState[server]==='session'?'session':'device',selected=mode==='session'?session:device,alternate=mode==='session'?device:session,hasSelected=Object.prototype.hasOwnProperty.call(selected,server),raw=hasSelected?selected:alternate;if(!hasSelected&&Object.prototype.hasOwnProperty.call(alternate,server))migrated=true;const rows=Array.isArray(raw[server])?raw[server]:[];state.servers[server].threads=rows.map(x=>safeThread(x,server)).filter(Boolean).slice(0,120);state.servers[server].threads.sort((a,b)=>Number(b.pinned)-Number(a.pinned)||String(b.updatedAt).localeCompare(String(a.updatedAt)));const remembered=String(raw.__active?.[server]||'');state.servers[server].currentThreadId=state.servers[server].threads.some(t=>t.threadId===remembered)?remembered:(state.servers[server].threads[0]?.threadId||'')}if(migrated)writeThreads()}
  function writeThreads(){
    const build=()=>{const device={__active:{}},session={__active:{}};for(const server of Object.keys(SERVERS)){const d=state.servers[server],mode=retentionState[server]==='session'?'session':'device',out=mode==='session'?session:device;out.__active[server]=d.currentThreadId;out[server]=d.threads.slice(0,120).map(threadForStorage)}return{device,session}};
    const serialize=()=>{const out=build(),deviceJson=JSON.stringify(out.device),sessionJson=JSON.stringify(out.session);return{...out,deviceJson,sessionJson,bytes:utf8Bytes(deviceJson)+utf8Bytes(sessionJson)}};
    let packed=serialize(),trimmed=0;
    if(packed.bytes>THREAD_STORAGE_BUDGET_BYTES){
      const candidates=[];
      for(const server of Object.keys(SERVERS))for(const thread of state.servers[server].threads){if(thread.threadId!==state.servers[server].currentThreadId&&!thread.pinned)candidates.push({server,threadId:thread.threadId,updatedAt:String(thread.updatedAt||thread.createdAt||'')})}
      candidates.sort((a,b)=>a.updatedAt.localeCompare(b.updatedAt));
      for(const candidate of candidates){
        const d=state.servers[candidate.server],index=d.threads.findIndex(t=>t.threadId===candidate.threadId);if(index<0)continue;d.threads.splice(index,1);trimmed++;packed=serialize();if(packed.bytes<=THREAD_STORAGE_BUDGET_BYTES)break;
      }
    }
    if(packed.bytes>THREAD_STORAGE_BUDGET_BYTES){
      for(const server of Object.keys(SERVERS))for(const thread of state.servers[server].threads){if(thread.messages.length>48){thread.messages=thread.messages.slice(-48);trimmed++}}
      packed=serialize();
    }
    if(packed.bytes>THREAD_STORAGE_BUDGET_BYTES){storageWarning('local chat history');return false}
    let ok=true;
    try{localStorage.setItem(threadStoreKey(),packed.deviceJson)}catch(_){ok=false;storageWarning('device chat history')}
    try{sessionStorage.setItem(sessionThreadStoreKey(),packed.sessionJson)}catch(_){ok=false;storageWarning('session chat history')}
    if(trimmed)toast('Older local-only chat history was trimmed to stay within this browser’s storage limit.');
    return ok
  }
  function clearLocalHistory(server){if(!SERVERS[server])return;const d=state.servers[server];d.threads=[];d.currentThreadId='';writeThreads();window.OnyxVirtualPet?.clearLane?.(server,{keepThread:false});renderHistory(server);renderHeader(server);toast('Local '+SERVERS[server]+' channels cleared. Account/backend history was not deleted.')}
  function currentThread(server,create=false){const d=state.servers[server];let t=d?.threads.find(x=>x.threadId===d.currentThreadId)||null;if(!t&&create)t=createThread(server,false);return t}
  function createThread(server,activate=true){if(!SERVERS[server])return null;const now=new Date().toISOString();const t={threadId:`ourspace-onyx-${profileKey()}-${server}-${uid()}`,server,title:'new-chat',createdAt:now,updatedAt:now,pinned:false,savedFileId:'',messages:[]};const d=state.servers[server];d.threads.unshift(t);if(activate)d.currentThreadId=t.threadId;writeThreads();renderHistory(server);renderHeader(server);return t}
  function inferTitle(thread){const first=thread?.messages?.find(m=>m.role==='user'&&m.content.trim());return first?first.content.replace(/\s+/g,' ').trim().slice(0,56):'Chat'}

  function quietCompanyPanel(){return `<section class="onyx-quiet-company" aria-label="Quiet companionship">
    <div class="onyx-quiet-company-head"><strong>Quiet Company</strong><button data-onyx-quiet-toggle type="button" aria-pressed="false">Stay with me</button></div>
    <p>Timerless, low-pressure company while you rest or do something. No streak, report, or productivity judgment required.</p>
    <div class="onyx-quiet-company-status" data-onyx-quiet-status aria-live="polite"></div>
  </section>`}
  function virtualPetPanel(){return `<details class="module-design-section chat-utility-section virtual-pet-section">
    <summary>Virtual Pet Care &amp; Companion</summary>
    <div class="chat-utility-body">
      <section class="onyx-pet-dashboard" aria-label="Virtual pet care">
        <div class="onyx-care-grid">
          <button data-onyx-action="feed" type="button">Feed</button><button data-onyx-action="water" type="button">Water</button>
          <button data-onyx-action="treat" type="button">Treat</button><button data-onyx-action="pet" type="button">Pet</button>
          <button data-onyx-action="scratch" type="button">Scratchies</button><button data-onyx-action="play" type="button">Play</button>
          <button data-onyx-action="brush" type="button">Brush</button><button data-onyx-action="blanket" type="button">Blanket</button>
          <button data-onyx-action="fan" type="button">Fan</button><button data-onyx-action="bowtie" type="button">Bow Tie</button>
          <button data-onyx-action="pillow" type="button">Pillow</button><button data-onyx-action="tuck" type="button">Tuck In</button>
          <button data-onyx-action="nuzzle" type="button">Nuzzle</button><button data-onyx-action="slowblink" type="button">Slow Blink</button>
          <button data-onyx-action="check" type="button">Check Onyx</button><button data-onyx-action="settle" type="button">Settle</button>
        </div>
        <div class="onyx-meter-stack" aria-label="Onyx needs">
          <div class="onyx-meter-row"><span>Energy</span><div class="onyx-meter" id="onyxEnergyMeter" role="progressbar" aria-label="Energy" aria-valuemin="0" aria-valuemax="100"><i id="onyxEnergyFill"></i></div><b id="onyxEnergyValue"></b></div>
          <div class="onyx-meter-row"><span>Fullness</span><div class="onyx-meter" id="onyxHungerMeter" role="progressbar" aria-label="Fullness" aria-valuemin="0" aria-valuemax="100"><i id="onyxHungerFill"></i></div><b id="onyxHungerValue"></b></div>
          <div class="onyx-meter-row"><span>Joy</span><div class="onyx-meter" id="onyxJoyMeter" role="progressbar" aria-label="Joy" aria-valuemin="0" aria-valuemax="100"><i id="onyxJoyFill"></i></div><b id="onyxJoyValue"></b></div>
          <div class="onyx-meter-row"><span>Connection</span><div class="onyx-meter" id="onyxAffectionMeter" role="progressbar" aria-label="Recent connection" aria-valuemin="0" aria-valuemax="100"><i id="onyxAffectionFill"></i></div><b id="onyxAffectionValue"></b></div>
          <div class="onyx-meter-row"><span>Comfort</span><div class="onyx-meter" id="onyxComfortMeter" role="progressbar" aria-label="Comfort" aria-valuemin="0" aria-valuemax="100"><i id="onyxComfortFill"></i></div><b id="onyxComfortValue"></b></div>
        </div>
      </section>
      <section class="onyx-self-care" aria-label="Care for yourself">
        <div class="onyx-self-care-head"><strong>Care for You</strong><button class="onyx-pause-button" data-onyx-pause-toggle type="button" aria-pressed="false">Pause</button></div>
        <div class="onyx-self-care-controls">
          <select data-onyx-self-care-select aria-label="Self-care action">
            <option value="drink">Drink</option><option value="eat">Eat</option><option value="hygiene">Hygiene</option><option value="comfort">Comfort</option>
            <option value="outside">Window / Air</option><option value="task">Tiny Task</option><option value="skill">Coping Skill</option><option value="reflect">Reflect</option>
            <option value="medication">Existing Plan</option><option value="appointment">Appointment Prep</option><option value="rest">Rest</option><option value="custom">Custom</option>
          </select>
          <input data-onyx-self-care-custom class="onyx-self-care-custom" maxlength="80" aria-label="Custom care action" hidden>
          <button data-onyx-self-care-smaller type="button" aria-pressed="false">Smaller</button>
          <button data-onyx-self-care-done type="button">Done</button>
          <button data-onyx-self-care-skip type="button">Skip</button>
        </div>
        <div class="onyx-self-care-status" data-onyx-self-care-status aria-live="polite"></div>
      </section>${quietCompanyPanel()}
    </div>
  </details>`}
  function healthScope(){return `<details class="onyx-health-scope module-design-section chat-utility-section">
    <summary>Health scope & privacy</summary>
    <div class="onyx-health-scope-body">
      <p>Talk, vent, organize symptoms or questions, use DBT/ADHD/autism-informed support, or prepare for appointments.</p>
      <p>He does not diagnose, prescribe, change medication doses, replace a clinician, or replace emergency services. For immediate danger or a possible medical emergency, use local emergency services or appropriate human care.</p>
      <p><strong>Privacy:</strong> Health defaults to session-only local history and durable memory off. Use the history and brain controls below if you want different retention.</p>
    </div>
  </details>`}
  function supportPreferencesPanel(){return `<details class="onyx-support-preferences module-design-section chat-utility-section">
    <summary>Support preferences</summary>
    <div class="onyx-support-preferences-body">
      <p>Optional, user-chosen preferences only. Onyx does not infer diagnoses from these settings.</p>
      <label><input type="checkbox" data-support-pref-check="lowEnergy"> Offer the smallest/lowest-energy step first</label>
      <label><input type="checkbox" data-support-pref-check="sensorySensitive"> Prefer low-stimulation / sensory-aware options</label>
      <label><input type="checkbox" data-support-pref-check="avoidBreathing"> Do not lead with breathing exercises</label>
      <label><span>Cognitive load</span><select data-support-pref-select="cognitiveLoad" aria-label="Cognitive load preference"><option value="standard">Standard</option><option value="low">Keep it short: 1–3 steps</option></select></label>
      <label><span>Communication</span><select data-support-pref-select="communication" aria-label="Communication preference"><option value="natural">Natural</option><option value="literal">Concrete / literal</option><option value="minimal">Short choices / one-word friendly</option></select></label>
      <label><input type="checkbox" data-support-pref-check="interoceptionDifficulty"> Offer observable cues instead of requiring precise body-feeling labels</label>
    </div>
  </details>`}
  function healthModes(){return `<details class="module-design-section chat-utility-section health-modes-section">
    <summary>Conversation Modes</summary>
    <div class="chat-utility-body"><div class="onyx-chat-modes" data-mode-group="health" aria-label="Health conversation mode">
      <button type="button" data-chat-mode="auto" class="is-active">Chat</button><button type="button" data-chat-mode="listen">Listen</button><button type="button" data-onyx-quiet-toggle aria-pressed="false">Quiet</button><button type="button" data-chat-mode="checkin">Check In</button>
      <button type="button" data-chat-mode="ground">Ground</button><button type="button" data-chat-mode="dbt">DBT</button>
      <button type="button" data-chat-mode="journal">Journal</button><button type="button" data-chat-mode="appointment">Appointment</button>
    </div></div>
  </details>`}
  function promptMarkup(server){const prompts=PROMPTS[server]||[];return prompts.map(prompt=>`<button class="chat-prompt-chip" data-prompt-chip="${server}" data-prompt-id="${escapeHtml(prompt.id)}" type="button">${escapeHtml(prompt.label)}</button>`).join('')}
  function chatTabIntro(server){return ({
    health:'One continuous Onyx space for virtual-pet companionship, health/support conversation, and Professor/Advising Onyx. In fullscreen he always keeps his jacket, glasses, and clipboard; tone can still shift naturally without resetting the chat.',
    leisure:'Use this space for games, hobbies, media, special interests, recommendations, walkthroughs, research, and relaxed conversation.',
    work:'Use this space for projects, coding, TTRPG work, writing, worldbuilding, research, files, planning, and longer collaborative sessions.'
  })[server]||''}
  function paneTemplate(server){const label=SERVERS[server];const extras=server==='health'?virtualPetPanel()+healthScope()+supportPreferencesPanel()+healthModes():'';const tabAction=server==='leisure'?'<button class="fullscreen-button" data-launch-game type="button">Feed Him MEOW</button>':server==='health'?'<button class="fullscreen-button" data-launch-slow-game type="button">Virtual &amp; Health</button>':server==='work'?'<button class="fullscreen-button" data-launch-work type="button">Open Work fullscreen</button>':'';return `<div class="pane-toolbar server-pane-toolbar"><div class="server-pane-title"><span class="server-pane-kicker">Server</span><h2 class="pane-title">${escapeHtml(label)}</h2></div>${tabAction}</div>
    <div class="conversation-page-shell" data-chat-page="${server}">
      <p class="module-design-intro chat-page-intro">${escapeHtml(chatTabIntro(server))}</p>
      ${extras}
      <section class="module-design-section chat-server-workspace bottom-drag-surface" data-chat-server-workspace="${server}" data-bottom-drag-surface="workspace" aria-label="${escapeHtml(label)} server workspace">
        <div class="server-workspace-head"><div><span class="server-workspace-kicker">Onyx server</span><strong>${escapeHtml(label)}</strong></div><span class="server-channel-count" data-channel-count="${server}">0 channels</span></div>
        <div class="server-workspace-grid">
          <aside class="history-sidebar channel-sidebar" aria-label="${escapeHtml(label)} channels">
            <div class="history-head channel-head">
              <div class="history-title-row"><h3 class="history-title"># Channels</h3><button class="chat-button" data-new-chat="${server}" type="button">+ New Channel</button></div>
              <input class="history-search" data-history-search="${server}" type="search" placeholder="Search channels" aria-label="Search ${escapeHtml(label)} channels">
            </div>
            <div class="history-list channel-list" data-history-list="${server}" role="list" aria-label="${escapeHtml(label)} channel list"></div>
            <div class="channel-sidebar-footer"><button class="history-privacy-button" data-retention-button="${server}" type="button" aria-pressed="false">Local history</button><button class="history-clear-button" data-clear-local-history="${server}" type="button">Clear local</button></div>
          </aside>
          <section class="chat-conversation-section" data-chat-server="${server}" aria-label="${escapeHtml(label)} active channel">
            <main class="chat-main" data-chat-main="${server}" data-chat-surface="${server}">
              <div class="chat-header"><div class="chat-heading-wrap"><span class="chat-channel-kicker">Channel</span><strong class="chat-channel-name"><span aria-hidden="true">#</span><span data-chat-heading="${server}"></span></strong><div class="chat-heading">Conversation with Onyx inside the ${escapeHtml(label)} server.</div></div><div class="chat-header-actions"><button class="chat-button new-chat-primary" data-new-chat="${server}" type="button">+ Channel</button><button class="history-icon" data-retry-last="${server}" type="button" title="Retry / regenerate last response" aria-label="Retry or regenerate last response"><span class="onyx-protected-icon" aria-hidden="true">↻</span></button><button class="history-icon" data-edit-last="${server}" type="button" title="Edit and resend last prompt" aria-label="Edit and resend last prompt"><span class="onyx-protected-icon" aria-hidden="true">✎</span></button><button class="history-icon" data-rename-current="${server}" type="button" title="Rename channel" aria-label="Rename channel"><span class="onyx-protected-emoji" aria-hidden="true">📝</span></button><button class="history-icon" data-delete-current="${server}" type="button" title="Delete local channel" aria-label="Delete local channel"><span class="onyx-protected-emoji" aria-hidden="true">🗑️</span></button><button class="history-icon" data-save-current="${server}" type="button" title="Save channel transcript" aria-label="Save channel transcript"><span class="onyx-protected-emoji" aria-hidden="true">💾</span></button><button class="history-icon" data-pin-current="${server}" type="button" title="Pin channel" aria-label="Pin channel" aria-pressed="false"><span class="onyx-protected-emoji" aria-hidden="true">📌</span></button></div></div>
              <div class="chat-prompts" data-chat-prompts="${server}" aria-label="Suggested prompts"><strong class="chat-prompts-label">Prompts</strong>${promptMarkup(server)}</div>
              <div class="chat-messages onyx-chat-log bottom-drag-surface" data-bottom-drag-surface="messages" data-chat-messages="${server}" data-chat-log="${server}" role="log" aria-live="polite" aria-relevant="additions text" aria-atomic="false"></div>
              <div class="onyx-attachment-strip" data-attachment-strip="${server}"></div>
              <div class="chat-compose-toolbar" data-chat-compose-toolbar="${server}" aria-label="Conversation tools">
                <button class="chat-tool-button labeled-tool" data-attach-button="${server}" data-capability-state="pending" type="button" aria-label="Upload file, checking availability" title="Upload file: checking backend capability…" aria-disabled="true" disabled><span class="onyx-protected-emoji" aria-hidden="true">⬆️</span> <span>File</span></button>
                <button class="chat-tool-button labeled-tool" data-download-button="${server}" type="button" aria-label="Download latest output" title="Download latest output"><span class="onyx-protected-emoji" aria-hidden="true">⬇️</span> <span>Output</span></button>
                <button class="chat-tool-button labeled-tool" data-link-button="${server}" type="button" aria-label="Insert link" title="Insert link"><span class="onyx-protected-emoji" aria-hidden="true">🔗</span> <span>Link</span></button>
                <button class="chat-tool-button text-tool" data-bold-button="${server}" type="button" aria-label="Bold" title="Bold"><span class="onyx-protected-icon" aria-hidden="true">𝐁</span></button>
                <button class="chat-tool-button text-tool" data-italic-button="${server}" type="button" aria-label="Italic" title="Italic"><span class="onyx-protected-icon" aria-hidden="true">𝑰</span></button>
                <button class="chat-tool-button labeled-tool" data-image-button="${server}" data-capability-state="pending" type="button" aria-label="Generate image, checking availability" title="Generate image: checking backend capability…" aria-disabled="true" disabled><span class="onyx-protected-emoji" aria-hidden="true">🏞️</span> <span>Image</span></button>
                <button class="chat-tool-button labeled-tool" data-memory-button="${server}" type="button" aria-label="Durable memory ${server==='health'?'off':'on'}" title="Durable memory ${server==='health'?'off':'on'}" aria-pressed="${server==='health'?'false':'true'}"><span class="onyx-protected-emoji" aria-hidden="true">🧠</span><span class="onyx-protected-icon" aria-hidden="true">${server==='health'?'×':'✓'}</span> <span>Memory</span></button>
                <button class="chat-tool-button labeled-tool" data-web-button="${server}" data-capability-state="pending" type="button" aria-label="Use web research, checking availability" title="Use web research: checking backend capability…" aria-pressed="false" aria-disabled="true" disabled><span class="onyx-protected-emoji" aria-hidden="true">🌐</span> <span>Web</span></button>
              </div>
              <form class="chat-compose onyx-chat-form" data-chat-form="${server}" data-memory-policy="${server==='health'?'off':'on'}"><textarea class="chat-input bottom-drag-textarea" data-chat-input="${server}" rows="4" placeholder="Message #${server}…" aria-label="Message Onyx in ${escapeHtml(label)}"></textarea><input type="file" data-file-input="${server}" multiple hidden><button class="chat-button send-button" type="submit">Send</button><button class="chat-button stop-button" data-stop-button="${server}" type="button" aria-label="Stop current request" hidden disabled>Stop</button></form>
              <div class="chat-output-hint">Replies, generated images, files, citations, and other outputs appear in this channel above.</div>
            </main>
          </section>
        </div>
      </section>
    </div>`}

  for(const pane of panes){const server=pane.dataset.pane;if(SERVERS[server])pane.innerHTML=paneTemplate(server)}

  function renderHistory(server){const d=state.servers[server],host=widget.querySelector(`[data-history-list="${server}"]`);if(!host)return;const q=d.search.trim().toLowerCase();const filtered=d.threads.filter(t=>!q||String(t.title||'').toLowerCase().includes(q)||t.messages.some(m=>String(m.content||'').toLowerCase().includes(q)));const rows=[...filtered].sort((a,b)=>Number(Boolean(b.pinned))-Number(Boolean(a.pinned))||new Date(b.updatedAt||0)-new Date(a.updatedAt||0)).slice(0,120);const count=widget.querySelector(`[data-channel-count="${server}"]`);if(count)count.textContent=`${d.threads.length} channel${d.threads.length===1?'':'s'}`;host.innerHTML=rows.length?rows.map(t=>`<div class="history-item channel-item${t.threadId===d.currentThreadId?' is-active':''}${t.pinned?' is-pinned':''}" data-history-item="${escapeHtml(t.threadId)}" role="listitem"><button class="history-open channel-open" data-open-thread="${escapeHtml(t.threadId)}" data-thread-server="${server}" type="button" aria-current="${t.threadId===d.currentThreadId?'page':'false'}"><span class="channel-hash" aria-hidden="true">#</span><span class="channel-copy"><span class="history-name">${escapeHtml(t.title||'new-chat')}</span><span class="history-time">${escapeHtml(compactTime(t.updatedAt))}</span></span></button><button class="history-icon channel-action" data-rename-thread="${escapeHtml(t.threadId)}" data-thread-server="${server}" type="button" aria-label="Rename channel" title="Rename channel"><span class="onyx-protected-icon" aria-hidden="true">✎</span></button><button class="history-icon channel-action" data-save-thread="${escapeHtml(t.threadId)}" data-thread-server="${server}" type="button" aria-label="Save channel transcript" title="Save channel transcript"><span class="onyx-protected-emoji" aria-hidden="true">💾</span></button><button class="history-icon channel-action" data-pin-thread="${escapeHtml(t.threadId)}" data-thread-server="${server}" type="button" aria-label="Pin channel" title="Pin channel" aria-pressed="${Boolean(t.pinned)}"><span class="onyx-protected-emoji" aria-hidden="true">📌</span></button><button class="history-icon channel-action" data-delete-thread="${escapeHtml(t.threadId)}" data-thread-server="${server}" type="button" aria-label="Delete local channel" title="Delete local channel"><span class="onyx-protected-emoji" aria-hidden="true">🗑️</span></button></div>`).join(''):`<p class="channel-empty">No channels yet. Choose <strong>+ New Channel</strong> to start one.</p>`}
  function renderHeader(server){const t=currentThread(server,false),h=widget.querySelector(`[data-chat-heading="${server}"]`),p=widget.querySelector(`[data-pin-current="${server}"]`);if(h)h.textContent=t?.title||'';if(p)p.setAttribute('aria-pressed',String(Boolean(t?.pinned)))}
  function renderAllHistory(){for(const s of Object.keys(SERVERS)){renderHistory(s);renderHeader(s)}}
  function lineByMessageId(server,id){return widget.querySelector(`[data-chat-log="${server}"] [data-onyx-message-id="${cssEscape(String(id))}"]`)}
  function decorateOnyxLine(server,message,line){if(!line||message.role!=='assistant'||line.querySelector('.message-tools'))return;const tools=document.createElement('div');tools.className='message-tools';for(const r of REACTIONS){const b=document.createElement('button');b.type='button';b.className='reaction-button';b.dataset.localReaction=r.id;b.dataset.messageId=message.id;b.dataset.threadServer=server;b.title=r.label;b.setAttribute('aria-label',r.label);b.setAttribute('aria-pressed',String(Boolean(message.reactions?.[r.id])));const glyph=document.createElement('span');glyph.className='onyx-protected-emoji';glyph.setAttribute('aria-hidden','true');glyph.textContent=r.glyph;b.appendChild(glyph);tools.appendChild(b)}const pin=document.createElement('button');pin.type='button';pin.className='message-pin';pin.dataset.localMessagePin=message.id;pin.dataset.threadServer=server;pin.title='Pin response';pin.setAttribute('aria-label','Pin response');pin.setAttribute('aria-pressed',String(Boolean(message.pinned)));const glyph=document.createElement('span');glyph.className='onyx-protected-emoji';glyph.setAttribute('aria-hidden','true');glyph.textContent='📌';pin.appendChild(glyph);tools.appendChild(pin);line.appendChild(tools)}
  function syncDecorations(server){const t=currentThread(server,false);if(!t)return;for(const m of t.messages)decorateOnyxLine(server,m,lineByMessageId(server,m.id))}
  function activateVisualTab(tabName,focus=false){if(!TABS[tabName])return;state.activeTab=tabName;if(SERVERS[tabName])state.activeServer=tabName;for(const tab of tabs){const on=tab.dataset.tab===tabName;tab.classList.toggle('is-active',on);tab.setAttribute('aria-selected',String(on));tab.tabIndex=on?0:-1;if(on&&focus)tab.focus()}for(const pane of panes){const on=pane.dataset.pane===tabName;pane.classList.toggle('is-active',on);pane.hidden=!on}if(SERVERS[tabName]){renderHistory(tabName);renderHeader(tabName);setTimeout(()=>syncDecorations(tabName),0)}positionPanel()}
  function positionPanel(){
    if(widget.classList.contains('is-fullscreen')||widget.classList.contains('tab-fullscreen'))return;
    const rect=orb?.getBoundingClientRect?.();
    if(!rect)return;

    // Mobile keeps the established below-bubble stack. Clear desktop inline
    // positioning when crossing the breakpoint so resizing never strands it.
    if(innerWidth<=680){
      widget.classList.add('panel-right');
      widget.classList.remove('panel-left');
      if(panel){
        panel.style.right='auto';
        panel.style.bottom='auto';
        panel.style.top='';
        if(widget.classList.contains('open')){
          const panelRect=panel.getBoundingClientRect();
          const widgetRect=widget.getBoundingClientRect();
          const panelWidth=panelRect.width||Math.min(innerWidth*.96,560);
          const desiredLeft=Math.max(8,Math.min(Math.max(8,innerWidth-panelWidth-8),rect.left));
          panel.style.left=(desiredLeft-widgetRect.left)+'px';
        }else panel.style.left='';
      }
      return;
    }

    if(panel){panel.style.left='';panel.style.right='';}

    const gap=12;
    const availableRight=Math.max(0,innerWidth-rect.right-gap);
    const availableLeft=Math.max(0,rect.left-gap);
    const preferredWidth=Math.min(920,Math.max(320,innerWidth-rect.width-42));
    const openRight=availableRight>=preferredWidth || availableRight>=availableLeft;
    widget.classList.toggle('panel-right',openRight);
    widget.classList.toggle('panel-left',!openRight);

    // The mockup alignment is center-to-center: Onyx stays beside the module
    // rather than being pinned to its top edge. Clamp the module to the viewport.
    if(panel&&widget.classList.contains('open')){
      const panelRect=panel.getBoundingClientRect();
      const widgetRect=widget.getBoundingClientRect();
      const panelHeight=panelRect.height||Math.min(680,innerHeight*.82);
      const desiredTop=rect.top+(rect.height/2)-(panelHeight/2);
      const clampedTop=Math.max(8,Math.min(Math.max(8,innerHeight-panelHeight-8),desiredTop));
      panel.style.top=(clampedTop-widgetRect.top)+'px';
      panel.style.bottom='auto';
    }
  }


  function startLocalThread(server){if(!SERVERS[server])return;const t=createThread(server,true);window.OnyxVirtualPet?.newChat?.(server,t.threadId);renderHistory(server);renderHeader(server);widget.querySelector(`[data-chat-input="${server}"]`)?.focus();return t}
  function selectThread(server,threadId){if(!SERVERS[server])return;const d=state.servers[server],t=d.threads.find(x=>x.threadId===threadId);if(!t)return;d.currentThreadId=t.threadId;writeThreads();renderHistory(server);renderHeader(server);window.OnyxVirtualPet?.loadThread?.(server,{threadId:t.threadId,messages:t.messages});setTimeout(()=>syncDecorations(server),0)}
  function toggleThreadPin(server,threadId){const d=state.servers[server],t=d.threads.find(x=>x.threadId===threadId);if(!t)return;t.pinned=!t.pinned;t.updatedAt=new Date().toISOString();d.threads.sort((a,b)=>Number(b.pinned)-Number(a.pinned)||String(b.updatedAt).localeCompare(String(a.updatedAt)));writeThreads();renderHistory(server);renderHeader(server)}
  function renameThread(server,threadId){const d=state.servers[server],t=d?.threads.find(x=>x.threadId===threadId);if(!t)return false;const next=window.prompt('Rename this Onyx channel',t.title||'new-chat');if(next===null)return false;const title=String(next).replace(/\s+/g,' ').trim().slice(0,80);if(!title){toast('Channel name was not changed.');return false}t.title=title;t.updatedAt=new Date().toISOString();writeThreads();renderHistory(server);renderHeader(server);toast('Channel renamed');return true}
  function deleteThread(server,threadId){const d=state.servers[server],t=d?.threads.find(x=>x.threadId===threadId);if(!t)return false;if(!window.confirm(`Delete channel “#${t.title||'new-chat'}” from the local ${SERVERS[server]} server on this browser? This does not delete account/backend history.`))return false;const wasCurrent=d.currentThreadId===threadId;d.threads=d.threads.filter(x=>x.threadId!==threadId);if(wasCurrent)d.currentThreadId=d.threads[0]?.threadId||'';writeThreads();renderHistory(server);renderHeader(server);if(wasCurrent){const next=d.threads.find(x=>x.threadId===d.currentThreadId);if(next)window.OnyxVirtualPet?.loadThread?.(server,{threadId:next.threadId,messages:next.messages});else startLocalThread(server)}toast('Local channel deleted');return true}
  function findMessage(server,id){const t=currentThread(server,false);return t?.messages.find(m=>m.id===id)||null}
  function lastUserMessage(server){const t=currentThread(server,false);return [...(t?.messages||[])].reverse().find(m=>m.role==='user'&&String(m.content||'').trim())||null}
  function laneBusy(server){try{return (window.OnyxVirtualPet?.getState?.().busyTabs||[]).includes(server)}catch(_){return false}}
  function retryLastPrompt(server){if(!SERVERS[server])return false;if(laneBusy(server)){toast('That chat is still working. Stop it first or wait for it to finish.');return false}const m=lastUserMessage(server);if(!m){toast('There is no earlier prompt to retry.');return false}const t=currentThread(server,true);if(t&&window.OnyxVirtualPet?.getThread?.(server)!==t.threadId)window.OnyxVirtualPet?.setThread?.(server,t.threadId);window.OnyxVirtualPet?.chat?.(m.content,server,{memoryPolicy:composeState[server]?.remember?'on':'off'});setComposeWeb(server,false);toast('Retrying the last prompt.');return true}
  function editLastPrompt(server){if(!SERVERS[server])return false;const m=lastUserMessage(server),input=inputEl(server);if(!m||!input){toast('There is no earlier prompt to edit.');return false}if(input.value.trim()&&!window.confirm('Replace the current draft with the last prompt?'))return false;input.value=m.content;input.focus();try{input.setSelectionRange(0,input.value.length)}catch(_){}toast('Edit the prompt, then press Send.');return true}
  function toggleMessagePin(server,id){const m=findMessage(server,id);if(!m)return;m.pinned=!m.pinned;writeThreads();const line=lineByMessageId(server,id),b=line?.querySelector(`[data-local-message-pin="${cssEscape(String(id))}"]`);b?.setAttribute('aria-pressed',String(m.pinned));line?.classList.toggle('is-pinned',m.pinned)}
  function toggleReaction(server,id,reaction){const m=findMessage(server,id);if(!m||!REACTIONS.some(x=>x.id===reaction))return;m.reactions=m.reactions||{};m.reactions[reaction]=!m.reactions[reaction];writeThreads();const line=lineByMessageId(server,id),b=line?.querySelector(`[data-local-reaction="${reaction}"]`);b?.setAttribute('aria-pressed',String(Boolean(m.reactions[reaction])));window.dispatchEvent(new CustomEvent('onyx:response-feedback',{detail:{profileKey:profileKey(),server,threadId:currentThread(server,false)?.threadId||'',messageId:id,reaction,active:Boolean(m.reactions[reaction])}}))}
  async function saveThread(server,threadId){const t=state.servers[server]?.threads.find(x=>x.threadId===threadId);if(!t)return;const lines=[];lines.push(`Onyx — ${SERVERS[server]}`);lines.push('');for(const m of t.messages){if(!m.content)continue;lines.push(`${m.role==='user'?'You':m.role==='assistant'?'Onyx':'System'}:`);lines.push(m.content);lines.push('')}const fileName=cleanName(t.title)+'.txt';try{if(!window.OnyxBackendClient?.fileUpload)throw new Error('Save unavailable');const file=new File([lines.join('\n')],fileName,{type:'text/plain'});const r=await window.OnyxBackendClient.fileUpload(file,{kind:'onyx-chat-transcript',purpose:`Saved Onyx ${server} chat`});const art=window.OnyxBackendClient.extractArtifacts?.(r)?.[0];t.savedFileId=String(art?.fileId||r?.driveFileId||r?.fileId||'');t.updatedAt=new Date().toISOString();writeThreads();toast('Saved')}catch(e){toast(window.OnyxBackendClient?.publicError?.(e)||'Could not save chat')}}

  function captureChatLine(event){const d=event.detail||{},server=SERVERS[d.tab]?d.tab:'';if(!server||d.restore)return;let t=currentThread(server,true);const role=d.role==='user'?'user':d.role==='assistant'||d.role==='onyx'?'assistant':'system';const id=String(d.messageId||uid());if(t.messages.some(m=>m.id===id))return;const m={id,role,content:String(d.content||'').slice(0,32000),createdAt:new Date().toISOString(),pinned:false,reactions:{},artifacts:Array.isArray(d.artifacts)?d.artifacts.slice(0,16):[],citations:Array.isArray(d.citations)?d.citations.slice(0,16):[]};t.messages.push(m);t.messages=t.messages.slice(-240);t.title=inferTitle(t);t.updatedAt=new Date().toISOString();writeThreads();renderHistory(server);renderHeader(server);if(role==='assistant')decorateOnyxLine(server,m,d.element||lineByMessageId(server,id))}

  window.OnyxSupportPreferences=Object.freeze({get:()=>({...supportPrefs}),reload:()=>({...loadSupportPrefs()})});
  loadRetentionPrefs();
  readThreads();
  loadMemoryPrefs();
  loadSupportPrefs();
  function inputEl(server){return widget.querySelector(`[data-chat-input="${server}"]`)}
  function formEl(server){return widget.querySelector(`[data-chat-form="${server}"]`)}
  function promptById(server,id){return (PROMPTS[server]||[]).find(x=>x.id===id)||null}
  function setComposeWeb(server,on){if(!SERVERS[server])return;composeState[server].forceWeb=Boolean(on);const button=widget.querySelector(`[data-web-button="${server}"]`),form=formEl(server);button?.classList.toggle('is-active',Boolean(on));button?.setAttribute('aria-pressed',String(Boolean(on)));if(form)form.dataset.forceWeb=Boolean(on)?'true':'false'}
  function insertAtCursor(input,text,selectStartOffset=0,selectEndOffset=0){if(!input)return;const start=input.selectionStart??input.value.length,end=input.selectionEnd??input.value.length,before=input.value.slice(0,start),selected=input.value.slice(start,end),after=input.value.slice(end);input.value=before+text+after;const anchor=before.length+Math.max(0,Math.min(text.length,text.length-selectEndOffset));const focusPos=before.length+Math.max(0,Math.min(text.length,selectStartOffset));input.focus();try{input.setSelectionRange(focusPos,anchor)}catch(_){}}
  function wrapSelection(server,before,after,placeholder){const input=inputEl(server);if(!input)return;const start=input.selectionStart??0,end=input.selectionEnd??0,selected=input.value.slice(start,end)||placeholder,built=before+selected+after;const next=input.value.slice(0,start)+built+input.value.slice(end);input.value=next;const selStart=start+before.length,selEnd=selStart+selected.length;input.focus();try{input.setSelectionRange(selStart,selEnd)}catch(_){}}
  function addLinkMarkup(server){const input=inputEl(server);if(!input)return;const start=input.selectionStart??0,end=input.selectionEnd??0,selected=input.value.slice(start,end).trim()||'link text';const url=window.prompt('Paste a link','https://');if(!url)return;const built=`[${selected}](${String(url).trim()})`;input.value=input.value.slice(0,start)+built+input.value.slice(end);input.focus();try{input.setSelectionRange(start+built.length,start+built.length)}catch(_){}}
  function downloadBlob(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=cleanName(name||'onyx-download');document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(url);a.remove()},1500)}
  function artifactBlob(artifact){if(!artifact)return null;if(artifact.content!=null)return new Blob([String(artifact.content)],{type:artifact.mimeType||'text/plain'});if(typeof artifact.base64==='string'&& artifact.base64){try{let encoded=artifact.base64,mime=artifact.mimeType||'application/octet-stream';const match=encoded.match(/^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,(.*)$/is);if(match){mime=match[1]||mime;encoded=match[2]}const raw=atob(encoded.replace(/\s+/g,'')),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);return new Blob([bytes],{type:mime})}catch(_){return null}}return null}
  function exportThreadTranscript(server,thread){if(!thread)return;const lines=[`Onyx — ${SERVERS[server]}`,''];for(const m of thread.messages||[]){if(!m.content)continue;lines.push((m.role==='user'?'You':m.role==='assistant'?'Onyx':'System')+':');lines.push(m.content);lines.push('')}downloadBlob(new Blob([lines.join('\n')],{type:'text/plain'}),cleanName(thread.title||SERVERS[server]+' chat')+'.txt')}
  function downloadLatest(server){const thread=currentThread(server,false);if(!thread){toast('Nothing to download.');return}for(const m of [...(thread.messages||[])].reverse()){for(const art of [...(m.artifacts||[])].reverse()){const blob=artifactBlob(art);if(blob){downloadBlob(blob,art.name||'onyx-download');toast('Downloaded');return}if(art.url){const url=safeHttpUrl(art.url);if(!url)continue;const a=document.createElement('a');a.href=url;a.download=cleanName(art.name||'onyx-download');a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();setTimeout(()=>a.remove(),1000);toast('Opened download');return}}
    }
    exportThreadTranscript(server,thread);toast('Downloaded transcript')
  }
  function sendPrompt(server,prompt){if(!prompt||!window.OnyxVirtualPet?.chat)return;const thread=currentThread(server,true);if(thread&&window.OnyxVirtualPet?.getThread?.(server)!==thread.threadId)window.OnyxVirtualPet?.setThread?.(server,thread.threadId);window.OnyxVirtualPet.chat(prompt.text,server,{forceWeb:Boolean(prompt.forceWeb),memoryPolicy:composeState[server]?.remember?'on':'off'});setComposeWeb(server,false)}
  renderAllHistory();
  function applyBackendCapabilities(contract){
    const resolved=Boolean(contract&&typeof contract==='object'&&Object.keys(contract).length),fileTypes=resolved&&Array.isArray(contract.fileParsing)?contract.fileParsing:[];
    const granted={web:resolved&&contract.webResearch===true,image:resolved&&contract.imageGeneration===true,files:resolved&&contract.profileScopedDriveFiles===true&&fileTypes.length>0,archives:resolved&&contract.archiveCreation===true};
    const stateFor=allowed=>!resolved?'pending':allowed?'available':'unavailable';
    const configure=(selector,allowed,label)=>widget.querySelectorAll(selector).forEach(b=>{const state=stateFor(allowed);b.disabled=!allowed;b.setAttribute('aria-disabled',String(!allowed));b.dataset.capabilityState=state;b.title=state==='pending'?`${label}: checking backend capability…`:state==='available'?label:`${label}: unavailable`;b.setAttribute('aria-label',state==='pending'?`${label}, checking availability`:state==='available'?label:`${label}, unavailable`)});
    configure('[data-web-button]',granted.web,'Use web research');
    configure('[data-image-button]',granted.image,'Generate image');
    configure('[data-attach-button]',granted.files,'Upload file');
    widget.dataset.onyxCapabilities=resolved?'resolved':'pending';widget.dataset.onyxWeb=stateFor(granted.web);widget.dataset.onyxImages=stateFor(granted.image);widget.dataset.onyxFiles=stateFor(granted.files);widget.dataset.onyxArchives=stateFor(granted.archives);
  }
  applyBackendCapabilities(window.OnyxBackendClient?.snapshot?.().capabilityContract||null);
  /* ---------------------------------------------------------------
     MODULE-LOCAL DESIGN RUNTIME
     Inspired by the existing OurSpace design-system preset/variable
     approach, but intentionally scoped to the Onyx widget element.
  ---------------------------------------------------------------- */
  const MODULE_DESIGN_DEFAULTS = Object.freeze({
    panelBg:'#C7FFFF',
    panelText:'#0B0C0F',
    panelBorder:'#AA3F00',
    headerBg:'#712A00',
    tabBg:'#FFF600',
    surface1:'#7AFFFF',
    surface2:'#FFFA7A',
    surface3:'#C7FFFF',
    railBg:'#7AFFFF',
    chatBg:'#C7FFFF',
    userMessageBg:'#FFFA7A',
    onyxMessageBg:'#FDFDFE',
    inputBg:'#FDFDFE',
    inputText:'#0B0C0F',
    buttonBg:'#EC5800',
    buttonText:'#0B0C0F',
    buttonHover:'#FFF600',
    activeBg:'#712A00',
    activeText:'#F8F8F5',
    linkText:'#712A00',
    linkHover:'#AA3F00',
    muted:'#30343A',
    focus:'#0B0C0F',
    scrollTrack:'#7AFFFF',
    scrollThumb:'#EC5800',
    bubbleBorder:'#FFF600'
  });
  const MODULE_DESIGN_DARK_DEFAULTS = Object.freeze({
    panelBg:'#421900',
    panelText:'#F8F8F5',
    panelBorder:'#FFF600',
    headerBg:'#712A00',
    tabBg:'#EC5800',
    surface1:'#712A00',
    surface2:'#914015',
    surface3:'#602608',
    railBg:'#421900',
    chatBg:'#421900',
    userMessageBg:'#712A00',
    onyxMessageBg:'#602608',
    inputBg:'#FDFDFE',
    inputText:'#0B0C0F',
    buttonBg:'#FFF600',
    buttonText:'#0B0C0F',
    buttonHover:'#FFFA7A',
    activeBg:'#EC5800',
    activeText:'#0B0C0F',
    linkText:'#FFF600',
    linkHover:'#7AFFFF',
    muted:'#F8E3CA',
    focus:'#FFF600',
    scrollTrack:'#421900',
    scrollThumb:'#EC5800',
    bubbleBorder:'#FFF600'
  });

  // Recognize unchanged Pass-4 blue defaults; do not overwrite user-customized colors.
  const MODULE_DESIGN_PASS4_LIGHT = Object.freeze({
    panelBg:'#F4FBFB',
    panelText:'#102A30',
    panelBorder:'#397078',
    headerBg:'#D0EFF0',
    tabBg:'#D9F1F1',
    surface1:'#E6F1F0',
    surface2:'#C8E7E8',
    surface3:'#FFFFFF',
    railBg:'#D5EAEB',
    chatBg:'#F4FBFB',
    userMessageBg:'#D9F1F1',
    onyxMessageBg:'#FFFFFF',
    inputBg:'#FFFFFF',
    inputText:'#102A30',
    buttonBg:'#B6ECEE',
    buttonText:'#102A30',
    buttonHover:'#97FBFF',
    activeBg:'#006C78',
    activeText:'#FFFFFF',
    linkText:'#006C78',
    linkHover:'#A55712',
    muted:'#36565C',
    focus:'#006C78',
    scrollTrack:'#E6F1F0',
    scrollThumb:'#397078',
    bubbleBorder:'#00DFE8'
  });
  const MODULE_DESIGN_PASS4_DARK = Object.freeze({
    panelBg:'#071014',
    panelText:'#F4FFFF',
    panelBorder:'#397078',
    headerBg:'#10252B',
    tabBg:'#173A40',
    surface1:'#10252B',
    surface2:'#1C4046',
    surface3:'#183238',
    railBg:'#0B1C20',
    chatBg:'#071014',
    userMessageBg:'#173A40',
    onyxMessageBg:'#10252B',
    inputBg:'#0D252B',
    inputText:'#F4FFFF',
    buttonBg:'#1B5861',
    buttonText:'#F4FFFF',
    buttonHover:'#006C78',
    activeBg:'#00DFE8',
    activeText:'#102A30',
    linkText:'#97FBFF',
    linkHover:'#FFCC94',
    muted:'#B9CDD0',
    focus:'#97FBFF',
    scrollTrack:'#10252B',
    scrollThumb:'#397078',
    bubbleBorder:'#00DFE8'
  });
  const MODULE_THEME_MODES = Object.freeze(['auto','light','dark','custom']);
  const MODULE_LAYOUT_DEFAULTS = Object.freeze({
    textSize:'small',
    density:'compact',
    rounding:'rounded'
  });
  const MODULE_TEXT_SIZES = Object.freeze(['small','standard','large','xlarge']);
  const MODULE_DENSITIES = Object.freeze(['compact','comfortable','spacious']);
  const MODULE_ROUNDING = Object.freeze(['square','slight','rounded']);
  const MODULE_DESIGN_EXPORT_SCHEMA='ourspace.onyx.module.design.export.v1';
  const MODULE_DESIGN_SCOPE='onyx-four-tab-module-only';

  const MODULE_DESIGN_FIELDS = Object.freeze([
    {
      label:'Module Shell + Headers',
      open:true,
      fields:[
        ['panelBg','Module background','Base surface shared by all four Onyx tabs.'],
        ['panelText','Main text','Primary readable text throughout the four-tab module.'],
        ['panelBorder','Module borders','Structural lines throughout the four-tab module.'],
        ['headerBg','Headers / title bars','Top bars, pane headers, server headers and section headings.'],
        ['tabBg','Unselected tabs','Background for the four primary tab buttons before selection.']
      ]
    },
    {
      label:'Chat + Channel Surfaces',
      open:true,
      fields:[
        ['railBg','Channel rail','Channel lists, history rails and related side surfaces.'],
        ['chatBg','Conversation canvas','Large message/output area used by Virtual & Health, Leisure and Work.'],
        ['userMessageBg','Your message surface','Background used for user-authored chat messages.'],
        ['onyxMessageBg','Onyx response surface','Background used for Onyx responses and generated-output cards.'],
        ['surface1','Quiet surface','Secondary rails, utility rows and low-emphasis containers.'],
        ['surface2','Secondary surface','Secondary cards and control backing.'],
        ['surface3','Primary readable surface','General cards and readable content surfaces across all tabs.']
      ]
    },
    {
      label:'Inputs + Actions',
      open:true,
      fields:[
        ['inputBg','Inputs / textareas','Message composer, search boxes, selects and editable fields.'],
        ['inputText','Input text','Text inside editable fields and dropdowns.'],
        ['buttonBg','Button background','Normal button surfaces. Icons and emoji inside those buttons are protected.'],
        ['buttonText','Button text','Normal textual button labels only; protected icons and emoji keep their native appearance.'],
        ['buttonHover','Button hover / pressed','Hover surface for normal buttons.'],
        ['activeBg','Selected background','Active tab, selected channel and pressed controls.'],
        ['activeText','Selected text','Text shown on selected/active surfaces.'],
        ['linkText','Links','Normal links inside all four tabs.'],
        ['linkHover','Link hover','Hovered and active links.']
      ]
    },
    {
      label:'Readability + Scrolling',
      open:false,
      fields:[
        ['muted','Muted text','Timestamps, supporting labels and metadata.'],
        ['focus','Focus outline','Keyboard focus and accessibility outline.'],
        ['scrollTrack','Scrollbar track','Independent chat, channel and Design-tab scrolling tracks.'],
        ['scrollThumb','Scrollbar thumb','Independent chat, channel and Design-tab scrolling thumbs.']
      ]
    },
    {
      label:'Onyx Border Only',
      open:true,
      fields:[
        ['bubbleBorder','Outer Onyx border','Changes only the outer design ring around the 190px bubble. Everything inside the frame—including Onyx, habitat, alert box, reactions, icons and emoji—is permanently protected from Design.']
      ]
    }
  ]);

  const MODULE_DESIGN_STORM_SWATCHES = Object.freeze({
    Custom:'custom',
    'Electric Orange':'#EC5800',
    'Neon Yellow':'#FFF600',
    'Lightning Cyan':'#7AFFFF',
    'Bright Cyan':'#00FFFF',
    'Iced Cyan':'#C7FFFF',
    'Sunlight':'#FFFA7A',
    'Rust Border':'#AA3F00',
    'Deep Copper Header':'#712A00',
    'Copper Shadow':'#F07D38',
    'Night Brown':'#421900',
    'Cream Text':'#F8F8F5',
    'Deep Ink':'#0B0C0F'
  });

  const MODULE_DESIGN_PRESET_COUNT = 6;
  let moduleDesignState = {...MODULE_DESIGN_DEFAULTS};
  let moduleLayoutState = {...MODULE_LAYOUT_DEFAULTS};
  let moduleThemeMode = 'auto';
  let moduleDesignPresets = [];
  let moduleDesignActivePreset = 0;

  function moduleDesignProfileKey() {
    return String(state.config.profileKey || 'shared').toLowerCase().replace(/[^a-z0-9_-]+/g,'-');
  }

  function moduleDesignStorageKey() {
    return `ourspace.onyx.module.design.v1.${moduleDesignProfileKey()}`;
  }

  function moduleDesignPresetStorageKey() {
    return `ourspace.onyx.module.design.presets.v1.${moduleDesignProfileKey()}`;
  }

  function moduleDesignSafeColor(value, fallback) {
    const v = String(value || '').trim();
    return /^#[0-9a-f]{6}$/i.test(v) ? v.toUpperCase() : fallback;
  }

  function moduleDesignNormalize(input) {
    const source = input && typeof input === 'object' ? input : {};
    const next = {};
    Object.entries(MODULE_DESIGN_DEFAULTS).forEach(([key, fallback]) => {
      next[key] = moduleDesignSafeColor(source[key], fallback);
    });
    return next;
  }

  function moduleLayoutNormalize(input) {
    const source=input&&typeof input==='object'?input:{};
    const textSize=String(source.textSize||'').toLowerCase();
    const density=String(source.density||'').toLowerCase();
    const rounding=String(source.rounding||'').toLowerCase();
    return {
      textSize:MODULE_TEXT_SIZES.includes(textSize)?textSize:MODULE_LAYOUT_DEFAULTS.textSize,
      density:MODULE_DENSITIES.includes(density)?density:MODULE_LAYOUT_DEFAULTS.density,
      rounding:MODULE_ROUNDING.includes(rounding)?rounding:MODULE_LAYOUT_DEFAULTS.rounding
    };
  }

  function normalizeThemeMode(value) {
    const mode=String(value||'').toLowerCase();
    return MODULE_THEME_MODES.includes(mode)?mode:'auto';
  }

  function palettesEqual(a,b) {
    return Object.keys(MODULE_DESIGN_DEFAULTS).every(key=>String(a?.[key]||'').toUpperCase()===String(b?.[key]||'').toUpperCase());
  }

  function systemPrefersDark() {
    try{return Boolean(window.matchMedia?.('(prefers-color-scheme: dark)').matches)}catch(_){return false}
  }

  function effectiveModulePalette(mode=moduleThemeMode) {
    if(mode==='dark')return {...MODULE_DESIGN_DARK_DEFAULTS};
    if(mode==='light')return {...MODULE_DESIGN_DEFAULTS};
    if(mode==='auto')return {...(systemPrefersDark()?MODULE_DESIGN_DARK_DEFAULTS:MODULE_DESIGN_DEFAULTS)};
    return moduleDesignNormalize(moduleDesignState);
  }

  const LEGACY_MONOCHROME = new Set(['#000000','#242424','#494949','#6D6D6D','#929292','#B6B6B6','#DBDBDB','#FFFFFF']);
  function upgradeLegacyMonochromePalette(palette){
    if (!palette || typeof palette !== 'object') return null;
    if(palettesEqual(palette,MODULE_DESIGN_PASS4_LIGHT))return {...MODULE_DESIGN_DEFAULTS};
    if(palettesEqual(palette,MODULE_DESIGN_PASS4_DARK))return {...MODULE_DESIGN_DARK_DEFAULTS};
    const values=Object.values(palette).filter(v=>/^#[0-9a-f]{6}$/i.test(String(v)));
    if(values.length<20 || !values.every(v=>LEGACY_MONOCHROME.has(v.toUpperCase()))) return null;
    return {...(((palette.panelBg||'').toUpperCase()==='#000000')?MODULE_DESIGN_DARK_DEFAULTS:MODULE_DESIGN_DEFAULTS)};
  }

  function moduleDesignRead() {
    try {
      const raw = localStorage.getItem(moduleDesignStorageKey());
      if(!raw){moduleThemeMode='auto';moduleDesignState={...MODULE_DESIGN_DEFAULTS};return}
      const parsed=JSON.parse(raw);
      if(parsed&&typeof parsed==='object'&&parsed.state){
        moduleThemeMode=normalizeThemeMode(parsed.themeMode);
        moduleDesignState=moduleDesignNormalize(upgradeLegacyMonochromePalette(parsed.state)||parsed.state);
        moduleLayoutState=moduleLayoutNormalize(parsed.layout);
      }else{
        moduleDesignState=moduleDesignNormalize(upgradeLegacyMonochromePalette(parsed)||parsed);
        moduleLayoutState={...MODULE_LAYOUT_DEFAULTS};
        /* v1 wrote light defaults even when the user never customized them. Treat that exact legacy payload as Auto. */
        moduleThemeMode=parsed?.themeMode?normalizeThemeMode(parsed.themeMode):(palettesEqual(moduleDesignState,MODULE_DESIGN_DEFAULTS)?'auto':'custom');
      }
    } catch (_) {
      moduleThemeMode='auto';
      moduleDesignState = {...MODULE_DESIGN_DEFAULTS};
      moduleLayoutState = {...MODULE_LAYOUT_DEFAULTS};
    }
  }

  function moduleDesignWrite() {
    try {
      localStorage.setItem(moduleDesignStorageKey(), JSON.stringify({version:3,scope:MODULE_DESIGN_SCOPE,themeMode:moduleThemeMode,state:moduleDesignState,layout:moduleLayoutState}));
    } catch (_) { storageWarning('module design'); }
  }

  function moduleDesignReadPresets() {
    let base = Array.from({length:MODULE_DESIGN_PRESET_COUNT},(_,i) => ({
      name:`Preset ${i + 1}`,
      state:null,
      layout:null,
      themeMode:'custom'
    }));

    try {
      const raw = JSON.parse(localStorage.getItem(moduleDesignPresetStorageKey()) || 'null');
      if (Array.isArray(raw)) {
        base = base.map((slot,index) => {
          const incoming = raw[index] || {};
          return {
            name:String(incoming.name || slot.name).slice(0,40),
            state:incoming.state ? moduleDesignNormalize(upgradeLegacyMonochromePalette(incoming.state)||incoming.state) : null,
            layout:incoming.layout ? moduleLayoutNormalize(incoming.layout) : null,
            themeMode:normalizeThemeMode(incoming.themeMode||'custom')
          };
        });
      }
    } catch (_) {}

    moduleDesignPresets = base;
  }

  function moduleDesignWritePresets() {
    try {
      localStorage.setItem(moduleDesignPresetStorageKey(), JSON.stringify(moduleDesignPresets));
    } catch (_) { storageWarning('design presets'); }
  }

  function hexRgb(hex) {
    const value=moduleDesignSafeColor(hex,'');
    if(!value)return null;
    return [1,3,5].map(i=>parseInt(value.slice(i,i+2),16)/255);
  }

  function relativeLuminance(hex) {
    const rgb=hexRgb(hex);if(!rgb)return 0;
    const linear=rgb.map(v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4));
    return .2126*linear[0]+.7152*linear[1]+.0722*linear[2];
  }

  function contrastRatio(a,b) {
    const l1=relativeLuminance(a),l2=relativeLuminance(b),hi=Math.max(l1,l2),lo=Math.min(l1,l2);
    return (hi+.05)/(lo+.05);
  }

  function moduleDesignContrastReport(palette=effectiveModulePalette()) {
    const tests=[
      ['Main text / module',palette.panelText,palette.panelBg,4.5],
      ['Main text / header',relativeLuminance(palette.headerBg)<0.21?'#F8F8F5':'#0B0C0F',palette.headerBg,4.5],
      ['Main text / rail',palette.panelText,palette.railBg,4.5],
      ['Main text / chat',palette.panelText,palette.chatBg,4.5],
      ['Input text',palette.inputText,palette.inputBg,4.5],
      ['Button text',palette.buttonText,palette.buttonBg,4.5],
      ['Selected text',palette.activeText,palette.activeBg,4.5],
      ['Muted text / module',palette.muted,palette.panelBg,4.5],
      ['Muted text / chat',palette.muted,palette.chatBg,4.5],
      ['Link / chat',palette.linkText,palette.chatBg,4.5],
      ['Focus / module',palette.focus,palette.panelBg,3],
      ['Focus / rail',palette.focus,palette.railBg,3],
      ['Focus / controls',palette.focus,palette.buttonBg,3],
      ['Focus / chat',palette.focus,palette.chatBg,3]
    ].map(([label,fg,bg,min])=>({label,fg,bg,min,ratio:contrastRatio(fg,bg)}));
    const failures=tests.filter(t=>t.ratio+1e-9<t.min);
    return {ok:failures.length===0,tests,failures};
  }

  function renderModuleDesignContrast() {
    const status=widget.querySelector('[data-module-design-contrast-status]');
    if(!status)return;
    const report=moduleDesignContrastReport();
    status.classList.toggle('has-warning',!report.ok);
    status.dataset.contrastOk=String(report.ok);
    status.textContent=report.ok
      ? `Contrast check: passes core text/focus checks (${moduleThemeMode} mode).`
      : `Contrast warning: ${report.failures.map(t=>`${t.label} ${t.ratio.toFixed(2)}:1 (needs ${t.min}:1)`).join('; ')}.`;
  }

  function applyModuleDesign() {
    moduleDesignState = moduleDesignNormalize(moduleDesignState);
    moduleLayoutState = moduleLayoutNormalize(moduleLayoutState);
    moduleThemeMode=normalizeThemeMode(moduleThemeMode);
    const palette=effectiveModulePalette();
    const panelVars = {
      '--panel-bg':palette.panelBg,
      '--panel-text':palette.panelText,
      '--panel-border':palette.panelBorder,
      '--header-bg':palette.headerBg,
      '--header-text':relativeLuminance(palette.headerBg)<0.21?'#F8F8F5':'#0B0C0F',
      '--tab-bg':palette.tabBg,
      '--surface-1':palette.surface1,
      '--surface-2':palette.surface2,
      '--surface-3':palette.surface3,
      '--rail-bg':palette.railBg,
      '--chat-bg':palette.chatBg,
      '--user-message-bg':palette.userMessageBg,
      '--onyx-message-bg':palette.onyxMessageBg,
      '--input-bg':palette.inputBg,
      '--input-text':palette.inputText,
      '--button-bg':palette.buttonBg,
      '--button-text':palette.buttonText,
      '--button-hover':palette.buttonHover,
      '--active-bg':palette.activeBg,
      '--active-text':palette.activeText,
      '--link-text':palette.linkText,
      '--link-hover':palette.linkHover,
      '--muted':palette.muted,
      '--focus':palette.focus,
      '--scroll-track':palette.scrollTrack,
      '--scroll-thumb':palette.scrollThumb
    };

    /* Scope protection: four-tab module colors live on the popout panel only.
       Clean legacy root variables so a saved look cannot recolor Onyx/habitat. */
    Object.keys(panelVars).forEach(key=>widget.style.removeProperty(key));
    widget.style.removeProperty('--bubble-border');
    Object.entries(panelVars).forEach(([key,value]) => panel?.style.setProperty(key,value));
    widget.dataset.moduleDesignCustom=String(moduleThemeMode==='custom');
    /* This is the one deliberate pet-side design hook: the outer border only. */
    widget.style.setProperty('--onyx-border',palette.bubbleBorder);
    if(panel){
      panel.dataset.moduleTextSize=moduleLayoutState.textSize;
      panel.dataset.moduleDensity=moduleLayoutState.density;
      panel.dataset.moduleRounding=moduleLayoutState.rounding;
    }
    widget.dataset.moduleTheme=moduleThemeMode;
    moduleDesignWrite();
    renderModuleDesignContrast();

    widget.dispatchEvent(new CustomEvent('onyx-module-design-change', {
      bubbles:false,
      detail:{scope:MODULE_DESIGN_SCOPE,themeMode:moduleThemeMode,...palette,headerText:relativeLuminance(palette.headerBg)<0.21?'#F8F8F5':'#0B0C0F',layout:{...moduleLayoutState},contrast:moduleDesignContrastReport(palette)}
    }));
  }

  function moduleDesignStormOptions(value) {
    const exact = String(value || '').toUpperCase();
    return Object.entries(MODULE_DESIGN_STORM_SWATCHES).map(([label,color]) => {
      const selected = color !== 'custom' && color.toUpperCase() === exact ? ' selected' : '';
      return `<option value="${color}"${selected}>${escapeHtml(label)}</option>`;
    }).join('');
  }

  function moduleDesignFieldMarkup(key,label,note) {
    const value = effectiveModulePalette()[key];
    return `
      <div class="module-design-row" data-module-design-row="${escapeHtml(key)}">
        <div class="module-design-copy">
          <strong>${escapeHtml(label)}</strong>
          <small>${escapeHtml(note)}</small>
        </div>
        <select data-module-design-swatch="${escapeHtml(key)}" aria-label="${escapeHtml(label)} Lightning Storm swatch">
          ${moduleDesignStormOptions(value)}
        </select>
        <input type="color" data-module-design-color="${escapeHtml(key)}" aria-label="${escapeHtml(label)} color" value="${escapeHtml(value)}">
        <input type="text" data-module-design-hex="${escapeHtml(key)}" aria-label="${escapeHtml(label)} hex value" value="${escapeHtml(value)}" maxlength="7">
      </div>
    `;
  }

  function moduleDesignSwatches(slot) {
    if (!slot?.state) return '';
    return [
      slot.state.panelBg,
      slot.state.surface1,
      slot.state.surface2,
      slot.state.activeBg
    ].map(color => `<i style="--sw:${escapeHtml(color)}"></i>`).join('');
  }

  function renderModuleDesignPresets() {
    const host = widget.querySelector('[data-module-design-presets]');
    const nameInput = widget.querySelector('[data-module-design-preset-name]');
    if (!host) return;

    host.innerHTML = moduleDesignPresets.map((slot,index) => `
      <button
        class="module-design-preset${index === moduleDesignActivePreset ? ' is-selected' : ''}"
        data-module-design-preset-slot="${index}"
        type="button"
      >
        <span>${escapeHtml(slot.name)}</span>
        <span class="module-design-swatches">${moduleDesignSwatches(slot)}</span>
        <small>${slot.state ? `Saved · ${escapeHtml(slot.themeMode||'custom')} · ${escapeHtml(slot.layout?.density||MODULE_LAYOUT_DEFAULTS.density)}` : 'Empty'}</small>
      </button>
    `).join('');

    if (nameInput) {
      nameInput.value = moduleDesignPresets[moduleDesignActivePreset]?.name || `Preset ${moduleDesignActivePreset + 1}`;
    }
  }

  function renderModuleDesignGroups() {
    const host = widget.querySelector('[data-module-design-groups]');
    if (!host) return;

    host.innerHTML = MODULE_DESIGN_FIELDS.map(group => `
      <details class="module-design-section"${group.open ? ' open' : ''}>
        <summary>${escapeHtml(group.label)}</summary>
        <div class="module-design-grid">
          ${group.fields.map(([key,label,note]) => moduleDesignFieldMarkup(key,label,note)).join('')}
        </div>
      </details>
    `).join('');
  }

  function renderModuleDesign() {
    const theme=widget.querySelector('[data-module-theme-mode]');
    if(theme)theme.value=moduleThemeMode;
    const textSize=widget.querySelector('[data-module-text-size]');
    const density=widget.querySelector('[data-module-density]');
    const rounding=widget.querySelector('[data-module-rounding]');
    if(textSize)textSize.value=moduleLayoutState.textSize;
    if(density)density.value=moduleLayoutState.density;
    if(rounding)rounding.value=moduleLayoutState.rounding;
    renderModuleDesignPresets();
    renderModuleDesignGroups();
    renderModuleDesignContrast();
  }

  function moduleDesignStatus(message) {
    const status = widget.querySelector('[data-module-design-status]');
    if (!status) return;
    status.textContent = String(message || '');
  }

  function moduleDesignSetField(key,value) {
    if (!(key in MODULE_DESIGN_DEFAULTS)) return;
    if(moduleThemeMode!=='custom')moduleDesignState=effectiveModulePalette();
    moduleThemeMode='custom';
    moduleDesignState[key] = moduleDesignSafeColor(value, moduleDesignState[key]);
    applyModuleDesign();
    renderModuleDesign();
    const report=moduleDesignContrastReport();
    moduleDesignStatus(report.ok?'Module appearance updated.':'Module appearance updated; contrast warning shown below.');
  }

  function moduleLayoutSetField(key,value) {
    if(!(key in MODULE_LAYOUT_DEFAULTS))return;
    const next={...moduleLayoutState,[key]:String(value||'').toLowerCase()};
    moduleLayoutState=moduleLayoutNormalize(next);
    applyModuleDesign();
    renderModuleDesign();
    moduleDesignStatus('Module layout updated across all four tabs. Onyx, the bubble interior, alerts, reactions, icons and emoji were not changed.');
    window.dispatchEvent(new CustomEvent('onyx:design-action',{detail:{action:'layout',scope:MODULE_DESIGN_SCOPE,key,value:moduleLayoutState[key]}}));
  }

  function moduleDesignExportPayload(){
    return {
      schema:MODULE_DESIGN_EXPORT_SCHEMA,
      version:1,
      scope:MODULE_DESIGN_SCOPE,
      exportedAt:new Date().toISOString(),
      themeMode:moduleThemeMode,
      state:moduleDesignNormalize(moduleDesignState),
      layout:moduleLayoutNormalize(moduleLayoutState),
      presets:moduleDesignPresets.map((slot,index)=>({
        name:String(slot?.name||`Preset ${index+1}`).slice(0,40),
        themeMode:normalizeThemeMode(slot?.themeMode||'custom'),
        state:slot?.state?moduleDesignNormalize(slot.state):null,
        layout:slot?.layout?moduleLayoutNormalize(slot.layout):null
      }))
    };
  }

  function moduleDesignExport(){
    const payload=moduleDesignExportPayload();
    downloadBlob(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),'onyx-module-design.json');
    moduleDesignStatus('Exported the four-tab module design and outer-border role. Bubble-interior artwork, alerts, reactions, icons and emoji are excluded.');
  }

  async function moduleDesignImport(file){
    if(!file)return false;
    try{
      const parsed=JSON.parse(await file.text());
      if(parsed?.schema!==MODULE_DESIGN_EXPORT_SCHEMA||parsed?.scope!==MODULE_DESIGN_SCOPE)throw new Error('Not an Onyx module-only design export.');
      moduleThemeMode=normalizeThemeMode(parsed.themeMode);
      moduleDesignState=moduleDesignNormalize(parsed.state);
      moduleLayoutState=moduleLayoutNormalize(parsed.layout);
      if(Array.isArray(parsed.presets)){
        moduleDesignPresets=Array.from({length:MODULE_DESIGN_PRESET_COUNT},(_,index)=>{
          const incoming=parsed.presets[index]||{};
          return {
            name:String(incoming.name||`Preset ${index+1}`).slice(0,40),
            state:incoming.state?moduleDesignNormalize(incoming.state):null,
            layout:incoming.layout?moduleLayoutNormalize(incoming.layout):null,
            themeMode:normalizeThemeMode(incoming.themeMode||'custom')
          };
        });
        moduleDesignWritePresets();
      }
      applyModuleDesign();
      renderModuleDesign();
      moduleDesignStatus('Imported the four-tab module design and outer-border role. Bubble-interior artwork, alerts, reactions, icons and emoji were left untouched.');
      window.dispatchEvent(new CustomEvent('onyx:design-action',{detail:{action:'import',scope:MODULE_DESIGN_SCOPE}}));
      return true;
    }catch(error){
      moduleDesignStatus(error?.message||'Could not import that design file.');
      return false;
    }
  }

  function moduleDesignLoadForProfile() {
    moduleDesignRead();
    moduleDesignReadPresets();
    applyModuleDesign();
    renderModuleDesign();
    moduleDesignStatus('');
  }

  widget.addEventListener('change', event => {
    const supportCheck=event.target.closest('[data-support-pref-check]');
    if(supportCheck){setSupportPref(supportCheck.dataset.supportPrefCheck,Boolean(supportCheck.checked));return}
    const supportSelect=event.target.closest('[data-support-pref-select]');
    if(supportSelect){setSupportPref(supportSelect.dataset.supportPrefSelect,supportSelect.value);return}
    const importInput=event.target.closest('[data-module-design-import-file]');
    if(importInput){const file=importInput.files?.[0]||null;moduleDesignImport(file).finally(()=>{importInput.value=''});return}
    const textSize=event.target.closest('[data-module-text-size]');
    if(textSize){moduleLayoutSetField('textSize',textSize.value);return}
    const density=event.target.closest('[data-module-density]');
    if(density){moduleLayoutSetField('density',density.value);return}
    const rounding=event.target.closest('[data-module-rounding]');
    if(rounding){moduleLayoutSetField('rounding',rounding.value);return}
    const theme=event.target.closest('[data-module-theme-mode]');
    if(theme){
      const next=normalizeThemeMode(theme.value);
      if(next==='custom'&&moduleThemeMode!=='custom')moduleDesignState=effectiveModulePalette();
      moduleThemeMode=next;
      applyModuleDesign();
      renderModuleDesign();
      moduleDesignStatus(next==='auto'?'Following your operating-system light/dark preference.':`Theme mode set to ${next}.`);
      return;
    }
    const swatch = event.target.closest('[data-module-design-swatch]');
    if (swatch) {
      if (swatch.value !== 'custom') {
        moduleDesignSetField(swatch.dataset.moduleDesignSwatch, swatch.value);
      }
      return;
    }

    const hex = event.target.closest('[data-module-design-hex]');
    if (hex) {
      const key = hex.dataset.moduleDesignHex;
      const value = moduleDesignSafeColor(hex.value, '');
      if (value) moduleDesignSetField(key,value);
      else {
        hex.value = moduleDesignState[key];
        moduleDesignStatus('Use a six-digit hex value such as #00DFE8.');
      }
    }
  });

  widget.addEventListener('input', event => {
    const color = event.target.closest('[data-module-design-color]');
    if (!color) return;
    moduleDesignSetField(color.dataset.moduleDesignColor,color.value);
  });

  widget.addEventListener('click', event => {
    const preset = event.target.closest('[data-module-design-preset-slot]');
    if (preset) {
      moduleDesignActivePreset = Number(preset.dataset.moduleDesignPresetSlot) || 0;
      renderModuleDesignPresets();
      return;
    }

    if (event.target.closest('[data-module-design-preset-apply]')) {
      const slot = moduleDesignPresets[moduleDesignActivePreset];
      if (!slot?.state) {
        moduleDesignStatus('That preset is empty.');
        return;
      }
      moduleDesignState = moduleDesignNormalize(slot.state);
      moduleLayoutState = moduleLayoutNormalize(slot.layout);
      moduleThemeMode=normalizeThemeMode(slot.themeMode||'custom');
      applyModuleDesign();
      renderModuleDesign();
      moduleDesignStatus(`Applied ${slot.name}.`);
      window.dispatchEvent(new CustomEvent('onyx:design-action',{detail:{action:'apply'}}));
      return;
    }

    if (event.target.closest('[data-module-design-preset-save]')) {
      const input = widget.querySelector('[data-module-design-preset-name]');
      const slot = moduleDesignPresets[moduleDesignActivePreset];
      slot.name = String(input?.value || slot.name || `Preset ${moduleDesignActivePreset + 1}`).trim().slice(0,40) || `Preset ${moduleDesignActivePreset + 1}`;
      slot.state = moduleDesignNormalize(effectiveModulePalette());
      slot.layout = moduleLayoutNormalize(moduleLayoutState);
      slot.themeMode=moduleThemeMode;
      moduleDesignWritePresets();
      renderModuleDesignPresets();
      moduleDesignStatus(`Saved ${slot.name}.`);
      window.dispatchEvent(new CustomEvent('onyx:design-action',{detail:{action:'save'}}));
      return;
    }

    if (event.target.closest('[data-module-design-preset-rename]')) {
      const input = widget.querySelector('[data-module-design-preset-name]');
      const slot = moduleDesignPresets[moduleDesignActivePreset];
      slot.name = String(input?.value || '').trim().slice(0,40) || `Preset ${moduleDesignActivePreset + 1}`;
      moduleDesignWritePresets();
      renderModuleDesignPresets();
      moduleDesignStatus('Preset renamed.');
      window.dispatchEvent(new CustomEvent('onyx:design-action',{detail:{action:'save'}}));
      return;
    }

    if (event.target.closest('[data-module-design-preset-clear]')) {
      const slot = moduleDesignPresets[moduleDesignActivePreset];
      slot.state = null;
      slot.layout = null;
      slot.themeMode='custom';
      moduleDesignWritePresets();
      renderModuleDesignPresets();
      moduleDesignStatus('Preset cleared.');
      window.dispatchEvent(new CustomEvent('onyx:design-action',{detail:{action:'edit'}}));
      return;
    }

    if (event.target.closest('[data-module-design-export]')) {
      moduleDesignExport();
      return;
    }

    if (event.target.closest('[data-module-design-import]')) {
      widget.querySelector('[data-module-design-import-file]')?.click();
      return;
    }

    if (event.target.closest('[data-module-design-contrast-repair]')) {
      const current=effectiveModulePalette();
      const dark=relativeLuminance(current.panelBg)<.38;
      const bubble=current.bubbleBorder;
      moduleThemeMode='custom';
      moduleDesignState={...(dark?MODULE_DESIGN_DARK_DEFAULTS:MODULE_DESIGN_DEFAULTS),bubbleBorder:bubble};
      applyModuleDesign();
      renderModuleDesign();
      moduleDesignStatus(`Repaired core text/focus contrast using an accessible ${dark?'dark':'light'} Lightning Storm palette.`);
      window.dispatchEvent(new CustomEvent('onyx:design-action',{detail:{action:'contrast-repair'}}));
      return;
    }

    if (event.target.closest('[data-module-design-reset]')) {
      moduleThemeMode='auto';
      moduleDesignState = {...MODULE_DESIGN_DEFAULTS};
      moduleLayoutState = {...MODULE_LAYOUT_DEFAULTS};
      applyModuleDesign();
      renderModuleDesign();
      moduleDesignStatus('Onyx module design reset to Auto (follows operating-system light/dark mode).');
      window.dispatchEvent(new CustomEvent('onyx:design-action',{detail:{action:'save'}}));
    }
  });

  try{
    const schemeQuery=window.matchMedia?.('(prefers-color-scheme: dark)');
    schemeQuery?.addEventListener?.('change',()=>{if(moduleThemeMode==='auto'){applyModuleDesign();renderModuleDesign();}});
  }catch(_){}
  moduleDesignLoadForProfile();

  /* ------------------------------------------------------------------------
     Bottom-drag resizing
     Reuses the supplied bottom-drag textarea behavior and extends it to the
     actual Onyx working surfaces. The 190px bubble itself stays fixed-size;
     "widget" here means the opened module/panel.
     ------------------------------------------------------------------------ */
  const bottomDragObserved=new WeakSet();
  let bottomDragResizeObserver=null;
  try{
    bottomDragResizeObserver=new ResizeObserver(entries=>{for(const entry of entries){entry.target.dispatchEvent(new CustomEvent('bottomdragresize',{bubbles:true,detail:{width:entry.contentRect.width,height:entry.contentRect.height}}));}});
  }catch(_){bottomDragResizeObserver=null}

  function wireBottomDragTextareas(root=widget){const list=[];if(root instanceof HTMLTextAreaElement&&!root.matches('[data-no-bottom-drag]'))list.push(root);root?.querySelectorAll?.('textarea:not([data-no-bottom-drag])').forEach(el=>list.push(el));for(const el of list){if(bottomDragObserved.has(el))continue;bottomDragObserved.add(el);el.classList.add('bottom-drag-textarea');bottomDragResizeObserver?.observe?.(el)}}
  wireBottomDragTextareas();
  try{new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.nodeType===Node.ELEMENT_NODE)wireBottomDragTextareas(node)}).observe(widget,{childList:true,subtree:true})}catch(_){}

  function onTabClick(tabName,focus=false){const previous=state.activeTab;if(tabName==='design'){activateVisualTab('design',focus);window.dispatchEvent(new CustomEvent('onyx:design-enter',{detail:{previousTab:previous}}));return}if(!SERVERS[tabName])return;if(previous==='design')window.dispatchEvent(new CustomEvent('onyx:design-exit',{detail:{nextTab:tabName}}));activateVisualTab(tabName,focus);window.OnyxVirtualPet?.setTab?.(tabName,{focus:false})}
  tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>onTabClick(tab.dataset.tab));tab.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();let next=index;if(event.key==='ArrowRight')next=(index+1)%tabs.length;if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;onTabClick(tabs[next].dataset.tab,true)})});

  widget.addEventListener('click',event=>{const target=event.target.closest('button');if(!target)return;
    if(target.matches('[data-launch-game]')){if(window.ONYX_ADMIN_TEST)return;window.OnyxShell?.enterFastGame?.();return}
    if(target.matches('[data-launch-slow-game]')){if(window.ONYX_ADMIN_TEST)return;window.OnyxShell?.enterSlowGame?.();return}
    if(target.matches('[data-launch-work]')){if(window.ONYX_ADMIN_TEST)return;window.OnyxShell?.enterWorkFullscreen?.();return}
    if(target.matches('[data-onyx-quiet-toggle]')){window.OnyxVirtualPet?.toggleQuietCompanion?.();return}
    if(target.matches('[data-retry-last]')){retryLastPrompt(target.dataset.retryLast);return}
    if(target.matches('[data-edit-last]')){editLastPrompt(target.dataset.editLast);return}
    if(target.matches('[data-new-chat]')){startLocalThread(target.dataset.newChat);return}
    if(target.matches('[data-open-thread]')){selectThread(target.dataset.threadServer||state.activeServer,target.dataset.openThread);return}
    if(target.matches('[data-rename-thread]')){renameThread(target.dataset.threadServer||state.activeServer,target.dataset.renameThread);return}
    if(target.matches('[data-delete-thread]')){deleteThread(target.dataset.threadServer||state.activeServer,target.dataset.deleteThread);return}
    if(target.matches('[data-save-thread]')){saveThread(target.dataset.threadServer||state.activeServer,target.dataset.saveThread);return}
    if(target.matches('[data-pin-thread]')){toggleThreadPin(target.dataset.threadServer||state.activeServer,target.dataset.pinThread);return}
    if(target.matches('[data-rename-current]')){const s=target.dataset.renameCurrent,t=currentThread(s,false);if(t)renameThread(s,t.threadId);return}
    if(target.matches('[data-delete-current]')){const s=target.dataset.deleteCurrent,t=currentThread(s,false);if(t)deleteThread(s,t.threadId);return}
    if(target.matches('[data-save-current]')){const s=target.dataset.saveCurrent,t=currentThread(s,true);saveThread(s,t.threadId);return}
    if(target.matches('[data-pin-current]')){const s=target.dataset.pinCurrent,t=currentThread(s,true);toggleThreadPin(s,t.threadId);return}
    if(target.matches('[data-local-message-pin]')){toggleMessagePin(target.dataset.threadServer||state.activeServer,target.dataset.localMessagePin);return}
    if(target.matches('[data-local-reaction]')){toggleReaction(target.dataset.threadServer||state.activeServer,target.dataset.messageId,target.dataset.localReaction);return}
    if(target.matches('[data-prompt-chip]')){const server=target.dataset.promptChip,prompt=promptById(server,target.dataset.promptId);if(prompt)sendPrompt(server,prompt);return}
    if(target.matches('[data-web-button]')){const server=target.dataset.webButton;setComposeWeb(server,!composeState[server]?.forceWeb);inputEl(server)?.focus();return}
    if(target.matches('[data-memory-button]')){const server=target.dataset.memoryButton;setComposeMemory(server,!composeState[server]?.remember);inputEl(server)?.focus();return}
    if(target.matches('[data-retention-button]')){const server=target.dataset.retentionButton;setRetentionMode(server,retentionState[server]==='session'?'device':'session');return}
    if(target.matches('[data-clear-local-history]')){clearLocalHistory(target.dataset.clearLocalHistory);return}
    if(target.matches('[data-bold-button]')){wrapSelection(target.dataset.boldButton,'**','**','bold text');return}
    if(target.matches('[data-italic-button]')){wrapSelection(target.dataset.italicButton,'*','*','italic text');return}
    if(target.matches('[data-link-button]')){addLinkMarkup(target.dataset.linkButton);return}
    if(target.matches('[data-download-button]')){downloadLatest(target.dataset.downloadButton);return}
  });
  widget.querySelectorAll('[data-history-search]').forEach(input=>input.addEventListener('input',()=>{const s=input.dataset.historySearch;state.servers[s].search=input.value;renderHistory(s)}));
  widget.querySelectorAll('[data-chat-input]').forEach(input=>input.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();input.closest('form')?.requestSubmit()}}));
  fullscreenExit?.addEventListener('click',()=>window.OnyxVirtualPet?.exitFullscreen?.());
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&widget.classList.contains('tab-fullscreen'))window.OnyxVirtualPet?.exitFullscreen?.()});
  window.addEventListener('resize',positionPanel);
  window.addEventListener('pointerup',positionPanel);
  window.addEventListener('onyx:widget-move',positionPanel);
  window.addEventListener('onyx:chat-line',captureChatLine);
  window.addEventListener('onyx:tab-change',event=>{const tab=event.detail?.tab;if(SERVERS[tab])activateVisualTab(tab)});
  window.addEventListener('onyx:open-change',()=>positionPanel());
  window.addEventListener('onyx:thread-change',event=>{const d=event.detail||{};if(SERVERS[d.tab]&&d.threadId){const local=state.servers[d.tab];if(local.threads.some(t=>t.threadId===d.threadId)){local.currentThreadId=d.threadId;writeThreads();renderHistory(d.tab);renderHeader(d.tab)}}});
  window.addEventListener('onyx:quiet-companion-change',event=>{const on=Boolean(event.detail?.active);widget.querySelectorAll('[data-onyx-quiet-toggle]').forEach(b=>{b.classList.toggle('is-active',on);b.setAttribute('aria-pressed',String(on));b.textContent=on?(b.closest('.onyx-chat-modes')?'Quiet ✓':'End quiet'):(b.closest('.onyx-chat-modes')?'Quiet':'Stay with me')});widget.querySelectorAll('[data-onyx-quiet-status]').forEach(el=>{el.textContent=on?'Onyx is staying with you. No timer and no report required.':''})});
  window.OnyxBackendClient?.onStatus?.(st=>{applyBackendCapabilities(st?.capabilityContract);const next=String(st?.profileKey||'').toLowerCase();if(!next||next===state.config.profileKey)return;state.config.profileKey=next;loadRetentionPrefs();readThreads();loadMemoryPrefs();loadSupportPrefs();renderAllHistory();moduleDesignLoadForProfile()});

  /* Token-frame reaction/alert slot. The host may also dispatch
     onyx:reaction-alert or ourspace:onyx-alerts-updated events. */
  const alertStatus=widget.querySelector('[data-onyx-alert-status]');
  const alertReaction=widget.querySelector('[data-onyx-alert-reaction]');
  const alertCountNode=widget.querySelector('[data-onyx-alert-count]');
  const alertLive=widget.querySelector('[data-onyx-alert-live]');
  let alertClearTimer=0,alertPulseTimer=0,lastAlertSoundAt=0,alertCount=0,alertAudio=null;

  function normalizeAlertKind(value,record={}){
    const raw=String(value||record?.kind||record?.type||record?.category||'').toLowerCase().replace(/[\s.-]+/g,'_');
    const hay=[raw,record?.subject,record?.title,record?.body,record?.message,record?.payload?.kind,record?.payload?.type,record?.payload?.priority].filter(Boolean).join(' ').toLowerCase();
    /* Updated OurSpace push kinds use dotted names which normalize to underscores. */
    if(/^(onyx_)?(care|selfcare|self_care|pet)$/.test(raw))return'virtual_pet';
    if(/^(onyx_)?(reply|response|responded|message|chat_reply)$/.test(raw))return'responded';
    if(/^(onyx_)?(writing|drafting|compose)$/.test(raw))return'writing';
    if(/^(onyx_)?(thinking|processing|research|working)$/.test(raw))return'thinking';
    if(/^(onyx_)?(important|urgent|priority|critical)$/.test(raw))return'important';
    if(/\b(important|urgent|priority|critical|attention|announce|announcement)\b/.test(hay))return'important';
    if(/\b(write|writing|draft|drafting|compose|composing|story|chapter|scene)\b/.test(hay))return'writing';
    if(/\b(think|thinking|process|processing|research|working)\b/.test(hay))return'thinking';
    if(/\b(responded|response|reply|replied|message|chat_reply)\b/.test(hay))return'responded';
    if(/\b(virtual[_ -]?pet|pet|care|selfcare|self_care|feed|feeding|snuggle|purr)\b/.test(hay))return'virtual_pet';
    return ALERT_TYPES[raw]?raw:'alert'
  }
  function setAlertCount(count){
    alertCount=Math.max(0,Number(count)||0);
    orb?.setAttribute('data-onyx-alert-count',String(alertCount));
    if(alertCountNode){
      alertCountNode.hidden=alertCount<1;
      alertCountNode.textContent=alertCount>99?'99+':String(alertCount);
    }
    return alertCount
  }
  function renderReactionAlert(kind='alert',{count=alertCount,incoming=false,duration=4200,persist=false,sound=false,record=null}={}){
    if(!alertStatus||!alertReaction)return false;
    const normalized=normalizeAlertKind(kind,record||{}),spec=ALERT_TYPES[normalized]||ALERT_TYPES.alert;
    clearTimeout(alertClearTimer);
    alertStatus.dataset.alertKind=normalized;
    alertStatus.setAttribute('aria-label',spec.label);
    alertReaction.replaceChildren();
    if(spec.image){
      const img=document.createElement('img');
      img.src=spec.image;
      img.alt='';
      img.setAttribute('aria-hidden','true');
      alertReaction.appendChild(img);
    }else alertReaction.textContent=spec.glyph;
    setAlertCount(count);
    if(alertLive)alertLive.textContent=`Onyx: ${spec.label}${alertCount>0?`, ${alertCount} alert${alertCount===1?'':'s'}`:''}`;
    if(incoming){
      alertStatus.classList.remove('has-incoming');
      void alertStatus.offsetWidth;
      alertStatus.classList.add('has-incoming');
      clearTimeout(alertPulseTimer);
      alertPulseTimer=setTimeout(()=>alertStatus.classList.remove('has-incoming'),1700);
    }
    if(sound)playAlertSound();
    if(!persist&&duration>0)alertClearTimer=setTimeout(()=>clearReactionAlert({keepCount:true}),duration);
    return normalized
  }
  function clearReactionAlert({keepCount=true}={}){
    if(!alertStatus||!alertReaction)return;
    clearTimeout(alertClearTimer);
    alertStatus.classList.remove('has-incoming');
    alertStatus.removeAttribute('data-alert-kind');
    alertStatus.removeAttribute('aria-label');
    alertReaction.replaceChildren();
    if(!keepCount)setAlertCount(0);
    if(alertLive&&!keepCount)alertLive.textContent='';
  }
  async function playAlertSound(){
    const now=Date.now();
    if(now-lastAlertSoundAt<1400||typeof Audio!=='function')return false;
    lastAlertSoundAt=now;
    try{
      alertAudio?.pause?.();
      alertAudio=new Audio('https://raw.githubusercontent.com/tyrannosaurusdm92/LifeHelpers/main/OurSpace/assets/audio/shared/onyx-meow.wav');
      alertAudio.preload='auto';
      alertAudio.volume=.2;
      alertAudio.setAttribute('playsinline','');
      await alertAudio.play();
      return true
    }catch(_){return false}
  }
  function incomingAlertRecord(detail={}){
    if(Array.isArray(detail.incoming)&&detail.incoming.length)return detail.incoming[0];
    if(Array.isArray(detail.alerts)&&detail.alerts.length)return detail.alerts[0];
    return detail.alert||detail.notification||detail
  }
  function handleSiteAlerts(detail={}){
    const total=Number(detail.count??detail.alerts?.length??detail.pending?.length??alertCount)||0;
    const incoming=Number(detail.incoming?.length||detail.newCount||0)||0;
    setAlertCount(total);
    const record=incomingAlertRecord(detail);
    if(alertStatus){
      const heading=String(record?.title||record?.subject||record?.body||'Onyx reminder').slice(0,140);
      alertStatus.title=total?`${heading} · ${total} Onyx alert${total===1?'':'s'}`:'No Onyx alerts';
      alertStatus.setAttribute('aria-label',alertStatus.title);
    }
    if(incoming>0){
      const record=incomingAlertRecord(detail);
      renderReactionAlert(normalizeAlertKind('',record),{count:total,incoming:true,persist:total>0,sound:detail.soundHandled!==true,record});
    }else if(total<1)clearReactionAlert({keepCount:false});
    return total
  }

  window.addEventListener('onyx:reaction-alert',event=>{
    const d=event.detail||{};
    renderReactionAlert(d.kind||d.type||'alert',{count:d.count??alertCount,incoming:d.incoming!==false,duration:Number.isFinite(Number(d.duration))?Number(d.duration):4200,persist:d.persist===true,sound:d.sound===true,record:d});
  });
  window.addEventListener('onyx:conversation-status',event=>{
    const d=event.detail||{};
    renderReactionAlert(d.kind||'thinking',{count:alertCount,incoming:false,persist:true,duration:0,sound:false,record:d});
  });
  window.addEventListener('onyx:conversation-complete',event=>{
    const tab=event.detail?.tab;
    if(SERVERS[tab])setComposeWeb(tab,false);
    renderReactionAlert('responded',{count:alertCount,incoming:true,duration:4200,sound:false});
  });
  window.addEventListener('onyx:pet-action',event=>{
    renderReactionAlert('virtual_pet',{count:alertCount,incoming:true,duration:3600,sound:false,record:event.detail||{}});
  });
  window.addEventListener('ourspace:onyx-alerts-updated',event=>handleSiteAlerts(event.detail||{}));
  window.addEventListener('message',event=>{
    const m=event.data;
    if(!m||typeof m!=='object')return;
    if(window.OnyxBackendClient?.isTrustedMessageEvent&&!window.OnyxBackendClient.isTrustedMessageEvent(event))return;
    if(m.type==='ourspace:onyx-alert'||m.type==='ONYX_ALERT')handleSiteAlerts(m.detail||m);
  });

  activateVisualTab('health');
  positionPanel();
  setTimeout(()=>{for(const s of Object.keys(SERVERS)){const t=currentThread(s,false);if(t?.threadId&&!window.OnyxVirtualPet?.getThread?.(s))window.OnyxVirtualPet?.setThread?.(s,t.threadId)}},0);

  window.OnyxRoundWidget=Object.freeze({
    open(){return window.OnyxVirtualPet?.open?.()},close(){return window.OnyxVirtualPet?.close?.()},toggle(){return widget.classList.contains('open')?window.OnyxVirtualPet?.close?.():window.OnyxVirtualPet?.open?.()},
    setTab(tab){onTabClick(tab)},getActiveTab(){return state.activeTab},enterFullscreen(tab=state.activeTab){return window.ONYX_ADMIN_TEST?undefined:(tab==='health'?window.OnyxShell?.enterSlowGame?.():tab==='leisure'?window.OnyxShell?.enterFastGame?.():undefined)},exitFullscreen(){return window.OnyxShell?.exitToModule?.()},
    positionPanel,newChat(server=state.activeServer){return startLocalThread(server)},renameCurrent(server=state.activeServer){const t=currentThread(server,false);return t?renameThread(server,t.threadId):false},deleteCurrent(server=state.activeServer){const t=currentThread(server,false);return t?deleteThread(server,t.threadId):false},saveCurrent(server=state.activeServer){const t=currentThread(server,true);return saveThread(server,t.threadId)},selectThread,
    getThreads(server=state.activeServer){return state.servers[server]?.threads.map(t=>({...t,messages:t.messages.map(m=>({...m}))}))||[]},
    configure(next={}){if(next.profileKey){state.config.profileKey=String(next.profileKey).toLowerCase();loadRetentionPrefs();readThreads();loadMemoryPrefs();renderAllHistory();moduleDesignLoadForProfile()}return{profileKey:profileKey()}},
    getModuleDesign(){const palette=effectiveModulePalette();return{themeMode:moduleThemeMode,...palette,customState:{...moduleDesignState},contrast:moduleDesignContrastReport(palette)}},setModuleDesign(next={}){if(next.themeMode)moduleThemeMode=normalizeThemeMode(next.themeMode);const colors={...next};delete colors.themeMode;if(Object.keys(colors).some(key=>key in MODULE_DESIGN_DEFAULTS)){if(moduleThemeMode!=='custom')moduleDesignState=effectiveModulePalette();moduleThemeMode='custom';moduleDesignState=moduleDesignNormalize({...moduleDesignState,...colors})}applyModuleDesign();renderModuleDesign();const palette=effectiveModulePalette();return{themeMode:moduleThemeMode,...palette,customState:{...moduleDesignState},contrast:moduleDesignContrastReport(palette)}},resetModuleDesign(){moduleThemeMode='auto';moduleDesignState={...MODULE_DESIGN_DEFAULTS};applyModuleDesign();renderModuleDesign();const palette=effectiveModulePalette();return{themeMode:moduleThemeMode,...palette,customState:{...moduleDesignState},contrast:moduleDesignContrastReport(palette)}},
    setReactionAlert(kind,options={}){return renderReactionAlert(kind,options)},clearReactionAlert(){clearReactionAlert({keepCount:true});return true},getAlertCount(){return alertCount}
  });
})();
