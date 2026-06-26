
(() => {
  'use strict';
  const ACCOUNTS_KEY = 'ourspace_accounts_v2';
  const SESSION_KEY = 'ourspace_session_v2';
  const CURRENCY_PREFIX = 'ourspace_currency_';
  const LEDGER_PREFIX = 'ourspace_ledger_';
  const START_PREFIX = 'ourspace_start_day_';
  const TASKS_PREFIX = 'ourspace_tasks_';
  const ACTIVE_DAY_PREFIX = 'ourspace_active_day_';
  const SHARED_CALENDAR_KEY = 'ourspace_shared_calendar_v1';
  const USER_CALENDAR_PREFIX = 'ourspace_calendar_';
  const STORE_PREFIX = 'ourspace_store_';
  const SKILL_DONE_PREFIX = 'ourspace_skills_done_';
  const MESSAGE_THREAD_KEY = 'ourspace_private_william_jasper_messages_v1';
  const $ = (id) => document.getElementById(id);
  const person = detectPerson();
  const isAdmin = () => location.hash.toLowerCase().includes('admin');
  const aliases = {
    itemIdKeys:['id','itemId','item_id','itemID','slug','key','code','handle','name','title','label','itemName','item_name','taskId','task_id','eventId','event_id','skillId','skill_id','worksheetId','worksheet_id','handoutId','handout_id'],
    sectionKeys:['section','sectionId','section_id','category','categoryId','category_id','aisle','aisleId','list','listId','module','moduleId','type','kind','group','folder','collection'],
    dateKeys:['date','day','taskDate','task_date','dueDate','due_date','scheduledDate','scheduled_date','startDate','start_date'],
    timeKeys:['time','startTime','start_time','at','hour','appointmentTime','appointment_time','reminderTime','reminder_time'],
    titleKeys:['title','name','label','text','task','taskName','task_name','event','eventName','event_name','skill','skillName','skill_name','item','itemName','item_name'],
    rewardKeys:['rewardCopper','reward_copper','copperReward','copper_reward','reward','coins','currency','earn','payout','valueCopper','value_copper']
  };
  function detectPerson(){
    const file = location.pathname.split('/').pop().toLowerCase();
    if(file.includes('jasper')) return 'jasper';
    if(file.includes('william')) return 'william';
    return 'william';
  }
  function prettyPerson(){return person.charAt(0).toUpperCase() + person.slice(1);}
  function readJSON(key, fallback){try{return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));}catch{return fallback;}}
  function writeJSON(key, value){localStorage.setItem(key, JSON.stringify(value));}
  function normalizeEmail(value){return String(value || '').trim().toLowerCase();}
  function session(){return readJSON(SESSION_KEY, null);}
  function account(){const s=session(); const all=readJSON(ACCOUNTS_KEY, {}); return s && s.email ? (all[normalizeEmail(s.email)] || s) : null;}
  function displayName(){const a=account(); if(isAdmin()) return 'Admin Tester'; return (a && (a.nickname || a.username || (a.email || '').split('@')[0])) || prettyPerson();}
  function todayISO(){return new Date().toISOString().slice(0,10);}
  function localDateTime(date, time){return `${date || todayISO()}T${time || '09:00'}`;}
  function esc(text){return String(text ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  function slug(text){return String(text || '').trim().toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') || 'item';}
  function firstValue(obj, keys, fallback=''){
    if(!obj || typeof obj !== 'object') return fallback;
    for(const k of keys){ if(obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== '') return obj[k]; }
    return fallback;
  }
  function recordId(obj){return slug(firstValue(obj, aliases.itemIdKeys, firstValue(obj, aliases.titleKeys, 'item')));}
  function recordTitle(obj){return String(firstValue(obj, aliases.titleKeys, recordId(obj))).trim();}
  function recordSection(obj, fallback='general'){return slug(firstValue(obj, aliases.sectionKeys, fallback));}
  function recordDate(obj, fallback=todayISO()){return String(firstValue(obj, aliases.dateKeys, fallback)).slice(0,10);}
  function recordTime(obj, fallback=''){return String(firstValue(obj, aliases.timeKeys, fallback));}
  function parseCopper(value, fallback){const n=Number(value); return Number.isFinite(n) && n > 0 ? Math.round(n) : fallback;}
  function normalizeTask(raw, origin='local'){
    const obj = typeof raw === 'object' && raw ? raw : {title:String(raw || '')};
    return {id:recordId(obj), title:recordTitle(obj), section:recordSection(obj,'daily'), date:recordDate(obj), time:recordTime(obj,''), durationMinutes:parseCopper(obj.durationMinutes || obj.duration || obj.minutes, 45), rewardCopper:parseCopper(firstValue(obj, aliases.rewardKeys, ''), 100), origin, notes:obj.notes || obj.description || obj.details || ''};
  }
  function normalizeCalendar(raw, origin='local'){
    const obj = typeof raw === 'object' && raw ? raw : {title:String(raw || '')};
    return {id:recordId(obj) + '-' + Math.random().toString(16).slice(2,7), title:recordTitle(obj), type:String(obj.type || obj.kind || obj.category || 'event'), date:recordDate(obj), time:recordTime(obj,''), owner:String(obj.owner || obj.user || obj.person || origin), notes:obj.notes || obj.description || obj.details || ''};
  }
  function normalizeStore(raw, origin='local'){
    const obj = typeof raw === 'object' && raw ? raw : {title:String(raw || '')};
    return {id:recordId(obj), title:recordTitle(obj), section:recordSection(obj,'store'), priceCopper:parseCopper(obj.priceCopper || obj.price_copper || obj.costCopper || obj.cost || obj.price || 0, 0), origin, notes:obj.notes || obj.description || ''};
  }
  function normalizeSkill(raw, origin='local'){
    const obj = typeof raw === 'object' && raw ? raw : {title:String(raw || '')};
    return {id:recordId(obj), title:recordTitle(obj), category:obj.category || obj.section || obj.type || 'DBT / ADHD', type:obj.type || obj.file_type || 'resource', path:obj.path || obj.url || obj.href || '', origin, rewardCopper:parseCopper(firstValue(obj, aliases.rewardKeys, ''), 100)};
  }
  async function fetchJSON(path, fallback){try{const r = await fetch(path, {cache:'no-store'}); if(!r.ok) throw new Error(r.status); return await r.json();}catch{return fallback;}}
  function ensureAccess(){
    if(isAdmin()) return;
    const s = session();
    if(!s || !s.email){ location.href = 'OurSpace.html'; }
  }
  function showMessage(id, text, cls=''){const el=$(id); if(!el) return; el.textContent = text || ''; el.className = 'message ' + cls;}
  const totalToCoins = (total) => {
    let remaining = Math.max(0, Math.floor(Number(total) || 0));
    const platinum = Math.floor(remaining / 1000); remaining %= 1000;
    const gold = Math.floor(remaining / 100); remaining %= 100;
    const silver = Math.floor(remaining / 10); remaining %= 10;
    return {platinum,gold,silver,copper:remaining};
  };
  const coinsToText = (total) => {const c=totalToCoins(total); return `${c.platinum} platinum, ${c.gold} gold, ${c.silver} silver, ${c.copper} copper`;};
  function currencyKey(){return CURRENCY_PREFIX + person + '_v1';}
  function ledgerKey(){return LEDGER_PREFIX + person + '_v1';}
  function getCurrency(){return Math.max(0, Math.floor(Number(readJSON(currencyKey(), {totalCopper:0}).totalCopper) || 0));}
  function setCurrency(total){const clean=Math.max(0, Math.floor(Number(total)||0)); writeJSON(currencyKey(), {schema:'ourspace.currency.v2', person, totalCopper:clean, currency:totalToCoins(clean), updatedAt:new Date().toISOString()}); renderCurrency();}
  function ledger(){return readJSON(ledgerKey(), []);}
  function addLedger(entry){const next=[{at:new Date().toISOString(), person, ...entry}, ...ledger()].slice(0,400); writeJSON(ledgerKey(), next); renderLedger();}
  function awardCurrency(totalCopper, reason, source, meta={}){const amount=Math.max(0,Math.floor(Number(totalCopper)||0)); if(!amount) return; setCurrency(getCurrency()+amount); addLedger({type:'earn', amountCopper:amount, display:'+'+coinsToText(amount), reason, source, meta});}
  function spendCurrency(totalCopper, reason, meta={}){const amount=Math.max(0,Math.floor(Number(totalCopper)||0)); const current=getCurrency(); if(amount>current) return false; setCurrency(current-amount); addLedger({type:'spend', amountCopper:amount, display:'-'+coinsToText(amount), reason, source:'store', meta}); return true;}
  function renderCurrency(){const total=getCurrency(); const c=totalToCoins(total); ['Copper','Silver','Gold','Platinum'].forEach(name => {const el=$('coin'+name); if(el) el.textContent=c[name.toLowerCase()];}); const text=$('currencyText'); if(text) text.textContent=coinsToText(total);}
  function renderLedger(){const box=$('ledgerList'); if(!box) return; const items=ledger(); if(!items.length){box.innerHTML='<div class="empty">No earned currency history yet. Starting the day, completing tasks, skills, worksheets, handouts, and game milestones will appear here.</div>';return;} box.innerHTML=items.map(x=>`<div class="row"><div><strong>${esc(x.display || '')}</strong><small>${esc(x.reason || '')} · ${esc(x.source || '')} · ${new Date(x.at).toLocaleString()}</small></div><span class="tag">${esc(x.type || 'entry')}</span></div>`).join('');}
  let userTasks = [], sharedTasks = [], activeSchedule = [], storeItems = [], skillItems = [], calendarItems = [], games = [];
  let gameMinuteTimer = null;
  let gameMinuteCount = 0;
  function taskStorageKey(){return TASKS_PREFIX + person + '_v1';}
  function allTasks(){return [...sharedTasks, ...userTasks, ...readJSON(taskStorageKey(), [])].map((x,i)=>normalizeTask(x, x.origin || (i < sharedTasks.length ? 'shared' : person)));}
  function saveLocalTasks(tasks){writeJSON(taskStorageKey(), tasks);}
  function tasksForDate(date){return allTasks().filter(t => t.date === date);}
  function addLocalTask(task){const tasks=readJSON(taskStorageKey(), []); tasks.push(task); saveLocalTasks(tasks); renderTasks();}
  function moveTask(taskId, fromDate, toDate){
    const local = readJSON(taskStorageKey(), []).map(x=>normalizeTask(x, person));
    const idx = local.findIndex(t => t.id === taskId && t.date === fromDate);
    if(idx >= 0){local[idx].date = toDate; saveLocalTasks(local); showMessage('taskMessage','Task moved.','success'); renderTasks(); return;}
    const copy = allTasks().find(t=>t.id===taskId && t.date===fromDate);
    if(copy){addLocalTask({...copy, date:toDate, origin:person, id:copy.id + '-copy-' + toDate}); showMessage('taskMessage','Shared/JSON task copied into your local day.','success');}
  }
  function scheduleFrom(startTime, tasks, pace){
    const [h,m] = String(startTime || '09:00').split(':').map(Number); const d = new Date(); d.setHours(h||9,m||0,0,0);
    return tasks.map((task, idx) => {const at = new Date(d.getTime() + idx * pace * 60000); return {...task, scheduledTime:at.toLocaleTimeString([], {hour:'numeric', minute:'2-digit'})};});
  }
  function startDay(){
    const date = $('dailyDate').value || todayISO(); const start = $('startTime').value || '09:00'; const pace = Number($('paceMinutes').value || 60);
    const dayKey = START_PREFIX + person + '_' + date;
    activeSchedule = scheduleFrom(start, tasksForDate(date), pace); writeJSON(ACTIVE_DAY_PREFIX + person, {date,start,pace,activeSchedule,startedAt:new Date().toISOString()});
    if(!readJSON(dayKey, false)){writeJSON(dayKey, true); awardCurrency(5000, `Started ${date}`, 'start-day', {date,start}); showMessage('startDayMessage','Day started. You earned 5 platinum.','success');}
    else{showMessage('startDayMessage','Day loaded. The 5 platinum start-day reward was already earned for this date.','warning');}
    renderSchedule(); renderTasks();
  }
  function renderSchedule(){const box=$('scheduleList'); if(!box) return; const saved=readJSON(ACTIVE_DAY_PREFIX + person, null); const rows=activeSchedule.length ? activeSchedule : (saved && saved.activeSchedule) || []; if(!rows.length){box.innerHTML='<div class="empty">Press Start Day to build a by-the-hour schedule from that day’s tasks.</div>';return;} box.innerHTML=rows.map(task=>`<div class="slot"><div class="slot-time">${esc(task.scheduledTime || task.time || '')}</div><div><strong>${esc(task.title)}</strong><small>${esc(task.section)} · ${esc(task.notes || '')}</small></div><button type="button" data-complete-task="${esc(task.id)}">Done</button></div>`).join('');}
  function renderTasks(){
    const date=$('dailyDate')?.value || todayISO(); const list=$('taskList'); if(!list) return; const tasks=tasksForDate(date);
    if(!tasks.length){list.innerHTML='<div class="empty">No tasks filled for this day yet. Add/import tasks when ready, or pull tasks from another day.</div>'; return;}
    list.innerHTML=tasks.map(t=>`<div class="row"><div><strong>${esc(t.title)}</strong><small>${esc(t.section)} · ${esc(t.origin)} · reward ${coinsToText(t.rewardCopper)}</small></div><div class="actions"><button type="button" data-complete-task="${esc(t.id)}">Done</button><button class="ghost" type="button" data-move-task="${esc(t.id)}" data-from-date="${esc(t.date)}">Move</button></div></div>`).join('');
  }
  function renderCalendar(){const box=$('calendarList'); if(!box) return; const items=[...calendarItems, ...readJSON(SHARED_CALENDAR_KEY, []), ...readJSON(USER_CALENDAR_PREFIX + person + '_v1', [])].map(x=>normalizeCalendar(x, x.owner || 'shared')).sort((a,b)=>localDateTime(a.date,a.time).localeCompare(localDateTime(b.date,b.time))); if(!items.length){box.innerHTML='<div class="empty">No shared events, appointments, or reminders yet.</div>';return;} box.innerHTML=items.map(e=>`<div class="row"><div><strong>${esc(e.title)}</strong><small>${esc(e.type)} · ${esc(e.date)} ${esc(e.time)} · visible to both users when saved as shared</small><small>${esc(e.notes)}</small></div><span class="tag">${esc(e.owner)}</span></div>`).join('');}
  function addCalendarEvent(){const event=normalizeCalendar({title:$('eventTitle').value,type:$('eventType').value,date:$('eventDate').value,time:$('eventTime').value,notes:$('eventNotes').value,owner:displayName()}, 'shared'); if(!event.title){showMessage('calendarMessage','Add a title first.','warning');return;} const items=readJSON(SHARED_CALENDAR_KEY, []); items.push(event); writeJSON(SHARED_CALENDAR_KEY, items); ['eventTitle','eventNotes'].forEach(id=>$(id).value=''); showMessage('calendarMessage','Saved to shared calendar. Both user pages will see it in this browser/site storage.','success'); renderCalendar();}
  function renderStore(){const box=$('storeList'); if(!box) return; const items=[...storeItems, ...readJSON(STORE_PREFIX + person + '_v1', [])].map(x=>normalizeStore(x, x.origin || person)); if(!items.length){box.innerHTML='<div class="empty">Store inventory is intentionally empty. Fill json/shared/store.json, json/'+person+'/store.json, or import items later. Direct currency adding is not available.</div>';return;} box.innerHTML=items.map(item=>`<div class="card"><h3>${esc(item.title)}</h3><p>${esc(item.section)} · ${esc(item.origin)}</p><p>${item.priceCopper ? esc(coinsToText(item.priceCopper)) : 'No price set'}</p><button type="button" data-buy-item="${esc(item.id)}">Buy / Redeem</button></div>`).join('');}
  function renderSkills(){const box=$('skillList'); if(!box) return; const q=($('skillSearch').value || '').toLowerCase(); const filtered=skillItems.filter(s=>!q || `${s.title} ${s.category} ${s.type}`.toLowerCase().includes(q)); if(!filtered.length){box.innerHTML='<div class="empty">No matching skills.</div>';return;} box.innerHTML=filtered.slice(0,80).map(s=>`<div class="card"><h3>${esc(s.title)}</h3><p>${esc(s.category)} · ${esc(s.type)} · ${esc(s.origin)}</p><div class="actions"><a class="button" href="${esc(s.path || '#')}" target="_blank" rel="noopener noreferrer" data-open-skill="${esc(s.id)}">Open</a><button type="button" data-complete-skill="${esc(s.id)}">Mark Done</button></div></div>`).join('');}
  function renderGames(){const box=$('gameList'); if(!box) return; const q=($('gameSearch').value || '').toLowerCase(); const filtered=games.filter(g=>!q || `${g.title} ${g.genre} ${(g.categories||[]).join(' ')}`.toLowerCase().includes(q)); if(!filtered.length){box.innerHTML='<div class="empty">No games matched. Existing game files are preserved in modules/games.</div>'; return;} box.innerHTML=filtered.map(g=>`<div class="card"><h3>${esc(g.title)}</h3><p>${esc(g.genre || 'game')} ${g.isMultiplayer ? '· multiplayer-aware' : ''}</p><p>${esc((g.rewardBridge && g.rewardBridge.mode) || 'reward bridge')}</p><div class="actions"><button type="button" data-launch-game="${esc(g.slug)}">Open Viewer</button>${g.fallbackUrl ? `<a class="button" href="${esc(g.fallbackUrl)}" target="_blank" rel="noopener noreferrer">Fallback</a>` : ''}</div></div>`).join('');}
  function openGame(slugId){
    const g=games.find(x=>x.slug===slugId || x.id===slugId); if(!g) return;
    $('gameFrame').src = g.file || `modules/games/${slugId}.html`;
    $('gameFrameTitle').textContent = g.title;
    $('gameOverlay').classList.add('open');
    gameMinuteCount = 0;
    if($('gameMinuteStatus')) $('gameMinuteStatus').textContent = 'Minute tracking started. Earned fallback rewards post automatically each full minute while the viewer stays open.';
    clearInterval(gameMinuteTimer);
    gameMinuteTimer = setInterval(() => {
      gameMinuteCount += 1;
      awardCurrency(10, `Fallback minute tracked: ${g.title} minute ${gameMinuteCount}`, 'mobile-game-minute', {game:g.slug, minute:gameMinuteCount});
      if($('gameMinuteStatus')) $('gameMinuteStatus').textContent = `Tracked ${gameMinuteCount} minute(s) in viewer. Last automatic reward: +1 silver.`;
    }, 60000);
  }
  function closeGame(){
    clearInterval(gameMinuteTimer); gameMinuteTimer = null;
    const f=$('gameFrame'); if(f) f.src='about:blank';
    $('gameOverlay').classList.remove('open');
  }
  function exportJSON(filename, data){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename; a.click(); setTimeout(()=>URL.revokeObjectURL(url),500);}
  function importJSON(file, callback){const reader=new FileReader(); reader.onload=()=>{try{callback(JSON.parse(reader.result));}catch{alert('Import failed: not valid JSON.');}}; reader.readAsText(file);}
  function initNavigation(){document.querySelectorAll('[data-page]').forEach(btn=>btn.addEventListener('click',()=>showPage(btn.dataset.page))); $('hamburger')?.addEventListener('click',()=>{$('mainNav').classList.toggle('open');}); const page=new URLSearchParams(location.search).get('page') || 'home'; showPage(page);}
  function showPage(page){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active', s.id === 'screen-' + page)); document.querySelectorAll('[data-page]').forEach(b=>b.setAttribute('aria-current', b.dataset.page===page?'page':'false')); document.body.classList.toggle('daily-page-active', page === 'daily'); history.replaceState(null,'', location.pathname + '?page=' + encodeURIComponent(page) + location.hash); window.scrollTo({top:0,behavior:'smooth'}); renderMessages();}
  async function loadData(){
    const sharedTaskData = await fetchJSON('json/shared/tasks.json', {tasks:[]});
    const userTaskData = await fetchJSON(`json/${person}/tasks.json`, {tasks:[]});
    sharedTasks = (Array.isArray(sharedTaskData) ? sharedTaskData : (sharedTaskData.tasks || sharedTaskData.items || [])).map(x=>normalizeTask(x,'shared'));
    userTasks = (Array.isArray(userTaskData) ? userTaskData : (userTaskData.tasks || userTaskData.items || [])).map(x=>normalizeTask(x,person));
    const sharedStore = await fetchJSON('json/shared/store.json', {items:[]}); const userStore = await fetchJSON(`json/${person}/store.json`, {items:[]});
    storeItems = [...(Array.isArray(sharedStore)?sharedStore:(sharedStore.items||sharedStore.store||[])).map(x=>normalizeStore(x,'shared')), ...(Array.isArray(userStore)?userStore:(userStore.items||userStore.store||[])).map(x=>normalizeStore(x,person))];
    const sharedSkills = await fetchJSON('json/shared/skills.json', {items:[]}); const userSkills = await fetchJSON(`json/${person}/skills.json`, {items:[]});
    const customSkills = [...(Array.isArray(sharedSkills)?sharedSkills:(sharedSkills.items||sharedSkills.skills||[])).map(x=>normalizeSkill(x,'shared')), ...(Array.isArray(userSkills)?userSkills:(userSkills.items||userSkills.skills||[])).map(x=>normalizeSkill(x,person))];
    skillItems = customSkills;
    const sharedCal = await fetchJSON('json/shared/calendar.json', {events:[]}); calendarItems = (Array.isArray(sharedCal)?sharedCal:(sharedCal.events||sharedCal.items||sharedCal.calendar||[])).map(x=>normalizeCalendar(x,'shared-json'));
    games = (window.OURSPACE_EMBEDDED_GAMES || []);
    renderAll();
  }

  function peerPerson(){return person === 'william' ? 'jasper' : 'william';}
  function prettyName(value){return String(value || '').charAt(0).toUpperCase() + String(value || '').slice(1);}
  function messageThread(){return readJSON(MESSAGE_THREAD_KEY, []);}
  function saveMessageThread(items){writeJSON(MESSAGE_THREAD_KEY, items.slice(-150));}
  function messageTime(iso){
    try{return new Date(iso).toLocaleString([], {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'});}
    catch{return '';}
  }
  function unreadMessages(){
    return messageThread().filter(m => m && m.to === person && !(m.readBy && m.readBy[person])).length;
  }
  function markMessagesRead(){
    const items = messageThread();
    let changed = false;
    items.forEach(m => {
      if(m && m.to === person){
        m.readBy = m.readBy || {};
        if(!m.readBy[person]){m.readBy[person] = true; changed = true;}
      }
    });
    if(changed) saveMessageThread(items);
  }
  function renderMessages(){
    const log=$('messageLog'); const peer=$('messagePeer'); const badge=$('messageUnread');
    if(peer) peer.textContent = prettyName(peerPerson());
    if(!log || !badge) return;
    const items = messageThread().filter(m => (m.from === person && m.to === peerPerson()) || (m.from === peerPerson() && m.to === person));
    const unread = unreadMessages();
    badge.hidden = unread < 1; badge.textContent = String(unread);
    if(!items.length){log.innerHTML='<div class="message-empty">No messages yet.</div>'; return;}
    log.innerHTML = items.slice(-50).map(m => `<div class="message-bubble ${m.from === person ? 'mine' : ''}"><div>${esc(m.text || '')}</div><small>${esc(prettyName(m.from))} · ${esc(messageTime(m.at))}</small></div>`).join('');
    log.scrollTop = log.scrollHeight;
  }
  function playMessageDing(){
    const audio=$('messageDing');
    if(!audio) return;
    try{audio.currentTime = 0; audio.play().catch(()=>{});}catch{}
  }
  function sendPrivateMessage(){
    const input=$('messageText'); if(!input) return;
    const text=input.value.trim();
    if(!text) return;
    const items=messageThread();
    items.push({id:'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2,7), from:person, to:peerPerson(), text, at:new Date().toISOString(), readBy:{[person]:true}});
    saveMessageThread(items);
    input.value='';
    renderMessages();
  }
  function initMessages(){
    $('messageToggle')?.addEventListener('click', () => {
      const panel=$('messagePanel'); const btn=$('messageToggle'); if(!panel || !btn) return;
      const opening = panel.hidden;
      panel.hidden = !opening;
      btn.setAttribute('aria-expanded', opening ? 'true' : 'false');
      if(opening) markMessagesRead();
      renderMessages();
    });
    $('sendMessage')?.addEventListener('click', sendPrivateMessage);
    $('messageText')?.addEventListener('keydown', event => {
      if(event.key === 'Enter' && !event.shiftKey){event.preventDefault(); sendPrivateMessage();}
    });
    window.addEventListener('storage', event => {
      if(event.key === MESSAGE_THREAD_KEY){
        const before = unreadMessages();
        renderMessages();
        if(before > 0 && document.body.classList.contains('daily-page-active')) playMessageDing();
      }
    });
    setInterval(renderMessages, 5000);
    renderMessages();
  }

  function renderAll(){renderCurrency(); renderLedger(); renderTasks(); renderSchedule(); renderCalendar(); renderStore(); renderSkills(); renderGames(); renderMessages();}
  function attachEvents(){
    $('logout')?.addEventListener('click',()=>{if(!isAdmin()) localStorage.removeItem(SESSION_KEY); location.href='OurSpace.html';});
    $('dailyDate').value = todayISO(); $('eventDate').value = todayISO();
    $('startDay')?.addEventListener('click', startDay); $('dailyDate')?.addEventListener('change', renderTasks);
    $('addTask')?.addEventListener('click',()=>{const title=$('newTaskTitle').value.trim(); if(!title){showMessage('taskMessage','Add a task title first.','warning');return;} addLocalTask(normalizeTask({title,date:$('newTaskDate').value || $('dailyDate').value || todayISO(), section:$('newTaskSection').value || 'daily', durationMinutes:$('newTaskDuration').value || 45}, person)); $('newTaskTitle').value=''; showMessage('taskMessage','Task added locally.','success');});
    $('pullTasks')?.addEventListener('click',()=>{const from=$('pullFromDate').value; const to=$('dailyDate').value || todayISO(); if(!from){showMessage('taskMessage','Choose a source day first.','warning');return;} const copies=tasksForDate(from).map(t=>({...t,date:to,id:t.id+'-copy-'+to,origin:person})); const local=readJSON(taskStorageKey(),[]); saveLocalTasks([...local,...copies]); showMessage('taskMessage',`Pulled ${copies.length} task(s) into ${to}.`, copies.length?'success':'warning'); renderTasks();});
    document.body.addEventListener('click', event=>{
      const completeTask=event.target.closest('[data-complete-task]'); if(completeTask){const id=completeTask.dataset.completeTask; const t=allTasks().find(x=>x.id===id) || {title:id,rewardCopper:100}; awardCurrency(t.rewardCopper, `Completed task: ${t.title}`, 'daily-task', {id}); completeTask.disabled=true; completeTask.textContent='Earned';}
      const move=event.target.closest('[data-move-task]'); if(move){const to=prompt('Move/copy this task to which date? Use YYYY-MM-DD.', $('dailyDate').value || todayISO()); if(to) moveTask(move.dataset.moveTask, move.dataset.fromDate, to.slice(0,10));}
      const buy=event.target.closest('[data-buy-item]'); if(buy){const item=storeItems.find(x=>x.id===buy.dataset.buyItem); if(!item) return; if(!item.priceCopper){showMessage('storeMessage','This item has no price yet. Add a price in JSON first.','warning');return;} const ok = spendCurrency(item.priceCopper, `Store redeem: ${item.title}`, {id:item.id}); showMessage('storeMessage', ok ? 'Redeemed and currency spent.' : 'Not enough earned currency yet.', ok ? 'success' : 'warning');}
      const skillOpen=event.target.closest('[data-open-skill]'); if(skillOpen){const skill=skillItems.find(x=>x.id===skillOpen.dataset.openSkill) || {title:skillOpen.dataset.openSkill,rewardCopper:25}; const done=readJSON(SKILL_DONE_PREFIX+person+'_open_v1',{}); const key=skill.id + '-' + todayISO(); if(!done[key]){done[key]=new Date().toISOString(); writeJSON(SKILL_DONE_PREFIX+person+'_open_v1',done); awardCurrency(25, `Opened skill/resource: ${skill.title}`, 'dbt-adhd-skill-open', {id:skill.id});}}
      const skillDone=event.target.closest('[data-complete-skill]'); if(skillDone){const skill=skillItems.find(x=>x.id===skillDone.dataset.completeSkill) || {title:skillDone.dataset.completeSkill,rewardCopper:100}; const done=readJSON(SKILL_DONE_PREFIX+person+'_v1',{}); const key=skill.id + '-' + todayISO(); if(done[key]){showMessage('skillMessage','That skill was already rewarded today.','warning');return;} done[key]=new Date().toISOString(); writeJSON(SKILL_DONE_PREFIX+person+'_v1',done); awardCurrency(skill.rewardCopper, `Completed skill/resource: ${skill.title}`, 'dbt-adhd-skill', {id:skill.id}); skillDone.disabled=true; skillDone.textContent='Earned';}
      const launch=event.target.closest('[data-launch-game]'); if(launch) openGame(launch.dataset.launchGame);
    });
    $('addCalendarEvent')?.addEventListener('click', addCalendarEvent); $('exportSharedCalendar')?.addEventListener('click',()=>exportJSON('ourspace-shared-calendar.json', readJSON(SHARED_CALENDAR_KEY, [])));
    $('skillSearch')?.addEventListener('input', renderSkills); $('gameSearch')?.addEventListener('input', renderGames);
    $('closeGame')?.addEventListener('click', closeGame);
    $('exportLedger')?.addEventListener('click',()=>exportJSON(`ourspace-${person}-currency-ledger.json`, {currency:readJSON(currencyKey(),{}), ledger:ledger()}));
    $('exportLocalData')?.addEventListener('click',()=>exportJSON(`ourspace-${person}-local-data.json`, {tasks:readJSON(taskStorageKey(),[]), calendar:readJSON(USER_CALENDAR_PREFIX+person+'_v1',[]), sharedCalendar:readJSON(SHARED_CALENDAR_KEY,[]), currency:readJSON(currencyKey(),{}), ledger:ledger()}));
    $('importTasksFile')?.addEventListener('change', e=>{const f=e.target.files[0]; if(f) importJSON(f, data=>{const arr=Array.isArray(data)?data:(data.tasks||data.items||[]); saveLocalTasks(arr.map(x=>normalizeTask(x,person))); renderTasks();});});
    window.addEventListener('message', event => {const d=event.data || {}; if(d && (d.type === 'ourspace:currency-award' || d.event === 'ourspace:currency-award')) awardCurrency(d.totalCopper || d.amountCopper || d.copper || 10, d.reason || 'Game reward', 'mobile-game', d);});
    window.addEventListener('ourspace:pending-game-award', event => {const d=event.detail || {}; awardCurrency(d.totalCopper || d.amountCopper || 10, d.label || d.reason || 'Game reward', 'mobile-game', d);});
    if('serviceWorker' in navigator){navigator.serviceWorker.register('./service-worker.js').catch(()=>{});}
  }
  function initIdentity(){ensureAccess(); $('personLabel').textContent=prettyPerson(); const folder=$('skillPersonFolder'); if(folder) folder.textContent = person; $('statusLine').textContent = isAdmin() ? `#admin test mode · viewing ${prettyPerson()}` : `Signed in as ${displayName()} · viewing ${prettyPerson()}`; $('homeUserName').textContent = displayName(); $('homeSiteName').textContent='OurSpace'; document.title = `OurSpace · ${prettyPerson()}`;}
  function init(){initIdentity(); initNavigation(); attachEvents(); initMessages(); loadData();}
  init();
})();
