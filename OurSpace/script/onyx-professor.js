/* OurSpace / Professor Onyx: focused, Work-style full-screen mental-health support.
   Browser UI ONLY. The existing backend owns all credentials, AI, notices, privacy and storage.
   Transcript data is deliberately in-memory, profile-separated, and never in Work's storage. */
(() => {
  'use strict';
  const TZ = 'America/New_York';
  const SECTIONS = Object.freeze([
    {id:'session', name:'Support Session', short:'☏', topic:'Empathetic listening, emotional check-ins, and planning a practical next step.', prompts:[['Start check-in','I need a therapy session'],['Talk it through','Could you listen without trying to fix everything right away?'],['Reflect','Can you help me name what I am feeling and what I need?']]},
    {id:'dbt', name:'DBT Skills', short:'DBT', topic:'Dialectical behavior therapy skills: distress tolerance, emotion regulation, mindfulness, interpersonal effectiveness.', prompts:[['Choose a skill','Help me choose a DBT skill for what I am facing.'],['STOP','Walk me through the STOP skill step by step.'],['DEAR MAN','Help me practice DEAR MAN with an example.']]},
    {id:'worksheet', name:'DBT Worksheets', short:'✎', topic:'Practice a worksheet together with concrete prompts and a summary you can export.', prompts:[['Chain analysis','Help me complete a DBT behavior chain analysis, one question at a time.'],['Check the facts','Guide me through a Check the Facts worksheet.'],['Pros and cons','Work through a DBT pros-and-cons worksheet with me.']]},
    {id:'psychoeducation', name:'Psychology & Preparation', short:'Ψ', topic:'Psychoeducation, coping strategies, and questions for a qualified clinician.', prompts:[['Appointment preparation','Help me organize questions for my mental-health clinician.'],['Understanding patterns','Explain emotional regulation in plain language without diagnosing me.'],['Weekly reflection','Guide a gentle weekly reflection on coping skills and things to discuss with my provider.']]}
  ]);
  const $ = id => document.getElementById(id);
  const shell = $('onyxProfessorFullscreenShell');
  if (!shell) return;
  const els = {
    frame:$('onyxProfessorFullscreenFrame'),sections:$('onyxProfessorSections'),threads:$('onyxProfessorThreads'),
    chatTitle:$('onyxProfessorChatTitle'),chatTopic:$('onyxProfessorChatTopic'),sectionTitle:$('onyxProfessorTitle'),
    messages:$('onyxProfessorMessages'),composer:$('onyxProfessorComposer'),input:$('onyxProfessorInput'),send:$('onyxProfessorSend'),
    prompts:$('onyxProfessorQuickPrompts'),attachmentTray:$('onyxProfessorAttachmentTray'),fileInput:$('onyxProfessorFileInput'),attach:$('onyxProfessorAttach'),status:$('onyxProfessorStatus'),timer:$('onyxProfessorSessionTimer'),schedule:$('onyxProfessorSchedule'),
    sidebar:$('onyxProfessorSidebar')
  };
  const sessions = new Map(); // in-memory only: profile -> { section, threadsBySection, currentBySection, startedAt }
  let selectedOwner = '', sending = false, activeController = null, pollInFlight = false, pollInterval = 0, clockInterval = 0;
  let queuedFiles = []; // User-selected attachments only, no localStorage or persisted contents.
  const supports = id => SECTIONS.find(x => x.id === id) || SECTIONS[0];
  const uuid = () => (globalThis.crypto?.randomUUID?.() || 'thread-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
  function authenticatedProfile() {
    const tester = window.OnyxTester?.publicStatus?.();
    if(tester?.active) return tester.selectedProfile || '';
    if(window.OurSpaceBackend?.isAdmin?.())return '';
    if(!window.OurSpaceBackend?.isAuthenticated?.() && !window.OnyxBackendClient?.available?.())return '';
    const real=String(window.OurSpaceBackend?.profile?.()||window.OnyxBackendClient?.activeProfile?.()||'').toLowerCase();
    return ['william','jasper'].includes(real)?real:'';
  }
  function owner() {return authenticatedProfile()||'preview';}
  function newSession() {
    const threadsBySection={},currentBySection={};
    for(const group of SECTIONS){const thread={id:uuid(),label:group.id==='session'?'session':'general',messages:[]};threadsBySection[group.id]=[thread];currentBySection[group.id]=thread.id;}
    return {section:'session',threadsBySection,currentBySection,startedAt:0};
  }
  function session() { const key=owner();if(key!==selectedOwner)selectedOwner=key;if(!sessions.has(key))sessions.set(key,newSession());return sessions.get(key); }
  function thread(){const s=session(),rows=s.threadsBySection[s.section]||[];return rows.find(t=>t.id===s.currentBySection[s.section])||rows[0];}
  function isStartIntent(value) {let s=String(value||'').trim().toLowerCase().replace(/[.!?]+$/,'').trim();return /^(?:onyx[, ]+)?(?:i need a therapy session|i'd like a therapy session|i would like a therapy session|can we have a therapy session|please start (?:my|a|our) therapy session|start (?:my|a|our) therapy session)$/.test(s);}
  function isEndIntent(value) {let s=String(value||'').trim().toLowerCase().replace(/[.!?]+$/,'').trim();return /^(?:onyx[, ]+)?(?:end (?:my|the|this|our) therapy session|stop (?:my|the|this|our) therapy session|exit professor mode|back to normal chat|return to normal chat|leave professor mode)$/.test(s);}
  function displayStatus(msg){els.status.textContent=msg;}
  function messageNode(item) {const d=document.createElement('div');d.className='professor-message';d.dataset.role=item.role;const by=document.createElement('strong');by.textContent=item.role==='user'?'You':item.role==='assistant'?'Professor Onyx':'Session';const content=document.createElement('div');content.textContent=item.text;d.append(by,content);if(item.role==='assistant'&&item.assignmentId){const pair=window.OnyxDBTAssignments?.pairings?.().find(p=>p.id===item.assignmentId);const card=pair&&window.OurSpaceModuleBridge?.createAssignmentCard(pair,item.assignmentProfile,item.assignmentReason);if(card)d.append(card);}return d;}
  function renderMessages(){const row=thread();els.messages.replaceChildren();if(!row?.messages.length){els.messages.append(messageNode({role:'system',text:'This is your space for focused support. Tell me what you want to work through, or choose a prompt below. No diagnosis or medical treatment is provided.'}));}else{for(const msg of row.messages)els.messages.append(messageNode(msg));}const scroller=els.messages.closest('.message-viewport');if(scroller)scroller.scrollTop=scroller.scrollHeight;}
  function renderSections(){const s=session();els.sections.replaceChildren();for(const item of SECTIONS){const b=document.createElement('button');b.type='button';b.className='server-button';b.textContent=item.short;b.title=item.name;b.setAttribute('aria-label',item.name);b.setAttribute('aria-selected',String(s.section===item.id));b.addEventListener('click',()=>{s.section=item.id;els.sidebar.classList.remove('is-open');render();});els.sections.append(b);}}
  function renderThreads(){const s=session();els.threads.replaceChildren();for(const item of s.threadsBySection[s.section]){const b=document.createElement('button');b.type='button';b.textContent='# '+item.label;b.setAttribute('aria-current',String(s.currentBySection[s.section]===item.id));b.addEventListener('click',()=>{s.currentBySection[s.section]=item.id;els.sidebar.classList.remove('is-open');render();});els.threads.append(b);}}
  function renderPrompts(){const s=session(),group=supports(s.section);els.prompts.replaceChildren();for(const [title,prompt] of group.prompts){const b=document.createElement('button');b.type='button';b.textContent=title;b.addEventListener('click',()=>{els.input.value=prompt;els.input.focus();});els.prompts.append(b);}}
  function renderAttachments(){els.attachmentTray.replaceChildren();els.attachmentTray.hidden=!queuedFiles.length;for(const file of queuedFiles){const chip=document.createElement('div');chip.className='professor-attachment-chip';const name=document.createElement('span');name.textContent=file.name;const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label','Remove '+file.name);remove.addEventListener('click',()=>{queuedFiles=queuedFiles.filter(x=>x!==file);renderAttachments();});chip.append(name,remove);els.attachmentTray.append(chip);}}
  function addAttachments(files){if(!Array.isArray(files))return;for(const f of files){if(!f||f.size>9*1024*1024){displayStatus('Each attachment must be 9 MB or less.');continue;}if(queuedFiles.length>=4){displayStatus('You may attach up to four files at once.');break;}if(!/\.(?:txt|md|csv|json|pdf|docx|png|jpe?g|webp)$/i.test(f.name)){displayStatus('Choose a text, PDF, DOCX, image or worksheet file.');continue;}queuedFiles.push(f);}renderAttachments();}
  async function parseAttachments(prompt,signal){if(!queuedFiles.length)return[];if(window.OnyxTester?.active?.())throw new Error('Attachments are disabled in read-only tester mode. Remove them to continue.');if(!window.OnyxBackendClient?.fileParse)throw new Error('File analysis is unavailable in this standalone widget.');const out=[];for(const file of queuedFiles){const result=await window.OnyxBackendClient.fileParse(file,{signal,timeout:110000,instructions:'Read the user-attached clinical/DBT worksheet faithfully to assist the user with their requested task. Do not invent information. User message: '+prompt,maxOutputTokens:1500});const txt=String(result?.analysis||result?.response||result?.text||'').trim();if(!txt)throw new Error('The backend could not read '+file.name+'.');out.push({name:file.name,mimeType:'text/plain',text:'User-attached worksheet '+file.name+':\n'+txt});}return out;}

  function etParts(date=new Date()){const parts=new Intl.DateTimeFormat('en-US',{timeZone:TZ,weekday:'short',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(date);return Object.fromEntries(parts.map(p=>[p.type,p.value]));}
  function therapySchedule(date=new Date()){const p=etParts(date),mins=Number(p.hour)%24*60+Number(p.minute),saturday=p.weekday==='Sat';return {date:`${p.year}-${p.month}-${p.day}`,minutes:mins,saturday,inWindow:saturday&&mins>=900&&mins<960,reminder:saturday&&mins>=870&&mins<880?'30-minutes-before':saturday&&mins>=900&&mins<910?'session-start':''};}
  function updateSchedule(){const s=session(),sch=therapySchedule();let txt='Saturday sessions · 3:00–4:00 PM Eastern (60 minutes), for William and Jasper separately.';if(sch.inWindow){txt+=' Your scheduled session window is open. You choose when to begin.';}if(s.startedAt){const elapsed=Math.floor((Date.now()-s.startedAt)/60000),remaining=Math.max(0,60-elapsed);els.timer.textContent=remaining>0?`${remaining} min remaining in this hour`:'One-hour session window complete';if(remaining===0)txt+=' Your one-hour session has elapsed; you may finish or continue at your choice.';}else els.timer.textContent='Session not started';els.schedule.textContent=txt;}
  function render(){const s=session(),group=supports(s.section),t=thread();els.sectionTitle.textContent=group.name;els.chatTitle.textContent=t?.label||'session';els.chatTopic.textContent=group.topic;renderSections();renderThreads();renderPrompts();renderAttachments();renderMessages();updateSchedule();}
  function addThread(){const s=session(),rows=s.threadsBySection[s.section];const t={id:uuid(),label:'new-session-'+(rows.length+1),messages:[]};rows.push(t);s.currentBySection[s.section]=t.id;render();els.input.focus();}
  function renameThread(){const t=thread();if(!t)return;const input=window.prompt('Subtab name:',t.label);if(input===null)return;const safe=input.trim().slice(0,60);if(safe)t.label=safe;render();}
  function clearThread(){const t=thread();if(t && window.confirm('Clear this therapy subtab from this browser session?')){t.messages=[];renderMessages();}}
  function deleteThread(){const s=session(),rows=s.threadsBySection[s.section];if(rows.length===1){clearThread();return;}if(!window.confirm('Delete this therapy subtab and its current in-memory messages?'))return;const index=rows.findIndex(x=>x.id===s.currentBySection[s.section]);rows.splice(index,1);s.currentBySection[s.section]=rows[Math.max(0,index-1)].id;render();}
  function exportThread(){const t=thread(),profile=owner();if(!t)return;const content=['Professor Onyx · '+supports(session().section).name,'For: '+(profile==='preview'?'local preview':profile),'Exported: '+new Date().toISOString(),'Not a medical record or professional diagnosis.','',...t.messages.map(x=>`${x.role==='user'?'You':x.role==='assistant'?'Professor Onyx':'Session'}: ${x.text}\n`)].join('\n');const blob=new Blob([content],{type:'text/plain;charset=utf-8'}),a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download='professor-onyx-'+session().section+'-'+new Date().toISOString().slice(0,10)+'.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
  async function send(text){const value=String(text||'').trim();if(!value||sending)return;const s=session(),t=thread(),user=owner();t.messages.push({role:'user',text:value});renderMessages();sending=true;els.send.disabled=true;displayStatus('Onyx is thinking…');const ctl=new AbortController();activeController=ctl;
    try{
      if(window.OnyxTester?.active?.() && !window.OnyxTester?.publicStatus?.().selectedProfile)throw new Error('Select William or Jasper in Onyx chat before beginning a tester therapy session.');
      if(user==='preview')throw new Error('Sign in to William or Jasper, or complete the verified Onyx tester flow, to use Professor Onyx.');
      // All therapy messages use existing backend onyx.chat. Server never sends internal context to the frontend.
      const data={message:value,threadId:`ourspace-onyx-professor-${user}-${s.section}`,supportMode:'dbt',
        context:`Professor Onyx therapy-style support; ${supports(s.section).name}. Provide non-diagnostic, supportive psychology education and DBT skills only.`,
        webSearch:false,useDrive:false,autoRemember:false,allowWrites:false,allowAssetGeneration:false,allowExternalTools:false,maxOutputTokens:1800};
      const references=await parseAttachments(value,ctl.signal);if(references.length)data.references=references;
      let result;
      if(window.OnyxTester?.active?.())result=await window.OnyxTester.chat(value,{threadId:data.threadId,supportMode:'dbt',signal:ctl.signal});
      else if(window.OnyxBackendClient?.chat && window.OnyxBackendClient?.available?.())result=await window.OnyxBackendClient.chat(data,{timeout:90000,signal:ctl.signal});
      else if(window.OurSpaceBackend?.request)result=await window.OurSpaceBackend.request('onyx.chat',data,{signal:ctl.signal});
      else throw new Error('The existing Onyx backend is not connected.');
      const reply=String(result?.response||result?.onyxReply||result?.text||result?.message||'').trim();
      const suggestion=window.OnyxDBTAssignments?.choose?.(value);const pair=suggestion&&window.OnyxDBTAssignments?.pairings?.().find(p=>p.id===suggestion.pairId);if(pair)window.OnyxDBTAssignments?.assign?.(pair.id,{profile:user,reason:suggestion.reason,source:'conversation'});t.messages.push({role:'assistant',text:reply||'Onyx did not provide a reply this time.',assignmentId:pair?.id||'',assignmentProfile:user,assignmentReason:suggestion?.reason||'DBT skills practice'});
      if(queuedFiles.length){queuedFiles=[];renderAttachments();}
      displayStatus('Onyx is listening');
      if(result?.professorEnded||isEndIntent(value))displayStatus('Professor session ended');
      window.OnyxVirtualPet?.setBehaviorVariant?.('advising_professor',9000);
    }catch(e){t.messages.push({role:'system',text:e?.name==='AbortError'?'Request stopped.':String(e?.message||'Onyx could not reply.')});displayStatus('Connection needed');}
    finally {activeController=null;sending=false;els.send.disabled=false;renderMessages();updateSchedule();}
  }
  function open({initialMessage='',source='user'}={}){
    const s=session();if(!s.startedAt)s.startedAt=Date.now();
    window.OnyxShell?.enterProfessorFullscreen?.();render();els.input.focus();
    window.OnyxVirtualPet?.setBehaviorVariant?.('advising_professor',11000);
    window.dispatchEvent(new CustomEvent('onyx:professor-open',{detail:{source,profile:owner()}}));
    if(initialMessage)void send(initialMessage);
    return true;
  }
  function close(){if(activeController)activeController.abort();queuedFiles=[];renderAttachments();window.OnyxShell?.exitProfessorFullscreen?.();window.OnyxVirtualPet?.setBehaviorVariant?.('listening',10000);window.dispatchEvent(new CustomEvent('onyx:professor-close'));return true;}
  function isOpen(){return document.documentElement.dataset.runtimeMode==='professor' && !shell.hidden;}
  function toastReminder(label,details){
    // The notification appears ONLY inside Onyx's existing black-framed miniature alert box.
    // No separate toast or second alert surface is created.
    window.dispatchEvent(new CustomEvent('onyx:reaction-alert',{detail:{kind:'therapy',title:String(label||'Therapy reminder'),body:String(details||'Your session is scheduled.'),incoming:true,count:1,persist:true,sound:true}}));
    window.dispatchEvent(new CustomEvent('onyx:therapy-reminder',{detail:{label}}));
  }
  const alertSeenKey=(profile)=>'onyx.therapy.seen.'+profile;
  function rememberReminder(profile,key){let seen=[];try{seen=JSON.parse(sessionStorage.getItem(alertSeenKey(profile))||'[]');}catch(_){}if(seen.includes(key))return false;seen.push(key);try{sessionStorage.setItem(alertSeenKey(profile),JSON.stringify(seen.slice(-80)));}catch(_){}return true;}
  function checkedProfile(){const real=window.OurSpaceBackend?.profile?.();return window.OurSpaceBackend?.token?.() && ['william','jasper'].includes(real)?real:'';}
  async function pollBackendAlerts(){if(pollInFlight||document.hidden)return;const p=checkedProfile();if(!p)return;pollInFlight=true;try{
      const data=await window.OurSpaceBackend.request('onyx.therapy.alerts',{});
      if(data?.ok===false||data.profileKey!==p||!Array.isArray(data.alerts))return;
      for(const item of data.alerts){const time=Date.parse(item.createdAt||'');if(!Number.isFinite(time)||Date.now()-time>4*3600000||time>Date.now()+60000)continue;
        if(rememberReminder(p,'backend-'+String(item.id))){toastReminder(String(item.subject||'Therapy reminder'),String(item.body||'Your Saturday support session is coming up.'));}
      }
    }catch(_){/* existing Onyx alerts may still deliver independently */}finally{pollInFlight=false;}}
  function localScheduledReminder(){const profile=checkedProfile();if(!profile)return;const t=therapySchedule();if(!t.reminder)return;const k='local-'+t.date+'-'+t.reminder;if(!rememberReminder(profile,k))return;toastReminder('Onyx Saturday support',t.reminder==='30-minutes-before'?'Professor Onyx: your optional 3:00 PM Eastern support session begins in 30 minutes.':'Professor Onyx: it’s 3:00 PM Eastern. Your optional one-hour support session is scheduled now.');}
  els.composer.addEventListener('submit',e=>{e.preventDefault();const value=els.input.value;els.input.value='';void send(value);});
  els.input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();els.composer.requestSubmit();}});
  els.attach?.addEventListener('click',()=>{if(window.OnyxTester?.active?.()){displayStatus('Attachments are disabled in read-only tester mode.');return;}els.fileInput?.click();});
  els.fileInput?.addEventListener('change',()=>{addAttachments([...els.fileInput.files]);els.fileInput.value='';});
  const dropzone=document.querySelector('#onyxProfessorFullscreenShell .professor-composer-shell');
  for(const type of ['dragenter','dragover'])dropzone?.addEventListener(type,e=>{if(!e.dataTransfer?.types?.includes('Files'))return;e.preventDefault();dropzone.classList.add('dragging');});
  for(const type of ['dragleave','drop'])dropzone?.addEventListener(type,e=>{if(!e.dataTransfer?.types?.includes('Files'))return;e.preventDefault();dropzone.classList.remove('dragging');if(type==='drop')addAttachments([...e.dataTransfer.files]);});

  $('onyxProfessorAddThread')?.addEventListener('click',addThread);
  $('onyxProfessorNewThread')?.addEventListener('click',addThread);
  $('onyxProfessorRenameThread')?.addEventListener('click',renameThread);
  $('onyxProfessorExportThread')?.addEventListener('click',exportThread);
  $('onyxProfessorClearThread')?.addEventListener('click',clearThread);
  $('onyxProfessorDeleteThread')?.addEventListener('click',deleteThread);
  $('onyxProfessorMobileNav')?.addEventListener('click',()=>els.sidebar.classList.toggle('is-open'));
  // Deliberate Professor button, not the other health/DBT modes. Capture dynamic health form submissions
  // before the normal chat handler so "I need a therapy session" opens the focused workspace exactly once.
  document.addEventListener('click',e=>{if(e.target?.closest?.('[data-professor-open]')){e.preventDefault();open({initialMessage:'I need a therapy session',source:'professor-button'});}},true);
  document.addEventListener('submit',e=>{const form=e.target;if(!form?.matches?.('[data-chat-form="health"]'))return;const message=form.querySelector('[data-chat-input="health"]')?.value||'';if(!isStartIntent(message))return;e.preventDefault();e.stopImmediatePropagation();const field=form.querySelector('[data-chat-input="health"]');if(field)field.value='';open({initialMessage:message,source:'chat-phrase'});},true);
  window.addEventListener('onyx:professor-trigger',e=>{if(!isOpen())open({source:'host-explicit-trigger',initialMessage:e.detail?.initialMessage||'I need a therapy session'});});
  window.addEventListener('ourspace:signed-out',()=>{sessions.clear();selectedOwner='';close();});
  window.addEventListener('ourspace:auth',()=>{queuedFiles=[];renderAttachments();selectedOwner='';if(isOpen())render();void pollBackendAlerts();});
  window.addEventListener('onyx:tester-state',()=>{queuedFiles=[];renderAttachments();selectedOwner='';if(isOpen())render();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){void pollBackendAlerts();localScheduledReminder();updateSchedule();}});
  clockInterval=setInterval(()=>{if(isOpen())updateSchedule();localScheduledReminder();},60000);
  pollInterval=setInterval(()=>void pollBackendAlerts(),60000);
  setTimeout(()=>{void pollBackendAlerts();localScheduledReminder();},2500);
  window.OnyxProfessor=Object.freeze({open,close,isOpen,isStartIntent,isEndIntent,schedule:therapySchedule,refreshAlerts:pollBackendAlerts,sections:SECTIONS.map(({id,name})=>({id,name}))});
})();
