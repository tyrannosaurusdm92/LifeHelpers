
(function(){
 window.addEventListener('message',function(e){
  var m=e.data;
  if(!m || m.channel!=='ourspace-bulletin' || m.kind!=='theme')return;
  var r=document.getElementById('bulletinBoardModule')?.style;
  if(m.cyan){r.setProperty('--focus',m.cyan);}
  if(m.deep){r.setProperty('--accent',m.deep);r.setProperty('--line',m.deep);}
  if(m.surface){r.setProperty('--panel',m.surface);}
 });
})();
