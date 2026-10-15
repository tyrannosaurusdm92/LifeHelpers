/* Market Madness: connect matching fresh ingredients, including seafood.
   The fifty authored topologies supply mechanics for generated recipe boards. */
(function(w){'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const key=(x,y)=>x+':'+y;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const FRAGMENTS_PER_INGREDIENT=6;
const visibleGoal=goal=>`${Math.floor(Math.max(0,Number(goal?.count)||0)/FRAGMENTS_PER_INGREDIENT)}/${Math.max(1,Math.ceil(Math.max(0,Number(goal?.target)||0)/FRAGMENTS_PER_INGREDIENT))}`;
function randFn(seed){let n=(seed||1)>>>0;return()=>((n=Math.imul(n,1664525)+1013904223>>>0)/4294967296)}
const markIcon={portal:'⇄',conveyor:'➜',spawner:'↓',gate:'▣','keyhole-lock':'🔒',key:'⚿','ingredient-exit':'⇩','order-tray':'▤'};
const specialGlyph={row:'↔',col:'↕',blast:'✹',zap:'⚡'};
const specialColors={row:'cyan',col:'orange',blast:'lime',zap:'yellow'};
const meats=/^(chicken|beef|ground beef|ground chicken|ground turkey|pork|turkey)/i;
function paletteFor(def){
  const pool=w.MEOWBoardData.market;
  const ms=pool.filter(x=>meats.test(x.name)),veg=pool.filter(x=>!meats.test(x.name));
  return [ms[(def.number-1)%ms.length],veg[(def.number*3)%veg.length],veg[(def.number*3+3)%veg.length],ms[(def.number+3)%ms.length],veg[(def.number*3+6)%veg.length],veg[(def.number*3+9)%veg.length]];
}
class MarketBoard{
 constructor(def,host,{compact=false,parent=null,palette=null,goals=null}={}){
  this.def=def;this.host=host;this.compact=compact;this.parent=parent;
  this.palette=palette||paletteFor(def);this.rand=randFn((def.seed||((def.number||1)*19213))+(compact?901:22));
  this.w=def.size.width;this.h=def.size.height;
  this.grid=Array.from({length:this.h},(_,y)=>Array.from({length:this.w},(_,x)=>def.rows[y]?.[x]==='1'?{piece:Math.floor(this.rand()*this.palette.length),special:null}:null));
  this.cells=new Map();this.path=[];this.pointerId=null;this.cursor={x:0,y:0};this.lastMove=0;this.holding=false;this.precision=false;this.busy=false;this.paused=false;
  // Bon recipes now ask for six hidden collection fragments per full ingredient.
  // Give the main board enough moves to make that longer route playable.
  const targetFragments=(goals||[]).reduce((sum,g)=>sum+g.target,0);
  this.moves=compact?20:Math.max(48,Math.min(160,Math.ceil(targetFragments*this.palette.length/Math.max(1,(goals||[]).length)/3*1.5)));this.score=0;this.progress=0;this.collected={};
  this.goals=!compact && Array.isArray(goals) && goals.length ? goals.map(g=>({...g,count:0})) : compact?[{id:this.palette[0].id,target:5,count:0}]:[
   {id:this.palette[0].id,target:Math.max(5,Math.min(10,Math.round((def.objective?.targetCount||14)*.5))),count:0},
   {id:this.palette[1].id,target:Math.max(4,Math.min(9,Math.round((def.objective?.targetCount||14)*.4))),count:0}];
  this.blockers=new Map((def.blockers||[]).map(a=>[key(a.x,a.y),{kind:a.token||'block',layer:Math.max(1,Number(String(a.token||'').match(/\d+/)?.[0]||1))}]));
  this.hazards=new Map((def.hazards||[]).map(a=>[key(a.x,a.y),{kind:a.kind,layer:Math.max(1,+a.layer||1)}]));
  this.markers=new Map();(def.mechanicMarkers||[]).forEach(m=>this.markers.set(key(m.x,m.y),[...(this.markers.get(key(m.x,m.y))||[]),m]));
  this.completed=false;this.failed=false;this.satellites=[];this.renderBase();this.ensureChain();this.refresh();
 }
 getCell(x,y){return this.grid[y]?.[x]??null}
 valid(x,y){return !!this.getCell(x,y)}
 locked(x,y){return (this.blockers.get(key(x,y))?.layer||0)>0||(this.hazards.get(key(x,y))?.layer||0)>1&&/honey|vine|thorn/.test(this.hazards.get(key(x,y)).kind)}
 targetName(id){return this.palette.find(t=>t.id===id)?.name||id}
 renderBase(){
  const root=document.createElement('section');this.root=root;root.className='meow-market'+(this.compact?' is-satellite':'');
  if(!this.compact){root.innerHTML='<div class="mm-head"><div class="mm-name"><strong>MARKET MADNESS</strong><small>CONNECT MATCHING FRESH INGREDIENTS · 3+ TILES</small></div><div class="mm-goals" aria-live="polite"></div><div class="mm-moves"></div></div><div class="mm-scroll"><div class="mm-play"><div class="mm-grid" role="grid" aria-label="Market Madness ingredient connection board"></div><svg class="mm-trace" aria-hidden="true" preserveAspectRatio="none"></svg></div></div><div class="mm-foot"><span>DRAG A CONNECTED PATH, OR SELECT TILES THEN CONFIRM WITH B</span><span class="mm-feedback" role="status" aria-live="polite"></span></div><div class="mm-satellites" hidden></div>';if(this.def.generation)root.querySelector('.mm-name strong').textContent='MARKET MADNESS · #'+this.def.generation.serial}
  else root.innerHTML='<div class="mm-sat-head"></div><div class="mm-scroll"><div class="mm-play"><div class="mm-grid" role="grid" aria-label="Linked Market board"></div><svg class="mm-trace" aria-hidden="true" preserveAspectRatio="none"></svg></div></div><div class="mm-sat-bottom" aria-live="polite"></div>';
  this.host.appendChild(root);this.gridEl=root.querySelector('.mm-grid');this.traceSvg=root.querySelector('.mm-trace');this.scroller=root.querySelector('.mm-scroll');this.playEl=root.querySelector('.mm-play');
  this.gridEl.style.setProperty('--cols',this.w);this.gridEl.style.setProperty('--rows',this.h);
  for(let y=0;y<this.h;y++)for(let x=0;x<this.w;x++){
   const b=document.createElement('button');b.type='button';b.className='mm-tile';b.dataset.x=x;b.dataset.y=y;
   if(!this.valid(x,y)){b.classList.add('hole');b.disabled=true;b.tabIndex=-1}
   else b.setAttribute('role','gridcell');
   this.gridEl.appendChild(b);if(this.valid(x,y))this.cells.set(key(x,y),b);
  }
  // Pointer capture on the grid enables tracing across adjacent buttons reliably on touch and mouse.
  this.gridEl.addEventListener('pointerdown',e=>{
   if(this.paused||this.completed||this.failed||this.busy)return;
   const c=this.hit(e.clientX,e.clientY);if(!c)return;
   e.preventDefault();this.pointerId=e.pointerId;this.gridEl.setPointerCapture(e.pointerId);
   this.pointerStartLength=this.path.length;
   if(!this.path.length||this.path.length>=3&&!this.adjacent(this.path.at(-1),c))this.path=[];
   this.extend(c);this.cursor={...c};this.refresh();
  });
  this.gridEl.addEventListener('pointermove',e=>{
   if(this.pointerId!==e.pointerId)return;
   const c=this.hit(e.clientX,e.clientY);if(c)this.extend(c);
  });
  const finish=e=>{if(e.pointerId!==this.pointerId)return;this.pointerId=null;
    if(this.path.length>=3&&this.path.length>this.pointerStartLength+1)this.commit();
    else this.refresh();
  };
  this.gridEl.addEventListener('pointerup',finish);this.gridEl.addEventListener('pointercancel',()=>{this.pointerId=null;this.cancel()});
  // Allow a disconnected cursor to navigate via shell controls while the viewport scrolls.
  root.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();this.extend(this.cursor);}});
  if(!this.compact){const slot=root.querySelector('.mm-satellites');
    for(const s of this.def.satelliteBoards||[]){
     const wrap=document.createElement('div');wrap.className='mm-satellite-card';slot.appendChild(wrap);
     const subDef={...s,number:this.def.number,seed:(this.def.seed||this.def.number*19213)+this.satellites.length*32749,blockers:[],hazards:[],mechanicMarkers:[],satelliteBoards:[]};
     const sat=new MarketBoard(subDef,wrap,{compact:true,parent:this,palette:this.palette});this.satellites.push({board:sat,definition:s,wrap});
    }
    if(this.satellites.length)slot.hidden=false;
  }
  this.fit();if(w.ResizeObserver){this.observer=new ResizeObserver(()=>this.fit());this.observer.observe(this.scroller)}
 }
 hit(clientX,clientY){const b=document.elementFromPoint(clientX,clientY)?.closest('.mm-tile');
   if(!b||!this.gridEl.contains(b)||b.classList.contains('hole'))return null;
   return {x:+b.dataset.x,y:+b.dataset.y};}
 adjacent(a,b){return Math.abs(a.x-b.x)<=1&&Math.abs(a.y-b.y)<=1&&(a.x!==b.x||a.y!==b.y)}
 extend(c){if(this.paused||this.busy||this.completed||this.failed||!this.valid(c.x,c.y)||this.locked(c.x,c.y))return false;
   const before=this.path.at(-1),previous=this.path.at(-2),t=this.getCell(c.x,c.y);
   if(previous&&previous.x===c.x&&previous.y===c.y){this.path.pop();this.refresh();return true}
   if(this.path.some(p=>p.x===c.x&&p.y===c.y))return false;
   if(before&&(!this.adjacent(before,c)||this.getCell(before.x,before.y)?.piece!==t.piece))return false;
   this.path.push(c);this.refresh();return true;
 }
 cancel(){this.path=[];this.holding=false;this.refresh()}
 ensureChain(){
   // Full-grid fresh refill plus seeded fallback guarantees a visible legal 3-chain in accessible cells.
   if(this.hasChain())return;
   for(let y=0;y<this.h;y++)for(let x=0;x<this.w;x++)if(this.valid(x,y)&&!this.locked(x,y))this.getCell(x,y).piece=Math.floor(this.rand()*this.palette.length);
   if(this.hasChain())return;
   const triple=[];
   for(let y=0;y<this.h;y++)for(let x=0;x<this.w;x++)if(this.valid(x,y)&&!this.locked(x,y)){
     for(const dx of [-1,0,1])for(const dy of [-1,0,1]){
       if(!dx&&!dy)continue;const a={x:x+dx,y:y+dy};
       if(!this.valid(a.x,a.y)||this.locked(a.x,a.y))continue;
       for(const ex of [-1,0,1])for(const ey of [-1,0,1]){
         const b={x:a.x+ex,y:a.y+ey};if(!ex&&!ey||!this.valid(b.x,b.y)||this.locked(b.x,b.y)||b.x===x&&b.y===y)continue;
         triple.push({x,y},a,b);break;
       }if(triple.length)break;
     }if(triple.length)break;
   }
   if(triple.length)for(const p of triple)this.getCell(p.x,p.y).piece=0;
 }
 hasChain(){
  for(let y=0;y<this.h;y++)for(let x=0;x<this.w;x++){
   if(!this.valid(x,y)||this.locked(x,y))continue;
   const seen=new Set([key(x,y)]),q=[{x,y}];let i=0;
   while(i<q.length){const p=q[i++];
     for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){
       if(!dx&&!dy)continue;const xx=p.x+dx,yy=p.y+dy,k=key(xx,yy);
       if(seen.has(k)||!this.valid(xx,yy)||this.locked(xx,yy)||this.getCell(xx,yy).piece!==this.getCell(x,y).piece)continue;
       seen.add(k);q.push({x:xx,y:yy});if(q.length>=3)return true;
     }
   }
  }return false;
 }
 specials(chain){return chain.length>=12?'zap':chain.length>=8?'blast':chain.length>=5?'row':null}
 commit(){
   if(this.path.length<3){this.notice('Connect at least 3 adjacent matching ingredients.');return false}
   if(this.paused||this.busy||this.completed||this.failed)return false;
   const path=[...this.path],special=this.specials(path);this.path=[];this.moves=Math.max(0,this.moves-1);
   const clear=new Set(path.map(c=>key(c.x,c.y))),activated=new Set();
   const burst=(pos,s)=>{
    if(s==='row')for(let x=0;x<this.w;x++)if(this.valid(x,pos.y))clear.add(key(x,pos.y));
    if(s==='col')for(let y=0;y<this.h;y++)if(this.valid(pos.x,y))clear.add(key(pos.x,y));
    if(s==='blast')for(let y=pos.y-1;y<=pos.y+1;y++)for(let x=pos.x-1;x<=pos.x+1;x++)if(this.valid(x,y))clear.add(key(x,y));
    if(s==='zap')for(let y=0;y<this.h;y++)for(let x=0;x<this.w;x++)if(this.valid(x,y)&&this.rand()<.65)clear.add(key(x,y));
   };
   for(let n=0;n<3;n++){let changed=false;
     for(const k of [...clear]){if(activated.has(k))continue;const [x,y]=k.split(':').map(Number),s=this.getCell(x,y)?.special;
      if(s){activated.add(k);burst({x,y},s);changed=true}}
     if(!changed)break;
   }
   let total=0;const reached=[];
   for(const k of clear){const [x,y]=k.split(':').map(Number),t=this.getCell(x,y);if(!t)continue;
    const own=this.blockers.get(k);if(own&&own.layer>0){own.layer--;if(own.layer<=0)this.blockers.delete(k);continue}
    const target=this.palette[t.piece];if(target){
     // Keep a hidden receipt for every cleared ingredient, including decoys.
     // The integrated cartridge converts six receipts into one Bon stock portion.
     this.collected[target.id]=(this.collected[target.id]||0)+1;
     for(const goal of this.goals)if(target.id===goal.id){goal.count=Math.min(goal.target,goal.count+1);reached.push(target.id)}
     total++;this.score+=10+(path.length>=8?6:0);
    }
    t.piece=null;t.special=null;
    // Adjacent damage peels hazards/blockers, keeping original board placement meaningful.
    for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)if(Math.abs(dx)+Math.abs(dy)===1){const kk=key(x+dx,y+dy),h=this.hazards.get(kk),b=this.blockers.get(kk);
      if(h&&--h.layer<=0)this.hazards.delete(kk);
      if(b&&--b.layer<=0)this.blockers.delete(kk);
    }
   }
   const combo=path.length>=12?3:path.length>=8?2:path.length>=5?1.5:1;
   this.score+=Math.round(total*5*combo);
   this.gravity();this.applyMarkers();this.ensureChain();
   if(special){const anchor=path.at(-1);let item=this.getCell(anchor.x,anchor.y);
    if(!item){for(let y=0;y<this.h&&!item;y++)for(let x=0;x<this.w&&!item;x++)if(this.getCell(x,y))item=this.getCell(x,y)}
    if(item)item.special=path.length>=12?'zap':path.length>=8?'blast':path.length>=5?(this.rand()<.5?'row':'col'):null;
   }
   this.progress=this.goals.reduce((a,g)=>a+g.count,0);
   this.notice(path.length+' linked · '+total+' collected'+(special?' · PAW SPECIAL!':''));
   w.dispatchEvent(new CustomEvent('market-madness:trace-resolved',{detail:{length:path.length,collected:total,special,score:this.score}}));
   this.refresh();
   if(this.goals.every(g=>g.count>=g.target)){this.completed=true;this.end(true)}
   else if(this.moves===0){this.failed=true;this.end(false)}
   if(this.compact&&this.completed&&this.parent)this.parent.satelliteSolved(this);
   return true;
 }
 gravity(){for(let x=0;x<this.w;x++){
  let y=0;while(y<this.h){while(y<this.h&&!this.valid(x,y))y++;if(y>=this.h)break;
   const seg=[];while(y<this.h&&this.valid(x,y))seg.push(y++);
   const states=seg.map(yy=>this.grid[yy][x]).filter(t=>t.piece!=null).map(t=>({...t}));
   while(states.length<seg.length)states.unshift({piece:Math.floor(this.rand()*this.palette.length),special:null});
   seg.forEach((yy,i)=>this.grid[yy][x]=states[i]);
  }
 }}
 applyMarkers(){
  // Portals exchange tile contents; conveyors cycle the contiguous segment.
  const portals=new Map();for(const [k,arr] of this.markers)for(const m of arr)if(m.type==='portal'){
    const list=portals.get(m.pairId)||[];list.push(k);portals.set(m.pairId,list);
  }
  for(const pair of portals.values())if(pair.length>=2){const [ax,ay]=pair[0].split(':').map(Number),[bx,by]=pair[1].split(':').map(Number);if(this.valid(ax,ay)&&this.valid(bx,by)){const t=this.grid[ay][ax];this.grid[ay][ax]=this.grid[by][bx];this.grid[by][bx]=t}}
  for(const [k,arr] of this.markers)for(const m of arr)if(m.type==='conveyor'){
    const [x,y]=k.split(':').map(Number),dir=m.direction||'right';const dx=dir==='right'?1:dir==='left'?-1:0,dy=dir==='down'?1:dir==='up'?-1:0;
    if(!this.valid(x+dx,y+dy))continue;const t=this.grid[y][x];this.grid[y][x]=this.grid[y+dy][x+dx];this.grid[y+dy][x+dx]=t;
  }
 }
 satelliteSolved(sat){const found=this.satellites.find(s=>s.board===sat);if(!found)return;
  const e=found.definition.effect||{},type=e.type||'';
  if(type==='add-main-moves')this.moves+=Number(e.amount)||3;
  else if(type==='clear-main-blockers'){for(const c of e.cells||[]){this.blockers.delete(key(c.x,c.y));this.hazards.delete(key(c.x,c.y))}}
  else if(/unlock|open-main-gate|open-main-bridge/.test(type)){for(const c of e.cells||[]){const k=key(c.x,c.y);this.blockers.delete(k);this.hazards.delete(k);
    if(!this.valid(c.x,c.y)&&this.grid[c.y]){this.grid[c.y][c.x]={piece:Math.floor(this.rand()*this.palette.length),special:null};const cell=this.gridEl.children[c.y*this.w+c.x];cell.classList.remove('hole');cell.disabled=false;this.cells.set(k,cell)}}}
  else if(type==='shift-main-gravity')this.moves+=2;
  else if(type==='charge-main-booster')this.moves++;
  else if(/drop-ingredient|release-main-seeds/.test(type)){for(let i=0;i<(Number(e.count)||3);i++)this.score+=15;}
  this.notice('Linked market board complete · main board updated');this.refresh();
 }
 notice(text){const el=this.root.querySelector('.mm-feedback');if(el)el.textContent=text;else this.root.querySelector('.mm-sat-bottom').textContent=text}
 hint(){for(let y=0;y<this.h;y++)for(let x=0;x<this.w;x++)if(this.valid(x,y)&&!this.locked(x,y)){
   const id=this.getCell(x,y).piece,chain=[{x,y}],seen=new Set([key(x,y)]);
   while(chain.length<3){let next=null;for(const p of chain)for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
     const xx=p.x+dx,yy=p.y+dy;if(dx===0&&dy===0||seen.has(key(xx,yy))||!this.valid(xx,yy)||this.locked(xx,yy)||this.getCell(xx,yy).piece!==id)continue;
     next={x:xx,y:yy};break;
   }if(!next)break;chain.push(next);seen.add(key(next.x,next.y))}
   if(chain.length===3){for(const p of chain){const cell=this.cells.get(key(p.x,p.y));cell?.classList.add('mm-hint');setTimeout(()=>cell?.classList.remove('mm-hint'),1800)}this.notice('Hint: connect the flashing ingredients');return true;}
  }this.notice('No clear path — shuffle available');return false;
 }
 booster(id){if(this.paused||this.completed||this.failed)return;
  const p=this.cursor,types=['row','col','blast','zap'];
  if(id==='shuffle'||id==='2'){for(let y=0;y<this.h;y++)for(let x=0;x<this.w;x++)if(this.valid(x,y))this.getCell(x,y).piece=Math.floor(this.rand()*this.palette.length);this.ensureChain();this.notice('Market shuffled');}
  else if(id==='hint'||id==='9'){this.hint();return}
  else if(id==='3'){this.moves+=3;this.notice('+3 moves')}
  else if(id==='6'){for(const k of [...this.hazards.keys()].slice(0,3))this.hazards.delete(k);this.notice('Three hazards cleared')}
  else {const item=this.getCell(p.x,p.y);if(item){item.special=types[clamp((Number(id)||1)-1,0,3)];this.notice('PAW SPECIAL planted — include this tile in your chain')}}
  this.refresh();
 }
 end(success){
  if(!this.compact){
   const el=document.createElement('div');el.className='meow-board-result';
   const card=document.createElement('div');card.className='meow-result-card';
   card.innerHTML='<h2>'+(success?'MARKET COMPLETE!':'OUT OF MOVES')+'</h2><p>'+esc(this.def.name)+' · '+this.score+' points</p>';
   const retry=document.createElement('button');retry.textContent='NEW BOARD';retry.onclick=()=>w.MEOWGame?.start('market');
   const game=document.createElement('button');game.textContent='GAME / BOARD LOADER';game.onclick=()=>w.MEOWShell.openPanel('game');
   card.append(retry,game);el.appendChild(card);this.root.appendChild(el);
   w.dispatchEvent(new CustomEvent('meow:boardcomplete',{detail:{phase:'MARKET_MADNESS',board:this.def.number,serial:this.def.generation?.serial,success,score:this.score,inventory:Object.fromEntries(Object.entries(this.collected))}}));
   w.MEOWGame?.sync?.();
  }
 }
 fit(){
  const available=this.scroller.clientWidth, height=this.scroller.clientHeight;
  if(!available||!height)return;
  const roomW=Math.max(180,available-(this.compact?24:20));
  const roomH=Math.max(150,height-(this.compact?12:15));
  const cap=this.compact?38:70;
  const size=Math.floor(Math.min(cap,(roomW-12-(this.w-1)*3)/this.w,(roomH-12-(this.h-1)*3)/this.h));
  this.gridEl.style.setProperty('--tile',clamp(size,this.compact?17:20,cap)+'px');
  requestAnimationFrame(()=>this.drawLine());
 }
 drawLine(){const rect=this.gridEl.getBoundingClientRect(),pts=this.path.map(p=>{
   const box=this.cells.get(key(p.x,p.y))?.getBoundingClientRect();return box?`${box.left+box.width/2-rect.left},${box.top+box.height/2-rect.top}`:'';
  }).filter(Boolean);
  this.traceSvg.setAttribute('viewBox',`0 0 ${Math.max(1,rect.width)} ${Math.max(1,rect.height)}`);
  this.traceSvg.replaceChildren();if(pts.length){
   const path=document.createElementNS('http://www.w3.org/2000/svg','polyline');path.setAttribute('points',pts.join(' '));path.setAttribute('fill','none');path.setAttribute('stroke','#fff600');path.setAttribute('stroke-width','7');path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');this.traceSvg.append(path)
  }
 }
 refresh(){
  const inPath=new Set(this.path.map(p=>key(p.x,p.y)));
  for(const [k,b] of this.cells){const [x,y]=k.split(':').map(Number),t=this.grid[y][x];if(!t)continue;
   const asset=this.palette[t.piece]||this.palette[0];
   const parts=['<img src="',esc(asset.path),'" alt="" draggable="false">'];
   if(t.special)parts.push('<span class="mm-paw ',specialColors[t.special],'" title="',t.special,' special">',specialGlyph[t.special],'</span>');
   const block=this.blockers.get(k),haz=this.hazards.get(k),markers=this.markers.get(k)||[];
   if(block)parts.push('<span class="mm-block" title="',esc(block.kind),' blocker">▣',block.layer,'</span>');
   if(haz)parts.push('<span class="mm-hazard" title="',esc(haz.kind),' · ',haz.layer,' layers">',haz.kind==='bee'?'🐝':haz.kind==='flower'?'✿':haz.kind==='thorn'?'♠':haz.kind==='vine'?'♣':'◈',haz.layer,'</span>');
   if(markers.length)parts.push('<span class="mm-marker" title="',esc(markers[0].type),'">',markIcon[markers[0].type]||'◆','</span>');
   b.innerHTML=parts.join('');b.title=asset.name+(block?', blocked':'')+(haz?', hazard '+haz.kind:'');
   b.setAttribute('aria-label',asset.name+' column '+(x+1)+' row '+(y+1));
   b.classList.toggle('selected',inPath.has(k));b.classList.toggle('mm-cursor',this.cursor.x===x&&this.cursor.y===y);
   b.disabled=this.paused||this.busy||this.completed||this.failed||this.locked(x,y);
  }
  if(!this.compact){
   const goal=this.root.querySelector('.mm-goals');goal.replaceChildren();
   for(const g of this.goals){const el=document.createElement('span');const a=this.palette.find(i=>i.id===g.id);el.className='mm-goal';el.innerHTML='<img src="'+esc(a.path)+'" alt=""> <b>'+esc(a.name)+'</b> <strong>'+visibleGoal(g)+'</strong>';goal.appendChild(el)}
   this.root.querySelector('.mm-moves').textContent='MOVES '+this.moves+' · SCORE '+this.score;
  }else{this.root.querySelector('.mm-sat-head').textContent=this.def.name+' · linked';this.root.querySelector('.mm-sat-bottom').textContent=this.goals[0].count+'/'+this.goals[0].target+' collected';}
  this.drawLine();
  if(!this.compact)w.MEOWGame?.syncSoon?.();
 }
 control(ev){if(this.paused||this.completed||this.failed)return;
  if(ev.type==='joystick:move'&&ev.stick==='left'&&ev.active){
   const now=performance.now();if(now-this.lastMove<(ev.inputSource==='keyboard'?100:165)*(this.precision?1.7:1))return;
   const dx=Math.abs(ev.x)>.35?Math.sign(ev.x):0,dy=Math.abs(ev.y)>.35?Math.sign(ev.y):0;
   if(!dx&&!dy)return;this.lastMove=now;
   const axis=Math.abs(ev.x)>Math.abs(ev.y)?{x:dx,y:0}:{x:0,y:dy};
   const tx=this.cursor.x+axis.x,ty=this.cursor.y+axis.y;
   if(this.valid(tx,ty)&&!this.locked(tx,ty)){this.cursor={x:tx,y:ty};if(this.holding)this.extend(this.cursor);else this.refresh()}
  }
  if(ev.type==='button'){
   if(ev.key==='Z'){this.precision=ev.state==='down';this.root.classList.toggle('meow-precision',this.precision);return;}
   if(ev.key==='R'||ev.key==='Y'){
    if(ev.state==='down'){this.holding=true;this.extend(this.cursor)}
    else if(ev.state==='up'){this.holding=false;if(this.path.length>=3)this.commit()}
   }else if(ev.state==='down'&&ev.key==='B')this.commit();
   else if(ev.state==='down'&&ev.key==='A')this.cancel();
   else if(ev.state==='down'&&ev.key==='X'){const t=this.getCell(this.cursor.x,this.cursor.y);this.notice(t?this.palette[t.piece].name:'No ingredient')}
  }
 }
 setPaused(v){this.paused=!!v;this.root.classList.toggle('meow-is-paused',this.paused);this.refresh();for(const s of this.satellites)s.board.setPaused(v)}
 destroy(){this.observer?.disconnect();for(const s of this.satellites)s.board.destroy();this.root.remove()}
}
w.MEOWMarket={create:(def,host,options)=>{const game=new MarketBoard(def,host,options);w.MEOWBoardGenerator?.opening(game);return game},paletteFor};
})(window);
