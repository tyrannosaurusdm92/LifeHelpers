(function(global){
 'use strict'; const LF=global.SavanskiArtTools;
 class History{
  constructor(limit=80){this.limit=limit;this.undoStack=[];this.redoStack=[];}
  capture(canvas,label='change'){this.undoStack.push({label,data:canvas.toDataURL('image/png')}); if(this.undoStack.length>this.limit)this.undoStack.shift(); this.redoStack=[];}
  async restore(canvas,dataUrl){const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=dataUrl;}); const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.drawImage(img,0,0,canvas.width,canvas.height);}
  async undo(canvas){if(this.undoStack.length<2)return false; const current=this.undoStack.pop();this.redoStack.push(current);await this.restore(canvas,this.undoStack.at(-1).data);return true;}
  async redo(canvas){const next=this.redoStack.pop();if(!next)return false;this.undoStack.push(next);await this.restore(canvas,next.data);return true;}
 }
 LF.History=History;
})(typeof window!=='undefined'?window:globalThis);
