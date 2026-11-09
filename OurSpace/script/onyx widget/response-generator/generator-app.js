import {createOnyxResponses} from './onyx-responses.js';
import {ContextMemory} from './context-memory.js';
import {createOurSpaceBackendAdapter,resolveActiveProfile} from './ourspace-adapter.js';
const TESTER_IDS={'tester-dialog':'onyxTesterDialog','tester-email-step':'onyxTesterEmailStep','tester-code-step':'onyxTesterCodeStep','tester-email':'onyxTesterEmail','tester-code':'onyxTesterCode','tester-email-confirm':'onyxTesterRequest','tester-email-cancel':'onyxTesterCancelEmail','tester-code-confirm':'onyxTesterVerify','tester-code-resend':'onyxTesterResend','tester-code-cancel':'onyxTesterCancelCode','tester-dialog-message':'onyxTesterStatus'};
const $=(id)=>document.getElementById(id)||document.getElementById(TESTER_IDS[id]||'');
let engine=null,abort=null,lastResults=[],conversation=null;const memory=new ContextMemory();
let generateStarted=0,generateCurrent=0,generateTotal=0,generateTicker=null;
function stopGenerateTicker(){if(generateTicker!==null)clearInterval(generateTicker);generateTicker=null;}
function startGenerateTicker(){stopGenerateTicker();generateStarted=Date.now();generateTicker=setInterval(()=>{if(!abort||!generateCurrent)return;const secs=Math.floor((Date.now()-generateStarted)/1000);status(`Waiting for AI Brain response ${generateCurrent}/${generateTotal} · ${secs}s elapsed. Apps Script can take several minutes; the tester session is still active. Cancel if needed.`);},4000);}
let testerToken="",testerProfile="",testerExpiresAt="",testerBusy=false;
function selection(name){if(name==='profile'){const selected=document.querySelector('input[name="profile"]:checked')?.value;return testerActive()?selected||$('onyxTesterProfile')?.value:resolveActiveProfile()||selected;}return document.querySelector(`input[name="${name}"]:checked`)?.value;}
function status(message,error=false){$('status').textContent=message;$('status').classList.toggle('error',error);}
function make(tag,cls='',text=''){const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n;}
function download(filename,content,mime='text/plain;charset=utf-8'){
  const blob=new Blob([content],{type:mime}),url=URL.createObjectURL(blob),a=make('a');a.href=url;a.download=filename;
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
}
function simpleButton(text,onClick,cls='secondary'){const b=make('button',cls,text);b.type='button';b.addEventListener('click',onClick);return b;}
function renderCard(entry){
  const card=make('article','response-card'),meta=make('div','card-meta');
  for(const text of [entry.profile==='william'?'Papa':'Momma',entry.mode,entry.mood,entry.source==='backend-tester-readonly'?'Read-only tester AI Brain':entry.source==='backend-ai-brain'?'Backend reported AI Brain':entry.source==='backend-unverified'?'Backend (provider unverified)':entry.source==='local-social-repair-not-llm'?'Local repair (not Gemini)':'Offline preview'])meta.append(make('span','chip',text));
  if(entry.duplicateWarning)meta.append(make('span','chip warning','Possibly similar to an earlier draft'));
  if(entry.qualityWarnings?.length)meta.append(make('span','chip warning','Review: '+entry.qualityWarnings.join(', ')));
  card.append(meta,make('p','response-text',entry.text));
  const actions=make('div','card-actions'),save=simpleButton('Approve & remember',async()=>{
    try{await engine.saveApproved(entry);save.replaceWith(make('span','saved-label','Approved for this profile'));await refreshSaved();}
    catch(err){status('Could not save: '+err.message,true);}
  });
  if(['health','professor'].includes(entry.mode)){save.disabled=true;save.title='Local approvals are disabled for Virtual & Health and Professor conversations.';}
  actions.append(save,simpleButton('Copy',async()=>{try{await navigator.clipboard.writeText(entry.text);status('Response copied.');}catch{status('Clipboard permission unavailable.',true);}}));
  card.append(actions,make('p','source-note',entry.source==='offline-preview'?'Local rule/retrieval draft — not an LLM; verify practical suggestions.':entry.source==='local-social-repair-not-llm'?'The backend draft missed the social intent; this is an explicitly labeled local repair, not a Gemini result.':(entry.source==='backend-tester-readonly'?'Verified backend tester: read-only AI Brain path. Gemini model identity not attested in response.':entry.backendLogged?'Backend explicitly confirmed logging.':'Existing backend reply — Gemini use has not been independently verified.')));
  return card;
}
async function refreshSaved(){if(!engine)return;const profile=selection('profile'),items=await engine.listApproved(profile);$('saved-count').textContent=String(items.length);
  const host=$('saved-list');host.replaceChildren();if(!items.length){host.append(make('p','muted','Nothing approved yet.'));return;}
  for(const item of [...items].reverse().slice(0,12)){
    const card=make('div','saved-card');card.append(make('p','',item.text.slice(0,230)+(item.text.length>230?'…':'')));
    card.append(simpleButton('Remove',async()=>{await engine.deleteApproved(item.id,profile);await refreshSaved();},'quiet'));host.append(card);
  }
}
function testerActive(){
  const state=window.OnyxTester?.publicStatus?.();
  if(state?.active){testerToken='widget-tester-session';testerProfile=state.selectedProfile||'';testerExpiresAt=state.expiresAt||'';return true;}
  if(testerToken&&testerToken!=='widget-tester-session'){testerToken='';testerProfile='';testerExpiresAt='';}
  return false;
}
function testerUI(message,fail=false){
  $('tester-state').textContent=message;
  $('tester-state').classList.toggle('error',fail);
  $('tester-exit').hidden=!testerActive();
}
function testerMessage(message,fail=false){
  $('tester-dialog-message').textContent=message;
  $('tester-dialog-message').classList.toggle('error',fail);
}
function testerDialogClose(){const d=$('tester-dialog');if(d.open)d.close();}
function testerStep(which){$('tester-email-step').hidden=which!=='email';$('tester-code-step').hidden=which!=='code';const active=$('onyxTesterActiveStep');if(active)active.hidden=which!=='active';testerMessage('');}
function testerSetBusy(b){testerBusy=b;for(const id of ['tester-email-confirm','tester-code-confirm','tester-code-resend'])$(id).disabled=b;}
async function testerSendEmail(resend=false){
  if(testerBusy)return;
  const email=$('tester-email').value.trim().toLowerCase();
  if(email!=='williamsaville92@gmail.com'){testerMessage('Enter the exact tester email already registered in the existing backend.',true);return;}
  testerSetBusy(true);testerMessage(resend?'Requesting a new code…':'Requesting tester email…');
  try{
    const r=await engine.tester.request(email);
    testerStep('code');
    testerMessage((r.message||'If accepted, a code will arrive at the backend-configured email.')+' Remember: a resend made too soon will not produce a new code.');
    $('tester-code').focus();
  }catch(err){testerMessage('Email request failed: '+String(err.message||err),true);}
  finally{testerSetBusy(false);}
}
async function testerVerifyCode(){
  if(testerBusy)return;
  const code=$('tester-code').value.trim();
  if(!/^\d{6}$/.test(code)){testerMessage('Enter exactly six digits.',true);return;}
  testerSetBusy(true);testerMessage('Verifying code with the existing backend…');
  try{
    if(!testerActive()){
      const r=await engine.tester.verify(code);
      if(!r?.testerMode||!r.testerToken)throw new Error('The backend did not issue a tester session token.');
      testerToken='widget-tester-session';testerExpiresAt=r.expiresAt||'';testerProfile='';$('tester-code').value='';
    }
    // Verification does not select a profile; selection is mandatory before chatting.
    await ensureTesterProfile($('onyxTesterProfile')?.value||document.querySelector('input[name="profile"]:checked')?.value);
    $('provider').value='backend';
    testerUI('Read-only tester enabled for '+(testerProfile==='william'?'William (Papa)':'Jasper (Momma)')+'. '+(testerExpiresAt?'Expires '+new Date(testerExpiresAt).toLocaleString()+'.':'Backend specifies a three-hour session.')+' Live AI Brain requests are now available.');
    testerStep('active');syncProfileControls();
    $('connection-result').textContent='Email verified and profile selected. This does NOT prove the AI Brain is configured. Use Test AI Brain connection or generate one response.';
    testerDialogClose();
  }catch(err){testerMessage('Verification failed: '+String(err.message||err),true);if(testerActive())testerUI('Code verified, but profile selection failed. Retry the code confirmation or select a profile.',true);}
  finally{testerSetBusy(false);}
}
async function ensureTesterProfile(profile){
  if(!testerActive())throw new Error('Email tester code has not been verified or has expired.');
  // Backend tester session is globally selected; assert the correct scope before each request.
  const r=await engine.tester.select(testerToken,profile);
  if(r.testerMode!==true||(r.selectedProfile||window.OnyxTester?.publicStatus?.().selectedProfile)!==profile)throw new Error('Backend did not confirm the selected tester profile.');
  testerProfile=profile;testerExpiresAt=r.expiresAt||testerExpiresAt;
  return r;
}
function installTesterControls(){
  $('email-tester-code').addEventListener('click',()=>{if(!engine){testerUI('Corpus is still loading.',true);return;}testerStep('email');$('tester-dialog').showModal();$('tester-email').focus();});
  $('tester-email-confirm').addEventListener('click',()=>testerSendEmail(false));
  $('tester-email-cancel').addEventListener('click',testerDialogClose);
  $('tester-code-confirm').addEventListener('click',testerVerifyCode);
  $('tester-code-resend').addEventListener('click',()=>testerSendEmail(true));
  $('tester-code-cancel').addEventListener('click',testerDialogClose);
  $('tester-email').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();testerSendEmail(false);}});
  $('tester-code').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();testerVerifyCode();}});
  document.getElementById('onyxTesterClose')?.addEventListener('click',()=>$('tester-dialog').close());
  document.getElementById('onyxTesterOpen')?.addEventListener('click',()=>{if(!engine)return;testerStep(testerActive()?'active':'email');if(!$('tester-dialog').open)$('tester-dialog').showModal();});
  document.getElementById('onyxTesterExit')?.addEventListener('click',()=>$('tester-exit').click());
  $('onyxTesterProfile')?.addEventListener('change',async e=>{if(!testerActive())return;try{await ensureTesterProfile(e.target.value);syncProfileControls();testerUI('Read-only tester enabled for '+(testerProfile==='william'?'William (Papa)':'Jasper (Momma)')+'.');}catch(err){testerUI('Profile selection failed: '+err.message,true);}});
  $('tester-exit').addEventListener('click',async()=>{
    if(!testerActive())return;
    $('tester-exit').disabled=true;
    try{await engine.tester.exit(testerToken);testerToken='';testerProfile='';testerExpiresAt='';$('tester-exit').hidden=true;$('provider').value='backend';testerUI('Tester mode ended. No account data was changed.');syncProfileControls();}
    catch(err){testerUI('Could not end the tester session remotely: '+String(err.message||err)+'. Try Exit tester mode again.',true);}
    finally{$('tester-exit').disabled=false;}
  });
}
function syncProfileControls(){
  const isTester=testerActive(),actual=isTester?window.OnyxTester?.publicStatus?.().selectedProfile:resolveActiveProfile();
  const radios=[...document.querySelectorAll('input[name="profile"]')];
  if(actual&&['william','jasper'].includes(actual)){for(const radio of radios){radio.checked=radio.value===actual;radio.disabled=!isTester;}}
  else for(const radio of radios)radio.disabled=false;
  const label=$('active-profile');if(label)label.textContent=actual==='william'?'William · Papa':actual==='jasper'?'Jasper · Momma':isTester?'Choose a tester profile':'Choose a profile or verify tester access';
  const select=$('onyxTesterProfile');if(select&&actual&&['william','jasper'].includes(actual))select.value=actual;
  const exit=$('tester-exit');if(exit)exit.hidden=!isTester;
  const testerStatus=$('tester-state');if(testerStatus&&isTester)testerStatus.textContent='Read-only tester is active for '+(actual==='william'?'William (Papa)':actual==='jasper'?'Jasper (Momma)':'an unselected profile')+'.';
}
function syncMoodControls(){
  const option=document.querySelector('#mood option[value="professor"]'),isProfessor=selection('mode')==='professor';
  if(option)option.disabled=!isProfessor;
  if(!isProfessor&&$('mood')?.value==='professor')$('mood').value='auto';
}
async function generate(){if(!engine){status('Corpus has not loaded.',true);return;}
  const profile=selection('profile'),mode=selection('mode'),provider=$('provider').value,count=Number($('count').value),sessionToken=$('token').value.trim();
  if(provider==='backend'&&!testerActive()&&!resolveActiveProfile()){status('Sign in to the matching OurSpace account or verify the existing tester code before using live AI Brain mode.',true);return;}
  if(provider==='backend'&&testerActive()){try{await ensureTesterProfile(profile);}catch(err){status('Tester profile selection failed: '+err.message,true);return;}}
  abort=new AbortController();$('generate').disabled=true;$('cancel').disabled=false;$('results').replaceChildren();lastResults=[];
  status('Preparing contextual references…');generateCurrent=0;generateTotal=count;startGenerateTicker();
  try{
    const result=await engine.generate({profile,mode,provider,count,mood:$('mood').value,input:$('prompt').value,sessionToken,testerToken:provider==='backend'&&testerActive()?'widget-tester-session':'',signal:abort.signal,
      onRequest:(i,total)=>{generateCurrent=i;generateTotal=total;generateStarted=Date.now();status(`Requesting live response ${i}/${total} from the AI Brain. This can take several minutes.`);},
      onProgress:(entry,i,total)=>{lastResults.push(entry);$('results').append(renderCard(entry));$('results-count').textContent=`${i} / ${total} responses`;status(`${i} of ${total} responses prepared · ${entry.source==='backend-tester-readonly'?'read-only tester':entry.source==='backend-ai-brain'?'AI Brain assertion':entry.source==='backend-unverified'?'backend (unverified)':entry.source==='local-social-repair-not-llm'?'local social repair':'offline preview'}`);}});
    status(`Completed ${result.entries.length} response(s) (${result.entries.filter(x=>x.source.startsWith('backend')).length} backend, ${result.entries.filter(x=>!x.source.startsWith('backend')).length} local) using ${result.referenceCount} contextual references. ${result.usedWasm?'WASM ranking active.':'JavaScript ranking fallback.'}`);
  }catch(err){const msg=String(err.message||err);status(msg,true);$('connection-result').textContent='AI Brain generation error: '+msg;if(!lastResults.length)$('results').append(make('div','empty','No AI Brain response was returned. Email verification succeeded, but the AI Brain call did not. Check the error above. Local drafting remains available separately and is not an LLM.'));}
  finally{stopGenerateTicker();generateCurrent=0;abort=null;$('generate').disabled=false;$('cancel').disabled=true;}
}

function scope(){return {profile:selection('profile'),mode:selection('mode'),threadId:$('thread-id').value.trim()||'default'};}
function messageNode(role,text){const n=make('div','dialogue-msg '+(role==='You'?'user':''));n.append(make('span','who',role),make('div','',text));return n;}
async function refreshDialogue(){
  const {profile,mode,threadId}=scope();const turns=await memory.turns(profile,mode,threadId,40),feed=$('dialogue-feed');feed.replaceChildren();
  if(!turns.length)feed.append(make('p','muted','No locally saved turns in this thread.'));
  for(const t of turns){feed.append(messageNode('You',t.user),messageNode('Onyx',t.assistant));}
  $('dialogue-health').textContent=`${turns.length} local turns`;
}
async function refreshNotes(){
  const {profile,mode}=scope(),facts=await memory.facts(profile,mode),list=$('memory-list');list.replaceChildren();
  if(['health','professor'].includes(mode)){list.append(make('p','muted','Local notes are disabled in Virtual & Health and Professor conversations.'));return;}
  if(!facts.length)list.append(make('p','muted','No approved notes for this profile and mode.'));
  for(const fact of facts){const n=make('div','saved-card');n.append(make('p','',fact.text),simpleButton('Forget',async()=>{
    await memory.forget({profile,mode,id:fact.id});await refreshNotes();},'quiet'));list.append(n);}
}
async function sendDialogue(){
  if(!conversation){$('dialogue-status').textContent='Conversation engine not loaded.';return;}
  const {profile,mode,threadId}=scope(),input=$('dialogue-input').value.trim(),sessionToken=$('token').value.trim(),provider=$('provider').value;
  if(provider==='backend'&&!testerActive()&&!resolveActiveProfile()){$('dialogue-status').textContent='Sign in to the matching OurSpace account or verify the existing tester code in Work.';return;}
  if(!input){$('dialogue-status').textContent='Enter a message.';return;}
  const button=$('dialogue-send');button.disabled=true;$('dialogue-status').textContent='Requesting live Onyx reply from the existing backend…';
  try{
    if(provider==='backend'&&testerActive())await ensureTesterProfile(profile);
    const restricted=['health','professor'].includes(mode);
    const result=await engine.chat({profile,mode,threadId,input,sessionToken,testerToken:provider==='backend'&&testerActive()?'widget-tester-session':'',provider,rememberTurn:!restricted&&$('remember-turn').checked,includeFacts:!restricted&&$('include-facts').checked});
    const feed=$('dialogue-feed');if(!feed.querySelector('.dialogue-msg'))feed.replaceChildren();
    feed.append(messageNode('You',input),messageNode('Onyx',result.text));feed.scrollTop=feed.scrollHeight;
    $('dialogue-input').value='';$('dialogue-status').textContent=`${result.source==='backend-tester-readonly'?'Read-only tester backend returned an AI Brain reply (Gemini model not independently verified)':result.source==='local-social-repair-not-llm'?'Backend reply was off-topic; substituted a labeled local draft (not LLM)':provider==='offline-preview'?'Local draft (not LLM)':result.geminiConfirmed?'Backend identified Gemini provider':'Backend reply received (Gemini provider unverified)'}. ${result.storedLocally?'Turn saved on this device.':'Turn not saved.'} ${result.quality.warnings.length?'Review: '+result.quality.warnings.join(', '):'Quality checks passed.'}`;
    await refreshNotes();$('dialogue-health').textContent=result.storedLocally?'Turns saved locally':'Current reply not saved';
  }catch(err){$('dialogue-status').textContent='No live reply: '+String(err.message||err);}
  finally{button.disabled=false;}
}

async function setup(){
  $('endpoint').textContent='Existing Apps Script /exec · authenticated brain + temporary read-only tester';
  installTesterControls();
  syncProfileControls();
  syncMoodControls();
  $('onyxVoiceClose').addEventListener('click',()=>document.getElementById('onyxVoiceDialog')?.close());
  $('check-connection').addEventListener('click',async()=>{
    const target=$('connection-result'),button=$('check-connection');
    if(!engine){target.textContent='Corpus has not loaded.';return;}
    if(!testerActive()&&!resolveActiveProfile()){target.textContent='Sign in to an OurSpace account or verify the read-only tester code first.';return;}
    button.disabled=true;target.textContent='Checking the selected account or read-only tester route with one natural greeting…';
    try{
      const {profile,mode}=scope();
      if(testerActive())await ensureTesterProfile(profile);
      const r=await engine.chat({profile,mode,threadId:'generator-connection-check',input:'Hey buddy, how are you doing?',provider:'backend',testerToken:testerActive()?'widget-tester-session':'',rememberTurn:false,includeFacts:false,qualityRetry:true});
      target.textContent=r.source==='backend-tester-readonly'?'Read-only tester backend returned an AI Brain reply: “'+r.text.slice(0,220)+'” (exact Gemini model not attested).':r.aiBrainConfirmed?'Canonical Onyx backend verified an LLM reply: “'+r.text.slice(0,220)+'” (provider '+(r.geminiConfirmed?'Gemini':'not attested')+').':'Reply received, but LLM verification was not confirmed.';
    }catch(err){target.textContent='Tester connection test failed (email verification is separate from AI Brain configuration): '+String(err?.message||err);}
    finally{button.disabled=false;}
  });
  $('generate').addEventListener('click',generate);
  $('dialogue-send').addEventListener('click',sendDialogue);
  $('dialogue-clear').addEventListener('click',async()=>{
    const {profile,mode,threadId}=scope();if(!confirm(`Clear only saved turns in ${profile}/${mode}/${threadId}?`))return;
    const n=await engine.clearConversation(profile,mode,threadId);$('dialogue-status').textContent=`Cleared ${n} locally saved turn(s).`;await refreshDialogue();
  });
  $('thread-id').addEventListener('change',refreshDialogue);
  $('memory-add').addEventListener('click',async()=>{
    const {profile,mode}=scope();if(['health','professor'].includes(mode)){$('dialogue-status').textContent='Local note memory is disabled in Virtual & Health and Professor conversations.';return;}try{await memory.remember({profile,mode,text:$('memory-input').value});$('memory-input').value='';await refreshNotes();$('dialogue-status').textContent='Approved memory saved locally in this profile and mode.';}catch(err){$('dialogue-status').textContent=err.message;}
  });
  $('memory-export').addEventListener('click',async()=>{const {profile,mode}=scope();download(`onyx-memory-${profile}-${mode}.json`,await memory.exportScope(profile,mode),'application/json');});

  $('cancel').addEventListener('click',()=>{abort?.abort();status('Cancellation requested.');});
  document.querySelectorAll('input[name="profile"]').forEach(el=>el.addEventListener('change',async()=>{if(testerActive()){try{await ensureTesterProfile(el.value);}catch(err){status('Tester profile selection failed: '+err.message,true);syncProfileControls();return;}}else{syncProfileControls();}lastResults=[];$('results').replaceChildren(make('div','empty','Profile changed. New results will use only this profile’s examples and approvals.'));$('results-count').textContent='0 results';refreshSaved();refreshDialogue();refreshNotes();}));
  document.querySelectorAll('input[name="mode"]').forEach(el=>el.addEventListener('change',()=>{syncMoodControls();refreshNotes();refreshDialogue();}));
  $('export-json').addEventListener('click',async()=>{if(!engine)return;const profile=selection('profile');download(`onyx-approved-${profile}.json`,await engine.exportSaved(profile),'application/json');});
  $('export-js').addEventListener('click',async()=>{if(!engine)return;download('onyx-responses.generated.js',await engine.exportWidgetJS(selection('profile')),'text/javascript');});
  $('clear-saved').addEventListener('click',async()=>{if(!engine)return;const profile=selection('profile');if(!confirm(`Delete all locally approved ${profile} responses in this browser?`))return;
    const count=await engine.clearApproved(profile);status(`Removed ${count} locally approved response(s) for ${profile}.`);refreshSaved();});
  try{
    engine=await createOnyxResponses({conversationMemory:memory,backendClient:createOurSpaceBackendAdapter(),fetchImpl:globalThis.__ONYX_ASSET_FETCH||globalThis.fetch});$('source-count').textContent=engine.exampleCount.toLocaleString();$('wasm-status').textContent=engine.usedWasm?'Active':'JS';
    $('load-state').textContent='Corpus ready';status('Ready: all 10,000 voice references, all four lanes, and the canonical Onyx backend are connected. Local approvals remain optional; Professor and health chats are not saved on this device.');
    conversation=engine;await refreshSaved();await refreshNotes();await refreshDialogue();
  }catch(err){$('load-state').textContent='Not loaded';status('Could not start: '+err.message+' Check that the complete response-generator JSON corpus and WASM files are deployed beside the OurSpace widget, then reload.',true);}
}
setup();
