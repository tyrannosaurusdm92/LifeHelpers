/* Hash-gated controls for testing the same Onyx movement runtime used by the room. */
(()=>{'use strict';
 const api=()=>window.OnyxVirtualHealthEnvironment;
 const adminMode=()=>String(location.hash||'').toLowerCase()==='#admin';
 let panel=null,held=false,status=null,formSelect=null,paceSelect=null,actionSelect=null,wanderToggle=null;
 const css=`#onyxMotionAdminPanel{position:fixed;z-index:2147483000;right:14px;bottom:14px;width:min(310px,calc(100vw - 28px));padding:12px;border:1px solid #54e2c1;border-radius:12px;background:rgba(5,15,19,.96);color:#f5fbfa;box-shadow:0 12px 36px #0009;font:600 12px/1.4 system-ui,sans-serif}#onyxMotionAdminPanel[hidden]{display:none!important}#onyxMotionAdminPanel *{box-sizing:border-box}#onyxMotionAdminPanel header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-weight:900;font-size:13px}#onyxMotionAdminPanel .onyx-admin-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;max-width:154px;margin:8px auto}#onyxMotionAdminPanel button,#onyxMotionAdminPanel select{min-height:34px;border:1px solid #527277;border-radius:7px;background:#10282d;color:#f5fbfa;font:700 12px system-ui,sans-serif}#onyxMotionAdminPanel button{padding:6px 9px;cursor:pointer;touch-action:none}#onyxMotionAdminPanel button:active{background:#165647}#onyxMotionAdminPanel .onyx-admin-row{display:flex;gap:7px;align-items:center;margin-top:7px}#onyxMotionAdminPanel select{flex:1;padding:5px;min-width:0}#onyxMotionAdminPanel label{display:flex;align-items:center;gap:6px;font-weight:800}#onyxMotionAdminPanel [data-motion-status]{display:block;min-height:18px;margin-top:8px;color:#9eead7;font:11px/1.4 ui-monospace,monospace}#onyxMotionAdminPanel .onyx-admin-stop{background:#512b31;border-color:#aa6d72}`;
 function makePanel(){
  if(panel)return panel;
  const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);
  panel=document.createElement('section');panel.id='onyxMotionAdminPanel';panel.hidden=true;panel.setAttribute('aria-label','Onyx movement test controls');
  panel.innerHTML=`<header><span>Onyx movement test</span><span>#admin</span></header>
   <div class="onyx-admin-row"><label for="onyxAdminForm">Form</label><select id="onyxAdminForm"><option value="quadruped">Quadruped</option><option value="biped">Biped</option></select><select id="onyxAdminPace" aria-label="Movement pace"><option value="walk">Walk</option><option value="run">Run</option></select></div>
   <div class="onyx-admin-grid" aria-label="Hold a direction to move Onyx">
    <button type="button" data-onyx-dir="-1,-1" aria-label="Move northwest">↖</button><button type="button" data-onyx-dir="0,-1" aria-label="Move north">↑</button><button type="button" data-onyx-dir="1,-1" aria-label="Move northeast">↗</button>
    <button type="button" data-onyx-dir="-1,0" aria-label="Move west">←</button><button type="button" data-onyx-stop class="onyx-admin-stop">Stop</button><button type="button" data-onyx-dir="1,0" aria-label="Move east">→</button>
    <button type="button" data-onyx-dir="-1,1" aria-label="Move southwest">↙</button><button type="button" data-onyx-dir="0,1" aria-label="Move south">↓</button><button type="button" data-onyx-dir="1,1" aria-label="Move southeast">↘</button>
   </div>
   <div class="onyx-admin-row"><label><input type="checkbox" data-onyx-wander> Autonomous wander</label></div>
   <div class="onyx-admin-row"><select data-onyx-action aria-label="Onyx action"></select><button type="button" data-onyx-play>Play</button></div>
   <output data-motion-status aria-live="polite">Movement runtime starting…</output>`;
  document.body.appendChild(panel);
  formSelect=panel.querySelector('#onyxAdminForm');paceSelect=panel.querySelector('#onyxAdminPace');actionSelect=panel.querySelector('[data-onyx-action]');wanderToggle=panel.querySelector('[data-onyx-wander]');status=panel.querySelector('[data-motion-status]');
  formSelect.addEventListener('change',()=>api()?.setMovementForm?.(formSelect.value));
  wanderToggle.addEventListener('change',()=>api()?.setAutonomousMovement?.(wanderToggle.checked));
  panel.addEventListener('pointerdown',event=>{
   const button=event.target.closest('[data-onyx-dir]');if(!button)return;event.preventDefault();held=true;
   try{button.setPointerCapture(event.pointerId)}catch(_){}
   const [x,y]=button.dataset.onyxDir.split(',').map(Number);api()?.setMovementInput?.(x,y,paceSelect.value);
  });
  const release=()=>{if(!held)return;held=false;api()?.stopMovement?.()};
  panel.addEventListener('pointerup',release);panel.addEventListener('pointercancel',release);panel.addEventListener('lostpointercapture',release);
  panel.querySelector('[data-onyx-stop]').addEventListener('click',()=>{held=false;wanderToggle.checked=false;api()?.setAutonomousMovement?.(false);api()?.stopMovement?.()});
  panel.querySelector('[data-onyx-play]').addEventListener('click',()=>{const result=api()?.performMovementAction?.(actionSelect.value);if(status)status.textContent=result?.ok?`Action: ${actionSelect.value}`:`Action unavailable: ${result?.reason||'runtime not ready'}`});
  return panel;
 }
 function refresh(){
  const enabled=adminMode();if(!enabled){if(panel&&!panel.hidden)api()?.releaseMovementControls?.();if(panel)panel.hidden=true;return}
  const p=makePanel();p.hidden=false;const state=api()?.getMovementState?.();
  if(formSelect&&state?.form)formSelect.value=state.form;
  if(actionSelect&&state?.actions){const prior=actionSelect.value;actionSelect.replaceChildren(...state.actions.map(name=>{const option=document.createElement('option');option.value=name;option.textContent=name.replaceAll('_',' ');return option}));if(state.actions.includes(prior))actionSelect.value=prior}
  if(status&&state){const mode=state.state?.moving?`${state.state.pace} ${state.state.direction}`:state.autonomous?'wandering':'idle';status.textContent=`${state.form} · ${mode} · ${(state.x*100).toFixed(0)}%, ${(state.y*100).toFixed(0)}%`}
 }
 window.addEventListener('hashchange',refresh);refresh();setInterval(()=>{if(adminMode())refresh()},300);
})();
