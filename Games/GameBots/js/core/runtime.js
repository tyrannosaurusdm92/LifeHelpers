(function(ns){
  "use strict";

  const bots = new Map();
  const profiles = new Map();
  let activeSession = null;
  const VERSION = "1.0.0";

  const GAME_PROFILES = [
    {id:"8-ball-classic",titles:["8 Ball Classic"],paths:["Both/8ballclassic.html"],players:"2",maxBots:1,kind:"physics-turn",specific:["eight-ball-classic-bot"]},
    {id:"bad-ice-cream",titles:["Bad Ice-Cream"],paths:["Desktop/badicecream.html"],players:"2",maxBots:1,kind:"grid-action",specific:["bad-ice-cream-bot"]},
    {id:"bad-ice-cream-2",titles:["Bad Ice-Cream 2"],paths:["Desktop/badicecream2.html"],players:"2",maxBots:1,kind:"grid-action",specific:["bad-ice-cream-2-bot"]},
    {id:"bad-ice-cream-3",titles:["Bad Ice-Cream 3"],paths:["Desktop/badicecream3.html"],players:"2",maxBots:1,kind:"grid-action",specific:["bad-ice-cream-3-bot"]},
    {id:"house-of-hazards",titles:["House of Hazards"],paths:["Desktop/houseofhazards.html"],players:"2-4",maxBots:2,kind:"hazard-platform",specific:["house-of-hazards-bot-1","house-of-hazards-bot-2"]},
    {id:"rooftop-snipers-2",titles:["Rooftop Snipers 2"],paths:["Desktop/rooftopsnipers2.html"],players:"2",maxBots:1,kind:"one-button-duel",specific:["rooftop-snipers-2-bot"]},
    {id:"stick-archers-battle",titles:["Stick Archers Battle"],paths:["Desktop/stickarchersbattle.html"],players:"2",maxBots:1,kind:"projectile-duel",specific:["stick-archers-battle-bot"]},
    {id:"tag",titles:["Tag"],paths:["Desktop/tag.html"],players:"2-4",maxBots:2,kind:"chase",specific:["tag-bot-1","tag-bot-2"]},
    {id:"tube-jumpers",titles:["Tube Jumpers"],paths:["Desktop/tubejumpers.html"],players:"2-4",maxBots:2,kind:"one-button-survival",specific:["tube-jumpers-bot-1","tube-jumpers-bot-2"]},
    {id:"stick-fighter",titles:["Stick Fighter"],paths:["Both/stickfighter.html"],players:"2",maxBots:1,kind:"fighter",specific:["stick-fighter-bot"]},
    {id:"poor-bunny",titles:["Poor Bunny"],paths:["Both/poorbunny.html"],players:"2",maxBots:1,kind:"hazard-platform",specific:["poor-bunny-bot"]},
    {id:"temple-of-boom",titles:["Temple of Boom"],paths:["Both/templeofboom.html"],players:"2",maxBots:1,kind:"platform-shooter",specific:["temple-of-boom-bot"]},
    {id:"chess",titles:["Chess"],paths:["Both/chess.html"],players:"2",maxBots:1,kind:"turn-board",specific:["chess-bot"]}
  ];
  GAME_PROFILES.forEach(p=>profiles.set(p.id,p));

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const rand=(a=0,b=1)=>a+Math.random()*(b-a);
  const choice=arr=>arr && arr.length ? arr[Math.floor(Math.random()*arr.length)] : null;
  const now=()=>performance && performance.now ? performance.now() : Date.now();

  class InputDriver{
    constructor(frame){ this.frame=frame; this.down=new Set(); this.lastPointer={x:0,y:0}; }
    get win(){ try{return this.frame.contentWindow;}catch(_){return null;} }
    get doc(){ try{return this.frame.contentDocument||this.win.document;}catch(_){return null;} }
    target(){ const d=this.doc; return d && (d.activeElement || d.body || d.documentElement); }
    keyEvent(type,key,code){
      const w=this.win,d=this.doc; if(!w||!d) return false;
      const opts={key,code:code||key,bubbles:true,cancelable:true,composed:true};
      const e=new w.KeyboardEvent(type,opts);
      (this.target()||w).dispatchEvent(e); w.dispatchEvent(new w.KeyboardEvent(type,opts)); d.dispatchEvent(new w.KeyboardEvent(type,opts));
      return true;
    }
    downKey(key,code){ if(this.down.has(key))return; this.down.add(key); this.keyEvent("keydown",key,code); }
    upKey(key,code){ if(!this.down.has(key))return; this.down.delete(key); this.keyEvent("keyup",key,code); }
    tap(key,ms=65,code){ this.downKey(key,code); setTimeout(()=>this.upKey(key,code),ms); }
    setAxis(negative,positive,value,dead=.2){
      if(value<-dead){this.downKey(negative);this.upKey(positive);} else if(value>dead){this.downKey(positive);this.upKey(negative);} else {this.upKey(negative);this.upKey(positive);}
    }
    canvas(){ const d=this.doc; if(!d)return null; return d.querySelector("canvas")||d.querySelector("[role=application]")||d.body; }
    pointer(type,x,y,button=0){
      const w=this.win,t=this.canvas(); if(!w||!t)return false;
      const r=t.getBoundingClientRect? t.getBoundingClientRect():{left:0,top:0,width:t.clientWidth||800,height:t.clientHeight||600};
      const cx=r.left+clamp(x,0,1)*r.width, cy=r.top+clamp(y,0,1)*r.height;
      this.lastPointer={x,y};
      const C=w.PointerEvent||w.MouseEvent;
      t.dispatchEvent(new C(type,{bubbles:true,cancelable:true,clientX:cx,clientY:cy,button,buttons:type.includes("down")?1:0,pointerType:"mouse"}));
      return true;
    }
    click(x,y,hold=70){ this.pointer("pointermove",x,y); this.pointer("pointerdown",x,y); setTimeout(()=>this.pointer("pointerup",x,y),hold); }
    releaseAll(){ for(const k of [...this.down])this.upKey(k); }
  }

  class Observer{
    constructor(frame){this.frame=frame;this.prev=null;this.frameNo=0;}
    safeBridge(){
      try{
        const w=this.frame.contentWindow;
        const b=w && (w.LifeHelpersBotBridge||w.__LIFEHELPERS_GAMEBOT_BRIDGE__);
        if(b && typeof b.getState==="function") return b.getState();
        if(typeof w.__LIFEHELPERS_GAMEBOT_STATE__==="function") return w.__LIFEHELPERS_GAMEBOT_STATE__();
      }catch(_){ }
      return null;
    }
    textSnapshot(){
      try{
        const d=this.frame.contentDocument; if(!d)return "";
        return (d.body?.innerText||"").replace(/\s+/g," ").slice(0,2000);
      }catch(_){return "";}
    }
    sampleCanvas(){
      try{
        const d=this.frame.contentDocument,c=d&&d.querySelector("canvas"); if(!c||!c.width||!c.height)return null;
        const ctx=c.getContext("2d",{willReadFrequently:true}); if(!ctx)return null;
        const cols=12,rows=8, pts=[];
        for(let y=0;y<rows;y++) for(let x=0;x<cols;x++){
          const px=Math.floor((x+.5)*c.width/cols),py=Math.floor((y+.5)*c.height/rows);
          const data=ctx.getImageData(px,py,1,1).data;
          pts.push([data[0],data[1],data[2],data[3]]);
        }
        const motion=[];
        if(this.prev&&this.prev.length===pts.length){
          for(let i=0;i<pts.length;i++){
            const a=pts[i],b=this.prev[i]; motion[i]=Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2]);
          }
        }
        this.prev=pts;
        let sx=0,sy=0,sw=0;
        motion.forEach((m,i)=>{if(m>42){const x=i%cols,y=Math.floor(i/cols);sx+=x*m;sy+=y*m;sw+=m;}});
        return {cols,rows,motion,activity:sw?sw/motion.length:0,motionX:sw?(sx/sw)/(cols-1):.5,motionY:sw?(sy/sw)/(rows-1):.5};
      }catch(_){ return null; }
    }
    observe(){
      this.frameNo++;
      const bridge=this.safeBridge();
      const visual=this.frameNo%2===0?this.sampleCanvas():null;
      return {time:Date.now(),bridge,visual,text:this.frameNo%10===0?this.textSnapshot():""};
    }
  }

  class StrategyClient{
    constructor(){this.backendUrl="";this.minInterval=3500;this.last=0;this.pending=false;this.lastPlan=null;}
    configure(opts={}){if(opts.backendUrl!==undefined)this.backendUrl=opts.backendUrl||"";if(opts.minInterval)this.minInterval=opts.minInterval;}
    async request(payload){
      if(!this.backendUrl||this.pending||Date.now()-this.last<this.minInterval)return this.lastPlan;
      this.pending=true;this.last=Date.now();
      try{
        const body={action:"strategy",...payload,mode:"gameplay_strategy_only"};
        const r=await fetch(this.backendUrl,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(body)});
        if(!r.ok)throw new Error("LifeHelpers.gs HTTP "+r.status);
        const j=await r.json(); if(j&&j.ok!==false)this.lastPlan=j.plan||j.result||j; return this.lastPlan;
      }catch(e){console.warn("GameBots strategy backend unavailable; local bot continues.",e);return this.lastPlan;}
      finally{this.pending=false;}
    }
  }

  function utility(obs,weights={}){
    const v=obs.visual||{}, b=obs.bridge||{};
    return {
      motionX:Number.isFinite(v.motionX)?v.motionX:.5,
      motionY:Number.isFinite(v.motionY)?v.motionY:.5,
      activity:v.activity||0,
      health:b.health??b.hp??1,
      enemyX:b.enemy?.x??b.opponent?.x??null,
      enemyY:b.enemy?.y??b.opponent?.y??null,
      selfX:b.player?.x??b.self?.x??.5,
      selfY:b.player?.y??b.self?.y??.5,
      danger:b.danger??0,
      score:b.score??0,
      objective:b.objective||null,
      weights
    };
  }

  function simpleAStar(grid,start,goal){
    if(!grid||!grid.length)return [];
    const H=grid.length,W=grid[0].length,key=(x,y)=>x+","+y;
    const open=[{x:start.x,y:start.y,g:0,f:0,p:null}], seen=new Map();
    const h=(x,y)=>Math.abs(x-goal.x)+Math.abs(y-goal.y);
    while(open.length){
      open.sort((a,b)=>a.f-b.f); const n=open.shift(); const k=key(n.x,n.y);
      if(seen.has(k)&&seen.get(k)<=n.g)continue; seen.set(k,n.g);
      if(n.x===goal.x&&n.y===goal.y){const out=[];let q=n;while(q){out.push({x:q.x,y:q.y});q=q.p;}return out.reverse();}
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const x=n.x+dx,y=n.y+dy; if(x<0||y<0||y>=H||x>=W||grid[y][x])continue;
        const g=n.g+1;open.push({x,y,g,f:g+h(x,y),p:n});
      }
    }
    return [];
  }

  function minimax(state,depth,player,api,alpha=-Infinity,beta=Infinity){
    if(depth<=0||api.terminal(state))return {score:api.evaluate(state,player),move:null};
    const moves=api.moves(state); if(!moves.length)return {score:api.evaluate(state,player),move:null};
    let best={score:-Infinity,move:moves[0]};
    for(const move of moves){
      const next=api.apply(state,move); const r=minimax(next,depth-1,-player,api,-beta,-alpha);
      const score=-r.score; if(score>best.score)best={score,move}; alpha=Math.max(alpha,score); if(alpha>=beta)break;
    }
    return best;
  }

  class BotInstance{
    constructor(def,session,slot){this.def=def;this.session=session;this.slot=slot;this.enabled=false;this.lastTick=0;this.state={};this.plan=null;}
    start(){this.enabled=true;this.def.onStart?.(this.context());}
    stop(){this.enabled=false;this.session.input.releaseAll();this.def.onStop?.(this.context());}
    context(){return {ns,session:this.session,input:this.session.input,observer:this.session.observer,slot:this.slot,state:this.state,profile:this.session.profile,plan:this.plan,utils:ns.utils};}
    tick(obs,dt){if(!this.enabled)return;try{this.def.tick?.(obs,this.context(),dt);}catch(e){console.warn("Bot tick failed",this.def.id,e);}}
  }

  class Session{
    constructor(frame,game,profile){
      this.frame=frame;this.game=game;this.profile=profile;this.input=new InputDriver(frame);this.observer=new Observer(frame);this.strategy=new StrategyClient();this.instances=[];this.timer=null;this.last=now();
      this.strategy.configure(ns.config||{});
      const ids=profile?.specific||[];
      ids.forEach((id,i)=>{const def=bots.get(id);if(def)this.instances.push(new BotInstance(def,this,i+1));});
    }
    startLoop(){if(this.timer)return;this.last=now();this.timer=setInterval(()=>this.tick(),80);}
    tick(){const t=now(),dt=(t-this.last)/1000;this.last=t;const obs=this.observer.observe();for(const b of this.instances)b.tick(obs,dt);this.maybeStrategy(obs);}
    maybeStrategy(obs){
      if(!this.instances.some(b=>b.enabled)||!this.strategy.backendUrl)return;
      const snapshot={gameId:this.profile?.id,title:this.game?.title,visual:obs.visual,bridge:obs.bridge};
      this.strategy.request({game:snapshot,botIds:this.instances.filter(b=>b.enabled).map(b=>b.def.id),difficulty:ns.config?.difficulty||"normal"}).then(plan=>{if(plan)this.instances.forEach(b=>b.plan=plan);});
    }
    stop(){if(this.timer){clearInterval(this.timer);this.timer=null;}this.instances.forEach(b=>b.stop());this.input.releaseAll();}
    enable(slot=1){const b=this.instances[slot-1];if(!b)return false;b.start();this.startLoop();return true;}
    disable(slot=1){const b=this.instances[slot-1];if(!b)return false;b.stop();return true;}
    disableAll(){this.instances.forEach(b=>b.stop());}
    status(){return {game:this.profile?.id||null,available:this.instances.map(b=>({id:b.def.id,name:b.def.name,slot:b.slot,enabled:b.enabled})),maxBots:this.profile?.maxBots||0};}
  }

  function matchProfile(game){
    const title=(game?.title||"").toLowerCase(),path=(game?.path||"").toLowerCase();
    for(const p of profiles.values()){
      if(p.titles?.some(t=>t.toLowerCase()===title)||p.paths?.some(x=>x.toLowerCase()===path))return p;
    }
    return null;
  }

  ns.VERSION=VERSION;
  ns.config={backendUrl:"",difficulty:"normal",strategyInterval:3500};
  ns.configure=(opts={})=>{Object.assign(ns.config,opts);if(activeSession)activeSession.strategy.configure(ns.config);return {...ns.config};};
  ns.registerBot=def=>{if(!def||!def.id)throw new Error("GameBot requires id");bots.set(def.id,Object.freeze({...def}));return def;};
  ns.registerProfile=p=>{if(!p||!p.id)throw new Error("Game profile requires id");profiles.set(p.id,p);};
  ns.listBots=()=>[...bots.values()].map(b=>({id:b.id,name:b.name,type:b.type||"specific",games:b.games||[],seat:b.seat||null,archetype:b.archetype||null}));
  ns.listProfiles=()=>[...profiles.values()].map(p=>({...p}));
  ns.findProfile=matchProfile;
  ns.attachToFrame=(frame,game)=>{if(activeSession)activeSession.stop();const p=matchProfile(game);activeSession=new Session(frame,game,p);return activeSession.status();};
  ns.detach=()=>{if(activeSession)activeSession.stop();activeSession=null;};
  ns.enableBot=slot=>activeSession?activeSession.enable(slot):false;
  ns.disableBot=slot=>activeSession?activeSession.disable(slot):false;
  ns.disableAll=()=>activeSession?.disableAll();
  ns.getStatus=()=>activeSession?activeSession.status():{game:null,available:[],maxBots:0};
  ns.useUniversal=(id,frame,game,options={})=>{
    const def=bots.get(id);if(!def||def.type!=="universal")throw new Error("Unknown universal bot: "+id);
    if(activeSession)activeSession.stop();
    const p={id:game?.id||"custom",titles:[game?.title||"Custom Game"],paths:[game?.path||""],players:options.players||"unknown",maxBots:options.maxBots||1,specific:[id],controls:options.controls||{}};
    activeSession=new Session(frame,game,p);activeSession.enable(1);return activeSession.status();
  };
  ns.finalizeRegistration=()=>{ns.registrationSummary={bots:bots.size,specific:[...bots.values()].filter(b=>b.type!=="universal").length,universal:[...bots.values()].filter(b=>b.type==="universal").length,profiles:profiles.size};};
  ns.utils={clamp,rand,choice,utility,simpleAStar,minimax};
})(window.LifeHelpersGameBots=window.LifeHelpersGameBots||{});
