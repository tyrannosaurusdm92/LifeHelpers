(()=>{"use strict";
const root=document.getElementById("feedHimMeowBase"),q=(s,c=root)=>c.querySelector(s),qa=(s,c=root)=>[...c.querySelectorAll(s)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const toolbar=q(".game-toolbar"),viewer=q("#viewerScreen"),actor=q("#catActor"),visual=q("#catVisual"),spriteCanvas=q("#catSprite"),spriteCtx=spriteCanvas.getContext("2d",{alpha:true}),aim=q("#aimReticle"),focus=q("#focusReticle");
let phase="board",mode="direct",behavior="thoughtful",paused=false,zHeld=false,topPanel=null,safePoint=true,hold3Timer=null,hold3Fired=false;
const cat={x:.5,y:.58,vx:0,vy:0,speed:.16,frame:0,dir:3,path:[],goal:null,waitUntil:0,lastStep:0,action:"idle",actionStart:0,actionUntil:0,actionDuration:0,traversal:"ground",cautionUntil:0,motion:"idle",motionUntil:0,visualAction:"idle",pose:"stand",routineName:"",routineToken:0,jointMotion:"neutral",tailMotion:"neutral",airborne:false,jumpHeight:0,jumpPhase:"ground",jumpStart:0,jumpDuration:0,jumpDistance:0,jumpOriginX:.5,jumpOriginY:.58,jumpDir:[0,0],jumpBackward:false};
const aimState={x:.62,y:.42},focusState={x:.5,y:.5},guide={x:0,y:0,active:false};
const nav={cols:18,rows:8,blocked:new Set(),context:{objectiveTargets:[],safeTargets:[],foodTargets:[],prizeTargets:[],hazardTargets:[],climbTargets:[]}};
function emitInput(type,detail={}){
 const payload={type,phase,controlContext:phase==="kitchen"?"kitchen":"hunt",mode,behavior,spriteVariant:activeOnyxVariant()?.id||("onyx_"+behavior),...detail};
 window.dispatchEvent(new CustomEvent("feed-him-meow-input",{detail:payload}));
 window.dispatchEvent(new CustomEvent("onyx-imperial-input",{detail:payload}));
}
const behaviorProfile={
 "advising professor":{speed:.11,pause:1100,response:.75,idle:"hint"},
 "caring":{speed:.12,pause:700,response:.9,idle:"inspect"},
 "hungry":{speed:.17,pause:350,response:.62,idle:"inspect"},
 "judgmental":{speed:.13,pause:850,response:.48,idle:"judgment"},
 "listening":{speed:.14,pause:420,response:1,idle:"listening"},
 "purring":{speed:.11,pause:900,response:.78,idle:"purr"},
 "sleepy":{speed:.07,pause:1700,response:.6,idle:"snuggle"},
 "snuggly":{speed:.09,pause:1150,response:.82,idle:"snuggle"},
 "thinking":{speed:.08,pause:1450,response:.72,idle:"thinking"},
 "thoughtful":{speed:.12,pause:820,response:.84,idle:"thinking"}
};
const autonomyStorageKey="MEOW_ONYX_AUTONOMY_BY_BEHAVIOR_V2";
let savedAutonomy={};try{savedAutonomy=JSON.parse(localStorage.getItem(autonomyStorageKey)||"{}")||{}}catch{}
const autonomyByBehavior=Object.fromEntries(Object.keys(behaviorProfile).map(name=>[name,!!savedAutonomy[name]]));
const autonomyState={manualOverrideUntil:0,nextDecision:0,lastDecision:"idle",decisionCount:0};
const autonomyPools=Object.freeze({
 "advising professor":["hint","thinking","sit","stretch","roam","roam"],
 "caring":["listening","inspect","loaf","stretch","roam","roam"],
 "hungry":["inspect","roam","roam","jump","grumble","stretch"],
 "judgmental":["judgment","sit","shake","voidattude","roam"],
 "listening":["listening","sit","loaf","roam","roam"],
 "purring":["purr","loaf","curl","curl","roam"],
 "sleepy":["curl","curl","loaf","snuggle","sit"],
 "snuggly":["loaf","curl","snuggle","purr","roam"],
 "thinking":["thinking","sit","stretch","roam","roam"],
 "thoughtful":["thinking","stretch","sit","loaf","roam","roam"]
});
function persistAutonomy(){try{localStorage.setItem(autonomyStorageKey,JSON.stringify(autonomyByBehavior))}catch{}}
function isAutonomyEnabled(name=behavior){return phase!=="kitchen"&&!!autonomyByBehavior[name]}
function syncAutonomyMode(){mode=isAutonomyEnabled()?"autonomous":"direct";root.dataset.onyxControl=mode;actor.dataset.mode=mode;return mode}
function setBehaviorAutonomy(name,value){if(!Object.prototype.hasOwnProperty.call(autonomyByBehavior,name))return false;autonomyByBehavior[name]=!!value;persistAutonomy();cat.path=[];cat.goal=null;autonomyState.nextDecision=0;syncAutonomyMode();window.dispatchEvent(new CustomEvent("onyx-autonomy-change",{detail:{behavior:name,enabled:!!value,current:name===behavior,mode}}));return true}
function markManualControl(ms=1500){autonomyState.manualOverrideUntil=Math.max(autonomyState.manualOverrideUntil,performance.now()+ms);cat.path=[];cat.goal=null;if(cat.routineName)cancelCatRoutine?.();if(cat.actionUntil===Infinity&&!['duck','climb'].includes(cat.action)){clearCatAction?.();applyAnatomyPose?.('stand',{emit:false,duration:100})}}

const spriteRig={
 heads:["head1","head2"],
 bodies:{
  horizontal:["b1-1","b1-2","b1-3","b1-4","b1-5"],
  axial:["b2-1","b2-2","b2-3","b2-4","b2-5"],
  diagonal:["b3-1","b3-2","b3-3","b3-4","b3-5"]
 },
 directions:{
  0:{name:"right",frames:["f00","f01","f02","f03","f04"],body:"axial",head:"head2"},
  1:{name:"down-right",frames:["f10","f11","f12","f13","f14"],body:"horizontal",head:"head1"},
  2:{name:"down-left",frames:["f20","f21","f22","f23","f24"],body:"horizontal",head:"head1"},
  3:{name:"left",frames:["f30","f31","f32","f33","f34"],body:"axial",head:"head2"},
  4:{name:"up-left",frames:["f40","f41","f42","f43","f44"],body:"diagonal",head:"head1"},
  5:{name:"up-right",frames:["f50","f51","f52","f53","f54"],body:"diagonal",head:"head1"}
 },
 sequences:{
  idle:[0],walk:[0,1,2,3,4],run:[0,1,2,3,4],dash:[0,2,4,1,3],dashjump:[0,2,4,3,1,0],
  jump:[0,1,2,3,4,3,2,1,0],duck:[4,4,3,4],drop:[4,3,2,1],
  climb:[0,1,2,3,4],pullup:[4,3,2,1,0],inspect:[0,1,0,2,0],
  interact:[0,2,1,3,0],primary:[0,2,4,3,1,0],caution:[4,3,4,0],
  hint:[0,1,2,1,0],listening:[0,1,0],purr:[0,1,0,1,0],
  thinking:[0,1,0,2,0],judgment:[0,0,1,0],snuggle:[4,3,4,3],
  sit:[0,1,2,2,1],loaf:[0,1,2,3,4,4,3,4],curlBall:[0,1,2,3,4,3,4,4],uncurl:[4,3,2,1,0],
  stretchBow:[0,1,2,3,4,4,3],riseFromStretch:[4,3,2,1,0],backLegExtendLeft:[1,2,3,2,1],
  backLegExtendRight:[3,2,1,2,3],shake:[0,1,0,2,0],jumpForward:[0,1,2,3,4],jumpBackward:[4,3,2,1,0],
  jumpTakeoff:[0,1,2],jumpAir:[2,3,4,3],jumpLand:[4,3,2,1,0],
  transitionWalkToSit:[0,1,2,3,4],transitionSitToLoaf:[4,3,4,3,4],transitionLoafToCurl:[4,3,2,3,4],
  transitionCurlToSit:[4,3,2,1,0],transitionSitToStretch:[0,1,2,3,4],
  grumble:[1,4,1,4,0],voidattude:[0,2,4,1,3,0]
 }
};
/*
 * Onyx anatomy registry — validated against the former SVG rig.
 *
 * IMPORTANT:
 * - "right"/"left" are Onyx's anatomical sides, never screen sides.
 * - The former SVG only separated head1/head2 and composite body groups
 *   b1-*, b2-*, b3-*. It did NOT give eyes, whiskers, nose, mouth,
 *   individual paws, individual hind legs, chest, stomach, rear, etc.
 *   their own SVG IDs.
 * - Therefore those finer IDs are stable semantic fine-tuning hooks in
 *   the raster rig. Their legacy source is recorded honestly as the
 *   head/body composite that contained the pixels/geometry.
 * - The legacy frame transform is retained so future editors can resolve
 *   mirrored screen position without ever swapping anatomical identity.
 */
const anatomyPartIds=Object.freeze({
 rightEar:"onyx-right-ear",
 leftEar:"onyx-left-ear",
 rightEye:"onyx-right-eye",
 leftEye:"onyx-left-eye",
 rightWhiskers:"onyx-right-whiskers",
 leftWhiskers:"onyx-left-whiskers",
 nose:"onyx-nose",
 mouth:"onyx-mouth",
 neck:"onyx-neck",
 chest:"onyx-chest",
 shoulders:"onyx-shoulders",
 rightFrontPaw:"onyx-right-front-paw",
 leftFrontPaw:"onyx-left-front-paw",
 torso:"onyx-torso",
 stomach:"onyx-stomach",
 leftBackLeg:"onyx-left-back-leg",
 rightBackLeg:"onyx-right-back-leg",
 rear:"onyx-rear",
 tail:"onyx-tail"
});

const legacySvgReference=Object.freeze({
 source:"Onyx_Imperial_Expedition_Shell former SVG rig",
 viewBox:[-8,-10,56,60],
 heads:["head1","head2"],
 bodies:{
  horizontal:["b1-1","b1-2","b1-3","b1-4","b1-5"],
  axial:["b2-1","b2-2","b2-3","b2-4","b2-5"],
  diagonal:["b3-1","b3-2","b3-3","b3-4","b3-5"]
 },
 directions:{
  0:{name:"right",head:"head2",bodyFamily:"axial",bodyPrefix:"b2",mirrored:true},
  1:{name:"down-right",head:"head1",bodyFamily:"horizontal",bodyPrefix:"b1",mirrored:true},
  2:{name:"down-left",head:"head1",bodyFamily:"horizontal",bodyPrefix:"b1",mirrored:false},
  3:{name:"left",head:"head2",bodyFamily:"axial",bodyPrefix:"b2",mirrored:false},
  4:{name:"up-left",head:"head1",bodyFamily:"diagonal",bodyPrefix:"b3",mirrored:false},
  5:{name:"up-right",head:"head1",bodyFamily:"diagonal",bodyPrefix:"b3",mirrored:true}
 },
 frames:Object.freeze({"f00":{"transform":"scale(-1,1) translate(-27,0)","mirrored":true,"body":"b2-1","bodyOffset":[0.0,0.0],"head":"head2","headOffset":[-5.0,-2.5]},"f01":{"transform":"scale(-1,1) translate(-27,-2)","mirrored":true,"body":"b2-2","bodyOffset":[0.0,0.0],"head":"head2","headOffset":[-10.0,8.0]},"f02":{"transform":"scale(-1,1) translate(-55,-2)","mirrored":true,"body":"b2-3","bodyOffset":[0.0,0.0],"head":"head2","headOffset":[-2.0,1.5]},"f03":{"transform":"scale(-1,1) translate(-58,-2)","mirrored":true,"body":"b2-4","bodyOffset":[0.0,0.0],"head":"head2","headOffset":[-4.5,7.0]},"f04":{"transform":"scale(-1,1) translate(-60,4)","mirrored":true,"body":"b2-5","bodyOffset":[0.0,0.0],"head":"head2","headOffset":[-8.0,-1.0]},"f10":{"transform":"scale(-1,1) translate(-25,-3)","mirrored":true,"body":"b1-1","bodyOffset":[0.0,0.0],"head":"head1","headOffset":[-2.0,-2.0]},"f11":{"transform":"scale(-1,1) translate(-33,-2)","mirrored":true,"body":"b1-2","bodyOffset":[0.0,0.0],"head":"head1","headOffset":[-10.0,11.0]},"f12":{"transform":"scale(-1,1) translate(-40,-2)","mirrored":true,"body":"b1-3","bodyOffset":[0.0,0.0],"head":"head1","headOffset":[-5.0,27.0]},"f13":{"transform":"scale(-1,1) translate(-43,3)","mirrored":true,"body":"b1-4","bodyOffset":[0.0,0.0],"head":"head1","headOffset":[-3.0,32.0]},"f14":{"transform":"scale(-1,1) translate(-43,9)","mirrored":true,"body":"b1-5","bodyOffset":[0.0,0.0],"head":"head1","headOffset":[-5.0,27.0]},"f20":{"transform":"translate(0,-3)","mirrored":false,"body":"b1-1","bodyOffset":[0.0,0.0],"head":"head1","headOffset":[-2.0,-2.0]},"f21":{"transform":"translate(-6,-2)","mirrored":false,"body":"b1-2","bodyOffset":[0.0,0.0],"head":"head1","headOffset":[-10.0,11.0]},"f22":{"transform":"translate(-12,-2)","mirrored":false,"body":"b1-3","bodyOffset":[0.0,0.0],"head":"head1","headOffset":[-5.0,27.0]},"f23":{"transform":"translate(-15,3)","mirrored":false,"body":"b1-4","bodyOffset":[0.0,0.0],"head":"head1","headOffset":[-3.0,32.0]},"f24":{"transform":"translate(-15,9)","mirrored":false,"body":"b1-5","bodyOffset":[0.0,0.0],"head":"head1","headOffset":[-5.0,27.0]},"f30":{"transform":"","mirrored":false,"body":"b2-1","bodyOffset":[0.0,0.0],"head":"head2","headOffset":[-5.0,-2.5]},"f31":{"transform":"translate(-3,-2)","mirrored":false,"body":"b2-2","bodyOffset":[0.0,0.0],"head":"head2","headOffset":[-10.0,8.0]},"f32":{"transform":"translate(-30,-2)","mirrored":false,"body":"b2-3","bodyOffset":[0.0,0.0],"head":"head2","headOffset":[-2.0,1.5]},"f33":{"transform":"translate(-30,-2)","mirrored":false,"body":"b2-4","bodyOffset":[0.0,0.0],"head":"head2","headOffset":[-4.5,7.0]},"f34":{"transform":"translate(-30,4)","mirrored":false,"body":"b2-5","bodyOffset":[0.0,0.0],"head":"head2","headOffset":[-8.0,-1.0]},"f40":{"transform":"translate(2,6)","mirrored":false,"body":"b3-1","bodyOffset":[0.0,0.0],"head":"head1","headOffset":[-2.0,-11.0]},"f41":{"transform":"translate(0,-10)","mirrored":false,"body":"b3-2","bodyOffset":[0.0,0.0],"head":"head1","headOffset":[-5.0,0.0]},"f42":{"transform":"translate(-6,-14)","mirrored":false,"body":"b3-3","bodyOffset":[0.0,0.0],"head":"head1","headOffset":[-1.0,-12.0]},"f43":{"transform":"translate(-8,-16)","mirrored":false,"body":"b3-4","bodyOffset":[0.0,0.0],"head":"head1","headOffset":[-5.5,-8.0]},"f44":{"transform":"translate(-12,-22)","mirrored":false,"body":"b3-5","bodyOffset":[0.0,0.0],"head":"head1","headOffset":[-4.0,-5.0]},"f50":{"transform":"scale(-1,1) translate(-27,6)","mirrored":true,"body":"b3-1","bodyOffset":[0.0,0.0],"head":"head1","headOffset":[-2.0,-11.0]},"f51":{"transform":"scale(-1,1) translate(-29,-8)","mirrored":true,"body":"b3-2","bodyOffset":[0.0,0.0],"head":"head1","headOffset":[-5.0,0.0]},"f52":{"transform":"scale(-1,1) translate(-36,-14)","mirrored":true,"body":"b3-3","bodyOffset":[0.0,0.0],"head":"head1","headOffset":[-1.0,-12.0]},"f53":{"transform":"scale(-1,1) translate(-38,-16)","mirrored":true,"body":"b3-4","bodyOffset":[0.0,0.0],"head":"head1","headOffset":[-5.5,-8.0]},"f54":{"transform":"scale(-1,1) translate(-42,-22)","mirrored":true,"body":"b3-5","bodyOffset":[0.0,0.0],"head":"head1","headOffset":[-4.0,-5.0]}})
});

const makeAnatomyPart=(key,name,parent,side,domain,legacyPresence,legacySeparation,notes="")=>({
 id:anatomyPartIds[key],key,name,parent,side,domain,
 legacyPresence,legacySeparation,notes,
 tuning:{x:0,y:0,scaleX:1,scaleY:1,rotation:0,opacity:1}
});

const anatomyRig={
 coordinateSpace:"anatomical",
 atlasCell:[64,64],
 referenceRenderer:"former-svg",
 validation:{
  status:"cross-checked",
  sourceViewBox:[...legacySvgReference.viewBox],
  directionMap:"exact former SVG f00-f54 composition retained",
  lateralityRule:"anatomical IDs do not swap when a legacy frame is mirrored",
  limitation:"former SVG used composite head/body paths, so fine facial and limb IDs are semantic subdivisions of those composites"
 },
 parts:{
  [anatomyPartIds.rightEar]:makeAnatomyPart("rightEar","right ear","head","right","head","embedded-head-silhouette","inside head1/head2 composite","head1 contains two ear silhouettes; head2 is profile/overlap"),
  [anatomyPartIds.leftEar]:makeAnatomyPart("leftEar","left ear","head","left","head","embedded-head-silhouette","inside head1/head2 composite","head1 contains two ear silhouettes; head2 is profile/overlap"),
  [anatomyPartIds.rightEye]:makeAnatomyPart("rightEye","right eye","face","right","head","not-separately-drawn-in-legacy-svg","semantic subdivision of current raster head","legacy SVG provides head placement, not a distinct eye node"),
  [anatomyPartIds.leftEye]:makeAnatomyPart("leftEye","left eye","face","left","head","not-separately-drawn-in-legacy-svg","semantic subdivision of current raster head","legacy SVG provides head placement, not a distinct eye node"),
  [anatomyPartIds.rightWhiskers]:makeAnatomyPart("rightWhiskers","right whiskers","muzzle","right","head","not-separately-drawn-in-legacy-svg","semantic subdivision of current raster head","legacy SVG provides head placement, not distinct whisker nodes"),
  [anatomyPartIds.leftWhiskers]:makeAnatomyPart("leftWhiskers","left whiskers","muzzle","left","head","not-separately-drawn-in-legacy-svg","semantic subdivision of current raster head","legacy SVG provides head placement, not distinct whisker nodes"),
  [anatomyPartIds.nose]:makeAnatomyPart("nose","nose","muzzle","center","head","not-separately-drawn-in-legacy-svg","semantic subdivision of current raster head","center muzzle reference"),
  [anatomyPartIds.mouth]:makeAnatomyPart("mouth","mouth","muzzle","center","head","not-separately-drawn-in-legacy-svg","semantic subdivision of current raster head","center/lower muzzle reference"),
  [anatomyPartIds.neck]:makeAnatomyPart("neck","neck","head-body-junction","center","junction","head/body-overlap","head1/head2 plus active b1/b2/b3 composite","corrected from body-only mapping: legacy rig constructs this at the head/body junction"),
  [anatomyPartIds.chest]:makeAnatomyPart("chest","chest","upper-body","center","body","embedded-body-composite","inside active b1/b2/b3 path","front lower upper-body region"),
  [anatomyPartIds.shoulders]:makeAnatomyPart("shoulders","shoulders","upper-body","bilateral","body","embedded-body-composite","inside active b1/b2/b3 path","junction behind/below the neck"),
  [anatomyPartIds.rightFrontPaw]:makeAnatomyPart("rightFrontPaw","right front paw","front-limbs","right","body","embedded-body-composite","inside active b1/b2/b3 path","legacy SVG does not separately label right/left front limbs"),
  [anatomyPartIds.leftFrontPaw]:makeAnatomyPart("leftFrontPaw","left front paw","front-limbs","left","body","embedded-body-composite","inside active b1/b2/b3 path","legacy SVG does not separately label right/left front limbs"),
  [anatomyPartIds.torso]:makeAnatomyPart("torso","torso","core","center","body","embedded-body-composite","inside active b1/b2/b3 path","main body mass"),
  [anatomyPartIds.stomach]:makeAnatomyPart("stomach","stomach","core","center","body","embedded-body-composite","inside active b1/b2/b3 path","lower/ventral body region"),
  [anatomyPartIds.leftBackLeg]:makeAnatomyPart("leftBackLeg","left back leg","hind-limbs","left","body","embedded-body-composite","inside active b1/b2/b3 path","legacy SVG does not separately label right/left hind limbs"),
  [anatomyPartIds.rightBackLeg]:makeAnatomyPart("rightBackLeg","right back leg","hind-limbs","right","body","embedded-body-composite","inside active b1/b2/b3 path","legacy SVG does not separately label right/left hind limbs"),
  [anatomyPartIds.rear]:makeAnatomyPart("rear","rear","hindquarters","center","body","embedded-body-composite","inside active b1/b2/b3 path","hindquarter mass"),
  [anatomyPartIds.tail]:makeAnatomyPart("tail","tail","hindquarters","center","body","embedded-body-path-stroke","inside active b1/b2/b3 path","tail geometry is part of each legacy composite body path")
 }
};
spriteRig.anatomy=anatomyRig;
spriteRig.legacySvgReference=legacySvgReference;

/*
 * Added quadruped joint/tail rig metadata and cat-pose library so Onyx can
 * transition between common feline body behaviors without replacing the
 * existing pixel-atlas renderer. These are semantic rigging controls layered
 * onto the current anatomy map for future fine-tuning.
 */
const quadrupedRigEnhancements={
 joints:{
  headNeck:{id:"onyx-joint-head-neck",type:"ball",parts:[anatomyPartIds.neck,anatomyPartIds.nose,anatomyPartIds.mouth],dof:["pitch","yaw","roll"]},
  shoulderGirdle:{id:"onyx-joint-shoulder-girdle",type:"hinge",parts:[anatomyPartIds.shoulders,anatomyPartIds.chest],dof:["lift","drop","roll"]},
  spineUpper:{id:"onyx-joint-spine-upper",type:"flex",parts:[anatomyPartIds.torso,anatomyPartIds.stomach],dof:["arch","curl","twist"]},
  pelvis:{id:"onyx-joint-pelvis",type:"hinge",parts:[anatomyPartIds.rear,anatomyPartIds.leftBackLeg,anatomyPartIds.rightBackLeg],dof:["tuck","lift","drop"]},
  rightFrontElbow:{id:"onyx-joint-right-front-elbow",type:"hinge",parts:[anatomyPartIds.rightFrontPaw],dof:["fold","extend"]},
  leftFrontElbow:{id:"onyx-joint-left-front-elbow",type:"hinge",parts:[anatomyPartIds.leftFrontPaw],dof:["fold","extend"]},
  rightHipKnee:{id:"onyx-joint-right-hip-knee",type:"compound",parts:[anatomyPartIds.rightBackLeg],dof:["fold","extend"]},
  leftHipKnee:{id:"onyx-joint-left-hip-knee",type:"compound",parts:[anatomyPartIds.leftBackLeg],dof:["fold","extend"]},
  tailBase:{id:"onyx-joint-tail-base",type:"ball",parts:[anatomyPartIds.tail],dof:["raise","lower","curl","swish"]},
  tailMid:{id:"onyx-joint-tail-mid",type:"flex",parts:[anatomyPartIds.tail],dof:["curl","uncurl","wave"]},
  tailTip:{id:"onyx-joint-tail-tip",type:"flex",parts:[anatomyPartIds.tail],dof:["curl","flick","hook"]}
 },
 tailRig:{
  partId:anatomyPartIds.tail,
  segments:[
   {id:"tail-base",joint:"tailBase",range:{raise:40,lower:-35,curl:55}},
   {id:"tail-mid",joint:"tailMid",range:{raise:35,lower:-40,curl:75}},
   {id:"tail-tip",joint:"tailTip",range:{raise:45,lower:-45,curl:95}}
  ],
  defaultPose:"neutral"
 },
 poseLibrary:{
  stand:{description:"Neutral standing / walking base pose.",defaultAction:"idle",visualAction:"idle",parts:{}},
  sitEntry:{description:"Rear lowers from walk into sit.",defaultAction:"transitionWalkToSit",visualAction:"idle",parts:{
   [anatomyPartIds.rear]:{y:3,scaleY:1.05},[anatomyPartIds.torso]:{y:1,rotation:-4},[anatomyPartIds.stomach]:{y:2,scaleY:.95},
   [anatomyPartIds.rightFrontPaw]:{x:2,y:2,rotation:10},[anatomyPartIds.leftFrontPaw]:{x:-2,y:2,rotation:-10},[anatomyPartIds.tail]:{x:-1,y:1,rotation:18}
  }},
  sit:{description:"Sit on butt with the front legs extended forward.",defaultAction:"sit",visualAction:"idle",parts:{
   [anatomyPartIds.rear]:{y:5,scaleY:1.08},[anatomyPartIds.torso]:{y:2,scaleY:.95,rotation:-6},[anatomyPartIds.stomach]:{y:4,scaleY:.9},
   [anatomyPartIds.rightFrontPaw]:{x:3,y:4,rotation:15},[anatomyPartIds.leftFrontPaw]:{x:-3,y:4,rotation:-15},
   [anatomyPartIds.chest]:{y:1,scaleY:.96},[anatomyPartIds.shoulders]:{y:1},[anatomyPartIds.tail]:{x:-2,y:2,rotation:28}
  }},
  loafEntry:{description:"Lower body from sit toward the floor before tucking paws.",defaultAction:"transitionSitToLoaf",visualAction:"snuggle",parts:{
   [anatomyPartIds.torso]:{y:4,scaleY:.92},[anatomyPartIds.stomach]:{y:5,scaleY:.88},[anatomyPartIds.rear]:{y:4},
   [anatomyPartIds.rightFrontPaw]:{x:2,y:5,rotation:12},[anatomyPartIds.leftFrontPaw]:{x:-2,y:5,rotation:-12},[anatomyPartIds.tail]:{x:-3,y:3,rotation:42}
  }},
  loaf:{description:"Loaf pose with the front legs folded under and in front.",defaultAction:"loaf",visualAction:"snuggle",parts:{
   [anatomyPartIds.torso]:{y:5,scaleX:1.03,scaleY:.86},[anatomyPartIds.stomach]:{y:6,scaleX:1.02,scaleY:.82},[anatomyPartIds.rear]:{y:4,scaleY:1.02},
   [anatomyPartIds.rightFrontPaw]:{x:1,y:6,scaleY:.72,rotation:4},[anatomyPartIds.leftFrontPaw]:{x:-1,y:6,scaleY:.72,rotation:-4},
   [anatomyPartIds.shoulders]:{y:2},[anatomyPartIds.chest]:{y:3},[anatomyPartIds.tail]:{x:-4,y:4,rotation:58}
  }},
  curlEntry:{description:"Fold from loaf into a curl.",defaultAction:"transitionLoafToCurl",visualAction:"purr",parts:{
   [anatomyPartIds.torso]:{y:5,scaleX:.95,scaleY:.9,rotation:8},[anatomyPartIds.stomach]:{y:5,scaleX:.92,scaleY:.84,rotation:12},
   [anatomyPartIds.rear]:{y:4,rotation:12},[anatomyPartIds.rightFrontPaw]:{x:2,y:5,rotation:30},[anatomyPartIds.leftFrontPaw]:{x:-2,y:5,rotation:-30},
   [anatomyPartIds.neck]:{y:2,rotation:-16},[anatomyPartIds.tail]:{x:-1,y:2,rotation:95}
  }},
  curlBall:{description:"Curled sleeping ball with the tail wrapped in.",defaultAction:"curlBall",visualAction:"purr",parts:{
   [anatomyPartIds.neck]:{y:4,rotation:-24},[anatomyPartIds.chest]:{y:4,scaleY:.85},[anatomyPartIds.shoulders]:{y:4,rotation:-8},
   [anatomyPartIds.torso]:{y:6,scaleX:.84,scaleY:.82,rotation:14},[anatomyPartIds.stomach]:{y:6,scaleX:.78,scaleY:.78,rotation:18},
   [anatomyPartIds.rear]:{y:3,rotation:14},[anatomyPartIds.rightFrontPaw]:{x:1,y:6,scaleY:.65,rotation:36},[anatomyPartIds.leftFrontPaw]:{x:-1,y:6,scaleY:.65,rotation:-36},
   [anatomyPartIds.leftBackLeg]:{x:-1,y:3,scaleY:.78,rotation:-18},[anatomyPartIds.rightBackLeg]:{x:1,y:3,scaleY:.78,rotation:18},[anatomyPartIds.tail]:{x:0,y:1,rotation:118,scaleX:.92,scaleY:.92}
  }},
  sitReturn:{description:"Open back out from a curl into a seated pose.",defaultAction:"transitionCurlToSit",visualAction:"idle",parts:{
   [anatomyPartIds.neck]:{y:1,rotation:-10},[anatomyPartIds.shoulders]:{y:1},[anatomyPartIds.torso]:{y:2,scaleX:.96,scaleY:.92,rotation:-4},
   [anatomyPartIds.stomach]:{y:3,scaleY:.88},[anatomyPartIds.rear]:{y:5},[anatomyPartIds.rightFrontPaw]:{x:2,y:4,rotation:12},[anatomyPartIds.leftFrontPaw]:{x:-2,y:4,rotation:-12},
   [anatomyPartIds.tail]:{x:-2,y:2,rotation:32}
  }},
  stretchBow:{description:"Head and shoulders down, front legs out, butt in the air.",defaultAction:"stretchBow",visualAction:"climb",parts:{
   [anatomyPartIds.neck]:{y:5,rotation:-26},[anatomyPartIds.chest]:{y:6,scaleY:.84},[anatomyPartIds.shoulders]:{y:5,rotation:-10},
   [anatomyPartIds.rightFrontPaw]:{x:5,y:8,scaleY:1.16,rotation:8},[anatomyPartIds.leftFrontPaw]:{x:-5,y:8,scaleY:1.16,rotation:-8},
   [anatomyPartIds.torso]:{y:2,scaleX:1.06,rotation:8},[anatomyPartIds.stomach]:{y:3,scaleX:1.08,rotation:10},[anatomyPartIds.rear]:{y:-2,scaleY:1.08,rotation:12},
   [anatomyPartIds.leftBackLeg]:{x:-2,y:-1,scaleY:1.08,rotation:-6},[anatomyPartIds.rightBackLeg]:{x:2,y:-1,scaleY:1.08,rotation:6},[anatomyPartIds.tail]:{x:0,y:-3,rotation:-32,scaleY:1.05}
  }},
  stretchRecoverUnder:{description:"Bring the legs back under, raise the shoulders and head, and lower the butt.",defaultAction:"riseFromStretch",visualAction:"idle",parts:{
   [anatomyPartIds.neck]:{y:2,rotation:-8},[anatomyPartIds.chest]:{y:2,scaleY:.92},[anatomyPartIds.shoulders]:{y:1},
   [anatomyPartIds.rightFrontPaw]:{x:2,y:5,scaleY:.95,rotation:10},[anatomyPartIds.leftFrontPaw]:{x:-2,y:5,scaleY:.95,rotation:-10},
   [anatomyPartIds.torso]:{y:1,rotation:0},[anatomyPartIds.stomach]:{y:2,rotation:2},[anatomyPartIds.rear]:{y:1,rotation:0},[anatomyPartIds.tail]:{x:0,y:-1,rotation:-10}
  }},
  stretchRecoverLeft:{description:"Extend the left back leg while the right stays planted.",defaultAction:"backLegExtendLeft",visualAction:"idle",parts:{
   [anatomyPartIds.leftBackLeg]:{x:-5,y:2,scaleY:1.12,rotation:-22},[anatomyPartIds.rightBackLeg]:{x:1,y:0,scaleY:1.0,rotation:6},
   [anatomyPartIds.rear]:{y:1,rotation:-4},[anatomyPartIds.tail]:{rotation:12}
  }},
  stretchRecoverRight:{description:"Extend the right back leg while the left stays planted.",defaultAction:"backLegExtendRight",visualAction:"idle",parts:{
   [anatomyPartIds.rightBackLeg]:{x:5,y:2,scaleY:1.12,rotation:22},[anatomyPartIds.leftBackLeg]:{x:-1,y:0,scaleY:1.0,rotation:-6},
   [anatomyPartIds.rear]:{y:1,rotation:4},[anatomyPartIds.tail]:{rotation:-12}
  }},
  shake:{description:"A quick post-stretch body shake with tail flick.",defaultAction:"shake",visualAction:"grumble",parts:{
   [anatomyPartIds.neck]:{rotation:12},[anatomyPartIds.shoulders]:{rotation:-10},[anatomyPartIds.torso]:{rotation:8},[anatomyPartIds.rear]:{rotation:-8},[anatomyPartIds.tail]:{rotation:34}
  }},
  jumpForward:{description:"Body extends forward for a leap.",defaultAction:"jumpForward",visualAction:"jump",parts:{
   [anatomyPartIds.neck]:{rotation:-6},[anatomyPartIds.shoulders]:{y:-1},[anatomyPartIds.rightFrontPaw]:{x:4,y:-1,scaleY:1.08},[anatomyPartIds.leftFrontPaw]:{x:-4,y:-1,scaleY:1.08},
   [anatomyPartIds.torso]:{scaleX:1.08},[anatomyPartIds.leftBackLeg]:{x:-3,y:1,scaleY:1.08},[anatomyPartIds.rightBackLeg]:{x:3,y:1,scaleY:1.08},[anatomyPartIds.tail]:{rotation:-18}
  }},
  jumpBackward:{description:"Body compresses and springs backward.",defaultAction:"jumpBackward",visualAction:"jump",parts:{
   [anatomyPartIds.neck]:{rotation:10},[anatomyPartIds.shoulders]:{y:1},[anatomyPartIds.rightFrontPaw]:{x:-2,y:3,rotation:10},[anatomyPartIds.leftFrontPaw]:{x:2,y:3,rotation:-10},
   [anatomyPartIds.torso]:{scaleX:.94,rotation:6},[anatomyPartIds.stomach]:{scaleX:.92,rotation:8},[anatomyPartIds.leftBackLeg]:{x:-2,y:-1,scaleY:1.04},[anatomyPartIds.rightBackLeg]:{x:2,y:-1,scaleY:1.04},[anatomyPartIds.tail]:{rotation:22}
  }}
 },
 routineLibrary:{
  walkSitLoafCurlStretchWalk:[
   {action:"walk",pose:"stand",duration:520},
   {action:"transitionWalkToSit",pose:"sitEntry",duration:320},
   {action:"sit",pose:"sit",duration:640},
   {action:"transitionSitToLoaf",pose:"loafEntry",duration:360},
   {action:"loaf",pose:"loaf",duration:760},
   {action:"transitionLoafToCurl",pose:"curlEntry",duration:340},
   {action:"curlBall",pose:"curlBall",duration:900},
   {action:"transitionCurlToSit",pose:"sitReturn",duration:360},
   {action:"sit",pose:"sit",duration:560},
   {action:"stretchBow",pose:"stretchBow",duration:980},
   {action:"riseFromStretch",pose:"stretchRecoverUnder",duration:440},
   {action:"backLegExtendLeft",pose:"stretchRecoverLeft",duration:340},
   {action:"backLegExtendRight",pose:"stretchRecoverRight",duration:340},
   {action:"shake",pose:"shake",duration:320},
   {action:"walk",pose:"stand",duration:560}
  ]
 },
 defaultRoutine:"walkSitLoafCurlStretchWalk"
};
anatomyRig.jointRig=quadrupedRigEnhancements.joints;
anatomyRig.tailRig=quadrupedRigEnhancements.tailRig;
anatomyRig.poseLibrary=quadrupedRigEnhancements.poseLibrary;
anatomyRig.routineLibrary=quadrupedRigEnhancements.routineLibrary;
anatomyRig.capabilities=["walk","sit","loaf","curlBall","jumpForward","jumpBackward","stretchBow","riseFromStretch","backLegExtendLeft","backLegExtendRight","shake"];
spriteRig.capabilities=[...anatomyRig.capabilities];
spriteRig.routineLibrary=quadrupedRigEnhancements.routineLibrary;

/*
 * Research-informed 2D quadruped skeleton pass.
 * The existing pose library remains authoritative; this deepens it with
 * hierarchical bones, IK targets, blended transitions, and a multi-bone tail.
 */
Object.assign(quadrupedRigEnhancements.poseLibrary,{
 loafFrontReach:{description:"From sit, reach both front legs forward before lowering the body.",defaultAction:"transitionSitToLoaf",visualAction:"snuggle",parts:{
  [anatomyPartIds.rear]:{y:5,scaleY:1.08},[anatomyPartIds.torso]:{y:2,scaleY:.95,rotation:-5},[anatomyPartIds.stomach]:{y:4,scaleY:.9},
  [anatomyPartIds.shoulders]:{y:2},[anatomyPartIds.chest]:{y:2},[anatomyPartIds.rightFrontPaw]:{x:5,y:4,scaleY:1.08,rotation:8},
  [anatomyPartIds.leftFrontPaw]:{x:-5,y:4,scaleY:1.08,rotation:-8},[anatomyPartIds.tail]:{x:-2,y:2,rotation:30}
 }},
 loafFrontExtend:{description:"Extend the front legs fully while the rear remains seated.",defaultAction:"transitionSitToLoaf",visualAction:"snuggle",parts:{
  [anatomyPartIds.rear]:{y:5,scaleY:1.08},[anatomyPartIds.torso]:{y:3,scaleX:1.04,scaleY:.92,rotation:-3},[anatomyPartIds.stomach]:{y:4,scaleX:1.03,scaleY:.88},
  [anatomyPartIds.shoulders]:{y:3},[anatomyPartIds.chest]:{y:3},[anatomyPartIds.rightFrontPaw]:{x:7,y:5,scaleY:1.18,rotation:5},
  [anatomyPartIds.leftFrontPaw]:{x:-7,y:5,scaleY:1.18,rotation:-5},[anatomyPartIds.tail]:{x:-3,y:3,rotation:38}
 }},
 loafBodyLower:{description:"Lower chest, shoulders, torso, and stomach to the floor with front legs still forward.",defaultAction:"transitionSitToLoaf",visualAction:"snuggle",parts:{
  [anatomyPartIds.rear]:{y:5,scaleY:1.02},[anatomyPartIds.torso]:{y:6,scaleX:1.05,scaleY:.84},[anatomyPartIds.stomach]:{y:7,scaleX:1.04,scaleY:.8},
  [anatomyPartIds.shoulders]:{y:5},[anatomyPartIds.chest]:{y:6,scaleY:.9},[anatomyPartIds.neck]:{y:3,rotation:-8},
  [anatomyPartIds.rightFrontPaw]:{x:6,y:7,scaleY:1.12,rotation:4},[anatomyPartIds.leftFrontPaw]:{x:-6,y:7,scaleY:1.12,rotation:-4},[anatomyPartIds.tail]:{x:-4,y:4,rotation:50}
 }},
 loafPawFold:{description:"Fold both front legs back under/in front of the chest to complete the loaf.",defaultAction:"loaf",visualAction:"snuggle",parts:{
  [anatomyPartIds.rear]:{y:5,scaleY:1.02},[anatomyPartIds.torso]:{y:6,scaleX:1.05,scaleY:.83},[anatomyPartIds.stomach]:{y:7,scaleX:1.03,scaleY:.8},
  [anatomyPartIds.shoulders]:{y:4},[anatomyPartIds.chest]:{y:5,scaleY:.9},[anatomyPartIds.rightFrontPaw]:{x:1,y:7,scaleX:.82,scaleY:.68,rotation:18},
  [anatomyPartIds.leftFrontPaw]:{x:-1,y:7,scaleX:.82,scaleY:.68,rotation:-18},[anatomyPartIds.tail]:{x:-4,y:4,rotation:62}
 }},
 stretchGather:{description:"Recover from the bow by bringing both front legs back under the shoulders.",defaultAction:"riseFromStretch",visualAction:"idle",parts:{
  [anatomyPartIds.neck]:{y:4,rotation:-18},[anatomyPartIds.chest]:{y:5,scaleY:.88},[anatomyPartIds.shoulders]:{y:4,rotation:-6},
  [anatomyPartIds.rightFrontPaw]:{x:3,y:6,scaleY:1.04,rotation:7},[anatomyPartIds.leftFrontPaw]:{x:-3,y:6,scaleY:1.04,rotation:-7},
  [anatomyPartIds.torso]:{y:2,scaleX:1.04,rotation:6},[anatomyPartIds.stomach]:{y:3,scaleX:1.04,rotation:6},[anatomyPartIds.rear]:{y:-1,scaleY:1.06},[anatomyPartIds.tail]:{y:-2,rotation:-24}
 }},
 stretchRaiseFront:{description:"Raise shoulders and head while the front legs are underneath.",defaultAction:"riseFromStretch",visualAction:"idle",parts:{
  [anatomyPartIds.neck]:{y:1,rotation:-5},[anatomyPartIds.chest]:{y:2,scaleY:.94},[anatomyPartIds.shoulders]:{y:1,rotation:-2},
  [anatomyPartIds.rightFrontPaw]:{x:2,y:5,scaleY:.98,rotation:5},[anatomyPartIds.leftFrontPaw]:{x:-2,y:5,scaleY:.98,rotation:-5},
  [anatomyPartIds.torso]:{y:1,rotation:3},[anatomyPartIds.stomach]:{y:2,rotation:3},[anatomyPartIds.rear]:{y:-1,scaleY:1.04},[anatomyPartIds.tail]:{y:-1,rotation:-16}
 }},
 stretchLowerRear:{description:"Lower the butt/pelvis back to neutral while keeping the front end raised.",defaultAction:"riseFromStretch",visualAction:"idle",parts:{
  [anatomyPartIds.neck]:{y:0,rotation:0},[anatomyPartIds.chest]:{y:1,scaleY:.98},[anatomyPartIds.shoulders]:{y:0},
  [anatomyPartIds.rightFrontPaw]:{x:1,y:4,rotation:4},[anatomyPartIds.leftFrontPaw]:{x:-1,y:4,rotation:-4},
  [anatomyPartIds.torso]:{y:0,rotation:0},[anatomyPartIds.stomach]:{y:1,rotation:0},[anatomyPartIds.rear]:{y:1,rotation:0},[anatomyPartIds.tail]:{rotation:-6}
 }},
 shakeLeft:{description:"First half of a small whole-body shake.",defaultAction:"shake",visualAction:"grumble",parts:{
  [anatomyPartIds.neck]:{rotation:-13},[anatomyPartIds.shoulders]:{rotation:11},[anatomyPartIds.torso]:{rotation:-9},[anatomyPartIds.stomach]:{rotation:-7},[anatomyPartIds.rear]:{rotation:8},[anatomyPartIds.tail]:{rotation:-42}
 }},
 shakeRight:{description:"Second half of a small whole-body shake.",defaultAction:"shake",visualAction:"grumble",parts:{
  [anatomyPartIds.neck]:{rotation:13},[anatomyPartIds.shoulders]:{rotation:-11},[anatomyPartIds.torso]:{rotation:9},[anatomyPartIds.stomach]:{rotation:7},[anatomyPartIds.rear]:{rotation:-8},[anatomyPartIds.tail]:{rotation:42}
 }}
});

quadrupedRigEnhancements.routineLibrary.walkSitLoafCurlStretchWalk=[
 {action:"walk",pose:"stand",duration:520,poseBlend:120},
 {action:"transitionWalkToSit",pose:"sitEntry",duration:300,poseBlend:250},
 {action:"sit",pose:"sit",duration:420,poseBlend:180},
 {action:"transitionSitToLoaf",pose:"loafFrontReach",duration:260,poseBlend:220},
 {action:"transitionSitToLoaf",pose:"loafFrontExtend",duration:260,poseBlend:220},
 {action:"transitionSitToLoaf",pose:"loafBodyLower",duration:300,poseBlend:260},
 {action:"loaf",pose:"loafPawFold",duration:300,poseBlend:260},
 {action:"loaf",pose:"loaf",duration:700,poseBlend:180},
 {action:"transitionLoafToCurl",pose:"curlEntry",duration:320,poseBlend:260},
 {action:"curlBall",pose:"curlBall",duration:860,poseBlend:300},
 {action:"transitionCurlToSit",pose:"sitReturn",duration:340,poseBlend:280},
 {action:"sit",pose:"sit",duration:420,poseBlend:180},
 {action:"stretchBow",pose:"stretchBow",duration:900,poseBlend:340},
 {action:"riseFromStretch",pose:"stretchGather",duration:300,poseBlend:260},
 {action:"riseFromStretch",pose:"stretchRaiseFront",duration:300,poseBlend:260},
 {action:"riseFromStretch",pose:"stretchLowerRear",duration:280,poseBlend:240},
 {action:"backLegExtendLeft",pose:"stretchRecoverLeft",duration:360,poseBlend:250,ikPlant:"rightHind"},
 {action:"backLegExtendRight",pose:"stretchRecoverRight",duration:360,poseBlend:250,ikPlant:"leftHind"},
 {action:"shake",pose:"shakeLeft",duration:90,poseBlend:70},
 {action:"shake",pose:"shakeRight",duration:90,poseBlend:70},
 {action:"shake",pose:"shakeLeft",duration:80,poseBlend:60},
 {action:"shake",pose:"shakeRight",duration:80,poseBlend:60},
 {action:"shake",pose:"stand",duration:100,poseBlend:80},
 {action:"walk",pose:"stand",duration:560,poseBlend:180}
];
quadrupedRigEnhancements.routineLibrary.settleLoaf=[
 {action:"transitionWalkToSit",pose:"sitEntry",duration:260,poseBlend:220},
 {action:"sit",pose:"sit",duration:260,poseBlend:180},
 {action:"transitionSitToLoaf",pose:"loafFrontReach",duration:220,poseBlend:190},
 {action:"transitionSitToLoaf",pose:"loafFrontExtend",duration:230,poseBlend:200},
 {action:"transitionSitToLoaf",pose:"loafBodyLower",duration:280,poseBlend:245},
 {action:"loaf",pose:"loafPawFold",duration:260,poseBlend:220},
 {action:"loaf",pose:"loaf",duration:820,poseBlend:200}
];
quadrupedRigEnhancements.routineLibrary.curlSleep=[
 {action:"transitionSitToLoaf",pose:"loafBodyLower",duration:260,poseBlend:230},
 {action:"loaf",pose:"loaf",duration:300,poseBlend:180},
 {action:"transitionLoafToCurl",pose:"curlEntry",duration:360,poseBlend:300},
 {action:"curlBall",pose:"curlBall",duration:980,poseBlend:360},
 {action:"curlBall",pose:"curlBall",duration:760,poseBlend:120}
];
quadrupedRigEnhancements.routineLibrary.fullStretch=[
 {action:"transitionSitToStretch",pose:"stretchBow",duration:300,poseBlend:280},
 {action:"stretchBow",pose:"stretchBow",duration:760,poseBlend:260},
 {action:"riseFromStretch",pose:"stretchGather",duration:280,poseBlend:250},
 {action:"riseFromStretch",pose:"stretchRaiseFront",duration:280,poseBlend:245},
 {action:"riseFromStretch",pose:"stretchLowerRear",duration:260,poseBlend:220},
 {action:"backLegExtendLeft",pose:"stretchRecoverLeft",duration:330,poseBlend:230,ikPlant:"rightHind"},
 {action:"backLegExtendRight",pose:"stretchRecoverRight",duration:330,poseBlend:230,ikPlant:"leftHind"},
 {action:"shake",pose:"shakeLeft",duration:85,poseBlend:65},
 {action:"shake",pose:"shakeRight",duration:85,poseBlend:65},
 {action:"shake",pose:"stand",duration:105,poseBlend:80}
];

const quadrupedSkeleton2D=Object.freeze({
 coordinateSpace:"sprite-64",root:"root",
 bones:Object.freeze({
  root:{parent:null,x:32,y:34,rotation:0,length:0,limit:null},
  pelvis:{parent:"root",x:0,y:0,rotation:0,length:8,limit:[-35,35]},
  spineLower:{parent:"pelvis",x:-5,y:-1,rotation:0,length:7,limit:[-35,35]},
  spineMid:{parent:"spineLower",x:7,y:0,rotation:0,length:7,limit:[-35,35]},
  spineUpper:{parent:"spineMid",x:7,y:0,rotation:0,length:7,limit:[-40,40]},
  shoulders:{parent:"spineUpper",x:7,y:0,rotation:0,length:5,limit:[-35,35]},
  neck:{parent:"shoulders",x:4,y:-1,rotation:-10,length:4,limit:[-55,55]},
  head:{parent:"neck",x:4,y:0,rotation:0,length:5,limit:[-70,70]},
  leftFrontUpper:{parent:"shoulders",x:2,y:1,rotation:70,length:7,limit:[15,150]},
  leftFrontLower:{parent:"leftFrontUpper",x:7,y:0,rotation:20,length:7,limit:[-15,155]},
  leftFrontPaw:{parent:"leftFrontLower",x:7,y:0,rotation:-10,length:3,limit:[-75,75]},
  rightFrontUpper:{parent:"shoulders",x:2,y:2,rotation:75,length:7,limit:[15,150]},
  rightFrontLower:{parent:"rightFrontUpper",x:7,y:0,rotation:15,length:7,limit:[-15,155]},
  rightFrontPaw:{parent:"rightFrontLower",x:7,y:0,rotation:-5,length:3,limit:[-75,75]},
  leftHindThigh:{parent:"pelvis",x:-2,y:1,rotation:105,length:8,limit:[35,165]},
  leftHindShin:{parent:"leftHindThigh",x:8,y:0,rotation:-65,length:8,limit:[-150,25]},
  leftHindPaw:{parent:"leftHindShin",x:8,y:0,rotation:-25,length:4,limit:[-85,65]},
  rightHindThigh:{parent:"pelvis",x:-1,y:2,rotation:100,length:8,limit:[35,165]},
  rightHindShin:{parent:"rightHindThigh",x:8,y:0,rotation:-60,length:8,limit:[-150,25]},
  rightHindPaw:{parent:"rightHindShin",x:8,y:0,rotation:-20,length:4,limit:[-85,65]},
  tail0:{parent:"pelvis",x:-3,y:-1,rotation:165,length:5,limit:[80,240],physics:true},
  tail1:{parent:"tail0",x:5,y:0,rotation:8,length:5,limit:[-70,70],physics:true},
  tail2:{parent:"tail1",x:5,y:0,rotation:6,length:5,limit:[-80,80],physics:true},
  tail3:{parent:"tail2",x:5,y:0,rotation:4,length:5,limit:[-90,90],physics:true},
  tail4:{parent:"tail3",x:5,y:0,rotation:2,length:4,limit:[-100,100],physics:true},
  tail5:{parent:"tail4",x:4,y:0,rotation:0,length:3,limit:[-115,115],physics:true}
 }),
 constraints:Object.freeze({
  leftFrontIK:{type:"twoBoneIK",upper:"leftFrontUpper",lower:"leftFrontLower",effector:"leftFrontPaw",target:"leftFrontTarget",softness:1.5},
  rightFrontIK:{type:"twoBoneIK",upper:"rightFrontUpper",lower:"rightFrontLower",effector:"rightFrontPaw",target:"rightFrontTarget",softness:1.5},
  leftHindIK:{type:"twoBoneIK",upper:"leftHindThigh",lower:"leftHindShin",effector:"leftHindPaw",target:"leftHindTarget",softness:1.5},
  rightHindIK:{type:"twoBoneIK",upper:"rightHindThigh",lower:"rightHindShin",effector:"rightHindPaw",target:"rightHindTarget",softness:1.5}
 }),
 tailPhysics:Object.freeze({stiffness:26,damping:8.5,inertia:.28,maxAngularVelocity:460,segmentFalloff:.88}),
 anatomyBindings:Object.freeze({
  neck:["neck"],shoulders:["shoulders"],torso:["spineLower","spineMid","spineUpper"],stomach:["spineLower","spineMid"],rear:["pelvis"],
  rightFrontPaw:["rightFrontUpper","rightFrontLower","rightFrontPaw"],leftFrontPaw:["leftFrontUpper","leftFrontLower","leftFrontPaw"],
  rightBackLeg:["rightHindThigh","rightHindShin","rightHindPaw"],leftBackLeg:["leftHindThigh","leftHindShin","leftHindPaw"],tail:["tail0","tail1","tail2","tail3","tail4","tail5"]
 })
});

const quadrupedBonePoseLibrary=Object.freeze({
 stand:{bones:{},ik:{leftFrontTarget:[38,45],rightFrontTarget:[37,46],leftHindTarget:[27,46],rightHindTarget:[29,46]},tail:{curl:0,lift:0}},
 sitEntry:{bones:{pelvis:{y:3,rotation:6},spineLower:{rotation:-7},spineMid:{rotation:-4},spineUpper:{rotation:-2}},ik:{leftFrontTarget:[39,47],rightFrontTarget:[38,47],leftHindTarget:[28,45],rightHindTarget:[30,45]},tail:{curl:.15,lift:-.05}},
 sit:{bones:{pelvis:{y:5,rotation:8},spineLower:{rotation:-9},spineMid:{rotation:-6},spineUpper:{rotation:-3},neck:{rotation:-2}},ik:{leftFrontTarget:[42,49],rightFrontTarget:[41,49],leftHindTarget:[29,44],rightHindTarget:[31,44]},tail:{curl:.22,lift:-.08}},
 loafFrontReach:{bones:{pelvis:{y:5,rotation:7},spineLower:{rotation:-8},spineMid:{rotation:-5},spineUpper:{rotation:-5},shoulders:{y:1}},ik:{leftFrontTarget:[46,50],rightFrontTarget:[45,50],leftHindTarget:[29,45],rightHindTarget:[31,45]},tail:{curl:.3,lift:-.1}},
 loafFrontExtend:{bones:{pelvis:{y:5,rotation:7},spineLower:{rotation:-6},spineMid:{rotation:-4},spineUpper:{rotation:-7},shoulders:{y:2}},ik:{leftFrontTarget:[50,51],rightFrontTarget:[49,51],leftHindTarget:[29,45],rightHindTarget:[31,45]},tail:{curl:.38,lift:-.12}},
 loafBodyLower:{bones:{pelvis:{y:5,rotation:5},spineLower:{y:2,rotation:-3},spineMid:{y:2,rotation:-2},spineUpper:{y:3,rotation:-5},shoulders:{y:4},neck:{y:2,rotation:-8}},ik:{leftFrontTarget:[49,53],rightFrontTarget:[48,53],leftHindTarget:[29,47],rightHindTarget:[31,47]},tail:{curl:.46,lift:-.15}},
 loafPawFold:{bones:{pelvis:{y:5,rotation:4},spineLower:{y:2},spineMid:{y:2},spineUpper:{y:3},shoulders:{y:3}},ik:{leftFrontTarget:[40,52],rightFrontTarget:[39,52],leftHindTarget:[29,47],rightHindTarget:[31,47]},tail:{curl:.56,lift:-.18}},
 loaf:{bones:{pelvis:{y:5,rotation:4},spineLower:{y:3},spineMid:{y:3},spineUpper:{y:3},shoulders:{y:3},neck:{y:1}},ik:{leftFrontTarget:[39,52],rightFrontTarget:[38,52],leftHindTarget:[29,47],rightHindTarget:[31,47]},tail:{curl:.62,lift:-.18}},
 curlEntry:{bones:{pelvis:{y:4,rotation:12},spineLower:{rotation:13},spineMid:{rotation:14},spineUpper:{rotation:12},shoulders:{rotation:8},neck:{rotation:-20}},ik:{leftFrontTarget:[36,49],rightFrontTarget:[35,49],leftHindTarget:[29,44],rightHindTarget:[31,44]},tail:{curl:.82,lift:0}},
 curlBall:{bones:{pelvis:{y:3,rotation:18},spineLower:{rotation:22},spineMid:{rotation:24},spineUpper:{rotation:20},shoulders:{rotation:12},neck:{rotation:-30},head:{rotation:-16}},ik:{leftFrontTarget:[34,47],rightFrontTarget:[33,47],leftHindTarget:[30,43],rightHindTarget:[32,43]},tail:{curl:1,lift:.05}},
 sitReturn:{bones:{pelvis:{y:5,rotation:8},spineLower:{rotation:-5},spineMid:{rotation:-4},spineUpper:{rotation:-2},neck:{rotation:-8}},ik:{leftFrontTarget:[41,49],rightFrontTarget:[40,49],leftHindTarget:[29,44],rightHindTarget:[31,44]},tail:{curl:.35,lift:-.05}},
 stretchBow:{bones:{pelvis:{y:-3,rotation:10},spineLower:{rotation:8},spineMid:{rotation:4},spineUpper:{rotation:-12},shoulders:{y:4,rotation:-14},neck:{y:4,rotation:-32},head:{rotation:-12}},ik:{leftFrontTarget:[49,53],rightFrontTarget:[48,53],leftHindTarget:[27,44],rightHindTarget:[30,44]},tail:{curl:.05,lift:.8}},
 stretchGather:{bones:{pelvis:{y:-2,rotation:7},spineLower:{rotation:6},spineMid:{rotation:3},spineUpper:{rotation:-9},shoulders:{y:3,rotation:-9},neck:{y:3,rotation:-22}},ik:{leftFrontTarget:[44,51],rightFrontTarget:[43,51],leftHindTarget:[27,44],rightHindTarget:[30,44]},tail:{curl:.04,lift:.65}},
 stretchRaiseFront:{bones:{pelvis:{y:-1,rotation:4},spineLower:{rotation:4},spineMid:{rotation:2},spineUpper:{rotation:-3},shoulders:{y:1,rotation:-3},neck:{y:1,rotation:-8}},ik:{leftFrontTarget:[41,49],rightFrontTarget:[40,49],leftHindTarget:[27,44],rightHindTarget:[30,44]},tail:{curl:.03,lift:.45}},
 stretchLowerRear:{bones:{pelvis:{y:1,rotation:0},spineLower:{rotation:1},spineMid:{rotation:0},spineUpper:{rotation:0},shoulders:{y:0},neck:{y:0,rotation:0}},ik:{leftFrontTarget:[40,48],rightFrontTarget:[39,48],leftHindTarget:[28,46],rightHindTarget:[31,46]},tail:{curl:.03,lift:.25}},
 stretchRecoverLeft:{bones:{pelvis:{y:1,rotation:-3},leftHindThigh:{rotation:20},leftHindShin:{rotation:30}},ik:{leftFrontTarget:[40,48],rightFrontTarget:[39,48],leftHindTarget:[22,47],rightHindTarget:[31,46]},plant:"rightHind",tail:{curl:.06,lift:.15}},
 stretchRecoverRight:{bones:{pelvis:{y:1,rotation:3},rightHindThigh:{rotation:25},rightHindShin:{rotation:25}},ik:{leftFrontTarget:[40,48],rightFrontTarget:[39,48],leftHindTarget:[28,46],rightHindTarget:[37,47]},plant:"leftHind",tail:{curl:.06,lift:.15}},
 shakeLeft:{bones:{pelvis:{rotation:-7},spineLower:{rotation:8},spineMid:{rotation:-10},spineUpper:{rotation:10},shoulders:{rotation:-11},neck:{rotation:13},head:{rotation:-10}},ik:{leftFrontTarget:[40,48],rightFrontTarget:[39,48],leftHindTarget:[28,46],rightHindTarget:[31,46]},tail:{curl:.12,lift:.05,flick:-1}},
 shakeRight:{bones:{pelvis:{rotation:7},spineLower:{rotation:-8},spineMid:{rotation:10},spineUpper:{rotation:-10},shoulders:{rotation:11},neck:{rotation:-13},head:{rotation:10}},ik:{leftFrontTarget:[40,48],rightFrontTarget:[39,48],leftHindTarget:[28,46],rightHindTarget:[31,46]},tail:{curl:.12,lift:.05,flick:1}},
 jumpForward:{bones:{pelvis:{y:-2,rotation:-5},spineLower:{rotation:-4},spineMid:{rotation:-2},spineUpper:{rotation:-1},shoulders:{rotation:-4},neck:{rotation:-5}},ik:{leftFrontTarget:[47,40],rightFrontTarget:[46,40],leftHindTarget:[23,42],rightHindTarget:[25,42]},tail:{curl:.03,lift:.4}},
 jumpBackward:{bones:{pelvis:{y:-1,rotation:7},spineLower:{rotation:8},spineMid:{rotation:5},spineUpper:{rotation:3},shoulders:{rotation:4},neck:{rotation:8}},ik:{leftFrontTarget:[34,43],rightFrontTarget:[35,43],leftHindTarget:[23,40],rightHindTarget:[25,40]},tail:{curl:.08,lift:.3}}
});

anatomyRig.skeleton2D=quadrupedSkeleton2D;
anatomyRig.bonePoseLibrary=quadrupedBonePoseLibrary;
anatomyRig.constraintStrategy="hierarchical FK + two-bone paw IK + spring-damped segmented tail";
spriteRig.skeleton2D=quadrupedSkeleton2D;
spriteRig.bonePoseLibrary=quadrupedBonePoseLibrary;

/*
 * Quadruped Onyx behavior variants.
 *
 * These are nine independent cat definitions cloned from the same verified
 * quadruped sprite/anatomy template. They intentionally share the current
 * raster atlas artwork, but each variant owns its own spriteRig and anatomyRig
 * object so future fine-tuning can diverge without changing the other moods.
 *
 * "advising professor" is intentionally NOT duplicated into this cat registry.
 * Professor belongs to Virtual only; Leisure reserves the name solely so it cannot be selected here.
 */
const quadrupedBehaviorNames=Object.freeze([
 "caring","hungry","judgmental","listening","purring",
 "sleepy","snuggly","thinking","thoughtful"
]);
const reservedBipedalBehavior="advising professor";
const cloneRigData=value=>JSON.parse(JSON.stringify(value));
const onyxBehaviorVariants=Object.create(null);

for(const mood of quadrupedBehaviorNames){
 const id="onyx_"+mood;
 const variantAnatomy=cloneRigData(anatomyRig);
 const variantSpriteRig=cloneRigData(spriteRig);
 variantSpriteRig.id=id;
 variantSpriteRig.name=id;
 variantSpriteRig.behavior=mood;
 variantSpriteRig.rigType="quadruped";
 variantSpriteRig.anatomy=variantAnatomy;
 variantSpriteRig.legacySvgReference=legacySvgReference;
 variantAnatomy.id=id+"_anatomy";
 variantAnatomy.owner=id;
 Object.values(variantAnatomy.parts).forEach(part=>{
  part.owner=id;
  part.variantId=id+"-"+part.key.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();
 });
 onyxBehaviorVariants[id]={
  id,
  name:id,
  behavior:mood,
  rigType:"quadruped",
  spriteRig:variantSpriteRig,
  anatomyRig:variantAnatomy,
  behaviorProfile:{...behaviorProfile[mood]},
  atlasSource:"shared-verified-quadruped-atlas"
 };
}

const onyxAdvisingProfessorPlaceholder=Object.freeze({
 id:"onyx_advising_professor",
 name:"onyx_advising_professor",
 behavior:reservedBipedalBehavior,
 context:"all",
 rigType:"bipedal-placeholder",
 placeholder:true,
 spriteRig:null,
 anatomyRig:null,
 behaviorProfile:{...behaviorProfile[reservedBipedalBehavior]},
 atlasSource:null,
 status:"placeholder-awaiting-bipedal-rig"
});

/*
 * Kitchen-only bipedal placeholders.
 *
 * The Hunt definitions remain the existing quadruped black-cat variants.
 * Only Kitchen resolves judgmental, hungry, and purring to these empty
 * bipedal rig slots so later humanoid Kitchen sprites can be implemented
 * without overwriting or duplicating the Hunt cat rigs.
 */
const kitchenBipedalBehaviorNames=Object.freeze(["judgmental","hungry","purring"]);
const makeKitchenBipedalPlaceholder=(id,mood)=>Object.freeze({
 id,
 name:id,
 behavior:mood,
 context:"kitchen",
 rigType:"bipedal-placeholder",
 placeholder:true,
 spriteRig:null,
 anatomyRig:null,
 behaviorProfile:{...behaviorProfile[mood]},
 atlasSource:null,
 huntVariantId:"onyx_"+mood,
 status:"placeholder-awaiting-kitchen-bipedal-rig"
});
const onyxJudgmentalKitchenPlaceholder=makeKitchenBipedalPlaceholder("onyx_judgmental_kitchen","judgmental");
const onyxHungryKitchenPlaceholder=makeKitchenBipedalPlaceholder("onyx_hungry_kitchen","hungry");
const onyxPurringKitchenPlaceholder=makeKitchenBipedalPlaceholder("onyx_purring_kitchen","purring");
const onyxKitchenBipedalPlaceholders=Object.freeze({
 onyx_judgmental_kitchen:onyxJudgmentalKitchenPlaceholder,
 onyx_hungry_kitchen:onyxHungryKitchenPlaceholder,
 onyx_purring_kitchen:onyxPurringKitchenPlaceholder
});
const kitchenBipedalPlaceholderByBehavior=Object.freeze({
 judgmental:onyxJudgmentalKitchenPlaceholder,
 hungry:onyxHungryKitchenPlaceholder,
 purring:onyxPurringKitchenPlaceholder
});

function normalizeBehaviorName(value){
 const raw=String(value??"").trim().toLowerCase().replace(/-/g,"_");
 let name=raw.startsWith("onyx_")?raw.slice(5):raw;
 if(name.endsWith("_kitchen"))name=name.slice(0,-8);
 return name==="advising_professor"?reservedBipedalBehavior:name;
}
function variantIdForBehavior(value,contextPhase=phase){
 const name=normalizeBehaviorName(value);
 if(name===reservedBipedalBehavior)return onyxAdvisingProfessorPlaceholder.id;
 if(contextPhase==="kitchen"&&kitchenBipedalPlaceholderByBehavior[name])return kitchenBipedalPlaceholderByBehavior[name].id;
 return "onyx_"+name;
}
function getOnyxVariant(value=behavior,contextPhase=phase){
 const name=normalizeBehaviorName(value);
 if(name===reservedBipedalBehavior)return onyxAdvisingProfessorPlaceholder;
 if(contextPhase==="kitchen"&&kitchenBipedalPlaceholderByBehavior[name])return kitchenBipedalPlaceholderByBehavior[name];
 return onyxBehaviorVariants["onyx_"+name]||null;
}
function activeOnyxVariant(){return getOnyxVariant(behavior,phase)||onyxBehaviorVariants.onyx_thoughtful}
function activeSpriteRig(){return activeOnyxVariant().spriteRig||null}
function activeAnatomyRig(){return activeOnyxVariant().anatomyRig||null}
function syncBipedalPlaceholderPresentation(variant=activeOnyxVariant()){
 const box=q("#onyxBipedalPlaceholder"),label=q("#onyxBipedalPlaceholderLabel");
 if(!box||!label)return;
 const isProfessor=variant.id===onyxAdvisingProfessorPlaceholder.id;
 const isKitchen=variant.context==="kitchen";
 const first=isProfessor?"PROFESSOR":variant.behavior.toUpperCase();
 const second=isKitchen?"KITCHEN":"RIG";
 const third=isKitchen?"RIG PLACEHOLDER":"PLACEHOLDER";
 label.innerHTML=`${first}<br>${second}<br>${third}`;
 box.dataset.variant=variant.id;
 box.dataset.context=variant.context||"";
 box.setAttribute("aria-label",isProfessor
  ?"Advising professor bipedal rig placeholder"
  :`${variant.behavior} Kitchen bipedal rig placeholder`);
}
function syncGlobalVariantReferences(){
 const active=activeOnyxVariant();
 window.OnyxSpriteRig=active.spriteRig||null;
 window.OnyxSvgSkeleton=active.spriteRig||null;
 window.OnyxAnatomyRig=active.anatomyRig||null;
 window.OnyxActiveVariant=active;
 window.OnyxActiveControlContext=phase==="kitchen"?"kitchen":"hunt";
}
function activateBehaviorVariant(value,{syncControl=true,emit=true}={}){
 const next=normalizeBehaviorName(value);
 if(next==="advising professor")return null;
 const variant=getOnyxVariant(next,phase);
 if(!variant)return null;
 behavior=next;
 if(syncControl){
  const select=q("#behaviorSelect");
  if(select)select.value=next;
 }
 actor.dataset.behavior=next;
 actor.dataset.sprite=variant.id;
 actor.dataset.spriteVariant=variant.id;
 actor.dataset.rigType=variant.rigType;
 actor.dataset.placeholder=String(!!variant.placeholder);
 actor.dataset.rigContext=variant.context||"hunt";
 spriteCanvas.dataset.sprite=variant.id;
 spriteCanvas.dataset.spriteVariant=variant.id;
 spriteCanvas.dataset.placeholder=String(!!variant.placeholder);
 spriteCanvas.dataset.rigContext=variant.context||"hunt";
 syncBipedalPlaceholderPresentation(variant);
 syncGlobalVariantReferences();
 if(emit)window.dispatchEvent(new CustomEvent("onyx-behavior-variant-change",{detail:{behavior:next,variant:variant.id,rigType:variant.rigType,controlContext:phase==="kitchen"?"kitchen":"hunt"}}));
 return variant;
}

function resolveAnatomyPart(partRef){
 const raw=String(partRef??"").trim();
 if(!raw)return null;
 const activeRig=activeAnatomyRig();
 if(!activeRig?.parts)return null;
 if(activeRig.parts[raw])return activeRig.parts[raw];
 if(anatomyPartIds[raw]&&activeRig.parts[anatomyPartIds[raw]])return activeRig.parts[anatomyPartIds[raw]];
 const slug=raw.toLowerCase().replace(/^onyx[-_\s]*/,"").replace(/[_\s]+/g,"-");
 return activeRig.parts["onyx-"+slug]||null;
}

function legacyFrameFor(direction,phaseIndex){
 const d=((Math.floor(Number(direction))||0)%6+6)%6;
 const p=clamp(Math.floor(Number(phaseIndex))||0,0,4);
 const key="f"+d+p;
 return {key,direction:d,phase:p,...legacySvgReference.frames[key]};
}

function legacySourceForPart(part,frame){
 if(!part||!frame)return "";
 if(part.domain==="head")return frame.head||"";
 if(part.domain==="body")return frame.body||"";
 if(part.domain==="junction")return [frame.head,frame.body].filter(Boolean).join("+");
 return "";
}

function syncAnatomyPartNode(part,frame=null){
 const node=document.getElementById(part.id);
 if(!node)return;
 node.dataset.onyxAnatomyKey=part.key;
 node.dataset.onyxAnatomyName=part.name;
 node.dataset.onyxAnatomyParent=part.parent;
 node.dataset.onyxAnatomySide=part.side;
 node.dataset.onyxAnatomyDomain=part.domain;
 node.dataset.onyxVariant=activeOnyxVariant().id;
 node.dataset.onyxVariantPartId=part.variantId||"";
 node.dataset.legacyPresence=part.legacyPresence;
 node.dataset.legacySeparation=part.legacySeparation;
 node.dataset.legacyNotes=part.notes;
 node.dataset.tuneX=String(part.tuning.x);
 node.dataset.tuneY=String(part.tuning.y);
 node.dataset.tuneScaleX=String(part.tuning.scaleX);
 node.dataset.tuneScaleY=String(part.tuning.scaleY);
 node.dataset.tuneRotation=String(part.tuning.rotation);
 node.dataset.tuneOpacity=String(part.tuning.opacity);
 if(frame){
  node.dataset.legacyFrame=frame.key;
  node.dataset.legacySource=legacySourceForPart(part,frame);
  node.dataset.legacyHead=frame.head||"";
  node.dataset.legacyBody=frame.body||"";
  node.dataset.screenMirrored=String(!!frame.mirrored);
  node.dataset.profileOverlap=String((part.key==="rightEar"||part.key==="leftEar")&&(frame.head==="head2"));
 }
}

function syncAnatomyFrameMap(direction,phaseIndex){
 const activeRig=activeAnatomyRig();
 if(!activeRig?.parts){
  actor.dataset.legacySvgFrame="";
  actor.dataset.legacySvgHead="";
  actor.dataset.legacySvgBody="";
  actor.dataset.legacySvgMirrored="false";
  actor.dataset.legacySvgTransform="";
  spriteCanvas.dataset.legacySvgFrame="";
  spriteCanvas.dataset.legacySvgHead="";
  spriteCanvas.dataset.legacySvgBody="";
  spriteCanvas.dataset.legacySvgMirrored="false";
  return null;
 }
 const frame=legacyFrameFor(direction,phaseIndex);
 actor.dataset.legacySvgFrame=frame.key;
 actor.dataset.legacySvgHead=frame.head||"";
 actor.dataset.legacySvgBody=frame.body||"";
 actor.dataset.legacySvgMirrored=String(!!frame.mirrored);
 actor.dataset.legacySvgTransform=frame.transform||"";
 spriteCanvas.dataset.legacySvgFrame=frame.key;
 spriteCanvas.dataset.legacySvgHead=frame.head||"";
 spriteCanvas.dataset.legacySvgBody=frame.body||"";
 spriteCanvas.dataset.legacySvgMirrored=String(!!frame.mirrored);
 Object.values(activeRig.parts).forEach(part=>syncAnatomyPartNode(part,frame));
 return frame;
}

function setAnatomyPartTuning(partRef,patch={}){
 const part=resolveAnatomyPart(partRef);
 if(!part)return null;
 for(const key of ["x","y","scaleX","scaleY","rotation","opacity"]){
  if(Object.prototype.hasOwnProperty.call(patch,key)){
   const value=Number(patch[key]);
   if(Number.isFinite(value))part.tuning[key]=key==="opacity"?clamp(value,0,1):value;
  }
 }
 syncAnatomyPartNode(part,legacyFrameFor(cat.dir,Number(spriteCanvas.dataset.phase)||0));
 const detail={id:part.id,variantPartId:part.variantId||"",owner:activeOnyxVariant().id,key:part.key,name:part.name,tuning:{...part.tuning}};
 window.dispatchEvent(new CustomEvent("onyx-anatomy-tune",{detail}));
 return detail;
}

function resetAnatomyPartTuning(partRef){
 const part=resolveAnatomyPart(partRef);
 if(!part)return null;
 part.tuning={x:0,y:0,scaleX:1,scaleY:1,rotation:0,opacity:1};
 syncAnatomyPartNode(part,legacyFrameFor(cat.dir,Number(spriteCanvas.dataset.phase)||0));
 return {id:part.id,variantPartId:part.variantId||"",owner:activeOnyxVariant().id,key:part.key,name:part.name,tuning:{...part.tuning}};
}

const actionPoseMap=Object.freeze({
 idle:"stand",walk:"stand",run:"stand",dash:"stand",jump:"jumpForward",jumpForward:"jumpForward",jumpBackward:"jumpBackward",jumpTakeoff:"jumpForward",jumpAir:"jumpForward",jumpLand:"jumpForward",
 sit:"sit",loaf:"loaf",curlBall:"curlBall",uncurl:"sitReturn",stretchBow:"stretchBow",riseFromStretch:"stretchRecoverUnder",
 backLegExtendLeft:"stretchRecoverLeft",backLegExtendRight:"stretchRecoverRight",shake:"shake",
 transitionWalkToSit:"sitEntry",transitionSitToLoaf:"loafEntry",transitionLoafToCurl:"curlEntry",transitionCurlToSit:"sitReturn",transitionSitToStretch:"stretchBow",
 purr:"loaf",snuggle:"loaf"
});
const catRoutineState={name:"",token:0,timers:[]};

function getAnatomyPoseDefinition(name,variant=activeOnyxVariant()){
 const rig=variant?.anatomyRig||activeAnatomyRig();
 return rig?.poseLibrary?.[name]||null;
}
function currentAnatomyFrame(){return legacyFrameFor(cat.dir,Number(spriteCanvas.dataset.phase)||0)}
function syncAllAnatomyNodes(){
 const rig=activeAnatomyRig(),frame=currentAnatomyFrame();
 if(!rig?.parts)return null;
 Object.values(rig.parts).forEach(part=>syncAnatomyPartNode(part,frame));
 return frame;
}
function resetAllAnatomyPartTuning(){
 const rig=activeAnatomyRig();
 if(!rig?.parts)return null;
 Object.values(rig.parts).forEach(part=>{part.tuning={x:0,y:0,scaleX:1,scaleY:1,rotation:0,opacity:1}});
 syncAllAnatomyNodes();
 return JSON.parse(JSON.stringify(rig.parts));
}
function applyAnatomyPose(name,{blend=1,reset=true,emit=true,syncNodes=true,duration=0}={}){
 const rig=activeAnatomyRig(),pose=getAnatomyPoseDefinition(name);
 if(!rig?.parts||!pose)return null;
 blend=clamp(Number(blend)||1,0,1);
 if(reset){Object.values(rig.parts).forEach(part=>{part.tuning={x:0,y:0,scaleX:1,scaleY:1,rotation:0,opacity:1}})}
 for(const [partId,patch] of Object.entries(pose.parts||{})){
  const part=rig.parts[partId];
  if(!part||!patch)continue;
  for(const key of ["x","y","scaleX","scaleY","rotation","opacity"]){
   if(!Object.prototype.hasOwnProperty.call(patch,key))continue;
   const target=Number(patch[key]);
   if(!Number.isFinite(target))continue;
   const base=(key==="scaleX"||key==="scaleY"||key==="opacity")?({scaleX:1,scaleY:1,opacity:1})[key]:0;
   const value=base+((target-base)*blend);
   part.tuning[key]=key==="opacity"?clamp(value,0,1):value;
  }
 }
 cat.pose=name;
 cat.jointMotion=name;
 cat.tailMotion=name.includes("curl")?"curl":name.includes("stretch")?"lift":name.includes("shake")?"flick":"neutral";
 if(typeof beginSkeletonPoseBlend==="function")beginSkeletonPoseBlend(name,duration||180);
 actor.dataset.pose=name;
 spriteCanvas.dataset.pose=name;
 if(syncNodes)syncAllAnatomyNodes();
 const detail={pose:name,owner:activeOnyxVariant().id,behavior,variant:activeOnyxVariant().id,joints:rig.jointRig||{},tailRig:rig.tailRig||{},parts:Object.fromEntries(Object.entries(rig.parts).map(([id,part])=>[id,{...part.tuning}]))};
 if(emit)window.dispatchEvent(new CustomEvent("onyx-quadruped-pose",{detail}));
 return detail;
}
function poseNameForAction(name){return actionPoseMap[name]||((name==="idle"||name==="walk"||name==="run")?"stand":null)}
function getQuadrupedRoutine(name){
 const rig=activeSpriteRig();
 const lib=rig?.routineLibrary||activeAnatomyRig()?.routineLibrary||{};
 return lib?.[name]||null;
}
function clearRoutineTimers(){while(catRoutineState.timers.length)clearTimeout(catRoutineState.timers.pop())}
function cancelCatRoutine(){clearRoutineTimers();catRoutineState.name="";catRoutineState.token=0;cat.routineName="";actor.dataset.routine="";return true}
function directionVector(dir=cat.dir){const table=[[1,0],[.5,.866],[-.5,.866],[-1,0],[-.5,-.866],[.5,-.866]];return table[((dir%6)+6)%6]||[-1,0]}
function moveCatByFacing(distance=.05){const [dx,dy]=directionVector(cat.dir);cat.x=clamp(cat.x+dx*distance,.045,.955);cat.y=clamp(cat.y+dy*distance,.11,.93)}
function playCatRoutine(nameOrSteps=activeAnatomyRig()?.defaultRoutine||"walkSitLoafCurlStretchWalk",options={}){
 const steps=Array.isArray(nameOrSteps)?nameOrSteps:getQuadrupedRoutine(nameOrSteps)||getQuadrupedRoutine("walkSitLoafCurlStretchWalk");
 if(!Array.isArray(steps)||!steps.length)return null;
 clearRoutineTimers();
 const token=(cat.routineToken||0)+1;
 cat.routineToken=token;
 catRoutineState.token=token;
 catRoutineState.name=Array.isArray(nameOrSteps)?(options.name||"custom"):(nameOrSteps||"walkSitLoafCurlStretchWalk");
 cat.routineName=catRoutineState.name;
 actor.dataset.routine=catRoutineState.name;
 const runStep=index=>{
  if(catRoutineState.token!==token)return;
  if(index>=steps.length){catRoutineState.name="";cat.routineName="";actor.dataset.routine="";const endPose=options.endPose||"stand",endAction=options.endAction||"idle";if(options.holdFinal){applyAnatomyPose(endPose,{emit:true,duration:180});setCatAction(endAction,0,{hold:true})}else{clearCatAction();applyAnatomyPose(endPose,{emit:true,duration:180})}renderCat();return}
  const step=steps[index]||{};
  if(step.dir!=null)cat.dir=((step.dir%6)+6)%6;
  if(step.facePoint)facePoint(step.facePoint.x,step.facePoint.y);
  if(step.moveByFacing)moveCatByFacing(Number(step.moveByFacing)||0);
  if(step.pose)applyAnatomyPose(step.pose,{emit:true,duration:step.poseBlend||Math.min(260,Math.max(80,(step.duration||340)*.7))});
  const runtime=activeSkeletonRuntime();if(runtime&&step.ikPlant)runtime.plant=step.ikPlant;
  if(step.action)setCatAction(step.action,step.duration||actionDuration[step.action]||360,step.options||{});
  else renderCat();
  if(step.action==="jumpForward")moveCatByFacing(step.distance!=null?step.distance:.042);
  if(step.action==="jumpBackward")moveCatByFacing(step.distance!=null?-Math.abs(step.distance):-.035);
  const wait=Math.max(1,Number(step.wait||step.duration||actionDuration[step.action]||340));
  const timer=setTimeout(()=>runStep(index+1),wait);
  catRoutineState.timers.push(timer);
 };
 runStep(0);
 return {name:catRoutineState.name,steps:JSON.parse(JSON.stringify(steps))};
}
function startCatJump(direction="forward",distance=.06,{duration=520,dash=false}={}){
 if(cat.airborne||cat.traversal!=="ground")return false;
 cancelCatRoutine();
 const backward=String(direction).toLowerCase().includes("back"),[fx,fy]=directionVector(cat.dir),sign=backward?-1:1;
 cat.airborne=true;cat.jumpBackward=backward;cat.jumpStart=performance.now();cat.jumpDuration=Math.max(360,Number(duration)||520);cat.jumpDistance=Math.max(.025,Math.abs(Number(distance)||.06));cat.jumpOriginX=cat.x;cat.jumpOriginY=cat.y;cat.jumpDir=[fx*sign,fy*sign];cat.jumpHeight=0;cat.jumpPhase="takeoff";
 applyAnatomyPose(backward?"jumpBackward":"jumpForward",{emit:true,duration:100});
 setCatAction("jumpTakeoff",Math.round(cat.jumpDuration*.2),{dir:cat.dir});
 window.dispatchEvent(new CustomEvent("onyx-jump-phase",{detail:{phase:"takeoff",backward,distance:cat.jumpDistance}}));
 return true;
}
function updateCatJump(now=performance.now()){
 if(!cat.airborne)return false;
 const p=clamp((now-cat.jumpStart)/Math.max(1,cat.jumpDuration),0,1),ease=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
 cat.x=clamp(cat.jumpOriginX+cat.jumpDir[0]*cat.jumpDistance*ease,.045,.955);cat.y=clamp(cat.jumpOriginY+cat.jumpDir[1]*cat.jumpDistance*ease,.11,.93);
 cat.jumpHeight=Math.sin(Math.PI*p)*(cat.jumpDistance>.075?34:27);
 let next=p<.18?"takeoff":p<.46?"ascent":p<.62?"apex":p<.86?"fall":"landing";
 if(next!==cat.jumpPhase){cat.jumpPhase=next;if(next==="ascent"||next==="apex"||next==="fall")setCatAction("jumpAir",Math.max(120,Math.round(cat.jumpDuration*.55)),{dir:cat.dir});else if(next==="landing")setCatAction("jumpLand",Math.max(120,Math.round(cat.jumpDuration*.18)),{dir:cat.dir});window.dispatchEvent(new CustomEvent("onyx-jump-phase",{detail:{phase:next,progress:p,backward:cat.jumpBackward}}))}
 if(p>=1){cat.airborne=false;cat.jumpHeight=0;cat.jumpPhase="ground";cat.x=clamp(cat.jumpOriginX+cat.jumpDir[0]*cat.jumpDistance,.045,.955);cat.y=clamp(cat.jumpOriginY+cat.jumpDir[1]*cat.jumpDistance,.11,.93);setCatAction("jumpLand",150,{dir:cat.dir});setTimeout(()=>{if(!cat.airborne&&cat.action==="jumpLand")clearCatAction()},155);window.dispatchEvent(new CustomEvent("onyx-jump-phase",{detail:{phase:"grounded",backward:cat.jumpBackward}}));return false}
 renderCat(now);return true;
}
function performCatJump(direction="forward",distance=.06){const backward=String(direction).toLowerCase().includes("back");return startCatJump(backward?"backward":"forward",Math.abs(distance),{duration:520,dash:Math.abs(distance)>.075})?{direction:backward?"jumpBackward":"jumpForward",distance:Math.abs(distance),phased:true}:false}


const skeletonRuntimeByVariant=Object.create(null);
const DEG=Math.PI/180,RAD=180/Math.PI;
const lerp=(a,b,t)=>a+(b-a)*t;
const lerpAngle=(a,b,t)=>{let d=((b-a+180)%360+360)%360-180;return a+d*t};
const easeInOutCubic=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
function cloneBoneRuntime(def){
 const bones={};
 for(const [id,b] of Object.entries(def.bones))bones[id]={id,parent:b.parent,rest:{x:b.x||0,y:b.y||0,rotation:b.rotation||0,scaleX:1,scaleY:1,length:b.length||0},local:{x:b.x||0,y:b.y||0,rotation:b.rotation||0,scaleX:1,scaleY:1},world:{x:0,y:0,rotation:0,scaleX:1,scaleY:1},limit:b.limit?b.limit.slice():null,physics:!!b.physics,angularVelocity:0};
 return{definition:def,bones,targets:{},pose:"stand",fromPose:"stand",toPose:"stand",blendStart:0,blendDuration:0,blendFrom:null,blendTo:null,tail:{curl:0,lift:0,flick:0},tailTarget:{curl:0,lift:0,flick:0},plant:null};
}
function activeSkeletonRuntime(){const v=activeOnyxVariant();if(v.placeholder||!v.anatomyRig?.skeleton2D)return null;if(!skeletonRuntimeByVariant[v.id])skeletonRuntimeByVariant[v.id]=cloneBoneRuntime(v.anatomyRig.skeleton2D);return skeletonRuntimeByVariant[v.id]}
function snapshotBoneLocals(r){return Object.fromEntries(Object.entries(r.bones).map(([id,b])=>[id,{...b.local}]))}
function restBoneLocals(r){return Object.fromEntries(Object.entries(r.bones).map(([id,b])=>[id,{...b.rest}]))}
function bonePoseTarget(name,r=activeSkeletonRuntime()){
 if(!r)return null;const pose=activeOnyxVariant().anatomyRig?.bonePoseLibrary?.[name]||quadrupedBonePoseLibrary[name]||quadrupedBonePoseLibrary.stand,target=restBoneLocals(r);
 for(const [id,p] of Object.entries(pose?.bones||{})){if(!target[id])continue;for(const k of ["x","y","rotation","scaleX","scaleY"]){if(p[k]==null||!Number.isFinite(Number(p[k])))continue;target[id][k]=(k==="x"||k==="y")?r.bones[id].rest[k]+Number(p[k]):k==="rotation"?r.bones[id].rest.rotation+Number(p[k]):Number(p[k])}}
 return{bones:target,ik:{...(pose?.ik||{})},tail:{curl:0,lift:0,flick:0,...(pose?.tail||{})},plant:pose?.plant||null};
}
function beginSkeletonPoseBlend(name,duration=220){const r=activeSkeletonRuntime();if(!r)return null;const t=bonePoseTarget(name,r);if(!t)return null;r.fromPose=r.pose;r.toPose=name;r.pose=name;r.blendStart=performance.now();r.blendDuration=Math.max(1,Number(duration)||1);r.blendFrom=snapshotBoneLocals(r);r.blendTo=t.bones;r.targets=t.ik;r.tailTarget=t.tail;r.plant=t.plant;actor.dataset.skeletonPose=name;return{pose:name,duration:r.blendDuration,plant:r.plant}}
function clampBoneRotation(b,rot){return b.limit?clamp(rot,b.limit[0],b.limit[1]):rot}
function computeWorldTransforms(r){const done=new Set();const solve=id=>{if(done.has(id))return r.bones[id].world;const b=r.bones[id];if(!b)return null;if(!b.parent){Object.assign(b.world,{x:b.local.x,y:b.local.y,rotation:b.local.rotation,scaleX:b.local.scaleX,scaleY:b.local.scaleY})}else{const p=solve(b.parent),a=p.rotation*DEG,ca=Math.cos(a),sa=Math.sin(a),lx=b.local.x*p.scaleX,ly=b.local.y*p.scaleY;b.world.x=p.x+lx*ca-ly*sa;b.world.y=p.y+lx*sa+ly*ca;b.world.rotation=p.rotation+b.local.rotation;b.world.scaleX=p.scaleX*b.local.scaleX;b.world.scaleY=p.scaleY*b.local.scaleY}done.add(id);return b.world};Object.keys(r.bones).forEach(solve);return r}
function twoBoneIK(r,upperId,lowerId,target,softness=0){const u=r.bones[upperId],l=r.bones[lowerId];if(!u||!l||!target)return;computeWorldTransforms(r);const p=u.parent?r.bones[u.parent]:null,o=p?p.world:{x:u.world.x,y:u.world.y,rotation:0},tx=target[0]-o.x,ty=target[1]-o.y;let d=Math.hypot(tx,ty),l1=Math.max(.001,u.rest.length||7),l2=Math.max(.001,l.rest.length||7),max=l1+l2;if(softness>0&&d>max-softness){const over=d-(max-softness);d=(max-softness)+softness*(1-Math.exp(-over/softness))}d=clamp(d,.001,max-.001);const base=Math.atan2(ty,tx),c1=clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1),c2=clamp((l1*l1+l2*l2-d*d)/(2*l1*l2),-1,1),a1=base-Math.acos(c1),a2=Math.PI-Math.acos(c2),pr=(p?.world.rotation||0)*DEG;u.local.rotation=clampBoneRotation(u,(a1-pr)*RAD);l.local.rotation=clampBoneRotation(l,a2*RAD)}
function applyIKConstraints(r){const d=r.definition,map={leftFrontTarget:"leftFrontIK",rightFrontTarget:"rightFrontIK",leftHindTarget:"leftHindIK",rightHindTarget:"rightHindIK"};for(const [targetName,cName] of Object.entries(map)){const t=r.targets?.[targetName],c=d.constraints?.[cName];if(t&&c)twoBoneIK(r,c.upper,c.lower,t,c.softness||0)}computeWorldTransforms(r)}
function updateTailPhysics(r,dt){const s=r.definition.tailPhysics||quadrupedSkeleton2D.tailPhysics,p=r.tailTarget||{};r.tail.curl=lerp(r.tail.curl,p.curl||0,clamp(dt*8,0,1));r.tail.lift=lerp(r.tail.lift,p.lift||0,clamp(dt*8,0,1));r.tail.flick=lerp(r.tail.flick,p.flick||0,clamp(dt*12,0,1));["tail0","tail1","tail2","tail3","tail4","tail5"].forEach((id,i)=>{const b=r.bones[id];if(!b)return;const fall=Math.pow(s.segmentFalloff||.88,i),curl=r.tail.curl*(i===0?20:26+10*i),lift=r.tail.lift*(i===0?-28:-18+4*i),flick=r.tail.flick*(i%2===0?16:-16)*(1+i*.12),inertia=-(cat.vx||0)*42*fall+(cat.vy||0)*18*fall,target=b.rest.rotation+curl+lift+flick+inertia*(s.inertia||.28),err=((target-b.local.rotation+180)%360+360)%360-180;b.angularVelocity+=err*(s.stiffness||26)*dt;b.angularVelocity*=Math.exp(-(s.damping||8.5)*dt);b.angularVelocity=clamp(b.angularVelocity,-(s.maxAngularVelocity||460),s.maxAngularVelocity||460);b.local.rotation=clampBoneRotation(b,b.local.rotation+b.angularVelocity*dt)})}
function skeletonToAnatomyMetadata(r){const rig=activeAnatomyRig(),bind=r.definition.anatomyBindings||{},keyToPart={neck:anatomyPartIds.neck,shoulders:anatomyPartIds.shoulders,torso:anatomyPartIds.torso,stomach:anatomyPartIds.stomach,rear:anatomyPartIds.rear,rightFrontPaw:anatomyPartIds.rightFrontPaw,leftFrontPaw:anatomyPartIds.leftFrontPaw,rightBackLeg:anatomyPartIds.rightBackLeg,leftBackLeg:anatomyPartIds.leftBackLeg,tail:anatomyPartIds.tail};if(!rig?.parts)return;for(const [key,ids] of Object.entries(bind)){const part=rig.parts[keyToPart[key]],bones=ids.map(id=>r.bones[id]).filter(Boolean);if(!part||!bones.length)continue;part.skeleton={bones:ids.slice(),localRotation:bones.reduce((s,b)=>s+b.local.rotation,0)/bones.length,worldRotation:bones.reduce((s,b)=>s+b.world.rotation,0)/bones.length,worldX:bones.reduce((s,b)=>s+b.world.x,0)/bones.length,worldY:bones.reduce((s,b)=>s+b.world.y,0)/bones.length};const node=document.getElementById(part.id);if(node){node.dataset.skeletonBones=ids.join(",");node.dataset.skeletonLocalRotation=String(part.skeleton.localRotation);node.dataset.skeletonWorldRotation=String(part.skeleton.worldRotation);node.dataset.skeletonWorldX=String(part.skeleton.worldX);node.dataset.skeletonWorldY=String(part.skeleton.worldY)}}}
function visiblePoseEnvelope(pose,now=performance.now()){let sx=1,sy=1,tx=0,ty=0,rot=0;if(pose==="sit"||pose==="sitEntry"||pose==="sitReturn"){sy=.96;ty=2}else if(pose.startsWith("loaf")){sx=1.07;sy=.83;ty=8}else if(pose==="curlEntry"){sx=.88;sy=.84;ty=7;rot=3}else if(pose==="curlBall"){const breathe=.012*Math.sin(now/360);sx=.78+breathe;sy=.77-breathe*.6;ty=8;rot=6}else if(pose==="stretchBow"){sx=1.16;sy=.87;ty=5;rot=-3}else if(pose==="stretchGather"){sx=1.11;sy=.9;ty=4}else if(pose==="stretchRaiseFront"){sx=1.07;sy=.95;ty=2}else if(pose==="stretchRecoverLeft"||pose==="stretchRecoverRight"){sx=1.06;sy=.97;ty=1}else if(pose==="jumpForward"){sx=1.08;sy=.92;ty=-3}else if(pose==="jumpBackward"){sx=.94;sy=.94;ty=-2}if(cat.airborne){if(cat.jumpPhase==="takeoff"){sx*=1.08;sy*=.82;ty+=4}else if(cat.jumpPhase==="ascent"){sx*=1.12;sy*=.88;ty-=2}else if(cat.jumpPhase==="apex"){sx*=.91;sy*=.93;rot+=cat.jumpBackward?-5:5}else if(cat.jumpPhase==="fall"){sx*=.97;sy*=1.07;rot+=cat.jumpBackward?3:-3}else if(cat.jumpPhase==="landing"){sx*=1.12;sy*=.78;ty+=5}}if(pose==="shakeLeft")rot=-4;if(pose==="shakeRight")rot=4;if(cat.action==="shake"){const p=(now-cat.actionStart)/Math.max(1,cat.actionDuration);rot+=Math.sin(p*Math.PI*8)*3;tx+=Math.sin(p*Math.PI*10)*1.3}visual.style.transform=`translate(${tx}px,${ty}px) rotate(${rot}deg) scale(${sx},${sy})`;visual.style.transformOrigin="50% 62%"}
function updateQuadrupedSkeleton(dt,now=performance.now()){const r=activeSkeletonRuntime();if(!r){visual.style.transform="";return null}if(r.blendTo){const raw=clamp((now-r.blendStart)/Math.max(1,r.blendDuration),0,1),t=easeInOutCubic(raw);for(const [id,b] of Object.entries(r.bones)){const f=r.blendFrom?.[id]||b.rest,to=r.blendTo?.[id]||b.rest;b.local.x=lerp(f.x,to.x,t);b.local.y=lerp(f.y,to.y,t);b.local.rotation=clampBoneRotation(b,lerpAngle(f.rotation,to.rotation,t));b.local.scaleX=lerp(f.scaleX??1,to.scaleX??1,t);b.local.scaleY=lerp(f.scaleY??1,to.scaleY??1,t)}if(raw>=1){r.blendTo=null;r.blendFrom=null}}computeWorldTransforms(r);applyIKConstraints(r);updateTailPhysics(r,dt);computeWorldTransforms(r);skeletonToAnatomyMetadata(r);visiblePoseEnvelope(r.pose||cat.pose||"stand",now);actor.dataset.skeletonRoot="root";actor.dataset.skeletonMode="fk-ik-tail-physics";actor.dataset.tailBones="tail0,tail1,tail2,tail3,tail4,tail5";spriteCanvas.dataset.skeletonPose=r.pose||cat.pose||"stand";return r}
function getSkeleton2DState(){const r=activeSkeletonRuntime();return r?{pose:r.pose,plant:r.plant,tail:{...r.tail},bones:Object.fromEntries(Object.entries(r.bones).map(([id,b])=>[id,{parent:b.parent,local:{...b.local},world:{...b.world},length:b.rest.length,limit:b.limit?b.limit.slice():null}])),targets:JSON.parse(JSON.stringify(r.targets||{})),constraints:JSON.parse(JSON.stringify(r.definition.constraints||{}))}:null}

const actionDuration={jump:520,jumpTakeoff:105,jumpAir:286,jumpLand:150,duck:300,dash:220,dashjump:560,drop:300,climb:420,pullup:340,inspect:360,interact:300,primary:280,caution:360,hint:650,listening:420,purr:720,thinking:680,judgment:500,snuggle:900,grumble:380,voidattude:900,sit:520,loaf:920,curlBall:1100,uncurl:420,stretchBow:1100,riseFromStretch:500,backLegExtendLeft:360,backLegExtendRight:360,shake:340,jumpForward:520,jumpBackward:520,transitionWalkToSit:320,transitionSitToLoaf:360,transitionLoafToCurl:420,transitionCurlToSit:360,transitionSitToStretch:340};
const spriteAtlas=new Image();
const spriteAtlasRows={"idle":0,"walk":1,"run":2,"dash":3,"dashjump":4,"jump":5,"duck":6,"drop":7,"climb":8,"pullup":9,"inspect":10,"interact":11,"primary":12,"caution":13,"hint":14,"listening":15,"purr":16,"thinking":17,"judgment":18,"snuggle":19,"grumble":20,"voidattude":21,"sit":19,"loaf":19,"curlBall":16,"uncurl":19,"stretchBow":8,"riseFromStretch":1,"backLegExtendLeft":1,"backLegExtendRight":1,"shake":20,"jumpForward":5,"jumpBackward":5,"jumpTakeoff":5,"jumpAir":5,"jumpLand":5,"transitionWalkToSit":19,"transitionSitToLoaf":19,"transitionLoafToCurl":16,"transitionCurlToSit":19,"transitionSitToStretch":8};
const onyxBlackCatPalette=Object.freeze({outline:"#06080D",furShade:"#080A0F",fur:"#111319",furLight:"#252A32"});
const spriteAtlasMeta={cell:64,columns:30,rows:22,palette:[onyxBlackCatPalette.outline,onyxBlackCatPalette.furShade,onyxBlackCatPalette.fur,onyxBlackCatPalette.furLight],paletteSource:"body-code-color-reference-only",sourceFrames:["f00","f01","f02","f03","f04","f10","f11","f12","f13","f14","f20","f21","f22","f23","f24","f30","f31","f32","f33","f34","f40","f41","f42","f43","f44","f50","f51","f52","f53","f54"],renderer:"canvas-sprite-atlas"};
spriteCtx.imageSmoothingEnabled=false;
spriteAtlas.decoding="sync";
spriteAtlas.onload=()=>renderCat();
spriteAtlas.src="assets/images/games/virtual/atlases/onyx_meow_sprite_atlas.png";
function annotateSpriteRig(){
 const variant=activeOnyxVariant(),rig=variant.spriteRig,anatomy=variant.anatomyRig;
 syncBipedalPlaceholderPresentation(variant);
 spriteCanvas.dataset.sprite=variant.id;spriteCanvas.dataset.spriteVariant=variant.id;spriteCanvas.dataset.placeholder=String(!!variant.placeholder);
 actor.dataset.sprite=variant.id;actor.dataset.spriteVariant=variant.id;actor.dataset.spritePalette="black-cat";actor.dataset.spritePaletteSource="body-code-color-reference-only";actor.dataset.rigType=variant.rigType;actor.dataset.behavior=variant.behavior;actor.dataset.placeholder=String(!!variant.placeholder);
 if(variant.placeholder||!rig||!anatomy){
  spriteCanvas.dataset.renderer="placeholder";spriteCanvas.dataset.cell="";spriteCanvas.dataset.sourceFrames="0";spriteCanvas.dataset.anatomyParts="0";spriteCanvas.dataset.anatomyReference="";
  actor.dataset.anatomyCoordinateSpace="";actor.dataset.anatomyReference="";
  syncAnatomyFrameMap(cat.dir,Math.floor(cat.frame)%5);
  return;
 }
 spriteCanvas.dataset.renderer="pixel-sprite-atlas";spriteCanvas.dataset.cell=String(spriteAtlasMeta.cell);spriteCanvas.dataset.sourceFrames=String(spriteAtlasMeta.sourceFrames.length);
 spriteCanvas.dataset.anatomyParts=String(Object.keys(anatomy.parts).length);
 spriteCanvas.dataset.anatomyReference="former-svg";
 actor.dataset.anatomyCoordinateSpace=anatomy.coordinateSpace;actor.dataset.anatomyReference="former-svg";
 syncAnatomyFrameMap(cat.dir,Math.floor(cat.frame)%5);
}
function drawSprite(action,dir,phaseIndex){
 if(activeOnyxVariant().placeholder){
  spriteCtx.clearRect(0,0,spriteAtlasMeta.cell,spriteAtlasMeta.cell);
  spriteCanvas.dataset.frame="";spriteCanvas.dataset.spriteAction="placeholder";spriteCanvas.dataset.direction=String(cat.dir);spriteCanvas.dataset.phase="0";
  return;
 }
 const row=spriteAtlasRows[action]??spriteAtlasRows.idle,phase=clamp(Math.floor(phaseIndex)||0,0,4),direction=((Math.floor(dir)||0)%6+6)%6,frameIndex=direction*5+phase;
 spriteCanvas.dataset.frame="f"+direction+phase;spriteCanvas.dataset.spriteAction=action;spriteCanvas.dataset.direction=String(direction);spriteCanvas.dataset.phase=String(phase);
 syncAnatomyFrameMap(direction,phase);
 if(!spriteAtlas.complete||!spriteAtlas.naturalWidth)return;
 spriteCtx.clearRect(0,0,spriteAtlasMeta.cell,spriteAtlasMeta.cell);spriteCtx.imageSmoothingEnabled=false;
 spriteCtx.drawImage(spriteAtlas,frameIndex*spriteAtlasMeta.cell,row*spriteAtlasMeta.cell,spriteAtlasMeta.cell,spriteAtlasMeta.cell,0,0,spriteAtlasMeta.cell,spriteAtlasMeta.cell);
}
function dirFromVector(x,y){if(Math.hypot(x,y)<.03)return cat.dir;const a=Math.atan2(y,x),sector=Math.round(a/(Math.PI/3));return ((sector%6)+6)%6}
function faceVector(x,y){if(Math.hypot(x,y)>=.03){cat.dir=dirFromVector(x,y);renderCat()}}
function facePoint(x,y){faceVector(x-cat.x,y-cat.y)}
function setCatAction(name,duration=actionDuration[name]||360,opts={}){
 const rig=activeSpriteRig(),now=performance.now();
 if(!rig){
  cat.action="idle";cat.actionStart=0;cat.actionDuration=0;cat.actionUntil=0;cat.visualAction="placeholder";actor.dataset.action="idle";renderCat(now);return;
 }
 if(!rig.sequences[name])name="idle";cat.action=name;cat.actionStart=now;cat.actionDuration=Math.max(1,duration);cat.actionUntil=opts.hold?Infinity:now+cat.actionDuration;
 if(opts.dir!=null)cat.dir=((opts.dir%6)+6)%6;
 if(opts.facePoint)facePoint(opts.facePoint.x,opts.facePoint.y);
 const autoPose=poseNameForAction(name);
 if(autoPose&&activeAnatomyRig()?.poseLibrary?.[autoPose])applyAnatomyPose(autoPose,{emit:false});
 actor.dataset.action=name;renderCat(now);
 const detail={action:name,mode,phase,behavior,spriteVariant:activeOnyxVariant().id,direction:cat.dir,traversal:cat.traversal};
 window.dispatchEvent(new CustomEvent("onyx-sprite-action",{detail}));
 window.dispatchEvent(new CustomEvent("onyx-svg-action",{detail}));
}
function clearCatAction(){cat.action="idle";cat.actionStart=0;cat.actionUntil=0;cat.actionDuration=0;actor.dataset.action="idle";if(!cat.pose)cat.pose="stand"}
function currentSequence(now=performance.now()){
 const rig=activeSpriteRig();
 if(!rig){cat.visualAction="placeholder";return [0]}
 let action=cat.action;
 if(cat.actionUntil!==Infinity&&cat.actionUntil>0&&now>=cat.actionUntil){clearCatAction();action="idle"}
 if(action==="idle"&&now<cat.motionUntil)action=cat.motion;
 cat.visualAction=action;
 return rig.sequences[action]||rig.sequences.idle;
}
function renderCat(now=performance.now()){
 actor.style.left=(cat.x*100)+"%";actor.style.top=(cat.y*100)+"%";actor.style.marginTop=(-Math.max(0,cat.jumpHeight||0))+"px";
 const kitchenKey=phase==="kitchen"?`${behavior}_kitchen`:"";
 const biped=kitchenKey?(window.OnyxKitchenVariantRegistry?.[kitchenKey]||null):null;
 if(biped&&typeof biped.render==="function"){
  const d=((Math.floor(cat.dir)||0)%6+6)%6;
  const facing=d===0?"right":d===3?"left":d===4||d===5?"back":"forward";
  const rawAction=String(cat.action||cat.visualAction||"idle");
  const seated=/sit|loaf|curl/.test(rawAction),eating=/interact|primary/.test(rawAction);
  const progress=cat.actionDuration>0&&Number.isFinite(cat.actionUntil)?clamp((now-cat.actionStart)/cat.actionDuration,0,1):0;
  const avatarPose=eating?{mode:"seated-eat",progress,tool:"spoon",stage:progress<.2?"reach":progress<.4?"scoop":progress<.68?"raise":progress<.82?"taste":"return"}:seated?{mode:"seated",progress:1}:{mode:"standing",progress};
  biped.render(spriteCanvas,{time:now,size:64,facing,showGlasses:false,showClipboard:false,avatarPose});
  actor.dataset.rigType="bipedal-kitchen";actor.dataset.placeholder="false";actor.dataset.behavior=behavior;actor.dataset.spriteVariant=kitchenKey;actor.dataset.mode=mode;actor.dataset.traversal=cat.traversal;actor.dataset.action=rawAction;
  spriteCanvas.dataset.renderer="bipedal-paperdoll";spriteCanvas.dataset.sprite=kitchenKey; spriteCanvas.dataset.spriteVariant=kitchenKey;spriteCanvas.dataset.direction=String(d);spriteCanvas.dataset.spriteAction=rawAction;cat.visualAction=rawAction;
  return;
 }
 const variant=activeOnyxVariant();
 syncBipedalPlaceholderPresentation(variant);
 actor.dataset.action=cat.action;actor.dataset.behavior=behavior;actor.dataset.sprite=variant.id;actor.dataset.spriteVariant=variant.id;actor.dataset.rigType=variant.rigType;actor.dataset.placeholder=String(!!variant.placeholder);actor.dataset.rigContext=variant.context||"hunt";actor.dataset.mode=mode;actor.dataset.traversal=cat.traversal;
 spriteCanvas.dataset.sprite=variant.id;spriteCanvas.dataset.spriteVariant=variant.id;spriteCanvas.dataset.placeholder=String(!!variant.placeholder);
 if(variant.placeholder){
  cat.visualAction="placeholder";
  spriteCtx.clearRect(0,0,spriteAtlasMeta.cell,spriteAtlasMeta.cell);
  spriteCanvas.dataset.renderer="placeholder";spriteCanvas.dataset.frame="";spriteCanvas.dataset.spriteAction="placeholder";spriteCanvas.dataset.direction=String(cat.dir);spriteCanvas.dataset.phase="0";
  return;
 }
 const seq=currentSequence(now);let phaseIndex;
 const feedVisual=window.OnyxBaseFeedingVisual;
 // The new 640px SVGs are calibrated to the same 64x64 sprite slot.
 // Draw only for an explicitly requested eat/drink action; other 'primary' actions remain unchanged.
 if(feedVisual?.renderToCanvas?.({ctx:spriteCtx,canvas:spriteCanvas,now,action:cat.visualAction,dir:cat.dir}))return;
 if(cat.action!=="idle"&&cat.actionDuration>0&&cat.actionUntil!==Infinity){
  const p=clamp((now-cat.actionStart)/cat.actionDuration,0,.999999);phaseIndex=seq[Math.min(seq.length-1,Math.floor(p*seq.length))];
 }else if(cat.action!=="idle"&&cat.actionUntil===Infinity){
  phaseIndex=seq[Math.floor(cat.frame)%seq.length];
 }else phaseIndex=Math.floor(cat.frame)%5;
 const finalPhase=clamp(phaseIndex,0,4);
 drawSprite(cat.visualAction||"idle",cat.dir,finalPhase);
}
function moveCat(dx,dy,dt,mult=1){
 const mag=Math.hypot(dx,dy);if(mag<.02)return;
 const nx=dx/mag,ny=dy/mag,profile=behaviorProfile[behavior]||behaviorProfile.thoughtful;
 if(cat.airborne){cat.dir=dirFromVector(nx,ny);return;}
 let speed=(mode==="direct"?cat.speed:profile.speed)*mult;
 const moveNow=performance.now();cat.motion=(phase==="rush"||mult>1.2)?"run":"walk";cat.motionUntil=moveNow+120;
 if(moveNow<cat.cautionUntil)speed*=.55;
 if(mult>1.25&&cat.traversal==="ground"&&(cat.action==="idle"||cat.actionUntil<moveNow))setCatAction("dash",220);
 if(cat.traversal==="climb"){speed*=.72;if(cat.action==="idle")setCatAction("climb",0,{hold:true})}
 else if(cat.action==="climb"&&cat.actionUntil===Infinity)clearCatAction();
 cat.vx=nx*speed*mult;cat.vy=ny*speed*mult;
 cat.x=clamp(cat.x+nx*speed*dt,.045,.955);cat.y=clamp(cat.y+ny*speed*dt,.11,.93);
 cat.dir=dirFromVector(nx,ny);cat.frame=(cat.frame+dt*(cat.action==="dash"?18:cat.traversal==="climb"?8:10)*mult)%5;renderCat();
}
function cellFromPos(x,y){return{x:clamp(Math.floor(x*nav.cols),0,nav.cols-1),y:clamp(Math.floor(y*nav.rows),0,nav.rows-1)}}
function posFromCell(c){return{x:(c.x+.5)/nav.cols,y:(c.y+.5)/nav.rows}}
function keyCell(c){return c.x+","+c.y}
function neighbors(c){const d=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]],out=[];for(const [dx,dy] of d){const n={x:c.x+dx,y:c.y+dy};if(n.x>=0&&n.y>=0&&n.x<nav.cols&&n.y<nav.rows&&!nav.blocked.has(keyCell(n)))out.push(n)}return out}
function pathfind(start,goal){
 const open=[start],came=new Map(),g=new Map([[keyCell(start),0]]),f=new Map([[keyCell(start),Math.hypot(goal.x-start.x,goal.y-start.y)]]);
 while(open.length){open.sort((a,b)=>(f.get(keyCell(a))??1e9)-(f.get(keyCell(b))??1e9));const cur=open.shift();if(cur.x===goal.x&&cur.y===goal.y){const path=[];let k=keyCell(cur),node=cur;while(came.has(k)){path.unshift(node);node=came.get(k);k=keyCell(node)}return path}
   for(const n of neighbors(cur)){const nk=keyCell(n),tent=(g.get(keyCell(cur))??1e9)+Math.hypot(n.x-cur.x,n.y-cur.y);if(tent<(g.get(nk)??1e9)){came.set(nk,cur);g.set(nk,tent);f.set(nk,tent+Math.hypot(goal.x-n.x,goal.y-n.y));if(!open.some(o=>o.x===n.x&&o.y===n.y))open.push(n)}}
 }return[]}
function chooseGoal(){
 const profile=behaviorProfile[behavior]||behaviorProfile.thoughtful;
 let gx=.12+Math.random()*.76,gy=.22+Math.random()*.63;
 const candidates=[...nav.context.safeTargets,...nav.context.objectiveTargets,...nav.context.prizeTargets];
 if(behavior==="hungry")candidates.push(...nav.context.foodTargets,...nav.context.foodTargets);
 if(candidates.length){const t=candidates[Math.floor(Math.random()*candidates.length)];gx=t.x;gy=t.y}
 if(guide.active){gx=clamp(cat.x+guide.x*.33*profile.response,.08,.92);gy=clamp(cat.y+guide.y*.33*profile.response,.16,.9)}
 if(behavior==="snuggly"){gx=(gx+.5)/2;gy=(gy+.58)/2}
 if(behavior==="thoughtful"||behavior==="caring"){gx=clamp(gx,.15,.85);gy=clamp(gy,.22,.82)}
 cat.goal={x:gx,y:gy};cat.path=pathfind(cellFromPos(cat.x,cat.y),cellFromPos(gx,gy));cat.waitUntil=0;
}
function beginAutonomousActivity(choice,now){
 const profile=behaviorProfile[behavior]||behaviorProfile.thoughtful;autonomyState.lastDecision=choice;autonomyState.decisionCount++;
 if(choice==="roam"){if(!cat.path.length)chooseGoal();return}
 cat.path=[];cat.goal=null;
 if(choice==="loaf"){playCatRoutine("settleLoaf",{endPose:"loaf",endAction:"loaf",holdFinal:true});autonomyState.nextDecision=now+2600+profile.pause}
 else if(choice==="curl"){playCatRoutine("curlSleep",{endPose:"curlBall",endAction:"curlBall",holdFinal:true});autonomyState.nextDecision=now+3400+profile.pause}
 else if(choice==="stretch"){playCatRoutine("fullStretch",{endPose:"stand",endAction:"idle"});autonomyState.nextDecision=now+2700+profile.pause}
 else if(choice==="jump"){startCatJump(Math.random()<.18?"backward":"forward",.045+Math.random()*.035,{duration:470+Math.random()*120});autonomyState.nextDecision=now+1000+profile.pause}
 else if(choice==="sit"){applyAnatomyPose("sit",{duration:220});setCatAction("sit",700);autonomyState.nextDecision=now+1100+profile.pause}
 else{setCatAction(choice,actionDuration[choice]||620);autonomyState.nextDecision=now+(actionDuration[choice]||620)+profile.pause}
 window.dispatchEvent(new CustomEvent("onyx-autonomous-decision",{detail:{behavior,choice,count:autonomyState.decisionCount}}));
}
function updateAutonomous(now=performance.now(),dt=.016){
 if(!isAutonomyEnabled()||phase==="kitchen"||topPanel||now<autonomyState.manualOverrideUntil||cat.airborne){return false}
 syncAutonomyMode();
 if(cat.path.length){const target=posFromCell(cat.path[0]),dx=target.x-cat.x,dy=target.y-cat.y,d=Math.hypot(dx,dy);if(d<.025){cat.path.shift();if(!cat.path.length){cat.goal=null;cat.waitUntil=now+250+(behaviorProfile[behavior]?.pause||700)}}else moveCat(dx,dy,dt,1);return true}
 if(cat.goal&&!cat.path.length){cat.goal=null;cat.waitUntil=now+220}
 if(now<cat.waitUntil||now<autonomyState.nextDecision){renderCat(now);return false}
 const pool=autonomyPools[behavior]||autonomyPools.thoughtful,choice=pool[Math.floor(Math.random()*pool.length)];beginAutonomousActivity(choice,now);return choice==="roam"
}
let last=performance.now();
function loop(now){
 const dt=Math.min(.033,(now-last)/1000);last=now;
 if(!paused){
  let moved=false;
  if(cat.airborne){updateCatJump(now);moved=true}
  if(phase==="kitchen"){renderCat(now)}
  else if(!topPanel&&!cat.airborne){
   if(phase==="rush"&&q("#autoForward")?.checked&&(!isAutonomyEnabled()||leftState.active)){const lateral=leftState.active?leftState.x:0,forward=-.72;moveCat(lateral,forward,dt,zHeld?1.8:1);moved=true}
   else if(leftState.active){moveCat(leftState.x,leftState.y,dt,zHeld?1.8:1);moved=true}
   else if(isAutonomyEnabled())moved=!!updateAutonomous(now,dt);
   else renderCat(now);
  }else if(!cat.airborne)renderCat(now);
  if(!moved){cat.vx*=Math.exp(-dt*8);cat.vy*=Math.exp(-dt*8)}
  updateQuadrupedSkeleton(dt,now);
 }
 requestAnimationFrame(loop)
}requestAnimationFrame(loop);

const controlLabels={
 board:{title:"HUNT BOARD",owner:"ONYX CONTROLLED",left:"ONYX / BOARD",right:"PAW-AIM",buttons:{A:"CANCEL",B:"CONFIRM",X:"INSPECT",Y:"GRAB",R:"LAUNCH",Z:"MOD"},systems:["BOOSTERS","PATIENCE","HUNT / ONYX","RECIPE"]},
 rush:{title:"HUNT RUSH",owner:"ONYX CONTROLLED",left:"MOVE ONYX",right:"CAMERA / AIM",buttons:{A:"DUCK",B:"JUMP",X:"INSPECT",Y:"GRAB",R:"PAW",Z:"DASH"},systems:["BOOSTERS","PATIENCE","HUNT STATUS","RECIPE"]},
 kitchen:{title:"KITCHEN CONTROLS",owner:"HUMAN CONTROLLED · ONYX SUPERVISOR",left:"MOVE / STATION",right:"CAMERA / HAND",buttons:{A:"CANCEL",B:"PLACE",X:"INSPECT",Y:"GRAB",R:"USE",Z:"PRECISION"},systems:["INGREDIENTS","TOOLS","KITCHEN / ONYX","RECIPE"]}
};
function syncContextMenus(){
 const kitchen=phase==="kitchen";
 qa("[data-menu-context]").forEach(el=>{el.hidden=(el.dataset.menuContext==="kitchen")?!kitchen:kitchen});
 const titles={
  s1:kitchen?"Ingredients / Kitchen Inventory":"Boosters",
  s2:kitchen?"Tools / Utensils":"Imperial Patience",
  s3:kitchen?"Kitchen / Onyx Supervisor Status":"Hunt / Onyx Status",
  s4:"Recipe / Objectives"
 };
 const a=q("#system1Title"),b=q("#system2Title"),c=q("#system3Title"),d=q("#system4Title");
 if(a)a.textContent=titles.s1;if(b)b.textContent=titles.s2;if(c)c.textContent=titles.s3;if(d)d.textContent=titles.s4;
 const summary=q("#controlContextSummary");
 if(summary)summary.innerHTML=kitchen
  ?"<strong>KITCHEN MODE:</strong> control belongs to the human first-person player. Onyx is the visible supervisor and receives no movement input."
  :`<strong>HUNT MODE:</strong> ${isAutonomyEnabled()?"Onyx autonomy is ON for <strong>"+behavior+"</strong>; manual input temporarily overrides it.":"the human directly controls Onyx. Enable autonomy per personality in Button 3."}`;
}
function updateControlLabels(){
 const c=controlLabels[phase]||controlLabels.board;
 q("#leftJoyLabel").textContent=c.left;
 q("#rightJoyLabel").textContent=c.right;
 Object.entries(c.buttons).forEach(([key,label])=>{const b=q(`.action[data-key="${key}"]`);if(!b)return;const sm=q("small",b);if(sm)sm.textContent=label;b.setAttribute("aria-label",`${key} — ${label}`)});
 c.systems.forEach((label,i)=>{const el=q(`#systemLabel${i+1}`);if(el)el.textContent=label});
 const own=q("#controlOwnership");if(own)own.textContent=phase==="kitchen"?"Kitchen: human first-person controls · Onyx remains supervisor":isAutonomyEnabled()?`Hunt: ${behavior} autonomy ON · manual input temporarily overrides`:`Hunt: direct control · ${behavior} autonomy OFF`;
 root.dataset.controlContext=phase==="kitchen"?"kitchen":"hunt";
}
function updateHud(){
 const c=controlLabels[phase]||controlLabels.board;
 q("#phaseTitle").textContent=c.title;
 q("#behaviorHud").textContent=(phase==="kitchen"?c.owner:(isAutonomyEnabled()?"ONYX AUTONOMOUS":"ONYX CONTROLLED"))+" · "+activeOnyxVariant().id.toUpperCase();
 qa("[data-phase]").forEach(b=>b.classList.toggle("active",b.dataset.phase===phase));
 focus.hidden=true;
 updateControlLabels();
 updateOnyxStatus();
}
function updateOnyxStatus(){
 const variant=activeOnyxVariant();
 q("#onyxStatus").textContent=(phase==="kitchen"?"Kitchen supervisor":isAutonomyEnabled()?"Autonomous in Hunt (manual override enabled)":"Directly controlled in Hunt")+" · "+variant.id+(variant.placeholder?" · BIPEDAL RIG PLACEHOLDER":"");const ar=q("#autonomyReadout");if(ar)ar.textContent=`Selected personality autonomy: ${autonomyByBehavior[behavior]?"ON":"OFF"} · ${behavior}`;qa("[data-autonomy-behavior]").forEach(el=>{el.checked=!!autonomyByBehavior[el.dataset.autonomyBehavior]});
}
function setMode(){syncAutonomyMode();updateHud()}
activateBehaviorVariant(behavior,{syncControl:true,emit:false});
q("#behaviorSelect").addEventListener("change",e=>{const variant=activateBehaviorVariant(e.target.value);if(!variant)return;cat.path=[];cat.goal=null;clearCatAction();syncAutonomyMode();annotateSpriteRig();renderCat();updateHud()});qa("[data-autonomy-behavior]").forEach(el=>el.addEventListener("change",()=>{setBehaviorAutonomy(el.dataset.autonomyBehavior,el.checked);updateHud()}));
qa("[data-phase]").forEach(b=>b.addEventListener("click",()=>{phase=b.dataset.phase;cat.path=[];cat.goal=null;guide.active=false;clearCatAction();activateBehaviorVariant(behavior,{syncControl:true,emit:false});syncAutonomyMode();annotateSpriteRig();renderCat();emitInput("controlContext",{value:phase,variant:activeOnyxVariant().id});updateHud()}));

function panel(key){return q(`.panel[data-panel="${key}"]`)}
function tool(key){return q(`.game-tool[data-tool="${key}"]`)}
function positionPanel(key,btn){const p=panel(key);if(!p||p.classList.contains("pinned"))return;const rr=toolbar.getBoundingClientRect(),br=(btn||tool(key)||q(`[data-system="${key}"]`))?.getBoundingClientRect()||rr,w=Math.min(parseFloat(getComputedStyle(p).getPropertyValue("--panel-w"))||440,innerWidth-16);p.style.setProperty("--panel-x",clamp(br.left-rr.left,8,Math.max(8,rr.width-w-8))+"px")}
function openPanel(key,btn=null){const p=panel(key);if(!p)return;qa(".panel").forEach(x=>{if(x!==p&&!x.classList.contains("pinned"))x.classList.remove("open")});qa(".game-tool").forEach(x=>x.setAttribute("aria-pressed",String(x.dataset.tool===key)));positionPanel(key,btn);p.classList.add("open");topPanel=p;const first=q(".menu-item:not(:disabled)",p);first?.focus({preventScroll:true})}
function closePanel(key){const p=panel(key);if(!p)return;if(!p.classList.contains("pinned"))p.classList.remove("open");tool(key)?.setAttribute("aria-pressed","false");topPanel=qa(".panel.open").pop()||null}
qa(".game-tool").forEach(b=>b.addEventListener("click",()=>panel(b.dataset.tool)?.classList.contains("open")&&!panel(b.dataset.tool).classList.contains("pinned")?closePanel(b.dataset.tool):openPanel(b.dataset.tool,b)));
qa("[data-open-panel]").forEach(b=>b.addEventListener("click",()=>openPanel(b.dataset.openPanel,b)));
qa("[data-close]").forEach(b=>b.addEventListener("click",()=>closePanel(b.dataset.close)));
qa("[data-pin]").forEach(b=>b.addEventListener("click",()=>{const p=panel(b.dataset.pin);if(!p)return;const pin=!p.classList.contains("pinned");if(pin){const r=p.getBoundingClientRect();p.style.setProperty("--pin-x",clamp(r.left,6,innerWidth-r.width-6)+"px");p.style.setProperty("--pin-y",clamp(r.top,6,innerHeight-60)+"px")}p.classList.toggle("pinned",pin);p.classList.add("open");topPanel=p}));
qa(".panel-head").forEach(h=>h.addEventListener("pointerdown",e=>{if(e.target.closest("button"))return;const p=h.closest(".panel");if(!p)return;if(!p.classList.contains("pinned")){const r=p.getBoundingClientRect();p.classList.add("pinned","open");p.style.setProperty("--pin-x",r.left+"px");p.style.setProperty("--pin-y",r.top+"px")}const r=p.getBoundingClientRect(),sx=e.clientX,sy=e.clientY;h.setPointerCapture?.(e.pointerId);const mv=ev=>{p.style.setProperty("--pin-x",clamp(r.left+ev.clientX-sx,6,innerWidth-r.width-6)+"px");p.style.setProperty("--pin-y",clamp(r.top+ev.clientY-sy,6,innerHeight-50)+"px")};const up=()=>{h.removeEventListener("pointermove",mv);h.removeEventListener("pointerup",up);h.removeEventListener("pointercancel",up)};h.addEventListener("pointermove",mv);h.addEventListener("pointerup",up);h.addEventListener("pointercancel",up)}));

if("ResizeObserver" in window){
 const EDGES=["n","s","e","w","ne","nw","se","sw"],state=new WeakMap(),observer=new ResizeObserver(es=>es.forEach(e=>applyScale(e.target)));
 const px=n=>`${Math.round(n*100)/100}px`,sized=(b,s,min=2,max=160)=>clamp(b*s,min,max);
 function setVars(el,s){for(const [n,b,min,max] of [["--f10",10,10,40],["--f11",11,10,40],["--f12",12,10,40],["--icon",18,10,40],["--gap4",4,2,10],["--gap5",5,3,12],["--gap7",7,4,16],["--gap8",8,4,18],["--pad5",5,3,12],["--pad6",6,3,14],["--pad7",7,4,16],["--pad8",8,4,18],["--pad9",9,5,20],["--pad10",10,6,22],["--head-h",39,31,87],["--action-box",29,24,64],["--button-h",35,27,78],["--input-h",33,27,73]])el.style.setProperty(n,px(sized(b,s,min,max)))}
 function capture(el){let s=state.get(el);if(!s){s={};state.set(el,s)}if(s.w&&s.h)return true;const r=el.getBoundingClientRect();if(r.width<2||r.height<2)return false;s.w=r.width;s.h=r.height;return true}
 function applyScale(el){const s=state.get(el);if(!s?.w)return;const r=el.getBoundingClientRect(),z=clamp(Math.sqrt((r.width/s.w)*(r.height/s.h)),10/18,40/18);setVars(el,z)}
 function begin(e,el,edge){if(e.button!==undefined&&e.button!==0)return;e.preventDefault();e.stopPropagation();if(!capture(el))return;const r=el.getBoundingClientRect(),sx=e.clientX,sy=e.clientY,s=state.get(el),minW=Math.max(180,Math.min(s.w*.42,260)),minH=Math.max(110,Math.min(s.h*.30,220));el.classList.add("user-sized","resizing","pinned","open");el.style.setProperty("--pin-x",r.left+"px");el.style.setProperty("--pin-y",r.top+"px");const h=e.currentTarget;h.setPointerCapture?.(e.pointerId);const mv=ev=>{const dx=ev.clientX-sx,dy=ev.clientY-sy;let x=r.left,y=r.top,w=r.width,hh=r.height;if(edge.includes("e"))w=clamp(r.width+dx,minW,innerWidth-r.left-4);if(edge.includes("s"))hh=clamp(r.height+dy,minH,innerHeight-r.top-4);if(edge.includes("w")){x=clamp(r.left+dx,4,r.right-minW);w=r.right-x}if(edge.includes("n")){y=clamp(r.top+dy,4,r.bottom-minH);hh=r.bottom-y}el.style.width=px(w);el.style.height=px(hh);el.style.maxWidth="none";el.style.maxHeight="none";el.style.setProperty("--pin-x",px(x));el.style.setProperty("--pin-y",px(y))};const up=()=>{el.classList.remove("resizing");h.removeEventListener("pointermove",mv);h.removeEventListener("pointerup",up);h.removeEventListener("pointercancel",up)};h.addEventListener("pointermove",mv);h.addEventListener("pointerup",up);h.addEventListener("pointercancel",up)}
 qa(".panel").forEach(el=>{el.classList.add("resizable");EDGES.forEach(edge=>{const h=document.createElement("span");h.className="resize-handle";h.dataset.edge=edge;h.addEventListener("pointerdown",e=>begin(e,el,edge));el.appendChild(h)});observer.observe(el);capture(el)})
}

function inspectFocused(){if(!topPanel)return;const el=document.activeElement;if(!topPanel.contains(el))return;const detail=el?.dataset?.detail;if(!detail)return;const box=q(".readout[hidden]",topPanel);if(box){box.hidden=false;box.textContent=detail}}
function activateFocused(){if(!topPanel)return;const el=document.activeElement;if(el&&topPanel.contains(el)){if(el.tagName==="BUTTON")el.click();else if(el.tagName==="SELECT")el.focus()}}
function moveMenuFocus(dx,dy){
 if(!topPanel)return false;
 const items=qa(".menu-item:not(:disabled)",topPanel).filter(x=>x.offsetParent!==null);if(!items.length)return false;
 let i=Math.max(0,items.indexOf(document.activeElement));if(Math.abs(dx)>Math.abs(dy))i+=dx>0?1:-1;else i+=dy>0?1:-1;i=(i+items.length)%items.length;items[i].focus({preventScroll:true});return true
}


const leftState={x:0,y:0,active:false},rightState={x:0,y:0,active:false};let leftDead=.18,rightDead=.14,menuJoyLatched=false;
function makeJoystick(el,handle,state,deadFn,onMove){let pid=null;function recenter(){handle.style.transform="translate(-50%,-50%)";state.x=state.y=0;state.active=false;onMove?.(0,0,false)}function move(e){if(e.pointerId!==pid)return;const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,max=r.width*.34;let dx=e.clientX-cx,dy=e.clientY-cy,mag=Math.hypot(dx,dy);if(mag>max){dx=dx/mag*max;dy=dy/mag*max;mag=max}handle.style.transform=`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;let x=dx/max,y=dy/max,dead=deadFn();if(Math.hypot(x,y)<dead){x=0;y=0}state.x=x;state.y=y;state.active=Math.hypot(x,y)>=dead;onMove?.(x,y,state.active)}el.addEventListener("pointerdown",e=>{if(pid!==null)return;pid=e.pointerId;el.setPointerCapture?.(pid);move(e)});el.addEventListener("pointermove",move);for(const t of ["pointerup","pointercancel"])el.addEventListener(t,e=>{if(e.pointerId!==pid)return;try{el.releasePointerCapture(pid)}catch{}pid=null;recenter()});return recenter}
const resetLeft=makeJoystick(q("#leftJoystick"),q("#leftJoyHandle"),leftState,()=>leftDead,(x,y,active)=>{
 if(topPanel){if(!active){menuJoyLatched=false;return}if(!menuJoyLatched){moveMenuFocus(x,y);menuJoyLatched=true}return}
 menuJoyLatched=false;
 if(active&&phase!=="kitchen")markManualControl();
 const semantic=phase==="kitchen"?"humanMovementOrStationSelection":phase==="board"?"onyxMovementOrBoardFocus":q("#autoForward")?.checked?"laneMovement":"moveOnyx";
 emitInput("leftJoystick",{semantic,x,y,active,modified:zHeld});
});
const resetRight=makeJoystick(q("#rightJoystick"),q("#rightJoyHandle"),rightState,()=>rightDead,(x,y,active)=>{
 if(topPanel)return;
 const semantic=phase==="kitchen"?"firstPersonCameraHandTool":phase==="board"?"pawAim":"cameraFacing";
 emitInput("rightJoystick",{semantic,x,y,active,modified:zHeld});
 aimState.x=clamp(aimState.x+x*.012,.04,.96);aimState.y=clamp(aimState.y+y*.012,.12,.94);aim.style.left=aimState.x*100+"%";aim.style.top=aimState.y*100+"%";
 if(active&&phase==="rush")faceVector(x,y);
});

function pulse(cls,ms=340){setCatAction(cls,ms)}
function closeTopPanel(){if(!topPanel)return false;const key=topPanel.dataset.panel;closePanel(key);return true}
function doAction(key){if(paused)return;if(phase!=="kitchen")markManualControl(1700);
 if(topPanel){
  const panelName=topPanel.dataset.panel;
  if(key==="A"){closeTopPanel();emitInput("menuControl",{panel:panelName,key,semantic:"cancelBack"});return}
  if(key==="B"){activateFocused();emitInput("menuControl",{panel:panelName,key,semantic:"confirmPlace"});return}
  if(key==="X"){inspectFocused();emitInput("menuControl",{panel:panelName,key,semantic:"inspectSecondary"});return}
  if(key==="Y"){activateFocused();emitInput("menuControl",{panel:panelName,key,semantic:"interactGrab"});return}
  if(key==="R"){activateFocused();emitInput("menuControl",{panel:panelName,key,semantic:"primaryAction"});return}
 }
 const kitchen=phase==="kitchen",rush=phase==="rush";
 const semanticMap=kitchen?{
  A:"cancelBackSetDown",
  B:zHeld?"precisionPlacement":"confirmPlace",
  X:zHeld?"detailedInspection":"inspectRotateSecondary",
  Y:zHeld?"carefulInteractGrab":"interactPickUpGrab",
  R:zHeld?"precisePrimaryToolAction":"primaryToolAction",
  Z:"precisionModifier"
 }:rush?{
  A:zHeld?"dropDown":"duckCancelDrop",
  B:zHeld?"dashJump":(cat.traversal==="climb"?"pullUp":"jumpConfirm"),
  X:"inspectAlternate",
  Y:"grabInteract",
  R:"pawPrimaryAction",
  Z:"dash"
 }:{
  A:"cancelAim",
  B:"confirm",
  X:"inspect",
  Y:zHeld?"markIntendedRoute":"interactSelectGrab",
  R:"launchPawAim",
  Z:"huntModifier"
 };
 const semantic=semanticMap[key];emitInput("button",{key,semantic,pressed:true,modified:zHeld});
 if(kitchen)return;
 if(key==="A"){
  if(zHeld&&rush){setCatAction("drop",320);cat.y=clamp(cat.y+.05,.11,.93)}
  else if(rush)setCatAction("duck",320);
  else emitInput("aimCancel",{source:"A"});
  return;
 }
 if(key==="B"){
  if(rush){
   if(cat.traversal==="climb")setCatAction("pullup",360);
   else startCatJump("forward",zHeld?.09:.06,{duration:zHeld?560:500,dash:zHeld});
  }
  return;
 }
 if(key==="X"){facePoint(aimState.x,aimState.y);setCatAction("inspect",420);return}
 if(key==="Y"){facePoint(aimState.x,aimState.y);setCatAction(zHeld&&phase==="board"?"listening":"interact",340);return}
 if(key==="R"){facePoint(aimState.x,aimState.y);setCatAction("primary",300);aim.animate?.([{transform:"scale(1)",opacity:1},{transform:"scale(1.35)",opacity:.25},{transform:"scale(1)",opacity:1}],{duration:180});return}
 if(key==="Z"&&rush&&leftState.active){setCatAction(cat.traversal==="climb"?"climb":"dash",240)}
}
qa(".action").forEach(b=>{
 const k=b.dataset.key;
 if(k==="Z"){
  const down=e=>{zHeld=true;b.classList.add("is-held");b.setPointerCapture?.(e.pointerId);emitInput("button",{key:"Z",semantic:phase==="kitchen"?"precisionModifier":phase==="rush"?"dash":"huntModifier",pressed:true,held:true});if(phase==="rush"&&leftState.active)setCatAction(cat.traversal==="climb"?"climb":"dash",240)};
  const up=()=>{if(!zHeld)return;zHeld=false;b.classList.remove("is-held");emitInput("button",{key:"Z",semantic:phase==="kitchen"?"precisionModifier":phase==="rush"?"dash":"huntModifier",pressed:false,held:true})};
  b.addEventListener("pointerdown",down);b.addEventListener("pointerup",up);b.addEventListener("pointercancel",up);return;
 }
 if(k==="A"){
  let heldDuck=false;
  b.addEventListener("pointerdown",e=>{b.setPointerCapture?.(e.pointerId);if(!paused&&!topPanel&&phase==="rush"&&!zHeld){heldDuck=true;setCatAction("duck",0,{hold:true});emitInput("button",{key:"A",semantic:"duck",pressed:true,held:true})}else doAction("A")});
  const release=()=>{if(heldDuck){heldDuck=false;if(cat.action==="duck"&&cat.actionUntil===Infinity)clearCatAction();emitInput("button",{key:"A",semantic:"duck",pressed:false,held:true})}};
  b.addEventListener("pointerup",release);b.addEventListener("pointercancel",release);return;
 }
 b.addEventListener("click",()=>doAction(k))
});

const systemPanel={"1":"boosters","2":"patience","3":"onyx","4":"route"};
function systemPress(n,modified=false){
 const kitchen=phase==="kitchen";
 const huntSemantic={"1":"openBoosters","2":"openImperialPatience","3":"openHuntOnyxStatus","4":"openRecipeObjectives"};
 const kitchenSemantic=modified?{"1":"ingredientDetails","2":"toolDetails","3":"expandedCookingStatus","4":"detailedRecipeSpecification"}:{"1":"openIngredients","2":"openTools","3":"openKitchenOnyxStatus","4":"openRecipeObjectives"};
 const semantic=(kitchen?kitchenSemantic:huntSemantic)[n];
 emitInput("systemButton",{key:n,semantic,modified});
 const key=systemPanel[n],p=panel(key);
 if(p?.classList.contains("open")&&!p.classList.contains("pinned")){closePanel(key);return}
 openPanel(key,q(`[data-system="${n}"]`));
}
qa("[data-system]").forEach(b=>{const n=b.dataset.system;b.addEventListener("click",()=>systemPress(n,zHeld))});

q("#menuButton").addEventListener("click",()=>openPanel("game",q("#menuButton")));
const pauseOverlay=q("#gamePauseOverlay");
function setPaused(v){
  paused=!!v;
  root.dataset.gameState=paused?"paused":"playing";
  pauseOverlay.classList.toggle("open",paused);
  pauseOverlay.setAttribute("aria-hidden",String(!paused));
  q("#pauseButton").textContent=paused?"▶":"Ⅱ";
  if(paused){
    leftState.active=false;
    rightState.active=false;
    zHeld=false;
    resetLeft();
    resetRight();
    clearCatAction();
    renderCat();
  }
  window.dispatchEvent(new CustomEvent("retro-game-state",{detail:{state:paused?"paused":"playing"}}));
}
q("#pauseButton").addEventListener("click",()=>{
  closeTopPanel();
  setPaused(root.dataset.gameState!=="paused");
});
q("#resumeButton").addEventListener("click",()=>setPaused(false));
q("#pauseSettingsButton").addEventListener("click",()=>{
  setPaused(false);
  openPanel("settings",q('.game-tool[data-tool="settings"]'));
});
document.addEventListener("visibilitychange",()=>{
  if(document.hidden && root.dataset.gameState!=="paused") setPaused(true);
});
function setGameWindow(open){const wasOpen=document.documentElement.dataset.gameWindow==="true";document.documentElement.dataset.gameWindow=String(!!open);q("#exitGameWindow").hidden=!open;q("#fullscreenButton").textContent=open?"Close Game Window":"Open Game Window";if(open&&!wasOpen){closeTopPanel();setPaused(false);viewer.focus();recordAdventure("You and Onyx began an adventure in the game window.")}else if(!open&&wasOpen){recordAdventure("You and Onyx finished this game window adventure. The time you spent exploring together is saved in Leisure.")}if(!open)q("#onyxGameChat").hidden=true}
function exitGameToWidget(){if(document.documentElement.dataset.gameWindow==="true")setGameWindow(false);if(window.OnyxShell?.exitToModule)window.OnyxShell.exitToModule();else document.documentElement.dataset.runtimeMode="module"}
q("#fullscreenButton").addEventListener("click",()=>setGameWindow(document.documentElement.dataset.gameWindow!=="true"));
q("#exitGameWindow").addEventListener("click",exitGameToWidget);

function bindSlider(id,fmt,fn){const el=q(id),out=el.closest(".slider").querySelector("output");const apply=()=>{out.textContent=fmt(el.value);fn(+el.value)};el.addEventListener("input",apply);apply()}
bindSlider("#leftJoySize",v=>v+" px",v=>root.style.setProperty("--left-joy-size",v+"px"));bindSlider("#rightJoySize",v=>v+" px",v=>root.style.setProperty("--right-joy-size",v+"px"));bindSlider("#leftJoyDead",v=>v+"%",v=>leftDead=v/100);bindSlider("#rightJoyDead",v=>v+"%",v=>rightDead=v/100);bindSlider("#joyOpacity",v=>v+"%",v=>root.style.setProperty("--joy-opacity",(v/100).toFixed(2)));
q("#showHud").addEventListener("change",e=>q("#gameHud").style.display=e.target.checked?"grid":"none");q("#showControls").addEventListener("change",e=>q("#controlLayer").style.display=e.target.checked?"block":"none");
q('[data-a11y="large"]').addEventListener("change",e=>{root.style.setProperty("--action-size",e.target.checked?"68px":"56px");root.style.setProperty("--num-size",e.target.checked?"58px":"48px")});
q('[data-a11y="reduced"]').addEventListener("change",e=>root.classList.toggle("reduce-motion",e.target.checked));
q('[data-a11y="onehand"]').addEventListener("change",e=>{const on=e.target.checked;if(on){q("#leftJoystick").style.left="calc(50% + 14px)";q(".actions").style.left="18px";q(".actions").style.right="auto"}else{q("#leftJoystick").style.left="18px";q(".actions").style.left="";q(".actions").style.right="18px"}});


viewer.addEventListener("pointermove",e=>{
 if(paused||topPanel||e.pointerType==="touch")return;
 const r=viewer.getBoundingClientRect(),x=clamp((e.clientX-r.left)/r.width,.04,.96),y=clamp((e.clientY-r.top)/r.height,.12,.94);
 aimState.x=x;aimState.y=y;aim.style.left=x*100+"%";aim.style.top=y*100+"%";
 if(phase==="rush"&&mode==="direct")facePoint(x,y);
});
viewer.addEventListener("click",e=>{if(paused||topPanel||e.target.closest("button,.joystick,.panel"))return;if(e.shiftKey&&phase==="board"){const was=zHeld;zHeld=true;doAction("Y");zHeld=was}else doAction("R")});
viewer.addEventListener("contextmenu",e=>{if(paused||topPanel)return;e.preventDefault();emitInput("rightClick",{semantic:phase==="board"?"inspectOrCancelAim":phase==="rush"?"inspect":"inspectSecondary"});doAction("X")});
viewer.addEventListener("wheel",e=>{if(paused||topPanel||phase!=="kitchen")return;emitInput("kitchenWheelAdjust",{direction:e.deltaY<0?"increase":"decrease",delta:e.deltaY,modified:zHeld})},{passive:true});

const keys=new Set();
function keyVector(){let x=0,y=0;if(keys.has("w")||keys.has("arrowup")||keys.has("numpad8"))y-=1;if(keys.has("s")||keys.has("arrowdown")||keys.has("numpad2"))y+=1;if(keys.has("a")||keys.has("arrowleft")||keys.has("numpad4"))x-=1;if(keys.has("d")||keys.has("arrowright")||keys.has("numpad6"))x+=1;if(keys.has("numpad7")){x-=1;y-=1}if(keys.has("numpad9")){x+=1;y-=1}if(keys.has("numpad1")){x-=1;y+=1}if(keys.has("numpad3")){x+=1;y+=1}return{x,y}}
setInterval(()=>{
 if(paused||topPanel)return;
 const v=keyVector();if(!v.x&&!v.y)return;
 const semantic=phase==="kitchen"?"humanMovementOrStationSelection":phase==="board"?"onyxMovementOrBoardFocus":q("#autoForward")?.checked?"laneMovement":"moveOnyx";
 markManualControl();emitInput("keyboardMove",{semantic,x:v.x,y:v.y,modified:zHeld});
 if(phase!=="kitchen")moveCat(v.x,v.y,.016,keys.has("shift")?1.8:1);
},16);
addEventListener("keydown",e=>{
 if(/INPUT|SELECT|TEXTAREA/.test(e.target?.tagName||""))return;
 const k=e.key.toLowerCase(),code=e.code.toLowerCase();
 if(e.key==="Escape"){e.preventDefault();if(document.documentElement.dataset.gameWindow==="true"){exitGameToWidget();return}if(closeTopPanel())return;doAction("A");return}
 if(["1","2","3","4"].includes(e.key)){e.preventDefault();systemPress(e.key,zHeld);return}
 if(e.code==="Space"){
  e.preventDefault();
  if(phase==="rush"&&e.ctrlKey){const was=zHeld;zHeld=true;doAction("A");zHeld=was;return}
  if(phase==="rush")doAction("B");
  return
 }
 if(k==="c"&&phase==="rush"&&!topPanel){
  if(!e.repeat){setCatAction("duck",0,{hold:true});emitInput("button",{key:"A",semantic:"duck",pressed:true,held:true})}
  keys.add(k);keys.add(code);return
 }
 if(k==="f"){e.preventDefault();doAction("Y");return}
 if(k==="enter"){e.preventDefault();if(topPanel)activateFocused();else doAction("B");return}
 if(code==="numpad5"&&phase!=="kitchen"){e.preventDefault();keys.clear();leftState.active=false;clearCatAction();renderCat();emitInput("holdPosition",{source:"Numpad5"});return}
 if(k==="shift"){
  zHeld=true;
  emitInput("button",{key:"Z",semantic:phase==="kitchen"?"precisionModifier":phase==="rush"?"dash":"huntModifier",pressed:true,held:true});
 }
 keys.add(k);keys.add(code)
});
addEventListener("keyup",e=>{
 const k=e.key.toLowerCase(),code=e.code.toLowerCase();keys.delete(k);keys.delete(code);
 if(k==="shift"){zHeld=false;emitInput("button",{key:"Z",semantic:phase==="kitchen"?"precisionModifier":phase==="rush"?"dash":"huntModifier",pressed:false,held:true})}
 if(k==="c"&&cat.action==="duck"&&cat.actionUntil===Infinity){clearCatAction();renderCat();emitInput("button",{key:"A",semantic:"duck",pressed:false,held:true})}
 if(code==="numpad5"){keys.clear();leftState.active=false;clearCatAction();renderCat()}
});

aim.style.left=aimState.x*100+"%";aim.style.top=aimState.y*100+"%";focus.style.left=focusState.x*100+"%";focus.style.top=focusState.y*100+"%";
annotateSpriteRig();renderCat();updateHud();resetLeft();resetRight();

window.OnyxImperialExpedition={
 get spriteRig(){return activeSpriteRig()},
 get skeleton(){return activeSpriteRig()},
 get anatomyRig(){return activeAnatomyRig()},
 anatomyPartIds,
 legacySvgReference,
 behaviorVariants:onyxBehaviorVariants,
 quadrupedBehaviorNames:[...quadrupedBehaviorNames],
 kitchenBipedalBehaviorNames:[...kitchenBipedalBehaviorNames],
 kitchenBipedalPlaceholders:onyxKitchenBipedalPlaceholders,
 reservedBipedalBehavior,
 getActiveVariant(){return activeOnyxVariant()},
 getBehaviorVariant(name,context=phase){return getOnyxVariant(name,context)},
 getBehaviorVariants(){
  const variants=Object.fromEntries(Object.entries(onyxBehaviorVariants).map(([id,v])=>[id,{id:v.id,name:v.name,behavior:v.behavior,rigType:v.rigType,atlasSource:v.atlasSource,placeholder:false}]));
  Object.values(onyxKitchenBipedalPlaceholders).forEach(v=>{
   variants[v.id]={id:v.id,name:v.name,behavior:v.behavior,context:v.context,rigType:v.rigType,atlasSource:null,placeholder:true,huntVariantId:v.huntVariantId,status:v.status};
  });
  return variants;
 },
 getAnatomyPart(partRef){const part=resolveAnatomyPart(partRef);return part?JSON.parse(JSON.stringify(part)):null},
 getAnatomyState(){const rig=activeAnatomyRig();return rig?JSON.parse(JSON.stringify(rig)):null},
 getRiggingState(){const rig=activeAnatomyRig();return rig?{variant:activeOnyxVariant().id,behavior,pose:cat.pose||"stand",routine:cat.routineName||"",jointMotion:cat.jointMotion||"neutral",tailMotion:cat.tailMotion||"neutral",jointRig:JSON.parse(JSON.stringify(rig.jointRig||{})),tailRig:JSON.parse(JSON.stringify(rig.tailRig||{})),skeleton2D:rig.skeleton2D?JSON.parse(JSON.stringify(rig.skeleton2D)):null,bonePoseLibrary:Object.keys(rig.bonePoseLibrary||{}),poseLibrary:Object.keys(rig.poseLibrary||{}),routineLibrary:Object.keys(rig.routineLibrary||{})}:null},
 getSkeleton2DState(){return getSkeleton2DState()},
 getLegacySvgFrameMap(direction=cat.dir,phaseIndex=Number(spriteCanvas.dataset.phase)||0){return JSON.parse(JSON.stringify(legacyFrameFor(direction,phaseIndex)))},
 getAnatomyFrameMap(direction=cat.dir,phaseIndex=Number(spriteCanvas.dataset.phase)||0){
  const rig=activeAnatomyRig();
  if(!rig?.parts)return {frame:null,parts:{},placeholder:true,variant:activeOnyxVariant().id};
  const frame=legacyFrameFor(direction,phaseIndex),parts={};
  Object.values(rig.parts).forEach(part=>{parts[part.id]={id:part.id,variantPartId:part.variantId||"",owner:activeOnyxVariant().id,key:part.key,name:part.name,side:part.side,domain:part.domain,legacySource:legacySourceForPart(part,frame),legacyPresence:part.legacyPresence,legacySeparation:part.legacySeparation,screenMirrored:!!frame.mirrored}});
  return {frame:JSON.parse(JSON.stringify(frame)),parts};
 },
 setAnatomyPartTuning(partRef,patch={}){return setAnatomyPartTuning(partRef,patch)},
 resetAnatomyPartTuning(partRef){return resetAnatomyPartTuning(partRef)},
 resetAllAnatomyPartTuning(){return resetAllAnatomyPartTuning()},
 applyPose(name,options={}){return applyAnatomyPose(name,options)},
 setSkeletonPose(name,duration=220){const pose=getAnatomyPoseDefinition(name);if(!pose)return null;return applyAnatomyPose(name,{duration,emit:true})},
 playRoutine(nameOrSteps,options={}){return playCatRoutine(nameOrSteps,options)},
 cancelRoutine(){return cancelCatRoutine()},
 jumpForward(distance=.042){return performCatJump("forward",distance)},
 jumpBackward(distance=.035){return performCatJump("backward",distance)},
 performDefaultRoutine(){return playCatRoutine("walkSitLoafCurlStretchWalk")},
 setNavigationObstacles(cells=[]){nav.blocked=new Set(cells.map(c=>c.x+","+c.y));cat.path=[]},
 setNavigationContext(ctx={}){nav.context={...nav.context,...ctx};cat.path=[]},
 setBehavior(name){const variant=activateBehaviorVariant(name);if(variant){cat.path=[];cat.goal=null;clearCatAction();syncAutonomyMode();annotateSpriteRig();renderCat();updateHud()}return variant},
 getAutonomy(name=behavior){return !!autonomyByBehavior[name]},
 getAutonomyMap(){return {...autonomyByBehavior}},
 setAutonomy(name,value){const ok=setBehaviorAutonomy(name,value);updateHud();return ok},
 setMode(name){if(name==="autonomous")setBehaviorAutonomy(behavior,true);else if(name==="direct")setBehaviorAutonomy(behavior,false);syncAutonomyMode();updateHud();return mode===name},
 setSafePoint(value){safePoint=!!value},
 setTraversalState(state="ground"){if(!["ground","climb","ledge"].includes(state))state="ground";cat.traversal=state;if(state==="climb")setCatAction("climb",0,{hold:true});else if(cat.action==="climb")clearCatAction();renderCat()},
 respondToHazard(type){
  if(type==="jump")startCatJump("forward",.06,{duration:500});
  else if(type==="duck")setCatAction("duck",360);
  else if(type==="climb"){cat.traversal="climb";setCatAction("climb",0,{hold:true})}
  else if(type==="drop")setCatAction("drop",320);
  else if(type==="pawTarget")setCatAction("primary",300);
  else if(type==="caution"){cat.cautionUntil=performance.now()+650;setCatAction("caution",420)}
 },
 performCatAction(name,options={}){const rig=activeSpriteRig();if(rig?.sequences?.[name])setCatAction(name,options.duration||actionDuration[name]||360,options)},
 faceVector(x,y){faceVector(+x||0,+y||0)},
 facePoint(x,y){facePoint(clamp(+x||0,0,1),clamp(+y||0,0,1))},
 setCatPosition(x,y){cat.x=clamp(+x||0,.045,.955);cat.y=clamp(+y||0,.11,.93);renderCat()},
 setCouchRestSpot(spot={}){markManualControl(1e12);cancelCatRoutine();cat.path=[];cat.goal=null;cat.vx=cat.vy=0;cat.waitUntil=Number.MAX_SAFE_INTEGER;cat.x=clamp(Number.isFinite(+spot.x)?+spot.x:cat.x,.045,.955);cat.y=clamp(Number.isFinite(+spot.y)?+spot.y:cat.y,.11,.93);if(Number.isFinite(+spot.direction))cat.dir=clamp(Math.floor(+spot.direction),0,5);const action=activeSpriteRig()?.sequences?.[spot.action]?spot.action:"loaf";setCatAction(action,Math.max(120,Number(spot.duration)||actionDuration[action]||900),{hold:spot.hold!==false,dir:cat.dir});cat.pose=poseNameForAction(action)||action;renderCat();return{id:spot.id||"",x:cat.x,y:cat.y,action,dir:cat.dir,held:spot.hold!==false}},
 clearCouchRestSpot(){autonomyState.manualOverrideUntil=performance.now()+1800;cat.waitUntil=0;cat.path=[];cat.goal=null;if(cat.actionUntil===Infinity)clearCatAction();renderCat();return true},
 setSpriteFrame(direction,phaseIndex=0,action="idle"){cat.dir=clamp(Math.floor(+direction||0),0,5);cat.visualAction=spriteAtlasRows[action]!=null?action:"idle";drawSprite(cat.visualAction,cat.dir,phaseIndex)},
 getSpriteAtlasMeta(){return{...spriteAtlasMeta,actions:Object.keys(spriteAtlasRows)}},
 getSpriteState(){const variant=activeOnyxVariant(),rig=variant.spriteRig;if(variant.placeholder||!rig)return{variant:variant.id,behavior:variant.behavior,rigType:variant.rigType,renderer:"placeholder",placeholder:true,frame:null,traversal:cat.traversal,controlContext:phase==="kitchen"?"kitchen":"hunt"};return{variant:variant.id,behavior:variant.behavior,rigType:variant.rigType,renderer:spriteAtlasMeta.renderer,pixelGrid:[spriteAtlasMeta.cell,spriteAtlasMeta.cell],palette:[...spriteAtlasMeta.palette],atlas:{columns:spriteAtlasMeta.columns,rows:spriteAtlasMeta.rows},action:cat.action,visualAction:cat.visualAction,direction:cat.dir,directionName:rig.directions[cat.dir]?.name,frame:spriteCanvas.dataset.frame,traversal:cat.traversal,sourceFrames:[...spriteAtlasMeta.sourceFrames],controlContext:phase==="kitchen"?"kitchen":"hunt",controls:{huntBoard:{leftJoystick:"onyxMovementOrBoardFocus",rightJoystick:"pawAim",A:"cancel",B:"confirm",X:"inspect",Y:"interactGrab",R:"launch",Z:"huntModifier",1:"boosters",2:"imperialPatience",3:"huntOnyxStatus",4:"recipeObjectives"},huntRush:{leftJoystick:"moveOnyx",rightJoystick:"cameraFacing",A:"duck",B:"jump",X:"inspect",Y:"grabInteract",R:"pawPrimaryAction",Z:"dash",1:"boosters",2:"imperialPatience",3:"huntStatus",4:"recipeObjectives"},kitchen:{leftJoystick:"humanMovementOrStationSelection",rightJoystick:"firstPersonCameraHandTool",A:"cancelBackSetDown",B:"confirmPlace",X:"inspectRotateSecondary",Y:"interactPickUpGrab",R:"primaryToolAction",Z:"precisionModifier",1:"ingredients",2:"tools",3:"kitchenOnyxSupervisorStatus",4:"recipeObjectives"}}}},
 getSkeletonState(){return this.getSpriteState()},
 getState(){const variant=activeOnyxVariant();return{mode,phase,controlContext:phase==="kitchen"?"kitchen":"hunt",controlledEntity:phase==="kitchen"?"humanPlayer":"Onyx",onyxControlled:phase!=="kitchen",behavior,spriteVariant:variant.id,rigType:variant.rigType,placeholder:!!variant.placeholder,paused,safePoint,cat:{x:cat.x,y:cat.y,dir:cat.dir,action:cat.action,airborne:cat.airborne,jumpHeight:cat.jumpHeight,jumpPhase:cat.jumpPhase,visualAction:cat.visualAction,pose:cat.pose||"stand",routine:cat.routineName||"",jointMotion:cat.jointMotion||"neutral",tailMotion:cat.tailMotion||"neutral",traversal:cat.traversal,frame:variant.placeholder?null:spriteCanvas.dataset.frame,renderer:variant.placeholder?"placeholder":"pixel-sprite-atlas"},aim:{...aimState},focus:{...focusState}}}
};
Object.values(onyxBehaviorVariants).forEach(variant=>{window[variant.id]=variant});
window.onyx_judgmental_kitchen=onyxJudgmentalKitchenPlaceholder;
window.onyx_hungry_kitchen=onyxHungryKitchenPlaceholder;
window.onyx_purring_kitchen=onyxPurringKitchenPlaceholder;
window.OnyxJudgmentalKitchenPlaceholder=onyxJudgmentalKitchenPlaceholder;
window.OnyxHungryKitchenPlaceholder=onyxHungryKitchenPlaceholder;
window.OnyxPurringKitchenPlaceholder=onyxPurringKitchenPlaceholder;
window.OnyxKitchenBipedalPlaceholders=onyxKitchenBipedalPlaceholders;
window.OnyxKitchenBipedalBehaviorNames=[...kitchenBipedalBehaviorNames];
window.OnyxBehaviorVariants=onyxBehaviorVariants;
window.OnyxBlackCatPalette=onyxBlackCatPalette;
window.OnyxBehaviorChoices=Object.freeze({...onyxBehaviorVariants});
window.OnyxQuadrupedBehaviorNames=[...quadrupedBehaviorNames];
window.OnyxReservedBipedalBehavior=reservedBipedalBehavior;
window.OnyxLegacySvgReference=legacySvgReference;
window.OnyxAnatomyPartIds=anatomyPartIds;
window.OnyxQuadrupedPoseLibrary=quadrupedRigEnhancements.poseLibrary;
window.OnyxQuadrupedRoutineLibrary=quadrupedRigEnhancements.routineLibrary;
window.OnyxQuadrupedJointRig=quadrupedRigEnhancements.joints;
window.OnyxQuadrupedTailRig=quadrupedRigEnhancements.tailRig;
window.OnyxQuadrupedSkeleton2D=quadrupedSkeleton2D;
window.OnyxQuadrupedBonePoseLibrary=quadrupedBonePoseLibrary;
syncGlobalVariantReferences();

window.MEOWQuadrupedBase=window.OnyxImperialExpedition;



})();
