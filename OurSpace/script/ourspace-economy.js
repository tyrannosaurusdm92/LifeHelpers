/* Frontend-only adapter to EXISTING OurSpace V1 currency actions. No backend source, secrets or replacement. */
(function(WW){
'use strict';
const CORE=WW.GameplayCore;
const DEFAULT_ENDPOINT='https://script.google.com/macros/s/AKfycbwxviV1hERFKIivY5we5W1gVMqfsH6DNY0mNZkEs2SXcoa4gDM88c14tIyraytnSAyKvQ/exec';
class OurSpaceEconomy {
 constructor(){this.endpoint=DEFAULT_ENDPOINT;this.host=null;this.identity=null;this.balance=null;this.status='standalone';this.pending=new Map();this.confirmed=new Set();this.inflight=new Set();this._flushPromise=null;this.listeners=new Set();this.lastError='';this.reading=false;this._refreshId=0;
   window.addEventListener('onyx-adventures:shell-event',e=>{if(e.detail?.type==='profile' && this.identity && e.detail.id!==this.identity.profileKey)this.disconnect('Profile changed');});
 }
 listen(fn){this.listeners.add(fn);return()=>this.listeners.delete(fn);}
 emit(){for(const fn of this.listeners)try{fn(this.snapshot());}catch(err){console.warn('Economy listener',err);}}
 snapshot(){return {status:this.status,connected:!!this.identity,profileKey:this.identity?.profileKey||'guest',balance:this.balance?{...this.balance}:null,pending:[...this.pending.values()].map(x=>({...x})),confirmedCount:this.confirmed.size,error:this.lastError};}
 connect(options){const p=String(options?.profileKey||'').toLowerCase();if(!['william','jasper'].includes(p))throw new Error('OurSpace sign-in must identify William or Jasper.');
   const token=String(options?.sessionToken||'');const host=options?.hostAdapter||window.OurSpaceAdventuresWallet;
   if(!host && (!token ||token.length<8))throw new Error('No authenticated OurSpace session or authorized host wallet adapter supplied.');
   if(this.identity?.profileKey && this.identity.profileKey!==p) this.disconnect('Switching authorized profile');
   this.host=host||null;this.identity={profileKey:p,sessionToken:token};this.endpoint=String(options.endpoint||DEFAULT_ENDPOINT);
   this.status='connecting';this.lastError='';window.onyxAdventuresShell?.setProfile?.(p,p==='william'?'William':'Jasper');this.emit();
   this.refresh().then(()=>this.flush()).catch(err=>{this.lastError=String(err.message||err);this.status='connection-error';this.emit();});return this;
 }
 disconnect(message='Signed out'){this.identity=null;this.host=null;this.balance=null;this.status='standalone';this.inflight.clear();this.lastError=message;this.emit();window.onyxAdventuresShell?.setBalances?.({copper:0,silver:0,gold:0,platinum:0});}
 async call(action,data={}){
   if(!this.identity)throw new Error('OurSpace sign-in is required.');
   // If the host exposes a trusted service, it owns tokens and policies. No duplicated login UI here.
   if(this.host){const fn=action==='currency.balance'?this.host.getBalance: this.host.earn;if(typeof fn!=='function')throw new Error('OurSpace host wallet adapter lacks '+action);return await fn.call(this.host,{profileKey:this.identity.profileKey,...data});}
   const payload={action,namespace:'ourspace',sessionToken:this.identity.sessionToken,data:{profileKey:this.identity.profileKey,...data}};
   // Apps Script web-app responses may not be accessible cross-origin in all embeddings.
   // No JSONP-with-session-token fallback: it would expose credentials in a URL.
   const r=await fetch(this.endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),redirect:'follow',cache:'no-store',credentials:'omit'});
   if(!r.ok)throw new Error('OurSpace '+action+': HTTP '+r.status);
   const result=await r.json();if(result?.ok===false)throw new Error(String(result.error||result.message||'Rejected by OurSpace'));
   return result;
 }
 applyBalance(result){const b=result?.balance||result?.ledger?.balance||result;
   const total=b?.totalCopper ?? result?.balanceCopper ?? b?.balanceCopper;
   if(total==null && (b?.copper==null||b?.silver==null))throw new Error('OurSpace returned no usable balance.');
   this.balance=CORE.cents(total==null?CORE.totalFromCoins(b):total);
   window.onyxAdventuresShell?.setBalances?.(this.balance);
   this.status='connected';this.lastError='';this.emit();return this.balance;
 }
 async refresh(){if(!this.identity)return false;const id=++this._refreshId;this.reading=true;
   try{const result=await this.call('currency.balance');if(id===this._refreshId)this.applyBalance(result);return true;}
   catch(e){if(id===this._refreshId){this.lastError=String(e.message||e);this.status='connection-error';this.emit();}throw e;}
   finally{this.reading=false;}
 }
 queueReward(event){
   if(!event||!/^adventure:v3:[a-z0-9_:.-]{1,150}$/.test(event.eventId)||!CORE.IDS.includes(event.catId)||!CORE.BIOMES.includes(event.biomeId))throw new Error('Invalid verified career claim.');
   const amount=CORE.pay(event.level);if(amount!==event.amountCopper)throw new Error('Career wage must match approved local table.');
   if(this.confirmed.has(event.eventId)||this.pending.has(event.eventId))return false;
   const claim={eventId:event.eventId,profileKey:event.profileKey,catId:event.catId,biomeId:event.biomeId,level:event.level,amountCopper:amount,reason:event.reason||'Completed visible pet shift',status:'pending',createdAt:new Date().toISOString()};
   this.pending.set(event.eventId,claim);this.emit();if(this.identity?.profileKey===claim.profileKey)this.flush().catch(()=>{});
   return true;
 }
 flush(){if(!this.identity)return Promise.resolve(0);if(this._flushPromise)return this._flushPromise.then(()=>this.flush());const promise=this.performFlush();this._flushPromise=promise;return promise.finally(()=>{if(this._flushPromise===promise)this._flushPromise=null;});}
 async performFlush(){let count=0;
   for(const claim of [...this.pending.values()]){
     if(claim.profileKey!==this.identity.profileKey||this.confirmed.has(claim.eventId))continue;
     this.inflight.add(claim.eventId);try{
       const out=await this.call('currency.earn',{amountCopper:claim.amountCopper,sourceType:'onyx-adventures-career',sourceId:claim.eventId,reason:claim.reason});
       this.confirmed.add(claim.eventId);this.pending.delete(claim.eventId);count++;
       try{this.applyBalance(out);}catch(_){await this.refresh();}
       window.dispatchEvent(new CustomEvent('onyx-adventures:wallet-confirmed',{detail:{eventId:claim.eventId,profileKey:claim.profileKey,amountCopper:claim.amountCopper}}));
     }catch(err){claim.status='pending-verification';this.status='connection-error';this.lastError=String(err.message||err);this.emit();break;}
     finally{this.inflight.delete(claim.eventId);}
   }
   this.emit();return count;
 }
 openStore(){if(!this.identity)return false;
   const target=this.identity.profileKey==='william'?'dino':'squishy';
   if(typeof this.host?.openStore==='function'){this.host.openStore({profileKey:this.identity.profileKey,storeId:target});return true;}
   window.dispatchEvent(new CustomEvent('onyx-adventures:open-ourspace-store',{detail:{storeId:target,profileKey:this.identity.profileKey}}));return true;
 }
 restore(raw){this.confirmed=new Set((raw?.confirmed||[]).filter(x=>typeof x==='string').slice(-500));this.pending=new Map();for(const p of (raw?.pending||[]).slice(-500))if(p&&typeof p.eventId==='string'&&p.profileKey&&p.amountCopper===CORE.pay(p.level)&&!this.confirmed.has(p.eventId))this.pending.set(p.eventId,p);this.emit();}
 export(){return {confirmed:[...this.confirmed].slice(-500),pending:[...this.pending.values()].slice(-500)};}
}
WW.OurSpaceEconomy=OurSpaceEconomy;
})(window.WanderingWorld=window.WanderingWorld||{});
