(function(root){
"use strict";
if(!root.GardenGame||!root.GardenGame.Game)return;
var G=root.GardenGame.Game.prototype;
function q(sel,host){return (host||document).querySelector(sel)}
function clamp(v,lo,hi){return Math.max(lo,Math.min(hi,v))}
function frame(fn){(root.requestAnimationFrame||function(cb){return root.setTimeout(cb,16)})(fn)}
function setVar(el,name,value){var v=String(value);if(el.style.getPropertyValue(name)!==v)el.style.setProperty(name,v)}

/* The supplied website/app creator measures its active host first and lets
   exported page height follow the content. Keep that flow here instead of
   compressing linked boards into a fixed-height rail. */
function ensureDeck(game){
  if(!game||!game.shell)return null;
  var zone=q('.board-zone',game.shell);if(!zone)return null;
  var deck=q('.secondary-deck',zone);
  if(!deck){
    deck=document.createElement('section');
    deck.className='secondary-deck';
    deck.setAttribute('aria-label','Linked garden boards');
    var title=document.createElement('h2');
    title.className='secondary-deck-title';
    title.textContent='Linked Garden Boards';
    deck.appendChild(title);
    var bottom=q('.bottom-hud',zone);
    zone.insertBefore(deck,bottom||null);
  }
  var count=0;
  (game.satellites||[]).forEach(function(s){
    if(!s||!s.el)return;
    var cols=Math.max(1,Number(s.def&&s.def.size&&s.def.size.width)||1);
    var rows=Math.max(1,Number(s.def&&s.def.size&&s.def.size.height)||1);
    s.el.dataset.satCols=String(cols);
    s.el.dataset.satRows=String(rows);
    s.el.dataset.satPlacement=(s.def&&s.def.display&&s.def.display.placement)||'right';
    if(s.el.parentNode!==deck)deck.appendChild(s.el);
    count++;
  });
  deck.hidden=!count;
  deck.dataset.count=String(count);
  return deck;
}

function resolvedTracks(deck){
  var style=root.getComputedStyle?root.getComputedStyle(deck):null;
  if(!style)return [];
  var values=String(style.gridTemplateColumns||'').match(/[\d.]+px/g)||[];
  return values.map(function(x){return parseFloat(x)}).filter(function(x){return x>0});
}

function sizePod(s,slotWidth,maxCell){
  if(!s||!s.el||!s.gridEl)return;
  var cols=Math.max(1,Number(s.def&&s.def.size&&s.def.size.width)||1);
  var gap=2,gridPadding=8,cardChrome=20;
  var widthCell=Math.floor((slotWidth-cardChrome-gridPadding-gap*(cols-1))/cols);
  /* The narrowest real track still has room for 28px cells on every current pod. */
  var cell=clamp(Math.min(widthCell,maxCell),28,58);
  var gridWidth=cols*cell+Math.max(0,cols-1)*gap+gridPadding;
  var cardWidth=gridWidth+cardChrome;
  setVar(s.el,'--sat-cell',cell+'px');
  setVar(s.el,'--sat-grid-width',gridWidth+'px');
  setVar(s.el,'--sat-card-width',cardWidth+'px');
  setVar(s.gridEl,'--sat-cell',cell+'px');
  setVar(s.gridEl,'--sat-grid-width',gridWidth+'px');
  s.gridEl.dataset.dynamicWidth=String(gridWidth);
  s.gridEl.dataset.dynamicHeight=String((Number(s.def.size.height)||1)*cell+Math.max(0,(Number(s.def.size.height)||1)-1)*gap+gridPadding);
  s.gridEl.dataset.fittedCell=String(cell);
}

function fitMain(game){
  if(!game||!game.gridEl||!game.shell)return;
  var wrap=q('.main-board-wrap',game.shell);
  if(!wrap)return;
  var cols=Math.max(1,Number(game.def.size&&game.def.size.width)||1);
  var rows=Math.max(1,Number(game.def.size&&game.def.size.height)||1);
  var wrapStyle=root.getComputedStyle?root.getComputedStyle(wrap):null;
  var gridStyle=root.getComputedStyle?root.getComputedStyle(game.gridEl):null;
  var wrapPadX=wrapStyle?(parseFloat(wrapStyle.paddingLeft)||0)+(parseFloat(wrapStyle.paddingRight)||0):16;
  var wrapPadY=wrapStyle?(parseFloat(wrapStyle.paddingTop)||0)+(parseFloat(wrapStyle.paddingBottom)||0):28;
  var gridPadX=gridStyle?(parseFloat(gridStyle.paddingLeft)||0)+(parseFloat(gridStyle.paddingRight)||0):16;
  var gridPadY=gridStyle?(parseFloat(gridStyle.paddingTop)||0)+(parseFloat(gridStyle.paddingBottom)||0):16;
  var gapX=gridStyle?(parseFloat(gridStyle.columnGap)||3):3;
  var gapY=gridStyle?(parseFloat(gridStyle.rowGap)||3):3;
  var widthRoom=Math.max(0,wrap.clientWidth-wrapPadX-gridPadX);
  var heightRoom=Math.max(0,wrap.clientHeight-wrapPadY-gridPadY);
  var byWidth=Math.floor((widthRoom-gapX*(cols-1))/cols);
  var byHeight=Math.floor((heightRoom-gapY*(rows-1))/rows);
  /* The integrated recipe run gives the garden a readability pass: the
     original fit left 8×8 boards at roughly 36px on phones.  Keep the board
     scrollable, but give every ingredient a larger visual footprint. */
  var host=game.shell.closest&&game.shell.closest('.meow-garden-host');
  var frameWidth=host?host.getBoundingClientRect().width:(root.innerWidth||0);
  var scale=frameWidth&&frameWidth<820?1.18:1.08;
  var cell=clamp(Math.min(byWidth*scale,byHeight*scale,98),frameWidth&&frameWidth<820?34:30,98);
  setVar(game.gridEl,'--cell',cell+'px');
  game.gridEl.dataset.fittedCell=String(cell);
  setVar(game.shell,'--main-cell',cell+'px');
}

function layout(game){
  if(!game||!game.shell)return;
  game.shell.dataset.referencePass='9';
  var deck=ensureDeck(game);
  if(deck&&game.satellites&&game.satellites.length){
    var cs=root.getComputedStyle?root.getComputedStyle(deck):null;
    var padX=cs?(parseFloat(cs.paddingLeft)||0)+(parseFloat(cs.paddingRight)||0):24;
    var gap=cs?(parseFloat(cs.columnGap)||12):12;
    var innerWidth=Math.max(160,deck.clientWidth-padX);
    var tracks=resolvedTracks(deck);
    var fallbackCount=Math.max(1,Math.min(game.satellites.length,Math.floor((innerWidth+gap)/(320+gap))));
    var fallbackSlot=(innerWidth-gap*(fallbackCount-1))/fallbackCount;
    var maxSlot=tracks.length?Math.min.apply(Math,tracks):fallbackSlot;
    (game.satellites||[]).forEach(function(s){sizePod(s,maxSlot,58)});
  }
  fitMain(game);
}

function schedule(game){frame(function(){layout(game);frame(function(){layout(game)})})}
var oldBuild=G.build;
G.build=function(){
  oldBuild.call(this);
  var self=this;
  this.shell.dataset.referencePass='9';
  this._pass9Resize=function(){layout(self)};
  root.addEventListener('resize',this._pass9Resize,{passive:true});
  if(root.ResizeObserver){
    this._pass9Observer=new root.ResizeObserver(function(){layout(self)});
    var zone=q('.board-zone',this.shell),play=q('.board-play-area',this.shell),deck=ensureDeck(this),ui=q('.right-ui',this.shell);
    [zone,play,deck,ui].forEach(function(el){if(el)self._pass9Observer.observe(el)});
  }
  schedule(this);
};
G.fitReferenceBoard=function(){fitMain(this)};

})(typeof globalThis!=="undefined"?globalThis:window);
