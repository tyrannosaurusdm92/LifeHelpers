window.SAVANSKI_PRESETS = Object.freeze({
  palette:{
    cadmium:['#FFF840','#FFF720','#FFF600','#999400','#666200','#333100'],
    cyan:['#40FFFF','#20F5FF','#00FFFF','#008FB8','#005B7A','#002B3D'],
    persimmon:['#F18240','#EE6D20','#EC5800','#8E3500','#5E2300','#2F1200'],
    neutrals:['#F2FFFF','#E6FFFF','#D9FFFF','#BFFFFF','#001A1A','#001010']
  },
  canvasPresets:[
    {name:'HD landscape',w:1920,h:1080},{name:'Square social',w:2048,h:2048},{name:'Portrait social',w:1080,h:1350},
    {name:'Story / phone',w:1080,h:1920},{name:'4K landscape',w:3840,h:2160},{name:'VTT square',w:4096,h:4096},
    {name:'US Letter 300dpi',w:2550,h:3300},{name:'A4 300dpi',w:2480,h:3508}
  ],
  brushPresets:[
    {id:'pencil',size:3,opacity:1,softness:0},{id:'ink',size:8,opacity:1,softness:0},{id:'brush',size:18,opacity:1,softness:.28},
    {id:'marker',size:32,opacity:.55,softness:.12},{id:'crayon',size:20,opacity:.75,softness:.22},{id:'charcoal',size:28,opacity:.55,softness:.4},
    {id:'airbrush',size:64,opacity:.25,softness:.78},{id:'neon',size:16,opacity:1,softness:.5},{id:'pixel',size:8,opacity:1,softness:0},
    {id:'calligraphy',size:18,opacity:1,softness:0},{id:'highlighter',size:42,opacity:.28,softness:.08},{id:'eraser',size:28,opacity:1,softness:.35}
  ],
  collageLayouts:['grid2','grid3','grid4','horizontal','vertical','heroLeft','heroTop','triptych','polaroid'],
  selectionShapes:['rect','square','ellipse','circle','triangle','free'],
  filters:['brightness','contrast','saturate','grayscale','sepia','invert','blur','sharpen','posterize','pixelate','warm','cool'],
  map:{gridTypes:['square','hex','iso','none'],defaultCell:70,defaultUnits:5,unitName:'ft'},
  exportTypes:['image/png','image/webp','application/json','video/webm']
});
