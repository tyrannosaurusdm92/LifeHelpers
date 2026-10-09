(function(global){
 'use strict'; const LF=global.SavanskiArtTools;
 class BrushEngine{
  constructor(ctx){this.ctx=ctx;this.last=null;}
  stamp(p,s={}){const c=this.ctx;c.save();c.globalCompositeOperation=s.composite||'source-over';c.globalAlpha=s.opacity??1;c.fillStyle=s.color||'#001010';const radius=Math.max(0.5,(s.size||24)*(s.pressure?Math.max(.1,p.pressure):1)/2);const jitter=s.jitter||0;const x=p.x+(Math.random()-.5)*jitter*radius*2,y=p.y+(Math.random()-.5)*jitter*radius*2;if(s.shape==='square'){c.fillRect(x-radius,y-radius,radius*2,radius*2);}else{c.beginPath();c.arc(x,y,radius,0,Math.PI*2);c.fill();}c.restore();}
  line(from,to,s={}){const d=Math.hypot(to.x-from.x,to.y-from.y);const spacing=Math.max(1,(s.size||24)*(s.spacing??0.12));const n=Math.max(1,Math.ceil(d/spacing));for(let i=0;i<=n;i++){const t=i/n;this.stamp({x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t,pressure:(from.pressure??.5)+((to.pressure??.5)-(from.pressure??.5))*t},s);}}
 }
 LF.BrushEngine=BrushEngine;
})(typeof window!=='undefined'?window:globalThis);
