
(function(root){
"use strict";
if(!root.GardenGame||!root.GardenGame.Game)return;
var G=root.GardenGame.Game.prototype;
function q(sel,host){return (host||document).querySelector(sel)}
function qa(sel,host){return Array.prototype.slice.call((host||document).querySelectorAll(sel))}
function key(x,y){return x+":"+y}
function wait(ms){return new Promise(function(r){setTimeout(r,ms)})}
function pct(n,d){return d?Math.max(0,Math.min(100,Math.round(n/d*100))):0}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return c==="&"?"&amp;":c==="<"?"&lt;":c===">"?"&gt;":"&quot;"})}

function seeded(seed){var s=(seed||1)>>>0;return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function hash(board,x,y){return ((board*97)+(x*37)+(y*53)+17)%997}
function shuffle(list,rand){for(var i=list.length-1;i>0;i--){var j=Math.floor(rand()*(i+1)),t=list[i];list[i]=list[j];list[j]=t}return list}
function parseK(k0){var a=k0.split(':');return {x:+a[0],y:+a[1]}}

function assignUnderlaysFor(game, getter){
  var coords=[], x, y, rows=game.def.rows||[];
  for(y=0;y<rows.length;y++) for(x=0;x<rows[y].length;x++) if(getter(x,y)) coords.push({x:x,y:y,h:hash(game.def.number||1,x,y)});
  coords.sort(function(a,b){return a.h-b.h});
  var underlays=Object.create(null), seeds=['row','col','burst9','zapper'];
  seeds.forEach(function(t,i){ if(coords[i]) underlays[key(coords[i].x,coords[i].y)] = t; });
  var extraChance=(game.def.satelliteBoards&&game.def.satelliteBoards.length)?24:16;
  coords.forEach(function(c,idx){
    var k0=key(c.x,c.y); if(underlays[k0]) return;
    var v=(c.h + idx*11) % 100;
    if(v<extraChance){ underlays[k0] = v<6?'row':v<11?'col':v<14?'burst9':'zapper'; }
  });
  return underlays;
}
function randomBoardCells(game, ratio, rand, playableFn){
  var cells=[], x, y, rows=game.def.rows||[];
  for(y=0;y<rows.length;y++) for(x=0;x<rows[y].length;x++) if(playableFn(x,y)) cells.push({x:x,y:y});
  shuffle(cells,rand);
  return cells.slice(0, Math.max(1, Math.floor(cells.length*ratio)));
}

var oldBuildState=G.buildState;
G.buildState=function(){
  oldBuildState.call(this);
  this.underlays=assignUnderlaysFor(this, this.playable.bind(this));
};

G.pass3ExpandUnderlays=function(baseSet){
  if(!this.underlays) return baseSet;
  var all=new Set(baseSet), queue=Array.from(baseSet), triggered=new Set(), safety=0, self=this;
  while(queue.length && safety<600){
    safety++;
    var kk=queue.shift();
    if(triggered.has(kk)) continue;
    triggered.add(kk);
    var kind=this.underlays[kk];
    if(!kind) continue;
    delete this.underlays[kk];
    var p=parseK(kk), cells=[];
    if(kind==='row'){
      for(var xx=0; xx<this.def.size.width; xx++) if(this.playable(xx,p.y)) cells.push({x:xx,y:p.y});
    }else if(kind==='col'){
      for(var yy=0; yy<this.def.size.height; yy++) if(this.playable(p.x,yy)) cells.push({x:p.x,y:yy});
    }else if(kind==='burst9'){
      for(var yy=Math.max(0,p.y-1); yy<=Math.min(this.def.size.height-1,p.y+1); yy++) for(var xx=Math.max(0,p.x-1); xx<=Math.min(this.def.size.width-1,p.x+1); xx++) if(this.playable(xx,yy)) cells.push({x:xx,y:yy});
    }else if(kind==='zapper'){
      cells=randomBoardCells(this,0.65,this.rand.bind(this),function(x,y){ return self.playable(x,y) && self.grid[y] && self.grid[y][x]; });
    }
    cells.forEach(function(c){ var k2=key(c.x,c.y); if(!all.has(k2)){ all.add(k2); queue.push(k2); } });
  }
  return all;
};

var oldBuild=G.build;
G.build=function(){
  oldBuild.call(this);
  this.shell.dataset.referencePass='3';
  if(this.def.satelliteBoards&&this.def.satelliteBoards.length){
    if(this.gridEl) this.gridEl.classList.add('hybrid-main');
    var plaque=q('.board-reference-plaque',this.shell);
    if(plaque && !q('.hybrid-chip',plaque)){
      var chip=document.createElement('span');
      chip.className='hybrid-chip';
      chip.textContent='Swap + Trace';
      plaque.appendChild(chip);
    }
  }
  var right=q('.right-ui-content',this.shell);
  if(right && !q('.underlay-legend-card',right)){
    var card=document.createElement('section');
    card.className='ui-card underlay-legend-card';
    card.innerHTML='<h3>Special paw underlays</h3><div class="underlay-legend">'
      +'<div class="underlay-legend-item"><i class="underlay-swatch underlay-cyan"></i><span><b>Cyan paw</b><br>horizontal row clear</span></div>'
      +'<div class="underlay-legend-item"><i class="underlay-swatch underlay-orange"></i><span><b>Orange paw</b><br>vertical row clear</span></div>'
      +'<div class="underlay-legend-item"><i class="underlay-swatch underlay-lime"></i><span><b>Lime green paw</b><br>3×3 nine-square clear</span></div>'
      +'<div class="underlay-legend-item"><i class="underlay-swatch underlay-yellow"></i><span><b>Yellow paw</b><br>65% random board-tile zapper</span></div>'
      +'<div class="underlay-legend-item"><i class="underlay-swatch" style="background:transparent"></i><span><b>No paw</b><br>nothing under the tile</span></div>'
      +'</div>';
    right.appendChild(card);
  }
  var help=q('.help-copy', this.shell); if(help && this.def.satelliteBoards&&this.def.satelliteBoards.length && !q('.hybrid-mode-copy', this.shell)){
    var p=document.createElement('p'); p.className='hybrid-mode-copy'; p.textContent='Hybrid boards use Candy Crush-style swaps on the main board and Pudding Pop-style trace chains on linked side boards.'; help.appendChild(p);
  }
  this.renderAll();
};

var oldRender=G.renderCell;
G.renderCell=function(x,y){
  oldRender.call(this,x,y);
  var el=this.cellEls&&this.cellEls[key(x,y)]; if(!el) return;
  var uk=(this.underlays&&this.underlays[key(x,y)])||'';
  el.classList.toggle('has-underlay', !!uk);
  if(uk) el.dataset.underlay=uk; else delete el.dataset.underlay;
};

G.resolve=async function(match,anchor){
  var cascade=0;
  while(match.cells.size && cascade<12 && !this.disposed){
    cascade++; this.combo=cascade;
    var all=this.pass3ExpandUnderlays(this.expandSpecials(match)), self=this, keep=null, best=match.groups.slice().sort(function(a,b){return b.cells.length-a.cells.length})[0];
    // Recipe accounting must run in the ACTIVE Pass3 resolver, not the earlier overridden resolver.
    this._trackRecipeMatches?.(all);
    if(best&&best.cells.length>=4){
      keep=(anchor&&all.has(key(anchor.x,anchor.y)))?key(anchor.x,anchor.y):key(best.cells[Math.floor(best.cells.length/2)].x,best.cells[Math.floor(best.cells.length/2)].y);
    }
    all.forEach(function(k0){ var el=self.cellEls[k0]; if(el) el.classList.add('garden-clearing'); });
    this.effect(cascade>1?'burst':'spark');
    window.MEOWAudio?.cue(cascade>1?'cascade':'match');
    if(cascade>1)window.MEOWFX?.word(cascade>3?'CATASTROPHIC COMBO!':'THE ROYAL CASCADE!','garden');
    await wait(150);
    if(this.disposed)return;
    var specialCreated=null;
    all.forEach(function(k0){
      var a=k0.split(':'), x=+a[0], y=+a[1], st=self.grid[y]&&self.grid[y][x];
      if(!st) return;
      self.damageAt(x,y);
      if(k0===keep){ specialCreated={x:x,y:y}; return; }
      var asset=self.def.ingredientPalette[st.piece];
      self.score+=10*cascade;
      if(st.piece===self.primaryIndex) self.addProgress(1,'matched '+(asset&&asset.name||'ingredient'));
      var marker=(self.markers[k0]||[]).find(function(m){ return m.type==='ingredient-exit'; });
      if(marker && st.piece===self.primaryIndex) self.addProgress(1,'ingredient exit');
      st.piece=null; st.special=null;
    });
    if(specialCreated&&best){
      var st=this.grid[specialCreated.y][specialCreated.x];
      st.special=best.cells.length>=5?'color':(best.orientation==='row'?'row':'col');
      this.score+=50;
      var e=this.cellEls[key(specialCreated.x,specialCreated.y)]; if(e) e.classList.add('garden-special-created');
    }
    this.renderAll();
    await wait(60);
    if(this.disposed)return;
    this.applyGravity();
    this.renderAll();
    await wait(100);
    if(this.disposed)return;
    match=this.findMatches();
    anchor=null;
  }
  this.combo=0;
};

G.applyBoosterToCell=async function(i,x,y){
  if(this.busy||this.paused||this.completed||this.failed||this.disposed||!this.playable(x,y)) return;
  this.busy=true;
  try{
  var cells=new Set(), target=null, xx, yy;
  function add(x0,y0){ cells.add(key(x0,y0)); }
  if(i===1){ add(x,y); this.addProgress(1,'precision harvest'); }
  else if(i===4){ for(xx=0; xx<this.def.size.width; xx++) if(this.playable(xx,y)) add(xx,y); }
  else if(i===5){ for(yy=0; yy<this.def.size.height; yy++) if(this.playable(x,yy)) add(x,yy); }
  else if(i===7){ target=this.grid[y][x].piece; for(yy=0; yy<this.def.size.height; yy++) for(xx=0; xx<this.def.size.width; xx++) if(this.playable(xx,yy)&&this.grid[yy][xx].piece===target) add(xx,yy); }
  else if(i===8){ for(yy=Math.max(0,y-1); yy<=Math.min(this.def.size.height-1,y+1); yy++) for(xx=Math.max(0,x-1); xx<=Math.min(this.def.size.width-1,x+1); xx++) if(this.playable(xx,yy)) add(xx,yy); }
  else if(i===10){for(xx=0;xx<this.def.size.width;xx++)if(this.playable(xx,y))add(xx,y);for(yy=0;yy<this.def.size.height;yy++)if(this.playable(x,yy))add(x,yy);}
  else { this.grid[y][x].special='cross'; this.effect('burst'); this.renderAll(); this.busy=false; return; }
  cells=this.pass3ExpandUnderlays(cells);
  // A booster actually harvesting ingredients advances the same canonical recipe counters.
  this._trackRecipeMatches?.(cells);
  var self=this;
  cells.forEach(function(k0){
    var a=k0.split(':'), cx=+a[0], cy=+a[1];
    if(self.grid[cy]&&self.grid[cy][cx]){ self.grid[cy][cx].piece=null; self.grid[cy][cx].special=null; }
    delete self.hazards[k0]; delete self.blockers[k0];
  });
  this.effect('burst');
  this.applyGravity();
  this.renderAll();
  await wait(120);
  if(this.disposed)return;
  var m=this.findMatches();
  if(m.cells.size) await this.resolve(m,{x:x,y:y});
  if(!this.disposed)this.checkEnd();
  }catch(error){
    console.error('Garden booster recovered:',error);
    if(!this.disposed){try{this.applyGravity()}catch(recoveryError){console.error('Garden booster recovery:',recoveryError)}this.toast('The booster was interrupted. The garden is ready again.');}
  }finally{this.busy=false;if(!this.disposed)this.renderAll();}
};

/* Hybrid satellite boards for any multi-level board */
function HybridSatellite(main,def,idx){ this.main=main; this.def=JSON.parse(JSON.stringify(def)); this.effect=def.effect||{}; this.rand=seeded((main.def.number||1)*1231+idx*89+7); this.progress=0; this.target=Math.max(1,Number(def.trigger&&def.trigger.threshold)||3); this.grid=[]; this.cellEls={}; this.chain=[]; this.chainType=null; this.busy=false; this.complete=false; this.pointerDown=false; this.underlays=Object.create(null); this.build(); }
HybridSatellite.prototype.playable=function(x,y){ return y>=0&&y<this.def.rows.length&&x>=0&&x<this.def.rows[y].length&&this.def.rows[y][x]==='1'; };
HybridSatellite.prototype.build=function(){
  var pal=this.def.ingredientPalette||this.main.def.ingredientPalette, self=this;
  for(var y=0;y<this.def.rows.length;y++){ this.grid[y]=[]; for(var x=0;x<this.def.rows[y].length;x++) this.grid[y][x]=this.playable(x,y)?{piece:Math.floor(this.rand()*pal.length)}:null; }
  this.fillNoChains(); this.underlays=assignUnderlaysFor({def:{rows:this.def.rows,size:this.def.size,number:(this.main.def.number||1)+7}}, this.playable.bind(this));
  var el=document.createElement('section'); el.className='secondary-card hybrid-secondary';
  el.innerHTML='<h3>'+esc(this.def.name)+' <span class="hybrid-chip">Trace pod</span></h3><small>'+esc(this.def.objective&&this.def.objective.item||'linked objective')+' · '+this.target+' trace points</small><div class="hybrid-helper">Trace a same-ingredient chain of 3+ like Pudding Pop. The main board still uses swaps like Candy Crush.</div><div class="secondary-meter"><i></i></div>';
  var g=document.createElement('div'); g.className='garden-grid secondary-grid aurora-board connect-dots'; g.style.setProperty('--cols',this.def.size.width); el.appendChild(g);
  var trace=document.createElement('div'); trace.className='connect-trace'; g.appendChild(trace); this.traceEl=trace;
  this.el=el; this.gridEl=g;
  for(var yy=0; yy<this.def.rows.length; yy++) for(var xx=0; xx<this.def.rows[yy].length; xx++){
    var c=document.createElement('button'); c.type='button'; c.className='garden-cell connect-dot'; c.dataset.x=xx; c.dataset.y=yy;
    if(!this.playable(xx,yy)){ c.classList.add('hole'); c.tabIndex=-1; }
    else{
      this.cellEls[key(xx,yy)] = c;
      c.addEventListener('pointerdown', function(e){ self.startChain(e.currentTarget); });
      c.addEventListener('pointerenter', function(e){ self.extendChain(e.currentTarget); });
      c.addEventListener('pointerup', function(){ self.finishChain(); });
      c.addEventListener('click', function(e){ if(!self.pointerDown) self.tapCell(e.currentTarget); });
    }
    g.appendChild(c);
  }
  root.addEventListener('pointerup', function(){ if(self.pointerDown) self.finishChain(); }, {passive:true});
  this.render();
};
HybridSatellite.prototype.fillNoChains=function(){
  var pal=this.def.ingredientPalette||this.main.def.ingredientPalette, tries=0;
  while(this.hasAnyChain() && tries<12){
    for(var y=0;y<this.def.rows.length;y++) for(var x=0;x<this.def.rows[y].length;x++) if(this.playable(x,y)) this.grid[y][x].piece=Math.floor(this.rand()*pal.length);
    tries++;
  }
};
HybridSatellite.prototype.componentSize=function(x,y,piece,seen){
  var stack=[[x,y]], count=0, dirs=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
  while(stack.length){ var p=stack.pop(), kk=key(p[0],p[1]); if(seen[kk]) continue; seen[kk]=1; if(!this.playable(p[0],p[1]) || this.grid[p[1]][p[0]].piece!==piece) continue; count++; for(var i=0;i<dirs.length;i++){ var nx=p[0]+dirs[i][0], ny=p[1]+dirs[i][1]; if(this.playable(nx,ny) && !seen[key(nx,ny)] && this.grid[ny][nx].piece===piece) stack.push([nx,ny]); } }
  return count;
};
HybridSatellite.prototype.hasAnyChain=function(){
  var seen={};
  for(var y=0;y<this.def.rows.length;y++) for(var x=0;x<this.def.rows[y].length;x++) if(this.playable(x,y) && !seen[key(x,y)]){ var p=this.grid[y][x].piece; if(this.componentSize(x,y,p,seen)>=3) return true; }
  return false;
};
HybridSatellite.prototype.tapCell=function(el){ if(this.busy||this.complete) return; if(!this.chain.length){ this.startChain(el); return; } this.extendChain(el); this.finishChain(); };
HybridSatellite.prototype.isAdjacent=function(a,b){ return Math.max(Math.abs(a.x-b.x), Math.abs(a.y-b.y))===1; };
HybridSatellite.prototype.startChain=function(el){ if(this.busy||this.complete) return; var x=+el.dataset.x,y=+el.dataset.y; if(!this.playable(x,y)) return; this.pointerDown=true; this.chain=[key(x,y)]; this.chainType=this.grid[y][x].piece; this.render(); };
HybridSatellite.prototype.extendChain=function(el){ if(!this.pointerDown||this.busy||this.complete||!this.chain.length) return; var x=+el.dataset.x,y=+el.dataset.y, kk=key(x,y), last=parseK(this.chain[this.chain.length-1]); if(!this.playable(x,y) || this.grid[y][x].piece!==this.chainType || !this.isAdjacent(last,{x:x,y:y})) return; if(this.chain.length>1 && kk===this.chain[this.chain.length-2]){ this.chain.pop(); this.render(); return; } if(this.chain.indexOf(kk)>=0) return; this.chain.push(kk); this.render(); };
HybridSatellite.prototype.finishChain=async function(){ if(!this.pointerDown && !this.chain.length) return; this.pointerDown=false; if(this.chain.length<3){ this.chain=[]; this.chainType=null; this.render(); return; } await this.resolveChain(); };
HybridSatellite.prototype.expandUnderlays=function(baseSet){
  var all=new Set(baseSet), queue=Array.from(baseSet), seen=new Set(), self=this;
  while(queue.length){ var kk=queue.shift(); if(seen.has(kk)) continue; seen.add(kk); var kind=this.underlays[kk]; if(!kind) continue; delete this.underlays[kk]; var p=parseK(kk), cells=[];
    if(kind==='row'){ for(var xx=0; xx<this.def.size.width; xx++) if(this.playable(xx,p.y)) cells.push({x:xx,y:p.y}); }
    else if(kind==='col'){ for(var yy=0; yy<this.def.size.height; yy++) if(this.playable(p.x,yy)) cells.push({x:p.x,y:yy}); }
    else if(kind==='burst9'){ for(var yy=Math.max(0,p.y-1); yy<=Math.min(this.def.size.height-1,p.y+1); yy++) for(var xx=Math.max(0,p.x-1); xx<=Math.min(this.def.size.width-1,p.x+1); xx++) if(this.playable(xx,yy)) cells.push({x:xx,y:yy}); }
    else if(kind==='zapper'){ cells=randomBoardCells({def:{rows:this.def.rows,size:this.def.size}},0.65,this.rand.bind(this),function(x,y){ return self.playable(x,y)&&self.grid[y]&&self.grid[y][x]; }); }
    cells.forEach(function(c){ var k2=key(c.x,c.y); if(!all.has(k2)){ all.add(k2); queue.push(k2); } });
  }
  return all;
};
HybridSatellite.prototype.resolveChain=async function(){
  this.busy=true;
  var base=new Set(this.chain), all=this.expandUnderlays(base), self=this;
  this.gridEl.classList.add(this.chain.length>=5?'chain-long':'chain-complete');
  all.forEach(function(kk){ var el=self.cellEls[kk]; if(el){ el.classList.add('trace-complete','pudding-pop'); }});
  this.main.effect(this.chain.length>=5?'burst':'spark');
  await wait(180);
  all.forEach(function(kk){ var p=parseK(kk); if(self.grid[p.y]&&self.grid[p.y][p.x]) self.grid[p.y][p.x].piece=null; });
  this.progress=Math.min(this.target, this.progress + all.size + (this.chain.length>=6?1:0));
  this.gravity(); this.refill(); this.chain=[]; this.chainType=null;
  this.gridEl.classList.remove('chain-long','chain-complete');
  this.render(); this.busy=false;
  if(this.progress>=this.target && !this.complete){ this.complete=true; this.el.classList.add('complete'); this.main.applySatelliteEffect(this.def); }
};
HybridSatellite.prototype.gravity=function(){
  var x,y,w=this.def.size.width,h=this.def.size.height;
  for(x=0;x<w;x++){
    var vals=[]; for(y=h-1;y>=0;y--) if(this.playable(x,y) && this.grid[y][x].piece!=null) vals.push(this.grid[y][x].piece);
    for(y=h-1;y>=0;y--) if(this.playable(x,y)) this.grid[y][x].piece=vals.shift();
  }
};
HybridSatellite.prototype.refill=function(){
  var pal=this.def.ingredientPalette||this.main.def.ingredientPalette, x,y, tries=0;
  for(y=0;y<this.def.rows.length;y++) for(x=0;x<this.def.rows[y].length;x++) if(this.playable(x,y) && this.grid[y][x].piece==null) this.grid[y][x].piece=Math.floor(this.rand()*pal.length);
  while(!this.hasAnyChain() && tries<10){ for(y=0;y<this.def.rows.length;y++) for(x=0;x<this.def.rows[y].length;x++) if(this.playable(x,y)) this.grid[y][x].piece=Math.floor(this.rand()*pal.length); tries++; }
};
HybridSatellite.prototype.renderTrace=function(){
  if(!this.traceEl) return; this.traceEl.innerHTML=''; if(this.chain.length<2) return;
  var hostRect=this.gridEl.getBoundingClientRect();
  for(var i=0;i<this.chain.length-1;i++){
    var a=parseK(this.chain[i]), b=parseK(this.chain[i+1]), ea=this.cellEls[key(a.x,a.y)], eb=this.cellEls[key(b.x,b.y)]; if(!ea||!eb) continue;
    var ra=ea.getBoundingClientRect(), rb=eb.getBoundingClientRect();
    var x1=ra.left-hostRect.left+ra.width/2, y1=ra.top-hostRect.top+ra.height/2, x2=rb.left-hostRect.left+rb.width/2, y2=rb.top-hostRect.top+rb.height/2;
    var dx=x2-x1, dy=y2-y1, len=Math.sqrt(dx*dx+dy*dy), ang=Math.atan2(dy,dx)*180/Math.PI;
    var line=document.createElement('div'); line.className='connect-trace-line'; line.style.left=x1+'px'; line.style.top=(y1-3)+'px'; line.style.width=len+'px'; line.style.transform='rotate('+ang+'deg)'; this.traceEl.appendChild(line);
  }
};
HybridSatellite.prototype.render=function(){
  var pal=this.def.ingredientPalette||this.main.def.ingredientPalette, self=this;
  Object.keys(this.cellEls).forEach(function(k0){
    var p=parseK(k0), el=self.cellEls[k0], asset=pal[self.grid[p.y][p.x].piece]||pal[0], active=self.chain.indexOf(k0)>=0, under=self.underlays[k0]||'';
    el.innerHTML='<img class="ingredient-piece" src="'+esc(asset.path)+'" alt="'+esc(asset.name)+'">';
    el.classList.toggle('trace-selected', active); el.classList.toggle('has-underlay', !!under); if(under) el.dataset.underlay=under; else delete el.dataset.underlay;
  });
  this.gridEl.classList.toggle('chain-long', this.chain.length>=5);
  this.renderTrace();
  var meter=q('.secondary-meter i',this.el); if(meter){ meter.style.width=pct(this.progress,this.target)+'%'; }
  var note=q('small',this.el); if(note) note.textContent=(this.def.objective&&this.def.objective.item||'linked objective')+' · '+this.progress+'/'+this.target+' trace points';
};

G.buildSatellites=function(){
  var self=this;
  this.satellites=(this.def.satelliteBoards||[]).map(function(s,idx){ return new HybridSatellite(self,s,idx); });
  this.satellites.forEach(function(s){ var side=s.def.display&&s.def.display.placement==='left'?'.secondary-left':'.secondary-right'; q(side,self.shell).appendChild(s.el); });
};

})(typeof globalThis!=="undefined"?globalThis:window);
