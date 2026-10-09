(function(){
'use strict';
class History{
 constructor(engine){this.engine=engine;this.undoStack=[];this.redoStack=[];this.busy=false;}
 limit(){const area=this.engine.width*this.engine.height;return area>10000000?3:area>6000000?5:10;}
 snapshot(label='Edit'){const canvas=this.engine.canvas();if(!canvas)return null;const layers=canvas.layers.map(l=>({id:l.id,name:l.name,type:l.type,visible:l.visible,opacity:l.opacity,blendMode:l.blendMode,locked:l.locked,transform:{...l.transform},meta:l.meta?JSON.parse(JSON.stringify(l.meta)):null,canvas:this.clone(l.canvas),mask:l.mask?this.clone(l.mask):null}));return {label,canvasIndex:this.engine.canvasIndex,layers};}
 clone(src){const c=document.createElement('canvas');c.width=src.width;c.height=src.height;c.getContext('2d').drawImage(src,0,0);return c;}
 push(snap){if(!snap)return;this.undoStack.push(snap);while(this.undoStack.length>this.limit())this.undoStack.shift();this.redoStack.length=0;this.engine.emit('history');}
 capture(label){return this.snapshot(label);}
 undo(){if(!this.undoStack.length)return;const current=this.snapshot('Redo');const snap=this.undoStack.pop();this.redoStack.push(current);this.restore(snap);}
 redo(){if(!this.redoStack.length)return;const current=this.snapshot('Undo');const snap=this.redoStack.pop();this.undoStack.push(current);this.restore(snap);}
 restore(snap){this.engine.canvasIndex=snap.canvasIndex;const p=this.engine.canvas();p.layers=snap.layers.map(s=>({...s,canvas:this.clone(s.canvas),mask:s.mask?this.clone(s.mask):null}));this.engine.activeLayerId=p.layers.at(-1)?.id||null;this.engine.render();this.engine.emit('layers');this.engine.emit('history');}
 clear(){this.undoStack.length=0;this.redoStack.length=0;this.engine.emit('history');}
}
window.LFHistory=History;
})();
