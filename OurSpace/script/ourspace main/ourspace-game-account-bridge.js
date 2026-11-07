/* OurSpace authenticated bridge for CAT-astrophic and LifeHelpers Arcade.
 * Only the parent's signed-in OurSpace session may call the existing backend.
 * No account token or account data is ever sent to third-party arcade frames.
 * Arcade play and reward claims now use authenticated server-side session endpoints.
 * The CAT-astrophic legacy event bridge remains compatible with the locked wallet ledger.
 */
(()=>{'use strict';
 const auth=()=>window.OurSpaceAuth;
 const who=()=>String(document.documentElement.dataset.profile||'').toLowerCase();
 const active=()=>['william','jasper'].includes(who())&&auth()?.isAuthenticated?.()&&!auth()?.isAdmin?.()&&auth()?.profile?.()===who();
 const siteOrigin=location.origin,arcadeOrigin='https://tyrannosaurusdm92.github.io';
 const safePath=/^(Both|Desktop)\/(?:[a-zA-Z0-9 _.'-]+\/){0,2}[a-zA-Z0-9 _.'-]+\.html$/;
 const sessions=new Map(),inflight=new Set(),cached=new Map();
 const toCoins=n=>{n=Math.max(0,Math.trunc(Number(n)||0));return {platinum:Math.floor(n/1000),gold:Math.floor(n%1000/100),silver:Math.floor(n%100/10),copper:n%10}};
 function frame(kind){try{const w=window.OurSpaceIntegratedOnyx?.frame?.contentWindow;if(!w)return null;return w.document.getElementById(kind==='game'?'onyxHealthGameFrame':'onyxLeisureGameFrame')?.contentWindow||null;}catch(_){return null}}
 function send(w,type,detail={}){try{w?.postMessage({source:'ourspace-account-game-host',type,...detail},siteOrigin)}catch(_){}}
 async function balance(){if(!active())throw Error('Sign in as the current account to use its wallet.');const r=await auth().request('currency.balance',{profileKey:who()});const n=Number(r.balanceCopper);if(!Number.isSafeInteger(n)||n<0)throw Error('Invalid account balance');window.dispatchEvent(new CustomEvent('ourspace:wallet-changed',{detail:{profile:who(),balanceCopper:n}}));return n}
 async function recordRows(bucket){const r=await auth().request('record.list',{bucket,profileKey:who()});return Array.isArray(r.records)?r.records:[]}
 function recordValue(row){let raw=row.Json??row.json??row.value;try{return typeof raw==='string'?JSON.parse(raw):raw||null}catch(_){return null}}
 function matchesRecord(rows,key){return rows.some(row=>String(row.Key||row.key)==key || recordValue(row)?.key===key || recordValue(row)?.eventId===key)}
 async function saveRecord(bucket,key,value){return auth().request('record.save',{profileKey:who(),bucket,key,recordId:'rec_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,9),value});}
 // Called only after the backend accepted the account ledger write.
 async function creditOnce(bucket,key,copper,source,reason){
   if(!active())return {ok:false,reason:'account-required'};
   const amount=Number(copper);if(!Number.isSafeInteger(amount)||amount<1||amount>5000000)return {ok:false,reason:'invalid-amount'};
   const lock=bucket+':'+who()+':'+key;if(inflight.has(lock))return {ok:false,reason:'pending'};inflight.add(lock);
   try{
     const rows=await recordRows(bucket);
     if(matchesRecord(rows,key))return {ok:true,duplicate:true,balanceCopper:await balance()};
     // Write a claim first. Pending claims are deliberately NOT paid again on retry.
     // This avoids accidental duplicate credits after lost network acknowledgements.
     await saveRecord(bucket,key,{key,eventId:key,state:'claimed',copper:amount,source,at:new Date().toISOString()});
     const out=await auth().request('currency.earn',{profileKey:who(),amountCopper:amount,sourceType:source,sourceId:key,reason});
     const confirmed=Number(out.balanceCopper);
     const b=Number.isSafeInteger(confirmed)?confirmed:await balance();
     window.dispatchEvent(new CustomEvent('ourspace:wallet-changed',{detail:{profile:who(),balanceCopper:b}}));
     return {ok:true,balanceCopper:b};
   }catch(e){return {ok:false,reason:String(e.message||e)}}finally{inflight.delete(lock)}
 }
 async function spend(value,source,reason){if(!active())return {ok:false,reason:'account-required'};const amount=Number(value);if(!Number.isSafeInteger(amount)||amount<1)return {ok:false,reason:'invalid-amount'};try{const out=await auth().request('currency.spend',{profileKey:who(),amountCopper:amount,sourceType:source,reason});const b=Number(out.balanceCopper);window.dispatchEvent(new CustomEvent('ourspace:wallet-changed',{detail:{profile:who(),balanceCopper:b}}));return {ok:true,balanceCopper:b}}catch(e){return {ok:false,reason:String(e.message||e)}}}
 function canonicalArcade(d){const path=String(d.path||'');if(!safePath.test(path)||path.includes('..'))return null;const title=String(d.title||'').replace(/[<>]/g,'').slice(0,100).trim();if(!title)return null;return {path,title,url:'https://github.com/tyrannosaurusdm92/LifeHelpers/blob/main/Games/'+path.split('/').map(encodeURIComponent).join('/'),icon:/candy crush/i.test(title)?'🍬':/chess/i.test(title)?'♟️':/solitaire/i.test(title)?'🃏':/papa/i.test(title)?'🍔':/sudoku|wordle/i.test(title)?'🧩':'🎮'};}
 let gamesPromise=null;
 async function played(){if(!active())return [];try{const result=await auth().request('arcade.played.list',{profileKey:who()});return (Array.isArray(result.games)?result.games:[]).map(o=>{const g=canonicalArcade(o);return g?{...g,playedAt:o.playedAt||''}:null}).filter(Boolean)}catch(_legacy){const rows=await recordRows('arcade.played');const byPath=new Map();for(const row of rows){const obj=recordValue(row);if(!obj||obj.profile!==who())continue;const game=canonicalArcade(obj);if(game)byPath.set(game.path,{...game,playedAt:obj.playedAt||''})}return [...byPath.values()].sort((a,b)=>a.title.localeCompare(b.title));}}
 function notifyPlayed(){window.dispatchEvent(new CustomEvent('ourspace:arcade-played',{detail:{profile:who()}}))}
 async function arcadeEvent(d){
  const game=canonicalArcade(d);if(!game||!active())return;
  const id=String(d.sessionId||'');if(!/^[a-zA-Z0-9_-]{8,100}$/.test(id))return;
  const key=who()+':'+id;let track=sessions.get(key);
  if(d.type==='start'){
   if(track)return;
   track={game,seconds:0,lastSubmitted:0,paid:false,processing:false,startPromise:null};
   sessions.set(key,track);
   // Server, not localStorage or the arcade iframe, owns the session and reward ledger.
   track.startPromise=auth().request('arcade.play.start',{profileKey:who(),path:game.path,title:game.title,sessionId:id});
   try{await track.startPromise;notifyPlayed()}catch(e){sessions.delete(key);console.warn('Arcade session could not start:',e)}
   return;
  }
  if(d.type!=='progress'||!track||track.game.path!==game.path)return;
  const secs=Number(d.activeSeconds);
  if(!Number.isSafeInteger(secs)||secs<track.seconds||secs>7200)return;
  track.seconds=secs;
  if(track.processing||track.paid||secs-track.lastSubmitted<15&&secs<300)return;
  track.processing=true;
  try{
   await track.startPromise;
   const progress=await auth().request('arcade.play.progress',{profileKey:who(),sessionId:id,activeSeconds:secs});
   track.lastSubmitted=secs;
   if(secs>=300&&progress.eligible){
    const claim=await auth().request('arcade.reward.claim',{profileKey:who(),sessionId:id,activeSeconds:secs});
    track.paid=true;
    const confirmed=Number(claim.balanceCopper);
    const n=Number.isSafeInteger(confirmed)?confirmed:await balance();
    window.dispatchEvent(new CustomEvent('ourspace:wallet-changed',{detail:{profile:who(),balanceCopper:n}}));
    window.dispatchEvent(new CustomEvent('ourspace:arcade-reward',{detail:{profile:who(),game,result:{ok:true,duplicate:!!claim.duplicate,rewardCopper:Number(claim.rewardCopper||0),balanceCopper:n}}}));
   }
  }catch(e){
   // Keep progress pending for retry; never claim a reward based on browser-only balance.
   console.warn('Arcade progress/reward request was not accepted:',e);
  }finally{track.processing=false}
 }
 window.addEventListener('message',async event=>{
  const d=event.data;if(!d||typeof d!=='object')return;
  if(d.source==='ourspace-catastrophic-game-v2'){
   if(event.origin!==siteOrigin||event.source!==frame('game'))return;
   const requestId=String(d.requestId||'').slice(0,120);
   if(!active()){send(event.source,'account',{requestId,profile:'guest',authorized:false});return}
   if(d.type==='hello'||d.type==='currency.balance'){
    try{send(event.source,'account',{requestId,authorized:true,profile:who(),balanceCopper:await balance()})}catch(e){send(event.source,'error',{requestId,error:String(e.message||e)})}return;
   }
   if(d.type==='currency.credit'){
    const id=String(d.eventId||'');if(!/^[a-zA-Z0-9_.:-]{1,180}$/.test(id))return;
    const result=await creditOnce('catastrophic.reward.claims',id,d.amountCopper,'catastrophic',String(d.reason||'Completed game activity').slice(0,220));
    send(event.source,'currency.result',{requestId,result,profile:who()});return;
   }
   if(d.type==='currency.spend'){
    const result=await spend(d.amountCopper,'catastrophic',String(d.reason||'Game purchase').slice(0,220));
    send(event.source,'currency.result',{requestId,result,profile:who()});return;
   }
   if(d.type==='record.get'||d.type==='record.put'){
    const key=String(d.key||'');if(!/^catastrophic\.[a-z0-9_.:-]{1,120}$/i.test(key))return;
    let result={ok:false,reason:'record-unavailable'};
    try{
     if(d.type==='record.get'){
      const rows=await recordRows('catastrophic.game-state');
      const found=rows.filter(r=>String(r.Key||r.key)===key);
      const value=found.length?recordValue(found[found.length-1]):null;
      result={ok:true,value:value?.value??null};
     }else{
      const value=d.value;
      if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length>25)return;
      for(const [name,n] of Object.entries(value))if(!/^[a-z0-9_-]{1,50}$/i.test(name)||!Number.isInteger(n)||n<0||n>9999)return;
      await saveRecord('catastrophic.game-state',key,{key,value,profile:who()});
      result={ok:true};
     }
    }catch(e){result={ok:false,reason:String(e.message||e)}}
    send(event.source,'record.result',{requestId,result,profile:who()});return;
   }
  }
  if(d.source==='lifehelpers-arcade-bridge-v1'&&event.origin===arcadeOrigin&&event.source===frame('arcade')){
    if(d.type==='start'||d.type==='progress')void arcadeEvent(d);
  }
 });
 function syncGameIdentity(){if(!active()){send(frame('game'),'account',{authorized:false,profile:'guest'});return;}void balance().then(n=>send(frame('game'),'account',{authorized:true,profile:who(),balanceCopper:n})).catch(()=>send(frame('game'),'account',{authorized:false,profile:'guest'}));}
 window.addEventListener('focus',syncGameIdentity);
 window.addEventListener('ourspace:auth',syncGameIdentity);
 window.addEventListener('ourspace:signed-out',syncGameIdentity);
 window.addEventListener('hashchange',syncGameIdentity);
 window.OurSpaceGameAccount=Object.freeze({active,balance,played,creditOnce,notifyPlayed,toCoins});
 if(active())void balance().then(n=>send(frame('game'),'account',{authorized:true,profile:who(),balanceCopper:n})).catch(()=>{});
})();
