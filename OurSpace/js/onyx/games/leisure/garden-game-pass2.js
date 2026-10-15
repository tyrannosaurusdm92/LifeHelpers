(function(root){
"use strict";
if(!root.GardenGame||!root.GardenGame.Game)return;
var G=root.GardenGame.Game.prototype;
function k(x,y){return x+":"+y}
function all(sel,host){return Array.prototype.slice.call((host||document).querySelectorAll(sel))}
function one(sel,host){return (host||document).querySelector(sel)}
function parseK(s){var a=s.split(":");return {x:+a[0],y:+a[1]}}
function seededPick(list,turn){return list[(Math.max(0,turn||0))%list.length]}
function markerList(game,type){var out=[];Object.keys(game.markers||{}).forEach(function(kk){(game.markers[kk]||[]).forEach(function(m){if(m.type===type){var c=parseK(kk);out.push({x:c.x,y:c.y,m:m})}})});return out}
function segment(game,axis,fixed,pos){var vals=[],n=axis==='x'?game.def.size.width:game.def.size.height;for(var i=0;i<n;i++){var x=axis==='x'?i:fixed,y=axis==='x'?fixed:i;if(game.playable(x,y))vals.push(i);else if(vals.indexOf(pos)>=0)break;else vals=[]}return vals}

var oldBuild=G.build;
G.build=function(){
  var fp=this.def.flowProfile||{};this.gravity=fp.initialGravity||'down';this.pass2Turn=0;
  oldBuild.call(this);
  this.shell.dataset.flow=this.gravity;this.shell.dataset.referencePass='2';
  this.decorateReferencePass();
  var self=this;this._pass2Resize=function(){self.fitReferenceBoard()};root.addEventListener('resize',this._pass2Resize,{passive:true});
  requestAnimationFrame(function(){self.fitReferenceBoard()});
};

G.decorateReferencePass=function(){
  var top=one('.top-hud',this.shell),score=one('.score-frame',top);
  if(top&&!one('.combo-frame',top)){
    var combo=document.createElement('div');combo.className='combo-frame';combo.innerHTML='<span>COMBO</span><b data-combo>×1</b>';score.insertAdjacentElement('afterend',combo);
  }
  var wrap=one('.main-board-wrap',this.shell);
  if(wrap&&!one('.board-reference-plaque',wrap)){
    var p=document.createElement('div');p.className='board-reference-plaque';p.innerHTML='<b>BOARD '+String(this.def.number).padStart(2,'0')+'</b><span>'+String(this.def.topology||'garden').replace(/[-_]/g,' ')+'</span>';wrap.appendChild(p);
  }
  var zone=one('.board-zone',this.shell);
  if(zone&&!one('.board-rail-decoration',zone)){var rail=document.createElement('div');rail.className='board-rail-decoration';rail.setAttribute('aria-hidden','true');zone.appendChild(rail)}
  var status=one('.help-copy',one('.right-ui',this.shell));
  if(status){var ref=document.createElement('p');ref.className='reference-note';var refs=(this.def.sourceScreenshots||[]).concat(this.def.screenshotMechanics||[]);ref.textContent='Reference pass: '+(refs.length?refs.join(' · '):'original irregular Garden layout');status.appendChild(ref)}
  var right=one('.right-ui-content',this.shell);
  if(right){var meter=document.createElement('section');meter.className='ui-card board-state-card';meter.innerHTML='<h3>Board state</h3><div class="state-grid"><span>Hazards <b data-hazard-count>0</b></span><span>Blockers <b data-blocker-count>0</b></span><span>Linked <b data-linked-count>0</b></span><span>Flow <b data-flow>'+this.gravity+'</b></span></div>';var cards=all('.ui-card',right);if(cards[1])cards[1].insertAdjacentElement('afterend',meter);else right.appendChild(meter)}
  this.updateHud();
};

G.fitReferenceBoard=function(){
  if(!this.gridEl)return;var wrap=one('.main-board-wrap',this.shell);if(!wrap)return;
  var cols=this.def.size.width,rows=this.def.size.height,w=Math.max(260,wrap.clientWidth||600),h=Math.max(300,(one('.board-play-area',this.shell)||wrap).clientHeight||650);
  var cell=Math.floor(Math.min(60,(w-24)/(cols+0.25),(h-26)/(rows+0.25)));cell=Math.max(24,cell);
  this.gridEl.style.setProperty('--cell',cell+'px');
};

var oldUpdate=G.updateHud;
G.updateHud=function(){oldUpdate.call(this);if(!this.shell)return;var c=one('[data-combo]',this.shell);if(c)c.textContent='×'+Math.max(1,this.combo||1);var h=one('[data-hazard-count]',this.shell),b=one('[data-blocker-count]',this.shell),l=one('[data-linked-count]',this.shell),f=one('[data-flow]',this.shell);if(h)h.textContent=Object.keys(this.hazards||{}).length;if(b)b.textContent=Object.keys(this.blockers||{}).length;if(l)l.textContent=(this.satellites||[]).filter(function(s){return s.progress>=s.target}).length+'/'+((this.satellites||[]).length);if(f)f.textContent=this.gravity;if(this.shell)this.shell.dataset.flow=this.gravity};

var oldRender=G.renderCell;
G.renderCell=function(x,y){oldRender.call(this,x,y);var el=this.cellEls&&this.cellEls[k(x,y)];if(!el)return;var hz=this.hazards&&this.hazards[k(x,y)];el.classList.toggle('hazard-locked',!!(hz&&hz.layer>1&&/honey|vine|thorn/.test(hz.kind)));var edge=false,dirs=[[1,0],[-1,0],[0,1],[0,-1]];for(var i=0;i<dirs.length;i++){if(!this.playable(x+dirs[i][0],y+dirs[i][1])){edge=true;break}}el.classList.toggle('topology-edge',edge)};

var oldTry=G.trySwap;
G.trySwap=function(x1,y1,x2,y2){var a=this.hazards&&this.hazards[k(x1,y1)],b=this.hazards&&this.hazards[k(x2,y2)];if((a&&a.layer>1&&/honey|vine|thorn/.test(a.kind))||(b&&b.layer>1&&/honey|vine|thorn/.test(b.kind))){this.flashInvalid(x2,y2);this.toast('That ingredient is pinned by a Garden hazard. Match beside it or use a booster.');return Promise.resolve()}return oldTry.call(this,x1,y1,x2,y2)};

// Generic segmented gravity supports down/up/left/right without crossing holes.
G.applyGravity=function(){
  var dir=this.gravity||'down',vertical=(dir==='down'||dir==='up'),outer=vertical?this.def.size.width:this.def.size.height,inner=vertical?this.def.size.height:this.def.size.width,self=this;
  for(var o=0;o<outer;o++){
    var i=0;while(i<inner){var x=vertical?o:i,y=vertical?i:o;while(i<inner&&!this.playable(x,y)){i++;x=vertical?o:i;y=vertical?i:o}if(i>=inner)break;var start=i;while(i<inner){x=vertical?o:i;y=vertical?i:o;if(!this.playable(x,y))break;i++}var end=i-1,vals=[];
      for(var j=start;j<=end;j++){x=vertical?o:j;y=vertical?j:o;var s=this.grid[y]&&this.grid[y][x];if(s&&s.piece!=null)vals.push({piece:s.piece,special:s.special})}
      var missing=(end-start+1)-vals.length;for(var m=0;m<missing;m++){var nv={piece:Math.floor(this.rand()*this.def.ingredientPalette.length),special:null};if(dir==='down'||dir==='right')vals.unshift(nv);else vals.push(nv)}
      for(var j=start;j<=end;j++){x=vertical?o:j;y=vertical?j:o;if(!this.grid[y])this.grid[y]=[];if(!this.grid[y][x])this.grid[y][x]={piece:0,special:null};this.grid[y][x].piece=vals[j-start].piece;this.grid[y][x].special=vals[j-start].special;var el=this.cellEls[k(x,y)];if(el){el.classList.add('garden-fall');el.dataset.flow=dir}}
    }
  }
};

G.applyReferenceMarkers=function(){
  var self=this,turn=this.pass2Turn||0;
  // Portals visibly exchange their contents in pairs; fixed hazards/blockers do not teleport.
  var portals=markerList(this,'portal');for(var i=0;i+1<portals.length;i+=2){if(turn%2!==0)break;var a=portals[i],b=portals[i+1];if(this.grid[a.y]&&this.grid[b.y]&&this.grid[a.y][a.x]&&this.grid[b.y][b.x])this.swapState(a.x,a.y,b.x,b.y)}
  // Conveyor marker shifts the contiguous lane containing the marker by one cell.
  var conveyors=markerList(this,'conveyor'),seen={};conveyors.forEach(function(c){var dir=c.m.direction||'right',horizontal=dir==='left'||dir==='right',id=(horizontal?'r'+c.y:'c'+c.x)+':'+dir;if(seen[id])return;seen[id]=1;var vals=segment(self,horizontal?'x':'y',horizontal?c.y:c.x,horizontal?c.x:c.y);if(vals.length<2)return;var states=vals.map(function(v){var x=horizontal?v:c.x,y=horizontal?c.y:v;return self.grid[y][x]});if(dir==='right'||dir==='down')states.unshift(states.pop());else states.push(states.shift());vals.forEach(function(v,j){var x=horizontal?v:c.x,y=horizontal?c.y:v;self.grid[y][x]=states[j]})});
  // Spawners periodically inject the level's primary ingredient.
  if(turn%3===0)markerList(this,'spawner').forEach(function(s){if(self.grid[s.y]&&self.grid[s.y][s.x]){self.grid[s.y][s.x].piece=self.primaryIndex;self.grid[s.y][s.x].special=null}});
  // Exit cells actively collect the primary ingredient after flow resolves.
  markerList(this,'ingredient-exit').forEach(function(e){var st=self.grid[e.y]&&self.grid[e.y][e.x];if(st&&st.piece===self.primaryIndex){self.addProgress(1,'ingredient delivered');self.score+=55;st.piece=Math.floor(self.rand()*self.def.ingredientPalette.length);self.effect('leaf')}});
  // Bees are active hazards: every third turn one bee hops to an open neighboring tile.
  if(turn%3===0){var bees=Object.keys(this.hazards||{}).filter(function(kk){return self.hazards[kk].kind==='bee'});bees.slice(0,1).forEach(function(kk){var c=parseK(kk),opts=[[1,0],[-1,0],[0,1],[0,-1]].map(function(d){return {x:c.x+d[0],y:c.y+d[1]}}).filter(function(n){return self.playable(n.x,n.y)&&!self.hazards[k(n.x,n.y)]});if(opts.length){var n=opts[turn%opts.length];self.hazards[k(n.x,n.y)]=self.hazards[kk];delete self.hazards[kk]}})}
};

var oldAfter=G.afterTurn;
G.afterTurn=function(){this.pass2Turn=(this.pass2Turn||0)+1;oldAfter.call(this);this.applyReferenceMarkers();var fp=this.def.flowProfile||{};if(fp.gravityCycle&&fp.gravityCycle.length&&this.pass2Turn%(fp.cycleEveryMoves||4)===0){var ix=fp.gravityCycle.indexOf(this.gravity);this.gravity=fp.gravityCycle[(ix+1)%fp.gravityCycle.length];this.applyGravity();this.toast('Garden flow rotated '+this.gravity+'.')}this.ensureMove();this.renderAll();this.updateHud()};

// Make marker motion readable with CSS-coded pulses, never effect sprites.
var oldRenderAll=G.renderAll;
G.renderAll=function(){oldRenderAll.call(this);var self=this;all('.garden-cell[data-flow]',this.shell).forEach(function(e){e.classList.remove('flow-left','flow-right','flow-up','flow-down');e.classList.add('flow-'+(e.dataset.flow||self.gravity))});};

})(typeof globalThis!=="undefined"?globalThis:window);
