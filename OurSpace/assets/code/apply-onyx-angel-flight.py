#!/usr/bin/env python3
"""Patch the original 23 MB self-contained CAT-astrophic game in place.

This deliberately leaves the embedded base64 ZIP unchanged. At runtime, its
existing scripts are patched in memory to integrate the separately reviewed
Onyx flight module. The onyx module is also inlined, preserving a standalone
HTML page. The original JSZip archive remains byte-identical.
"""
from pathlib import Path
import base64
import io
import json
import re
import zipfile

ROOT=Path(__file__).resolve().parent
GAME=ROOT / 'game.html'
MODULE=ROOT / 'onyx-angel-flight.js'
source=GAME.read_text(encoding='utf-8')
addon=MODULE.read_text(encoding='utf-8')

ART=ROOT / 'onyx-angel-art.zip'
def embed_angels(document: str) -> str:
    """Bundle the user-supplied art once; leave the original game ZIP unchanged."""
    if not ART.exists():
        return document
    raw=ART.read_bytes()
    if len(raw)>16_000_000:
        raise RuntimeError('Onyx angel art ZIP is unexpectedly large')
    with zipfile.ZipFile(io.BytesIO(raw)) as z:
        names=[Path(name).name.lower() for name in z.namelist()]
        required=('haloed cat sprite sheet-1.png','angelic cat sprite sheet-2.png','haloed bowtie sprite sheet.png')
        for suffix in required:
            if not any(name.endswith(suffix) for name in names):
                raise RuntimeError('Onyx angel sprite ZIP is missing '+suffix)
        for bird in ('hummingbird','robin','sparrow','bluejay','cardinal','dove','finch'):
            if not any(name.endswith('_onyx_'+bird+'_halo.png') for name in names):
                raise RuntimeError('Onyx angel sprite ZIP is missing bird: '+bird)
    marker='<script id="gameArchive" type="application/octet-stream">'
    previous=re.compile(r'<script id="onyxAngelArtArchive" type="application/octet-stream">[A-Za-z0-9+/=]*</script>\n?')
    document=previous.sub('',document)
    if document.count(marker)!=1:
        raise RuntimeError('Cannot locate one original game archive')
    encoded=base64.b64encode(raw).decode('ascii')
    return document.replace(marker,
        '<script id="onyxAngelArtArchive" type="application/octet-stream">'+encoded+'</script>\n'+marker,1)

if '</script' in addon.lower():
    raise RuntimeError('Inline module contains an HTML script-closing token.')

# A previously integrated game keeps the ZIP immutable. Refresh only the
# inlined sprite/flight module so a standalone download stays up to date.
if 'Onyx Angel Flight —' in source:
    begin='<script>\n/* Onyx Angel Flight —'
    boundary='\n</script>\n<script id="gameArchive" type="application/octet-stream">'
    start=source.find(begin)
    end=source.find(boundary,start)
    if start<0 or end<0:
        raise RuntimeError('Cannot safely locate previously embedded Onyx module')
    old_archive=re.search(r'<script id="gameArchive" type="application/octet-stream">([A-Za-z0-9+/=]+)</script>',source)
    replacement=source[:start]+'<script>\n'+addon+source[end:]
    replacement=embed_angels(replacement)
    new_archive=re.search(r'<script id="gameArchive" type="application/octet-stream">([A-Za-z0-9+/=]+)</script>',replacement)
    if not old_archive or not new_archive or old_archive.group(1)!=new_archive.group(1):
        raise RuntimeError('Updated code would alter the original game archive')
    if replacement!=source:
        GAME.write_text(replacement,encoding='utf-8')
        print('Refreshed standalone Onyx flight module; original game archive preserved.')
    else:
        print('Onyx flight already current; no changes.')
    raise SystemExit(0)

marker='<script id="gameArchive" type="application/octet-stream">'
assert source.count(marker)==1, 'Missing or duplicate embedded ZIP script.'
encoded=re.search(r'<script id="gameArchive" type="application/octet-stream">([A-Za-z0-9+/=]+)</script>',source)
assert encoded, 'Original archive not recognized.'
original_archive=base64.b64decode(encoded.group(1),validate=True)
with zipfile.ZipFile(io.BytesIO(original_archive),'r') as archive:
    manifest=json.loads(archive.read('_manifest.json'))
    assert 'script/game/mosswood_companions.js' in manifest['scripts'], 'Mosswood is not bootstrapped.'
    embedded=archive.read(manifest['paths']['script/game/mosswood_companions.js']).decode('utf-8')
    for snippet in (
        '    function step(who,dt){',
        '            if(!a||!cat||a.workOrder)continue;',
        '        const py=level.getPixelY()+a.y*S-h-stoolLift;',
    ):
        assert snippet in embedded, 'The runtime hook changed: '+snippet
    assert 'assets/images/game/onyx.png' in manifest['paths']

def replace_once(before,after,label):
    global source
    if source.count(before)!=1:
        raise RuntimeError(f'{label}: expected 1 exact anchor, got {source.count(before)}')
    source=source.replace(before,after,1)

replace_once(marker,'<script>\n'+addon+'\n</script>\n'+marker,'Onyx module inline')
replace_once(
    '    const archive=await JSZip.loadAsync(bytes);',
    "    const archive=await JSZip.loadAsync(bytes);\n"
    "    try { await window.OnyxAngelicFlight?.prepare(); }\n"
    "    catch (e) { console.warn('Onyx sprite preload unavailable:',e); }",
    'Onyx persistent art preload')
replace_once(
    '    for(const path in paths) urls[path]=resources[paths[path]];',
    '    for(const path in paths) urls[path]=resources[paths[path]];\n'
    '    window.OnyxAngelicFlight?.applyOverrides(urls);',
    'Onyx archive asset overrides')

old_loop=r"""    for(let i=0;i<scripts.length;i++){
      const source=await archive.file(paths[scripts[i]]).async('string');
      const script=document.createElement('script');
      script.textContent=source+'\n//# sourceURL=catastrophic/'+scripts[i];
      document.body.appendChild(script);
      script.remove();
    }"""
new_loop=r"""    for(let i=0;i<scripts.length;i++){
      let source=await archive.file(paths[scripts[i]]).async('string');
      if(window.OnyxAngelicFlight){
        const changes=[];
        if(scripts[i]==='script/game/mosswood_companions.js'){
          changes.push([
            '    function step(who,dt){',
            "    function step(who,dt){\n        if(who.id==='onyx'&&window.OnyxAngelicFlight?.updateNative(who,dt))return;"
          ]);
          changes.push([
            "            if(!a||!cat||a.workOrder)continue;",
            "            if(!a||!cat||a.workOrder||window.OnyxAngelicFlight?.mirrorNative(a))continue;"
          ]);
          changes.push([
            "        const py=level.getPixelY()+a.y*S-h-stoolLift;",
            "        const py=level.getPixelY()+a.y*S-h-stoolLift-(a.id==='onyx'?(window.OnyxAngelicFlight?.altitude()||0):0);\n        if(a.id==='onyx'&&window.OnyxAngelicFlight?.drawNative(ctx,a,level,S,h,clock,stoolLift))return;"
          ]);
        }
        if(scripts[i]==='script/game/adventure-cats.js'){
          changes.push([
            "        const r=cat.rest,oldX=cat.worldX();",
            "        if(cat.id==='onyx'&&window.OnyxAngelicFlight?.updateLegacy(cat,dt,this.world,this.commonFootY))continue;\n        const r=cat.rest,oldX=cat.worldX();"
          ]);
          changes.push([
            "      const b=this.bounds(cat,camera);\n      if(b.x+b.w<0||b.x>camera.width)return;",
            "      const b=this.bounds(cat,camera);\n      if(cat.id==='onyx'&&window.OnyxAngelicFlight?.drawLegacy(ctx,cat,b,this.clock))return;\n      if(cat.id==='onyx')b.y-=window.OnyxAngelicFlight?.altitude()||0;\n      if(b.x+b.w<0||b.x>camera.width)return;"
          ]);
        }
        for(const [find,replacement] of changes){
          if(!source.includes(find))console.warn('Onyx flight hook not found in '+scripts[i],find.slice(0,80));
          else source=source.replace(find,replacement);
        }
      }
      const script=document.createElement('script');
      script.textContent=source+'\n//# sourceURL=catastrophic/'+scripts[i];
      document.body.appendChild(script);
      script.remove();
    }"""
replace_once(old_loop,new_loop,'Native and legacy renderer hooks')

# Preserve the original base64 ZIP exactly, not an approximated rebuild.
later=re.search(r'<script id="gameArchive" type="application/octet-stream">([A-Za-z0-9+/=]+)</script>',source)
assert later and later.group(1)==encoded.group(1),'The embedded original game archive was modified.'
assert source.count('window.OnyxAngelicFlight?.applyOverrides(urls);')==1
source=embed_angels(source)
assert len(source)>23_000_000
GAME.write_text(source,encoding='utf-8')
print(f'Integrated Onyx flight: {len(source):,} characters, embedded ZIP preserved, runtime hooks validated.')
