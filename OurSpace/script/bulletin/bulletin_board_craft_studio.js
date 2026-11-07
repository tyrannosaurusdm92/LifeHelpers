/* Bulletin Craft Studio — local Canvas sticker-making and non-destructive Post-it effects.
   Uses bundled OpenMoji CC BY-SA 4.0 artwork; no network, AI models, or third-party runtimes. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const shapes = {"clover":"data:image/svg+xml;charset=utf-8,%3Csvg%20id%3D%22emoji%22%20viewBox%3D%220%200%2072%2072%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20id%3D%22color%22%3E%3Cpath%20fill%3D%22%23B1CC33%22%20stroke%3D%22none%22%20d%3D%22M48.8683%2C32.5567l-3.6904-3.0993l4.6308%2C1.3342c2.4301%2C0.4831%2C4.6846%2C0.3218%2C5.7975-1.7671%20c1.113-2.089%2C0.3218-4.6848-1.7671-5.7977l-1.8912-1.0076l0.3358-0.6302l0.6718-1.2609c1.113-2.089%2C0.3217-4.6845-1.7672-5.7975%20c-2.089-1.113-4.0135-0.0094-5.7975%2C1.7671l-3.0993%2C3.6905l1.3342-4.6309c0.4889-2.365%2C0.3217-4.6845-1.7672-5.7975%20s-4.6846-0.3218-5.7975%2C1.7671l-1.0076%2C1.8912l-0.6304-0.3359l-1.2608-0.6717c-2.089-1.113-4.6847-0.3216-5.7976%2C1.7674%20s-0.1912%2C4.1826%2C1.7672%2C5.7975l4.5599%2C3.5592l0.0131%2C0.0103l-4.5529-1.4901c-0.8837-0.2891-1.7981-0.4974-2.7272-0.5326%20c-1.6529-0.0626-3.0631%2C0.3703-3.9169%2C1.7848c-1.2833%2C2.126-0.3442%2C4.934%2C1.8474%2C6.1016l1.6972%2C0.9042l-0.3359%2C0.6305%20l-0.5832%2C1.0946c-1.1477%2C2.1542-0.3756%2C4.9596%2C1.816%2C6.034c2.0382%2C0.9996%2C3.9666%2C0.0256%2C5.6601-1.8373l3.0993-3.6905%20l-1.3342%2C4.6309c-0.5042%2C2.0202-0.3217%2C4.6845%2C1.7672%2C5.7975c2.089%2C1.113%2C4.6846%2C0.3218%2C5.7975-1.7671l1.0077-1.8914l0.6304%2C0.3359%20l1.2608%2C0.6717c2.089%2C1.113%2C4.6846%2C0.3218%2C5.7975-1.7671C51.7485%2C36.2653%2C50.8871%2C34.2885%2C48.8683%2C32.5567z%22%2F%3E%3C%2Fg%3E%3Cg%20id%3D%22hair%22%2F%3E%3Cg%20id%3D%22skin%22%2F%3E%3Cg%20id%3D%22skin-shadow%22%2F%3E%3Cg%20id%3D%22line%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%23000000%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M30.3663%2C41.0292%20c-3.438%2C3.548-7.676%2C10.246-5.829%2C20.735%22%2F%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%23000000%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-miterlimit%3D%2210%22%20stroke-width%3D%222%22%20d%3D%22M45.1016%2C29.3352l4.5993%2C1.439c2.4184%2C0.5383%2C4.6761%2C0.4281%2C5.8362-1.635s0.4281-4.6761-1.635-5.8362l-1.8678-1.0503%20l0.3501-0.6226l0.7002-1.2452c1.1601-2.0631%2C0.4281-4.6761-1.635-5.8362s-4.0122-0.1006-5.8362%2C1.635l-3.1823%2C3.619%22%2F%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%23000000%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-miterlimit%3D%2210%22%20stroke-width%3D%222%22%20d%3D%22M35.5692%2C32.0058l-1.439%2C4.5993c-0.5499%2C2.0082-0.4281%2C4.6761%2C1.635%2C5.8362s4.6761%2C0.4281%2C5.8362-1.635l1.0503-1.8678%20l0.6226%2C0.3501l1.2452%2C0.7002c2.0631%2C1.1601%2C4.6761%2C0.4281%2C5.8362-1.635s0.3439-4.059-1.635-5.8362l-3.619-3.1823%22%2F%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%23000000%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-miterlimit%3D%2210%22%20stroke-width%3D%222%22%20d%3D%22M33.7703%2C22.9634l-4.518-1.5931c-0.8768-0.3092-1.7863-0.5383-2.7143-0.5946c-1.651-0.1002-3.0707%2C0.3006-3.9564%2C1.6953%20c-1.3313%2C2.0963-0.4564%2C4.925%2C1.7081%2C6.1422l1.6762%2C0.9426l-0.3501%2C0.6226l-0.6079%2C1.0811%20c-1.1963%2C2.1275-0.4881%2C4.9496%2C1.6785%2C6.0737c2.015%2C1.0455%2C3.965%2C0.1156%2C5.7005-1.7084l3.1823-3.619%22%2F%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%23000000%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-miterlimit%3D%2210%22%20stroke-width%3D%222%22%20d%3D%22M42.4311%2C19.8028l1.439-4.5993c0.5425-2.3533%2C0.4281-4.6761-1.635-5.8362s-4.6761-0.4281-5.8362%2C1.635L35.3486%2C12.87%20l-0.6226-0.3501l-1.2452-0.7002c-2.0631-1.1601-4.6761-0.4281-5.8362%2C1.635c-1.1601%2C2.0631-0.2862%2C4.1772%2C1.635%2C5.8362%20l4.4907%2C3.6725%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E%0A","flower":"data:image/svg+xml;charset=utf-8,%3Csvg%20id%3D%22emoji%22%20viewBox%3D%220%200%2072%2072%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20id%3D%22color%22%3E%3Cpath%20fill%3D%22%23FCEA2B%22%20stroke%3D%22none%22%20d%3D%22M53.1986%2C26.1283c-0.2578-0.3518-0.2578-0.8302%2C0-1.182l0.781-1.066%20c1.7236-2.3562%2C1.2108-5.6636-1.1455-7.3873c-1.0641-0.7784-2.3808-1.1311-3.6915-0.9887l-1.313%2C0.143%20c-0.4329%2C0.0447-0.8455-0.1936-1.023-0.591l-0.533-1.208c-1.1787-2.6708-4.2994-3.8805-6.9702-2.7018%20c-1.206%2C0.5322-2.1696%2C1.4958-2.7018%2C2.7018l-0.533%2C1.209c-0.1785%2C0.3963-0.5906%2C0.6339-1.023%2C0.59l-1.313-0.143%20c-2.9024-0.3146-5.5102%2C1.7833-5.8248%2C4.6857c-0.142%2C1.3104%2C0.2106%2C2.6265%2C0.9888%2C3.6903l0.781%2C1.066%20c0.2578%2C0.3518%2C0.2578%2C0.8302%2C0%2C1.182l-0.78%2C1.066c-1.7242%2C2.3551-1.2128%2C5.6621%2C1.1423%2C7.3863%20c1.0645%2C0.7794%2C2.3821%2C1.1324%2C3.6937%2C0.9897l1.313-0.143c0.4331-0.0472%2C0.8469%2C0.1915%2C1.023%2C0.59l0.533%2C1.208%20c0.1352%2C0.2987%2C0.2972%2C0.5845%2C0.484%2C0.854c0.043%2C0.063%2C0.088%2C0.122%2C0.133%2C0.182c0.1707%2C0.2319%2C0.3604%2C0.4494%2C0.567%2C0.65%20c0.019%2C0.019%2C0.037%2C0.039%2C0.056%2C0.057c0.5022%2C0.4685%2C1.0932%2C0.8316%2C1.738%2C1.068l0%2C0c0.5941%2C0.2236%2C1.2233%2C0.3394%2C1.858%2C0.342%20c2.0993%2C0.0169%2C4.0045-1.2253%2C4.836-3.153l0.533-1.208c0.1757-0.3989%2C0.5896-0.638%2C1.023-0.591l1.313%2C0.143%20c2.9023%2C0.3152%2C5.5106-1.7821%2C5.8258-4.6845c0.1423-1.3108-0.2103-2.6274-0.9888-3.6915L53.1986%2C26.1283z%22%2F%3E%3Cpath%20fill%3D%22%235C9E31%22%20stroke%3D%22none%22%20d%3D%22M10.0786%2C28.3983c-0.151%2C2.092-0.178%2C7.231%2C2.687%2C10.738s7.906%2C4.508%2C9.985%2C4.774%20c0.151-2.092%2C0.178-7.232-2.687-10.738l0%2C0C17.1886%2C29.6553%2C12.1556%2C28.6643%2C10.0786%2C28.3983z%22%2F%3E%3Cpath%20fill%3D%22%23F1B31C%22%20stroke%3D%22none%22%20d%3D%22M41.4376%2C21.5373c-2.2091%2C0-4%2C1.7909-4%2C4s1.7909%2C4%2C4%2C4s4-1.7909%2C4-4S43.6468%2C21.5373%2C41.4376%2C21.5373z%22%2F%3E%3C%2Fg%3E%3Cg%20id%3D%22hair%22%2F%3E%3Cg%20id%3D%22skin%22%2F%3E%3Cg%20id%3D%22skin-shadow%22%2F%3E%3Cg%20id%3D%22line%22%3E%3Ccircle%20cx%3D%2241.4376%22%20cy%3D%2225.5373%22%20r%3D%225%22%20fill%3D%22none%22%20stroke%3D%22%23000000%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%2F%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%23000000%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M20.8366%2C32.5393%20c3.992%2C4.886%2C2.805%2C12.462%2C2.805%2C12.462s-7.66-0.347-11.653-5.233s-2.805-12.462-2.805-12.462S16.8436%2C27.6533%2C20.8366%2C32.5393z%22%2F%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%23000000%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M32.0106%2C41.0902%20c-3.438%2C3.548-7.676%2C10.246-5.829%2C20.735%22%2F%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%23000000%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M47.1886%2C13.4433%20l0.533%2C1.209l1.313-0.143c3.4507-0.3755%2C6.5525%2C2.1174%2C6.9281%2C5.5682c0.1698%2C1.5599-0.2501%2C3.1268-1.177%2C4.3928l-0.78%2C1.066%20l0.78%2C1.066c2.0506%2C2.8007%2C1.4425%2C6.7334-1.3582%2C8.784c-1.266%2C0.9269-2.833%2C1.3468-4.3928%2C1.177l-1.313-0.143l-0.533%2C1.209%20c-1.4014%2C3.1756-5.1118%2C4.6139-8.2875%2C3.2125c-1.434-0.6328-2.5797-1.7786-3.2125-3.2125l-0.533-1.209l-1.313%2C0.143%20c-3.4507%2C0.3755-6.5525-2.1174-6.928-5.5682c-0.1697-1.5599%2C0.2501-3.1268%2C1.177-4.3928l0.78-1.066l-0.78-1.066%20c-2.0506-2.8007-1.4425-6.7334%2C1.3582-8.784c1.266-0.9269%2C2.833-1.3468%2C4.3928-1.177l1.313%2C0.143l0.533-1.209%20c1.4014-3.1756%2C5.1118-4.6139%2C8.2875-3.2125C45.4101%2C10.8635%2C46.5558%2C12.0093%2C47.1886%2C13.4433z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E%0A","leaves":"data:image/svg+xml;charset=utf-8,%3Csvg%20id%3D%22emoji%22%20viewBox%3D%220%200%2072%2072%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20id%3D%22line%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%23000%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19.7623%2C22.3615C26.1543%2C17.0075%2C36.05%2C18.5%2C36.05%2C18.5s-.47%2C10.065-6.7623%2C15.2543S13%2C37.6159%2C13%2C37.6159%2C13.37%2C27.7156%2C19.7623%2C22.3615Z%22%2F%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%23000%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M55.732%2C36.689c5.4323%2C6.2313%2C4.1316%2C16.317%2C4.1316%2C16.317s-9.9309-.223-15.3631-6.4543-4.1316-16.317-4.1316-16.317S50.4152%2C30.3037%2C55.732%2C36.689Z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E%0A"};
  const decorationFiles = {
    clover: ['Clover sticker', '../../assets/images/bulletin/openmoji-clover-sticker.svg'],
    flower: ['Botanical flower cutout', '../../assets/images/bulletin/openmoji-botanical-flower.svg'],
    leaves: ['Leaf drawing', '../../assets/images/bulletin/openmoji-stencil-leaves.svg'],
    pocket: ['Paper pocket', '../../assets/images/bulletin/openmoji-paper-bag.svg'],
    pushpin: ['Round pushpin', '../../assets/images/bulletin/openmoji-round-pin.svg'],
    longpin: ['Long pushpin', '../../assets/images/bulletin/openmoji-long-pin.svg']
  };
  const size = 320;
  let photo = null, photoBase = null, erasures = [];
  let lastStickerData = null;
  let currentTab = 'stickers';
  let renderNumber = 0;
  let effectData = {glitter:null,stamps:null};
  let pos = { glitter:{x:73,y:68}, stamps:{x:70,y:65} };
  let drag = null;
  const imageCache = {};
  const canvas = () => { const c=document.createElement('canvas'); c.width=size; c.height=size; return c; };
  const clamp = (v,min,max) => Math.max(min,Math.min(max,v));
  const number = id => Number($(id)?.value || 0);
  const value = id => $(id)?.value || '';
  const show = s => { $('bc-status').textContent=s; };
  const escapeHTML = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function rng(seed) {let x = seed|0;return () => {x ^= x<<13;x ^= x>>>17;x ^= x<<5;return ((x>>>0)%1000000)/1000000;};}
  function seedOf(s) {let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
  async function loadImage(src) {
    if (!src) throw new Error('No image selected');
    if (imageCache[src]) return imageCache[src];
    const im = new Image();
    im.src = src;
    await new Promise((resolve,reject)=>{im.onload=resolve;im.onerror=()=>reject(new Error('Unable to load artwork')); if(im.complete&&im.naturalWidth)resolve();});
    imageCache[src]=im;
    return im;
  }
  function shapePath(ctx, kind, x, y, w, h) {
    ctx.beginPath();
    if(kind==='circle'){ctx.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,Math.PI*2);return;}
    if(kind==='rounded') {ctx.roundRect(x,y,w,h,Math.min(42,w/5));return;}
    if(kind==='heart') {
      ctx.moveTo(x+w/2,y+h*.9);
      ctx.bezierCurveTo(x+w*.1,y+h*.60,x-w*.04,y+h*.25,x+w*.22,y+h*.17);
      ctx.bezierCurveTo(x+w*.38,y+h*.08,x+w*.5,y+h*.18,x+w*.5,y+h*.3);
      ctx.bezierCurveTo(x+w*.5,y+h*.18,x+w*.65,y+h*.06,x+w*.8,y+h*.17);
      ctx.bezierCurveTo(x+w*1.07,y+h*.34,x+w*.9,y+h*.62,x+w/2,y+h*.9);
      ctx.closePath();return;
    }
    if(kind==='star') {
      const cx=x+w/2,cy=y+h/2,r=Math.min(w,h)*.49;
      for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5;const v=i%2?r*.47:r;const px=cx+Math.cos(a)*v,py=cy+Math.sin(a)*v;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.closePath();return;
    }
    ctx.rect(x,y,w,h);
  }
  function floodErase(c, sx, sy, tol) {
    const ctx=c.getContext('2d',{willReadFrequently:true}),image=ctx.getImageData(0,0,size,size),d=image.data;
    sx=Math.floor(sx);sy=Math.floor(sy);if(sx<0||sy<0||sx>=size||sy>=size)return;
    const start=(sy*size+sx)*4;
    if(d[start+3]<12)return;
    const target=[d[start],d[start+1],d[start+2]];
    const visited=new Uint8Array(size*size), queue=new Int32Array(size*size);
    let head=0,tail=0;queue[tail++]=sy*size+sx;visited[sy*size+sx]=1;
    while(head<tail){const n=queue[head++], idx=n*4;
      if(d[idx+3]===0)continue;
      const difference=Math.max(Math.abs(d[idx]-target[0]),Math.abs(d[idx+1]-target[1]),Math.abs(d[idx+2]-target[2]));
      if(difference>tol)continue;
      d[idx+3]=0;
      const px=n%size,py=(n/size)|0;
      if(px>0&&!visited[n-1]){visited[n-1]=1;queue[tail++]=n-1;}
      if(px<size-1&&!visited[n+1]){visited[n+1]=1;queue[tail++]=n+1;}
      if(py>0&&!visited[n-size]){visited[n-size]=1;queue[tail++]=n-size;}
      if(py<size-1&&!visited[n+size]){visited[n+size]=1;queue[tail++]=n+size;}
    }
    ctx.putImageData(image,0,0);
  }
  function buildSticker() {
    if(!photo)return null;
    const photoC=canvas(),pctx=photoC.getContext('2d',{willReadFrequently:true});
    const scale=Math.min(288/photo.width,288/photo.height)*number('bc-photo-zoom')/100;
    const w=photo.width*scale,h=photo.height*scale;
    const ox=160-w/2+number('bc-photo-x')*.85,oy=160-h/2+number('bc-photo-y')*.85;
    pctx.save();shapePath(pctx,value('bc-sticker-shape'),16,16,288,288);pctx.clip();pctx.drawImage(photo,ox,oy,w,h);pctx.restore();
    erasures.forEach(e=>floodErase(photoC,e.x,e.y,e.tol));
    photoBase=photoC;
    const outlineC=canvas(),octx=outlineC.getContext('2d');
    const r=number('bc-outline-width');
    if(r>0){
      for(let a=0;a<Math.PI*2;a+=Math.PI/Math.max(16,r*3)){
        const x=Math.cos(a)*r,y=Math.sin(a)*r;octx.drawImage(photoC,x,y);
      }
      octx.globalCompositeOperation='source-in';octx.fillStyle=value('bc-outline-color');octx.fillRect(0,0,size,size);octx.globalCompositeOperation='source-over';
    }
    octx.drawImage(photoC,0,0);
    return outlineC;
  }
  function paintSticker() {
    const output=$('bc-photo-preview'),ctx=output.getContext('2d');ctx.clearRect(0,0,size,size);
    if(!photo){
      ctx.fillStyle='#53647b';ctx.font='15px system-ui';ctx.textAlign='center';ctx.fillText('Upload a photo to begin',160,155);ctx.font='12px system-ui';ctx.fillText('No photo is uploaded to a server',160,177);
      $('bc-add-sticker').disabled=true;lastStickerData=null;return;
    }
    try {const rendered=buildSticker();ctx.drawImage(rendered,0,0);lastStickerData=rendered.toDataURL('image/png');$('bc-add-sticker').disabled=false;}
    catch(e){show('Sticker preview failed: '+e.message);}
  }
  async function loadPhoto(file){
    if(!file || !/^image\/(png|jpeg|webp|gif)$/.test(file.type)){show('Choose a PNG, JPEG, WebP or GIF image.');return;}
    if(file.size>12*1024*1024){show('Choose an image smaller than 12 MB.');return;}
    const objectURL=URL.createObjectURL(file);
    try{
      const img=await loadImage(objectURL);
      const max=1100,sc=Math.min(1,max/Math.max(img.width,img.height));
      const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*sc));c.height=Math.max(1,Math.round(img.height*sc));
      c.getContext('2d').drawImage(img,0,0,c.width,c.height);photo=c;erasures=[];
      $('bc-sticker-title').value=file.name.replace(/\.[^.]+$/,'').slice(0,75)||'My photo sticker';
      ['bc-photo-zoom','bc-photo-x','bc-photo-y'].forEach(id=>{$(id).value= id==='bc-photo-zoom'?'100':'0';});
      paintSticker();show('Photo loaded locally. Click the background in the preview to erase matching pixels.');
    }catch(e){show('Could not decode the image: '+e.message);}finally{URL.revokeObjectURL(objectURL);delete imageCache[objectURL];}
  }
  // Unified Bulletin board adapter: this studio edits the same board and saves through the main app.
  const API=()=>window.BulletinCreativeAPI;
  function validBoard(){return API()?.getBoard()||null;}
  async function createArt(name, asset, arrangement, width, height){
    const app=API(),b=validBoard(); if(!app||!b){show('Create or open a Bulletin board first.');return;}
    app.addArt(name,asset.dataUrl||asset.localPath,{arrangement,width,height});
    show(name+' placed on your corkboard. Use Arrange to move it.');
  }
  const allowedTargets=b=>(b?.items||[]).filter(x=>['note','quote','scrap','link','event'].includes(x.kind) && !x.locked && !x.archived);
  function refreshTargets(forced){
    const b=validBoard();if(!b)return;
    const options=allowedTargets(b).map(x=>`<option value="${escapeHTML(x.id)}">${escapeHTML(x.title||x.kind)}</option>`).join('');
    for(const id of ['bc-glitter-target','bc-stamps-target']){
      const sel=$(id),old=forced||sel.value;sel.innerHTML=options||'<option value="">No editable Post-it on this board</option>';
      if([...sel.options].some(o=>o.value===old))sel.value=old;
    }
  }
  function loadNotePreview(tab){
    const b=validBoard(),x=b?.items?.find(item=>item.id===value('bc-'+tab+'-target'));
    const note=document.querySelector(`[data-bc-preview="${tab}"]`);
    const text=note?.querySelector('.bc-preview-note-text');if(!text)return;
    if(!x){note.style.background='#F7E7CE';text.textContent='Choose a Post-it to start';return;}
    note.style.background=x.color||'#F7E7CE';
    text.innerHTML=`<strong>${escapeHTML(x.title)}</strong><span>${escapeHTML(x.text||'')}</span>`;
  }
  function hexToRgb(hex){const n=parseInt(hex.replace('#',''),16);return [(n>>16)&255,(n>>8)&255,n&255];}
  function rgbToHex(r,g,b){return '#'+[r,g,b].map(v=>clamp(Math.floor(v),0,255).toString(16).padStart(2,'0')).join('');}
  function mix(a,b,t){const c=hexToRgb(a),d=hexToRgb(b);return rgbToHex(c[0]+(d[0]-c[0])*t,c[1]+(d[1]-c[1])*t,c[2]+(d[2]-c[2])*t);}
  function sparkle(ctx,x,y,r,color){ctx.strokeStyle=color;ctx.lineWidth=Math.max(.5,r*.33);ctx.beginPath();ctx.moveTo(x-r,y);ctx.lineTo(x+r,y);ctx.moveTo(x,y-r);ctx.lineTo(x,y+r);ctx.stroke();}
  async function renderStencil(tab) {
    const token=++renderNumber, shape=value('bc-'+tab+'-shape'), isGlitter=tab==='glitter';
    try{
      const im=await loadImage(shapes[shape]);if(token!==renderNumber)return;
      const layer=canvas(),ctx=layer.getContext('2d'),random=rng(seedOf(tab+shape+JSON.stringify(
        isGlitter?[value('bc-glitter-color1'),value('bc-glitter-color2'),value('bc-glitter-finish'),number('bc-density'),number('bc-opacity')]:[value('bc-stamps-color'),value('bc-stamps-finish')] )));
      if(isGlitter){
        const c1=value('bc-glitter-color1'),c2=value('bc-glitter-color2'),finish=value('bc-glitter-finish');
        let gradient=ctx.createLinearGradient(0,0,size,size);
        gradient.addColorStop(0,c1);gradient.addColorStop(1,c2);
        ctx.fillStyle=finish==='ombre'||finish==='holo'?gradient:mix(c1,c2,.32);ctx.fillRect(0,0,size,size);
        const particles=Math.floor(number('bc-density')*29);
        const palettes=finish==='holo'?['#fff7ab','#95e8fc','#ffc0e8','#f8faff','#daff88',c1,c2]:[c1,c2,'#fffef5','#ddd9f7','#ffe6a6'];
        for(let i=0;i<particles;i++){
          const x=random()*size,y=random()*size,
            r=finish==='chunky'?(1.5+random()*4.5):(.3+random()*1.8);
          ctx.fillStyle=palettes[(random()*palettes.length)|0];ctx.globalAlpha=.35+random()*.65;
          if(finish==='chunky'){ctx.save();ctx.translate(x,y);ctx.rotate(random()*Math.PI);ctx.fillRect(-r/2,-r/2,r,r);ctx.restore();}
          else ctx.fillRect(x,y,r,r);
          if(random()<.11)sparkle(ctx,x,y,r*(finish==='chunky'?1.8:2.3),'#ffffff');
        }
        ctx.globalAlpha=1;
      }else{
        const color=value('bc-stamps-color');ctx.fillStyle=color;ctx.fillRect(0,0,size,size);
        const finish=value('bc-stamps-finish');
        if(finish==='faded'){
          ctx.globalCompositeOperation='destination-out';ctx.fillStyle='rgba(0,0,0,.28)';
          for(let i=0;i<1400;i++){ctx.globalAlpha=random()*.35;ctx.fillRect(random()*size,random()*size,random()*3+.5,random()*3+.5);}
          ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
        }
        if(finish==='distressed'){
          ctx.globalCompositeOperation='destination-out';ctx.fillStyle='#000';
          for(let i=0;i<850;i++){ctx.globalAlpha=random()*.88;ctx.fillRect(random()*size,random()*size,random()*4+.8,random()*3+.5);}
          ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
        }
      }
      ctx.globalCompositeOperation='destination-in';ctx.drawImage(im,3,3,size-6,size-6);ctx.globalCompositeOperation='source-over';
      if(isGlitter){const a=number('bc-opacity')/100; const mask=canvas(),m=mask.getContext('2d');m.globalAlpha=a;m.drawImage(layer,0,0);effectData[tab]=mask.toDataURL('image/png');}
      else effectData[tab]=layer.toDataURL('image/png');
      showPreview(tab);
    }catch(e){show('Could not prepare stencil: '+e.message);}
  }
  function showPreview(tab){
    loadNotePreview(tab);
    const note=document.querySelector(`[data-bc-preview="${tab}"]`),img=note.querySelector('.bc-effect-preview');
    const posn=pos[tab]; img.src=effectData[tab]||'';
    img.style.left=posn.x+'%';img.style.top=posn.y+'%';img.style.width=number('bc-'+tab+'-size')+'%';
    img.style.transform=`translate(-50%,-50%) rotate(${number('bc-'+tab+'-rotation')}deg)`;
  }
  async function apply(tab){
    const b=validBoard(),x=b?.items?.find(item=>item.id===value('bc-'+tab+'-target'));
    if(!x){show('Select a Post-it first.');return;}
    if(x.locked){show('Unlock this Post-it to decorate it.');return;}
    if(!effectData[tab])await renderStencil(tab);
    if(!effectData[tab]){show('The stencil artwork did not load.');return;}
    if((x.effects||[]).length>=24){show('This Post-it has 24 decorations; undo one first.');return;}
    API().applyEffect(x.id,{id:'effect_'+Date.now()+'_'+Math.random().toString(36).slice(2),kind:tab,shape:value('bc-'+tab+'-shape'),dataUrl:effectData[tab],x:pos[tab].x,y:pos[tab].y,size:number('bc-'+tab+'-size'),rotation:number('bc-'+tab+'-rotation')});
    show('Applied! The stencil shape is imprinted on the Post-it and moves with it.');
  }
  async function undo(tab){
    const b=validBoard(),x=b?.items?.find(item=>item.id===value('bc-'+tab+'-target'));
    if(!x?.effects?.length){show('This Post-it has no applied decorations to undo.');return;}
    API().undoEffect(x.id);show('Last applied decoration removed.');
  }
  function selectTab(tab){
    currentTab=tab;
    document.querySelectorAll('[data-bc-tab]').forEach(btn=>{const on=btn.dataset.bcTab===tab;btn.classList.toggle('active',on);btn.setAttribute('aria-selected',on?'true':'false');});
    document.querySelectorAll('.bc-tab').forEach(p=>p.classList.toggle('active',p.id==='bc-tab-'+tab));
    if(tab==='glitter'||tab==='stamps'){refreshTargets();renderStencil(tab);}
    if(tab==='stickers')paintSticker();
  }
  function open(tab='stickers',targetId=null){
    refreshTargets(targetId||API()?.getSelectedId());
    const dialog=$('bulletinCraftDialog'); if(!dialog.open)dialog.showModal();
    selectTab(tab);
    const s=validBoard();
    show(s ? 'Ready. Choose your artwork, then apply or add it to the board.'
           : 'Open a board under “Boards” to save a new sticker, stamp, or decoration.');
  }
  function bindPreviewDrag(tab){
    const target=document.querySelector(`[data-bc-preview="${tab}"]`);
    const update=e=>{
      const r=target.getBoundingClientRect();pos[tab]={x:clamp((e.clientX-r.left)/r.width*100,8,92),y:clamp((e.clientY-r.top)/r.height*100,8,92)};showPreview(tab);
    };
    target.addEventListener('pointerdown',e=>{e.preventDefault();drag={tab,pointerId:e.pointerId};target.setPointerCapture(e.pointerId);update(e);});
    target.addEventListener('pointermove',e=>{if(drag&&drag.tab===tab&&drag.pointerId===e.pointerId)update(e);});
    target.addEventListener('pointerup',e=>{if(drag?.pointerId===e.pointerId)drag=null;});
    target.addEventListener('pointercancel',()=>{drag=null;});
  }
  function init(){
    const dialog=$('bulletinCraftDialog');if(!dialog)return;
    // Keep *all* Craft Studio entry points active, including the responsive Bulletin tool shortcuts.
    document.querySelectorAll('[data-bc-launch]').forEach(launch => {
      launch.addEventListener('click', () => open(launch.dataset.bcLaunch || 'stickers'));
    });
    ['bc-close','bc-cancel'].forEach(id=>$(id).addEventListener('click',()=>dialog.close()));
    document.querySelectorAll('[data-bc-tab]').forEach(b=>b.addEventListener('click',()=>selectTab(b.dataset.bcTab)));
    $('bc-photo-file').addEventListener('change',e=>{loadPhoto(e.target.files?.[0]);});
    $('bc-photo-preview').addEventListener('click',e=>{
      if(!photo || !$('bc-photo-erase').checked)return;
      const r=e.currentTarget.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*size,y=(e.clientY-r.top)/r.height*size;
      erasures.push({x,y,tol:number('bc-erase-tolerance')});paintSticker();show('Removed connected pixels of the selected color.');
    });
    $('bc-erase-reset').addEventListener('click',()=>{erasures=[];paintSticker();show('Background restored.');});
    ['bc-sticker-shape','bc-photo-zoom','bc-photo-x','bc-photo-y','bc-erase-tolerance','bc-outline-color','bc-outline-width'].forEach(id=>$(id).addEventListener('input',()=>{paintSticker();$('bc-photo-zoom-out').textContent=number('bc-photo-zoom')+'%';$('bc-outline-out').textContent=number('bc-outline-width');$('bc-erase-out').textContent=number('bc-erase-tolerance');}));
    $('bc-add-sticker').addEventListener('click',async()=>{
      if(!lastStickerData){show('Upload an image first.');return;}
      await createArt(value('bc-sticker-title').trim()||'My photo sticker', {kind:'image',dataUrl:lastStickerData},'photo-sticker',250,260);
    });
    for(const tab of ['glitter','stamps']){
      const prefix='bc-'+tab+'-';
      ['target','shape','size','rotation',...(tab==='glitter'?['color1','color2','finish']:['color','finish'])].forEach(suffix=>{
        const el=$(prefix+suffix);if(!el)return;
        el.addEventListener('input',()=>{
          loadNotePreview(tab);
          if(suffix==='size'||suffix==='rotation'||suffix==='target')showPreview(tab);
          else renderStencil(tab);
          if(suffix==='size')$(tab==='glitter'?'bc-size-out':'bc-stamp-size-out').textContent=el.value+'%';
          if(suffix==='rotation')$(tab==='glitter'?'bc-rotation-out':'bc-stamp-rotation-out').textContent=el.value+'°';
        });
      });
      bindPreviewDrag(tab);
    }
    ['bc-opacity','bc-density'].forEach(id=>$(id).addEventListener('input',()=>{
      $('bc-opacity-out').textContent=number('bc-opacity')+'%';$('bc-density-out').textContent=number('bc-density')+'%';renderStencil('glitter');
    }));
    $('bc-apply-glitter').addEventListener('click',()=>apply('glitter'));
    $('bc-apply-stamp').addEventListener('click',()=>apply('stamps'));
    document.querySelectorAll('[data-bc-undo]').forEach(b=>b.addEventListener('click',()=>undo(b.dataset.bcUndo)));
    document.querySelectorAll('[data-bc-deco]').forEach(b=>b.addEventListener('click',async()=>{
      const deco=decorationFiles[b.dataset.bcDeco];if(!deco)return;
      await createArt(deco[0],{kind:'image',localPath:deco[1]},'craft-decoration',210,230);
    }));
    paintSticker();
    window.BulletinCraftStudio={open, renderStencil, getCurrentEffect:tab=>effectData[tab], buildSticker};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
