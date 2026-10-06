'use strict';
class AOIGrid { constructor(cellSize=64) { if(!Number.isFinite(cellSize)||cellSize<=0) throw new RangeError('cellSize must be positive'); this.cellSize=cellSize; this.entities=new Map(); this.cells=new Map(); this.entityCells=new Map(); }
 _keys(x,y,r=0){const minX=Math.floor((x-r)/this.cellSize),maxX=Math.floor((x+r)/this.cellSize),minY=Math.floor((y-r)/this.cellSize),maxY=Math.floor((y+r)/this.cellSize),out=[];for(let a=minX;a<=maxX;a++)for(let b=minY;b<=maxY;b++)out.push(a+':'+b);return out;}
 upsert(id,x,y,data={}){if(!id||!Number.isFinite(x)||!Number.isFinite(y))throw new TypeError('id and finite coordinates required');this.remove(id);const e={id,x,y,data};this.entities.set(id,e);const keys=this._keys(x,y);this.entityCells.set(id,keys);for(const k of keys){if(!this.cells.has(k))this.cells.set(k,new Set());this.cells.get(k).add(id);}return e;}
 remove(id){const keys=this.entityCells.get(id)||[];for(const k of keys){const s=this.cells.get(k);if(s){s.delete(id);if(!s.size)this.cells.delete(k);}}this.entityCells.delete(id);return this.entities.delete(id);}
 query(x,y,radius){if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(radius)||radius<0)throw new RangeError('invalid query');const ids=new Set();for(const k of this._keys(x,y,radius)){for(const id of this.cells.get(k)||[])ids.add(id);}const r2=radius*radius;return [...ids].map(id=>this.entities.get(id)).filter(e=>(e.x-x)**2+(e.y-y)**2<=r2);}
}
module.exports={AOIGrid};
