#!/usr/bin/env python3
"""Non-destructive Onyx revision surface comparison.

Inspired by the Chamfer/F-score evaluation concepts used by zxhuang1698/cat-3d,
but applied only to Onyx's own protected base versus layered corrected rest surface.
No third-party animal mesh is copied into the package.
"""
from __future__ import annotations
import json, math
from pathlib import Path
import numpy as np
try:
    from scipy.spatial import cKDTree
except Exception as exc:
    raise SystemExit('scipy is required for nearest-surface comparison: %s' % exc)

ROOT=Path(__file__).resolve().parents[2]
DATA=ROOT/'development/audits/rest_mesh_runtime.json'
OUT=ROOT/'development/audits/current_surface_comparison.json'
MODEL_SCALE=0.000775003
NODE_SCALE=100.0
SOURCE_TO_M=MODEL_SCALE*NODE_SCALE

def clamp01(v): return max(0.0,min(1.0,v))
def bell(v,c,h):
    t=clamp01(1-abs(v-c)/h)
    return t*t*(3-2*t)

d=json.loads(DATA.read_text())
pos=np.asarray(d['position'],dtype=np.float64).reshape(-1,3)
si=np.asarray(d['skinIndex'],dtype=np.int64).reshape(-1,4)
sw=np.asarray(d['skinWeight'],dtype=np.float64).reshape(-1,4)
bones=d['bones']; bi={n:i for i,n in enumerate(bones)}

def influence(i,names):
    ids={bi[n] for n in names if n in bi}
    return float(sum(w for idx,w in zip(si[i],sw[i]) if int(idx) in ids))

def one(i,p):
    bx,by,bz=map(float,p); x,y,z=bx,by,bz
    nose=influence(i,['Nose']); mouth=influence(i,['Mouth']); head=influence(i,['Head'])
    torso=influence(i,['Hip','Spine001','Spine002','Spine003','Spine004'])
    leg=influence(i,['Thigh_Back_L','Calf_back_L','Thigh_Back_R','Calf_back_R','Thigh_front_L','Calf_Front_L','Thigh_front_R','Calf_Front_R'])
    limb=max(.44,1-min(1,leg*1.18))
    # primary anatomy
    shoulder=bell(by,-1.60,1.62)*bell(bz,1.78,1.48); x*=1+.092*shoulder
    mass=bell(by,.20,2.45)*bell(bz,1.43,1.55); x*=1+.042*mass
    # rear carriage
    rear=bell(by,2.25,2.05)*bell(bz,1.92,1.72); dorsal=bell(by,2.05,2.35)*bell(bz,2.72,1.22); bridge=bell(by,.88,3.08)*bell(bz,2.46,1.26)
    support=(.76+min(.24,torso*.36))*limb
    z-=.305*rear*support; z-=.090*dorsal*support; z-=.060*bridge*limb; y+=.072*rear*support; x*=1+.026*rear*support
    # chest flow incl current scapular / pectoral refinement
    chest=bell(by,-1.18,1.64)*bell(bz,.98,1.22); sternum=bell(by,-1.18,1.55)*bell(bz,.48,.76); neck=bell(by,-2.38,1.24)*bell(bz,2.22,1.18)
    x*=1+.052*chest; z-=.047*chest; z-=.042*sternum*limb; x*=1+.026*neck
    scap=bell(by,-1.48,1.72)*bell(bz,2.48,.96)*limb; pect=bell(by,-1.55,1.36)*bell(bz,.86,.72)*limb
    x*=1+.020*scap; z-=.032*scap; y+=.018*scap; x*=1+.018*pect; z-=.028*pect
    # pouch
    byb=bell(by,.70,1.56); bzb=bell(bz,.63,.72); side=clamp01((1.31-abs(bx))/.84); ts=.86+min(.14,torso*.22); pw=byb*bzb*(.70+.30*side)*limb*ts
    z-=.62*pw; x*=1+.112*pw; y+=.070*pw
    # face
    hs=head*clamp01((bz-1.96)/1.62); x*=1+.034*hs
    upper=head*bell(bz,3.18,.72); x*=1-.018*upper
    muzzle=max(mouth,nose*.64)*bell(bz,2.36,.61); x*=1+.066*muzzle; y-=.034*muzzle
    if nose>0:
        tip=nose*clamp01((-4.10-by)/.76)*bell(bz,2.68,.62); y-=.115*tip; x*=1-.040*tip; z+=.018*tip
    if mouth>0:
        chin=mouth*bell(bz,2.18,.43); y-=.056*chin; z-=.052*chin; x*=1+.030*chin
    return (x,y,z)

corr=np.asarray([one(i,p) for i,p in enumerate(pos)],dtype=np.float64)
delta=corr-pos
paired=np.linalg.norm(delta,axis=1)
t0=cKDTree(pos); t1=cKDTree(corr)
d01=t1.query(pos,k=1,workers=-1)[0]; d10=t0.query(corr,k=1,workers=-1)[0]
chamfer=float(np.mean(d01*d01)+np.mean(d10*d10))
# F-score thresholds in approximate runtime millimeters: 2mm / 5mm / 10mm.
thresholds={}
for mm in (2,5,10):
    th=(mm/1000)/SOURCE_TO_M
    precision=float(np.mean(d10<=th)); recall=float(np.mean(d01<=th)); f=0 if precision+recall==0 else 2*precision*recall/(precision+recall)
    thresholds[str(mm)+'mm']={'precision':precision,'recall':recall,'fscore':f}
rear=(pos[:,1]>0.4)&(pos[:,2]>1.55)
chest=(pos[:,1]>-3.0)&(pos[:,1]<.3)&(pos[:,2]>.15)&(pos[:,2]<3.5)
out={
 'generatedAt':'2026-08-13',
 'method':'Paired vertex displacement plus symmetric nearest-surface Chamfer/F-score adaptation; protected base topology is not altered.',
 'sourceReference':'zxhuang1698/cat-3d evaluation concepts (MIT); no repository model/data copied.',
 'vertexCount':int(len(pos)), 'vertexCountPreserved':len(pos)==len(corr),
 'sourceToRuntimeMetersApprox':SOURCE_TO_M,
 'pairedDisplacement':{
   'affectedVertices':int(np.sum(paired>1e-9)), 'maxSourceUnits':float(paired.max()), 'p95SourceUnits':float(np.quantile(paired,.95)),
   'meanRuntimeMillimetersApprox':float(np.mean(paired)*SOURCE_TO_M*1000), 'maxRuntimeMillimetersApprox':float(paired.max()*SOURCE_TO_M*1000)},
 'surface':{'symmetricSquaredChamferSourceUnits':chamfer,'fscoreByRuntimeThreshold':thresholds},
 'rearCarriage':{'vertices':int(rear.sum()),'medianVerticalDeltaSourceUnits':float(np.median(delta[rear,2])),'p10VerticalDeltaSourceUnits':float(np.quantile(delta[rear,2],.10))},
 'chestFaceTransition':{'vertices':int(chest.sum()),'medianDisplacementSourceUnits':float(np.median(paired[chest])),'p95DisplacementSourceUnits':float(np.quantile(paired[chest],.95))},
 'safety':{'remesh':False,'vertexOrderChanged':False,'uvChanged':False,'skinningChanged':False,'skeletonChanged':False}
}
OUT.write_text(json.dumps(out,indent=2))
print(json.dumps(out,indent=2))
