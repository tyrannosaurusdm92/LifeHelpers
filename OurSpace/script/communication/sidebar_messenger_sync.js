/* OurSpace member Messenger bridge. The existing backend uses message.send/message.list
 * (not messenger.sync). Never delete local conversations on network failure.
 * User-sent text/stickers sync to the two-profile backend; rich attachments and
 * live media remain handled by their existing upload/call systems. */
(()=>{'use strict';
const app=window.ourspaceMessenger,auth=window.OurSpaceAuth;
if(!app||!auth)return;
const profile=document.documentElement.dataset.profile;
if(!['william','jasper'].includes(profile)||new URLSearchParams(location.search).get('public')==='1'||auth.isAdmin?.())return;
const partner=profile==='william'?'jasper':'william';
const channels=['dm-jasper-william','ourspace-shared','household-chat','plans-chat'];
const sentClientIds=new Set();
let inFlight=false,importing=false,onlineConfirmed=false,lastResult='browser-local';
const accepted=()=>!!auth.isAuthenticated?.()&&auth.profile?.()===profile&&!auth.isAdmin?.();
const transport=window.OurSpaceMessageTransport=window.OurSpaceMessageTransport||{connected:false};
function status(connected){
 onlineConfirmed=!!connected;
 transport.connected=onlineConfirmed;
 lastResult=onlineConfirmed?'account-synced':'browser-local';
 const root=document.getElementById('sidebar-messenger-root');
 if(root)root.dataset.syncStatus=lastResult;
 window.dispatchEvent(new Event('ourspace:transport-status'));
}
function eligible(message){
 return message&&channels.includes(String(message.conversationId||''))&&
  (message.kind==='message'||message.kind==='sticker')&&
  !!String(message.text||'').trim()&&!(message.attachments||[]).length;
}
async function sendToAccount(message){
 if(!accepted()||!eligible(message)||sentClientIds.has(message.id))return;
 // Sending must be attempted once per local message ID. Never retry on
 // ambiguous timeouts: Apps Script may have saved and notified the partner.
 sentClientIds.add(message.id);
 try{
  const result=await auth.request('message.send',{
   channelId:message.conversationId,fromProfile:profile,toProfile:partner,
   kind:message.kind==='sticker'?'sticker':'text',text:String(message.text),
   clientMessageId:message.id,createdAt:message.createdAt
  },{timeout:25000});
  if(!result?.messageId)throw new Error('Backend did not confirm the message');
  // Server-side message.send also emits its canonical notification to partner.
 }catch(err){
  status(false);
  console.warn('OurSpace message could not be confirmed by the backend; kept locally.',String(err?.message||err));
 }
}
const originalAdd=app.addMessage.bind(app);
app.addMessage=function(message,mine){
 const existing=!!app.messages?.[message?.conversationId]?.some(m=>m.id===message?.id);
 const result=originalAdd(message,mine);
 if(mine&&!importing&&!existing&&accepted()&&eligible(message))void sendToAccount(message);
 return result;
};
function toLocal(row,channelId){
 if(!row||typeof row!=='object'||row.channelId!==channelId||!['william','jasper'].includes(row.fromProfile)||!row.messageId)return null;
 const data=row.data&&typeof row.data==='object'?row.data:{};
 const originalId=String(data.clientMessageId||'');
 const id=originalId||String(row.messageId);
 const from=String(row.fromProfile);
 return{
  id,conversationId:channelId,authorId:from,
  authorLabel:from==='jasper'?'Jasper':'William',
  authorAvatar:from==='jasper'?'🦆':'🦖',
  kind:row.kind==='sticker'?'sticker':'message',
  text:String(row.text||''),attachments:[],
  createdAt:String(row.createdAt||new Date().toISOString())
 };
}
async function sync(){
 if(inFlight||!accepted())return;inFlight=true;
 let successful=0;
 try{
  for(const channelId of channels){
   if(!accepted())break;
   try{
    const result=await auth.request('message.list',{channelId,limit:200},{timeout:25000});
    if(!Array.isArray(result?.messages))throw new Error('No server message list');
    successful++;
    for(const record of result.messages){
     const message=toLocal(record,channelId);
     if(!message)continue;
     const exists=app.messages?.[channelId]?.some(m=>m.id===message.id);
     if(exists)continue;
     importing=true;
     try{app.addMessage(message,message.authorId===profile)}
     finally{importing=false}
     if(message.authorId!==profile){
      const alertType=channelId.startsWith('dm-')?'chat':'room';
      app.signalAlert?.(alertType,{conversationId:channelId});
     }
    }
   }catch(err){console.warn('OurSpace message list unavailable for '+channelId,String(err?.message||err))}
  }
  status(successful===channels.length);
 }finally{inFlight=false}
}
if(accepted()){void sync();setInterval(()=>{void sync()},45000)}
window.OurSpaceMessengerSync={sync,status:()=>lastResult,accountConfirmed:()=>onlineConfirmed};
})();
