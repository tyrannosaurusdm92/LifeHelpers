/* Additive account messaging sync adapter: no local deletion on network failures. */
(()=>{'use strict';
const app=window.ourspaceMessenger,auth=window.OurSpaceAuth;
if(!app||!auth)return;
const profile=document.documentElement.dataset.profile||'william';
let inFlight=false,onlineConfirmed=false,lastResult='browser-local';
const status=()=>{const root=document.querySelector('#sidebar-messenger-root');if(root)root.dataset.syncStatus=lastResult};
function accepted(){return auth.isAuthenticated?.()&&auth.profile?.()===profile}
async function sync(){if(inFlight||!accepted())return;inFlight=true;
 try{
  // Exact server action must exist in the existing account backend (not bundled here).
  // No deletion or replacement: clients merge by stable message IDs only.
  const result=await auth.request('messenger.sync',{profileKey:profile,messages:app.messages},{timeout:10000});
  const remote=result?.messages||result?.data?.messages||result?.data?.conversations;
  if(remote&&typeof remote==='object')for(const [room,rows] of Object.entries(remote)){
   if(!Array.isArray(rows))continue;
   for(const record of rows){if(!record||typeof record!=='object'||record.conversationId!==room||!record.id)continue;app.addMessage(record,record.authorId===profile)}
  }
  lastResult='account-synced';onlineConfirmed=true;
 }catch(_){lastResult='browser-local';}
 finally{inFlight=false;status()}
}
// Sync only after an actual message save; the base module keeps a durable per-profile
// browser store and uses BroadcastChannel across same-origin tabs.
const add=app.addMessage.bind(app);
app.addMessage=function(message,mine){const r=add(message,mine);if(mine&&accepted())queueMicrotask(sync);return r};
if(accepted()){sync();setInterval(sync,45000)}
window.OurSpaceMessengerSync={sync,status:()=>lastResult,accountConfirmed:()=>onlineConfirmed};
})();
