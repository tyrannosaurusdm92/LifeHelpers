
(function(root){
"use strict";
if(!root.GardenGame||!root.GardenGame.Game)return;
var G=root.GardenGame.Game.prototype;
function q(sel,host){return (host||document).querySelector(sel)}

function satelliteLayout(def){
  var sats=(def&&def.satelliteBoards)||[];
  if(!sats.length)return 'none';
  var left=false,right=false;
  sats.forEach(function(s){if(s.display&&s.display.placement==='left')left=true;else right=true});
  if(left&&right)return 'both';
  return left?'left':'right';
}

var oldBuild=G.build;
G.build=function(){
  oldBuild.call(this);
  this.shell.dataset.satelliteLayout=satelliteLayout(this.def);
  this.shell.dataset.referencePass='4';
  var self=this;
  requestAnimationFrame(function(){self.fitReferenceBoard();requestAnimationFrame(function(){self.fitReferenceBoard()})});
};

/*
  Fit the matrix to the actual board-play rectangle.
  Pass 2 capped cells at 60px and also measured a wrapper that could be auto-placed
  into an empty satellite column.  This pass fixes both problems.
*/
G.fitReferenceBoard=function(){
  if(!this.gridEl||!this.shell)return;
  var play=q('.board-play-area',this.shell), wrap=q('.main-board-wrap',this.shell);
  if(!play||!wrap)return;
  var cols=Math.max(1,Number(this.def.size&&this.def.size.width)||1);
  var rows=Math.max(1,Number(this.def.size&&this.def.size.height)||1);
  var gap=3, gridPad=8;
  var rect=wrap.getBoundingClientRect(), playRect=play.getBoundingClientRect();
  var availW=Math.max(220,rect.width-28);
  var availH=Math.max(260,Math.min(rect.height||playRect.height,playRect.height)-30);
  var widthCell=Math.floor((availW-gridPad*2-gap*(cols-1))/cols);
  var heightCell=Math.floor((availH-gridPad*2-gap*(rows-1))/rows);
  var linked=(this.def.satelliteBoards&&this.def.satelliteBoards.length)>0;
  var maxCell=linked?82:98;
  var minCell=30;
  var cell=Math.max(minCell,Math.min(maxCell,widthCell,heightCell));

  /* Sparse/narrow silhouettes still deserve a readable physical size. */
  var playable=Number(this.def.size&&this.def.size.cellCount)||0;
  var density=playable/(cols*rows);
  if(!linked && density<0.55 && cell<86){cell=Math.min(86,Math.max(cell,Math.floor(Math.min(availW/Math.max(5,cols),availH/Math.max(5,rows)))))}

  this.gridEl.style.setProperty('--cell',cell+'px');
  this.gridEl.dataset.fittedCell=String(cell);
  this.shell.style.setProperty('--main-cell',cell+'px');
};

/* Re-fit after sidebar content, satellites and fonts settle. */
var oldBuildSat=G.buildSatellites;
G.buildSatellites=function(){
  oldBuildSat.call(this);
  if(this.shell)this.shell.dataset.satelliteLayout=satelliteLayout(this.def);
  var self=this;requestAnimationFrame(function(){self.fitReferenceBoard()});
};

})(typeof globalThis!=="undefined"?globalThis:window);
