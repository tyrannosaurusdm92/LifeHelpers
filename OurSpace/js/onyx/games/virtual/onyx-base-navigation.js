/* Eight-neighbour target planner. Paths remain on the current supported floor:
   walls, platform discontinuities, and diagonal corner-cuts cannot be walked through.
   Obstacles requiring a jump must be handled by jump_up/down/across explicitly. */
(function(root){'use strict';
 const P=root.OnyxBasePhysics;
 function plan(world,from,target,opts={}){
  if(!P||![from.x,from.y,target.x,target.y].every(Number.isFinite))return [];
  const cell=P.clamp(Number(opts.cell)||20,12,48),r=opts.radius??16;
  const z=Number.isFinite(from.z)?from.z:P.support(world,from.x,from.y);
  if(P.occupied(world,target.x,target.y,z,r)||Math.abs(P.support(world,target.x,target.y)-z)>1)return [];
  const direct=P.sweep(world,{...from,z},target.x-from.x,target.y-from.y,r,{groundLock:true});
  const distance=Math.hypot(target.x-from.x,target.y-from.y);
  if(!direct.blocked&&distance-direct.distance<1.5)return [{x:target.x,y:target.y}];
  const cols=Math.ceil(world.width/cell),rows=Math.ceil(world.height/cell);
  const xy=(x,y)=>({x:Math.max(0,Math.min(cols-1,Math.floor(x/cell))),y:Math.max(0,Math.min(rows-1,Math.floor(y/cell)))});
  const start=xy(from.x,from.y),goal=xy(target.x,target.y),blocked=new Set();
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
   const cx=(x+.5)*cell,cy=(y+.5)*cell;
   if(P.occupied(world,cx,cy,z,r)||Math.abs(P.support(world,cx,cy)-z)>1)blocked.add(x+','+y);
  }
  // Start/target are known valid positions; permit their cells despite center rounding.
  blocked.delete(start.x+','+start.y);blocked.delete(goal.x+','+goal.y);
  const route=P.findPath(start,goal,{cols,rows,blocked});if(!route.length)return [];
  const coords=route.slice(1).map(p=>({x:(p.x+.5)*cell,y:(p.y+.5)*cell}));coords.push({x:target.x,y:target.y});
  // Conservative pruning: an unobstructed straight segment may skip waypoints.
  const result=[],origin={...from};let i=0;
  while(i<coords.length){let best=i;
   for(let j=coords.length-1;j>i;j--){let probe=P.sweep(world,{x:origin.x,y:origin.y,z},coords[j].x-origin.x,coords[j].y-origin.y,r,{groundLock:true});
    if(!probe.blocked&&Math.hypot(probe.x-coords[j].x,probe.y-coords[j].y)<1.4){best=j;break;}}
   result.push(coords[best]);origin.x=coords[best].x;origin.y=coords[best].y;i=best+1;
  }return result;
 }
 root.OnyxBaseNavigation=Object.freeze({plan});
})(typeof window!=='undefined'?window:globalThis);
