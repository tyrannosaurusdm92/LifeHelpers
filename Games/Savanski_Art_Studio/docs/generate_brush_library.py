"""Reproducible original Savanski brush stamp texture generator.
Build time only: Python and Pillow/SciPy do not ship to the browser.
The image algorithms running in-browser are compiled C/C++ WebAssembly.
"""
from pathlib import Path
import json, math
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

root=Path(__file__).resolve().parent.parent
out=root/'assets'/'brushes';out.mkdir(parents=True,exist_ok=True)
size=448
Y,X=np.mgrid[0:size,0:size].astype('float32')
xx=(X-(size-1)/2)/(size/2)
yy=(Y-(size-1)/2)/(size/2)
rad=np.sqrt(xx*xx+yy*yy)
angle=np.arctan2(yy,xx)
families=['Soft Pastel','Dry Charcoal','Grainy Chalk','Wet Watercolor','Inky Nibs','Dry Bristle','Spray & Mist','Natural Foliage','Textile & Fiber','Particle Scatter','Decorative Pattern','Rock & Stucco']
items=[]
for k in range(240):
  fam=families[k//20];variant=k%20
  rng=np.random.default_rng(91919+k*541)
  noise=rng.random((size,size),dtype=np.float32)
  low=gaussian_filter(noise,7.2+variant%7)
  medium=gaussian_filter(noise,1.1+(variant%4)*.7)
  high=noise
  low=(low-low.mean())/(low.std()+1e-8)
  medium=(medium-medium.mean())/(medium.std()+1e-8)
  radial=np.maximum(0,1-rad**(1.15+variant%6*.18))
  edge=np.power(rad, .9+variant%5*.2)
  if fam=='Soft Pastel':
    mask=radial*(.75+.18*low+.2*medium+.15*(noise-.5));
  elif fam=='Dry Charcoal':
    streak=np.abs(np.sin(xx*(22+variant*2)+yy*(3+variant%5)*2+.8*low));mask=radial*(.25+.6*streak)*np.maximum(0,(.48+.25*low+medium*.35))
  elif fam=='Grainy Chalk':
    grain=(high>.32+variant%5*.05).astype('float32');mask=radial*grain*(.5+.3*np.maximum(0,medium))
  elif fam=='Wet Watercolor':
    rings=np.sin(rad*(18+variant%7*4)+low*1.2);mask=radial*(.44+.2*rings+.3*(medium>.1))*(1+0.2*low)
  elif fam=='Inky Nibs':
    aspect=.22+variant*.022;ell=np.sqrt((xx*np.cos(variant*.4)-yy*np.sin(variant*.4))**2/(aspect*aspect)+(xx*np.sin(variant*.4)+yy*np.cos(variant*.4))**2);mask=np.maximum(0,1-ell)*(0.85+.14*medium)
  elif fam=='Dry Bristle':
    stripes=np.maximum(0,np.sin(yy*(28+variant*2)+low*1.5));mask=radial*(stripes>.22).astype('float32')*(.55+.45*noise)
  elif fam=='Spray & Mist':
    density=np.maximum(0,radial)**(.1+variant%7*.12);dots=(high>1-.08-density*.25).astype('float32');mask=gaussian_filter(dots,.2+variant%3*.4)*(.4+.6*density)
  elif fam=='Natural Foliage':
    leaves=np.sin(angle*(4+variant%5)+low)*np.cos(rad*(8+variant%8));mask=radial*np.maximum(0,.35+leaves*.6+medium*.16)
  elif fam=='Textile & Fiber':
    hatch=np.maximum(0,np.sin(xx*(34+variant%11)+yy*7+low)) + np.maximum(0,np.sin(yy*(27+variant%7)-xx*7+low));mask=radial*.5*hatch*(.6+.4*noise)
  elif fam=='Particle Scatter':
    dots=(high>.94-(variant%5)*.016).astype('float32');mask=gaussian_filter(dots,.65+variant%4*.4)*radial*2
  elif fam=='Decorative Pattern':
    stars=(np.cos(angle*(5+variant%9))*(1-rad)+np.sin(rad*(9+variant%7)*2)*.25);mask=np.maximum(0,stars)*radial*(.5+.5*medium)
  else:
    mask=radial*((.38+medium*.31+low*.14)>.18).astype('float32')*(.44+.34*high)
  # Keep textures distinct: edge falloff, crackles and per-variant roughness.
  mask=np.clip(mask*(.8+(variant%5)*.09)*(1.0+.08*low),0,1)
  alpha=(mask*255).astype('uint8')
  rgba=np.zeros((size,size,4),dtype=np.uint8)
  rgba[:,:,3]=alpha
  im=Image.fromarray(rgba,'RGBA')
  file=f'{k+1:03d}-{fam.lower().replace(" & ","-").replace(" ","-")}-{variant+1:02d}.png'
  im.save(out/file,compress_level=5)
  title=f'{fam} {variant+1:02d}'
  items.append({'id':f'sv-{k+1:03d}','name':title,'family':fam,'path':'assets/brushes/'+file,'spacing':round(.09+(variant%5)*.042,3),'scatter':round((variant%6)*.025,3),'flow':round(.65+(variant%4)*.1,2)})
  if (k+1)%60==0:print('Brushes generated:',k+1,flush=True)
(root/'json'/'brush-library.json').write_text(json.dumps(items,indent=1))
print('Brush asset total bytes:',sum(p.stat().st_size for p in out.glob('*.png')))
