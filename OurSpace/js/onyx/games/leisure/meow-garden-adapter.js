/* Bridge the Pass9 Ingredient Garden engine to the arcade viewport.
   Fifty authored board types retain their masks, linked effects and swap logic. */
(function(w){'use strict';
  const G=w.GardenGame.Game.prototype;
  const q=(selector,host=document)=>(host||document).querySelector(selector);
  const FRAGMENTS_PER_INGREDIENT=6;
  const visibleGoal=goal=>`${Math.floor(Math.max(0,Number(goal?.count)||0)/FRAGMENTS_PER_INGREDIENT)}/${Math.max(1,Math.ceil(Math.max(0,Number(goal?.target)||0)/FRAGMENTS_PER_INGREDIENT))}`;
  G.bindGlobalKeys=function(){}; // shell handles the keyboard; no duplicate Escape/pause listener
  G.maybePreloader=function(){};
  G.showResult=function(won){
    if(this.shell.querySelector('.meow-board-result'))return;
    const overlay=document.createElement('div');overlay.className='meow-board-result';overlay.setAttribute('role','status');
    const card=document.createElement('div');card.className='meow-result-card';
    const heading=document.createElement('h2');heading.textContent=won?'PANTRY COMPLETE!':'OUT OF MOVES';
    const p=document.createElement('p');
    const goals=Array.isArray(this._recipeGoals)&&this._recipeGoals.length?this._recipeGoals.map(goal=>goal.name+' '+visibleGoal(goal)).join(' · '):this.progress+'/'+this.target+' '+this.def.objective.primaryItem;
    p.textContent=this.def.name+' · '+goals+' · '+this.score+' points';
    const retry=document.createElement('button');retry.type='button';retry.textContent='NEW BOARD';
    retry.onclick=()=>w.MEOWGame?.start('garden');
    const menu=document.createElement('button');menu.type='button';menu.textContent='GAME / BOARD LOADER';
    menu.onclick=()=>w.MEOWShell.openPanel('game');
    card.append(heading,p,retry,menu);overlay.appendChild(card);this.shell.appendChild(overlay);
    w.dispatchEvent(new CustomEvent('meow:boardcomplete',{detail:{board:this.def.number,serial:this.def.generation?.serial,phase:'INGREDIENT_GARDEN',success:won,score:this.score}}));
    w.MEOWGame?.sync?.();
  };
  // The active recipe is authoritative. The original Pass9 primary-item counter
  // remains visible for its board topology, but it must never gate continuation.
  const oldCheckEnd=G.checkEnd;
  G.checkEnd=function(){
    if(this.completed||this.failed)return;
    if(Array.isArray(this._recipeGoals)&&this._recipeGoals.length){
      const done=this._recipeGoals.every(goal=>goal.count>=goal.target);
      if(done){this.completed=true;this.score+=1000;this.effect('rain');this.showResult(true);return}
      if(this.moves<=0){this.failed=true;this.showResult(false);return}
      return;
    }
    return oldCheckEnd.call(this);
  };
  G.togglePause=function(){w.MEOWShell.setPaused(!w.MEOWShell.isPaused())};
  const oldInterface=G.interfaceAction;
  G.interfaceAction=function(name,btn){
    if(/home/.test(name))return w.MEOWShell.openPanel('game');
    if(/pause/.test(name))return w.MEOWShell.setPaused(!w.MEOWShell.isPaused());
    if(/sound_on|sound_off/.test(name))return w.MEOWShell.toggleSound();
    return oldInterface.call(this,name,btn);
  };
  const origUpdate=G.updateHud;
  G.updateHud=function(){
    origUpdate.call(this);
    if(Array.isArray(this._recipeGoals)&&this._recipeGoals.length){
      const p=q('[data-progress]',this.shell),bar=q('.objective-meter i',this.shell);
      const total=this._recipeGoals.reduce((sum,goal)=>sum+Math.max(1,Number(goal.target)||1),0);
      const done=this._recipeGoals.reduce((sum,goal)=>sum+Math.min(Math.max(0,Number(goal.count)||0),Math.max(1,Number(goal.target)||1)),0);
      if(p)p.textContent=this._recipeGoals.map(visibleGoal).join(' · ');
      if(bar)bar.style.width=Math.round(done/Math.max(1,total)*100)+'%';
    }
    if(w.MEOWGame?.current?.instance===this)w.MEOWGame.syncSoon();
  };
  function selectCursor(game,pos){
    if(!game?.shell)return;
    game.shell.querySelectorAll('.meow-cursor').forEach(el=>el.classList.remove('meow-cursor'));
    const cell=game.cellEls[pos.x+':'+pos.y];if(cell){cell.classList.add('meow-cursor');cell.scrollIntoView({block:'nearest',inline:'nearest'});}
  }
  function nearest(game,x,y,dx,dy){
    const max=Math.max(game.def.size.width,game.def.size.height);
    for(let i=1;i<=max;i++){
      const nx=x+dx*i,ny=y+dy*i;
      if(nx<0||ny<0||nx>=game.def.size.width||ny>=game.def.size.height)break;
      if(game.cellEls[nx+':'+ny]&&!game.locks[nx+':'+ny]&&game.grid[ny]?.[nx])return {x:nx,y:ny};
    }return {x,y};
  }
  w.MEOWGardenAdapter={
    create(def,host){
      const game=w.GardenGame.mount(def,host);
      w.MEOWBoardGenerator?.opening(game);
      game._meowCursor={x:0,y:0};
      outer:for(let y=0;y<def.size.height;y++)for(let x=0;x<def.size.width;x++)if(game.grid[y]?.[x]&&!game.locks[x+':'+y]){game._meowCursor={x,y};break outer;}
      selectCursor(game,game._meowCursor);
      // A touch/pointer swipe across cells works even if the pointer is captured by the first button.
      let pointer=null;
      game.gridEl.addEventListener('pointerdown',e=>{
        const cell=e.target.closest('.garden-cell:not(.hole)');if(!cell||game.busy||game.paused)return;
        pointer={id:e.pointerId,x:+cell.dataset.x,y:+cell.dataset.y};
        game._meowCursor={x:pointer.x,y:pointer.y};selectCursor(game,game._meowCursor);
      },true);
      game.gridEl.addEventListener('pointerup',e=>{
        if(!pointer||pointer.id!==e.pointerId)return;
        const from=pointer;pointer=null;
        const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('.garden-cell');
        if(!target||!game.gridEl.contains(target))return;
        const x=+target.dataset.x,y=+target.dataset.y;
        if(game.adjacent(from.x,from.y,x,y)){
          game.selected=null;
          e.preventDefault();e.stopImmediatePropagation();
          game.trySwap(from.x,from.y,x,y);
        }
      },true);
      return game;
    },
    control(game,payload){
      if(!game||game.paused||game.completed||game.failed)return;
      const pos=game._meowCursor;
      if(payload.type==='joystick:move'&&payload.stick==='left'&&payload.active){
        const at=performance.now(),interval=(payload.inputSource==='keyboard'?105:175)*(game._meowPrecision?1.7:1);
        if(at-(game._lastCursorMove||0)<interval)return;
        const dx=Math.abs(payload.x)>.38?Math.sign(payload.x):0;
        const dy=Math.abs(payload.y)>.38?Math.sign(payload.y):0;
        if(!dx&&!dy)return;
        game._lastCursorMove=at;game._meowCursor=nearest(game,pos.x,pos.y,Math.abs(payload.x)>Math.abs(payload.y)?dx:0,Math.abs(payload.y)>=Math.abs(payload.x)?dy:0);
        selectCursor(game,game._meowCursor);
      }
      if(payload.type==='button'&&payload.key==='Z'){game._meowPrecision=payload.state==='down';game.shell.classList.toggle('meow-precision',game._meowPrecision);return;}
      if(payload.type==='button'&&payload.state==='down'){
        const cell=game.cellEls[pos.x+':'+pos.y];
        if(['R','B','Y'].includes(payload.key)&&cell)game.onCell(cell);
        else if(payload.key==='A'){
          game.selected=null;game.renderAll();selectCursor(game,pos);
        }else if(payload.key==='X'){
          const item=game.def.ingredientPalette[game.grid[pos.y]?.[pos.x]?.piece];
          game.toast(item?.name||'Select a pantry ingredient');
        }
      }
    },
    booster(game,id){
      if(!game)return;
      const n=Number(id);if(n>=1&&n<=9)game.useBooster(n,game.shell.querySelector('[data-booster="'+n+'"]')||document.createElement('button'));
      else if(id==='hint')game.showHint();
      else if(id==='shuffle')game.shuffle();
    },
    hint(game){game?.showHint();},
    setPaused(game,p){if(game){game.paused=p;game.renderAllCellsDisabled();game.shell.classList.toggle('meow-is-paused',p)}},
    destroy(game){if(!game)return;game.disposed=true;game.busy=false;clearTimeout(game.toastTimer);game._pass9Observer?.disconnect();
      for(const k of ['_pass2Resize','_pass3Resize','_pass4Resize','_pass5Resize','_pass9Resize'])if(game[k])w.removeEventListener('resize',game[k]);
      if(game._key)document.removeEventListener('keydown',game._key);
      game.host.replaceChildren();}
  };
})(window);
