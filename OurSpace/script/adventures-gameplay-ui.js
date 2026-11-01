/* Lightweight additions INSIDE the existing Adventures HUD. No new HTML page or fake pet layer. */
(function(WW){
'use strict';
const C=WW.GameplayCore,D=WW.GameplayData;
const $=id=>document.getElementById(id);
const E=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!=null)node.textContent=String(text);return node;};
class GameplayUI {
 constructor(gameplay){this.gameplay=gameplay;this.game=gameplay.app;this.lastRender=0;this.lastState='';this.selected='onyx';
   this.make();this.unsub=gameplay.listen(()=>this.render());this.render();}
 make(){const host=$('gameplayHome');if(!host)return;
   const home=E('div','gameplay-container');
   const heading=E('h3','meadow-title','Careers, discovery & the eight biomes');home.append(heading);
   home.append(E('p','meadow-caption','These are real Onyx, Callie and Harvey WASM actors. A cat must walk, reach a marker and finish an on-screen shift to gain career progress. No in-game shop.'));
   const rows=E('div','meadow-grid');this.jobButtons={};this.cancelButtons={};
   for(const id of C.IDS){const box=E('section','cat-job-card '+id),title=E('h4','',id[0].toUpperCase()+id.slice(1));box.append(title);
     const details=E('p','cat-job-description',D.careers[id].name);box.append(details);
     const meter=E('div','cat-career-meter');meter.id='meadowCareer-'+id;box.append(meter);
     const buttons=E('div','meadow-button-row'),start=E('button','btn meadow-work','Offer a work shift');start.type='button';start.addEventListener('click',()=>{
       if(!this.gameplay.startWork(id,false))this.message(id+' is unavailable right now (rest, care, another activity or out of view). Try later.');
     });this.jobButtons[id]=start;buttons.append(start);
     const cancel=E('button','btn meadow-cancel','Cancel shift');cancel.type='button';cancel.addEventListener('click',()=>this.gameplay.cancelWork(id,'Stopped without penalty.'));this.cancelButtons[id]=cancel;buttons.append(cancel);box.append(buttons);rows.append(box);
   }
   const careerMount=this.ensureMount('status','gameplayCareers','Cat careers & on-screen work');
   careerMount.append(rows);
   const options=E('div','meadow-button-row');const auto=E('label','check');this.autoToggle=E('input');this.autoToggle.type='checkbox';this.autoToggle.checked=true;this.autoToggle.addEventListener('change',()=>{this.gameplay.preferences.autoWork=this.autoToggle.checked;this.gameplay.scheduleSave();});auto.append(this.autoToggle,document.createTextNode('Allow optional autonomous work shifts'));careerMount.append(auto);
   const explore=E('label','check');this.roamToggle=E('input');this.roamToggle.type='checkbox';this.roamToggle.checked=true;this.roamToggle.addEventListener('change',()=>{this.gameplay.preferences.autoExplore=this.roamToggle.checked;this.gameplay.scheduleSave();});explore.append(this.roamToggle,document.createTextNode('Allow gentle walking between biomes'));options.append(explore);
   const observe=E('button','btn','Record a field observation');observe.type='button';observe.addEventListener('click',()=>this.gameplay.observe());options.append(observe);
   const stroll=E('button','btn','Invite Onyx for a scenic stroll');stroll.type='button';stroll.addEventListener('click',()=>{if(!this.gameplay.scenicStroll())this.message('Onyx is occupied or resting. No rush.');});options.append(stroll);home.append(options);
   this.status=E('div','meadow-status');this.status.role='status';this.status.setAttribute('aria-live','polite');home.append(this.status);
   const map=E('section','meadow-map');map.append(E('h4','','Eight-biome explorer'));map.append(E('p','','Each cat needs two real visible activities and some time in a biome. Visiting alone does not mark it complete.'));
   this.mapGrid=E('div','biome-coverage-grid');map.append(this.mapGrid);this.travel=E('p','meadow-hint');map.append(this.travel);home.append(map);
   const guide=E('section','meadow-guide');guide.append(E('h4','','Meadow Field Guide'));this.guide=E('div','meadow-guide-list');guide.append(this.guide);this.ensureMount('journal','gameplayGuide','The Meadow Field Guide').append(guide);
   const wallet=E('section','meadow-wallet');wallet.append(E('h4','','OurSpace currency — earn here, spend in OurSpace'));
   this.balance=E('p','meadow-balance','Not connected. No spendable balance is invented in this standalone game.');wallet.append(this.balance);
   this.pending=E('p','meadow-pending');wallet.append(this.pending);
   const actions=E('div','meadow-button-row');this.connect=E('button','btn','Connect signed-in OurSpace wallet');this.connect.type='button';this.connect.addEventListener('click',()=>this.connectWallet());actions.append(this.connect);
   this.refresh=E('button','btn','Refresh balance');this.refresh.type='button';this.refresh.addEventListener('click',()=>this.gameplay.economy.refresh().catch(e=>this.message('Balance check failed: '+e.message)));actions.append(this.refresh);
   this.spend=E('button','btn','Open my OurSpace store');this.spend.type='button';this.spend.addEventListener('click',()=>this.gameplay.economy.openStore());actions.append(this.spend);
   wallet.append(actions);wallet.append(E('p','meadow-caption','The Dino Store or Squishy Store fulfills optional real-life personal-care items through the other person. The game never spends money, invents an order or exposes private journals to a seller.'));this.ensureMount('goals','gameplayWallet','OurSpace currency and earning').append(wallet);
   const message=E('p','meadow-important','Care and safety are never conditional on earning coins. No streak penalty or overnight catch backlog.');home.append(message);
   host.append(home);
   // No floating gameplay shortcut: users access every section through buttons 1–5.
 }
 ensureMount(panel,id,title){
   let target=$(id);if(target)return target;
   const host=$('hud-'+panel)?.querySelector('.hud-panel-body');
   if(!host)throw new Error('Missing original game panel: '+panel);
   target=E('div','section gameplay-container');target.id=id;
   target.append(E('h3','meadow-title',title));host.append(target);
   return target;
 }
 connectWallet(){
   try{const ctx=window.OurSpaceAdventuresAuth;
     if(!ctx){this.message('Launch from a signed-in OurSpace page to connect. No password or session token is requested here.');return;}
     this.gameplay.economy.connect(ctx);this.message('Checking your existing OurSpace account and wallet…');
   }catch(err){this.message('OurSpace connection not ready: '+err.message);}
 }
 message(m){this.status.textContent=String(m);}
 render(){const state=this.gameplay.snapshot();if(!this.status)return;
   this.autoToggle.checked=!!state.preferences.autoWork;this.roamToggle.checked=!!state.preferences.autoExplore;
   this.status.textContent=state.lastEvent||'Exploring the meadow.';
   for(const id of C.IDS){const career=state.careers[id],level=career.level;
     $('meadowCareer-'+id).textContent='Level '+level+' · '+D.careers[id].levels[level-1]+' · '+career.xp+' verified shifts';
     const busy=state.jobs.find(j=>j.catId===id);
     this.jobButtons[id].disabled=!!busy;this.cancelButtons[id].disabled=!busy;
     if(busy)this.jobButtons[id].textContent=busy.stage==='acting'?'Working '+busy.elapsed+'/'+busy.duration+' sec':'Working: '+busy.stage;
     else this.jobButtons[id].textContent='Offer a work shift';
   }
   this.mapGrid.replaceChildren();
   for(const b of C.BIOMES){const area=E('div','biome-tile'),name=E('strong','',D.biomes[b].label);area.append(name);
     for(const id of C.IDS){const o=state.coverageCells[id][b],x=E('div','biome-tile-cat',id[0].toUpperCase()+id.slice(1)+': '+(o.fulfilled?'✓ used':Math.min(2,o.actionIds.length)+'/2 actions')+' · '+(o.visits?'visited':'not yet'));x.setAttribute('aria-label',id+' '+D.biomes[b].label+' '+o.actionIds.length+' activities');area.append(x);}
     this.mapGrid.append(area);
   }
   const next=this.gameplay.nextLandmark();this.travel.textContent=next?'Next route section: '+next.label+'; Onyx travels under his own power. You can invite a stroll, not teleport.':'';
   this.guide.replaceChildren();const g=state.guide;
   this.guide.append(E('p','','Discoveries: '+g.landmarks.length+' / 24 landmarks. Three-cat biome participation: '+state.coverage+' / 24. Family moments: '+g.moments.length+'.'));
   const chips=E('div','meadow-guide-chips');for(const [species,count] of Object.entries(g.sightings||{}))chips.append(E('span','meadow-chip',species+' × '+count));
   if(!chips.childElementCount)chips.append(E('span','meadow-chip','Watch birds or record a field observation to begin.'));
   this.guide.append(chips);
   const econ=state.economy;this.balance.textContent=econ.balance?'Confirmed balance: '+econ.balance.platinum+' platinum · '+econ.balance.gold+' gold · '+econ.balance.silver+' silver · '+econ.balance.copper+' copper':'Standalone: spendable balance unavailable until OurSpace authentication.';
   this.pending.textContent=econ.pending.length?econ.pending.length+' career credits pending verification. '+(econ.error||''):(econ.error&&econ.connected?'Wallet: '+econ.error:'No pending credits.');
   this.spend.disabled=!econ.connected;this.refresh.disabled=!econ.connected;this.connect.disabled=econ.connected&&econ.status==='connected';

 }
 tick(now){if(now-this.lastRender>=2500){this.lastRender=now;this.render();}}
}
WW.GameplayUI=GameplayUI;
})(window.WanderingWorld=window.WanderingWorld||{});
