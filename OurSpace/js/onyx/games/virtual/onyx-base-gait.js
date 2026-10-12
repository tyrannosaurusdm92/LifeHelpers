/* Quadruped paw-contact model informed by the user-provided PixelPet rig reference.
   Timing only: Onyx is a full-body atlas, not a multi-joint IK puppet.
   Never claim independent visual paws where source art doesn't contain them.
 */
(function(root){'use strict';
 const PAWS=['frontLeft','frontRight','hindLeft','hindRight'];
 const WALK={frontLeft:0,frontRight:.52,hindLeft:.75,hindRight:.25};
 const RUN={frontLeft:0,frontRight:.10,hindLeft:.53,hindRight:.63};
 function sample(travel,stride,pace='walk'){
  stride=Math.max(1,Number(stride)||1);const t=((travel/stride)%1+1)%1,starts=pace==='run'?RUN:WALK,duty=pace==='run'?.34:.63;
  const paws={},contacts=[];
  for(const name of PAWS){const local=((t-starts[name])%1+1)%1,stance=local<duty,proportion=stance?local/duty:(local-duty)/(1-duty);
   paws[name]={stance,phase:local,lift:stance?0:Math.sin(proportion*Math.PI),progress:proportion};
   if(local<.035)contacts.push(name);
  }
  return {pace,cycle:t,stridePx:stride,paws,contacts,bodyBobPx:pace==='run'?1.3*Math.sin(t*4*Math.PI):.55*Math.sin(t*8*Math.PI)};
 }
 function crossedContacts(before,after,stride,pace){
  const starts=pace==='run'?RUN:WALK,events=[];if(after<=before||stride<=0)return events;
  for(const name of PAWS){const offset=starts[name]*stride;let first=Math.floor((before-offset)/stride)+1;
   for(let k=first;k<=Math.floor((after-offset)/stride);k++)events.push({name,atDistance:offset+k*stride});
  }
  return events.sort((a,b)=>a.atDistance-b.atDistance);
 }
 root.OnyxBaseGait=Object.freeze({sample,crossedContacts,PAWS});
})(typeof window!=='undefined'?window:globalThis);
