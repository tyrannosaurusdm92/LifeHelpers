(function(root){
"use strict";
if(!root.GardenGame||!root.GardenGame.Game)return;
var G=root.GardenGame.Game.prototype;
function q(sel,host){return (host||document).querySelector(sel)}
function ensureTopDock(game){
  var play=q('.board-play-area',game.shell);if(!play)return null;
  var top=q('.secondary-top',play);
  if(!top){top=document.createElement('div');top.className='secondary-top';play.insertBefore(top,play.firstChild)}
  return top;
}
function podTrackWidth(sats,side){
  var maxCols=0,count=0;
  (sats||[]).forEach(function(s){var p=(s.def.display&&s.def.display.placement)||'right';if(p===side){count++;maxCols=Math.max(maxCols,Number(s.def.size&&s.def.size.width)||0)}});
  if(!count)return 0;
  if(maxCols<=3)return 240;
  if(maxCols===4)return 255;
  if(maxCols===5)return 275;
  return Math.min(330,220+maxCols*11);
}
function configure(game){
  if(!game.shell)return;
  var sats=game.satellites||[],left=false,right=false,top=false;
  sats.forEach(function(s){
    var p=(s.def.display&&s.def.display.placement)||'right';
    if(p==='left')left=true;else if(p==='top')top=true;else right=true;
    var cols=Number(s.def.size&&s.def.size.width)||0;
    if(s.el){s.el.dataset.satCols=String(cols);s.el.dataset.satPlacement=p}
  });
  game.shell.dataset.hasLeftPods=left?'true':'false';
  game.shell.dataset.hasRightPods=right?'true':'false';
  game.shell.dataset.hasTopPods=top?'true':'false';
  game.shell.dataset.referencePass='5';
  game.shell.style.setProperty('--left-pod-track',podTrackWidth(sats,'left')+'px');
  game.shell.style.setProperty('--right-pod-track',podTrackWidth(sats,'right')+'px');
}

var oldBuildSat=G.buildSatellites;
G.buildSatellites=function(){
  var top=ensureTopDock(this);
  oldBuildSat.call(this);
  var left=q('.secondary-left',this.shell),right=q('.secondary-right',this.shell),self=this;
  (this.satellites||[]).forEach(function(s){
    var placement=(s.def.display&&s.def.display.placement)||'right';
    var target=placement==='left'?left:(placement==='top'?top:right);
    if(target&&s.el&&s.el.parentNode!==target)target.appendChild(s.el);
  });
  configure(this);
  requestAnimationFrame(function(){self.fitReferenceBoard();requestAnimationFrame(function(){self.fitReferenceBoard()})});
};

/* Re-measure after the pass-5 pod dock settles or the viewport changes. */
var oldBuild=G.build;
G.build=function(){
  oldBuild.call(this);
  configure(this);
  var self=this;
  this._pass5Resize=function(){configure(self);self.fitReferenceBoard()};
  root.addEventListener('resize',this._pass5Resize,{passive:true});
  requestAnimationFrame(function(){self.fitReferenceBoard()});
};

})(typeof globalThis!=="undefined"?globalThis:window);
