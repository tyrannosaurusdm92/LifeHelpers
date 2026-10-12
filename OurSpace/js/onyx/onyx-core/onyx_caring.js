/* Onyx Caring — Pass 3 of 5
 * Third Caring refinement pass built from the completed Advising / Professor renderer,
 * ONYX_AVATAR_SPRITE_DESCRIPTION, and the retained Onyx project/runtime.
 * Character renderer only: the electric-blue environment remains independently rendered.
 */
(()=>{'use strict';
if(window.OnyxCaring?.pass>=3)return;

const SOURCE=170;
const INTERNAL=85;
const PORTAL_GRID=80;
const CYCLE=7600;
const VERSION='0.3.0';
const PASS=3;

const P={
  ink:'#090B0D',
  fur:'#212121',
  fur2:'#2B2D31',
  fur3:'#404040',
  fur4:'#4F4F4F',
  furCool:'#343A42',
  ear:'#665B5E',
  earShadow:'#443D40',
  eye:'#BDD36B',
  eyeDeep:'#90A94C',
  eyeHi:'#F1F8BF',
  pupil:'#07100A',
  whisker:'#E0E8E5',
  whiskerShade:'#AAB9B6',
  bow:'#448B52',
  bowDark:'#17472F',
  bowLight:'#85C77E',
  bowHi:'#B7D6A7',
  nose:'#5A5154',
  pink:'#E69AB2',
  pinkDeep:'#C96C8C',
  pinkLight:'#F7C7D7',
  pinkHi:'#FFF1F6',
  white:'#FFFDF0'
};

const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const canvas=(w=SOURCE,h=w)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const quantizeMotion=(v,step=.05)=>Math.round((Number(v)||0)/step)*step;
function poly(ctx,pts,fill,stroke=P.ink,lw=1){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
function ellipse(ctx,x,y,rx,ry,fill,stroke=P.ink,lw=1,rotation=0){ctx.beginPath();ctx.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
function line(ctx,x1,y1,x2,y2,color,lw=1){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.lineCap='round';ctx.stroke()}
function rect(ctx,x,y,w,h,fill,stroke=null,lw=1){ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.strokeRect(x,y,w,h)}}
function rounded(ctx,x,y,w,h,r,fill,stroke=P.ink,lw=1){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
function quadShape(ctx,pts,fill,stroke=P.ink,lw=1){ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++){const p=pts[i];if(p.length===4)ctx.quadraticCurveTo(p[0],p[1],p[2],p[3]);else ctx.lineTo(p[0],p[1])}ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
function heart(ctx,x,y,size=1,fill=P.pink,stroke=P.ink,lw=.8){
  ctx.save();ctx.translate(x,y);ctx.scale(size,size);
  poly(ctx,[[0,4],[-6,-2],[-6,-7],[-2,-10],[0,-8],[2,-10],[6,-7],[6,-2]],fill,stroke,lw);
  ctx.restore();
}

function stateAt(time=0,reduced=false){
  // Pass 3 makes Caring read as calm reassurance first: soft direct eye contact, reciprocal slow blink,
  // a small head lean, and a heart-presenting paw. Reduced motion retains the same emotional pose.
  if(reduced)return{breath:0,blink:0,gazeX:0,gazeY:-.06,headTilt:.55,heartScale:1.03,pawLift:-.22,rightPawSettle:-.18,heartFloat:0,earR:0,earL:0,whiskerLift:.10,bow:0,pupilScale:1.02,heartGlow:.42};
  const t=((Number(time)||0)%CYCLE+CYCLE)%CYCLE;
  const breath=quantizeMotion(Math.sin(t/CYCLE*Math.PI*2)*.28,.02);
  let blink=0;
  // Two deliberately slow reciprocal blinks across the full 7.6s loop.
  if((t>=2360&&t<2470)||(t>=5840&&t<5950))blink=1;
  if((t>=2470&&t<2630)||(t>=5950&&t<6110))blink=2;
  if((t>=2630&&t<2750)||(t>=6110&&t<6230))blink=1;
  // Mostly direct eye contact; tiny gaze shifts keep the face alive without looking distracted.
  const gazeX=t>=1180&&t<2240?.08:(t>=4140&&t<5000?-.06:0);
  const gazeY=t>=1180&&t<2240?-.10:(t>=4140&&t<5000?.04:-.04);
  const headTilt=.55+(t>=4140&&t<5000?.30:0);
  // Held-heart pulse is intentionally restrained; the surrounding hearts move even less.
  const heartScale=1.02+Math.max(0,Math.sin((t/CYCLE)*Math.PI*4))*0.045;
  const pawLift=t>=3300&&t<5000?-.62:(t>=5000&&t<5420?-.26:-.12);
  const rightPawSettle=t>=3000&&t<3900?-.42:-.14;
  const heartFloat=Math.sin((t/CYCLE)*Math.PI*2)*.26;
  const earR=t>=6480&&t<6600?-.48:0;
  const earL=t>=6740&&t<6860?.30:0;
  const whiskerLift=t>=3300&&t<5420?.20:.10;
  const bow=quantizeMotion(Math.sin(t/CYCLE*Math.PI*2)*.035,.01);
  const pupilScale=t>=1180&&t<2240?1.035:1.02;
  const heartGlow=.40+Math.max(0,Math.sin((t/CYCLE)*Math.PI*4))*0.16;
  return{breath,blink,gazeX:quantizeMotion(gazeX,.02),gazeY:quantizeMotion(gazeY,.02),headTilt:quantizeMotion(headTilt,.02),heartScale:quantizeMotion(heartScale,.01),pawLift:quantizeMotion(pawLift,.02),rightPawSettle:quantizeMotion(rightPawSettle,.02),heartFloat:quantizeMotion(heartFloat,.02),earR,earL,whiskerLift,bow,pupilScale:quantizeMotion(pupilScale,.005),heartGlow:quantizeMotion(heartGlow,.02)};
}
function drawBase(ctx,s){
  // Caring inherits the Professor face geometry but relaxes the shoulders and broadens the lower silhouette.
  poly(ctx,[[24,80],[24,65],[27,56],[33,51],[38,48],[47,48],[54,51],[60,56],[63,65],[63,80]],P.fur,P.ink,1.3);
  ctx.save();ctx.translate(43,33+s.breath*.12);ctx.rotate((s.headTilt||0)*Math.PI/180);
  quadShape(ctx,[[-21,-3],[-20,-13,-12,-20],[-4,-23],[5,-23],[13,-19],[21,-12,22,-2],[21,8,15,14],[10,18],[3,20],[-5,20],[-12,17],[-18,12,-21,4]],P.fur,P.ink,1.35);
  line(ctx,-11,-17,-5,-19,P.fur3,.8);line(ctx,-2,-20,3,-20,P.fur4,.7);line(ctx,7,-19,12,-16,P.furCool,.75);
  quadShape(ctx,[[-20,2],[-18,9,-12,13],[-7,16],[-1,17],[0,20],[-8,18],[-15,15],[-20,9]],P.fur2,null);
  quadShape(ctx,[[20,2],[18,9,12,13],[7,16],[1,17],[0,20],[8,18],[15,15],[20,9]],P.fur2,null);
  // Cheek-edge pixels keep the black face readable against the blue ring at Portal size.
  line(ctx,-18,7,-12,11,P.fur4,.65);line(ctx,18,7,12,11,P.fur3,.65);
  poly(ctx,[[-20,8],[-23,11],[-18,11]],P.fur2,null);poly(ctx,[[20,8],[23,11],[18,11]],P.fur2,null);
  ctx.restore();
  ellipse(ctx,43,62+s.breath*.20,17.8,15.6,P.fur2,null);
  ellipse(ctx,43,67+s.breath*.20,16.7,14.6,P.fur,null);
  poly(ctx,[[34,55],[38,61],[40,58],[43,68],[46,59],[48,62],[53,55],[51,72],[43,77],[35,72]],P.fur2,null);
  line(ctx,36,56,40,60,P.fur3,.75);line(ctx,50,56,46,60,P.fur4,.68);line(ctx,38,68,43,73,P.fur3,.55);line(ctx,48,68,43,73,P.furCool,.5);line(ctx,34.8,69.5,39,72.6,P.fur4,.38);line(ctx,51.2,69.5,47,72.6,P.fur3,.38);
}
function drawRightEar(ctx,s){poly(ctx,[[22.5,22],[24+s.earR*.38,3.5],[37.5,20]],P.fur,P.ink,1.2);poly(ctx,[[25.8,18.2],[27+s.earR*.25,8],[34.4,18.7]],P.ear,null);poly(ctx,[[28,17.2],[29.1,10.7],[33.3,18]],P.earShadow,null)}
function drawLeftEar(ctx,s){poly(ctx,[[48.5,20],[61+s.earL*.3,3.5],[63.5,22]],P.fur,P.ink,1.2);poly(ctx,[[51.6,18.8],[59+s.earL*.18,8],[60.7,18.2]],P.ear,null);poly(ctx,[[54,18],[58,10.6],[59.4,17]],P.earShadow,null)}
function eyePath(ctx,x,y,blink=0){
  const open=blink===0?3.72:(blink===1?1.25:0);
  if(blink===2){line(ctx,x-5.1,y+.15,x+5.1,y+.15,P.eyeDeep,1.15);line(ctx,x-4.1,y-.38,x+4.1,y-.38,P.fur4,.42);return false}
  ctx.beginPath();ctx.moveTo(x-5.8,y+.05);
  ctx.quadraticCurveTo(x-2.6,y-open,x+.1,y-open*.90);
  ctx.quadraticCurveTo(x+3.0,y-open*.68,x+5.8,y+.04);
  // Slightly fuller lower lid is the main Caring-eye difference from Professor.
  ctx.quadraticCurveTo(x+2.9,y+open*.92,x-.1,y+open*.86);
  ctx.quadraticCurveTo(x-3.0,y+open*.95,x-5.8,y+.05);
  ctx.closePath();ctx.fillStyle=P.eye;ctx.fill();ctx.strokeStyle=P.ink;ctx.lineWidth=1;ctx.stroke();return true;
}
function drawEye(ctx,x,y,s){
  if(!eyePath(ctx,x,y,s.blink))return;
  const ps=s.pupilScale||1;ellipse(ctx,x+s.gazeX,y+s.gazeY,1.04*ps,2.30*ps,P.pupil,null);
  if(s.blink===0){rect(ctx,x-.50+s.gazeX,y-1.70+s.gazeY,.82,.82,P.eyeHi);line(ctx,x-4.45,y-1.25,x-2.35,y-2.32,P.eyeDeep,.40);line(ctx,x-3.5,y+2.15,x+3.25,y+2.35,P.eyeDeep,.28)}
}
function drawRightEye(ctx,s){drawEye(ctx,34.1,31.9,s)}
function drawLeftEye(ctx,s){drawEye(ctx,50.9,31.9,s)}
function drawNose(ctx,s={}){const sig=s.signature||{};if(window.OnyxSignatureParts?.drawNose)return window.OnyxSignatureParts.drawNose(ctx,{x:43,y:41.7,scale:.5*(sig.noseScale||1),nose:P.nose,outline:'#343239'});poly(ctx,[[39.8,40.2],[46.1,40.2],[43,43.1]],P.ink,'#020304',.7);rect(ctx,42,40.2,.9,.8,P.fur4)}
function drawMouth(ctx,s){line(ctx,43,43.2,43,45,P.fur4,.7);line(ctx,43,45,40.6,46.4,P.fur4,.68);line(ctx,43,45,45.4,46.4,P.fur4,.68);if((s.pawLift||0)<-.2){line(ctx,41.4,46.4,39.8,47,P.fur4,.42);line(ctx,44.6,46.4,46.2,47,P.fur4,.42)}}
function drawRightWhiskers(ctx,s={}){const d=s.whiskerLift||0;line(ctx,39,43,18.5,38.2-d,P.whisker,.58);line(ctx,39,44.5,16.5,43.2-d*.5,P.whisker,.58);line(ctx,39,46,18.8,51.2-d*.2,P.whisker,.58);line(ctx,38.6,41.8,21.8,35.3-d,P.whiskerShade,.42);line(ctx,38.8,47.2,22.4,55-d*.2,P.whiskerShade,.38)}
function drawLeftWhiskers(ctx,s={}){const d=s.whiskerLift||0;line(ctx,47,43,67.5,38.2-d,P.whisker,.58);line(ctx,47,44.5,69.5,43.2-d*.5,P.whisker,.58);line(ctx,47,46,67.2,51.2-d*.2,P.whisker,.58);line(ctx,47.4,41.8,64.2,35.3-d,P.whiskerShade,.42);line(ctx,47.2,47.2,63.6,55-d*.2,P.whiskerShade,.38)}
function drawNeck(ctx){ellipse(ctx,43,50,12,6,P.fur2,null)}
function drawChest(ctx){poly(ctx,[[35,48],[43,51],[51,48],[50,60],[43,64],[36,60]],P.fur2,null);line(ctx,38,50,43,54,P.fur4,.7);line(ctx,48,50,43,54,P.fur4,.7);line(ctx,39,58,43,61,P.fur3,.6);line(ctx,47,58,43,61,P.fur3,.6)}
function drawBowtie(ctx,s={}){const sig=s.signature||{};if(window.OnyxSignatureParts?.drawBowtie)return window.OnyxSignatureParts.drawBowtie(ctx,{x:43,y:54,scale:.5*(sig.bowtieScale||1),rotation:s.bow||0,tie:P.bow,tieDark:P.bowDark,tieLight:P.bowLight,outline:'#102f22',plaidStrength:sig.plaidStrength??.88});poly(ctx,[[30,52],[39,49],[43,53],[39,60],[30,57]],P.bow,P.ink,1);poly(ctx,[[56,52],[47,49],[43,53],[47,60],[56,57]],P.bow,P.ink,1);rounded(ctx,40,51,6,8,1.4,P.bowLight,P.ink,.8);for(const x of [33,37,49,53])line(ctx,x,51,x+1.3,58,P.bowDark,.66);line(ctx,31,54,40,54,P.bowHi,.58);line(ctx,46,54,55,54,P.bowHi,.58)}
function drawRightArm(ctx,s={}){
  // Onyx's right paw (viewer left) rests near his chest/bowtie as a quiet reassurance gesture.
  const d=s.rightPawSettle||0;
  poly(ctx,[[29,57],[24,59],[27,65.5+d],[33,67.2+d],[37,61.5],[34,58]],P.fur2,P.ink,1);
  line(ctx,28,62+d,34,64+d,P.fur3,.56);
}
function drawRightPaw(ctx,s={}){
  const d=s.rightPawSettle||0;
  ellipse(ctx,34.6,61.6+d,6.1,5.4,P.fur,P.ink,.9);
  ellipse(ctx,31.2,60.7+d,1.8,1.7,P.fur2,null);ellipse(ctx,34.1,59.7+d,1.9,1.8,P.fur2,null);ellipse(ctx,36.8,60.8+d,1.7,1.6,P.fur2,null);
  line(ctx,31,64+d,36.6,63.2+d,P.fur3,.45);
}
function drawLeftArm(ctx,s){
  // Onyx's left arm presents the heart forward instead of hanging beside it.
  const d=s.pawLift||0;
  poly(ctx,[[55,59],[60,58+d],[67,62+d],[70,69+d],[65,76+d],[58,72+d],[54,66]],P.fur2,P.ink,1);
  line(ctx,59,64+d,66,68+d,P.fur3,.56);
}
function drawLeftPaw(ctx,s){
  const d=s.pawLift||0;
  ellipse(ctx,64.2,70.6+d,7.9,6.7,P.fur,P.ink,1);
  ellipse(ctx,60.8,68.7+d,2.3,2.2,P.fur2,null);ellipse(ctx,64.7,67.1+d,2.5,2.25,P.fur2,null);ellipse(ctx,68.6,68.5+d,2.3,2.15,P.fur2,null);
  // Palm line under the heart makes the contact legible at 80-cell Portal resolution.
  line(ctx,60.8,72+d,68.8,71.2+d,P.fur3,.54);
}
function drawHeartHold(ctx,s){
  ctx.save();ctx.translate(58.6,63.8+s.pawLift*.72+s.heartFloat*.14);ctx.scale(s.heartScale||1,s.heartScale||1);
  ctx.globalAlpha=s.heartGlow||.42;heart(ctx,0,.4,1.52,P.pinkLight,null);ctx.globalAlpha=1;
  heart(ctx,0,0,1.30,P.pink,P.ink,.9);heart(ctx,0,0,.88,P.pinkLight,null);rect(ctx,-1.1,-4.0,2.0,2.0,P.pinkHi,null);
  ctx.restore();
}
function drawFloatHeartRight(ctx,s){ctx.save();ctx.translate(57,16+s.heartFloat*.55);ctx.scale(.64,.64);heart(ctx,0,0,1,P.pinkLight,P.ink,.72);ctx.restore()}
function drawFloatHeartLeft(ctx,s){ctx.save();ctx.translate(19,20-s.heartFloat*.44);ctx.scale(.56,.56);heart(ctx,0,0,1,P.pink,P.ink,.68);ctx.restore()}
function drawFloatHeartSide(ctx,s){ctx.save();ctx.translate(69,35+s.heartFloat*.34);ctx.scale(.46,.46);heart(ctx,0,0,1,P.pinkDeep,P.ink,.64);ctx.restore()}
function drawLayer(ctx,key,s){switch(key){
  case'caring-base-silhouette':return drawBase(ctx,s);
  case'right-ear':return drawRightEar(ctx,s);
  case'left-ear':return drawLeftEar(ctx,s);
  case'right-eye':return drawRightEye(ctx,s);
  case'left-eye':return drawLeftEye(ctx,s);
  case'nose':return drawNose(ctx,s);
  case'mouth':return drawMouth(ctx,s);
  case'right-whiskers':return drawRightWhiskers(ctx,s);
  case'left-whiskers':return drawLeftWhiskers(ctx,s);
  case'neck':return drawNeck(ctx);
  case'chest':return drawChest(ctx);
  case'right-front-arm':return drawRightArm(ctx,s);
  case'left-front-arm':return drawLeftArm(ctx,s);
  case'right-front-paw':return drawRightPaw(ctx,s);
  case'left-front-paw':return drawLeftPaw(ctx,s);
  case'heart-hold':return drawHeartHold(ctx,s);
  case'heart-left':return drawFloatHeartLeft(ctx,s);
  case'heart-right':return drawFloatHeartRight(ctx,s);
  case'heart-side':return drawFloatHeartSide(ctx,s);
  case'bowtie':return drawBowtie(ctx,s);
 }}

const LAYERS=[
 ['heart-left','Heart Left','effect',1],
 ['heart-right','Heart Right','effect',1],
 ['heart-side','Heart Side','effect',1],
 ['caring-base-silhouette','Caring Base Silhouette','body',2],
 ['right-ear','Right Ear','head',3],['left-ear','Left Ear','head',3],
 ['neck','Neck','body',4],['chest','Chest','body',5],
 ['right-front-arm','Right Front Arm','body',6],['left-front-arm','Left Front Arm','body',7],
 ['heart-hold','Held Heart','prop',8],['bowtie','Bowtie','wearables',9],
 ['right-eye','Right Eye','head',10],['left-eye','Left Eye','head',10],
 ['nose','Nose','head',11],['mouth','Mouth','head',11],
 ['right-whiskers','Right Whiskers','head',12],['left-whiskers','Left Whiskers','head',12],
 ['right-front-paw','Right Front Paw','body',13],['left-front-paw','Left Front Paw','body',14]
];

const PIVOTS={
 'right-ear':{x:60,y:42},'left-ear':{x:106,y:42},'right-eye':{x:68,y:64},'left-eye':{x:102,y:64},
 'right-whiskers':{x:78,y:88},'left-whiskers':{x:94,y:88},'right-front-arm':{x:58,y:106},'left-front-arm':{x:112,y:104},
 'right-front-paw':{x:68,y:124},'left-front-paw':{x:130,y:140},'heart-hold':{x:118,y:129},'bowtie':{x:86,y:107},'neck':{x:86,y:94},'chest':{x:86,y:104}
};

function rasterLayer(key,{time=0,reducedMotion=true,size=SOURCE,blinkOverride=null,gazeOverride=null,signatureSettings={}}={}){
  const small=canvas(INTERNAL),ctx=small.getContext('2d');ctx.imageSmoothingEnabled=false;
  const s=stateAt(time,reducedMotion);
  if(blinkOverride!=null)s.blink=blinkOverride;
  if(gazeOverride){s.gazeX=gazeOverride.x||0;s.gazeY=gazeOverride.y||0}
  s.signature=window.OnyxSignatureParts?.normalizeSettings?.({noseScale:1,bowtieScale:.86,plaidStrength:.88,...signatureSettings})||{noseScale:1,bowtieScale:.86,plaidStrength:.88};
  drawLayer(ctx,key,s);
  const out=canvas(size),x=out.getContext('2d');x.imageSmoothingEnabled=false;x.clearRect(0,0,size,size);x.drawImage(small,0,0,size,size);return out;
}
const dataCache=new Map();
function layerData(key,variant='base'){
  const ck=key+'|'+variant;if(dataCache.has(ck))return dataCache.get(ck);
  let blink=null,gaze=null;if(variant==='half')blink=1;if(variant==='closed')blink=2;if(variant==='soft')gaze={x:.18,y:-.08};
  const src=rasterLayer(key,{reducedMotion:true,blinkOverride:blink,gazeOverride:gaze}).toDataURL('image/png');dataCache.set(ck,src);return src;
}
function eyeVariants(key){return['base','soft','half','closed'].map(name=>({id:`${key}-${name}`,name:`${key} ${name}`,src:layerData(key,name),naturalSize:[SOURCE,SOURCE],sourceBounds:{x:0,y:0,width:SOURCE,height:SOURCE}}))}
function animationFor(partKey){
  if(/eye$/.test(partKey))return{keyframes:[
    {id:`${partKey}-k0`,time:0,variantId:`${partKey}-base`},
    {id:`${partKey}-k1`,time:1180,variantId:`${partKey}-soft`},
    {id:`${partKey}-k2`,time:2240,variantId:`${partKey}-base`},
    {id:`${partKey}-k3`,time:2360,variantId:`${partKey}-half`},
    {id:`${partKey}-k4`,time:2470,variantId:`${partKey}-closed`},
    {id:`${partKey}-k5`,time:2630,variantId:`${partKey}-closed`},
    {id:`${partKey}-k6`,time:2750,variantId:`${partKey}-base`},
    {id:`${partKey}-k7`,time:5840,variantId:`${partKey}-half`},
    {id:`${partKey}-k8`,time:5950,variantId:`${partKey}-closed`},
    {id:`${partKey}-k9`,time:6110,variantId:`${partKey}-closed`},
    {id:`${partKey}-k10`,time:6230,variantId:`${partKey}-base`},
    {id:`${partKey}-k11`,time:CYCLE,variantId:`${partKey}-base`}
  ]};
  if(partKey==='heart-hold')return{keyframes:[
    {id:'heart-k0',time:0,scaleX:1.02,scaleY:1.02},
    {id:'heart-k1',time:1900,scaleX:1.055,scaleY:1.055},
    {id:'heart-k2',time:3800,scaleX:1.02,scaleY:1.02},
    {id:'heart-k3',time:5700,scaleX:1.055,scaleY:1.055},
    {id:'heart-k4',time:CYCLE,scaleX:1.02,scaleY:1.02}
  ]};
  if(partKey==='right-front-arm'||partKey==='right-front-paw')return{keyframes:[
    {id:`${partKey}-k0`,time:0,y:0},{id:`${partKey}-k1`,time:3000,y:-.42},{id:`${partKey}-k2`,time:3900,y:-.42},{id:`${partKey}-k3`,time:5420,y:-.14},{id:`${partKey}-k4`,time:CYCLE,y:0}
  ]};
  if(partKey==='left-front-arm'||partKey==='left-front-paw')return{keyframes:[
    {id:`${partKey}-k0`,time:0,y:0},{id:`${partKey}-k1`,time:3300,y:-.62},{id:`${partKey}-k2`,time:5000,y:-.62},{id:`${partKey}-k3`,time:5420,y:-.26},{id:`${partKey}-k4`,time:CYCLE,y:0}
  ]};
  if(partKey==='heart-left'||partKey==='heart-right'||partKey==='heart-side')return{keyframes:[
    {id:`${partKey}-k0`,time:0,y:0,opacity:.82},{id:`${partKey}-k1`,time:CYCLE/2,y:-.45,opacity:.94},{id:`${partKey}-k2`,time:CYCLE,y:0,opacity:.82}
  ]};
  if(partKey==='right-ear')return{keyframes:[{id:'rear-k0',time:0,rotation:0},{id:'rear-k1',time:6480,rotation:-.48},{id:'rear-k2',time:6600,rotation:0},{id:'rear-k3',time:CYCLE,rotation:0}]};
  if(partKey==='left-ear')return{keyframes:[{id:'lear-k0',time:0,rotation:0},{id:'lear-k1',time:6740,rotation:.30},{id:'lear-k2',time:6860,rotation:0},{id:'lear-k3',time:CYCLE,rotation:0}]};
  return{keyframes:[]};
}
function partDef([partKey,name,category,z]){
  const variants=/eye$/.test(partKey)?eyeVariants(partKey):[];
  const pivot=PIVOTS[partKey]||{x:85,y:85};
  const semanticRole=/eye$/.test(partKey)?'eye':/whisker/.test(partKey)?'whisker':partKey==='bowtie'?'bowtie':/heart/.test(partKey)?'prop':/ear/.test(partKey)?'ear':/paw/.test(partKey)?'paw':category==='body'?'fur':category;
  const pixelPriority=['right-eye','left-eye','right-whiskers','left-whiskers','bowtie','heart-hold','left-front-paw','nose'].includes(partKey)?'critical':'normal';
  return{
    instanceId:`caring-pass3-${partKey}`,
    masterId:`coded-caring-${partKey}`,
    sourceIdentity:`coded:onyx_caring:${partKey}`,
    partKey,category,name,semanticRole,pixelPriority,identityAnchor:pixelPriority==='critical',
    masterVersionId:'pass3-v3',masterVersionNumber:3,
    variantId:variants[0]?.id||null,availableVariants:variants,availableVersions:[],
    artwork:{src:layerData(partKey,'base'),naturalSize:[SOURCE,SOURCE],sourceBounds:{x:0,y:0,width:SOURCE,height:SOURCE},transparent:true},
    transform:{x:0,y:0,scaleX:1,scaleY:1,rotation:0,flipX:false,flipY:false,pivot:clone(pivot)},
    opacity:1,visible:true,z,animation:animationFor(partKey)
  };
}

function caringRig(){
  const joints=[
    {id:'care-head',name:'Head',x:85,y:64},{id:'care-neck',name:'Neck',x:85,y:94},
    {id:'care-r-shoulder',name:'Right Shoulder',x:58,y:104},{id:'care-r-wrist',name:'Right Wrist',x:66,y:120},{id:'care-r-paw',name:'Right Chest Paw',x:68,y:124},
    {id:'care-l-shoulder',name:'Left Shoulder',x:112,y:104},{id:'care-l-wrist',name:'Left Wrist',x:126,y:132},{id:'care-l-paw',name:'Left Offering Paw',x:130,y:140},
    {id:'care-heart',name:'Heart Center',x:118,y:129}
  ];
  const edges=[
    {id:'care-neck-head',a:'care-neck',b:'care-head',curve:{offset:0,weight:.5,wave:0},pathMode:'straight'},
    {id:'care-r-upper',a:'care-neck',b:'care-r-shoulder',curve:{offset:-2.5,weight:.5,wave:0},pathMode:'curved'},
    {id:'care-r-fore',a:'care-r-shoulder',b:'care-r-wrist',curve:{offset:-2,weight:.5,wave:0},pathMode:'curved'},
    {id:'care-r-paw-bone',a:'care-r-wrist',b:'care-r-paw',curve:{offset:1,weight:.5,wave:0},pathMode:'curved'},
    {id:'care-l-upper',a:'care-neck',b:'care-l-shoulder',curve:{offset:3,weight:.5,wave:0},pathMode:'curved'},
    {id:'care-l-fore',a:'care-l-shoulder',b:'care-l-wrist',curve:{offset:4,weight:.5,wave:0},pathMode:'curved'},
    {id:'care-l-paw-bone',a:'care-l-wrist',b:'care-l-paw',curve:{offset:-2,weight:.5,wave:0},pathMode:'curved'},
    {id:'care-heart-link',a:'care-l-paw',b:'care-heart',curve:{offset:-1,weight:.5,wave:0},pathMode:'curved'}
  ];
  const byId=id=>joints.find(j=>j.id===id),edgeById=id=>edges.find(e=>e.id===id);
  const boneRest=id=>{const e=edgeById(id),a=byId(e.a),b=byId(e.b),dx=b.x-a.x,dy=b.y-a.y;return{angle:Math.atan2(dy,dx)*180/Math.PI,length:Math.hypot(dx,dy),mid:{x:(a.x+b.x)/2,y:(a.y+b.y)/2}}};
  const bindJoint=(id,targetId,jointId,weight=1)=>({id,targetType:'instance',targetId,memberInstanceIds:[],fallbackToMembers:true,mode:'joint',jointId,boneId:null,weight,scaleWithBone:false,rest:{joint:{x:byId(jointId).x,y:byId(jointId).y},bone:null,target:null}});
  const bindBone=(id,targetId,boneId,weight=1,scaleWithBone=true)=>({id,targetType:'instance',targetId,memberInstanceIds:[],fallbackToMembers:true,mode:'bone',jointId:null,boneId,weight,scaleWithBone,rest:{joint:null,bone:boneRest(boneId),target:null}});
  const bindings=[
    bindBone('bind-care-r-arm','caring-pass3-right-front-arm','care-r-fore',.50,false),
    bindJoint('bind-care-r-paw','caring-pass3-right-front-paw','care-r-paw',.68),
    bindBone('bind-care-l-arm','caring-pass3-left-front-arm','care-l-fore',.66,false),
    bindJoint('bind-care-l-paw','caring-pass3-left-front-paw','care-l-paw',.88),
    bindJoint('bind-care-heart','caring-pass3-heart-hold','care-heart',.92),
    bindJoint('bind-care-bowtie','caring-pass3-bowtie','care-neck',.34)
  ];
  const frame=(id,time,patch={},edgePatch={})=>({id,time,transform:{x:0,y:0,rotation:0,scaleX:1,scaleY:1},joints:joints.map(j=>patch[j.id]?{...j,...patch[j.id]}:clone(j)),edges:edges.map(e=>({id:e.id,curve:{...clone(e.curve),...(edgePatch[e.id]||{})}}))});
  return{
    schema:'onyx.bubble-rig/v2',version:2,id:'caring-pass3-rig',name:'Caring Two-Paw Reassurance Rig — Pass 3',joints,edges,bindings,
    instanceIds:[...new Set(bindings.map(b=>b.targetId))],groupIds:[],transform:{x:0,y:0,rotation:0,scaleX:1,scaleY:1},
    animation:{keyframes:[
      frame('care-p3-k0',0),
      frame('care-p3-k1',3000,{'care-r-wrist':{x:66.2,y:119.4},'care-r-paw':{x:68.3,y:123.2}},{'care-r-fore':{offset:-2.35}}),
      frame('care-p3-k2',3300,{'care-l-wrist':{x:126.0,y:131.1},'care-l-paw':{x:129.9,y:138.8},'care-heart':{x:117.6,y:127.8}},{'care-l-fore':{offset:4.45},'care-heart-link':{offset:-1.55}}),
      frame('care-p3-k3',5000,{'care-l-wrist':{x:126.0,y:131.1},'care-l-paw':{x:129.9,y:138.8},'care-heart':{x:117.6,y:127.8}},{'care-l-fore':{offset:4.45},'care-heart-link':{offset:-1.55}}),
      frame('care-p3-k4',5420,{'care-r-wrist':{x:66,y:120},'care-r-paw':{x:68,y:124},'care-l-wrist':{x:126,y:132},'care-l-paw':{x:130,y:140},'care-heart':{x:118,y:129}}),
      frame('care-p3-k5',CYCLE)
    ]},
    visible:true,overlayVisible:true,enabled:true,locked:false,savedLayer:true,
    ancestry:{from:'caring-pass1-rig',completedPasses:3,pass:PASS},savedAt:'coded-pass3-caring',pass:'caring-3'
  };
}
function presentation(){
  return window.OnyxSpritePresentation?.resolve?.({behavior:{id:2,name:'Caring',portalAssignments:[2]},presentation:{mood:'caring'}})||{mood:'caring',idle:{profile:'affection',cycleMs:CYCLE},transition:{enter:'heart-soften',duration:380,easing:'ease-in-out'},environment:{attachToSprite:false}};
}
function behaviorDefinition(base={}){
  const parts=LAYERS.map(partDef),rig=caringRig(),p=presentation();
  const identityRoles=['eye','whisker','bowtie','paw','prop'];
  return{
    schema:'onyx-behavior/v9',protocol:'onyx-sprite-hooks/v1',logicalSize:[SOURCE,SOURCE],transparent:true,
    behavior:{id:base.behavior?.id||2,name:base.behavior?.name||'Caring',animation:{duration:CYCLE,loopMode:'loop',speed:100,easing:'ease-in-out',...(base.behavior?.animation||{})},portalAssignments:base.behavior?.portalAssignments?.length?base.behavior.portalAssignments:[2]},
    presentation:{...p,mood:'caring',environment:{...(p.environment||{}),attachToSprite:false,preserveAcrossCharacterStateChanges:true}},
    animations:{
      'caring-pass3-main':{duration:CYCLE,loopMode:'loop',speed:100,easing:'ease-in-out',phases:[
        {id:'soft-direct-gaze',start:1180,end:2240},{id:'reciprocal-slow-blink-a',start:2360,end:2750},
        {id:'chest-paw-settle',start:3000,end:3900},{id:'heart-offer',start:3300,end:5420},
        {id:'reciprocal-slow-blink-b',start:5840,end:6230},{id:'ear-check',start:6480,end:6860}
      ]},
      'caring-pass3-stillness':{duration:9800,loopMode:'loop',speed:100,easing:'ease-in-out',phases:[
        {id:'quiet-presence',start:0,end:9800},{id:'single-slow-blink',start:4720,end:5140}
      ]},
      'caring-pass3-heart-response':{duration:1180,loopMode:'once',speed:100,easing:'ease-out',phases:[{id:'heart-warmth',start:0,end:1180}]}
    },
    parts,groups:[],rigs:[rig],
    poses:[{id:'caring-pass3-pose',name:'Caring Front Hold — Pass 3',parts:parts.map(x=>({instanceId:x.instanceId,transform:clone(x.transform),opacity:1,visible:true,z:x.z,variantId:x.variantId})),groups:[],rigs:[clone(rig)]}],
    states:[{id:'caring-pass3-state',name:'Caring',kind:'mood',poseId:'caring-pass3-pose',primaryLoop:'caring-pass3-main',alternateIdle:'caring-pass3-stillness',reaction:'caring-pass3-heart-response',fallbackIdle:'caring-pass3-state',preserveEnvironment:true}],
    transitions:[{id:'caring-pass3-enter',fromStateId:'*',toStateId:'caring-pass3-state',duration:400,easing:'ease-in-out',interpolateParts:true,interpolateRig:true,interpolateBoneCurves:true,preserveEnvironment:true,semanticPlan:{blinkBridge:'half',heartPulse:true,pawEase:'rounded',twoPawReassurance:true,softEyeContact:true,heartPawContact:true}}],
    stateMachine:{activeStateId:'caring-pass3-state',defaultStateId:'caring-pass3-state'},
    environmentModel:{previewMode:'combined',preserveAcrossStateChanges:true,characterPartIds:parts.map(x=>x.instanceId),environmentPartIds:[]},
    character:{partInstanceIds:parts.map(x=>x.instanceId),rigIds:[rig.id],poseIds:['caring-pass3-pose'],stateIds:['caring-pass3-state'],transitionIds:['caring-pass3-enter']},
    environment:{partInstanceIds:[],separate:true,attachToSprite:false},
    render:{authoringSize:[SOURCE,SOURCE],internalGrid:[INTERNAL,INTERNAL],portalSize:[160,160],portalPixelGrid:[PORTAL_GRID,PORTAL_GRID],characterEnvironmentSeparate:true,pixelPerfectPortal:true,internalFirstComposition:true},
    digitization:{pixelGrid:true,nearestNeighbor:true,crispAlpha:true,seamReduction:true,silhouetteCleanup:true,speckleCleanup:true,dither:false,ditherAmount:.04,outline:true,outlineColor:P.ink,paletteConsolidation:true,colorLevels:18,paletteSize:18,pixelDensity:2,portalPixelGrid:PORTAL_GRID,edgeIntegration:true,unifiedSampling:true,lockAnimationPalette:true,pixelMotionSnap:true,pixelMotionQuantum:.5,semanticPreserve:true,microIdle:true,semanticPriorityRoles:identityRoles,furToneGuard:true,furToneStrength:.92,temporalStability:true,temporalRawThreshold:20,temporalMaxHold:2,clusterStability:true,clusterMaxCells:12,clusterRawThreshold:24,frameRate:12,...(base.digitization||{})},
    avatarImplementation:{
      id:'onyx_caring',version:VERSION,pass:PASS,source:'coded-canvas',environmentAttached:false,wasmRequired:false,
      referencePolicy:'ONYX_AVATAR_SPRITE_DESCRIPTION + completed professor renderer + supplied real Onyx photo archive + retained Caring fallback; PNG remains runtime-only failure fallback',
      pixelStrategy:'85-cell internal-first composition; 80-cell portal grid; exact 2x nearest-neighbor at 160px',
      identityAnchors:['soft green-gold almond eyes','pale whisker groups','green plaid bowtie','dark feline nose','right paw settled at chest','left paw physically supporting larger pink heart','three restrained floating hearts','reciprocal slow-blink eye contact'],
      safeZonePriority:['eyes','nose','whisker-roots','bowtie-knot','held-heart','offering-paw','chest-paw'],
      completion:{passes:3,complete:false,exportReady:false,canonicalState:'onyx_caring',canonicalMood:'caring'},
      runtimeContract:{characterOnlyRenderer:true,environmentOwnedByHost:true,preferredCoreArtSize:72,portalSize:160,reducedMotionSupported:true,fallback:'https://raw.githubusercontent.com/tyrannosaurusdm92/LifeHelpers/main/OurSpace/assets/images/shared/legacy-static/onyx_caring.png'},
      inheritanceBaseFor:['onyx_hungry','onyx_listening','onyx_purring','onyx_sleepy']
    }
  };
}
function enhanceCompiled(def={}){const mood=window.OnyxSpritePresentation?.inferMood?.(def)||def?.presentation?.mood;const empty=!(def.parts||[]).some(p=>p?.visible!==false);if(mood!=='caring'||!empty)return def;const built=behaviorDefinition(def);const name=def.behavior?.name&&def.behavior.name!=='Behavior 02'?def.behavior.name:'Caring';return{...def,...built,behavior:{...built.behavior,...(def.behavior||{}),name,animation:{...built.behavior.animation,...(def.behavior?.animation||{}),duration:CYCLE}},presentation:{...built.presentation,...(def.presentation||{}),mood:'caring',environment:{...built.presentation.environment,...(def.presentation?.environment||{}),attachToSprite:false}},digitization:{...built.digitization,...(def.digitization||{})},avatarImplementation:built.avatarImplementation};}

function composeInternal({time=0,reducedMotion=false,signatureSettings={}}={}){const surface=canvas(INTERNAL),ctx=surface.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,INTERNAL,INTERNAL);const s=stateAt(time,reducedMotion);s.signature=window.OnyxSignatureParts?.normalizeSettings?.({noseScale:1,bowtieScale:.86,plaidStrength:.88,...signatureSettings})||{noseScale:1,bowtieScale:.86,plaidStrength:.88};for(const layer of LAYERS)drawLayer(ctx,layer[0],s);return{surface,state:s}}
function crispAlpha(surface,threshold=92){const ctx=surface.getContext('2d'),img=ctx.getImageData(0,0,surface.width,surface.height),d=img.data;for(let i=0;i<d.length;i+=4){if(d[i+3]===0)continue;d[i+3]=d[i+3]<threshold?0:255}ctx.putImageData(img,0,0);return surface}
async function render(canvasEl,{time=0,reducedMotion=false,size=null,pixelize=false,signatureSettings={}}={}){const def=behaviorDefinition(),target=canvasEl||canvas(size||SOURCE),outputSize=size||target.width||SOURCE;target.width=outputSize;target.height=outputSize;const {surface}=composeInternal({time,reducedMotion,signatureSettings}),x=target.getContext('2d');x.imageSmoothingEnabled=false;x.clearRect(0,0,outputSize,outputSize);if(outputSize===160){const grid=canvas(PORTAL_GRID),g=grid.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,PORTAL_GRID,PORTAL_GRID);g.drawImage(surface,0,0,PORTAL_GRID,PORTAL_GRID);crispAlpha(grid,92);x.drawImage(grid,0,0,160,160)}else if(outputSize===SOURCE){x.drawImage(surface,0,0,SOURCE,SOURCE)}else{x.drawImage(surface,0,0,outputSize,outputSize)}if(target.dataset){target.dataset.onyxCaringPass=String(PASS);if(outputSize===160){target.dataset.onyxCaringPortal='true';target.dataset.onyxCaringPortalGrid=String(PORTAL_GRID);target.dataset.onyxCaringInternalFirst='true'}}if(pixelize&&window.OnyxSpritePixelizer)return window.OnyxSpritePixelizer.process(target,target,def.digitization);return target}
async function renderPortal(canvasEl,{time=0,reducedMotion=false,pixelize=false,signatureSettings={}}={}){return render(canvasEl,{time,reducedMotion,size:160,pixelize,signatureSettings})}
function renderToContext(targetCtx,{time=0,reducedMotion=false,x=0,y=0,width=72,height=72,signatureSettings={}}={}){if(!targetCtx)return false;const composed=composeInternal({time,reducedMotion,signatureSettings});targetCtx.save();targetCtx.imageSmoothingEnabled=false;targetCtx.drawImage(composed.surface,x,y,width,height);targetCtx.restore();return true}
function exportRuntimeContract(){return Object.freeze({schema:'onyx.export-avatar-state/v1',canonicalState:'onyx_caring',mood:'caring',complete:false,passes:3,characterOnly:true,environmentSeparate:true,environmentAttached:false,authoringSize:[SOURCE,SOURCE],internalGrid:[INTERNAL,INTERNAL],portalSize:[160,160],portalGrid:[PORTAL_GRID,PORTAL_GRID],fallback:'https://raw.githubusercontent.com/tyrannosaurusdm92/LifeHelpers/main/OurSpace/assets/images/shared/legacy-static/onyx_caring.png',wasmRequired:false,reducedMotion:true})}
function buildMasterParts(){return LAYERS.map(([partKey,name,category,z])=>{const pivot=PIVOTS[partKey]||{x:85,y:85};const variants=/eye$/.test(partKey)?eyeVariants(partKey):[];return{id:`coded-caring-${partKey}`,name,src:layerData(partKey,'base'),z,meta:{category,partKey,sourceIdentity:`coded:onyx_caring:${partKey}`,sourceBounds:{x:0,y:0,width:SOURCE,height:SOURCE},naturalSize:[SOURCE,SOURCE],sourceDimensions:[SOURCE,SOURCE],logicalSource:[SOURCE,SOURCE],transparent:true,naturalPivot:clone(pivot),versions:[{id:'pass3-v3',number:3,label:`${name} — Caring Pass 3`,savedAt:'coded-pass3-caring',src:layerData(partKey,'base'),sourceBounds:{x:0,y:0,width:SOURCE,height:SOURCE},naturalSize:[SOURCE,SOURCE],naturalPivot:clone(pivot),category,partKey}],currentVersionId:'pass3-v3',currentVersionNumber:2,variants}}})}
function installMasters({replace=false}={}){const bridge=window.StudioPortalBridge;if(!bridge)return{installed:0,reason:'StudioPortalBridge unavailable'};const existing=bridge.getState?.().objects||[];let installed=0;for(const part of buildMasterParts()){const found=existing.find(o=>o.meta?.sourceIdentity===part.meta.sourceIdentity||o.meta?.partKey===part.meta.partKey);if(found&&!replace)continue;if(found){const priorVersions=Array.isArray(found.meta?.versions)?found.meta.versions:[];const versions=[...priorVersions.filter(v=>v.id!=='pass3-v3'),...part.meta.versions];bridge.updateObject(found.id,{...found,...part,id:found.id,meta:{...(found.meta||{}),...part.meta,versions,sourceIdentity:found.meta?.sourceIdentity||part.meta.sourceIdentity}});installed++}else{const created=bridge.addObject(part.src,part.name);if(created){bridge.updateObject(created.id,{...created,name:part.name,src:part.src,z:part.z,meta:{...(created.meta||{}),...part.meta,sourceIdentity:`master:${created.id}`}});installed++}}}return{installed,total:LAYERS.length,pass:PASS}}
function audit(){
  const def=behaviorDefinition(),required=['right-eye','left-eye','right-ear','left-ear','right-whiskers','left-whiskers','bowtie','heart-hold','right-front-paw','left-front-paw','heart-side'],have=new Set(def.parts.map(p=>p.partKey));
  const rig=def.rigs[0],boneBindings=(rig.bindings||[]).filter(b=>b.mode==='bone').length;
  return{schema:'onyx.caring-pass3-audit/v1',ok:required.every(x=>have.has(x))&&def.presentation?.environment?.attachToSprite===false&&boneBindings>=2,version:VERSION,pass:PASS,partCount:def.parts.length,rigCount:def.rigs.length,poseCount:def.poses.length,stateCount:def.states.length,transitionCount:def.transitions.length,portalGrid:def.render?.portalPixelGrid||[PORTAL_GRID,PORTAL_GRID],internalGrid:def.render?.internalGrid||[INTERNAL,INTERNAL],criticalPartCount:def.parts.filter(p=>p.pixelPriority==='critical').length,bindingCount:rig.bindings.length,boneBindingCount:boneBindings,identityAnchors:required,missing:required.filter(x=>!have.has(x)),environmentAttached:false,wasmRequired:false,refinements:['pass07-foundation-preserved','real-photo-green-gold-eye-proportions','softer-lower-lid-readability','reciprocal-slow-blink','slower-breathing','subtle-held-heart-aura','heart-paw-contact-tightened','right-paw-settled-at-chest','two-arm-functional-rig','two-bone-bindings','reduced-bowtie-dominance','shared-signature-parts-preserved','reduced-motion-caring-expression','independent-host-environment','portal-slot-2-latest-renderer','80-cell-heart-and-whisker-readability']};
}
function init(){document.documentElement.dataset.onyxCaringPass=String(PASS);window.dispatchEvent(new CustomEvent('onyx:caring-ready',{detail:audit()}))}
window.OnyxCaring=Object.freeze({version:VERSION,pass:PASS,mood:'caring',logicalSize:[SOURCE,SOURCE],portalSize:[160,160],palette:clone(P),layers:clone(LAYERS),render,renderPortal,renderToContext,composeInternal,stateAt,rasterLayer,layerData,buildMasterParts,installMasters,behaviorDefinition,enhanceCompiled,exportRuntimeContract,audit});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
