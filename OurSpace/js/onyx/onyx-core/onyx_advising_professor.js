/* Onyx Advising / Professor — Pass 5 of 5 — Final
 * Final identity-lock + export/runtime integration pass built from ONYX_AVATAR_SPRITE_DESCRIPTION,
 * code-level identity constraints, and the supplied real Onyx photo archive.
 * The retained Professor PNG is a runtime-only failure fallback, separate from this renderer.
 * Character renderer only: the electric-blue environment remains independently rendered.
 */
(()=>{'use strict';
if(window.OnyxAdvisingProfessor?.pass>=5)return;

const SOURCE=170;
const INTERNAL=85;
const PORTAL_GRID=80;
const CYCLE=8400;
const VERSION='1.4.0-final';
const PASS=5;

// Established dark-fur ramp plus Professor identity colors.
const P={
  ink:'#090B0D',
  fur:'#212121',
  fur2:'#2B2D31',
  fur3:'#404040',
  fur4:'#4F4F4F',
  furCool:'#343A42',
  ear:'#665B5E',
  earShadow:'#443D40',
  eye:'#B8CE66',
  eyeDeep:'#8FAB45',
  eyeHi:'#EFF7B5',
  pupil:'#07100A',
  whisker:'#E0E8E5',
  whiskerShade:'#AAB9B6',
  bow:'#448B52',
  bowDark:'#17472F',
  bowLight:'#85C77E',
  bowHi:'#B7D6A7',
  nose:'#5A5154',
  gold:'#C8A65C',
  goldDark:'#765C2F',
  goldHi:'#F3DF8D',
  lens:'rgba(223,238,213,.08)',
  clip:'#68442F',
  clip2:'#9A6848',
  clipPaper:'#D9C7A8',
  metal:'#AEB9BD',
  jacket:'#4A4E30',
  jacketHi:'#686E49',
  jacketDark:'#262A1C',
  jacketThread:'#858661',
  pink:'#D78A9B',
  paperLine:'#74553A',
  white:'#FFFDF0'
};

const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
const canvas=(w=SOURCE,h=w)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};

function poly(ctx,pts,fill,stroke=P.ink,lw=1){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
function ellipse(ctx,x,y,rx,ry,fill,stroke=P.ink,lw=1,rotation=0){ctx.beginPath();ctx.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
function line(ctx,x1,y1,x2,y2,color,lw=1){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.lineCap='round';ctx.stroke()}
function rect(ctx,x,y,w,h,fill,stroke=null,lw=1){ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.strokeRect(x,y,w,h)}}
function rounded(ctx,x,y,w,h,r,fill,stroke=P.ink,lw=1){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
function quadShape(ctx,pts,fill,stroke=P.ink,lw=1){ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++){const p=pts[i];if(p.length===4)ctx.quadraticCurveTo(p[0],p[1],p[2],p[3]);else ctx.lineTo(p[0],p[1])}ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}

function quantizeMotion(v,step=.05){return Math.round((Number(v)||0)/step)*step}
function stateAt(time=0,reduced=false){
  if(reduced)return{breath:0,blink:0,glint:false,paw:0,earR:0,earL:0,clipboard:0,gazeX:0,gazeY:0,headTilt:0,bow:0,glassesTilt:0,pupilScale:1,whiskerLift:0,consult:false};
  const t=((Number(time)||0)%CYCLE+CYCLE)%CYCLE;
  const breath=quantizeMotion(Math.sin(t/CYCLE*Math.PI*2)*.34,.02);
  let blink=0;
  // One full slow blink and one shorter refocus blink: deliberately sparse for calm screen presence.
  if((t>=2760&&t<2845)||(t>=7060&&t<7120))blink=1;
  if((t>=2845&&t<2935)||(t>=7120&&t<7180))blink=2;
  if((t>=2935&&t<3020)||(t>=7180&&t<7240))blink=1;
  // A single compact advising beat; motion is snapped to reduce sub-pixel shimmer.
  const paw=t>=3480&&t<3760?-1:(t>=3760&&t<3970?-.45:0);
  const earR=t>=4930&&t<5050?-1:(t>=5050&&t<5160?.4:0);
  const earL=t>=5210&&t<5320?.55:0;
  const consult=t>=5480&&t<6340;
  const clipboard=(t>=4160&&t<4520?Math.sin((t-4160)/360*Math.PI)*.62:0)+(consult?Math.sin((t-5480)/860*Math.PI)*.38:0);
  let gazeX=0,gazeY=0,headTilt=0;
  if(t>=1520&&t<2300){gazeX=.35;gazeY=-.2;headTilt=-.2}
  else if(t>=5480&&t<6120){gazeX=.58;gazeY=.34;headTilt=.14}
  else if(t>=6120&&t<6500){gazeX=.22;gazeY=.12;headTilt=.06}
  const bow=t>=3920&&t<4210?Math.sin((t-3920)/290*Math.PI)*.42:0;
  const glassesTilt=(t>=4050&&t<4350?Math.sin((t-4050)/300*Math.PI)*.18:0)+(consult?.06:0);
  const pupilScale=consult?.92:(t>=1520&&t<2300?1.04:1);
  const whiskerLift=t>=3480&&t<3970?.22:(consult?-.12:0);
  return{
    breath,blink,glint:t>=4270&&t<4390,paw:quantizeMotion(paw,.05),earR,earL,
    clipboard:quantizeMotion(clipboard,.02),gazeX:quantizeMotion(gazeX,.02),gazeY:quantizeMotion(gazeY,.02),
    headTilt:quantizeMotion(headTilt,.02),bow:quantizeMotion(bow,.02),glassesTilt:quantizeMotion(glassesTilt,.02),
    pupilScale,whiskerLift,consult
  };
}

function drawBase(ctx,s){
  // Final Professor silhouette: less circular, more Onyx-like head plane — broad brow, angular cheek fur,
  // compact muzzle, glossy black coat separated by restrained charcoal planes.
  poly(ctx,[[25,80],[25,65],[28,56],[33,51],[38,48],[47,48],[54,51],[59,56],[62,65],[62,80]],P.fur,P.ink,1.3);
  ctx.save();ctx.translate(43,33+s.breath*.10);ctx.rotate((s.headTilt||0)*Math.PI/180);
  quadShape(ctx,[[-21,-3],[-20,-13,-12,-20],[-4,-23],[5,-23],[13,-19],[21,-12,22,-2],[21,8,15,14],[10,18],[3,20],[-5,20],[-12,17],[-18,12,-21,4]],P.fur,P.ink,1.35);
  // brow/crown sheen follows the real photos without whitening the coat
  line(ctx,-11,-17,-5,-19,P.fur3,.8); line(ctx,-2,-20,3,-20,P.fur4,.7); line(ctx,7,-19,12,-16,P.furCool,.75);
  // cheek planes create the slightly Maine-Coon-ish breadth seen in references
  quadShape(ctx,[[-20,2],[-18,9,-12,13],[-7,16],[-1,17],[0,20],[-8,18],[-15,15],[-20,9]],P.fur2,null);
  quadShape(ctx,[[20,2],[18,9,12,13],[7,16],[1,17],[0,20],[8,18],[15,15],[20,9]],P.fur2,null);
  line(ctx,-17,7,-11,11,P.fur4,.75);line(ctx,17,7,11,11,P.fur3,.75);
  // restrained cheek/chin tufts preserve the broader real-Onyx silhouette at tiny scale
  poly(ctx,[[-20,8],[-23,11],[-18,11]],P.fur2,null);poly(ctx,[[20,8],[23,11],[18,11]],P.fur2,null);
  line(ctx,-4.5,18.2,0,19.2,P.fur4,.4);line(ctx,0,19.2,4.5,18.2,P.fur3,.4);
  ctx.restore();
  // compact shoulders and the visibly fluffier chest ruff from the photo archive
  ellipse(ctx,43,61+s.breath*.22,17,15,P.fur2,null);
  ellipse(ctx,43,65+s.breath*.22,15,14,P.fur,null);
  poly(ctx,[[35,55],[38,61],[40,58],[43,67],[46,59],[48,62],[52,55],[50,70],[43,75],[36,70]],P.fur2,null);
  line(ctx,36,56,40,60,P.fur3,.75);line(ctx,50,56,46,60,P.fur4,.68);line(ctx,39,66,43,70,P.fur3,.65);line(ctx,47,66,43,70,P.furCool,.55);
}

function drawRightEar(ctx,s){
  poly(ctx,[[22.5,22],[24+s.earR*.38,3.5],[37.5,20]],P.fur,P.ink,1.2);
  poly(ctx,[[25.8,18.2],[27+s.earR*.25,8],[34.4,18.7]],P.ear,null);
  poly(ctx,[[28,17.2],[29.1,10.7],[33.3,18]],P.earShadow,null);
  line(ctx,27.2,12.5,31.6,18,P.fur4,.58);line(ctx,30.3,9.8,34.4,17,P.fur3,.55)
}
function drawLeftEar(ctx,s){
  poly(ctx,[[48.5,20],[61+s.earL*.3,3.5],[63.5,22]],P.fur,P.ink,1.2);
  poly(ctx,[[51.6,18.8],[59+s.earL*.18,8],[60.7,18.2]],P.ear,null);
  poly(ctx,[[54,18],[58,10.6],[59.4,17]],P.earShadow,null);
  line(ctx,56,13.8,60.2,9.8,P.fur4,.58);line(ctx,53.8,17,58.1,11.5,P.fur3,.55)
}

function eyePath(ctx,x,y,blink=0){
  const open=blink===0?3.35:(blink===1?1.25:0);
  if(blink===2){line(ctx,x-5.25,y,x+5.25,y,P.eyeDeep,1.2);line(ctx,x-4.2,y-.55,x+4.2,y-.55,P.fur4,.45);return false}
  ctx.beginPath();ctx.moveTo(x-5.8,y+.15);
  ctx.quadraticCurveTo(x-2.8,y-open,x+.1,y-open*.9);
  ctx.quadraticCurveTo(x+3.1,y-open*.72,x+5.8,y+.05);
  ctx.quadraticCurveTo(x+2.8,y+open*.64,x-.1,y+open*.62);
  ctx.quadraticCurveTo(x-3.0,y+open*.68,x-5.8,y+.15);
  ctx.closePath();ctx.fillStyle=P.eye;ctx.fill();ctx.strokeStyle=P.ink;ctx.lineWidth=1;ctx.stroke();return true
}
function drawEye(ctx,x,y,s){
  if(!eyePath(ctx,x,y,s.blink))return;
  const ry=(s.blink===1?1.05:2.55)*(s.pupilScale||1);
  ellipse(ctx,x+s.gazeX,y+s.gazeY,1.08*(s.pupilScale||1),ry,P.pupil,null);
  if(s.blink===0){rect(ctx,x-.55+s.gazeX,y-1.75+s.gazeY,.85,.85,P.eyeHi);line(ctx,x-4.65,y-1.5,x-2.6,y-2.55,P.eyeDeep,.46)}
}
function drawRightEye(ctx,s){drawEye(ctx,34.1,31.9,s)}
function drawLeftEye(ctx,s){drawEye(ctx,50.9,31.9,s)}

function drawNose(ctx,s={}){
  const sig=s.signature||{};
  if(window.OnyxSignatureParts?.drawNose)return window.OnyxSignatureParts.drawNose(ctx,{x:43,y:41.7,scale:.5*(sig.noseScale||1),nose:P.nose,outline:'#343239'});
  poly(ctx,[[39.8,40.2],[46.1,40.2],[43,43.1]],P.ink,'#020304',.7);
  rect(ctx,42,40.2,.9,.8,P.fur4);line(ctx,40.9,43.4,43,44,P.fur3,.42);line(ctx,45.1,43.4,43,44,P.fur3,.42)
}
function drawMouth(ctx){line(ctx,43,43.2,43,45,P.fur4,.7);line(ctx,43,45,40.3,46.1,P.fur4,.68);line(ctx,43,45,45.7,46.1,P.fur4,.68)}
function drawRightWhiskers(ctx,s={}){const d=s.whiskerLift||0;line(ctx,39,43,18.5,38.2-d,P.whisker,.58);line(ctx,39,44.5,16.5,43.2-d*.5,P.whisker,.58);line(ctx,39,46,18.8,51.2-d*.2,P.whisker,.58);line(ctx,38.6,41.8,21.8,35.3-d,P.whiskerShade,.42);line(ctx,38.8,47.2,22.4,55-d*.2,P.whiskerShade,.38)}
function drawLeftWhiskers(ctx,s={}){const d=s.whiskerLift||0;line(ctx,47,43,67.5,38.2-d,P.whisker,.58);line(ctx,47,44.5,69.5,43.2-d*.5,P.whisker,.58);line(ctx,47,46,67.2,51.2-d*.2,P.whisker,.58);line(ctx,47.4,41.8,64.2,35.3-d,P.whiskerShade,.42);line(ctx,47.2,47.2,63.6,55-d*.2,P.whiskerShade,.38)}

function drawJacket(ctx,s){
  poly(ctx,[[26,55],[34,51],[43,58],[52,51],[60,55],[63,80],[23,80]],P.jacket,P.ink,1);
  poly(ctx,[[34,52],[43,59],[38,73],[27,58]],P.jacketHi,P.jacketDark,.8);
  poly(ctx,[[52,52],[43,59],[48,73],[60,58]],P.jacketHi,P.jacketDark,.8);
  line(ctx,43,60,43,80,P.jacketDark,1);
  // restrained tweed texture
  for(const y of [60,66,72]){line(ctx,28,y,39,y+3,P.jacketThread,.38);line(ctx,47,y+2,59,y-1,P.jacketThread,.38)}
  rect(ctx,29,67,2,2,P.gold);rect(ctx,56,67,2,2,P.gold)
}
function drawBowtie(ctx,s){
  const sig=s.signature||{};
  if(window.OnyxSignatureParts?.drawBowtie)return window.OnyxSignatureParts.drawBowtie(ctx,{x:43,y:54,scale:.5*(sig.bowtieScale||1),rotation:s?.bow||0,tie:P.bow,tieDark:P.bowDark,tieLight:P.bowLight,outline:'#102f22',plaidStrength:sig.plaidStrength??.88});
  ctx.save();ctx.translate(43,54);ctx.rotate((s?.bow||0)*Math.PI/180);ctx.translate(-43,-54);
  poly(ctx,[[30,52],[39,49],[43,53],[39,60],[30,57]],P.bow,P.ink,1);
  poly(ctx,[[56,52],[47,49],[43,53],[47,60],[56,57]],P.bow,P.ink,1);
  rounded(ctx,40,51,6,8,1.4,P.bowLight,P.ink,.8);
  for(const x of [33,37,49,53])line(ctx,x,51,x+1.3,58,P.bowDark,.66);
  line(ctx,31,54,40,54,P.bowHi,.58);line(ctx,46,54,55,54,P.bowHi,.58);
  line(ctx,42,52,42,58,P.bowDark,.62);line(ctx,34,56,40,56,P.bowDark,.45);line(ctx,46,56,53,56,P.bowDark,.45);
  ctx.restore()
}
function drawGlasses(ctx,s){
  ctx.save();ctx.translate(43,34);ctx.rotate((s.glassesTilt||0)*Math.PI/180);ctx.translate(-43,-34);
  // Small round gold frames sit low enough to leave the feline brow readable
  ctx.fillStyle=P.lens;ctx.beginPath();ctx.arc(34.2,34.2,6.6,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(50.8,34.2,6.6,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=P.gold;ctx.lineWidth=1.15;ctx.beginPath();ctx.arc(34.2,34.2,6.6,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(50.8,34.2,6.6,0,Math.PI*2);ctx.stroke();
  line(ctx,40.8,34.2,44.2,34.2,P.gold,1.15);line(ctx,27.6,33.2,22.7,30.9,P.gold,.95);line(ctx,57.4,33.2,63.3,30.9,P.gold,.95);
  line(ctx,29.8,39,31.5,39.7,P.goldDark,.4);line(ctx,53.5,39,55.2,39.7,P.goldDark,.4);
  if(s.glint){line(ctx,29.4,28.5,32.8,25.1,P.goldHi,.85);line(ctx,30.3,29.6,34.1,25.8,P.white,.45);rect(ctx,31,26.7,.9,.9,'#FFFFFF')}
  ctx.restore()
}

function drawRightArm(ctx,s){
  poly(ctx,[[28,58],[23,55],[19,49+s.paw],[15,51+s.paw],[17,63],[24,69],[32,64]],P.jacketHi,P.ink,1);
  line(ctx,22,57,27,63,P.jacketDark,.75);line(ctx,18,58,23,62,P.jacketThread,.4)
}
function drawRightPaw(ctx,s){
  // Feline "making a point" gesture: lifted paw with one toe slightly leading,
  // avoiding a human finger silhouette while still reading as an advising gesture.
  ellipse(ctx,15.2,46+s.paw,7.5,7.2,P.fur,P.ink,1);
  ellipse(ctx,10.9,43.4+s.paw,2.6,3.0,P.fur2,P.ink,.58);
  ellipse(ctx,15.1,41.7+s.paw,2.8,3.5,P.fur2,P.ink,.6);
  ellipse(ctx,19.1,43.0+s.paw,2.5,3.0,P.fur2,P.ink,.58);
  // leading toe/paw-tip is raised, but remains rounded and cat-like
  rounded(ctx,14.1,35.2+s.paw,4.0,6.9,2.0,P.fur,P.ink,.72);
  ellipse(ctx,16.1,35.1+s.paw,2.1,2.1,P.fur2,P.ink,.55);
  line(ctx,10.8,46.2+s.paw,14.1,45.2+s.paw,P.fur3,.6);line(ctx,16.1,39.6+s.paw,18.1,39.6+s.paw,P.fur3,.46)
}
function drawLeftArm(ctx){poly(ctx,[[55,59],[61,58],[69,66],[66,77],[57,78],[50,70]],P.jacketHi,P.ink,1);line(ctx,58,63,64,70,P.jacketDark,.7)}
function drawLeftPaw(ctx){ellipse(ctx,60,70,8,6,P.fur,P.ink,1);ellipse(ctx,56,69,2.5,2.1,P.fur2,null);ellipse(ctx,61,68,2.6,2.1,P.fur2,null);line(ctx,56,71,64,69,P.fur3,.6)}
function drawClipboard(ctx,s){
  ctx.save();ctx.translate(62,51);ctx.rotate(-.08+s.clipboard*.012);
  rounded(ctx,0,0,19,27,1.5,P.clip,P.ink,1);rect(ctx,2,3,15,21,P.clip2,null);rect(ctx,4,5,11,16,P.clipPaper,null);
  rounded(ctx,5,-2,9,5,1.4,P.metal,P.ink,.7);ellipse(ctx,9.5,-1.2,1.8,1.8,P.metal,P.ink,.7);
  line(ctx,6,8,13,8,P.paperLine,.65);line(ctx,6,12,13,12,P.paperLine,.65);line(ctx,6,16,12,16,P.paperLine,.65);ctx.restore()
}
function drawChest(ctx,s){
  poly(ctx,[[35,48],[43,51],[51,48],[50,59],[43,62],[36,59]],P.fur2,null);
  line(ctx,38,50,43,54,P.fur4,.7);line(ctx,48,50,43,54,P.fur4,.7);line(ctx,39,57,43,60,P.fur3,.6);line(ctx,47,57,43,60,P.fur3,.6)
}
function drawNeck(ctx){ellipse(ctx,43,49,12,6,P.fur2,null)}

function drawLayer(ctx,key,s){switch(key){
  case'professor-base-silhouette':return drawBase(ctx,s);
  case'right-ear':return drawRightEar(ctx,s);
  case'left-ear':return drawLeftEar(ctx,s);
  case'right-eye':return drawRightEye(ctx,s);
  case'left-eye':return drawLeftEye(ctx,s);
  case'nose':return drawNose(ctx,s);
  case'mouth':return drawMouth(ctx);
  case'right-whiskers':return drawRightWhiskers(ctx,s);
  case'left-whiskers':return drawLeftWhiskers(ctx,s);
  case'jacket':return drawJacket(ctx,s);
  case'bowtie':return drawBowtie(ctx,s);
  case'glasses':return drawGlasses(ctx,s);
  case'right-front-arm':return drawRightArm(ctx,s);
  case'right-front-paw':return drawRightPaw(ctx,s);
  case'left-front-arm':return drawLeftArm(ctx);
  case'left-front-paw':return drawLeftPaw(ctx);
  case'clipboard':return drawClipboard(ctx,s);
  case'chest':return drawChest(ctx,s);
  case'neck':return drawNeck(ctx);
}}

const LAYERS=[
 ['professor-base-silhouette','Professor Base Silhouette','body',1],
 ['right-ear','Right Ear','head',3],['left-ear','Left Ear','head',3],
 ['neck','Neck','body',4],['chest','Chest','body',5],['jacket','Jacket','wearables',6],
 ['right-front-arm','Right Front Arm','body',7],['left-front-arm','Left Front Arm','body',7],
 ['bowtie','Bowtie','wearables',9],['right-eye','Right Eye','head',10],['left-eye','Left Eye','head',10],
 ['nose','Nose','head',11],['mouth','Mouth','head',11],
 ['right-whiskers','Right Whiskers','head',12],['left-whiskers','Left Whiskers','head',12],
 ['glasses','Glasses','wearables',13],['clipboard','Clipboard','wearables',14],
 ['left-front-paw','Left Front Paw','body',15],['right-front-paw','Right Front Paw','body',16]
];

const PIVOTS={
 'right-ear':{x:60,y:42},'left-ear':{x:106,y:42},
 'right-eye':{x:68,y:64},'left-eye':{x:102,y:64},
 'right-whiskers':{x:78,y:88},'left-whiskers':{x:94,y:88},
 'right-front-arm':{x:58,y:102},'left-front-arm':{x:112,y:102},
 'right-front-paw':{x:38,y:92},'left-front-paw':{x:124,y:122},
 'bowtie':{x:86,y:107},'glasses':{x:86,y:66},'clipboard':{x:124,y:104},
 'neck':{x:86,y:94},'chest':{x:86,y:104}
};

function rasterLayer(key,{time=0,reducedMotion=true,size=SOURCE,blinkOverride=null,glintOverride=null,gazeOverride=null,signatureSettings={}}={}){
  const small=canvas(INTERNAL),ctx=small.getContext('2d');ctx.imageSmoothingEnabled=false;
  const s=stateAt(time,reducedMotion);
  if(blinkOverride!=null)s.blink=blinkOverride;
  if(glintOverride!=null)s.glint=!!glintOverride;
  if(gazeOverride){s.gazeX=gazeOverride.x||0;s.gazeY=gazeOverride.y||0}
  s.signature=window.OnyxSignatureParts?.normalizeSettings?.(signatureSettings)||{noseScale:1,bowtieScale:1,plaidStrength:.88};
  drawLayer(ctx,key,s);
  const out=canvas(size),x=out.getContext('2d');x.imageSmoothingEnabled=false;x.clearRect(0,0,size,size);x.drawImage(small,0,0,size,size);return out
}

const dataCache=new Map();
function layerData(key,variant='base'){
  const ck=key+'|'+variant;if(dataCache.has(ck))return dataCache.get(ck);
  let blink=null,glint=null,gaze=null;
  if(variant==='half')blink=1;if(variant==='closed')blink=2;if(variant==='glint')glint=true;if(variant==='focus')gaze={x:.36,y:-.2};if(variant==='consult')gaze={x:.58,y:.34};
  const src=rasterLayer(key,{reducedMotion:true,blinkOverride:blink,glintOverride:glint,gazeOverride:gaze}).toDataURL('image/png');
  dataCache.set(ck,src);return src
}
function eyeVariants(key){return['base','focus','consult','half','closed'].map(name=>({id:`${key}-${name}`,name:`${key} ${name}`,src:layerData(key,name),naturalSize:[SOURCE,SOURCE],sourceBounds:{x:0,y:0,width:SOURCE,height:SOURCE}}))}
function glassesVariants(){return['base','glint'].map(name=>({id:`glasses-${name}`,name:`glasses ${name}`,src:layerData('glasses',name),naturalSize:[SOURCE,SOURCE],sourceBounds:{x:0,y:0,width:SOURCE,height:SOURCE}}))}

function animationFor(partKey){
  if(/eye$/.test(partKey))return{keyframes:[
    {id:`${partKey}-p5-k0`,time:0,variantId:`${partKey}-base`},
    {id:`${partKey}-p5-k1`,time:1520,variantId:`${partKey}-focus`},
    {id:`${partKey}-p5-k2`,time:2300,variantId:`${partKey}-base`},
    {id:`${partKey}-p5-k3`,time:2760,variantId:`${partKey}-base`},
    {id:`${partKey}-p5-k4`,time:2845,variantId:`${partKey}-half`},
    {id:`${partKey}-p5-k5`,time:2935,variantId:`${partKey}-closed`},
    {id:`${partKey}-p5-k6`,time:3020,variantId:`${partKey}-half`},
    {id:`${partKey}-p5-k7`,time:3100,variantId:`${partKey}-base`},
    {id:`${partKey}-p5-k8`,time:5480,variantId:`${partKey}-consult`},
    {id:`${partKey}-p5-k9`,time:6340,variantId:`${partKey}-base`},
    {id:`${partKey}-p5-k10`,time:7060,variantId:`${partKey}-half`},
    {id:`${partKey}-p5-k11`,time:7180,variantId:`${partKey}-closed`},
    {id:`${partKey}-p5-k12`,time:7240,variantId:`${partKey}-half`},
    {id:`${partKey}-p5-k13`,time:7310,variantId:`${partKey}-base`},
    {id:`${partKey}-p5-k14`,time:CYCLE,variantId:`${partKey}-base`}
  ]};
  if(partKey==='glasses')return{keyframes:[
    {id:'glasses-p5-k0',time:0,variantId:'glasses-base',rotation:0},
    {id:'glasses-p5-k1',time:4270,variantId:'glasses-glint',rotation:.15},
    {id:'glasses-p5-k2',time:4390,variantId:'glasses-base',rotation:0},
    {id:'glasses-p5-k3',time:5480,variantId:'glasses-base',rotation:.06},
    {id:'glasses-p5-k4',time:6340,variantId:'glasses-base',rotation:0},
    {id:'glasses-p5-k5',time:CYCLE,variantId:'glasses-base',rotation:0}
  ]};
  if(partKey==='clipboard')return{keyframes:[
    {id:'clipboard-p5-k0',time:0,rotation:0},{id:'clipboard-p5-k1',time:4160,rotation:0},
    {id:'clipboard-p5-k2',time:4340,rotation:1},{id:'clipboard-p5-k3',time:4520,rotation:0},
    {id:'clipboard-p5-k4',time:5480,rotation:0},{id:'clipboard-p5-k5',time:5900,rotation:.7},
    {id:'clipboard-p5-k6',time:6340,rotation:0},{id:'clipboard-p5-k7',time:CYCLE,rotation:0}
  ]};
  if(partKey==='right-ear')return{keyframes:[{id:'rear-p5-k0',time:0,rotation:0},{id:'rear-p5-k1',time:4930,rotation:-1},{id:'rear-p5-k2',time:5160,rotation:0},{id:'rear-p5-k3',time:CYCLE,rotation:0}]};
  if(partKey==='left-ear')return{keyframes:[{id:'lear-p5-k0',time:0,rotation:0},{id:'lear-p5-k1',time:5210,rotation:.55},{id:'lear-p5-k2',time:5320,rotation:0},{id:'lear-p5-k3',time:CYCLE,rotation:0}]};
  if(partKey==='bowtie')return{keyframes:[{id:'bow-p5-k0',time:0,rotation:0},{id:'bow-p5-k1',time:3920,rotation:0},{id:'bow-p5-k2',time:4065,rotation:.42},{id:'bow-p5-k3',time:4210,rotation:0},{id:'bow-p5-k4',time:CYCLE,rotation:0}]};
  return{keyframes:[]};
}

function partDef([partKey,name,category,z]){
  const variants=/eye$/.test(partKey)?eyeVariants(partKey):(partKey==='glasses'?glassesVariants():[]);
  const pivot=PIVOTS[partKey]||{x:85,y:85};
  const semanticRole=/eye$/.test(partKey)?'eye':/whisker/.test(partKey)?'whisker':partKey==='bowtie'?'bowtie':partKey==='glasses'?'glasses':partKey==='clipboard'?'prop':/ear/.test(partKey)?'ear':/paw/.test(partKey)?'paw':category==='body'?'fur':category;
  const pixelPriority=['right-eye','left-eye','right-whiskers','left-whiskers','bowtie','glasses','right-front-paw','nose'].includes(partKey)?'critical':'normal';
  return{
    instanceId:`professor-pass5-${partKey}`,
    masterId:`coded-professor-${partKey}`,
    sourceIdentity:`coded:onyx_advising_professor:${partKey}`,
    partKey,category,name,semanticRole,pixelPriority,identityAnchor:pixelPriority==='critical',
    masterVersionId:'pass5-v5',masterVersionNumber:5,
    variantId:variants[0]?.id||null,availableVariants:variants,availableVersions:[],
    artwork:{src:layerData(partKey,'base'),naturalSize:[SOURCE,SOURCE],sourceBounds:{x:0,y:0,width:SOURCE,height:SOURCE},transparent:true},
    transform:{x:0,y:0,scaleX:1,scaleY:1,rotation:0,flipX:false,flipY:false,pivot:clone(pivot)},
    opacity:1,visible:true,z,animation:animationFor(partKey)
  }
}

function professorRig(){
  const joints=[
    {id:'prof-head',name:'Head',x:85,y:64},{id:'prof-neck',name:'Neck',x:85,y:94},
    {id:'prof-r-shoulder',name:'Right Shoulder',x:58,y:102},{id:'prof-r-wrist',name:'Right Wrist',x:38,y:92},{id:'prof-r-paw',name:'Right Advising Paw',x:30,y:67},
    {id:'prof-l-shoulder',name:'Left Shoulder',x:112,y:102},{id:'prof-l-wrist',name:'Left Wrist',x:124,y:121},{id:'prof-l-paw',name:'Left Paw',x:121,y:139}
  ];
  const edges=[
    {id:'prof-neck-head',a:'prof-neck',b:'prof-head',curve:{offset:0,weight:.5,wave:0},pathMode:'straight'},
    {id:'prof-r-upper',a:'prof-neck',b:'prof-r-shoulder',curve:{offset:-3,weight:.5,wave:0},pathMode:'curved'},
    {id:'prof-r-fore',a:'prof-r-shoulder',b:'prof-r-wrist',curve:{offset:-4,weight:.5,wave:0},pathMode:'curved'},
    {id:'prof-r-paw-bone',a:'prof-r-wrist',b:'prof-r-paw',curve:{offset:2,weight:.5,wave:0},pathMode:'curved'},
    {id:'prof-l-upper',a:'prof-neck',b:'prof-l-shoulder',curve:{offset:3,weight:.5,wave:0},pathMode:'curved'},
    {id:'prof-l-fore',a:'prof-l-shoulder',b:'prof-l-wrist',curve:{offset:3,weight:.5,wave:0},pathMode:'curved'},
    {id:'prof-l-paw-bone',a:'prof-l-wrist',b:'prof-l-paw',curve:{offset:-2,weight:.5,wave:0},pathMode:'curved'}
  ];
  const byId=id=>joints.find(j=>j.id===id),edgeById=id=>edges.find(e=>e.id===id);
  const boneRest=id=>{const e=edgeById(id),a=byId(e.a),b=byId(e.b),dx=b.x-a.x,dy=b.y-a.y;return{angle:Math.atan2(dy,dx)*180/Math.PI,length:Math.hypot(dx,dy),mid:{x:(a.x+b.x)/2,y:(a.y+b.y)/2}}};
  const bindJoint=(id,targetId,jointId,weight=1)=>({id,targetType:'instance',targetId,memberInstanceIds:[],fallbackToMembers:true,mode:'joint',jointId,boneId:null,weight,scaleWithBone:false,rest:{joint:{x:byId(jointId).x,y:byId(jointId).y},bone:null,target:null}});
  const bindBone=(id,targetId,boneId,weight=1,scaleWithBone=true)=>({id,targetType:'instance',targetId,memberInstanceIds:[],fallbackToMembers:true,mode:'bone',jointId:null,boneId,weight,scaleWithBone,rest:{joint:null,bone:boneRest(boneId),target:null}});
  const bindings=[
    bindBone('bind-prof-r-arm','professor-pass5-right-front-arm','prof-r-fore',.72,true),
    bindJoint('bind-prof-r-paw','professor-pass5-right-front-paw','prof-r-paw'),
    bindBone('bind-prof-l-arm','professor-pass5-left-front-arm','prof-l-fore',.48,false),
    bindJoint('bind-prof-l-paw','professor-pass5-left-front-paw','prof-l-paw',.72),
    bindJoint('bind-prof-clipboard','professor-pass5-clipboard','prof-l-paw',.82),
    bindJoint('bind-prof-bowtie','professor-pass5-bowtie','prof-neck',.38)
  ];
  const frame=(id,time,patch={},edgePatch={})=>({id,time,transform:{x:0,y:0,rotation:0,scaleX:1,scaleY:1},joints:joints.map(j=>patch[j.id]?{...j,...patch[j.id]}:clone(j)),edges:edges.map(e=>({id:e.id,curve:{...clone(e.curve),...(edgePatch[e.id]||{})}}))});
  return{
    schema:'onyx.bubble-rig/v2',version:2,id:'professor-pass5-rig',name:'Professor Upper Body Rig — Pass 5 — Final',joints,edges,bindings,
    instanceIds:[...new Set(bindings.map(b=>b.targetId))],groupIds:[],transform:{x:0,y:0,rotation:0,scaleX:1,scaleY:1},
    animation:{keyframes:[
      frame('prof-p5-rig-k0',0),
      frame('prof-p5-rig-k1',3480,{'prof-r-wrist':{y:91.3},'prof-r-paw':{y:65.8}},{'prof-r-paw-bone':{offset:2.4}}),
      frame('prof-p5-rig-k2',3760,{'prof-r-wrist':{y:90.9},'prof-r-paw':{y:65.2}},{'prof-r-paw-bone':{offset:2.7}}),
      frame('prof-p5-rig-k3',3970,{'prof-r-wrist':{y:92},'prof-r-paw':{y:67}},{'prof-r-paw-bone':{offset:2}}),
      frame('prof-p5-rig-k4',5480,{'prof-l-wrist':{x:124.3,y:120.5},'prof-l-paw':{x:121.2,y:138.6}},{'prof-l-fore':{offset:3.25}}),
      frame('prof-p5-rig-k5',6120,{'prof-l-wrist':{x:124.5,y:120.2},'prof-l-paw':{x:121.4,y:138.4}},{'prof-l-fore':{offset:3.4}}),
      frame('prof-p5-rig-k6',6500,{'prof-l-wrist':{x:124,y:121},'prof-l-paw':{x:121,y:139}},{'prof-l-fore':{offset:3}}),
      frame('prof-p5-rig-k7',CYCLE)
    ]},
    visible:true,overlayVisible:true,enabled:true,locked:false,savedLayer:true,
    ancestry:{from:'professor-pass4-rig',completedPasses:5,pass:PASS},savedAt:'coded-pass5-final',pass:'professor-5-final'
  };
}

function presentation(){
  return window.OnyxSpritePresentation?.resolve?.({behavior:{id:3,name:'Advising / Professor',portalAssignments:[3]},presentation:{mood:'professor'}})||{
    mood:'professor',
    idle:{profile:'lecture-consult',cycleMs:CYCLE,glassesGlint:true,blinkStyle:'slow-feline',earTracking:true,pawEmphasis:'single-beat',clipboardConsult:true,gazeReturn:true},
    transition:{duration:420,easing:'ease-in-out',blinkBridge:'half',bowtieSettle:true,glassesSettle:true},
    environment:{preset:'electric-blue',attachToSprite:false,preserveAcrossCharacterStateChanges:true}
  };
}

function behaviorDefinition(base={}){
  const parts=LAYERS.map(partDef),p=presentation(),rig=professorRig();
  const identityRoles=['eye','whisker','bowtie','glasses'];
  return{
    schema:'onyx-behavior/v9',protocol:base.protocol||'onyx-generator/v7',logicalSize:[SOURCE,SOURCE],transparent:true,
    behavior:{id:base.behavior?.id||3,name:base.behavior?.name&&base.behavior.name!=='Behavior 03'?base.behavior.name:'Advising / Professor',animation:{duration:CYCLE,loopMode:'loop',speed:100,easing:'ease-in-out',...(base.behavior?.animation||{})},portalAssignments:base.behavior?.portalAssignments?.length?base.behavior.portalAssignments:[3]},
    presentation:{...p,mood:'professor',environment:{...(p.environment||{}),attachToSprite:false,preserveAcrossCharacterStateChanges:true}},
    animations:{'professor-pass5-main':{duration:CYCLE,loopMode:'loop',speed:100,easing:'ease-in-out',phases:[
      {id:'attentive-focus',start:1520,end:2300},{id:'slow-blink',start:2760,end:3100},{id:'advising-paw',start:3480,end:3970},
      {id:'glasses-glint',start:4270,end:4390},{id:'clipboard-consult',start:5480,end:6340},{id:'refocus-blink',start:7060,end:7310}
    ]}},
    parts,groups:[],rigs:[rig],
    poses:[{id:'professor-pass5-pose',name:'Professor Upright — Lecture / Consult',parts:parts.map(x=>({instanceId:x.instanceId,transform:clone(x.transform),opacity:1,visible:true,z:x.z,variantId:x.variantId})),groups:[],rigs:[clone(rig)]}],
    states:[{id:'professor-pass5-state',name:'Advising / Professor',kind:'mood',poseId:'professor-pass5-pose',primaryLoop:'professor-pass5-main',alternateIdle:null,reaction:null,fallbackIdle:'professor-pass5-state',preserveEnvironment:true}],
    transitions:[{id:'professor-pass5-enter',fromStateId:'*',toStateId:'professor-pass5-state',duration:420,easing:'ease-in-out',interpolateParts:true,interpolateRig:true,interpolateBoneCurves:true,preserveEnvironment:true,semanticPlan:{blinkBridge:'half',glassesSettle:true,bowtieSettle:true,pawEase:'feline-rounded'}}],
    stateMachine:{activeStateId:'professor-pass5-state',defaultStateId:'professor-pass5-state'},
    environmentModel:{previewMode:'combined',preserveAcrossStateChanges:true,characterPartIds:parts.map(x=>x.instanceId),environmentPartIds:[]},
    character:{partInstanceIds:parts.map(x=>x.instanceId),rigIds:[rig.id],poseIds:['professor-pass5-pose'],stateIds:['professor-pass5-state'],transitionIds:['professor-pass5-enter']},
    environment:{partInstanceIds:[],separate:true,attachToSprite:false},
    render:{authoringSize:[SOURCE,SOURCE],internalGrid:[INTERNAL,INTERNAL],portalSize:[160,160],portalPixelGrid:[PORTAL_GRID,PORTAL_GRID],characterEnvironmentSeparate:true,pixelPerfectPortal:true,internalFirstComposition:true},
    digitization:{
      pixelGrid:true,nearestNeighbor:true,crispAlpha:true,seamReduction:true,silhouetteCleanup:true,speckleCleanup:true,
      dither:false,ditherAmount:.04,outline:true,outlineColor:P.ink,paletteConsolidation:true,colorLevels:20,paletteSize:20,pixelDensity:2,portalPixelGrid:PORTAL_GRID,
      edgeIntegration:true,unifiedSampling:true,lockAnimationPalette:true,pixelMotionSnap:true,pixelMotionQuantum:.5,semanticPreserve:true,microIdle:true,
      semanticPriorityRoles:identityRoles,furToneGuard:true,furToneStrength:.92,temporalStability:true,temporalRawThreshold:20,temporalMaxHold:2,
      clusterStability:true,clusterMaxCells:12,clusterRawThreshold:24,frameRate:12,...(base.digitization||{})
    },
    avatarImplementation:{
      id:'onyx_advising_professor',version:VERSION,pass:PASS,source:'coded-canvas',environmentAttached:false,wasmRequired:false,
      referencePolicy:'ONYX_AVATAR_SPRITE_DESCRIPTION + supplied Onyx photo archive + native procedural renderer; PNG is runtime-only failure fallback',
      pixelStrategy:'85-cell internal-first composition; 80-cell canonical portal grid; exact 2x nearest-neighbor at 160px; crisp-alpha portal threshold',
      identityAnchors:['green-gold almond eyes','pale five-strand whisker groups','green plaid bowtie','small round gold spectacles','dark feline nose','rounded advising paw','brown clipboard'],
      safeZonePriority:['eyes','nose','whisker-roots','bowtie-knot','glasses-bridge'],
      completion:{passes:5,complete:true,exportReady:true,canonicalState:'onyx_advising_professor',canonicalMood:'professor'},
      runtimeContract:{characterOnlyRenderer:true,environmentOwnedByHost:true,preferredCoreArtSize:72,portalSize:160,reducedMotionSupported:true,fallback:'https://raw.githubusercontent.com/tyrannosaurusdm92/LifeHelpers/main/OurSpace/assets/images/shared/legacy-static/onyx_advising_professor.png'},
      inheritanceBaseFor:['onyx_caring','onyx_judgmental']
    }
  };
}

function enhanceCompiled(def={}){
  const mood=window.OnyxSpritePresentation?.inferMood?.(def)||def?.presentation?.mood;
  const empty=!(def.parts||[]).some(p=>p?.visible!==false);
  if(mood!=='professor'||!empty)return def;
  const built=behaviorDefinition(def);
  const name=def.behavior?.name&&def.behavior.name!=='Behavior 03'?def.behavior.name:'Advising / Professor';
  return{...def,...built,
    behavior:{...built.behavior,...(def.behavior||{}),name,animation:{...built.behavior.animation,...(def.behavior?.animation||{}),duration:CYCLE}},
    presentation:{...built.presentation,...(def.presentation||{}),mood:'professor',environment:{...built.presentation.environment,...(def.presentation?.environment||{}),attachToSprite:false}},
    digitization:{...built.digitization,...(def.digitization||{})},avatarImplementation:built.avatarImplementation
  }
}

function composeInternal({time=0,reducedMotion=false,signatureSettings={}}={}){
  const surface=canvas(INTERNAL),ctx=surface.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,INTERNAL,INTERNAL);
  const s=stateAt(time,reducedMotion);
  s.signature=window.OnyxSignatureParts?.normalizeSettings?.(signatureSettings)||{noseScale:1,bowtieScale:1,plaidStrength:.88};
  for(const layer of LAYERS)drawLayer(ctx,layer[0],s);
  return{surface,state:s};
}
function crispAlpha(surface,threshold=92){
  const ctx=surface.getContext('2d'),img=ctx.getImageData(0,0,surface.width,surface.height),d=img.data;
  for(let i=0;i<d.length;i+=4){if(d[i+3]===0)continue;d[i+3]=d[i+3]<threshold?0:255}
  ctx.putImageData(img,0,0);return surface;
}
async function render(canvasEl,{time=0,reducedMotion=false,size=null,pixelize=false,signatureSettings={}}={}){
  const def=behaviorDefinition(),target=canvasEl||canvas(size||SOURCE),outputSize=size||target.width||SOURCE;
  target.width=outputSize;target.height=outputSize;
  const {surface}=composeInternal({time,reducedMotion,signatureSettings}),x=target.getContext('2d');x.imageSmoothingEnabled=false;x.clearRect(0,0,outputSize,outputSize);
  if(outputSize===160){
    const grid=canvas(PORTAL_GRID),g=grid.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,PORTAL_GRID,PORTAL_GRID);g.drawImage(surface,0,0,PORTAL_GRID,PORTAL_GRID);crispAlpha(grid,92);x.drawImage(grid,0,0,160,160);
  }else if(outputSize===SOURCE){x.drawImage(surface,0,0,SOURCE,SOURCE)}
  else{x.drawImage(surface,0,0,outputSize,outputSize)}
  if(target.dataset){target.dataset.onyxProfessorPass=String(PASS);if(outputSize===160){target.dataset.onyxProfessorPortal='true';target.dataset.onyxProfessorPortalGrid=String(PORTAL_GRID);target.dataset.onyxProfessorInternalFirst='true'}}
  if(pixelize&&window.OnyxSpritePixelizer)return window.OnyxSpritePixelizer.process(target,target,def.digitization);
  return target;
}
async function renderPortal(canvasEl,{time=0,reducedMotion=false,pixelize=false,signatureSettings={}}={}){return render(canvasEl,{time,reducedMotion,size:160,pixelize,signatureSettings})}

/* Final export bridge: draw only the character into an existing logical-size context.
   The host runtime remains responsible for the electric-blue environment/background. */
function renderToContext(targetCtx,{time=0,reducedMotion=false,x=0,y=0,width=72,height=72,signatureSettings={}}={}){
  if(!targetCtx)return false;
  const composed=composeInternal({time,reducedMotion,signatureSettings});
  targetCtx.save();
  targetCtx.imageSmoothingEnabled=false;
  targetCtx.drawImage(composed.surface,x,y,width,height);
  targetCtx.restore();
  return true;
}
function exportRuntimeContract(){
  return Object.freeze({
    schema:'onyx.export-avatar-state/v1',signatureParts:'onyx.signature-parts/v1',canonicalState:'onyx_advising_professor',mood:'professor',complete:true,passes:5,
    characterOnly:true,environmentSeparate:true,environmentAttached:false,authoringSize:[SOURCE,SOURCE],internalGrid:[INTERNAL,INTERNAL],portalSize:[160,160],portalGrid:[PORTAL_GRID,PORTAL_GRID],
    fallback:'https://raw.githubusercontent.com/tyrannosaurusdm92/LifeHelpers/main/OurSpace/assets/images/shared/legacy-static/onyx_advising_professor.png',wasmRequired:false,reducedMotion:true
  });
}

function buildMasterParts(){
  return LAYERS.map(([partKey,name,category,z])=>{
    const pivot=PIVOTS[partKey]||{x:85,y:85};
    const variants=/eye$/.test(partKey)?eyeVariants(partKey):(partKey==='glasses'?glassesVariants():[]);
    return{id:`coded-professor-${partKey}`,name,src:layerData(partKey,'base'),z,meta:{
      category,partKey,sourceIdentity:`coded:onyx_advising_professor:${partKey}`,
      sourceBounds:{x:0,y:0,width:SOURCE,height:SOURCE},naturalSize:[SOURCE,SOURCE],sourceDimensions:[SOURCE,SOURCE],logicalSource:[SOURCE,SOURCE],transparent:true,naturalPivot:clone(pivot),
      versions:[{id:'pass5-v5',number:5,label:`${name} — Professor Pass 5 — Final`,savedAt:'coded-pass5-final',src:layerData(partKey,'base'),sourceBounds:{x:0,y:0,width:SOURCE,height:SOURCE},naturalSize:[SOURCE,SOURCE],naturalPivot:clone(pivot),category,partKey}],
      currentVersionId:'pass5-v5',currentVersionNumber:5,variants
    }}
  })
}

function installMasters({replace=false}={}){
  const bridge=window.StudioPortalBridge;if(!bridge)return{installed:0,reason:'StudioPortalBridge unavailable'};
  const existing=bridge.getState?.().objects||[];let installed=0;
  for(const part of buildMasterParts()){
    const found=existing.find(o=>o.meta?.sourceIdentity===part.meta.sourceIdentity||o.meta?.partKey===part.meta.partKey);
    if(found&&!replace)continue;
    if(found){
      const priorVersions=Array.isArray(found.meta?.versions)?found.meta.versions:[];
      const versions=[...priorVersions.filter(v=>v.id!=='pass5-v5'),...part.meta.versions];
      bridge.updateObject(found.id,{...found,...part,id:found.id,meta:{...(found.meta||{}),...part.meta,versions,sourceIdentity:found.meta?.sourceIdentity||part.meta.sourceIdentity}});installed++
    }else{
      const created=bridge.addObject(part.src,part.name);
      if(created){bridge.updateObject(created.id,{...created,name:part.name,src:part.src,z:part.z,meta:{...(created.meta||{}),...part.meta,sourceIdentity:`master:${created.id}`}});installed++}
    }
  }
  return{installed,total:LAYERS.length,pass:PASS}
}

function audit(){
  const def=behaviorDefinition(),required=['right-eye','left-eye','right-ear','left-ear','right-whiskers','left-whiskers','bowtie','glasses','clipboard','right-front-paw'],have=new Set(def.parts.map(p=>p.partKey));
  const rig=def.rigs[0],boneBindings=(rig.bindings||[]).filter(b=>b.mode==='bone').length;
  return{
    schema:'onyx.professor-pass5-audit/v1',ok:required.every(x=>have.has(x))&&def.presentation?.environment?.attachToSprite===false&&boneBindings>=2,
    version:VERSION,pass:PASS,partCount:def.parts.length,rigCount:def.rigs.length,poseCount:def.poses.length,stateCount:def.states.length,transitionCount:def.transitions.length,
    portalGrid:def.render?.portalPixelGrid||[PORTAL_GRID,PORTAL_GRID],internalGrid:def.render?.internalGrid||[INTERNAL,INTERNAL],criticalPartCount:def.parts.filter(p=>p.pixelPriority==='critical').length,
    bindingCount:rig.bindings.length,boneBindingCount:boneBindings,identityAnchors:required,missing:required.filter(x=>!have.has(x)),environmentAttached:false,wasmRequired:false,
    refinements:['photo-refined-angular-head','cheek-and-chin-silhouette-tufts','smaller-round-professor-spectacles','almond-green-gold-eyes','consult-clipboard-gaze','pupil-attention-scaling','five-whisker-groups-with-micro-lift','established-dark-fur-ramp','fluffier-chest-ruff','shorter-rounded-advising-toe','bone-driven-forearm-rig','clipboard-consult-rig-settle','natural-part-pivots','slow-feline-blink','independent-ear-tracking','bowtie-settle','glasses-glint','internal-first-pixel-composition','80-cell-canonical-portal-grid','crisp-alpha-portal-threshold','final-five-pass-identity-lock','export-runtime-character-bridge','host-owned-environment-preserved','stable-pass5-version-ids','shared-signature-parts','canonical-green-plaid-bowtie']
  };
}

function init(){document.documentElement.dataset.onyxProfessorPass=String(PASS);window.dispatchEvent(new CustomEvent('onyx:advising-professor-ready',{detail:audit()}))}

window.OnyxAdvisingProfessor=Object.freeze({
  version:VERSION,pass:PASS,mood:'professor',logicalSize:[SOURCE,SOURCE],portalSize:[160,160],palette:clone(P),layers:clone(LAYERS),
  render,renderPortal,renderToContext,composeInternal,stateAt,rasterLayer,layerData,buildMasterParts,installMasters,behaviorDefinition,enhanceCompiled,exportRuntimeContract,audit
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
